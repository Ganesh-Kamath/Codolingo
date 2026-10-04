import React from 'react';
import * as TablerIcons from '@tabler/icons-react';
import { cn } from '../../lib/utils';

interface IconProps extends Omit<React.ComponentPropsWithoutRef<'svg'>, 'stroke'> {
  name: string;
  size?: number | string;
  stroke?: number | string;
  className?: string;
}

export function Icon({ name, size = 24, stroke = 1.5, className, ...props }: IconProps) {
  // Convert name like "brain" to "IconBrain"
  const iconName = 'Icon' + name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  
  const TablerIcon = (TablerIcons as any)[iconName];

  if (!TablerIcon) {
    console.warn(`Icon "${name}" not found in @tabler/icons-react`);
    return null;
  }

  return (
    <TablerIcon
      size={size}
      stroke={stroke}
      className={cn('', className)}
      {...props}
    />
  );
}
