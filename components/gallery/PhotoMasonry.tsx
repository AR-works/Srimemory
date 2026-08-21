'use client';

import React, { useState } from 'react';
import { FileMetadata, Submission } from '@/types';
import { Lightbox } from './Lightbox';
import { ZoomIn, User } from 'lucide-react';

interface PhotoItem {
  file: FileMetadata;
  submission?: Submission;
}

interface PhotoMasonryProps {
  photos: PhotoItem[];
}

export const PhotoMasonry: React.FC<PhotoMasonryProps> = ({ photos }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 text-purple-600/70 dark:text-purple-400/70 text-sm">
        No photos have been attached yet.
      </div>
    );
  }

  return (
    <>
      <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
        {photos.map((item, index) => {
          const authorName =
            item.submission?.is_anonymous || !item.submission?.display_name
              ? 'Anonymous'
              : item.submission.display_name;

          const imageUrl =
            item.file.preview_url ||
            item.file.download_url ||
            `/api/files/${item.file.storage_file_id}`;

          return (
            <div
              key={item.file.id || index}
              onClick={() => setSelectedIndex(index)}
              className="relative group break-inside-avoid rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer bg-purple-50/60 dark:bg-purple-900/40 border border-purple-100 dark:border-purple-800 shadow-soft-sm hover:shadow-soft-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={item.file.original_filename}
                loading="lazy"
                className="w-full h-auto object-cover rounded-2xl sm:rounded-3xl group-hover:scale-105 transition-transform duration-500"
              />

              {/* Hover / Touch Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-purple-950/85 via-purple-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2.5 sm:p-4 flex flex-col justify-between">
                <div className="flex justify-end">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center">
                    <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>

                <div>
                  <p className="text-white text-[11px] sm:text-xs font-semibold truncate mb-0.5 sm:mb-1">
                    {item.file.original_filename}
                  </p>
                  {item.submission && (
                    <div className="flex items-center space-x-1 text-purple-200 text-[10px] sm:text-[11px]">
                      <User className="w-3 h-3" />
                      <span>{authorName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedIndex !== null && (
        <Lightbox
          photos={photos}
          currentIndex={selectedIndex}
          isOpen={selectedIndex !== null}
          onClose={() => setSelectedIndex(null)}
          onIndexChange={(idx) => setSelectedIndex(idx)}
        />
      )}
    </>
  );
};
