
import React, { useState } from "react";
import { useGame } from "@/context/hooks/useGame";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { formatNumber } from "@/utils/helpers";
import { 
  Bitcoin, 
  Zap, 
  Activity, 
  Settings, 
  ToggleLeft, 
  Bell,
  Cpu
} from "lucide-react";
import ExchangeBtcButton from "./buttons/ExchangeBtcButton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CryptoMiningPanelProps {
  onAddEvent?: (message: string, type?: string) => void;
}

const CryptoMiningPanel: React.FC<CryptoMiningPanelProps> = ({ onAddEvent = () => {} }) => {
  const { state, dispatch } = useGame();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Проверяем наличие автомайнера
  const hasMiner = state.buildings.autoMiner.count > 0;
  
  if (!hasMiner) {
    return null;
  }
  
  const btcResource = state.resources.btc;
  const electricityResource = state.resources.electricity;
  const computingPowerResource = state.resources.computingPower;
  
  // Рассчитываем текущие параметры майнинга
  const minerCount = state.buildings.autoMiner.count;
  const minerActive = state.buildings.autoMiner.active !== false;
  const baseElectricityConsumption = minerCount * state.buildings.autoMiner.consumptionRate.electricity;
  const baseCpuConsumption = minerCount * state.buildings.autoMiner.consumptionRate.computingPower;
  
  // Учитываем энергоэффективность
  const electricityConsumption = baseElectricityConsumption * (1 - state.energyEfficiency);
  
  // Рассчитываем производительность в BTC/час
  const btcPerSecond = btcResource.perSecond;
  const btcPerHour = btcPerSecond * 3600;
  
  // Рассчитываем доход в USDT/час
  const usdtPerHour = btcPerHour * state.btcExchangeRate * (1 - state.exchangeFee);
  
  // Проверяем ресурсы для майнинга
  const hasEnoughElectricity = electricityResource.value > 0 && electricityResource.perSecond >= 0;
  const hasEnoughComputingPower = computingPowerResource.value >= baseCpuConsumption;
  const canMine = hasEnoughElectricity && hasEnoughComputingPower;
  
  // Функции управления
  const handleToggleMiner = () => {
    dispatch({ 
      type: "TOGGLE_AUTO_MINER", 
      payload: { minerId: "autoMiner", active: !minerActive } 
    });
  };
  
  const handleExchangeBtc = () => {
    dispatch({ type: "EXCHANGE_BTC" });
  };
  
  const handleToggleAutoExchange = () => {
    dispatch({
      type: "UPDATE_MINING_SETTINGS",
      payload: { autoExchange: !state.miningSettings.autoExchange }
    });
  };
  
  const handleToggleNotifications = () => {
    dispatch({
      type: "UPDATE_MINING_SETTINGS",
      payload: { notifyOnGoodRate: !state.miningSettings.notifyOnGoodRate }
    });
  };
  
  const handleExchangeThresholdChange = (value: number[]) => {
    dispatch({
      type: "UPDATE_MINING_SETTINGS",
      payload: { exchangeThreshold: value[0] }
    });
  };
  
  const handleGoodRateThresholdChange = (value: number[]) => {
    dispatch({
      type: "UPDATE_MINING_SETTINGS",
      payload: { goodRateThreshold: value[0] }
    });
  };
  
  // Цветовые индикаторы состояния
  const statusColor = minerActive 
    ? (canMine ? "text-green-500" : "text-yellow-500") 
    : "text-red-500";
  
  return (
    <Card className="w-full mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm flex items-center">
            <Bitcoin className="mr-1 h-4 w-4" />
            Майнинг BTC
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-xs">
          Автоматически добывает Bitcoin используя вычислительную мощность
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {/* Статус и основная информация */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="text-xs flex flex-col">
            <div className="flex items-center">
              <Activity className={`h-3 w-3 mr-1 ${statusColor}`} />
              <span>Статус: {minerActive ? (canMine ? "Активен" : "Требуются ресурсы") : "Выключен"}</span>
            </div>
            <div className="flex items-center mt-1">
              <Bitcoin className="h-3 w-3 mr-1 text-amber-500" />
              <span>Скорость: {btcPerSecond.toFixed(7)} BTC/сек</span>
            </div>
            <div className="flex items-center mt-1">
              <Zap className="h-3 w-3 mr-1 text-yellow-500" />
              <span>Потребление: {electricityConsumption.toFixed(1)} эл/сек</span>
            </div>
          </div>
          
          <div className="text-xs flex flex-col">
            <div className="flex items-center">
              <Bitcoin className="h-3 w-3 mr-1 text-amber-500" />
              <span>Накоплено: {btcResource.value.toFixed(5)} BTC</span>
            </div>
            <div className="flex items-center mt-1">
              <Cpu className="h-3 w-3 mr-1 text-blue-500" />
              <span>Процессор: {baseCpuConsumption} единиц</span>
            </div>
            <div className="flex items-center mt-1">
              <Activity className="h-3 w-3 mr-1 text-green-500" />
              <span>Доход: ~{formatNumber(usdtPerHour)} USDT/час</span>
            </div>
          </div>
        </div>
        
        {/* Кнопки управления */}
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant={minerActive ? "default" : "outline"}
            className="flex-1 h-8"
            onClick={handleToggleMiner}
          >
            <ToggleLeft className="mr-1 h-4 w-4" />
            {minerActive ? "Выключить" : "Включить"}
          </Button>
          
          <ExchangeBtcButton
            onClick={handleExchangeBtc}
            disabled={btcResource.value <= 0}
            btcAmount={btcResource.value}
            exchangeRate={state.btcExchangeRate}
            fee={state.exchangeFee}
          />
        </div>
        
        {/* Расширенные настройки */}
        <Collapsible open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <CollapsibleContent className="space-y-3 pt-2">
            <div className="space-y-2 border-t pt-2">
              <h4 className="text-xs font-medium">Настройки автомайнера</h4>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ToggleLeft className="h-3 w-3" />
                  <Label htmlFor="auto-exchange" className="text-xs">
                    Автообмен BTC
                  </Label>
                </div>
                <Switch
                  id="auto-exchange"
                  checked={state.miningSettings.autoExchange}
                  onCheckedChange={handleToggleAutoExchange}
                />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <Label htmlFor="exchange-threshold">Порог обмена</Label>
                  <span>{state.miningSettings.exchangeThreshold.toFixed(4)} BTC</span>
                </div>
                <Slider
                  id="exchange-threshold"
                  min={0.0001}
                  max={0.01}
                  step={0.0001}
                  value={[state.miningSettings.exchangeThreshold]}
                  onValueChange={handleExchangeThresholdChange}
                  disabled={!state.miningSettings.autoExchange}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-3 w-3" />
                  <Label htmlFor="notify-good-rate" className="text-xs">
                    Уведомления о выгодном курсе
                  </Label>
                </div>
                <Switch
                  id="notify-good-rate"
                  checked={state.miningSettings.notifyOnGoodRate}
                  onCheckedChange={handleToggleNotifications}
                />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <Label htmlFor="good-rate-threshold">Порог выгодного курса</Label>
                  <span>+{((state.miningSettings.goodRateThreshold - 1) * 100).toFixed(0)}%</span>
                </div>
                <Slider
                  id="good-rate-threshold"
                  min={1.05}
                  max={1.2}
                  step={0.01}
                  value={[state.miningSettings.goodRateThreshold]}
                  onValueChange={handleGoodRateThresholdChange}
                  disabled={!state.miningSettings.notifyOnGoodRate}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default CryptoMiningPanel;
