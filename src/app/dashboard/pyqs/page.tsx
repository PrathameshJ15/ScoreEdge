'use client';

import React, { useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/Button';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { DBMS_QUESTION_CLUSTERS, MVP_SUBJECTS } from '@/data/sppuData';
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
} from 'lucide-react';

export default function DashboardPYQsPage() {
  const [selectedSubjectId, setSelectedSubjectId] = useState('dbms');
  const [activeTab, setActiveTab] = useState<'clusters' | 'papers'>('clusters');
  const [selectedClusterId, setSelectedClusterId] = useState<string>(DBMS_QUESTION_CLUSTERS[0].id);

  const activeCluster =
    DBMS_QUESTION_CLUSTERS.find((c) => c.id === selectedClusterId) || DBMS_QUESTION_CLUSTERS[0];

  const pastPapers = [
    { id: 'p-1', session: 'Dec 2024', type: 'End-Sem Exam', marks: 70, duration: '2.5 Hours', code: '210241-DEC24', questionsCount: 16 },
    { id: 'p-2', session: 'May 2024', type: 'In-Sem Exam', marks: 30, duration: '1 Hour', code: '210241-MAY24-IN', questionsCount: 6 },
    { id: 'p-3', session: 'Dec 2023', type: 'End-Sem Exam', marks: 70, duration: '2.5 Hours', code: '210241-DEC23', questionsCount: 16 },
    { id: 'p-4', session: 'May 2023', type: 'In-Sem Exam', marks: 30, duration: '1 Hour', code: '210241-MAY23-IN', questionsCount: 6 },
    { id: 'p-5', session: 'Dec 2022', type: 'End-Sem Exam', marks: 70, duration: '2.5 Hours', code: '210241-DEC22', questionsCount: 16 },
  ];

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
              <Award className="w-3.5 h-3.5" />
              <span>SPPU Question Paper Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              PYQ Intelligence &amp; Papers
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Historical exam recurrence patterns, semantic master clusters, and official question paper archives.
            </p>
          </div>
        </div>

        {/* Subject Switcher Pills */}
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

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('clusters')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'clusters'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400 bg-teal-50/30 dark:bg-teal-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Master Question Clusters ({DBMS_QUESTION_CLUSTERS.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('papers')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'papers'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400 bg-teal-50/30 dark:bg-teal-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Official Papers Archive ({pastPapers.length})</span>
          </button>
        </div>

        {/* TAB 1: QUESTION CLUSTERS */}
        {activeTab === 'clusters' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Cluster List */}
            <div className="lg:col-span-5 space-y-3">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold px-1">
                Select Concept Cluster
              </div>

              {DBMS_QUESTION_CLUSTERS.map((cluster) => {
                const isSelected = cluster.id === activeCluster.id;
                const percentage = Math.round((cluster.frequency / cluster.totalPapersAnalyzed) * 100);

                return (
                  <div
                    key={cluster.id}
                    onClick={() => setSelectedClusterId(cluster.id)}
                    className={`p-4 rounded-card border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50/50 dark:bg-teal-950/40 border-teal-500 shadow-sm ring-1 ring-teal-500/20'
                        : 'bg-white dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <PriorityBadge priority={cluster.priority} />
                      <span className="text-xs font-mono text-teal-600 dark:text-teal-400 font-bold">
                        {percentage}% Recurrence
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {cluster.conceptName}
                    </h3>
                    
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span>{cluster.topicName}</span>
                      <span>{cluster.frequency} / {cluster.totalPapersAnalyzed} Papers</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Cluster Deep-Dive */}
            <div className="lg:col-span-7 p-6 rounded-card bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
                  <span>Unit Focus</span>
                  <span>•</span>
                  <span>Typical Marks: {activeCluster.typicalMarks}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {activeCluster.conceptName}
                </h2>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 rounded-control bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400">Frequency</div>
                  <div className="text-base font-bold text-teal-600 dark:text-teal-400 mt-0.5">
                    {activeCluster.frequency} / {activeCluster.totalPapersAnalyzed} Papers
                  </div>
                </div>
                <div className="p-3 rounded-control bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400">Priority Tier</div>
                  <div className="text-base font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                    {activeCluster.priority}
                  </div>
                </div>
                <div className="p-3 rounded-control bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400">Last Asked</div>
                  <div className="text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {activeCluster.lastAskedYear}
                  </div>
                </div>
              </div>

              {/* Recurrence Timeline */}
              <div className="space-y-2">
                <div className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Appearance Timeline (5 Exam Cycles):
                </div>
                <div className="grid grid-cols-5 gap-2 text-center text-xs font-mono">
                  <div className="p-2 rounded bg-teal-50 dark:bg-teal-950/60 border border-teal-200 text-teal-800 dark:text-teal-300 font-bold">
                    Dec 2022
                  </div>
                  <div className="p-2 rounded bg-teal-50 dark:bg-teal-950/60 border border-teal-200 text-teal-800 dark:text-teal-300 font-bold">
                    May 2023
                  </div>
                  <div className="p-2 rounded bg-teal-50 dark:bg-teal-950/60 border border-teal-200 text-teal-800 dark:text-teal-300 font-bold">
                    Dec 2023
                  </div>
                  <div className="p-2 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                    May 2024
                  </div>
                  <div className="p-2 rounded bg-teal-50 dark:bg-teal-950/60 border border-teal-200 text-teal-800 dark:text-teal-300 font-bold">
                    Dec 2024
                  </div>
                </div>
              </div>

              {/* Sample Variation */}
              <div className="p-4 rounded-control bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-2">
                <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Representative SPPU Exam Question:</span>
                  <span className="text-teal-600 font-bold">8 Marks</span>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 font-sans leading-relaxed">
                  &quot;Explain 1NF, 2NF, 3NF and BCNF with suitable examples. State the significance of BCNF in relational schema decomposition.&quot;
                </p>
              </div>

              <div className="pt-2">
                <a href="/dashboard/questions">
                  <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold py-2 gap-2">
                    <span>Practice Questions for this Cluster</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </a>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: OFFICIAL QUESTION PAPERS ARCHIVE */}
        {activeTab === 'papers' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastPapers.map((paper) => (
                <div
                  key={paper.id}
                  className="p-5 rounded-card bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {paper.session}
                    </span>
                    <span className="text-xs font-mono font-semibold text-teal-600 dark:text-teal-400">
                      {paper.marks} Marks
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    DBMS {paper.type}
                  </h3>
                  
                  <div className="text-xs font-mono text-slate-500 space-y-1">
                    <div>Paper Code: {paper.code}</div>
                    <div>Duration: {paper.duration} • {paper.questionsCount} Questions</div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-teal-600 dark:text-teal-400 font-semibold">
                      Full Model Solutions
                    </span>
                    <a href="/dashboard/questions">
                      <Button size="sm" variant="outline" className="text-xs">
                        View Questions
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </DashboardShell>
  );
}
