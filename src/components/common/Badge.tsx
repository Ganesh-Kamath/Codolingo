import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'neutral' | 'success' | 'warning' | 'error' | 'outline' | 'python' | 'js' | 'dsa';
  size?: 'xs' | 'sm' | 'md';
  icon?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  style,
  className = ''
}) => {
  const getStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'brand':
        return {
          backgroundColor: 'var(--brand-light)',
          color: 'var(--brand-primary)',
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

  const getPaddingAndFontSize = () => {
    switch (size) {
      case 'xs':
        return {
          fontSize: '0.625rem',
          padding: '1px var(--space-1)',
          gap: '2px'
        };
      case 'sm':
        return {
          fontSize: 'var(--text-xs)',
          padding: '2px var(--space-2)',
          gap: 'var(--space-1)'
        };
      case 'md':
      default:
        return {
          fontSize: 'var(--text-sm)',
          padding: '4px var(--space-3)',
          gap: 'var(--space-1)'
        };
    }
  };

  const sizing = getPaddingAndFontSize();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontWeight: 700,
        lineHeight: 1.2,
        borderRadius: 'var(--radius-full)',
        border: '1px solid',
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        ...sizing,
        ...getStyles(),
        ...style
      }}
      className={className}
    >
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
