import React from 'react';

interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const MobileInput: React.FC<MobileInputProps> = ({
  label,
  error,
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-extrabold text-slate-700 mb-1.5 tracking-tight">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          className={`w-full bg-slate-50 border rounded-2xl py-3 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 font-medium transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 min-h-[44px] ${
            icon ? 'pl-10' : ''
          } ${error ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-[11px] font-semibold text-rose-500 mt-1">{error}</p>}
    </div>
  );
};

export default MobileInput;

