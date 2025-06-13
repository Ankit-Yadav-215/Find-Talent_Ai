import { NextRequest, NextResponse } from 'next/server';
import { searchCandidates } from '@/lib/linkedin-api';

export async function POST(request: NextRequest) {
  try {
    const { filters, page = 1, accountNumber = 1 } = await request.json();

    if (!filters || !Array.isArray(filters)) {
      return NextResponse.json(
        { error: 'Filters array is required' },
        { status: 400 }
      );
    }

    const searchResults = await searchCandidates(filters, page, accountNumber);

    return NextResponse.json({
      success: true,
      data: searchResults,
    });
  } catch (error) {
    console.error('Candidate search error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to search candidates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}