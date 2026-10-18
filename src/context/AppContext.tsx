import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  LearningCourse, 
  Lesson, 
  SkillNode, 
  UserProgressState, 
  UserProfile,
  MistakeRecord, 
  Course 
} from '../types';
import { PYTHON_COURSE } from '../data/pathCurriculum';
import { COURSES } from '../data/courses';
import { sound } from '../utils/audio';
import { progressionService } from '../services/progressionService';
import { LessonAttemptStats } from '../services/masteryService';
import { getHalfLifeForPips } from '../constants/mastery';
import { loadAndMigrateProgress, saveProgress, CURRENT_STORAGE_KEY } from '../services/migrationService';

const STORAGE_KEY = CURRENT_STORAGE_KEY;

const INITIAL_PROGRESS: UserProgressState = {
  userId: 'usr_learner',
  name: 'Learner',
  username: 'learner',
  avatarUrl: '',
  activeCourseId: 'python',
  streak: 0,
  bestStreak: 0,
  level: 1,
  totalXp: 0,
  energy: 5,
  maxEnergy: 5,
  dailyGoalXp: 50,
  dailyGoalEarnedXp: 0,
  completedSkillIds: [],
  currentSkillId: 'py_skill_1_1',
  completedLessonIds: [],
  skillMastery: {
    'py_skill_1_1': 0
  },
  skillMasteryRecords: {},
  mistakes: [],
  dailyGoal: {
    lessonsTarget: 2,
    lessonsCompleted: 0,
    xpTarget: 50,
    xpEarned: 0
  },
  activityHistory: [],
  freezeInventory: 1,
  freezeRepairsProgress: 0,
  freezeUsedDates: [],
  streakRescuePending: false,
  achievements: [
    {
      id: 'first_code',
      title: 'First Output',
      description: 'Run your first line of real code in the sandbox',
      icon: 'Terminal',
      unlocked: false,
      progress: 0,
      maxProgress: 1
    },
    {
      id: 'streak_7',
      title: 'Consistency King',
      description: 'Maintain a learning streak for 7 consecutive days',
      icon: 'Flame',
      unlocked: false,
      progress: 0,
      maxProgress: 7
    },
    {
      id: 'repair_prodigy',
      title: 'Bug Surgeon',
      description: 'Repair 3 code mistakes through targeted diagnostic drills',
      icon: 'Wrench',
      unlocked: false,
      progress: 0,
      maxProgress: 3
    }
  ]
};

interface AppContextType {
  course: LearningCourse;
  activeCourse: any;
  allCourses: any[];
  userProfile: UserProfile;
  userProgress: UserProgressState;
  mistakes: MistakeRecord[];
  currentRoute: string;
  navigateTo: (route: string) => void;
  activeLesson: Lesson | null;
  activeLessonId: string | null;
  setActiveLessonId: (id: string | null) => void;
  startLesson: (lessonId: string) => void;
  exitLesson: () => void;
  completeLesson: (lessonId: string, xpReward: number, attemptStats?: LessonAttemptStats) => void;
  recordMistake: (mistake: Omit<MistakeRecord, 'id' | 'timestamp' | 'frequency' | 'resolved'>) => void;
  resolveMistake: (mistakeId: string) => void;
  freezeInventory: number;
  freezeRepairsProgress: number;
  streakRescuePending: boolean;
  isStreakAtRisk: boolean;
  dismissStreakRescue: () => void;
  refreshSkillMastery: (skillId: string) => void;
  skipSkillsViaPlacement: (skillIds: string[], lessonIds: string[]) => void;
  selectedSkillForModal: SkillNode | null;
  setSelectedSkillForModal: (skill: SkillNode | null) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  reducedMotion: boolean;
  toggleReducedMotion: () => void;
  updateProfile: (updates: Partial<UserProgressState>) => void;
  resetProgress: () => void;
  exportProgress: () => string;
  importProgress: (jsonString: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [course] = useState<LearningCourse>(PYTHON_COURSE);
  const [userProgress, setUserProgress] = useState<UserProgressState>(() => {
    return loadAndMigrateProgress(INITIAL_PROGRESS);
  });

  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      return window.location.hash.replace('#', '') || '/app';
    }
    return '/app';
  });

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>('1.1');
  const [selectedSkillForModal, setSelectedSkillForModal] = useState<SkillNode | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem('codolingo_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // Fallback
    }
    return 'light';
  });

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('codolingo_theme', theme);
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    sound.playClick();
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  };

  // Sync to localStorage
  useEffect(() => {
    saveProgress(userProgress);
  }, [userProgress]);

  // Check and apply streak freeze protection on boot
  useEffect(() => {
    setUserProgress(prev => progressionService.checkAndApplyStreakFreeze(prev));
  }, []);

  const dismissStreakRescue = () => {
    setUserProgress(prev => ({ ...prev, streakRescuePending: false }));
  };

  const isStreakAtRisk = (() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const practicedToday = (userProgress.activityHistory || []).some(a => a.date === todayStr);
    const currentHour = new Date().getHours();
    return !practicedToday && userProgress.streak > 0 && currentHour >= 18;
  })();

  // Sync hash
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setCurrentRoute(hash);
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTo = (route: string) => {
    sound.playClick();
    window.location.hash = route;
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startLesson = (lessonId: string) => {
    sound.playClick();
    let foundLesson: Lesson | null = null;
    for (const unit of course.units) {
      for (const skill of unit.skills) {
        const l = skill.lessons.find(item => item.id === lessonId);
        if (l) {
          foundLesson = l;
          break;
        }
      }
    }

    if (foundLesson) {
      setActiveLesson(foundLesson);
      setActiveLessonId(foundLesson.id);
      setSelectedSkillForModal(null);
      navigateTo(`/app/lesson/${foundLesson.id}`);
    } else {
      navigateTo(`/app/lesson/${lessonId}`);
    }
  };

  const exitLesson = () => {
    setActiveLesson(null);
    navigateTo('/app');
  };

  const completeLesson = (lessonId: string, xpReward: number, attemptStats?: LessonAttemptStats) => {
    setUserProgress(prev => progressionService.processLessonCompletion(prev, lessonId, xpReward, course, attemptStats));
  };

  const recordMistake = (mistake: Omit<MistakeRecord, 'id' | 'timestamp' | 'frequency' | 'resolved'>) => {
    setUserProgress(prev => {
      const existing = prev.mistakes;
      const idx = existing.findIndex(m => m.skillId === mistake.skillId && m.mistakeType === mistake.mistakeType && !m.resolved);

      let updatedList: MistakeRecord[];
      if (idx >= 0) {
        const found = existing[idx];
        const updated: MistakeRecord = {
          ...found,
          userCode: mistake.userCode,
          frequency: found.frequency + 1,
          timestamp: new Date().toISOString()
        };
        updatedList = [...existing];
        updatedList[idx] = updated;
      } else {
        const newRecord: MistakeRecord = {
          ...mistake,
          id: `mst_${Date.now()}`,
          frequency: 1,
          resolved: false,
          timestamp: new Date().toISOString()
        };
        updatedList = [newRecord, ...existing];
      }

      return {
        ...prev,
        mistakes: updatedList
      };
    });
  };

  const resolveMistake = (mistakeId: string) => {
    setUserProgress(prev => {
      const target = prev.mistakes.find(m => m.id === mistakeId);
      if (!target || target.resolved) return prev; // Deduplicate: already resolved
      const updatedMistakes = prev.mistakes.map(m => m.id === mistakeId ? { ...m, resolved: true } : m);

      // If this mistake was tied to a skill, resolving it can help lift mastery by 1 pip
      const updatedMastery = { ...prev.skillMastery };
      const updatedMasteryRecords = { ...(prev.skillMasteryRecords || {}) };
      if (target.skillId && typeof updatedMastery[target.skillId] === 'number') {
        const currentPips = updatedMastery[target.skillId];
        if (currentPips >= 0 && currentPips < 5) {
          const newPips = currentPips + 1;
          updatedMastery[target.skillId] = newPips;
          updatedMasteryRecords[target.skillId] = {
            pips: newPips,
            lastPracticedAt: new Date().toISOString(),
            halfLifeDays: getHalfLifeForPips(newPips)
          };
        }
      }

      const resolvedCount = updatedMistakes.filter(m => m.resolved).length;
      const updatedAchievements = prev.achievements.map(ach => {
        if (ach.id === 'repair_prodigy') {
          const progress = Math.min(resolvedCount, ach.maxProgress || 3);
          return { ...ach, progress, unlocked: progress >= (ach.maxProgress || 3) };
        }
        return ach;
      });

      // Earn streak freeze progress (1 freeze per 3 resolved mistakes, capped at 2)
      const freezeOutcome = progressionService.recordMistakeResolution(prev);
      if (freezeOutcome.freezeEarned) {
        sound.playRepair();
      }

      return {
        ...prev,
        totalXp: prev.totalXp + 50,
        mistakes: updatedMistakes,
        skillMastery: updatedMastery,
        skillMasteryRecords: updatedMasteryRecords,
        achievements: updatedAchievements,
        freezeInventory: freezeOutcome.freezeInventory,
        freezeRepairsProgress: freezeOutcome.freezeRepairsProgress
      };
    });
  };

  const refreshSkillMastery = (skillId: string) => {
    setUserProgress(prev => {
      const refreshed = progressionService.refreshSkillMastery(prev, skillId, 15);
      sound.playSuccess();
      return refreshed;
    });
  };

  const skipSkillsViaPlacement = (skillIds: string[], lessonIds: string[]) => {
    setUserProgress(prev => {
      const updatedLessons = Array.from(new Set([...prev.completedLessonIds, ...lessonIds]));
      const updatedMastery = { ...prev.skillMastery };
      const updatedMasteryRecords = { ...(prev.skillMasteryRecords || {}) };
      skillIds.forEach(sId => {
        updatedMastery[sId] = 5; // Mastered (Skipped via placement test)
        updatedMasteryRecords[sId] = {
          pips: 5,
          lastPracticedAt: new Date().toISOString(),
          halfLifeDays: getHalfLifeForPips(5)
        };
      });
      return {
        ...prev,
        completedLessonIds: updatedLessons,
        skillMastery: updatedMastery,
        skillMasteryRecords: updatedMasteryRecords,
        totalXp: prev.totalXp + (skillIds.length * 50)
      };
    });
  };

  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('codolingo_reduced_motion');
      if (saved !== null) return saved === 'true';
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return true;
      }
    } catch {}
    return false;
  });

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-reduced-motion', reducedMotion ? 'true' : 'false');
      localStorage.setItem('codolingo_reduced_motion', String(reducedMotion));
    } catch {}
  }, [reducedMotion]);

  const toggleReducedMotion = () => {
    sound.playClick();
    setReducedMotion(prev => !prev);
  };

  const updateProfile = (updates: Partial<UserProgressState>) => {
    setUserProgress(prev => {
      const updated = { ...prev, ...updates };
      return updated;
    });
  };

  const resetProgress = () => {
    setUserProgress(INITIAL_PROGRESS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROGRESS));
      localStorage.removeItem('codolingo_completed_challenges');
      localStorage.removeItem('codolingo_playground_code_python');
    } catch {}
  };

  const exportProgress = (): string => {
    const backupData = {
      version: 1,
      timestamp: new Date().toISOString(),
      userProgress,
      completedChallenges: (() => {
        try {
          return JSON.parse(localStorage.getItem('codolingo_completed_challenges') || '[]');
        } catch { return []; }
      })()
    };
    return JSON.stringify(backupData, null, 2);
  };

  const importProgress = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      const progressData = data.userProgress || data;
      if (!progressData || !progressData.userId || !Array.isArray(progressData.completedSkillIds)) {
        return false;
      }
      setUserProgress(progressData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
      if (Array.isArray(data.completedChallenges)) {
        localStorage.setItem('codolingo_completed_challenges', JSON.stringify(data.completedChallenges));
      }
      return true;
    } catch {
      return false;
    }
  };

  const toggleSound = () => {
    const next = sound.toggleSound();
    setSoundEnabled(next);
  };

  return (
    <AppContext.Provider
      value={{
        course,
        activeCourse: COURSES[0],
        allCourses: COURSES,
        userProfile: userProgress,
        userProgress,
        mistakes: userProgress.mistakes,
        currentRoute,
        navigateTo,
        activeLesson,
        activeLessonId,
        setActiveLessonId,
        startLesson,
        exitLesson,
        completeLesson,
        recordMistake,
        resolveMistake,
        freezeInventory: userProgress.freezeInventory ?? 1,
        freezeRepairsProgress: userProgress.freezeRepairsProgress ?? 0,
        streakRescuePending: Boolean(userProgress.streakRescuePending),
        isStreakAtRisk,
        dismissStreakRescue,
        refreshSkillMastery,
        skipSkillsViaPlacement,
        selectedSkillForModal,
        setSelectedSkillForModal,
        soundEnabled,
        toggleSound,
        theme,
        toggleTheme,
        setTheme,
        reducedMotion,
        toggleReducedMotion,
        updateProfile,
        resetProgress,
        exportProgress,
        importProgress
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
