'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import {
  MVP_SUBJECTS,
  DBMS_UNITS,
  DBMS_QUESTION_CLUSTERS,
  DBMS_SAMPLE_PYQS,
  DBMS_EXAM_PRESETS,
} from '@/data/sppuData';
import {
  BookOpen,
  Sparkles,
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
} from 'lucide-react';

export default function SubjectPage() {
  const params = useParams();
  const subjectId = (params?.id as string) || 'dbms';

  const subject = MVP_SUBJECTS.find((s) => s.id === subjectId) || MVP_SUBJECTS[0];
  const [activeTab, setActiveTab] = useState('overview');
  const [activePresetKey, setActivePresetKey] = useState<'2h' | '5h' | '1d'>('2h');
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [activeMarksFilter, setActiveMarksFilter] = useState<5 | 10>(5);

  const activePreset = DBMS_EXAM_PRESETS.find((p) => p.durationKey === activePresetKey) || DBMS_EXAM_PRESETS[0];

  const toggleTask = (id: string) => {
    if (completedTaskIds.includes(id)) {
      setCompletedTaskIds(completedTaskIds.filter((t) => t !== id));
    } else {
      setCompletedTaskIds([...completedTaskIds, id]);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'intelligence', label: 'PYQ Intelligence', count: DBMS_QUESTION_CLUSTERS.length, icon: <Sparkles className="w-4 h-4 text-brand-500" /> },
    { id: 'answers', label: 'Solved Answers', count: DBMS_SAMPLE_PYQS.length, icon: <FileText className="w-4 h-4 text-blue-500" /> },
    { id: 'exam-mode', label: 'Exam Mode', icon: <Zap className="w-4 h-4 text-amber-500" /> },
    { id: 'quiz', label: 'Practice Quiz', icon: <HelpCircle className="w-4 h-4 text-emerald-500" /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Breadcrumb Back */}
        <div className="flex items-center justify-between text-xs">
          <Link href="/explore" className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Explorer</span>
          </Link>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-control text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-control text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800">
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Subject Header Banner */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="brand">SE Computer Engineering</Badge>
              <Badge variant="outline">2024 Pattern</Badge>
              <Badge variant="default">Sem {subject.semester}</Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <span>SUB CODE: {subject.code}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {subject.name} ({subject.shortName})
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-sm max-w-2xl">
                Official SPPU syllabus breakdown, unit weightage, PYQ frequency analysis, 2/5/10-mark solved answers, and 5-hour emergency crash preparation.
              </p>
            </div>

            {/* Quick Readiness Score Widget */}
            <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-card border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-semibold block">Target Exam Readiness</span>
                <span className="text-2xl font-extrabold text-brand-600 dark:text-brand-400">78% Ready</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Weak area: Unit 4 Concurrency</span>
              </div>
              <Button size="sm" variant="primary" onClick={() => setActiveTab('exam-mode')}>
                Exam Mode
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pills" />

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Units Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-brand-500" />
                  <span>Syllabus Units & Weightage ({DBMS_UNITS.length} Units)</span>
                </h2>
                <span className="text-xs text-slate-500">100% SPPU 2024 Pattern Aligned</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DBMS_UNITS.map((unit) => (
                  <Card key={unit.id} hoverable className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                        UNIT {unit.unitNumber}
                      </span>
                      <span className="text-slate-500">{unit.weightagePercentage}% Marks Weightage</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {unit.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {unit.description}
                    </p>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold">{unit.pyqCount} Solved Questions</span>
                      <button
                        onClick={() => setActiveTab('intelligence')}
                        className="text-brand-600 font-semibold hover:underline"
                      >
                        Analyze Unit &rarr;
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PYQ INTELLIGENCE */}
        {activeTab === 'intelligence' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  High-Yield Question Clusters
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Past 5 years of SPPU papers analyzed and clustered by concept.
                </p>
              </div>
              <PriorityBadge priority="MUST_STUDY" />
            </div>

            <div className="space-y-4">
              {DBMS_QUESTION_CLUSTERS.map((cluster) => (
                <Card key={cluster.id} className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={cluster.priority} size="sm" />
                        <span className="text-xs font-semibold text-slate-500">Unit {cluster.unitId}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {cluster.conceptName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {cluster.topicName} • Typical Marks: {cluster.typicalMarks} • Last Asked: {cluster.lastAskedYear}
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-control text-right border border-slate-200/60 dark:border-slate-700 min-w-[180px]">
                      <span className="text-xs font-semibold text-slate-500 block">Paper Frequency</span>
                      <span className="text-lg font-extrabold text-red-500 flex items-center justify-end gap-1">
                        <Flame className="w-4 h-4 fill-red-500" />
                        {cluster.frequency} / {cluster.totalPapersAnalyzed} Papers
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SOLVED ANSWERS */}
        {activeTab === 'answers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Exam-Ready Solved Answers
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveMarksFilter(5)}
                  className={`px-3 py-1.5 rounded-control text-xs font-bold ${
                    activeMarksFilter === 5 ? 'bg-brand-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  5-Mark Answers
                </button>
                <button
                  onClick={() => setActiveMarksFilter(10)}
                  className={`px-3 py-1.5 rounded-control text-xs font-bold ${
                    activeMarksFilter === 10 ? 'bg-brand-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  10-Mark Answers
                </button>
              </div>
            </div>

            {DBMS_SAMPLE_PYQS.map((pyq) => {
              const answer = pyq.answers.find((a) => a.marks === activeMarksFilter) || pyq.answers[0];
              return (
                <Card key={pyq.id} className="p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <Badge variant="brand">{pyq.examYear} {pyq.examSession}</Badge>
                    <PriorityBadge priority={pyq.priority} size="sm" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{pyq.questionText}</h3>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-control font-mono text-xs text-slate-700 dark:text-slate-300">
                    <p className="font-bold mb-1">{answer.heading}</p>
                    <p>{answer.summary}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* TAB 4: EXAM MODE */}
        {activeTab === 'exam-mode' && (
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-card space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-4 h-4" /> Emergency Crash Plan
                </span>
                <div className="flex gap-2">
                  {(['2h', '5h', '1d'] as const).map((key) => (
                    <button
                      key={key}
                      onClick={() => setActivePresetKey(key)}
                      className={`px-3 py-1.5 rounded-control text-xs font-bold ${
                        activePresetKey === key ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {key.toUpperCase()} Plan
                    </button>
                  ))}
                </div>
              </div>

              <h2 className="text-xl font-bold">{activePreset.title}</h2>
              <p className="text-xs text-slate-400">{activePreset.description}</p>

              <div className="space-y-2 pt-2">
                {activePreset.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleTask(item.id)}
                    className="p-3 bg-slate-800 rounded-control flex items-center justify-between cursor-pointer hover:bg-slate-750"
                  >
                    <div className="flex items-center gap-3 text-xs">
                      <input
                        type="checkbox"
                        checked={completedTaskIds.includes(item.id)}
                        onChange={() => {}}
                        className="rounded accent-amber-500"
                      />
                      <span className={completedTaskIds.includes(item.id) ? 'line-through text-slate-500' : 'text-white'}>
                        {item.topicName} (~{item.estimatedMinutes} mins)
                      </span>
                    </div>
                    <PriorityBadge priority={item.priority} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: QUIZ */}
        {activeTab === 'quiz' && (
          <Card className="p-8 text-center space-y-4">
            <HelpCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Start DBMS High-Yield Quiz</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              15 Multiple choice questions designed from actual SPPU exam papers. Tests your conceptual accuracy before sitting for the exam.
            </p>
            <Button variant="primary" className="mx-auto">
              Launch 15-Question Quiz
            </Button>
          </Card>
        )}

      </main>

      <Footer />
    </div>
  );
}
