
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import { useYoutubeAnalysis } from '@/hooks/useYoutubeAnalysis';
import { VideoUrlForm } from '@/components/youtube/VideoUrlForm';
import { AnalysisResults } from '@/components/youtube/AnalysisResults';

const YoutubeAnalysis: React.FC = () => {
  const {
    videoUrl,
    setVideoUrl,
    comments,
    analysis,
    loading,
    fetchingComments,
    useMockData,
    setUseMockData,
    handleSubmit
  } = useYoutubeAnalysis();

  return (
    <div className="min-h-screen bg-youtube-dark py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 animate-slide-up">

          <h1 className="text-4xl font-bold text-youtube-black mb-2">HIVE Comment Analysis</h1>
          <p className="text-youtube-darkGray max-w-2xl mx-auto"></p>

          <h1 className="text-4xl font-bold text-white mb-2">YouTube Comment Analysis</h1>
          <p className="text-youtube-lightGray max-w-2xl mx-auto">

            Extract insights from video comments using machine learning
          </p>
        </div>

        <Card className="youtube-card mb-8 overflow-hidden animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <CardHeader className="youtube-gradient-primary px-6 py-4">
            <CardTitle className="text-white flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              Analyze Video Comments
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            <VideoUrlForm
              videoUrl={videoUrl}
              setVideoUrl={setVideoUrl}
              useMockData={useMockData}
              setUseMockData={setUseMockData}
              handleSubmit={handleSubmit}
              loading={loading}
              fetchingComments={fetchingComments}
            />
          </CardContent>
        </Card>

        {analysis && <AnalysisResults analysis={analysis} />}
      </div>
    </div>
  );
};

export default YoutubeAnalysis;
