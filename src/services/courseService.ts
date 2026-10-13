import { LearningCourse, LessonBlock } from '../types';
import { PYTHON_COURSE } from '../data/pathCurriculum';
import { getFoundationsLessonBlocks } from '../curriculum/python/foundations';
import { selectLessonQuestions, mapItemToBlock, RawCurriculumLesson } from './curriculumSelector';
import selectedLessonsMap from '../curriculum/python/selectedLessons.json';

export interface CourseSummary {
  id: string;
  title: string;
  slug: string;
  icon: string;
  description: string;
  totalUnits: number;
  totalLessons: number;
}

export interface LessonResolutionResult {
  status: 'ok' | 'not_found' | 'error';
  blocks: LessonBlock[];
  reason?: string;
}

export interface ICourseProvider {
  courseId: string;
  getMetadata(): CourseSummary;
  getCourse(): LearningCourse;
  getLessonBlocks(lessonId: string): Promise<LessonBlock[]>;
  resolveLessonBlocks(lessonId: string): Promise<LessonResolutionResult>;
  getRawLessonPool(lessonId: string): Promise<RawCurriculumLesson | null>;
}

// Vite glob for dynamic loading of raw lesson JSONs on demand
const rawPythonLessonModules = import.meta.glob('../curriculum/python/content/**/*.json');

// Build an explicit O(1) lookup index from lesson id -> module loader at module init
const rawLessonLoaderIndex = new Map<string, () => Promise<any>>();
for (const [filePath, loader] of Object.entries(rawPythonLessonModules)) {
  // Matches .../1.1_python_syntax.json or .../1.10.json
  const idMatch = filePath.match(/\/(\d+\.\d+)[_.]/);
  if (idMatch) {
    rawLessonLoaderIndex.set(idMatch[1], loader);
  }
  const baseName = filePath.split('/').pop()?.replace('.json', '');
  if (baseName) {
    rawLessonLoaderIndex.set(baseName, loader);
  }
}

// In-memory cache for parsed raw lessons so repeat views don't re-parse JSON
const rawLessonCache = new Map<string, RawCurriculumLesson>();

class PythonCourseProvider implements ICourseProvider {
  courseId = 'python';

  getMetadata(): CourseSummary {
    return {
      id: 'python',
      title: 'Python Career Track',
      slug: 'python',
      icon: 'terminal',
      description: 'Master practical Python from first principles to professional backend engineering, concurrency, and algorithmic problem solving.',
      totalUnits: PYTHON_COURSE.units.length,
      totalLessons: PYTHON_COURSE.units.reduce((acc, u) => acc + u.skills.length, 0)
    };
  }

  getCourse(): LearningCourse {
    return PYTHON_COURSE;
  }

  async resolveLessonBlocks(lessonId: string): Promise<LessonResolutionResult> {
    const timeoutMs = 8000;
    let timerId: ReturnType<typeof setTimeout> | null = null;
    const timeoutPromise = new Promise<LessonResolutionResult>((_, reject) => {
      timerId = setTimeout(() => {
        reject(new Error(`Loading lesson "${lessonId}" timed out after ${timeoutMs}ms.`));
      }, timeoutMs);
    });

    const executionPromise = (async (): Promise<LessonResolutionResult> => {
      try {
        // 0. Primary: Check pre-indexed selected lessons for instant response (canonical units 1, 2, etc.)
        const preselected = (selectedLessonsMap as Record<string, any>)[lessonId];
        if (preselected && preselected.blocks && preselected.blocks.length > 0) {
          return { status: 'ok', blocks: preselected.blocks as LessonBlock[] };
        }

        // 1. Fallback: Check structured Foundations curriculum
        const foundationsBlocks = getFoundationsLessonBlocks(lessonId);
        if (foundationsBlocks && foundationsBlocks.length > 0) {
          return { status: 'ok', blocks: foundationsBlocks };
        }

        // 2. Direct O(1) indexed raw pool lookup
        const rawLesson = await this.getRawLessonPool(lessonId);
        if (rawLesson) {
          const selected = selectLessonQuestions(rawLesson, 15);
          const mapped = selected.map(mapItemToBlock).filter(Boolean);
          if (mapped.length > 0) {
            return { status: 'ok', blocks: mapped };
          }
        }

        if (import.meta.env.DEV) {
          console.warn(`[courseService] Lesson not found for id: "${lessonId}".`);
        }
        return {
          status: 'not_found',
          blocks: [],
          reason: `Lesson "${lessonId}" was not found in curriculum.`
        };
      } catch (err: any) {
        console.error(`[courseService] Error resolving blocks for lesson "${lessonId}":`, err);
        return {
          status: 'error',
          blocks: [],
          reason: err?.message || 'Error occurred while loading lesson.'
        };
      }
    })();

    try {
      const result = await Promise.race([executionPromise, timeoutPromise]);
      if (timerId) clearTimeout(timerId);
      return result;
    } catch (err: any) {
      if (timerId) clearTimeout(timerId);
      console.error(`[courseService] Lesson resolution failed:`, err);
      return {
        status: 'error',
        blocks: [],
        reason: err?.message || `Loading lesson "${lessonId}" timed out.`
      };
    }
  }

  async getLessonBlocks(lessonId: string): Promise<LessonBlock[]> {
    const result = await this.resolveLessonBlocks(lessonId);
    return result.blocks;
  }

  async getRawLessonPool(lessonId: string): Promise<RawCurriculumLesson | null> {
    if (rawLessonCache.has(lessonId)) {
      return rawLessonCache.get(lessonId)!;
    }

    const loader = rawLessonLoaderIndex.get(lessonId);
    if (loader) {
      try {
        const mod = (await loader()) as any;
        const data = (mod.default || mod) as RawCurriculumLesson;
        rawLessonCache.set(lessonId, data);
        if (data.lesson_id) {
          rawLessonCache.set(data.lesson_id, data);
        }
        return data;
      } catch (e) {
        console.error(`Failed to load raw lesson ${lessonId}:`, e);
      }
    }

    return null;
  }
}

/**
 * Course Registry for multi-course support (Python, JS, HTML/CSS, DSA, etc.)
 */
class CourseRegistry {
  private providers: Map<string, ICourseProvider> = new Map();

  constructor() {
    this.register(new PythonCourseProvider());
  }

  register(provider: ICourseProvider) {
    this.providers.set(provider.courseId, provider);
  }

  getProvider(courseId: string): ICourseProvider {
    const provider = this.providers.get(courseId);
    if (!provider) {
      // Fallback to python
      return this.providers.get('python')!;
    }
    return provider;
  }

  getCourse(courseId: string = 'python'): LearningCourse {
    return this.getProvider(courseId).getCourse();
  }

  async getLessonBlocks(courseId: string, lessonId: string): Promise<LessonBlock[]> {
    return this.getProvider(courseId).getLessonBlocks(lessonId);
  }

  async resolveLessonBlocks(courseId: string, lessonId: string): Promise<LessonResolutionResult> {
    return this.getProvider(courseId).resolveLessonBlocks(lessonId);
  }

  getAllCourses(): CourseSummary[] {
    return Array.from(this.providers.values()).map(p => p.getMetadata());
  }
}

export const courseService = new CourseRegistry();
