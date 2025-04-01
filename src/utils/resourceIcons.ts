
import { 
  Brain, 
  DollarSign, 
  Zap, 
  Cpu, 
  Award, 
  Users, 
  Bitcoin, 
  BarChart4,
  LucideIcon
} from "lucide-react";

/**
 * Возвращает иконку для указанного ресурса
 * @param resourceId ID ресурса
 * @returns Компонент иконки из lucide-react
 */
export const getResourceIcon = (resourceId: string): LucideIcon | null => {
  switch (resourceId) {
    case 'knowledge':
      return Brain;
    case 'usdt':
      return DollarSign;
    case 'electricity':
      return Zap;
    case 'computingPower':
      return Cpu;
    case 'reputation':
      return Award;
    case 'influence':
      return Users;
    case 'bitcoin':
      return Bitcoin;
    case 'followers':
      return Users;
    case 'analytics':
      return BarChart4;
    default:
      return null;
  }
};
