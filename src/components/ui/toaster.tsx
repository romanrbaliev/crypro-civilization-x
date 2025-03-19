
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useEffect } from "react"
import { getUserIdentifier } from "@/api/userIdentification"
import { supabase } from "@/integrations/supabase/client"
import { checkSupabaseConnection } from "@/api/connectionUtils"
import { getHelperRequests, getEmployerHelperBuildings } from "@/api/referral/referralHelpers"

export function Toaster() {
  const { toasts } = useToast()
  
  useEffect(() => {
    const storeUserId = async () => {
      try {
        const userId = await getUserIdentifier();
        window.__game_user_id = userId;
        console.log('ID пользователя сохранен в глобальной переменной:', userId);
        
        try {
          // Используем функцию checkSupabaseConnection для проверки соединения
          const isConnected = await checkSupabaseConnection();
          if (isConnected) {
            console.log('✅ Подключение к Supabase подтверждено при загрузке');
            
            // Запрашиваем данные о помощниках и зданиях при загрузке
            const helperResult = await getHelperRequests(userId);
            if (helperResult.success && helperResult.helpers.length > 0) {
              console.log('✅ Получены данные о запросах на помощь при загрузке:', helperResult.helpers.length);
            }
            
            const employerResult = await getEmployerHelperBuildings(userId);
            if (employerResult.success && employerResult.helperBuildings.length > 0) {
              console.log('✅ Получены данные о зданиях с помощниками при загрузке:', employerResult.helperBuildings.length);
            }
          } else {
            console.error('❌ Ошибка подключения к Supabase при загрузке');
          }
        } catch (e) {
          console.error('❌ Ошибка при проверке подключения к Supabase:', e);
        }
      } catch (error) {
        console.error('Ошибка при получении ID пользователя:', error);
      }
    };
    
    storeUserId();
    
    // Улучшенный обработчик для принудительного обновления из БД
    const handleRefresh = async (event) => {
      console.log('Получено событие обновления рефералов');
      try {
        const userId = window.__game_user_id;
        if (userId) {
          console.log('Запрос обновления для пользователя:', userId);
          
          // Проверяем подключение к Supabase (исправлен запрос)
          const { data: connectionCheck, error: connectionError } = await supabase
            .from('referral_data')
            .select('user_id')
            .limit(1);
            
          if (connectionError) {
            console.error('❌ Ошибка подключения к Supabase при обработке обновления:', connectionError);
            return;
          }
          
          console.log('✅ Подключение к Supabase подтверждено при обновлении');
          
          // Получаем реферальный код пользователя
          const { data: referralCodeData } = await supabase
            .from('referral_data')
            .select('referral_code')
            .eq('user_id', userId)
            .single();
            
          if (referralCodeData && referralCodeData.referral_code) {
            const referralCode = referralCodeData.referral_code;
            console.log('Получен реферальный код пользователя:', referralCode);
            
            // Получаем ТОЛЬКО ФАКТЫ из базы данных, не пытаясь интерпретировать
            const { data: referrals, error: referralsError } = await supabase
              .from('referral_data')
              .select('user_id, created_at, is_activated')
              .eq('referred_by', referralCode);
              
            if (referralsError) {
              console.error('❌ Ошибка при получении списка рефералов:', referralsError);
              return;
            }
            
            console.log('Получены рефералы из базы данных:', JSON.stringify(referrals || [], null, 2));
            
            // Проходим по каждому рефералу и передаем только точные данные из БД
            for (const referral of (referrals || [])) {
              console.log(`Реферал ${referral.user_id}, статус в БД:`, {
                is_activated: referral.is_activated,
                typeOfIs_activated: typeof referral.is_activated
              });
              
              // Создаем событие с точным булевым значением из БД
              const isActivatedInDb = referral.is_activated === true;
              
              console.log(`Отправка события с точным статусом активации из БД: ${isActivatedInDb}`);
              
              // Отправляем событие обновления для синхронизации UI с БД
              const updateEvent = new CustomEvent('referral-db-status', {
                detail: { 
                  referralId: referral.user_id,
                  activated: isActivatedInDb
                }
              });
              window.dispatchEvent(updateEvent);
            }
          }
          
          // Обновляем данные о помощниках и зданиях
          const helperResult = await getHelperRequests(userId);
          if (helperResult.success) {
            console.log('✅ Обновлены данные о запросах на помощь:', helperResult.helpers.length);
          }
          
          const employerResult = await getEmployerHelperBuildings(userId);
          if (employerResult.success) {
            console.log('✅ Обновлены данные о зданиях с помощниками:', employerResult.helperBuildings.length);
          }
        }
      } catch (error) {
        console.error('❌ Ошибка при обработке обновления рефералов:', error);
      }
    };
    
    window.addEventListener('refresh-referrals', handleRefresh);
    
    // Обработчик для прямого обновления статуса активации в UI
    const handleReferralDbStatus = (event) => {
      const { referralId, activated } = event.detail;
      console.log(`Получен статус из БД для реферала ${referralId}: активирован=${activated}`);
      
      // Создаем событие для обновления состояния в Redux
      const stateUpdateEvent = new CustomEvent('update-referral-status', {
        detail: { 
          referralId: referralId,
          activated: activated
        }
      });
      window.dispatchEvent(stateUpdateEvent);
    };
    
    window.addEventListener('referral-db-status', handleReferralDbStatus);
    
    // Обработчик событий активации рефералов
    const handleReferralActivated = (event) => {
      const { referralId } = event.detail;
      console.log(`Получено событие активации реферала: ${referralId}`);
      
      // Принудительно запрашиваем обновление из БД после активации
      setTimeout(() => {
        const refreshEvent = new CustomEvent('refresh-referrals');
        window.dispatchEvent(refreshEvent);
      }, 500); // Небольшая задержка для завершения операции в БД
    };
    
    window.addEventListener('referral-activated', handleReferralActivated);
    
    // Обработчик событий обновления статуса найма реферала
    const handleHelperStatusUpdated = (event) => {
      const { buildingId, status } = event.detail;
      console.log(`Получено событие обновления статуса помощника для здания ${buildingId}: ${status}`);
      
      if (status === 'accepted') {
        // Уведомление для помощника
        useToast().toast({
          title: "Вы назначены помощником",
          description: `Вы назначены помощником в здание. Теперь вы приносите +10% к производительности!`,
          variant: "success"
        });
      }
    };
    
    window.addEventListener('helper-status-updated', handleHelperStatusUpdated);
    
    // Обработчик событий с деталями о зданиях, где пользователь является помощником
    const handleHelperBuildingsDetails = (event) => {
      const { buildings } = event.detail;
      console.log(`Получены детали о ${buildings.length} зданиях, где пользователь является помощником:`, buildings);
      
      // Здесь можно отправить событие для обновления UI или добавить дополнительную логику
    };
    
    window.addEventListener('helper-buildings-details', handleHelperBuildingsDetails);
    
    // Обработчик событий с деталями о зданиях с помощниками у работодателя
    const handleEmployerBuildingsHelpers = (event) => {
      const { helperBuildings } = event.detail;
      console.log(`Получены детали о ${helperBuildings.length} зданиях с помощниками у работодателя:`, helperBuildings);
      
      // Здесь можно отправить событие для обновления UI или добавить дополнительную логику
    };
    
    window.addEventListener('employer-buildings-helpers', handleEmployerBuildingsHelpers);
    
    // УБРАНО АВТОМАТИЧЕСКОЕ ОБНОВЛЕНИЕ: не запрашиваем обновление статусов при первом рендере
    // Этот код был причиной постоянного обновления
    // setTimeout(() => {
    //   const refreshEvent = new CustomEvent('refresh-referrals');
    //   window.dispatchEvent(refreshEvent);
    //   console.log('Отправлен запрос на начальное обновление статусов рефералов');
    // }, 2000);
    
    return () => {
      window.removeEventListener('refresh-referrals', handleRefresh);
      window.removeEventListener('referral-db-status', handleReferralDbStatus);
      window.removeEventListener('referral-activated', handleReferralActivated);
      window.removeEventListener('helper-status-updated', handleHelperStatusUpdated);
      window.removeEventListener('helper-buildings-details', handleHelperBuildingsDetails);
      window.removeEventListener('employer-buildings-helpers', handleEmployerBuildingsHelpers);
    };
  }, []);

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
