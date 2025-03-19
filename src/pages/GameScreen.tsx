import React, { useEffect, useState } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { Building, Resource } from '@/context/types';
import { formatNumber } from '@/utils/helpers';
import { Header } from '@/components/Header';
import { BuildingItem } from '@/components/BuildingItem';
import { UpgradeItem } from '@/components/UpgradeItem';
import { calculateTimeToReach } from '@/utils/helpers';
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useReferral } from '@/context/hooks/useReferral';
import { ReferralPanel } from '@/components/ReferralPanel';
import { ReferralHelpersPanel } from '@/components/ReferralHelpersPanel';

// Импортируем новый компонент
import KnowledgeCalculator from '@/components/KnowledgeCalculator';

const ResourceList = ({ resources }: { resources: [string, Resource][] }) => (
  <ul className="space-y-2">
    {resources.map(([id, resource]) => (
      <li key={id} className="flex justify-between items-center">
        <span>{resource.name}:</span>
        <span>
          {formatNumber(resource.value)} / {formatNumber(resource.max)} ({formatNumber(resource.perSecond)}/сек)
        </span>
        <span>{calculateTimeToReach(resource.value, resource.max, resource.perSecond)}</span>
      </li>
    ))}
  </ul>
);

export const GameScreen: React.FC = () => {
  const { state, purchaseBuilding, purchaseUpgrade } = useGame();
  const { toast } = useToast();
  const { referrals } = useReferral();
  
  const [sortedResources, setSortedResources] = useState<[string, Resource][]>([]);
  const [sortedBuildings, setSortedBuildings] = useState<[string, Building][]>([]);
  
  useEffect(() => {
    if (state && state.resources) {
      const sorted = Object.entries(state.resources).sort(([, a], [, b]) => b.value - a.value);
      setSortedResources(sorted);
    }
  }, [state?.resources]);
  
  useEffect(() => {
    if (state && state.buildings) {
      const sorted = Object.entries(state.buildings).sort(([, a], [, b]) => b.count - a.count);
      setSortedBuildings(sorted);
    }
  }, [state?.buildings]);
  
  useEffect(() => {
    const handleDebugHelperBoost = (event: CustomEvent) => {
      const { buildingId, helperIds, boostPercentage, message } = event.detail;
      toast({
        title: "Бонус от помощников",
        description: message,
        variant: "success"
      });
    };
    
    window.addEventListener('debug-helper-boost', handleDebugHelperBoost as EventListener);
    
    return () => {
      window.removeEventListener('debug-helper-boost', handleDebugHelperBoost as EventListener);
    };
  }, [toast]);
  
  useEffect(() => {
    const handleDebugHelperPersonalBoost = (event: CustomEvent) => {
      const { referralId, buildingIds, boostPercentage, message } = event.detail;
      toast({
        title: "Ваш бонус как помощника",
        description: message,
        variant: "success"
      });
    };
    
    window.addEventListener('debug-helper-personal-boost', handleDebugHelperPersonalBoost as EventListener);
    
    return () => {
      window.removeEventListener('debug-helper-personal-boost', handleDebugHelperPersonalBoost as EventListener);
    };
  }, [toast]);

  // Добавляем компонент калькулятора в нужное место в JSX
  return (
    <div className="container mx-auto p-4 bg-white dark:bg-gray-900 min-h-screen">
      <Header />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
        <div className="md:col-span-3 space-y-4">
          {/* Ресурсы */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-2">Ресурсы</h2>
            <ResourceList resources={sortedResources} />
            
            {/* Добавляем калькулятор знаний */}
            <KnowledgeCalculator />
          </div>
          
          {/* Здания */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-2">Здания</h2>
            <ul className="space-y-2">
              {sortedBuildings.map(([id, building]) => (
                <BuildingItem
                  key={id}
                  building={building}
                  onPurchase={() => purchaseBuilding(id)}
                />
              ))}
            </ul>
          </div>
          
          {/* Рефералы */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-2">Рефералы</h2>
            <ReferralPanel referrals={referrals} />
            <ReferralHelpersPanel />
          </div>
        </div>
        
        <div className="md:col-span-9">
          {/* Улучшения */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-2">Улучшения</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(state.upgrades).map(([id, upgrade]) => (
                <UpgradeItem
                  key={id}
                  upgrade={upgrade}
                  onPurchase={() => purchaseUpgrade(id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
};
