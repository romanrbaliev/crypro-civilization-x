
import { 
  Book, 
  Cpu, 
  Zap, 
  DollarSign, 
  Bitcoin, 
  Circle,
  Award,
  Users
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

// Получает иконку для указанного ресурса
export const getResourceIcon = (resourceId: string): LucideIcon => {
  switch (resourceId.toLowerCase()) {
    case 'knowledge':
      return Book;
    case 'usdt':
      return DollarSign;
    case 'electricity':
      return Zap;
    case 'computingpower':
      return Cpu;
    case 'bitcoin':
      return Bitcoin;
    case 'reputation':
      return Award;
    case 'community':
      return Users;
    default:
      return Circle;
  }
};
