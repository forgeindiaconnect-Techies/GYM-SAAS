import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, MoreVertical, ShieldCheck, Mail, Phone, X, Eye } from 'lucide-react';

const mockMembers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', phone: '123-456-7890', plan: 'Pro', status: 'Active', joined: '2025-10-15' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '987-654-3210', plan: 'Elite', status: 'Active', joined: '2025-11-02' },
  { id: '3', name: 'Mike Johnson', email: 'mike@example.com', phone: '555-123-4567', plan: 'Basic', status: 'Inactive', joined: '2025-08-20' },
  { id: '4', name: 'Emily Davis', email: 'emily@example.com', phone: '444-987-1234', plan: 'Pro', status: 'Active', joined: '2025-12-01' },
];

const GymAdminMembers = () => {
  const [search, setSearch] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const navigate = useNavigate();

  const handleAddMember = () => {
    // Simulating reaching the free trial limit of 10 members
    const currentMembers = 10;
    const planLimit = 10;
    
    if (currentMembers >= planLimit) {
      setShowUpgradeModal(true);
    } else {
      // Normal add member logic would go here
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Members</h1>
          <p className="text-[#475569] mt-1">Manage your gym members, subscriptions, and profiles.</p>
        </div>
        <button 
          onClick={handleAddMember}
          className="px-4 py-2 bg-[#16A34A] text-[#1E293B] font-bold rounded-xl hover:bg-[#15803D] transition-colors flex items-center gap-2 shadow-lg shadow-[#16A34A]/20 self-start md:self-auto"
        >
          <Plus size={20} /> Add Member
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Search members by name, email or phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl pl-10 pr-4 py-3 text-[#1E293B] outline-none focus:border-[#16A34A]"
          />
          <Search className="absolute left-3 top-3.5 text-[#475569]" size={18} />
        </div>
        <button className="px-4 py-3 bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-xl hover:bg-[#FFFFFF] transition-colors flex items-center gap-2 font-medium">
          <Filter size={18} /> Filters
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-[#475569] whitespace-nowrap">
            <thead className="bg-[#FFFFFF] border-b border-[#CCFBF1] text-[#1E293B]">
              <tr>
                <th className="px-6 py-4 font-semibold">Member</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Plan</th>
                <th className="px-6 py-4 font-semibold">Joined Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CCFBF1]">
              {mockMembers.map((member) => (
                <tr key={member.id} className="hover:bg-[#F0FDFA] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[#FFFFFF] border border-[#CCFBF1] flex items-center justify-center text-[#1E293B] font-bold">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[#1E293B] font-semibold">{member.name}</p>
                        <p className="text-xs text-[#475569]">ID: #{member.id.padStart(4, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="flex items-center text-xs"><Mail size={12} className="mr-1.5"/> {member.email}</p>
                      <p className="flex items-center text-xs"><Phone size={12} className="mr-1.5"/> {member.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-md text-xs font-semibold flex items-center w-max">
                      <ShieldCheck size={12} className="mr-1 text-[#16A34A]" /> {member.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">{member.joined}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${member.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-[#0D9488]/10 text-[#0D9488]'}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2 items-center">
                    <button onClick={() => setSelectedMember(member)} className="p-2 text-[#475569] hover:text-[#16A34A] hover:bg-[#FFFFFF] rounded-lg transition-colors" title="View Member">
                      <Eye size={18} />
                    </button>
                    <button className="p-2 text-[#475569] hover:text-[#1E293B] hover:bg-[#FFFFFF] rounded-lg transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="px-6 py-4 border-t border-[#CCFBF1] flex items-center justify-between text-sm text-[#475569]">
          <span>Showing 1 to 4 of 4 entries</span>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-[#FFFFFF] border border-[#CCFBF1] rounded-md hover:text-[#16A34A] transition-colors disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 bg-[#FFFFFF] border border-[#CCFBF1] rounded-md hover:text-[#16A34A] transition-colors disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
      {/* Upgrade Prompt Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl max-w-md w-full p-8 text-center shadow-2xl relative">
            <button 
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-[#475569] hover:text-[#16A34A] transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="w-16 h-16 bg-[#0D9488]/10 border border-[#0D9488]/20 text-[#0D9488] rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={32} />
            </div>
            
            <h2 className="text-2xl font-bold text-[#1E293B] mb-3">Member Limit Reached</h2>
            <p className="text-[#475569] mb-8 leading-relaxed">
              Your current <span className="text-[#16A34A] font-semibold">Free Trial</span> allows up to 10 members. You must upgrade your subscription to add unlimited members and unlock premium features.
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/admin/subscription')} 
                className="w-full py-3.5 bg-[#16A34A] text-[#1E293B] font-bold rounded-xl hover:bg-[#15803D] transition-colors shadow-lg shadow-[#16A34A]/20"
              >
                View Upgrade Plans
              </button>
              <button 
                onClick={() => setShowUpgradeModal(false)} 
                className="w-full py-3.5 bg-[#FFFFFF] text-[#1E293B] font-medium rounded-xl border border-[#CCFBF1] hover:bg-[#E2E8F0] transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member View Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-[#CCFBF1]">
            <div className="p-6 border-b border-[#CCFBF1] flex justify-between items-center bg-gradient-to-r from-[#F0FDFA] to-[#FFFFFF]">
              <h2 className="text-xl font-bold text-[#1E293B]">Member Profile</h2>
              <button onClick={() => setSelectedMember(null)} className="text-[#475569] hover:text-[#1E293B] transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-[#16A34A]/10 text-[#16A34A] rounded-full flex items-center justify-center text-2xl font-bold">
                  {selectedMember.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1E293B]">{selectedMember.name}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${selectedMember.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-[#0D9488]/10 text-[#0D9488]'}`}>
                    {selectedMember.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#475569] mb-1">Email</p>
                  <p className="font-medium text-[#1E293B]">{selectedMember.email}</p>
                </div>
                <div>
                  <p className="text-[#475569] mb-1">Phone</p>
                  <p className="font-medium text-[#1E293B]">{selectedMember.phone}</p>
                </div>
                <div>
                  <p className="text-[#475569] mb-1">Membership Plan</p>
                  <p className="font-medium text-[#1E293B]">{selectedMember.plan}</p>
                </div>
                <div>
                  <p className="text-[#475569] mb-1">Join Date</p>
                  <p className="font-medium text-[#1E293B]">{selectedMember.joined}</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-[#F8FAFC] border-t border-[#CCFBF1] flex justify-end">
              <button onClick={() => setSelectedMember(null)} className="px-6 py-2 bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-xl font-bold hover:bg-[#F1F5F9] transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymAdminMembers;
