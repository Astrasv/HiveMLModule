
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

interface VideoUrlFormProps {
  videoUrl: string;
  setVideoUrl: (url: string) => void;
  useMockData: boolean;
  setUseMockData: (useMock: boolean) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
  fetchingComments: boolean;
}

export const VideoUrlForm: React.FC<VideoUrlFormProps> = ({
  videoUrl,
  setVideoUrl,
  useMockData,
  setUseMockData,
  handleSubmit,
  loading,
  fetchingComments
}) => {
  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Enter YouTube video URL"
            className="flex-1 bg-youtube-mediumGray border-youtube-hover text-white placeholder:text-youtube-lightGray focus:ring-youtube-red"
            disabled={loading || fetchingComments}
          />
          <Button 
            type="submit" 
            disabled={loading || fetchingComments || !videoUrl}
            className="youtube-button"
          >
            {loading || fetchingComments ? "Processing..." : "Analyze"}
          </Button>
        </div>
        
        <div className="flex items-center mt-2">
          <input
            type="checkbox"
            id="useMockData"
            checked={useMockData}
            onChange={() => setUseMockData(!useMockData)}
            className="mr-2 h-4 w-4 text-youtube-red focus:ring-youtube-red bg-youtube-mediumGray border-youtube-lightGray rounded"
          />
          <label htmlFor="useMockData" className="text-sm text-youtube-lightGray">
            Use mock data for preview (no API key required)
          </label>
        </div>
      </form>
      
      {fetchingComments && (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-youtube-lightGray animate-pulse-slow">Fetching comments...</p>
          <Progress value={50} className="h-1 bg-youtube-mediumGray" />
        </div>
      )}
      
      {loading && (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-youtube-lightGray animate-pulse-slow">Analyzing comments...</p>
          <Progress value={75} className="h-1 bg-youtube-mediumGray" />
        </div>
      )}
    </div>
  );
};
