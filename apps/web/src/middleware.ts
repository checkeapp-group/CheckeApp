import { getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';

const publicRoutes = ['/', '/share/:path*'];
const homeUrl = '/';
const guestRoutes = ['/login', '/register', '/recover-password'];
const loginUrl = '/login';

function matches(pattern: string, pathname: string) {
  if (pattern.endsWith('/:path*')) {
    const prefix = pattern.replace('/:path*', '');
    return pathname === prefix || pathname.startsWith(prefix + '/');
  }
  if (pattern.endsWith('/*')) {
    const prefix = pattern.slice(0, -2);
    return pathname === prefix || pathname.startsWith(prefix + '/');
  }
  return pathname === pattern;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (publicRoutes.some((p) => matches(p, pathname))) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);

  if (sessionCookie) {
    if (guestRoutes.some((p) => matches(p, pathname))) {
      return NextResponse.redirect(new URL(homeUrl, request.url));
    }

    return NextResponse.next();
  }
  if (guestRoutes.some((p) => matches(p, pathname))) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL(loginUrl, request.url));
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
