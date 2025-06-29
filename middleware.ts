import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // If the user is not authenticated and trying to access protected routes
    if (!req.nextauth.token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/favorites/:path*',
    '/trending/:path*',
  ],
}; 