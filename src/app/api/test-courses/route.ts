// API route to test course data accessibility
import { NextResponse } from 'next/server';
import { slugToCourseId, getAllCourseIds } from '@/lib/courseData';

export async function GET() {
  try {
    const slugs = Object.keys(slugToCourseId);
    const courseIds = getAllCourseIds();
    
    return NextResponse.json({
      success: true,
      slugs,
      courseIds,
      mapping: slugToCourseId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in test-courses API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}