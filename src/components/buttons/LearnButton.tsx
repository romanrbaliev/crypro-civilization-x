
import React from "react";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

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
      variant="default"
      size="sm"
      disabled={disabled}
    >
      <Brain className="mr-2 h-4 w-4" />
      Изучить крипту
    </Button>
  );
};

export default LearnButton;
