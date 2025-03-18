
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
  
  // Добавляем сохранение ID пользователя в глобальную переменную для доступа из других частей приложения
  useEffect(() => {
    const storeUserId = async () => {
      try {
        const userId = await getUserIdentifier();
        // Сохраняем ID пользователя в глобальной переменной
        window.__game_user_id = userId;
        console.log('ID пользователя сохранен в глобальной переменной:', userId);
        
        // Проверка статуса соединения с Supabase при каждой загрузке
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
    
    // Улучшаем обработчик для события обновления из страницы с рефералами
    const handleRefresh = async (event) => {
      console.log('Получено событие обновления рефералов');
      try {
        const userId = window.__game_user_id;
        if (userId) {
          console.log('Запрос обновления для пользователя:', userId);
          
          // Выполняем явную проверку подключения к Supabase
          const { data: connectionCheck, error: connectionError } = await supabase
            .from('referral_data')
            .select('count(*)');
            
          if (connectionError) {
            console.error('❌ Ошибка подключения к Supabase при обработке обновления:', connectionError);
            return;
          }
          
          console.log('✅ Подключение к Supabase подтверждено при обновлении');
          
          // Получаем актуальные данные о рефералах
          const { data: referralCodeData } = await supabase
            .from('referral_data')
            .select('referral_code')
            .eq('user_id', userId)
            .single();
            
          if (referralCodeData && referralCodeData.referral_code) {
            const referralCode = referralCodeData.referral_code;
            console.log('Получен реферальный код пользователя:', referralCode);
            
            // Запрашиваем список рефералов по реферальному коду
            const { data: referrals, error: referralsError } = await supabase
              .from('referral_data')
              .select('user_id, created_at, is_activated')
              .eq('referred_by', referralCode);
              
            if (referralsError) {
              console.error('❌ Ошибка при получении списка рефералов:', referralsError);
              return;
            }
            
            console.log('Получены рефералы из базы данных:', referrals);
            
            // Проверяем каждого реферала на наличие исследования "Основы блокчейна"
            for (const referral of (referrals || [])) {
              console.log(`Проверка статуса активации для реферала ${referral.user_id}`);
              
              // Получаем сохранение игры реферала
              const { data: saveData } = await supabase
                .from('game_saves')
                .select('game_data')
                .eq('user_id', referral.user_id)
                .single();
                
              if (saveData && saveData.game_data) {
                const gameData = saveData.game_data;
                const hasBlockchainBasics = gameData.upgrades && 
                  (gameData.upgrades.blockchain_basics?.purchased || 
                   gameData.upgrades.basicBlockchain?.purchased);
                
                if (hasBlockchainBasics && (!referral.is_activated || referral.is_activated !== true)) {
                  console.log(`Обнаружено исследование "Основы блокчейна" у реферала ${referral.user_id}, но реферал не активирован`);
                  
                  // Обновляем статус активации в базе данных
                  const { error: updateError } = await supabase
                    .from('referral_data')
                    .update({ is_activated: true })
                    .eq('user_id', referral.user_id);
                    
                  if (updateError) {
                    console.error(`❌ Ошибка при обновлении статуса активации реферала ${referral.user_id}:`, updateError);
                  } else {
                    console.log(`✅ Успешно обновлен статус активации реферала ${referral.user_id}`);
                  }
                } else if (!hasBlockchainBasics && referral.is_activated === true) {
                  console.log(`У реферала ${referral.user_id} нет исследования "Основы блокчейна", но реферал активирован в базе`);
                  
                  // Обновляем статус активации в базе данных
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
              }
            }
          }
        }
      } catch (error) {
        console.error('❌ Ошибка при обработке обновления рефералов:', error);
      }
    };
    
    window.addEventListener('refresh-referrals', handleRefresh);
    
    return () => {
      window.removeEventListener('refresh-referrals', handleRefresh);
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
