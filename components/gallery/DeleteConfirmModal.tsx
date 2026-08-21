'use client';

import React from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title = 'Delete this memory?',
  description = 'Are you sure, Sri? This will permanently remove it from your memory box.',
  onConfirm,
  onCancel,
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-sm bg-white dark:bg-purple-950 rounded-3xl p-6 sm:p-7 shadow-2xl border border-purple-100 dark:border-purple-800 text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-purple-400 hover:text-purple-700 dark:hover:text-purple-200 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Trash2 className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-bold text-purple-950 dark:text-purple-50 mb-1.5">
          {title}
        </h3>

        <p className="text-xs sm:text-sm text-purple-700/80 dark:text-purple-300/80 mb-6 leading-relaxed">
          {description}
        </p>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-2.5 px-4 bg-purple-100/70 dark:bg-purple-900/60 hover:bg-purple-100 text-xs sm:text-sm font-semibold text-purple-800 dark:text-purple-200 rounded-xl transition-all cursor-pointer"
          >
            Keep it
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-xs sm:text-sm font-semibold text-white rounded-xl shadow-soft-sm transition-all cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
