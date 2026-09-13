'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileUp,
  FileCheck2,
} from 'lucide-react';
import { UserStudyFile, FileProcessingStatus } from '@/lib/db/types';

interface StudyFileDropzoneProps {
  onUploadSuccess: (file: UserStudyFile) => void;
  selectedSubjectId?: string;
  className?: string;
}

export const StudyFileDropzone: React.FC<StudyFileDropzoneProps> = ({
  onUploadSuccess,
  selectedSubjectId,
  className = '',
}) => {
  const [dropState, setDropState] = useState<FileProcessingStatus | 'IDLE' | 'DRAGGING'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentFilename, setCurrentFilename] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const SUPPORTED_FORMATS = [
    'PDF',
    'DOC',
    'DOCX',
    'PPT',
    'PPTX',
    'TXT',
    'PNG',
    'JPG',
    'Scanned',
  ];

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

  const processFile = async (file: File) => {
    setErrorMessage(null);
    setCurrentFilename(file.name);

    // Client-side file size guard (15MB)
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMessage(`File exceeds 15MB maximum size (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
      setDropState('ERROR');
      return;
    }

    setDropState('UPLOADING');
    setUploadProgress(25);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (selectedSubjectId) {
        formData.append('subject_id', selectedSubjectId);
      }

      setUploadProgress(50);
      setDropState('PROCESSING');

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result?.error?.message || 'Failed to process file');
      }

      setUploadProgress(100);
      setDropState('READY');
      onUploadSuccess(result.data.file);

      // Reset back to idle after a brief celebration
      setTimeout(() => {
        setDropState('IDLE');
        setCurrentFilename('');
        setUploadProgress(0);
      }, 3500);
    } catch (err: unknown) {
      setDropState('ERROR');
      setErrorMessage(
        err instanceof Error ? err.message : 'Error uploading and extracting material.'
      );
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDropState('IDLE');

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
    // reset input so the same file can be uploaded again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
        className="hidden"
      />

      {/* Drag & Drop Target Frame */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (dropState === 'IDLE' || dropState === 'ERROR' || dropState === 'READY') {
            fileInputRef.current?.click();
          }
        }}
        className={`relative group rounded-2xl border-2 border-dashed p-5 sm:p-6 text-center transition-all cursor-pointer select-none ${
          dropState === 'DRAGGING'
            ? 'border-teal-400 bg-teal-950/20 shadow-md scale-[1.005]'
            : dropState === 'UPLOADING' || dropState === 'PROCESSING'
            ? 'border-indigo-400/80 bg-indigo-950/10 cursor-wait'
            : dropState === 'READY'
            ? 'border-emerald-500 bg-emerald-950/10'
            : dropState === 'ERROR'
            ? 'border-rose-400/80 bg-rose-950/10'
            : 'border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400/70 bg-slate-50/70 dark:bg-slate-900/50 hover:bg-teal-50/20 dark:hover:bg-teal-950/10'
        }`}
      >
        {/* State: READY */}
        {dropState === 'READY' && (
          <div className="flex flex-col items-center justify-center space-y-2 py-1">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-300 dark:border-emerald-800 animate-in zoom-in-90">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                &quot;{currentFilename}&quot; Successfully Indexed!
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Extracted semantic chunks are now ready for grounded querying.
              </p>
            </div>
          </div>
        )}

        {/* State: UPLOADING or PROCESSING */}
        {(dropState === 'UPLOADING' || dropState === 'PROCESSING') && (
          <div className="flex flex-col items-center justify-center space-y-3 py-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-300 dark:border-indigo-800">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div className="space-y-1 max-w-sm">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {dropState === 'UPLOADING' ? 'Uploading file...' : 'Extracting text & creating chunks...'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {currentFilename}
              </p>
              {/* Progress bar */}
              <div className="w-48 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mx-auto mt-2">
                <div
                  className="h-full bg-teal-500 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* State: DRAGGING */}
        {dropState === 'DRAGGING' && (
          <div className="flex flex-col items-center justify-center space-y-2 py-2">
            <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-300 dark:border-teal-700 animate-bounce">
              <FileUp className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-teal-700 dark:text-teal-300">
              Release to upload to your study workspace
            </p>
            <p className="text-xs text-teal-600/80 dark:text-teal-400/80">
              Files are securely indexed and isolated for academic inquiry
            </p>
          </div>
        )}

        {/* State: IDLE or ERROR */}
        {(dropState === 'IDLE' || dropState === 'ERROR') && (
          <div className="flex flex-col items-center justify-center space-y-2.5">
            <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-5 h-5" />
            </div>

            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Drag & drop study material, or{' '}
                <span className="text-teal-600 dark:text-teal-400 underline underline-offset-2">
                  browse files
                </span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Support for PDFs, Word, PPTs, Text Notes, and Scanned Question Banks (Max 15MB)
              </p>
            </div>

            {/* Supported Formats Pills */}
            <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1">
              {SUPPORTED_FORMATS.map((fmt) => (
                <span
                  key={fmt}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  {fmt}
                </span>
              ))}
            </div>

            {/* Error Message if any */}
            {dropState === 'ERROR' && errorMessage && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 pt-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
