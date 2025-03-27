
import { getResourceFormat } from '@/utils/resourceFormatConfig';

/**
 * Хук для мгновенного отображения изменений ресурсов без анимации
 * для устранения проблемы с задержкой отображения актуального значения
 */
export const useResourceAnimation = (
  actualValue: number,
  resourceId: string
): number => {
  // Просто возвращаем актуальное значение без анимации
  return actualValue;
};

export default useResourceAnimation;
