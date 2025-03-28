
import { Building, Resource, Upgrade, SpecializationSynergy } from "@/context/types";

/**
 * Набор функций-помощников для безопасного приведения типов в TypeScript
 */

/**
 * Проверяет, является ли значение зданием
 */
export const isBuilding = (value: unknown): value is Building => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'cost' in value &&
    'count' in value
  );
};

/**
 * Проверяет, является ли значение ресурсом
 */
export const isResource = (value: unknown): value is Resource => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'value' in value &&
    'type' in value
  );
};

/**
 * Проверяет, является ли значение исследованием
 */
export const isUpgrade = (value: unknown): value is Upgrade => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'cost' in value &&
    'purchased' in value
  );
};

/**
 * Проверяет, является ли значение специализационной синергией
 */
export const isSynergy = (value: unknown): value is SpecializationSynergy => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'bonus' in value &&
    'requiredCategories' in value
  );
};

/**
 * Безопасно преобразует неизвестный объект в здание
 */
export const asBuilding = (value: unknown): Building => {
  if (isBuilding(value)) return value;
  console.error('Ошибка приведения типа к Building:', value);
  throw new Error('Неверный тип объекта для Building');
};

/**
 * Безопасно преобразует неизвестный объект в ресурс
 */
export const asResource = (value: unknown): Resource => {
  if (isResource(value)) return value;
  console.error('Ошибка приведения типа к Resource:', value);
  throw new Error('Неверный тип объекта для Resource');
};

/**
 * Безопасно преобразует неизвестный объект в исследование
 */
export const asUpgrade = (value: unknown): Upgrade => {
  if (isUpgrade(value)) return value;
  console.error('Ошибка приведения типа к Upgrade:', value);
  throw new Error('Неверный тип объекта для Upgrade');
};

/**
 * Безопасно преобразует неизвестный объект в синергию
 */
export const asSynergy = (value: unknown): SpecializationSynergy => {
  if (isSynergy(value)) return value;
  console.error('Ошибка приведения типа к Synergy:', value);
  throw new Error('Неверный тип объекта для Synergy');
};
