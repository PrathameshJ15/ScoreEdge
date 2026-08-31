'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Target, Menu, X, Sparkles, BookOpen, Clock, Award, ChevronDown } from 'lucide-react';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-brand-600 dark:bg-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Target className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
              Score<span className="text-brand-600 dark:text-brand-400">Edge</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-semibold border border-brand-200 dark:border-brand-800">SPPU</span>
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
          <div className="relative">
            <button
              onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
              className="flex items-center gap-1 hover:text-brand-600 dark:hover:text-brand-400 py-2 transition-colors"
            >
              <span>SE Computer</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {branchDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card shadow-lg p-2 z-50">
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Branch</div>
                <button className="w-full text-left px-3 py-2 text-xs font-semibold rounded-control bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-between">
                  <span>SE Computer Engg</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </button>
                <button className="w-full text-left px-3 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-control mt-1">
                  SE IT Engineering (Coming Soon)
                </button>
                <button className="w-full text-left px-3 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-control mt-1">
                  SE AI & DS (Coming Soon)
                </button>
              </div>
            )}
          </div>
          <a href="#pyq-intelligence" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span>PYQ Intelligence</span>
          </a>
          <a href="#exam-mode" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Exam Mode</span>
          </a>
          <a href="#notes" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span>Solved Answers</span>
          </a>
          <a href="#pricing" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-500" />
            <span>Pricing</span>
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="#pricing">
            <Button variant="outline" size="sm">
              Log In
            </Button>
          </Link>
          <Link href="#pyq-intelligence">
            <Button variant="primary" size="sm" className="gap-1.5">
              <span>Start Free</span>
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-control"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-3 pb-6 space-y-3">
          <a
            href="#pyq-intelligence"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 dark:text-slate-200"
          >
            PYQ Intelligence
          </a>
          <a
            href="#exam-mode"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 dark:text-slate-200"
          >
            Exam Mode
          </a>
          <a
            href="#notes"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 dark:text-slate-200"
          >
            Solved Answers
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 dark:text-slate-200"
          >
            Pricing & Plans
          </a>
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <Link href="#pricing" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full">
                Log In
              </Button>
            </Link>
            <Link href="#pyq-intelligence" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" className="w-full">
                Start Preparing Free
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
