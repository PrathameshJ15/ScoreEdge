'use client';

import React from 'react';
import Link from 'next/link';
import { MVP_SUBJECTS } from '@/data/sppuData';
import { Button } from '@/components/ui/Button';
import { BookOpen, HelpCircle, FileText, ArrowRight, Sparkles, Layers } from 'lucide-react';

export const PopularSubjects = () => {
  return (
    <section id="subjects" className="py-16 md:py-24 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold">
              <Layers className="w-3.5 h-3.5 text-teal-600" />
              <span>SPPU SE Computer Engineering · 2024 Pattern</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] dark:text-white tracking-tight">
              Popular &amp; High-Yield Subjects
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300">
              Every subject includes verified syllabus notes, high-yield Question Bank clusters, examiner answer rubrics, and solved past papers.
            </p>
          </div>

          <Link href="/subjects">
            <Button variant="outline" className="gap-2 border-slate-300 dark:border-slate-700 text-[#0f172a] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold">
              <span>View All Subjects</span>
              <ArrowRight className="w-4 h-4 text-teal-600" />
            </Button>
          </Link>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MVP_SUBJECTS.map((subject) => (
            <div
              key={subject.id}
              className="group flex flex-col justify-between p-6 rounded-2xl bg-[#faf9f5] dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-lg hover:shadow-teal-900/5 transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-teal-700 text-white font-bold flex items-center justify-center text-sm shadow-sm group-hover:scale-105 transition-transform">
                    {subject.shortName}
                  </div>
                  <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                    Sub Code: {subject.code}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#0f172a] dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                    {subject.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Semester {subject.semester} • {subject.year} Computer Engineering
                  </p>
                </div>

                {/* Badges / Stats */}
                <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
                    <div className="font-bold text-[#0f172a] dark:text-white">{subject.totalUnits} Units</div>
                    <div className="text-[10px] text-slate-500">Syllabus</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
                    <div className="font-bold text-teal-700 dark:text-teal-400 font-mono">120+ QB</div>
                    <div className="text-[10px] text-slate-500">Questions</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
                    <div className="font-bold text-slate-800 dark:text-slate-200 font-mono">{subject.totalPYQs} Solved</div>
                    <div className="text-[10px] text-slate-500">Past PYQs</div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-4 border-t border-slate-200/70 dark:border-slate-700/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  100% Free Access
                </span>
                <Link href={`/subjects/${subject.id}`}>
                  <Button size="sm" className="bg-teal-700 hover:bg-teal-800 text-white text-xs gap-1.5">
                    <span>Explore Subject</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
