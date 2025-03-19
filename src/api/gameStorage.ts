
// Сервис для сохранения и загрузки игры

import { supabase } from '@/integrations/supabase/client';
import { GameState } from '@/context/types';
import { Json } from '@/integrations/supabase/types';
import { getUserIdentifier } from './userIdentification';
import { checkSupabaseConnection } from './connectionUtils';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { toast } from "@/hooks/use-toast";
import { SAVES_TABLE } from './apiTypes';
import { initialState } from '@/context/initialState';

// Сохранение игры в Supabase
export const saveGameToServer = async (gameState: GameState): Promise<boolean> => {
  try {
    const userId = await getUserIdentifier();
    console.log(`🔄 Сохранение игры для пользователя: ${userId}`);
    
    // Проверяем подключение к Supabase
    const isConnected = await checkSupabaseConnection();
      
    if (!isConnected) {
      safeDispatchGameEvent(
        "Не удалось сохранить прогресс. Проверьте соединение с интернетом.", 
        "error"
      );
      return false;
    }
    
    console.log('🔄 Сохранение в Supabase...');
    
    // Клонируем состояние, чтобы не изменять оригинал
    const gameStateCopy = JSON.parse(JSON.stringify(gameState));
    
    // Убеждаемся, что флаг gameStarted установлен
    gameStateCopy.gameStarted = true;
    
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
    
    // Обновляем существующую запись
    const { error } = await supabase
      .from(SAVES_TABLE)
      .upsert(saveData, { onConflict: 'user_id' });
    
    if (error) {
      console.error('❌ Ошибка при сохранении в Supabase:', error);
      
      // Пробуем создать таблицу и повторить попытку если таблица не существует
      if (error.code === 'PGRST116') {
        // Импортируем динамически для избежания циклических зависимостей
        const { createSavesTableIfNotExists } = await import('./tableManagement');
        const tableCreated = await createSavesTableIfNotExists();
        
        if (tableCreated) {
          // Повторяем попытку сохранения
          const { error: retryError } = await supabase
            .from(SAVES_TABLE)
            .upsert(saveData, { onConflict: 'user_id' });
            
          if (retryError) {
            console.error('❌ Ошибка при повторном сохранении в Supabase:', retryError);
            return false;
          }
          
          console.log('✅ Игра успешно сохранена после создания таблицы');
          return true;
        }
      }
      
      return false;
    }
    
    console.log('✅ Игра успешно сохранена в Supabase');
    return true;
    
  } catch (error) {
    console.error('❌ Критическая ошибка при сохранении игры:', error);
    return false;
  }
};

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
        const { createSavesTableIfNotExists } = await import('./tableManagement');
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

// Объединение загруженного состояния с initialState для восстановления отсутствующих полей
function mergeWithInitialState(loadedState: any): GameState {
  // Создаем глубокую копию начального состояния
  const baseState = JSON.parse(JSON.stringify(initialState));
  
  // Перебираем все ключи начального состояния
  for (const key of Object.keys(baseState)) {
    // Если ключ отсутствует в загруженном состоянии, оставляем значение из initialState
    if (loadedState[key] === undefined) {
      console.log(`Восстановлено отсутствующее поле: ${key}`);
      continue;
    }
    
    // Для объектов делаем рекурсивное объединение
    if (typeof baseState[key] === 'object' && 
        baseState[key] !== null && 
        !Array.isArray(baseState[key])) {
      
      loadedState[key] = {
        ...baseState[key],
        ...loadedState[key]
      };
    }
  }
  
  // Проверка наличия критически важных полей
  if (!loadedState.resources) {
    loadedState.resources = { ...baseState.resources };
    console.log('✅ Восстановлены отсутствующие ресурсы');
  }
  
  if (!loadedState.buildings) {
    loadedState.buildings = { ...baseState.buildings };
    console.log('✅ Восстановлены отсутствующие здания');
  }
  
  if (!loadedState.upgrades) {
    loadedState.upgrades = { ...baseState.upgrades };
    console.log('✅ Восстановлены отсутствующие улучшения');
  }
  
  if (!loadedState.unlocks) {
    loadedState.unlocks = { ...baseState.unlocks };
    console.log('✅ Восстановлены отсутствующие разблокировки');
  }
  
  // Проверка и добавление новых полей
  if (!loadedState.specializationSynergies) {
    loadedState.specializationSynergies = { ...baseState.specializationSynergies };
    console.log('✅ Добавлены отсутствующие данные о синергиях специализаций');
  }

  // Проверка и инициализация реферальных систем
  if (!loadedState.referrals) {
    loadedState.referrals = [];
    console.log('✅ Инициализирован пустой массив рефералов');
  }
  
  if (!loadedState.referralHelpers) {
    loadedState.referralHelpers = [];
    console.log('✅ Инициализирован пустой массив помощников');
  }
  
  // Проверка наличия счетчиков
  if (!loadedState.counters) {
    loadedState.counters = { ...baseState.counters };
    console.log('✅ Добавлены отсутствующие счетчики');
  }
  
  // Проверка наличия событий
  if (!loadedState.eventMessages) {
    loadedState.eventMessages = { ...baseState.eventMessages };
    console.log('✅ Добавлены отсутствующие сообщения о событиях');
  }
  
  // Убеждаемся что структура ресурсов и зданий соответствует initialState
  for (const resourceKey of Object.keys(baseState.resources)) {
    if (!loadedState.resources[resourceKey]) {
      loadedState.resources[resourceKey] = { ...baseState.resources[resourceKey] };
      console.log(`✅ Восстановлен отсутствующий ресурс: ${resourceKey}`);
    }
  }
  
  for (const buildingKey of Object.keys(baseState.buildings)) {
    if (!loadedState.buildings[buildingKey]) {
      loadedState.buildings[buildingKey] = { ...baseState.buildings[buildingKey] };
      console.log(`✅ Восстановлено отсутствующее здание: ${buildingKey}`);
    }
  }
  
  return loadedState as GameState;
}

// Валидация структуры данных игры
function validateGameState(state: any): boolean {
  if (!state) return false;
  
  // Проверяем наличие ключевых полей
  const requiredFields = ['resources', 'buildings', 'upgrades', 'unlocks'];
  for (const field of requiredFields) {
    if (!state[field] || typeof state[field] !== 'object') {
      console.error(`❌ Отсутствует или некорректно поле ${field}`);
      // В случае отсутствия полей, мы не считаем данные полностью поврежденными
      // Отсутствующие поля будут восстановлены из initialState
      continue;
    }
  }
  
  // Проверяем наличие ключевых ресурсов
  if (state.resources && (!state.resources.knowledge || !state.resources.usdt)) {
    console.error('❌ Отсутствуют базовые ресурсы knowledge или usdt');
    // Можно восстановить из initialState
    return true;
  }
  
  return true;
}
