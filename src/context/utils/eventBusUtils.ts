
import { toast } from '@/hooks/use-toast';
import { ToastType } from '@/components/ui/toast';

/**
 * Безопасно отправляет игровое событие для отображения уведомления
 * @param message Сообщение события
 * @param variant Тип события (success, warning, error, info)
 */
export const safeDispatchGameEvent = (
  message: string, 
  variant: "success" | "warning" | "error" | "default" = "default"
): void => {
  if (!message) return;
  
  try {
    // Преобразуем variant в допустимый тип ToastType
    const toastVariant: ToastType = 
      variant === "error" ? "destructive" : 
      variant as ToastType;
    
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
    default: return "Уведомление";
  }
}
