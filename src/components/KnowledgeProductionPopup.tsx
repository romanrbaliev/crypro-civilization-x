
import React, { useEffect, useState } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { motion, AnimatePresence } from 'framer-motion';
import { formatNumber } from '@/utils/helpers';
import { useTranslation } from '@/i18n';
import { Progress } from '@/components/ui/progress';
import { useResourceAnimation } from '@/hooks/useResourceAnimation';
import { Book, Zap, Building } from 'lucide-react';

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
  
  // Добавим логирование для отладки
  useEffect(() => {
    console.log('KnowledgeProductionPopup отображается:', { value, animatedValue });
  }, [value, animatedValue]);
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
        >
          <div className="bg-green-100 text-green-800 px-6 py-4 rounded-lg shadow-lg max-w-sm w-full border-2 border-green-300">
            <div className="text-center mb-3">
              <Book className="h-6 w-6 text-green-600 mb-1 mx-auto" />
              <span className="text-xl font-bold">+{formatNumber(animatedValue)} {t('resources.knowledge' as any)}</span>
            </div>
            
            <Progress value={animationProgress} className="h-3 mb-3 bg-green-200" indicatorClassName="bg-green-500" />
            
            {/* Детали процесса */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-sm space-y-2"
                >
                  {baseProduction > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 flex items-center">
                        <Zap className="h-4 w-4 mr-1 text-amber-500" />
                        Базовое производство:
                      </span>
                      <span className="font-medium">+{formatNumber(baseProduction)}/сек</span>
                    </div>
                  )}
                  
                  {buildingProduction > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 flex items-center">
                        <Building className="h-4 w-4 mr-1 text-blue-500" />
                        От зданий:
                      </span>
                      <span className="font-medium">+{formatNumber(buildingProduction)}/сек</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between border-t border-green-200 pt-2 mt-1">
                    <span className="text-gray-700">Текущее значение:</span>
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
