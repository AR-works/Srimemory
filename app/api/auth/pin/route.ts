import { NextRequest, NextResponse } from 'next/server';
import { verifyPin, createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth/pin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pin } = body;

    if (!pin || typeof pin !== 'string') {
      return NextResponse.json({ error: 'PIN is required.' }, { status: 400 });
    }

    const isValid = verifyPin(pin);
    if (!isValid) {
      return NextResponse.json(
        { error: "Hmm, that's not the secret PIN. Try again 💜" },
        { status: 401 }
      );
    }

    const token = createSessionToken();
    const response = NextResponse.json({
      success: true,
      message: "You're in! Welcome S 💜",
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error('PIN verification error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while verifying your PIN. Please try again.' },
      { status: 500 }
    );
  }
}
