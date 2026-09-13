'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
  Compass,
  Menu,
  X,
  Search,
  BookOpen,
  FileText,
  Clock,
  Sparkles,
  HelpCircle,
  Award,
  ChevronDown,
  Layers,
  ArrowRight,
} from 'lucide-react';

import { ScoreEdgeLogo } from '@/components/brand/ScoreEdgeLogo';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Subjects', href: '/explore' },
    { label: 'PYQs', href: '/pyqs' },
    { label: 'Notes', href: '/notes' },
    { label: 'QB', href: '/questions' },
    { label: 'QP', href: '/pyqs' },
    { label: 'Exam Mode', href: '/exam-mode' },
    { label: 'Ask AI', href: '/ai' },
    { label: 'Pricing', href: '/pricing' },
  ];

  return (
    <>
      {/* Top Subtle SPPU Ticker */}
      <div className="bg-[#0f172a] text-slate-200 text-xs py-1.5 px-4 border-b border-slate-800 text-center font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11.5px]">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold font-mono text-[10.5px]">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              SPPU 2024 &amp; 2019 PATTERN
            </span>
            <span className="hidden sm:inline text-slate-300">
              Exam Intelligence &amp; Verified Solved Answers for Engineering Undergraduates
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-slate-400 text-xs font-mono">
            <span>SE Computer Engineering</span>
            <span>•</span>
            <Link href="/explore" className="text-teal-400 hover:text-teal-300 font-semibold">
              Browse Syllabus &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header className="sticky top-0 z-50 bg-[#faf9f5]/90 dark:bg-[#0a1120]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <ScoreEdgeLogo variant="horizontal" size="md" href="/" />

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-5 text-xs font-semibold text-slate-600 dark:text-slate-300">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="hover:text-teal-700 dark:hover:text-teal-300 py-1 transition-colors relative"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <Link
              href="/search"
              className="p-2 rounded-control text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              title="Search subjects, topics, PYQs..."
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </Link>

            <ThemeToggle />

            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-semibold text-[#0f172a] dark:text-slate-200"
              >
                Login
              </Button>
            </Link>

            <Link href="/signup">
              <Button
                size="sm"
                className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold px-4 shadow-sm"
              >
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger & Actions */}
          <div className="flex items-center gap-2 xl:hidden">
            <Link
              href="/search"
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-control"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </Link>
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-control transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-b border-slate-200 dark:border-slate-800 bg-[#faf9f5] dark:bg-[#0a1120] px-4 pt-3 pb-6 space-y-2 shadow-lg">
            <div className="px-2 py-1 text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Navigation
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-control text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full text-xs">
                  Login
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
