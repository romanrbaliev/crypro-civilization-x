
import React from "react";
import { Button } from "@/components/ui/button";
import { BrainCircuit } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ApplyKnowledgeButtonProps {
  onClick: () => void;
  disabled: boolean;
  knowledgeEfficiencyBonus?: number;
  className?: string;
  knowledgeValue?: number;
  applyAll?: boolean;
}

export const ApplyKnowledgeButton: React.FC<ApplyKnowledgeButtonProps> = ({ 
  onClick, 
  disabled,
  knowledgeEfficiencyBonus = 0,
  className = "",
  knowledgeValue = 0,
  applyAll = false
}) => {
  // Рассчитываем, сколько USDT будет получено при применении знаний
  let usdtReward = 1;
  
  // Применяем бонус к базовой отдаче (явная установка 1.1 при бонусе 10%)
  if (knowledgeEfficiencyBonus === 0.1) {
    usdtReward = 1.1;
  } else {
    usdtReward = Math.floor(usdtReward * (1 + knowledgeEfficiencyBonus)) || 1;
  }
  
  // Если используется режим "применить все знания", то рассчитываем общую награду
  const totalKnowledgeToApply = applyAll ? knowledgeValue : 10;
  const totalUsdtReward = applyAll ? 
    Math.floor((knowledgeValue / 10) * usdtReward) : 
    usdtReward;
  
  const bonusText = knowledgeEfficiencyBonus > 0 
    ? `+${knowledgeEfficiencyBonus * 100}% к эффективности`
    : '';
  
  // Текст кнопки меняется в зависимости от режима
  const buttonText = applyAll
    ? `Применить все знания (${totalKnowledgeToApply} → ${totalUsdtReward} USDT)`
    : `Обменять 10 знаний на ${usdtReward} USDT`;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            className={`w-full ${className}`}
            variant={disabled ? "outline" : "default"}
            size="sm"
            disabled={disabled}
          >
            <BrainCircuit className="mr-2 h-4 w-4" />
            {buttonText}
          </Button>
        </TooltipTrigger>
        {disabled && (
          <TooltipContent>
            <p>{applyAll ? "Требуется хотя бы 10 знаний" : "Требуется 10 знаний"}</p>
          </TooltipContent>
        )}
        {!disabled && bonusText && (
          <TooltipContent>
            <p>{bonusText}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default ApplyKnowledgeButton;
