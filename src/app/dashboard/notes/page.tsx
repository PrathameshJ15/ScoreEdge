'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { 
  getStudentEnrolledSubjects, 
  getSubjectNoteItems 
} from '@/lib/curriculum/studentCurriculum';
import { 
  getLocalBacklogs, 
  BacklogSubjectItem 
} from '@/lib/backlog/backlogStore';
import { DBMS_NOTES } from '@/data/sppuData';
import {
  FileText,
  Search,
  BookOpen,
  CheckCircle2,
  Bookmark,
  ChevronRight,
  Clock,
  Layers,
  Sparkles,
  Award,
  Filter,
  CheckSquare,
  AlertTriangle,
  Flame,
} from 'lucide-react';

function NotesPageContent() {
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
  const [selectedUnit, setSelectedUnit] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [masteredIds, setMasteredIds] = useState<string[]>(['note-1']);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);

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

  const currentNotes: any[] = React.useMemo(() => {
    if (selectedSubjectId === 'dbms') {
      return DBMS_NOTES;
    }
    return getSubjectNoteItems(selectedSubjectId, activeSubjectObj?.name);
  }, [selectedSubjectId, activeSubjectObj]);

  const filteredNotes = currentNotes.filter((note: any) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const toggleBookmark = (id: string) => {
    if (bookmarkedIds.includes(id)) {
      setBookmarkedIds(bookmarkedIds.filter((b) => b !== id));
    } else {
      setBookmarkedIds([...bookmarkedIds, id]);
    }
  };

  const toggleMastered = (id: string) => {
    if (masteredIds.includes(id)) {
      setMasteredIds(masteredIds.filter((m) => m !== id));
    } else {
      setMasteredIds([...masteredIds, id]);
    }
  };

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
              <FileText className="w-3.5 h-3.5" />
              <span>SPPU Exam Notes Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Exam-Oriented Notes &amp; Formula Sheets
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Structured marks-focused explanations, SPPU standard diagrams, and examiner scoring keys for <strong>{user?.academic_year || 'SE'} {user?.department || 'Computer Engineering'}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-lg">
            <span>{masteredIds.length} of {currentNotes.length} Mastered</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUBJECT BOX CARDS (User Request: "create box like structures for like say subject dbms then dsa... button to study") */}
        {/* ========================================================================= */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
              Select Subject for Exam Notes ({allAvailableSubjects.length} Available)
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
                    {isSelected ? 'Reading Notes ✓' : 'Study Notes'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Search Strip */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={`Search keywords in ${activeSubjectObj?.shortName} notes...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs pl-9 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="text-xs text-zinc-500 font-mono">
            Showing {filteredNotes.length} notes for <strong>{activeSubjectObj?.name}</strong>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredNotes.map((note: any) => {
            const isBookmarked = bookmarkedIds.includes(note.id);
            const isMastered = masteredIds.includes(note.id);
            const isExpanded = expandedNoteId === note.id;

            return (
              <Card
                key={note.id}
                className="p-5 bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-[10px] font-mono font-bold">
                        Unit {note.unitNumber || 1}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{note.readTime || '15 min read'}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleBookmark(note.id)}
                        className={`p-1.5 rounded-lg text-xs transition-colors ${
                          isBookmarked
                            ? 'text-brand-600 bg-brand-50 dark:bg-brand-950'
                            : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                        title="Bookmark Note"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleMastered(note.id)}
                        className={`p-1.5 rounded-lg text-xs transition-colors ${
                          isMastered
                            ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950'
                            : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                        title={isMastered ? 'Mastered' : 'Mark as Mastered'}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-white tracking-tight leading-snug">
                    {note.title}
                  </h3>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {note.summary}
                  </p>

                  {/* Scoring Tips */}
                  {note.scoringTips && note.scoringTips.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-[11px] space-y-1 text-amber-900 dark:text-amber-200">
                      <div className="font-bold flex items-center gap-1 text-amber-700 dark:text-amber-300">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>SPPU Evaluator Scoring Secrets:</span>
                      </div>
                      <ul className="space-y-0.5 list-disc list-inside">
                        {note.scoringTips.map((tip: string, idx: number) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Full Note Content Expansion */}
                  {isExpanded && (
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-3 text-xs animate-in fade-in">
                      <h4 className="font-bold text-zinc-900 dark:text-white">
                        Full Exam Breakdown &amp; Stepwise Schema
                      </h4>
                      <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        To score full marks on this concept in SPPU examinations, follow the 3-tier structure:
                      </p>
                      <div className="space-y-2 text-zinc-600 dark:text-zinc-300">
                        <div><strong>Tier 1: Architectural Definition:</strong> State the canonical definition with formal parameters. Avoid informal restatements.</div>
                        <div><strong>Tier 2: Derivation / Tracing:</strong> Present each intermediate transformation with clear rationale for each equality step.</div>
                        <div><strong>Tier 3: Comparative Rubric:</strong> Provide a structured comparison table with at least 4 criteria (Time Complexity, Space Overhead, Fault Tolerance, Real-world Usage).</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-zinc-400">
                    SPPU Verified Notes
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setExpandedNoteId(isExpanded ? null : note.id)}
                    className="text-xs"
                  >
                    {isExpanded ? 'Collapse Note' : 'Read Full Note →'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

      </div>
    </DashboardShell>
  );
}

export default function DashboardNotesPage() {
  return (
    <React.Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading Notes...</div>}>
      <NotesPageContent />
    </React.Suspense>
  );
}
