'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { BRANCHES, MVP_SUBJECTS } from '@/data/sppuData';
import { Compass, BookOpen, ArrowRight, Layers, GraduationCap } from 'lucide-react';

export default function ExplorePage() {
  const [selectedBranch, setSelectedBranch] = useState('comp');
  const [selectedPattern, setSelectedPattern] = useState('2024-pattern');
  const [selectedYear, setSelectedYear] = useState<'SE' | 'TE' | 'BE'>('SE');
  const [selectedSem, setSelectedSem] = useState<number>(3);

  const filteredSubjects = MVP_SUBJECTS.filter(
    (s) => s.branchId === selectedBranch && s.semester === selectedSem
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#fafaf9] dark:bg-[#0a0a0b]">
      <Navbar />

      <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Page Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase tracking-wider border border-brand-200 dark:border-brand-800">
            <Compass className="w-3.5 h-3.5" />
            <span>Academic Syllabus Repository</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            SPPU Curriculum & Subject Explorer
          </h1>
          <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            Select your SPPU Pattern, Engineering Branch, Academic Year, and Semester to browse verified unit breakdowns, credit structures, and exam preparation hubs.
          </p>
        </div>

        {/* Filter Controls Card (Subtle Layered Depth) */}
        <Card variant="elevated" className="p-6 sm:p-7 space-y-6 border-zinc-200/80 dark:border-zinc-800">
          
          {/* 1. Select Pattern */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
              1. SPPU Curriculum Pattern
            </label>
            <div className="flex flex-wrap gap-2.5">
              {[
                { id: '2024-pattern', label: '2024 Pattern (NEP)', badge: 'Recommended' },
                { id: '2019-pattern', label: '2019 Pattern', badge: 'Active' },
              ].map((pattern) => (
                <button
                  key={pattern.id}
                  onClick={() => setSelectedPattern(pattern.id)}
                  className={`px-4 py-2.5 rounded-control text-xs sm:text-sm font-semibold border transition-all flex items-center gap-2 ${
                    selectedPattern === pattern.id
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                  }`}
                >
                  <span>{pattern.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      selectedPattern === pattern.id
                        ? 'bg-white/20 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {pattern.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Select Branch */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
              2. Engineering Branch
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {BRANCHES.map((branch) => {
                const isSelected = branch.id === selectedBranch;
                return (
                  <button
                    key={branch.id}
                    onClick={() => setSelectedBranch(branch.id)}
                    className={`p-3.5 rounded-control text-left border transition-all ${
                      isSelected
                        ? 'bg-brand-50/80 dark:bg-brand-950/60 border-brand-600 text-zinc-900 dark:text-white font-semibold ring-1 ring-brand-500/30'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-sm">{branch.code}</span>
                      {branch.id === 'comp' ? (
                        <Badge variant="brand" size="sm">Active</Badge>
                      ) : (
                        <Badge variant="outline" size="sm">Soon</Badge>
                      )}
                    </div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 block line-clamp-1">
                      {branch.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Year & Semester */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                3. Academic Year
              </label>
              <div className="flex gap-2">
                {(['SE', 'TE', 'BE'] as const).map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`flex-1 py-2 rounded-control text-xs font-bold transition-all border ${
                      selectedYear === year
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 shadow-sm'
                        : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    {year} Engineering
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                4. Semester
              </label>
              <div className="flex gap-2">
                {[3, 4].map((sem) => (
                  <button
                    key={sem}
                    onClick={() => setSelectedSem(sem)}
                    className={`flex-1 py-2 rounded-control text-xs font-bold transition-all border ${
                      selectedSem === sem
                        ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                        : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    Semester {sem}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </Card>

        {/* Subject Results Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <span>Available Subjects ({filteredSubjects.length})</span>
            </h2>
            <span className="text-xs text-zinc-500">
              Showing {selectedYear} {selectedBranch.toUpperCase()} • Semester {selectedSem}
            </span>
          </div>

          {filteredSubjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredSubjects.map((subject) => (
                <Link key={subject.id} href={`/subject/${subject.id}`} className="block group">
                  <Card hoverable className="h-full flex flex-col justify-between border-zinc-200/80 dark:border-zinc-800">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-mono font-bold text-zinc-500">SUB CODE: {subject.code}</span>
                        <Badge variant="brand">{subject.totalPYQs} PYQs Indexed</Badge>
                      </div>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {subject.name}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                        6 Units • Syllabus Breakdown • 2/5/10-Mark Solved Answers • Emergency Exam Mode.
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-brand-600 dark:text-brand-400">
                      <span>Open Subject Study Hub</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Subjects for Selected Semester"
              description={`Curriculum for ${selectedBranch.toUpperCase()} Semester ${selectedSem} is currently in content verification. Switch back to SE Computer to view available subjects.`}
              actionLabel="Reset to SE Computer (Sem 3)"
              onAction={() => {
                setSelectedBranch('comp');
                setSelectedSem(3);
              }}
            />
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
