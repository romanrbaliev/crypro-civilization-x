
import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Sparkles, Users, Building, Cpu, Database } from 'lucide-react';
import { formatNumber } from '@/utils/helpers';

interface GameLevelProps {
  onPhaseChange?: (phase: number) => void;
}

const GameLevel: React.FC<GameLevelProps> = ({ onPhaseChange }) => {
  const { state, dispatch } = useGame();
  const [showPhaseMessage, setShowPhaseMessage] = useState(false);
  const [lastPhase, setLastPhase] = useState(state.phase || 1);
  
  // Определение текущей фазы игры
  const determineCurrentPhase = () => {
    const { resources, buildings, upgrades } = state;
    
    // Фаза 1: Первые шаги (0-30 минут)
    if (resources.usdt.value < 25 && !buildings.practice.count) {
      return 1;
    }
    
    // Фаза 2: Основы криптоэкономики (30 мин - 2 часа)
    if (resources.usdt.value < 100 && !buildings.homeComputer?.count) {
      return 2;
    }
    
    // Фаза 3: Специализация (2-8 часов)
    if (resources.usdt.value < 500 && !upgrades.basicBlockchain?.purchased) {
      return 3;
    }
    
    // Фаза 4: Крипто-сообщество (8-24 часа)
    if (resources.usdt.value < 1000) {
      return 4;
    }
    
    // Фаза 5: Расширенная крипто-экономика (1-5 дней)
    if (resources.usdt.value < 5000) {
      return 5;
    }
    
    // Фаза 6: Престиж и мета-прогрессия (5+ дней)
    return 6;
  };
  
  // Получаем текущую фазу
  const currentPhase = determineCurrentPhase();
  
  // Описание текущей фазы
  const getPhaseDescription = (phase: number) => {
    switch (phase) {
      case 1:
        return {
          title: "Первые шаги",
          description: "Изучайте основы криптовалют и зарабатывайте первую прибыль. Активируйте генератор, чтобы получить электричество.",
          goals: ["Заработать 25 USDT", "Купить генератор", "Начать автоматизацию знаний"]
        };
      case 2:
        return {
          title: "Основы криптоэкономики",
          description: "Осваивайте вычислительную мощность и расширяйте свою инфраструктуру.",
          goals: ["Купить домашний компьютер", "Начать майнинг", "Исследовать Основы блокчейна"]
        };
      case 3:
        return {
          title: "Специализация",
          description: "Выберите направление развития и углубляйтесь в специализированные исследования.",
          goals: ["Выбрать специализацию", "Улучшить оборудование", "Расширить инфраструктуру"]
        };
      case 4:
        return {
          title: "Крипто-сообщество",
          description: "Формируйте сообщество и начинайте совместные проекты с другими игроками.",
          goals: ["Пригласить рефералов", "Создать первые совместные проекты"]
        };
      case 5:
        return {
          title: "Расширенная крипто-экономика",
          description: "Исследуйте сложные экономические механизмы и влияйте на глобальный рынок.",
          goals: ["Открыть DeFi-механики", "Управлять рыночной ликвидностью"]
        };
      case 6:
        return {
          title: "Престиж и мета-прогрессия",
          description: "Достигните вершин развития и перезапустите игру с постоянными бонусами.",
          goals: ["Накопить престижные очки", "Активировать мета-улучшения"]
        };
      default:
        return {
          title: "Неизвестная фаза",
          description: "Продолжайте развивать свою крипто-империю.",
          goals: ["Накапливайте ресурсы", "Открывайте новые возможности"]
        };
    }
  };
  
  // Подсказки для текущей фазы
  const getCurrentPhaseTips = (phase: number) => {
    switch (phase) {
      case 1:
        return [
          "Нажимайте «Изучить крипту» для получения базовых знаний",
          "Обменивайте знания на USDT через кнопку «Применить знания»",
          "Автоматизируйте получение знаний, купив «Практику»"
        ];
      case 2:
        return [
          "Используйте генератор для получения электричества",
          "Компьютеры преобразуют электричество в вычислительную мощность",
          "Майнинг конвертирует вычислительную мощность в USDT"
        ];
      case 3:
        return [
          "Исследуйте технологии для открытия новых возможностей",
          "Специализации дают уникальные бонусы к определенным видам деятельности",
          "Изучите технологии из разных категорий для открытия синергий"
        ];
      case 4:
        return [
          "Приглашайте друзей по реферальной ссылке для получения бонусов",
          "Сотрудничайте с другими игроками для получения дополнительных ресурсов",
          "Помогайте другим игрокам для получения дополнительных бонусов"
        ];
      case 5:
        return [
          "Исследуйте DeFi-механизмы для получения пассивного дохода",
          "Создавайте пулы ликвидности для обеспечения стабильности рынка",
          "Используйте арбитраж для получения прибыли на разнице курсов"
        ];
      case 6:
        return [
          "Накопите достаточно ресурсов для достижения престижа",
          "Престиж перезапускает игру, но сохраняет мета-прогрессию",
          "Используйте мета-улучшения для ускорения прогресса в следующих циклах"
        ];
      default:
        return [
          "Продолжайте накапливать ресурсы и улучшать инфраструктуру",
          "Исследуйте новые технологии для открытия дополнительных возможностей",
          "Взаимодействуйте с другими игроками для получения бонусов"
        ];
    }
  };
  
  // Уведомление о смене фазы
  useEffect(() => {
    if (currentPhase !== lastPhase) {
      const phaseInfo = getPhaseDescription(currentPhase);
      
      toast.success(
        <div>
          <h3 className="font-semibold">Новая фаза: {phaseInfo.title}</h3>
          <p className="text-sm">{phaseInfo.description}</p>
        </div>, 
        { duration: 5000 }
      );
      
      setShowPhaseMessage(true);
      setLastPhase(currentPhase);
      
      // Обновление фазы в состоянии игры
      dispatch({ 
        type: "FORCE_RESOURCE_UPDATE", 
        payload: { phase: currentPhase } 
      });
      
      // Оповещение родительского компонента о смене фазы
      if (onPhaseChange) {
        onPhaseChange(currentPhase);
      }
      
      // Скрываем сообщение через 15 секунд
      setTimeout(() => {
        setShowPhaseMessage(false);
      }, 15000);
    }
  }, [currentPhase, lastPhase, dispatch, onPhaseChange]);
  
  // Прогресс к следующей фазе
  const getNextPhaseProgress = () => {
    const { resources, buildings, upgrades } = state;
    
    switch (currentPhase) {
      case 1:
        return Math.min(100, (resources.usdt.value / 25) * 100);
      case 2:
        if (buildings.homeComputer) {
          return Math.min(100, (buildings.homeComputer.count / 1) * 100);
        }
        return Math.min(100, (resources.usdt.value / 100) * 100);
      case 3:
        return Math.min(100, (resources.usdt.value / 500) * 100);
      case 4:
        return Math.min(100, (resources.usdt.value / 1000) * 100);
      case 5:
        return Math.min(100, (resources.usdt.value / 5000) * 100);
      case 6:
        return 100; // Последняя фаза
      default:
        return 0;
    }
  };
  
  // Статистика развития
  const getStatistics = () => {
    const { resources, buildings, referrals } = state;
    
    return [
      { icon: <Cpu className="w-4 h-4" />, label: "Вычислительная мощность", value: formatNumber(resources.computingPower?.value || 0) },
      { icon: <Building className="w-4 h-4" />, label: "Всего зданий", value: Object.values(buildings).reduce((sum, b) => sum + b.count, 0) },
      { icon: <Database className="w-4 h-4" />, label: "USDT накоплено", value: formatNumber(resources.usdt.value) },
      { icon: <Users className="w-4 h-4" />, label: "Рефералы", value: (referrals?.length || 0) }
    ];
  };
  
  const phaseInfo = getPhaseDescription(currentPhase);
  const phaseTips = getCurrentPhaseTips(currentPhase);
  const nextPhaseProgress = getNextPhaseProgress();
  const statistics = getStatistics();
  
  return (
    <div className="w-full p-3">
      {/* Заголовок текущей фазы */}
      <div className="flex items-center mb-3">
        <div className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-2">
          {currentPhase}
        </div>
        <h2 className="text-lg font-semibold">
          {phaseInfo.title}
        </h2>
        
        {currentPhase > 1 && (
          <div className="ml-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => setShowPhaseMessage(!showPhaseMessage)}
            >
              {showPhaseMessage ? "Скрыть" : "Инфо"}
            </Button>
          </div>
        )}
      </div>
      
      {/* Информация о фазе */}
      {showPhaseMessage && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100 text-blue-800">
          <p className="text-sm mb-2">{phaseInfo.description}</p>
          
          <div className="space-y-1 mt-2">
            <h3 className="text-xs font-semibold">Цели:</h3>
            <ul className="space-y-1">
              {phaseInfo.goals.map((goal, index) => (
                <li key={index} className="text-xs flex items-start">
                  <div className="mt-0.5 mr-1.5">•</div>
                  <div>{goal}</div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-1 mt-3">
            <h3 className="text-xs font-semibold">Советы:</h3>
            <ul className="space-y-1">
              {phaseTips.map((tip, index) => (
                <li key={index} className="text-xs flex items-start">
                  <div className="mt-0.5 mr-1.5">•</div>
                  <div>{tip}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Прогресс к следующей фазе */}
      {currentPhase < 6 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span>Прогресс к фазе {currentPhase + 1}</span>
            <span>{Math.round(nextPhaseProgress)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${nextPhaseProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Статистика */}
      <div className="grid grid-cols-2 gap-2">
        {statistics.map((stat, index) => (
          <div 
            key={index} 
            className="p-2 border rounded-lg flex flex-col items-center justify-center text-center"
          >
            <div className="flex items-center justify-center mb-1 text-blue-600">
              {stat.icon}
            </div>
            <div className="text-[9px] text-gray-500">{stat.label}</div>
            <div className="font-medium text-xs">{stat.value}</div>
          </div>
        ))}
      </div>
      
      {/* Бонусы текущей фазы */}
      <div className="mt-4 p-2 border rounded-lg">
        <div className="flex items-center text-xs font-medium mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-1" />
          Бонусы текущей фазы
        </div>
        
        <div className="space-y-1">
          {currentPhase >= 1 && (
            <div className="text-xs flex items-center">
              <div className="w-4 h-4 flex items-center justify-center rounded-full bg-green-100 text-green-600 mr-2 text-[9px]">
                1
              </div>
              <span>+10% к скорости получения знаний</span>
            </div>
          )}
          
          {currentPhase >= 2 && (
            <div className="text-xs flex items-center">
              <div className="w-4 h-4 flex items-center justify-center rounded-full bg-green-100 text-green-600 mr-2 text-[9px]">
                2
              </div>
              <span>+15% к эффективности конвертации знаний</span>
            </div>
          )}
          
          {currentPhase >= 3 && (
            <div className="text-xs flex items-center">
              <div className="w-4 h-4 flex items-center justify-center rounded-full bg-green-100 text-green-600 mr-2 text-[9px]">
                3
              </div>
              <span>+20% к вычислительной мощности</span>
            </div>
          )}
          
          {currentPhase >= 4 && (
            <div className="text-xs flex items-center">
              <div className="w-4 h-4 flex items-center justify-center rounded-full bg-green-100 text-green-600 mr-2 text-[9px]">
                4
              </div>
              <span>+25% к бонусам от рефералов</span>
            </div>
          )}
          
          {currentPhase >= 5 && (
            <div className="text-xs flex items-center">
              <div className="w-4 h-4 flex items-center justify-center rounded-full bg-green-100 text-green-600 mr-2 text-[9px]">
                5
              </div>
              <span>+30% к максимальному хранению ресурсов</span>
            </div>
          )}
          
          {currentPhase >= 6 && (
            <div className="text-xs flex items-center">
              <div className="w-4 h-4 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-2 text-[9px]">
                6
              </div>
              <span>Открыт доступ к престижу и мета-прогрессии</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameLevel;
