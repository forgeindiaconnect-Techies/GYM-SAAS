import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MobileStatCardProps {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
  iconBg?: string;
  onClick?: () => void;
}

export const MobileStatCard: React.FC<MobileStatCardProps> = ({
  label,
  value,
  change,
  isPositive = true,
  icon,
  iconBg = 'bg-orange-50 text-orange-600',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 ${
        onClick ? 'active:scale-98 cursor-pointer hover:border-slate-300' : ''
      }`}
    >
      <div className="min-w-0">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">
          {label}
        </span>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-xl font-black text-slate-900 tracking-tight">
            {value}
          </span>
          {change && (
            <span
              className={`inline-flex items-center gap-0.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
              }`}
            >
              {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {change}
            </span>
          )}
        </div>
      </div>

      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
    </div>
  );
};

export default MobileStatCard;

