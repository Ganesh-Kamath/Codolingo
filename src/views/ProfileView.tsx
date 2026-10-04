import React from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/ui/Icon';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';

export const ProfileView: React.FC = () => {
  const { userProfile, navigateTo } = useApp();

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '28px 24px 64px' }} className="animate-fade-in">
      {/* Profile Header Card */}
      <div
        className="card-plate"
        style={{
          padding: '28px',
          marginBottom: '28px',
          borderLeft: '6px solid var(--brand-primary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ position: 'relative' }}>
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.name}
                style={{
                  width: '92px',
                  height: '92px',
                  borderRadius: '24px',
                  objectFit: 'cover',
                  border: '3px solid var(--brand-primary)',
                  boxShadow: '0 4px 0 var(--brand-bevel)'
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
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                border: '2px solid #fff',
                boxShadow: '0 2px 0 var(--brand-bevel)'
              }}>
                LVL {userProfile.level}
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                  {userProfile.name}
                </h1>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '14px', fontWeight: 600 }}>
                @{userProfile.username} • Python Scholar & Engineer
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-surface-subtle)', padding: '6px 14px', borderRadius: 'var(--radius-full)', border: '1.5px solid var(--border-default)', fontSize: '0.82rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                  <Icon name="calendar" size={15} style={{ color: 'var(--text-muted)' }} /> Joined Sept 2026
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#FFF1F2', color: '#E11D48', padding: '6px 14px', borderRadius: 'var(--radius-full)', border: '1.5px solid #FECDD3', boxShadow: '0 2px 0 #FECDD3', fontSize: '0.82rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                  <Icon name="flame" size={15} fill="#FDA4AF" /> {userProfile.streak} Day Streak
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#FEF3C7', color: '#B45309', padding: '6px 14px', borderRadius: 'var(--radius-full)', border: '1.5px solid #FDE68A', boxShadow: '0 2px 0 #FDE68A', fontSize: '0.82rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                  <Icon name="sparkles" size={15} fill="#FDE68A" /> {userProfile.totalXp.toLocaleString()} Total XP
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Button
              variant="secondary"
              size="md"
              icon={<Icon name="book" size={16} />}
              onClick={() => navigateTo('/app')}
            >
              Resume Journey
            </Button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Daily Goal & Streak Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card-plate" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', backgroundColor: '#EFF6FF', border: '1.5px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', boxShadow: '0 2px 0 #BFDBFE' }}>
                <Icon name="target" size={20} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Today's Quest Goal
              </h2>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Daily XP</span>
                <span style={{ color: 'var(--brand-primary)' }}>{userProfile.dailyGoalEarnedXp} / {userProfile.dailyGoalXp} XP</span>
              </div>
              <ProgressBar progress={(userProfile.dailyGoalEarnedXp / userProfile.dailyGoalXp) * 100} height={12} />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center', fontWeight: 600 }}>
                {userProfile.dailyGoalXp - userProfile.dailyGoalEarnedXp > 0 
                  ? `${userProfile.dailyGoalXp - userProfile.dailyGoalEarnedXp} XP remaining to lock in today's streak.`
                  : "Daily goal achieved! Streak shield energized."}
              </div>
            </div>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigateTo('/app')}
              icon={<Icon name="player-play" size={16} fill="#fff" />}
            >
              Continue Learning
            </Button>
          </div>

          {/* Gamified Engine Status */}
          <div className="card-plate" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', backgroundColor: 'var(--bg-surface-subtle)', border: '1.5px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', boxShadow: '0 2px 0 var(--border-default)' }}>
                <Icon name="terminal" size={20} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Curriculum Engine
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>Curriculum Data</span>
                <Badge variant="brand" size="sm">43 Units • 7,320 Items</Badge>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>Python Runtime</span>
                <Badge variant="success" size="sm">Pyodide WASM Engine</Badge>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>Projects Library</span>
                <Badge variant="warning" size="sm">30 Engineering Labs</Badge>
              </div>
            </div>

            <div style={{ padding: '12px 14px', backgroundColor: '#ECFDF5', borderRadius: 'var(--radius-md)', border: '1.5px solid #A7F3D0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Icon name="check" size={18} style={{ color: '#059669' }} stroke={3} />
              <span style={{ fontSize: '0.8rem', color: '#065F46', fontWeight: 700 }}>
                Client sandbox authenticated & calibrated.
              </span>
            </div>
          </div>
        </div>

        {/* Collectible Achievements Grid */}
        <div className="card-plate" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', backgroundColor: '#FEF3C7', border: '1.5px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', boxShadow: '0 2px 0 #FDE68A' }}>
                <Icon name="trophy" size={20} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Achievements
              </h2>
            </div>
            <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--brand-primary)', backgroundColor: 'var(--brand-light)', border: '1px solid var(--brand-border)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
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
                  backgroundColor: item.unlocked ? '#FFFFFF' : 'var(--bg-surface-subtle)',
                  borderRadius: 'var(--radius-xl)',
                  border: `1.5px solid ${item.unlocked ? '#FDE68A' : 'var(--border-default)'}`,
                  boxShadow: item.unlocked ? '0 4px 0 #B45309' : '0 2px 0 var(--border-default)',
                  opacity: item.unlocked ? 1 : 0.65,
                  textAlign: 'center',
                  transition: 'transform var(--transition-fast)',
                  cursor: 'pointer'
                }}
                className={item.unlocked ? 'card-plate-interactive' : ''}
                title={item.description}
              >
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: item.unlocked ? '#FEF3C7' : '#E5DDD0',
                    border: `2px solid ${item.unlocked ? '#F59E0B' : '#D5C9B7'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: item.unlocked ? '#D97706' : '#8E8A83',
                    marginBottom: '10px'
                  }}
                >
                  <Icon name={item.unlocked ? 'award' : 'lock'} size={28} />
                </div>
                
                <span style={{ fontSize: '0.84rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', lineHeight: 1.2 }}>
                  {item.title}
                </span>
                
                {!item.unlocked && (
                  <div style={{ width: '100%', marginTop: '6px' }}>
                    <ProgressBar progress={(item.progress / item.maxProgress) * 100} height={6} />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block', fontWeight: 700 }}>
                      {item.progress}/{item.maxProgress}
                    </span>
                  </div>
                )}
                {item.unlocked && (
                  <span style={{ fontSize: '0.7rem', color: '#059669', fontFamily: 'var(--font-display)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '3px', marginTop: '4px' }}>
                    <Icon name="check" size={12} stroke={3} /> UNLOCKED
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
