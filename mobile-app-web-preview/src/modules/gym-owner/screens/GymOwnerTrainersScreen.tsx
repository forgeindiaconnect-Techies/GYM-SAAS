import React, { useState } from 'react';
import { Award, Star, Users, Phone, Mail, ChevronRight, Plus, CheckCircle } from 'lucide-react';
import { MobileCard } from '../../../shared/components/MobileCard';
import { MobileButton } from '../../../shared/components/MobileButton';
import { MobileModal } from '../../../shared/components/MobileModal';
import { MobileInput } from '../../../shared/components/MobileInput';

interface TrainerItem {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  activeClients: number;
  phone: string;
  commission: string;
  status: 'Active' | 'On Leave';
}

export const GymOwnerTrainersScreen: React.FC = () => {
  const [trainers, setTrainers] = useState<TrainerItem[]>([
    { id: '1', name: 'Vikram Malhotra', specialty: 'Strength & Conditioning', rating: 4.9, activeClients: 18, phone: '+91 98111 22334', commission: '30%', status: 'Active' },
    { id: '2', name: 'Ananya Deshmukh', specialty: 'Yoga & Pilates', rating: 4.8, activeClients: 14, phone: '+91 98222 33445', commission: '30%', status: 'Active' },
    { id: '3', name: 'Karan Mehra', specialty: 'HIIT & Functional Training', rating: 4.7, activeClients: 22, phone: '+91 98333 44556', commission: '35%', status: 'Active' },
    { id: '4', name: 'Rohit Verma', specialty: 'Bodybuilding & Nutrition', rating: 4.9, activeClients: 16, phone: '+91 98444 55667', commission: '30%', status: 'On Leave' }
  ]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTrainer, setNewTrainer] = useState({ name: '', specialty: 'Strength & Conditioning', phone: '', commission: '30%' });

  const handleAddTrainer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrainer.name || !newTrainer.phone) return;
    const added: TrainerItem = {
      id: Date.now().toString(),
      name: newTrainer.name,
      specialty: newTrainer.specialty,
      rating: 5.0,
      activeClients: 0,
      phone: newTrainer.phone,
      commission: newTrainer.commission,
      status: 'Active'
    };
    setTrainers([...trainers, added]);
    setIsAddOpen(false);
    setNewTrainer({ name: '', specialty: 'Strength & Conditioning', phone: '', commission: '30%' });
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Overview Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Trainer Staff</p>
            <h2 className="text-xl font-bold">{trainers.length} Certified Trainers</h2>
          </div>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="h-10 px-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all shadow-md shadow-orange-600/30"
          >
            <Plus className="w-4 h-4" /> Add Trainer
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400">Total Active Clients:</span>
            <span className="ml-1.5 font-bold text-white">
              {trainers.reduce((acc, t) => acc + t.activeClients, 0)}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Average Rating:</span>
            <span className="ml-1.5 font-bold text-amber-400">★ 4.85 / 5.0</span>
          </div>
        </div>
      </div>

      {/* Trainers List */}
      <div className="space-y-3">
        {trainers.map(t => (
          <MobileCard key={t.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 font-bold text-base flex items-center justify-center border border-orange-200">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{t.name}</h3>
                  <p className="text-xs text-orange-600 font-medium">{t.specialty}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                    <span className="flex items-center gap-0.5 text-amber-600 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {t.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> {t.activeClients} Clients
                    </span>
                  </div>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                t.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {t.status}
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Commission: <strong className="text-slate-800">{t.commission}</strong></span>
              <a href={`tel:${t.phone}`} className="flex items-center gap-1 text-orange-600 font-semibold hover:underline">
                <Phone className="w-3.5 h-3.5" /> Call Trainer
              </a>
            </div>
          </MobileCard>
        ))}
      </div>

      {/* Add Trainer Modal */}
      <MobileModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Onboard New Trainer">
        <form onSubmit={handleAddTrainer} className="space-y-3.5">
          <MobileInput 
            label="Trainer Name"
            placeholder="e.g. Rahul Sharma"
            value={newTrainer.name}
            onChange={(e) => setNewTrainer({ ...newTrainer, name: e.target.value })}
            required
          />
          <MobileInput 
            label="Mobile Number"
            placeholder="+91 98000 11223"
            value={newTrainer.phone}
            onChange={(e) => setNewTrainer({ ...newTrainer, phone: e.target.value })}
            required
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Specialty Track</label>
            <select 
              value={newTrainer.specialty}
              onChange={(e) => setNewTrainer({ ...newTrainer, specialty: e.target.value })}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
            >
              <option value="Strength & Conditioning">Strength & Conditioning</option>
              <option value="Yoga & Pilates">Yoga & Pilates</option>
              <option value="HIIT & Crossfit">HIIT & Crossfit</option>
              <option value="Bodybuilding & Nutrition">Bodybuilding & Nutrition</option>
            </select>
          </div>
          <MobileInput 
            label="Commission Split"
            placeholder="e.g. 30%"
            value={newTrainer.commission}
            onChange={(e) => setNewTrainer({ ...newTrainer, commission: e.target.value })}
          />
          <div className="pt-2 flex gap-2">
            <MobileButton variant="secondary" onClick={() => setIsAddOpen(false)} type="button">Cancel</MobileButton>
            <MobileButton variant="primary" type="submit">Complete Onboarding</MobileButton>
          </div>
        </form>
      </MobileModal>
    </div>
  );
};
export default GymOwnerTrainersScreen;

