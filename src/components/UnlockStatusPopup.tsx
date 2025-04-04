
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
  debugTabsUnlocks 
} from '@/utils/buildingDebugUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const UnlockStatusPopup = () => {
  const { state, forceUpdate } = useGame();
  const [statusSteps, setStatusSteps] = useState<string[]>([]);
  const [unlockedItems, setUnlockedItems] = useState<string[]>([]);
  const [lockedItems, setLockedItems] = useState<string[]>([]);
  const [practiceStatus, setPracticeStatus] = useState<any>(null);
  const [buildingsStatus, setBuildingsStatus] = useState<any>(null);
  const [allBuildings, setAllBuildings] = useState<any[]>([]);
  const [tabsStatus, setTabsStatus] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  const updateStatus = async () => {
    try {
      setLoading(true);
      
      // Форсируем обновление состояния игры
      forceUpdate();
      
      // Небольшая задержка, чтобы обновление успело применится
      setTimeout(() => {
        try {
          // Получаем отчет о статусе разблокировок
          const result = debugUnlockStatus(state);
          setStatusSteps(result.steps || []); // Шаги проверки условий
          setUnlockedItems(result.unlocked || []); // Разблокированные элементы
          setLockedItems(result.locked || []); // Заблокированные элементы
          
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
  
  // Обновляем статус при открытии popover
  const handleOpenChange = (open: boolean) => {
    if (open) {
      updateStatus();
    }
  };
  
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
      <PopoverContent className="w-[500px] p-0">
        <div className="p-4 bg-white rounded-md">
          <h3 className="text-sm font-bold text-gray-700 mb-2">Статус разблокировок контента</h3>
          
          <Tabs defaultValue="unlocks">
            <TabsList className="w-full mb-2">
              <TabsTrigger value="unlocks">Разблокировки</TabsTrigger>
              <TabsTrigger value="practice">Отладка "Практика"</TabsTrigger>
              <TabsTrigger value="buildings">Все здания</TabsTrigger>
              <TabsTrigger value="tabs">Вкладки</TabsTrigger>
            </TabsList>
            
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
