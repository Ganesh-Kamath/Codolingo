import React from 'react';
import { Icon } from '../ui/Icon';
import { useApp } from '../../context/AppContext';

export const BottomNav: React.FC = () => {
  const { currentRoute, navigateTo, mistakes, activeCourse } = useApp();
  const unresolvedMistakesCount = mistakes.filter(m => !m.resolved).length;

  const items = [
    { label: 'Home', iconName: 'layout-dashboard', route: '/app' },
    { label: 'Explore', iconName: 'compass', route: '/app/learn' },
    { label: 'Track', iconName: 'book', route: `/app/course/${activeCourse.id}` },
    { 
      label: 'Review', 
      iconName: 'history', 
      route: '/app/review',
      badge: unresolvedMistakesCount > 0 ? unresolvedMistakesCount : undefined
    },
    { label: 'Profile', iconName: 'user', route: '/app/profile' }
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'var(--bottomnav-height)',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--border-default)',
        display: 'none', // Handled via CSS media query
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 50,
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.04)'
      }}
      className="codon-bottom-nav"
    >
      {items.map((item) => {
        const isActive = currentRoute === item.route;

        return (
          <button
            key={item.route}
            onClick={() => navigateTo(item.route)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              flex: 1,
              height: '100%',
              color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
              position: 'relative'
            }}
          >
            <div style={{ position: 'relative' }}>
              <Icon name={item.iconName} size={20} stroke={isActive ? 2.5 : 2} />
              {item.badge && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-8px',
                    width: '16px',
                    height: '16px',
                    backgroundColor: '#EF4444',
                    color: '#FFFFFF',
                    borderRadius: '50%',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {item.badge}
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.6875rem', fontWeight: isActive ? 600 : 500 }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
