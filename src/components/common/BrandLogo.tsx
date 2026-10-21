import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  showSubtitle?: boolean;
  subtitle?: string;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showWordmark = true,
  showSubtitle = false,
  subtitle = 'SYSTEMS ARCHITECTURE',
  onClick,
  className = '',
  style
}) => {
  const dimensions = {
    sm: { icon: 28, font: '1rem', subFont: '9px', gap: 8 },
    md: { icon: 34, font: '1.25rem', subFont: '10px', gap: 10 },
    lg: { icon: 42, font: '1.5rem', subFont: '11px', gap: 12 },
    xl: { icon: 52, font: '1.875rem', subFont: '12px', gap: 14 }
  }[size];

  return (
    <div
      className={`vyntax-brand-lockup ${className}`}
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
      aria-label="VYNTAX"
    >
      {/* VYNTAX Ascending Syntax Prism Symbol */}
      <div
        style={{
          width: `${dimensions.icon}px`,
          height: `${dimensions.icon}px`,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        <svg
          viewBox="0 0 600 600"
          width="100%"
          height="100%"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            filter: 'drop-shadow(0 0 8px rgba(0, 245, 212, 0.4))'
          }}
        >
          <defs>
            <linearGradient id={`vyn-icon-grad-${size}`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00C9A7" />
              <stop offset="50%" stopColor="#00F5D4" />
              <stop offset="100%" stopColor="#7928CA" />
            </linearGradient>
          </defs>

          {/* Precision Pillar (Left Wing) */}
          <path d="M140 180 L230 180 L300 350 L250 430 Z" fill="#00C9A7" opacity="0.9" />

          {/* Ascending Terminal Beam (Right Wing) */}
          <path
            d="M250 430 L300 350 L410 140 L470 140 L320 460 L280 460 Z"
            fill={`url(#vyn-icon-grad-${size})`}
          />

          {/* Syntax Spark Prism Center */}
          <polygon points="300,240 340,300 300,360 260,300" fill="#7928CA" opacity="0.95" />
          <polygon points="300,265 325,300 300,335 275,300" fill="#00F5D4" />
          <circle cx="300" cy="300" r="10" fill="#FFFFFF" />

          {/* Dynamic Momentum Strokes */}
          <path d="M180 230 L220 310" stroke="#00F5D4" strokeWidth="8" strokeLinecap="round" opacity="0.6" />
          <path d="M430 210 L380 310" stroke="#9D4EDD" strokeWidth="8" strokeLinecap="round" opacity="0.7" />
        </svg>
      </div>

      {/* Wordmark and Optional Subtitle */}
      {showWordmark && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: dimensions.font,
              letterSpacing: '0.04em',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            VYNTAX
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--brand-primary)',
                marginLeft: '3px',
                boxShadow: '0 0 6px var(--brand-primary)',
                display: 'inline-block'
              }}
            />
          </span>

          {showSubtitle && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: dimensions.subFont,
                fontWeight: 600,
                letterSpacing: '0.12em',
                color: 'var(--text-secondary)',
                marginTop: '3px',
                textTransform: 'uppercase'
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
