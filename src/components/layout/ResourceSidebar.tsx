
import React from 'react';
import { useGame } from '@/context/hooks/useGame';
import { formatNumber } from '@/utils/helpers';
import { DollarSign } from 'lucide-react';

const ResourceSidebar: React.FC = () => {
  const { state } = useGame();
  
  // Получаем разблокированные ресурсы
  const unlockedResources = Object.values(state.resources).filter(resource => resource.unlocked);
  
  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Ресурсы */}
      <div className="flex-1">
        {unlockedResources.map(resource => (
          <div key={resource.id} className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">{resource.name}</span>
              <span className="text-gray-900 font-medium">
                {formatNumber(resource.value, 2)} / {formatNumber(resource.max, 0)}
              </span>
            </div>
            
            {resource.perSecond !== 0 && (
              <div className="text-right text-sm">
                <span className={resource.perSecond > 0 ? 'text-green-500' : 'text-red-500'}>
                  {resource.perSecond > 0 ? '+' : ''}{formatNumber(resource.perSecond, 2)}/сек
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Дополнительные функции внизу сайдбара */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center mb-3">
          <DollarSign className="h-6 w-6 text-gray-400 mr-2" />
          <span className="text-gray-700">Full USDT (Тест)</span>
        </div>
      </div>
      
      {/* Нижнее меню */}
      <div className="border-t border-gray-200">
        {/* Кнопка Оборудование */}
        <button className="w-full py-3 px-4 flex items-center bg-gray-900 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          Оборудование
        </button>
        
        {/* Кнопка Исследования */}
        <button className="w-full py-3 px-4 flex items-center hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Исследования
        </button>
      </div>
      
      {/* Журнал событий */}
      <div className="border-t border-gray-200 p-4">
        <h3 className="text-gray-700 font-medium mb-2">Журнал событий</h3>
        <div className="text-xs text-gray-500">
          <p>34 событий</p>
          {/* Здесь можно отобразить события, если они есть */}
        </div>
      </div>
    </div>
  );
};

export default ResourceSidebar;
