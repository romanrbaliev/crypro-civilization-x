
import React, { useState, useEffect } from "react";
import { useGame } from "@/context/hooks/useGame";
import { Lightbulb, User, BadgeAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { roles } from "@/utils/gameConfig";
import { toast } from "@/hooks/use-toast";

interface SpecializationTabProps {
  onAddEvent: (message: string, type: string) => void;
}

const SpecializationTab: React.FC<SpecializationTabProps> = ({ onAddEvent }) => {
  const { state, dispatch } = useGame();
  
  // Проверяем, доступен ли выбор специализации
  const canChooseSpecialization = state.phase >= 3;
  
  // Массив доступных ролей
  const availableRoles = Object.values(roles).filter(role => role.phase <= state.phase);
  
  // Обработчик выбора специализации
  const handleChooseSpecialization = (roleId: string) => {
    if (state.specialization === roleId) {
      toast({
        title: "Специализация уже выбрана",
        description: `Вы уже выбрали специализацию ${roles[roleId].name}`,
        variant: "default",
      });
      return;
    }
    
    dispatch({ 
      type: "CHOOSE_SPECIALIZATION", 
      payload: { roleId } 
    });
    
    onAddEvent(`Выбрана специализация: ${roles[roleId].name}`, "success");
  };
  
  if (!canChooseSpecialization) {
    return <SpecializationLocked phase={state.phase} />;
  }
  
  if (availableRoles.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <User className="h-10 w-10 mx-auto mb-3 opacity-20" />
        <p className="text-xs">Специализации временно недоступны.<br />Возвращайтесь позже.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {availableRoles.map(role => (
        <SpecializationCard 
          key={role.id}
          role={role}
          isSelected={state.specialization === role.id}
          onSelect={() => handleChooseSpecialization(role.id)}
        />
      ))}
    </div>
  );
};

const SpecializationLocked: React.FC<{ phase: number }> = ({ phase }) => {
  const nextPhase = Math.min(phase + 1, 6);
  
  return (
    <div className="text-center py-6 text-gray-500">
      <BadgeAlert className="h-10 w-10 mx-auto mb-3 opacity-20" />
      <p className="text-xs">Выбор специализации станет доступен в Фазе 3.<br />Сейчас вы находитесь в Фазе {phase}.</p>
      
      <div className="mt-4">
        <Badge variant="outline" className="mx-auto">
          Фаза {nextPhase} разблокируется позже
        </Badge>
      </div>
    </div>
  );
};

const SpecializationCard: React.FC<{ 
  role: any, 
  isSelected: boolean,
  onSelect: () => void 
}> = ({ role, isSelected, onSelect }) => {
  const specializations: { [key: string]: { icon: React.ReactNode, color: string } } = {
    investor: { icon: <span className="text-lg">💼</span>, color: "bg-amber-100 text-amber-800" },
    trader: { icon: <span className="text-lg">📈</span>, color: "bg-blue-100 text-blue-800" },
    miner: { icon: <span className="text-lg">⛏️</span>, color: "bg-stone-100 text-stone-800" },
    influencer: { icon: <span className="text-lg">🌐</span>, color: "bg-purple-100 text-purple-800" },
    analyst: { icon: <span className="text-lg">📊</span>, color: "bg-green-100 text-green-800" },
    founder: { icon: <span className="text-lg">🚀</span>, color: "bg-red-100 text-red-800" },
    arbitrageur: { icon: <span className="text-lg">⚖️</span>, color: "bg-indigo-100 text-indigo-800" },
  };
  
  const spec = specializations[role.id] || { icon: <User size={16} />, color: "bg-gray-100 text-gray-800" };
  
  return (
    <Card className={`overflow-hidden transition-all ${isSelected ? 'border-blue-500 shadow-md' : ''}`}>
      <CardHeader className={`p-3 ${spec.color}`}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            {spec.icon} {role.name}
          </CardTitle>
          {isSelected && <Badge>Выбрано</Badge>}
        </div>
        <CardDescription className="text-[10px] mt-1 line-clamp-2">
          {role.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3">
        <h4 className="text-xs font-medium mb-1">Бонусы:</h4>
        <ul className="space-y-1 text-[10px]">
          {Object.entries(role.bonuses).map(([key, value]) => {
            const formattedValue = Number(value) > 0 ? `+${Number(value) * 100}%` : `${Number(value) * 100}%`;
            const bonusText = formatBonusName(key, formattedValue);
            return (
              <li key={key} className="flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-blue-500"></span>
                {bonusText}
              </li>
            );
          })}
        </ul>
      </CardContent>
      <Separator />
      <CardFooter className="p-2 flex justify-end">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                variant={isSelected ? "outline" : "default"}
                onClick={onSelect}
                className="text-[10px] h-7"
                disabled={isSelected}
              >
                {isSelected ? "Выбрано" : "Выбрать специализацию"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                {isSelected 
                  ? "Вы уже выбрали эту специализацию" 
                  : "Выбор специализации даст вам уникальные бонусы"
                }
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
};

// Вспомогательная функция для форматирования названий бонусов
const formatBonusName = (key: string, value: string): string => {
  const bonusNames: { [key: string]: string } = {
    stakingIncome: `${value} к пассивному доходу`,
    maxCrypto: `${value} к макс. хранению криптовалют`,
    portfolioVolatility: `${value} к волатильности портфеля`,
    tradingProfit: `${value} к прибыли от трейдинга`,
    tradeSpeed: `${value} к скорости сделок`,
    automationBonus: `${value} к автоматизации торговли`,
    hashrateEfficiency: `${value} к эффективности хешрейта`,
    energyConsumption: `${value} к энергопотреблению`,
    blockFindChance: `${value} к шансу нахождения блока`,
    subscriberGrowth: `${value} к росту подписчиков`,
    reputationEfficiency: `${value} к эффективности репутации`,
    marketInfluence: `${value} к влиянию на рынок`,
    fundingEfficiency: `${value} к эффективности сбора средств`,
    projectDevelopmentSpeed: `${value} к скорости разработки проектов`,
    arbitrageProfitBoost: `${value} к прибыли от арбитража`,
    arbitrageOpportunitySpeed: `${value} к скорости обнаружения арбитража`
  };
  
  return bonusNames[key] || `${key}: ${value}`;
};

export default SpecializationTab;
