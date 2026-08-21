'use client';

import React, { useEffect, useCallback } from 'react';
import { FileMetadata, Submission } from '@/types';
import { formatDate } from '@/lib/utils';
import { X, ChevronLeft, ChevronRight, Download, User } from 'lucide-react';

interface LightboxProps {
  photos: Array<{ file: FileMetadata; submission?: Submission }>;
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onIndexChange,
}) => {
  const currentItem = photos[currentIndex];

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    } else {
      onIndexChange(photos.length - 1);
    }
  }, [currentIndex, photos.length, onIndexChange]);

  const handleNext = useCallback(() => {
    if (currentIndex < photos.length - 1) {
      onIndexChange(currentIndex + 1);
    } else {
      onIndexChange(0);
    }
  }, [currentIndex, photos.length, onIndexChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !currentItem) return null;

  const imageUrl = currentItem.file.preview_url || currentItem.file.download_url || `/api/files/${currentItem.file.storage_file_id}`;
  const authorName = currentItem.submission?.is_anonymous || !currentItem.submission?.display_name
    ? 'Anonymous'
    : currentItem.submission.display_name;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top action controls */}
      <div
        className="absolute top-4 inset-x-4 flex items-center justify-between z-20 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-2 text-white/90 text-sm font-medium bg-black/40 px-3.5 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
          <span>
            {currentIndex + 1} / {photos.length}
          </span>
          {currentItem.submission && (
            <>
              <span>•</span>
              <span className="flex items-center space-x-1 text-purple-300">
                <User className="w-3.5 h-3.5" />
                <span>{authorName}</span>
              </span>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <a
            href={currentItem.file.download_url || imageUrl}
            download={currentItem.file.original_filename}
            target="_blank"
            rel="noreferrer"
            className="p-2.5 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-sm border border-white/10 transition-colors"
            title="Download full photo"
          >
            <Download className="w-5 h-5" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-sm border border-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation Arrows */}
      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white bg-black/40 hover:bg-black/70 rounded-full backdrop-blur-sm border border-white/10 transition-all z-20"
            title="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white bg-black/40 hover:bg-black/70 rounded-full backdrop-blur-sm border border-white/10 transition-all z-20"
            title="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Image Display */}
      <div
        className="relative max-w-5xl max-h-[82vh] p-4 flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={currentItem.file.original_filename}
          className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl transition-all duration-200"
        />

        <div className="mt-3 text-center text-xs text-white/70 max-w-lg truncate">
          <span>{currentItem.file.original_filename}</span>
          <span className="mx-2">•</span>
          <span>{formatDate(currentItem.file.created_at)}</span>
        </div>
      </div>
    </div>
  );
};
