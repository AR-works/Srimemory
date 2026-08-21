export type MessageTone =
  | 'heartfelt'
  | 'funny'
  | 'reassuring'
  | 'friendship'
  | 'playful'
  | 'confidence'
  | 'teasing'
  | 'warm';

export interface EncouragementMessage {
  id: number;
  text: string;
  tone: MessageTone;
}

export type StorageProviderType = 'google_drive' | 'local_mock' | 'supabase';

export interface StorageAccount {
  id: string;
  name: string;
  provider: StorageProviderType;
  is_active: boolean;
  configuration_reference?: string;
  created_at: string;
}

export interface FileMetadata {
  id: string;
  submission_id: string;
  storage_provider: StorageProviderType;
  storage_account: string;
  storage_file_id: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  created_at: string;
  download_url?: string;
  preview_url?: string;
}

export interface Submission {
  id: string;
  display_name: string | null;
  internal_name?: string | null;
  is_anonymous: boolean;
  message: string;
  created_at: string;
  files?: FileMetadata[];
}

export type UploadStatus = 'ready' | 'uploading' | 'completed' | 'failed';

export interface UploadFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
  status: UploadStatus;
  progress: number;
  error?: string;
  storageFileId?: string;
  storageProvider?: StorageProviderType;
}

export interface ContributorSubmissionPayload {
  name?: string;
  isAnonymous: boolean;
  message: string;
  files: Array<{
    storageFileId: string;
    originalFilename: string;
    mimeType: string;
    fileSize: number;
    storageProvider?: StorageProviderType;
  }>;
}

export interface AuthSession {
  authenticated: boolean;
  expiresAt: number;
}
