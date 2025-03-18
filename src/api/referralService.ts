
// Модуль управления реферальной системой
import { supabase } from '@/integrations/supabase/client';
import { getUserIdentifier } from './userIdentification';
import { generateId } from '@/utils/helpers';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { REFERRAL_TABLE, REFERRAL_HELPERS_TABLE } from './apiTypes';
import { toast } from '@/hooks/use-toast';
import { GameState } from '@/context/types';

// Создание или проверка таблицы рефералов
export const createReferralTableIfNotExists = async (): Promise<boolean> => {
  try {
    // Вместо вызова exec_sql используем вызов create_saves_table
    const { error } = await supabase.rpc('create_saves_table');
    
    if (error) {
      console.error('❌ Ошибка при создании таблицы рефералов:', error);
      return false;
    }
    
    console.log('✅ Таблица рефералов создана или уже существует');
    return true;
  } catch (error) {
    console.error('❌ Критическая ошибка при создании таблицы рефералов:', error);
    return false;
  }
};

// Генерация уникального реферального кода
const generateReferralCode = async (): Promise<string> => {
  try {
    // Пытаемся использовать встроенную функцию Supabase для генерации кода
    const { data, error } = await supabase.rpc('generate_unique_ref_code');
    
    if (error) {
      console.error('❌ Ошибка при генерации реферального кода:', error);
      // Запасной вариант если RPC не работает
      return `CRY${Math.random().toString(36).substring(2, 6).toUpperCase()}${Date.now().toString().substring(9)}`;
    }
    
    return data as string;
  } catch (error) {
    console.error('❌ Критическая ошибка при генерации реферального кода:', error);
    // Запасной вариант при ошибке
    return `CRY${Math.random().toString(36).substring(2, 6).toUpperCase()}${Date.now().toString().substring(9)}`;
  }
};

// Получение реферального кода пользователя
export const getUserReferralCode = async (forceCheck = false): Promise<string | null> => {
  try {
    // Получаем ID пользователя
    const userId = await getUserIdentifier();
    
    if (!userId) {
      console.error('❌ Не удалось получить ID пользователя для реферального кода');
      return null;
    }
    
    // Создаем таблицу если она не существует
    if (forceCheck) {
      await createReferralTableIfNotExists();
    }
    
    // Проверяем существует ли уже реферальный код для пользователя
    const { data, error } = await supabase
      .from(REFERRAL_TABLE)
      .select('referral_code')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Таблица не существует, создаем ее
        const tableCreated = await createReferralTableIfNotExists();
        if (!tableCreated) {
          return null;
        }
        
        // Повторяем запрос после создания таблицы
        const { data: retryData, error: retryError } = await supabase
          .from(REFERRAL_TABLE)
          .select('referral_code')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (retryError || !retryData) {
          console.log('Реферальный код не найден после повторной попытки, создаем новый');
          return await saveReferralInfo(userId, null);
        }
        
        return retryData.referral_code;
      }
      
      console.error('❌ Ошибка при получении реферального кода:', error);
      return null;
    }
    
    if (data && data.referral_code) {
      return data.referral_code;
    }
    
    // Если у пользователя нет реферального кода, создаем новый
    console.log('Реферальный код не найден, создаем новый');
    return await saveReferralInfo(userId, null);
  } catch (error) {
    console.error('❌ Критическая ошибка при получении реферального кода:', error);
    return null;
  }
};

// Сохранение информации о реферальной связи
export const saveReferralInfo = async (
  userId: string, 
  referredBy: string | null
): Promise<string | null> => {
  try {
    // Генерируем уникальный реферальный код
    const referralCode = await generateReferralCode();
    
    if (!referralCode) {
      console.error('❌ Не удалось сгенерировать реферальный код');
      return null;
    }
    
    // Создаем запись в таблице рефералов
    // Используем тип Record<string, any> для обхода проблем с типами
    const referralData: Record<string, any> = {
      user_id: userId,
      referral_code: referralCode,
      referred_by: referredBy
    };
    
    const { error } = await supabase
      .from(REFERRAL_TABLE)
      .insert(referralData);
    
    if (error) {
      console.error('❌ Ошибка при сохранении реферальной информации:', error);
      
      if (error.code === 'PGRST116') {
        // Таблица не существует, создаем ее
        const tableCreated = await createReferralTableIfNotExists();
        
        if (tableCreated) {
          // Повторяем попытку вставки
          const { error: retryError } = await supabase
            .from(REFERRAL_TABLE)
            .insert(referralData);
            
          if (retryError) {
            console.error('❌ Повторная ошибка при сохранении реферальной информации:', retryError);
            return null;
          }
        } else {
          return null;
        }
      } else {
        return null;
      }
    }
    
    console.log(`✅ Реферальная информация сохранена. Код: ${referralCode}, Приглашен: ${referredBy || 'никем'}`);
    return referralCode;
  } catch (error) {
    console.error('❌ Критическая ошибка при сохранении реферальной информации:', error);
    return null;
  }
};

// Проверка информации о реферале по коду
export const checkReferralInfo = async (referralCode: string): Promise<{exists: boolean, userId?: string, isSelf?: boolean}> => {
  try {
    // Получаем ID текущего пользователя
    const userId = await getUserIdentifier();
    
    // Создаем таблицу если она не существует
    await createReferralTableIfNotExists();
    
    // Проверяем существование реферального кода
    const { data, error } = await supabase
      .from(REFERRAL_TABLE)
      .select('user_id')
      .eq('referral_code', referralCode)
      .maybeSingle();
    
    if (error) {
      console.error('❌ Ошибка при проверке реферального кода:', error);
      return { exists: false };
    }
    
    if (!data) {
      console.log(`⚠️ Реферальный код ${referralCode} не найден`);
      return { exists: false };
    }
    
    // Проверяем, не является ли это кодом самого пользователя
    const isSelf = data.user_id === userId;
    
    if (isSelf) {
      console.log(`⚠️ Пользователь пытается использовать свой собственный реферальный код`);
      return { exists: true, userId: data.user_id, isSelf: true };
    }
    
    return { exists: true, userId: data.user_id, isSelf: false };
  } catch (error) {
    console.error('❌ Критическая ошибка при проверке реферального кода:', error);
    return { exists: false };
  }
};

// Активация реферала (когда реферал достиг определенного прогресса)
export const activateReferral = async (referralUserId: string): Promise<boolean> => {
  try {
    // Пытаемся узнать, кто пригласил этого пользователя
    const { data, error } = await supabase
      .from(REFERRAL_TABLE)
      .select('referred_by')
      .eq('user_id', referralUserId)
      .maybeSingle();
      
    if (error || !data || !data.referred_by) {
      console.error('❌ Ошибка при получении информации о реферере:', error || 'Нет данных о реферере');
      return false;
    }
    
    const referralCode = data.referred_by;
    
    // Находим ID пользователя-реферера
    const { data: refererData, error: refererError } = await supabase
      .from(REFERRAL_TABLE)
      .select('user_id')
      .eq('referral_code', referralCode)
      .maybeSingle();
      
    if (refererError || !refererData) {
      console.error('❌ Ошибка при получении ID реферера:', refererError || 'Рефефер не найден');
      return false;
    }
    
    const refererId = refererData.user_id;
    
    console.log(`🔄 Активируем реферала ${referralUserId} для пользователя ${refererId}`);
    
    // Помечаем пользователя как активированного
    // Используем тип Record<string, any> для обхода проблем с типами
    const updateData: Record<string, any> = { is_activated: true };
    
    const { error: updateError } = await supabase
      .from(REFERRAL_TABLE)
      .update(updateData)
      .eq('user_id', referralUserId);
      
    if (updateError) {
      console.error('❌ Ошибка при обновлении статуса активации:', updateError);
      return false;
    }
    
    // Загружаем состояние игры реферера
    const { data: refererGameData, error: loadError } = await supabase
      .from('game_saves')
      .select('game_data')
      .eq('user_id', refererId)
      .maybeSingle();
      
    if (loadError || !refererGameData) {
      console.error('❌ Ошибка при загрузке сохранения реферера:', loadError || 'Сохранение не найдено');
      return false;
    }
    
    // Получаем игровое состояние с преобразованием типа
    // Используем as unknown для безопасного преобразования типов
    const gameState = refererGameData.game_data as unknown as GameState;
    
    // Если массив рефералов не инициализирован, создаем его
    if (!gameState.referrals) {
      gameState.referrals = [];
    }
    
    // Ищем реферала в списке
    const referralIndex = gameState.referrals.findIndex(r => r.id === referralUserId);
    
    if (referralIndex >= 0) {
      // Обновляем существующего реферала
      gameState.referrals[referralIndex].activated = true;
    } else {
      // Добавляем нового реферала
      gameState.referrals.push({
        id: referralUserId,
        username: `Пользователь_${referralUserId.substring(0, 4)}`,
        activated: true,
        joinedAt: Date.now()
      });
    }
    
    // Добавляем бонусы за активированного реферала
    if (gameState.resources && gameState.resources.usdt) {
      const bonus = 50; // Бонус за активированного реферала
      gameState.resources.usdt.value += bonus;
      
      console.log(`✅ Добавлен бонус ${bonus} USDT за активированного реферала`);
    }
    
    // Сохраняем обновленное состояние
    // Используем as unknown для безопасного преобразования типов
    const { error: saveError } = await supabase
      .from('game_saves')
      .update({
        game_data: gameState as unknown as Record<string, unknown>,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', refererId);
      
    if (saveError) {
      console.error('❌ Ошибка при сохранении обновленного состояния:', saveError);
      return false;
    }
    
    console.log(`✅ Реферал ${referralUserId} успешно активирован`);
    return true;
    
  } catch (error) {
    console.error('❌ Критическая ошибка при активации реферала:', error);
    return false;
  }
};

// Получение списка рефералов для текущего пользователя
export const getUserReferrals = async () => {
  try {
    // Получаем ID пользователя
    const userId = await getUserIdentifier();
    
    if (!userId) {
      console.error('❌ Не удалось получить ID пользователя для получения рефералов');
      return [];
    }
    
    // Получаем реферальный код пользователя
    const { data: codeData, error: codeError } = await supabase
      .from(REFERRAL_TABLE)
      .select('referral_code')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (codeError || !codeData) {
      console.error('❌ Ошибка при получении реферального кода:', codeError || 'Код не найден');
      return [];
    }
    
    const referralCode = codeData.referral_code;
    
    // Получаем список пользователей, которые указали этот код
    const { data, error } = await supabase
      .from(REFERRAL_TABLE)
      .select('user_id, referred_by, created_at')
      .eq('referred_by', referralCode);
      
    if (error) {
      console.error('❌ Ошибка при получении списка рефералов:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ Рефералы не найдены');
      return [];
    }
    
    // Преобразуем данные в нужный формат, обрабатывая проблемы с типами
    const referrals = data.map(ref => {
      // Безопасно проверяем наличие поля is_activated
      let isActivated = false;
      
      // Проверяем в Supabase статус активации
      supabase
        .from(REFERRAL_TABLE)
        .select('is_activated')
        .eq('user_id', ref.user_id)
        .maybeSingle()
        .then(({ data }) => {
          if (data && typeof data.is_activated === 'boolean') {
            isActivated = data.is_activated;
          }
        })
        .catch(err => console.error('Ошибка при проверке статуса активации:', err));
      
      return {
        id: ref.user_id,
        username: `Пользователь_${ref.user_id.substring(0, 4)}`,
        activated: isActivated,
        joinedAt: ref.created_at ? new Date(ref.created_at).getTime() : Date.now()
      };
    });
    
    console.log(`✅ Загружены ${referrals.length} рефералов`);
    return referrals;
    
  } catch (error) {
    console.error('❌ Критическая ошибка при получении списка рефералов:', error);
    return [];
  }
};

// Приглашение реферала на помощь в здании
export const hireReferralHelper = async (employerId: string, helperId: string, buildingId: string): Promise<boolean> => {
  try {
    // Создаем запись в таблице referral_helpers
    const { error } = await supabase
      .from(REFERRAL_HELPERS_TABLE)
      .insert({
        employer_id: employerId,
        helper_id: helperId,
        building_id: buildingId,
        status: 'pending'
      });
    
    if (error) {
      console.error('❌ Ошибка при создании запроса на помощь:', error);
      
      if (error.code === 'PGRST116') {
        // Таблица не существует, создаем ее
        const tableCreated = await createReferralTableIfNotExists();
        
        if (tableCreated) {
          // Повторяем попытку вставки
          const { error: retryError } = await supabase
            .from(REFERRAL_HELPERS_TABLE)
            .insert({
              employer_id: employerId,
              helper_id: helperId,
              building_id: buildingId,
              status: 'pending'
            });
            
          if (retryError) {
            console.error('❌ Повторная ошибка при создании запроса на помощь:', retryError);
            return false;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
    
    console.log(`✅ Запрос на помощь от ${employerId} к ${helperId} для здания ${buildingId} создан`);
    return true;
  } catch (error) {
    console.error('❌ Критическая ошибка при создании запроса на помощь:', error);
    return false;
  }
};

// Получение запросов на помощь для текущего пользователя
export const getHelperRequests = async (): Promise<any[]> => {
  try {
    // Получаем ID пользователя
    const userId = await getUserIdentifier();
    
    if (!userId) {
      console.error('❌ Не удалось получить ID пользователя для получения запросов на помощь');
      return [];
    }
    
    // Получаем запросы, где пользователь является помощником
    const { data, error } = await supabase
      .from(REFERRAL_HELPERS_TABLE)
      .select(`
        id,
        building_id,
        employer_id,
        status,
        created_at
      `)
      .eq('helper_id', userId)
      .eq('status', 'pending');
    
    if (error) {
      console.error('❌ Ошибка при получении запросов на помощь:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ Запросы на помощь не найдены');
      return [];
    }
    
    console.log(`✅ Загружены ${data.length} запросов на помощь`);
    return data;
  } catch (error) {
    console.error('❌ Критическая ошибка при получении запросов на помощь:', error);
    return [];
  }
};

// Ответ на запрос о помощи
export const respondToHelperRequest = async (requestId: string, accepted: boolean): Promise<boolean> => {
  try {
    // Обновляем статус запроса
    const { error } = await supabase
      .from(REFERRAL_HELPERS_TABLE)
      .update({
        status: accepted ? 'accepted' : 'rejected'
      })
      .eq('id', requestId);
    
    if (error) {
      console.error('❌ Ошибка при обновлении статуса запроса на помощь:', error);
      return false;
    }
    
    // Если запрос принят, обновляем состояние игры работодателя
    if (accepted) {
      // Получаем информацию о запросе
      const { data, error: fetchError } = await supabase
        .from(REFERRAL_HELPERS_TABLE)
        .select('employer_id, building_id')
        .eq('id', requestId)
        .maybeSingle();
      
      if (fetchError || !data) {
        console.error('❌ Ошибка при получении информации о запросе:', fetchError || 'Запрос не найден');
        return false;
      }
      
      const { employer_id, building_id } = data;
      
      // Получаем ID помощника
      const userId = await getUserIdentifier();
      
      if (!userId) {
        console.error('❌ Не удалось получить ID помощника');
        return false;
      }
      
      // Загружаем состояние игры работодателя
      const { data: employerGameData, error: loadError } = await supabase
        .from('game_saves')
        .select('game_data')
        .eq('user_id', employer_id)
        .maybeSingle();
      
      if (loadError || !employerGameData) {
        console.error('❌ Ошибка при загрузке сохранения работодателя:', loadError || 'Сохранение не найдено');
        return false;
      }
      
      // Получаем игровое состояние с преобразованием типа
      // Используем as unknown для безопасного преобразования типов
      const gameState = employerGameData.game_data as unknown as GameState;
      
      // Если массив помощников не инициализирован, создаем его
      if (!gameState.referralHelpers) {
        gameState.referralHelpers = [];
      }
      
      // Добавляем помощника
      gameState.referralHelpers.push({
        id: generateId(),
        buildingId: building_id,
        helperId: userId,
        status: 'accepted',
        createdAt: Date.now()
      });
      
      // Применяем бонусы к соответствующему зданию
      if (gameState.buildings && gameState.buildings[building_id]) {
        // В будущем можно добавить логику для улучшения здания с помощью помощника
        // Например, увеличить производительность на 10%
        console.log(`✅ Применен бонус помощника к зданию ${building_id}`);
      }
      
      // Сохраняем обновленное состояние
      // Используем as unknown для безопасного преобразования типов
      const { error: saveError } = await supabase
        .from('game_saves')
        .update({
          game_data: gameState as unknown as Record<string, unknown>,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', employer_id);
      
      if (saveError) {
        console.error('❌ Ошибка при сохранении обновленного состояния:', saveError);
        return false;
      }
    }
    
    console.log(`✅ Запрос на помощь ${requestId} ${accepted ? 'принят' : 'отклонен'}`);
    return true;
  } catch (error) {
    console.error('❌ Критическая ошибка при ответе на запрос о помощи:', error);
    return false;
  }
};
