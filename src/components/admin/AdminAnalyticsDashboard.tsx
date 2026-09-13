'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProductAnalyticsDashboardData } from '@/lib/analytics/types';
import {
  TrendingUp,
  Users,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Search,
  Sparkles,
  Zap,
  HelpCircle,
  BookOpen,
  CreditCard,
  UserPlus,
  RefreshCw,
  ArrowRight,
  Filter,
} from 'lucide-react';

export function AdminAnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | 'all'>('all');
  const [data, setData] = useState<ProductAnalyticsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/analytics?timeframe=${timeframe}`, {
        cache: 'no-store',
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to fetch analytics');
      }
      setData(json.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading analytics');
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading && !data) {
    return (
      <div className="py-16 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-brand-600" />
        <p className="text-sm font-semibold">Computing privacy-preserving product metrics...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-sm">
        <p className="font-bold">Failed to load analytics insights</p>
        <p className="text-xs mt-1">{error}</p>
        <Button size="sm" variant="outline" onClick={loadAnalytics} className="mt-3">
          Retry
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const { summary, funnel, study_activity, search_insights, privacy_audit } = data;

  return (
    <div className="space-y-8">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-depth-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
              Product Telemetry & Conversion Engine
            </span>
            <Badge variant="success" className="text-[10px] gap-1 py-0.5">
              <ShieldCheck className="w-3 h-3" />
              Zero PII Protected
            </Badge>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Conversion Funnel & Learning Insights
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Decoupled, privacy-conscious event tracking across the student journey.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-850 p-1 rounded-control border border-slate-200 dark:border-slate-750 text-xs">
            {(['all', '30d', '7d', '24h'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 rounded-control font-semibold transition-all ${
                  timeframe === t
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t === 'all' ? 'All Time' : t.toUpperCase()}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={loadAnalytics}
            disabled={loading}
            className="text-xs gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Primary KPI Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4 border-slate-200/90 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Total Events</span>
            <TrendingUp className="w-4 h-4 text-brand-500" />
          </div>
          <span className="text-2xl font-extrabold font-tabular text-slate-900 dark:text-white">
            {summary.total_events}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Telemetry volume</span>
        </Card>

        <Card className="p-4 border-slate-200/90 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Unique Visitors</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-2xl font-extrabold font-tabular text-slate-900 dark:text-white">
            {summary.unique_visitors}
          </span>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 block mt-0.5">Top of funnel</span>
        </Card>

        <Card className="p-4 border-slate-200/90 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Signups</span>
            <UserPlus className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-extrabold font-tabular text-slate-900 dark:text-white">
            {summary.total_signups}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">Registered</span>
        </Card>

        <Card className="p-4 border-slate-200/90 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Active Learners</span>
            <BookOpen className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-extrabold font-tabular text-slate-900 dark:text-white">
            {summary.active_learners}
          </span>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 block mt-0.5">Engaged students</span>
        </Card>

        <Card className="p-4 border-slate-200/90 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Checkouts</span>
            <CreditCard className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-2xl font-extrabold font-tabular text-slate-900 dark:text-white">
            {summary.total_checkouts}
          </span>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 block mt-0.5">Payment intents</span>
        </Card>

        <Card className="p-4 border-slate-200/90 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 mb-1">
            <span className="text-[11px] font-bold">Purchases</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-extrabold font-tabular text-emerald-700 dark:text-emerald-300">
            {summary.total_purchases}
          </span>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
            {funnel.overall_conversion_rate_percent}% overall rate
          </span>
        </Card>
      </div>

      {/* CONVERSION FUNNEL VISUALIZATION */}
      <Card className="p-6 border-slate-200/90 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Conversion Funnel Analysis</span>
              <Badge variant="brand" className="text-[10px]">
                visitor → signup → study activity → premium interest → checkout → purchase
              </Badge>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              End-to-end student conversion flow with stage drop-off analysis.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Overall Conversion</span>
            <span className="text-xl font-extrabold text-brand-600 dark:text-brand-400 font-tabular">
              {funnel.overall_conversion_rate_percent}%
            </span>
          </div>
        </div>

        {/* Funnel Stage Progression Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 relative">
          {funnel.steps.map((step, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === funnel.steps.length - 1;

            return (
              <div
                key={step.stage}
                className={`relative p-4 rounded-xl border transition-all ${
                  isLast
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-50/80 dark:bg-slate-850/60 border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Step Index Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center">
                    {idx + 1}
                  </span>
                  {!isFirst && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        step.conversion_from_previous_percent >= 50
                          ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {step.conversion_from_previous_percent}% conv.
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {step.label}
                </h4>
                <div className="text-xl font-extrabold font-tabular text-slate-900 dark:text-white my-1">
                  {step.count}
                </div>

                <p className="text-[10px] text-slate-500 leading-tight mb-3">
                  {step.description}
                </p>

                {/* Progress bar visual */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isLast ? 'bg-emerald-500' : 'bg-brand-500'
                    }`}
                    style={{
                      width: `${Math.max(5, Math.min(100, step.conversion_from_top_percent))}%`,
                    }}
                  />
                </div>

                {/* Drop-off stat */}
                {!isFirst && step.drop_off_count > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Drop-off:</span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      -{step.drop_off_count} ({step.drop_off_percent}%)
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* STUDY ENGAGEMENT & PRODUCT COMPLETION INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Activity Metrics */}
        <Card className="p-6 border-slate-200/90 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Study Activity & Feature Engagement</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {study_activity.total_study_events} total events
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 font-semibold block">PYQs Viewed</span>
              <span className="text-xl font-bold font-tabular text-slate-900 dark:text-white">
                {study_activity.pyqs_viewed}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 font-semibold block">Questions Practiced</span>
              <span className="text-xl font-bold font-tabular text-slate-900 dark:text-white">
                {study_activity.questions_practiced}
              </span>
            </div>
          </div>

          {/* Completion Rates */}
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
                  Quiz Completion Rate
                </span>
                <span className="font-bold font-tabular text-emerald-600 dark:text-emerald-400">
                  {study_activity.quiz_completion_rate_percent}% ({study_activity.quizzes_completed}/{study_activity.quizzes_started})
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, study_activity.quiz_completion_rate_percent)}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Exam Mode Sprint Completion
                </span>
                <span className="font-bold font-tabular text-amber-600 dark:text-amber-400">
                  {study_activity.exam_mode_completion_rate_percent}% ({study_activity.exam_mode_completed}/{study_activity.exam_mode_started})
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, study_activity.exam_mode_completion_rate_percent)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Top Subjects */}
          {study_activity.top_subjects_by_activity.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Most Active Subjects
              </span>
              <div className="flex flex-wrap gap-2">
                {study_activity.top_subjects_by_activity.map((s) => (
                  <span
                    key={s.subject_id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    <span>{s.subject_id}</span>
                    <span className="text-[10px] px-1 py-0.2 rounded-full bg-brand-500/20 text-brand-700 dark:text-brand-300 font-bold">
                      {s.event_count}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* AI & Search Insights */}
        <div className="space-y-6">
          {/* AI Features */}
          <Card className="p-6 border-slate-200/90 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>AI Feature Usage (Grounded Prompts)</span>
              </h3>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 font-tabular">
                {study_activity.ai_features_used} total uses
              </span>
            </div>

            {study_activity.top_ai_actions.length > 0 ? (
              <div className="space-y-2">
                {study_activity.top_ai_actions.map((act) => (
                  <div
                    key={act.action}
                    className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-850 text-xs"
                  >
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {act.action}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white font-tabular">
                      {act.count} times
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No AI queries recorded in this timeframe.</p>
            )}
          </Card>

          {/* Search Insights */}
          <Card className="p-6 border-slate-200/90 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-500" />
                <span>Unified Search Discovery (Sanitized)</span>
              </h3>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-tabular">
                {search_insights.total_searches} searches
              </span>
            </div>

            {search_insights.top_search_terms.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {search_insights.top_search_terms.map((st) => (
                  <span
                    key={st.term}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-900 text-xs"
                  >
                    <span>&ldquo;{st.term}&rdquo;</span>
                    <span className="text-[10px] font-bold opacity-75">({st.count})</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No search queries executed yet.</p>
            )}
          </Card>
        </div>
      </div>

      {/* PRIVACY & DATA MINIMIZATION AUDIT GUARANTEE */}
      <Card className="p-6 border-slate-200/90 dark:border-slate-800 bg-slate-900 text-white shadow-depth-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Privacy & Data Minimization Governance</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                  100% COMPLIANT
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Audited against zero-PII standards and non-intrusive telemetry principles.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div>
              <span className="text-slate-400 block text-[10px]">Sensitive Fields Blocked</span>
              <span className="text-emerald-400 font-bold font-tabular">
                {privacy_audit.sensitive_fields_blocked_count} fields
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">DNT Signals Honored</span>
              <span className="text-emerald-400 font-bold font-tabular">
                {privacy_audit.dnt_signals_honored_count}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Third-Party Trackers</span>
              <span className="text-emerald-400 font-bold font-tabular">0 (None)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {privacy_audit.privacy_notes.map((note, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-slate-800/80 border border-slate-750 flex items-start gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-slate-300 text-[11px] leading-relaxed">{note}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
