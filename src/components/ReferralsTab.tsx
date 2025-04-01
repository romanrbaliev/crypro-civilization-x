
import React from 'react';
import { useGame } from '@/context/hooks/useGame';

// Компонент вкладки рефералов
const ReferralsTab: React.FC<{ onAddEvent: (message: string, type: string) => void }> = ({ onAddEvent }) => {
  return (
    <div>
      <h2>Рефералы</h2>
      <p>Здесь будут отображаться ваши рефералы</p>
    </div>
  );
};

export default ReferralsTab;
