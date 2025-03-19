
import React, { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from './ui/dialog';
import { useGame } from '@/context/hooks/useGame';
import { debugKnowledgeProduction } from '@/utils/debugCalculator';
import { formatNumber } from '@/utils/helpers';
import { supabase } from '@/integrations/supabase/client';
import { getUserIdentifier } from '@/api/userIdentification';

const DebugCalculator = () => {
  const { state, updateHelpers } = useGame();
  const [calculationResult, setCalculationResult] = useState<{ steps: string[]; total: number } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDebugActive, setIsDebugActive] = useState(false);

  // Эффект для проверки статусов помощников в базе данных
  useEffect(() => {
    if (isOpen && !isDebugActive) {
      setIsDebugActive(true);
      checkHelpersInDatabase();
    }
    
    if (!isOpen) {
      setIsDebugActive(false);
    }
    
    // Слушатель события обновления помощников
    const handleHelpersUpdated = (event: CustomEvent) => {
      console.log('Получено событие обновления помощников:', event.detail);
      if (event.detail?.updatedHelpers) {
        updateHelpers(event.detail.updatedHelpers);
        // Обновляем расчеты
        if (isOpen) {
          handleCalculate();
        }
      }
    };
    
    window.addEventListener('helpers-updated', handleHelpersUpdated as EventListener);
    
    return () => {
      window.removeEventListener('helpers-updated', handleHelpersUpdated as EventListener);
    };
  }, [isOpen, isDebugActive]);

  // Функция для проверки статусов помощников в базе данных
  const checkHelpersInDatabase = async () => {
    try {
      const userId = await getUserIdentifier();
      
      if (!userId) {
        console.error('Не удалось получить ID пользователя');
        return;
      }
      
      const { data, error } = await supabase
        .from('referral_helpers')
        .select('*')
        .eq('employer_id', userId);
      
      if (error) {
        console.error('Ошибка при получении данных о помощниках:', error);
        return;
      }
      
      if (!data || data.length === 0) {
        console.log('В БД не найдено записей о помощниках');
        return;
      }
      
      console.log('Данные о помощниках из базы данных:', data);
      
      // Сравниваем с локальным состоянием
      const localHelpers = state.referralHelpers;
      
      let needsUpdate = false;
      const updatedHelpers = [...localHelpers];
      
      data.forEach(dbHelper => {
        const localHelperIndex = localHelpers.findIndex(
          h => h.helperId === dbHelper.helper_id && h.buildingId === dbHelper.building_id
        );
        
        if (localHelperIndex >= 0) {
          const localHelper = localHelpers[localHelperIndex];
          if (localHelper.status !== dbHelper.status) {
            console.log(`Несоответствие статуса помощника ${dbHelper.helper_id}: в БД - ${dbHelper.status}, локально - ${localHelper.status}`);
            updatedHelpers[localHelperIndex] = {
              ...localHelper,
              status: dbHelper.status as 'pending' | 'accepted' | 'rejected'
            };
            needsUpdate = true;
          }
        }
      });
      
      if (needsUpdate) {
        console.log('Обновление помощников из базы данных:', updatedHelpers);
        updateHelpers(updatedHelpers);
      }
    } catch (error) {
      console.error('Ошибка при проверке помощников в базе данных:', error);
    }
  };

  const handleCalculate = () => {
    const result = debugKnowledgeProduction(state);
    setCalculationResult(result);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2 w-full flex items-center justify-center gap-2 text-xs"
          onClick={handleCalculate}
        >
          <Calculator className="h-3.5 w-3.5" />
          Анализ накопления знаний
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Детальный расчет накопления знаний</DialogTitle>
          <DialogDescription className="text-center">
            Пошаговый анализ скорости накопления знаний с учетом обновленной логики бонусов (5% для реферрера)
          </DialogDescription>
        </DialogHeader>

        {calculationResult && (
          <div className="space-y-4">
            <div className="border p-3 rounded-md bg-blue-50">
              <p className="font-semibold">Итоговая скорость накопления: {formatNumber(calculationResult.total)}/сек</p>
              <p className="text-xs text-gray-600">
                Значение в интерфейсе: {state.resources.knowledge?.perSecond ? formatNumber(state.resources.knowledge.perSecond) : '0'}/сек
              </p>
              {Math.abs(calculationResult.total - (state.resources.knowledge?.perSecond || 0)) > 0.01 && (
                <p className="text-xs text-red-600 font-semibold mt-1">
                  Обнаружено расхождение! Разница: {Math.abs(calculationResult.total - (state.resources.knowledge?.perSecond || 0)).toFixed(2)}/сек
                </p>
              )}
            </div>
            
            <Button 
              variant="outline"
              size="sm"
              className="w-full"
              onClick={checkHelpersInDatabase}
            >
              Проверить помощников в базе данных
            </Button>
            
            <div className="space-y-2">
              {calculationResult.steps.map((step, index) => (
                <div 
                  key={index} 
                  className={`p-2 text-sm ${
                    step.includes('Шаг') 
                      ? 'font-semibold border-b pb-1' 
                      : step.includes('Итого') || step.includes('Итоговая')
                        ? 'font-semibold text-blue-600' 
                        : step.includes('расхождение') || step.includes('Ошибка')
                          ? 'text-red-600 font-semibold'
                          : 'pl-4'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mt-4">
              <DialogClose asChild>
                <Button className="w-full">Закрыть</Button>
              </DialogClose>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DebugCalculator;
