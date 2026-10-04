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
          border: '1px solid var(--brand-hover)',
          boxShadow: '0 1px 2px rgba(16, 185, 129, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
        };
      case 'secondary':
        return {
          backgroundColor: '#FFFFFF',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-xs)'
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-default)'
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
          border: '1px solid transparent'
        };
      case 'success':
        return {
          backgroundColor: 'var(--success-solid)',
          color: '#FFFFFF',
          border: '1px solid var(--success-solid)',
          boxShadow: '0 1px 2px rgba(16, 185, 129, 0.2)'
        };
      case 'danger':
        return {
          backgroundColor: '#EF4444',
          color: '#FFFFFF',
          border: '1px solid #DC2626'
        };
      default:
        return {};
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return {
          padding: '6px 12px',
          fontSize: '0.8125rem',
          borderRadius: 'var(--radius-sm)',
          gap: '6px'
        };
      case 'lg':
        return {
          padding: '12px 22px',
          fontSize: '1rem',
          borderRadius: 'var(--radius-md)',
          gap: '10px'
        };
      case 'md':
      default:
        return {
          padding: '8px 16px',
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
        fontWeight: 600,
        letterSpacing: '-0.01em',
        transition: 'all var(--transition-fast)',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        width: fullWidth ? '100%' : undefined,
        ...getVariantStyles(),
        ...getSizeStyles()
      }}
      className={className}
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
