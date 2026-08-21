import { Submission, FileMetadata, ContributorSubmissionPayload } from '@/types';
import { getSupabaseClient } from './supabase';
import { getStorageProvider } from '@/lib/storage';
import { promises as fs } from 'fs';
import path from 'path';
import { existsSync } from 'fs';

const LOCAL_DB_DIR = path.join(process.cwd(), '.local_db');
const LOCAL_DB_FILE = path.join(LOCAL_DB_DIR, 'submissions.json');

async function readLocalSubmissions(): Promise<Submission[]> {
  try {
    if (!existsSync(LOCAL_DB_DIR)) {
      await fs.mkdir(LOCAL_DB_DIR, { recursive: true });
    }
    if (!existsSync(LOCAL_DB_FILE)) {
      return [];
    }
    const data = await fs.readFile(LOCAL_DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading local submissions:', err);
    return [];
  }
}

async function writeLocalSubmissions(submissions: Submission[]): Promise<void> {
  try {
    if (!existsSync(LOCAL_DB_DIR)) {
      await fs.mkdir(LOCAL_DB_DIR, { recursive: true });
    }
    await fs.writeFile(LOCAL_DB_FILE, JSON.stringify(submissions, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local submissions:', err);
  }
}

export async function getAllSubmissions(): Promise<Submission[]> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data: submissions, error: subError } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (subError) throw subError;
      if (!submissions || submissions.length === 0) {
        return await readLocalSubmissions();
      }

      const { data: files, error: filesError } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: true });

      if (filesError) throw filesError;

      const filesMap = new Map<string, FileMetadata[]>();
      (files || []).forEach((file: FileMetadata) => {
        const list = filesMap.get(file.submission_id) || [];
        list.push(file);
        filesMap.set(file.submission_id, list);
      });

      return submissions.map((sub: Submission) => ({
        ...sub,
        files: filesMap.get(sub.id) || [],
      }));
    } catch (err) {
      console.warn('Supabase query failed, using local persistent store:', err);
      return await readLocalSubmissions();
    }
  }

  return await readLocalSubmissions();
}

export async function createSubmission(payload: ContributorSubmissionPayload): Promise<Submission> {
  const supabase = getSupabaseClient();
  const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();

  const isAnon = payload.isAnonymous || !payload.name || payload.name.trim() === '';
  const displayName = isAnon ? null : payload.name?.trim() || null;
  const internalName = payload.name?.trim() || 'Anonymous';

  const newSubmission: Submission = {
    id: submissionId,
    display_name: displayName,
    internal_name: internalName,
    is_anonymous: isAnon,
    message: payload.message.trim(),
    created_at: now,
    files: payload.files.map((f, index) => ({
      id: `file_${Date.now()}_${index}`,
      submission_id: submissionId,
      storage_provider: f.storageProvider || 'google_drive',
      storage_account: 'primary_google_drive',
      storage_file_id: f.storageFileId,
      original_filename: f.originalFilename,
      mime_type: f.mimeType,
      file_size: f.fileSize,
      download_url: `/api/files/${f.storageFileId}`,
      preview_url: `/api/files/${f.storageFileId}`,
      created_at: now,
    })),
  };

  if (supabase) {
    try {
      const { error: subError } = await supabase
        .from('submissions')
        .insert({
          id: submissionId,
          display_name: displayName,
          internal_name: internalName,
          is_anonymous: isAnon,
          message: payload.message.trim(),
          created_at: now,
        });

      if (subError) throw subError;

      if (payload.files.length > 0) {
        const fileRows = newSubmission.files!.map((f) => ({
          id: f.id,
          submission_id: submissionId,
          storage_provider: f.storage_provider,
          storage_account: f.storage_account,
          storage_file_id: f.storage_file_id,
          original_filename: f.original_filename,
          mime_type: f.mime_type,
          file_size: f.file_size,
          created_at: now,
        }));

        const { error: fileError } = await supabase.from('files').insert(fileRows);
        if (fileError) throw fileError;
      }
    } catch (err) {
      console.warn('Supabase insert failed, saving to local store:', err);
    }
  }

  // Always save to local persistent store so data is never lost in dev
  const current = await readLocalSubmissions();
  current.unshift(newSubmission);
  await writeLocalSubmissions(current);

  return newSubmission;
}

export async function deleteSubmission(submissionId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const current = await readLocalSubmissions();
  const targetSub = current.find((s) => s.id === submissionId);

  // Delete attached physical files from Google Drive / storage
  if (targetSub && targetSub.files && targetSub.files.length > 0) {
    const storageProvider = getStorageProvider();
    for (const file of targetSub.files) {
      try {
        await storageProvider.delete(file.storage_file_id);
      } catch (err) {
        console.warn(`Could not delete file ${file.storage_file_id} from storage:`, err);
      }
    }
  }

  if (supabase) {
    try {
      await supabase.from('submissions').delete().eq('id', submissionId);
    } catch (err) {
      console.warn('Supabase delete failed:', err);
    }
  }

  const filtered = current.filter((s) => s.id !== submissionId);
  await writeLocalSubmissions(filtered);
  return true;
}

export async function deleteFile(fileId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const current = await readLocalSubmissions();

  let targetStorageFileId: string | null = null;
  current.forEach((sub) => {
    const found = sub.files?.find((f) => f.id === fileId || f.storage_file_id === fileId);
    if (found) {
      targetStorageFileId = found.storage_file_id;
    }
  });

  if (targetStorageFileId) {
    try {
      const storageProvider = getStorageProvider();
      await storageProvider.delete(targetStorageFileId);
    } catch (err) {
      console.warn(`Could not delete file ${targetStorageFileId} from storage:`, err);
    }
  }

  if (supabase) {
    try {
      await supabase.from('files').delete().or(`id.eq.${fileId},storage_file_id.eq.${fileId}`);
    } catch (err) {
      console.warn('Supabase file delete failed:', err);
    }
  }

  const updated = current.map((sub) => ({
    ...sub,
    files: (sub.files || []).filter((f) => f.id !== fileId && f.storage_file_id !== fileId),
  }));

  await writeLocalSubmissions(updated);
  return true;
}
