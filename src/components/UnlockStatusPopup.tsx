
import React, { useState, useEffect } from 'react';
import { Unlock } from 'lucide-react';
import { useGame } from '@/context/hooks/useGame';
import { debugUnlockStatus } from '@/utils/debugCalculator';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  debugPracticeBuilding, 
  debugBuildingDisplay, 
  listAllBuildings,
  debugTabsUnlocks,
  debugApplyKnowledgeCounter
} from '@/utils/buildingDebugUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { unlockableItemsRegistry } from '@/systems/unlock/registry';
import { UnlockManager } from '@/systems/unlock/UnlockManager';

const UnlockStatusPopup = () => {
  const { state, dispatch, forceUpdate } = useGame();
  const [statusSteps, setStatusSteps] = useState<string[]>([]);
  const [unlockedItems, setUnlockedItems] = useState<string[]>([]);
  const [lockedItems, setLockedItems] = useState<string[]>([]);
  const [practiceStatus, setPracticeStatus] = useState<any>(null);
  const [buildingsStatus, setBuildingsStatus] = useState<any>(null);
  const [allBuildings, setAllBuildings] = useState<any[]>([]);
  const [tabsStatus, setTabsStatus] = useState<any>(null);
  const [counterStatus, setCounterStatus] = useState<any>(null);
  const [registryStatus, setRegistryStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  const updateStatus = async () => {
    try {
      setLoading(true);
      
      // Форсируем обновление состояния игры
      forceUpdate();
      
      // Небольшая задержка, чтобы обновление успело примениться
      setTimeout(() => {
        try {
          // Получаем отчет о статусе разблокировок
          const result = debugUnlockStatus(state);
          setStatusSteps(result.steps || []); 
          setUnlockedItems(result.unlocked || []); 
          setLockedItems(result.locked || []); 
          
          // Добавляем детальную отладку здания "Практика"
          const practiceDebug = debugPracticeBuilding(state);
          setPracticeStatus(practiceDebug);
          
          // Добавляем информацию о всех зданиях
          setAllBuildings(listAllBuildings(state));
          
          // Добавляем информацию об отображении зданий
          const displayDebug = debugBuildingDisplay(state);
          setBuildingsStatus(displayDebug);
          
          // Добавляем информацию о вкладках
          const tabsDebug = debugTabsUnlocks(state);
          setTabsStatus(tabsDebug);
          
          // Добавляем информацию о счетчике applyKnowledge
          const applyKnowledgeDebug = debugApplyKnowledgeCounter(state);
          setCounterStatus(applyKnowledgeDebug);
          
          // Получаем статус элементов из реестра
          const unlockManager = new UnlockManager(state);
          const registryDetails = analyzeRegistryItems(unlockManager);
          setRegistryStatus(registryDetails);
          
        } catch (error) {
          console.error('Ошибка при анализе разблокировок:', error);
          setStatusSteps(['Произошла ошибка при анализе разблокировок: ' + error]);
        } finally {
          setLoading(false);
        }
      }, 100);
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
      setLoading(false);
    }
  };
  
  // Анализ элементов из реестра разблокировок
  const analyzeRegistryItems = (unlockManager: UnlockManager) => {
    return Object.entries(unlockableItemsRegistry).map(([id, item]) => {
      // Проверяем статус разблокировки
      const isUnlocked = unlockManager.isUnlocked(id);
      
      // Проверяем условия разблокировки
      const conditionsDetails = item.conditions.map(condition => {
        let currentValue: any = null;
        let conditionMet = false;
        
        // Получаем текущее значение в зависимости от типа условия
        switch (condition.type) {
          case 'resource':
            currentValue = state.resources[condition.targetId]?.value || 0;
            break;
          case 'building':
            currentValue = state.buildings[condition.targetId]?.count || 0;
            break;
          case 'upgrade':
            currentValue = state.upgrades[condition.targetId]?.purchased || false;
            break;
          case 'counter':
            const counter = state.counters[condition.targetId];
            currentValue = typeof counter === 'object' ? counter?.value : counter || 0;
            break;
        }
        
        // Определяем, выполнено ли условие
        switch (condition.operator) {
          case 'eq':
            conditionMet = currentValue === condition.targetValue;
            break;
          case 'gte':
            conditionMet = currentValue >= condition.targetValue;
            break;
          case 'gt':
            conditionMet = currentValue > condition.targetValue;
            break;
          case 'lte':
            conditionMet = currentValue <= condition.targetValue;
            break;
          case 'lt':
            conditionMet = currentValue < condition.targetValue;
            break;
        }
        
        return {
          description: condition.description,
          type: condition.type,
          targetId: condition.targetId,
          targetValue: condition.targetValue,
          currentValue,
          conditionMet
        };
      });
      
      // Проверяем состояние в зависимости от типа элемента
      let stateInGame: boolean = false;
      let stateInRegistry: boolean = isUnlocked;
      
      switch (item.type) {
        case 'resource':
          stateInGame = state.resources[id]?.unlocked || false;
          break;
        case 'building':
          stateInGame = state.buildings[id]?.unlocked || false;
          break;
        case 'upgrade':
          stateInGame = state.upgrades[id]?.unlocked || false;
          break;
        case 'feature':
          stateInGame = state.unlocks[id] || false;
          break;
      }
      
      return {
        id,
        name: item.name,
        type: item.type,
        autoUnlock: item.autoUnlock,
        stateInGame,
        stateInRegistry,
        conditions: conditionsDetails,
        allConditionsMet: conditionsDetails.every(c => c.conditionMet),
        divergence: stateInGame !== stateInRegistry
      };
    });
  };
  
  // Обновляем статус при открытии popover
  const handleOpenChange = (open: boolean) => {
    if (open) {
      updateStatus();
    }
  };
  
  const handleForceUnlockItem = (itemId: string, itemType: string) => {
    switch (itemType) {
      case 'resource':
        dispatch({ 
          type: 'UNLOCK_RESOURCE', 
          payload: { resourceId: itemId } 
        });
        break;
      case 'building':
        dispatch({ 
          type: 'SET_BUILDING_UNLOCKED', 
          payload: { buildingId: itemId, unlocked: true } 
        });
        // Также обновляем счетчик разблокированных зданий
        dispatch({ 
          type: 'INCREMENT_COUNTER', 
          payload: { 
            counterId: 'buildingsUnlocked', 
            value: 1 
          } 
        });
        break;
      case 'upgrade':
        dispatch({ 
          type: 'SET_UPGRADE_UNLOCKED', 
          payload: { upgradeId: itemId, unlocked: true } 
        });
        break;
      case 'feature':
        dispatch({ 
          type: 'UNLOCK_FEATURE', 
          payload: { featureId: itemId } 
        });
        break;
    }
    // Обновляем статус отладки
    updateStatus();
  };
  
  const handleForceUnlockEquipment = () => {
    dispatch({ type: 'UNLOCK_FEATURE', payload: { featureId: 'equipment' } });
    // Также обновляем статус отладки
    updateStatus();
  };
  
  const handleForceUnlockPractice = () => {
    dispatch({ type: 'SET_BUILDING_UNLOCKED', payload: { buildingId: 'practice', unlocked: true } });
    // Также обновляем счетчик разблокированных зданий
    dispatch({ 
      type: 'INCREMENT_COUNTER', 
      payload: { 
        counterId: 'buildingsUnlocked', 
        value: 1 
      } 
    });
    // Обновляем статус отладки
    updateStatus();
  };
  
  const handleForceCheckAllUnlocks = () => {
    dispatch({ type: 'FORCE_CHECK_UNLOCKS' });
    updateStatus();
  };
  
  // Группировка элементов реестра по типу
  const groupedRegistryItems = registryStatus.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, typeof registryStatus>);
  
  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 px-2 text-xs gap-1 bg-white"
        >
          <Unlock className="h-3.5 w-3.5" /> 
          Проверка разблокировок
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[580px] p-0">
        <div className="p-4 bg-white rounded-md">
          <h3 className="text-sm font-bold text-gray-700 mb-2">Статус разблокировок контента</h3>
          
          <Tabs defaultValue="registry">
            <TabsList className="w-full mb-2">
              <TabsTrigger value="registry">Реестр разблокировок</TabsTrigger>
              <TabsTrigger value="counters">Счетчики</TabsTrigger>
              <TabsTrigger value="unlocks">Разблокировки</TabsTrigger>
              <TabsTrigger value="practice">Отладка "Практика"</TabsTrigger>
              <TabsTrigger value="buildings">Все здания</TabsTrigger>
              <TabsTrigger value="tabs">Вкладки</TabsTrigger>
            </TabsList>
            
            <TabsContent value="registry">
              <div className="text-xs mb-2">
                <p className="mb-2">Полный реестр элементов и их состояние разблокировки:</p>
                
                <div className="mb-2 flex justify-between">
                  <div>
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded mr-2">Разблокировано</span>
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-800 rounded">Заблокировано</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs" 
                    onClick={handleForceCheckAllUnlocks}
                  >
                    Проверить все разблокировки
                  </Button>
                </div>
                
                {Object.entries(groupedRegistryItems).map(([type, items]) => (
                  <div key={type} className="mb-4">
                    <h4 className="font-semibold mb-1 text-gray-700 capitalize">
                      {type === 'resource' ? 'Ресурсы' : 
                       type === 'building' ? 'Здания' : 
                       type === 'upgrade' ? 'Исследования' : 
                       'Функции'}
                      <span className="text-xs font-normal ml-1 text-gray-500">
                        ({items.filter(i => i.stateInGame).length} / {items.length})
                      </span>
                    </h4>
                    
                    <div className="space-y-1 max-h-60 overflow-y-auto border rounded p-1">
                      {items.map(item => (
                        <div 
                          key={item.id}
                          className={`p-1 rounded border ${item.stateInGame ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              {item.name} 
                              <span className="text-gray-500 ml-1">({item.id})</span>
                            </span>
                            {!item.stateInGame && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-5 px-1 py-0 text-xs text-blue-600"
                                onClick={() => handleForceUnlockItem(item.id, item.type)}
                              >
                                Разблокировать
                              </Button>
                            )}
                          </div>
                          
                          <div className="mt-1 text-xs">
                            <div className="flex justify-between text-gray-600">
                              <span>Статус в игре: {item.stateInGame ? '✅' : '❌'}</span>
                              <span>Статус в реестре: {item.stateInRegistry ? '✅' : '❌'}</span>
                              <span>Автоматическая разблокировка: {item.autoUnlock ? '✅' : '❌'}</span>
                            </div>
                            
                            {item.conditions.length > 0 && (
                              <div className="mt-1">
                                <span className="text-gray-600">Условия разблокировки:</span>
                                <ul className="pl-3 mt-0.5 space-y-1">
                                  {item.conditions.map((condition, idx) => (
                                    <li 
                                      key={idx}
                                      className={condition.conditionMet ? 'text-green-600' : 'text-red-600'}
                                    >
                                      {condition.description}: {condition.currentValue} {condition.operator} {condition.targetValue}
                                      {' '}{condition.conditionMet ? '✅' : '❌'}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {item.divergence && (
                              <div className="mt-1 text-orange-600">
                                Внимание: Расхождение между состоянием в игре и в реестре!
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="counters">
              {counterStatus ? (
                <div className="p-2 bg-gray-50 rounded border text-xs mb-3">
                  <h4 className="font-semibold mb-2">Анализ счетчика applyKnowledge и разблокировок</h4>
                  
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-3">
                    <div>
                      <strong>Статус счетчика:</strong> {counterStatus.counterExists ? "✅ Существует" : "❌ Не существует"}
                    </div>
                    <div>
                      <strong>Значение счетчика:</strong> {counterStatus.counterValue}
                    </div>
                    <div>
                      <strong>Тип счетчика:</strong> {counterStatus.counterType}
                    </div>
                    <div>
                      <strong>Порог разблокировки "Практика":</strong> {counterStatus.practiceUnlockThreshold}
                    </div>
                    <div className={counterStatus.practiceExists ? "text-green-600" : "text-red-500"}>
                      <strong>Существование "Практика":</strong> {counterStatus.practiceExists ? "✅ Да" : "❌ Нет"}
                    </div>
                    <div className={counterStatus.practiceUnlocked ? "text-green-600" : "text-red-500"}>
                      <strong>Разблокировка "Практика":</strong> {counterStatus.practiceUnlocked ? "✅ Да" : "❌ Нет"}
                    </div>
                    <div className={counterStatus.equipmentTabUnlocked ? "text-green-600" : "text-red-500"}>
                      <strong>Разблокировка "Оборудование":</strong> {counterStatus.equipmentTabUnlocked ? "✅ Да" : "❌ Нет"}
                    </div>
                    <div>
                      <strong>Счетчик разблокированных зданий:</strong> {counterStatus.buildingsUnlockedCounter}
                    </div>
                  </div>
                  
                  {counterStatus.recommendations.length > 0 && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <h5 className="font-semibold text-yellow-700 mb-1">Рекомендации:</h5>
                      <ul className="list-disc pl-4">
                        {counterStatus.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-yellow-800">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="mt-3 flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs bg-blue-50 text-blue-600" 
                      onClick={handleForceCheckAllUnlocks}
                    >
                      Полная проверка разблокировок
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs bg-green-50 text-green-600" 
                      onClick={handleForceUnlockPractice}
                    >
                      Разблокировать "Практику"
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs bg-purple-50 text-purple-600" 
                      onClick={handleForceUnlockEquipment}
                    >
                      Разблокировать вкладку "Оборудование"
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">Нет данных. Нажмите "Обновить статус".</div>
              )}
            </TabsContent>
            
            <TabsContent value="unlocks">
              <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                <div>
                  <h4 className="font-semibold text-green-600">Разблокировано ({unlockedItems.length}):</h4>
                  <ul className="mt-1 space-y-1 text-green-600">
                    {unlockedItems.slice(0, 6).map((item, idx) => (
                      <li key={idx}>✅ {item}</li>
                    ))}
                    {unlockedItems.length > 6 && (
                      <li>... и еще {unlockedItems.length - 6}</li>
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-500">Заблокировано ({lockedItems.length}):</h4>
                  <ul className="mt-1 space-y-1 text-gray-500">
                    {lockedItems.slice(0, 6).map((item, idx) => (
                      <li key={idx}>❌ {item}</li>
                    ))}
                    {lockedItems.length > 6 && (
                      <li>... и еще {lockedItems.length - 6}</li>
                    )}
                  </ul>
                </div>
              </div>
              
              <div className="mt-2 p-2 bg-gray-50 rounded border text-xs text-gray-600 max-h-60 overflow-y-auto whitespace-pre-line">
                {loading ? (
                  <div className="text-center py-2">Загрузка данных...</div>
                ) : (
                  statusSteps.map((step, index) => (
                    <div key={index} className={
                      step.includes('✅') ? 'text-green-600' : 
                      step.includes('❌') ? 'text-red-500' : 
                      step.startsWith('•') ? 'pl-2' :
                      step.startsWith('📊') || step.startsWith('🔓') || step.startsWith('🏗️') || step.startsWith('📚') ? 'font-semibold mt-2' : ''
                    }>
                      {step}
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="practice">
              {practiceStatus ? (
                <div className="p-2 bg-gray-50 rounded border text-xs">
                  <h4 className="font-semibold mb-2">Детальная отладка здания "Практика"</h4>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <div className={practiceStatus.exists ? "text-green-600" : "text-red-500"}>
                      Существует в state.buildings: {practiceStatus.exists ? "✅ Да" : "❌ Нет"}
                    </div>
                    <div className={practiceStatus.unlocked ? "text-green-600" : "text-red-500"}>
                      Разблокировано в здании: {practiceStatus.unlocked ? "✅ Да" : "❌ Нет"}
                    </div>
                    <div>
                      Количество: {practiceStatus.count}
                    </div>
                    <div className={practiceStatus.stateInUnlocks ? "text-green-600" : "text-red-500"}>
                      Разблокировано в state.unlocks: {practiceStatus.stateInUnlocks ? "✅ Да" : "❌ Нет"}
                    </div>
                    <div className={practiceStatus.conditionalCheck ? "text-green-600" : "text-red-500"}>
                      Условие разблокировки: {practiceStatus.conditionalCheck ? "✅ Выполнено" : "❌ Не выполнено"}
                    </div>
                    <div className={practiceStatus.displayInBuildingsContainer ? "text-green-600" : "text-red-500"}>
                      Отображается в BuildingsContainer: {practiceStatus.displayInBuildingsContainer ? "✅ Да" : "❌ Нет"}
                    </div>
                    <div className={practiceStatus.displayInEquipmentTab ? "text-green-600" : "text-red-500"}>
                      Отображается в EquipmentTab: {practiceStatus.displayInEquipmentTab ? "✅ Да" : "❌ Нет"}
                    </div>
                    <div className={practiceStatus.inBuildingsList ? "text-green-600" : "text-red-500"}>
                      В списке зданий: {practiceStatus.inBuildingsList ? "✅ Да" : "❌ Нет"}
                    </div>
                  </div>
                  
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <h5 className="font-semibold text-yellow-700">Решение проблемы</h5>
                    {!practiceStatus.exists && (
                      <p>Здание "Практика" отсутствует в state.buildings. Возможно, оно не было корректно инициализировано.</p>
                    )}
                    {practiceStatus.exists && !practiceStatus.unlocked && (
                      <p>Здание существует, но флаг unlocked = false. Необходимо проверить логику разблокировки.</p>
                    )}
                    {practiceStatus.unlocked && !practiceStatus.displayInBuildingsContainer && (
                      <p>Здание разблокировано, но не отображается в контейнере зданий. Проверьте фильтрацию в компоненте.</p>
                    )}
                    {practiceStatus.exists && practiceStatus.unlocked && !buildingsStatus?.equipmentTabUnlocked && (
                      <p>Здание разблокировано, но вкладка "Оборудование" заблокирована. Необходимо разблокировать вкладку.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">Нет данных. Нажмите "Обновить статус".</div>
              )}
            </TabsContent>
            
            <TabsContent value="buildings">
              {buildingsStatus ? (
                <div className="p-2 bg-gray-50 rounded border text-xs overflow-auto max-h-60">
                  <h4 className="font-semibold mb-2">Статистика зданий</h4>
                  <div className="grid grid-cols-2 gap-1 mb-2">
                    <div>Всего зданий: {buildingsStatus.buildingsCount}</div>
                    <div>Разблокировано: {buildingsStatus.unlockedBuildingsCount}</div>
                    <div className={buildingsStatus.equipmentTabUnlocked ? "text-green-600" : "text-red-500"}>
                      Вкладка Equipment: {buildingsStatus.equipmentTabUnlocked ? "✅ Разблокирована" : "❌ Заблокирована"}
                    </div>
                    <div className={buildingsStatus.unlockedBuildingsCount > 0 && buildingsStatus.buildingsUnlockedCounterValue > 0 ? "text-green-600" : "text-red-500"}>
                      Счетчик разблокированных зданий: {buildingsStatus.buildingsUnlockedCounterValue}
                    </div>
                  </div>
                  
                  <h4 className="font-semibold mt-2 mb-1">Все здания в игре:</h4>
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-1 py-1 text-left">ID</th>
                        <th className="border px-1 py-1 text-center">Существует</th>
                        <th className="border px-1 py-1 text-center">Разблокировано</th>
                        <th className="border px-1 py-1 text-center">Количество</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allBuildings.map((building, index) => (
                        <tr key={index} className={building.id === 'practice' ? 'bg-yellow-50' : ''}>
                          <td className="border px-1 py-1">{building.id}</td>
                          <td className={`border px-1 py-1 text-center ${building.exists ? 'text-green-600' : 'text-red-500'}`}>
                            {building.exists ? '✅' : '❌'}
                          </td>
                          <td className={`border px-1 py-1 text-center ${building.unlocked ? 'text-green-600' : 'text-red-500'}`}>
                            {building.unlocked ? '✅' : '❌'}
                          </td>
                          <td className="border px-1 py-1 text-center">{building.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">Нет данных. Нажмите "Обновить статус".</div>
              )}
            </TabsContent>
            
            <TabsContent value="tabs">
              {tabsStatus ? (
                <div className="p-2 bg-gray-50 rounded border text-xs overflow-auto max-h-60">
                  <h4 className="font-semibold mb-2">Статус вкладок интерфейса</h4>
                  
                  <div className="mb-3 border p-2 rounded bg-white">
                    <h5 className="font-semibold mb-1">Оборудование</h5>
                    <div className={tabsStatus.equipment.unlocked ? "text-green-600" : "text-red-500"}>
                      Статус: {tabsStatus.equipment.unlocked ? "✅ Разблокировано" : "❌ Заблокировано"}
                    </div>
                    <div className="mt-1">
                      Условие: {tabsStatus.equipment.condition}
                    </div>
                  </div>
                  
                  <div className="mb-3 border p-2 rounded bg-white">
                    <h5 className="font-semibold mb-1">Исследования</h5>
                    <div className={tabsStatus.research.unlocked ? "text-green-600" : "text-red-500"}>
                      Статус: {tabsStatus.research.unlocked ? "✅ Разблокировано" : "❌ Заблокировано"}
                    </div>
                    <div className="mt-1">
                      Условие: {tabsStatus.research.condition}
                    </div>
                  </div>
                  
                  <div className="mb-3 border p-2 rounded bg-white">
                    <h5 className="font-semibold mb-1">Специализация</h5>
                    <div className={tabsStatus.specialization.unlocked ? "text-green-600" : "text-red-500"}>
                      Статус: {tabsStatus.specialization.unlocked ? "✅ Разблокировано" : "❌ Заблокировано"}
                    </div>
                    <div className="mt-1">
                      Условие: {tabsStatus.specialization.condition}
                    </div>
                  </div>
                  
                  <h4 className="font-semibold mt-3 mb-1">Все вкладки:</h4>
                  <table className="w-full border-collapse text-xs mt-1">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-1 py-1 text-left">ID</th>
                        <th className="border px-1 py-1 text-center">Разблокировано</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tabsStatus.allTabs.map((tab, index) => (
                        <tr key={index} className={tab.id === 'equipment' ? 'bg-yellow-50' : ''}>
                          <td className="border px-1 py-1">{tab.id}</td>
                          <td className={`border px-1 py-1 text-center ${tab.unlocked ? 'text-green-600' : 'text-red-500'}`}>
                            {tab.unlocked ? '✅' : '❌'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <h5 className="font-semibold text-yellow-700">Возможная проблема</h5>
                    {practiceStatus && practiceStatus.unlocked && !tabsStatus.equipment.unlocked && (
                      <p>Здание "Практика" разблокировано, но вкладка "Оборудование" - нет. Проверьте счетчик buildingsUnlocked и логику разблокировки вкладки.</p>
                    )}
                    {practiceStatus && practiceStatus.unlocked && tabsStatus.equipment.unlocked && (
                      <p>И здание "Практика", и вкладка "Оборудование" разблокированы, но здание все равно не отображается. Проверьте компонент EquipmentTab и фильтрацию зданий.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">Нет данных. Нажмите "Обновить статус".</div>
              )}
            </TabsContent>
          </Tabs>
          
          <div className="mt-3 flex justify-end">
            <Button 
              variant="secondary" 
              size="sm" 
              className="text-xs" 
              onClick={updateStatus}
            >
              Обновить статус
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UnlockStatusPopup;
