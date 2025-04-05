import { GameState } from '@/context/types';
import { calculateBuildingProduction } from './BuildingProductionCalculationService';
import { calculateUpgradeEffects } from './UpgradeEffectsCalculationService';
import { BonusCalculationService } from './BonusCalculationService';

export class ResourceCalculationService {
  private bonusCalculationService: BonusCalculationService;

  constructor() {
    this.bonusCalculationService = new BonusCalculationService();
  }

  /**
   * Обновляет состояние игры, пересчитывая производство ресурсов, потребление и эффекты.
   * @param state Текущее состояние игры.
   * @param deltaTime Время, прошедшее с последнего обновления, в секундах.
   * @returns Новое состояние игры с обновленными значениями ресурсов.
   */
  processResourceUpdates(state: GameState, deltaTime: number): GameState {
    // 1. Расчет базовых значений производства и потребления ресурсов
    let updatedState = this.calculateBaseResourceValues(state);

    // 2. Применение бонусов от зданий
    updatedState = this.applyBuildingBonuses(updatedState);

    // 3. Применение бонусов от улучшений
    updatedState = this.applyUpgradeBonuses(updatedState);

    // 4. Применение бонусов от специализаций
    updatedState = this.applySpecializationBonuses(updatedState);

    // 5. Применение бонусов от синергий
    updatedState = this.applySynergyBonuses(updatedState);

    // 6. Расчет и применение эффектов, зависящих от времени
    updatedState = this.calculateTimeBasedEffects(updatedState, deltaTime);

    // 7. Обновление значений ресурсов на основе производства и потребления
    updatedState = this.updateResourceValues(updatedState, deltaTime);

    return updatedState;
  }

  /**
   * Вычисляет базовые значения производства и потребления ресурсов на основе зданий.
   * @param state Текущее состояние игры.
   * @returns Новое состояние игры с обновленными базовыми значениями ресурсов.
   */
  calculateBaseResourceValues(state: GameState): GameState {
    const newState = { ...state };

    // Сбрасываем базовые значения производства и потребления ресурсов
    for (const resourceId in newState.resources) {
      newState.resources[resourceId] = {
        ...newState.resources[resourceId],
        baseProduction: 0,
        production: 0,
        consumption: 0,
        perSecond: 0
      };
    }

    // Пересчитываем базовые значения производства и потребления ресурсов на основе зданий
    for (const buildingId in newState.buildings) {
      const building = newState.buildings[buildingId];

      if (building.unlocked) {
        // Расчет производства ресурсов
        if (building.production) {
          for (const resourceId in building.production) {
            if (newState.resources[resourceId]) {
              newState.resources[resourceId] = {
                ...newState.resources[resourceId],
                baseProduction: newState.resources[resourceId].baseProduction + building.production[resourceId] * building.count
              };
            }
          }
        }

        // Расчет потребления ресурсов
        if (building.consumption) {
          for (const resourceId in building.consumption) {
            if (newState.resources[resourceId]) {
              newState.resources[resourceId] = {
                ...newState.resources[resourceId],
                consumption: newState.resources[resourceId].consumption + building.consumption[resourceId] * building.count
              };
            }
          }
        }
      }
    }

    return newState;
  }

  /**
   * Применяет бонусы к производству и потреблению ресурсов от зданий.
   * @param state Текущее состояние игры.
   * @returns Новое состояние игры с примененными бонусами от зданий.
   */
  applyBuildingBonuses(state: GameState): GameState {
    let newState = { ...state };

    for (const buildingId in newState.buildings) {
      const building = newState.buildings[buildingId];

      if (building.unlocked) {
        newState = calculateBuildingProduction(newState, building);
      }
    }

    return newState;
  }

  /**
   * Применяет бонусы к производству и потреблению ресурсов от улучшений.
   * @param state Текущее состояние игры.
   * @returns Новое состояние игры с примененными бонусами от улучшений.
   */
  applyUpgradeBonuses(state: GameState): GameState {
    let newState = { ...state };

    for (const upgradeId in newState.upgrades) {
      const upgrade = newState.upgrades[upgradeId];

      if (upgrade.purchased) {
        newState = calculateUpgradeEffects(newState, upgrade);
      }
    }

    return newState;
  }

  /**
   * Обновляет метод, использующий gameTime
   */
  calculateTimeBasedEffects(state: GameState, deltaTime: number): GameState {
    // Безопасно получаем игровое время, используя totalPlayTime если gameTime не определено
    const currentTime = state.totalPlayTime || 0;
    const previousTime = (state.gameTime || 0);

    let newState = { ...state, gameTime: currentTime + deltaTime };

    // Пример: Увеличение производства знаний со временем
    const knowledgeIncrease = 0.1 * deltaTime;
    if (newState.resources.knowledge) {
      newState.resources.knowledge = {
        ...newState.resources.knowledge,
        production: newState.resources.knowledge.production + knowledgeIncrease
      };
    }

    return newState;
  }

  /**
   * Применяет бонусы к производству и потреблению ресурсов от специализаций.
   * @param state Текущее состояние игры.
   * @returns Новое состояние игры с примененными бонусами от специализаций.
   */
  applySpecializationBonuses(state: GameState): GameState {
    if (!state.player) return state;

    // Получаем специализацию игрока из свойства player
    const playerSpecialization = state.player.specialization;

    if (!playerSpecialization || !state.specializations || !state.specializations[playerSpecialization]) {
      return state;
    }

    // Получаем бонусы специализации
    const specializationBonuses = state.specializations[playerSpecialization].bonuses;

    let newState = { ...state };

    // Пример: Увеличение производства ресурсов в зависимости от специализации
    if (specializationBonuses) {
      for (const resourceId in newState.resources) {
        if ((specializationBonuses as any)[`${resourceId}ProductionBoost`]) {
          const boost = (specializationBonuses as any)[`${resourceId}ProductionBoost`];
          newState.resources[resourceId] = {
            ...newState.resources[resourceId],
            production: newState.resources[resourceId].production + boost
          };
        }
      }
    }

    return newState;
  }

  /**
   * Применяет бонусы к производству и потреблению ресурсов от синергий.
   * @param state Текущее состояние игры.
   * @returns Новое состояние игры с примененными бонусами от синергий.
   */
  applySynergyBonuses(state: GameState): GameState {
    if (!state.player) return state;

    // Если synergies не определены, возвращаем состояние без изменений
    if (!state.synergies) return state;

    // Получаем активные синергии
    const activeSynergies = Object.values(state.synergies).filter(synergy => synergy.active);

    let newState = { ...state };

    // Применяем бонусы от активных синергий
    activeSynergies.forEach(synergy => {
      if (synergy.bonuses) {
        for (const resourceId in newState.resources) {
          if ((synergy.bonuses as any)[`${resourceId}ProductionBoost`]) {
            const boost = (synergy.bonuses as any)[`${resourceId}ProductionBoost`];
            newState.resources[resourceId] = {
              ...newState.resources[resourceId],
              production: newState.resources[resourceId].production + boost
            };
          }
        }
      }
    });

    return newState;
  }

  /**
   * Обновляет значения ресурсов на основе производства и потребления.
   * @param state Текущее состояние игры.
   * @param deltaTime Время, прошедшее с последнего обновления, в секундах.
   * @returns Новое состояние игры с обновленными значениями ресурсов.
   */
  updateResourceValues(state: GameState, deltaTime: number): GameState {
    const newState = { ...state };

    for (const resourceId in newState.resources) {
      const resource = newState.resources[resourceId];

      // Рассчитываем изменение значения ресурса
      const productionPerSecond = resource.baseProduction + resource.production;
      const consumptionPerSecond = resource.consumption;
      const netChange = (productionPerSecond - consumptionPerSecond) * deltaTime;

      // Обновляем значение ресурса, учитывая максимальное значение
      const newValue = Math.min(resource.value + netChange, resource.max);
      newState.resources[resourceId] = {
        ...resource,
        value: Math.max(0, newValue), // Убедитесь, что значение не становится отрицательным
        perSecond: productionPerSecond - consumptionPerSecond // Обновляем perSecond
      };
    }

    return newState;
  }
}
