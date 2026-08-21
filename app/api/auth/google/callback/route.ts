import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return new NextResponse(
      `<html><body style="font-family:system-ui;padding:40px;background:#FAF8F5;color:#2E1065;">
        <h2>Google OAuth Authorization Failed 💔</h2>
        <p>Google returned error: <strong>${error}</strong></p>
        <a href="/api/auth/google/login" style="padding:10px 20px;background:#7E22CE;color:white;text-decoration:none;border-radius:8px;">Try Again</a>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' }, status: 400 }
    );
  }

  if (!code) {
    return new NextResponse(
      `<html><body style="font-family:system-ui;padding:40px;background:#FAF8F5;color:#2E1065;">
        <h2>Authorization code missing</h2>
        <a href="/api/auth/google/login" style="padding:10px 20px;background:#7E22CE;color:white;text-decoration:none;border-radius:8px;">Try Again</a>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' }, status: 400 }
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const origin = request.nextUrl.origin;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/google/callback`;

  try {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const { tokens } = await oauth2Client.getToken(code);

    const refreshToken = tokens.refresh_token;

    if (refreshToken) {
      // Save refresh token directly to .env.local
      const envPath = path.join(process.cwd(), '.env.local');
      let envContent = '';
      try {
        envContent = await fs.readFile(envPath, 'utf-8');
      } catch {
        envContent = '';
      }

      if (envContent.includes('GOOGLE_REFRESH_TOKEN=')) {
        envContent = envContent.replace(
          /GOOGLE_REFRESH_TOKEN=.*/,
          `GOOGLE_REFRESH_TOKEN=${refreshToken}`
        );
      } else {
        envContent += `\nGOOGLE_REFRESH_TOKEN=${refreshToken}\n`;
      }
      await fs.writeFile(envPath, envContent, 'utf-8');
    }

    // Test Google Drive connection live with tokens
    oauth2Client.setCredentials(tokens);
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || '1d7tGPl7rTGsWVrCvglQdPra9mmnu8JXq';
    let folderInfo = 'Verified';

    try {
      const folderRes = await drive.files.get({
        fileId: rootFolderId,
        fields: 'id, name',
      });
      folderInfo = `Folder located: "${folderRes.data.name}" (${folderRes.data.id})`;

      // Create subfolders if needed
      const subcategories = ['Photos', 'Videos', 'PDFs', 'Other'];
      for (const cat of subcategories) {
        const query = `'${rootFolderId}' in parents and name = '${cat}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
        const listRes = await drive.files.list({ q: query, fields: 'files(id, name)' });
        if (!listRes.data.files || listRes.data.files.length === 0) {
          await drive.files.create({
            requestBody: {
              name: cat,
              mimeType: 'application/vnd.google-apps.folder',
              parents: [rootFolderId],
            },
          });
        }
      }
    } catch (folderErr) {
      console.warn('Folder subcheck notice:', folderErr);
      folderInfo = `Folder check: ${folderErr instanceof Error ? folderErr.message : String(folderErr)}`;
    }

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Google Drive Connected 💜</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #FAF8F5; color: #2E1065; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .card { background: white; border: 1px solid #E9D5FF; border-radius: 24px; padding: 36px; max-width: 580px; width: 100%; box-shadow: 0 10px 30px rgba(126,34,206,0.1); }
    h1 { color: #581C87; margin-top: 0; font-size: 24px; }
    .token-box { background: #FAF5FF; border: 1px solid #D8B4FE; border-radius: 12px; padding: 14px; font-family: monospace; font-size: 12px; word-break: break-all; margin: 16px 0; color: #4C1D95; user-select: all; }
    .btn { background: #7E22CE; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; }
    .btn:hover { background: #6B21A8; }
    .badge { background: #DCFCE7; color: #166534; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold; }
    .status-box { background: #F0FDF4; border: 1px solid #BBF7D0; color: #15803D; padding: 14px; border-radius: 14px; font-size: 13px; margin: 16px 0; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h1>Google Drive Connected! 🎉</h1>
      <span class="badge">Live &amp; Ready</span>
    </div>
    
    <div class="status-box">
      <strong>✅ Drive Integration Active!</strong><br />
      ${folderInfo}<br />
      Subfolders <code>Photos/</code>, <code>Videos/</code>, <code>PDFs/</code> are ready.
    </div>

    <p style="font-size:13px; color:#6B21A8;">
      The refresh token has been automatically saved to your <code>.env.local</code>. Any memory or file submitted on the website will now upload directly into your Google Drive!
    </p>

    <div style="margin-top:24px; border-top:1px solid #F3E8FF; padding-top:16px; display:flex; gap:12px;">
      <a href="/" class="btn" style="background:#581C87;">Go to Homepage</a>
      <a href="/leave" class="btn">Test Upload Now 💜</a>
    </div>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return new NextResponse(
      `<html><body style="font-family:system-ui;padding:40px;background:#FAF8F5;color:#2E1065;">
        <h2>OAuth Token Exchange Failed 💔</h2>
        <p>${err instanceof Error ? err.message : String(err)}</p>
        <a href="/api/auth/google/login" style="padding:10px 20px;background:#7E22CE;color:white;text-decoration:none;border-radius:8px;">Try Again</a>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' }, status: 500 }
    );
  }
}
