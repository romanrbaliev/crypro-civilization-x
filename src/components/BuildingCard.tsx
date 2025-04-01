
import React, { useState } from 'react';
import { Building as BuildingIcon, Info, Star } from 'lucide-react';
import { formatNumber } from '@/utils/helpers';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from './ui/button';

interface BuildingCardProps {
  id: string;
  name: string;
  description: string;
  cost: Record<string, number>;
  count: number;
  effects?: React.ReactNode;
  canBuy: boolean;
  onBuy: () => void;
  onSell?: () => void;
  costMultiplier?: number; // Используем costMultiplier вместо costScaling
  production?: Record<string, number>;
  consumption?: Record<string, number>;
}

const BuildingCard: React.FC<BuildingCardProps> = ({
  id,
  name,
  description,
  cost,
  count,
  effects,
  canBuy,
  onBuy,
  onSell,
  costMultiplier = 1, // Используем costMultiplier вместо costScaling
  production = {},
  consumption = {}
}) => {
  // Форматирование стоимости
  const formatCost = () => {
    const costEntries = Object.entries(cost);
    if (costEntries.length === 0) return '';
    
    return costEntries.map(([resource, amount]) => {
      let displayAmount = amount;
      
      // Масштабируем стоимость с учетом количества
      if (count > 0 && costMultiplier > 1) {
        displayAmount = amount * Math.pow(costMultiplier, count);
      }
      
      return `${formatNumber(displayAmount)} ${resource}`;
    }).join(', ');
  };
  
  // Формируем текст эффектов здания
  const getEffectsText = () => {
    const effectsList = [];
    
    // Добавляем производство ресурсов
    Object.entries(production).forEach(([resource, amount]) => {
      if (amount <= 0) return; // Пропускаем нулевые или отрицательные значения
      
      const readableResource = resource === 'knowledge' ? 'знаний' : 
                              resource === 'usdt' ? 'USDT' :
                              resource === 'electricity' ? 'электричества' :
                              resource === 'computingPower' ? 'вычисл. мощности' : resource;
                              
      effectsList.push(`+${amount}/сек ${readableResource}`);
    });
    
    // Добавляем потребление ресурсов
    Object.entries(consumption).forEach(([resource, amount]) => {
      if (amount <= 0) return; // Пропускаем нулевые или отрицательные значения
      
      const readableResource = resource === 'knowledge' ? 'знаний' : 
                              resource === 'usdt' ? 'USDT' :
                              resource === 'electricity' ? 'электричества' :
                              resource === 'computingPower' ? 'вычисл. мощности' : resource;
                              
      effectsList.push(`-${amount}/сек ${readableResource}`);
    });
    
    // Особые эффекты для зданий
    if (id === 'practice') {
      effectsList.push(`+${count}/сек знаний`);
    } else if (id === 'generator') {
      effectsList.push(`+${0.5 * count}/сек электричества`);
    } else if (id === 'homeComputer') {
      effectsList.push(`+${2 * count}/сек вычисл. мощности`);
      effectsList.push(`-${count}/сек электричества`);
    } else if (id === 'cryptoWallet') {
      effectsList.push(`+50 макс. USDT`);
      effectsList.push(`+25% макс. знаний`);
    } else if (id === 'internetConnection') {
      effectsList.push(`+20% к производству знаний`);
      effectsList.push(`+5% к вычисл. мощности`);
    }
    
    return effectsList.length > 0 ? effectsList.join(', ') : 'Нет эффектов';
  };

  return (
    <div className="border rounded p-3 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <div className="mr-2 p-1 bg-gray-100 rounded">
            <BuildingIcon className="h-4 w-4 text-gray-600" />
          </div>
          <h3 className="font-medium text-sm">{name}</h3>
        </div>
        <div className="text-xs font-semibold bg-gray-100 px-2 py-0.5 rounded">
          {count}
        </div>
      </div>
      
      <div className="text-xs text-gray-500 mb-2 h-8 overflow-hidden">
        {description}
      </div>
      
      <div className="text-xs font-medium mb-2">
        <div className="flex items-center">
          <span className="mr-1">Эффекты:</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">При количестве: {count}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="mt-1 text-emerald-600">{getEffectsText()}</div>
      </div>
      
      <div className="flex gap-2 mt-auto">
        <Button 
          className="flex-1 h-7 text-xs py-0"
          variant={canBuy ? "default" : "outline"} 
          onClick={onBuy}
          disabled={!canBuy}
        >
          Купить ({formatCost()})
        </Button>
        
        {onSell && count > 0 && (
          <Button 
            className="h-7 w-7 p-0 text-xs"
            variant="outline" 
            onClick={onSell}
          >
            -
          </Button>
        )}
      </div>
    </div>
  );
};

export default BuildingCard;
