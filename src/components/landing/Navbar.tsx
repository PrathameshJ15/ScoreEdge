'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ScoreEdgeLogo } from '@/components/brand/ScoreEdgeLogo';
import { useAuth } from '@/context/AuthContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const navLinks = [
    { label: 'Explore', href: '/explore' },
    { label: 'PYQs', href: '/pyqs' },
    { label: 'Subjects', href: '/subjects' },
    { label: 'Exam Mode', href: '/exam-mode' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#faf9f5]/90 dark:bg-[#070d18]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <ScoreEdgeLogo variant="horizontal" size="md" href="/" />
        </div>

        {/* Minimal Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
          {navLinks.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`px-3 py-1.5 rounded-control transition-colors relative ${
                  isActive
                    ? 'text-teal-700 dark:text-teal-400 font-semibold bg-teal-50/80 dark:bg-teal-950/40'
                    : 'hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="hidden sm:flex items-center gap-2.5 shrink-0">
          <Link
            href="/search"
            className="p-2 rounded-control text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            title="Search topics, questions, syllabus"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </Link>

          <ThemeToggle />

          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button
                size="sm"
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-3.5 shadow-xs gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white"
                >
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-4 shadow-sm"
                >
                  Start Preparing
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger & Controls */}
        <div className="flex items-center gap-1.5 sm:hidden">
          <Link
            href="/search"
            className="p-2 rounded-control text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </Link>
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-control text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-slate-200 dark:border-slate-800 bg-[#faf9f5] dark:bg-[#070d18] px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-control text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full text-xs font-semibold">
                    Login
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold">
                    Start Preparing
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
