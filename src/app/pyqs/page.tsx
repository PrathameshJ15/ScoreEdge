'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { SearchInput } from '@/components/ui/Input';
import { DBMS_SAMPLE_PYQS, MVP_SUBJECTS } from '@/data/sppuData';
import { FileText, Download, Filter, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function PYQLibraryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('dbms');
  const [selectedYear, setSelectedYear] = useState<number | 'ALL'>('ALL');

  const filteredQuestions = DBMS_SAMPLE_PYQS.filter((q) => {
    const matchesSubject = selectedSubject === 'ALL' || q.subjectId === selectedSubject;
    const matchesYear = selectedYear === 'ALL' || q.examYear === selectedYear;
    const matchesQuery = q.questionText.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSubject && matchesYear && matchesQuery;
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            <span>Verified Question Bank</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            SPPU Previous Year Question Papers & Solved PYQs
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-base max-w-3xl">
            Search 5+ years of verified In-Sem & End-Sem examination questions categorized by unit, marks, frequency, and exam sessions.
          </p>
        </div>

        {/* Filter Controls */}
        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6">
              <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by keyword e.g. Normalization, Deadlock, ACID..."
              />
            </div>

            <div className="md:col-span-3">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-control py-2.5 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="ALL">All Subjects</option>
                {MVP_SUBJECTS.map((s) => (
                  <option key={s.id} value={s.id}>{s.shortName} ({s.code})</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <select
                value={selectedYear.toString()}
                onChange={(e) => setSelectedYear(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-control py-2.5 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="ALL">All Exam Years</option>
                <option value="2025">2025 Examination</option>
                <option value="2024">2024 Examination</option>
                <option value="2023">2023 Examination</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Results List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Found {filteredQuestions.length} Verified Questions</span>
            <span className="flex items-center gap-1 text-emerald-600">
              <ShieldCheck className="w-4 h-4" /> 100% Evaluator Verified Answers
            </span>
          </div>

          <div className="space-y-4">
            {filteredQuestions.map((q) => (
              <Card key={q.id} className="p-6 space-y-3">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="brand">{q.examYear} {q.examSession}</Badge>
                    <span className="text-xs font-mono text-slate-400">{q.questionNumber}</span>
                    <span className="text-xs text-slate-500">• Weightage: {q.marks} Marks</span>
                  </div>
                  <PriorityBadge priority={q.priority} size="sm" />
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                  {q.questionText}
                </h3>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Subject: DBMS • Difficulty: {q.difficulty}</span>
                  <Link href={`/subject/${q.subjectId}`}>
                    <span className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                      View Solved Answer &rarr;
                    </span>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
