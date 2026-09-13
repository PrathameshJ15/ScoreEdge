'use client';

import React from 'react';
import Link from 'next/link';
import { StudyMaterialHeroBanner } from '@/components/ai/StudyMaterialHeroBanner';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const StudyMaterialSection: React.FC = () => {
  return (
    <section className="py-12 md:py-16 bg-[#faf9f5] dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold shadow-xs mb-3">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>ACADEMIC AI WORKSPACE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] dark:text-white tracking-tight">
              Grounded AI For Your Study Material
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Combine your own college notes, PPTs, and PDFs with verified SPPU question paper intelligence.
            </p>
          </div>

          <Link href="/ai">
            <Button className="bg-teal-700 hover:bg-teal-800 text-white gap-2 text-xs sm:text-sm font-semibold">
              <span>Open AI Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* The Exact Banner Component */}
        <StudyMaterialHeroBanner />
      </div>
    </section>
  );
};

