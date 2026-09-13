'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { useAuth } from '@/context/AuthContext';
import { 
  getStudentEnrolledSubjects, 
  getSubjectPYQPapers 
} from '@/lib/curriculum/studentCurriculum';
import { 
  getLocalBacklogs, 
  BacklogSubjectItem 
} from '@/lib/backlog/backlogStore';
import { DBMS_QUESTION_CLUSTERS } from '@/data/sppuData';
import {
  Award,
  Calendar,
  Layers,
  TrendingUp,
  FileText,
  Clock,
  ArrowRight,
  Download,
  CheckCircle2,
  Sparkles,
  BookOpen,
  AlertTriangle,
  Flame,
} from 'lucide-react';

export default function DashboardPYQsPage() {
  const searchParams = useSearchParams();
  const initialSubjectParam = searchParams.get('subject');

  const { user } = useAuth();
  const enrolledSubjects = React.useMemo(() => getStudentEnrolledSubjects(user), [user]);
  const [backlogs, setBacklogs] = useState<BacklogSubjectItem[]>([]);

  useEffect(() => {
    const local = getLocalBacklogs();
    if (local.length > 0) {
      setBacklogs(local);
    } else if (user?.backlog_subjects_json) {
      try {
        setBacklogs(JSON.parse(user.backlog_subjects_json));
      } catch {
        // ignore
      }
    }
  }, [user]);

  const defaultSub = enrolledSubjects[0]?.id || 'dbms';
  const [selectedSubjectId, setSelectedSubjectId] = useState(initialSubjectParam || defaultSub);
  const [activeTab, setActiveTab] = useState<'clusters' | 'papers'>('clusters');
  const [selectedClusterId, setSelectedClusterId] = useState<string>(DBMS_QUESTION_CLUSTERS[0].id);

  useEffect(() => {
    if (initialSubjectParam) {
      setSelectedSubjectId(initialSubjectParam);
    }
  }, [initialSubjectParam]);

  const allAvailableSubjects = [
    ...enrolledSubjects.map((s) => ({
      id: s.id,
      name: s.name,
      shortName: s.shortName,
      code: s.code,
      isBacklog: false,
      year: user?.academic_year || 'SE',
    })),
    ...backlogs.map((b) => ({
      id: b.subjectId,
      name: b.name,
      shortName: b.shortName,
      code: b.code,
      isBacklog: true,
      year: b.academicYear,
    })),
  ];

  const activeSubjectObj = allAvailableSubjects.find((s) => s.id === selectedSubjectId) || allAvailableSubjects[0];

  const pastPapers = React.useMemo(() => {
    return getSubjectPYQPapers(selectedSubjectId, activeSubjectObj?.code, activeSubjectObj?.name);
  }, [selectedSubjectId, activeSubjectObj]);

  const activeCluster =
    DBMS_QUESTION_CLUSTERS.find((c) => c.id === selectedClusterId) || DBMS_QUESTION_CLUSTERS[0];

  return (
    <DashboardShell
      activeSubject={selectedSubjectId}
      onSubjectChange={(id) => setSelectedSubjectId(id)}
    >
      <div className="space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-800/60 text-brand-800 dark:text-brand-300 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>SPPU Question Paper Intelligence Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              PYQ Intelligence &amp; Official Papers
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Historical exam recurrence patterns, semantic master clusters, and official question paper archives for <strong>{user?.academic_year || 'SE'} {user?.department || 'Computer Engineering'}</strong>.
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUBJECT BOX CARDS (User Request: "create box like structures for like say subject dbms then dsa... button to study") */}
        {/* ========================================================================= */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
              Select Subject for Past Papers ({allAvailableSubjects.length} Available)
            </span>
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
              Active: {activeSubjectObj?.shortName}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {allAvailableSubjects.map((sub) => {
              const isSelected = selectedSubjectId === sub.id;
              return (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubjectId(sub.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 ring-1 ring-brand-500 shadow-xs'
                      : 'border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-[10px] text-zinc-400">
                        {sub.code}
                      </span>
                      {sub.isBacklog ? (
                        <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[9px] font-bold">
                          ATKT
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] font-bold">
                          {sub.year}
                        </span>
                      )}
                    </div>

                    <div className="font-extrabold text-xs text-zinc-900 dark:text-white line-clamp-1">
                      {sub.shortName}
                    </div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                      {sub.name}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSubjectId(sub.id);
                    }}
                    className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-semibold text-center transition-colors ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-brand-50 hover:text-brand-600'
                    }`}
                  >
                    {isSelected ? 'Solving PYQs ✓' : 'Study PYQs'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab('clusters')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'clusters'
                ? 'border-brand-600 text-brand-700 dark:text-brand-400 bg-brand-50/40 dark:bg-brand-950/20'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Master Question Clusters</span>
          </button>
          <button
            onClick={() => setActiveTab('papers')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'papers'
                ? 'border-brand-600 text-brand-700 dark:text-brand-400 bg-brand-50/40 dark:bg-brand-950/20'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Official Papers Archive ({pastPapers.length})</span>
          </button>
        </div>

        {/* TAB 1: Clusters */}
        {activeTab === 'clusters' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Cluster Selection List */}
            <div className="space-y-3">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                High-Recurrence Clusters for {activeSubjectObj?.shortName}
              </h2>

              <div className="space-y-2">
                {DBMS_QUESTION_CLUSTERS.map((cluster) => {
                  const isSelected = selectedClusterId === cluster.id;
                  return (
                    <div
                      key={cluster.id}
                      onClick={() => setSelectedClusterId(cluster.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-brand-500 bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-brand-500'
                          : 'border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-bold text-zinc-900 dark:text-white">
                          {cluster.conceptName}
                        </span>
                        <PriorityBadge priority={cluster.priority as any} size="sm" />
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <span>{cluster.topicName}</span>
                        <span className="text-brand-600 dark:text-brand-400 font-bold">
                          {cluster.typicalMarks}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cluster Detailed Analytics */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-6 bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-mono text-[10px] font-bold">
                        {activeSubjectObj?.shortName}
                      </span>
                      <PriorityBadge priority={activeCluster.priority as any} size="sm" />
                    </div>
                    <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white">
                      {activeCluster.conceptName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <div className="text-xl font-mono font-extrabold text-brand-600 dark:text-brand-400">
                        {activeCluster.frequency} of {activeCluster.totalPapersAnalyzed} Papers
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 uppercase">
                        {(activeCluster.frequency / activeCluster.totalPapersAnalyzed * 100).toFixed(0)}% Historical Recurrence
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recurrence Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-xs font-mono">
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Typical Marks</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{activeCluster.typicalMarks}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Last Asked</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{activeCluster.lastAskedYear}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Exam Trend</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">High Priority</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Question Variations</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{activeCluster.variationCount} Models</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>SPPU Evaluator Recurrence Rule:</span>
                  </div>
                  <p className="leading-relaxed">
                    This concept appears as a compulsory option in either Question 3 or Question 4 of the university paper. Mastering the canonical definitions, proofs, and standard 8-mark diagrams yields near 100% scoring reliability.
                  </p>
                </div>
              </Card>
            </div>

          </div>
        )}

        {/* TAB 2: Official Papers Archive */}
        {activeTab === 'papers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                Official Past Exam Papers ({pastPapers.length} Sessions)
              </h2>
              <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold font-mono">
                SPPU Evaluator Solved Solutions
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pastPapers.map((paper: any) => (
                <Card
                  key={paper.id}
                  className="p-5 bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs hover:border-brand-500 transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full font-mono text-xs font-bold bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                        {paper.session}
                      </span>
                      <span className="text-xs font-mono font-bold text-zinc-500">
                        {paper.marks} Marks
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                      {paper.subjectName} • {paper.type}
                    </h3>
                    
                    <div className="text-xs font-mono text-zinc-400">
                      Paper Code: {paper.code} • Duration: {paper.duration}
                    </div>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Complete university examination question paper with question-by-question model solutions and marks breakdown.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                    <button
                      type="button"
                      onClick={() => alert(`Opening solved question paper solutions for ${paper.session} - ${paper.subjectName}`)}
                      className="w-full py-2 px-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>Solve Paper &amp; View Rubric</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

      </div>
    </DashboardShell>
  );
}
