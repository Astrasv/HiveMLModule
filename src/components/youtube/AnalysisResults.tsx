
import React from 'react';
import { MLModelResponse } from '@/types/youtube';
import { SentimentCard } from './SentimentCard';
import { SummaryCard } from './SummaryCard';
import { ThemesCard } from './ThemesCard';
import { LengthAnalysisCard } from './LengthAnalysisCard';
import { SuggestionsCard } from './SuggestionsCard';

interface AnalysisResultsProps {
  analysis: MLModelResponse;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysis }) => {
  if (!analysis) return null;
  
  return (
    <div className="space-y-6">
      <SentimentCard analysis={analysis} />
      <SummaryCard analysis={analysis} />
      <ThemesCard analysis={analysis} />
      <LengthAnalysisCard analysis={analysis} />
      <SuggestionsCard analysis={analysis} />
    </div>
  );
};
