import { Submission, FileMetadata, ContributorSubmissionPayload } from '@/types';
import { getSupabaseClient } from './supabase';
import { readSubmissionsFromDrive, writeSubmissionsToDrive } from './drive-db';
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
  } catch {
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

/**
 * Fetch from Supabase as a fallback / migration source.
 */
async function getSupabaseSubmissions(): Promise<Submission[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data: submissions, error: subError } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (subError) {
      console.warn('Supabase query error on submissions table:', subError);
      return null;
    }

    if (!submissions || submissions.length === 0) {
      return [];
    }

    const { data: files, error: filesError } = await supabase
      .from('files')
      .select('*')
      .order('created_at', { ascending: true });

    if (filesError) {
      console.warn('Supabase query error on files table:', filesError);
    }

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
    console.warn('Supabase fetch failed:', err);
    return null;
  }
}

/**
 * Get all submissions:
 * 1. Primary: Read from Google Drive (submissions.json)
 * 2. If not yet in Google Drive: Read from Supabase and automatically migrate to Google Drive!
 * 3. Fallback: Local persistent JSON file
 */
export async function getAllSubmissions(): Promise<Submission[]> {
  // 1. Try reading from Google Drive
  const driveSubmissions = await readSubmissionsFromDrive();
  if (driveSubmissions !== null) {
    return driveSubmissions;
  }

  // 2. Not in Google Drive yet -> Check Supabase to perform automatic migration!
  const supabaseSubmissions = await getSupabaseSubmissions();
  if (supabaseSubmissions !== null && supabaseSubmissions.length > 0) {
    console.log(`[Drive DB Migration] Auto-migrating ${supabaseSubmissions.length} memories from Supabase to Google Drive...`);
    await writeSubmissionsToDrive(supabaseSubmissions);
    return supabaseSubmissions;
  }

  // 3. Fallback to local file
  const local = await readLocalSubmissions();
  if (local.length > 0) {
    await writeSubmissionsToDrive(local);
    return local;
  }

  return [];
}

export async function createSubmission(payload: ContributorSubmissionPayload): Promise<Submission> {
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

  // 1. Get current submissions list
  const current = await getAllSubmissions();
  current.unshift(newSubmission);

  // 2. Primary: Save to Google Drive
  const driveSuccess = await writeSubmissionsToDrive(current);
  if (!driveSuccess) {
    console.warn('Drive write failed, using local backup.');
  }

  // 3. Best-effort mirror to Supabase (if online)
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('submissions').insert({
        id: submissionId,
        display_name: displayName,
        internal_name: internalName,
        is_anonymous: isAnon,
        message: payload.message.trim(),
        created_at: now,
      });

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
        await supabase.from('files').insert(fileRows);
      }
    } catch (err) {
      console.warn('Supabase background insert note (non-critical):', err);
    }
  }

  // 4. Local fallback backup
  await writeLocalSubmissions(current);

  return newSubmission;
}

export async function deleteSubmission(submissionId: string): Promise<boolean> {
  const current = await getAllSubmissions();
  const targetSub = current.find((s) => s.id === submissionId);

  // 1. Delete physical files from Google Drive
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

  // 2. Filter from list and update Google Drive
  const filtered = current.filter((s) => s.id !== submissionId);
  await writeSubmissionsToDrive(filtered);

  // 3. Best-effort mirror delete from Supabase
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('submissions').delete().eq('id', submissionId);
    } catch (err) {
      console.warn('Supabase delete error (non-critical):', err);
    }
  }

  // 4. Local update
  await writeLocalSubmissions(filtered);
  return true;
}

export async function deleteFile(fileId: string): Promise<boolean> {
  const current = await getAllSubmissions();

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

  const updated = current.map((sub) => ({
    ...sub,
    files: (sub.files || []).filter((f) => f.id !== fileId && f.storage_file_id !== fileId),
  }));

  // Update Google Drive
  await writeSubmissionsToDrive(updated);

  // Best-effort Supabase
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('files').delete().or(`id.eq.${fileId},storage_file_id.eq.${fileId}`);
    } catch (err) {
      console.warn('Supabase file delete error (non-critical):', err);
    }
  }

  // Local update
  await writeLocalSubmissions(updated);
  return true;
}
