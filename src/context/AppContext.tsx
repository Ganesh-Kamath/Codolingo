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

const STORAGE_KEY = 'codolingo_python_curriculum_v1';

const INITIAL_PROGRESS: UserProgressState = {
  userId: 'usr_default',
  name: 'Ganesh Kamat',
  username: 'gkamat',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  activeCourseId: 'python',
  streak: 1,
  bestStreak: 7,
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
  mistakes: [],
  dailyGoal: {
    lessonsTarget: 2,
    lessonsCompleted: 0,
    xpTarget: 50,
    xpEarned: 0
  },
  activityHistory: [
    { date: '2026-10-01', lessonsCount: 1, xp: 50 }
  ],
  achievements: [
    {
      id: 'first_code',
      title: 'First Output',
      description: 'Run your first line of real code in the sandbox',
      icon: 'Terminal',
      unlocked: true,
      progress: 1,
      maxProgress: 1
    },
    {
      id: 'streak_7',
      title: 'Consistency King',
      description: 'Maintain a learning streak for 7 consecutive days',
      icon: 'Flame',
      unlocked: true,
      progress: 7,
      maxProgress: 7
    },
    {
      id: 'repair_prodigy',
      title: 'Bug Surgeon',
      description: 'Repair 3 code mistakes through targeted diagnostic drills',
      icon: 'Wrench',
      unlocked: false,
      progress: 1,
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
  completeLesson: (lessonId: string, xpReward: number) => void;
  recordMistake: (mistake: Omit<MistakeRecord, 'id' | 'timestamp' | 'frequency' | 'resolved'>) => void;
  resolveMistake: (mistakeId: string) => void;
  selectedSkillForModal: SkillNode | null;
  setSelectedSkillForModal: (skill: SkillNode | null) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [course] = useState<LearningCourse>(PYTHON_COURSE);
  const [userProgress, setUserProgress] = useState<UserProgressState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const skillExists = PYTHON_COURSE.units.some(u => u.skills.some(s => s.id === parsed.currentSkillId));
        if (!skillExists) {
          parsed.currentSkillId = 'py_skill_1_1';
        }
        return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_PROGRESS;
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

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userProgress));
    } catch (e) {
      console.error('Failed to save progress', e);
    }
  }, [userProgress]);

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

  const completeLesson = (lessonId: string, xpReward: number) => {
    setUserProgress(prev => progressionService.processLessonCompletion(prev, lessonId, xpReward, course));
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
    setUserProgress(prev => ({
      ...prev,
      mistakes: prev.mistakes.map(m => m.id === mistakeId ? { ...m, resolved: true } : m)
    }));
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
        selectedSkillForModal,
        setSelectedSkillForModal,
        soundEnabled,
        toggleSound
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
