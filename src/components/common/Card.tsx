import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'interactive' | 'accent';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  accentColor?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  accentColor,
  style,
  className = '',
  ...props
}) => {
  const getPaddingStyle = () => {
    switch (padding) {
      case 'none': return 0;
      case 'sm': return '14px';
      case 'lg': return '24px';
      case 'md':
      default: return '18px';
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

  return (
    <div
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
