'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BRANCHES, MVP_SUBJECTS } from '@/data/sppuData';
import { BookOpen, ChevronRight, GraduationCap, Layers, ArrowUpRight } from 'lucide-react';

export const AcademicHierarchyBrowser = () => {
  const [selectedBranch, setSelectedBranch] = useState('comp');
  const [selectedSemester, setSelectedSemester] = useState<3 | 4>(3);

  const filteredSubjects = MVP_SUBJECTS.filter(
    (s) => s.branchId === selectedBranch && s.semester === selectedSemester
  );

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            <span>Structured Academic Hierarchy</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Explore SPPU Engineering Subjects
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
            Navigate by Branch, Pattern, and Semester. Everything organized strictly according to official SPPU syllabus structures.
          </p>
        </div>

        {/* Branch Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {BRANCHES.map((branch) => {
            const isSelected = branch.id === selectedBranch;
            const isComp = branch.id === 'comp';

            return (
              <div
                key={branch.id}
                onClick={() => setSelectedBranch(branch.id)}
                className={`p-5 rounded-card border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-brand-50/50 dark:bg-brand-950/30 border-brand-500 shadow-md ring-1 ring-brand-500/30'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-lg text-slate-900 dark:text-white">{branch.code}</span>
                  {isComp ? (
                    <Badge variant="brand">Active MVP</Badge>
                  ) : (
                    <Badge variant="outline">Coming Soon</Badge>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{branch.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{branch.description}</p>
              </div>
            );
          })}
        </div>

        {/* Semester Filter Tabs */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-600" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              SE Computer (2024 Pattern)
            </span>
          </div>

          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-control border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setSelectedSemester(3)}
              className={`px-3 py-1.5 rounded-control text-xs font-bold transition-all ${
                selectedSemester === 3
                  ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Semester 3
            </button>
            <button
              onClick={() => setSelectedSemester(4)}
              className={`px-3 py-1.5 rounded-control text-xs font-bold transition-all ${
                selectedSemester === 4
                  ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Semester 4
            </button>
          </div>
        </div>

        {/* Subject Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredSubjects.length > 0 ? (
            filteredSubjects.map((subject) => (
              <Card key={subject.id} hoverable className="group">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-slate-500">CODE: {subject.code}</span>
                  <Badge variant="success">{subject.totalPYQs} PYQs Analyzed</Badge>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                  {subject.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  6 Units • PYQ Frequency Matrix • Solved Answers Included
                </p>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-brand-600 dark:text-brand-400">
                  <span>Explore Subject Intelligence</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 bg-slate-50 dark:bg-slate-800/40 rounded-card border border-dashed border-slate-300 dark:border-slate-700">
              <p className="text-sm text-slate-500">Subjects for this branch/semester are being initialized.</p>
              <button
                onClick={() => setSelectedBranch('comp')}
                className="mt-2 text-xs text-brand-600 font-semibold hover:underline"
              >
                Switch back to SE Computer
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
