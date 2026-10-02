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

const STORAGE_KEY = 'codon_learning_path_v2';

const INITIAL_PROGRESS: UserProgressState = {
  userId: 'usr_default',
  name: 'Ganesh Kamat',
  username: 'gkamat',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  activeCourseId: 'python',
  streak: 7,
  bestStreak: 14,
  level: 3,
  totalXp: 1420,
  energy: 5,
  maxEnergy: 5,
  dailyGoalXp: 50,
  dailyGoalEarnedXp: 35,
  completedSkillIds: ['py_skill_hello'],
  currentSkillId: 'py_skill_variables',
  completedLessonIds: ['les_hello_1', 'py_lesson_1'],
  skillMastery: {
    'py_skill_hello': 5,
    'py_skill_variables': 2,
    'py_skill_datatypes': 0,
    'py_skill_expressions': 0
  },
  mistakes: [
    {
      id: 'mst_1',
      skillId: 'py_skill_variables',
      skillTitle: 'Variables',
      lessonId: 'les_var_1',
      conceptId: 'py_variables',
      conceptName: 'Variables',
      mistakeType: 'literal_instead_of_variable',
      explanation: 'Printed "city" in quotes instead of variable value print(city)',
      userCode: 'city = "Mumbai"\nprint("city")',
      frequency: 2,
      timestamp: '2026-10-01T20:30:00Z',
      resolved: false
    }
  ],
  dailyGoal: {
    lessonsTarget: 2,
    lessonsCompleted: 1,
    xpTarget: 50,
    xpEarned: 35
  },
  activityHistory: [
    { date: '2026-09-25', lessonsCount: 2, xp: 220 },
    { date: '2026-09-26', lessonsCount: 1, xp: 100 },
    { date: '2026-09-27', lessonsCount: 3, xp: 340 },
    { date: '2026-09-28', lessonsCount: 1, xp: 120 },
    { date: '2026-09-29', lessonsCount: 2, xp: 250 },
    { date: '2026-09-30', lessonsCount: 2, xp: 240 },
    { date: '2026-10-01', lessonsCount: 1, xp: 150 }
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
      if (saved) return JSON.parse(saved);
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
  const [activeLessonId, setActiveLessonId] = useState<string | null>('py_lesson_1');
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
    setUserProgress(prev => {
      const alreadyCompleted = prev.completedLessonIds.includes(lessonId);
      const updatedCompletedLessons = alreadyCompleted ? prev.completedLessonIds : [...prev.completedLessonIds, lessonId];
      const newXp = prev.totalXp + xpReward;
      const newDailyXp = prev.dailyGoalEarnedXp + xpReward;

      let targetSkillId = prev.currentSkillId;
      for (const unit of course.units) {
        for (const skill of unit.skills) {
          if (skill.lessons.some(l => l.id === lessonId)) {
            targetSkillId = skill.id;
            break;
          }
        }
      }

      const currentMastery = prev.skillMastery[targetSkillId] || 0;
      const updatedMastery = Math.min(5, currentMastery + 1);

      const updatedCompletedSkills = updatedMastery >= 3 && !prev.completedSkillIds.includes(targetSkillId)
        ? [...prev.completedSkillIds, targetSkillId]
        : prev.completedSkillIds;

      let nextSkillId = prev.currentSkillId;
      if (targetSkillId === 'py_skill_variables') {
        nextSkillId = 'py_skill_datatypes';
      }

      return {
        ...prev,
        totalXp: newXp,
        dailyGoalEarnedXp: newDailyXp,
        completedLessonIds: updatedCompletedLessons,
        completedSkillIds: updatedCompletedSkills,
        currentSkillId: nextSkillId,
        skillMastery: {
          ...prev.skillMastery,
          [targetSkillId]: updatedMastery
        }
      };
    });
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
