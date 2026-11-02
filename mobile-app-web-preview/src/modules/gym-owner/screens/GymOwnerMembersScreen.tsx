import React, { useState } from 'react';
import { Search, Plus, Filter, Phone, Mail, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { MobileCard } from '../../../shared/components/MobileCard';
import { MobileButton } from '../../../shared/components/MobileButton';
import { MobileInput } from '../../../shared/components/MobileInput';
import { MobileModal } from '../../../shared/components/MobileModal';

interface MemberItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Expiring' | 'Expired';
}

export const GymOwnerMembersScreen: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'Active' | 'Expiring' | 'Expired'>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', phone: '', email: '', plan: 'Gold Annual' });

  const [members, setMembers] = useState<MemberItem[]>([
    { id: '1', name: 'Naveen Kumar', email: 'naveen@example.com', phone: '+91 98765 43210', plan: 'Gold Annual', startDate: '2026-01-15', endDate: '2027-01-14', status: 'Active' },
    { id: '2', name: 'Priya Sharma', email: 'priya@example.com', phone: '+91 98451 11223', plan: 'Silver Quarterly', startDate: '2026-08-01', endDate: '2026-11-01', status: 'Expiring' },
    { id: '3', name: 'Rahul Varma', email: 'rahul@example.com', phone: '+91 99001 23456', plan: 'Platinum VIP', startDate: '2026-03-10', endDate: '2027-03-09', status: 'Active' },
    { id: '4', name: 'Sneha Patel', email: 'sneha@example.com', phone: '+91 98888 77766', plan: 'Monthly Pass', startDate: '2026-10-01', endDate: '2026-10-31', status: 'Expired' },
    { id: '5', name: 'Vikram Singh', email: 'vikram@example.com', phone: '+91 97777 55544', plan: 'Gold Annual', startDate: '2026-04-12', endDate: '2027-04-11', status: 'Active' }
  ]);

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search);
    const matchesFilter = filter === 'all' || m.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.phone) return;
    const added: MemberItem = {
      id: Date.now().toString(),
      name: newMember.name,
      phone: newMember.phone,
      email: newMember.email || `${newMember.name.toLowerCase().replace(/\s+/g, '')}@gymora.com`,
      plan: newMember.plan,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2027-11-02',
      status: 'Active'
    };
    setMembers([added, ...members]);
    setIsAddOpen(false);
    setNewMember({ name: '', phone: '', email: '', plan: 'Gold Annual' });
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Top Controls */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <MobileInput 
            placeholder="Search member by name or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="h-11 px-3.5 bg-orange-600 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-orange-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl">
        {(['all', 'Active', 'Expiring', 'Expired'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
              filter === tab 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Members List */}
      <div className="space-y-2.5">
        {filteredMembers.map(m => (
          <MobileCard key={m.id} className="p-3.5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                  {m.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{m.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/50">
                      {m.plan}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Ends: {m.endDate}
                    </span>
                  </div>
                </div>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                m.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' :
                m.status === 'Expiring' ? 'bg-amber-50 text-amber-700 border border-amber-200/60' :
                'bg-rose-50 text-rose-700 border border-rose-200/60'
              }`}>
                {m.status}
              </span>
            </div>

            {/* Quick Contact Bar */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <a href={`tel:${m.phone}`} className="flex items-center gap-1.5 hover:text-orange-600 transition-colors">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-medium">{m.phone}</span>
              </a>
              <a href={`mailto:${m.email}`} className="flex items-center gap-1.5 hover:text-orange-600 transition-colors">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-medium">Email</span>
              </a>
            </div>
          </MobileCard>
        ))}

        {filteredMembers.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs font-semibold text-slate-500">No members match your criteria</p>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      <MobileModal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        title="Add New Gym Member"
      >
        <form onSubmit={handleAddMember} className="space-y-3.5">
          <MobileInput 
            label="Full Name"
            placeholder="e.g. Ramesh Patel"
            value={newMember.name}
            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
            required
          />
          <MobileInput 
            label="Mobile Number"
            placeholder="e.g. +91 98765 43210"
            value={newMember.phone}
            onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
            required
          />
          <MobileInput 
            label="Email Address"
            type="email"
            placeholder="ramesh@gmail.com"
            value={newMember.email}
            onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Membership Plan</label>
            <select 
              value={newMember.plan}
              onChange={(e) => setNewMember({ ...newMember, plan: e.target.value })}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-orange-500"
            >
              <option value="Gold Annual">Gold Annual (₹18,000/yr)</option>
              <option value="Platinum VIP">Platinum VIP (₹24,000/yr)</option>
              <option value="Silver Quarterly">Silver Quarterly (₹6,500/3mo)</option>
              <option value="Monthly Pass">Monthly Pass (₹2,500/mo)</option>
            </select>
          </div>
          <div className="pt-2 flex gap-2">
            <MobileButton variant="secondary" onClick={() => setIsAddOpen(false)} type="button">
              Cancel
            </MobileButton>
            <MobileButton variant="primary" type="submit">
              Register Member
            </MobileButton>
          </div>
        </form>
      </MobileModal>
    </div>
  );
};
export default GymOwnerMembersScreen;

