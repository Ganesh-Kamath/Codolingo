import React from 'react';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = ''
}) => {
  if (!content) return <>{children}</>;

  const positionClass = position === 'bottom' ? 'codolingo-tooltip-bottom' : 'codolingo-tooltip-top';

  return (
    <div className={`codolingo-tooltip-wrapper ${className}`}>
      {children}
      <div
        role="tooltip"
        className={`codolingo-tooltip-content ${positionClass}`}
      >
        {content}
      </div>
    </div>
  );
};
