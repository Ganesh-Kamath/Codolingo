import React from 'react';
import { useApp } from '../../context/AppContext';
import { StreakIndicator } from '../common/StreakIndicator';
import { XPIndicator } from '../common/XPIndicator';
import { Icon } from '../ui/Icon';

interface TopBarProps {
  title?: string;
  subtitle?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ title, subtitle }) => {
  const { userProfile, soundEnabled, toggleSound, navigateTo } = useApp();

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-default)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 30
      }}
      className="codon-topbar"
    >
      <div>
        {title ? (
          <div>
            <h1 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.015em' }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{subtitle}</p>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Daily Target:</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand-text)' }}>
              {userProfile.dailyGoal.lessonsCompleted} of {userProfile.dailyGoal.lessonsTarget} lessons completed
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={() => navigateTo('/app/practice')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            backgroundColor: 'var(--bg-app)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--text-primary)'
          }}
          className="desktop-only"
        >
          <Icon name="terminal-2" size={16} stroke={2.5} style={{ color: 'var(--brand-primary)' }} />
          <span>Quick Sandbox</span>
        </button>

        <div className="stats-cluster" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StreakIndicator streak={userProfile.streak} />
          <XPIndicator xp={userProfile.totalXp} />
        </div>

        <button
          onClick={toggleSound}
          style={{
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            color: soundEnabled ? 'var(--text-secondary)' : 'var(--text-muted)'
          }}
          title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
        >
          {soundEnabled ? <Icon name="volume" size={20} /> : <Icon name="volume-3" size={20} />}
        </button>

        <div
          onClick={() => navigateTo('/app/profile')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <img
            src={userProfile.avatarUrl}
            alt={userProfile.name}
            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-default)' }}
          />
        </div>
      </div>
    </header>
  );
};
