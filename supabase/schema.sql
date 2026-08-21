-- Srinithi's Birthday Memory Web App - Supabase PostgreSQL Schema

-- 1. Storage Accounts Table
CREATE TABLE IF NOT EXISTS storage_accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'google_drive',
  is_active BOOLEAN NOT NULL DEFAULT true,
  configuration_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT,
  internal_name TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Files Table
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  storage_provider TEXT NOT NULL DEFAULT 'google_drive',
  storage_account TEXT NOT NULL DEFAULT 'primary_drive',
  storage_file_id TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  download_url TEXT,
  preview_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_submission_id ON files(submission_id);

-- Optional Row Level Security (RLS)
-- By default, all operations are secured server-side through Next.js server actions / route handlers.
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_accounts ENABLE ROW LEVEL SECURITY;

-- Default storage account seed
INSERT INTO storage_accounts (id, name, provider, is_active, configuration_reference)
VALUES ('primary_drive', 'Primary Google Drive', 'google_drive', true, 'GOOGLE_DRIVE_ROOT_FOLDER_ID')
ON CONFLICT (id) DO NOTHING;
