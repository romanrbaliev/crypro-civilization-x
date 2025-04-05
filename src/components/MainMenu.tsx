
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, HelpCircle, Settings, Info } from 'lucide-react';
import { useGame } from '@/context/hooks/useGame';

const MainMenu: React.FC = () => {
  const { dispatch } = useGame();
  
  // Обработчик сброса игры
  const handleResetGame = () => {
    if (confirm('Вы уверены, что хотите сбросить прогресс игры?')) {
      dispatch({ type: 'RESET_GAME' });
    }
  };
  
  // Функция для отображения окна "Как играть"
  const showHowToPlay = () => {
    alert('Информация о том, как играть в игру будет добавлена позже.');
  };
  
  // Функция для отображения окна "О игре"
  const showAboutGame = () => {
    alert('Crypto Civilization - игра о построении криптовалютной цивилизации.');
  };
  
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-xl font-bold">Crypto Civilization</h1>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={showHowToPlay}>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Как играть</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Настройки</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleResetGame} className="text-red-600">
            <span>Сбросить прогресс</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={showAboutGame}>
            <Info className="mr-2 h-4 w-4" />
            <span>О игре</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MainMenu;
