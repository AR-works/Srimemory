import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/db/supabase';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
    envCheck: {
      has_S_PIN: Boolean(process.env.S_PIN),
      has_SESSION_SECRET: Boolean(process.env.SESSION_SECRET),
      has_NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL),
      has_NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY),
      has_SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      has_GOOGLE_CLIENT_ID: Boolean(process.env.GOOGLE_CLIENT_ID),
      has_GOOGLE_CLIENT_SECRET: Boolean(process.env.GOOGLE_CLIENT_SECRET),
      has_GOOGLE_DRIVE_ROOT_FOLDER_ID: Boolean(process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID),
      has_GOOGLE_REFRESH_TOKEN: Boolean(process.env.GOOGLE_REFRESH_TOKEN),
    },
    supabaseStatus: 'untested',
    googleDriveStatus: 'untested',
  };

  // Test Supabase
  const supabase = getSupabaseClient();
  if (!supabase) {
    diagnostics.supabaseStatus = 'FAILED: Supabase environment variables are missing on Vercel.';
  } else {
    try {
      const { data, error } = await supabase.from('submissions').select('id, count', { count: 'exact' });
      if (error) {
        diagnostics.supabaseStatus = `ERROR from Supabase: ${error.message} (code: ${error.code})`;
      } else {
        diagnostics.supabaseStatus = `CONNECTED: Successfully queried 'submissions' table. Row count: ${data.length}`;
      }
    } catch (err: any) {
      diagnostics.supabaseStatus = `EXCEPTION connecting to Supabase: ${err.message}`;
    }
  }

  // Test Google Drive
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

  return NextResponse.json(diagnostics, { status: 200 });
}
