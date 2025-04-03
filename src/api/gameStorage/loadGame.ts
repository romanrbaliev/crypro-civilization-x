
import { supabase } from '@/integrations/supabase/client';
import { GameState } from '@/context/types';
import { getUserIdentifier } from '../userIdentification';
import { checkSupabaseConnection } from '../connectionUtils';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { SAVES_TABLE } from '../apiTypes';
import { validateGameState, mergeWithInitialState } from './stateUtils';

// Загрузка игры из Supabase
export const loadGameFromServer = async (): Promise<GameState | null> => {
  try {
    const userId = await getUserIdentifier();
    console.log(`🔄 Загрузка игры для пользователя: ${userId}`);
    
    // Проверяем подключение к Supabase
    const isConnected = await checkSupabaseConnection();
      
    if (!isConnected) {
      safeDispatchGameEvent(
        "Не удалось загрузить прогресс. Проверьте соединение с интернетом.",
        "error"
      );
      return null;
    }
    
    console.log('🔄 Загрузка из Supabase...');
    
    const { data, error } = await supabase
      .from(SAVES_TABLE)
      .select('game_data, updated_at')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('❌ Ошибка при загрузке из Supabase:', error);
      
      if (error.code === 'PGRST116') {
        console.warn('⚠️ Таблица сохранений не существует в Supabase');
        
        // Создаем таблицу, если её нет
        // Импортируем динамически для избежания циклических зависимостей
        const { createSavesTableIfNotExists } = await import('../tableManagement');
        const tableCreated = await createSavesTableIfNotExists();
        
        if (tableCreated) {
          console.log('✅ Таблица сохранений создана');
          
          // Сразу попытаемся получить данные еще раз (после создания таблицы)
          const retryResult = await supabase
            .from(SAVES_TABLE)
            .select('game_data, updated_at')
            .eq('user_id', userId)
            .maybeSingle();
            
          if (retryResult.data && retryResult.data.game_data) {
            console.log('✅ Данные успешно загружены после создания таблицы');
            return retryResult.data.game_data as any;
          }
        }
      }
      
      return null;
    } 
    
    if (data && data.game_data) {
      console.log('✅ Игра загружена из Supabase, дата обновления:', data.updated_at);
      
      try {
        const gameState = data.game_data as any;
        
        // Проверка целостности данных
        if (validateGameState(gameState)) {
          console.log('✅ Проверка целостности данных из Supabase пройдена');
          
          // ИСПРАВЛЕНИЕ: Принудительно проверяем и корректируем разблокировки зданий
          
          // Криптобиблиотека разблокируется после покупки "Основы криптовалют"
          const hasCryptoBasics = 
            (gameState.upgrades?.cryptoCurrencyBasics?.purchased === true) || 
            (gameState.upgrades?.cryptoBasics?.purchased === true);
            
          if (hasCryptoBasics) {
            // Убедимся, что здание существует перед разблокировкой
            if (!gameState.buildings.cryptoLibrary) {
              // Если не существует, создаем со стандартными параметрами
              gameState.buildings.cryptoLibrary = {
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
              gameState.buildings.cryptoLibrary.unlocked = true;
            }
            gameState.unlocks.cryptoLibrary = true;
            console.log("loadGame: Криптобиблиотека разблокирована");
          }
          
          // Система охлаждения разблокируется после 2+ уровней домашнего компьютера
          if (gameState.buildings?.homeComputer?.count >= 2) {
            // Убедимся, что здание существует перед разблокировкой
            if (!gameState.buildings.coolingSystem) {
              // Если не существует, создаем со стандартными параметрами
              gameState.buildings.coolingSystem = {
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
              gameState.buildings.coolingSystem.unlocked = true;
            }
            gameState.unlocks.coolingSystem = true;
            console.log("loadGame: Система охлаждения разблокирована");
          }
          
          // Улучшенный кошелек разблокируется после 5+ уровней криптокошелька
          if (gameState.buildings?.cryptoWallet?.count >= 5) {
            // Проверяем варианты названия улучшенного кошелька
            if (gameState.buildings?.enhancedWallet) {
              gameState.buildings.enhancedWallet.unlocked = true;
              gameState.unlocks.enhancedWallet = true;
              console.log("loadGame: Улучшенный кошелек (enhancedWallet) разблокирован");
            }
            
            if (gameState.buildings?.improvedWallet) {
              gameState.buildings.improvedWallet.unlocked = true;
              gameState.unlocks.improvedWallet = true;
              console.log("loadGame: Улучшенный кошелек (improvedWallet) разблокирован");
            }
            
            // Если ни один вариант не существует, создаем enhancedWallet
            if (!gameState.buildings.enhancedWallet && !gameState.buildings.improvedWallet) {
              gameState.buildings.enhancedWallet = {
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
              gameState.unlocks.enhancedWallet = true;
              console.log("loadGame: Создан и разблокирован улучшенный кошелек (enhancedWallet)");
            }
          }
          
          // Обрабатываем корректно поле activated для рефералов
          if (gameState.referrals && gameState.referrals.length > 0) {
            gameState.referrals = gameState.referrals.map((referral: any) => {
              // Преобразуем строковое значение в булевое
              if (typeof referral.activated === 'string') {
                return {
                  ...referral,
                  activated: referral.activated === 'true'
                };
              }
              return referral;
            });
          }
          
          // Убеждаемся, что USDT имеет правильное состояние разблокировки
          if (gameState.resources && gameState.resources.usdt) {
            if (!gameState.counters || 
                !gameState.counters.applyKnowledge || 
                gameState.counters.applyKnowledge.value < 2) {
              gameState.resources.usdt.unlocked = false;
              
              if (gameState.unlocks) {
                gameState.unlocks.usdt = false;
              }
              
              console.log('🔒 USDT заблокирован при загрузке (проверка в loadGameFromServer)');
            }
          }
          
          // Проверяем и восстанавливаем недостающие данные из initialState
          const mergedState = mergeWithInitialState(gameState);
          
          // Обновляем lastUpdate и lastSaved
          mergedState.lastUpdate = Date.now();
          mergedState.lastSaved = Date.now();
          
          // Важно: устанавливаем флаг gameStarted
          mergedState.gameStarted = true;
          
          return mergedState;
        } else {
          console.error('❌ Проверка целостности данных из Supabase не пройдена');
          safeDispatchGameEvent(
            "Данные из облака повреждены. Начинаем новую игру.",
            "warning"
          );
          return null;
        }
      } catch (parseError) {
        console.error('❌ Ошибка при обработке данных из Supabase:', parseError);
        return null;
      }
    }
    
    console.log('❌ Сохранение в Supabase не найдено');
    return null;
  } catch (error) {
    console.error('❌ Критическая ошибка при загрузке игры:', error);
    safeDispatchGameEvent(
      "Критическая ошибка при загрузке игры. Начинаем новую игру.",
      "error"
    );
    return null;
  }
};
