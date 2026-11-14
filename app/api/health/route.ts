import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/db/supabase';
import { getAllSubmissions } from '@/lib/db/repository';
import { readSubmissionsFromDrive } from '@/lib/db/drive-db';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';

  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
    envCheck: {
      has_S_PIN: Boolean(process.env.S_PIN),
      has_SESSION_SECRET: Boolean(process.env.SESSION_SECRET),
      has_NEXT_PUBLIC_SUPABASE_URL: Boolean(rawUrl),
      supabaseUrlPreview: rawUrl ? `${rawUrl.substring(0, 18)}...` : 'missing',
      has_NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY),
      has_SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      has_GOOGLE_CLIENT_ID: Boolean(process.env.GOOGLE_CLIENT_ID),
      has_GOOGLE_CLIENT_SECRET: Boolean(process.env.GOOGLE_CLIENT_SECRET),
      has_GOOGLE_DRIVE_ROOT_FOLDER_ID: Boolean(process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID),
      has_GOOGLE_REFRESH_TOKEN: Boolean(process.env.GOOGLE_REFRESH_TOKEN),
    },
    driveDatabaseStatus: 'untested',
    googleDriveStatus: 'untested',
    supabaseStatus: 'untested',
  };

  // Test Google Drive & Drive Database
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const folderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

  if (!clientId || !clientSecret || !refreshToken) {
    diagnostics.googleDriveStatus = 'FAILED: Google Drive credentials or GOOGLE_REFRESH_TOKEN missing on Vercel.';
  } else {
    try {
      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
      oauth2Client.setCredentials({ refresh_token: refreshToken });
      const drive = google.drive({ version: 'v3', auth: oauth2Client });

      if (folderId) {
        const folderRes = await drive.files.get({ fileId: folderId, fields: 'id, name' });
        diagnostics.googleDriveStatus = `CONNECTED: Successfully accessed Drive folder "${folderRes.data.name}" (${folderRes.data.id})`;
      } else {
        diagnostics.googleDriveStatus = 'CONNECTED: Google credentials valid, but GOOGLE_DRIVE_ROOT_FOLDER_ID is unset.';
      }
    } catch (err: any) {
      diagnostics.googleDriveStatus = `ERROR from Google Drive: ${err.message}`;
    }
  }

  // Test Primary Database (Google Drive Database with Auto-Migration)
  try {
    const all = await getAllSubmissions();
    const inDrive = await readSubmissionsFromDrive();
    diagnostics.driveDatabaseStatus = `ACTIVE: Total ${all.length} memories loaded. Synced in Google Drive submissions.json: ${inDrive !== null ? 'YES' : 'NO'}`;
  } catch (err: any) {
    diagnostics.driveDatabaseStatus = `ERROR: ${err.message}`;
  }

  // Test Supabase (Optional fallback)
  const supabase = getSupabaseClient();
  if (!supabase) {
    diagnostics.supabaseStatus = 'OPTIONAL: Not configured (Safe - Drive database handles all storage).';
  } else {
    try {
      const { data, error } = await supabase.from('submissions').select('id');
      if (error) {
        diagnostics.supabaseStatus = `PAUSED / INACTIVE (Safe: Drive database handles all storage): ${error.message}`;
      } else {
        diagnostics.supabaseStatus = `CONNECTED: Found ${data.length} memories in Supabase.`;
      }
    } catch (err: any) {
      diagnostics.supabaseStatus = `NOTICE: ${err.message}`;
    }
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
