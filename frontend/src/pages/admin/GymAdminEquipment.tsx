import { useState, useEffect } from 'react';
import { Search, Plus, Filter, Wrench, CheckCircle2, AlertTriangle, SearchCode } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const mockEquipment = [
  { id: 'EQ001', name: 'Treadmill Series X', category: 'Cardio', status: 'Active', nextService: '2026-01-15', brand: 'LifeFitness' },
  { id: 'EQ002', name: 'Elliptical Trainer', category: 'Cardio', status: 'Maintenance', nextService: '2025-09-10', brand: 'Precor' },
  { id: 'EQ003', name: 'Leg Press Machine', category: 'Strength', status: 'Active', nextService: '2025-11-20', brand: 'Hammer Strength' },
  { id: 'EQ004', name: 'Cable Crossover', category: 'Strength', status: 'Out of Order', nextService: '2025-09-01', brand: 'Matrix' },
  { id: 'EQ005', name: 'Rowing Machine', category: 'Cardio', status: 'Active', nextService: '2025-12-05', brand: 'Concept2' },
  { id: 'EQ006', name: 'Smith Machine', category: 'Strength', status: 'Active', nextService: '2026-02-10', brand: 'Rogue' },
];

const GymAdminEquipment = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [gym, setGym] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.gymId) {
      api.get(`/gyms/${user.gymId}`)
        .then(res => {
          setGym(res.data.gym);
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [user]);

  const equipmentToDisplay = gym?.equipment?.length > 0 ? gym.equipment : mockEquipment;

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Maintenance': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Out of Order': return 'bg-[#0D9488]/10 text-[#0D9488] border-[#0D9488]/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Active': return <CheckCircle2 size={14} className="mr-1.5" />;
      case 'Maintenance': return <Wrench size={14} className="mr-1.5" />;
      case 'Out of Order': return <AlertTriangle size={14} className="mr-1.5" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Equipment</h1>
          <p className="text-[#475569] mt-1">Manage inventory and track maintenance schedules.</p>
        </div>
        <button className="px-4 py-2 bg-[#16A34A] text-[#1E293B] font-bold rounded-xl hover:bg-[#15803D] transition-colors flex items-center gap-2 shadow-lg shadow-[#16A34A]/20 self-start md:self-auto">
          <Plus size={20} /> Add Equipment
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Search equipment by name or ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl pl-10 pr-4 py-3 text-[#1E293B] outline-none focus:border-[#16A34A]"
          />
          <Search className="absolute left-3 top-3.5 text-[#475569]" size={18} />
        </div>
        <button className="px-4 py-3 bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-xl hover:bg-[#FFFFFF] transition-colors flex items-center gap-2 font-medium">
          <Filter size={18} /> Filter by Status
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-1 md:col-span-2 xl:col-span-3 text-center py-10 text-[#475569]">Loading equipment...</div>
        ) : equipmentToDisplay
          .filter((eq: any) => eq.name?.toLowerCase().includes(search.toLowerCase()))
          .map((eq: any, idx: number) => {
            const status = eq.status || (eq.condition === 'Poor' ? 'Maintenance' : 'Active');
            return (
          <div key={eq._id || eq.id || idx} className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6 hover:border-[#16A34A]/30 transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-bold text-[#475569] bg-[#FFFFFF] px-2 py-1 rounded-md">{eq.id || `EQ00${idx+1}`}</span>
                  <span className="text-xs font-semibold text-[#16A34A] uppercase tracking-wider">{eq.category || 'General'}</span>
                </div>
                <h3 className="text-lg font-bold text-[#1E293B]">{eq.name}</h3>
                <p className="text-sm text-[#475569] mt-0.5">{eq.brand || `Quantity: ${eq.quantity || 1}`}</p>
              </div>
              <button className="text-[#475569] hover:text-[#16A34A] transition-colors">
                <SearchCode size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-t border-[#CCFBF1]">
                <span className="text-sm text-[#475569]">Current Status</span>
                <span className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-lg border ${getStatusColor(status)}`}>
                  {getStatusIcon(status)}
                  {status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#475569]">Next Service</span>
                <span className="text-sm font-semibold text-[#1E293B] bg-[#FFFFFF] px-3 py-1 rounded-lg">
                  {eq.nextService || 'N/A'}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#CCFBF1] flex gap-3">
              <button className="flex-1 py-2 bg-[#FFFFFF] hover:bg-[#E2E8F0] text-[#1E293B] text-sm font-bold rounded-xl transition-colors">
                Log Service
              </button>
              <button className="flex-1 py-2 bg-[#FFFFFF] hover:bg-[#E2E8F0] text-[#16A34A] text-sm font-bold rounded-xl transition-colors">
                Report Issue
              </button>
            </div>
          </div>
          )
        })}
      </div>
    </div>
  );
};

export default GymAdminEquipment;
