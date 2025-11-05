// API route to test curriculum data accessibility
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Dynamically import curriculum data
    const curriculumModule = await import('@/utils/curriculum.ts');
    
    // Get some sample data
    const javaCurriculum = curriculumModule.javaCurriculum;
    const pythonCurriculum = curriculumModule.pythonCourseData;
    
    return NextResponse.json({
      success: true,
      javaLevels: javaCurriculum?.length || 0,
      pythonLevels: pythonCurriculum?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in test-curriculum API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}