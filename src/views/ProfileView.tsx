import React from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/ui/Icon';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';

export const ProfileView: React.FC = () => {
  const { userProfile } = useApp();

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '28px 24px 64px' }} className="animate-fade-in">
      {/* Profile Header Card */}
      <Card variant="default" padding="lg" style={{ marginBottom: '28px', borderTop: '4px solid var(--brand-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ position: 'relative' }}>
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.name}
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '24px',
                  objectFit: 'cover',
                  border: '3px solid var(--brand-primary)',
                  boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)'
                }}
              />
              <div style={{ 
                position: 'absolute', 
                bottom: '-10px', 
                left: '50%', 
                transform: 'translateX(-50%)',
                backgroundColor: 'var(--brand-primary)',
                color: '#fff',
                padding: '2px 10px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 800,
                border: '2px solid #fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                LVL {userProfile.level}
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                  {userProfile.name}
                </h1>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 500 }}>
                @{userProfile.username} • Aspiring Software Engineer
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-app)', padding: '6px 12px', borderRadius: '12px' }}>
                  <Icon name="calendar" size={16} style={{ color: 'var(--text-muted)' }} /> Sept 2026
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#FFF1F2', color: '#E11D48', padding: '6px 12px', borderRadius: '12px' }}>
                  <Icon name="flame" size={16} fill="#FDA4AF" /> {userProfile.streak} Day Streak
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#FEF3C7', color: '#B45309', padding: '6px 12px', borderRadius: '12px' }}>
                  <Icon name="sparkles" size={16} fill="#FDE68A" /> {userProfile.totalXp} XP
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="secondary" size="md" icon={<Icon name="settings" size={16} />}>
              Account Settings
            </Button>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Daily Goal & Streak Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card variant="default" padding="lg">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                <Icon name="target" size={20} />
              </div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Today's Goal
              </h2>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Daily XP</span>
                <span style={{ color: 'var(--brand-primary)' }}>{userProfile.dailyGoalEarnedXp} / {userProfile.dailyGoalXp} XP</span>
              </div>
              <ProgressBar progress={(userProfile.dailyGoalEarnedXp / userProfile.dailyGoalXp) * 100} height={12} />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
                {userProfile.dailyGoalXp - userProfile.dailyGoalEarnedXp > 0 
                  ? `${userProfile.dailyGoalXp - userProfile.dailyGoalEarnedXp} XP to go. Keep learning!`
                  : "Goal reached! You're on fire!"}
              </div>
            </div>
            <Button variant="primary" size="lg" style={{ width: '100%' }} icon={<Icon name="player-play" size={16} fill="#fff" />}>
              Continue Learning
            </Button>
          </Card>

          {/* Gamified Backend Architecture Status */}
          <Card variant="default" padding="lg">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B5563' }}>
                <Icon name="database" size={20} />
              </div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Engine Status
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Storage Layer</span>
                <Badge variant="brand" size="sm">Local-First Reactive</Badge>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Supabase Adapter</span>
                <Badge variant="neutral" size="sm">Config Ready</Badge>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Execution Engine</span>
                <Badge variant="python" size="sm">Client AST / Sandbox</Badge>
              </div>
            </div>

            <div style={{ padding: '12px 14px', backgroundColor: '#F0FDF4', borderRadius: 'var(--radius-md)', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Icon name="shield-check" size={18} style={{ color: '#16A34A' }} />
              <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 600 }}>
                Secure sandbox ready.
              </span>
            </div>
          </Card>
        </div>

        {/* Collectible Achievements Grid */}
        <Card variant="default" padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
                <Icon name="trophy" size={20} />
              </div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Achievements
              </h2>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-primary)', backgroundColor: 'var(--brand-light)', padding: '4px 10px', borderRadius: '12px' }}>
              {userProfile.achievements.filter(a => a.unlocked).length} / {userProfile.achievements.length} Unlocked
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '16px' }}>
            {userProfile.achievements.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '16px 12px',
                  backgroundColor: item.unlocked ? '#FFFFFF' : '#FAFAFA',
                  borderRadius: '16px',
                  border: `2px solid ${item.unlocked ? '#FDE68A' : 'var(--border-subtle)'}`,
                  boxShadow: item.unlocked ? '0 4px 12px rgba(245, 158, 11, 0.15)' : 'none',
                  opacity: item.unlocked ? 1 : 0.6,
                  textAlign: 'center',
                  transition: 'transform 0.2s ease',
                  cursor: 'pointer'
                }}
                className="hover-elevate"
                title={item.description}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: item.unlocked ? '#FEF3C7' : 'var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: item.unlocked ? '#D97706' : 'var(--text-muted)',
                    marginBottom: '12px',
                    boxShadow: item.unlocked ? 'inset 0 -4px 0 rgba(217, 119, 6, 0.2)' : 'none'
                  }}
                >
                  <Icon name={item.unlocked ? 'medal' : 'lock'} size={32} />
                </div>
                
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', lineHeight: 1.2 }}>
                  {item.title}
                </span>
                
                {!item.unlocked && (
                  <div style={{ width: '100%', marginTop: '6px' }}>
                    <ProgressBar progress={(item.progress / item.maxProgress) * 100} height={6} />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                      {item.progress}/{item.maxProgress}
                    </span>
                  </div>
                )}
                {item.unlocked && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--brand-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <Icon name="check" size={12} stroke={3} /> UNLOCKED
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
