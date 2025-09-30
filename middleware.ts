import { NextRequest, NextResponse } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/account',
  '/account/orders',
  '/account/profile',
  '/wishlist',
  '/checkout',
];

// Define public routes that should redirect to home if user is authenticated
const authRoutes = ['/account/activate', '/reset-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get authentication token from cookies or headers
  const authToken =
    request.cookies.get('shopify-auth-token')?.value ||
    request.headers.get('Authorization')?.replace('Bearer ', '');

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if current path is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // If trying to access protected route without token
  if (isProtectedRoute && !authToken) {
    // Redirect to home page with a flag to show auth modal
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('auth', 'required');
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // If authenticated user tries to access auth routes, redirect to account
  if (isAuthRoute && authToken) {
    // Allow activation and reset password even if authenticated
    // as these might be needed for account management
    return NextResponse.next();
  }

  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
