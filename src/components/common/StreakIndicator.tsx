import React from 'react';
import { Icon } from '../ui/Icon';

interface StreakIndicatorProps {
  streak: number;
  showLabel?: boolean;
}

export const StreakIndicator: React.FC<StreakIndicatorProps> = ({ streak, showLabel = true }) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 10px',
        backgroundColor: '#FFF1F2',
        border: '1px solid #FECDD3',
        borderRadius: 'var(--radius-full)',
        color: '#E11D48',
        fontWeight: 600,
        fontSize: '0.8125rem'
      }}
      title={`${streak} day learning streak!`}
    >
      <Icon name="flame" size={16} stroke={2.5} style={{ color: '#E11D48', fill: '#FDA4AF' }} />
      <span>{streak}</span>
      {showLabel && <span style={{ color: '#9F1239', fontWeight: 500 }}>days</span>}
    </div>
  );
};
