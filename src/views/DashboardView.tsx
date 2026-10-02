import React from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { ProgressBar } from '../components/common/ProgressBar';

export const DashboardView: React.FC = () => {
  const { userProfile, activeCourse, mistakes, navigateTo } = useApp();

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const nextLessonId = 'py_lesson_3';
  const unresolvedMistakes = mistakes.filter(m => !m.resolved);
  const primaryWeakness = unresolvedMistakes[0];

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '28px 24px 64px' }} className="animate-fade-in">
      {/* Top Greeting & Daily Streak Banner */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-primary)', marginBottom: '4px' }}>
            {getGreeting()}, {userProfile.name.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            You're on a <strong style={{ color: 'var(--text-primary)' }}>{userProfile.streak}-day streak</strong>. Keep your momentum by completing your daily goals.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigateTo('/app/review')}
            icon={<Icon name="history" size={16} />}
          >
            Mistake Bank {unresolvedMistakes.length > 0 && `(${unresolvedMistakes.length})`}
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigateTo(`/app/lesson/${nextLessonId}`)}
            icon={<Icon name="player-play" size={15} fill="#fff" />}
          >
            Continue Learning
          </Button>
        </div>
      </div>

      {/* Grid: Main Continue Card + Daily Goals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {/* Continue Learning Primary Card */}
        <Card variant="interactive" padding="lg" onClick={() => navigateTo(`/app/lesson/${nextLessonId}`)} style={{ borderLeft: '4px solid var(--brand-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Badge variant="python"><Icon name="brand-python" size={14} style={{ marginRight: 4 }} /> Python Foundations</Badge>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lesson 3 of 6</span>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Resume <Icon name="chevron-right" size={16} stroke={3} />
            </span>
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
            Comparison Operators (== vs =)
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
            Learn how Python evaluates boolean equality expressions and avoid the classic single-equals assignment pitfall.
          </p>

          <div style={{ backgroundColor: 'var(--bg-app)', padding: '12px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Module Progress</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-primary)' }}>66%</span>
            </div>
            <ProgressBar progress={66} height={10} />
          </div>
        </Card>

        {/* Daily Goals Summary */}
        <Card variant="default" padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Today's Goals</h3>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-primary)', backgroundColor: 'var(--brand-light)', padding: '3px 8px', borderRadius: 'var(--radius-full)' }}>
              1 / 2 Complete
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: 'var(--bg-app)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon name="check" size={20} stroke={3} style={{ color: 'var(--brand-primary)' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Complete 1 lesson</span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-primary)', backgroundColor: 'var(--brand-light)', padding: '4px 8px', borderRadius: '8px' }}>Done (+100 XP)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: 'var(--bg-app)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '3px solid var(--border-default)' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Complete 1 more lesson</span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>0 / 1</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: '#FEF2F2', borderRadius: '12px', border: '1px solid #FECACA' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon name="history" size={20} style={{ color: '#EF4444' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#991B1B' }}>Repair 1 mistake</span>
              </div>
              <button
                onClick={() => navigateTo('/app/review')}
                style={{ fontSize: '0.8rem', fontWeight: 800, color: '#EF4444', textDecoration: 'underline' }}
              >
                Start Drill
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Needs Attention / Adaptive Mistake Alert */}
      {primaryWeakness && (
        <div
          style={{
            backgroundColor: '#FFFBEB',
            border: '1px solid #FDE68A',
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
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D97706',
                flexShrink: 0
              }}
            >
              <Icon name="alert-triangle" size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Needs Attention • Mistake Bank
                </span>
                <span style={{ fontSize: '0.75rem', backgroundColor: '#FEE2E2', color: '#991B1B', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
                  Failed {primaryWeakness.frequency}x
                </span>
              </div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
                {primaryWeakness.conceptName}: {primaryWeakness.explanation}
              </h4>
              <p style={{ fontSize: '0.84rem', color: '#78350F', margin: 0 }}>
                You recently confused assignment (<code style={{ background: '#FEF3C7', padding: '1px 4px' }}>=</code>) with equality (<code style={{ background: '#FEF3C7', padding: '1px 4px' }}>==</code>). Complete a 2-minute diagnostic repair drill to solidify mastery.
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="md"
            onClick={() => navigateTo('/app/review')}
            icon={<Icon name="history" size={15} />}
          >
            Start Repair Drill
          </Button>
        </div>
      )}

      {/* Skills Matrix & Learning Activity Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Skill Mastery Breakdown */}
        <Card variant="default" padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Skill Mastery Matrix</h3>
            <button
              onClick={() => navigateTo('/app/progress')}
              style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Full Analytics <Icon name="arrow-up-right" size={16} stroke={3} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-app)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Python Syntax & Output</span>
                <span style={{ fontWeight: 800, color: '#10B981' }}>90%</span>
              </div>
              <ProgressBar progress={90} color="#10B981" height={8} />
            </div>

            <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-app)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Variables & Data Types</span>
                <span style={{ fontWeight: 800, color: '#10B981' }}>85%</span>
              </div>
              <ProgressBar progress={85} color="#10B981" height={8} />
            </div>

            <div style={{ padding: '8px 12px', backgroundColor: '#FFFBEB', borderRadius: '12px', border: '1px solid #FDE68A' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 700, color: '#92400E' }}>Comparison Operators</span>
                <span style={{ fontWeight: 800, color: '#F59E0B' }}>60% (Review)</span>
              </div>
              <ProgressBar progress={60} color="#F59E0B" height={8} />
            </div>

            <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-app)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Control Flow (if / else)</span>
                <span style={{ fontWeight: 800, color: '#3B82F6' }}>70%</span>
              </div>
              <ProgressBar progress={70} color="#3B82F6" height={8} />
            </div>
          </div>
        </Card>

        {/* Weekly Activity Heatmap */}
        <Card variant="default" padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Weekly Learning Rhythm</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#16A34A', fontWeight: 800, backgroundColor: '#DCFCE7', padding: '4px 8px', borderRadius: '8px' }}>
              <Icon name="trending-up" size={16} stroke={3} />
              <span>+34% this week</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '110px', padding: '0 8px 10px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '14px' }}>
            {userProfile.activityHistory.map((item) => {
              const dayName = new Date(item.date).toLocaleDateString('en-US', { weekday: 'narrow' });
              const heightPct = Math.min(100, Math.max(25, (item.xp / 350) * 100));

              return (
                <div key={item.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                  <div
                    style={{
                      width: '26px',
                      height: `${heightPct}%`,
                      backgroundColor: item.lessonsCount > 0 ? 'var(--brand-primary)' : 'var(--border-default)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 300ms ease'
                    }}
                    title={`${item.date}: ${item.xp} XP (${item.lessonsCount} lessons)`}
                  />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {dayName}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            <span>Weekly Target: 7/7 days</span>
            <strong style={{ color: 'var(--brand-text)' }}>Active Streak: {userProfile.streak} days 🔥</strong>
          </div>
        </Card>
      </div>
    </div>
  );
};
