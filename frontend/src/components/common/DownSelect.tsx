import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  label: string;
  value: string;
}

interface DownSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export const DownSelect: React.FC<DownSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  className = ''
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-[#0B0B12] border border-[#292940] rounded-xl px-4 py-2 text-sm text-[#11111F] font-semibold focus:border-[#6366F1] outline-none flex items-center justify-between gap-3 shadow-xs hover:bg-white transition-colors cursor-pointer"
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown size={16} className={`text-[#A1A1AA] shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-[#6366F1]' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 w-full min-w-[180px] bg-white border border-[#292940] rounded-2xl shadow-xl z-[150] max-h-64 overflow-y-auto py-1.5 animate-in fade-in slide-in-from-top-2 duration-150 custom-scrollbar">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected ? 'bg-[#0B0B12] text-[#6366F1] font-bold' : 'text-[#11111F] hover:bg-[#0B0B12]'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check size={16} className="text-[#6366F1] shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DownSelect;
