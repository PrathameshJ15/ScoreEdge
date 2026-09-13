'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/Button';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { NoteItem } from '@/lib/types';
import { 
  BRANCHES, 
  MVP_SUBJECTS, 
  DBMS_UNITS, 
  DBMS_QUESTION_CLUSTERS, 
  DBMS_NOTES,
  DBMS_PYQS,
  DashboardQuestionItem
} from '@/data/sppuData';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Layers,
  FileText,
  HelpCircle,
  Award,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Target,
  BarChart3,
  Calendar,
  Filter,
  CheckSquare,
  Square,
  Zap,
} from 'lucide-react';

export default function DashboardSubjectsPage() {
  const searchParams = useSearchParams();
  const initialSubjectParam = searchParams.get('subject');

  // Step selection state
  const [selectedBranchId, setSelectedBranchId] = useState<string>('comp');
  const [selectedSemester, setSelectedSemester] = useState<number>(3);
  const [selectedPattern, setSelectedPattern] = useState<string>('2024-pattern');
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(initialSubjectParam || null);
  
  // Workspace active tab
  const [workspaceTab, setWorkspaceTab] = useState<'units' | 'priority' | 'notes' | 'pyqs' | 'exam-mode'>('units');
  const [completedUnitIds, setCompletedUnitIds] = useState<string[]>(['dbms-u1', 'dbms-u2', 'dbms-u3']);

  useEffect(() => {
    if (initialSubjectParam) {
      setActiveSubjectId(initialSubjectParam);
    }
  }, [initialSubjectParam]);

  // Filter subjects based on branch, semester, and pattern
  const availableSubjects = MVP_SUBJECTS.filter((sub) => {
    return (
      sub.branchId === selectedBranchId &&
      sub.semester === selectedSemester &&
      sub.patternId === selectedPattern
    );
  });

  const activeSubject = MVP_SUBJECTS.find((s) => s.id === activeSubjectId) || null;

  const toggleUnitCompleted = (unitId: string) => {
    if (completedUnitIds.includes(unitId)) {
      setCompletedUnitIds(completedUnitIds.filter((id) => id !== unitId));
    } else {
      setCompletedUnitIds([...completedUnitIds, unitId]);
    }
  };

  const readinessScore = activeSubject
    ? Math.round((completedUnitIds.length / DBMS_UNITS.length) * 100)
    : 78;

  return (
    <DashboardShell
      activeSubject={activeSubjectId || 'dbms'}
      onSubjectChange={(subId) => setActiveSubjectId(subId)}
    >
      {/* If No Subject is Active: Show Step-by-Step Subject Explorer */}
      {!activeSubject ? (
        <div className="space-y-8">
          
          {/* Header */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/60 text-teal-800 dark:text-teal-300 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Academic Curriculum Explorer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Select Your Subject
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Follow the steps below to open your subject workspace with syllabus breakdown, high-yield notes, and PYQ clusters.
            </p>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-3 gap-3 p-1.5 rounded-card bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 font-mono text-xs">
            <div className="flex items-center gap-2.5 p-2.5 rounded-control bg-teal-50 dark:bg-teal-950/70 border border-teal-200/60 dark:border-teal-800 text-teal-900 dark:text-teal-200 font-bold">
              <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">1</span>
              <span>Branch</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-control bg-teal-50 dark:bg-teal-950/70 border border-teal-200/60 dark:border-teal-800 text-teal-900 dark:text-teal-200 font-bold">
              <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">2</span>
              <span>Semester &amp; Pattern</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-control bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
              <span className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[10px]">3</span>
              <span>Subject</span>
            </div>
          </div>

          {/* Step 1: Branch Selection */}
          <div className="space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Step 1: Choose Engineering Branch
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {BRANCHES.map((branch) => {
                const isSelected = selectedBranchId === branch.id;

                return (
                  <div
                    key={branch.id}
                    onClick={() => setSelectedBranchId(branch.id)}
                    className={`p-4 rounded-card border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-teal-50/50 dark:bg-teal-950/40 border-teal-600 dark:border-teal-500 shadow-sm ring-1 ring-teal-500/20'
                        : 'bg-white dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {branch.code}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {branch.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                        {branch.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-mono text-teal-600 dark:text-teal-400 font-semibold">
                      {branch.id === 'comp' ? '5 Subjects Ready' : 'Curriculum Synced'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Semester & Pattern Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Semester Pills */}
            <div className="p-5 rounded-card bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Step 2A: Academic Semester
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { sem: 3, label: 'SE — Semester 3', tag: 'Current In-Sem' },
                  { sem: 4, label: 'SE — Semester 4', tag: 'Even Semester' },
                  { sem: 5, label: 'TE — Semester 5', tag: 'Third Year' },
                  { sem: 6, label: 'TE — Semester 6', tag: 'Third Year' },
                ].map((item) => (
                  <button
                    key={item.sem}
                    type="button"
                    onClick={() => setSelectedSemester(item.sem)}
                    className={`p-3 rounded-control border text-left transition-all ${
                      selectedSemester === item.sem
                        ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-600 dark:border-teal-500 text-teal-900 dark:text-teal-200 font-bold'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">{item.tag}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Pattern Switcher */}
            <div className="p-5 rounded-card bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Step 2B: Syllabus Pattern
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: '2024-pattern', label: 'SPPU 2024 NEP', badge: 'Active' },
                  { id: '2019-pattern', label: 'SPPU 2019 Pattern', badge: 'Legacy' },
                ].map((pattern) => (
                  <button
                    key={pattern.id}
                    type="button"
                    onClick={() => setSelectedPattern(pattern.id)}
                    className={`p-3 rounded-control border text-left transition-all ${
                      selectedPattern === pattern.id
                        ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-600 dark:border-teal-500 text-teal-900 dark:text-teal-200 font-bold'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{pattern.label}</span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {pattern.badge}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">Pune University NEP Syllabus</div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Step 3: Available Subjects Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Step 3: Available Subjects ({availableSubjects.length})
              </h2>
              <span className="text-xs font-mono text-teal-600 dark:text-teal-400">
                Click any subject to open its workspace
              </span>
            </div>

            {availableSubjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {availableSubjects.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => setActiveSubjectId(sub.id)}
                    className="p-5 rounded-card bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-teal-500 dark:hover:border-teal-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {sub.code}
                        </span>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                          In-Sem &amp; End-Sem Ready
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {sub.name}
                      </h3>
                      <div className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                        {sub.shortName} • 4 Credits
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-mono text-slate-500">
                        <div>
                          <span className="text-slate-400 block text-[10px]">SYLLABUS UNITS</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{sub.totalUnits} Units</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">ANALYZED PYQS</span>
                          <span className="font-bold text-teal-600 dark:text-teal-400">{sub.totalPYQs} Questions</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-3">
                      <Button
                        size="sm"
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-2 gap-1.5"
                      >
                        <span>Open Subject Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No subjects indexed for this specific filter combination yet.
                </p>
                <p className="text-xs text-slate-500">
                  Switch to SE Semester 3 Computer Engineering (2024 Pattern) to explore DBMS, DSA, OOP, OS, and TOC.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedBranchId('comp');
                    setSelectedSemester(3);
                    setSelectedPattern('2024-pattern');
                  }}
                  className="mt-2 text-xs"
                >
                  Reset to SE Computer Sem 3
                </Button>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* ========================================================================= */
        /* IN-DASHBOARD SUBJECT WORKSPACE                                           */
        /* Displayed right there inside the student dashboard!                      */
        /* ========================================================================= */
        <div className="space-y-6">
          
          {/* Breadcrumb & Switcher Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <button
                onClick={() => setActiveSubjectId(null)}
                className="flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:underline font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Subjects</span>
              </button>
              <span>/</span>
              <span className="text-slate-900 dark:text-white font-bold">{activeSubject.name}</span>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveSubjectId(null)}
              className="text-xs self-start sm:self-auto gap-1.5"
            >
              <span>Change Subject</span>
            </Button>
          </div>

          {/* Subject Hero Card */}
          <div className="p-6 rounded-card bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 font-mono font-bold text-xs border border-teal-200 dark:border-teal-800">
                  {activeSubject.code}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  SPPU 2024 NEP Pattern • Computer Engineering
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                {activeSubject.name} ({activeSubject.shortName})
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
                Comprehensive exam workspace covering in-sem midterms (30 Marks), end-sem finals (70 Marks), examiner model answers, and recurrence intelligence.
              </p>
            </div>

            {/* Subject Readiness Gauge */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-control border border-slate-200/80 dark:border-slate-800 min-w-[200px] shrink-0 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Subject Readiness</span>
                <span className="font-bold text-teal-600 dark:text-teal-400">{readinessScore}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-600 h-full rounded-full transition-all duration-300" style={{ width: `${readinessScore}%` }} />
              </div>
              <div className="text-[10px] font-mono text-slate-400 text-right">
                {completedUnitIds.length} of {DBMS_UNITS.length} Units Mastered
              </div>
            </div>
          </div>

          {/* Workspace Tabs */}
          <div className="flex items-center gap-1.5 border-b border-slate-200/80 dark:border-slate-800 overflow-x-auto no-scrollbar">
            {[
              { id: 'units', label: 'Units & Syllabus', icon: Layers },
              { id: 'priority', label: 'Topic Priority Matrix', icon: TrendingUp },
              { id: 'notes', label: 'High-Yield Notes', icon: FileText },
              { id: 'pyqs', label: 'Solved PYQs & Clusters', icon: Award },
              { id: 'exam-mode', label: 'Crash Exam Mode', icon: Clock },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = workspaceTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setWorkspaceTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all shrink-0 ${
                    isActive
                      ? 'border-teal-600 text-teal-700 dark:text-teal-400 bg-teal-50/40 dark:bg-teal-950/30'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ===================================================================== */}
          {/* TAB 1: UNITS & SYLLABUS                                               */}
          {/* ===================================================================== */}
          {workspaceTab === 'units' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                <span>6 Standard SPPU Units • Click checkbox to update readiness</span>
                <span>Weightage: 100 Marks</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DBMS_UNITS.map((unit) => {
                  const isCompleted = completedUnitIds.includes(unit.id);

                  return (
                    <div
                      key={unit.id}
                      className={`p-5 rounded-card border transition-all ${
                        isCompleted
                          ? 'bg-teal-50/30 dark:bg-teal-950/20 border-teal-300 dark:border-teal-800/80'
                          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                            Unit {unit.unitNumber}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {unit.weightagePercentage}% Weightage
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleUnitCompleted(unit.id)}
                          className="flex items-center gap-1.5 text-xs font-mono font-semibold"
                        >
                          {isCompleted ? (
                            <span className="text-teal-600 dark:text-teal-400 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Mastered
                            </span>
                          ) : (
                            <span className="text-slate-400 hover:text-slate-600 flex items-center gap-1">
                              <Square className="w-4 h-4" /> Incomplete
                            </span>
                          )}
                        </button>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {unit.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {unit.description}
                      </p>

                      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-500">{unit.pyqCount} Solved Questions</span>
                        <button
                          onClick={() => setWorkspaceTab('notes')}
                          className="text-teal-600 dark:text-teal-400 font-semibold hover:underline flex items-center gap-1"
                        >
                          <span>View Notes</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 2: TOPIC PRIORITY MATRIX                                         */}
          {/* ===================================================================== */}
          {workspaceTab === 'priority' && (
            <div className="space-y-4">
              <div className="p-4 rounded-control bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-600 dark:text-slate-300">
                  Topics ranked by historical exam frequency across 5 examination cycles
                </span>
                <span className="text-teal-600 dark:text-teal-400 font-bold">
                  {DBMS_QUESTION_CLUSTERS.length} Priority Clusters
                </span>
              </div>

              <div className="space-y-3">
                {DBMS_QUESTION_CLUSTERS.map((cluster) => (
                  <div
                    key={cluster.id}
                    className="p-4 sm:p-5 rounded-card bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={cluster.priority} />
                        <span className="text-xs font-mono text-slate-400">
                          {cluster.topicName}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {cluster.conceptName}
                      </h4>
                      <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
                        <span>Appeared in {cluster.frequency} / {cluster.totalPapersAnalyzed} Papers</span>
                        <span>•</span>
                        <span>Weight: {cluster.typicalMarks}</span>
                        <span>•</span>
                        <span className="text-teal-600 dark:text-teal-400 font-semibold">Last: {cluster.lastAskedYear}</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setWorkspaceTab('notes')}
                        className="text-xs font-semibold gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Study Note</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setWorkspaceTab('pyqs')}
                        className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold gap-1"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>View PYQs</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 3: HIGH-YIELD NOTES                                              */}
          {/* ===================================================================== */}
          {workspaceTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                <span>Examiner-graded study notes with diagram rubrics</span>
                <span>{DBMS_NOTES.length} Published Notes</span>
              </div>

              <div className="space-y-4">
                {DBMS_NOTES.map((note: NoteItem) => (
                  <div
                    key={note.id}
                    className="p-5 rounded-card bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded font-mono text-xs font-semibold bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800">
                        Examiner Note • Unit 3
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {note.readTimeMinutes} min read
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {note.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {note.summary}
                    </p>

                    {/* Key exam takeaways */}
                    <div className="p-3.5 rounded-control bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-1.5 text-xs font-sans">
                      <span className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Examiner Rubric Highlights:
                      </span>
                      {note.keyTakeaways.map((takeaway: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                          <span>{takeaway}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 4: SOLVED PYQS & CLUSTERS                                        */}
          {/* ===================================================================== */}
          {workspaceTab === 'pyqs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                <span>Verified SPPU Questions with marks and exam years</span>
                <span>{DBMS_PYQS.length} Solved Questions</span>
              </div>

              <div className="space-y-3">
                {DBMS_PYQS.map((q: DashboardQuestionItem) => (
                  <div
                    key={q.id}
                    className="p-5 rounded-card bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                          <span className="font-bold text-teal-700 dark:text-teal-400">{q.subjectCode}</span>
                          <span>•</span>
                          <span>Unit {q.unitNumber}</span>
                          <span>•</span>
                          <span>Repeated {q.frequencyCount} Times</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                          &quot;{q.text}&quot;
                        </h4>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                          {q.marks} Marks
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-control bg-slate-50 dark:bg-slate-950/70 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 font-mono flex items-center justify-between">
                      <span>Exam Sessions: {q.examYears.join(', ')}</span>
                      <span className="text-teal-600 dark:text-teal-400 font-semibold">Model Answer Verified</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 5: CRASH EXAM MODE FOR THIS SUBJECT                             */}
          {/* ===================================================================== */}
          {workspaceTab === 'exam-mode' && (
            <div className="p-6 rounded-card bg-slate-900 text-white border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 font-semibold uppercase tracking-wider mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Emergency Prep Scheduler</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {activeSubject.shortName} 5-Hour Crash Triage
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Prioritizes topics that statistically contribute to 70%+ of passing marks.
                  </p>
                </div>

                <div className="p-3 rounded-control bg-slate-950 border border-slate-800 font-mono text-right">
                  <div className="text-[10px] text-slate-400">Target Time</div>
                  <div className="text-lg font-bold text-teal-400">5:00:00</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 rounded-control bg-slate-950/80 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Phase 1: Must Study</div>
                  <div className="text-sm font-bold text-white mt-1">6 Topics • 2 Hours</div>
                </div>
                <div className="p-3 rounded-control bg-slate-950/80 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Phase 2: High Priority</div>
                  <div className="text-sm font-bold text-white mt-1">5 Topics • 1.5 Hours</div>
                </div>
                <div className="p-3 rounded-control bg-slate-950/80 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Phase 3: Repeated PYQs</div>
                  <div className="text-sm font-bold text-white mt-1">15 Questions • 1 Hour</div>
                </div>
              </div>

              <div className="pt-2">
                <a href={`/dashboard/exam-mode?subject=${activeSubject.id}`}>
                  <Button className="w-full sm:w-auto bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold px-6 py-2.5 gap-2">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Launch Interactive Exam Mode for {activeSubject.shortName}</span>
                  </Button>
                </a>
              </div>
            </div>
          )}

        </div>
      )}
    </DashboardShell>
  );
}
