
import React from 'react';

interface LoadingScreenProps {
  message: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
      <div className="text-xl font-bold mb-2">{message}</div>
      <div className="text-sm text-gray-300">Пожалуйста, подождите...</div>
    </div>
  );
};

export default LoadingScreen;
