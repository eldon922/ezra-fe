import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAuthenticated = Boolean(request.cookies.get('isAuthenticated'));

  const { pathname } = request.nextUrl;

  if (!isAuthenticated && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthenticated && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Apply middleware to the entire app except for static assets and the login page
export const config = {
  matcher: ['/((?!_next/static|favicon.ico).*)'],
};
