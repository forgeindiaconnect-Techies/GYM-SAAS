import React, { useState } from 'react';
import { Search, Plus, Phone, Award, Flame, Target, ChevronRight, Activity } from 'lucide-react';
import { MobileCard } from '../../../shared/components/MobileCard';
import { MobileInput } from '../../../shared/components/MobileInput';

interface ClientItem {
  id: string;
  name: string;
  goal: string;
  sessionsLeft: number;
  adherence: number;
  phone: string;
  currentWeight: string;
  targetWeight: string;
}

export const TrainerClientsScreen: React.FC = () => {
  const [search, setSearch] = useState('');
  const [clients] = useState<ClientItem[]>([
    { id: '1', name: 'Naveen Kumar', goal: 'Hypertrophy & Strength', sessionsLeft: 12, adherence: 96, phone: '+91 98765 43210', currentWeight: '78 kg', targetWeight: '82 kg' },
    { id: '2', name: 'Priya Sharma', goal: 'Weight Loss & Tone', sessionsLeft: 8, adherence: 92, phone: '+91 98451 11223', currentWeight: '68 kg', targetWeight: '60 kg' },
    { id: '3', name: 'Rahul Varma', goal: 'Endurance & Core', sessionsLeft: 15, adherence: 88, phone: '+91 99001 23456', currentWeight: '74 kg', targetWeight: '72 kg' },
    { id: '4', name: 'Vikram Singh', goal: 'Shoulder Rehab & Mobility', sessionsLeft: 6, adherence: 100, phone: '+91 97777 55544', currentWeight: '85 kg', targetWeight: '80 kg' }
  ]);

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.goal.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4 pb-6">
      <MobileInput 
        placeholder="Search clients by name or goal..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        icon={<Search className="w-4 h-4 text-slate-400" />}
      />

      <div className="space-y-3">
        {filtered.map(c => (
          <MobileCard key={c.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-orange-100 text-orange-700 font-bold text-sm flex items-center justify-center border border-orange-200">
                  {c.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                  <p className="text-xs text-orange-600 font-semibold">{c.goal}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {c.adherence}% Attendance
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-center text-xs">
              <div className="p-2 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Sessions Left</span>
                <span className="font-bold text-slate-800 text-xs">{c.sessionsLeft}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Current Wt</span>
                <span className="font-bold text-slate-800 text-xs">{c.currentWeight}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Target Wt</span>
                <span className="font-bold text-emerald-600 text-xs">{c.targetWeight}</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 flex items-center justify-between text-xs">
              <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 text-slate-600 font-medium hover:text-orange-600">
                <Phone className="w-3.5 h-3.5" /> Call Client
              </a>
              <button 
                onClick={() => alert(`Opening diet and workout log for ${c.name}`)}
                className="text-orange-600 font-bold flex items-center gap-0.5 hover:underline"
              >
                View Progress <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </MobileCard>
        ))}
      </div>
    </div>
  );
};
export default TrainerClientsScreen;

