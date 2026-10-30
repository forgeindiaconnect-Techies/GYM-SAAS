import { useAuth } from '../contexts/AuthContext';
import { LogOut, Activity } from 'lucide-react';
const stub = (role: string) => () => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-[#F3E8E8] text-[#292524] flex flex-col">
      <nav className="bg-[#FFFFFF] border-b border-[#E7DADD] px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-[#B76E79] rounded-sm flex items-center justify-center"><Activity className="text-black" size={16} /></div>
          <span className="font-bold text-[#B76E79]">Gymora</span>
          <span className="text-[#57534E] text-sm ml-2">/ {role}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-[#57534E]">{user?.firstName}</span>
          <button onClick={logout} className="text-[#57534E] hover:text-[#B76E79]"><LogOut size={18} /></button>
        </div>
      </nav>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏗️</div>
          <h1 className="text-2xl font-bold text-[#292524] mb-2">{role} Dashboard</h1>
          <p className="text-[#57534E]">This module is coming soon. Stay tuned!</p>
        </div>
      </div>
    </div>
  );
};
export default stub;
