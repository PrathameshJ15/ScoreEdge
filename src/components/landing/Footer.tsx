'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { ScoreEdgeLogo } from '@/components/brand/ScoreEdgeLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#070d18] text-slate-400 py-12 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-10 border-b border-slate-800/80">
          
          {/* Brand & Purpose */}
          <div className="col-span-2 space-y-3">
            <ScoreEdgeLogo variant="horizontal" size="sm" href="/" />
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm font-sans pt-1">
              SPPU Exam Intelligence platform. Know what to study, when to study it, and how to prepare for Pune University engineering exams.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[11px] font-mono text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span>SPPU 2024 &amp; 2019 Curriculum Synced</span>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-2.5">
            <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-200">
              Product
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/explore" className="hover:text-teal-400 transition-colors">
                  Explore
                </Link>
              </li>
              <li>
                <Link href="/pyqs" className="hover:text-teal-400 transition-colors">
                  PYQs
                </Link>
              </li>
              <li>
                <Link href="/subjects" className="hover:text-teal-400 transition-colors">
                  Subjects
                </Link>
              </li>
              <li>
                <Link href="/exam-mode" className="hover:text-teal-400 transition-colors">
                  Exam Mode
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-teal-400 transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-2.5">
            <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-200">
              Resources
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/notes" className="hover:text-teal-400 transition-colors">
                  Notes
                </Link>
              </li>
              <li>
                <Link href="/questions" className="hover:text-teal-400 transition-colors">
                  Question Bank
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-teal-400 transition-colors">
                  Quizzes
                </Link>
              </li>
              <li>
                <Link href="/exam-mode" className="hover:text-teal-400 transition-colors">
                  Study Planner
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div className="space-y-2.5">
            <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-200">
              Company &amp; Legal
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-teal-400 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-teal-400 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-teal-400 transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-teal-400 transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Strip */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 font-mono">
          <span>&copy; {new Date().getFullYear()} ScoreEdge. SPPU Exam Intelligence.</span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
            <span>Built for SPPU Engineering Students</span>
          </span>
        </div>

      </div>
    </footer>
  );
};

