import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Map old paths to new paths
const pathRedirects: Record<string, string> = {
  // Classroom courses redirects
  '/classroom-courses/bambino-coding': '/courses/bambino-coding',
  '/classroom-courses/early-simple-machines': '/courses/early-simple-machines',
  '/classroom-courses/3d-printing': '/courses/3d-printing',
  '/classroom-courses/robotics-ev3': '/courses/robotics-ev3',
  '/classroom-courses/animation-coding': '/courses/animation-coding',
  '/classroom-courses/simple-powered-machines': '/courses/simple-powered-machines',
  '/classroom-courses/spike-pneumatics': '/courses/spike-pneumatics',
  '/classroom-courses/spike-prime': '/courses/spike-prime',
  '/classroom-courses/iot': '/courses/iot',
  '/classroom-courses/arduino': '/courses/arduino',
  
  // Online courses redirects
  '/online-courses/bambino-coding': '/courses/bambino-coding',
  '/online-courses/animation-coding': '/courses/animation-coding',
  '/online-courses/app-designing': '/courses/app-designing',
  '/online-courses/web-designing': '/courses/web-designing',
  '/online-courses/python-language': '/courses/python-language',
  '/online-courses/java': '/courses/java',
  '/online-courses/artificial-intelligence': '/courses/artificial-intelligence',
  '/online-courses/machine-learning': '/courses/machine-learning',
  
  // Direct course ID mappings for consistency
  '/courses/python': '/courses/python-language',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the pathname matches any redirect
  if (pathRedirects[pathname]) {
    const redirectUrl = new URL(pathRedirects[pathname], request.url);
    return NextResponse.redirect(redirectUrl, 301); // 301 for permanent redirect
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/classroom-courses/:path*',
    '/online-courses/:path*',
    '/courses/python',
  ],
};