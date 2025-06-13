'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Sparkles, Minus, Plus, X, Send, Loader2, AlertCircle,Bot } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { JobDescriptionOutput } from '@/lib/langchain-desc-generator';

interface JobData {
  jobRole: string;
  positions: number;
  workType: string;
  experienceMin: number;
  experienceMax: number;
  salaryMin: string;
  salaryMax: string;
  currency: string;
  isPublic: boolean;
  location: string;
  isRemote: boolean;
  closingDate: string;
  skillsTags: string[];
  searchTags: string[];
  jobDescription: string;
  maxNoticePeriod: string;
}

export default function JobReview() {
  const router = useRouter();
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [generatedData, setGeneratedData] = useState<JobDescriptionOutput | null>(null);
  const [newSkillTag, setNewSkillTag] = useState('');
  const [newSearchTag, setNewSearchTag] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [isAgenticSearching, setIsAgenticSearching] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedRequirements = localStorage.getItem('jobRequirements');
    const savedGeneratedData = localStorage.getItem('generatedJobData');
    
    if (!savedRequirements) {
      router.push('/description-generator');
      return;
    }

    if (savedGeneratedData) {
      try {
        const generated: JobDescriptionOutput = JSON.parse(savedGeneratedData);
        setGeneratedData(generated);
        
        // Convert generated data to job data format
        const convertedJobData: JobData = {
          jobRole: generated.jobTitle,
          positions: 1,
          workType: generated.workType,
          experienceMin: extractExperienceNumber(generated.experienceLevel),
          experienceMax: extractExperienceNumber(generated.experienceLevel),
          salaryMin: generated.salaryRange?.min || '40,00,000',
          salaryMax: generated.salaryRange?.max || '60,00,000',
          currency: generated.salaryRange?.currency || 'INR',
          isPublic: true,
          location: generated.location,
          isRemote: generated.location.toLowerCase().includes('remote'),
          closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          skillsTags: generated.skillsTags,
          searchTags: [],
          jobDescription: generated.jobDescription,
          maxNoticePeriod: 'Immediate'
        };
        
        setJobData(convertedJobData);
      } catch (error) {
        console.error('Error parsing generated job data:', error);
        setError('Failed to load generated job data');
      }
    }
    
    setIsLoading(false);
  }, [router]);

  const extractExperienceNumber = (experienceLevel: string): number => {
    const match = experienceLevel.match(/(\d+)/);
    return match ? parseInt(match[1]) : 3;
  };

  const handleRefineJob = async () => {
    if (!editPrompt.trim() || !generatedData) return;
    
    setIsRefining(true);
    setError('');
    
    try {
      const response = await fetch('/api/refine-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalJob: generatedData,
          refinementPrompt: editPrompt,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to refine job description');
      }

      if (result.success) {
        const refined: JobDescriptionOutput = result.data;
        setGeneratedData(refined);
        
        // Update job data with refined information
        setJobData(prev => prev ? {
          ...prev,
          jobRole: refined.jobTitle,
          workType: refined.workType,
          location: refined.location,
          skillsTags: refined.skillsTags,
          jobDescription: refined.jobDescription,
          isRemote: refined.location.toLowerCase().includes('remote'),
        } : null);
        
        // Save updated data
        localStorage.setItem('generatedJobData', JSON.stringify(refined));
        setEditPrompt('');
      }
    } catch (error) {
      console.error('Error refining job description:', error);
      setError(error instanceof Error ? error.message : 'Failed to refine job description');
    } finally {
      setIsRefining(false);
    }
  };

  const handleAgenticSearch = async () => {
    if (!generatedData) return;
    
    setIsAgenticSearching(true);
    setError('');
    
    try {
      const response = await fetch('/api/agentic-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription: generatedData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Agentic search failed');
      }

      if (result.success) {
        // Store the search results and filters
        localStorage.setItem('agenticSearchResults', JSON.stringify(result.data));
        
        // Redirect to find-talent page with agentic results
        router.push('/find-talent?agentic=true');
      } else {
        throw new Error(result.error || 'Agentic search failed');
      }
    } catch (error) {
      console.error('Error in agentic search:', error);
      setError(error instanceof Error ? error.message : 'Agentic search failed');
    } finally {
      setIsAgenticSearching(false);
    }
  };

  const addSkillTag = () => {
    if (newSkillTag.trim() && jobData && !jobData.skillsTags.includes(newSkillTag.trim())) {
      setJobData(prev => prev ? ({
        ...prev,
        skillsTags: [...prev.skillsTags, newSkillTag.trim()]
      }) : null);
      setNewSkillTag('');
    }
  };

  const removeSkillTag = (tag: string) => {
    setJobData(prev => prev ? ({
      ...prev,
      skillsTags: prev.skillsTags.filter(t => t !== tag)
    }) : null);
  };

  const addSearchTag = () => {
    if (newSearchTag.trim() && jobData && !jobData.searchTags.includes(newSearchTag.trim())) {
      setJobData(prev => prev ? ({
        ...prev,
        searchTags: [...prev.searchTags, newSearchTag.trim()]
      }) : null);
      setNewSearchTag('');
    }
  };

  const removeSearchTag = (tag: string) => {
    setJobData(prev => prev ? ({
      ...prev,
      searchTags: prev.searchTags.filter(t => t !== tag)
    }) : null);
  };

  const handleSubmit = () => {
    if (jobData) {
      localStorage.setItem('jobData', JSON.stringify(jobData));
      router.push('/find-talent');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading job description...</span>
        </div>
      </div>
    );
  }

  if (!jobData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-bold mb-2">Failed to Load Job Data</h2>
          <p className="text-slate-300 mb-4">There was an error loading the generated job description.</p>
          <Link href="/description-generator">
            <Button>Go Back to Job Generator</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 min-h-screen">
      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/description-generator" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
           
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleSubmit}
              // className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-encode-sans font-semibold px-6"
            >
              Manual Search
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-20 glass">
        <div className="">
          <h1 className="text-3xl font-bold font-encode-sans mb-2 flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-blue-400" />
            <span>Review AI-Generated Job Description</span>
          </h1>
          
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Job Description */}
          <div className="space-y-6 glass-container rounded-2xl p-6 shadow-inner">
            <div className="glass shadow-inner rounded-2xl p-8 h-100 overflow-auto">
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-slate-200 leading-relaxed font-nunito">
                  {jobData.jobDescription}
                </pre>
              </div>
            </div>

            {/* Edit Prompt */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-5 h-5 text-white" />
                <Input
                  placeholder="Ask AI to refine the job description (e.g., 'Make it more startup-focused' or 'Add remote work benefits')"
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isRefining && handleRefineJob()}
                  className="glass-input"
                  disabled={isRefining}
                />
                <Button 
                  size="sm" 
                  onClick={handleRefineJob}
                  disabled={!editPrompt.trim() || isRefining}
                  // className="bg-blue-600 hover:bg-blue-700"
                >
                  {isRefining ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
             
            </div>
          </div>

          {/* Right Panel - Job Details Form */}
          <div className="space-y-6">
            {/* Job Role & Positions */}
            <div className="glass-strong rounded-2xl p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Job Role</Label>
                  <Input
                    value={jobData.jobRole}
                    onChange={(e) => setJobData(prev => prev ? ({ ...prev, jobRole: e.target.value }) : null)}
                    className="glass-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Positions</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setJobData(prev => prev ? ({ ...prev, positions: Math.max(1, prev.positions - 1) }) : null)}
                      className="p-2"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      value={jobData.positions}
                      onChange={(e) => setJobData(prev => prev ? ({ ...prev, positions: parseInt(e.target.value) || 1 }) : null)}
                      className="glass-input w-16"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setJobData(prev => prev ? ({ ...prev, positions: prev.positions + 1 }) : null)}
                      className="p-2"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Work Type & Experience */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Work Type</Label>
                  <div className="flex space-x-2">
                    {['Full-time', 'Internship', 'Contract'].map((type) => (
                      <Button
                        key={type}
                        size="sm"
                        variant={jobData.workType === type ? "default" : "outline"}
                        onClick={() => setJobData(prev => prev ? ({ ...prev, workType: type }) : null)}
                        className="text-xs"
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Years of Experience</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={jobData.experienceMin}
                      onChange={(e) => setJobData(prev => prev ? ({ ...prev, experienceMin: parseInt(e.target.value) || 0 }) : null)}
                      className="glass-input w-16 text-center"
                    />
                    <span className="text-sm text-slate-400">to</span>
                    <Input
                      type="number"
                      value={jobData.experienceMax}
                      onChange={(e) => setJobData(prev => prev ? ({ ...prev, experienceMax: parseInt(e.target.value) || 0 }) : null)}
                      className="glass-input w-16 text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Salary */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Annual Salary Range</Label>
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm">Public</Label>
                    <Switch
                      checked={jobData.isPublic}
                      onCheckedChange={(checked) => setJobData(prev => prev ? ({ ...prev, isPublic: checked }) : null)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Select value={jobData.currency} onValueChange={(value) => setJobData(prev => prev ? ({ ...prev, currency: value }) : null)}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Min Value"
                    value={jobData.salaryMin}
                    onChange={(e) => setJobData(prev => prev ? ({ ...prev, salaryMin: e.target.value }) : null)}
                    className="glass-input"
                  />
                  <Input
                    placeholder="Max Value"
                    value={jobData.salaryMax}
                    onChange={(e) => setJobData(prev => prev ? ({ ...prev, salaryMax: e.target.value }) : null)}
                    className="glass-input"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Job Location</Label>
                  <Input
                    value={jobData.location}
                    onChange={(e) => setJobData(prev => prev ? ({ ...prev, location: e.target.value }) : null)}
                    className="glass-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Max Notice Period</Label>
                  <Input
                    value={jobData.maxNoticePeriod}
                    onChange={(e) => setJobData(prev => prev ? ({ ...prev, maxNoticePeriod: e.target.value }) : null)}
                    className="glass-input"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Label className="text-sm">Remote</Label>
                <Switch
                  checked={jobData.isRemote}
                  onCheckedChange={(checked) => setJobData(prev => prev ? ({ ...prev, isRemote: checked }) : null)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Date of Closing Application</Label>
                <Input
                  type="date"
                  value={jobData.closingDate}
                  onChange={(e) => setJobData(prev => prev ? ({ ...prev, closingDate: e.target.value }) : null)}
                  className="glass-input"
                />
              </div>
            </div>

            {/* Skills & Search Tags */}
            <div className="glass-strong rounded-2xl p-6 space-y-6">
              <div className="space-y-4">
                <Label className="text-sm font-medium">Skills Tags (AI Generated)</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {jobData.skillsTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-blue-600/20 text-blue-300">
                      {tag}
                      <button
                        onClick={() => removeSkillTag(tag)}
                        className="ml-2 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add custom skill"
                    value={newSkillTag}
                    onChange={(e) => setNewSkillTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkillTag()}
                    className="glass-input"
                  />
                  <Button onClick={addSkillTag} size="sm">Add</Button>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium">Search Tags (optional)</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {jobData.searchTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-purple-600/20 text-purple-300">
                      {tag}
                      <button
                        onClick={() => removeSearchTag(tag)}
                        className="ml-2 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Eg. ReqID, HM Name, etc."
                    value={newSearchTag}
                    onChange={(e) => setNewSearchTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSearchTag()}
                    className="glass-input"
                  />
                  <Button onClick={addSearchTag} size="sm">Add</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}