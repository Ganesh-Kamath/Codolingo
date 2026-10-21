import React from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { ProgressBar } from '../components/common/ProgressBar';
import { StreakRescueModal } from '../components/common/StreakRescueModal';
import { progressionService } from '../services/progressionService';

// Circular SVG Daily Goal Ring with Stitch Cyan-Violet Arc
const DailyGoalRing: React.FC<{
  earned: number;
  target: number;
  size?: number;
}> = ({ earned, target, size = 110 }) => {
  const strokeWidth = 8;
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
          stroke="#1F293D"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={percentage >= 100 ? '#36F5C7' : '#00F5D4'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: 'drop-shadow(0 0 6px rgba(0, 245, 212, 0.4))'
          }}
        />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#F8FAFC', lineHeight: 1 }}>
          {percentage}%
        </span>
        <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
          FUEL
        </span>
      </div>
    </div>
  );
};

export const DashboardView: React.FC = () => {
  const { 
    userProgress, 
    course, 
    mistakes, 
    navigateTo, 
    startLesson,
    freezeInventory,
    streakRescuePending,
    dismissStreakRescue,
    isStreakAtRisk
  } = useApp();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const nextLessonId = progressionService.getNextLesson(userProgress, course) || '1.1';
  const unresolvedMistakes = mistakes.filter(m => !m.resolved);
  const primaryWeakness = unresolvedMistakes[0];

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

  let totalLessonsCount = 0;
  for (const unit of course.units) {
    for (const skill of unit.skills) {
      totalLessonsCount += skill.lessons.length;
    }
  }
  const completedLessonsCount = userProgress.completedLessonIds.length;
  const courseProgressPct = totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;

  const unitLessons = activeUnit ? activeUnit.skills.flatMap(s => s.lessons) : [];
  const completedUnitLessons = unitLessons.filter(l => userProgress.completedLessonIds.includes(l.id)).length;
  const unitProgressPct = unitLessons.length > 0 ? Math.round((completedUnitLessons / unitLessons.length) * 100) : 0;

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
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '28px 24px 80px' }} className="animate-fade-in">
      <StreakRescueModal
        isOpen={streakRescuePending}
        streak={userProgress.streak}
        remainingFreezes={freezeInventory}
        onDismiss={dismissStreakRescue}
        onGoToFixItLab={() => navigateTo('/app/review')}
      />

      {/* At-Risk Streak Warning Banner */}
      {isStreakAtRisk && (
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.15) 0%, rgba(121, 40, 202, 0.15) 100%)',
            border: '1px solid #EF4444',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            boxShadow: '0 0 16px rgba(239, 68, 68, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>⚡</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#F8FAFC', fontFamily: 'var(--font-display)' }}>
                TELEMETRY WARNING: {userProgress.streak}-Day Flight Streak at Risk!
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>
                Complete an orbital practice session before 23:59 UTC to retain your forward momentum.
              </div>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={() => startLesson(nextLessonId)}>
            Practice Now
          </Button>
        </div>
      )}

      {/* Flight Cockpit Top Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                fontWeight: 700,
                color: 'var(--brand-primary)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}
            >
              SYS.HUD // OPERATOR CONSOLE
            </span>
            <span style={{ color: '#475569' }}>•</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: '#94A3B8',
                letterSpacing: '0.08em'
              }}
            >
              FLIGHT VECTOR ONLINE
            </span>
          </div>

          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: '#F8FAFC',
              fontFamily: 'var(--font-display)',
              margin: 0
            }}
          >
            {getGreeting()}, {userProgress.name.split(' ')[0]}
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9375rem', margin: '4px 0 0' }}>
            Current flight streak: <strong style={{ color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>{userProgress.streak} DAYS</strong>. Vector velocity synchronized.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#101524',
              border: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#94A3B8' }}>RANK:</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: '#DBB8FF' }}>
              TIER {userProgress.level || 1} ARCHITECT
            </span>
          </div>
          <div
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#101524',
              border: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#94A3B8' }}>TOTAL XP:</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--brand-primary)' }}>
              {userProgress.totalXp.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 1. DOMINANT "ACTIVE FLIGHT MISSION" HERO CARD */}
      <div
        style={{
          padding: '28px 32px',
          marginBottom: '28px',
          backgroundColor: '#101524',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}
        className="hover-glow-cyan"
      >
        {/* Accent Top Progressive Edge */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, #7928CA 0%, #00F5D4 100%)'
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: 'var(--brand-primary)',
                  backgroundColor: 'rgba(0, 245, 212, 0.1)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid rgba(0, 245, 212, 0.25)',
                  textTransform: 'uppercase'
                }}
              >
                MISSION // UNIT {activeUnit?.unitNumber || 1} • {activeUnit?.title || 'FOUNDATIONS'}
              </span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#64748B' }}>
                {completedUnitLessons}/{unitLessons.length} NODES COMPLETED
              </span>
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                fontWeight: 700,
                color: '#F8FAFC',
                marginBottom: '8px',
                lineHeight: 1.2
              }}
            >
              {activeSkill?.title}: {activeLesson?.title || 'Interactive Challenge'}
            </h2>

            <p style={{ fontSize: '0.95rem', color: '#94A3B8', lineHeight: 1.6, maxWidth: '680px', marginBottom: '20px' }}>
              {activeLesson?.description || 'Build solid muscle memory with immediate code evaluation, interactive test assertions, and diagnostic feedback.'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#94A3B8' }}>
                <Icon name="clock" size={15} style={{ color: 'var(--brand-primary)' }} />
                <span>~{activeLesson?.estimatedMinutes || 4} MIN FLIGHT</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#DBB8FF' }}>
                <Icon name="sparkles" size={15} style={{ color: '#DBB8FF' }} />
                <span>+{activeLesson?.xpReward || 25} XP MILESTONE</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#36F5C7' }}>
                <Icon name="terminal" size={15} style={{ color: '#36F5C7' }} />
                <span>WASM INTERACTIVE RUNTIME</span>
              </div>
            </div>

            {/* Inline Module Progress Bar */}
            <div style={{ maxWidth: '440px', backgroundColor: '#0B0E15', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}>
                <span style={{ color: '#94A3B8' }}>UNIT VECTOR PROGRESS</span>
                <span style={{ color: 'var(--brand-primary)' }}>{unitProgressPct}% COMPLETE</span>
              </div>
              <ProgressBar progress={unitProgressPct} height={6} />
            </div>
          </div>

          {/* Action Trigger Button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => startLesson(nextLessonId)}
              icon={<Icon name="player-play" size={18} fill="#0A0D14" />}
              iconPosition="left"
              style={{
                padding: '14px 32px',
                fontSize: '1rem',
                minWidth: '220px',
                boxShadow: '0 0 20px rgba(0, 245, 212, 0.4)'
              }}
            >
              Resume Flight Mission
            </Button>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#64748B', marginTop: '8px' }}>
              Press ↵ or click to execute
            </span>
          </div>
        </div>
      </div>

      {/* 2. STATS ROW: DAILY GOAL FUEL + 30-DAY RADAR + WEEKLY RHYTHM */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        
        {/* A. Daily Fuel Ring */}
        <div
          style={{
            backgroundColor: '#101524',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#F8FAFC', margin: 0, fontFamily: 'var(--font-display)' }}>
                Daily Orbit Target
              </h3>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#94A3B8' }}>
                TELEMETRY FUEL QUOTA
              </span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                fontWeight: 700,
                color: dailyXpEarned >= dailyXpTarget ? '#36F5C7' : 'var(--brand-primary)',
                backgroundColor: 'rgba(0, 245, 212, 0.1)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid rgba(0, 245, 212, 0.25)'
              }}
            >
              {dailyXpEarned >= dailyXpTarget ? 'QUOTA ACHIEVED' : 'IN FLIGHT'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <DailyGoalRing earned={dailyXpEarned} target={dailyXpTarget} size={110} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                  XP DELIVERED
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F8FAFC', fontFamily: 'var(--font-mono)' }}>
                  {dailyXpEarned} <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>/ {dailyXpTarget} XP</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                  MISSION UNITS
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                  {userProgress.dailyGoal?.lessonsCompleted || (dailyXpEarned > 0 ? 1 : 0)} / {userProgress.dailyGoal?.lessonsTarget || 2} NODES
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* B. Streak Calendar: 30-Day Activity Heatmap */}
        <div
          style={{
            backgroundColor: '#101524',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon name="flame" size={18} style={{ color: 'var(--brand-primary)' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#F8FAFC', margin: 0, fontFamily: 'var(--font-display)' }}>
                  {userProgress.streak} Day Vector Streak
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#94A3B8' }}>
                  LAST 30 FLIGHT CYCLES
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: '#36F5C7',
                    background: 'rgba(54, 245, 199, 0.1)',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid rgba(54, 245, 199, 0.25)'
                  }}
                  title="Streak Freezes protect your flight streak. Earn more by repairing concepts in Fix-It Lab!"
                >
                  ❄️ {freezeInventory}/2 FREEZES
                </span>
              </div>
            </div>
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#94A3B8', backgroundColor: '#0B0E15', padding: '2px 8px', borderRadius: 'var(--radius-xs)' }}>
              PEAK: {Math.max(userProgress.streak, userProgress.bestStreak || userProgress.streak)}D
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
                title={`${day.date}: ${day.hasActivity ? `${day.xp} XP earned` : 'No mission executed'}${day.isToday ? ' (Today)' : ''}`}
                style={{
                  aspectRatio: '1',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: day.hasActivity
                    ? '#00F5D4'
                    : day.isToday
                    ? 'rgba(0, 245, 212, 0.2)'
                    : '#0B0E15',
                  border: day.isToday
                    ? '1px solid #00F5D4'
                    : '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: day.hasActivity ? '#0A0D14' : '#64748B',
                  cursor: 'default',
                  boxShadow: day.hasActivity ? '0 0 6px rgba(0, 245, 212, 0.3)' : 'none'
                }}
              >
                {day.dayNumber}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#64748B' }}>
            <span>T-30D</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#0B0E15', border: '1px solid var(--border-default)' }} />
              <span>DOCK</span>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#00F5D4', marginLeft: '6px' }} />
              <span>ACTIVE</span>
            </div>
            <span>TODAY</span>
          </div>
        </div>

        {/* C. Weekly XP Chart */}
        <div
          style={{
            backgroundColor: '#101524',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#F8FAFC', margin: 0, fontFamily: 'var(--font-display)' }}>
                Weekly Velocity
              </h3>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#94A3B8' }}>
                {totalWeeklyXp} XP LOGGED THIS WEEK
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--brand-primary)', fontWeight: 700, backgroundColor: 'rgba(0, 245, 212, 0.1)', padding: '2px 8px', borderRadius: 'var(--radius-xs)' }}>
              <Icon name="trending-up" size={14} stroke={2.5} />
              <span>OPTIMAL</span>
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
                  <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: d.xp > 0 ? 'var(--brand-primary)' : 'transparent' }}>
                    {d.xp}
                  </span>
                  <div
                    style={{
                      width: '18px',
                      height: `${heightPct}%`,
                      backgroundColor: d.isToday
                        ? '#00F5D4'
                        : d.xp > 0
                        ? '#7928CA'
                        : '#0B0E15',
                      borderRadius: '2px 2px 0 0',
                      border: d.xp === 0 ? '1px dashed var(--border-default)' : 'none',
                      boxShadow: d.isToday ? '0 0 10px rgba(0, 245, 212, 0.4)' : 'none',
                      transition: 'height 400ms ease'
                    }}
                    title={`${d.label} (${d.date}): ${d.xp} XP`}
                  />
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: d.isToday ? 700 : 500, color: d.isToday ? 'var(--brand-primary)' : '#94A3B8' }}>
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#94A3B8' }}>
            <span>WEEKLY OUTPUT:</span>
            <strong style={{ color: '#F8FAFC' }}>{totalWeeklyXp} XP</strong>
          </div>
        </div>
      </div>

      {/* 3. OPTIONAL MISTAKE BANK ALERT */}
      {primaryWeakness && (
        <div
          style={{
            backgroundColor: '#161D31',
            border: '1px solid rgba(121, 40, 202, 0.4)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 0 20px rgba(121, 40, 202, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', maxWidth: '720px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(121, 40, 202, 0.3)',
                border: '1px solid rgba(121, 40, 202, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#DBB8FF',
                flexShrink: 0
              }}
            >
              <Icon name="history" size={20} stroke={2.5} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#DBB8FF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  FIX-IT TELEMETRY LAB // ADAPTIVE CALIBRATION
                </span>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#FFB4AB', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-xs)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  {primaryWeakness.frequency}× MISCONCEPTION
                </span>
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#F8FAFC', margin: '0 0 4px', fontFamily: 'var(--font-display)' }}>
                {primaryWeakness.conceptName}: {primaryWeakness.explanation}
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
                Repair faulty cognitive heuristics and verify algorithmic correctness before ascending to higher tiers.
              </p>
            </div>
          </div>

          <Button
            variant="mastery"
            size="md"
            onClick={() => navigateTo('/app/review')}
            icon={<Icon name="player-play" size={15} />}
          >
            Execute Repair Drill
          </Button>
        </div>
      )}

      {/* 4. TRACK MATRIX CURRICULUM OVERVIEW */}
      <div
        style={{
          backgroundColor: '#101524',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F8FAFC', margin: 0, fontFamily: 'var(--font-display)' }}>
              Python Systems Track Matrix
            </h3>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#94A3B8' }}>
              {course.units.length} TOTAL UNITS • {totalLessonsCount} INTERACTIVE FLIGHT MISSIONS
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--brand-primary)' }}>
                {courseProgressPct}% VERIFIED
              </div>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#64748B' }}>
                {completedLessonsCount} OF {totalLessonsCount} NODES
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigateTo('/app')}
              icon={<Icon name="map" size={15} />}
            >
              Curriculum Matrix
            </Button>
          </div>
        </div>

        <ProgressBar progress={courseProgressPct} height={8} />
      </div>

    </div>
  );
};
