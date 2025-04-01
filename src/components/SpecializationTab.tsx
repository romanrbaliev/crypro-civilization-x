
import React from 'react';
import { useGame } from '@/context/hooks/useGame';

// Компонент вкладки специализаций
const SpecializationTab: React.FC<{ onAddEvent: (message: string, type: string) => void }> = ({ onAddEvent }) => {
  return (
    <div>
      <h2>Специализации</h2>
      <p>Здесь будут отображаться доступные специализации</p>
    </div>
  );
};

export default SpecializationTab;
