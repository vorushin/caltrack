import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl;

  // Skip authentication for the login page and API login route
  if (pathname === '/login' || pathname === '/api/auth/login') {
    return NextResponse.next();
  }

  // Check if the user is authenticated
  const authToken = request.cookies.get('auth_token')?.value;
  
  // If no auth token is present, redirect to login page
  if (!authToken) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // Verify the auth token (simple check for demo purposes)
  // In a real app, you might want to use JWT or another token verification method
  if (authToken !== process.env.AUTH_TOKEN_VALUE) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // If authenticated, continue to the requested page
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all routes except for static files, api/auth/login, and login page
    '/((?!_next/static|_next/image|favicon.ico|api/auth/login|login).*)',
  ],
}; 