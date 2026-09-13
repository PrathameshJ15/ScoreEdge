'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  SubjectIntelligenceReport,
  TopicPriorityReport,
  UnitAnalysisReport,
  PYQFrequencyReport,
  PriorityCategory,
} from '@/lib/intelligence/pyqEngine';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import {
  Flame,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  BarChart3,
  Layers,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  HelpCircle,
  FileText,
  Lightbulb,
  Info,
  Repeat,
  Lock,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

interface PYQIntelligenceViewProps {
  subjectId: string;
  initialData?: SubjectIntelligenceReport;
  showSubjectSelector?: boolean;
  onSubjectChange?: (newSubjectId: string) => void;
  availableSubjects?: Array<{ id: string; name: string; short_name: string; code: string }>;
}

export const PYQIntelligenceView: React.FC<PYQIntelligenceViewProps> = ({
  subjectId,
  initialData,
  showSubjectSelector = false,
  onSubjectChange,
  availableSubjects = [],
}) => {
  const [report, setReport] = useState<SubjectIntelligenceReport | null>(initialData || null);
  const [clusters, setClusters] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<string | null>(null);

  // Active sub-section
  const [activeView, setActiveView] = useState<'topics' | 'units' | 'marks' | 'frequency' | 'clusters'>('topics');

  // Filters
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedUnit, setSelectedUnit] = useState<string>('ALL');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [intelRes, clustersRes] = await Promise.all([
          fetch(`/api/pyqs/intelligence?subject_id=${subjectId}`),
          fetch(`/api/pyqs/clusters?subject_id=${subjectId}&limit=50`),
        ]);

        if (!intelRes.ok) {
          throw new Error('Failed to load PYQ intelligence report');
        }
        const intelJson = await intelRes.json();
        if (isMounted) {
          setReport(intelJson.data);
        }

        if (clustersRes.ok) {
          const clusterJson = await clustersRes.json();
          if (isMounted) {
            setClusters(clusterJson.data || []);
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error loading intelligence data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [subjectId]);

  // Filtered topics
  const filteredTopics = useMemo(() => {
    if (!report) return [];
    let list = report.topics_priority;
    if (selectedPriority !== 'ALL') {
      list = list.filter((t) => t.priority === selectedPriority);
    }
    if (selectedUnit !== 'ALL') {
      list = list.filter((t) => t.unit_id === selectedUnit);
    }
    return list;
  }, [report, selectedPriority, selectedUnit]);

  if (loading) {
    return (
      <Card className="p-8 text-center space-y-4 border-slate-200 dark:border-slate-800">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Calculating PYQ historical occurrence signals and priority rankings...
        </p>
      </Card>
    );
  }

  if (error || !report) {
    return (
      <Card className="p-8 text-center space-y-3 border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
        <h3 className="text-base font-bold text-red-900 dark:text-red-300">
          Intelligence Data Unavailable
        </h3>
        <p className="text-sm text-red-700 dark:text-red-400">
          {error || 'Unable to compute intelligence report for the selected subject.'}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. MANDATORY ETHICAL GUARDRAIL & ACADEMIC DISCLAIMER BANNER */}
      <div className="rounded-control border border-amber-300/80 bg-amber-50/90 dark:bg-amber-950/30 dark:border-amber-800/80 p-4 shadow-depth-1">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
              Academic Pattern Analysis • Verified Data Only
            </h4>
            <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
              {report.disclaimer} All frequency ratios, marks weightages, and priority categories are
              derived from empirical examination occurrences in verified university papers.
            </p>
          </div>
        </div>
      </div>

      {/* 2. SUBJECT HEADER & TOP STATS */}
      <div className="bg-white dark:bg-slate-900 rounded-control border border-slate-200/90 dark:border-slate-800 p-5 shadow-depth-1">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                {report.subject_code}
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {report.subject_name} • PYQ Intelligence
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Empirical analysis across {report.total_papers_analyzed} verified exam papers (
              {report.years_analyzed.join(', ')}) with {report.total_occurrences} recorded occurrences.
            </p>
          </div>

          {showSubjectSelector && availableSubjects.length > 0 && onSubjectChange && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Subject:</span>
              <select
                value={subjectId}
                onChange={(e) => onSubjectChange(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium rounded-control px-2.5 py-1.5 text-slate-900 dark:text-white focus:ring-1 focus:ring-brand-500"
              >
                {availableSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.short_name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* STAT TILES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800/80">
          <div className="p-3 bg-slate-50/80 dark:bg-slate-850 rounded-control border border-slate-200/60 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Verified Papers
            </div>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
              {report.total_papers_analyzed} Papers
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Multi-year cycles</div>
          </div>

          <div className="p-3 bg-slate-50/80 dark:bg-slate-850 rounded-control border border-slate-200/60 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              MUST STUDY Topics
            </div>
            <div className="text-lg font-extrabold text-red-600 dark:text-red-400 mt-0.5 flex items-center gap-1">
              <Flame className="w-4 h-4 fill-red-500 text-red-500" />
              {report.important_topic_lists.must_study.length} Topics
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Top recurring syllabus core</div>
          </div>

          <div className="p-3 bg-slate-50/80 dark:bg-slate-850 rounded-control border border-slate-200/60 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              VERY HIGH Priority
            </div>
            <div className="text-lg font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
              {report.important_topic_lists.very_high.length} Topics
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Consistent exam appearances</div>
          </div>

          <div className="p-3 bg-slate-50/80 dark:bg-slate-850 rounded-control border border-slate-200/60 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Verified PYQs
            </div>
            <div className="text-lg font-extrabold text-brand-600 dark:text-brand-400 mt-0.5">
              {report.total_verified_questions} Questions
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Mapped to syllabus units</div>
          </div>
        </div>
      </div>

      {/* 3. SUB-SECTION NAVIGATION */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveView('topics')}
          className={`px-4 py-2 rounded-control text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeView === 'topics'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          Topic Priority & Important Lists ({report.topics_priority.length})
        </button>

        <button
          onClick={() => setActiveView('units')}
          className={`px-4 py-2 rounded-control text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeView === 'units'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Unit Weightage Analysis ({report.unit_analysis.length} Units)
        </button>

        <button
          onClick={() => setActiveView('marks')}
          className={`px-4 py-2 rounded-control text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeView === 'marks'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Marks Trends & Structure
        </button>

        <button
          onClick={() => setActiveView('frequency')}
          className={`px-4 py-2 rounded-control text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeView === 'frequency'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          PYQ Frequency Rankings ({report.pyq_frequency.length})
        </button>

        <button
          onClick={() => setActiveView('clusters')}
          className={`px-4 py-2 rounded-control text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeView === 'clusters'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900'
          }`}
        >
          <Repeat className="w-3.5 h-3.5" />
          Repeated Question Clusters ({clusters.length})
        </button>
      </div>

      {/* ========================================================= */}
      {/* VIEW 1: TOPIC PRIORITY & IMPORTANT TOPIC LISTS           */}
      {/* ========================================================= */}
      {activeView === 'topics' && (
        <div className="space-y-5">
          {/* Filtering Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-control border border-slate-200/90 dark:border-slate-800 shadow-depth-1">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-xs font-semibold text-slate-500 mr-1">Priority:</span>
              {(['ALL', 'MUST_STUDY', 'VERY_HIGH', 'HIGH', 'MEDIUM', 'LOW'] as const).map((pri) => (
                <button
                  key={pri}
                  onClick={() => setSelectedPriority(pri)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-colors ${
                    selectedPriority === pri
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {pri.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Unit:</span>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="text-xs font-medium rounded-control border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-slate-900 dark:text-white"
              >
                <option value="ALL">All Units</option>
                {report.unit_analysis.map((u) => (
                  <option key={u.unit_id} value={u.unit_id}>
                    Unit {u.unit_number} ({u.unit_title.slice(0, 20)}...)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Topics List with Explainability & Recommendations */}
          <div className="space-y-3.5">
            {filteredTopics.length === 0 ? (
              <Card className="p-8 text-center text-slate-500 border-slate-200 dark:border-slate-800">
                No topics found matching the selected priority or unit filters.
              </Card>
            ) : (
              filteredTopics.map((topic) => (
                <Card
                  key={topic.topic_id}
                  className="p-5 border-slate-200/90 dark:border-slate-800 shadow-depth-1 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <PriorityBadge priority={topic.priority} size="sm" />
                        <span className="text-xs font-semibold text-slate-500">
                          Unit {topic.unit_number}: {topic.unit_title}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          Typical: {topic.typical_marks}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">
                          Prep: ~{topic.suggested_prep_time_minutes} mins
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {topic.topic_title}
                      </h3>
                    </div>

                    {/* Composite Score Meter */}
                    <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-control border border-slate-200/80 dark:border-slate-800 text-right min-w-[170px] shrink-0">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                        ScoreEdge Index
                      </div>
                      <div className="text-lg font-black text-slate-900 dark:text-white flex items-center justify-end gap-1.5 mt-0.5">
                        <span
                          className={
                            topic.composite_score >= 75
                              ? 'text-red-600 dark:text-red-400'
                              : topic.composite_score >= 60
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }
                        >
                          {topic.composite_score}
                        </span>
                        <span className="text-xs font-medium text-slate-400">/ 100</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {topic.signals.occurrenceFrequency.distinctPapersCount} of{' '}
                        {topic.signals.occurrenceFrequency.totalPapersAnalyzed} Papers
                      </div>
                    </div>
                  </div>

                  {/* Explainable Rationale Box */}
                  <div className="bg-slate-50/90 dark:bg-slate-850/80 p-3 rounded-control border border-slate-200/60 dark:border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
                      <Info className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                      <span>Historical Occurrence Evidence</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                      {topic.explanation}
                    </p>
                  </div>

                  {/* Academic Revision Recommendation Box */}
                  <div className="bg-brand-50/50 dark:bg-brand-950/20 p-3 rounded-control border border-brand-100 dark:border-brand-900/50 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-brand-800 dark:text-brand-300 font-bold">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      <span>Academic Revision Strategy</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {topic.recommendation}
                    </p>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: UNIT WEIGHTAGE ANALYSIS                           */}
      {/* ========================================================= */}
      {activeView === 'units' && (
        <div className="space-y-6">
          {/* Unit Weightage Visual Bar Chart */}
          <Card className="p-6 border-slate-200/90 dark:border-slate-800 shadow-depth-1 space-y-5">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-600" />
                Historical Exam Marks Weightage by Unit
              </h3>
              <p className="text-xs text-slate-500">
                Calculated by aggregating all verified question occurrences across past university papers.
              </p>
            </div>

            {/* Visual Bars */}
            <div className="space-y-3 pt-2">
              {report.unit_analysis.map((u) => (
                <div key={u.unit_id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Unit {u.unit_number}: {u.unit_title}
                    </span>
                    <span className="font-mono font-extrabold text-brand-600 dark:text-brand-400">
                      {u.weightage_percentage}% (~{u.total_marks} Marks)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(u.weightage_percentage, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Overall Unit Text Interpretation */}
            <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-control border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-brand-600" />
                <span>Text Interpretation & Weightage Insights</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {report.overall_text_interpretation}
              </p>
            </div>
          </Card>

          {/* Unit Detail Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.unit_analysis.map((u) => (
              <Card
                key={u.unit_id}
                className="p-5 border-slate-200/90 dark:border-slate-800 shadow-depth-1 space-y-3.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                      Unit {u.unit_number}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {u.unit_title}
                    </h4>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs font-bold">
                    {u.weightage_percentage}% Weightage
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-800 text-center text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Marks</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {u.total_marks} Marks
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Appearances</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {u.occurrences_count} Times
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Avg Question</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {u.avg_question_marks} Marks
                    </span>
                  </div>
                </div>

                {/* Text interpretation for this specific unit */}
                <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-850/80 p-3 rounded-control border border-slate-200/60 dark:border-slate-800 leading-relaxed">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
                    Unit Preparation Guidance:
                  </span>
                  {u.text_interpretation}
                </div>

                {u.top_recurring_topics.length > 0 && (
                  <div className="text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Frequent Topics:{' '}
                    </span>
                    {u.top_recurring_topics.join(', ')}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 3: MARKS TRENDS & EXAMINATION STRUCTURE              */}
      {/* ========================================================= */}
      {activeView === 'marks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Marks Distribution Chart */}
            <Card className="p-6 border-slate-200/90 dark:border-slate-800 shadow-depth-1 space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Marks Distribution Tiers
                </h3>
                <p className="text-xs text-slate-500">
                  Relative occurrence frequency of each question mark denomination.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                {report.marks_trends.marks_buckets.map((bucket) => (
                  <div key={bucket.marks} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{bucket.label}</span>
                      <span className="text-slate-900 dark:text-white font-mono">
                        {bucket.count} questions ({bucket.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.max(bucket.percentage, 2)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Text interpretation for marks tier chart */}
              <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-control border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Text Interpretation:
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {report.marks_trends.text_interpretation}
                </p>
              </div>
            </Card>

            {/* Question Type Breakdown */}
            <Card className="p-6 border-slate-200/90 dark:border-slate-800 shadow-depth-1 space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Question Format Breakdown
                </h3>
                <p className="text-xs text-slate-500">
                  Categorized format distribution across theory, numerical, and diagrammatic items.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {report.marks_trends.question_type_distribution.map((item) => (
                  <div
                    key={item.question_type}
                    className="p-3 bg-slate-50 dark:bg-slate-850 rounded-control border border-slate-200/60 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {item.question_type.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Typical marks: {item.typical_marks} Marks
                      </span>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">
                      {item.percentage}% ({item.count})
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Year by Year History */}
              {report.marks_trends.year_by_year_marks.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                    Year-by-Year Exam Marks Evaluated:
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto">
                    {report.marks_trends.year_by_year_marks.map((ym) => (
                      <div
                        key={ym.year}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-control text-center text-xs"
                      >
                        <span className="text-slate-400 block text-[10px]">{ym.year}</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {ym.total_marks}M
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 4: PYQ FREQUENCY RANKINGS                            */}
      {/* ========================================================= */}
      {activeView === 'frequency' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recurring Questions Ranked by Paper Frequency ({report.pyq_frequency.length})
            </h3>
            <span className="text-xs text-slate-500">
              Analyzed across {report.total_papers_analyzed} verified past papers
            </span>
          </div>

          <div className="space-y-3">
            {report.pyq_frequency.map((item, idx) => (
              <Card
                key={item.question_id}
                className="p-5 border-slate-200/90 dark:border-slate-800 shadow-depth-1 space-y-3"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                        Rank #{idx + 1}
                      </span>
                      <PriorityBadge priority={item.priority} size="sm" />
                      <span className="text-xs font-medium text-slate-500">
                        Unit {item.unit_number} {item.topic_title ? `• ${item.topic_title}` : ''}
                      </span>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {item.typical_marks}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {item.canonical_question}
                    </p>
                  </div>

                  {/* Frequency meter */}
                  <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-control border border-slate-200/80 dark:border-slate-800 text-right min-w-[150px] shrink-0">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase">Frequency</div>
                    <div className="text-base font-extrabold text-red-600 dark:text-red-400 flex items-center justify-end gap-1 mt-0.5">
                      <Flame className="w-4 h-4 fill-red-500 text-red-500" />
                      {item.frequency} / {item.total_papers} Papers
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {item.frequency_percentage}% Occurrence Rate
                    </div>
                  </div>
                </div>

                {/* Evidence timeline and explanation */}
                <div className="bg-slate-50/80 dark:bg-slate-850/80 p-3 rounded-control border border-slate-200/60 dark:border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-brand-600" />
                    <span>Historical Appearances: {item.years.join(', ')}</span>
                    <span className="text-slate-400">• Sessions: {item.sessions.join(', ')}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                    {item.explanation}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 5: REPEATED QUESTION CLUSTERS & CONCEPT VARIATIONS    */}
      {/* ========================================================= */}
      {activeView === 'clusters' && (
        <div className="space-y-6">
          {/* Informational Guidance Banner */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-control space-y-1.5">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Exam Concept Repetition & Wording Variations
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Questions that test the same underlying exam concept across university examination papers are grouped with empirical confidence scoring and human approval.
              Repetition counts reflect verified historical paper appearances (&ldquo;Repeated/Similar in X verified papers&rdquo;) rather than speculative predictions.
            </p>
          </div>

          {clusters.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-control border border-slate-200 dark:border-slate-800">
              No question repetition clusters found for this subject yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {clusters.map((cluster) => {
                const isLocked = Boolean(cluster.is_locked);
                const confidencePct = Math.round((cluster.confidence_score || 0.9) * 100);

                return (
                  <Card
                    key={cluster.id}
                    className={`space-y-4 border-slate-200/90 dark:border-slate-800 p-5 relative overflow-hidden ${
                      isLocked ? 'opacity-90' : ''
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                            Unit {cluster.unit_number || 1}
                          </span>
                          {cluster.topic_title && (
                            <span className="text-xs text-slate-500 font-medium">
                              • {cluster.topic_title}
                            </span>
                          )}
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            {cluster.primary_repetition_type
                              ? cluster.primary_repetition_type.replace(/_/g, ' ')
                              : 'CONCEPT REPETITION'}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {cluster.canonical_name}
                        </h3>
                      </div>

                      {/* Repetition Badge */}
                      <div className="shrink-0 flex flex-col items-start sm:items-end gap-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <Repeat className="w-3.5 h-3.5" />
                          <span>{cluster.repetition_summary || `Repeated/Similar in ${cluster.occurrence_count} verified papers`}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>{confidencePct}% Confidence</span>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            Human Approved
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Canonical Question */}
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-control border border-slate-200/70 dark:border-slate-800 space-y-1">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                        Canonical Reference Question
                      </div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white font-serif leading-relaxed">
                        &ldquo;{cluster.canonical_question}&rdquo;
                      </p>
                      <div className="flex items-center gap-3 pt-1 text-xs text-slate-500">
                        <span>Typical Weight: <strong>{cluster.typical_marks}</strong></span>
                        {cluster.years && cluster.years.length > 0 && (
                          <span>• Tested in Years: <strong>{cluster.years.join(', ')}</strong></span>
                        )}
                      </div>
                    </div>

                    {/* Question Variations List */}
                    {cluster.members && cluster.members.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                          Verified Question Variations ({cluster.members.length})
                        </div>
                        <div className="space-y-2">
                          {cluster.members.map((member: any) => (
                            <div
                              key={member.member_id || member.question_id}
                              className="p-3 bg-white dark:bg-slate-900 rounded-control border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5"
                            >
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                  {(member.repetition_type || 'VARIATION').replace(/_/g, ' ')}
                                </span>
                                <span className="text-slate-400 text-[11px]">
                                  {member.marks} Marks • {member.difficulty}
                                </span>
                              </div>
                              <p className="text-slate-800 dark:text-slate-200 leading-snug">
                                {member.question_text}
                              </p>
                              {member.match_explanation && (
                                <p className="text-[11px] text-slate-500 italic">
                                  {member.match_explanation}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Locked State Overlay */}
                    {isLocked && (
                      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-depth-4 max-w-sm w-full text-center space-y-3">
                          <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center mx-auto">
                            <Lock className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              Premium Cluster Locked
                            </h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              {cluster.lock_message || 'Upgrade to Single Subject Pass (₹49) or Semester Pass (₹199) to unlock full frequency intelligence.'}
                            </p>
                          </div>
                          <Link href="/pricing" className="block">
                            <Button variant="primary" size="sm" className="w-full text-xs font-bold gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Unlock All Clusters</span>
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
