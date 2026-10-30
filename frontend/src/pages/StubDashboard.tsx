import { useAuth } from '../contexts/AuthContext';
import { LogOut, Activity } from 'lucide-react';
const stub = (role: string) => () => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col">
      <nav className="bg-[#FFFFFF] border-b border-[#E2E8F0] px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-[#C2410C] rounded-sm flex items-center justify-center"><Activity className="text-black" size={16} /></div>
          <span className="font-bold text-[#EA580C]">Gymora</span>
          <span className="text-[#64748B] text-sm ml-2">/ {role}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-[#64748B]">{user?.firstName}</span>
          <button onClick={logout} className="text-[#64748B] hover:text-[#EA580C]"><LogOut size={18} /></button>
        </div>
      </nav>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏗️</div>
          <h1 className="text-2xl font-bold text-[#111827] mb-2">{role} Dashboard</h1>
          <p className="text-[#64748B]">This module is coming soon. Stay tuned!</p>
        </div>
      </div>
    </div>
  );
};
export default stub;
