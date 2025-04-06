
import React, { useEffect, useState } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { motion, AnimatePresence } from 'framer-motion';
import { formatNumber } from '@/utils/helpers';
import { useTranslation } from '@/i18n';
import { Progress } from '@/components/ui/progress';
import { useResourceAnimation } from '@/hooks/useResourceAnimation';

interface KnowledgeProductionPopupProps {
  value: number;
  onComplete: () => void;
}

const KnowledgeProductionPopup: React.FC<KnowledgeProductionPopupProps> = ({ value, onComplete }) => {
  const { state } = useGame();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  
  // Получаем текущее значение знаний
  const currentKnowledge = state.resources.knowledge?.value || 0;
  
  // Используем хук анимации для плавного отображения приращения
  const animatedValue = useResourceAnimation(value, 'knowledge');
  
  // Детали процесса производства знаний
  const baseProduction = state.resources.knowledge?.baseProduction || 0;
  const buildingProduction = 
    (state.resources.knowledge?.production || 0) - 
    (state.resources.knowledge?.baseProduction || 0);
  
  // Задержка перед показом деталей
  useEffect(() => {
    const detailsTimer = setTimeout(() => {
      setShowDetails(true);
    }, 600);
    
    return () => clearTimeout(detailsTimer);
  }, []);
  
  // Эффект для управления прогрессом анимации
  useEffect(() => {
    const intervalId = setInterval(() => {
      setAnimationProgress(prev => {
        const newProgress = prev + 2;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 30);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Эффект для закрытия попапа
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 300); // Задержка для анимации исчезновения
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
        >
          <div className="bg-green-50 text-green-800 px-5 py-3 rounded-lg shadow-lg max-w-xs w-full">
            <div className="text-center mb-2">
              <span className="text-lg font-bold">+{formatNumber(animatedValue)} {t('resources.knowledge' as any)}</span>
            </div>
            
            <Progress value={animationProgress} className="h-2 mb-3" />
            
            {/* Детали процесса */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-xs space-y-1"
                >
                  {baseProduction > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Базовое производство:</span>
                      <span className="font-medium">+{formatNumber(baseProduction)}/сек</span>
                    </div>
                  )}
                  
                  {buildingProduction > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">От зданий:</span>
                      <span className="font-medium">+{formatNumber(buildingProduction)}/сек</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between border-t border-green-200 pt-1 mt-1">
                    <span className="text-gray-600">Текущее значение:</span>
                    <span className="font-medium">{formatNumber(currentKnowledge + animatedValue)}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default KnowledgeProductionPopup;
