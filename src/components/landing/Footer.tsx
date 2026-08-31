import React from 'react';
import Link from 'next/link';
import { Target, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                <Target className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-white">
                Score<span className="text-brand-400">Edge</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              An SPPU-focused exam preparation platform combining study material, PYQ intelligence, exam-ready solved answers, and personalized 5-hour preparation plans.
            </p>
            <p className="text-[11px] text-slate-500">
              Disclaimer: ScoreEdge is an independent educational platform. Savitribai Phule Pune University (SPPU) names and trademarks belong to their respective owners.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Platform</h4>
            <ul className="space-y-2">
              <li><a href="#pyq-intelligence" className="hover:text-white transition-colors">PYQ Intelligence</a></li>
              <li><a href="#exam-mode" className="hover:text-white transition-colors">Emergency Exam Mode</a></li>
              <li><a href="#notes" className="hover:text-white transition-colors">2/5/10-Mark Solved Answers</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing & Plans</a></li>
            </ul>
          </div>

          {/* Col 3: Academic Subjects */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">SE Computer Subjects</h4>
            <ul className="space-y-2">
              <li><span className="text-slate-400">DBMS (210241)</span></li>
              <li><span className="text-slate-400">DSA (210242)</span></li>
              <li><span className="text-slate-400">OOP (210243)</span></li>
              <li><span className="text-slate-400">Operating Systems (210244)</span></li>
              <li><span className="text-slate-400">TOC (210245)</span></li>
            </ul>
          </div>

          {/* Col 4: Legal & Contact */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Legal & Support</h4>
            <ul className="space-y-2">
              <li><span className="hover:text-white cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-white cursor-pointer">Terms of Service</span></li>
              <li><span className="hover:text-white cursor-pointer">Copyright & Content Policy</span></li>
              <li><span className="hover:text-white cursor-pointer">Student Support</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <span>© {new Date().getFullYear()} ScoreEdge Exam Intelligence. All rights reserved.</span>
          <span className="flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for SPPU Engineering Students
          </span>
        </div>

      </div>
    </footer>
  );
};
