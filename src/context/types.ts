
// Добавим к определению SpecializationSynergy поле bonus
export interface SpecializationSynergy {
  id: string;
  name: string;
  description: string;
  requiredCategories?: string[];
  requiredCount?: number;
  effects: { [resourceId: string]: number };
  unlocked: boolean;
  active: boolean;
  bonus?: { [key: string]: number };
}
