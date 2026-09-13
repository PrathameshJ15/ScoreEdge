'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { dbStore } from '@/lib/db/client';
import { MVP_SUBJECTS } from '@/data/sppuData';
import { Button } from '@/components/ui/Button';
import {
  FileText,
  Search,
  BookOpen,
  Clock,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Filter,
  X
} from 'lucide-react';

import { Note } from '@/lib/db/types';

export default function NotesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Get notes from dbStore
  const allNotes: Note[] = useMemo(() => {
    try {
      return Array.isArray(dbStore.notes) ? dbStore.notes : [];
    } catch (e) {
      return [];
    }
  }, []);

  const subjectsMap = useMemo(() => {
    const map = new Map<string, string>();
    MVP_SUBJECTS.forEach((s) => {
      map.set(s.id, s.name);
      map.set(s.shortName.toLowerCase(), s.name);
    });
    return map;
  }, []);

  const filteredNotes = useMemo(() => {
    return allNotes.filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content_body.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSubject =
        selectedSubject === 'all' ||
        note.subject_id.toLowerCase() === selectedSubject.toLowerCase();

      return matchesSearch && matchesSubject;
    });
  }, [allNotes, searchQuery, selectedSubject]);

  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f5] dark:bg-slate-950">
      <Navbar />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Page Header */}
        <div className="mb-10 text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>SPPU Verified Academic Material</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] dark:text-white tracking-tight">
            Original &amp; Evaluator-Verified Notes
          </h1>

          <p className="text-base text-slate-600 dark:text-slate-300">
            Syllabus-accurate, high-yield study notes written strictly to match SPPU marking schemes. Structured with key scoring points and diagrammatic breakdowns.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-grow w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search notes by topic, keyword, or concept (e.g. Normalization, BCNF, ACID)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-[#0f172a] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Subject Select */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 no-scrollbar">
              <button
                onClick={() => setSelectedSubject('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedSubject === 'all'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                All Subjects
              </button>
              {MVP_SUBJECTS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubject(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedSubject === s.id
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {s.shortName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#0f172a] dark:text-white">No Notes Found</h3>
            <p className="text-xs text-slate-500 mt-1">Try refining your search terms or selecting a different subject.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('all');
              }}
              className="mt-4"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => {
              const subjectName = subjectsMap.get(note.subject_id.toLowerCase()) || note.subject_id.toUpperCase();
              return (
                <div
                  key={note.id}
                  className="group flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-lg hover:shadow-teal-900/5 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800">
                        {note.subject_id.toUpperCase()}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{note.read_time_minutes} min read</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-[#0f172a] dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors line-clamp-2">
                      {note.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {note.summary}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Evaluator Graded
                    </span>

                    <button
                      onClick={() => setSelectedNote(note)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline"
                    >
                      <span>Read Note</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Note Reader Modal */}
        {selectedNote && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
                <div>
                  <span className="text-xs font-mono font-semibold text-teal-700 dark:text-teal-400 uppercase">
                    {selectedNote.subject_id.toUpperCase()} • {selectedNote.read_time_minutes} Min Read
                  </span>
                  <h2 className="text-lg font-bold text-[#0f172a] dark:text-white mt-0.5">
                    {selectedNote.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedNote(null)}
                  className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-sm text-[#0f172a] dark:text-slate-200 leading-relaxed">
                <div className="p-4 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
                  <h4 className="font-bold text-teal-950 dark:text-teal-200 text-xs uppercase tracking-wider mb-1">
                    Examiner Summary &amp; Weightage
                  </h4>
                  <p className="text-xs text-teal-900/90 dark:text-teal-300">
                    {selectedNote.summary}
                  </p>
                </div>

                <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm whitespace-pre-wrap font-sans">
                  {selectedNote.content_body}
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Need help understanding? Ask the AI Tutor.
                </span>
                <div className="flex items-center gap-2">
                  <Link href={`/ai?prompt=${encodeURIComponent(`Explain this concept from SPPU syllabus: ${selectedNote.title}`)}`}>
                    <Button size="sm" className="bg-teal-700 hover:bg-teal-800 text-white text-xs gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ask AI About This</span>
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedNote(null)}
                    className="text-xs"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
