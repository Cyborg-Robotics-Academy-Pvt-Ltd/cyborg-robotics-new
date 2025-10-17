import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of static routes that should be prioritized over dynamic routes
const staticRoutes = [
  '/about',
  '/contact-us',
  '/events',
  '/gallery',
  '/login',
  '/privacy-policy',
  '/terms-conditions',
  '/blogs',
  '/student-list',
  '/admin-dashboard',
  '/trainer-dashboard',
  '/student-dashboard',
  '/create-user',
  '/media',
  '/media-test',
  '/mouse-demo',
  '/mycomp',
  '/brevo-dashboard',
  '/robot-viewer'
];

// List of course-related static routes
const courseRoutes = [
  '/classroom-courses',
  '/online-courses'
];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check if the request is for a static route
  if (staticRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    // Allow static routes to be handled normally
    return NextResponse.next();
  }
  
  // Check if the request is for course routes
  if (courseRoutes.some(route => pathname.startsWith(route))) {
    // Allow course routes to be handled normally
    return NextResponse.next();
  }
  
  // For other routes, let Next.js handle them normally
  return NextResponse.next();
}

// Configure which paths the middleware should run on
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