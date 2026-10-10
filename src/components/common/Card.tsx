import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'interactive' | 'accent';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  accentColor?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  accentColor,
  style,
  className = '',
  onClick,
  onKeyDown,
  ...props
}) => {
  const getPaddingStyle = () => {
    switch (padding) {
      case 'none': return 0;
      case 'xs': return 'var(--space-2)';
      case 'sm': return 'var(--space-3)';
      case 'lg': return 'var(--space-6)';
      case 'xl': return 'var(--space-8)';
      case 'md':
      default: return 'var(--space-5)';
    }
  };

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'subtle':
        return {
          backgroundColor: 'var(--bg-surface-subtle)',
          border: '1.5px solid var(--border-subtle)',
          boxShadow: 'none'
        };
      case 'interactive':
        return {
          backgroundColor: 'var(--bg-surface)',
          border: '1.5px solid var(--border-default)',
          boxShadow: 'var(--tactile-card)',
          cursor: 'pointer'
        };
      case 'accent':
        return {
          backgroundColor: 'var(--bg-surface)',
          border: `1.5px solid ${accentColor || 'var(--brand-primary)'}`,
          boxShadow: 'var(--tactile-card)'
        };
      case 'default':
      default:
        return {
          backgroundColor: 'var(--bg-surface)',
          border: '1.5px solid var(--border-default)',
          boxShadow: 'var(--tactile-card)'
        };
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (variant === 'interactive' && onClick) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick(e as any);
      }
    }
    if (onKeyDown) onKeyDown(e);
  };

  return (
    <div
      role={variant === 'interactive' ? 'button' : undefined}
      tabIndex={variant === 'interactive' ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      style={{
        borderRadius: 'var(--radius-xl)',
        padding: getPaddingStyle(),
        ...getVariantStyles(),
        ...style
      }}
      className={`card-plate ${variant === 'interactive' ? 'card-plate-interactive' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
