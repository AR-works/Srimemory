'use client';

import React from 'react';
import { Submission, FileMetadata } from '@/types';
import { formatDate } from '@/lib/utils';
import { Heart, User, FileText, Video, Download } from 'lucide-react';

interface StoryCardProps {
  submission: Submission;
  onSelectPhoto: (file: FileMetadata, submission: Submission) => void;
  onSelectMessage: (submission: Submission) => void;
  onPlayVideo: (file: FileMetadata, submission: Submission) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  submission,
  onSelectPhoto,
  onSelectMessage,
  onPlayVideo,
}) => {
  const authorName =
    submission.is_anonymous || !submission.display_name
      ? 'Anonymous Friend'
      : submission.display_name;

  const photos = (submission.files || []).filter(
    (f) =>
      f.mime_type.startsWith('image/') ||
      /\.(jpg|jpeg|png|webp|gif|heic)$/i.test(f.original_filename)
  );

  const otherFiles = (submission.files || []).filter(
    (f) =>
      !f.mime_type.startsWith('image/') &&
      !/\.(jpg|jpeg|png|webp|gif|heic)$/i.test(f.original_filename)
  );

  return (
    <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-purple-100/90 dark:border-purple-850 shadow-soft-md space-y-5">
      {/* Contributor Header */}
      <div className="flex items-center justify-between border-b border-purple-100/80 dark:border-purple-800/60 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-300 font-bold text-sm">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-purple-950 dark:text-purple-50">{authorName}</h3>
            <p className="text-xs text-purple-500 dark:text-purple-400">{formatDate(submission.created_at)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-xs text-purple-400">
          <Heart className="w-4 h-4 fill-purple-200 dark:fill-purple-900 text-purple-400" />
        </div>
      </div>

      {/* Message Body */}
      <div
        onClick={() => onSelectMessage(submission)}
        className="p-4 sm:p-5 bg-white/90 dark:bg-purple-950/60 rounded-2xl border border-purple-50 dark:border-purple-800 shadow-inner cursor-pointer hover:border-purple-200 dark:hover:border-purple-700 transition-colors"
      >
        <p className="text-sm sm:text-base text-purple-950/90 dark:text-purple-100/90 leading-relaxed font-sans whitespace-pre-wrap line-clamp-4">
          &ldquo;{submission.message}&rdquo;
        </p>
        {submission.message.length > 250 && (
          <span className="inline-block mt-2 text-xs font-semibold text-purple-600 dark:text-purple-400">
            Read full letter...
          </span>
        )}
      </div>

      {/* Attached Photos Grid */}
      {photos.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-purple-900 dark:text-purple-200">
            Attached Photos ({photos.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {photos.map((photo) => {
              const url =
                photo.preview_url ||
                photo.download_url ||
                `/api/files/${photo.storage_file_id}`;
              return (
                <div
                  key={photo.id}
                  onClick={() => onSelectPhoto(photo, submission)}
                  className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer bg-purple-50 dark:bg-purple-900/60 border border-purple-100 dark:border-purple-800 shadow-soft-sm hover:shadow-soft-md transition-all"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={photo.original_filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-purple-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-[10px] text-white font-medium truncate">
                      {photo.original_filename}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Attached PDFs & Media */}
      {otherFiles.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-purple-50 dark:border-purple-900/60">
          <p className="text-xs font-semibold text-purple-900 dark:text-purple-200">
            Attached Documents & Media ({otherFiles.length})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {otherFiles.map((file) => {
              const isPdf =
                file.mime_type === 'application/pdf' ||
                file.original_filename.toLowerCase().endsWith('.pdf');
              const isVid =
                file.mime_type.startsWith('video/') ||
                /\.(mp4|mov|webm)$/i.test(file.original_filename);
              const fileUrl =
                file.download_url ||
                file.preview_url ||
                `/api/files/${file.storage_file_id}`;

              return (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-purple-950/80 rounded-2xl border border-purple-100 dark:border-purple-800 shadow-soft-sm"
                >
                  <div className="flex items-center space-x-2.5 min-w-0 mr-2">
                    {isPdf ? (
                      <FileText className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    ) : isVid ? (
                      <Video className="w-5 h-5 text-pink-500 flex-shrink-0" />
                    ) : (
                      <FileText className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    )}
                    <span className="text-xs font-medium text-purple-950 dark:text-purple-100 truncate">
                      {file.original_filename}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 flex-shrink-0">
                    {isVid ? (
                      <button
                        type="button"
                        onClick={() => onPlayVideo(file, submission)}
                        className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 hover:bg-purple-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Play
                      </button>
                    ) : (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 hover:bg-purple-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Open
                      </a>
                    )}
                    <a
                      href={fileUrl}
                      download={file.original_filename}
                      className="p-1 text-purple-400 hover:text-purple-700 dark:hover:text-purple-200 cursor-pointer"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
