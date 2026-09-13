'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, FileText, LayoutDashboard, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/explore', label: 'Subjects', icon: BookOpen },
    { href: '/pyqs', label: 'PYQs', icon: FileText },
    { href: '/exam-mode', label: 'Exam', icon: Zap },
    { href: '/dashboard', label: 'Study', icon: LayoutDashboard },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-depth-4"
    >
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center h-full py-1 text-center transition-colors relative',
                isActive
                  ? 'text-brand-600 dark:text-brand-400 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              )}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full" />
              )}
              <Icon className={cn('w-5 h-5 mb-1', isActive ? 'stroke-[2.25]' : 'stroke-[1.75]')} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
