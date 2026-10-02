import React from 'react';
import { Icon } from '../ui/Icon';

interface XPIndicatorProps {
  xp: number;
}

export const XPIndicator: React.FC<XPIndicatorProps> = ({ xp }) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 10px',
        backgroundColor: 'var(--xp-bg)',
        border: '1px solid #FDE68A',
        borderRadius: 'var(--radius-full)',
        color: '#B45309',
        fontWeight: 600,
        fontSize: '0.8125rem'
      }}
      title={`${xp.toLocaleString()} total XP earned`}
    >
      <Icon name="sparkles" size={16} stroke={2.5} style={{ color: '#D97706', fill: '#FDE68A' }} />
      <span>{xp.toLocaleString()}</span>
      <span style={{ color: '#92400E', fontWeight: 500 }}>XP</span>
    </div>
  );
};
