import React from 'react';
import { useGame } from '@/context/hooks/useGame';
import { Button } from '@/components/ui/button';
import { debugKnowledgeProduction } from '@/utils/debugCalculator';
import { useEffect, useState } from 'react';

const DebugCalculator = () => {
  const { state } = useGame();
  const [showDetails, setShowDetails] = useState(false);
  const [calculationSteps, setCalculationSteps] = useState<string[]>([]);
  const [finalValue, setFinalValue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  
  useEffect(() => {
    const updateCalculation = async () => {
      try {
        setLoading(true);
        const { steps, finalValue } = await debugKnowledgeProduction(state);
        setCalculationSteps(steps);
        setFinalValue(finalValue);
      } catch (error) {
        console.error('Ошибка при обновлении расчета:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Обновляем расчет при изменении состояния
    updateCalculation();
    
    // Обновляем расчет при обновлении статуса помощника
    const handleHelperStatusUpdate = () => {
      console.log('Обновление статуса помощника, пересчет...');
      updateCalculation();
    };
    
    if (typeof window !== 'undefined' && window.gameEventBus) {
      window.gameEventBus.addEventListener('helper-status-updated', handleHelperStatusUpdate);
      window.gameEventBus.addEventListener('refresh-referrals', handleHelperStatusUpdate);
      window.gameEventBus.addEventListener('helpers-updated', handleHelperStatusUpdate);
    }
    
    return () => {
      if (typeof window !== 'undefined' && window.gameEventBus) {
        window.gameEventBus.removeEventListener('helper-status-updated', handleHelperStatusUpdate);
        window.gameEventBus.removeEventListener('refresh-referrals', handleHelperStatusUpdate);
        window.gameEventBus.removeEventListener('helpers-updated', handleHelperStatusUpdate);
      }
    };
  }, [state]);
  
  if (__DEV__ !== true) return null;
  
  return (
    <div className="mt-4 hidden sm:block debug-calculator">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-700">Отладочный калькулятор</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs h-6 px-2"
        >
          {showDetails ? 'Скрыть детали' : 'Показать детали'}
        </Button>
      </div>
      
      <div className="mt-2 text-gray-600 text-xs">
        <div className="flex justify-between">
          <span>Производство знаний:</span>
          <span className="font-semibold">{loading ? '...' : `${finalValue.toFixed(2)}/сек`}</span>
        </div>
        
        {showDetails && (
          <div className="mt-2 p-2 bg-gray-50 rounded border whitespace-pre-line">
            {loading ? (
              <div className="text-center py-2">Загрузка данных...</div>
            ) : (
              calculationSteps.map((step, index) => (
                <div key={index}>{step}</div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugCalculator;
