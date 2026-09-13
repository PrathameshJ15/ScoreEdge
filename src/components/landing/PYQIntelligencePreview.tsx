'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Badge } from '@/components/ui/Badge';
import { DBMS_QUESTION_CLUSTERS, MVP_SUBJECTS } from '@/data/sppuData';
import {
  Layers,
  TrendingUp,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  Database,
  BarChart3,
  Lightbulb,
} from 'lucide-react';

export const PYQIntelligencePreview = () => {
  const [selectedSubjectId, setSelectedSubjectId] = useState('dbms');
  const [selectedClusterId, setSelectedClusterId] = useState(DBMS_QUESTION_CLUSTERS[0].id);

  const selectedCluster =
    DBMS_QUESTION_CLUSTERS.find((c) => c.id === selectedClusterId) || DBMS_QUESTION_CLUSTERS[0];

  return (
    <section id="pyq-intelligence" className="py-16 md:py-24 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-semibold uppercase tracking-wider">
            <BarChart3 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Core Intelligence Capability</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            PYQ Recurrence & Question Clustering
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal">
            SPPU examiners rephrase the same core concepts across exam seasons. ScoreEdge indexes past papers, aggregates rephrased questions into high-yield master clusters, and calculates statistical frequency.
          </p>
        </div>

        {/* Subject Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-900 rounded-card border border-slate-200/80 dark:border-slate-800 gap-1.5">
            {MVP_SUBJECTS.slice(0, 3).map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={`px-3.5 py-2 rounded-control text-xs font-semibold transition-all ${
                  selectedSubjectId === subject.id
                    ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-xs border border-slate-200/60 dark:border-slate-700/60'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {subject.shortName} ({subject.code})
              </button>
            ))}
          </div>
        </div>

        {/* Intelligence Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Topic Frequency List */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between px-1 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
              <span>Topic Concept Clusters</span>
              <span>Historical Frequency</span>
            </div>

            {DBMS_QUESTION_CLUSTERS.map((cluster) => {
              const isSelected = cluster.id === selectedClusterId;
              const percentage = Math.round((cluster.frequency / cluster.totalPapersAnalyzed) * 100);

              return (
                <div
                  key={cluster.id}
                  onClick={() => setSelectedClusterId(cluster.id)}
                  className={`p-4 rounded-card border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-50/90 dark:bg-slate-900 border-brand-500 shadow-sm ring-1 ring-brand-500/20'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{cluster.conceptName}</span>
                        {cluster.trend === 'HIGH' && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40 font-semibold flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            High Recurrence
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {cluster.topicName} • Typical: {cluster.typicalMarks}
                      </p>
                    </div>
                    <PriorityBadge priority={cluster.priority} size="sm" />
                  </div>

                  {/* Frequency Progress Bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 font-mono">
                      <span>Appeared in {cluster.frequency} of {cluster.totalPapersAnalyzed} papers</span>
                      <span className="font-bold text-slate-900 dark:text-slate-200">{percentage}% Frequency</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          cluster.priority === 'MUST_STUDY'
                            ? 'bg-rose-500'
                            : cluster.priority === 'HIGH'
                            ? 'bg-orange-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Cluster Breakdown Details */}
          <div className="lg:col-span-6">
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm sticky top-24">
              <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between">
                  <Badge variant="brand" className="gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Cluster Breakdown</span>
                  </Badge>
                  <PriorityBadge priority={selectedCluster.priority} size="sm" />
                </div>
                <CardTitle className="text-xl mt-3 text-slate-900 dark:text-white">
                  {selectedCluster.conceptName}
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Multiple SPPU exam papers test this exact topic with varying question phrases. Here is how they are grouped:
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-4">
                {/* Metrics Pill Grid */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-control text-center text-xs border border-slate-200/60 dark:border-slate-700/60">
                  <div>
                    <span className="text-slate-500 block text-[11px] font-mono uppercase">Appearances</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm font-mono">
                      {selectedCluster.frequency} Papers
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] font-mono uppercase">Variations</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm font-mono">
                      {selectedCluster.variationCount} Questions
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] font-mono uppercase">Weightage</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm font-mono">
                      {selectedCluster.typicalMarks}
                    </span>
                  </div>
                </div>

                {/* Question Variations List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                    <span>Clustered Question Phrasing (Official Papers)</span>
                  </h4>
                  
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-slate-50/70 dark:bg-slate-800/60 rounded-control border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300 shrink-0">
                        2025 In-Sem
                      </span>
                      <p className="text-slate-700 dark:text-slate-300">
                        &quot;Explain 3NF and BCNF with a suitable example. Differentiate between 3NF and BCNF.&quot; (8 Marks)
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50/70 dark:bg-slate-800/60 rounded-control border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300 shrink-0">
                        2024 End-Sem
                      </span>
                      <p className="text-slate-700 dark:text-slate-300">
                        &quot;What is normalization? Explain BCNF decomposition steps with functional dependency example.&quot; (6 Marks)
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50/70 dark:bg-slate-800/60 rounded-control border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300 shrink-0">
                        2023 End-Sem
                      </span>
                      <p className="text-slate-700 dark:text-slate-300">
                        &quot;State 3NF. Under what conditions does a relation in 3NF violate BCNF?&quot; (5 Marks)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Evaluator Insight Notice */}
                <div className="p-3.5 bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200/60 dark:border-brand-800/50 rounded-control flex items-start gap-2.5 text-xs text-brand-900 dark:text-brand-200">
                  <Lightbulb className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong className="font-semibold text-brand-950 dark:text-brand-100">Evaluator Insight:</strong> Preparing the single master answer for this cluster automatically covers all 6 past question variations, saving ~4 hours of redundant studying.
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </section>
  );
};

