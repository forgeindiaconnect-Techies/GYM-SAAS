import React from 'react';
import { Loader2 } from 'lucide-react';

interface MobileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const MobileButton: React.FC<MobileButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = true,
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-200 select-none active:scale-97 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const sizeStyles = {
    sm: 'py-2 px-3.5 text-xs',
    md: 'py-3 px-4 text-sm min-h-[44px]',
    lg: 'py-3.5 px-6 text-base min-h-[50px]',
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-md shadow-orange-600/20 hover:brightness-105',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800',
    outline: 'bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? 'w-full' : 'w-auto'} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 size={18} className="animate-spin text-current" />
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

export default MobileButton;

