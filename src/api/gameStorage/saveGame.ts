
import { supabase } from '@/integrations/supabase/client';
import { GameState } from '@/context/types';
import { Json } from '@/integrations/supabase/types';
import { getUserIdentifier } from '../userIdentification';
import { checkSupabaseConnection } from '../connectionUtils';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { SAVES_TABLE } from '../apiTypes';

// Улучшенное сохранение игры в Supabase
export const saveGameToServer = async (gameState: GameState): Promise<boolean> => {
  try {
    const userId = await getUserIdentifier();
    console.log(`🔄 Сохранение игры для пользователя: ${userId}`);
    
    // Проверяем подключение к Supabase, но даже при проблемах пытаемся сохранить
    const isConnected = await checkSupabaseConnection();
    
    console.log('🔄 Сохранение в Supabase...');
    
    // Клонируем состояние, чтобы не изменять оригинал
    const gameStateCopy = JSON.parse(JSON.stringify(gameState));
    
    // Убеждаемся, что флаг gameStarted установлен
    gameStateCopy.gameStarted = true;
    
    // Проверяем условие разблокировки USDT перед сохранением
    if (gameStateCopy.resources && gameStateCopy.resources.usdt) {
      if (!gameStateCopy.counters.applyKnowledge || gameStateCopy.counters.applyKnowledge.value < 2) {
        gameStateCopy.resources.usdt.unlocked = false;
        gameStateCopy.unlocks.usdt = false;
      } else {
        gameStateCopy.resources.usdt.unlocked = true;
        gameStateCopy.unlocks.usdt = true;
      }
    }
    
    // ИСПРАВЛЕНИЕ: Проверяем правильное состояние разблокировки зданий перед сохранением
    
    // Криптобиблиотека разблокируется после покупки "Основы криптовалют"
    const hasCryptoBasics = 
      gameStateCopy.upgrades.cryptoCurrencyBasics?.purchased || 
      gameStateCopy.upgrades.cryptoBasics?.purchased;
      
    if (hasCryptoBasics && gameStateCopy.buildings.cryptoLibrary) {
      gameStateCopy.buildings.cryptoLibrary.unlocked = true;
      gameStateCopy.unlocks.cryptoLibrary = true;
    }
    
    // Система охлаждения разблокируется после 2+ уровней домашнего компьютера
    if (gameStateCopy.buildings.homeComputer?.count >= 2 && gameStateCopy.buildings.coolingSystem) {
      gameStateCopy.buildings.coolingSystem.unlocked = true;
      gameStateCopy.unlocks.coolingSystem = true;
    }
    
    // Улучшенный кошелек разблокируется после 5+ уровней криптокошелька
    if (gameStateCopy.buildings.cryptoWallet?.count >= 5) {
      if (gameStateCopy.buildings.enhancedWallet) {
        gameStateCopy.buildings.enhancedWallet.unlocked = true;
        gameStateCopy.unlocks.enhancedWallet = true;
      }
      
      if (gameStateCopy.buildings.improvedWallet) {
        gameStateCopy.buildings.improvedWallet.unlocked = true;
        gameStateCopy.unlocks.improvedWallet = true;
      }
    }
    
    // Проверяем условие разблокировки исследований
    gameStateCopy.unlocks.research = gameStateCopy.buildings.generator?.count > 0;
    
    // Убедимся, что Bitcoin имеет достаточное пространство хранения
    if (gameStateCopy.resources && gameStateCopy.resources.bitcoin && 
        gameStateCopy.resources.bitcoin.max < 0.01) {
      gameStateCopy.resources.bitcoin.max = 0.01;
    }
    
    // Обрабатываем корректно поле activated для рефералов
    if (gameStateCopy.referrals && gameStateCopy.referrals.length > 0) {
      gameStateCopy.referrals = gameStateCopy.referrals.map((referral: any) => {
        if (typeof referral.activated === 'string') {
          return {
            ...referral,
            activated: referral.activated === 'true'
          };
        }
        return referral;
      });
    }
    
    // Преобразуем GameState в Json
    let gameDataJson: Json;
    try {
      const jsonString = JSON.stringify(gameStateCopy);
      gameDataJson = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('❌ Ошибка преобразования состояния игры в JSON:', parseError);
      return false;
    }
    
    // Готовим данные для сохранения
    const saveData = {
      user_id: userId,
      game_data: gameDataJson,
      updated_at: new Date().toISOString()
    };
    
    // Пробуем сохранить данные даже если проверка соединения не прошла
    const { error } = await supabase
      .from(SAVES_TABLE)
      .upsert(saveData, { onConflict: 'user_id' });
    
    if (error) {
      console.warn('⚠️ Ошибка при сохранении в Supabase:', error);
      
      // Пробуем создать таблицу и повторить попытку если таблица не существует
      if (error.code === 'PGRST116') {
        // Импортируем динамически для избежания циклических зависимостей
        const { createSavesTableIfNotExists } = await import('../tableManagement');
        const tableCreated = await createSavesTableIfNotExists();
        
        if (tableCreated) {
          // Повторяем попытку сохранения
          const { error: retryError } = await supabase
            .from(SAVES_TABLE)
            .upsert(saveData, { onConflict: 'user_id' });
            
          if (retryError) {
            console.warn('⚠️ Ошибка при повторном сохранении в Supabase:', retryError);
            return false;
          }
          
          console.log('✅ Игра успешно сохранена после создания таблицы');
          return true;
        }
      }
      
      // Даже при ошибке продолжаем игру
      return false;
    }
    
    console.log('✅ Игра успешно сохранена в Supabase');
    return true;
    
  } catch (error) {
    console.warn('⚠️ Ошибка при сохранении игры, но продолжаем игру:', error);
    return false;
  }
};
