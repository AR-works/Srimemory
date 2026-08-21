'use client';

import React, { useState, useRef, useCallback } from 'react';
import { UploadFileItem } from '@/types';
import { FilePreviewCard } from './FilePreviewCard';
import { Upload, Sparkles, Plus } from 'lucide-react';

interface UploadDropzoneProps {
  files: UploadFileItem[];
  setFiles: React.Dispatch<React.SetStateAction<UploadFileItem[]>>;
  onFileUploaded?: (item: UploadFileItem) => void;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  files,
  setFiles,
  onFileUploaded,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (item: UploadFileItem) => {
      // Set status to uploading
      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id ? { ...f, status: 'uploading', progress: 10 } : f
        )
      );

      try {
        const formData = new FormData();
        formData.append('file', item.file);

        // Fake progressive indicator for responsiveness
        const progressInterval = setInterval(() => {
          setFiles((prev) =>
            prev.map((f) => {
              if (f.id === item.id && f.status === 'uploading' && f.progress < 85) {
                return { ...f, progress: f.progress + 15 };
              }
              return f;
            })
          );
        }, 150);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);

        if (!res.ok) {
          throw new Error('Upload failed');
        }

        const data = await res.json();
        const updatedItem: UploadFileItem = {
          ...item,
          status: 'completed',
          progress: 100,
          storageFileId: data.storageFileId,
          storageProvider: data.storageProvider,
        };

        setFiles((prev) =>
          prev.map((f) => (f.id === item.id ? updatedItem : f))
        );

        if (onFileUploaded) {
          onFileUploaded(updatedItem);
        }
      } catch {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? { ...f, status: 'failed', error: 'Upload failed', progress: 0 }
              : f
          )
        );
      }
    },
    [setFiles, onFileUploaded]
  );

  const handleFilesAdded = useCallback(
    (newFileList: FileList | File[]) => {
      const addedItems: UploadFileItem[] = [];

      Array.from(newFileList).forEach((file) => {
        const id = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const previewUrl = file.type.startsWith('image/')
          ? URL.createObjectURL(file)
          : undefined;

        const item: UploadFileItem = {
          id,
          file,
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          previewUrl,
          status: 'ready',
          progress: 0,
        };

        addedItems.push(item);
      });

      setFiles((prev) => [...prev, ...addedItems]);

      // Automatically trigger upload for each added file
      addedItems.forEach((item) => {
        uploadFile(item);
      });
    },
    [setFiles, uploadFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const handleRemove = (id: string) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item?.previewUrl && item.type.startsWith('image/')) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleRetry = (id: string) => {
    const item = files.find((f) => f.id === id);
    if (item) {
      uploadFile(item);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-6 md:p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-purple-500 bg-purple-100/50 scale-[1.01]'
            : 'border-purple-200/80 bg-white/70 hover:border-purple-400 hover:bg-purple-50/40 shadow-soft-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept="image/*,video/*,application/pdf,.pdf,.heic"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFilesAdded(e.target.files);
              // reset input value so re-uploading same file works
              e.target.value = '';
            }
          }}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-purple-100/80 text-purple-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            <Upload className="w-7 h-7" />
          </div>

          <div>
            <p className="text-base font-semibold text-purple-950">
              Drop photos, PDFs, or videos here
            </p>
            <p className="text-xs text-purple-600/70 mt-1">
              or tap to browse memories from your device
            </p>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-purple-500/80 font-medium bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Multiple files welcome • JPG, PNG, PDF, MP4, HEIC</span>
          </div>
        </div>
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-purple-900 px-1">
            <span>Attached Memories ({files.length})</span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-purple-600 hover:text-purple-800 flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add more</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {files.map((fileItem) => (
              <FilePreviewCard
                key={fileItem.id}
                item={fileItem}
                onRemove={handleRemove}
                onRetry={handleRetry}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
