
import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { 
  calculateKnowledgeProductionSteps,
  logKnowledgeCalculationSteps 
} from '@/utils/helpers';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const KnowledgeCalculator = () => {
  const { state } = useGame();
  const [steps, setSteps] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [totalPerSecond, setTotalPerSecond] = useState(0);
  const [userId, setUserId] = useState<string>('');

  // Получаем ID пользователя из глобальной переменной
  useEffect(() => {
    if (typeof window !== 'undefined' && window.__game_user_id) {
      setUserId(window.__game_user_id);
    }
  }, []);

  // Слушаем событие с шагами расчета
  useEffect(() => {
    const handleCalculationSteps = (event: CustomEvent) => {
      const { steps } = event.detail;
      setSteps(steps);
      setIsOpen(true);
    };

    window.addEventListener('knowledge-calculation-steps', handleCalculationSteps as EventListener);
    
    return () => {
      window.removeEventListener('knowledge-calculation-steps', handleCalculationSteps as EventListener);
    };
  }, []);

  const handleCalculate = () => {
    if (!userId) return;
    
    // Получаем текущее состояние игры
    const { resources, buildings, referralHelpers, referrals } = state;
    
    // Выполняем расчет
    const calculationResult = calculateKnowledgeProductionSteps(
      userId,
      resources,
      buildings,
      referralHelpers,
      referrals
    );
    
    // Устанавливаем состояние
    setSteps(calculationResult.steps);
    setTotalPerSecond(calculationResult.totalPerSecond);
    
    // Логируем шаги расчета
    logKnowledgeCalculationSteps(userId, calculationResult.steps);
    
    // Открываем диалог
    setIsOpen(true);
  };

  return (
    <>
      <Button 
        variant="outline"
        onClick={handleCalculate}
        className="mt-2 w-full"
      >
        Рассчитать производство знаний
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Расчет производства знаний</DialogTitle>
            <DialogDescription>
              Пошаговый расчет скорости накопления знаний для пользователя {userId}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-2 py-2">
              {steps.map((step, index) => {
                if (step.startsWith('Шаг')) {
                  return (
                    <h3 key={index} className="text-md font-semibold mt-3 first:mt-0">
                      {step}
                    </h3>
                  );
                } else if (step.startsWith('Формула:')) {
                  return (
                    <div key={index} className="bg-blue-100 dark:bg-blue-900 p-2 rounded">
                      {step}
                    </div>
                  );
                } else if (step.startsWith('Расчет:')) {
                  return (
                    <div key={index} className="bg-green-100 dark:bg-green-900 p-2 rounded">
                      {step}
                    </div>
                  );
                } else if (step.includes('Суммарное производство')) {
                  return (
                    <div key={index} className="bg-purple-100 dark:bg-purple-900 p-2 rounded text-lg font-bold">
                      {step}
                    </div>
                  );
                } else if (step.includes('Найдено здание')) {
                  return (
                    <div key={index} className="bg-amber-100 dark:bg-amber-900 p-2 rounded font-semibold">
                      {step}
                    </div>
                  );
                } else {
                  return <p key={index}>{step}</p>;
                }
              })}
            </div>
          </ScrollArea>
          
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md mt-2">
            <p className="font-bold text-lg">
              Итоговая скорость накопления: {totalPerSecond} знаний/сек
            </p>
          </div>
          
          <Button onClick={() => setIsOpen(false)} className="mt-2">
            Закрыть
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KnowledgeCalculator;
