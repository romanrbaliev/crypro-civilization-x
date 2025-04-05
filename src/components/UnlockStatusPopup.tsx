
import React, { useEffect, useState } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/i18n';

interface UnlockStatusPopupProps {
  message: string;
  onComplete: () => void;
}

const UnlockStatusPopup: React.FC<UnlockStatusPopupProps> = ({ message, onComplete }) => {
  const { state } = useGame();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 300); // Задержка для анимации исчезновения
    }, 3000);
    
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
          <div className="bg-blue-100 text-blue-800 px-6 py-3 rounded-lg shadow-lg max-w-md text-center">
            <span className="text-lg font-bold">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UnlockStatusPopup;
