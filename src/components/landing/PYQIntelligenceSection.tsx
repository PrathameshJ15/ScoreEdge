'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Layers, 
  FileText, 
  ArrowRight,
  Info,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TopicCluster {
  id: string;
  name: string;
  unit: string;
  appearedCount: number;
  totalPapers: number;
  lastAsked: number;
  typicalMarks: string;
  relatedQuestionsCount: number;
  priority: 'MUST STUDY' | 'HIGH' | 'MEDIUM';
  trend: 'High' | 'Stable';
  historicalPapers: { session: string; marks: number; asked: boolean }[];
  sampleQuestions: { question: string; marks: number; year: string }[];
}

const CLUSTERS: TopicCluster[] = [
  {
    id: 'norm',
    name: 'Normalization (1NF, 2NF, 3NF, BCNF)',
    unit: 'Unit 3: Relational Database Design',
    appearedCount: 4,
    totalPapers: 5,
    lastAsked: 2025,
    typicalMarks: '5–10',
    relatedQuestionsCount: 7,
    priority: 'MUST STUDY',
    trend: 'High',
    historicalPapers: [
      { session: 'Dec 2022', marks: 8, asked: true },
      { session: 'May 2023', marks: 6, asked: true },
      { session: 'Dec 2023', marks: 10, asked: true },
      { session: 'May 2024', marks: 0, asked: false },
      { session: 'Dec 2024 / May 2025', marks: 8, asked: true },
    ],
    sampleQuestions: [
      { question: 'Explain 1NF, 2NF, 3NF and BCNF with suitable examples.', marks: 8, year: 'Dec 2024' },
      { question: 'What is functional dependency? How does BCNF differ from 3NF?', marks: 6, year: 'May 2025' },
      { question: 'Consider relation R(A,B,C,D,E) with FD set F. Test if it is in BCNF.', marks: 7, year: 'Dec 2023' },
    ],
  },
  {
    id: 'acid',
    name: 'ACID Properties & Serializability',
    unit: 'Unit 4: Transaction & Concurrency',
    appearedCount: 4,
    totalPapers: 5,
    lastAsked: 2025,
    typicalMarks: '5–8',
    relatedQuestionsCount: 5,
    priority: 'MUST STUDY',
    trend: 'High',
    historicalPapers: [
      { session: 'Dec 2022', marks: 6, asked: true },
      { session: 'May 2023', marks: 8, asked: true },
      { session: 'Dec 2023', marks: 6, asked: true },
      { session: 'May 2024', marks: 6, asked: true },
      { session: 'Dec 2024 / May 2025', marks: 7, asked: true },
    ],
    sampleQuestions: [
      { question: 'State and explain ACID properties with illustrative execution states.', marks: 6, year: 'May 2025' },
      { question: 'What is conflict serializability? How to test conflict serializability using precedence graph?', marks: 8, year: 'Dec 2024' },
    ],
  },
  {
    id: 'deadlock',
    name: 'Deadlock Prevention & Detection (Wait-Die & Wound-Wait)',
    unit: 'Unit 4: Transaction & Concurrency',
    appearedCount: 3,
    totalPapers: 5,
    lastAsked: 2024,
    typicalMarks: '5–7',
    relatedQuestionsCount: 4,
    priority: 'HIGH',
    trend: 'Stable',
    historicalPapers: [
      { session: 'Dec 2022', marks: 5, asked: true },
      { session: 'May 2023', marks: 0, asked: false },
      { session: 'Dec 2023', marks: 6, asked: true },
      { session: 'May 2024', marks: 7, asked: true },
      { session: 'Dec 2024 / May 2025', marks: 0, asked: false },
    ],
    sampleQuestions: [
      { question: 'Differentiate between Wait-Die and Wound-Wait deadlock prevention schemes.', marks: 5, year: 'May 2024' },
      { question: 'Explain deadlock detection using Wait-For-Graph (WFG) with an example.', marks: 6, year: 'Dec 2023' },
    ],
  },
];

export const PYQIntelligenceSection: React.FC = () => {
  const [activeClusterId, setActiveClusterId] = useState<string>('norm');
  const activeCluster = CLUSTERS.find((c) => c.id === activeClusterId) || CLUSTERS[0];

  return (
    <section id="pyq-intelligence" className="py-20 sm:py-28 bg-[#0a1120] text-white border-b border-slate-800 relative overflow-hidden">
      
      {/* Subtle background glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-teal-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-800/80 text-teal-300 text-xs font-mono font-semibold uppercase tracking-wider mb-4">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Main Intelligence Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.12]">
            Your PYQs are telling you<br />
            <span className="text-teal-400">what to study.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
            Don&apos;t just see what appeared before. Understand what deserves your time.
          </p>
        </div>

        {/* Realistic PYQ Intelligence Dashboard Preview */}
        <div className="rounded-card border border-slate-800 bg-[#070d18] shadow-2xl overflow-hidden">
          
          {/* Dashboard Header Bar */}
          <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono text-xs font-semibold">
                DBMS (210241)
              </span>
              <span className="text-xs text-slate-400 font-mono">
                SPPU 2024 &amp; 2019 Pattern Pattern Intelligence
              </span>
            </div>
            
            {/* Topic Switcher Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {CLUSTERS.map((cluster) => (
                <button
                  key={cluster.id}
                  onClick={() => setActiveClusterId(cluster.id)}
                  className={`px-3 py-1.5 rounded-control text-xs font-mono font-semibold transition-all shrink-0 ${
                    activeCluster.id === cluster.id
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {cluster.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Main Dashboard Layout */}
          <div className="p-6 sm:p-8 space-y-8">
            
            {/* Top Stat Summary Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              
              {/* Appeared */}
              <div className="p-4 rounded-control bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Appeared</div>
                <div className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                  {activeCluster.appearedCount} / {activeCluster.totalPapers}
                </div>
                <div className="text-[11px] font-mono text-teal-400 mt-0.5">
                  {Math.round((activeCluster.appearedCount / activeCluster.totalPapers) * 100)}% Papers
                </div>
              </div>

              {/* Last Asked */}
              <div className="p-4 rounded-control bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Last Asked</div>
                <div className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                  {activeCluster.lastAsked}
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">Recent Cycle</div>
              </div>

              {/* Typical Marks */}
              <div className="p-4 rounded-control bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Typical Marks</div>
                <div className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                  {activeCluster.typicalMarks}
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">Marks Weight</div>
              </div>

              {/* Related Questions */}
              <div className="p-4 rounded-control bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Related Qs</div>
                <div className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                  {activeCluster.relatedQuestionsCount}
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">Clustered Variations</div>
              </div>

              {/* Priority */}
              <div className="p-4 rounded-control bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Priority</div>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold ${
                    activeCluster.priority === 'MUST STUDY'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {activeCluster.priority}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">Tier 1 Target</div>
              </div>

              {/* Trend */}
              <div className="p-4 rounded-control bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Trend</div>
                <div className="text-xl sm:text-2xl font-extrabold text-teal-400 mt-1 flex items-center gap-1.5">
                  <TrendingUp className="w-5 h-5" />
                  <span>{activeCluster.trend}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">Pattern Recurrence</div>
              </div>

            </div>

            {/* Historical Appearance Timeline */}
            <div className="p-5 rounded-control bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-mono">
                <span className="text-slate-300 font-semibold uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-teal-400" />
                  Historical Appearance Timeline
                </span>
                <span className="text-slate-400 text-[11px]">
                  Analyzed across 5 SPPU University Exam Sessions
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                {activeCluster.historicalPapers.map((paper) => (
                  <div
                    key={paper.session}
                    className={`p-3 rounded-control border text-center transition-colors ${
                      paper.asked
                        ? 'bg-teal-950/40 border-teal-600/40 text-teal-200'
                        : 'bg-slate-900/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="text-[11px] font-mono font-medium">{paper.session}</div>
                    <div className="text-xs font-bold mt-1">
                      {paper.asked ? `Asked • ${paper.marks}M` : 'Not Asked'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clustered Question Variations & Topic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              <div className="lg:col-span-8 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="font-semibold uppercase tracking-wider">
                    Clustered Exam Questions ({activeCluster.sampleQuestions.length} Shown)
                  </span>
                  <span>Examiner Variations</span>
                </div>

                <div className="space-y-2.5">
                  {activeCluster.sampleQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-control bg-slate-900/80 border border-slate-800 text-xs flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <span className="font-sans text-slate-200 leading-relaxed font-medium">
                          &quot;{q.question}&quot;
                        </span>
                        <div className="flex items-center gap-2 text-[10.5px] font-mono text-slate-400">
                          <span>Paper: {q.year}</span>
                          <span>•</span>
                          <span className="text-teal-400">Model Answer Available</span>
                        </div>
                      </div>
                      <span className="shrink-0 px-2 py-0.5 rounded bg-slate-800 font-mono text-slate-300 font-semibold text-[11px]">
                        {q.marks}M
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grounding & Methodology Card */}
              <div className="lg:col-span-4 p-5 rounded-control bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-teal-400 font-semibold">
                  <Info className="w-3.5 h-3.5" />
                  <span>Pattern Grounding</span>
                </div>
                
                <p className="text-xs text-slate-300 leading-relaxed">
                  High-priority topic based on historical PYQ patterns. Questions are clustered by semantic concept equivalence rather than exact keyword matches.
                </p>

                <div className="pt-2 border-t border-slate-800 space-y-2 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Curriculum Sync</span>
                    <span className="text-slate-200">SPPU 2024 Pattern</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Target Unit</span>
                    <span className="text-slate-200">{activeCluster.unit}</span>
                  </div>
                </div>

                <div className="pt-3">
                  <Link href="/pyqs">
                    <Button
                      size="sm"
                      className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs py-2 gap-2"
                    >
                      <span>View Full PYQ Intelligence</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>

            </div>

          </div>

          {/* Footnote Bar */}
          <div className="px-6 py-3 bg-slate-950 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
            <span>High-priority topic based on historical PYQ patterns.</span>
            <span className="text-teal-400">We don&apos;t just provide PYQs. We analyze them.</span>
          </div>

        </div>

      </div>
    </section>
  );
};
