
import { toast } from '@/hooks/use-toast';
import { ToastType } from '@/components/ui/toast';

/**
 * Безопасно отправляет игровое событие для отображения уведомления
 * @param message Сообщение события
 * @param variant Тип события (success, warning, error, info, default)
 */
export const safeDispatchGameEvent = (
  message: string, 
  variant: "success" | "warning" | "error" | "default" | "info" = "default"
): void => {
  if (!message) return;
  
  try {
    // Преобразуем variant в допустимый тип ToastType
    let toastVariant: ToastType = variant as ToastType;
    
    // Специальная обработка для info и error
    if (variant === "info") {
      toastVariant = "default";
    } else if (variant === "error") {
      toastVariant = "destructive";
    }
    
    // Отображаем уведомление
    toast({
      title: getTitle(variant),
      description: message,
      variant: toastVariant,
      duration: 3000
    });
    
    // Также выводим в консоль
    const consoleMethod = 
      variant === "error" ? console.error :
      variant === "warning" ? console.warn :
      console.log;
      
    consoleMethod(`[GameEvent] ${message}`);
    
  } catch (error) {
    console.error("Ошибка при отправке игрового события:", error);
  }
};

// Вспомогательная функция для получения заголовка в зависимости от типа события
function getTitle(variant: string): string {
  switch (variant) {
    case "success": return "Успех!";
    case "warning": return "Внимание!";
    case "error": return "Ошибка!";
    case "info": return "Информация";
    default: return "Уведомление";
  }
}
