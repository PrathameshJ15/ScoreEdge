import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { ScoreEdgeLogo } from '@/components/brand/ScoreEdgeLogo';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <ScoreEdgeLogo variant="horizontal" size="md" href="/" />
              <span className="text-[10px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                SPPU Engine
              </span>
            </div>

            <p className="text-slate-400 leading-relaxed max-w-sm text-xs">
              The high-yield examination intelligence engine for Savitribai Phule Pune University engineering students. Providing deterministic PYQ clustering, examiner-graded answer rubrics, and crash-time triage planners.
            </p>

            {/* Live Platform Operational Status */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational · SPPU 2024 NEP Synced</span>
            </div>

            <p className="text-[11px] text-slate-500 max-w-sm leading-relaxed">
              Legal Disclaimer: ScoreEdge is an independent educational technology platform and is not officially affiliated with or endorsed by Savitribai Phule Pune University (SPPU). All university names, syllabus documents, and exam references are property of their respective trademark holders.
            </p>
          </div>

          {/* Col 2: Platform Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] font-mono">Platform</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#pyq-intelligence" className="hover:text-white transition-colors">
                  PYQ Recurrence Engine
                </a>
              </li>
              <li>
                <a href="#notes" className="hover:text-white transition-colors">
                  Examiner Model Answers
                </a>
              </li>
              <li>
                <a href="#exam-mode" className="hover:text-white transition-colors">
                  Emergency Exam Simulator
                </a>
              </li>
              <li>
                <a href="#subjects" className="hover:text-white transition-colors">
                  Curriculum &amp; Syllabus
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Pricing &amp; Subject Passes
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Academic Subjects */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] font-mono">SE Computer Subjects</h4>
            <ul className="space-y-2.5 font-mono text-[11px]">
              <li>
                <span className="text-slate-300">DBMS (210241)</span>
              </li>
              <li>
                <span className="text-slate-300">DSA (210242)</span>
              </li>
              <li>
                <span className="text-slate-300">OOP (210243)</span>
              </li>
              <li>
                <span className="text-slate-300">Operating Systems (210244)</span>
              </li>
              <li>
                <span className="text-slate-300">TOC (210245)</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Legal */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] font-mono">Trust &amp; Compliance</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Academic Methodology
                </Link>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Fair Use &amp; Paper Copyright
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Student Support Desk
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
          <span>&copy; {new Date().getFullYear()} ScoreEdge Exam Intelligence. All rights reserved.</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Built for Pune University Engineering Students</span>
          </span>
        </div>

      </div>
    </footer>
  );
};

