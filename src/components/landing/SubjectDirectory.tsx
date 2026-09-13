'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MVP_SUBJECTS } from '@/data/sppuData';
import {
  Compass,
  ArrowRight,
  BookOpen,
  Layers,
  Database,
  Cpu,
  FileCode,
  Binary,
} from 'lucide-react';

export const SubjectDirectory = () => {
  const [activeSem, setActiveSem] = useState<number | 'all'>('all');

  const subjects = MVP_SUBJECTS.filter((s) => {
    if (activeSem === 'all') return true;
    return s.semester === activeSem;
  });

  const getSubjectIcon = (code: string) => {
    switch (code) {
      case '210241':
        return Database;
      case '210242':
        return Binary;
      case '210243':
        return FileCode;
      case '210244':
        return Cpu;
      default:
        return Layers;
    }
  };

  return (
    <section id="subjects" className="py-16 md:py-24 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-semibold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Curriculum &amp; Syllabus Coverage</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              SE Computer Engineering Repository
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300 font-normal">
              Structured strictly in accordance with Savitribai Phule Pune University syllabus guidelines for 2019 Pattern and 2024 NEP schemes.
            </p>
          </div>

          {/* Semester Filter Pill Buttons */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-900 rounded-card border border-slate-200/80 dark:border-slate-800 gap-1 self-start md:self-auto">
            <button
              onClick={() => setActiveSem('all')}
              className={`px-3 py-1.5 rounded-control text-xs font-semibold transition-all ${
                activeSem === 'all'
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-xs border border-slate-200/60 dark:border-slate-700/60'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Subjects ({MVP_SUBJECTS.length})
            </button>
            <button
              onClick={() => setActiveSem(3)}
              className={`px-3 py-1.5 rounded-control text-xs font-semibold transition-all ${
                activeSem === 3
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-xs border border-slate-200/60 dark:border-slate-700/60'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Semester 3
            </button>
            <button
              onClick={() => setActiveSem(4)}
              className={`px-3 py-1.5 rounded-control text-xs font-semibold transition-all ${
                activeSem === 4
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-xs border border-slate-200/60 dark:border-slate-700/60'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Semester 4
            </button>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => {
            const Icon = getSubjectIcon(subject.code);

            return (
              <div
                key={subject.id}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center group-hover:bg-brand-50 dark:group-hover:bg-brand-950/60 group-hover:text-brand-600 transition-colors">
                      <Icon className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        Sem {subject.semester}
                      </span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/40">
                        {subject.code}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {subject.name}
                  </h3>

                  <div className="mt-3 flex items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                    <span>{subject.totalUnits} Units Complete</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {subject.totalPYQs} Solved PYQs
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-brand-600 dark:text-brand-400">
                  <span>Explore Subject PYQs</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Free Syllabus Notice Footer */}
        <div className="mt-10 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>All official SPPU curriculum PDF files &amp; question banks are 100% free forever.</span>
          </div>
          <a
            href="#pyq-intelligence"
            className="font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>Browse Full Free Archive</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </section>
  );
};
