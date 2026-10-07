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

export interface ICourseProvider {
  courseId: string;
  getMetadata(): CourseSummary;
  getCourse(): LearningCourse;
  getLessonBlocks(lessonId: string): Promise<LessonBlock[]>;
  getRawLessonPool(lessonId: string): Promise<RawCurriculumLesson | null>;
}

// Vite glob for dynamic loading of raw lesson JSONs on demand
const rawPythonLessonModules = import.meta.glob('../curriculum/python/content/**/*.json');

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

  async getLessonBlocks(lessonId: string): Promise<LessonBlock[]> {
    // 0. Primary: Check structured Foundations curriculum first
    const foundationsBlocks = getFoundationsLessonBlocks(lessonId);
    if (foundationsBlocks && foundationsBlocks.length > 0) {
      return foundationsBlocks;
    }

    // 1. Check pre-indexed selected lessons for instant response
    const preselected = (selectedLessonsMap as Record<string, any>)[lessonId];
    if (preselected && preselected.blocks && preselected.blocks.length > 0) {
      return preselected.blocks as LessonBlock[];
    }

    // 2. Fallback: dynamically load raw pool and select
    const rawLesson = await this.getRawLessonPool(lessonId);
    if (rawLesson) {
      const selected = selectLessonQuestions(rawLesson, 15);
      return selected.map(mapItemToBlock);
    }

    return [];
  }

  async getRawLessonPool(lessonId: string): Promise<RawCurriculumLesson | null> {
    // Find unit and filename for lessonId
    for (const [filePath, loader] of Object.entries(rawPythonLessonModules)) {
      if (filePath.includes(`/${lessonId}_`) || filePath.endsWith(`/${lessonId}.json`)) {
        try {
          const mod = (await loader()) as any;
          return (mod.default || mod) as RawCurriculumLesson;
        } catch (e) {
          console.error(`Failed to load raw lesson ${lessonId}:`, e);
        }
      }
    }

    // Try finding via manifest file path
    for (const [filePath, loader] of Object.entries(rawPythonLessonModules)) {
      try {
        const mod = (await loader()) as any;
        const data = (mod.default || mod) as RawCurriculumLesson;
        if (data.lesson_id === lessonId) {
          return data;
        }
      } catch {}
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

  getAllCourses(): CourseSummary[] {
    return Array.from(this.providers.values()).map(p => p.getMetadata());
  }
}

export const courseService = new CourseRegistry();
