import React from 'react';
import { ArrowLeft, Bell, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMobileAuth } from '../auth/AuthContext';

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  showNotification?: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  showNotification = true,
}) => {
  const navigate = useNavigate();
  const { activeRole } = useMobileAuth();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const getRoleBadge = () => {
    switch (activeRole) {
      case 'GYM_OWNER':
        return { label: 'Gym Owner', bg: 'bg-orange-100 text-orange-800 border-orange-200' };
      case 'TRAINER':
        return { label: 'Trainer', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'CUSTOMER':
        return { label: 'Customer', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    }
  };

  const roleInfo = getRoleBadge();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 pt-3 pb-2.5 transition-all">
      <div className="flex items-center justify-between gap-3">
        {/* Left Section: Back button or Logo mark */}
        <div className="flex items-center gap-2.5 min-w-0">
          {showBack ? (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Back"
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center text-slate-700 transition-all shrink-0 -ml-1"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </button>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-sm shadow-orange-500/20 shrink-0">
              <Sparkles size={16} strokeWidth={2.5} />
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-slate-900 truncate">
                {title}
              </h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${roleInfo.bg}`}>
                {roleInfo.label}
              </span>
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 font-medium truncate -mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Action */}
        <div className="flex items-center gap-2 shrink-0">
          {rightAction ? (
            rightAction
          ) : showNotification ? (
            <button
              type="button"
              title="Notifications"
              aria-label="Notifications"
              className="relative w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center text-slate-700 transition-all"
            >
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-600 ring-2 ring-white" />
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;

