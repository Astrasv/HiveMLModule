
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MLModelResponse } from '@/types/youtube';

interface SummaryCardProps {
  analysis: MLModelResponse;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ analysis }) => {
  return (
    <Card className="youtube-card animate-slide-up">
      <CardHeader className="youtube-gradient-purple px-6 py-4">
        <CardTitle className="text-white">Comment Summary</CardTitle>
        <CardDescription className="text-purple-100">
          AI-generated summary of comment trends
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <p className="text-gray-200 leading-relaxed">{analysis.summary}</p>
      </CardContent>
    </Card>
  );
};
