import { Submission, FileMetadata, ContributorSubmissionPayload } from '@/types';
import { getSupabaseClient } from './supabase';
import { INITIAL_SEED_SUBMISSIONS } from './mock-seed';

// In-memory fallback database for local dev and previewing
let memorySubmissions: Submission[] = [...INITIAL_SEED_SUBMISSIONS];

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
        return memorySubmissions;
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
      console.warn('Supabase query failed, falling back to memory store:', err);
      return memorySubmissions;
    }
  }

  return memorySubmissions;
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
      storage_account: 'primary_drive',
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
      const { data: subData, error: subError } = await supabase
        .from('submissions')
        .insert({
          id: submissionId,
          display_name: displayName,
          internal_name: internalName,
          is_anonymous: isAnon,
          message: payload.message.trim(),
          created_at: now,
        })
        .select()
        .single();

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

      memorySubmissions.unshift(newSubmission);
      return newSubmission;
    } catch (err) {
      console.warn('Supabase insert failed, saving to in-memory store:', err);
    }
  }

  memorySubmissions.unshift(newSubmission);
  return newSubmission;
}

export function resetToSeedData() {
  memorySubmissions = [...INITIAL_SEED_SUBMISSIONS];
}
