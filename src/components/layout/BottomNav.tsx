import React from 'react';
import { Icon } from '../ui/Icon';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/audio';

export const BottomNav: React.FC = () => {
  const { currentRoute, navigateTo, userProgress } = useApp();
  const unresolvedMistakesCount = userProgress.mistakes.filter(m => !m.resolved).length;

  const rawTab = currentRoute === '/' ? '/app' : currentRoute;
  const currentTab =
    (rawTab === '/app' || rawTab === '/app/learn')
      ? '/app'
      : rawTab.startsWith('/app/practice') || rawTab.startsWith('/app/projects')
      ? '/app/practice'
      : rawTab.startsWith('/app/review')
      ? '/app/review'
      : rawTab.startsWith('/app/profile')
      ? '/app/profile'
      : '/app';

  const items = [
    { id: '/app', label: 'Learn', iconName: 'book' },
    { id: '/app/practice', label: 'Practice', iconName: 'barbell' },
    {
      id: '/app/review',
      label: 'Mistake Bank',
      iconName: 'history',
      badge: unresolvedMistakesCount > 0 ? unresolvedMistakesCount : undefined
    },
    { id: '/app/profile', label: 'Profile', iconName: 'user' }
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'var(--bottomnav-height, 64px)',
        backgroundColor: '#FFFFFF',
        borderTop: '1.5px solid var(--border-default)',
        boxShadow: '0 -2px 10px rgba(30, 27, 23, 0.04)',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 40
      }}
      className="mobile-only flex-between"
      aria-label="Mobile navigation"
    >
      {items.map((tab) => {
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => {
              sound.playClick();
              navigateTo(tab.id);
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              flex: 1,
              height: '100%',
              background: 'none',
              border: 'none',
              position: 'relative',
              color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <div style={{ position: 'relative' }}>
              <Icon name={tab.iconName} size={20} stroke={isActive ? 2.5 : 2} />
              {tab.badge ? (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-8px',
                    backgroundColor: '#EF4444',
                    color: '#FFFFFF',
                    fontSize: '0.625rem',
                    fontWeight: 800,
                    padding: '0 4px',
                    borderRadius: 'var(--radius-full)',
                    border: '1.5px solid #FFFFFF',
                    lineHeight: '13px'
                  }}
                >
                  {tab.badge}
                </span>
              ) : null}
            </div>
            <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-display)', fontWeight: isActive ? 800 : 600 }}>
              {tab.label}
            </span>
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '32px',
                  height: '3px',
                  borderRadius: '0 0 3px 3px',
                  backgroundColor: 'var(--brand-primary)'
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};

