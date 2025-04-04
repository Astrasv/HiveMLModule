
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { YoutubeIcon } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="text-center max-w-3xl px-4 py-10 rounded-xl animate-fade-in">
        <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-youtube-red to-red-700">
          HIVE Comment Analysis
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Gain valuable insights from your YouTube video comments using advanced machine learning analysis
        </p>
        
        <Link to="/youtube-analysis">
          <Button 
            className="rounded-full text-white bg-youtube-red hover:bg-red-700 transition-all px-8 py-6 text-lg animate-pulse-slow"
          >
            <YoutubeIcon className="mr-2 h-5 w-5" />
            Start Analyzing
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
