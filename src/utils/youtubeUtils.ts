// Mock comments for preview
export const mockComments = [
  "Really nice tutorial, could be made longer",
  "Amazing one buddy, good job",
  "Good effort, needs work",
  "The audio quality was really poor",
  "I learned a lot from this, thanks!",
  "Not what I was expecting based on the title",
  "Please make more videos on this topic",
  "The content is great but the editing could be better",
  "I've been waiting for someone to explain this so clearly",
  "You missed some important points"
];

// Mock analysis response
export const mockAnalysis = {
  sentiment_percentages: {
    positive: 50.0,
    negative: 25.0,
    neutral: 25.0
  },
  summary: "Overall, the comments show a mix of sentiments with a majority being positive. Viewers appreciate the tutorial quality and clarity of explanation. Negative comments primarily focus on audio quality and editing issues. There are requests for longer videos and more content on the same topic. The tutorial seems to have been helpful for learning, though some viewers noted missing information.",
  key_themes: {
    "audio quality": 3,
    "tutorial": 5,
    "editing": 2,
    "explanation": 4,
    "length": 3
  },
  length_analysis: {
    avg_length: 5.5,
    positive_avg: 6.0,
    negative_avg: 6.0,
    neutral_avg: 4.0
  },
  top_comments: {
    top_positive: "Amazing one buddy, good job",
    top_negative: "The audio quality was really poor"
  },
  suggestions: [
    "Consider improving audio quality for better user experience",
    "Make tutorials slightly longer to cover more details",
    "Improve video editing for a more professional appearance",
    "Ensure all key points are covered in explanations"
  ]
};

// Function to extract video ID from YouTube URL
export const extractVideoId = (url: string): string | null => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  console.log( (match && match[7].length === 11) ? match[7] : null);
  return (match && match[7].length === 11) ? match[7] : null;
};
