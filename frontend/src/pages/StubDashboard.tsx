import { useAuth } from '../contexts/AuthContext';
import { LogOut, Activity } from 'lucide-react';
const stub = (role: string) => () => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-[#0B0B12] text-[#11111F] flex flex-col">
      <nav className="bg-[#FFFFFF] border-b border-[#292940] px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-[#6366F1] rounded-sm flex items-center justify-center"><Activity className="text-black" size={16} /></div>
          <span className="font-bold text-[#6366F1]">Gymora</span>
          <span className="text-[#A1A1AA] text-sm ml-2">/ {role}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-[#A1A1AA]">{user?.firstName}</span>
          <button onClick={logout} className="text-[#A1A1AA] hover:text-[#6366F1]"><LogOut size={18} /></button>
        </div>
      </nav>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏗️</div>
          <h1 className="text-2xl font-bold text-[#11111F] mb-2">{role} Dashboard</h1>
          <p className="text-[#A1A1AA]">This module is coming soon. Stay tuned!</p>
        </div>
      </div>
    </div>
  );
};
export default stub;
