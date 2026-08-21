'use client';

import React, { useEffect } from 'react';
import { FileMetadata, Submission } from '@/types';
import { X, Download, User } from 'lucide-react';

interface VideoModalProps {
  file: FileMetadata | null;
  submission?: Submission;
  isOpen: boolean;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  file,
  submission,
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !file) return null;

  const videoUrl = file.download_url || file.preview_url || `/api/files/${file.storage_file_id}`;
  const authorName = submission?.is_anonymous || !submission?.display_name
    ? 'Anonymous'
    : submission.display_name;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-purple-950 rounded-3xl overflow-hidden shadow-2xl border border-purple-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between p-4 bg-purple-900/60 border-b border-purple-800 text-white">
          <div className="flex items-center space-x-2 truncate">
            <span className="text-sm font-semibold truncate">{file.original_filename}</span>
            {submission && (
              <span className="text-xs text-purple-300 flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{authorName}</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={videoUrl}
              download={file.original_filename}
              className="p-2 text-white/80 hover:text-white bg-purple-800/60 hover:bg-purple-800 rounded-full transition-colors"
              title="Download video"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white bg-purple-800/60 hover:bg-purple-800 rounded-full transition-colors"
              title="Close video"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video bg-black flex items-center justify-center">
          <video
            src={videoUrl}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          >
            Your browser does not support playing this video.
          </video>
        </div>
      </div>
    </div>
  );
};
