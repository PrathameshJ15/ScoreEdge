'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  Send,
  UploadCloud,
  FileText,
  FileUp,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Trash2,
  Plus,
  Layers,
  MessageSquare,
  ShieldCheck,
  Zap,
  HelpCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { UserStudyFile, AISession, AIMessage, KnowledgeSourceMode } from '@/lib/db/types';
import { InteractiveQuizCard } from '@/components/ai/InteractiveQuizCard';

interface CitationItem {
  type: string;
  id: string;
  title: string;
  relevance?: number;
  snippet?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: CitationItem[];
  created_at: string;
  source_mode?: KnowledgeSourceMode;
}

function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSessionId = searchParams.get('session');
  const initialFileId = searchParams.get('file');
  const initialAction = searchParams.get('action');

  const [sessionId, setSessionId] = useState<string>(initialSessionId || '');
  const [sessionTitle, setSessionTitle] = useState<string>('AI Study Session');
  const [activeFile, setActiveFile] = useState<UserStudyFile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sessions, setSessions] = useState<AISession[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UserStudyFile[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [searchHistory, setSearchHistory] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openCitationId, setOpenCitationId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load user sessions and study files
  const loadSessionsAndFiles = async () => {
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

        if (initialFileId) {
          const matched = fList.find((f: UserStudyFile) => f.id === initialFileId);
          if (matched) setActiveFile(matched);
        }
      }
    } catch {
      // Offline fallback
    }
  };

  useEffect(() => {
    loadSessionsAndFiles();
  }, [initialFileId]);

  // Load specific session messages
  const loadSession = async (id: string) => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/ai/sessions/${id}`);
      if (res.ok) {
        const data = await res.json();
        const sess = data.data.session;
        const msgs = data.data.messages || [];
        setSessionId(sess.id);
        setSessionTitle(sess.title || 'AI Study Session');

        if (sess.file_id) {
          const matchedFile = uploadedFiles.find((f) => f.id === sess.file_id);
          if (matchedFile) setActiveFile(matchedFile);
        } else if (sess.file_name) {
          const matchedFile = uploadedFiles.find((f) => f.filename === sess.file_name);
          if (matchedFile) setActiveFile(matchedFile);
        }

        setMessages(msgs);
      } else {
        // Fallback: Check localStorage
        const cached = localStorage.getItem(`scoreedge_chat_${id}`);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setMessages(parsed.messages || []);
            setSessionTitle(parsed.title || 'AI Study Session');
          } catch {}
        }
      }
    } catch {
      const cached = localStorage.getItem(`scoreedge_chat_${id}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setMessages(parsed.messages || []);
          setSessionTitle(parsed.title || 'AI Study Session');
        } catch {}
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialSessionId) {
      loadSession(initialSessionId);
    } else {
      // Create new session if none provided
      handleCreateNewChat();
    }
  }, [initialSessionId]);

  // Handle initial action if passed via URL params (e.g. from file upload page)
  const initialActionRanRef = useRef(false);
  useEffect(() => {
    if (!initialAction || initialActionRanRef.current || !sessionId) return;
    initialActionRanRef.current = true;

    let promptText = '';
    let quickAction: string | undefined;
    if (initialAction === 'review') {
      promptText = `Please provide a structured Quick Review of ${activeFile?.filename || 'this uploaded document'}, outlining key formulas, syllabus units, and core definitions.`;
      quickAction = 'SUMMARIZE';
    } else if (initialAction === 'questions') {
      promptText = `Generate the top recurring and high-yield SPPU exam questions based on ${activeFile?.filename || 'this study material'}, categorizing into 2-Mark, 5-Mark, and 10-Mark questions.`;
      quickAction = 'IMPORTANT_QUESTIONS';
    } else if (initialAction === 'model_answer') {
      promptText = `Write a verified 5-mark model answer for the primary concept in ${activeFile?.filename || 'this document'}, with step-marking breakdown and key evaluator points.`;
      quickAction = '5_MARK';
    } else if (initialAction === 'quiz') {
      promptText = `Create a diagnostic practice quiz with 3 multiple-choice questions from ${activeFile?.filename || 'this document'} with detailed SPPU examiner explanations.`;
      quickAction = 'QUIZ_ME_FROM_THIS';
    }

    if (promptText) {
      sendMessage(promptText, quickAction);
    }
  }, [initialAction, sessionId, activeFile]);

  // Create a brand new session
  const handleCreateNewChat = async (fileToAssociate?: UserStudyFile) => {
    const targetFile = fileToAssociate || activeFile;
    const newId = `sess-${Date.now()}`;
    const newTitle = targetFile ? `Study: ${targetFile.filename}` : 'New AI Study Session';

    const newSess: AISession = {
      id: newId,
      user_id: 'usr-student-1',
      subject_id: 'sub-dbms',
      file_id: targetFile?.id,
      file_name: targetFile?.filename,
      title: newTitle,
      source_mode: targetFile ? 'BOTH' : 'SCOREDGE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setSessionId(newId);
    setSessionTitle(newTitle);
    if (targetFile) setActiveFile(targetFile);
    setMessages([]);
    setSessions((prev) => [newSess, ...prev]);

    // Persist session to backend
    try {
      await fetch('/api/ai/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newId,
          title: newTitle,
          file_id: targetFile?.id,
          file_name: targetFile?.filename,
          source_mode: targetFile ? 'BOTH' : 'SCOREDGE',
        }),
      });
    } catch {}

    // Update URL quietly
    router.replace(`/dashboard/ai/chat?session=${newId}${targetFile ? `&file=${targetFile.id}` : ''}`);
  };

  // Send message to AI
  const sendMessage = async (customPrompt?: string, quickActionParam?: string) => {
    const textToSend = (customPrompt !== undefined ? customPrompt : inputQuery).trim();
    if (!textToSend || isLoading) return;

    setInputQuery('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const currentSessId = sessionId || `sess-${Date.now()}`;
    if (!sessionId) {
      setSessionId(currentSessId);
    }

    // Append User Message to UI
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      role: 'user',
      content: textToSend,
      created_at: new Date().toISOString(),
      source_mode: activeFile ? 'BOTH' : 'SCOREDGE',
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      const payload: Record<string, any> = {
        query: textToSend,
        session_id: currentSessId,
        source_mode: activeFile ? 'BOTH' : 'SCOREDGE',
      };

      if (activeFile) {
        payload.file_ids = [activeFile.id];
      }

      if (quickActionParam) {
        payload.quick_action = quickActionParam;
      }

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'Failed to generate answer');
      }

      const aiResult = data.data;
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-a`,
        role: 'assistant',
        content: aiResult.content,
        citations: aiResult.citations || [],
        created_at: new Date().toISOString(),
        source_mode: activeFile ? 'BOTH' : 'SCOREDGE',
      };

      const updated = [...nextMessages, assistantMsg];
      setMessages(updated);

      // Save to localStorage
      localStorage.setItem(
        `scoreedge_chat_${currentSessId}`,
        JSON.stringify({
          id: currentSessId,
          title: sessionTitle,
          file_name: activeFile?.filename,
          messages: updated,
          updated_at: new Date().toISOString(),
        })
      );

      // Update session title if default
      if (messages.length === 0 && sessionTitle.startsWith('New AI Study Session')) {
        const generatedTitle = textToSend.slice(0, 45) + (textToSend.length > 45 ? '...' : '');
        setSessionTitle(generatedTitle);
        fetch(`/api/ai/sessions/${currentSessId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: generatedTitle }),
        }).catch(() => {});
      }

      // Refresh sessions list
      loadSessionsAndFiles();
    } catch (err: unknown) {
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Unable to retrieve response:** ${err instanceof Error ? err.message : 'Connection error. Please try again.'}`,
        created_at: new Date().toISOString(),
      };
      setMessages([...nextMessages, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a session
  const handleDeleteSession = async (e: React.MouseEvent, idToDelete: string) => {
    e.stopPropagation();
    try {
      await fetch(`/api/ai/sessions/${idToDelete}`, { method: 'DELETE' });
      localStorage.removeItem(`scoreedge_chat_${idToDelete}`);
      setSessions((prev) => prev.filter((s) => s.id !== idToDelete));

      if (idToDelete === sessionId) {
        handleCreateNewChat();
      }
    } catch {}
  };

  // Upload file inside chat
  const handleFileUploadInChat = async (file: File) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result?.error?.message || 'File upload failed');
      }

      const newUploaded = result.data.file as UserStudyFile;
      setUploadedFiles((prev) => [newUploaded, ...prev]);
      setActiveFile(newUploaded);

      // Start new chat with this file
      handleCreateNewChat(newUploaded);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error uploading file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSessions = useMemo(() => {
    if (!searchHistory.trim()) return sessions;
    return sessions.filter((s) =>
      s.title.toLowerCase().includes(searchHistory.toLowerCase()) ||
      (s.file_name && s.file_name.toLowerCase().includes(searchHistory.toLowerCase()))
    );
  }, [sessions, searchHistory]);

  return (
    <div className="flex h-screen w-full bg-[#fcfcfd] dark:bg-[#070d18] text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUploadInChat(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {/* Left Sidebar (GPT Session History & Files) */}
      <aside
        className={`${
          sidebarOpen ? 'w-72 sm:w-80' : 'w-0'
        } shrink-0 border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0a1120] flex flex-col transition-all duration-300 ease-in-out relative z-30 overflow-hidden`}
      >
        {/* Top brand & Back Button */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2">
          <Link
            href="/dashboard/ai"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tutor Hub</span>
          </Link>

          <Button
            size="sm"
            onClick={() => handleCreateNewChat()}
            className="h-8 px-2.5 text-xs gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </Button>
        </div>

        {/* Upload file pill button */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-teal-300 dark:border-teal-700/80 bg-teal-50/40 dark:bg-teal-950/20 text-xs font-semibold text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors"
          >
            <UploadCloud className="w-4 h-4 text-teal-500" />
            <span>Drop/Upload Another PDF</span>
          </button>
        </div>

        {/* Search Session Bar */}
        <div className="px-3 pt-3 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search chat history..."
              value={searchHistory}
              onChange={(e) => setSearchHistory(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/70 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-slate-700 focus:outline-none placeholder-slate-400 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1 divide-y divide-slate-100 dark:divide-slate-800/40">
          <div className="px-2 pt-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">
            Chat History
          </div>

          {filteredSessions.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              No previous chats found.
            </div>
          ) : (
            filteredSessions.map((sess) => {
              const isActive = sess.id === sessionId;
              return (
                <div
                  key={sess.id}
                  onClick={() => {
                    setSessionId(sess.id);
                    loadSession(sess.id);
                    router.replace(`/dashboard/ai/chat?session=${sess.id}`);
                  }}
                  className={`group flex items-start justify-between gap-2 p-2.5 rounded-xl cursor-pointer text-xs transition-all ${
                    isActive
                      ? 'bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 text-teal-950 dark:text-teal-200 font-semibold shadow-2xs'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    <MessageSquare
                      className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                        isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'
                      }`}
                    />
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="truncate font-medium leading-snug">{sess.title}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                        {sess.file_name ? (
                          <span className="truncate max-w-[130px] font-mono text-teal-600 dark:text-teal-400">
                            📄 {sess.file_name}
                          </span>
                        ) : (
                          <span>Grounded SPPU</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    title="Delete Chat"
                    onClick={(e) => handleDeleteSession(e, sess.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Active Model Indicator */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-mono">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Groq LPU™ Ultra-Fast</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-800">
            Online
          </span>
        </div>
      </aside>

      {/* Main GPT Interaction Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-[#070d18] relative">
        {/* Top Navigation Bar */}
        <header className="h-14 border-b border-slate-200/80 dark:border-slate-800/80 px-4 flex items-center justify-between gap-3 bg-white/95 dark:bg-[#0a1120]/95 backdrop-blur-md shrink-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={sidebarOpen ? 'Collapse history' : 'Expand history'}
            >
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </button>

            <div className="min-w-0">
              <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {sessionTitle}
              </h1>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                {activeFile ? (
                  <span className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 font-mono font-medium truncate">
                    <FileText className="w-3 h-3" />
                    <span>{activeFile.filename}</span>
                    <span className="text-[10px] bg-teal-50 dark:bg-teal-950/60 px-1 rounded border border-teal-200 dark:border-teal-800">
                      {activeFile.page_count ? `${activeFile.page_count} pages • ` : ''}{activeFile.chunks_count || 4} chunks
                    </span>
                  </span>
                ) : (
                  <span>General SPPU Syllabus Grounding</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3 h-3" />
              Strict Anti-Hallucination
            </span>

            <Link
              href="/dashboard/ai"
              className="px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Exit to Hub
            </Link>
          </div>
        </header>

        {/* Document Quick Action Strip */}
        {activeFile && (
          <div className="px-4 py-1.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0 z-10">
            <span className="text-slate-500 dark:text-slate-400 font-medium shrink-0 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>PDF Actions:</span>
            </span>
            <button
              type="button"
              onClick={() =>
                sendMessage(
                  `Provide a structured Quick Review of ${activeFile.filename}, outlining core definitions, formulas, and high-yield topics.`,
                  'SUMMARIZE'
                )
              }
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 border border-slate-200 dark:border-slate-700 shadow-2xs transition-all shrink-0 font-medium"
            >
              <BookOpen className="w-3 h-3 text-teal-500" />
              <span>Quick Review</span>
            </button>
            <button
              type="button"
              onClick={() =>
                sendMessage(
                  `Generate the top recurring and high-yield SPPU exam questions based on ${activeFile.filename}, categorizing into 2-Mark, 5-Mark, and 10-Mark questions.`,
                  'IMPORTANT_QUESTIONS'
                )
              }
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 shadow-2xs transition-all shrink-0 font-medium"
            >
              <HelpCircle className="w-3 h-3 text-indigo-500" />
              <span>Important Questions</span>
            </button>
            <button
              type="button"
              onClick={() =>
                sendMessage(
                  `Write a verified 5-mark model answer for the primary concept in ${activeFile.filename}, with step-marking breakdown and key evaluator points.`,
                  '5_MARK'
                )
              }
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/60 text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-700 shadow-2xs transition-all shrink-0 font-medium"
            >
              <FileText className="w-3 h-3 text-amber-500" />
              <span>Model Answers</span>
            </button>
            <button
              type="button"
              onClick={() =>
                sendMessage(
                  `Create a diagnostic practice quiz with 3 multiple-choice questions from ${activeFile.filename} with detailed SPPU examiner explanations.`,
                  'QUIZ_ME_FROM_THIS'
                )
              }
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 shadow-2xs transition-all shrink-0 font-medium"
            >
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span>Practice Quiz</span>
            </button>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
          {messages.length === 0 ? (
            /* Welcome / Initial Prompt Starters State */
            <div className="max-w-2xl mx-auto py-8 sm:py-12 space-y-8 text-center animate-in fade-in-50 duration-300">
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center mx-auto text-teal-600 dark:text-teal-400 shadow-depth-1">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {activeFile ? `Analyzing "${activeFile.filename}"` : 'ScoreEdge AI Study Tutor'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto font-serif">
                  {activeFile
                    ? 'Your material is indexed with semantic chunks. Ask any doubt, generate exam model answers, or use a quick starter below.'
                    : 'Grounded strictly in SPPU syllabus rules. Ask questions, request 2/5/10-mark model answers, or drop your study notes.'}
                </p>
              </div>

              {/* Starter Quick Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <button
                  type="button"
                  onClick={() =>
                    sendMessage(
                      `Provide a complete Quick Review of ${activeFile?.filename || 'the syllabus'}, summarizing main concepts, formulas, and high-yield topics.`,
                      'SUMMARIZE'
                    )
                  }
                  className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-teal-500 dark:hover:border-teal-400 hover:shadow-depth-1 transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                      <BookOpen className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Quick Review & Summary
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Get an instant breakdown of core formulas, definitions, and key exam concepts.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    sendMessage(
                      `List the most probable and recurring SPPU exam questions from ${activeFile?.filename || 'this subject'}, categorized into 2-Mark, 5-Mark, and 10-Mark questions.`,
                      'IMPORTANT_QUESTIONS'
                    )
                  }
                  className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-teal-500 dark:hover:border-teal-400 hover:shadow-depth-1 transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                      <HelpCircle className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Top Important Questions
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Discover recurring past questions and high-probability In-Sem/End-Sem topics.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    sendMessage(
                      `Write an examiner-standard 5-Mark model answer with step markings and diagram explanations from ${activeFile?.filename || 'the syllabus'}.`,
                      '5_MARK'
                    )
                  }
                  className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-teal-500 dark:hover:border-teal-400 hover:shadow-depth-1 transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                      <FileText className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      5-Mark Model Answer
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Get examiner-calibrated structure with step-by-step scoring breakdown.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    sendMessage(
                      `Create a diagnostic 3-question quiz with multiple choice options and detailed explanations from ${activeFile?.filename || 'this study material'}.`,
                      'QUIZ_ME_FROM_THIS'
                    )
                  }
                  className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-teal-500 dark:hover:border-teal-400 hover:shadow-depth-1 transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Interactive Quiz Drill
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Test your conceptual retention with diagnostic MCQs and explanations.
                  </p>
                </button>
              </div>
            </div>
          ) : (
            /* Conversation Bubble Stream */
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-2xs font-bold text-xs">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    )}

                    <div className={`space-y-2 max-w-[85%] sm:max-w-[80%]`}>
                      <div
                        className={`rounded-2xl p-4 sm:p-5 text-sm leading-relaxed ${
                          isUser
                            ? 'bg-teal-600 text-white rounded-br-xs shadow-depth-1'
                            : 'bg-white dark:bg-[#0a1120] border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs shadow-depth-1'
                        }`}
                      >
                        {/* Text Content */}
                        <div className="whitespace-pre-wrap font-sans text-[13.5px] sm:text-[14.5px] space-y-2.5">
                          {msg.content}
                        </div>

                        {/* Interactive Quiz Card if MCQ in assistant message */}
                        {!isUser && (msg.content.includes('A)') || msg.content.includes('1.')) && (
                          <div className="pt-2">
                            <InteractiveQuizCard rawContent={msg.content} />
                          </div>
                        )}
                      </div>

                      {/* Assistant Meta / Citations / Copy Bar */}
                      {!isUser && (
                        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleCopy(msg.id, msg.content)}
                              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  <span className="text-[11px] text-emerald-600">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span className="text-[11px]">Copy Answer</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Citations Accordion */}
                          {msg.citations && msg.citations.length > 0 && (
                            <div>
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenCitationId(openCitationId === msg.id ? null : msg.id)
                                }
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-600 dark:text-teal-400 hover:underline"
                              >
                                <Layers className="w-3 h-3" />
                                <span>{msg.citations.length} Verified Sources</span>
                                {openCitationId === msg.id ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Citations Dropdown Content */}
                      {!isUser && openCitationId === msg.id && msg.citations && msg.citations.length > 0 && (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 p-3 space-y-2 text-xs animate-in fade-in-50">
                          <div className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider font-mono">
                            Grounded Evidence:
                          </div>
                          <div className="space-y-1.5 divide-y divide-slate-200 dark:divide-slate-800">
                            {msg.citations.map((c, idx) => (
                              <div key={idx} className="pt-1.5 first:pt-0">
                                <div className="flex items-center justify-between font-medium text-slate-800 dark:text-slate-200">
                                  <span>{c.title}</span>
                                  {c.relevance && (
                                    <span className="text-[10px] text-teal-600 dark:text-teal-400">
                                      {Math.round(c.relevance * 100)}% match
                                    </span>
                                  )}
                                </div>
                                {c.snippet && (
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                    &quot;{c.snippet}&quot;
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Loading Thinking Indicator */}
              {isLoading && (
                <div className="flex items-start gap-3 justify-start animate-in fade-in-50">
                  <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-2xs font-bold text-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="rounded-2xl p-4 bg-white dark:bg-[#0a1120] border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-depth-1 flex items-center gap-2 text-xs">
                    <span className="w-3.5 h-3.5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-slate-600 dark:text-slate-300">
                      Synthesizing syllabus-grounded answer via Groq LPU...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Bottom Input Area (ChatGPT style) */}
        <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0a1120]/80 backdrop-blur-md shrink-0">
          <div className="max-w-3xl mx-auto space-y-2.5">
            {/* Quick Prompt Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              <button
                type="button"
                onClick={() =>
                  sendMessage(
                    `Give me a high-yield Quick Review of ${activeFile?.filename || 'this topic'} with exam tips.`
                  )
                }
                className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300 border border-slate-200/80 dark:border-slate-700 text-[11px] font-medium shrink-0 transition-colors"
              >
                🔍 Quick Review
              </button>

              <button
                type="button"
                onClick={() =>
                  sendMessage(
                    `What are the top 3 high-probability SPPU exam questions from ${activeFile?.filename || 'this material'}?`
                  )
                }
                className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300 border border-slate-200/80 dark:border-slate-700 text-[11px] font-medium shrink-0 transition-colors"
              >
                🎯 Important Questions
              </button>

              <button
                type="button"
                onClick={() =>
                  sendMessage(
                    `Write a structured 5-mark answer for the key concept in ${activeFile?.filename || 'this chapter'}.`
                  )
                }
                className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300 border border-slate-200/80 dark:border-slate-700 text-[11px] font-medium shrink-0 transition-colors"
              >
                ✍️ 5-Mark Answer
              </button>

              <button
                type="button"
                onClick={() =>
                  sendMessage(
                    `Quiz me with 2 diagnostic questions on ${activeFile?.filename || 'this topic'}.`
                  )
                }
                className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300 border border-slate-200/80 dark:border-slate-700 text-[11px] font-medium shrink-0 transition-colors"
              >
                🧪 Quiz Me
              </button>
            </div>

            {/* Input Form Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="relative flex items-end gap-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-depth-1 p-2 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all"
            >
              {/* Attach File Button */}
              <button
                type="button"
                title="Attach PDF or document"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              >
                <FileUp className="w-5 h-5" />
              </button>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputQuery}
                onChange={(e) => {
                  setInputQuery(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={
                  activeFile
                    ? `Ask any doubt about "${activeFile.filename}" or press Enter...`
                    : 'Ask any syllabus question or drop a PDF...'
                }
                className="w-full max-h-36 py-2 px-1 text-sm bg-transparent border-0 focus:outline-none resize-none placeholder-slate-400 text-slate-900 dark:text-slate-100"
              />

              {/* Send Button */}
              <Button
                type="submit"
                size="sm"
                disabled={isLoading || !inputQuery.trim()}
                className="h-9 w-9 p-0 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shrink-0 disabled:opacity-40"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>

            <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 font-sans">
              ScoreEdge AI verifies questions against official SPPU syllabus blueprints. Always cross-verify critical dates.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AIChatPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center bg-[#faf9f5] dark:bg-[#070d18]">
          <div className="flex items-center gap-2 text-sm text-teal-600 dark:text-teal-400 font-medium">
            <span className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <span>Loading AI Study Tutor...</span>
          </div>
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}
