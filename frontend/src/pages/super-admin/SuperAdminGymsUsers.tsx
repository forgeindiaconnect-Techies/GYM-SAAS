import { Building2 } from 'lucide-react';

const SuperAdminGymsUsers = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#CCFBF1] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="text-[#0D9488]" size={32} />
            Gym Users
          </h1>
          <p className="text-[#475569] mt-2 font-mono text-sm">Directory of users mapped to specific gyms.</p>
        </div>
      </div>
      
      
      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6">
        <p className="text-[#475569] mb-4 text-sm font-mono">Showing users for: All Active Gyms</p>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3 bg-[#FFFFFF] border border-[#CCFBF1] rounded-lg flex justify-between">
              <span className="text-[#1E293B]">Member #{8200 + i}</span>
              <span className="text-[#475569] text-sm">Iron Paradise 1</span>
            </div>
          ))}
        </div>
      </div>
    
    </div>
  );
};

export default SuperAdminGymsUsers;
