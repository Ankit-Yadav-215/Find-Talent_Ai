'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Users, Zap, Target } from 'lucide-react';
// import Link from 'next/link';
import {useRouter} from 'next/navigation';

export default function Home() {
const [isHoveredFindTalent, setIsHoveredFindTalent] = useState(false);
const [isHoveredDescription, setIsHoveredDescription] = useState(false);
const router = useRouter();

  return (
    <div className="container mx-auto p-4 min-h-screen">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold font-encode-sans gradient-text">TalentAI</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-slate-300 hover:text-white transition-colors">How it Works</a>
            <a href="#pricing" className="text-slate-300 hover:text-white transition-colors">Pricing</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold font-encode-sans leading-tight">
              Find Perfect <span className="gradient-text">Talent</span>
              <br />
              with AI Power
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Generate intelligent job descriptions and discover the ideal candidates on LinkedIn with our AI-powered recruitment platform.
            </p>
          </div>

          {/* CTA Button */}
          
          <div className="flex pt-8 gap-x-6 justify-center">
            
            <div>

              <Button
                size="lg"
                onMouseEnter={() => setIsHoveredFindTalent(true)}
                onMouseLeave={() => setIsHoveredFindTalent(false)}
                onClick={() => router.push("/find-talent")}
                >
                <span className="flex items-center space-x-3">
                  <Sparkles className={`w-6 h-6 transition-transform duration-300 `} />
                  <span>Find Talent Now</span>
                  <ArrowRight className={`w-6 h-6 transition-transform duration-300 ${isHoveredFindTalent ? 'translate-x-2' : ''}`} />
                </span>
              </Button>
                </div>
          
          <div>
            
              <Button
                size="lg"
                  onMouseEnter={() => setIsHoveredDescription(true)}
                  onMouseLeave={() => setIsHoveredDescription(false)}
                  onClick={() => router.push("/description-generator")}
              >
                <span className="flex items-center space-x-3">
                  <Sparkles className={`w-6 h-6 transition-transform duration-300 ${isHoveredDescription ? 'rotate-12 scale-110' : ''}`} />
                  <span>Description Generator</span>
                  <ArrowRight className={`w-6 h-6 transition-transform duration-300 ${isHoveredDescription ? 'translate-x-2' : ''}`} />
                </span>
              </Button>
            
          </div>
         </div>
        </div>
      </main>

      
    </div>
  );
}