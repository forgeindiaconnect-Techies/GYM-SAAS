import { Building2 } from 'lucide-react';

const SuperAdminGymsUsers = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#D3DFDA] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="text-[#6fa3a0]" size={32} />
            Gym Users
          </h1>
          <p className="text-[#455250] mt-2 font-mono text-sm">Directory of users mapped to specific gyms.</p>
        </div>
      </div>
      
      
      <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6">
        <p className="text-[#455250] mb-4 text-sm font-mono">Showing users for: All Active Gyms</p>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3 bg-[#FFFFFF] border border-[#D3DFDA] rounded-lg flex justify-between">
              <span className="text-[#202828]">Member #{8200 + i}</span>
              <span className="text-[#455250] text-sm">Iron Paradise 1</span>
            </div>
          ))}
        </div>
      </div>
    
    </div>
  );
};

export default SuperAdminGymsUsers;
