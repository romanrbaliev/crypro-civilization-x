
import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";

interface LearnButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  shouldHide?: boolean;
}

export const LearnButton: React.FC<LearnButtonProps> = ({ 
  onClick, 
  disabled = false,
  className = "",
  shouldHide = false
}) => {
  // Если shouldHide = true, не рендерим кнопку вообще
  if (shouldHide) return null;
  
  // Создаем обработчик события, который гарантирует однократное выполнение
  const handleClick = useCallback(() => {
    // Вызываем onClick только один раз
    console.log("LearnButton: клик по кнопке");
    onClick();
  }, [onClick]);
  
  return (
    <Button
      onClick={handleClick}
      className={`w-full ${className}`}
      disabled={disabled}
      size="sm"
    >
      Изучать знания
    </Button>
  );
};

export default LearnButton;
