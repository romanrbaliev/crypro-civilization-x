
// Исправление ошибки с типом счетчика на строке 157
// Заменяем объект с id и name на объект с value и updatedAt

// Было:
// totalBuildings: {
//   ...(typeof newState.counters.totalBuildings === 'object' ? newState.counters.totalBuildings : { id: 'totalBuildings', name: 'Всего зданий', value: 0 }),
//   value: (typeof newState.counters.totalBuildings === 'object' ? newState.counters.totalBuildings.value : 0) + 1
// }

// Стало:
totalBuildings: {
  value: (typeof newState.counters.totalBuildings === 'object' && newState.counters.totalBuildings.value !== undefined ? 
    newState.counters.totalBuildings.value : 
    (typeof newState.counters.totalBuildings === 'number' ? newState.counters.totalBuildings : 0)) + 1,
  updatedAt: Date.now()
}
