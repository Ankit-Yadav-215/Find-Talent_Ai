import { NextRequest, NextResponse } from 'next/server';
import { getJobGenerator } from '@/lib/langchain-desc-generator';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Job requirements prompt is required' },
        { status: 400 }
      );
    }

    // Initialize job generator with server-side API key
    const jobGenerator = getJobGenerator();

    // Generate job description using LangChain
    const jobDescription = await jobGenerator.generateJobDescription(prompt);

    return NextResponse.json({
      success: true,
      data: jobDescription,
    });
  } catch (error) {
    console.error('Job generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate job description',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}