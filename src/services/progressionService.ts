import { UserProgressState, LearningCourse } from '../types';
import { masteryService, LessonAttemptStats } from './masteryService';

export const progressionService = {
  // Returns the next available lesson in the course
  getNextLesson: (userProgress: UserProgressState, course: LearningCourse): string | null => {
    const completed = userProgress.completedLessonIds;
    for (const unit of course.units) {
      for (const skill of unit.skills) {
        for (const lesson of skill.lessons) {
          if (!completed.includes(lesson.id)) {
            return lesson.id;
          }
        }
      }
    }
    return null;
  },

  // Checks if a lesson is available (i.e. all previous lessons in the course are completed)
  isLessonAvailable: (lessonId: string, userProgress: UserProgressState, course: LearningCourse): boolean => {
    if (userProgress.completedLessonIds.includes(lessonId)) return true;
    
    // Find the sequence of lessons
    const orderedLessons: string[] = [];
    for (const unit of course.units) {
      for (const skill of unit.skills) {
        for (const lesson of skill.lessons) {
          orderedLessons.push(lesson.id);
        }
      }
    }

    const idx = orderedLessons.indexOf(lessonId);
    if (idx <= 0) return true; // First lesson is always available
    
    // Available if the immediately preceding lesson is completed
    const prevLessonId = orderedLessons[idx - 1];
    return userProgress.completedLessonIds.includes(prevLessonId);
  },

  // Level calculator
  calculateLevel: (totalXp: number): { level: number; nextLevelXp: number; progress: number } => {
    let level = 1;
    let requiredXp = 100;
    let currentLevelBaseXp = 0;
    
    while (totalXp >= requiredXp) {
      level++;
      currentLevelBaseXp = requiredXp;
      requiredXp += level * 100;
    }

    const progress = Math.round(((totalXp - currentLevelBaseXp) / (requiredXp - currentLevelBaseXp)) * 100);

    return {
      level,
      nextLevelXp: requiredXp,
      progress
    };
  },

  // Update streak based on current date
  updateStreak: (userProgress: UserProgressState): Partial<UserProgressState> => {
    const todayStr = new Date().toISOString().split('T')[0];
    const history = [...userProgress.activityHistory];
    const todayActivity = history.find(a => a.date === todayStr);
    
    if (todayActivity) {
      return { activityHistory: history };
    }

    let currentStreak = userProgress.streak;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const yesterdayActivity = history.find(a => a.date === yesterdayStr);
    
    if (yesterdayActivity) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }

    const bestStreak = Math.max(currentStreak, userProgress.bestStreak || 1);

    return {
      streak: currentStreak,
      bestStreak
    };
  },

  // Process a lesson completion and return the updated state
  processLessonCompletion: (
    userProgress: UserProgressState,
    lessonId: string,
    xpReward: number,
    course: LearningCourse,
    attemptStats?: LessonAttemptStats
  ): UserProgressState => {
    const isFirstTime = !userProgress.completedLessonIds.includes(lessonId);
    const updatedCompletedLessons = isFirstTime
      ? [...userProgress.completedLessonIds, lessonId]
      : userProgress.completedLessonIds;

    const awardedXp = isFirstTime ? xpReward : 0;
    const newTotalXp = userProgress.totalXp + awardedXp;
    
    // Find skill that contains this lesson
    let completedSkillId: string | null = null;
    const allOrderedSkills: string[] = [];

    for (const unit of course.units) {
      for (const skill of unit.skills) {
        allOrderedSkills.push(skill.id);
        if (skill.lessons.some(l => l.id === lessonId)) {
          completedSkillId = skill.id;
        }
      }
    }

    const updatedCompletedSkills = [...userProgress.completedSkillIds];
    const updatedSkillMastery = { ...userProgress.skillMastery };

    if (completedSkillId) {
      if (!updatedCompletedSkills.includes(completedSkillId)) {
        updatedCompletedSkills.push(completedSkillId);
      }

      if (attemptStats) {
        // Count active unresolved mistakes tied to this skill
        const unresolvedSkillMistakes = userProgress.mistakes.filter(
          m => !m.resolved && (m.skillId === completedSkillId || m.lessonId === lessonId)
        ).length;

        const evalResult = masteryService.evaluateAttempt({
          ...attemptStats,
          unresolvedMistakesCount: unresolvedSkillMistakes
        });

        const currentPips = userProgress.skillMastery[completedSkillId];
        updatedSkillMastery[completedSkillId] = masteryService.updateSkillMastery(currentPips, evalResult.pips);
      } else if (updatedSkillMastery[completedSkillId] === undefined) {
        // Fallback for callers without attempt stats
        updatedSkillMastery[completedSkillId] = 3;
      }
    }

    // Determine next skill to activate
    let nextSkillId = userProgress.currentSkillId;
    if (completedSkillId) {
      const currentIdx = allOrderedSkills.indexOf(completedSkillId);
      if (currentIdx >= 0 && currentIdx + 1 < allOrderedSkills.length) {
        nextSkillId = allOrderedSkills[currentIdx + 1];
      }
    }

    // Update daily activity
    const todayStr = new Date().toISOString().split('T')[0];
    const history = [...userProgress.activityHistory];
    const todayIdx = history.findIndex(a => a.date === todayStr);
    
    if (todayIdx >= 0) {
      history[todayIdx] = {
        ...history[todayIdx],
        lessonsCount: isFirstTime ? history[todayIdx].lessonsCount + 1 : history[todayIdx].lessonsCount,
        xp: history[todayIdx].xp + awardedXp
      };
    } else {
      history.push({
        date: todayStr,
        lessonsCount: isFirstTime ? 1 : 0,
        xp: awardedXp
      });
    }

    const dailyGoalEarnedXp = todayIdx >= 0 ? history[todayIdx].xp : (userProgress.dailyGoalEarnedXp + awardedXp);
    const levelInfo = progressionService.calculateLevel(newTotalXp);
    const streakUpdates = progressionService.updateStreak(userProgress);

    const updatedAchievements = userProgress.achievements.map(ach => {
      let progress = ach.progress;
      let unlocked = ach.unlocked;
      
      if (ach.id === 'first_code' && updatedCompletedLessons.length > 0) {
        progress = 1; unlocked = true;
      }
      if (ach.id === 'streak_7') {
        progress = Math.min(streakUpdates.streak ?? userProgress.streak, 7);
        if (progress >= 7) unlocked = true;
      }
      if (ach.id === '100_xp' && newTotalXp >= 100) {
        progress = 100; unlocked = true;
      }

      return { ...ach, progress, unlocked };
    });

    return {
      ...userProgress,
      ...streakUpdates,
      completedLessonIds: updatedCompletedLessons,
      completedSkillIds: updatedCompletedSkills,
      currentSkillId: nextSkillId,
      skillMastery: updatedSkillMastery,
      totalXp: newTotalXp,
      level: levelInfo.level,
      dailyGoalEarnedXp,
      activityHistory: history,
      achievements: updatedAchievements
    };
  }
};
