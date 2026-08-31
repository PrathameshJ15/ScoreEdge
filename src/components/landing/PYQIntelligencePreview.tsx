'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Badge } from '@/components/ui/Badge';
import { DBMS_QUESTION_CLUSTERS, MVP_SUBJECTS } from '@/data/sppuData';
import { Sparkles, Layers, TrendingUp, HelpCircle, CheckCircle, ArrowRight } from 'lucide-react';

export const PYQIntelligencePreview = () => {
  const [selectedSubjectId, setSelectedSubjectId] = useState('dbms');
  const [selectedClusterId, setSelectedClusterId] = useState(DBMS_QUESTION_CLUSTERS[0].id);

  const selectedCluster = DBMS_QUESTION_CLUSTERS.find((c) => c.id === selectedClusterId) || DBMS_QUESTION_CLUSTERS[0];

  return (
    <section id="pyq-intelligence" className="py-16 md:py-24 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Killer Feature #1</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            PYQ Intelligence & Question Clustering
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
            Stop guessing what will be asked. We analyze past SPPU question papers, map every question to the syllabus, and group rephrased questions into high-yield priority clusters.
          </p>
        </div>

        {/* Subject Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-card border border-slate-200/80 dark:border-slate-700/80 gap-2">
            {MVP_SUBJECTS.slice(0, 3).map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={`px-4 py-2 rounded-control text-sm font-semibold transition-all ${
                  selectedSubjectId === subject.id
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
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
            <div className="flex items-center justify-between px-1 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span>High-Yield Topic Clusters</span>
              <span>Past Paper Frequency</span>
            </div>

            {DBMS_QUESTION_CLUSTERS.map((cluster) => {
              const isSelected = cluster.id === selectedClusterId;
              const percentage = (cluster.frequency / cluster.totalPapersAnalyzed) * 100;

              return (
                <div
                  key={cluster.id}
                  onClick={() => setSelectedClusterId(cluster.id)}
                  className={`p-4 rounded-card border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-50 dark:bg-slate-800/80 border-brand-500 shadow-md ring-1 ring-brand-500/30'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{cluster.conceptName}</span>
                        {cluster.trend === 'HIGH' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 font-semibold">
                            🔥 Trending
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
                    <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                      <span>Appeared in {cluster.frequency} of {cluster.totalPapersAnalyzed} papers</span>
                      <span className="font-bold">{percentage}% Frequency</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          cluster.priority === 'MUST_STUDY'
                            ? 'bg-red-500'
                            : cluster.priority === 'HIGH'
                            ? 'bg-orange-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Cluster Breakdown Details */}
          <div className="lg:col-span-6">
            <Card className="border-brand-500/30 bg-gradient-to-br from-white to-brand-50/20 dark:from-slate-900 dark:to-brand-950/20 sticky top-24">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <Badge variant="brand" className="gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    Question Cluster Detail
                  </Badge>
                  <PriorityBadge priority={selectedCluster.priority} />
                </div>
                <CardTitle className="text-xl mt-3">{selectedCluster.conceptName}</CardTitle>
                <CardDescription>
                  SPPU examiners ask this concept using different wordings across semesters. Here is how ScoreEdge groups them:
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-4">
                
                {/* Metrics Pill Grid */}
                <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800/60 p-3 rounded-control text-center text-xs">
                  <div>
                    <span className="text-slate-500 block">Occurrences</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {selectedCluster.frequency} Papers
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Variations</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {selectedCluster.variationCount} Questions
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Typical Marks</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {selectedCluster.typicalMarks}
                    </span>
                  </div>
                </div>

                {/* Question Variations List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-brand-500" />
                    <span>Clustered Question Wording (SPPU Papers)</span>
                  </h4>
                  
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-white dark:bg-slate-800/80 rounded-control border border-slate-200/80 dark:border-slate-700 flex items-start gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300">2025</span>
                      <p className="text-slate-700 dark:text-slate-200">
                        &quot;Explain 3NF and BCNF with a suitable example. Differentiate between 3NF and BCNF.&quot; (8 Marks)
                      </p>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-800/80 rounded-control border border-slate-200/80 dark:border-slate-700 flex items-start gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300">2024</span>
                      <p className="text-slate-700 dark:text-slate-200">
                        &quot;What is normalization? Explain BCNF decomposition steps with functional dependency example.&quot; (6 Marks)
                      </p>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-800/80 rounded-control border border-slate-200/80 dark:border-slate-700 flex items-start gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300">2023</span>
                      <p className="text-slate-700 dark:text-slate-200">
                        &quot;State 3NF. Under what conditions does a relation in 3NF violate BCNF?&quot; (5 Marks)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recommendation Notice */}
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-control flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>ScoreEdge Tip:</strong> Preparing the 10-mark master answer for this cluster covers all 6 past question variations!
                  </span>
                </div>

              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </section>
  );
};
