import React, { createContext, useContext, useState, useCallback } from 'react';
import { Icon } from '../ui/Icon';

export type ToastType = 'success' | 'error' | 'info' | 'xp' | 'streak' | 'achievement';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  showXpToast: (amount: number, reason?: string) => void;
  showStreakToast: (days: number) => void;
  showSuccessToast: (title: string, message?: string) => void;
  showErrorToast: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newToast: ToastItem = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    const duration = toast.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const showXpToast = useCallback((amount: number, reason?: string) => {
    showToast({
      type: 'xp',
      title: `+${amount} XP Earned!`,
      message: reason || 'Keep up the momentum!'
    });
  }, [showToast]);

  const showStreakToast = useCallback((days: number) => {
    showToast({
      type: 'streak',
      title: `${days} Day Streak Extended!`,
      message: 'Consistency builds world-class engineering mastery.'
    });
  }, [showToast]);

  const showSuccessToast = useCallback((title: string, message?: string) => {
    showToast({ type: 'success', title, message });
  }, [showToast]);

  const showErrorToast = useCallback((title: string, message?: string) => {
    showToast({ type: 'error', title, message });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showXpToast, showStreakToast, showSuccessToast, showErrorToast }}>
      {children}
      {/* Toast Render Container */}
      <div
        role="region"
        aria-live="polite"
        style={{
          position: 'fixed',
          bottom: 'var(--space-6)',
          right: 'var(--space-6)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          pointerEvents: 'none',
          maxWidth: '380px',
          width: 'calc(100vw - 32px)'
        }}
      >
        {toasts.map((toast) => {
          let iconName = 'info-circle';
          let borderCol = 'var(--border-default)';
          let bgCol = 'var(--bg-surface)';
          let iconCol = 'var(--brand-primary)';

          if (toast.type === 'xp') {
            iconName = 'sparkles';
            borderCol = 'var(--warning-border)';
            iconCol = 'var(--warning-solid)';
          } else if (toast.type === 'streak') {
            iconName = 'flame';
            borderCol = '#FECDD3';
            iconCol = 'var(--streak-color)';
          } else if (toast.type === 'success') {
            iconName = 'circle-check';
            borderCol = 'var(--success-border)';
            iconCol = 'var(--secondary-solid)';
          } else if (toast.type === 'error') {
            iconName = 'alert-circle';
            borderCol = 'var(--error-border)';
            iconCol = 'var(--error-solid)';
          } else if (toast.type === 'achievement') {
            iconName = 'trophy';
            borderCol = 'var(--warning-border)';
            iconCol = 'var(--warning-solid)';
          }

          return (
            <div
              key={toast.id}
              style={{
                pointerEvents: 'auto',
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: bgCol,
                borderRadius: 'var(--radius-lg)',
                border: `1.5px solid ${borderCol}`,
                boxShadow: 'var(--shadow-lg)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                animation: 'slideUp 240ms cubic-bezier(0.16, 1, 0.3, 1) forwards'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: iconCol,
                  flexShrink: 0
                }}
              >
                <Icon name={iconName} size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-primary)',
                    lineHeight: 1.3
                  }}
                >
                  {toast.title}
                </div>
                {toast.message && (
                  <div
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-secondary)',
                      marginTop: '2px',
                      lineHeight: 1.3
                    }}
                  >
                    {toast.message}
                  </div>
                )}
              </div>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => removeToast(toast.id)}
                style={{
                  color: 'var(--text-muted)',
                  padding: '4px',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon name="x" size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Graceful fallback if used outside of ToastProvider
    return {
      showToast: () => {},
      showXpToast: () => {},
      showStreakToast: () => {},
      showSuccessToast: () => {},
      showErrorToast: () => {}
    };
  }
  return ctx;
};
