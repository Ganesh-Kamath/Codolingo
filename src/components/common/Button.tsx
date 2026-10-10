import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  style,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--brand-primary)',
          color: '#FFFFFF',
          border: '1.5px solid var(--brand-bevel)',
          boxShadow: 'var(--tactile-primary)'
        };
      case 'secondary':
        return {
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          border: '1.5px solid var(--border-default)',
          boxShadow: 'var(--tactile-card)'
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-primary)',
          border: '1.5px solid var(--border-strong)',
          boxShadow: 'none'
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
          border: '1.5px solid transparent',
          boxShadow: 'none'
        };
      case 'success':
        return {
          backgroundColor: 'var(--secondary-solid)',
          color: '#FFFFFF',
          border: '1.5px solid var(--secondary-bevel)',
          boxShadow: 'var(--tactile-secondary)'
        };
      case 'danger':
        return {
          backgroundColor: 'var(--error-solid)',
          color: '#FFFFFF',
          border: '1.5px solid var(--error-bevel)',
          boxShadow: 'var(--tactile-danger)'
        };
      default:
        return {};
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return {
          padding: 'var(--space-2) var(--space-3)',
          fontSize: 'var(--text-sm)',
          borderRadius: 'var(--radius-md)',
          gap: 'var(--space-2)',
          minHeight: '34px'
        };
      case 'lg':
        return {
          padding: 'var(--space-3) var(--space-6)',
          fontSize: 'var(--text-md)',
          borderRadius: 'var(--radius-lg)',
          gap: 'var(--space-3)',
          minHeight: '48px'
        };
      case 'md':
      default:
        return {
          padding: 'var(--space-2) var(--space-4)',
          fontSize: 'var(--text-base)',
          borderRadius: 'var(--radius-md)',
          gap: 'var(--space-2)',
          minHeight: '40px'
        };
    }
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        letterSpacing: '-0.01em',
        userSelect: 'none',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        width: fullWidth ? '100%' : undefined,
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast), background-color var(--transition-fast)',
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style
      }}
      className={`tactile-btn ${className}`}
      {...props}
    >
      {isLoading ? (
        <span
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: 'currentColor',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite'
          }}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
        </>
      )}
    </button>
  );
};
