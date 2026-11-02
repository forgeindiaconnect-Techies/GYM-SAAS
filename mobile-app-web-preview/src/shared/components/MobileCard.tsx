import React from 'react';

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  title?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  headerAction?: React.ReactNode;
}

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  className = '',
  onClick,
  title,
  subtitle,
  badge,
  headerAction,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs transition-all ${
        onClick ? 'active:scale-98 cursor-pointer hover:border-slate-300' : ''
      } ${className}`}
    >
      {(title || headerAction || badge) && (
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {title && (
                <h3 className="font-extrabold text-sm text-slate-900 tracking-tight truncate">
                  {title}
                </h3>
              )}
              {badge}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default MobileCard;

