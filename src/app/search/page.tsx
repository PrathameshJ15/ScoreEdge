'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { MVP_SUBJECTS } from '@/data/sppuData';
import {
  executeUnifiedSearch,
  GroupedSearchResults,
  SearchCategory,
  POPULAR_SPPU_SEARCHES,
} from '@/lib/search/searchEngine';
import { PriorityLevel } from '@/lib/db/types';
import {
  Search as SearchIcon,
  X,
  BookOpen,
  HelpCircle,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
  Filter,
  Layers,
  GraduationCap,
} from 'lucide-react';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get('q') || '';
  const initialSubject = searchParams.get('subject_id') || '';
  const initialCategory = (searchParams.get('category') as SearchCategory) || 'ALL';

  const [query, setQuery] = useState<string>(initialQuery);
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject);
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>(initialCategory);
  const [selectedMarks, setSelectedMarks] = useState<number | undefined>(undefined);
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel | undefined>(undefined);
  const [searchResults, setSearchResults] = useState<GroupedSearchResults | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync state with URL when query changes
  useEffect(() => {
    let isMounted = true;
    const trimmed = query.trim();

    async function runSearch() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (trimmed) params.set('q', trimmed);
        if (selectedSubject) params.set('subject_id', selectedSubject);
        if (selectedCategory !== 'ALL') params.set('category', selectedCategory);
        if (selectedMarks) params.set('marks', selectedMarks.toString());
        if (selectedPriority) params.set('priority', selectedPriority);

        const res = await fetch(`/api/search?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json?.data) {
            setSearchResults(json.data);
          }
        } else {
          // Fallback to local search execution
          if (isMounted) {
            setSearchResults(
              executeUnifiedSearch(trimmed, {
                subject_id: selectedSubject || undefined,
                category: selectedCategory,
                marks: selectedMarks,
                priority: selectedPriority,
              })
            );
          }
        }
      } catch {
        if (isMounted) {
          setSearchResults(
            executeUnifiedSearch(trimmed, {
              subject_id: selectedSubject || undefined,
              category: selectedCategory,
              marks: selectedMarks,
              priority: selectedPriority,
            })
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    const timer = setTimeout(runSearch, 100);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query, selectedSubject, selectedCategory, selectedMarks, selectedPriority]);

  // Handle direct click on popular search chip
  const handleSelectPopular = (popularTerm: string) => {
    setQuery(popularTerm);
  };

  const clearQuery = () => {
    setQuery('');
  };

  const results = searchResults?.results;
  const totalMatches = searchResults?.total_matches || 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-depth-1 space-y-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
            <SearchIcon className="w-3.5 h-3.5" />
            Unified SPPU Search
          </span>
          <span className="text-slate-500">Fast • Grounded • Mobile-Friendly</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Search Across All Verified SPPU Academic Content
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Instantly search syllabus units, theory topics, solved model answers, question recurrence clusters, and verified past exam papers.
        </p>

        {/* Big Search Input Bar */}
        <div className="relative pt-2">
          <div className="relative flex items-center">
            <SearchIcon className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search topics, questions, solved PYQs, notes (e.g. 3NF, BCNF, 2PL, ACID, Transactions)..."
              className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 rounded-xl text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors shadow-xs"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={clearQuery}
                aria-label="Clear search"
                className="absolute right-3.5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Popular Searches Chips */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs pt-1">
          <span className="text-zinc-400 dark:text-zinc-500 font-semibold text-[11px] uppercase tracking-wider">
            Popular:
          </span>
          {POPULAR_SPPU_SEARCHES.slice(0, 6).map((term, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPopular(term)}
              className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-brand-50 dark:hover:bg-brand-950/60 hover:text-brand-600 dark:hover:text-brand-300 text-zinc-700 dark:text-zinc-300 text-[11px] transition-colors font-medium"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-sm space-y-3 text-xs">
        
        {/* Subject Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-zinc-700 dark:text-zinc-300">Subject:</span>
          <button
            type="button"
            onClick={() => setSelectedSubject('')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              selectedSubject === ''
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            All Subjects
          </button>
          {MVP_SUBJECTS.map((sub) => {
            const isSelected = selectedSubject === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubject(isSelected ? '' : sub.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {sub.shortName}
              </button>
            );
          })}
        </div>

        {/* Category Navigation Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="font-bold text-slate-700 dark:text-slate-300">Category:</span>
          {(
            [
              { id: 'ALL', label: 'All Results' },
              { id: 'TOPICS', label: 'Topics' },
              { id: 'QUESTIONS', label: 'Questions' },
              { id: 'PYQS', label: 'PYQs' },
              { id: 'NOTES', label: 'Notes' },
              { id: 'ANSWERS', label: 'Answers' },
            ] as const
          ).map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}

          {/* Quick Marks Filter */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="font-semibold text-slate-500">Marks:</span>
            {([2, 5, 10] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMarks(selectedMarks === m ? undefined : m)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                  selectedMarks === m
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                {m}M
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Query Meta Info Bar */}
      {query.trim() && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Found <strong>{totalMatches}</strong> verified matches for &ldquo;{query}&rdquo;
          </span>
          {searchResults?.search_time_ms !== undefined && (
            <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
              <Clock className="w-3 h-3" />
              {searchResults.search_time_ms}ms
            </span>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEARCH RESULTS SECTION GROUPED BY: Topics, Questions, PYQs, Notes, Answers */}
      {/* ========================================================================= */}

      {/* STATE 1: Empty Query State */}
      {!query.trim() && (
        <div className="py-8">
          <EmptyState
            icon={<SearchIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />}
            title="Start Searching SPPU Exam Intelligence"
            description="Type any syllabus topic, concept, question keyword, or exam paper year above to explore verified study materials."
          />
        </div>
      )}

      {/* STATE 2: Zero Matches Found */}
      {query.trim() && totalMatches === 0 && !isLoading && (
        <div className="space-y-4">
          <EmptyState
            icon={<HelpCircle className="w-6 h-6 text-amber-500" />}
            title={`No verified results found for "${query}"`}
            description="We could not find matching topics or exam answers for this query. Try checking your spelling or using broader keywords."
            actionLabel="Reset Search"
            onAction={clearQuery}
          />
          {searchResults?.suggestions && (
            <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">
                Search Suggestions:
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                {searchResults.suggestions.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* STATE 3: Results Display Grouped by Category */}
      {query.trim() && totalMatches > 0 && results && (
        <div className="space-y-8">
          
          {/* GROUP 1: TOPICS */}
          {(selectedCategory === 'ALL' || selectedCategory === 'TOPICS') &&
            results.topics.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <span>Syllabus Topics ({results.topics.length})</span>
                  </h2>
                  <span className="text-xs text-slate-500">Official Curriculum Items</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {results.topics.map((item) => (
                    <Link
                      key={item.id}
                      href={item.url}
                      className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-brand-500/50 hover:shadow-depth-1 transition-all flex flex-col justify-between space-y-2 group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 text-xs mb-1">
                          <span className="text-slate-500 font-medium truncate">
                            {item.subtitle}
                          </span>
                          {item.priority && <PriorityBadge priority={item.priority} size="sm" />}
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {item.title}
                        </h3>
                        {item.snippet && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                            {item.snippet}
                          </p>
                        )}
                      </div>
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-xs font-semibold text-brand-600 dark:text-brand-400">
                        <span>View Unit Syllabus</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          {/* GROUP 2: PYQS (Repeated Question Intelligence) */}
          {(selectedCategory === 'ALL' || selectedCategory === 'PYQS') &&
            results.pyqs.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Flame className="w-4 h-4 text-red-500" />
                    <span>Previous Year Questions — PYQs ({results.pyqs.length})</span>
                  </h2>
                  <span className="text-xs text-slate-500">Exam Recurrence Intelligence</span>
                </div>

                <div className="space-y-3">
                  {results.pyqs.map((item) => (
                    <Card
                      key={item.id}
                      hoverable
                      className="p-5 border-slate-200 dark:border-slate-800 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Badge variant="brand">{item.subject_name || 'SPPU'}</Badge>
                          <span className="text-slate-500 font-semibold">
                            {item.marks} Marks
                          </span>
                          {item.occurrences_count && item.occurrences_count > 1 && (
                            <span className="px-2 py-0.5 rounded bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold border border-red-200 dark:border-red-800 text-[10px]">
                              Repeated in {item.occurrences_count} verified papers
                            </span>
                          )}
                        </div>
                        {item.priority && <PriorityBadge priority={item.priority} size="sm" />}
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {item.title}
                      </h3>

                      {item.cluster_name && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          Concept Cluster: <strong>{item.cluster_name}</strong>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-500 text-[11px]">
                          Official SPPU Examination Record
                        </span>
                        <Link
                          href={item.url}
                          className="font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                        >
                          <span>View Solved Model Answer</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

          {/* GROUP 3: QUESTIONS (Question Bank) */}
          {(selectedCategory === 'ALL' || selectedCategory === 'QUESTIONS') &&
            results.questions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-emerald-500" />
                    <span>Question Bank Practice ({results.questions.length})</span>
                  </h2>
                  <span className="text-xs text-slate-500">Conceptual Practice Drills</span>
                </div>

                <div className="space-y-3">
                  {results.questions.map((item) => (
                    <Card
                      key={item.id}
                      hoverable
                      className="p-4 border-slate-200 dark:border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-500 font-medium">{item.subtitle}</span>
                        {item.priority && <PriorityBadge priority={item.priority} size="sm" />}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {item.title}
                      </h3>
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px]">{item.marks} Marks Target</span>
                        <Link
                          href={item.url}
                          className="font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                        >
                          <span>Practice Question</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

          {/* GROUP 4: NOTES */}
          {(selectedCategory === 'ALL' || selectedCategory === 'NOTES') &&
            results.notes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <span>Exam-Ready Notes ({results.notes.length})</span>
                  </h2>
                  <span className="text-xs text-slate-500">High-Density Revision Summaries</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {results.notes.map((item) => (
                    <Link
                      key={item.id}
                      href={item.url}
                      className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-brand-500/50 hover:shadow-depth-1 transition-all flex flex-col justify-between space-y-2 group"
                    >
                      <div>
                        <span className="text-[11px] text-slate-400 block mb-1">
                          {item.subtitle}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {item.title}
                        </h3>
                        {item.snippet && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                            {item.snippet}
                          </p>
                        )}
                      </div>
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-xs font-semibold text-brand-600 dark:text-brand-400">
                        <span>Read Verified Note</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          {/* GROUP 5: SOLVED ANSWERS */}
          {(selectedCategory === 'ALL' || selectedCategory === 'ANSWERS') &&
            results.answers.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Solved Model Answers ({results.answers.length})</span>
                  </h2>
                  <span className="text-xs text-slate-500">SPPU Examiner Marking Format</span>
                </div>

                <div className="space-y-3">
                  {results.answers.map((item) => (
                    <Card
                      key={item.id}
                      hoverable
                      className="p-4 sm:p-5 border-slate-200 dark:border-slate-800 space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">{item.subtitle}</span>
                        <span className="font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px]">
                          {item.marks} Marks Rubric
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h3>
                      {item.snippet && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed bg-slate-50 dark:bg-slate-850/60 p-2.5 rounded-control">
                          {item.snippet}
                        </p>
                      )}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px]">Includes Evaluator Points</span>
                        <Link
                          href={item.url}
                          className="font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                        >
                          <span>Open Full Answer</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#fafaf9] dark:bg-[#0a0a0b]">
      <Navbar />

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <Suspense
          fallback={
            <div className="p-8 text-center text-slate-500 text-sm">
              Loading SPPU search engine...
            </div>
          }
        >
          <SearchPageContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
