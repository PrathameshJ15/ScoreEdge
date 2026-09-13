'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { 
  BacklogSubjectItem, 
  getLocalBacklogs, 
  saveLocalBacklogs, 
  addLocalBacklog, 
  removeLocalBacklog 
} from '@/lib/backlog/backlogStore';
import { 
  getAllCurriculumSubjectsCatalog, 
  CatalogSubjectOption 
} from '@/lib/curriculum/studentCurriculum';
import {
  AlertTriangle,
  Plus,
  BookOpen,
  HelpCircle,
  FileText,
  Calendar,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
  X,
  Target,
  Clock,
  ExternalLink,
  ShieldAlert,
  Flame,
} from 'lucide-react';

export default function DashboardBacklogPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [backlogs, setBacklogs] = useState<BacklogSubjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Wizard state
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [resourceScope, setResourceScope] = useState<'all' | 'qb' | 'notes' | 'pyqs'>('all');
  const [backlogYear, setBacklogYear] = useState<'FE' | 'SE' | 'TE' | 'BE'>('FE');
  const [backlogSemester, setBacklogSemester] = useState<number>(2);
  const [backlogPattern, setBacklogPattern] = useState<string>('2024 Pattern (NEP)');
  const [backlogDept, setBacklogDept] = useState<string>('First Year Common');
  const [selectedCatalogSubject, setSelectedCatalogSubject] = useState<CatalogSubjectOption | null>(null);
  const [targetExamSession, setTargetExamSession] = useState<string>('Upcoming Nov/Dec 2026 Examination');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch backlogs on mount
  useEffect(() => {
    async function loadBacklogs() {
      // 1. First check local store for instant render
      const local = getLocalBacklogs();
      if (local.length > 0) {
        setBacklogs(local);
      }

      // 2. Fetch from DB if user is authenticated
      try {
        const res = await fetch('/api/student/backlog');
        if (res.ok) {
          const json = await res.json();
          if (json.data?.backlogs) {
            setBacklogs(json.data.backlogs);
            saveLocalBacklogs(json.data.backlogs);
          }
        }
      } catch (e) {
        console.warn('Could not sync backlogs from server:', e);
      } finally {
        setIsLoading(false);
      }
    }

    loadBacklogs();
  }, [user]);

  // Year change in wizard
  const handleWizardYearChange = (year: 'FE' | 'SE' | 'TE' | 'BE') => {
    setBacklogYear(year);
    if (year === 'FE') {
      setBacklogSemester(2);
      setBacklogDept('First Year Common');
      setBacklogPattern('2024 Pattern (NEP)');
    } else if (year === 'SE') {
      setBacklogSemester(3);
      setBacklogDept('Computer Engineering');
      setBacklogPattern('2024 Pattern (NEP)');
    } else if (year === 'TE') {
      setBacklogSemester(5);
      setBacklogDept('Information Technology');
      setBacklogPattern('2019 Pattern');
    } else {
      setBacklogSemester(7);
      setBacklogDept('Artificial Intelligence & Data Science');
      setBacklogPattern('2019 Pattern');
    }
  };

  // Filter available subjects from catalog
  const catalog = getAllCurriculumSubjectsCatalog();
  const availableSubjectsForSelection = catalog.filter((s) => {
    const matchesYear = s.academicYear === backlogYear;
    const matchesSem = s.semester === backlogSemester;
    return matchesYear && matchesSem;
  });

  // Handle Add Backlog Subject
  const handleSaveBacklog = async () => {
    if (!selectedCatalogSubject) return;
    setIsSaving(true);

    const payload = {
      subjectId: selectedCatalogSubject.id,
      code: selectedCatalogSubject.code,
      name: selectedCatalogSubject.name,
      shortName: selectedCatalogSubject.shortName,
      academicYear: backlogYear,
      semester: backlogSemester,
      pattern: backlogPattern,
      department: selectedCatalogSubject.department || backlogDept,
      resourceScope,
      targetClearanceSession: targetExamSession,
      readiness: Math.floor(Math.random() * 25) + 40, // 40% - 65% initial readiness
      priority: 'CRITICAL_ATKT' as const,
    };

    // 1. Save locally for instant UI response
    const newItem = addLocalBacklog(payload);
    setBacklogs((prev) => [newItem, ...prev.filter((b) => b.code !== newItem.code)]);

    // 2. Persist to API
    try {
      await fetch('/api/student/backlog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.warn('Failed to persist backlog to API:', e);
    }

    setIsSaving(false);
    setShowAddModal(false);
    setWizardStep(1);
    setSelectedCatalogSubject(null);

    setSuccessToast(
      `${selectedCatalogSubject.name} (${selectedCatalogSubject.shortName}) has been added to your Backlog Workspace and integrated into all study sections!`
    );

    setTimeout(() => {
      setSuccessToast(null);
    }, 6000);
  };

  // Handle Remove Backlog
  const handleRemoveBacklog = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from your backlog list?`)) return;

    // Remove locally
    const updated = removeLocalBacklog(id);
    setBacklogs(updated);

    // Sync with server
    try {
      await fetch(`/api/student/backlog?id=${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('Failed to delete backlog on server:', e);
    }
  };

  const avgReadiness = backlogs.length > 0
    ? Math.round(backlogs.reduce((acc, curr) => acc + curr.readiness, 0) / backlogs.length)
    : 0;

  return (
    <DashboardShell activeSubject={backlogs[0]?.subjectId || 'dbms'}>
      <div className="space-y-6">
        
        {/* Success Toast */}
        {successToast && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-start justify-between gap-3 text-xs text-emerald-900 dark:text-emerald-200 animate-in fade-in slide-in-from-top-2 shadow-sm">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-medium leading-relaxed">{successToast}</span>
            </div>
            <button
              onClick={() => setSuccessToast(null)}
              className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>SPPU ATKT &amp; Backlog Clearance Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Backlog Subjects Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Add earlier semester subjects with exam arrear patterns, question banks, and rapid formula revision notes.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => {
              setShowAddModal(true);
              setWizardStep(1);
            }}
            className="gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Backlog Subject</span>
          </Button>
        </div>

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
              <span>Active Backlogs Enrolled</span>
              <ShieldAlert className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-zinc-900 dark:text-white font-mono">
              {backlogs.length}
            </div>
            <p className="text-[11px] text-zinc-400">
              Integrated across all study sections
            </p>
          </Card>

          <Card className="p-4 bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
              <span>Average Clearance Readiness</span>
              <Target className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {avgReadiness}%
            </div>
            <p className="text-[11px] text-zinc-400">
              Calibrated to SPPU pass threshold (40%)
            </p>
          </Card>

          <Card className="p-4 bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
              <span>Target Exam Session</span>
              <Calendar className="w-4 h-4 text-brand-500" />
            </div>
            <div className="text-sm font-bold text-zinc-900 dark:text-white truncate pt-1">
              Nov/Dec 2026 Examination
            </div>
            <p className="text-[11px] text-zinc-400">
              SPPU Regular &amp; Supplementary In-Sem/End-Sem
            </p>
          </Card>
        </div>

        {/* Backlog Subject Box Cards Grid */}
        {backlogs.length === 0 ? (
          /* Empty State */
          <Card className="p-10 text-center space-y-4 bg-white dark:bg-zinc-900 border-dashed border-2 border-zinc-300 dark:border-zinc-750 rounded-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                No Backlog Subjects Added
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                If you have an active ATKT or backlog in any previous semester (e.g. M-II, BXE, DSA, TOC, etc.), click below to add it. You will unlock tailored solved question banks, past papers, and formula notes!
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(true);
                setWizardStep(1);
              }}
              className="gap-2 text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Backlog Subject</span>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                <span>Active Backlogs ({backlogs.length})</span>
                <span className="text-[11px] font-normal lowercase text-zinc-400">
                  — click any section button to begin studying
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {backlogs.map((item) => (
                <Card
                  key={item.id}
                  className="p-5 bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 hover:border-amber-400/80 dark:hover:border-amber-600/80 transition-all rounded-xl shadow-xs space-y-4 relative group"
                >
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-amber-200 dark:border-amber-800">
                        <Flame className="w-3 h-3 text-amber-600" />
                        <span>ATKT • {item.academicYear} Sem {item.semester}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-mono">
                        {item.pattern}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-semibold">
                        {item.resourceScope === 'all' ? 'Full Suite' : item.resourceScope.toUpperCase()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleRemoveBacklog(item.id, item.name)}
                      className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 transition-colors"
                      title="Remove / Mark Cleared"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Subject Title & Code */}
                  <div>
                    <div className="text-[11px] font-mono text-zinc-400">
                      Code: {item.code} • {item.department}
                    </div>
                    <h3 className="text-base font-extrabold text-zinc-900 dark:text-white tracking-tight mt-0.5">
                      {item.name} ({item.shortName})
                    </h3>
                  </div>

                  {/* Readiness Progress Bar */}
                  <div className="space-y-1.5 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-zinc-600 dark:text-zinc-400">Clearance Exam Readiness</span>
                      <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                        {item.readiness}%
                      </span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all"
                        style={{ width: `${item.readiness}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-zinc-400 flex items-center justify-between pt-0.5">
                      <span>Target: 40% Passing</span>
                      <span>Target Session: {item.targetClearanceSession}</span>
                    </div>
                  </div>

                  {/* Direct Action Study Box Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                    <Link
                      href={`/dashboard/subjects?subject=${item.subjectId}&backlog=true`}
                      className="px-2.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-semibold text-center transition-colors flex items-center justify-center gap-1 shadow-xs"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Study Vault</span>
                    </Link>
                    <Link
                      href={`/dashboard/questions?subject=${item.subjectId}&backlog=true`}
                      className="px-2.5 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-[11px] font-semibold text-center transition-colors flex items-center justify-center gap-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Questions</span>
                    </Link>
                    <Link
                      href={`/dashboard/notes?subject=${item.subjectId}&backlog=true`}
                      className="px-2.5 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-[11px] font-semibold text-center transition-colors flex items-center justify-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Notes</span>
                    </Link>
                    <Link
                      href={`/dashboard/pyqs?subject=${item.subjectId}&backlog=true`}
                      className="px-2.5 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-[11px] font-semibold text-center transition-colors flex items-center justify-center gap-1"
                    >
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      <span>PYQs</span>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* ADD BACKLOG SUBJECT MULTI-STEP MODAL                      */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-1 border border-amber-200 dark:border-amber-800">
                  <span>Step {wizardStep} of 4</span>
                </div>
                <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                  Add Backlog Subject
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STEP 1: Resource Scope */}
            {wizardStep === 1 && (
              <div className="space-y-3">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  What study resources do you want to access for this backlog subject?
                </p>

                <div className="grid grid-cols-1 gap-2">
                  {[
                    {
                      id: 'all',
                      title: 'Full Subject Clearance Suite (Recommended)',
                      desc: 'Complete syllabus units, solved question banks, formula notes & PYQs',
                      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
                    },
                    {
                      id: 'qb',
                      title: 'Question Bank & Solved Rubrics Only',
                      desc: 'Practice 2-mark, 5-mark, and 10-mark past SPPU questions with model answers',
                      icon: <HelpCircle className="w-5 h-5 text-blue-500" />,
                    },
                    {
                      id: 'notes',
                      title: 'Exam Revision Notes & Cheat Sheets',
                      desc: 'Marks-focused summaries, high-yield diagrams, and formula sheets',
                      icon: <FileText className="w-5 h-5 text-emerald-500" />,
                    },
                    {
                      id: 'pyqs',
                      title: 'Previous Year Question Papers (PYQs)',
                      desc: 'Official May/June & Nov/Dec solved papers with frequency trends',
                      icon: <Calendar className="w-5 h-5 text-purple-500" />,
                    },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setResourceScope(option.id as any)}
                      className={`text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                        resourceScope === option.id
                          ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 text-zinc-900 dark:text-white shadow-xs'
                          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">{option.icon}</div>
                      <div className="space-y-0.5">
                        <div className="font-bold text-xs">{option.title}</div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                          {option.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    variant="primary"
                    onClick={() => setWizardStep(2)}
                    className="gap-2 bg-amber-600 hover:bg-amber-700 text-white text-xs"
                  >
                    <span>Next: Select Year &amp; Semester</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: Academic Year & Semester */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Which academic year and semester does this backlog subject belong to?
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Backlog Academic Year
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['FE', 'SE', 'TE', 'BE'] as const).map((year) => (
                        <button
                          key={year}
                          type="button"
                          onClick={() => handleWizardYearChange(year)}
                          className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                            backlogYear === year
                              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                              : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Semester
                    </label>
                    <select
                      value={backlogSemester}
                      onChange={(e) => setBacklogSemester(Number(e.target.value))}
                      className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg py-2 px-3 text-xs font-semibold text-zinc-900 dark:text-zinc-100"
                    >
                      {backlogYear === 'FE' && (
                        <>
                          <option value={1}>Semester 1 (FE)</option>
                          <option value={2}>Semester 2 (FE)</option>
                        </>
                      )}
                      {backlogYear === 'SE' && (
                        <>
                          <option value={3}>Semester 3 (SE)</option>
                          <option value={4}>Semester 4 (SE)</option>
                        </>
                      )}
                      {backlogYear === 'TE' && (
                        <>
                          <option value={5}>Semester 5 (TE)</option>
                          <option value={6}>Semester 6 (TE)</option>
                        </>
                      )}
                      {backlogYear === 'BE' && (
                        <>
                          <option value={7}>Semester 7 (BE)</option>
                          <option value={8}>Semester 8 (BE)</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={() => setWizardStep(1)}
                    className="text-xs"
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setWizardStep(3)}
                    className="gap-2 bg-amber-600 hover:bg-amber-700 text-white text-xs"
                  >
                    <span>Next: Choose Subject</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Pattern & Subject Selection */}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Select your syllabus pattern and choose the backlog subject:
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                      Syllabus Pattern
                    </label>
                    <select
                      value={backlogPattern}
                      onChange={(e) => setBacklogPattern(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg py-1.5 px-2.5 text-xs text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="2024 Pattern (NEP)">2024 Pattern (NEP)</option>
                      <option value="2019 Pattern">2019 Pattern</option>
                      <option value="2015 Pattern">2015 Pattern</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                      Department
                    </label>
                    <select
                      value={backlogDept}
                      onChange={(e) => setBacklogDept(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg py-1.5 px-2.5 text-xs text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="First Year Common">First Year Common</option>
                      <option value="Computer Engineering">Computer Engineering</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics & Telecommunication">E&amp;TC Engineering</option>
                      <option value="Artificial Intelligence & Data Science">AI &amp; Data Science</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                    Available Subjects ({availableSubjectsForSelection.length})
                  </label>

                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {availableSubjectsForSelection.length === 0 ? (
                      <div className="p-4 text-center text-xs text-zinc-400 border border-dashed rounded-lg">
                        No catalog subjects found for this combination. Try changing semester or department.
                      </div>
                    ) : (
                      availableSubjectsForSelection.map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setSelectedCatalogSubject(sub)}
                          className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                            selectedCatalogSubject?.id === sub.id
                              ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/60 text-zinc-900 dark:text-white ring-1 ring-amber-500'
                              : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-xs">
                              {sub.name} ({sub.shortName})
                            </div>
                            <div className="text-[10px] text-zinc-400">
                              Code: {sub.code} • {sub.credits} Credits • {sub.department}
                            </div>
                          </div>
                          {selectedCatalogSubject?.id === sub.id && (
                            <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={() => setWizardStep(2)}
                    className="text-xs"
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    disabled={!selectedCatalogSubject}
                    onClick={() => setWizardStep(4)}
                    className="gap-2 bg-amber-600 hover:bg-amber-700 text-white text-xs disabled:opacity-50"
                  >
                    <span>Next: Confirm Clearance Plan</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: Confirmation & Clearance Target */}
            {wizardStep === 4 && selectedCatalogSubject && (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50/60 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/80 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                    <Sparkles className="w-4 h-4" />
                    <span>Backlog Enrollment Summary</span>
                  </div>
                  <div className="text-sm font-extrabold text-zinc-900 dark:text-white">
                    {selectedCatalogSubject.name} ({selectedCatalogSubject.shortName})
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-0.5">
                    <div>Academic Level: <strong>{backlogYear} • Semester {backlogSemester}</strong></div>
                    <div>Syllabus: <strong>{backlogPattern}</strong></div>
                    <div>Resource Scope: <strong>{resourceScope === 'all' ? 'Complete Subject Suite' : resourceScope.toUpperCase()}</strong></div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Target Examination Session to Clear
                  </label>
                  <select
                    value={targetExamSession}
                    onChange={(e) => setTargetExamSession(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg py-2 px-3 text-xs font-semibold text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="Upcoming Nov/Dec 2026 Examination">Upcoming Nov/Dec 2026 Examination</option>
                    <option value="Upcoming In-Sem Supplementary Exam">Upcoming In-Sem Supplementary Exam</option>
                    <option value="May/June 2027 Summer Examination">May/June 2027 Summer Examination</option>
                  </select>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>
                    Once confirmed, this subject will appear in your <strong>Subjects</strong>, <strong>Question Bank</strong>, <strong>Exam Notes</strong>, and <strong>PYQ</strong> sections tagged as <em>Backlog</em>.
                  </span>
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={() => setWizardStep(3)}
                    className="text-xs"
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSaveBacklog}
                    isLoading={isSaving}
                    className="gap-2 bg-amber-600 hover:bg-amber-700 text-white text-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add to Workspace</span>
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </DashboardShell>
  );
}
