import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Building, Clock, ExternalLink, User } from 'lucide-react';
import type { LinkedInCandidate } from '@/lib/linkedin-api';
import { formatTenure } from '@/lib/linkedin-api';

interface CandidateCardProps {
  candidate: LinkedInCandidate;
  onViewProfile?: (candidate: LinkedInCandidate) => void;
}

export function CandidateCard({ candidate, onViewProfile }: CandidateCardProps) {
  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(candidate);
    } else {
      window.open(candidate.navigationUrl, '_blank');
    }
  };

  return (
    <Card className="bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 transition-all duration-200 group">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            {candidate.profilePictureDisplayImage ? (
              <img
                src={candidate.profilePictureDisplayImage}
                alt={candidate.fullName}
                className="w-16 h-16 rounded-full object-cover border-2 border-slate-600"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center border-2 border-slate-600">
                <User className="w-8 h-8 text-slate-400" />
              </div>
            )}
          </div>

          {/* Candidate Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-white truncate">
                {candidate.fullName}
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleViewProfile}
                className="text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>

            {/* Current Position */}
            {candidate.currentPosition && (
              <div className="mb-3">
                <p className="text-blue-300 font-medium mb-1">
                  {candidate.currentPosition.title}
                </p>
                <div className="flex items-center text-slate-300 text-sm mb-1">
                  <Building className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="truncate">
                    {candidate.currentPosition.companyName}
                  </span>
                </div>
                {candidate.currentPosition.tenureAtPosition && (
                  <div className="flex items-center text-slate-400 text-sm">
                    <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span>{formatTenure(candidate.currentPosition.tenureAtPosition)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Location */}
            {candidate.geoRegion && (
              <div className="flex items-center text-slate-400 text-sm mb-3">
                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">{candidate.geoRegion}</span>
              </div>
            )}

            {/* Industry Badge */}
            {candidate.currentPosition?.companyUrnResolutionResult?.industry && (
              <div className="mb-3">
                <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 text-xs">
                  {candidate.currentPosition.companyUrnResolutionResult.industry}
                </Badge>
              </div>
            )}

            {/* Summary Preview */}
            {candidate.summary && (
              <p className="text-slate-300 text-sm line-clamp-2 leading-relaxed">
                {candidate.summary}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}