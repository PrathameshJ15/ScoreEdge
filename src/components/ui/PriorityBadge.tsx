import React from 'react';
import { PriorityLevel } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Flame, AlertCircle, Clock, Circle } from 'lucide-react';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  className,
  showIcon = true,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold gap-1',
    md: 'px-2.5 py-1 text-xs font-bold gap-1.5',
    lg: 'px-3 py-1.5 text-sm font-bold gap-2',
  };

  const config = {
    MUST_STUDY: {
      label: 'MUST STUDY',
      colorClass: 'bg-red-500/10 text-red-500 border-red-500/30 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/50',
      icon: Flame,
      dotColor: 'bg-red-500',
    },
    HIGH: {
      label: 'HIGH PRIORITY',
      colorClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800/50',
      icon: AlertCircle,
      dotColor: 'bg-orange-500',
    },
    MEDIUM: {
      label: 'MEDIUM PRIORITY',
      colorClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50',
      icon: Clock,
      dotColor: 'bg-amber-500',
    },
    LOW: {
      label: 'LOW PRIORITY',
      colorClass: 'bg-slate-500/10 text-slate-600 border-slate-400/30 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700/50',
      icon: Circle,
      dotColor: 'bg-slate-400',
    },
  }[priority];

  const IconComponent = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border transition-colors',
        sizeClasses[size],
        config.colorClass,
        className
      )}
    >
      {showIcon && <IconComponent className={cn(size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5')} />}
      <span>{config.label}</span>
    </span>
  );
};
