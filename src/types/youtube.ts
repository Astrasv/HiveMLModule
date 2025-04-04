
// Types for the YouTube analysis feature
export interface MLModelResponse {
  sentiment_percentages: {
    positive: number;
    negative: number;
    neutral: number;
  };
  summary: string;
  key_themes: Record<string, number>;
  length_analysis: {
    avg_length: number;
    positive_avg: number;
    negative_avg: number;
    neutral_avg: number;
  };
  top_comments: {
    top_positive: string;
    top_negative: string;
  };
  suggestions: string[];
}
