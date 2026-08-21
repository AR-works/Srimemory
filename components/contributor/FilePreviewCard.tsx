'use client';

import React from 'react';
import { UploadFileItem } from '@/types';
import { formatBytes } from '@/lib/utils';
import {
  FileText,
  Image as ImageIcon,
  Video,
  File as GenericFile,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Loader2,
} from 'lucide-react';

interface FilePreviewCardProps {
  item: UploadFileItem;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}

export const FilePreviewCard: React.FC<FilePreviewCardProps> = ({
  item,
  onRemove,
  onRetry,
}) => {
  const isImage = item.type.startsWith('image/');
  const isVideo = item.type.startsWith('video/');
  const isPdf = item.type === 'application/pdf' || item.name.toLowerCase().endsWith('.pdf');

  return (
    <div className="relative group flex items-center justify-between p-3.5 bg-white/95 rounded-2xl border border-purple-100 shadow-soft-sm hover:shadow-soft-md transition-all">
      <div className="flex items-center space-x-3.5 min-w-0 flex-1 mr-2">
        {/* Thumbnail or File Icon */}
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-purple-50 border border-purple-100 flex items-center justify-center relative">
          {isImage && item.previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.previewUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : isPdf ? (
            <div className="flex flex-col items-center justify-center text-rose-500">
              <FileText className="w-6 h-6" />
              <span className="text-[9px] font-bold tracking-tight uppercase">PDF</span>
            </div>
          ) : isVideo ? (
            <div className="flex flex-col items-center justify-center text-pink-500">
              <Video className="w-6 h-6" />
              <span className="text-[9px] font-bold tracking-tight uppercase">Video</span>
            </div>
          ) : (
            <GenericFile className="w-6 h-6 text-purple-400" />
          )}
        </div>

        {/* File Details */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-purple-950 truncate" title={item.name}>
            {item.name}
          </p>
          <div className="flex items-center space-x-2 text-xs text-purple-600/70 mt-0.5">
            <span>{formatBytes(item.size)}</span>
            <span>•</span>
            {item.status === 'ready' && (
              <span className="text-purple-600 font-medium">Ready</span>
            )}
            {item.status === 'uploading' && (
              <span className="text-purple-600 font-medium flex items-center">
                <Loader2 className="w-3 h-3 animate-spin mr-1 text-purple-500" />
                Uploading ({item.progress}%)
              </span>
            )}
            {item.status === 'completed' && (
              <span className="text-emerald-600 font-medium flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                Uploaded
              </span>
            )}
            {item.status === 'failed' && (
              <span className="text-rose-500 font-medium flex items-center">
                <AlertCircle className="w-3 h-3 mr-1 text-rose-500" />
                Failed
              </span>
            )}
          </div>

          {/* Progress bar when uploading */}
          {item.status === 'uploading' && (
            <div className="w-full bg-purple-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-purple-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-1.5 flex-shrink-0">
        {item.status === 'failed' && (
          <button
            type="button"
            onClick={() => onRetry(item.id)}
            className="p-1.5 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
            title="Retry upload"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="p-1.5 text-purple-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          title="Remove file"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
