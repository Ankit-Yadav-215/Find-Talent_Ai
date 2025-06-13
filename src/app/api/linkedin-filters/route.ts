import { NextRequest, NextResponse } from 'next/server';
import { getFilterSuggestions } from '@/lib/linkedin-api';

export async function POST(request: NextRequest) {
  try {
    const { query, filterType } = await request.json();

    if (!query || !filterType) {
      return NextResponse.json(
        { error: 'Query and filter type are required' },
        { status: 400 }
      );
    }

    const suggestions = await getFilterSuggestions(query, filterType);

    return NextResponse.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error('Filter suggestions error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch filter suggestions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}