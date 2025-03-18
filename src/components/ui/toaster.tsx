
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
import { GameState } from "@/context/types"

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
    
    // Обновляем обработчик обновления рефералов для более точной синхронизации с БД
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
            
            // Получаем список рефералов пользователя напрямую из базы данных
            const { data: referrals, error: referralsError } = await supabase
              .from('referral_data')
              .select('user_id, created_at, is_activated')
              .eq('referred_by', referralCode);
              
            if (referralsError) {
              console.error('❌ Ошибка при получении списка рефералов:', referralsError);
              return;
            }
            
            console.log('Получены рефералы из базы данных:', referrals);
            
            // Проходим по каждому рефералу и проверяем его состояние, не пытаясь его автоматически изменить
            for (const referral of (referrals || [])) {
              console.log(`Реферал ${referral.user_id}:`, {
                is_activated: referral.is_activated,
                typeOfIs_activated: typeof referral.is_activated
              });
              
              // Отправляем событие обновления чтобы UI отобразил актуальное состояние из БД
              const updateEvent = new CustomEvent('referral-activated', {
                detail: { 
                  referralId: referral.user_id,
                  activated: referral.is_activated === true
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
    
    // Изменяем обработчик события активации реферала для более точного управления состоянием
    const handleReferralActivated = (event) => {
      // Проверяем, есть ли в событии информация об активации
      const { referralId, activated } = event.detail;
      console.log(`Получено событие активации реферала: ${referralId}, статус: ${activated}`);
      
      // Принудительно обновляем интерфейс
      const refreshEvent = new CustomEvent('refresh-referrals');
      window.dispatchEvent(refreshEvent);
    };
    
    window.addEventListener('referral-activated', handleReferralActivated);
    
    return () => {
      window.removeEventListener('refresh-referrals', handleRefresh);
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
