
import { useState, useEffect, useRef } from 'react';
import { getResourceFormat } from '@/utils/resourceFormatConfig';

/**
 * Хук для обработки значения ресурса без анимации изменения
 * для мгновенного отображения текущего значения
 */
export const useResourceAnimation = (
  actualValue: number,
  resourceId: string
): number => {
  // Просто возвращаем актуальное значение напрямую без анимации
  return actualValue;
};

export default useResourceAnimation;
