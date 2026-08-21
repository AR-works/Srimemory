import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getFileIconInfo(mimeType: string, filename: string) {
  const lower = filename.toLowerCase();
  if (mimeType.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|heic)$/.test(lower)) {
    return { type: 'image', label: 'Photo', color: 'text-purple-500 bg-purple-50' };
  }
  if (mimeType.startsWith('video/') || /\.(mp4|mov|webm|avi)$/.test(lower)) {
    return { type: 'video', label: 'Video', color: 'text-pink-500 bg-pink-50' };
  }
  if (mimeType === 'application/pdf' || lower.endsWith('.pdf')) {
    return { type: 'pdf', label: 'PDF Document', color: 'text-rose-500 bg-rose-50' };
  }
  return { type: 'file', label: 'Attachment', color: 'text-violet-500 bg-violet-50' };
}
