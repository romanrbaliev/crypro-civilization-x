
import React, { useState } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { Settings, HelpCircle, Info } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

const GameHeader: React.FC = () => {
  const { dispatch } = useGame();
  const { toast } = useToast();
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const handleResetGame = () => {
    if (confirm('Вы уверены, что хотите сбросить весь прогресс игры? Это действие нельзя отменить.')) {
      dispatch({ type: 'RESET_GAME' });
      toast({
        title: "Игра сброшена",
        description: "Весь прогресс игры был сброшен.",
        variant: "destructive"
      });
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b shadow-sm py-2 px-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setShowHowToPlay(true)}
            className="flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <HelpCircle className="w-4 h-4 mr-1" />
            <span>Как играть</span>
          </button>
          
          <button
            onClick={handleResetGame}
            className="flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <span>Сбросить прогресс</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                <Settings className="w-5 h-5" />
                <span className="ml-1">Настройки</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={handleResetGame}>
                Сбросить прогресс
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Язык: Русский
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <button 
            onClick={() => setShowAbout(true)}
            className="flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <Info className="w-4 h-4 mr-1" />
            <span>Об игре</span>
          </button>
        </div>
      </div>
      
      {/* Здесь можно добавить модальные окна для "Как играть" и "Об игре" */}
    </header>
  );
};

export default GameHeader;
