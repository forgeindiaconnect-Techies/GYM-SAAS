import { Building2 } from 'lucide-react';

const SuperAdminGymsEquipment = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#CCFBF1] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="text-[#0D9488]" size={32} />
            Gym Equipment Inventory
          </h1>
          <p className="text-[#475569] mt-2 font-mono text-sm">Global view of hardware and machines deployed at gyms.</p>
        </div>
      </div>
      
      
      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl overflow-hidden">
        <table className="w-full text-left font-mono text-sm">
          <tbody className="divide-y divide-[#CCFBF1]">
            {['Treadmill Series X', 'Squat Rack Pro', 'Dumbbell Set (5-100)', 'Cable Crossover'].map((item, i) => (
              <tr key={i} className="hover:bg-[#FFFFFF]">
                <td className="p-4 font-bold text-[#1E293B]">{item}</td>
                <td className="p-4 text-[#475569]">Qty: {2 + i * 2}</td>
                <td className="p-4 text-green-500">Operational</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    
    </div>
  );
};

export default SuperAdminGymsEquipment;
