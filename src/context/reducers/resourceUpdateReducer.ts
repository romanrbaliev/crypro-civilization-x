
import { GameState } from '../types';
import { calculateResourceProduction, applyStorageBoosts, updateResourceValues } from '../utils/resourceUtils';
import { helperStatusCache } from '@/utils/referralHelpers/helperCache';
import { getUserIdentifier } from '@/api/userIdentification';
import { syncHelperStatusWithDB } from '@/utils/referralHelpers/helperStatus';

// Асинхронная функция для прямой проверки статуса помощника в базе данных
async function checkHelperStatusInDB(userId: string): Promise<number> {
  if (!userId) return 0;
  
  try {
    // Получаем количество зданий, где пользователь является помощником, из кеша
    return await helperStatusCache.get(userId, true);
  } catch (error) {
    console.error('Неожиданная ошибка при проверке статуса помощника в БД:', error);
    return 0;
  }
}

// Функция для получения бонусов от текущей фазы игры
function getPhaseBoosts(phase: number) {
  const boosts = {
    knowledgeRate: 0,
    conversionRate: 0,
    computingPower: 0,
    referralBonus: 0,
    maxStorage: 0,
    prestigeMultiplier: 0
  };
  
  // Бонусы накапливаются с каждой фазой
  if (phase >= 1) {
    boosts.knowledgeRate += 0.1; // +10% к скорости получения знаний
  }
  
  if (phase >= 2) {
    boosts.conversionRate += 0.15; // +15% к эффективности конвертации знаний
  }
  
  if (phase >= 3) {
    boosts.computingPower += 0.2; // +20% к вычислительной мощности
  }
  
  if (phase >= 4) {
    boosts.referralBonus += 0.25; // +25% к бонусам от рефералов
  }
  
  if (phase >= 5) {
    boosts.maxStorage += 0.3; // +30% к максимальному хранению ресурсов
  }
  
  if (phase >= 6) {
    boosts.prestigeMultiplier += 0.5; // +50% к множителю престижа
  }
  
  return boosts;
}

export const processResourceUpdate = (state: GameState): GameState => {
  const now = Date.now();
  const deltaTime = now - state.lastUpdate;
  
  // Пытаемся получить ID пользователя сразу из кэша или localStorage
  let currentUserId = window.__game_user_id || localStorage.getItem('crypto_civ_user_id');
  let referralHelperBonus = 0;
  
  // Если у нас есть ID пользователя, проверяем является ли он помощником на основе локального состояния
  if (currentUserId) {
    const buildingsAsHelper = state.referralHelpers.filter(h => 
      h.helperId === currentUserId && h.status === 'accepted'
    ).length;
    
    // Каждое здание, на котором пользователь помогает, дает ему бонус 10%
    referralHelperBonus = buildingsAsHelper * 0.1; // 10% за каждое здание
    
    if (buildingsAsHelper > 0) {
      console.log(`Локальное состояние: Пользователь ${currentUserId} помогает на ${buildingsAsHelper} зданиях, бонус: +${referralHelperBonus * 100}%`);
    }
    
    // Параллельно запрашиваем обновление статуса помощника из БД для будущих расчетов
    // Обновление происходит асинхронно и не блокирует текущее обновление ресурсов
    helperStatusCache.update(currentUserId).then(helperBuildingsCount => {
      // Если данные в БД отличаются от локального состояния
      if (helperBuildingsCount !== buildingsAsHelper) {
        console.log(`БД и локальное состояние различаются: в БД ${helperBuildingsCount} зданий, локально ${buildingsAsHelper}`);
        
        // Запрашиваем полное обновление помощников из БД
        setTimeout(() => {
          const refreshEvent = new CustomEvent('refresh-referrals');
          window.dispatchEvent(refreshEvent);
        }, 100);
      }
    }).catch(err => {
      console.error('Ошибка при проверке статуса помощника в БД:', err);
    });
  } else {
    // Если ID не найден в кэше, пробуем получить его асинхронно
    getUserIdentifier()
      .then(userId => {
        if (userId) {
          // Сохраняем ID пользователя для быстрого доступа в будущем
          window.__game_user_id = userId;
          localStorage.setItem('crypto_civ_user_id', userId);
          
          console.log(`Получен ID пользователя: ${userId}`);
          
          // Проверяем этого пользователя в качестве помощника
          helperStatusCache.update(userId).then(helperBuildingsCount => {
            if (helperBuildingsCount > 0) {
              console.log(`Новый пользователь ${userId} помогает на ${helperBuildingsCount} зданиях по данным БД`);
              
              // Запрашиваем полное обновление помощников из БД
              setTimeout(() => {
                const refreshEvent = new CustomEvent('refresh-referrals');
                window.dispatchEvent(refreshEvent);
              }, 100);
            }
          });
        }
      })
      .catch(err => console.error('Ошибка при получении идентификатора пользователя:', err));
  }
  
  // Синхронизируем статусы помощников с базой данных в фоновом режиме
  if (state.referralHelpers.length > 0 && currentUserId) {
    syncHelperStatusWithDB(state.referralHelpers)
      .then(updatedHelpers => {
        if (updatedHelpers && updatedHelpers.length > 0) {
          // Отправляем событие для обновления состояния игры
          const updateEvent = new CustomEvent('helpers-updated', {
            detail: { updatedHelpers }
          });
          window.dispatchEvent(updateEvent);
          
          console.log('Помощники синхронизированы с базой данных:', updatedHelpers);
        }
      })
      .catch(err => console.error('Ошибка при синхронизации помощников:', err));
  }
  
  // Получаем бонусы от текущей фазы игры
  const phaseBoosts = getPhaseBoosts(state.phase || 1);
  
  // Рассчитываем производство для всех ресурсов с учетом помощников, рефералов и фазовых бонусов
  let updatedResources = calculateResourceProduction(
    state.resources, 
    state.buildings, 
    state.referralHelpers,
    state.referrals,
    currentUserId, 
    referralHelperBonus,
    phaseBoosts
  );
  
  // Обновляем значения ресурсов с учетом времени
  const finalResources = updateResourceValues(updatedResources, deltaTime);
  
  return {
    ...state,
    resources: finalResources,
    lastUpdate: now,
    gameTime: state.gameTime + deltaTime,
    phaseBoosts: phaseBoosts
  };
};
