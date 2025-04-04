
import React from 'react';

interface CircleProgressProps {
  value: number;
  color: string;
  label: string;
}

export const CircleProgress: React.FC<CircleProgressProps> = ({ value, color, label }) => {
  const circumference = 2 * Math.PI * 45;
  const progressOffset = circumference - (value / 100) * circumference;
  
  return (
    <div className="mx-auto mb-4">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle 
            className="fill-none stroke-gray-200" 
            cx="50" 
            cy="50" 
            r="45" 
            strokeWidth="8"
          />
          <circle 
            className={`fill-none ${color} transition-all duration-1000 ease-in-out`} 
            cx="50" 
            cy="50" 
            r="45" 
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{Math.round(value)}%</span>
          <span className="text-sm">{label}</span>
        </div>
      </div>
    </div>
  );
};
