
import React from 'react';
import ResearchTab from './ResearchTab';
import { useI18nContext } from '@/context/I18nContext';

interface ResearchContainerProps {
  onAddEvent: (message: string, type: string) => void;
}

const ResearchContainer: React.FC<ResearchContainerProps> = ({ onAddEvent }) => {
  const { t } = useI18nContext();
  
  // Передаем события в ResearchTab
  return (
    <div>
      <ResearchTab onAddEvent={onAddEvent} />
    </div>
  );
};

export default ResearchContainer;
