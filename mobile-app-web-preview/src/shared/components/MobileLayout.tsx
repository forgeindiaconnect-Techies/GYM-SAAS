import React from 'react';
import MobileBottomNav from './MobileBottomNav';
import { useMobileAuth, UserRole } from '../auth/AuthContext';
import { Smartphone, RefreshCw, LogOut, ArrowUpRight } from 'lucide-react';

interface MobileLayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children, hideNav = false }) => {
  const { activeRole, setRoleOverride, logout, user } = useMobileAuth();

  return (
    <div className="min-h-screen bg-slate-200/80 flex flex-col items-center justify-start sm:py-4">
      {/* Dev / Tester Quick Role Switcher Bar */}
      <div className="w-full max-w-md bg-slate-900 text-white px-3 py-1.5 flex items-center justify-between text-xs select-none shadow-md z-50">
        <div className="flex items-center gap-1.5">
          <Smartphone size={13} className="text-orange-400" />
          <span className="font-bold tracking-tight text-[11px]">Gymora Mobile</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setRoleOverride('GYM_OWNER')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              activeRole === 'GYM_OWNER' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Owner
          </button>
          <button
            type="button"
            onClick={() => setRoleOverride('TRAINER')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              activeRole === 'TRAINER' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Trainer
          </button>
          <button
            type="button"
            onClick={() => setRoleOverride('CUSTOMER')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              activeRole === 'CUSTOMER' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Customer
          </button>
          {user && (
            <button
              type="button"
              onClick={logout}
              title="Logout"
              aria-label="Logout"
              className="ml-1 p-1 text-slate-400 hover:text-rose-400 transition-colors"
            >
              <LogOut size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Device Frame Container */}
      <div className="w-full max-w-md bg-white min-h-[calc(100vh-2rem)] sm:rounded-[36px] sm:shadow-2xl sm:border-[8px] sm:border-slate-800 overflow-hidden relative flex flex-col">
        {/* iOS Dynamic Island / Android Notch Simulation */}
        <div className="w-full bg-slate-900 text-white px-6 pt-2 pb-1 flex items-center justify-between text-[11px] font-semibold shrink-0 select-none">
          <span>9:41</span>
          <div className="w-20 h-4 bg-black rounded-full" />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]">5G</span>
            <div className="w-4 h-2 border border-white rounded-xs p-0.5 flex items-center">
              <div className="w-full h-full bg-white rounded-xs" />
            </div>
          </div>
        </div>

        {/* Scrollable Screen Content */}
        <main className={`flex-1 overflow-y-auto bg-slate-50 ${hideNav ? 'pb-6' : 'pb-24'}`}>
          {children}
        </main>

        {/* Fixed Role-based Bottom Tab Navigation */}
        {!hideNav && <MobileBottomNav />}
      </div>
    </div>
  );
};

export default MobileLayout;

