'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Plus,
  Edit,
  Trash2,
  Eye,
  Archive,
  RefreshCw,
  Search,
  Layers,
  BookOpen,
  FileText,
  HelpCircle,
  Award,
  History,
  Tag,
  ExternalLink,
  X,
  Lock,
  ChevronRight,
  AlertCircle,
  Database,
  Building,
  GraduationCap,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  ContentStatus,
  DifficultyLevel,
  QuestionType,
  SourceType,
} from '@/lib/db/types';
import { AdminAnalyticsDashboard } from '@/components/admin/AdminAnalyticsDashboard';

type TabType =
  | 'overview'
  | 'analytics'
  | 'hierarchy'
  | 'syllabus'
  | 'questions'
  | 'clusters'
  | 'answers'
  | 'notes'
  | 'quizzes'
  | 'sources'
  | 'audit';

type HierarchySubTab =
  | 'universities'
  | 'patterns'
  | 'branches'
  | 'academic-years'
  | 'semesters'
  | 'subjects';

export default function AdminPortal() {
  const { user, isAdmin, isLoading: isAuthLoading } = useAuth();

  // Navigation state
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [hierarchyTab, setHierarchyTab] = useState<HierarchySubTab>('subjects');

  // Loading & error state
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Data storage
  const [stats, setStats] = useState<any>(null);
  const [statusBreakdown, setStatusBreakdown] = useState<Record<string, number>>({});
  const [universities, setUniversities] = useState<any[]>([]);
  const [patterns, setPatterns] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [syllabusItems, setSyllabusItems] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [occurrences, setOccurrences] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [clusters, setClusters] = useState<any[]>([]);
  const [auditRecords, setAuditRecords] = useState<any[]>([]);

  // Modal / Drawer state
  const [modalType, setModalType] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);
  const [previewItem, setPreviewItem] = useState<{ type: string; data: any } | null>(null);
  const [verifyModal, setVerifyModal] = useState<{ entity_type: string; entity_id: string; title: string; current_status: string } | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  // Fetch all CMS data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        statsRes,
        unisRes,
        patsRes,
        branchRes,
        yearsRes,
        semsRes,
        subsRes,
        unitsRes,
        topicsRes,
        sylRes,
        qRes,
        occRes,
        ansRes,
        notesRes,
        quizRes,
        srcRes,
        clustersRes,
        auditRes,
      ] = await Promise.all([
        fetch('/api/admin').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/universities?limit=100').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/patterns?include_inactive=true&limit=100').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/branches?include_inactive=true&limit=100').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/academic-years?include_inactive=true&limit=100').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/semesters?include_inactive=true&limit=100').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/subjects?limit=100').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/units?limit=100').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/topics?limit=100').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/syllabus?limit=100').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/questions?limit=100').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/occurrences?limit=100').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/answers?limit=100').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/notes?limit=100').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/quizzes?limit=100').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/sources?limit=100').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/pyqs/clusters?limit=100').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/admin/audit?limit=100').then((r) => (r.ok ? r.json() : null)),
      ]);

      if (statsRes?.data) {
        setStats(statsRes.data.stats);
        setStatusBreakdown(statsRes.data.status_breakdown || {});
      }
      if (unisRes?.data) setUniversities(unisRes.data);
      if (patsRes?.data) setPatterns(patsRes.data);
      if (branchRes?.data) setBranches(branchRes.data);
      if (yearsRes?.data) setAcademicYears(yearsRes.data);
      if (semsRes?.data) setSemesters(semsRes.data);
      if (subsRes?.data) setSubjects(subsRes.data);
      if (unitsRes?.data) setUnits(unitsRes.data);
      if (topicsRes?.data) setTopics(topicsRes.data);
      if (sylRes?.data) setSyllabusItems(sylRes.data);
      if (qRes?.data) setQuestions(qRes.data);
      if (occRes?.data) setOccurrences(occRes.data);
      if (ansRes?.data) setAnswers(ansRes.data);
      if (notesRes?.data) setNotes(notesRes.data);
      if (quizRes?.data) setQuizzes(quizRes.data);
      if (srcRes?.data) setSources(srcRes.data);
      if (clustersRes?.data) setClusters(clustersRes.data);
      if (auditRes?.data) setAuditRecords(auditRes.data);
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to load CMS data from server' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Flash message helper
  const flash = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Status transition / verification handler
  const handleVerifyStatus = async (
    entity_type: string,
    entity_id: string,
    target_status: ContentStatus,
    notesText?: string
  ) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_type,
          entity_id,
          status: target_status,
          review_notes: notesText || `Status transitioned to ${target_status} via Admin CMS`,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Verification update failed');
      }

      flash(`Successfully updated status to ${target_status}`);
      setVerifyModal(null);
      setReviewNotes('');
      await loadData();
    } catch (err: any) {
      flash(err.message || 'Action failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Cluster approve handler
  const handleApproveCluster = async (clusterId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/clusters/${encodeURIComponent(clusterId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPROVE' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Approval failed');
      flash('Cluster successfully approved and published to students!');
      await loadData();
    } catch (err: any) {
      flash(err.message || 'Action failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Cluster reject handler
  const handleRejectCluster = async (clusterId: string) => {
    const reason = prompt('Enter rejection reason (optional):');
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/clusters/${encodeURIComponent(clusterId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REJECT', reason }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Rejection failed');
      flash('Cluster rejected and removed from student views.');
      await loadData();
    } catch (err: any) {
      flash(err.message || 'Action failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Auto-discover clusters handler
  const handleAutoDiscover = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/clusters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'AUTO_DISCOVER', subject_id: 'sub-dbms' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Discovery failed');
      flash(json.data?.message || 'Auto-discovery complete!');
      await loadData();
    } catch (err: any) {
      flash(err.message || 'Discovery failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Generic delete / archive handler
  const handleDelete = async (endpoint: string, id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete / archive "${name}"?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${endpoint}?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Delete operation failed');
      }
      flash(`"${name}" deleted or archived successfully`);
      await loadData();
    } catch (err: any) {
      flash(err.message || 'Delete failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Generic modal form submit
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActionLoading(true);
    const formData = new FormData(e.currentTarget);
    const payload: Record<string, any> = {};

    formData.forEach((value, key) => {
      if (value === 'true') payload[key] = true;
      else if (value === 'false') payload[key] = false;
      else if (['marks', 'year', 'hours_allocated', 'unit_number', 'year_number', 'semester_number', 'order_index', 'read_time_minutes', 'duration_minutes', 'passing_score', 'total_questions', 'effective_year', 'price_inr', 'weightage_percentage', 'total_units', 'total_credits'].includes(key)) {
        payload[key] = Number(value);
      } else if (key === 'key_points') {
        payload[key] = String(value).split('\n').map((s) => s.trim()).filter(Boolean);
      } else {
        payload[key] = value;
      }
    });

    try {
      const isEditing = Boolean(modalData?.id);
      let endpoint = '';
      let method = isEditing ? 'PUT' : 'POST';

      switch (modalType) {
        case 'university':
          endpoint = '/api/universities';
          break;
        case 'pattern':
          endpoint = '/api/patterns';
          break;
        case 'branch':
          endpoint = '/api/branches';
          break;
        case 'academic-year':
          endpoint = '/api/academic-years';
          break;
        case 'semester':
          endpoint = '/api/semesters';
          break;
        case 'subject':
          endpoint = isEditing ? `/api/subjects/${modalData.id}` : '/api/subjects';
          break;
        case 'unit':
          endpoint = '/api/units';
          break;
        case 'topic':
          endpoint = '/api/topics';
          break;
        case 'syllabus':
          endpoint = '/api/syllabus';
          break;
        case 'question':
          endpoint = isEditing ? `/api/questions/${modalData.id}` : '/api/questions';
          break;
        case 'cluster':
          endpoint = isEditing ? `/api/admin/clusters/${modalData.id}` : '/api/admin/clusters';
          break;
        case 'occurrence':
          endpoint = '/api/occurrences';
          break;
        case 'answer':
          endpoint = '/api/answers';
          break;
        case 'note':
          endpoint = '/api/notes';
          break;
        case 'quiz':
          endpoint = '/api/quizzes';
          break;
        case 'source':
          endpoint = '/api/sources';
          break;
      }

      const res = await fetch(isEditing && !endpoint.includes(modalData.id) ? `${endpoint}?id=${modalData.id}` : endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Operation failed');
      }

      flash(`${modalType?.toUpperCase()} saved successfully!`);
      setModalType(null);
      setModalData(null);
      await loadData();
    } catch (err: any) {
      flash(err.message || 'Failed to submit form', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Status badge styling
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge variant="success">PUBLISHED</Badge>;
      case 'VERIFIED':
        return <Badge variant="brand">VERIFIED</Badge>;
      case 'REVIEW':
        return <Badge variant="warning">IN REVIEW</Badge>;
      case 'DRAFT':
        return <Badge variant="amber">DRAFT</Badge>;
      case 'ARCHIVED':
        return <Badge variant="default">ARCHIVED</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  // If user is not admin, show restricted screen
  if (!isAuthLoading && (!user || user.role !== 'ADMIN')) {
    return (
      <div className="flex flex-col min-h-screen bg-[#fafaf9] dark:bg-[#0a0a0b]">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-6">
          <Card className="max-w-md w-full p-8 text-center space-y-4 border-zinc-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
              Administrator Access Required
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Only authenticated users with the <span className="font-semibold text-rose-500">ADMIN</span> role have clearance to access the ScoreEdge Academic CMS.
            </p>
            {user ? (
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs text-zinc-600 dark:text-zinc-300">
                Logged in as <span className="font-semibold">{user.email}</span> (Role: <span className="uppercase font-bold">{user.role}</span>).
              </div>
            ) : null}
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/login?redirect=/admin">
                <Button variant="primary" className="w-full text-xs">
                  Sign in with Admin Credentials
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full text-xs">
                  Return to Homepage
                </Button>
              </Link>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#fafaf9] dark:bg-[#0a0a0b]">
      <Navbar />

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Flash Notifications */}
        {statusMessage && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-md transition-all ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-500" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 md:p-8 rounded-2xl border border-slate-800 shadow-depth-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                ScoreEdge Content Management System
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                {user?.role || 'ADMIN'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Academic Curriculum & Content Governance
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Admin: <span className="text-slate-200 font-semibold">{user?.full_name || 'Academic Lead'}</span> ({user?.email || 'admin@scoreedge.in'}). Strictly guards student exposure.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="gap-1.5 text-xs text-slate-300 border-slate-700 hover:bg-slate-800"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh CMS</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setModalType('question');
                setModalData(null);
              }}
              className="gap-1.5 text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>New Question / PYQ</span>
            </Button>
          </div>
        </div>

        {/* Real-time Status Breakdown Bar */}
        <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-depth-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
            Status Filter:
          </span>
          {['ALL', 'DRAFT', 'REVIEW', 'VERIFIED', 'PUBLISHED', 'ARCHIVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-control text-xs font-semibold transition-all flex items-center gap-1.5 ${
                statusFilter === st
                  ? 'bg-slate-900 text-white dark:bg-brand-600 dark:text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              <span>{st}</span>
              {st !== 'ALL' && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20">
                  {statusBreakdown[st] || 0}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Primary CMS Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: Database },
            { id: 'analytics', label: 'Conversion Funnel & Analytics', icon: TrendingUp },
            { id: 'hierarchy', label: 'Hierarchy (Univ/Branches/Subjects)', icon: Building },
            { id: 'syllabus', label: 'Units, Topics & Syllabus', icon: BookOpen },
            { id: 'questions', label: 'Questions & PYQs', icon: HelpCircle },
            { id: 'clusters', label: 'Question Clusters & Repetitions', icon: Layers },
            { id: 'answers', label: 'Model Answers', icon: Award },
            { id: 'notes', label: 'Study Notes', icon: FileText },
            { id: 'quizzes', label: 'Practice Quizzes', icon: Sparkles },
            { id: 'sources', label: 'Question Sources', icon: Tag },
            { id: 'audit', label: 'Audit Trail & Verification', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-control text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <Card className="p-4 border-slate-200/90 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 font-semibold block">Universities</span>
                <span className="text-xl font-bold font-tabular text-slate-900 dark:text-white">
                  {stats?.total_universities ?? universities.length}
                </span>
                <span className="text-[10px] text-brand-600 dark:text-brand-400 block mt-0.5">SPPU Primary</span>
              </Card>
              <Card className="p-4 border-slate-200/90 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 font-semibold block">Patterns & Branches</span>
                <span className="text-xl font-bold font-tabular text-slate-900 dark:text-white">
                  {patterns.length} / {branches.length}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">2019 & 2024</span>
              </Card>
              <Card className="p-4 border-slate-200/90 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 font-semibold block">Subjects Active</span>
                <span className="text-xl font-bold font-tabular text-slate-900 dark:text-white">
                  {stats?.total_subjects ?? subjects.length}
                </span>
                <span className="text-[10px] text-brand-600 block mt-0.5">{units.length} Units</span>
              </Card>
              <Card className="p-4 border-slate-200/90 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 font-semibold block">Total Questions</span>
                <span className="text-xl font-bold font-tabular text-slate-900 dark:text-white">
                  {stats?.total_questions ?? questions.length}
                </span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">{occurrences.length} Occurrences</span>
              </Card>
              <Card className="p-4 border-slate-200/90 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 font-semibold block">Notes & Answers</span>
                <span className="text-xl font-bold font-tabular text-slate-900 dark:text-white">
                  {notes.length} / {answers.length}
                </span>
                <span className="text-[10px] text-amber-600 block mt-0.5">{quizzes.length} Quizzes</span>
              </Card>
              <Card className="p-4 border-slate-200/90 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 font-semibold block">Sources & Audits</span>
                <span className="text-xl font-bold font-tabular text-slate-900 dark:text-white">
                  {sources.length} / {auditRecords.length}
                </span>
                <span className="text-[10px] text-purple-600 block mt-0.5">Full Audit Log</span>
              </Card>
            </div>

            {/* Verification Queue Preview */}
            <Card className="p-6 border-slate-200/90 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-brand-500" />
                    <span>Recent Content Verification & Publishing Queue</span>
                  </h2>
                  <p className="text-xs text-slate-500">Items requiring reviewer validation or ready for publishing to students.</p>
                </div>
                <Badge variant="warning">
                  {questions.filter((q) => q.content_status === 'REVIEW' || q.verification_status === 'NEEDS_REVIEW').length} in Review
                </Badge>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {questions.slice(0, 5).map((q) => (
                  <div key={q.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2">
                        {renderStatusBadge(q.content_status)}
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {q.question_text}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {q.marks} Marks • {q.difficulty} • {q.question_type} • ID: <code className="font-mono">{q.id}</code>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs gap-1"
                        onClick={() => setPreviewItem({ type: 'question', data: q })}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </Button>
                      {q.content_status !== 'PUBLISHED' ? (
                        <Button
                          size="sm"
                          variant="primary"
                          className="text-xs gap-1"
                          onClick={() => handleVerifyStatus('QUESTION', q.id, 'PUBLISHED', 'Published via Quick Action')}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Publish</span>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs gap-1 text-slate-500"
                          onClick={() => handleVerifyStatus('QUESTION', q.id, 'ARCHIVED', 'Archived via Quick Action')}
                        >
                          <Archive className="w-3.5 h-3.5" />
                          <span>Archive</span>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* TAB: ANALYTICS & CONVERSION FUNNEL */}
        {activeTab === 'analytics' && <AdminAnalyticsDashboard />}

        {/* TAB 2: HIERARCHY */}
        {activeTab === 'hierarchy' && (
          <div className="space-y-4">
            {/* Subtabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'universities', label: 'Universities', count: universities.length },
                { id: 'patterns', label: 'Patterns', count: patterns.length },
                { id: 'branches', label: 'Branches', count: branches.length },
                { id: 'academic-years', label: 'Academic Years', count: academicYears.length },
                { id: 'semesters', label: 'Semesters', count: semesters.length },
                { id: 'subjects', label: 'Subjects', count: subjects.length },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setHierarchyTab(st.id as HierarchySubTab)}
                  className={`px-3 py-1.5 rounded-control text-xs font-bold transition-all ${
                    hierarchyTab === st.id
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {st.label} ({st.count})
                </button>
              ))}
            </div>

            {/* SUBJECTS VIEW */}
            {hierarchyTab === 'subjects' && (
              <Card className="p-6 space-y-4 border-slate-200/90 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Curriculum Subjects
                    </h2>
                    <p className="text-xs text-slate-500">Manage credit allocation, course codes, and unit distribution.</p>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    className="text-xs gap-1.5"
                    onClick={() => {
                      setModalType('subject');
                      setModalData(null);
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Subject</span>
                  </Button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {subjects.map((sub) => (
                    <div key={sub.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {sub.name} ({sub.short_name})
                          </span>
                          <Badge variant="brand">{sub.code}</Badge>
                          {sub.is_popular && <Badge variant="warning">Popular</Badge>}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Credits: {sub.total_credits} • Units: {sub.total_units} • ID: <code className="font-mono">{sub.id}</code>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs gap-1"
                          onClick={() => {
                            setModalType('subject');
                            setModalData(sub);
                          }}
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs gap-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          onClick={() => handleDelete('/api/subjects', sub.id, sub.name)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* UNIVERSITIES VIEW */}
            {hierarchyTab === 'universities' && (
              <Card className="p-6 space-y-4 border-slate-200/90 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Configured Universities</h2>
                  <Button
                    size="sm"
                    variant="primary"
                    className="text-xs gap-1"
                    onClick={() => {
                      setModalType('university');
                      setModalData(null);
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add University</span>
                  </Button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {universities.map((u) => (
                    <div key={u.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{u.name}</span>
                          <Badge variant="brand">{u.code}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{u.state}, {u.country} {u.website && `• ${u.website}`}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => { setModalType('university'); setModalData(u); }}>
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs text-rose-600" onClick={() => handleDelete('/api/universities', u.id, u.name)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* PATTERNS VIEW */}
            {hierarchyTab === 'patterns' && (
              <Card className="p-6 space-y-4 border-slate-200/90 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Curriculum Patterns</h2>
                  <Button size="sm" variant="primary" className="text-xs gap-1" onClick={() => { setModalType('pattern'); setModalData(null); }}>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Pattern</span>
                  </Button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {patterns.map((p) => (
                    <div key={p.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{p.name}</span>
                          <Badge variant="brand">{p.code}</Badge>
                          <Badge variant={p.is_active ? 'success' : 'default'}>{p.is_active ? 'Active' : 'Inactive'}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Effective Year: {p.effective_year} • ID: {p.id}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => { setModalType('pattern'); setModalData(p); }}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs text-rose-600" onClick={() => handleDelete('/api/patterns', p.id, p.name)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* BRANCHES VIEW */}
            {hierarchyTab === 'branches' && (
              <Card className="p-6 space-y-4 border-slate-200/90 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Engineering Branches</h2>
                  <Button size="sm" variant="primary" className="text-xs gap-1" onClick={() => { setModalType('branch'); setModalData(null); }}>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Branch</span>
                  </Button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {branches.map((b) => (
                    <div key={b.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{b.name}</span>
                          <Badge variant="brand">{b.code}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{b.description || 'No description'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => { setModalType('branch'); setModalData(b); }}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs text-rose-600" onClick={() => handleDelete('/api/branches', b.id, b.name)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* ACADEMIC YEARS & SEMESTERS */}
            {hierarchyTab === 'academic-years' && (
              <Card className="p-6 space-y-4 border-slate-200/90 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Academic Years (FE, SE, TE, BE)</h2>
                  <Button size="sm" variant="primary" className="text-xs gap-1" onClick={() => { setModalType('academic-year'); setModalData(null); }}>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Year</span>
                  </Button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {academicYears.map((ay) => (
                    <div key={ay.id} className="py-3 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{ay.name} ({ay.code})</span>
                        <p className="text-xs text-slate-500">Year Number: {ay.year_number} • ID: {ay.id}</p>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => { setModalType('academic-year'); setModalData(ay); }}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {hierarchyTab === 'semesters' && (
              <Card className="p-6 space-y-4 border-slate-200/90 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Semesters (Sem 1 to Sem 8)</h2>
                  <Button size="sm" variant="primary" className="text-xs gap-1" onClick={() => { setModalType('semester'); setModalData(null); }}>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Semester</span>
                  </Button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {semesters.map((s) => (
                    <div key={s.id} className="py-3 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{s.name} (Semester {s.semester_number})</span>
                        <p className="text-xs text-slate-500">Academic Year ID: {s.academic_year_id}</p>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => { setModalType('semester'); setModalData(s); }}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* TAB 3: UNITS, TOPICS & SYLLABUS */}
        {activeTab === 'syllabus' && (
          <div className="space-y-6">
            {/* Units & Topics */}
            <Card className="p-6 space-y-4 border-slate-200/90 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Subject Units & Topics</h2>
                  <p className="text-xs text-slate-500">Organize units with weightage and map subtopics with importance levels.</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => { setModalType('unit'); setModalData(null); }}>
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Unit</span>
                  </Button>
                  <Button size="sm" variant="primary" className="text-xs gap-1" onClick={() => { setModalType('topic'); setModalData(null); }}>
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Topic</span>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Units List ({units.length})</h3>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-1">
                    {units.map((u) => (
                      <div key={u.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white">Unit {u.unit_number}: {u.title}</span>
                          <span className="text-slate-500 block text-[11px]">{u.weightage_percentage}% Weightage</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="p-1 h-7" onClick={() => { setModalType('unit'); setModalData(u); }}>
                            <Edit className="w-3.5 h-3.5 text-slate-500" />
                          </Button>
                          <Button size="sm" variant="ghost" className="p-1 h-7" onClick={() => handleDelete('/api/units', u.id, u.title)}>
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Topics List ({topics.length})</h3>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-1">
                    {topics.map((t) => (
                      <div key={t.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white">{t.title}</span>
                          <span className="text-slate-500 block text-[11px]">Priority: {t.importance_level}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="p-1 h-7" onClick={() => { setModalType('topic'); setModalData(t); }}>
                            <Edit className="w-3.5 h-3.5 text-slate-500" />
                          </Button>
                          <Button size="sm" variant="ghost" className="p-1 h-7" onClick={() => handleDelete('/api/topics', t.id, t.title)}>
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Official Syllabus Items */}
            <Card className="p-6 space-y-4 border-slate-200/90 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Official Syllabus Items</h2>
                  <p className="text-xs text-slate-500">Manage detailed unit curriculum descriptions and teaching hours.</p>
                </div>
                <Button size="sm" variant="primary" className="text-xs gap-1" onClick={() => { setModalType('syllabus'); setModalData(null); }}>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Syllabus Item</span>
                </Button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {syllabusItems.map((s) => (
                  <div key={s.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {renderStatusBadge(s.content_status || 'PUBLISHED')}
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {s.unit ? `Unit ${s.unit.unit_number}: ${s.unit.title}` : `Unit ID: ${s.unit_id}`}
                        </span>
                        <Badge variant="brand">{s.hours_allocated} Hours</Badge>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{s.content}</p>
                      {s.reference_materials && (
                        <p className="text-[11px] text-slate-500">Refs: {s.reference_materials}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs gap-1"
                        onClick={() => {
                          setModalType('syllabus');
                          setModalData(s);
                        }}
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs text-rose-600"
                        onClick={() => handleDelete('/api/syllabus', s.id, 'Syllabus Item')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* TAB 4: QUESTIONS & PYQS */}
        {activeTab === 'questions' && (
          <Card className="p-6 space-y-4 border-slate-200/90 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Academic Question Bank & PYQ Repository
                </h2>
                <p className="text-xs text-slate-500">Lifecycle management: DRAFT, REVIEW, VERIFIED, PUBLISHED, ARCHIVED.</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs gap-1"
                  onClick={() => {
                    setModalType('occurrence');
                    setModalData(null);
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Attach Exam Appearance</span>
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  className="text-xs gap-1"
                  onClick={() => {
                    setModalType('question');
                    setModalData(null);
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Question</span>
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-3">
              <div className="relative flex-grow">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search questions by text or concept..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-850 rounded-control border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {questions
                .filter((q) => statusFilter === 'ALL' || q.content_status === statusFilter)
                .filter((q) => !searchQuery || q.question_text.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((q) => {
                  const qOccurrences = occurrences.filter((o) => o.question_id === q.id);
                  const qAnswers = answers.filter((a) => a.question_id === q.id);
                  const source = sources.find((s) => s.id === q.source_id);

                  return (
                    <div key={q.id} className="py-4 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1 max-w-3xl">
                          <div className="flex flex-wrap items-center gap-2">
                            {renderStatusBadge(q.content_status)}
                            <Badge variant={q.is_pyq ? 'brand' : 'default'}>
                              {q.is_pyq ? 'PYQ' : 'Question Bank'}
                            </Badge>
                            <Badge variant="warning">{q.marks} Marks</Badge>
                            <Badge variant="outline">{q.difficulty}</Badge>
                            <Badge variant="outline">{q.question_type}</Badge>
                            {source && (
                              <Badge variant="amber">
                                Source: {source.name}
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-1">
                            {q.question_text}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                            <span>Subject: {q.subject?.name || q.subject_id}</span>
                            <span>•</span>
                            <span>Unit: {q.unit?.title || q.unit_id}</span>
                            <span>•</span>
                            <span>Occurrences: <strong className="text-slate-700 dark:text-slate-300">{qOccurrences.length}</strong></span>
                            <span>•</span>
                            <span>Answers: <strong className="text-slate-700 dark:text-slate-300">{qAnswers.length}</strong></span>
                          </div>
                        </div>

                        {/* Lifecycle & CMS Actions */}
                        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs gap-1"
                            onClick={() => setPreviewItem({ type: 'question', data: q })}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </Button>

                          {q.content_status !== 'PUBLISHED' && (
                            <Button
                              size="sm"
                              variant="primary"
                              className="text-xs gap-1"
                              onClick={() => handleVerifyStatus('QUESTION', q.id, 'PUBLISHED', 'Approved & Published directly')}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Publish</span>
                            </Button>
                          )}

                          {q.content_status !== 'REVIEW' && q.content_status !== 'PUBLISHED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={() => handleVerifyStatus('QUESTION', q.id, 'REVIEW', 'Sent to review queue')}
                            >
                              To Review
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => {
                              setModalType('question');
                              setModalData(q);
                            }}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            onClick={() => handleDelete('/api/questions', q.id, q.question_text.slice(0, 30))}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Display Occurrences inline */}
                      {qOccurrences.length > 0 && (
                        <div className="bg-slate-50 dark:bg-slate-850 p-2.5 rounded-control border border-slate-200/80 dark:border-slate-800 text-xs flex flex-wrap items-center gap-2">
                          <span className="text-slate-500 font-bold text-[11px]">Exam Papers:</span>
                          {qOccurrences.map((occ) => (
                            <span
                              key={occ.id}
                              className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1"
                            >
                              <span>{occ.year} {occ.exam_session} Q{occ.question_number} ({occ.marks}M)</span>
                              <button
                                onClick={() => handleDelete('/api/occurrences', occ.id, `Occurrence ${occ.year}`)}
                                className="text-slate-400 hover:text-rose-500"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </Card>
        )}

        {/* TAB: QUESTION CLUSTERS & REPETITIONS */}
        {activeTab === 'clusters' && (
          <Card className="p-6 space-y-5 border-slate-200/90 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-600" />
                  <span>Question Repetition Clusters & Intelligence</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Review and verify repeated exam concepts. Grouped by exact, near, wording, and concept variations.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs gap-1"
                  onClick={handleAutoDiscover}
                  disabled={actionLoading}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Auto-Discover Clusters</span>
                </Button>

                <Button
                  size="sm"
                  variant="primary"
                  className="text-xs gap-1"
                  onClick={() => {
                    setModalType('cluster');
                    setModalData(null);
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Cluster</span>
                </Button>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {clusters.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">
                  No question clusters found. Click &quot;Auto-Discover Clusters&quot; to detect repetitions across past papers.
                </div>
              ) : (
                clusters.map((cluster) => {
                  const isApproved = cluster.review_status === 'APPROVED' || cluster.human_approved;
                  const isPending = cluster.review_status === 'PENDING_REVIEW' || (!cluster.review_status && !cluster.human_approved);
                  const isRejected = cluster.review_status === 'REJECTED';

                  return (
                    <div key={cluster.id} className="py-5 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                                isApproved
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                                  : isPending
                                  ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                                  : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                              }`}
                            >
                              {cluster.review_status || (cluster.human_approved ? 'APPROVED' : 'PENDING REVIEW')}
                            </span>

                            {cluster.primary_repetition_type && (
                              <Badge variant="outline" className="text-[10px]">
                                {cluster.primary_repetition_type.replace('_', ' ')}
                              </Badge>
                            )}

                            <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                              {cluster.repetition_summary || `Repeated/Similar in ${cluster.occurrence_count} verified papers`}
                            </span>

                            <span className="text-[11px] font-semibold text-slate-500">
                              Confidence: {Math.round(cluster.confidence_score * 100)}%
                            </span>

                            <span className="text-[11px] text-slate-400">
                              Typical: {cluster.typical_marks}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {cluster.canonical_name}
                          </h3>

                          <p className="text-xs text-slate-700 dark:text-slate-300 font-serif italic">
                            &quot;{cluster.canonical_question}&quot;
                          </p>

                          {cluster.years && cluster.years.length > 0 && (
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                              <History className="w-3 h-3 text-slate-400" />
                              <span>Examination Years: {cluster.years.join(', ')}</span>
                            </div>
                          )}
                        </div>

                        {/* Admin Verification Controls */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isPending && (
                            <>
                              <Button
                                size="sm"
                                variant="primary"
                                className="text-xs gap-1 bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => handleApproveCluster(cluster.id)}
                                disabled={actionLoading}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs gap-1 text-rose-600 hover:bg-rose-50"
                                onClick={() => handleRejectCluster(cluster.id)}
                                disabled={actionLoading}
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </Button>
                            </>
                          )}

                          {isApproved && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs gap-1 text-rose-600 hover:bg-rose-50"
                              onClick={() => handleRejectCluster(cluster.id)}
                              disabled={actionLoading}
                            >
                              <span>Revoke Approval</span>
                            </Button>
                          )}

                          {isRejected && (
                            <Button
                              size="sm"
                              variant="primary"
                              className="text-xs gap-1 bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => handleApproveCluster(cluster.id)}
                              disabled={actionLoading}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Re-Approve</span>
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs text-rose-600 hover:bg-rose-50"
                            onClick={() => handleDelete('/api/admin/clusters', cluster.id, cluster.canonical_name)}
                            disabled={actionLoading}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Display Cluster Member Variations */}
                      {cluster.members && cluster.members.length > 0 && (
                        <div className="bg-slate-50 dark:bg-slate-850/80 p-3 rounded-control border border-slate-200/80 dark:border-slate-800 space-y-2">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                            Question Variations & Repetition Members ({cluster.members.length}):
                          </span>
                          <div className="space-y-1.5">
                            {cluster.members.map((m: any) => (
                              <div
                                key={m.member_id || m.question_id}
                                className="text-xs p-2 rounded bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex items-start justify-between gap-2"
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[10px]">
                                      {m.repetition_type ? m.repetition_type.replace('_', ' ') : 'VARIATION'}
                                    </Badge>
                                    <span className="font-semibold text-slate-600 dark:text-slate-400">
                                      {m.marks}M
                                    </span>
                                    {m.confidence_level && (
                                      <span className="text-[10px] text-slate-400">
                                        Similarity: {Math.round(m.similarity_score * 100)}% ({m.confidence_level})
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-slate-800 dark:text-slate-200 font-medium">
                                    {m.question_text}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        )}

        {/* TAB 5: MODEL ANSWERS */}
        {activeTab === 'answers' && (
          <Card className="p-6 space-y-4 border-slate-200/90 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Exam Model Answers & Rubrics</h2>
                <p className="text-xs text-slate-500">2-mark, 5-mark, and 10-mark model answers with key points and evaluator tips.</p>
              </div>
              <Button size="sm" variant="primary" className="text-xs gap-1" onClick={() => { setModalType('answer'); setModalData(null); }}>
                <Plus className="w-3.5 h-3.5" />
                <span>Add Model Answer</span>
              </Button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {answers
                .filter((a) => statusFilter === 'ALL' || a.content_status === statusFilter)
                .map((ans) => {
                  const relatedQuestion = questions.find((q) => q.id === ans.question_id);
                  return (
                    <div key={ans.id} className="py-4 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {renderStatusBadge(ans.content_status)}
                            <Badge variant="brand">{ans.marks_target} Marks Target</Badge>
                            {ans.is_premium && <Badge variant="amber">Premium</Badge>}
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-0.5">{ans.heading}</h3>
                          {relatedQuestion && (
                            <p className="text-xs text-slate-500 italic">For Question: {relatedQuestion.question_text}</p>
                          )}
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{ans.summary}</p>
                          {ans.evaluator_tips && (
                            <p className="text-[11px] text-amber-700 dark:text-amber-300">Tip: {ans.evaluator_tips}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => setPreviewItem({ type: 'answer', data: ans })}>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </Button>
                          {ans.content_status !== 'PUBLISHED' && (
                            <Button size="sm" variant="primary" className="text-xs" onClick={() => handleVerifyStatus('ANSWER', ans.id, 'PUBLISHED')}>
                              Publish
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="text-xs" onClick={() => { setModalType('answer'); setModalData(ans); }}>
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs text-rose-600" onClick={() => handleDelete('/api/answers', ans.id, ans.heading)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        )}

        {/* TAB 6: STUDY NOTES */}
        {activeTab === 'notes' && (
          <Card className="p-6 space-y-4 border-slate-200/90 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Curriculum Study Notes</h2>
                <p className="text-xs text-slate-500">Long-form academic study notes, reading time estimates, and preview toggles.</p>
              </div>
              <Button size="sm" variant="primary" className="text-xs gap-1" onClick={() => { setModalType('note'); setModalData(null); }}>
                <Plus className="w-3.5 h-3.5" />
                <span>Create Study Note</span>
              </Button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {notes
                .filter((n) => statusFilter === 'ALL' || n.content_status === statusFilter)
                .map((note) => (
                  <div key={note.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {renderStatusBadge(note.content_status)}
                        <Badge variant="brand">{note.read_time_minutes} min read</Badge>
                        {note.is_free_preview && <Badge variant="success">Free Preview</Badge>}
                        {note.is_premium && <Badge variant="amber">Premium</Badge>}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{note.title}</h3>
                      <p className="text-xs text-slate-500">Slug: <code className="font-mono">{note.slug}</code> • ID: {note.id}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{note.summary}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => setPreviewItem({ type: 'note', data: note })}>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </Button>
                      {note.content_status !== 'PUBLISHED' && (
                        <Button size="sm" variant="primary" className="text-xs" onClick={() => handleVerifyStatus('NOTE', note.id, 'PUBLISHED')}>
                          Publish
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => { setModalType('note'); setModalData(note); }}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs text-rose-600" onClick={() => handleDelete('/api/notes', note.id, note.title)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        )}

        {/* TAB 7: QUIZZES */}
        {activeTab === 'quizzes' && (
          <Card className="p-6 space-y-4 border-slate-200/90 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Practice Quizzes & Assessments</h2>
                <p className="text-xs text-slate-500">Unit-wise self assessment quizzes and timed practice challenges.</p>
              </div>
              <Button size="sm" variant="primary" className="text-xs gap-1" onClick={() => { setModalType('quiz'); setModalData(null); }}>
                <Plus className="w-3.5 h-3.5" />
                <span>Create Quiz</span>
              </Button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {quizzes
                .filter((qz) => statusFilter === 'ALL' || qz.content_status === statusFilter)
                .map((qz) => (
                  <div key={qz.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {renderStatusBadge(qz.content_status)}
                        <Badge variant="brand">{qz.difficulty}</Badge>
                        <Badge variant="outline">{qz.duration_minutes} Mins</Badge>
                        <Badge variant="warning">{qz.total_questions} Questions</Badge>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{qz.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300">{qz.description}</p>
                      <p className="text-[11px] text-slate-500">Passing Score: {qz.passing_score}%</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => setPreviewItem({ type: 'quiz', data: qz })}>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </Button>
                      {qz.content_status !== 'PUBLISHED' && (
                        <Button size="sm" variant="primary" className="text-xs" onClick={() => handleVerifyStatus('QUIZ', qz.id, 'PUBLISHED')}>
                          Publish
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => { setModalType('quiz'); setModalData(qz); }}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs text-rose-600" onClick={() => handleDelete('/api/quizzes', qz.id, qz.title)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        )}

        {/* TAB 8: SOURCES */}
        {activeTab === 'sources' && (
          <Card className="p-6 space-y-4 border-slate-200/90 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Content Source Attribution</h2>
                <p className="text-xs text-slate-500">Official university papers, syllabus documents, standard textbooks, and faculty notes.</p>
              </div>
              <Button size="sm" variant="primary" className="text-xs gap-1" onClick={() => { setModalType('source'); setModalData(null); }}>
                <Plus className="w-3.5 h-3.5" />
                <span>Add Source</span>
              </Button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {sources.map((src) => (
                <div key={src.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{src.name}</span>
                      <Badge variant="brand">{src.source_type}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">License: {src.license_type} {src.copyright_notes && `• ${src.copyright_notes}`}</p>
                    {src.source_url && (
                      <a href={src.source_url} target="_blank" rel="noreferrer" className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 mt-0.5">
                        <span>{src.source_url}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => { setModalType('source'); setModalData(src); }}>
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs text-rose-600" onClick={() => handleDelete('/api/sources', src.id, src.name)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* TAB 9: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <Card className="p-6 space-y-4 border-slate-200/90 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Immutable Audit Trail</h2>
              <p className="text-xs text-slate-500">Review all lifecycle transitions, verification actions, and administrator notes.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Reviewer</th>
                    <th className="py-2.5 px-3">Entity Type</th>
                    <th className="py-2.5 px-3">Entity ID</th>
                    <th className="py-2.5 px-3">Transition</th>
                    <th className="py-2.5 px-3">Review Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {auditRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-400">
                        No audit records captured yet.
                      </td>
                    </tr>
                  ) : (
                    auditRecords.map((aud) => (
                      <tr key={aud.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                        <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">
                          {new Date(aud.created_at).toLocaleString()}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">
                          {aud.reviewer_id}
                        </td>
                        <td className="py-2 px-3 font-bold text-brand-600 dark:text-brand-400">
                          {aud.entity_type}
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-500">
                          {aud.entity_id}
                        </td>
                        <td className="py-2 px-3">
                          <span className="inline-flex items-center gap-1.5 font-bold">
                            <span className="text-slate-500">{aud.status_from}</span>
                            <ChevronRight className="w-3 h-3 text-slate-400" />
                            <span className="text-emerald-600 dark:text-emerald-400">{aud.status_to}</span>
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-600 dark:text-slate-400 italic">
                          {aud.review_notes || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

      </main>

      {/* CREATE / EDIT MODAL DIALOG */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <Card className="max-w-xl w-full p-6 space-y-4 border-slate-700 bg-white dark:bg-slate-900 shadow-depth-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                {modalData ? `Edit ${modalType}` : `Create New ${modalType}`}
              </h2>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              {/* SUBJECT FORM */}
              {modalType === 'subject' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Pattern</label>
                      <select name="pattern_id" defaultValue={modalData?.pattern_id || patterns[0]?.id} className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700">
                        {patterns.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Branch</label>
                      <select name="branch_id" defaultValue={modalData?.branch_id || branches[0]?.id} className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700">
                        {branches.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.code})</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Semester</label>
                    <select name="semester_id" defaultValue={modalData?.semester_id || semesters[0]?.id} className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700">
                      {semesters.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Subject Name</label>
                      <input name="name" defaultValue={modalData?.name || ''} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" placeholder="e.g. Database Management Systems" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Short Name</label>
                      <input name="short_name" defaultValue={modalData?.short_name || ''} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" placeholder="e.g. DBMS" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Course Code</label>
                      <input name="code" defaultValue={modalData?.code || ''} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" placeholder="e.g. 210241" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Total Units</label>
                      <input name="total_units" type="number" defaultValue={modalData?.total_units || 6} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Credits</label>
                      <input name="total_credits" type="number" defaultValue={modalData?.total_credits || 3} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <input type="checkbox" name="is_popular" defaultChecked={modalData?.is_popular || false} />
                      <span>Highlight as Popular Subject</span>
                    </label>
                  </div>
                </>
              )}

              {/* QUESTION FORM */}
              {modalType === 'question' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Subject</label>
                      <select name="subject_id" defaultValue={modalData?.subject_id || subjects[0]?.id} className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700">
                        {subjects.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.short_name})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Unit</label>
                      <select name="unit_id" defaultValue={modalData?.unit_id || units[0]?.id} className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700">
                        {units.map((u) => <option key={u.id} value={u.id}>Unit {u.unit_number}: {u.title}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Question Statement</label>
                    <textarea name="question_text" defaultValue={modalData?.question_text || ''} rows={3} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" placeholder="State question clearly as asked in university exams..." />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Marks</label>
                      <select name="marks" defaultValue={modalData?.marks || 5} className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700">
                        {[2, 3, 4, 5, 6, 7, 8, 10].map((m) => <option key={m} value={m}>{m} Marks</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Difficulty</label>
                      <select name="difficulty" defaultValue={modalData?.difficulty || 'MEDIUM'} className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700">
                        <option value="EASY">EASY</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HARD">HARD</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Type</label>
                      <select name="question_type" defaultValue={modalData?.question_type || 'THEORY'} className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700">
                        <option value="THEORY">THEORY</option>
                        <option value="NUMERICAL">NUMERICAL</option>
                        <option value="MCQ">MCQ</option>
                        <option value="DIAGRAM">DIAGRAM</option>
                        <option value="SHORT_ANSWER">SHORT_ANSWER</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Lifecycle Status</label>
                      <select name="content_status" defaultValue={modalData?.content_status || 'DRAFT'} className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700">
                        <option value="DRAFT">DRAFT (Hidden from students)</option>
                        <option value="REVIEW">REVIEW (In validation queue)</option>
                        <option value="VERIFIED">VERIFIED (Reviewed by Academic)</option>
                        <option value="PUBLISHED">PUBLISHED (Live to students)</option>
                        <option value="ARCHIVED">ARCHIVED (Archived)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Source Attribution</label>
                      <select name="source_id" defaultValue={modalData?.source_id || ''} className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700">
                        <option value="">None / Standard Reference</option>
                        {sources.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.source_type})</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <input type="checkbox" name="is_pyq" defaultChecked={modalData?.is_pyq ?? true} />
                      <span>Has appeared in SPPU previous year exams (PYQ)</span>
                    </label>
                  </div>
                </>
              )}

              {/* OCCURRENCE FORM */}
              {modalType === 'occurrence' && (
                <>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Associated Question</label>
                    <select name="question_id" defaultValue={modalData?.question_id || questions[0]?.id} className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700">
                      {questions.map((q) => <option key={q.id} value={q.id}>{q.question_text.slice(0, 60)}...</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Year</label>
                      <input name="year" type="number" defaultValue={modalData?.year || 2024} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Session</label>
                      <select name="exam_session" defaultValue={modalData?.exam_session || 'IN_SEM'} className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700">
                        <option value="IN_SEM">IN_SEM (30M)</option>
                        <option value="END_SEM">END_SEM (70M)</option>
                        <option value="RE_EXAM">RE_EXAM</option>
                        <option value="SUPPLEMENTARY">SUPPLEMENTARY</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Question Number</label>
                      <input name="question_number" defaultValue={modalData?.question_number || 'Q1(a)'} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Marks in Paper</label>
                      <input name="marks" type="number" defaultValue={modalData?.marks || 5} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Source Exam Paper</label>
                      <select name="source_id" defaultValue={modalData?.source_id || sources[0]?.id || ''} className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700">
                        <option value="">None</option>
                        {sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <input type="hidden" name="pattern_id" value={modalData?.pattern_id || patterns[0]?.id || 'pat-2024'} />
                  <input type="hidden" name="branch_id" value={modalData?.branch_id || branches[0]?.id || 'br-comp'} />
                  <input type="hidden" name="semester_id" value={modalData?.semester_id || semesters[0]?.id || 'sem-3'} />
                  <input type="hidden" name="subject_id" value={modalData?.subject_id || subjects[0]?.id || 'sub-dbms'} />
                </>
              )}

              {/* CLUSTER FORM */}
              {modalType === 'cluster' && (
                <>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Subject</label>
                    <select name="subject_id" defaultValue={modalData?.subject_id || subjects[0]?.id || 'sub-dbms'} className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700">
                      {subjects.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Unit</label>
                    <select name="unit_id" defaultValue={modalData?.unit_id || units[0]?.id} className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700">
                      {units.map((u) => <option key={u.id} value={u.id}>Unit {u.unit_number}: {u.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Canonical Concept Name</label>
                    <input name="canonical_name" defaultValue={modalData?.canonical_name || ''} placeholder="e.g. Normalization (1NF, 2NF, 3NF, BCNF)" required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Canonical Question Text</label>
                    <textarea name="canonical_question" defaultValue={modalData?.canonical_question || ''} rows={3} placeholder="Full canonical question text..." required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Typical Marks Range</label>
                    <input name="typical_marks" defaultValue={modalData?.typical_marks || '8–10 Marks'} placeholder="e.g. 6–8 Marks" required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" />
                  </div>
                </>
              )}

              {/* ANSWER FORM */}
              {modalType === 'answer' && (
                <>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Question</label>
                    <select name="question_id" defaultValue={modalData?.question_id || questions[0]?.id} className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700">
                      {questions.map((q) => <option key={q.id} value={q.id}>{q.question_text.slice(0, 60)}...</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Marks Target</label>
                      <select name="marks_target" defaultValue={modalData?.marks_target || '5'} className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700">
                        <option value="2">2 Marks Target</option>
                        <option value="5">5 Marks Target</option>
                        <option value="10">10 Marks Target</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Heading</label>
                      <input name="heading" defaultValue={modalData?.heading || ''} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" placeholder="e.g. 5-Mark Examination Structure" />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Executive Summary</label>
                    <textarea name="summary" defaultValue={modalData?.summary || ''} rows={2} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" placeholder="Concise definition or conceptual overview..." />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Key Points (One point per line)</label>
                    <textarea name="key_points" defaultValue={modalData?.key_points ? modalData.key_points.join('\n') : ''} rows={4} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" placeholder="Point 1&#10;Point 2&#10;Point 3" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Evaluator Tips</label>
                    <input name="evaluator_tips" defaultValue={modalData?.evaluator_tips || ''} className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" placeholder="e.g. Always draw the 3NF vs BCNF comparison table to earn full marks." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Status</label>
                      <select name="content_status" defaultValue={modalData?.content_status || 'PUBLISHED'} className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700">
                        <option value="DRAFT">DRAFT</option>
                        <option value="REVIEW">REVIEW</option>
                        <option value="VERIFIED">VERIFIED</option>
                        <option value="PUBLISHED">PUBLISHED</option>
                        <option value="ARCHIVED">ARCHIVED</option>
                      </select>
                    </div>
                    <div className="pt-5">
                      <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <input type="checkbox" name="is_premium" defaultChecked={modalData?.is_premium || false} />
                        <span>Requires Semester / Subject Pass</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* STUDY NOTE FORM */}
              {modalType === 'note' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Subject</label>
                      <select name="subject_id" defaultValue={modalData?.subject_id || subjects[0]?.id} className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700">
                        {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Unit</label>
                      <select name="unit_id" defaultValue={modalData?.unit_id || units[0]?.id} className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700">
                        {units.map((u) => <option key={u.id} value={u.id}>{u.title}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Title</label>
                      <input name="title" defaultValue={modalData?.title || ''} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" placeholder="Chapter Note Title" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Slug</label>
                      <input name="slug" defaultValue={modalData?.slug || ''} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" placeholder="e.g. bcnf-decomposition-notes" />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Summary</label>
                    <input name="summary" defaultValue={modalData?.summary || ''} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" placeholder="Brief summary of note topic..." />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Content Body (Markdown)</label>
                    <textarea name="content_body" defaultValue={modalData?.content_body || ''} rows={5} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700 font-mono text-[11px]" placeholder="Detailed academic explanation..." />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Read Time (Mins)</label>
                      <input name="read_time_minutes" type="number" defaultValue={modalData?.read_time_minutes || 5} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Status</label>
                      <select name="content_status" defaultValue={modalData?.content_status || 'PUBLISHED'} className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700">
                        <option value="DRAFT">DRAFT</option>
                        <option value="REVIEW">REVIEW</option>
                        <option value="VERIFIED">VERIFIED</option>
                        <option value="PUBLISHED">PUBLISHED</option>
                        <option value="ARCHIVED">ARCHIVED</option>
                      </select>
                    </div>
                    <div className="pt-5 space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <input type="checkbox" name="is_free_preview" defaultChecked={modalData?.is_free_preview ?? true} />
                        <span>Free Preview</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* CONTENT SOURCE FORM */}
              {modalType === 'source' && (
                <>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Source Name</label>
                    <input name="name" defaultValue={modalData?.name || ''} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" placeholder="e.g. SPPU In-Sem Examination Nov 2024" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Source Type</label>
                    <select name="source_type" defaultValue={modalData?.source_type || 'UNIVERSITY_EXAM_PAPER'} className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700">
                      <option value="UNIVERSITY_EXAM_PAPER">UNIVERSITY_EXAM_PAPER</option>
                      <option value="SYLLABUS_DOCUMENT">SYLLABUS_DOCUMENT</option>
                      <option value="FACULTY_NOTES">FACULTY_NOTES</option>
                      <option value="STANDARD_TEXTBOOK">STANDARD_TEXTBOOK</option>
                      <option value="COMMUNITY_SUBMISSION">COMMUNITY_SUBMISSION</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Source URL (Optional)</label>
                    <input name="source_url" defaultValue={modalData?.source_url || ''} className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">License & Copyright Notes</label>
                    <input name="license_type" defaultValue={modalData?.license_type || 'Academic Fair Use / Official SPPU'} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" />
                  </div>
                </>
              )}

              {/* GENERIC / FALLBACK FOR OTHER ENTITIES */}
              {['university', 'pattern', 'branch', 'academic-year', 'semester', 'unit', 'topic', 'syllabus', 'quiz'].includes(modalType) && (
                <>
                  {modalType === 'university' && (
                    <>
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Code</label>
                        <input name="code" defaultValue={modalData?.code || 'SPPU'} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">University Name</label>
                        <input name="name" defaultValue={modalData?.name || ''} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">State & Country</label>
                        <input name="state" defaultValue={modalData?.state || 'Maharashtra'} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" />
                      </div>
                    </>
                  )}

                  {modalType === 'unit' && (
                    <>
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Subject</label>
                        <select name="subject_id" defaultValue={modalData?.subject_id || subjects[0]?.id} className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700">
                          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Unit Number</label>
                          <input name="unit_number" type="number" defaultValue={modalData?.unit_number || 1} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Weightage %</label>
                          <input name="weightage_percentage" type="number" defaultValue={modalData?.weightage_percentage || 16} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" />
                        </div>
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Title</label>
                        <input name="title" defaultValue={modalData?.title || ''} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Description</label>
                        <textarea name="description" defaultValue={modalData?.description || ''} rows={2} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" />
                      </div>
                    </>
                  )}

                  {modalType === 'topic' && (
                    <>
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Unit</label>
                        <select name="unit_id" defaultValue={modalData?.unit_id || units[0]?.id} className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700">
                          {units.map((u) => <option key={u.id} value={u.id}>Unit {u.unit_number}: {u.title}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Topic Title</label>
                        <input name="title" defaultValue={modalData?.title || ''} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Description</label>
                        <textarea name="description" defaultValue={modalData?.description || ''} rows={2} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Importance</label>
                          <select name="importance_level" defaultValue={modalData?.importance_level || 'MUST_STUDY'} className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700">
                            <option value="MUST_STUDY">MUST_STUDY</option>
                            <option value="HIGH">HIGH</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="LOW">LOW</option>
                          </select>
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Order Index</label>
                          <input name="order_index" type="number" defaultValue={modalData?.order_index || 1} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" />
                        </div>
                      </div>
                    </>
                  )}

                  {modalType === 'syllabus' && (
                    <>
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Unit</label>
                        <select name="unit_id" defaultValue={modalData?.unit_id || units[0]?.id} className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700">
                          {units.map((u) => <option key={u.id} value={u.id}>Unit {u.unit_number}: {u.title}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Syllabus Text</label>
                        <textarea name="content" defaultValue={modalData?.content || ''} rows={4} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" placeholder="Official SPPU syllabus statement..." />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Hours Allocated</label>
                          <input name="hours_allocated" type="number" defaultValue={modalData?.hours_allocated || 6} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Status</label>
                          <select name="content_status" defaultValue={modalData?.content_status || 'PUBLISHED'} className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700">
                            <option value="DRAFT">DRAFT</option>
                            <option value="REVIEW">REVIEW</option>
                            <option value="VERIFIED">VERIFIED</option>
                            <option value="PUBLISHED">PUBLISHED</option>
                            <option value="ARCHIVED">ARCHIVED</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Reference Materials</label>
                        <input name="reference_materials" defaultValue={modalData?.reference_materials || ''} className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" placeholder="e.g. Silberschatz Chapter 6" />
                      </div>
                    </>
                  )}

                  {modalType === 'quiz' && (
                    <>
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Subject</label>
                        <select name="subject_id" defaultValue={modalData?.subject_id || subjects[0]?.id} className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700">
                          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Quiz Title</label>
                        <input name="title" defaultValue={modalData?.title || ''} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Description</label>
                        <textarea name="description" defaultValue={modalData?.description || ''} rows={2} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Duration (min)</label>
                          <input name="duration_minutes" type="number" defaultValue={modalData?.duration_minutes || 15} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Questions</label>
                          <input name="total_questions" type="number" defaultValue={modalData?.total_questions || 10} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Passing %</label>
                          <input name="passing_score" type="number" defaultValue={modalData?.passing_score || 60} required className="w-full p-2 rounded-control border bg-transparent border-slate-300 dark:border-slate-700" />
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalType(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : 'Save to CMS'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* LIVE PREVIEW DRAWER */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-end p-0">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-xl h-full shadow-depth-3 p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-brand-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Academic Content Live Preview
                </h2>
              </div>
              <button onClick={() => setPreviewItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {previewItem.type === 'question' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {renderStatusBadge(previewItem.data.content_status)}
                  <Badge variant="brand">{previewItem.data.marks} Marks</Badge>
                  <Badge variant="warning">{previewItem.data.difficulty}</Badge>
                  <Badge variant="outline">{previewItem.data.question_type}</Badge>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 uppercase font-bold block mb-1">Student View:</span>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                    {previewItem.data.question_text}
                  </h3>
                </div>
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <p><strong>Internal ID:</strong> {previewItem.data.id}</p>
                  <p><strong>Subject ID:</strong> {previewItem.data.subject_id}</p>
                  <p><strong>Unit ID:</strong> {previewItem.data.unit_id}</p>
                  <p><strong>Created:</strong> {new Date(previewItem.data.created_at).toLocaleString()}</p>
                </div>
              </div>
            )}

            {previewItem.type === 'note' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {renderStatusBadge(previewItem.data.content_status)}
                  <Badge variant="brand">{previewItem.data.read_time_minutes} min read</Badge>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{previewItem.data.title}</h2>
                <p className="text-xs text-slate-500 italic">{previewItem.data.summary}</p>
                <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 font-serif leading-relaxed text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line">
                  {previewItem.data.content_body}
                </div>
              </div>
            )}

            {previewItem.type === 'answer' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {renderStatusBadge(previewItem.data.content_status)}
                  <Badge variant="brand">{previewItem.data.marks_target} Marks Target</Badge>
                  {previewItem.data.is_premium && <Badge variant="amber">Premium Model Answer</Badge>}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{previewItem.data.heading}</h3>
                <div className="p-3 bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/60 rounded-xl text-xs text-slate-800 dark:text-slate-200">
                  <span className="font-bold block mb-0.5">Summary / Concept Overview:</span>
                  <p>{previewItem.data.summary}</p>
                </div>
                {previewItem.data.key_points && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Scoring Key Points:</span>
                    <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1 pl-1">
                      {previewItem.data.key_points.map((pt: string, idx: number) => (
                        <li key={idx}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {previewItem.data.evaluator_tips && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-900 dark:text-amber-200">
                    <span className="font-bold block mb-0.5">Evaluator Marking Tip:</span>
                    <p>{previewItem.data.evaluator_tips}</p>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setPreviewItem(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
