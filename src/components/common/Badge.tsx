import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'neutral' | 'success' | 'warning' | 'error' | 'outline' | 'python' | 'js' | 'dsa';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon
}) => {
  const getStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'brand':
        return {
          backgroundColor: 'var(--brand-light)',
          color: 'var(--brand-text)',
          borderColor: 'var(--brand-border)'
        };
      case 'success':
        return {
          backgroundColor: 'var(--success-bg)',
          color: 'var(--success-text)',
          borderColor: 'var(--success-border)'
        };
      case 'warning':
        return {
          backgroundColor: 'var(--warning-bg)',
          color: 'var(--warning-text)',
          borderColor: 'var(--warning-border)'
        };
      case 'error':
        return {
          backgroundColor: 'var(--error-bg)',
          color: 'var(--error-text)',
          borderColor: 'var(--error-border)'
        };
      case 'python':
        return {
          backgroundColor: 'var(--course-python-bg)',
          color: 'var(--course-python)',
          borderColor: 'var(--course-python-border)'
        };
      case 'js':
        return {
          backgroundColor: 'var(--course-js-bg)',
          color: 'var(--course-js)',
          borderColor: 'var(--course-js-border)'
        };
      case 'dsa':
        return {
          backgroundColor: 'var(--course-dsa-bg)',
          color: 'var(--course-dsa)',
          borderColor: 'var(--course-dsa-border)'
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
          borderColor: 'var(--border-default)'
        };
      case 'neutral':
      default:
        return {
          backgroundColor: 'var(--bg-surface-muted)',
          color: 'var(--text-secondary)',
          borderColor: 'var(--border-default)'
        };
    }
  };

  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: isSmall ? '0.6875rem' : '0.75rem',
        fontWeight: 600,
        lineHeight: 1,
        padding: isSmall ? '2px 6px' : '4px 8px',
        borderRadius: 'var(--radius-full)',
        border: '1px solid',
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
        whiteSpace: 'nowrap',
        ...getStyles()
      }}
    >
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
