'use client';

import React from 'react';
import { FileMetadata, Submission } from '@/types';
import { formatBytes, formatDate } from '@/lib/utils';
import {
  FileText,
  Video,
  File as GenericFile,
  ExternalLink,
  Download,
  Play,
  User,
} from 'lucide-react';

interface FileCardProps {
  file: FileMetadata;
  submission?: Submission;
  onPlayVideo?: (file: FileMetadata, sub?: Submission) => void;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  submission,
  onPlayVideo,
}) => {
  const isPdf = file.mime_type === 'application/pdf' || file.original_filename.toLowerCase().endsWith('.pdf');
  const isVideo = file.mime_type.startsWith('video/') || /\.(mp4|mov|webm)$/i.test(file.original_filename);

  const fileUrl = file.download_url || file.preview_url || `/api/files/${file.storage_file_id}`;
  const authorName =
    submission?.is_anonymous || !submission?.display_name
      ? 'Anonymous Friend'
      : submission.display_name;

  return (
    <div className="group relative bg-white/95 dark:bg-purple-950/80 p-5 rounded-3xl border border-purple-100/90 dark:border-purple-800/80 shadow-soft-sm hover:shadow-soft-md transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Header Icon & Type */}
        <div className="flex items-start justify-between mb-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isPdf
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-500'
                : isVideo
                ? 'bg-pink-50 dark:bg-pink-950/60 text-pink-500'
                : 'bg-purple-50 dark:bg-purple-900/60 text-purple-500'
            }`}
          >
            {isPdf ? (
              <FileText className="w-6 h-6" />
            ) : isVideo ? (
              <Video className="w-6 h-6" />
            ) : (
              <GenericFile className="w-6 h-6" />
            )}
          </div>

          <span
            className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full ${
              isPdf
                ? 'bg-rose-100/70 dark:bg-rose-900/70 text-rose-700 dark:text-rose-200'
                : isVideo
                ? 'bg-pink-100/70 dark:bg-pink-900/70 text-pink-700 dark:text-pink-200'
                : 'bg-purple-100/70 dark:bg-purple-900/70 text-purple-700 dark:text-purple-200'
            }`}
          >
            {isPdf ? 'PDF Document' : isVideo ? 'Video' : 'File'}
          </span>
        </div>

        {/* File Name & Meta */}
        <h4
          className="text-sm font-semibold text-purple-950 dark:text-purple-100 truncate mb-1"
          title={file.original_filename}
        >
          {file.original_filename}
        </h4>

        <div className="flex items-center space-x-2 text-xs text-purple-500/80 dark:text-purple-400/80 mb-4">
          <span>{formatBytes(file.file_size)}</span>
          <span>•</span>
          <span>{formatDate(file.created_at)}</span>
        </div>
      </div>

      {/* Footer Actions & Contributor */}
      <div className="pt-3 border-t border-purple-50 dark:border-purple-900/60">
        <div className="flex items-center justify-between mb-3 text-xs text-purple-700/80 dark:text-purple-300/80 font-medium">
          <div className="flex items-center space-x-1.5 truncate">
            <User className="w-3.5 h-3.5 text-purple-400" />
            <span className="truncate">{authorName}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isVideo ? (
            <button
              type="button"
              onClick={() => onPlayVideo && onPlayVideo(file, submission)}
              className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-soft-sm transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Play Video</span>
            </button>
          ) : isPdf ? (
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-soft-sm transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open PDF</span>
            </a>
          ) : (
            <a
              href={fileUrl}
              download={file.original_filename}
              className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-soft-sm transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
          )}

          <a
            href={fileUrl}
            download={file.original_filename}
            className="p-2 text-purple-600 dark:text-purple-300 hover:text-purple-800 bg-purple-50 dark:bg-purple-900/60 hover:bg-purple-100 rounded-xl transition-colors cursor-pointer"
            title="Download file"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
