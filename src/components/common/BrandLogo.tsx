import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showWordmark = true,
  onClick,
  className = '',
  style
}) => {
  const dimensions = {
    sm: { icon: 26, radius: 6, font: '0.9375rem', gap: 8, stroke: 2 },
    md: { icon: 32, radius: 8, font: '1.0625rem', gap: 10, stroke: 2.2 },
    lg: { icon: 40, radius: 10, font: '1.35rem', gap: 12, stroke: 2.5 }
  }[size];

  const content = (
    <div
      className={`brand-logo-lockup ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${dimensions.gap}px`,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        ...style
      }}
    >
      <div
        style={{
          width: `${dimensions.icon}px`,
          height: `${dimensions.icon}px`,
          borderRadius: `${dimensions.radius}px`,
          backgroundColor: 'var(--brand-primary)',
          border: '1px solid var(--brand-bevel)',
          boxShadow: 'var(--shadow-xs)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
        aria-hidden="true"
      >
        <svg
          width={dimensions.icon * 0.65}
          height={dimensions.icon * 0.65}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 6L13 12L6 18"
            stroke="#FFFFFF"
            strokeWidth={dimensions.stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="14"
            y1="18"
            x2="19"
            y2="18"
            stroke="#FFFFFF"
            strokeWidth={dimensions.stroke}
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showWordmark && (
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: dimensions.font,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            lineHeight: 1
          }}
        >
          Codolingo
        </span>
      )}
    </div>
  );

  return content;
};
