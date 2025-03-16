
import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isActive?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isActive = false, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none';
    
    const variants = {
      primary: 'bg-game-primary text-white hover:shadow-lg hover:shadow-game-primary/20 active:scale-95',
      secondary: 'bg-game-secondary text-white hover:shadow-lg hover:shadow-game-secondary/20 active:scale-95',
      accent: 'bg-game-accent text-white hover:shadow-lg hover:shadow-game-accent/20 active:scale-95',
      ghost: 'bg-transparent hover:bg-gray-100 active:scale-95',
    };
    
    const sizes = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-11 px-6 text-base',
      lg: 'h-14 px-8 text-lg',
    };
    
    const activeStyles = isActive ? 'ring-2 ring-offset-2 ring-game-primary/50' : '';
    
    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], activeStyles, className)}
        ref={ref}
        {...props}
      >
        <span className="relative">{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
