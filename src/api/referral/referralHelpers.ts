
import { supabase } from '@/integrations/supabase/client';
import { checkSupabaseConnection } from '../connectionUtils';
import { toast } from '@/hooks/use-toast';
import { REFERRAL_HELPERS_TABLE } from '../apiTypes';

// Кэш для отслеживания показанных уведомлений
const notificationsCache = new Set<string>();

/**
 * Обновляет статус запроса помощника в базе данных
 * @param helperId ID помощника
 * @param status Новый статус запроса
 * @param buildingId ID здания (опционально для принятых запросов)
 */
export const updateHelperRequestStatus = async (
  helperId: string, 
  status: 'pending' | 'accepted' | 'rejected',
  buildingId?: string
): Promise<boolean> => {
  try {
    console.log(`Обновление статуса помощника в БД: helperId=${helperId}, status=${status}, buildingId=${buildingId || 'не указано'}`);
    
    // Проверяем соединение с Supabase
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.error('❌ Нет соединения с Supabase при обновлении статуса помощника');
      toast({
        title: "Ошибка соединения",
        description: "Не удалось подключиться к базе данных",
        variant: "destructive"
      });
      return false;
    }
    
    // Обновляем запись в таблице referral_helpers
    const { data, error } = await supabase
      .from(REFERRAL_HELPERS_TABLE)
      .update({ 
        status: status,
        building_id: buildingId || '', // Обновляем buildingId если он указан
        created_at: new Date().toISOString() // используем created_at как updated_at, т.к. отдельного поля нет
      })
      .eq('helper_id', helperId)
      .select();
      
    if (error) {
      console.error('❌ Ошибка при обновлении статуса помощника:', error);
      toast({
        title: "Ошибка обновления",
        description: "Не удалось обновить статус помощника в базе данных",
        variant: "destructive"
      });
      return false;
    }
    
    console.log(`✅ Статус помощника успешно обновлен в БД:`, data);
    
    // Если запрос принят, обновляем информацию о реферале
    if (status === 'accepted' && buildingId) {
      const { error: referralError } = await supabase
        .from('referral_data')
        .update({ 
          is_activated: true  // Реферал теперь активирован
          // Поля hired и assigned_building_id не существуют в таблице
          // Эта информация будет храниться в состоянии приложения
        })
        .eq('user_id', helperId);
        
      if (referralError) {
        console.error('❌ Ошибка при обновлении статуса активации реферала:', referralError);
        toast({
          title: "Внимание",
          description: "Статус помощника обновлен, но не удалось обновить статус активации",
          variant: "warning"
        });
      } else {
        console.log(`✅ Статус активации реферала успешно обновлен в БД для ${helperId}`);
      }
      
      // Отправляем событие обновления для синхронизации с UI
      setTimeout(() => {
        try {
          // Событие для обновления UI у работодателя
          const employerEvent = new CustomEvent('referral-hire-status-updated', {
            detail: { 
              referralId: helperId, 
              hired: true, 
              buildingId 
            }
          });
          window.dispatchEvent(employerEvent);
          
          // Событие для обновления у помощника
          const helperEvent = new CustomEvent('helper-status-updated', {
            detail: { 
              buildingId,
              status: 'accepted'
            }
          });
          window.dispatchEvent(helperEvent);
          
          console.log(`✅ Отправлены события обновления статуса найма для помощника ${helperId} и здания ${buildingId}`);
          
          // Принудительно запрашиваем обновление из БД
          const refreshEvent = new CustomEvent('refresh-referrals');
          window.dispatchEvent(refreshEvent);
        } catch (error) {
          console.error('❌ Ошибка при отправке событий обновления статуса:', error);
        }
      }, 500);
      
      // Используем уникальный ключ для уведомления, чтобы избежать дублей
      const notificationKey = `helper-assigned-${helperId}-${buildingId}`;
      if (!notificationsCache.has(notificationKey)) {
        notificationsCache.add(notificationKey);
        toast({
          title: "Статус обновлен",
          description: `Помощник успешно назначен в здание. Теперь производительность здания увеличена на 10%!`,
          variant: "success"
        });
      }
    } else if (status === 'rejected') {
      toast({
        title: "Запрос отклонен",
        description: "Запрос на помощь был отклонен",
        variant: "info"
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Неожиданная ошибка при обновлении статуса помощника:', error);
    toast({
      title: "Ошибка системы",
      description: "Произошла неожиданная ошибка при обновлении статуса",
      variant: "destructive"
    });
    return false;
  }
};

/**
 * Получает список запросов помощников для пользователя и обновляет состояние игры
 * @param userId ID пользователя
 * @param updateGameState Функция для обновления состояния игры (опционально)
 */
export const getHelperRequests = async (userId: string, updateGameState?: Function) => {
  try {
    console.log(`Запрос списка помощников для пользователя: ${userId}`);
    
    // Проверяем соединение с Supabase
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.error('❌ Нет соединения с Supabase при получении списка помощников');
      return { success: false, helpers: [] };
    }
    
    // Получаем список запросов, где пользователь является помощником
    const { data, error } = await supabase
      .from(REFERRAL_HELPERS_TABLE)
      .select('*')
      .eq('helper_id', userId);
      
    if (error) {
      console.error('❌ Ошибка при получении списка запросов помощников:', error);
      return { success: false, helpers: [] };
    }
    
    console.log(`✅ Получен список запросов помощников:`, data);
    
    // Если передана функция обновления состояния, обновляем локальное состояние игры
    if (updateGameState && typeof updateGameState === 'function') {
      try {
        // Преобразуем данные из БД в формат, подходящий для состояния игры
        const helperRequests = (data || []).map(helper => ({
          helperId: helper.helper_id,
          employerId: helper.employer_id,
          buildingId: helper.building_id,
          status: helper.status as 'pending' | 'accepted' | 'rejected'
        }));
        
        updateGameState(helperRequests);
        console.log(`✅ Локальное состояние помощников обновлено:`, helperRequests);
      } catch (updateError) {
        console.error('❌ Ошибка при обновлении локального состояния:', updateError);
      }
    }
    
    // Отображаем уведомление о статусе помощника, если есть принятые запросы
    const acceptedRequests = data?.filter(req => req.status === 'accepted') || [];
    if (acceptedRequests.length > 0) {
      // Используем уникальный ключ для уведомления, чтобы избежать дублей
      const notificationKey = `helper-status-${userId}-${acceptedRequests.length}`;
      if (!notificationsCache.has(notificationKey)) {
        notificationsCache.add(notificationKey);
        
        toast({
          title: "Вы являетесь помощником",
          description: `Вы помогаете в ${acceptedRequests.length} зданиях, увеличивая их производительность на 10%`,
          variant: "info"
        });
      }
      
      // Отправляем деталей о зданиях, где пользователь является помощником
      setTimeout(() => {
        try {
          const helperDetailsEvent = new CustomEvent('helper-buildings-details', {
            detail: { 
              buildings: acceptedRequests.map(req => ({
                buildingId: req.building_id,
                employerId: req.employer_id
              }))
            }
          });
          window.dispatchEvent(helperDetailsEvent);
          console.log(`✅ Отправлены детали зданий, где пользователь является помощником:`, 
            acceptedRequests.map(req => req.building_id));
        } catch (error) {
          console.error('❌ Ошибка при отправке деталей зданий помощника:', error);
        }
      }, 300);
    }
    
    return { success: true, helpers: data || [] };
  } catch (error) {
    console.error('❌ Неожиданная ошибка при получении списка помощников:', error);
    return { success: false, helpers: [] };
  }
};

/**
 * Получает список зданий, в которых работают помощники и обновляет состояние игры
 * @param userId ID пользователя-работодателя
 * @param updateGameState Функция для обновления состояния игры (опционально)
 */
export const getEmployerHelperBuildings = async (userId: string, updateGameState?: Function) => {
  try {
    console.log(`Запрос списка зданий с помощниками для работодателя: ${userId}`);
    
    // Проверяем соединение с Supabase
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.error('❌ Нет соединения с Supabase при получении списка зданий с помощниками');
      return { success: false, helperBuildings: [] };
    }
    
    // Получаем список принятых запросов, где пользователь является работодателем
    const { data, error } = await supabase
      .from(REFERRAL_HELPERS_TABLE)
      .select('*')
      .eq('employer_id', userId)
      .eq('status', 'accepted');
      
    if (error) {
      console.error('❌ Ошибка при получении списка зданий с помощниками:', error);
      return { success: false, helperBuildings: [] };
    }
    
    console.log(`✅ Получен список зданий с помощниками:`, data);
    
    // Если передана функция обновления состояния, обновляем локальное состояние игры
    if (updateGameState && typeof updateGameState === 'function') {
      try {
        // Преобразуем данные из БД в формат, подходящий для состояния игры
        const helperRequests = (data || []).map(helper => ({
          helperId: helper.helper_id,
          employerId: helper.employer_id,
          buildingId: helper.building_id,
          status: helper.status as 'pending' | 'accepted' | 'rejected'
        }));
        
        updateGameState(helperRequests);
        console.log(`✅ Локальное состояние помощников работодателя обновлено:`, helperRequests);
      } catch (updateError) {
        console.error('❌ Ошибка при обновлении локального состояния работодателя:', updateError);
      }
    }
    
    // Группируем здания по ID для подсчета количества помощников в каждом здании
    const buildingHelpers = (data || []).reduce((acc, helper) => {
      if (!acc[helper.building_id]) {
        acc[helper.building_id] = [];
      }
      acc[helper.building_id].push(helper.helper_id);
      return acc;
    }, {} as Record<string, string[]>);
    
    // Преобразуем в массив для удобства использования
    const helperBuildings = Object.entries(buildingHelpers).map(([buildingId, helperIds]) => ({
      buildingId,
      helperIds,
      boostPercentage: helperIds.length * 10 // 10% за каждого помощника
    }));
    
    // Если есть здания с помощниками, отображаем уведомление
    if (helperBuildings.length > 0) {
      // Используем уникальный ключ для уведомления, чтобы избежать дублей
      const notificationKey = `employer-buildings-${userId}-${helperBuildings.length}`;
      if (!notificationsCache.has(notificationKey)) {
        notificationsCache.add(notificationKey);
        
        toast({
          title: "Активные помощники",
          description: `У вас ${helperBuildings.length} ${helperBuildings.length === 1 ? 'здание' : 'зданий'} с активными помощниками`,
          variant: "info"
        });
      }
      
      // Отправляем события для обновления UI
      setTimeout(() => {
        try {
          const employerDetailsEvent = new CustomEvent('employer-buildings-helpers', {
            detail: { helperBuildings }
          });
          window.dispatchEvent(employerDetailsEvent);
          console.log(`✅ Отправлены детали зданий с помощниками:`, helperBuildings);
        } catch (error) {
          console.error('❌ Ошибка при отправке деталей зданий с помощниками:', error);
        }
      }, 300);
    }
    
    return { success: true, helperBuildings };
  } catch (error) {
    console.error('❌ Неожиданная ошибка при получении списка зданий с помощниками:', error);
    return { success: false, helperBuildings: [] };
  }
};

/**
 * Синхронизирует данные помощников с локальным состоянием игры
 * @param userId ID пользователя
 * @param updateGameState Функция для обновления состояния игры
 */
export const syncHelperDataWithGameState = async (userId: string, updateGameState: Function) => {
  try {
    console.log(`Синхронизация данных помощников для пользователя: ${userId}`);
    
    // Проверяем соединение с Supabase
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.error('❌ Нет соединения с Supabase при синхронизации данных помощников');
      return false;
    }
    
    // Получаем все запросы, связанные с пользователем (как помощником, так и работодателем)
    const { data: helperData, error: helperError } = await supabase
      .from(REFERRAL_HELPERS_TABLE)
      .select('*')
      .or(`helper_id.eq.${userId},employer_id.eq.${userId}`);
      
    if (helperError) {
      console.error('❌ Ошибка при получении данных помощников:', helperError);
      return false;
    }
    
    // Преобразуем данные из БД в формат, подходящий для состояния игры
    const helperRequests = (helperData || []).map(helper => ({
      helperId: helper.helper_id,
      employerId: helper.employer_id,
      buildingId: helper.building_id,
      status: helper.status as 'pending' | 'accepted' | 'rejected'
    }));
    
    // Обновляем локальное состояние игры
    updateGameState(helperRequests);
    console.log(`✅ Данные помощников синхронизированы с локальным состоянием:`, helperRequests);
    
    return true;
  } catch (error) {
    console.error('❌ Неожиданная ошибка при синхронизации данных помощников:', error);
    return false;
  }
};

// Экспортируем функцию для очистки кэша уведомлений (для тестирования)
export const clearNotificationsCache = () => {
  notificationsCache.clear();
};
