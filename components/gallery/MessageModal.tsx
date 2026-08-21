'use client';

import React, { useEffect } from 'react';
import { Submission } from '@/types';
import { formatDate } from '@/lib/utils';
import { X, Heart, Sparkles, User } from 'lucide-react';

interface MessageModalProps {
  submission: Submission | null;
  onClose: () => void;
}

export const MessageModal: React.FC<MessageModalProps> = ({ submission, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (submission) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [submission, onClose]);

  if (!submission) return null;

  const authorName = submission.is_anonymous || !submission.display_name
    ? 'Anonymous Friend'
    : submission.display_name;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-purple-950 rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-100 dark:border-purple-800 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-purple-400 hover:text-purple-700 dark:hover:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900 rounded-full transition-colors cursor-pointer"
          title="Close note"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-300">
            <Heart className="w-5 h-5 fill-purple-400 text-purple-600 dark:text-purple-300" />
          </div>
          <div>
            <h3 className="text-base font-bold text-purple-950 dark:text-purple-50">A Letter for Sri</h3>
            <p className="text-xs text-purple-500 dark:text-purple-400">{formatDate(submission.created_at)}</p>
          </div>
        </div>

        {/* Message Content */}
        <div className="my-4 p-5 bg-[#FFFDF9] dark:bg-purple-900/40 rounded-2xl border border-purple-100 dark:border-purple-800/80 shadow-inner">
          <p className="text-base sm:text-lg text-purple-950 dark:text-purple-100 leading-relaxed whitespace-pre-wrap font-sans">
            &ldquo;{submission.message}&rdquo;
          </p>
        </div>

        {/* Author Footer */}
        <div className="mt-6 pt-4 border-t border-purple-100 dark:border-purple-800/60 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm font-semibold text-purple-900 dark:text-purple-200">
            <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-300 text-xs">
              <User className="w-3.5 h-3.5" />
            </div>
            <span>— {authorName}</span>
          </div>

          <div className="flex items-center space-x-1 text-xs text-purple-400">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Saved in Memory Box</span>
          </div>
        </div>
      </div>
    </div>
  );
};
