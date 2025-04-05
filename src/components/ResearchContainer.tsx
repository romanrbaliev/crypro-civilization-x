
import React from 'react';
import ResearchTab from './ResearchTab';

interface ResearchContainerProps {
  onAddEvent: (message: string, type: string) => void;
}

const ResearchContainer: React.FC<ResearchContainerProps> = ({ onAddEvent }) => {
  return <ResearchTab onAddEvent={onAddEvent} />;
};

export default ResearchContainer;
