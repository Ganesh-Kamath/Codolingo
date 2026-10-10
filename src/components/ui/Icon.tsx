import React from 'react';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUpRight,
  IconAward,
  IconBarbell,
  IconBook,
  IconBrain,
  IconBrandPython,
  IconBulb,
  IconCalendar,
  IconChartBar,
  IconCheck,
  IconChecklist,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconCircle,
  IconCircleCheck,
  IconCircleDot,
  IconCircleX,
  IconClock,
  IconCode,
  IconCopy,
  IconCornerDownLeft,
  IconCpu,
  IconDownload,
  IconEye,
  IconEyeOff,
  IconFlame,
  IconFolder,
  IconGripHorizontal,
  IconGripVertical,
  IconHelpCircle,
  IconHistory,
  IconInfoCircle,
  IconListCheck,
  IconLock,
  IconLockOpen,
  IconMaximize,
  IconMinimize,
  IconMoon,
  IconPlayerPause,
  IconPlayerPlay,
  IconRefresh,
  IconRocket,
  IconSearch,
  IconSettings,
  IconShield,
  IconShieldCheck,
  IconSparkles,
  IconSun,
  IconTarget,
  IconTerminal,
  IconTerminal2,
  IconTrash,
  IconTrendingUp,
  IconTrophy,
  IconUpload,
  IconUser,
  IconVolume,
  IconVolume3,
  IconVolumeOff,
  IconWorld,
  IconTool,
  IconX
} from '@tabler/icons-react';
import { cn } from '../../lib/utils';

// Static Icon Map for maximum tree-shaking performance
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  'alert-circle': IconAlertCircle,
  'alert-triangle': IconAlertTriangle,
  'arrow-left': IconArrowLeft,
  'arrow-right': IconArrowRight,
  'arrow-up-right': IconArrowUpRight,
  'award': IconAward,
  'barbell': IconBarbell,
  'book': IconBook,
  'brain': IconBrain,
  'brand-python': IconBrandPython,
  'bulb': IconBulb,
  'calendar': IconCalendar,
  'chart-bar': IconChartBar,
  'check': IconCheck,
  'checklist': IconChecklist,
  'chevron-down': IconChevronDown,
  'chevron-left': IconChevronLeft,
  'chevron-right': IconChevronRight,
  'chevron-up': IconChevronUp,
  'circle': IconCircle,
  'circle-check': IconCircleCheck,
  'circle-dot': IconCircleDot,
  'circle-x': IconCircleX,
  'clock': IconClock,
  'code': IconCode,
  'copy': IconCopy,
  'corner-down-left': IconCornerDownLeft,
  'cpu': IconCpu,
  'download': IconDownload,
  'eye': IconEye,
  'eye-off': IconEyeOff,
  'flame': IconFlame,
  'folder': IconFolder,
  'grip-horizontal': IconGripHorizontal,
  'grip-vertical': IconGripVertical,
  'help-circle': IconHelpCircle,
  'history': IconHistory,
  'info-circle': IconInfoCircle,
  'list-check': IconListCheck,
  'lock': IconLock,
  'lock-open': IconLockOpen,
  'maximize': IconMaximize,
  'minimize': IconMinimize,
  'moon': IconMoon,
  'player-pause': IconPlayerPause,
  'player-play': IconPlayerPlay,
  'refresh': IconRefresh,
  'rocket': IconRocket,
  'search': IconSearch,
  'settings': IconSettings,
  'shield': IconShield,
  'shield-check': IconShieldCheck,
  'sparkles': IconSparkles,
  'sun': IconSun,
  'target': IconTarget,
  'terminal': IconTerminal,
  'terminal-2': IconTerminal2,
  'trash': IconTrash,
  'trending-up': IconTrendingUp,
  'trophy': IconTrophy,
  'upload': IconUpload,
  'user': IconUser,
  'volume': IconVolume,
  'volume-3': IconVolume3,
  'volume-off': IconVolumeOff,
  'world': IconWorld,
  'wrench': IconTool,
  'tool': IconTool,
  'tools': IconTool,
  'x': IconX
};

export interface IconProps extends Omit<React.ComponentPropsWithoutRef<'svg'>, 'stroke'> {
  name: string;
  size?: number | string;
  stroke?: number | string;
  className?: string;
  fill?: string;
}

export function Icon({ name, size = 20, stroke = 2, className, fill, ...props }: IconProps) {
  const normalizedKey = name.toLowerCase().trim();
  const TablerComponent = ICON_MAP[normalizedKey];

  if (!TablerComponent) {
    // Fallback icon for any unregistered icon name
    return (
      <IconCode
        size={size}
        stroke={stroke}
        className={cn('codolingo-icon-fallback', className)}
        {...props}
      />
    );
  }

  return (
    <TablerComponent
      size={size}
      stroke={stroke}
      fill={fill || 'none'}
      className={cn('codolingo-icon', className)}
      {...props}
    />
  );
}
