import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'brand' | 'success' | 'warning' | 'danger' | 'outline' | 'amber';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full transition-colors';

  const variants = {
    default: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    brand: 'bg-brand-500/10 text-brand-600 border border-brand-500/20 dark:bg-brand-950/40 dark:text-brand-300 dark:border-brand-800/40',
    success: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40',
    warning: 'bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40',
    amber: 'bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40',
    danger: 'bg-red-500/10 text-red-600 border border-red-500/20 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/40',
    outline: 'border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};
