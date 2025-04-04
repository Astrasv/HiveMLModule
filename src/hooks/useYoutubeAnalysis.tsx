
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { MLModelResponse } from '@/types/youtube';
import {mockComments, mockAnalysis, extractVideoId } from '@/utils/youtubeUtils';


export const useYoutubeAnalysis = () => {
  const { toast } = useToast();
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [comments, setComments] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<MLModelResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingComments, setFetchingComments] = useState<boolean>(false);
  const [useMockData, setUseMockData] = useState<boolean>(true);

  // Function to fetch comments from YouTube API
  const fetchComments = async (videoId: string) => {
    try {
      setFetchingComments(true);
      const commentsUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=100&key=${import.meta.env.VITE_APP_YOUTUBE_API_KEY}`;
      const response = await axios.get(commentsUrl);
      const commentList = response.data.items.map((item: any) => item.snippet.topLevelComment.snippet.textDisplay);
      
      setComments(commentList);
      toast({
        title: "Comments retrieved",
        description: `Found ${commentList.length} comments for analysis`,
      });
      
      return commentList;
    } catch (err) {
      console.error('Error fetching comments:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch comments. Comments may be disabled or quota exceeded.",
      });
      return [];
    } finally {
      setFetchingComments(false);
    }
  };

  // Function to analyze comments using ML model
  const analyzeSentiments = async (comments: string[]) => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8000/analyze-sentiments', { comments });
      setAnalysis(response.data);
      toast({
        title: "Analysis complete",
        description: "Comment analysis has been successfully processed",
      });
      console.log(response.data)
      return response.data;
    } catch (err) {
      console.error('Error analyzing sentiments:', err);
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: "Failed to analyze sentiments. Ensure the ML API is running.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Process video URL and handle analysis
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const id = extractVideoId(videoUrl);
    if (!id) {
      toast({
        variant: "destructive",
        title: "Invalid URL",
        description: "Please enter a valid YouTube video URL",
      });
      return;
    }
    
    setVideoId(id);
    
    if (useMockData) {
      // Use mock data for preview
      setFetchingComments(true);
      setTimeout(() => {
        setComments(mockComments);
        setFetchingComments(false);
        
        toast({
          title: "Mock comments retrieved",
          description: `Found ${mockComments.length} mock comments for preview`,
        });
        
        setLoading(true);
        setTimeout(() => {
          setAnalysis(mockAnalysis as MLModelResponse);
          setLoading(false);
          
          toast({
            title: "Mock analysis complete",
            description: "Comment analysis has been successfully processed with mock data",
          });
        }, 1500);
      }, 1000);
    } else {
      // Use actual API
      const fetchedComments = await fetchComments(id);
      
      if (fetchedComments.length > 0) {
        await analyzeSentiments(fetchedComments);
      }
    }
  };

  return {
    videoUrl,
    setVideoUrl,
    videoId,
    setVideoId,
    comments,
    analysis,
    loading,
    fetchingComments,
    useMockData,
    setUseMockData,
    handleSubmit
  };
};
