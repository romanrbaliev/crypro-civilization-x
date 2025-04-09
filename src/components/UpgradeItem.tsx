
import React from "react";
import { Beaker } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { Upgrade } from "@/context/types";
import { useGame } from "@/context/hooks/useGame";
import { formatNumber } from "@/utils/helpers";
import { t } from "@/localization";

interface UpgradeItemProps {
  upgrade: Upgrade;
  onAddEvent?: (message: string, type: string) => void;
}

const UpgradeItem: React.FC<UpgradeItemProps> = ({ upgrade, onAddEvent }) => {
  const { state, dispatch } = useGame();
  const [isOpen, setIsOpen] = React.useState(false);

  const handlePurchase = () => {
    // Отправляем действие на покупку апгрейда
    dispatch({ 
      type: "PURCHASE_UPGRADE", 
      payload: { upgradeId: upgrade.id } 
    });
    
    // Отправляем событие в журнал
    if (onAddEvent) {
      onAddEvent(
        t("events.researchComplete", [t(`upgrades.${upgrade.id}.name`)]), 
        "success"
      );
    }
  };

  const canAfford = (): boolean => {
    if (upgrade.purchased) return false;
    
    for (const [resourceId, amount] of Object.entries(upgrade.cost)) {
      const resource = state.resources[resourceId];
      if (!resource || resource.value < Number(amount)) {
        return false;
      }
    }
    return true;
  };

  // Получаем локализованное имя и описание
  const name = t(`upgrades.${upgrade.id}.name`);
  const description = t(`upgrades.${upgrade.id}.description`);

  // Рендер стоимости
  const renderCost = () => {
    return Object.entries(upgrade.cost).map(([resourceId, amount]) => {
      const resource = state.resources[resourceId];
      const hasEnough = resource && resource.value >= Number(amount);
      
      return (
        <div key={resourceId} className="text-xs flex justify-between">
          <span className={hasEnough ? 'text-gray-600' : 'text-red-500'}>
            {resource ? t(`resources.${resourceId}.name`) : resourceId}:
          </span>
          <span className={hasEnough ? 'text-gray-600' : 'text-red-500'}>
            {formatNumber(Number(amount))}
          </span>
        </div>
      );
    });
  };

  const isPurchased = upgrade.purchased;

  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={setIsOpen}
      className={`border rounded-lg ${isPurchased ? 'bg-gray-50' : canAfford() ? 'bg-white' : 'bg-gray-100'} mb-2`}
    >
      <CollapsibleTrigger className="w-full text-left">
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center">
            <Beaker className="h-4 w-4 mr-2 text-blue-500" />
            <div>
              <h3 className="text-xs font-medium">{name}</h3>
            </div>
          </div>
          <ChevronRight className={`h-4 w-4 transform transition-transform ${isOpen ? 'rotate-90' : ''}`} />
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="p-2 pt-0 border-t">
          <p className="text-xs text-gray-500 mb-2">{description}</p>
          
          {!isPurchased && (
            <>
              <div className="mb-2">
                <h4 className="text-xs font-medium mb-1">{t("ui.states.sections.cost")}</h4>
                {renderCost()}
              </div>
              
              <Button
                onClick={handlePurchase}
                disabled={!canAfford()}
                size="sm"
                className="w-full text-xs"
                variant={canAfford() ? "default" : "secondary"}
              >
                {t("ui.actions.research")}
              </Button>
            </>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default UpgradeItem;
