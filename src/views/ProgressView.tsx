import React from 'react';
import { useApp } from '../context/AppContext';
import { CONCEPTS } from '../data/concepts';
import { Icon } from '../components/ui/Icon';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';

export const ProgressView: React.FC = () => {
  const { userProfile, mistakes } = useApp();

  const totalMistakesCount = mistakes.reduce((acc, m) => acc + m.frequency, 0);
  const repairedCount = mistakes.filter(m => m.resolved).length;

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '28px 24px 64px' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '28px', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Badge variant="brand" size="md"><Icon name="chart-bar" size={14} style={{ marginRight: 4 }} /> Performance Metrics</Badge>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Learning Analytics</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-primary)', margin: '0 0 6px' }}>
          Progress & Adaptive Mastery
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '720px', lineHeight: 1.5, margin: 0 }}>
          Track retention, concept mastery percentages, mistake repair rates, and study velocity.
        </p>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <Card variant="default" padding="md">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Active Streak</span>
            <div style={{ padding: '6px', backgroundColor: '#FFF1F2', borderRadius: '8px' }}>
              <Icon name="flame" size={20} fill="#EF4444" style={{ color: '#EF4444' }} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>
            {userProfile.streak} Days
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--brand-text)', fontWeight: 600 }}>
            Best: {userProfile.bestStreak} days
          </span>
        </Card>

        <Card variant="default" padding="md">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Cumulative XP</span>
            <div style={{ padding: '6px', backgroundColor: '#FEF3C7', borderRadius: '8px' }}>
              <Icon name="sparkles" size={20} fill="#F59E0B" style={{ color: '#D97706' }} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>
            {userProfile.totalXp.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 600 }}>
            Level {userProfile.level} Developer
          </span>
        </Card>

        <Card variant="default" padding="md">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Accuracy Rate</span>
            <div style={{ padding: '6px', backgroundColor: '#ECFDF5', borderRadius: '8px' }}>
              <Icon name="target" size={20} style={{ color: '#10B981' }} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>
            88.4%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--brand-text)', fontWeight: 600 }}>
            +4.2% this month
          </span>
        </Card>

        <Card variant="default" padding="md">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Mistakes Repaired</span>
            <div style={{ padding: '6px', backgroundColor: '#EFF6FF', borderRadius: '8px' }}>
              <Icon name="check" size={20} stroke={3} style={{ color: '#3B82F6' }} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>
            {repairedCount} / {mistakes.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#1D4ED8', fontWeight: 600 }}>
            {totalMistakesCount} total attempts recorded
          </span>
        </Card>
      </div>

      {/* Detailed Concept Mastery Table */}
      <Card variant="default" padding="lg" style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>
          Concept Retention & Mastery Index
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Each concept's score is computed from your first-try accuracy, execution errors, and repair drills.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {Object.values(CONCEPTS).map(concept => {
            const isWeak = concept.masteryPercentage < 70;
            const isProficient = concept.masteryPercentage >= 80;

            return (
              <div
                key={concept.id}
                style={{
                  padding: '14px 18px',
                  backgroundColor: 'var(--bg-app)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                        {concept.name}
                      </span>
                      <Badge variant={isProficient ? 'success' : isWeak ? 'warning' : 'neutral'} size="sm">
                        {isProficient ? 'Mastered' : isWeak ? 'Needs Attention' : 'Developing'}
                      </Badge>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {concept.description}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: isProficient ? '#10B981' : isWeak ? '#D97706' : 'var(--text-primary)' }}>
                      {concept.masteryPercentage}%
                    </span>
                  </div>
                </div>

                  <ProgressBar
                    progress={concept.masteryPercentage}
                    color={isProficient ? 'var(--brand-primary)' : isWeak ? '#F59E0B' : '#3B82F6'}
                    height={10}
                  />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Achievements Section */}
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>
          Achievements
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Collect badges and unlock milestones as you progress through the learning path.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {userProfile.achievements?.map(achievement => {
            const isUnlocked = achievement.unlocked;
            const progressPct = Math.min(100, (achievement.progress / achievement.maxProgress) * 100);

            return (
              <Card key={achievement.id} variant="default" padding="md" style={{ display: 'flex', alignItems: 'center', gap: '16px', opacity: isUnlocked ? 1 : 0.7, filter: isUnlocked ? 'none' : 'grayscale(0.6)' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  backgroundColor: isUnlocked ? 'var(--brand-light)' : '#F3F4F6',
                  border: `2px solid ${isUnlocked ? 'var(--brand-border)' : 'var(--border-subtle)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isUnlocked ? 'var(--brand-primary)' : 'var(--text-muted)'
                }}>
                  <Icon name={achievement.icon.toLowerCase()} size={32} stroke={2.5} />
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {achievement.title}
                    </h3>
                    {isUnlocked && (
                      <Badge variant="brand" size="sm">Unlocked</Badge>
                    )}
                  </div>
                  
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                    {achievement.description}
                  </p>
                  
                  {!isUnlocked && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                        <span>{achievement.progress} / {achievement.maxProgress}</span>
                        <span>{Math.round(progressPct)}%</span>
                      </div>
                      <ProgressBar progress={progressPct} height={6} color="var(--brand-primary)" />
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
