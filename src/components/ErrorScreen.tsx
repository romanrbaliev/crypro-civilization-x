
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorScreenProps {
  title: string;
  description: string;
  onRetry?: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ title, description, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="flex flex-col items-center space-y-4 max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <AlertTriangle className="w-16 h-16 text-amber-500" />
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <p className="text-gray-600">{description}</p>
        
        {onRetry && (
          <button 
            onClick={onRetry}
            className="px-4 py-2 mt-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Повторить
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorScreen;
