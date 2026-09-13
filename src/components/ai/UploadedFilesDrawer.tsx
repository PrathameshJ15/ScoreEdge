'use client';

import React, { useState } from 'react';
import {
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  HardDrive,
  MessageSquare,
  Plus,
  Layers,
  ChevronRight,
  Shield,
  FileCheck2,
} from 'lucide-react';
import { UserStudyFile, AISession, KnowledgeSourceMode } from '@/lib/db/types';

interface UploadedFilesDrawerProps {
  files: UserStudyFile[];
  selectedFileIds: string[];
  onToggleFileSelection: (fileId: string) => void;
  onSelectAllFiles: () => void;
  onClearFileSelection: () => void;
  onDeleteFile: (fileId: string) => Promise<void>;
  sessions: AISession[];
  currentSessionId?: string;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  className?: string;
}

export const UploadedFilesDrawer: React.FC<UploadedFilesDrawerProps> = ({
  files,
  selectedFileIds,
  onToggleFileSelection,
  onSelectAllFiles,
  onClearFileSelection,
  onDeleteFile,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'FILES' | 'HISTORY'>('FILES');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDelete = async (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this study material?')) return;
    try {
      setDeletingId(fileId);
      await onDeleteFile(fileId);
    } finally {
      setDeletingId(null);
    }
  };

  const getFormatBadge = (filename: string) => {
    const ext = filename.split('.').pop()?.toUpperCase() || 'FILE';
    let color = 'bg-slate-800 text-slate-300';
    if (ext === 'PDF') color = 'bg-rose-950/40 text-rose-300 border-rose-800/40';
    else if (ext === 'DOC' || ext === 'DOCX') color = 'bg-blue-950/40 text-blue-300 border-blue-800/40';
    else if (ext === 'PPT' || ext === 'PPTX') color = 'bg-amber-950/40 text-amber-300 border-amber-800/40';
    else if (ext === 'TXT') color = 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40';
    return (
      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${color}`}>
        {ext}
      </span>
    );
  };

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col ${className}`}
    >
      {/* Tab Switcher Header */}
      <div className="flex items-center border-b border-slate-100 dark:border-slate-800 p-2 gap-1 bg-slate-50/50 dark:bg-slate-900/50">
        <button
          type="button"
          onClick={() => setActiveTab('FILES')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'FILES'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>Materials ({files.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('HISTORY')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'HISTORY'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Sessions ({sessions.length})</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="p-3.5 flex-1 overflow-y-auto max-h-[480px] space-y-3">
        {activeTab === 'FILES' ? (
          <div className="space-y-3">
            {/* Quota & Select All Bar */}
            <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                Quota: <strong className="text-slate-800 dark:text-slate-200">{files.length}</strong> / 5 Free
              </span>

              {files.length > 0 && (
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={onSelectAllFiles}
                    className="text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <button
                    type="button"
                    onClick={onClearFileSelection}
                    className="text-slate-500 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* File List */}
            {files.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No Study Files Uploaded
                </p>
                <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                  Drag & drop your syllabus units, PDFs, or slides into the workspace.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {files.map((f) => {
                  const isSelected = selectedFileIds.includes(f.id);
                  const isDeleting = deletingId === f.id;

                  return (
                    <div
                      key={f.id}
                      onClick={() => onToggleFileSelection(f.id)}
                      className={`group p-2.5 rounded-xl border transition-all cursor-pointer text-xs flex items-start gap-2.5 ${
                        isSelected
                          ? 'border-teal-500/80 bg-teal-50/20 dark:bg-teal-950/20 shadow-2xs'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300'
                      }`}
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleFileSelection(f.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 w-3.5 h-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />

                      {/* File Meta */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5">
                          {getFormatBadge(f.filename)}
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                            {f.filename}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>{formatBytes(f.file_size_bytes)}</span>
                          <span>•</span>
                          <span>{f.chunks_count} chunks</span>
                          {f.ocr_applied && (
                            <>
                              <span>•</span>
                              <span className="text-teal-500 font-semibold">OCR</span>
                            </>
                          )}
                        </div>

                        {/* Status */}
                        {f.status === 'PROCESSING' && (
                          <div className="flex items-center gap-1 text-[10px] text-amber-500">
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                            <span>Indexing chunks...</span>
                          </div>
                        )}
                        {f.status === 'ERROR' && (
                          <div className="flex items-center gap-1 text-[10px] text-rose-500">
                            <AlertCircle className="w-2.5 h-2.5" />
                            <span>Extraction issue</span>
                          </div>
                        )}
                      </div>

                      {/* Delete Action */}
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={(e) => handleDelete(e, f.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all shrink-0"
                        title="Delete material"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* HISTORY TAB */
          <div className="space-y-2">
            <button
              type="button"
              onClick={onNewSession}
              className="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl border border-dashed border-teal-500/50 bg-teal-50/30 dark:bg-teal-950/20 text-teal-700 dark:text-teal-300 text-xs font-semibold hover:bg-teal-50/50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Start New Session</span>
            </button>

            {sessions.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No Past Sessions Yet
                </p>
                <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                  Queries and answers will be organized into historical study threads.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {sessions.map((sess) => {
                  const isCurrent = sess.id === currentSessionId;
                  return (
                    <button
                      key={sess.id}
                      type="button"
                      onClick={() => onSelectSession(sess.id)}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'border-teal-500 bg-teal-50/30 dark:bg-teal-950/40 text-teal-900 dark:text-teal-100 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="truncate">{sess.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <span className="uppercase font-semibold text-[9px] px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800">
                            {sess.source_mode}
                          </span>
                          <span>
                            {new Date(sess.created_at).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Workspace Footer Hint */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[10px] text-slate-500 flex items-center gap-1.5">
        <Shield className="w-3 h-3 text-teal-500 shrink-0" />
        <span>Uploaded notes are protected with isolated anti-injection wrappers.</span>
      </div>
    </div>
  );
};
