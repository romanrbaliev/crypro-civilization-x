
import React from "react";
import { useGame } from "@/context/hooks/useGame";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";
import ExchangeBtcButton from "./buttons/ExchangeBtcButton";
import PracticeButton from "./buttons/PracticeButton";
import { useActionButtons } from "@/hooks/useActionButtons";
import LearnButton from "./buttons/LearnButton";
import ApplyKnowledgeButton from "./buttons/ApplyKnowledgeButton";

interface ActionButtonsProps {
  onAddEvent: (message: string, type: string) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onAddEvent }) => {
  const { state } = useGame();
  const {
    handleLearnClick,
    handleApplyKnowledge,
    handleApplyAllKnowledge,
    handlePractice,
    handleExchangeBitcoin,
    isButtonEnabled,
    practiceIsUnlocked,
    practiceBuildingExists,
    practiceCurrentCost,
    practiceCurrentLevel,
    hasAutoMiner,
    currentExchangeRate,
    shouldHideLearnButton,
    knowledgeEfficiencyBonus
  } = useActionButtons({ onAddEvent });
  
  // Получаем состояние разблокировки кнопки "Применить знания"
  const hasApplyKnowledge = state.unlocks.applyKnowledge;
  
  // Получаем значения ресурсов для проверки доступности кнопок (с проверкой на undefined)
  const knowledge = state.resources.knowledge || { value: 0 };
  const usdt = state.resources.usdt || { value: 0, unlocked: false };
  
  // Безопасно получаем Bitcoin
  const bitcoin = state.resources.bitcoin || { unlocked: false, value: 0 };
  
  // Исправленная проверка на возможность обмена Bitcoin - проверяем только наличие Bitcoin
  const canExchangeBitcoin = bitcoin.unlocked && bitcoin.value > 0;
  
  // Флаг для определения, нужно ли использовать режим "применить все знания"
  const shouldApplyAll = shouldHideLearnButton;
  
  // Проверяем условие разблокировки USDT - должно быть 2 и более применений знаний
  const isUsdtUnlocked = usdt.unlocked && 
                      state.counters.applyKnowledge && 
                      state.counters.applyKnowledge.value >= 2;
  
  // Массив компонентов кнопок, которые будем рендерить
  const buttonComponents = [];
  
  // Отладочная информация для понимания почему кнопка может не появляться
  console.log("Состояние разблокировки кнопки 'Применить знания':", hasApplyKnowledge);
  console.log("Счетчик кликов знаний:", state.counters.knowledgeClicks?.value);
  console.log("Счетчик применений знаний:", state.counters.applyKnowledge?.value);
  console.log("isUsdtUnlocked:", isUsdtUnlocked);
  console.log("Bitcoin разблокирован:", bitcoin.unlocked);
  console.log("Значение Bitcoin:", bitcoin.value);
  
  // Кнопка обмена Bitcoin (если разблокирована)
  if (bitcoin.unlocked && isUsdtUnlocked) {
    buttonComponents.push(
      <ExchangeBtcButton 
        key="exchange"
        onClick={handleExchangeBitcoin}
        disabled={!canExchangeBitcoin}
        className="w-full"
        currentRate={currentExchangeRate}
      />
    );
  }
  
  // Кнопка Практика (если разблокирована)
  if (practiceIsUnlocked && isUsdtUnlocked) {
    console.log("Кнопка практики разблокирована, добавляем на экран");
    buttonComponents.push(
      <PracticeButton
        key="practice"
        onClick={handlePractice}
        disabled={!isButtonEnabled("usdt", practiceCurrentCost)}
        level={practiceCurrentLevel}
        cost={practiceCurrentCost}
      />
    );
  } else {
    console.log("Кнопка практики не разблокирована. practiceIsUnlocked:", practiceIsUnlocked);
    console.log("state.unlocks.practice:", state.unlocks.practice);
    console.log("applyKnowledge счетчик:", state.counters.applyKnowledge?.value);
  }
  
  // Кнопка Применить знания (если разблокирована)
  if (hasApplyKnowledge) {
    const isDisabled = shouldApplyAll 
      ? knowledge.value < 10 // В режиме "применить все" нужно хотя бы 10 знаний
      : knowledge.value < 10;
      
    buttonComponents.push(
      <ApplyKnowledgeButton
        key="apply"
        onClick={shouldApplyAll ? handleApplyAllKnowledge : handleApplyKnowledge}
        className="w-full"
        disabled={isDisabled}
        knowledgeEfficiencyBonus={knowledgeEfficiencyBonus}
        knowledgeValue={knowledge.value}
        applyAll={shouldApplyAll}
      />
    );
  }
  
  // Кнопка Изучить крипту - добавляем только если не нужно скрывать
  if (!shouldHideLearnButton) {
    buttonComponents.push(
      <LearnButton
        key="learn"
        onClick={handleLearnClick}
        className="w-full"
        shouldHide={shouldHideLearnButton}
      />
    );
  }
  
  return (
    <div className="flex flex-col gap-2">
      {buttonComponents}
    </div>
  );
};

export default ActionButtons;
