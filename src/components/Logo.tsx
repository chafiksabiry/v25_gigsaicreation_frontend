import React from 'react';
import harxLogo from '../assets/harx-blanc.jpg';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <div className={`overflow-hidden mb-1 mt-0 mx-auto inline-block ${className}`}>
      <img 
        src={harxLogo} 
        alt="HARX Logo" 
        className="md:w-80 md:h-[7rem] object-contain rounded-2xl"
        style={{ borderRadius: '15%' }}
      />
    </div>
  );
};

export default Logo; 