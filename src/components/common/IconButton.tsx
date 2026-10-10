import React from 'react';
import { Icon } from '../ui/Icon';
import { Tooltip } from './Tooltip';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  name: string;
  label: string; // Mandatory for accessibility (aria-label)
  tooltip?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  iconSize?: number;
  badge?: number | string;
  isLoading?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  name,
  label,
  tooltip,
  variant = 'secondary',
  size = 'md',
  iconSize,
  badge,
  isLoading = false,
  disabled,
  className = '',
  style,
  onClick,
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
      case 'danger':
        return {
          backgroundColor: 'var(--error-solid)',
          color: '#FFFFFF',
          border: '1.5px solid var(--error-bevel)',
          boxShadow: 'var(--tactile-danger)'
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
          border: '1.5px solid transparent'
        };
      case 'subtle':
        return {
          backgroundColor: 'var(--bg-surface-subtle)',
          color: 'var(--text-primary)',
          border: '1.5px solid var(--border-default)',
          boxShadow: '0 2px 0 var(--border-default)'
        };
      case 'secondary':
      default:
        return {
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          border: '1.5px solid var(--border-default)',
          boxShadow: 'var(--tactile-card)'
        };
    }
  };

  const getSizeStyles = (): { dimension: string; defaultIconSize: number; padding: string } => {
    switch (size) {
      case 'xs':
        return { dimension: '28px', defaultIconSize: 14, padding: '0' };
      case 'sm':
        return { dimension: '34px', defaultIconSize: 16, padding: '0' };
      case 'lg':
        return { dimension: '48px', defaultIconSize: 22, padding: '0' };
      case 'md':
      default:
        return { dimension: '40px', defaultIconSize: 18, padding: '0' };
    }
  };

  const sizeMetrics = getSizeStyles();
  const effectiveIconSize = iconSize || sizeMetrics.defaultIconSize;

  const buttonElement = (
    <button
      type="button"
      aria-label={label}
      disabled={disabled || isLoading}
      onClick={onClick}
      style={{
        width: sizeMetrics.dimension,
        height: sizeMetrics.dimension,
        padding: sizeMetrics.padding,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-md)',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        position: 'relative',
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast), background-color var(--transition-fast)',
        userSelect: 'none',
        flexShrink: 0,
        ...getVariantStyles(),
        ...style
      }}
      className={`tactile-btn ${className}`}
      {...props}
    >
      {isLoading ? (
        <span
          style={{
            width: `${effectiveIconSize}px`,
            height: `${effectiveIconSize}px`,
            border: '2px solid rgba(125,125,125,0.2)',
            borderTopColor: 'currentColor',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite'
          }}
        />
      ) : (
        <Icon name={name} size={effectiveIconSize} />
      )}

      {badge !== undefined && (
        <span
          style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            backgroundColor: 'var(--error-solid)',
            color: '#FFFFFF',
            fontSize: 'var(--text-xs)',
            fontWeight: 800,
            padding: '1px 5px',
            borderRadius: 'var(--radius-full)',
            border: '1.5px solid var(--bg-surface)',
            lineHeight: 1.2
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );

  if (tooltip) {
    return <Tooltip content={tooltip}>{buttonElement}</Tooltip>;
  }

  return buttonElement;
};
