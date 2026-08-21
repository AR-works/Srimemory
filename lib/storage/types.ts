import { StorageProviderType } from '@/types';
import { Readable } from 'stream';

export type FileCategory = 'Photos' | 'Videos' | 'PDFs' | 'Other';

export interface UploadResult {
  storageFileId: string;
  storageProvider: StorageProviderType;
  storageAccount: string;
  downloadUrl?: string;
  previewUrl?: string;
  mimeType: string;
  size: number;
}

export interface StorageProvider {
  name: StorageProviderType;
  upload(
    fileBuffer: Buffer,
    filename: string,
    mimeType: string,
    category?: FileCategory
  ): Promise<UploadResult>;
  getFileStream(storageFileId: string): Promise<Readable>;
  getDownloadUrl(storageFileId: string): Promise<string>;
  delete(storageFileId: string): Promise<void>;
}

export function detectFileCategory(mimeType: string, filename: string): FileCategory {
  const lowerName = filename.toLowerCase();
  if (
    mimeType.startsWith('image/') ||
    lowerName.endsWith('.jpg') ||
    lowerName.endsWith('.jpeg') ||
    lowerName.endsWith('.png') ||
    lowerName.endsWith('.webp') ||
    lowerName.endsWith('.gif') ||
    lowerName.endsWith('.heic')
  ) {
    return 'Photos';
  }
  if (
    mimeType.startsWith('video/') ||
    lowerName.endsWith('.mp4') ||
    lowerName.endsWith('.mov') ||
    lowerName.endsWith('.webm') ||
    lowerName.endsWith('.avi') ||
    lowerName.endsWith('.m4v')
  ) {
    return 'Videos';
  }
  if (mimeType === 'application/pdf' || lowerName.endsWith('.pdf')) {
    return 'PDFs';
  }
  return 'Other';
}
