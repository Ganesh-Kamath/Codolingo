import React from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { ProgressBar } from '../components/common/ProgressBar';
import { progressionService } from '../services/progressionService';

// Circular SVG Daily Goal Ring
const DailyGoalRing: React.FC<{
  earned: number;
  target: number;
  size?: number;
}> = ({ earned, target, size = 110 }) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.round((earned / (target || 50)) * 100));
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border-default)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={percentage >= 100 ? 'var(--state-success)' : 'var(--brand-primary)'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', lineHeight: 1 }}>
          {percentage}%
        </span>
        <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '2px' }}>
          GOAL
        </span>
      </div>
    </div>
  );
};

export const DashboardView: React.FC = () => {
  const { userProgress, course, mistakes, navigateTo, startLesson } = useApp();

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const nextLessonId = progressionService.getNextLesson(userProgress, course) || '1.1';
  const unresolvedMistakes = mistakes.filter(m => !m.resolved);
  const primaryWeakness = unresolvedMistakes[0];

  // Resolve current active unit, skill, and lesson details
  let activeUnit = course.units[0];
  let activeSkill = course.units[0]?.skills[0];
  let activeLesson = activeSkill?.lessons[0];

  for (const unit of course.units) {
    for (const skill of unit.skills) {
      const foundLesson = skill.lessons.find(l => l.id === nextLessonId);
      if (foundLesson) {
        activeUnit = unit;
        activeSkill = skill;
        activeLesson = foundLesson;
        break;
      }
    }
  }

  // Calculate course completion stats
  let totalLessonsCount = 0;
  for (const unit of course.units) {
    for (const skill of unit.skills) {
      totalLessonsCount += skill.lessons.length;
    }
  }
  const completedLessonsCount = userProgress.completedLessonIds.length;
  const courseProgressPct = totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;

  // Active unit progress
  const unitLessons = activeUnit ? activeUnit.skills.flatMap(s => s.lessons) : [];
  const completedUnitLessons = unitLessons.filter(l => userProgress.completedLessonIds.includes(l.id)).length;
  const unitProgressPct = unitLessons.length > 0 ? Math.round((completedUnitLessons / unitLessons.length) * 100) : 0;

  // Generate 30-Day Activity Heatmap Data
  const heatmapDays = React.useMemo(() => {
    const days: Array<{ date: string; dayNumber: number; xp: number; hasActivity: boolean; isToday: boolean }> = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const match = userProgress.activityHistory?.find(a => a.date === dateStr);
      const isToday = i === 0;

      days.push({
        date: dateStr,
        dayNumber: d.getDate(),
        xp: match?.xp || 0,
        hasActivity: Boolean(match && match.xp > 0),
        isToday
      });
    }
    return days;
  }, [userProgress.activityHistory]);

  // Generate 7-Day Weekly Chart Data
  const weeklyData = React.useMemo(() => {
    const past7Days: Array<{ label: string; date: string; xp: number; isToday: boolean }> = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const match = userProgress.activityHistory?.find(a => a.date === dateStr);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      past7Days.push({
        label: dayName,
        date: dateStr,
        xp: match?.xp || 0,
        isToday: i === 0
      });
    }
    return past7Days;
  }, [userProgress.activityHistory]);

  const maxWeeklyXp = Math.max(100, ...weeklyData.map(d => d.xp));
  const totalWeeklyXp = weeklyData.reduce((acc, curr) => acc + curr.xp, 0);

  const dailyXpTarget = userProgress.dailyGoal?.xpTarget || userProgress.dailyGoalXp || 50;
  const dailyXpEarned = userProgress.dailyGoal?.xpEarned || userProgress.dailyGoalEarnedXp || 0;

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '24px 20px 80px' }} className="animate-fade-in">
      
      {/* Top Greeting & Quick Switcher */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-primary)', margin: 0 }}>
              {getGreeting()}, {userProgress.name.split(' ')[0]} 👋
            </h1>
            <Badge variant="brand" size="sm">Level {userProgress.level || 1}</Badge>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', margin: 0 }}>
            You're on a <strong style={{ color: 'var(--text-primary)' }}>{userProgress.streak}-day streak</strong>. Keep your momentum high with your next targeted challenge.
          </p>
        </div>

        {/* View Toggle Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigateTo('/app')}
            icon={<Icon name="map" size={16} />}
          >
            Learning Path
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigateTo('/app/practice')}
            icon={<Icon name="barbell" size={16} />}
          >
            Practice Arena
          </Button>
        </div>
      </div>

      {/* 1. DOMINANT "CONTINUE LEARNING" HERO CARD */}
      <div
        className="card-plate animate-slide-up"
        style={{
          padding: '28px 32px',
          marginBottom: '28px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1.5px solid var(--border-default)',
          boxShadow: 'var(--tactile-card)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Badge variant="brand" size="sm">
                UNIT {activeUnit?.unitNumber || 1} • {activeUnit?.title || 'PYTHON FOUNDATIONS'}
              </Badge>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                {completedUnitLessons} of {unitLessons.length} lessons in unit
              </span>
            </div>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.65rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.25 }}>
              {activeSkill?.title}: {activeLesson?.title || 'Interactive Challenge'}
            </h2>

            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.55, maxWidth: '640px', marginBottom: '20px' }}>
              {activeLesson?.description || 'Build solid muscle memory with immediate code evaluation, interactive test assertions, and diagnostic feedback.'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                <Icon name="clock" size={16} style={{ color: 'var(--brand-primary)' }} />
                <span>~{activeLesson?.estimatedMinutes || 4} min session</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                <Icon name="sparkles" size={16} style={{ color: 'var(--warning-text)' }} />
                <span>+{activeLesson?.xpReward || 25} XP reward</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                <Icon name="terminal" size={16} style={{ color: 'var(--secondary-solid)' }} />
                <span>Interactive Python runner</span>
              </div>
            </div>

            {/* Inline Module Progress Bar */}
            <div style={{ maxWidth: '420px', backgroundColor: 'var(--bg-app)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.78rem', fontWeight: 800 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Unit Progress</span>
                <span style={{ color: 'var(--brand-primary)' }}>{unitProgressPct}% Completed</span>
              </div>
              <ProgressBar progress={unitProgressPct} height={8} />
            </div>
          </div>

          {/* Action Trigger Button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => startLesson(nextLessonId)}
              icon={<Icon name="player-play" size={18} fill="#fff" />}
              iconPosition="left"
              style={{ padding: '14px 28px', fontSize: '1.05rem', minWidth: '220px' }}
            >
              Resume Lesson (↵)
            </Button>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 600 }}>
              Press Enter or click to begin
            </span>
          </div>
        </div>
      </div>

      {/* 2. STATS ROW: DAILY GOAL RING + 30-DAY STREAK HEATMAP + WEEKLY XP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        
        {/* A. Daily Goal Ring */}
        <Card variant="default" padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Daily Learning Goal
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Session target for today
              </span>
            </div>
            <Badge variant={dailyXpEarned >= dailyXpTarget ? 'success' : 'brand'} size="sm">
              {dailyXpEarned >= dailyXpTarget ? 'Goal Achieved' : 'In Progress'}
            </Badge>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <DailyGoalRing earned={dailyXpEarned} target={dailyXpTarget} size={110} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Daily XP Progress
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                  {dailyXpEarned} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>/ {dailyXpTarget} XP</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Lessons Target
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                  {userProgress.dailyGoal?.lessonsCompleted || (dailyXpEarned > 0 ? 1 : 0)} / {userProgress.dailyGoal?.lessonsTarget || 2} Lessons
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* B. Streak Calendar: 30-Day Activity Heatmap */}
        <Card variant="default" padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon name="flame" size={18} fill="#FDA4AF" style={{ color: 'var(--streak-color)' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {userProgress.streak} Day Streak
                </h3>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Last 30 days activity heatmap
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', backgroundColor: 'var(--bg-app)', padding: '2px 8px', borderRadius: '6px' }}>
              Best: {Math.max(userProgress.streak, userProgress.bestStreak || userProgress.streak)}d
            </span>
          </div>

          {/* 30-Day Heatmap Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(10, 1fr)',
              gap: '6px',
              padding: '10px 0'
            }}
          >
            {heatmapDays.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.hasActivity ? `${day.xp} XP earned` : 'No activity recorded'}${day.isToday ? ' (Today)' : ''}`}
                style={{
                  aspectRatio: '1',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: day.hasActivity
                    ? 'var(--secondary-solid)'
                    : day.isToday
                    ? 'var(--brand-light)'
                    : 'var(--bg-app)',
                  border: day.isToday
                    ? '1.5px solid var(--brand-primary)'
                    : '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.625rem',
                  fontWeight: 800,
                  color: day.hasActivity ? '#FFFFFF' : 'var(--text-muted)',
                  cursor: 'default',
                  transition: 'transform var(--transition-fast)'
                }}
              >
                {day.dayNumber}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <span>30 days ago</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-default)' }} />
              <span>Rest</span>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: 'var(--secondary-solid)', marginLeft: '6px' }} />
              <span>Learned</span>
            </div>
            <span>Today</span>
          </div>
        </Card>

        {/* C. Weekly XP Chart */}
        <Card variant="default" padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Weekly XP Rhythm
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {totalWeeklyXp} XP earned this week
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#16A34A', fontWeight: 800, backgroundColor: 'var(--state-success-subtle)', padding: '2px 8px', borderRadius: '6px' }}>
              <Icon name="trending-up" size={14} stroke={2.5} />
              <span>Active</span>
            </div>
          </div>

          {/* 7-Day Bar Chart */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              height: '95px',
              padding: '0 4px',
              borderBottom: '1px solid var(--border-default)',
              marginBottom: '10px'
            }}
          >
            {weeklyData.map((d) => {
              const heightPct = Math.min(100, Math.max(14, (d.xp / maxWeeklyXp) * 100));

              return (
                <div key={d.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
                  <span style={{ fontSize: '0.58rem', fontWeight: 800, color: d.xp > 0 ? 'var(--brand-primary)' : 'transparent' }}>
                    {d.xp}
                  </span>
                  <div
                    style={{
                      width: '20px',
                      height: `${heightPct}%`,
                      backgroundColor: d.isToday
                        ? 'var(--brand-primary)'
                        : d.xp > 0
                        ? 'var(--secondary-solid)'
                        : 'var(--bg-app)',
                      borderRadius: '4px 4px 0 0',
                      border: d.xp === 0 ? '1px dashed var(--border-default)' : 'none',
                      transition: 'height 400ms ease'
                    }}
                    title={`${d.label} (${d.date}): ${d.xp} XP`}
                  />
                  <span style={{ fontSize: '0.68rem', fontWeight: d.isToday ? 800 : 600, color: d.isToday ? 'var(--brand-primary)' : 'var(--text-secondary)' }}>
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span>Weekly Total:</span>
            <strong style={{ color: 'var(--text-primary)' }}>{totalWeeklyXp} XP</strong>
          </div>
        </Card>
      </div>

      {/* 3. OPTIONAL MISTAKE BANK ALERT (If any unresolved mistakes exist) */}
      {primaryWeakness && (
        <div
          style={{
            backgroundColor: 'var(--warning-bg)',
            border: '1.5px solid var(--warning-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 22px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}
          className="hover-elevate"
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', maxWidth: '640px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'var(--warning-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                flexShrink: 0
              }}
            >
              <Icon name="history" size={20} stroke={2.5} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--warning-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Mistake Bank • Adaptive Review Needed
                </span>
                <span style={{ fontSize: '0.72rem', backgroundColor: 'var(--error-bg)', color: 'var(--error-solid)', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', border: '1px solid var(--error-border)' }}>
                  Failed {primaryWeakness.frequency}x
                </span>
              </div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 3px' }}>
                {primaryWeakness.conceptName}: {primaryWeakness.explanation}
              </h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                Strengthen mental models and clarify misconceptions before taking the unit capstone synthesis challenge.
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="md"
            onClick={() => navigateTo('/app/review')}
            icon={<Icon name="player-play" size={15} />}
          >
            Start Repair Drill
          </Button>
        </div>
      )}

      {/* 4. COURSE CURRICULUM OVERVIEW */}
      <Card variant="default" padding="lg">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Python Track Curriculum Summary
            </h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {course.units.length} total units • {totalLessonsCount} interactive lessons
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                {courseProgressPct}% Completed
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {completedLessonsCount} of {totalLessonsCount} lessons
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigateTo('/app')}
              icon={<Icon name="map" size={15} />}
            >
              Open Full Map
            </Button>
          </div>
        </div>

        <ProgressBar progress={courseProgressPct} height={10} />
      </Card>

    </div>
  );
};
