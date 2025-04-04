
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MLModelResponse } from '@/types/youtube';

interface LengthAnalysisCardProps {
  analysis: MLModelResponse;
}

export const LengthAnalysisCard: React.FC<LengthAnalysisCardProps> = ({ analysis }) => {
  return (
    <Card className="youtube-card animate-slide-up">
      <CardHeader className="youtube-gradient-green px-6 py-4">
        <CardTitle className="text-white">Comment Length Analysis</CardTitle>
        <CardDescription className="text-green-100">
          Average word count by sentiment
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-youtube-mediumGray p-4 rounded-lg border border-youtube-hover text-center">
            <p className="text-sm text-gray-300 mb-1">Overall Average</p>
            <p className="text-2xl font-bold text-white">{analysis.length_analysis.avg_length.toFixed(1)}</p>
            <p className="text-xs text-youtube-lightGray">words per comment</p>
          </div>
          
          <div className="bg-green-900/30 p-4 rounded-lg border border-green-900/50 text-center">
            <p className="text-sm text-green-300 mb-1">Positive Comments</p>
            <p className="text-2xl font-bold text-green-400">{analysis.length_analysis.positive_avg.toFixed(1)}</p>
            <p className="text-xs text-green-500/70">words per comment</p>
          </div>
          
          <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-900/50 text-center">
            <p className="text-sm text-blue-300 mb-1">Neutral Comments</p>
            <p className="text-2xl font-bold text-blue-400">{analysis.length_analysis.neutral_avg.toFixed(1)}</p>
            <p className="text-xs text-blue-500/70">words per comment</p>
          </div>
          
          <div className="bg-red-900/30 p-4 rounded-lg border border-red-900/50 text-center">
            <p className="text-sm text-red-300 mb-1">Negative Comments</p>
            <p className="text-2xl font-bold text-red-400">{analysis.length_analysis.negative_avg.toFixed(1)}</p>
            <p className="text-xs text-red-500/70">words per comment</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
