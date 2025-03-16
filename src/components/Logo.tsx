
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo = ({ size = 'md', className }: LogoProps) => {
  const sizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  };

  return (
    <div className={cn('font-bold tracking-tight flex items-center', sizes[size], className)}>
      <span className="text-game-primary">T</span>
      <span className="text-game-secondary">Game</span>
    </div>
  );
};

export default Logo;
