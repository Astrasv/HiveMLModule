
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { MLModelResponse } from '@/types/youtube';

interface ThemesCardProps {
  analysis: MLModelResponse;
}

export const ThemesCard: React.FC<ThemesCardProps> = ({ analysis }) => {
  const [showThemes, setShowThemes] = useState<boolean>(true);

  return (
    <Card className="youtube-card animate-slide-up">
      <CardHeader 
        className="youtube-gradient-orange px-6 py-4 cursor-pointer"
        onClick={() => setShowThemes(!showThemes)}
      >
        <div className="flex justify-between items-center">
          <CardTitle className="text-white">Key Themes</CardTitle>
          {showThemes ? 
            <ChevronUp className="h-5 w-5 text-white" /> : 
            <ChevronDown className="h-5 w-5 text-white" />
          }
        </div>
        <CardDescription className="text-orange-100">
          Common topics mentioned in comments
        </CardDescription>
      </CardHeader>
      
      {showThemes && (
        <CardContent className="p-6 animate-slide-up">
          {Object.keys(analysis.key_themes).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(analysis.key_themes).map(([theme, count], index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-200">{theme}</span>
                    <span className="text-sm text-youtube-lightGray">{count}</span>
                  </div>
                  <Progress 
                    value={Math.min(count * 10, 100)} 
                    className="h-2 bg-youtube-mediumGray" 
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 text-youtube-lightGray">
              <AlertCircle className="h-10 w-10 mx-auto mb-2 text-youtube-lightGray" />
              <p>No key themes identified in the comments</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
