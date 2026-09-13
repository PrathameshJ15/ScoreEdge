'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { SearchInput } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  BookOpen,
  CheckCircle2,
  Copy,
  Check,
  Printer,
  Download,
  Search,
  Layers,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Clock,
  BookText,
  FileCheck2,
  RotateCcw,
} from 'lucide-react';

interface University {
  id: string;
  name: string;
  code: string;
}

interface Pattern {
  id: string;
  name: string;
  code: string;
}

interface Branch {
  id: string;
  name: string;
  code: string;
}

interface Semester {
  id: string;
  name: string;
  semester_number: number;
}

interface Subject {
  id: string;
  name: string;
  short_name: string;
  code: string;
  total_units: number;
  total_credits: number;
  pattern_id: string;
  branch_id: string;
  semester_id: string;
}

interface Unit {
  id: string;
  subject_id: string;
  unit_number: number;
  title: string;
  description: string;
  weightage_percentage: number;
}

interface Topic {
  id: string;
  unit_id: string;
  title: string;
  description: string;
  order_index: number;
  importance_level: 'MUST_STUDY' | 'HIGH' | 'MEDIUM' | 'LOW';
}

interface SyllabusItem {
  id: string;
  unit_id: string;
  topic_id?: string | null;
  content: string;
  reference_materials?: string | null;
  hours_allocated: number;
  unit?: { id: string; unit_number: number; title: string };
  topic?: { id: string; title: string; importance_level: string };
}

export default function SyllabusPage() {
  // Academic Hierarchy States
  const [selectedUniversity, setSelectedUniversity] = useState('uni-sppu');
  const [selectedPattern, setSelectedPattern] = useState('pat-2024');
  const [selectedBranch, setSelectedBranch] = useState('branch-comp');
  const [selectedSemester, setSelectedSemester] = useState('sem-3');
  const [selectedSubjectId, setSelectedSubjectId] = useState('sub-dbms');

  // Syllabus Content
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [syllabusItems, setSyllabusItems] = useState<SyllabusItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Coverage Tracker State
  const [completedTopicIds, setCompletedTopicIds] = useState<Set<string>>(new Set());

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  // Initial load of subjects
  useEffect(() => {
    async function loadSubjects() {
      try {
        const res = await fetch('/api/subjects?limit=100');
        if (res.ok) {
          const json = await res.json();
          setSubjects(json.data || []);
        }
      } catch (e) {
        console.error('Failed to load subjects', e);
      }
    }
    loadSubjects();
  }, []);

  // Filter subjects based on selected pattern, branch, and semester
  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchPattern = !selectedPattern || s.pattern_id === selectedPattern;
      const matchBranch = !selectedBranch || s.branch_id === selectedBranch;
      const matchSemester = !selectedSemester || s.semester_id === selectedSemester;
      return matchPattern && matchBranch && matchSemester;
    });
  }, [subjects, selectedPattern, selectedBranch, selectedSemester]);

  // Adjust selected subject if current selection is not in filtered list
  useEffect(() => {
    if (filteredSubjects.length > 0 && !filteredSubjects.some((s) => s.id === selectedSubjectId)) {
      setSelectedSubjectId(filteredSubjects[0].id);
    }
  }, [filteredSubjects, selectedSubjectId]);

  // Load Units, Topics, Syllabus Items for current subject
  useEffect(() => {
    if (!selectedSubjectId) return;

    async function loadSubjectData() {
      try {
        setLoading(true);

        const [unitsRes, topicsRes, syllabusRes] = await Promise.all([
          fetch(`/api/units?subject_id=${selectedSubjectId}&limit=50`),
          fetch(`/api/topics?subject_id=${selectedSubjectId}&limit=100`),
          fetch(`/api/syllabus?subject_id=${selectedSubjectId}&limit=100`),
        ]);

        if (unitsRes.ok) {
          const json = await unitsRes.json();
          setUnits(json.data || []);
        }
        if (topicsRes.ok) {
          const json = await topicsRes.json();
          setTopics(json.data || []);
        }
        if (syllabusRes.ok) {
          const json = await syllabusRes.json();
          setSyllabusItems(json.data || []);
        }
      } catch (e) {
        console.error('Error fetching subject syllabus', e);
      } finally {
        setLoading(false);
      }
    }

    loadSubjectData();
  }, [selectedSubjectId]);

  const currentSubject = useMemo(() => {
    return subjects.find((s) => s.id === selectedSubjectId) || filteredSubjects[0];
  }, [subjects, selectedSubjectId, filteredSubjects]);

  // Handle topic coverage toggle
  const toggleTopicCoverage = async (topicId: string, unitId: string) => {
    const isCompleted = completedTopicIds.has(topicId);
    const newSet = new Set(completedTopicIds);
    if (isCompleted) {
      newSet.delete(topicId);
    } else {
      newSet.add(topicId);
    }
    setCompletedTopicIds(newSet);

    // Call /api/progress in background
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_id: selectedSubjectId,
          unit_id: unitId,
          topic_id: topicId,
          item_type: 'TOPIC',
          item_id: topicId,
          is_completed: !isCompleted,
        }),
      });
    } catch (e) {
      console.error('Failed to sync progress', e);
    }
  };

  // Calculate coverage stats
  const totalTopics = topics.length;
  const coveredTopics = useMemo(() => {
    return topics.filter((t) => completedTopicIds.has(t.id)).length;
  }, [topics, completedTopicIds]);
  const coveragePercent = totalTopics > 0 ? Math.round((coveredTopics / totalTopics) * 100) : 0;

  // Filtered units & topics based on search
  const filteredUnits = useMemo(() => {
    if (!searchTerm.trim()) return units;
    const query = searchTerm.toLowerCase();

    return units.filter((u) => {
      const matchUnit = u.title.toLowerCase().includes(query) || u.description.toLowerCase().includes(query);
      const matchTopic = topics.some((t) => t.unit_id === u.id && t.title.toLowerCase().includes(query));
      const matchSyllabus = syllabusItems.some(
        (s) => s.unit_id === u.id && (s.content.toLowerCase().includes(query) || (s.reference_materials && s.reference_materials.toLowerCase().includes(query)))
      );
      return matchUnit || matchTopic || matchSyllabus;
    });
  }, [units, topics, syllabusItems, searchTerm]);

  // Copy syllabus text
  const handleCopySyllabus = () => {
    if (!currentSubject) return;

    let text = `=======================================================\n`;
    text += `SAVITRIBAI PHULE PUNE UNIVERSITY (SPPU)\n`;
    text += `DEPARTMENT OF COMPUTER ENGINEERING\n`;
    text += `SYLLABUS: ${currentSubject.name} (${currentSubject.code})\n`;
    text += `Pattern: 2024 Pattern (NEP) | Credits: ${currentSubject.total_credits} | Units: ${units.length}\n`;
    text += `=======================================================\n\n`;

    units.forEach((u) => {
      text += `UNIT ${u.unit_number}: ${u.title.toUpperCase()} (Weightage: ${u.weightage_percentage}%)\n`;
      text += `-------------------------------------------------------\n`;
      text += `${u.description}\n\n`;

      const unitSyllabus = syllabusItems.filter((s) => s.unit_id === u.id);
      if (unitSyllabus.length > 0) {
        text += `SYLLABUS CONTENT & TOPICS:\n`;
        unitSyllabus.forEach((s) => {
          text += `* ${s.content} [${s.hours_allocated} Teaching Hours]\n`;
          if (s.reference_materials) {
            text += `  References: ${s.reference_materials}\n`;
          }
        });
        text += `\n`;
      }

      const unitTopics = topics.filter((t) => t.unit_id === u.id);
      if (unitTopics.length > 0) {
        text += `DETAILED TOPICS & PRIORITY:\n`;
        unitTopics.forEach((t) => {
          text += `  - ${t.title} [Priority: ${t.importance_level}]\n`;
        });
        text += `\n`;
      }
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Print syllabus
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Download syllabus as formatted text file
  const handleDownload = () => {
    if (!currentSubject) return;

    let text = `SAVITRIBAI PHULE PUNE UNIVERSITY\n`;
    text += `OFFICIAL SYLLABUS DOCUMENT\n`;
    text += `Subject: ${currentSubject.name} (${currentSubject.code})\n`;
    text += `Pattern: 2024 Pattern (NEP 2020)\n\n`;

    units.forEach((u) => {
      text += `UNIT ${u.unit_number}: ${u.title}\n`;
      text += `Overview: ${u.description}\n`;
      const unitItems = syllabusItems.filter((s) => s.unit_id === u.id);
      unitItems.forEach((item) => {
        text += `- ${item.content} (${item.hours_allocated} hrs)\n`;
        if (item.reference_materials) {
          text += `  Reference: ${item.reference_materials}\n`;
        }
      });
      text += `\n`;
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SPPU_${currentSubject.short_name}_${currentSubject.code}_Syllabus.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fafaf9] dark:bg-[#0a0a0b]">
      <Navbar />

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Academic Hierarchy Breadcrumbs */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800">
              <GraduationCap className="w-3.5 h-3.5" />
              Academic Hierarchy & Curriculum
            </span>
            <span className="text-slate-400">•</span>
            <span>SPPU &gt; Pattern 2024 &gt; Computer Engineering &gt; SE &gt; {currentSubject?.short_name || 'DBMS'}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Official University Syllabus Explorer
              </h1>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 max-w-2xl mt-1 leading-relaxed">
                Browse official SPPU syllabus units, track individual topic coverage, search unit objectives, and download curriculum text.
              </p>
            </div>

            {/* Action Buttons: Copy, Print, Download */}
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <Button variant="outline" size="sm" onClick={handleCopySyllabus} className="gap-1.5 text-xs">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5 text-xs">
                <Download className="w-3.5 h-3.5" />
                <span>Download .txt</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 6-Level Academic Hierarchy Navigation Strip */}
        <Card className="p-4 sm:p-5 border-zinc-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 space-y-3">
          <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-brand-600" />
            <span>Academic Hierarchy Filter</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Level 1: University */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                1. University
              </label>
              <select
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-control py-1.5 px-2.5 text-xs text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-brand-500/40"
              >
                <option value="uni-sppu">SPPU (Pune)</option>
              </select>
            </div>

            {/* Level 2: Pattern */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                2. Pattern
              </label>
              <select
                value={selectedPattern}
                onChange={(e) => setSelectedPattern(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-control py-1.5 px-2.5 text-xs text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-brand-500/40"
              >
                <option value="pat-2024">2024 Pattern (NEP)</option>
                <option value="pat-2019">2019 Pattern</option>
              </select>
            </div>

            {/* Level 3: Branch */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                3. Branch
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-control py-1.5 px-2.5 text-xs text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-brand-500/40"
              >
                <option value="branch-comp">Computer Engg</option>
                <option value="branch-it">Information Tech</option>
                <option value="branch-aids">AI &amp; Data Science</option>
              </select>
            </div>

            {/* Level 4: Academic Year */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                4. Academic Year
              </label>
              <select
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-control py-1.5 px-2.5 text-xs text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-brand-500/40"
              >
                <option value="ay-se">SE (Second Year)</option>
              </select>
            </div>

            {/* Level 5: Semester */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                5. Semester
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-control py-1.5 px-2.5 text-xs text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-brand-500/40"
              >
                <option value="sem-3">Semester 3</option>
                <option value="sem-4">Semester 4</option>
              </select>
            </div>

            {/* Level 6: Subject */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                6. Subject
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full bg-brand-50 dark:bg-brand-950/60 border border-brand-300 dark:border-brand-700 rounded-control py-1.5 px-2.5 text-xs text-brand-900 dark:text-brand-200 font-bold focus:ring-2 focus:ring-brand-500/40"
              >
                {filteredSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.short_name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Current Subject Overview & Coverage Banner */}
        {currentSubject && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Subject Info Card */}
            <Card className="md:col-span-8 p-5 border-slate-200/90 dark:border-slate-800 shadow-depth-1 bg-white dark:bg-slate-900 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-800">
                    Course Code: {currentSubject.code}
                  </span>
                  <span className="text-xs text-slate-500">
                    {currentSubject.total_units} Units • {currentSubject.total_credits} University Credits
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {currentSubject.name} ({currentSubject.short_name})
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Official SPPU syllabus mapping teaching hours, textbook references, and chapter weightage for {currentSubject.name}.
                </p>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <Link href={`/subject/${currentSubject.id}`}>
                  <Button variant="outline" size="sm" className="gap-1 text-xs">
                    <span>Open Subject Exam Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
                <Link href={`/questions?subject_id=${currentSubject.id}`}>
                  <Button variant="outline" size="sm" className="gap-1 text-xs">
                    <span>View {currentSubject.short_name} Question Bank</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Coverage Tracker Progress Meter Card */}
            <Card className="md:col-span-4 p-5 border-slate-200/90 dark:border-slate-800 shadow-depth-1 bg-white dark:bg-slate-900 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  <span>Syllabus Coverage</span>
                  <span className="font-tabular text-emerald-600 dark:text-emerald-400">{coveragePercent}% Covered</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${coveragePercent}%` }}
                  />
                </div>
                <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-tabular">
                  <strong>{coveredTopics}</strong> of <strong>{totalTopics}</strong> syllabus topics completed by you.
                </div>
              </div>

              <div className="pt-3 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
                Check off topics as you study to track your preparation readiness before exam week.
              </div>
            </Card>
          </div>
        )}

        {/* Search within Syllabus Bar */}
        <div className="print:hidden">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search within ${currentSubject?.short_name || 'Syllabus'} (e.g. Normalization, B-Tree, Deadlock, Relational Algebra)...`}
          />
        </div>

        {/* Units & Syllabus Breakdown */}
        {loading ? (
          <div className="space-y-4 py-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 animate-pulse space-y-3">
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
              </Card>
            ))}
          </div>
        ) : filteredUnits.length > 0 ? (
          <div className="space-y-6">
            {filteredUnits.map((unit) => {
              const unitTopics = topics.filter((t) => t.unit_id === unit.id);
              const unitSyllabus = syllabusItems.filter((s) => s.unit_id === unit.id);

              return (
                <Card
                  key={unit.id}
                  className="p-6 border-slate-200/90 dark:border-slate-800 shadow-depth-1 bg-white dark:bg-slate-900 space-y-5"
                >
                  {/* Unit Title Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-tabular">
                        Unit {unit.unit_number}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        {unit.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-800 font-tabular">
                        Weightage: {unit.weightage_percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Unit Description */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {unit.description}
                  </p>

                  {/* Official Syllabus Items & Teaching Hours */}
                  {unitSyllabus.length > 0 && (
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 space-y-3">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <BookText className="w-3.5 h-3.5 text-brand-600" />
                        <span>Prescribed Curriculum Content &amp; Reference Textbooks</span>
                      </div>

                      <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                        {unitSyllabus.map((item) => (
                          <div key={item.id} className="flex flex-col gap-1 pl-2 border-l-2 border-brand-400 dark:border-brand-600">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{item.content}</span>
                              <span className="text-[11px] font-mono text-slate-500 font-tabular">
                                {item.hours_allocated} Teaching Hours
                              </span>
                            </div>
                            {item.reference_materials && (
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                <strong>Textbook Reference:</strong> {item.reference_materials}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Topics List with Interactive Coverage Checkboxes */}
                  {unitTopics.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <span>Topics &amp; Exam Priority</span>
                        <span className="text-[11px] text-slate-400">Check box to mark topic studied</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {unitTopics.map((topic) => {
                          const isDone = completedTopicIds.has(topic.id);
                          return (
                            <div
                              key={topic.id}
                              onClick={() => toggleTopicCoverage(topic.id, unit.id)}
                              className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start justify-between gap-2.5 ${
                                isDone
                                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                                  : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <input
                                  type="checkbox"
                                  checked={isDone}
                                  onChange={() => {}} // handled by parent div click
                                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                                />
                                <div>
                                  <span
                                    className={`text-xs font-semibold block ${
                                      isDone
                                        ? 'line-through text-slate-400 dark:text-slate-500'
                                        : 'text-slate-900 dark:text-slate-100'
                                    }`}
                                  >
                                    {topic.title}
                                  </span>
                                  {topic.description && (
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                                      {topic.description}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <PriorityBadge priority={topic.importance_level} size="sm" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Unit Footer Link to Questions */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      Practice questions available for Unit {unit.unit_number}
                    </span>
                    <Link
                      href={`/questions?subject_id=${currentSubject.id}&unit_id=${unit.id}`}
                      className="font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                    >
                      <span>View Unit {unit.unit_number} Question Bank</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No Units Found"
            description={`No syllabus content matches your search term "${searchTerm}". Try searching for another topic or resetting search.`}
            actionLabel="Clear Search"
            onAction={() => setSearchTerm('')}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}