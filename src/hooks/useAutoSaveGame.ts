
import { useEffect } from 'react';
import { GameState } from '@/context/types';
import { saveGameToServer } from '@/api/gameStorage/index';

/**
 * Хук для автоматического сохранения игры через определенные интервалы
 */
export function useAutoSaveGame(gameState: GameState) {
  useEffect(() => {
    // Сохраняем игру каждые 30 секунд
    const saveInterval = setInterval(() => {
      console.log('🔄 Автосохранение игры...');
      saveGameToServer(gameState)
        .then(() => {
          console.log('✅ Автосохранение выполнено');
        })
        .catch((error) => {
          console.error('❌ Ошибка автосохранения:', error);
        });
    }, 30000);

    // Сохраняем при уходе со страницы
    const handleBeforeUnload = () => {
      console.log('🔄 Страница закрывается, сохранение...');
      saveGameToServer(gameState).catch(console.error);
    };

    // Сохраняем при сворачивании/минимизации вкладки
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.log('🔄 Страница скрыта, сохранение...');
        saveGameToServer(gameState).catch(console.error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      console.log('🔄 Сохранение при размонтировании');
      clearInterval(saveInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      saveGameToServer(gameState).catch(console.error);
    };
  }, [gameState]);
}
