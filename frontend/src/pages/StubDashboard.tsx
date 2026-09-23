import { useAuth } from '../contexts/AuthContext';
import { LogOut, Activity } from 'lucide-react';
const stub = (role: string) => () => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-[#F5F3EE] text-[#202522] flex flex-col">
      <nav className="bg-[#FFFFFF] border-b border-[#DCD9CD] px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-[#34483F] rounded-sm flex items-center justify-center"><Activity className="text-black" size={16} /></div>
          <span className="font-bold text-[#34483F]">AI GYM</span>
          <span className="text-[#555] text-sm ml-2">/ {role}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-[#4A514D]">{user?.firstName}</span>
          <button onClick={logout} className="text-[#4A514D] hover:text-[#34483F]"><LogOut size={18} /></button>
        </div>
      </nav>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏗️</div>
          <h1 className="text-2xl font-bold text-[#202522] mb-2">{role} Dashboard</h1>
          <p className="text-[#4A514D]">This module is coming soon. Stay tuned!</p>
        </div>
      </div>
    </div>
  );
};
export default stub;
