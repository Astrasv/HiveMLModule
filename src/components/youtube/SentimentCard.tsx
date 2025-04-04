
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleProgress } from './CircleProgress';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { MLModelResponse } from '@/types/youtube';

interface SentimentCardProps {
  analysis: MLModelResponse;
}

export const SentimentCard: React.FC<SentimentCardProps> = ({ analysis }) => {
  return (
    <Card className="youtube-card animate-slide-up overflow-hidden">
      <CardHeader className="youtube-gradient-blue px-6 py-4">
        <CardTitle className="text-white">Sentiment Analysis</CardTitle>
        <CardDescription className="text-blue-100">
          Distribution of comment sentiments
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CircleProgress 
            value={analysis.sentiment_percentages.positive} 
            color="stroke-green-500" 
            label="Positive" 
          />
          <CircleProgress 
            value={analysis.sentiment_percentages.neutral} 
            color="stroke-blue-400" 
            label="Neutral" 
          />
          <CircleProgress 
            value={analysis.sentiment_percentages.negative} 
            color="stroke-red-500" 
            label="Negative" 
          />
        </div>
        
        <div className="mt-8 space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-white flex items-center">
                <ThumbsUp className="h-4 w-4 mr-2 text-green-500" />
                Top Positive Comment
              </h3>
              <span className="text-xs py-1 px-3 rounded-full bg-green-900/40 text-green-400">
                Positive
              </span>
            </div>
            <p className="p-3 bg-youtube-mediumGray rounded-lg border border-youtube-hover text-gray-200">
              "{analysis.top_comments.top_positive}"
            </p>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-white flex items-center">
                <ThumbsDown className="h-4 w-4 mr-2 text-red-500" />
                Top Negative Comment
              </h3>
              <span className="text-xs py-1 px-3 rounded-full bg-red-900/40 text-red-400">
                Negative
              </span>
            </div>
            <p className="p-3 bg-youtube-mediumGray rounded-lg border border-youtube-hover text-gray-200">
              "{analysis.top_comments.top_negative}"
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
