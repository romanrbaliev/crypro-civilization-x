
import React from 'react';
import { BitcoinIcon } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ size = 'md' }) => {
  const sizeClass = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }[size];

  return (
    <div className="flex items-center gap-2">
      <BitcoinIcon className={`${sizeClass} text-amber-500`} />
      <span className={`font-bold ${size === 'lg' ? 'text-2xl' : 'text-xl'}`}>
        Crypto Civilization
      </span>
    </div>
  );
};

export default Logo;
