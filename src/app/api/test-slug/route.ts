// API route to test slug mapping
import { NextResponse } from 'next/server';
import { slugToCourseId } from '@/lib/courseData';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || '';
  
  try {
    const mapping = slugToCourseId;
    const courseId = mapping[slug];
    
    return NextResponse.json({
      success: true,
      slug,
      courseId,
      hasSlug: mapping.hasOwnProperty(slug),
      mapping: Object.keys(mapping)
    });
  } catch (error) {
    console.error('Error in test-slug API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}