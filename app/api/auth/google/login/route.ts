import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  const origin = request.nextUrl.origin;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        error:
          'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are missing in your environment variables. Please add them to .env.local first.',
      },
      { status: 400 }
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'select_account consent', // Allows selecting the exact Google account and forces refresh_token
    scope: [
      'https://www.googleapis.com/auth/drive', // Full Drive access to upload into any custom folder
    ],
  });

  return NextResponse.redirect(authUrl);
}
