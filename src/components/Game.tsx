
import { useEffect } from 'react';
import { useGame } from '../context/hooks/useGame';
import { ResourceContainer } from './ResourceContainer';
import { BuildingsContainer } from './BuildingsContainer';
import ActionButtons from './ActionButtons';
import EventLog from './EventLog';
import { GameHeader } from './GameHeader';
import ResearchContainer from './ResearchContainer';
import { useGameSaver } from '../hooks/useGameSaver';
import { useGameStateUpdateService } from '../hooks/useGameStateUpdateService';

export function Game() {
  const { state, dispatch } = useGame();
  
  // Используем хук для автоматического сохранения игры
  useGameSaver();
  
  // Используем новый хук для управления состоянием игры
  useGameStateUpdateService();
  
  // Запускаем игру, если она еще не запущена
  useEffect(() => {
    if (!state.gameStarted) {
      dispatch({ type: 'START_GAME' });
    }
    
    // Отладочная информация
    console.log("Game компонент инициализирован, состояние игры:", state.gameStarted ? "Запущена" : "Не запущена");
  }, [state.gameStarted, dispatch]);
  
  // Принудительно обновляем состояние игры при монтировании компонента
  useEffect(() => {
    if (state.gameStarted) {
      dispatch({ type: 'FORCE_RESOURCE_UPDATE' });
      console.log("Принудительное обновление ресурсов выполнено");
    }
  }, []);
  
  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row gap-4">
      <div className="w-full md:w-2/3 space-y-4">
        <GameHeader />
        
        <ActionButtons onAddEvent={() => {}} />
        
        <ResourceContainer />
        
        {state.unlocks.research && <ResearchContainer />}
        
        <BuildingsContainer />
      </div>
      
      <div className="w-full md:w-1/3 mt-4 md:mt-0">
        <EventLog events={[]} maxEvents={50} />
      </div>
    </div>
  );
}

export default Game;
