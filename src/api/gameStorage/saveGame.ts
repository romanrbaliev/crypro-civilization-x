
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
    
    // ИСПРАВЛЕНИЕ: Принудительно проверяем и корректируем разблокировки зданий
    
    // Криптобиблиотека разблокируется после покупки "Основы криптовалют"
    const hasCryptoBasics = 
      (gameStateCopy.upgrades.cryptoCurrencyBasics?.purchased === true) || 
      (gameStateCopy.upgrades.cryptoBasics?.purchased === true);
      
    if (hasCryptoBasics) {
      // Убедимся, что здание существует перед разблокировкой
      if (!gameStateCopy.buildings.cryptoLibrary) {
        // Если не существует, создаем со стандартными параметрами
        gameStateCopy.buildings.cryptoLibrary = {
          id: "cryptoLibrary",
          name: "Криптобиблиотека",
          description: "Увеличивает скорость получения знаний на 50% и максимальное количество знаний на 100",
          baseCost: {
            usdt: 200,
            knowledge: 200
          },
          costMultiplier: 1.15,
          count: 0,
          unlocked: true
        };
      } else {
        gameStateCopy.buildings.cryptoLibrary.unlocked = true;
      }
      gameStateCopy.unlocks.cryptoLibrary = true;
      console.log("saveGame: Криптобиблиотека разблокирована");
    }
    
    // Система охлаждения разблокируется после 2+ уровней домашнего компьютера
    if (gameStateCopy.buildings.homeComputer?.count >= 2) {
      // Убедимся, что здание существует перед разблокировкой
      if (!gameStateCopy.buildings.coolingSystem) {
        // Если не существует, создаем со стандартными параметрами
        gameStateCopy.buildings.coolingSystem = {
          id: "coolingSystem",
          name: "Система охлаждения",
          description: "Уменьшает потребление вычислительной мощности всеми устройствами на 20%",
          baseCost: {
            usdt: 200,
            electricity: 50
          },
          costMultiplier: 1.15,
          count: 0,
          unlocked: true
        };
      } else {
        gameStateCopy.buildings.coolingSystem.unlocked = true;
      }
      gameStateCopy.unlocks.coolingSystem = true;
      console.log("saveGame: Система охлаждения разблокирована");
    }
    
    // Улучшенный кошелек разблокируется после 5+ уровней криптокошелька
    if (gameStateCopy.buildings.cryptoWallet?.count >= 5) {
      // Проверяем варианты названия улучшенного кошелька
      if (gameStateCopy.buildings.enhancedWallet) {
        gameStateCopy.buildings.enhancedWallet.unlocked = true;
        gameStateCopy.unlocks.enhancedWallet = true;
        console.log("saveGame: Улучшенный кошелек (enhancedWallet) разблокирован");
      }
      
      if (gameStateCopy.buildings.improvedWallet) {
        gameStateCopy.buildings.improvedWallet.unlocked = true;
        gameStateCopy.unlocks.improvedWallet = true;
        console.log("saveGame: Улучшенный кошелек (improvedWallet) разблокирован");
      }
      
      // Если ни один вариант не существует, создаем enhancedWallet
      if (!gameStateCopy.buildings.enhancedWallet && !gameStateCopy.buildings.improvedWallet) {
        gameStateCopy.buildings.enhancedWallet = {
          id: "enhancedWallet",
          name: "Улучшенный кошелек",
          description: "Увеличивает максимальное хранение USDT на 150, Bitcoin на 1, эффективность конвертации BTC на 8%",
          baseCost: {
            usdt: 300,
            knowledge: 250
          },
          costMultiplier: 1.15,
          count: 0,
          unlocked: true
        };
        gameStateCopy.unlocks.enhancedWallet = true;
        console.log("saveGame: Создан и разблокирован улучшенный кошелек (enhancedWallet)");
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
