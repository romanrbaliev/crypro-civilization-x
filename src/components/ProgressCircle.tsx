
import React from 'react';

export const ProgressCircle: React.FC<{value: number, max: number}> = ({value, max}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className="relative w-12 h-12">
      <svg className="w-full h-full" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="16" fill="none" stroke="#e6e6e6" strokeWidth="2" />
        <circle 
          cx="18" 
          cy="18" 
          r="16" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeDasharray={`${percentage} 100`}
          className="text-blue-500 transform -rotate-90 origin-center" 
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs">
        {Math.round(percentage)}%
      </div>
    </div>
  );
};
