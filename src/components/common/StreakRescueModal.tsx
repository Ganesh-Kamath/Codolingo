import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Icon } from '../ui/Icon';

interface StreakRescueModalProps {
  isOpen: boolean;
  streak: number;
  remainingFreezes: number;
  onDismiss: () => void;
  onGoToFixItLab?: () => void;
}

export const StreakRescueModal: React.FC<StreakRescueModalProps> = ({
  isOpen,
  streak,
  remainingFreezes,
  onDismiss,
  onGoToFixItLab
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onDismiss}
      title=""
      size="sm"
    >
      <div style={{ textAlign: 'center', padding: '1.25rem 0.5rem' }}>
        {/* Animated Icy Badge */}
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
            border: '3px solid #38BDF8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto',
            boxShadow: '0 0 24px rgba(56, 189, 248, 0.45)',
            animation: 'pulse 2s infinite ease-in-out'
          }}
        >
          <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>❄️</span>
        </div>

        <h3
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
            color: 'var(--text-primary)',
            margin: '0 0 0.5rem 0'
          }}
        >
          Streak Freeze Activated!
        </h3>

        <p
          style={{
            fontSize: '0.9375rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            margin: '0 0 1.25rem 0'
          }}
        >
          Your <strong>{streak}-day streak</strong> was protected yesterday by a Streak Freeze. You have{' '}
          <strong>{remainingFreezes} {remainingFreezes === 1 ? 'freeze' : 'freezes'}</strong> remaining.
        </p>

        <div
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: '12px',
            padding: '0.875rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textAlign: 'left'
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--accent-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-primary)',
              flexShrink: 0
            }}
          >
            <Icon name="Wrench" size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Recharge in Fix-It Lab
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Resolve 3 code misconceptions to earn your next freeze.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={onDismiss}
          >
            Practice Today & Keep Streak!
          </Button>
          {onGoToFixItLab && (
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={() => {
                onDismiss();
                onGoToFixItLab();
              }}
            >
              Go to Fix-It Lab
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
