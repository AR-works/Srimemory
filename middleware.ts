import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 's_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = Boolean(sessionCookie && sessionCookie.includes('.'));

  // If accessing private gallery without session cookie, redirect to PIN entrance
  if (pathname.startsWith('/s/gallery')) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = '/s';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/s/gallery/:path*'],
};
