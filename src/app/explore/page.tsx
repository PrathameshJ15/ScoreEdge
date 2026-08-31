'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BRANCHES, MVP_SUBJECTS } from '@/data/sppuData';
import { Compass, GraduationCap, Layers, ArrowRight, Sparkles, BookOpen } from 'lucide-react';

export default function ExplorePage() {
  const [selectedBranch, setSelectedBranch] = useState('comp');
  const [selectedPattern, setSelectedPattern] = useState('2024-pattern');
  const [selectedYear, setSelectedYear] = useState<'SE' | 'TE' | 'BE'>('SE');
  const [selectedSem, setSelectedSem] = useState<number>(3);

  const filteredSubjects = MVP_SUBJECTS.filter(
    (s) => s.branchId === selectedBranch && s.semester === selectedSem
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10">
        
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Academic Hierarchy Explorer</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            SPPU Syllabus & Subject Repository
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-base max-w-3xl">
            Select your SPPU Pattern, Branch, Academic Year, and Semester to access verified syllabus breakdown, PYQs, and exam intelligence.
          </p>
        </div>

        {/* Filters Card */}
        <Card className="p-6 space-y-6">
          
          {/* Step 1: Select Pattern */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              1. Select SPPU Pattern
            </label>
            <div className="flex flex-wrap gap-3">
              {[
                { id: '2024-pattern', label: '2024 Pattern (Latest NEP)', badge: 'Recommended' },
                { id: '2019-pattern', label: '2019 Pattern', badge: 'Active' },
              ].map((pattern) => (
                <button
                  key={pattern.id}
                  onClick={() => setSelectedPattern(pattern.id)}
                  className={`px-4 py-2.5 rounded-control text-sm font-semibold border transition-all flex items-center gap-2 ${
                    selectedPattern === pattern.id
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <span>{pattern.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      selectedPattern === pattern.id
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {pattern.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Select Branch */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              2. Select Engineering Branch
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {BRANCHES.map((branch) => {
                const isSelected = branch.id === selectedBranch;
                return (
                  <button
                    key={branch.id}
                    onClick={() => setSelectedBranch(branch.id)}
                    className={`p-4 rounded-control text-left border transition-all ${
                      isSelected
                        ? 'bg-brand-50 dark:bg-brand-950/50 border-brand-500 text-slate-900 dark:text-white font-semibold ring-1 ring-brand-500/30'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm">{branch.code}</span>
                      {branch.id === 'comp' ? (
                        <Badge variant="brand" size="sm">Active MVP</Badge>
                      ) : (
                        <Badge variant="outline" size="sm">Coming Soon</Badge>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">{branch.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Select Academic Year & Semester */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                3. Academic Year
              </label>
              <div className="flex gap-2">
                {(['SE', 'TE', 'BE'] as const).map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`flex-1 py-2 rounded-control text-xs font-bold transition-all border ${
                      selectedYear === year
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {year} Engineering
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                4. Semester
              </label>
              <div className="flex gap-2">
                {[3, 4].map((sem) => (
                  <button
                    key={sem}
                    onClick={() => setSelectedSem(sem)}
                    className={`flex-1 py-2 rounded-control text-xs font-bold transition-all border ${
                      selectedSem === sem
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
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
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-500" />
              <span>Available Subjects ({filteredSubjects.length})</span>
            </h2>
            <span className="text-xs text-slate-500">
              Showing SE {selectedBranch.toUpperCase()} • Sem {selectedSem}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredSubjects.map((subject) => (
              <Card key={subject.id} hoverable className="flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-slate-500">SUB CODE: {subject.code}</span>
                    <Badge variant="brand">{subject.totalPYQs} PYQs Analyzed</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                    {subject.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Includes 6 Units, Unit-wise PYQ Frequency Matrix, 2/5/10-Mark Answers & Exam Mode.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Syllabus + PYQ Free
                  </span>
                  <Link href={`/subject/${subject.id}`}>
                    <Button size="sm" variant="primary" className="gap-1 text-xs">
                      <span>Open Hub</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
