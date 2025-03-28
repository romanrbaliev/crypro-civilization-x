
import React from "react";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

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
  
  return (
    <Button
      onClick={onClick}
      className={`w-full ${className}`}
      disabled={disabled}
      size="sm"
    >
      <BookOpen className="mr-2 h-4 w-4" />
      Изучать знания
    </Button>
  );
};

export default LearnButton;
