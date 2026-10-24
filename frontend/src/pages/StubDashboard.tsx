import { useAuth } from '../contexts/AuthContext';
import { LogOut, Activity } from 'lucide-react';
const stub = (role: string) => () => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-[#0E1415] text-[#F5FAFA] flex flex-col">
      <nav className="bg-[#0B1112] border-b border-[#2A3A3A] px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-[#2DD4BF] rounded-sm flex items-center justify-center"><Activity className="text-black" size={16} /></div>
          <span className="font-bold text-[#2DD4BF]">Gymora</span>
          <span className="text-[#9AAEAE] text-sm ml-2">/ {role}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-[#9AAEAE]">{user?.firstName}</span>
          <button onClick={logout} className="text-[#9AAEAE] hover:text-[#2DD4BF]"><LogOut size={18} /></button>
        </div>
      </nav>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏗️</div>
          <h1 className="text-2xl font-bold text-[#F5FAFA] mb-2">{role} Dashboard</h1>
          <p className="text-[#9AAEAE]">This module is coming soon. Stay tuned!</p>
        </div>
      </div>
    </div>
  );
};
export default stub;
