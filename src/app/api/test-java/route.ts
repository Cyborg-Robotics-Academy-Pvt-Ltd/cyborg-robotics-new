// Test API endpoint specifically for Java course
import { NextResponse } from 'next/server';
import { slugToCourseId, getCourseData, getCurriculumByCourseId } from '@/lib/courseData';

export async function GET() {
  try {
    // Check if 'java' slug exists
    const hasJavaSlug = slugToCourseId.hasOwnProperty('java');
    const courseId = slugToCourseId['java'];
    
    // Try to get course data
    const courseData = getCourseData('java');
    const hasCourseData = !!courseData;
    
    // Try to get curriculum data
    let curriculumData = null;
    let curriculumError = null;
    try {
      curriculumData = await getCurriculumByCourseId('java');
    } catch (err) {
      curriculumError = err instanceof Error ? err.message : 'Unknown error';
    }
    
    return NextResponse.json({
      success: true,
      hasJavaSlug,
      courseId,
      hasCourseData,
      curriculumLevels: curriculumData?.length || 0,
      curriculumError,
      slugMapping: slugToCourseId
    });
  } catch (error) {
    console.error('Java test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}