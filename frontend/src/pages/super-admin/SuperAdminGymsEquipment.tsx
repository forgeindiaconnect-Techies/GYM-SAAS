import { Building2 } from 'lucide-react';

const SuperAdminGymsEquipment = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#E7DADD] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="text-[#B76E79]" size={32} />
            Gym Equipment Inventory
          </h1>
          <p className="text-[#57534E] mt-2 font-mono text-sm">Global view of hardware and machines deployed at gyms.</p>
        </div>
      </div>
      
      
      <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl overflow-hidden">
        <table className="w-full text-left font-mono text-sm">
          <tbody className="divide-y divide-[#E7DADD]">
            {['Treadmill Series X', 'Squat Rack Pro', 'Dumbbell Set (5-100)', 'Cable Crossover'].map((item, i) => (
              <tr key={i} className="hover:bg-[#FFFFFF]">
                <td className="p-4 font-bold text-[#292524]">{item}</td>
                <td className="p-4 text-[#57534E]">Qty: {2 + i * 2}</td>
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
