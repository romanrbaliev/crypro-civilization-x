
// Исправление ошибки на строке 79, работа с value в counter
// Находим использование counter.value и меняем на более безопасный вариант

const clickCount = typeof state.counters.welcomeClicks === 'object' 
  ? state.counters.welcomeClicks.value || 0 
  : (state.counters.welcomeClicks || 0);
