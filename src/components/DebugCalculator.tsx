
import React, { useEffect, useState } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { calculateKnowledgeProduction, KnowledgeProductionResult, HelperBonusDetail, UpgradeEffect } from '@/utils/debugCalculator';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Bug, RefreshCw, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { formatNumber } from '@/utils/helpers';

const DebugCalculator = () => {
  const { state } = useGame();
  const [result, setResult] = useState<KnowledgeProductionResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState({
    buildings: false,
    referrals: false,
    helpers: false,
    helperProduction: false,
    upgrades: false,
    details: false
  });

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const calculateProduction = () => {
    const calculationResult = calculateKnowledgeProduction(state);
    setResult(calculationResult);
    console.log('Результаты расчета производства знаний:', calculationResult);
  };

  // Автоматический расчет при открытии компонента
  useEffect(() => {
    if (isOpen) {
      calculateProduction();
    }
  }, [isOpen]);

  // Форматирование числа с плюсом для положительных значений
  const formatWithSign = (num: number) => {
    const formatted = formatNumber(Math.abs(num));
    return num >= 0 ? `+${formatted}` : `-${formatted}`;
  };

  if (!state.resources.knowledge) {
    return null;
  }

  return (
    <Card className="w-full mb-4 bg-white/90">
      <CardHeader className="py-2">
        <div className="flex justify-between items-center w-full">
          <CardTitle className="text-sm font-medium flex items-center">
            <Bug className="w-4 h-4 mr-1" /> Отладочный калькулятор
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="pt-0 pb-3 text-xs">
          <div className="flex justify-between mb-2">
            <div>Текущее производство знаний:</div>
            <div className="font-semibold">
              {formatNumber(state.resources.knowledge.perSecond || 0)}/сек
            </div>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs w-full mb-2 h-7"
            onClick={calculateProduction}
          >
            <RefreshCw className="w-3 h-3 mr-1" /> Пересчитать
          </Button>

          {result && result.success && (
            <>
              <Separator className="my-2" />
              
              <div className="text-center font-semibold mb-2">Результаты расчета</div>
              
              {/* Шаг 1: Базовое производство от зданий */}
              <Collapsible 
                open={expanded.buildings} 
                onOpenChange={() => toggleSection('buildings')}
                className="mb-2"
              >
                <CollapsibleTrigger className="flex justify-between items-center w-full">
                  <div>Шаг 1: Базовое производство от зданий:</div>
                  <div className="flex items-center">
                    {result.baseProduction !== undefined ? formatNumber(result.baseProduction) : '0'}/сек
                    {expanded.buildings ? 
                      <ChevronUp className="w-3 h-3 ml-1" /> : 
                      <ChevronDown className="w-3 h-3 ml-1" />
                    }
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 pt-1">
                  {result.buildingProduction && Object.entries(result.buildingProduction).map(([buildingId, amount]) => (
                    <div key={buildingId} className="flex justify-between">
                      <div>{state.buildings[buildingId]?.name || buildingId}:</div>
                      <div>{formatNumber(amount)}/сек</div>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
              
              {/* Шаг 2: Бонус от активных рефералов */}
              <Collapsible 
                open={expanded.referrals} 
                onOpenChange={() => toggleSection('referrals')}
                className="mb-2"
              >
                <CollapsibleTrigger className="flex justify-between items-center w-full">
                  <div>Шаг 2: Бонус от активных рефералов ({result.referralBonus?.activeReferrals || 0} × 5%):</div>
                  <div className="flex items-center">
                    {formatWithSign(result.referralBonus?.bonusAmount || 0)}/сек
                    {expanded.referrals ? 
                      <ChevronUp className="w-3 h-3 ml-1" /> : 
                      <ChevronDown className="w-3 h-3 ml-1" />
                    }
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 pt-1">
                  <div className="flex justify-between">
                    <div>Активные рефералы:</div>
                    <div>{result.referralBonus?.activeReferrals || 0}</div>
                  </div>
                  <div className="flex justify-between">
                    <div>Бонусный процент:</div>
                    <div>+{result.referralBonus?.bonusPercent.toFixed(0) || '0'}%</div>
                  </div>
                  <div className="flex justify-between">
                    <div>Бонус к производству:</div>
                    <div>{formatNumber(result.referralBonus?.bonusAmount || 0)}/сек</div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
              
              {/* Шаг 3: Бонус от помощников */}
              <Collapsible 
                open={expanded.helpers} 
                onOpenChange={() => toggleSection('helpers')}
                className="mb-2"
              >
                <CollapsibleTrigger className="flex justify-between items-center w-full">
                  <div>Шаг 3: Бонус от помощников для реферрера (5% за помощника):</div>
                  <div className="flex items-center">
                    {formatWithSign(result.helperBonus?.totalBonus || 0)}/сек
                    {expanded.helpers ? 
                      <ChevronUp className="w-3 h-3 ml-1" /> : 
                      <ChevronDown className="w-3 h-3 ml-1" />
                    }
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 pt-1">
                  {result.helperBonus?.details && Object.entries(result.helperBonus.details).length > 0 ? (
                    Object.entries(result.helperBonus.details).map(([buildingId, data]) => (
                      <div key={buildingId} className="mb-1">
                        <div className="flex justify-between">
                          <div>
                            {state.buildings[buildingId]?.name || buildingId}:
                          </div>
                          <div>
                            +{(data.boost * 100).toFixed(0)}% = {formatNumber(data.bonusAmount)}/сек
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">Нет активных помощников</div>
                  )}
                </CollapsibleContent>
              </Collapsible>
              
              {/* Шаг 4: Бонус для реферала-помощника */}
              <Collapsible 
                open={expanded.helperProduction} 
                onOpenChange={() => toggleSection('helperProduction')}
                className="mb-2"
              >
                <CollapsibleTrigger className="flex justify-between items-center w-full">
                  <div>Шаг 4: Расчет бонуса для реферала-помощника (10% за каждое здание):</div>
                  <div className="flex items-center">
                    {formatWithSign(result.helperProductionBonus?.bonusAmount || 0)}/сек
                    {expanded.helperProduction ? 
                      <ChevronUp className="w-3 h-3 ml-1" /> : 
                      <ChevronDown className="w-3 h-3 ml-1" />
                    }
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 pt-1">
                  <div className="flex justify-between mb-2">
                    <div>Текущее производство знаний без бонуса:</div>
                    <div>{formatNumber(result.baseProduction || 0)}/сек</div>
                  </div>
                  
                  {(result.helperProductionBonus?.buildingsAsHelper || 0) > 0 ? (
                    <>
                      <div className="flex justify-between items-center mb-1">
                        <div>Текущий пользователь:</div>
                        <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {localStorage.getItem('userId') || state.referralCode?.substring(0, 10) || 'unknown'}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div>Зданий с помощью:</div>
                        <div className="font-semibold">{result.helperProductionBonus?.buildingsAsHelper || 0}</div>
                      </div>
                      <div className="flex justify-between">
                        <div>Бонусный процент:</div>
                        <div className="text-green-600">+{result.helperProductionBonus?.bonusPercent.toFixed(0) || '0'}%</div>
                      </div>
                      <div className="flex justify-between">
                        <div>Бонус к производству:</div>
                        <div className="text-green-600">{formatNumber(result.helperProductionBonus?.bonusAmount || 0)}/сек</div>
                      </div>
                      <div className="p-2 mt-1 bg-blue-50 rounded-md border border-blue-100">
                        <div className="flex items-start">
                          <Info className="h-4 w-4 text-blue-500 mr-1 mt-0.5 flex-shrink-0" />
                          <div>
                            Бонус применяется ко всему базовому производству знаний, когда вы являетесь помощником для другого игрока.
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-2 bg-yellow-50 rounded-md border border-yellow-100">
                      <div className="flex items-start">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">Текущий пользователь не является помощником ни для каких зданий</div>
                          <div className="text-xs mt-1">
                            ID пользователя: {localStorage.getItem('userId') || state.referralCode?.substring(0, 10) || 'unknown'}
                          </div>
                          <div className="text-xs mt-1">
                            Бонус для помощников (10% за каждое здание) начисляется только если вы стали помощником для других игроков.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                    <div className="font-semibold mb-1">Доступные для отладки функции:</div>
                    <div className="text-xs text-gray-700">
                      localStorage.getItem('userId') = {localStorage.getItem('userId')}
                    </div>
                    <div className="text-xs text-gray-700">
                      state.referralCode = {state.referralCode}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
              
              {/* Шаг 5: Бонусы от исследований */}
              <Collapsible 
                open={expanded.upgrades} 
                onOpenChange={() => toggleSection('upgrades')}
                className="mb-2"
              >
                <CollapsibleTrigger className="flex justify-between items-center w-full">
                  <div>Шаг 5: Бонусы от исследований:</div>
                  <div className="flex items-center">
                    {formatWithSign(result.upgradeBonus?.totalBonus || 0)}/сек
                    {expanded.upgrades ? 
                      <ChevronUp className="w-3 h-3 ml-1" /> : 
                      <ChevronDown className="w-3 h-3 ml-1" />
                    }
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 pt-1">
                  {result.upgradeBonus?.effects && Object.keys(result.upgradeBonus.effects).length > 0 ? (
                    Object.values(result.upgradeBonus.effects).map((effect, index) => (
                      <div key={index} className="flex justify-between">
                        <div>{effect.name}:</div>
                        <div>+{(effect.boost * 100).toFixed(0)}% = {formatNumber(effect.bonusAmount)}/сек</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">Нет исследований с бонусами к знаниям</div>
                  )}
                </CollapsibleContent>
              </Collapsible>
              
              {/* Детальное отображение всех помощников */}
              <Collapsible 
                open={expanded.details} 
                onOpenChange={() => toggleSection('details')}
                className="mb-2"
              >
                <CollapsibleTrigger className="flex justify-between items-center w-full text-blue-500">
                  <div>Детальная информация о помощниках:</div>
                  <div className="flex items-center">
                    {expanded.details ? 
                      <ChevronUp className="w-3 h-3 ml-1" /> : 
                      <ChevronDown className="w-3 h-3 ml-1" />
                    }
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                    <div className="font-semibold mb-1">Общая информация:</div>
                    <div className="flex justify-between">
                      <div>Всего помощников в системе:</div>
                      <div>{state.referralHelpers.length}</div>
                    </div>
                    <div className="flex justify-between">
                      <div>Активные помощники:</div>
                      <div>
                        {state.referralHelpers.filter(h => h.status === 'accepted').length}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div>Ожидающие подтверждения:</div>
                      <div>
                        {state.referralHelpers.filter(h => h.status === 'pending').length}
                      </div>
                    </div>
                  </div>
                  
                  {state.referralHelpers.length > 0 ? (
                    <div className="mt-2">
                      <div className="font-semibold mb-1">Список всех помощников:</div>
                      <div className="border rounded-md overflow-hidden">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="p-1 text-left border-b">ID помощника</th>
                              <th className="p-1 text-left border-b">Здание</th>
                              <th className="p-1 text-center border-b">Статус</th>
                            </tr>
                          </thead>
                          <tbody>
                            {state.referralHelpers.map((helper, index) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="p-1 border-b truncate" style={{maxWidth: '150px'}}>
                                  {helper.helperId === localStorage.getItem('userId') ? 
                                    <span className="font-semibold text-green-600">{helper.helperId.substring(0, 10)}...* (вы)</span> : 
                                    <span>{helper.helperId.substring(0, 10)}...</span>
                                  }
                                </td>
                                <td className="p-1 border-b">
                                  {state.buildings[helper.buildingId]?.name || helper.buildingId}
                                </td>
                                <td className="p-1 border-b text-center">
                                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                                    helper.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                    helper.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {helper.status === 'accepted' ? 'Принят' :
                                     helper.status === 'pending' ? 'Ожидает' :
                                     'Отклонен'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 mt-2 text-center">
                      Нет доступных помощников в системе
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
              
              <Separator className="my-2" />
              
              {/* Итоги расчета */}
              <div className="font-semibold">Итоги расчета:</div>
              <div className="pl-4">
                <div className="flex justify-between">
                  <div>Базовое производство:</div>
                  <div>{formatNumber(result.baseProduction || 0)}/сек</div>
                </div>
                <div className="flex justify-between">
                  <div>+ Бонус от рефералов:</div>
                  <div>{formatNumber(result.referralBonus?.bonusAmount || 0)}/сек</div>
                </div>
                <div className="flex justify-between">
                  <div>+ Бонус от помощников:</div>
                  <div>{formatNumber(result.helperBonus?.totalBonus || 0)}/сек</div>
                </div>
                <div className="flex justify-between">
                  <div>+ Бонус реферала-помощника:</div>
                  <div>{formatNumber(result.helperProductionBonus?.bonusAmount || 0)}/сек</div>
                </div>
                <div className="flex justify-between">
                  <div>+ Бонус от исследований:</div>
                  <div>{formatNumber(result.upgradeBonus?.totalBonus || 0)}/сек</div>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between font-semibold">
                  <div>Расчетное производство:</div>
                  <div>{formatNumber(result.calculatedProduction || 0)}/сек</div>
                </div>
                <div className="flex justify-between font-semibold">
                  <div>Текущее производство в игре:</div>
                  <div>{formatNumber(result.displayedProduction || 0)}/сек</div>
                </div>
              </div>
              
              {/* Проверка на расхождение */}
              {result.hasDiscrepancy ? (
                <div className="mt-2 p-2 bg-yellow-50 rounded-md border border-yellow-200 flex items-start">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mr-1 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Обнаружено расхождение!</div>
                    <div>Разница между расчетным и реальным значением: {formatNumber(result.discrepancy || 0)}/сек</div>
                  </div>
                </div>
              ) : (
                <div className="mt-2 p-2 bg-green-50 rounded-md border border-green-200 flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1 flex-shrink-0 mt-0.5" />
                  <div>Расчеты совпадают с игровыми значениями.</div>
                </div>
              )}
            </>
          )}
          
          {result && !result.success && (
            <div className="mt-2 p-2 bg-red-50 rounded-md border border-red-200 flex items-start">
              <XCircle className="w-4 h-4 text-red-500 mr-1 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Ошибка при расчете</div>
                <div>{result.message}</div>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default DebugCalculator;
