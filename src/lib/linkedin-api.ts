// LinkedIn Sales Navigator API integration
export interface FilterSuggestion {
  id: string;
  displayValue: string;
  headline: string;
}

export interface AppliedFilter {
  id: string;
  displayValue: string;
  type: string;
  selectionType: 'INCLUDED' | 'EXCLUDED';
  selectedSubFilter?: number;
}

export interface LinkedInCandidate {
  firstName: string;
  lastName: string;
  fullName: string;
  geoRegion: string;
  currentPosition?: {
    title: string;
    companyName: string;
    tenureAtPosition?: {
      numYears?: number;
      numMonths?: number;
    };
    companyUrnResolutionResult?: {
      name: string;
      industry?: string;
      location?: string;
    };
  };
  profilePictureDisplayImage?: string;
  summary?: string;
  profileUrn: string;
  navigationUrl: string;
}

export interface SearchResponse {
  success: boolean;
  status: number;
  response: {
    data: LinkedInCandidate[];
    pagination: {
      total: number;
      count: number;
      start: number;
    };
  };
}

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY as string;
const RAPIDAPI_HOST = 'linkedin-sales-navigator-no-cookies-required.p.rapidapi.com';

const headers = {
  'Content-Type': 'application/json',
  'x-rapidapi-host': RAPIDAPI_HOST,
  'x-rapidapi-key': RAPIDAPI_KEY,
};

// Filter type mappings for API endpoints
const FILTER_ENDPOINTS: Record<string, string> = {
  'job-title': 'filter_job_title_suggestions',
  'company': 'filter_company_suggestions',
  'location': 'filter_geography_location_postal_code_suggestions',
  'experience': 'filter_seniority_level',
  'school': 'filter_school_suggestions',
};

// Filter type mappings for search filters
const SEARCH_FILTER_TYPES: Record<string, string> = {
  'job-title': 'CURRENT_TITLE',
  'company': 'CURRENT_COMPANY',
  'location': 'POSTAL_CODE',
  'experience': 'SENIORITY_LEVEL',
  'school': 'SCHOOL',
};

export async function getFilterSuggestions(
  query: string,
  filterType: string
): Promise<FilterSuggestion[]> {
  try {
    const endpoint = FILTER_ENDPOINTS[filterType];
    if (!endpoint) {
      throw new Error(`Unsupported filter type: ${filterType}`);
    }

    const response = await fetch(
      `https://${RAPIDAPI_HOST}/${endpoint}`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ query }),
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching filter suggestions:', error);
    throw error;
  }
}

export async function searchCandidates(
  filters: AppliedFilter[],
  page: number = 1,
  accountNumber: number = 1
): Promise<SearchResponse> {
  try {
    // Convert applied filters to API format
    const apiFilters = filters.map(filter => ({
      type: SEARCH_FILTER_TYPES[filter.type] || filter.type,
      values: [{
        id: filter.id,
        text: filter.displayValue,
        selectionType: filter.selectionType,
      }],
      selectedSubFilter: filter.selectedSubFilter || 50,
    }));

    const response = await fetch(
      `https://${RAPIDAPI_HOST}/premium_search_person`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          account_number: accountNumber,
          page,
          filters: apiFilters,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Search request failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching candidates:', error);
    throw error;
  }
}

// Helper function to format tenure display
export function formatTenure(tenure?: { numYears?: number; numMonths?: number }): string {
  if (!tenure) return '';
  
  const years = tenure.numYears || 0;
  const months = tenure.numMonths || 0;
  
  if (years === 0 && months === 0) return '';
  if (years === 0) return `${months} month${months !== 1 ? 's' : ''}`;
  if (months === 0) return `${years} year${years !== 1 ? 's' : ''}`;
  
  return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
}