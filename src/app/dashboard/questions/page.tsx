'use client';

import React, { useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/Button';
import { DBMS_PYQS, MVP_SUBJECTS, DashboardQuestionItem } from '@/data/sppuData';
import {
  HelpCircle,
  Search,
  CheckCircle2,
  Square,
  Award,
  Filter,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export default function DashboardQuestionsPage() {
  const [selectedSubjectId, setSelectedSubjectId] = useState('dbms');
  const [selectedMarks, setSelectedMarks] = useState<number | 'all'>('all');
  const [selectedUnit, setSelectedUnit] = useState<number | 'all'>('all');
  const [practicedQuestionIds, setPracticedQuestionIds] = useState<string[]>(['dbms-pyq-1']);
  const [expandedAnswerId, setExpandedAnswerId] = useState<string | null>('dbms-pyq-1');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredQuestions = DBMS_PYQS.filter((q: DashboardQuestionItem) => {
    const matchesMarks = selectedMarks === 'all' || q.marks === selectedMarks;
    const matchesUnit = selectedUnit === 'all' || q.unitNumber === selectedUnit;
    const matchesSearch =
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.conceptCluster.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMarks && matchesUnit && matchesSearch;
  });

  const togglePracticed = (id: string) => {
    if (practicedQuestionIds.includes(id)) {
      setPracticedQuestionIds(practicedQuestionIds.filter((item) => item !== id));
    } else {
      setPracticedQuestionIds([...practicedQuestionIds, id]);
    }
  };

  return (
    <DashboardShell
      activeSubject={selectedSubjectId}
      onSubjectChange={(id) => setSelectedSubjectId(id)}
    >
      <div className="space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/60 text-teal-800 dark:text-teal-300 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Student Question Bank (QB)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Question Bank &amp; Solved Rubrics
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Over 2,400+ indexed SPPU engineering exam questions with examiner-graded answers and marking schemes.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span>{practicedQuestionIds.length} of {DBMS_PYQS.length} Practiced</span>
          </div>
        </div>

        {/* Subject Filter Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {MVP_SUBJECTS.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubjectId(sub.id)}
              className={`px-3.5 py-1.5 rounded-control text-xs font-mono font-semibold transition-all shrink-0 ${
                selectedSubjectId === sub.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {sub.shortName} ({sub.code})
            </button>
          ))}
        </div>

        {/* Multi-Filter Strip */}
        <div className="p-4 rounded-card bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search question keywords (e.g. 3NF, BCNF, ACID)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs pl-9 pr-4 py-2 rounded-control border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Marks Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs font-mono">
            <span className="text-slate-400 text-[11px] mr-1 hidden sm:inline">Marks:</span>
            <button
              onClick={() => setSelectedMarks('all')}
              className={`px-2.5 py-1.5 rounded-control transition-colors ${
                selectedMarks === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              All
            </button>
            {[2, 5, 8, 10].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMarks(m)}
                className={`px-2.5 py-1.5 rounded-control transition-colors ${
                  selectedMarks === m
                    ? 'bg-teal-600 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {m}M
              </button>
            ))}
          </div>

        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((q: DashboardQuestionItem) => {
              const isPracticed = practicedQuestionIds.includes(q.id);
              const isExpanded = expandedAnswerId === q.id;

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-card border transition-all ${
                    isExpanded
                      ? 'bg-white dark:bg-slate-900 border-teal-500/80 shadow-md ring-1 ring-teal-500/20'
                      : 'bg-white dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-500 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold border border-teal-200/60 dark:border-teal-800">
                          Unit {q.unitNumber}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{q.conceptCluster}</span>
                        <span>•</span>
                        <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1 font-semibold">
                          <TrendingUp className="w-3 h-3" />
                          Repeated {q.frequencyCount} Times
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed pt-1">
                        &quot;{q.text}&quot;
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                        {q.marks} Marks
                      </span>
                      <button
                        type="button"
                        onClick={() => togglePracticed(q.id)}
                        className={`px-3 py-1 rounded-control text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors ${
                          isPracticed
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 ${isPracticed ? 'text-white' : 'text-slate-400'}`} />
                        <span>{isPracticed ? 'Practiced' : 'Mark Practiced'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Appearance Footnote */}
                  <div className="text-[11px] font-mono text-slate-500 pt-1 flex items-center justify-between">
                    <span>Asked in SPPU: {q.examYears.join(', ')}</span>
                    <button
                      type="button"
                      onClick={() => setExpandedAnswerId(isExpanded ? null : q.id)}
                      className="text-teal-600 dark:text-teal-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Hide Model Answer' : 'View Model Answer Rubric'}</span>
                      <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                  </div>

                  {/* Evaluator Model Answer Viewer */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-control">
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                        <span className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
                          <Award className="w-4 h-4" />
                          Official Evaluator Marking Scheme ({q.marks} Marks Target)
                        </span>
                        <span className="text-[10px] text-slate-400">Verified by SPPU Senior Faculty</span>
                      </div>

                      <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-sans">
                        <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                          <div className="font-bold text-slate-900 dark:text-white mb-1">
                            Point 1: Formal Definition &amp; Criteria (2 Marks)
                          </div>
                          <p className="text-slate-600 dark:text-slate-400">
                            Clear statement of the primary concept, functional dependencies, and lossless join property.
                          </p>
                        </div>
                        <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                          <div className="font-bold text-slate-900 dark:text-white mb-1">
                            Point 2: Comparative Schema or Diagram (3 Marks)
                          </div>
                          <p className="text-slate-600 dark:text-slate-400">
                            Structured comparison table or state diagram illustrating the execution steps and constraint validations.
                          </p>
                        </div>
                        <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                          <div className="font-bold text-slate-900 dark:text-white mb-1">
                            Point 3: Numerical or Practical Example (3 Marks)
                          </div>
                          <p className="text-slate-600 dark:text-slate-400">
                            Step-by-step resolution of a representative relation schema R(A,B,C,D) with closure calculation.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              );
            })
          ) : (
            <div className="p-8 rounded-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
              No questions found matching your filter criteria.
            </div>
          )}
        </div>

      </div>
    </DashboardShell>
  );
}
