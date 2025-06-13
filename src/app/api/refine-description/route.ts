import { NextRequest, NextResponse } from 'next/server';
import { getJobGenerator } from '@/lib/langchain-desc-generator';

export async function POST(request: NextRequest) {
  try {
    const { originalJob, refinementPrompt } = await request.json();

    if (!originalJob || !refinementPrompt) {
      return NextResponse.json(
        { error: 'Original job description and refinement prompt are required' },
        { status: 400 }
      );
    }

    // Initialize job generator with server-side API key
    const jobGenerator = getJobGenerator();

    // Refine job description using LangChain
    const refinedJobDescription = await jobGenerator.refineJobDescription(
      originalJob,
      refinementPrompt
    );

    return NextResponse.json({
      success: true,
      data: refinedJobDescription,
    });
  } catch (error) {
    console.error('Job refinement error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to refine job description',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}