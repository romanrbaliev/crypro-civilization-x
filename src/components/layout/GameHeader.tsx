
import React from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/hooks/useGame';

const GameHeader: React.FC = () => {
  const { dispatch } = useGame();
  
  const handleResetProgress = () => {
    if (confirm('Вы уверены, что хотите сбросить прогресс? Все данные будут потеряны.')) {
      dispatch({ type: 'RESET_GAME' });
    }
  };
  
  return (
    <header className="bg-white border-b border-gray-200 py-2 px-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <Button variant="link" className="text-gray-700">
            Как играть
          </Button>
          <Button variant="link" className="text-gray-700" onClick={handleResetProgress}>
            Сбросить прогресс
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="link" className="text-gray-700">
            Настройки
          </Button>
        </div>
      </div>
    </header>
  );
};

export default GameHeader;
