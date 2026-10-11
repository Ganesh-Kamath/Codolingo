import React from 'react';
import { Icon } from '../ui/Icon';
import { useApp } from '../../context/AppContext';
import { StreakIndicator } from '../common/StreakIndicator';
import { XPIndicator } from '../common/XPIndicator';

import { BrandLogo } from '../common/BrandLogo';

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const { currentRoute, navigateTo, mistakes, userProfile, soundEnabled, toggleSound, activeCourse } = useApp();

  const unresolvedMistakesCount = mistakes.filter(m => !m.resolved).length;

  const navItems = [
    { label: 'Path', iconName: 'map', route: '/app' },
    { label: 'Dashboard', iconName: 'layout-dashboard', route: '/app/dashboard' },
    { label: 'Practice', iconName: 'barbell', route: '/app/practice' },
    { 
      label: 'Fix-It Lab', 
      iconName: 'history', 
      route: '/app/review',
      badge: unresolvedMistakesCount > 0 ? `${unresolvedMistakesCount}` : undefined,
      badgeColor: 'var(--state-error)'
    },
    { label: 'Profile', iconName: 'user', route: '/app/profile' },
  ];

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        height: '100vh',
        position: 'sticky',
        top: 0,
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 40,
        flexShrink: 0
      }}
      className="codon-sidebar"
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '18px 20px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-default)'
        }}
      >
        <BrandLogo size="md" onClick={() => navigateTo('/app')} />

        <button
          onClick={toggleSound}
          style={{
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            color: soundEnabled ? 'var(--text-secondary)' : 'var(--text-muted)',
            transition: 'color var(--transition-fast)'
          }}
          title={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
        >
          {soundEnabled ? <Icon name="volume" size={16} /> : <Icon name="volume-off" size={16} />}
        </button>
      </div>

      {/* Active Course Card Quick-jump */}
      <div style={{ padding: '14px 16px 8px' }}>
        <div
          onClick={() => navigateTo(`/app/course/${activeCourse.id}`)}
          style={{
            padding: '10px 12px',
            backgroundColor: 'var(--bg-app)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            cursor: 'pointer',
            transition: 'border-color 150ms'
          }}
          className="hover-border-brand"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
              Active Track
            </span>
            <Icon name="chevron-right" size={13} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {activeCourse.title}
          </div>
        </div>
      </div>

      {/* Main Navigation Menu */}
      <nav style={{ padding: '8px 12px', flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {navItems.map((item) => {
            const isActive = currentRoute === item.route || (item.route.startsWith('/app/course') && currentRoute.startsWith('/app/course'));

            return (
              <button
                key={item.route}
                onClick={() => navigateTo(item.route)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  width: '100%',
                  textAlign: 'left',
                  backgroundColor: isActive ? 'var(--brand-light)' : 'transparent',
                  color: isActive ? 'var(--brand-text)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  transition: 'all var(--transition-fast)'
                }}
                className={isActive ? '' : 'nav-hover-item'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon name={item.iconName} size={18} style={{ color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)' }} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      backgroundColor: item.badgeColor,
                      color: '#FFFFFF',
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-full)'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* User Stats & Profile Dock */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <StreakIndicator streak={userProfile.streak} />
          <XPIndicator xp={userProfile.totalXp} />
        </div>

        <div
          onClick={() => navigateTo('/app/profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer'
          }}
          className="nav-hover-item"
        >
          <img
            src={userProfile.avatarUrl}
            alt={userProfile.name}
            style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {userProfile.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Level {userProfile.level} • {userProfile.username}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
