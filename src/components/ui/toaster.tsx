
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
        
        // НОВОЕ: Проверка статуса соединения с Supabase при каждой загрузке
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
    
    // Также добавляем листенер для события обновления из страницы с рефералами
    const handleRefresh = async (event: CustomEvent) => {
      console.log('Получено событие обновления рефералов');
      try {
        // Обработка обновления, например, очистка кэша или запрос новых данных
        console.log('Выполняем обновление данных о рефералах...');
        
        const userId = window.__game_user_id;
        if (userId) {
          // Здесь можно добавить логику обновления данных через суперрбазу
          console.log('Запрос обновления для пользователя:', userId);
          
          // Проверяем соединение после нажатия кнопки обновления
          const { data, error } = await supabase
            .from('referral_data')
            .select('*')
            .eq('user_id', userId);
          
          if (!error) {
            console.log('✅ Данные о рефералах успешно обновлены:', data);
          } else {
            console.error('❌ Ошибка при обновлении данных о рефералах:', error);
          }
        }
      } catch (error) {
        console.error('Ошибка при обработке обновления:', error);
      }
    };
    
    window.addEventListener('refresh-referrals' as any, handleRefresh);
    
    return () => {
      window.removeEventListener('refresh-referrals' as any, handleRefresh);
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
