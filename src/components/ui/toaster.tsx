
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

export function Toaster() {
  const { toasts } = useToast()
  
  useEffect(() => {
    const storeUserId = async () => {
      try {
        const userId = await getUserIdentifier();
        window.__game_user_id = userId;
        console.log('ID пользователя сохранен в глобальной переменной:', userId);
        
        try {
          const { data, error } = await supabase.from('referral_data').select('count(*)');
          if (!error) {
            console.log('✅ Подключение к Supabase подтверждено при загрузке');
          } else {
            console.error('❌ Ошибка подключения к Supabase:', error);
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
          
          // Проверяем подключение к Supabase
          const { data: connectionCheck, error: connectionError } = await supabase
            .from('referral_data')
            .select('count(*)');
            
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
              
              // Создаем событие с точным булевым значением из БД, без преобразований типов
              // ВАЖНО: Используем строгое сравнение с true, чтобы избежать автоматического преобразования типов
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
    
    // Запрашиваем обновление статусов при первом рендере
    const refreshEvent = new CustomEvent('refresh-referrals');
    window.dispatchEvent(refreshEvent);
    
    return () => {
      window.removeEventListener('refresh-referrals', handleRefresh);
      window.removeEventListener('referral-db-status', handleReferralDbStatus);
      window.removeEventListener('referral-activated', handleReferralActivated);
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
