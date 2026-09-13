'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { trackClientProductEvent } from '@/lib/analytics/client';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { dbStore } from '@/lib/db/client';
import { MVP_SUBJECTS, DBMS_UNITS, DBMS_QUESTION_CLUSTERS, DBMS_SAMPLE_PYQS, DBMS_EXAM_PRESETS } from '@/data/sppuData';
import { PYQIntelligenceView } from '@/components/intelligence/PYQIntelligenceView';
import { ExamModeView } from '@/components/intelligence/ExamModeView';
import { ScoreEdgeAIAssistant } from '@/components/ai/ScoreEdgeAIAssistant';
import {
  BookOpen,
  Zap,
  CheckCircle2,
  Clock,
  Flame,
  FileText,
  HelpCircle,
  ArrowLeft,
  Share2,
  Bookmark,
  Layers,
  Star,
  CheckSquare,
  Square,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function SubjectPage() {
  const params = useParams();
  const rawId = ((params?.id as string) || 'dbms').toLowerCase();

  // Find subject across DB store and MVP subjects
  const subject = useMemo(() => {
    const fromDb = dbStore.subjects.find(
      (s) =>
        s.id === rawId ||
        s.id === `sub-${rawId}` ||
        s.short_name.toLowerCase() === rawId ||
        s.code === rawId
    );
    if (fromDb) {
      return {
        id: fromDb.id,
        code: fromDb.code,
        name: fromDb.name,
        shortName: fromDb.short_name,
        semester: fromDb.semester_id === 'sem-4' ? 4 : 3,
        totalUnits: fromDb.total_units,
        totalPYQs: 48,
        description: `Official SPPU syllabus breakdown, unit weightage, PYQ frequency analysis, 2/5/10-mark solved answers, and 5-hour emergency crash preparation for ${fromDb.short_name}.`,
      };
    }
    const fromMvp = MVP_SUBJECTS.find((s) => s.id === rawId || s.code === rawId) || MVP_SUBJECTS[0];
    return {
      id: fromMvp.id,
      code: fromMvp.code,
      name: fromMvp.name,
      shortName: fromMvp.shortName,
      semester: fromMvp.semester,
      totalUnits: fromMvp.totalUnits,
      totalPYQs: fromMvp.totalPYQs,
      description: `Official SPPU syllabus breakdown, unit weightage, PYQ frequency analysis, 2/5/10-mark solved answers, and 5-hour emergency crash preparation for ${fromMvp.shortName}.`,
    };
  }, [rawId]);

  // Retrieve subject-specific units from DB store
  const units = useMemo(() => {
    const dbUnits = dbStore.units.filter(
      (u) => u.subject_id === subject.id || u.subject_id === `sub-${rawId}`
    );
    if (dbUnits.length > 0) {
      return dbUnits.map((u) => ({
        id: u.id,
        unitNumber: u.unit_number,
        title: u.title,
        description: u.description || 'Core syllabus unit with historical SPPU examination weightage.',
        weightagePercentage: u.weightage_percentage,
        pyqCount: 8,
      }));
    }
    return DBMS_UNITS;
  }, [subject.id, rawId]);

  // Retrieve clusters
  const clusters = useMemo(() => {
    const dbClusters = dbStore.questionClusters.filter(
      (c) => c.subject_id === subject.id || c.subject_id === `sub-${rawId}`
    );
    if (dbClusters.length > 0) {
      return dbClusters.map((c) => ({
        id: c.id,
        conceptName: c.canonical_name,
        topicName: c.canonical_question || 'Key Syllabus Concept',
        typicalMarks: c.typical_marks,
        priority: (c.occurrence_count >= 4
          ? 'MUST_STUDY'
          : c.occurrence_count >= 3
          ? 'HIGH'
          : 'MEDIUM') as 'MUST_STUDY' | 'HIGH' | 'MEDIUM' | 'LOW',
        frequency: c.occurrence_count,
        totalPapersAnalyzed: 5,
        unitNumber: 1,
      }));
    }
    return DBMS_QUESTION_CLUSTERS.map((c) => ({
      id: c.id,
      conceptName: c.conceptName,
      topicName: c.topicName,
      typicalMarks: c.typicalMarks,
      priority: c.priority,
      frequency: c.frequency,
      totalPapersAnalyzed: c.totalPapersAnalyzed,
      unitNumber: c.unitId,
    }));
  }, [subject.id, rawId]);

  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [activeMarksFilter, setActiveMarksFilter] = useState<2 | 5 | 10>(5);
  const [activePresetKey, setActivePresetKey] = useState<'2h' | '5h' | '1d'>('2h');
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  
  // Interactive Subject Quiz state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Decoupled, non-intrusive telemetry for subject view
  useEffect(() => {
    trackClientProductEvent('subject opened', {
      subject_id: subject.id,
      code: subject.code,
      name: subject.name,
    });
  }, [subject.id, subject.code, subject.name]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'intelligence' || tabId === 'answers') {
      trackClientProductEvent('PYQ viewed', { subject_id: subject.id });
    } else if (tabId === 'overview') {
      trackClientProductEvent('topic opened', { subject_id: subject.id });
    }
  };

  const activePreset =
    DBMS_EXAM_PRESETS.find((p) => p.durationKey === activePresetKey) || DBMS_EXAM_PRESETS[0];

  const toggleTask = (id: string) => {
    if (completedTaskIds.includes(id)) {
      setCompletedTaskIds(completedTaskIds.filter((t) => t !== id));
    } else {
      setCompletedTaskIds([...completedTaskIds, id]);
    }
  };

  const sampleQuiz = {
    question: `Which fundamental principle guarantees data integrity during concurrent transactions in ${subject.shortName}?`,
    options: [
      'ACID Properties (Atomicity, Consistency, Isolation, Durability)',
      'Strict Two-Phase Locking without validation',
      'Lossy decomposition of functional dependencies',
      'First-come first-served queue serialization',
    ],
    correctAnswerIndex: 0,
    explanation:
      'ACID properties represent the four cornerstone principles that ensure database transactions are processed reliably and maintain integrity across concurrent operations.',
  };

  const tabs = [
    { id: 'overview', label: 'Overview & Units', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'intelligence', label: 'PYQ Intelligence', count: clusters.length, icon: <Flame className="w-4 h-4 text-red-500" /> },
    { id: 'answers', label: 'Solved Answers', count: DBMS_SAMPLE_PYQS.length, icon: <FileText className="w-4 h-4 text-blue-500" /> },
    { id: 'exam-mode', label: 'Exam Mode', icon: <Zap className="w-4 h-4 text-amber-500" /> },
    { id: 'quiz', label: 'Practice Quiz', icon: <HelpCircle className="w-4 h-4 text-emerald-500" /> },
    { id: 'ai', label: 'AI Study Assistant', icon: <Sparkles className="w-4 h-4 text-purple-500" /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#fafaf9] dark:bg-[#0a0a0b]">
      <Navbar />

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between text-xs">
          <Link
            href="/explore"
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Subject Explorer</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              aria-label="Share Subject"
              className="p-1.5 rounded-control text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              aria-label="Bookmark Subject"
              className="p-1.5 rounded-control text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Subject Header Banner (Layered Card Depth) */}
        <div className="bg-[#f7f5ff] dark:bg-[#0d0720] border border-brand-200/40 dark:border-brand-900/40 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="brand">SE Computer Engineering</Badge>
              <Badge variant="outline">2024 &amp; 2019 Patterns</Badge>
              <Badge variant="default">Semester {subject.semester}</Badge>
            </div>
            <div className="text-xs text-zinc-500 font-mono font-medium">
              SPPU SUB CODE: {subject.code}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                {subject.name} ({subject.shortName})
              </h1>
              <p className="text-zinc-600 dark:text-zinc-300 text-sm max-w-2xl leading-relaxed">
                {subject.description}
              </p>
            </div>

            {/* Quick Readiness Widget */}
            <div className="lg:col-span-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider block">
                  Exam Readiness Score
                </span>
                <span className="text-2xl font-extrabold text-brand-600 dark:text-brand-400">78% Ready</span>
                <span className="text-[11px] text-zinc-500 block mt-0.5">High-yield units prioritized</span>
              </div>
              <Button size="sm" variant="primary" onClick={() => setActiveTab('exam-mode')}>
                Launch Exam Mode
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} variant="pills" />

        {/* TAB 1: OVERVIEW & UNITS (Minimal 3D for High Readability) */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  <span>Syllabus Units & Examination Weightage ({units.length} Units)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Aligned with official SPPU Curriculum Guidelines & Credit Structure
                </p>
              </div>
              <Link href="/syllabus">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                  <span>Full Syllabus & Coverage Tracker</span>
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {units.map((unit) => (
                <Card key={unit.id} hoverable className="space-y-3 border-slate-200/90 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                      UNIT {unit.unitNumber}
                    </span>
                    <span className="text-slate-500">{unit.weightagePercentage}% Marks</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {unit.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {unit.description}
                  </p>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <Link
                      href={`/questions?subject_id=${subject.id}&unit_id=${unit.id}`}
                      className="text-slate-500 hover:text-brand-600 font-medium"
                    >
                      {unit.pyqCount} Solved Questions
                    </Link>
                    <Link
                      href="/syllabus"
                      className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                    >
                      View Syllabus &rarr;
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: PYQ INTELLIGENCE */}
        {activeTab === 'intelligence' && (
          <div className="space-y-6">
            <PYQIntelligenceView subjectId={subject.id} />
          </div>
        )}

        {/* TAB 3: SOLVED ANSWERS (Prioritize Readability) */}
        {activeTab === 'answers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Exam-Ready Solved Model Answers
                </h2>
                <p className="text-xs text-slate-500">
                  Formatted specifically for SPPU paper checkers with bullet points, diagrams, and schema tips.
                </p>
              </div>

              {/* Marks Filter */}
              <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-850 rounded-control border border-slate-200 dark:border-slate-700/80">
                {([5, 10] as const).map((marks) => (
                  <button
                    key={marks}
                    onClick={() => setActiveMarksFilter(marks)}
                    className={`px-3 py-1.5 rounded-control text-xs font-bold transition-all ${
                      activeMarksFilter === marks
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {marks}-Mark Answers
                  </button>
                ))}
              </div>
            </div>

            {DBMS_SAMPLE_PYQS.map((pyq) => {
              const answer =
                pyq.answers.find((a) => a.marks === activeMarksFilter) || pyq.answers[0];

              return (
                <Card key={pyq.id} className="p-6 space-y-5 border-slate-200/90 dark:border-slate-800 shadow-depth-2">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="brand">{pyq.examYear} {pyq.examSession}</Badge>
                      <span className="text-xs font-mono text-slate-400">{pyq.questionNumber}</span>
                      <span className="text-xs text-slate-500">• {pyq.marks} Marks</span>
                    </div>
                    <PriorityBadge priority={pyq.priority} size="sm" />
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {pyq.questionText}
                  </h3>

                  {/* High Readability Academic Answer (No font-mono for body) */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                        {answer.heading}
                      </h4>
                      <div className="academic-reader text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-850/70 p-4 sm:p-5 rounded-control border border-slate-200/80 dark:border-slate-800">
                        <p className="mb-0">{answer.summary}</p>
                      </div>
                    </div>

                    {/* Evaluator Points */}
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Must-Include Evaluator Points:
                      </h5>
                      <ul className="space-y-1.5">
                        {answer.keyPoints.map((point, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Diagram Hint */}
                    {answer.diagramDescription && (
                      <div className="p-3.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-control text-xs text-slate-700 dark:text-slate-300">
                        <strong className="text-slate-900 dark:text-white block mb-0.5">Schema / Diagram Hint:</strong>
                        <span>{answer.diagramDescription}</span>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* TAB 4: EXAM MODE */}
        {activeTab === 'exam-mode' && (
          <ExamModeView subjectId={subject.id} />
        )}

        {/* TAB 5: PRACTICE QUIZ */}
        {activeTab === 'quiz' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="p-6 sm:p-8 border-slate-200/90 dark:border-slate-800 shadow-depth-2">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <Badge variant="brand">{subject.shortName} Concept Evaluation</Badge>
                <span className="text-xs text-slate-500 font-mono">Sample Exam MCQ</span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug mb-6">
                {sampleQuiz.question}
              </h3>

              <div className="space-y-3">
                {sampleQuiz.options.map((opt, idx) => {
                  let stateClass =
                    'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-750 hover:border-brand-500';
                  if (selectedOption === idx) {
                    stateClass =
                      'bg-brand-50 dark:bg-brand-950/60 border-brand-600 font-bold text-brand-900 dark:text-brand-200 ring-1 ring-brand-500/20';
                  }
                  if (quizSubmitted) {
                    if (idx === sampleQuiz.correctAnswerIndex) {
                      stateClass =
                        'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 font-bold text-emerald-800 dark:text-emerald-200';
                    } else if (selectedOption === idx) {
                      stateClass =
                        'bg-red-50 dark:bg-red-950/40 border-red-500 font-bold text-red-800 dark:text-red-200';
                    }
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => !quizSubmitted && setSelectedOption(idx)}
                      className={`p-3.5 rounded-control border transition-all cursor-pointer flex items-center justify-between text-xs sm:text-sm font-medium ${stateClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {quizSubmitted && idx === sampleQuiz.correctAnswerIndex && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {!quizSubmitted ? (
                <Button
                  onClick={() => selectedOption !== null && setQuizSubmitted(true)}
                  disabled={selectedOption === null}
                  className="w-full mt-6"
                  variant="primary"
                >
                  Submit Answer
                </Button>
              ) : (
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                  <div
                    className={`p-4 rounded-control border text-xs leading-relaxed ${
                      selectedOption === sampleQuiz.correctAnswerIndex
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-900 dark:text-emerald-200'
                        : 'bg-red-50 dark:bg-red-950/30 border-red-200 text-red-900 dark:text-red-200'
                    }`}
                  >
                    <strong>
                      {selectedOption === sampleQuiz.correctAnswerIndex
                        ? 'Correct! '
                        : 'Incorrect. '}
                    </strong>
                    {sampleQuiz.explanation}
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedOption(null);
                      setQuizSubmitted(false);
                    }}
                    variant="outline"
                    className="w-full gap-2 text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Question</span>
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* TAB 6: AI STUDY ASSISTANT */}
        {activeTab === 'ai' && (
          <ScoreEdgeAIAssistant initialSubjectId={subject.id} />
        )}

      </main>

      <Footer />
    </div>
  );
}
