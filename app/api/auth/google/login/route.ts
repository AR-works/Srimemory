import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  const origin = request.nextUrl.origin;
  // If on Vercel/production, always use the current domain's callback URL
  const redirectUri = origin.includes('localhost')
    ? (process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/google/callback`)
    : `${origin}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        error:
          'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are missing in your environment variables.',
      },
      { status: 400 }
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // Forces refresh_token to always be returned
    scope: [
      'https://www.googleapis.com/auth/drive',
    ],
  });

  return NextResponse.redirect(authUrl);
}
