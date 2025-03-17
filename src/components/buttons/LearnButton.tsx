
import React from "react";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

interface LearnButtonProps {
  onClick: () => void;
}

export const LearnButton: React.FC<LearnButtonProps> = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      className="w-full"
      variant="default"
      size="sm"
    >
      <Brain className="mr-2 h-4 w-4" />
      Изучить крипту
    </Button>
  );
};

export default LearnButton;
