
import React, { useEffect, useState } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { motion, AnimatePresence } from 'framer-motion';
import { formatNumber } from '@/utils/helpers';
import { useTranslation } from '@/i18n';

interface KnowledgeProductionPopupProps {
  value: number;
  onComplete: () => void;
}

const KnowledgeProductionPopup: React.FC<KnowledgeProductionPopupProps> = ({ value, onComplete }) => {
  const { state } = useGame();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 300); // Задержка для анимации исчезновения
    }, 2000);
    
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
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-lg">
            <span className="text-lg font-bold">+{formatNumber(value)} {t('resources.knowledge' as any)}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default KnowledgeProductionPopup;
