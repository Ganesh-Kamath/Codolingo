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
          border: '1px solid var(--border-subtle)'
        };
      case 'interactive':
        return {
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-xs)',
          cursor: 'pointer',
          transition: 'all var(--transition-base)'
        };
      case 'accent':
        return {
          backgroundColor: 'var(--bg-surface)',
          border: `1px solid ${accentColor || 'var(--border-default)'}`,
          boxShadow: 'var(--shadow-xs)'
        };
      case 'default':
      default:
        return {
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-xs)'
        };
    }
  };

  return (
    <div
      style={{
        borderRadius: 'var(--radius-lg)',
        padding: getPaddingStyle(),
        ...getVariantStyles(),
        ...style
      }}
      className={`codon-card ${variant === 'interactive' ? 'hover-elevate' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
