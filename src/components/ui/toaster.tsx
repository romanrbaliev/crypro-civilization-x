
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
    
    const handleRefresh = async (event) => {
      console.log('Получено событие обновления рефералов');
      try {
        const userId = window.__game_user_id;
        if (userId) {
          console.log('Запрос обновления для пользователя:', userId);
          
          const { data: connectionCheck, error: connectionError } = await supabase
            .from('referral_data')
            .select('count(*)');
            
          if (connectionError) {
            console.error('❌ Ошибка подключения к Supabase при обработке обновления:', connectionError);
            return;
          }
          
          console.log('✅ Подключение к Supabase подтверждено при обновлении');
          
          const { data: referralCodeData } = await supabase
            .from('referral_data')
            .select('referral_code')
            .eq('user_id', userId)
            .single();
            
          if (referralCodeData && referralCodeData.referral_code) {
            const referralCode = referralCodeData.referral_code;
            console.log('Получен реферальный код пользователя:', referralCode);
            
            const { data: referrals, error: referralsError } = await supabase
              .from('referral_data')
              .select('user_id, created_at, is_activated')
              .eq('referred_by', referralCode);
              
            if (referralsError) {
              console.error('❌ Ошибка при получении списка рефералов:', referralsError);
              return;
            }
            
            console.log('Получены рефералы из базы данных:', referrals);
            
            for (const referral of (referrals || [])) {
              const { data: saveData } = await supabase
                .from('game_saves')
                .select('game_data')
                .eq('user_id', referral.user_id)
                .single();
                
              if (saveData && saveData.game_data) {
                const gameData = saveData.game_data as unknown;
                
                if (typeof gameData === 'object' && gameData !== null) {
                  const typedGameData = gameData as Partial<GameState>;
                  
                  const hasBlockchainBasics = typedGameData.upgrades && 
                    (typedGameData.upgrades['blockchain_basics']?.purchased || 
                     typedGameData.upgrades['basicBlockchain']?.purchased);
                
                  // Надежное преобразование is_activated в булевое значение
                  let isActivated = false;
                  if (referral.is_activated !== null && referral.is_activated !== undefined) {
                    isActivated = typeof referral.is_activated === 'boolean' 
                      ? referral.is_activated 
                      : String(referral.is_activated).toLowerCase() === 'true';
                  }
                
                  console.log(`Реферал ${referral.user_id}:`, {
                    hasBlockchainBasics,
                    is_activated: referral.is_activated,
                    isActivated,
                    typeOfIs_activated: typeof referral.is_activated
                  });
                
                  if (hasBlockchainBasics && !isActivated) {
                    console.log(`Обнаружено исследование "Основы блокчейна" у реферала ${referral.user_id}, но реферал не активирован`);
                    
                    // Обновляем статус в БД
                    const { error: updateError } = await supabase
                      .from('referral_data')
                      .update({ is_activated: true })
                      .eq('user_id', referral.user_id);
                      
                    if (updateError) {
                      console.error(`❌ Ошибка при обновлении статуса активации реферала ${referral.user_id}:`, updateError);
                    } else {
                      console.log(`✅ Успешно обновлен статус активации реферала ${referral.user_id}`);
                      
                      // Принудительно отправляем событие для обновления интерфейса
                      const updateEvent = new CustomEvent('referral-activated', {
                        detail: { referralId: referral.user_id }
                      });
                      window.dispatchEvent(updateEvent);
                    }
                  } else if (!hasBlockchainBasics && isActivated) {
                    console.log(`У реферала ${referral.user_id} нет исследования "Основы блокчейна", но реферал активирован в базе`);
                    
                    const { error: updateError } = await supabase
                      .from('referral_data')
                      .update({ is_activated: false })
                      .eq('user_id', referral.user_id);
                      
                    if (updateError) {
                      console.error(`❌ Ошибка при обновлении статуса активации реферала ${referral.user_id}:`, updateError);
                    } else {
                      console.log(`✅ Успешно обновлен статус активации реферала ${referral.user_id}`);
                    }
                  }
                } else {
                  console.warn(`Данные игры для пользователя ${referral.user_id} имеют неверный формат:`, gameData);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('❌ Ошибка при обработке обновления рефералов:', error);
      }
    };
    
    window.addEventListener('refresh-referrals', handleRefresh);
    
    // Добавляем обработчик события активации реферала
    const handleReferralActivated = (event) => {
      const { referralId } = event.detail;
      console.log(`Получено событие активации реферала: ${referralId}`);
      
      // Принудительно обновляем кэш и форсируем обновление интерфейса
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
