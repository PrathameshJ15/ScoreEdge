'use client';

import React, { useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/Button';
import { NoteItem } from '@/lib/types';
import { DBMS_NOTES, MVP_SUBJECTS } from '@/data/sppuData';
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
} from 'lucide-react';

export default function DashboardNotesPage() {
  const [selectedSubjectId, setSelectedSubjectId] = useState('dbms');
  const [selectedUnit, setSelectedUnit] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [masteredIds, setMasteredIds] = useState<string[]>(['note-1']);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>('note-1');

  const filteredNotes = DBMS_NOTES.filter((note: NoteItem) => {
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/60 text-teal-800 dark:text-teal-300 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
              <FileText className="w-3.5 h-3.5" />
              <span>Student Notes Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Exam-Oriented Notes
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Structured marks-focused explanations, diagrams, and examiner scoring schemas for your exams.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500">
              {masteredIds.length} of {DBMS_NOTES.length} Mastered
            </span>
          </div>
        </div>

        {/* Step 1: Subject Filter Pills */}
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

        {/* Search & Unit Filters */}
        <div className="p-4 rounded-card bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search concepts, normal forms, transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs pl-9 pr-4 py-2 rounded-control border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Unit Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedUnit('all')}
              className={`px-2.5 py-1.5 rounded-control text-xs font-mono transition-colors ${
                selectedUnit === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              All Units
            </button>
            {[1, 2, 3, 4, 5, 6].map((u) => (
              <button
                key={u}
                onClick={() => setSelectedUnit(u)}
                className={`px-2.5 py-1.5 rounded-control text-xs font-mono transition-colors ${
                  selectedUnit === u
                    ? 'bg-teal-600 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                Unit {u}
              </button>
            ))}
          </div>

        </div>

        {/* Notes Grid */}
        <div className="space-y-4">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note: NoteItem) => {
              const isMastered = masteredIds.includes(note.id);
              const isBookmarked = bookmarkedIds.includes(note.id);
              const isExpanded = expandedNoteId === note.id;

              return (
                <div
                  key={note.id}
                  className={`p-5 rounded-card border transition-all ${
                    isExpanded
                      ? 'bg-white dark:bg-slate-900 border-teal-500/80 shadow-md ring-1 ring-teal-500/20'
                      : 'bg-white dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                        <span className="px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold border border-teal-200/60 dark:border-teal-800">
                          Unit 3 • Relational Design
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {note.readTimeMinutes} min read
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {note.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {note.summary}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleBookmark(note.id)}
                        className={`p-2 rounded-control border transition-colors ${
                          isBookmarked
                            ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-600'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
                        }`}
                        title="Bookmark Note"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleMastered(note.id)}
                        className={`px-3 py-1.5 rounded-control text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors ${
                          isMastered
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 ${isMastered ? 'text-white' : 'text-slate-400'}`} />
                        <span>{isMastered ? 'Mastered' : 'Mark Mastered'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Examiner Rubric Card */}
                  <div className="p-4 rounded-control bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-teal-600" />
                        Examiner Answer Rubric (6-Mark Schema)
                      </span>
                      <span className="text-teal-600 dark:text-teal-400">High Yield</span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {note.keyTakeaways.map((takeaway: string, i: number) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                          <span>{takeaway}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expanded Theory View */}
                  {isExpanded && (
                    <div className="pt-4 mt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-3 font-serif text-slate-800 dark:text-slate-200 leading-relaxed text-sm">
                      <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                        Concept Analysis &amp; SPPU Evaluator Checklist:
                      </h4>
                      <p>
                        A relation schema R is in Boyce-Codd Normal Form (BCNF) with respect to a set of functional dependencies F if, for all functional dependencies in F of the form X &rarr; Y, where X &sube; R and Y &sube; R:
                      </p>
                      <ul className="list-disc pl-5 font-sans text-xs space-y-1 text-slate-600 dark:text-slate-400">
                        <li>X &rarr; Y is a trivial functional dependency (i.e., Y &sube; X), or</li>
                        <li>X is a superkey for the relation schema R.</li>
                      </ul>
                      <div className="p-3 rounded-control bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/40 font-sans text-xs text-teal-900 dark:text-teal-300">
                        <strong>Exam Tip:</strong> Always state whether the decomposition preserves dependencies. While 3NF guarantees dependency preservation and lossless join, BCNF guarantees lossless join but may not always preserve functional dependencies.
                      </div>
                    </div>
                  )}

                  {/* Expand Toggle */}
                  <div className="pt-3 flex justify-end">
                    <button
                      onClick={() => setExpandedNoteId(isExpanded ? null : note.id)}
                      className="text-xs font-mono text-teal-600 dark:text-teal-400 hover:underline font-semibold flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Collapse Full Explanation' : 'Read Full Exam Answer Schema'}</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                  </div>

                </div>
              );
            })
          ) : (
            <div className="p-8 rounded-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
              No notes found matching your search query. Try searching for &quot;Normalization&quot; or &quot;ACID&quot;.
            </div>
          )}
        </div>

      </div>
    </DashboardShell>
  );
}
