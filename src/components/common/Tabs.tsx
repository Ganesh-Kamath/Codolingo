import React from 'react';
import { Icon } from '../ui/Icon';

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  badge?: number | string;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'pills' | 'underline' | 'tactile';
  className?: string;
  fullWidth?: boolean;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  size = 'md',
  variant = 'pills',
  className = '',
  fullWidth = false
}) => {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = -1;
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    }

    if (nextIndex >= 0 && !tabs[nextIndex].disabled) {
      e.preventDefault();
      onChange(tabs[nextIndex].id);
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm': return 'var(--space-1) var(--space-3)';
      case 'lg': return 'var(--space-3) var(--space-5)';
      case 'md':
      default: return 'var(--space-2) var(--space-4)';
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm': return 'var(--text-xs)';
      case 'lg': return 'var(--text-base)';
      case 'md':
      default: return 'var(--text-sm)';
    }
  };

  return (
    <div
      role="tablist"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: variant === 'underline' ? 'var(--space-4)' : 'var(--space-2)',
        borderBottom: variant === 'underline' ? '1.5px solid var(--border-default)' : 'none',
        paddingBottom: variant === 'underline' ? '0' : undefined,
        width: fullWidth ? '100%' : 'auto'
      }}
      className={className}
    >
      {tabs.map((tab, idx) => {
        const isActive = activeTab === tab.id;

        let tabStyles: React.CSSProperties = {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-2)',
          padding: getPadding(),
          fontSize: getFontSize(),
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          borderRadius: variant === 'underline' ? '0' : 'var(--radius-md)',
          cursor: tab.disabled ? 'not-allowed' : 'pointer',
          opacity: tab.disabled ? 0.4 : 1,
          transition: 'all var(--transition-fast)',
          border: 'none',
          flex: fullWidth ? 1 : undefined,
          userSelect: 'none'
        };

        if (variant === 'tactile') {
          tabStyles = {
            ...tabStyles,
            backgroundColor: isActive ? 'var(--brand-primary)' : 'var(--bg-surface)',
            color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
            border: isActive ? '1.5px solid var(--brand-bevel)' : '1.5px solid var(--border-default)',
            boxShadow: isActive ? 'var(--tactile-primary)' : 'var(--tactile-card)'
          };
        } else if (variant === 'underline') {
          tabStyles = {
            ...tabStyles,
            backgroundColor: 'transparent',
            color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
            borderBottom: isActive ? '3px solid var(--brand-primary)' : '3px solid transparent',
            marginBottom: '-1.5px',
            borderRadius: '0'
          };
        } else {
          // Pills
          tabStyles = {
            ...tabStyles,
            backgroundColor: isActive ? 'var(--brand-light)' : 'transparent',
            color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
            border: isActive ? '1.5px solid var(--brand-border)' : '1.5px solid transparent',
            boxShadow: isActive ? '0 2px 0 var(--brand-border)' : 'none'
          };
        }

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            style={tabStyles}
            className={isActive ? '' : 'nav-hover-item'}
          >
            {tab.icon && <Icon name={tab.icon} size={size === 'sm' ? 14 : 16} />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 800,
                  backgroundColor: isActive ? 'var(--brand-primary)' : 'var(--bg-surface-muted)',
                  color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
