import { MistakeRecord, UserProfile } from '../types';

const STORAGE_KEYS = {
  USER_PROFILE: 'codolingo_user_profile_v1',
  MISTAKES: 'codolingo_mistakes_v1',
  CODE_DRAFTS: 'codolingo_code_drafts_v1'
};

export const INITIAL_PROFILE: UserProfile = {
  id: 'usr_learner',
  userId: 'usr_learner',
  name: 'Learner',
  username: 'learner',
  avatarUrl: '',
  streak: 0,
  bestStreak: 0,
  totalXp: 0,
  level: 1,
  energy: 5,
  maxEnergy: 5,
  dailyGoalXp: 50,
  dailyGoalEarnedXp: 0,
  activeCourseId: 'python',
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
    },
    {
      id: 'python_foundations',
      title: 'Python Pioneer',
      description: 'Complete all lessons in Python Foundations module',
      icon: 'Award',
      unlocked: false,
      progress: 0,
      maxProgress: 3
    }
  ]
};

export const INITIAL_MISTAKES: MistakeRecord[] = [];

// Explicit demo fixture for developer preview mode (never used for real new learners)
export const DEMO_PROFILE: UserProfile = {
  id: 'usr_demo',
  userId: 'usr_demo',
  name: 'Demo Learner',
  username: 'demo_coder',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  streak: 7,
  bestStreak: 14,
  totalXp: 1420,
  level: 3,
  energy: 5,
  maxEnergy: 5,
  dailyGoalXp: 50,
  dailyGoalEarnedXp: 35,
  activeCourseId: 'python',
  completedSkillIds: ['py_skill_1_1'],
  currentSkillId: 'py_skill_1_2',
  completedLessonIds: ['1.1', '1.2'],
  skillMastery: {
    'py_skill_1_1': 5,
    'py_skill_1_2': 2
  },
  mistakes: [],
  dailyGoal: {
    lessonsTarget: 2,
    lessonsCompleted: 1,
    xpTarget: 250,
    xpEarned: 220
  },
  activityHistory: [
    { date: '2026-10-01', lessonsCount: 2, xp: 220 },
    { date: '2026-10-02', lessonsCount: 1, xp: 100 }
  ],
  achievements: [
    {
      id: 'first_code',
      title: 'First Output',
      description: 'Run your first line of real code in the sandbox',
      icon: 'Terminal',
      unlocked: true,
      unlockedAt: '2026-10-01',
      progress: 1,
      maxProgress: 1
    }
  ]
};

export const DEMO_MISTAKES: MistakeRecord[] = [
  {
    id: 'mst_demo_1',
    challengeId: 'ch_py_1_3',
    lessonId: '1.3',
    lessonTitle: 'Comparison Operators (== vs =)',
    conceptId: 'py_comparison',
    conceptName: 'Comparison Operators',
    mistakeType: 'assignment_in_condition',
    explanation: 'Used single `=` (assignment) instead of `==` (equality testing).',
    userCode: 'saved_role = user_role\nprint(saved_role)',
    timestamp: '2026-10-01T15:20:00Z',
    frequency: 2,
    resolved: false
  }
];

export class StorageService {
  getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE) || localStorage.getItem('codon_user_profile_v1');
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    return INITIAL_PROFILE;
  }

  saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile to storage', e);
    }
  }

  getMistakes(): MistakeRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MISTAKES) || localStorage.getItem('codon_mistakes_v1');
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    return INITIAL_MISTAKES;
  }

  saveMistakes(mistakes: MistakeRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(mistakes));
    } catch (e) {
      console.error('Failed to save mistakes to storage', e);
    }
  }

  recordMistake(record: Omit<MistakeRecord, 'id' | 'timestamp' | 'frequency' | 'resolved'>): MistakeRecord {
    const existing = this.getMistakes();
    const matchIndex = existing.findIndex(m => m.conceptId === record.conceptId && m.mistakeType === record.mistakeType && !m.resolved);

    let updatedList: MistakeRecord[];
    let targetRecord: MistakeRecord;

    if (matchIndex >= 0) {
      const found = existing[matchIndex];
      targetRecord = {
        ...found,
        userCode: record.userCode,
        frequency: found.frequency + 1,
        timestamp: new Date().toISOString()
      };
      updatedList = [...existing];
      updatedList[matchIndex] = targetRecord;
    } else {
      targetRecord = {
        ...record,
        id: `mst_${Date.now()}`,
        frequency: 1,
        resolved: false,
        timestamp: new Date().toISOString()
      };
      updatedList = [targetRecord, ...existing];
    }

    this.saveMistakes(updatedList);
    return targetRecord;
  }

  resolveMistake(mistakeId: string): void {
    const existing = this.getMistakes();
    const updated = existing.map(m => m.id === mistakeId ? { ...m, resolved: true } : m);
    this.saveMistakes(updated);
  }

  // Supabase Hook Readiness: In the future, this can be synced via Supabase client
  async syncWithSupabase(): Promise<{ synced: boolean; message: string }> {
    return {
      synced: true,
      message: 'Local state synchronized with local first database architecture.'
    };
  }
}

export const storageService = new StorageService();
