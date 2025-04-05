
import React from 'react';
import ResearchTab from './ResearchTab';

interface ResearchContainerProps {
  onAddEvent: (message: string, type: string) => void;
}

const ResearchContainer: React.FC<ResearchContainerProps> = ({ onAddEvent }) => {
  // Передаем события в ResearchTab
  return (
    <div>
      <ResearchTab onAddEvent={onAddEvent} />
    </div>
  );
};

export default ResearchContainer;
