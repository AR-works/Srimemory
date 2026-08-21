'use client';

import React from 'react';
import { Submission } from '@/types';
import { formatDate } from '@/lib/utils';
import { Heart, Paperclip, User, Trash2 } from 'lucide-react';

interface MessageCardProps {
  submission: Submission;
  index: number;
  onSelect: (sub: Submission) => void;
  onDelete?: (submissionId: string) => void;
}

const ROTATIONS = [
  'hover:-rotate-1',
  'hover:rotate-1',
  'hover:-rotate-0.5',
  'hover:rotate-0.5',
  'hover:rotate-1.5',
];

export const MessageCard: React.FC<MessageCardProps> = ({
  submission,
  index,
  onSelect,
  onDelete,
}) => {
  const rotationClass = ROTATIONS[index % ROTATIONS.length];

  const authorName =
    submission.is_anonymous || !submission.display_name
      ? 'Anonymous Friend'
      : submission.display_name;

  const hasAttachments = submission.files && submission.files.length > 0;
  const isLong = submission.message.length > 220;

  return (
    <div
      onClick={() => onSelect(submission)}
      className={`group relative p-5 sm:p-6 rounded-3xl border border-purple-100/90 dark:border-purple-800/80 shadow-paper hover:shadow-soft-lg cursor-pointer transition-all duration-300 transform ${rotationClass} bg-white/95 dark:bg-purple-950/80 theme-evening:bg-[#2A1138]/90 flex flex-col justify-between`}
    >
      {/* Top pin/heart ornament */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-1.5 text-purple-400 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
          <Heart className="w-4 h-4 fill-purple-200 dark:fill-purple-800 text-purple-400" />
          <span className="text-[11px] font-medium text-purple-400 dark:text-purple-400">
            {formatDate(submission.created_at)}
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          {hasAttachments && (
            <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 text-[11px] font-medium border border-purple-100 dark:border-purple-800">
              <Paperclip className="w-3 h-3" />
              <span>{submission.files?.length}</span>
            </div>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(submission.id);
              }}
              className="p-1 text-purple-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
              title="Delete letter"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Message Excerpt */}
      <div className="flex-1 my-1">
        <p className="text-sm sm:text-base text-purple-950/90 dark:text-purple-100/90 leading-relaxed font-sans line-clamp-6">
          &ldquo;{submission.message}&rdquo;
        </p>
        {isLong && (
          <span className="inline-block mt-2 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline">
            Read full letter...
          </span>
        )}
      </div>

      {/* Author Footer */}
      <div className="mt-4 pt-3 border-t border-purple-50 dark:border-purple-900/60 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-semibold text-purple-900 dark:text-purple-200">
          <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-300">
            <User className="w-3 h-3" />
          </div>
          <span>— {authorName}</span>
        </div>
      </div>
    </div>
  );
};
