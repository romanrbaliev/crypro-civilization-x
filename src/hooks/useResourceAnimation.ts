
import { useState, useEffect, useRef } from 'react';
import { getResourceFormat } from '@/utils/resourceFormatConfig';

/**
 * Хук для анимации плавного изменения значения ресурса
 */
export const useResourceAnimation = (
  actualValue: number,
  resourceId: string
): number => {
  // Просто возвращаем актуальное значение без анимации
  return actualValue;
};

export default useResourceAnimation;
