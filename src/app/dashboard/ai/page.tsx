'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  BrainCircuit,
  UploadCloud,
  FileText,
  FileUp,
  FileCheck2,
  AlertCircle,
  Loader2,
  HelpCircle,
  BookOpen,
  MessageSquare,
  ArrowRight,
  Clock,
  Trash2,
  Plus,
  Layers,
  ChevronRight,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { UserStudyFile, AISession } from '@/lib/db/types';

export default function DashboardAIPage() {
  const router = useRouter();
  const [activeSubject, setActiveSubject] = useState('dbms');
  const [dropState, setDropState] = useState<'IDLE' | 'DRAGGING' | 'UPLOADING' | 'PROCESSING' | 'READY' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<UserStudyFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [sessions, setSessions] = useState<AISession[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UserStudyFile[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const subjectMap: Record<string, string> = {
    dbms: 'sub-dbms',
    dsa: 'sub-dsa',
    oop: 'sub-oop',
    os: 'sub-os',
    toc: 'sub-toc',
  };

  // Load chat history & files on mount
  const loadHistoryAndFiles = async () => {
    setIsLoadingHistory(true);
    try {
      const [sessRes, filesRes] = await Promise.all([
        fetch('/api/ai/sessions'),
        fetch('/api/files'),
      ]);

      if (sessRes.ok) {
        const sessData = await sessRes.json();
        const list = sessData?.data?.sessions || [];
        setSessions(list);
      }

      if (filesRes.ok) {
        const filesData = await filesRes.json();
        const fList = filesData?.data?.files || [];
        setUploadedFiles(fList);
        if (fList.length > 0 && !currentFile) {
          setCurrentFile(fList[0]);
        }
      }
    } catch {
      // offline fallback
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistoryAndFiles();
  }, []);

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropState !== 'UPLOADING' && dropState !== 'PROCESSING') {
      setDropState('DRAGGING');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropState === 'DRAGGING') {
      setDropState('IDLE');
    }
  };

  const processUploadedFile = async (file: File) => {
    setErrorMessage(null);
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMessage(`File exceeds 15MB maximum size (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
      setDropState('ERROR');
      return;
    }

    setDropState('UPLOADING');
    setUploadProgress(30);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subject_id', subjectMap[activeSubject] || 'sub-dbms');

      setUploadProgress(60);
      setDropState('PROCESSING');

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result?.error?.message || 'Failed to process file');
      }

      const newFile = result.data.file as UserStudyFile;
      setUploadProgress(100);
      setDropState('READY');
      setCurrentFile(newFile);
      setUploadedFiles((prev) => [newFile, ...prev.filter((f) => f.id !== newFile.id)]);
    } catch (err: unknown) {
      setDropState('ERROR');
      setErrorMessage(
        err instanceof Error ? err.message : 'Error uploading and analyzing document.'
      );
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDropState('IDLE');
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processUploadedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processUploadedFile(files[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Launch into dedicated GPT page with action
  const handleLaunchGPT = async (actionType?: 'review' | 'questions' | 'model_answer' | 'quiz' | 'custom') => {
    const file = currentFile;
    const newId = `sess-${Date.now()}`;
    let title = file ? `Study: ${file.filename}` : 'AI Study Session';

    if (actionType === 'review') {
      title = `Quick Review: ${file?.filename || 'Document'}`;
    } else if (actionType === 'questions') {
      title = `Important Questions: ${file?.filename || 'Document'}`;
    } else if (actionType === 'model_answer') {
      title = `Model Answers: ${file?.filename || 'Document'}`;
    } else if (actionType === 'quiz') {
      title = `Practice Quiz: ${file?.filename || 'Document'}`;
    }

    try {
      await fetch('/api/ai/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newId,
          title,
          file_id: file?.id,
          file_name: file?.filename,
          subject_id: subjectMap[activeSubject] || 'sub-dbms',
          source_mode: file ? 'BOTH' : 'SCOREDGE',
        }),
      });
    } catch {}

    const actionParam = actionType && actionType !== 'custom' ? `&action=${actionType}` : '';
    const fileParam = file ? `&file=${file.id}` : '';
    router.push(`/dashboard/ai/chat?session=${newId}${fileParam}${actionParam}`);
  };

  // Delete chat session
  const handleDeleteSession = async (e: React.MouseEvent, idToDelete: string) => {
    e.stopPropagation();
    try {
      await fetch(`/api/ai/sessions/${idToDelete}`, { method: 'DELETE' });
      localStorage.removeItem(`scoreedge_chat_${idToDelete}`);
      setSessions((prev) => prev.filter((s) => s.id !== idToDelete));
    } catch {}
  };

  // Format date helper
  const formatTimeAgo = (isoDate: string) => {
    try {
      const diffMs = Date.now() - new Date(isoDate).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 5) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const filteredHistory = sessions.filter((s) => {
    if (!searchFilter.trim()) return true;
    return (
      s.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (s.file_name && s.file_name.toLowerCase().includes(searchFilter.toLowerCase()))
    );
  });

  return (
    <DashboardShell activeSubject={activeSubject} onSubjectChange={setActiveSubject}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
        className="hidden"
      />

      <div className="space-y-6 pb-12">
        {/* Top Header Banner */}
        <div className="bg-white dark:bg-[#0a1120] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 relative overflow-hidden shadow-depth-1">
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 dark:bg-teal-400/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
                  <BrainCircuit className="w-3.5 h-3.5" />
                  Grounded SPPU Engine
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Strict Anti-Hallucination
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white font-sans flex items-center gap-2.5">
                <Sparkles className="w-7 h-7 text-teal-600 dark:text-teal-400" />
                ScoreEdge AI Study Tutor
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 max-w-2xl font-serif">
                Drag and drop your syllabus notes, question papers, or PDF textbooks. Our AI analyzes your document and helps you generate quick reviews, exam questions, model answers, or interactive GPT tutor dialogues.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => handleLaunchGPT('custom')}
                className="gap-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-xs rounded-xl h-10 px-4"
              >
                <Plus className="w-4 h-4" />
                <span>Open GPT Chat</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 1. Drag & Drop File Upload Frame */}
        <div className="bg-white dark:bg-[#0a1120] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-depth-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>Upload Study Material (PDF, Notes, Question Banks)</span>
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Max 15MB • PDF, DOCX, PPTX, TXT
            </span>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => {
              if (dropState !== 'UPLOADING' && dropState !== 'PROCESSING') {
                fileInputRef.current?.click();
              }
            }}
            className={`relative group rounded-2xl border-2 border-dashed p-8 sm:p-10 text-center transition-all cursor-pointer select-none ${
              dropState === 'DRAGGING'
                ? 'border-teal-400 bg-teal-950/20 shadow-md scale-[1.005]'
                : dropState === 'UPLOADING' || dropState === 'PROCESSING'
                ? 'border-indigo-400 bg-indigo-950/10 cursor-wait'
                : dropState === 'READY'
                ? 'border-emerald-500 bg-emerald-950/10'
                : dropState === 'ERROR'
                ? 'border-rose-400 bg-rose-950/10'
                : 'border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400/80 bg-slate-50/70 dark:bg-slate-900/40 hover:bg-teal-50/30 dark:hover:bg-teal-950/10'
            }`}
          >
            {/* Ready State */}
            {dropState === 'READY' && currentFile && (
              <div className="flex flex-col items-center justify-center space-y-3 py-2 animate-in zoom-in-95">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-300 dark:border-emerald-800">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    &quot;{currentFile.filename}&quot; Analyzed & Ready!
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                    Semantic text extracted ({currentFile.chunks_count || 4} chunks indexed). Choose an action below or click to chat.
                  </p>
                </div>
              </div>
            )}

            {/* Uploading or Processing State */}
            {(dropState === 'UPLOADING' || dropState === 'PROCESSING') && (
              <div className="flex flex-col items-center justify-center space-y-3 py-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-300 dark:border-indigo-800">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {dropState === 'UPLOADING' ? 'Uploading document...' : 'Extracting text & analyzing curriculum topics...'}
                  </p>
                  <div className="w-56 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mx-auto mt-2">
                    <div
                      className="h-full bg-teal-500 transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Dragging State */}
            {dropState === 'DRAGGING' && (
              <div className="flex flex-col items-center justify-center space-y-3 py-3 animate-bounce">
                <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-300 dark:border-teal-700">
                  <FileUp className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-teal-700 dark:text-teal-300">
                  Drop PDF to analyze with ScoreEdge AI
                </p>
              </div>
            )}

            {/* Idle or Error State */}
            {(dropState === 'IDLE' || dropState === 'ERROR') && (
              <div className="flex flex-col items-center justify-center space-y-3 py-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform shadow-xs">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Drag and drop your study notes or PDF here, or{' '}
                    <span className="text-teal-600 dark:text-teal-400 underline underline-offset-4">
                      browse from device
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Supports PDFs, Lecture Slides, Word Docs, Handwritten Scans, and Question Papers
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap justify-center pt-1">
                  {['PDF', 'DOCX', 'PPTX', 'TXT', 'SCANNED EXAMS'].map((ext) => (
                    <span
                      key={ext}
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      {ext}
                    </span>
                  ))}
                </div>

                {errorMessage && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 pt-2 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Active File Options / Action Buttons */}
          {currentFile && (
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    What would you like to do with
                  </span>
                  <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                    📄 {currentFile.filename}
                  </span>
                </div>

                {uploadedFiles.length > 1 && (
                  <select
                    value={currentFile.id}
                    onChange={(e) => {
                      const sel = uploadedFiles.find((f) => f.id === e.target.value);
                      if (sel) setCurrentFile(sel);
                    }}
                    className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none"
                  >
                    {uploadedFiles.map((f) => (
                      <option key={f.id} value={f.id}>
                        Switch to: {f.filename}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Action Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Quick Review */}
                <button
                  type="button"
                  onClick={() => handleLaunchGPT('review')}
                  className="p-4 rounded-xl border border-teal-200 dark:border-teal-800/80 bg-teal-50/30 dark:bg-teal-950/20 hover:bg-teal-50/70 dark:hover:bg-teal-950/40 text-left transition-all hover:scale-[1.01] shadow-2xs group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300">
                      <BookOpen className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400">
                      Quick Review & Summary
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Get an instant conceptual overview of key formulas, topics & definitions.
                  </p>
                </button>

                {/* 2. Top Important Questions */}
                <button
                  type="button"
                  onClick={() => handleLaunchGPT('questions')}
                  className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/30 dark:bg-indigo-950/20 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 text-left transition-all hover:scale-[1.01] shadow-2xs group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                      <HelpCircle className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      Important Questions
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Generate high-yield 2M, 5M, and 10M SPPU exam recurring questions.
                  </p>
                </button>

                {/* 3. Model Exam Answers */}
                <button
                  type="button"
                  onClick={() => handleLaunchGPT('model_answer')}
                  className="p-4 rounded-xl border border-amber-200 dark:border-amber-800/80 bg-amber-50/30 dark:bg-amber-950/20 hover:bg-amber-50/70 dark:hover:bg-amber-950/40 text-left transition-all hover:scale-[1.01] shadow-2xs group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                      <FileText className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
                      Model Answers
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Examiner-standard answers formatted with step markings and rubrics.
                  </p>
                </button>

                {/* 4. Interactive Quiz */}
                <button
                  type="button"
                  onClick={() => handleLaunchGPT('quiz')}
                  className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/30 dark:bg-emerald-950/20 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 text-left transition-all hover:scale-[1.01] shadow-2xs group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      Practice Quiz Drill
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Test your understanding with diagnostic MCQs and instant feedback.
                  </p>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2. Chat History Display (Placed Right Below the Drag and Drop Option) */}
        <div className="bg-white dark:bg-[#0a1120] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-depth-1 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <span>Previous Study Tutor Sessions</span>
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {sessions.length} Saved
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Click any previous session to restore the conversation and continue talking with your AI tutor.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search history..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500"
                />
              </div>

              <Button
                size="sm"
                onClick={() => handleLaunchGPT('custom')}
                className="h-8 px-3 text-xs gap-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 rounded-lg font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Session</span>
              </Button>
            </div>
          </div>

          {/* History Cards Grid */}
          {isLoadingHistory ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400 text-xs">
              <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
              <span>Loading saved tutor sessions...</span>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  No previous chat history found
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Upload a PDF above or start a new chat to begin your first study tutor session.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => handleLaunchGPT('custom')}
                className="text-xs bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-3 py-1.5"
              >
                Start First Chat
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredHistory.map((sess) => (
                <div
                  key={sess.id}
                  onClick={() => router.push(`/dashboard/ai/chat?session=${sess.id}`)}
                  className="group relative rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 hover:border-teal-500 dark:hover:border-teal-400/80 p-4 cursor-pointer transition-all shadow-2xs hover:shadow-depth-1 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-teal-600 dark:text-teal-400 font-semibold truncate">
                        {sess.file_name ? (
                          <>
                            <FileText className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate max-w-[180px]">{sess.file_name}</span>
                          </>
                        ) : (
                          <>
                            <BrainCircuit className="w-3.5 h-3.5 shrink-0" />
                            <span>Grounded SPPU</span>
                          </>
                        )}
                      </span>

                      <button
                        type="button"
                        title="Delete Session"
                        onClick={(e) => handleDeleteSession(e, sess.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {sess.title}
                    </h3>

                    {(sess as any).last_message && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 font-serif">
                        &quot;{(sess as any).last_message}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(sess.updated_at)}
                      </span>
                      {(sess as any).message_count !== undefined && (
                        <span>• {(sess as any).message_count} messages</span>
                      )}
                    </div>

                    <span className="text-teal-600 dark:text-teal-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 text-[11px]">
                      Continue <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
