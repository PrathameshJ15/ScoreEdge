'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  GraduationCap,
  FileText,
  HelpCircle,
  Calendar,
  Zap,
  MessageSquare,
  Sparkles,
  Send,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Layers,
  HardDrive,
  FileUp,
  FileBox,
  PanelRightOpen,
  PanelRightClose,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { dbStore } from '@/lib/db/client';
import {
  UserStudyFile,
  AISession,
  KnowledgeSourceMode,
} from '@/lib/db/types';
import { QuickActionType } from '@/lib/ai/prompts';
import { KnowledgeSourceSelector } from './KnowledgeSourceSelector';
import { StudyFileDropzone } from './StudyFileDropzone';
import { QuickActionsBar } from './QuickActionsBar';
import { UploadedFilesDrawer } from './UploadedFilesDrawer';
import { InteractiveQuizCard } from './InteractiveQuizCard';

export type StudyMode =
  | 'EXPLAIN'
  | 'TEACH_ME'
  | 'EXAM_ANSWER'
  | 'QUIZ_ME'
  | 'STUDY_PLAN'
  | 'REVISE'
  | 'ASK_SCOREEDGE';

export interface ScoreEdgeAIAssistantProps {
  initialSubjectId?: string;
  initialQuery?: string;
  initialMode?: StudyMode;
  initialMarksTarget?: 2 | 5 | 10;
  className?: string;
}

interface CitationItem {
  type: 'SYLLABUS' | 'TOPIC' | 'PYQ' | 'ANSWER' | 'NOTE' | 'CLUSTER' | 'PRIORITY' | 'STUDENT_MATERIAL';
  id: string;
  title: string;
  relevance: number;
}

interface AIResponseData {
  content: string;
  provider: string;
  model: string;
  grounded_sources_count: number;
  student_sources_count?: number;
  citations: CitationItem[];
  latency_ms: number;
  is_fallback: boolean;
  is_grounded: boolean;
  disclaimer: string;
}

const STUDY_MODES: Array<{
  id: StudyMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  placeholder: string;
  defaultPrompt: string;
}> = [
  {
    id: 'EXPLAIN',
    label: 'Explain',
    icon: BookOpen,
    description: 'Syllabus-grounded breakdown of core engineering concepts.',
    placeholder: 'e.g. Explain 3NF and BCNF with decomposition conditions',
    defaultPrompt: 'Explain Normalization and Boyce-Codd Normal Form',
  },
  {
    id: 'TEACH_ME',
    label: 'Teach Me',
    icon: GraduationCap,
    description: 'First-principles Socratic tutorial with real-world analogies.',
    placeholder: 'e.g. Teach me ACID properties from scratch with an analogy',
    defaultPrompt: 'Teach me ACID properties with an intuitive analogy',
  },
  {
    id: 'EXAM_ANSWER',
    label: 'Exam Answer',
    icon: FileText,
    description: 'SPPU examiner-standard answer formatted for 2M, 5M, or 10M.',
    placeholder: 'e.g. Differentiate between 3NF and BCNF with an example',
    defaultPrompt: 'Write a model answer on Two-Phase Locking (2PL)',
  },
  {
    id: 'QUIZ_ME',
    label: 'Quiz Me',
    icon: HelpCircle,
    description: 'Targeted diagnostic practice drill with examiner explanations.',
    placeholder: 'e.g. Test me on Transaction Processing and Concurrency Control',
    defaultPrompt: 'Test me on Database Transactions and Deadlocks',
  },
  {
    id: 'STUDY_PLAN',
    label: 'Study Plan',
    icon: Calendar,
    description: 'Time-budgeted preparation roadmap based on historical recurrence.',
    placeholder: 'e.g. Create a 5-hour high-yield study plan for Unit 2 and Unit 3',
    defaultPrompt: 'Generate a high-yield study plan for DBMS Unit 2',
  },
  {
    id: 'REVISE',
    label: 'Revise',
    icon: Zap,
    description: 'High-density revision cheat-sheet and costly exam traps.',
    placeholder: 'e.g. Last-minute formula sheet and exam traps for Normalization',
    defaultPrompt: 'High-yield revision sheet for Normalization & Functional Dependencies',
  },
  {
    id: 'ASK_SCOREEDGE',
    label: 'Ask ScoreEdge',
    icon: MessageSquare,
    description: 'Ask any syllabus question grounded strictly in verified records.',
    placeholder: 'e.g. Why does BCNF not always preserve functional dependencies?',
    defaultPrompt: 'Why is BCNF strictly stronger than 3NF?',
  },
];

export const ScoreEdgeAIAssistant: React.FC<ScoreEdgeAIAssistantProps> = ({
  initialSubjectId = 'sub-dbms',
  initialQuery = '',
  initialMode = 'EXPLAIN',
  initialMarksTarget = 5,
  className = '',
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjectId);
  const [selectedMode, setSelectedMode] = useState<StudyMode>(initialMode);
  const [marksTarget, setMarksTarget] = useState<2 | 5 | 10>(initialMarksTarget);
  const [query, setQuery] = useState<string>(initialQuery);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<AIResponseData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showCitations, setShowCitations] = useState<boolean>(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<string | null>(null);

  // Study Material Workspace state
  const [sourceMode, setSourceMode] = useState<KnowledgeSourceMode>('SCOREDGE');
  const [uploadedFiles, setUploadedFiles] = useState<UserStudyFile[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [sessions, setSessions] = useState<AISession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(undefined);
  const [showDrawer, setShowDrawer] = useState<boolean>(true);
  const [showDropzone, setShowDropzone] = useState<boolean>(true);

  const subjects = dbStore.subjects.slice(0, 8);
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const activeModeConfig = STUDY_MODES.find((m) => m.id === selectedMode) || STUDY_MODES[0];

  // Fetch initial files and sessions
  useEffect(() => {
    const fetchWorkspaceData = async () => {
      try {
        const [filesRes, sessionsRes] = await Promise.all([
          fetch('/api/files'),
          fetch('/api/ai/sessions'),
        ]);

        if (filesRes.ok) {
          const filesData = await filesRes.json();
          const filesList = filesData?.data?.files || (Array.isArray(filesData?.data) ? filesData.data : []);
          if (Array.isArray(filesList)) {
            setUploadedFiles(filesList);
            setSelectedFileIds(filesList.map((f: UserStudyFile) => f.id));
            if (filesList.length > 0) {
              setSourceMode('BOTH');
            }
          }
        }

        if (sessionsRes.ok) {
          const sessionsData = await sessionsRes.json();
          const sessionList = sessionsData?.data?.sessions || (Array.isArray(sessionsData?.data) ? sessionsData.data : []);
          if (Array.isArray(sessionList)) {
            setSessions(sessionList);
          }
        }
      } catch {
        // Silently fallback if offline or during testing
      }
    };

    fetchWorkspaceData();
  }, []);

  const handleUploadSuccess = (newFile: UserStudyFile) => {
    setUploadedFiles((prev) => [newFile, ...prev.filter((f) => f.id !== newFile.id)]);
    setSelectedFileIds((prev) => Array.from(new Set([newFile.id, ...prev])));
    // Switch to BOTH or MY_MATERIAL to immediately ground queries in the new material
    if (sourceMode === 'SCOREDGE') {
      setSourceMode('BOTH');
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const res = await fetch(`/api/files/${fileId}`, { method: 'DELETE' });
      if (res.ok) {
        setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
        setSelectedFileIds((prev) => prev.filter((id) => id !== fileId));
      }
    } catch {
      // optimistic update rollback if necessary
    }
  };

  const handleToggleFileSelection = (fileId: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  const handleSelectAllFiles = () => {
    setSelectedFileIds(uploadedFiles.map((f) => f.id));
  };

  const handleClearFileSelection = () => {
    setSelectedFileIds([]);
  };

  const handleNewSession = async () => {
    try {
      const res = await fetch('/api/ai/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Study Session: ${currentSubject?.short_name || 'SPPU'}`,
          subject_id: selectedSubjectId,
          source_mode: sourceMode,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newSess = data?.data?.session || data?.data;
        if (newSess) {
          setSessions((prev) => [newSess, ...prev]);
          setCurrentSessionId(newSess.id);
          setResponse(null);
          setQuery('');
        }
      }
    } catch {
      setResponse(null);
      setQuery('');
    }
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setSourceMode(session.source_mode);
      if (session.subject_id) setSelectedSubjectId(session.subject_id);
    }
  };

  const quickSuggestions: string[] = useMemo(() => {
    if (selectedSubjectId === 'sub-dbms') {
      switch (selectedMode) {
        case 'EXAM_ANSWER':
          return [
            'Differentiate between 3NF and BCNF with examples',
            'Explain Two-Phase Locking (2PL) protocol',
            'Explain ACID properties with an example',
          ];
        case 'TEACH_ME':
          return [
            'Teach me Lossless Join Decomposition from scratch',
            'Teach me Database Transactions with an ATM analogy',
            'Teach me Serializability vs Recoverability',
          ];
        case 'QUIZ_ME':
          return [
            'Test me on Normalization and Prime Attributes',
            'Test me on Deadlock Prevention vs Detection',
            'Test me on Relational Algebra Operations',
          ];
        case 'STUDY_PLAN':
          return [
            'High-yield 5-hour study plan for DBMS In-Sem',
            'Crash study plan for Unit 2 (Relational Database Design)',
            'End-Sem preparation plan focusing on MUST STUDY topics',
          ];
        case 'REVISE':
          return [
            'Rapid revision sheet for Normalization & Decomposition',
            'Transactions & Concurrency Control quick cheat sheet',
            'Top 3 costly mistakes to avoid in DBMS In-Sem exam',
          ];
        default:
          return [
            'Explain 3NF vs BCNF decomposition conditions',
            'Explain Conflict Serializability vs View Serializability',
            'Explain Write-Ahead Logging (WAL) protocol',
          ];
      }
    }
    return [
      `Core syllabus concepts for ${currentSubject?.name || 'this subject'}`,
      `Exam answer guidelines for ${currentSubject?.short_name || 'Subject'}`,
      `Verified PYQ patterns in ${currentSubject?.code || 'SPPU'}`,
    ];
  }, [selectedSubjectId, selectedMode, currentSubject]);

  const handleSubmit = async (
    e?: React.FormEvent,
    customQuery?: string,
    quickAction?: QuickActionType
  ) => {
    if (e) e.preventDefault();
    const queryToSend = (customQuery !== undefined ? customQuery : query).trim();

    if (!queryToSend && !quickAction) {
      setErrorMessage('Please enter a query or select a quick action.');
      return;
    }

    // If query is empty but quick action selected, build default prompt
    const finalQuery =
      queryToSend ||
      (quickAction === 'SUMMARIZE'
        ? `Summarize the key engineering concepts, formulas and definitions in ${currentSubject?.name || 'this subject'}`
        : quickAction === '2_MARK'
        ? `Provide 2-mark definitions and exam questions with verified SPPU answers`
        : quickAction === '5_MARK'
        ? `Provide a structured 5-mark answer with diagrams and key evaluator points`
        : quickAction === '10_MARK'
        ? `Provide a comprehensive 10-mark answer with architecture, working and rubrics`
        : quickAction === 'IMPORTANT_QUESTIONS'
        ? `List the top recurring and probable SPPU exam questions`
        : quickAction === 'QUIZ_ME_FROM_THIS'
        ? `Create a diagnostic practice quiz with multiple choice questions and explanations`
        : quickAction === 'REVISE_THIS'
        ? `Generate a rapid revision cheat-sheet and top exam traps to avoid`
        : `Explain the fundamental concepts simply from first principles`);

    setIsLoading(true);
    setErrorMessage(null);
    setResponse(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: finalQuery,
          subject_id: selectedSubjectId,
          task_type: selectedMode,
          marks_target: selectedMode === 'EXAM_ANSWER' ? marksTarget : undefined,
          source_mode: sourceMode,
          file_ids: selectedFileIds,
          quick_action: quickAction,
          session_id: currentSessionId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setRateLimitInfo('Rate limit reached (10 queries/min for free tier). Please wait a moment.');
        }
        throw new Error(data?.error?.message || `AI query failed with status ${res.status}`);
      }

      setResponse(data.data);
      setRateLimitInfo(null);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Unable to connect to ScoreEdge Academic AI. Please check your connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: QuickActionType, label: string) => {
    // Synchronize mode if action is mark-specific or quiz
    if (action === '2_MARK') {
      setSelectedMode('EXAM_ANSWER');
      setMarksTarget(2);
    } else if (action === '5_MARK') {
      setSelectedMode('EXAM_ANSWER');
      setMarksTarget(5);
    } else if (action === '10_MARK') {
      setSelectedMode('EXAM_ANSWER');
      setMarksTarget(10);
    } else if (action === 'QUIZ_ME_FROM_THIS') {
      setSelectedMode('QUIZ_ME');
    } else if (action === 'REVISE_THIS') {
      setSelectedMode('REVISE');
    }

    handleSubmit(undefined, query.trim() ? query : undefined, action);
  };

  const handleCopy = () => {
    if (!response?.content) return;
    navigator.clipboard.writeText(response.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Academic Context & Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-depth-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                ScoreEdge Academic AI + Study Material Workspace
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                Workspace Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Multi-source intelligence • Upload notes & slides or query verified SPPU records
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Drawer Toggle Button */}
          <button
            type="button"
            onClick={() => setShowDrawer(!showDrawer)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {showDrawer ? (
              <>
                <PanelRightClose className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Hide Sidebar</span>
              </>
            ) : (
              <>
                <PanelRightOpen className="w-4 h-4 text-teal-500" />
                <span>Files & Sessions ({uploadedFiles.length})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace Layout (2-Columns on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Academic AI Engine & Prompt Workspace (8 or 12 cols) */}
        <div className={`${showDrawer ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-5`}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-depth-1 space-y-5">
            
            {/* Subject Context Selector */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Subject Context:</span>
              <div className="flex flex-wrap gap-1.5">
                {subjects.map((sub) => {
                  const isSelected = sub.id === selectedSubjectId;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubjectId(sub.id)}
                      type="button"
                      className={`px-2.5 py-1 rounded-md transition-colors text-xs font-medium ${
                        isSelected
                          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      {sub.short_name} ({sub.code})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Knowledge Source Mode Switcher */}
            <KnowledgeSourceSelector
              sourceMode={sourceMode}
              onSourceModeChange={setSourceMode}
              uploadedFilesCount={uploadedFiles.length}
            />

            {/* Drag & Drop Upload Zone (Collapsible or visible) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FileUp className="w-3.5 h-3.5 text-teal-500" />
                  <span>Study Material Dropzone</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowDropzone(!showDropzone)}
                  className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline"
                >
                  {showDropzone ? 'Collapse Dropzone' : 'Expand Dropzone'}
                </button>
              </div>

              {showDropzone && (
                <StudyFileDropzone
                  onUploadSuccess={handleUploadSuccess}
                  selectedSubjectId={selectedSubjectId}
                />
              )}
            </div>

            {/* 7 Core Study Modes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Choose Study Mode:</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px] hidden sm:inline">
                  {activeModeConfig.description}
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
                {STUDY_MODES.map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = selectedMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => {
                        setSelectedMode(mode.id);
                        setErrorMessage(null);
                      }}
                      type="button"
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all text-xs font-medium ${
                        isSelected
                          ? 'bg-teal-50/80 dark:bg-teal-950/40 border-teal-500 text-teal-950 dark:text-teal-200 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400'}`} />
                      <span className="truncate w-full">{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Exam Answer Marks Target (2M, 5M, 10M) */}
            {selectedMode === 'EXAM_ANSWER' && (
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">SPPU Target Marks:</span>
                <div className="flex items-center gap-1.5">
                  {([2, 5, 10] as const).map((marks) => {
                    const isSelected = marksTarget === marks;
                    return (
                      <button
                        key={marks}
                        type="button"
                        onClick={() => setMarksTarget(marks)}
                        className={`px-3 py-1 rounded-md font-semibold text-xs transition-colors ${
                          isSelected
                            ? 'bg-teal-600 text-white shadow-2xs'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {marks} Marks
                      </button>
                    );
                  })}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-auto hidden md:inline">
                  {marksTarget === 2 && 'Crisp definition, 2 bullet points, real-world use (40-60 words)'}
                  {marksTarget === 5 && 'Definition, 4-5 points, schematic diagram description, evaluator tip'}
                  {marksTarget === 10 && 'Comprehensive answer, architecture diagram, algorithm phases, scoring rubric'}
                </span>
              </div>
            )}

            {/* Quick Actions Shortcuts Toolbar */}
            <QuickActionsBar
              onSelectAction={handleQuickAction}
              isLoading={isLoading}
            />

            {/* Prompt Input Form */}
            <form onSubmit={(e) => handleSubmit(e)} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={activeModeConfig.placeholder}
                  className="w-full pl-4 pr-24 py-3 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                />
                <div className="absolute right-2 top-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isLoading || !query.trim()}
                    className="gap-1.5 text-xs h-8 px-3 font-semibold bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Synthesizing...</span>
                      </span>
                    ) : (
                      <>
                        <span>Generate</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Quick Suggestions Pills */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Quick ideas:</span>
                {quickSuggestions.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuery(prompt);
                      handleSubmit(undefined, prompt);
                    }}
                    className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] transition-colors text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </form>

            {/* Rate Limit Banner */}
            {rateLimitInfo && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{rateLimitInfo}</span>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-xs">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <span className="font-semibold">Workspace Query Notice</span>
                  <p>{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Grounded Response Section */}
            {response && (
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                {/* Response Meta Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                      response.is_grounded
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}>
                      {response.is_grounded ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>
                            {response.grounded_sources_count} Verified SPPU Records
                            {response.student_sources_count ? ` + ${response.student_sources_count} Material Chunks` : ''}
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3" />
                          <span>Strict Anti-Hallucination Active</span>
                        </>
                      )}
                    </span>

                    {response.is_fallback && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium border border-slate-200 dark:border-slate-700">
                        Deterministic Grounding Engine
                      </span>
                    )}
                    
                    <span className="text-slate-400 dark:text-slate-500 text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {response.latency_ms}ms
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Answer</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Interactive Diagnostic Quiz Card if response contains MCQs */}
                {(selectedMode === 'QUIZ_ME' || response.content.includes('A)') || response.content.includes('1.')) && (
                  <InteractiveQuizCard rawContent={response.content} />
                )}

                {/* Academic Body Box */}
                <div className="p-4 sm:p-6 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-sm leading-relaxed max-w-none">
                  <div className="whitespace-pre-wrap font-sans text-[13.5px] sm:text-[14.5px] space-y-3">
                    {response.content}
                  </div>
                </div>

                {/* Verified Citations Drawer */}
                {response.citations && response.citations.length > 0 && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden text-xs">
                    <button
                      type="button"
                      onClick={() => setShowCitations(!showCitations)}
                      className="w-full flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-slate-700 dark:text-slate-300"
                    >
                      <span className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-teal-500" />
                        <span>Source Citations & Evidence ({response.citations.length})</span>
                      </span>
                      {showCitations ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showCitations && (
                      <div className="p-3 border-t border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/60">
                        {response.citations.map((cite, idx) => (
                          <div key={idx} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                  cite.type === 'STUDENT_MATERIAL'
                                    ? 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {cite.type === 'STUDENT_MATERIAL' ? 'MY MATERIAL' : cite.type}
                              </span>
                              <span className="text-slate-800 dark:text-slate-200 font-medium">
                                {cite.title}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 tabular-nums">
                              {Math.round(cite.relevance * 100)}% match
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Academic Grounding Policy */}
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Grounding Policy:</span>{' '}
                  {response.disclaimer}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Uploaded Files & Sessions Drawer (4 cols on Desktop) */}
        {showDrawer && (
          <div className="lg:col-span-4 space-y-4">
            <UploadedFilesDrawer
              files={uploadedFiles}
              selectedFileIds={selectedFileIds}
              onToggleFileSelection={handleToggleFileSelection}
              onSelectAllFiles={handleSelectAllFiles}
              onClearFileSelection={handleClearFileSelection}
              onDeleteFile={handleDeleteFile}
              sessions={sessions}
              currentSessionId={currentSessionId}
              onSelectSession={handleSelectSession}
              onNewSession={handleNewSession}
            />
          </div>
        )}
      </div>
    </div>
  );
};
