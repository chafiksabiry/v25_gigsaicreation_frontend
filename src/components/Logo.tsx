import React from 'react';
import mascotte from '../assets/mascotte.webp';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <div className={`relative group flex justify-center items-center ${className}`}>
      <div className="absolute -inset-4 bg-gradient-to-r from-harx-500/10 to-harx-alt-500/10 rounded-full blur-2xl group-hover:from-harx-500/20 group-hover:to-harx-alt-500/20 transition-all duration-700" />
      <img 
        src={mascotte} 
        alt="HARX Mascotte" 
        className="w-40 h-40 object-contain drop-shadow-[0_0_15px_rgba(255,77,77,0.3)] relative z-10 transition-transform duration-500 group-hover:scale-110 animate-float"
      />
    </div>
  );
};

export default Logo; 