
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { MLModelResponse } from '@/types/youtube';

interface SuggestionsCardProps {
  analysis: MLModelResponse;
}

export const SuggestionsCard: React.FC<SuggestionsCardProps> = ({ analysis }) => {
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true);

  return (
    <Card className="youtube-card animate-slide-up">
      <CardHeader 
        className="youtube-gradient-teal px-6 py-4 cursor-pointer"
        onClick={() => setShowSuggestions(!showSuggestions)}
      >
        <div className="flex justify-between items-center">
          <CardTitle className="text-white">Improvement Suggestions</CardTitle>
          {showSuggestions ? 
            <ChevronUp className="h-5 w-5 text-white" /> : 
            <ChevronDown className="h-5 w-5 text-white" />
          }
        </div>
        <CardDescription className="text-teal-100">
          Areas for improvement based on comments
        </CardDescription>
      </CardHeader>
      
      {showSuggestions && (
        <CardContent className="p-6 animate-slide-up">
          {analysis.suggestions && analysis.suggestions.length > 0 ? (
            <ul className="space-y-2">
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-teal-900/50 flex items-center justify-center mr-2">
                    <span className="text-teal-400 text-sm">{index + 1}</span>
                  </span>
                  <span className="text-gray-200">{suggestion}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center p-4 text-youtube-lightGray">
              <AlertCircle className="h-10 w-10 mx-auto mb-2 text-youtube-lightGray" />
              <p>No suggestions found based on the comments</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
