import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = 'var(--brand-primary)',
  height = 8,
  showLabel = false,
  label
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.8125rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{label || 'Progress'}</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{Math.round(clampedProgress)}%</span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: `${height}px`,
          backgroundColor: 'var(--border-subtle)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <div
          style={{
            width: `${clampedProgress}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: 'var(--radius-full)',
            transition: 'width 400ms cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 0 8px rgba(16, 185, 129, 0.2)'
          }}
        />
      </div>
    </div>
  );
};
