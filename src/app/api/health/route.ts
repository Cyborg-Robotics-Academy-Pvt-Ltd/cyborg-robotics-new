// Health check API endpoint
import { NextResponse } from 'next/server';
import { slugToCourseId, getCourseData } from '@/lib/courseData';

export async function GET() {
  try {
    // Test that we can access course data
    const slugs = Object.keys(slugToCourseId);
    const javaCourse = getCourseData('java');
    const hasJava = !!javaCourse;
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      courses: slugs.length,
      hasJavaCourse: hasJava,
      sampleSlug: slugs[0] || null
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}