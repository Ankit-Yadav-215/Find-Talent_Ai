'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function JobBuilder() {
  const [jobRequirements, setJobRequirements] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleContinue = async () => {
    if (!jobRequirements.trim()) {
      setError('Please enter job requirements');
      return;
    }
    
    setIsGenerating(true);
    setError('');
    
    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: jobRequirements,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate job description');
      }

      if (result.success) {
        // Store the generated job data in localStorage
        localStorage.setItem('generatedJobData', JSON.stringify(result.data));
        localStorage.setItem('jobRequirements', jobRequirements);
        
        router.push('/description-review');
      } else {
        throw new Error(result.error || 'Failed to generate job description');
      }
    } catch (error) {
      console.error('Error generating job description:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate job description');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold font-encode-sans gradient-text">TalentAI</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-20">
        

        {/* Job Requirements Form */}
        <div className="glass-strong rounded-3xl p-12 max-w-2xl mx-auto">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold font-encode-sans mb-6 text-center">
                Describe your Job Requirements
              </h2>
              
              <Textarea
                placeholder="Founding Frontend Engineer with 3+ years of experience, with TypeScript, React, and Next.js. Looking for someone who can work in a fast-paced startup environment..."
                value={jobRequirements}
                onChange={(e) => setJobRequirements(e.target.value)}
                className="min-h-32 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 text-lg resize-none"
              />
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleContinue}
              disabled={!jobRequirements.trim() || isGenerating}
              size="lg"
              className="w-full py-6 text-lg font-encode-sans font-semibold bg-white text-black"
            >
              {isGenerating ? (
                <span className="flex items-center space-x-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating with AI...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-3">
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Job Description</span>
                </span>
              )}
            </Button>

          
          </div>
        </div>
      </main>
    </div>
  );
}