import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
          backgroundColor: '#FFFFFF',
          color: 'var(--text-primary)',
          border: '1.5px solid var(--border-default)',
          boxShadow: 'var(--tactile-card)'
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-primary)',
          border: '1.5px solid var(--border-strong)'
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
          border: '1.5px solid transparent'
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
          padding: '8px 14px',
          fontSize: '0.8125rem',
          borderRadius: 'var(--radius-md)',
          gap: '6px'
        };
      case 'lg':
        return {
          padding: '14px 26px',
          fontSize: '1rem',
          borderRadius: 'var(--radius-lg)',
          gap: '10px'
        };
      case 'md':
      default:
        return {
          padding: '10px 18px',
          fontSize: '0.875rem',
          borderRadius: 'var(--radius-md)',
          gap: '8px'
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
        opacity: disabled ? 0.5 : 1,
        width: fullWidth ? '100%' : undefined,
        ...getVariantStyles(),
        ...getSizeStyles()
      }}
      className={`tactile-btn ${className}`}
      {...props}
    >
      {isLoading ? (
        <span
          style={{
            width: '14px',
            height: '14px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#FFFFFF',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite'
          }}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <span>{children}</span>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </button>
  );
};
