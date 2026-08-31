'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ThemeToggle = ({ className }: { className?: string }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem('scoreedge_theme') as 'light' | 'dark' | null;
    
    if (storedTheme) {
      setTheme(storedTheme);
      if (storedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      // Default to dark mode for modern SaaS aesthetic
      document.documentElement.classList.add('dark');
      setTheme('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('scoreedge_theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!mounted) {
    return (
      <div className={cn('w-9 h-9 rounded-control bg-slate-100 dark:bg-slate-800 animate-pulse', className)} />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'p-2 rounded-control text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center border border-slate-200/80 dark:border-slate-800',
        className
      )}
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 fill-slate-700/20" />
      )}
    </button>
  );
};
