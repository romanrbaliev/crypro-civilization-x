
import React from "react";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

interface LearnButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export const LearnButton: React.FC<LearnButtonProps> = ({ 
  onClick, 
  disabled = false,
  className = ""
}) => {
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
