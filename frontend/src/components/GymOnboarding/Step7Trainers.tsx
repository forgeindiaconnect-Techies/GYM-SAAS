import { useState } from 'react';
import { Users, Plus, X, User } from 'lucide-react';

export const Step7Trainers = ({ data, updateData }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', specialization: '', experience: '', employmentType: 'Full Time'
  });

  const handleAdd = () => {
    if (!form.name || !form.email || !form.specialization || !form.phone) {
      alert("Name, Phone, Email, and Specialization are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      alert("Invalid email format.");
      return;
    }
    if (!/^\d{10}$/.test(form.phone)) {
      alert("Phone must be exactly 10 digits.");
      return;
    }
    updateData({ trainers: [...data.trainers, { ...form, id: Date.now().toString() }] });
    setForm({ name: '', email: '', phone: '', specialization: '', experience: '', employmentType: 'Full Time' });
    setIsAdding(false);
  };

  const removeTrainer = (id: string) => {
    updateData({ trainers: data.trainers.filter((t: any) => t.id !== id) });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#D3DFDA]">
        <div className="flex items-center space-x-3">
          <Users className="text-[#164A4A]" size={24} />
          <h2 className="text-xl font-bold">Trainer Setup</h2>
        </div>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-[#164A4A] text-white rounded-xl font-bold flex items-center space-x-2 text-sm">
            <Plus size={16} /><span>Add Trainer</span>
          </button>
        )}
      </div>

      {data.trainers.length === 0 && !isAdding && (
        <div className="text-center py-12 border-2 border-dashed border-[#D3DFDA] rounded-2xl">
          <Users className="text-[#455250] mx-auto mb-3" size={40} />
          <p className="text-[#455250]">No trainers added yet.</p>
          <button onClick={() => setIsAdding(true)} className="mt-4 text-[#164A4A] font-semibold hover:underline">Add your first trainer</button>
        </div>
      )}

      {data.trainers.length > 0 && !isAdding && (
        <div className="grid md:grid-cols-2 gap-4">
          {data.trainers.map((t: any) => (
            <div key={t.id} className="bg-[#FFFFFF] p-4 rounded-xl border border-[#D3DFDA] flex justify-between items-start">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-[#E8E5DA] rounded-full flex items-center justify-center text-[#455250]">
                  <User size={20} />
                </div>
                <div>
                  <h4 className="text-[#202828] font-bold">{t.name}</h4>
                  <p className="text-sm text-[#164A4A] font-medium">{t.specialization}</p>
                  <p className="text-xs text-[#455250] mt-1">{t.email} • {t.experience} Years Exp.</p>
                </div>
              </div>
              <button onClick={() => removeTrainer(t.id)} className="text-[#455250] hover:text-[#6fa3a0] transition-colors">
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {isAdding && (
        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D3DFDA]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Add New Trainer</h3>
            <button onClick={() => setIsAdding(false)} className="text-[#455250] hover:text-[#202828]"><X size={20} /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#455250] mb-1">Full Name *</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl px-3 py-2 text-sm text-[#202828] focus:border-[#164A4A] outline-none" />
            </div>
            <div>
              <label className="block text-xs text-[#455250] mb-1">Email *</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl px-3 py-2 text-sm text-[#202828] focus:border-[#164A4A] outline-none" />
            </div>
            <div>
              <label className="block text-xs text-[#455250] mb-1">Phone *</label>
              <input type="text" maxLength={10} value={form.phone} onChange={e => setForm({...form, phone: e.target.value.replace(/\D/g, '')})} className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl px-3 py-2 text-sm text-[#202828] focus:border-[#164A4A] outline-none" placeholder="10 digit number" />
            </div>
            <div>
              <label className="block text-xs text-[#455250] mb-1">Specialization *</label>
              <input type="text" value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl px-3 py-2 text-sm text-[#202828] focus:border-[#164A4A] outline-none" placeholder="e.g. Yoga, Weightlifting" />
            </div>
            <div>
              <label className="block text-xs text-[#455250] mb-1">Experience (Years)</label>
              <input type="number" value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl px-3 py-2 text-sm text-[#202828] focus:border-[#164A4A] outline-none" />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-[#455250] hover:text-[#164A4A] text-sm">Cancel</button>
            <button onClick={handleAdd} className="px-6 py-2 bg-[#164A4A] text-white rounded-xl font-bold text-sm">Save Trainer</button>
          </div>
        </div>
      )}
    </div>
  );
};
