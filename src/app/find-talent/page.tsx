'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CandidateCard } from '@/components/ui/candidateCard';
import { 
  Search, 
  X, 
  Filter, 
  Users, 
  MapPin, 
  Building, 
  Briefcase, 
  Star, 
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Bot,
} from 'lucide-react';
import Link from 'next/link';
// import { useSearchParams } from 'next/navigation';
import type { FilterSuggestion, AppliedFilter, LinkedInCandidate, SearchResponse } from '@/lib/linkedin-api';



export default function LinkedInFilters() {
  // const searchParams = useSearchParams();
  // const isAgenticMode = searchParams.get('agentic') === 'true';
  const isAgenticMode = false; // Set to true if you want to enable agentic mode
  
  const [activeFilterType, setActiveFilterType] = useState('job-title');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<FilterSuggestion[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilter[]>([]);
  const [candidates, setCandidates] = useState<LinkedInCandidate[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  // const [agenticResults, setAgenticResults] = useState<AgenticSearchResults | null>(null);

  const filterTypes = [
    { id: 'job-title', label: 'Current Title', icon: Briefcase },
    { id: 'company', label: 'Company', icon: Building },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'experience', label: 'Seniority Level', icon: Star },
    { id: 'school', label: 'School', icon: Briefcase },
  ];

  // Load agentic search results if in agentic mode


  // Debounced search for suggestions
  const debouncedSearch = useCallback(
    debounce(async (query: string, filterType: string) => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      setIsLoadingSuggestions(true);
      setError('');

      try {
        const response = await fetch('/api/linkedin-filters', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: query.trim(),
            filterType,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch suggestions');
        }

        setSuggestions(result.data || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch suggestions');
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (!isAgenticMode) {
      debouncedSearch(searchQuery, activeFilterType);
    }
  }, [searchQuery, activeFilterType, debouncedSearch, isAgenticMode]);

  const addFilter = (suggestion: FilterSuggestion, selectionType: 'INCLUDED' | 'EXCLUDED') => {
    const newFilter: AppliedFilter = {
      id: suggestion.id,
      displayValue: suggestion.displayValue,
      type: activeFilterType,
      selectionType,
      selectedSubFilter: 50, // Default value
    };
    
    setAppliedFilters(prev => [...prev, newFilter]);
    setSearchQuery('');
    setSuggestions([]);
  };

  const removeFilter = (filterId: string) => {
    setAppliedFilters(prev => prev.filter(filter => filter.id !== filterId));
  };

  const clearAllFilters = () => {
    setAppliedFilters([]);
    setCandidates([]);
    setSearchResults(null);
    setCurrentPage(1);
    // setAgenticResults(null);
  };

  const searchCandidates = async (page: number = 1) => {
    if (appliedFilters.length === 0) {
      setError('Please add at least one filter to search candidates');
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      const response = await fetch('/api/linkedin-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: appliedFilters,
          page,
          accountNumber: 1,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to search candidates');
      }

      setSearchResults(result.data);
      setCandidates(result.data.response.data || []);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error searching candidates:', error);
      setError(error instanceof Error ? error.message : 'Failed to search candidates');
      setCandidates([]);
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    searchCandidates(newPage);
  };

  // const getFilterIcon = (type: string) => {
  //   const filterType = filterTypes.find(ft => ft.id === type);
  //   return filterType ? filterType.icon : Filter;
  // };

  const totalPages = searchResults ? Math.ceil(searchResults.response.pagination.total / 25) : 0;
  const candidatesFound = searchResults?.response.pagination.total || 0;

  return (
    <div className="container mx-auto p-4 min-h-screen">
     

      <div className="max-w-7xl mx-auto p-6">
        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <div className="glass-card grid grid-cols-1 lg:grid-cols-3 gap-3 rounded-2xl h-160">
          {/* Left Sidebar - Filters */}
          <div className=" lg:col-span-1 space-y-6 p-6">
            <h1 className="text-2xl font-bold font-encode-sans text-white">
            Add Candidates from LinkedIn
          </h1>
            {/* Filter Controls */}
            <Card className="glass shadow-inner ">
              <CardContent className="p-6">
                <div className="flex justify-between space-x-4 mb-6">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={clearAllFilters}
                    className="border-slate-600 text-slate-300 hover:text-white"
                  >
                    Reset
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => searchCandidates(1)}
                    disabled={appliedFilters.length === 0 || isSearching}
                    // className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      'Apply Filters'
                    )}
                  </Button>
                </div>

                {/* Filter Type Selection - Only show in manual mode */}
                {!isAgenticMode && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-300">Add Filters</span>
                      <Select value={activeFilterType} onValueChange={setActiveFilterType}>
                        <SelectTrigger className="w-48 bg-slate-700/50 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {filterTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              <div className="flex items-center space-x-2">
                                <type.icon className="w-4 h-4" />
                                <span>{type.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder={`Search ${filterTypes.find(f => f.id === activeFilterType)?.label.toLowerCase()}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>

                    {/* Loading State */}
                    {isLoadingSuggestions && (
                      <div className="text-center py-4">
                        <Loader2 className="w-6 h-6 border-blue-500 animate-spin mx-auto" />
                        <p className="text-slate-400 text-sm mt-2">Loading suggestions...</p>
                      </div>
                    )}

                    {/* Suggestions */}
                    {suggestions.length > 0 && !isLoadingSuggestions && (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {suggestions.map((suggestion) => (
                          <div key={suggestion.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-slate-200 block truncate">
                                {suggestion.displayValue}
                              </span>
                              {suggestion.headline && suggestion.headline !== suggestion.displayValue && (
                                <span className="text-xs text-slate-400 block truncate">
                                  {suggestion.headline}
                                </span>
                              )}
                            </div>
                            <div className="flex space-x-2 ml-3">
                              <Button
                                size="sm"
                                onClick={() => addFilter(suggestion, 'INCLUDED')}
                                className="bg-green-600/20 text-green-400 hover:bg-green-600/30 text-xs px-3 py-1"
                              >
                                Include
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => addFilter(suggestion, 'EXCLUDED')}
                                className="bg-red-600/20 text-red-400 hover:bg-red-600/30 text-xs px-3 py-1"
                              >
                                Exclude
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* No suggestions message */}
                    {searchQuery.trim() && suggestions.length === 0 && !isLoadingSuggestions && (
                      <div className="text-center py-4">
                        <p className="text-slate-400 text-sm">No suggestions found for {searchQuery}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Applied Filters by Category */}
                {appliedFilters.length > 0 && (
                  <div className="space-y-6 mt-8">
                    <h3 className="text-sm font-medium text-slate-300 border-b border-slate-700 pb-2">
                      {isAgenticMode ? 'AI Applied Filters' : 'Applied Filters'} ({appliedFilters.length})
                    </h3>
                    {filterTypes.map((filterType) => {
                      const filtersForType = appliedFilters.filter(f => f.type === filterType.id);
                      if (filtersForType.length === 0) return null;

                      return (
                        <div key={filterType.id} className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <filterType.icon className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-300">{filterType.label}</span>
                            {!isAgenticMode && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setAppliedFilters(prev => prev.filter(f => f.type !== filterType.id))}
                                className="p-1 h-6 w-6 text-slate-400 hover:text-red-400"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                          <div className="space-y-2 pl-6">
                            {filtersForType.map((filter) => (
                              <div key={filter.id} className="flex items-center justify-between">
                                <span className="text-sm text-slate-200 flex-1 truncate">
                                  {filter.displayValue}
                                </span>
                                <div className="flex items-center space-x-2 ml-2">
                                  <Badge
                                    variant={filter.selectionType === 'INCLUDED' ? 'default' : 'destructive'}
                                    className={`text-xs ${
                                      filter.selectionType === 'INCLUDED' 
                                        ? 'bg-green-600/20 text-green-400' 
                                        : 'bg-red-600/20 text-red-400'
                                    }`}
                                  >
                                    {filter.selectionType === 'INCLUDED' ? 'Include' : 'Exclude'}
                                  </Badge>
                                  {!isAgenticMode && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => removeFilter(filter.id)}
                                      className="p-1 h-6 w-6 text-slate-400 hover:text-red-400"
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Results */}
          <div className="lg:col-span-2 space-y-6 overflow-auto ">
             <Link href="/">
             <div className='flex justify-end mb-4'>

            <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white justify-end">
              Done
            </Button>
             </div>
          </Link>
            {/* Results Count and Pagination */}
            {searchResults && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-lg font-semibold text-white">
                    {candidatesFound.toLocaleString()} Profiles Found
                  </span>
                  {isAgenticMode && (
                    <Badge className="bg-purple-600/20 text-purple-300">
                      <Bot className="w-3 h-3 mr-1" />
                      AI Optimized
                    </Badge>
                  )}
                </div>
                {totalPages > 1 && !isAgenticMode && (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-400">Page</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || isSearching}
                        className="border-slate-600 text-slate-400 hover:text-white"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-white px-3 py-1 bg-blue-600 rounded">
                        {currentPage}
                      </span>
                      <span className="text-slate-400">of {totalPages}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || isSearching}
                        className="border-slate-600 text-slate-400 hover:text-white"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <span className="text-sm text-slate-400">25 per page</span>
                  </div>
                )}
              </div>
            )}

            {/* Results Grid */}
            {candidates.length > 0 ? (
              <div className="space-y-4">
                {candidates.map((candidate, index) => (
                  <CandidateCard
                    key={`${candidate.profileUrn}-${index}`}
                    candidate={candidate}
                  />
                ))}
              </div>
            ) : appliedFilters.length > 0 && !isSearching ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-300 mb-2">No candidates found</h3>
                <p className="text-slate-400">Try adjusting your filters or search criteria</p>
              </div>
            ) : !isAgenticMode ? (
              <div className="text-center py-12">
                <Filter className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-300 mb-2">Add filters to search</h3>
                <p className="text-slate-400">Select filter types and add criteria to find candidates</p>
              </div>
            ) : null}

            {/* Loading State */}
            {isSearching && (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-300 mb-2">Searching candidates...</h3>
                <p className="text-slate-400">Please wait while we find matching profiles</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility function for debouncing
function debounce<Args extends unknown[], Return>(
  func: (...args: Args) => Return,
  wait: number
): (...args: Args) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}