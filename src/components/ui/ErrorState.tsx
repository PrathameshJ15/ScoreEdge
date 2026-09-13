import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to Load Content',
  message,
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'p-6 sm:p-8 rounded-card border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 text-center flex flex-col items-center justify-center space-y-3',
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center">
        <AlertTriangle className="w-5 h-5 stroke-[2]" />
      </div>
      <h4 className="text-sm sm:text-base font-bold text-red-900 dark:text-red-200">
        {title}
      </h4>
      <p className="text-xs text-red-700 dark:text-red-300/90 max-w-md">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-2 text-xs border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100/50"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          <span>Try Again</span>
        </Button>
      )}
    </div>
  );
};
