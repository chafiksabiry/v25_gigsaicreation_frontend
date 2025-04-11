import React from 'react';
import { Check } from 'lucide-react';

interface SelectionListProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  multiple?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'grid' | 'flow';
}

export function SelectionList({
  options,
  selected,
  onChange,
  multiple = true,
  className = '',
  size = 'md',
  layout = 'grid'
}: SelectionListProps) {
  const handleSelect = (option: string) => {
    if (multiple) {
      const newSelected = selected.includes(option)
        ? selected.filter(item => item !== option)
        : [...selected, option];
      onChange(newSelected);
    } else {
      onChange([option]);
    }
  };

  const sizeClasses = {
    sm: 'p-1.5 text-sm',
    md: 'p-2 text-sm',
    lg: 'p-3 text-base'
  };

  const layoutClasses = {
    grid: 'grid grid-cols-2 gap-2',
    flow: 'flex flex-wrap gap-2'
  };

  return (
    <div className={`${layoutClasses[layout]} ${className}`}>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => handleSelect(option)}
          className={`flex items-center gap-2 rounded-lg transition-colors ${sizeClasses[size]} ${
            selected.includes(option)
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          <div className={`w-4 h-4 rounded flex items-center justify-center ${
            selected.includes(option) ? 'bg-blue-600' : 'border border-gray-300'
          }`}>
            {selected.includes(option) && <Check className="w-3 h-3 text-white" />}
          </div>
          <span className="truncate">{option}</span>
        </button>
      ))}
    </div>
  );
}