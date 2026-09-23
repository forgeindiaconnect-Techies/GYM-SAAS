import { useState } from 'react';
import { UserCheck, Plus, X } from 'lucide-react';

export const Step9Members = ({ data, updateData }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', planId: '', joiningDate: ''
  });

  const handleAdd = () => {
    if (!form.name || !form.phone || !form.planId || !form.joiningDate) {
      alert("Name, Phone, Plan, and Joining Date are required.");
      return;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      alert("Invalid email format.");
      return;
    }
    if (!/^\d{10}$/.test(form.phone)) {
      alert("Phone must be exactly 10 digits.");
      return;
    }
    const selectedPlan = data.plans.find((p: any) => p.id === form.planId);
    
    updateData({ 
      members: [...data.members, { 
        ...form, 
        id: Date.now().toString(),
        planName: selectedPlan?.planName || 'Unknown Plan'
      }] 
    });
    setForm({ name: '', email: '', phone: '', planId: '', joiningDate: '' });
    setIsAdding(false);
  };

  const removeMember = (id: string) => {
    updateData({ members: data.members.filter((m: any) => m.id !== id) });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#DCD9CD]">
        <div className="flex items-center space-x-3">
          <UserCheck className="text-[#34483F]" size={24} />
          <h2 className="text-xl font-bold">Initial Members Setup</h2>
        </div>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-[#34483F] text-white rounded-xl font-bold flex items-center space-x-2 text-sm">
            <Plus size={16} /><span>Add Member</span>
          </button>
        )}
      </div>

      {data.members.length === 0 && !isAdding && (
        <div className="text-center py-12 border-2 border-dashed border-[#DCD9CD] rounded-2xl">
          <UserCheck className="text-[#4A514D] mx-auto mb-3" size={40} />
          <p className="text-[#4A514D]">No initial members added.</p>
          <button onClick={() => setIsAdding(true)} className="mt-4 text-[#34483F] font-semibold hover:underline">Add a member (Optional)</button>
        </div>
      )}

      {data.members.length > 0 && !isAdding && (
        <div className="grid md:grid-cols-2 gap-4">
          {data.members.map((m: any) => (
            <div key={m.id} className="bg-[#FFFFFF] p-4 rounded-xl border border-[#DCD9CD] flex justify-between items-start">
              <div>
                <h4 className="text-[#202522] font-bold">{m.name}</h4>
                <p className="text-sm text-[#34483F] font-medium">{m.planName}</p>
                <p className="text-xs text-[#4A514D] mt-1">{m.phone} • Joined: {m.joiningDate}</p>
              </div>
              <button onClick={() => removeMember(m.id)} className="text-[#4A514D] hover:text-[#8FA89B] transition-colors">
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {isAdding && (
        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DCD9CD]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Add New Member</h3>
            <button onClick={() => setIsAdding(false)} className="text-[#4A514D] hover:text-[#202522]"><X size={20} /></button>
          </div>
          
          {data.plans.length === 0 ? (
            <div className="p-4 bg-[#8FA89B]/10 text-[#8FA89B] rounded-xl text-sm">
              Please create at least one Subscription Plan (Step 8) before adding members.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#4A514D] mb-1">Full Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-3 py-2 text-sm text-[#202522] focus:border-[#34483F] outline-none" />
              </div>
              <div>
                <label className="block text-xs text-[#4A514D] mb-1">Email (Optional)</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-3 py-2 text-sm text-[#202522] focus:border-[#34483F] outline-none" />
              </div>
              <div>
                <label className="block text-xs text-[#4A514D] mb-1">Phone *</label>
                <input type="text" maxLength={10} value={form.phone} onChange={e => setForm({...form, phone: e.target.value.replace(/\D/g, '')})} className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-3 py-2 text-sm text-[#202522] focus:border-[#34483F] outline-none" placeholder="10 digit number" />
              </div>
              <div>
                <label className="block text-xs text-[#4A514D] mb-1">Select Plan *</label>
                <select value={form.planId} onChange={e => setForm({...form, planId: e.target.value})} className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-3 py-2 text-sm text-[#202522] focus:border-[#34483F] outline-none appearance-none">
                  <option value="">Choose a plan</option>
                  {data.plans.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.planName} (₹{p.finalPrice})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#4A514D] mb-1">Joining Date *</label>
                <input type="date" value={form.joiningDate} onChange={e => setForm({...form, joiningDate: e.target.value})} className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-3 py-2 text-sm text-[#202522] focus:border-[#34483F] outline-none [color-scheme:dark]" />
              </div>
            </div>
          )}
          
          <div className="mt-6 flex justify-end space-x-3">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-[#4A514D] hover:text-[#34483F] text-sm">Cancel</button>
            <button onClick={handleAdd} disabled={data.plans.length === 0} className="px-6 py-2 bg-[#34483F] text-white rounded-xl font-bold text-sm disabled:opacity-50">Save Member</button>
          </div>
        </div>
      )}
    </div>
  );
};
