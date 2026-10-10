import React from 'react';

export interface SkeletonProps {
  variant?: 'text' | 'rect' | 'circle' | 'card';
  width?: string | number;
  height?: string | number;
  radius?: string;
  lines?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  radius,
  lines = 1,
  className = '',
  style
}) => {
  const getDefaultStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'circle':
        return {
          width: width || '40px',
          height: height || width || '40px',
          borderRadius: 'var(--radius-full)'
        };
      case 'card':
        return {
          width: width || '100%',
          height: height || '140px',
          borderRadius: 'var(--radius-xl)'
        };
      case 'rect':
        return {
          width: width || '100%',
          height: height || '24px',
          borderRadius: radius || 'var(--radius-md)'
        };
      case 'text':
      default:
        return {
          width: width || '100%',
          height: height || '16px',
          borderRadius: radius || 'var(--radius-xs)'
        };
    }
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: width || '100%', ...style }} className={className}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="skeleton-shimmer"
            style={{
              height: height || '14px',
              width: i === lines - 1 ? '70%' : '100%',
              borderRadius: radius || 'var(--radius-xs)',
              ...getDefaultStyles()
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        ...getDefaultStyles(),
        ...style
      }}
    />
  );
};
