import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ShieldCheck, Mail, Phone, Eye, Edit2, User, Trash2, Calendar, Activity, CheckCircle, Clock, XCircle, UserPlus, Users, MoreVertical, Settings, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AddMemberSelectorModal } from '../../components/GymAdmin/AddMemberSelectorModal';
import { AddExistingMemberModal } from '../../components/GymAdmin/AddExistingMemberModal';
import { RegisterNewMemberModal } from '../../components/GymAdmin/RegisterNewMemberModal';
import api from '../../utils/api';

const defaultMockMembers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', phone: '123-456-7890', plan: 'Pro', status: 'Active', joined: '2025-10-15', customerType: 'EXISTING_CUSTOMER', trainer: 'Mike Johnson', gender: 'Male', dob: '1990-05-12', emergencyName: 'Jane Doe', emergencyPhone: '098-765-4321', emergencyRelation: 'Spouse', fitnessGoal: 'Muscle Gain' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '987-654-3210', plan: 'Elite', status: 'Active', joined: '2025-11-02', customerType: 'NEW_CUSTOMER', trainer: 'Sarah Williams', gender: 'Female', dob: '1985-08-22', emergencyName: 'Mark Smith', emergencyPhone: '555-444-3333', emergencyRelation: 'Brother', fitnessGoal: 'Weight Loss' },
  { id: '3', name: 'Mike Johnson', email: 'mike@example.com', phone: '555-123-4567', plan: 'Basic', status: 'Inactive', joined: '2025-08-20', customerType: 'EXISTING_CUSTOMER', trainer: '', gender: 'Male', dob: '1992-11-05', emergencyName: 'Sarah Johnson', emergencyPhone: '111-222-3333', emergencyRelation: 'Sister', fitnessGoal: 'General Fitness' },
  { id: '4', name: 'Emily Davis', email: 'emily@example.com', phone: '444-987-1234', plan: 'Pro', status: 'Pending', joined: '2025-12-01', customerType: 'NEW_CUSTOMER', trainer: 'Mike Johnson', gender: 'Female', dob: '1995-02-14', emergencyName: 'Tom Davis', emergencyPhone: '999-888-7777', emergencyRelation: 'Father', fitnessGoal: 'Endurance' },
];

const mockPlans = [
  { id: '1', name: 'Basic' },
  { id: '2', name: 'Pro' },
  { id: '3', name: 'Elite' }
];

const GymAdminMembers = () => {
  const [members, setMembers] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users?role=MEMBER');
      if (res.data.success) {
        const mapped = res.data.users.map((u: any) => ({
          id: u._id,
          name: `${u.firstName} ${u.lastName}`,
          email: u.email,
          phone: u.mobile,
          plan: u.subscriptionPlan || 'None',
          status: u.approvalStatus === 'PENDING' ? 'Pending' :
                  u.approvalStatus === 'APPROVED' ? 'Active' :
                  u.approvalStatus === 'REJECTED' ? 'Rejected' :
                  u.approvalStatus === 'SUSPENDED' ? 'Inactive' : 'Inactive',
          joined: new Date(u.createdAt).toISOString().split('T')[0],
          customerType: u.customerType,
          gender: u.gender,
          dob: u.dateOfBirth,
          fitnessGoal: u.fitnessGoal,
          emergencyName: u.emergencyContact?.name,
          emergencyPhone: u.emergencyContact?.mobile,
          emergencyRelation: u.emergencyContact?.relationship,
          originalUser: u, // Keep original data for reference if needed
        }));
        setMembers(mapped);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSelectorModal, setShowSelectorModal] = useState(false);
  const [showExistingModal, setShowExistingModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [editMember, setEditMember] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>(null);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  const getMemberLimit = (plan?: string) => {
    switch (plan?.toUpperCase()) {
      case 'FREE_TRIAL': return 10;
      case 'SILVER': return 100;
      case 'GOLD': return 500;
      case 'PREMIUM': return Infinity;
      default: return 10;
    }
  };

  const handleAddMemberClick = () => {
    const planLimit = getMemberLimit(user?.subscriptionPlan);
    if (members.length >= planLimit) {
      setShowUpgradeModal(true);
    } else {
      setShowSelectorModal(true);
    }
  };

  const handleAddExisting = (data: any) => {
    const newMember = {
      ...data,
      joined: data.startDate
    };
    const savedMember = addItem('members', newMember);
    setMembers([savedMember, ...members]);
    setShowExistingModal(false);
  };

  const handleDeleteMember = (id: string) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      deleteItem('members', id);
      setMembers(members.filter(m => m.id !== id));
      setActiveDropdown(null);
      if (selectedMember?.id === id) {
        setSelectedMember(null);
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    let apiStatus = 'PENDING';
    if (newStatus === 'Active') apiStatus = 'APPROVED';
    else if (newStatus === 'Inactive') apiStatus = 'SUSPENDED';
    else if (newStatus === 'Rejected') apiStatus = 'REJECTED';

    try {
      const res = await api.put(`/users/${id}/status`, { status: apiStatus });
      if (res.data.success) {
        setMembers(members.map(m => m.id === id ? { ...m, status: newStatus } : m));
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update member status.');
    } finally {
      setActiveDropdown(null);
    }
  };

  const handleEditClick = (member: any) => {
    setEditMember(member);
    setEditForm({ ...member });
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateItem('members', editForm.id, editForm);
    setMembers(members.map(m => m.id === editForm.id ? { ...editForm } : m));
    setEditMember(null);
    setEditForm(null);
  };

  const handleAddNew = (data: any) => {
    const newMember = {
      ...data,
      joined: data.startDate
    };
    const savedMember = addItem('members', newMember);
    setMembers([savedMember, ...members]);
    setShowNewModal(false);
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search);
    if (filter === 'All') return matchesSearch;
    return matchesSearch && m.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20';
      case 'Pending': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Inactive': return 'bg-[#0D9488]/10 text-[#0D9488] border-[#0D9488]/20';
      case 'Rejected': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'New': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'Existing': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Members</h1>
          <p className="text-[#475569] mt-1">Manage your gym members, subscriptions, and profiles.</p>
        </div>
        <div className="flex gap-2 self-start md:self-auto">

          <button 
            onClick={() => navigate('/admin/import-customers')}
            className="px-4 py-2 bg-white text-[#475569] font-bold rounded-xl border border-[#CCFBF1] hover:bg-[#F8FAFC] hover:text-[#16A34A] transition-colors flex items-center gap-2"
          >
            <FileSpreadsheet size={20} /> Existing Customers Data
          </button>
          <button 
            onClick={handleAddMemberClick}
            className="px-4 py-2 bg-[#16A34A] text-white font-bold rounded-xl hover:bg-[#15803D] transition-colors flex items-center gap-2 shadow-lg shadow-[#16A34A]/20"
          >
            <Plus size={20} /> Add Member
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#CCFBF1] flex flex-col justify-center">
          <div className="flex items-center space-x-2 text-[#475569] mb-2"><Users size={16}/> <span className="font-semibold text-sm">Total</span></div>
          <span className="text-2xl font-bold text-[#1E293B]">{members.length}</span>
        </div>
        <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#CCFBF1] flex flex-col justify-center">
          <div className="flex items-center space-x-2 text-[#16A34A] mb-2"><CheckCircle size={16}/> <span className="font-semibold text-sm">Active</span></div>
          <span className="text-2xl font-bold text-[#1E293B]">{members.filter(m => m.status === 'Active').length}</span>
        </div>
        <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#CCFBF1] flex flex-col justify-center">
          <div className="flex items-center space-x-2 text-orange-500 mb-2"><Clock size={16}/> <span className="font-semibold text-sm">Pending</span></div>
          <span className="text-2xl font-bold text-[#1E293B]">{members.filter(m => m.status === 'Pending').length}</span>
        </div>
        <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#CCFBF1] flex flex-col justify-center">
          <div className="flex items-center space-x-2 text-[#0D9488] mb-2"><XCircle size={16}/> <span className="font-semibold text-sm">Inactive</span></div>
          <span className="text-2xl font-bold text-[#1E293B]">{members.filter(m => m.status === 'Inactive').length}</span>
        </div>
        <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#CCFBF1] flex flex-col justify-center">
          <div className="flex items-center space-x-2 text-blue-500 mb-2"><UserPlus size={16}/> <span className="font-semibold text-sm">New This Month</span></div>
          <span className="text-2xl font-bold text-[#1E293B]">{members.filter(m => m.customerType === 'NEW_CUSTOMER').length}</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-[#FFFFFF] p-4 rounded-2xl border border-[#CCFBF1]">
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          {['All', 'Active', 'Inactive', 'Pending', 'Rejected', 'Existing', 'New'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${filter === f ? 'bg-[#16A34A] text-white' : 'bg-[#F8FAFC] text-[#475569] hover:bg-[#E2E8F0]'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-72">
          <input 
            type="text" 
            placeholder="Search by name, email or phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl pl-10 pr-4 py-2 text-[#1E293B] outline-none focus:border-[#16A34A] text-sm"
          />
          <Search className="absolute left-3 top-2.5 text-[#475569]" size={16} />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl overflow-visible">
        <div className="overflow-x-visible custom-scrollbar">
          <table className="w-full text-left text-sm text-[#475569] whitespace-nowrap">
            <thead className="bg-[#F8FAFC] border-b border-[#CCFBF1] text-[#1E293B]">
              <tr>
                <th className="px-6 py-4 font-semibold">Member</th>
                <th className="px-6 py-4 font-semibold">Contact Details</th>
                <th className="px-6 py-4 font-semibold">Membership</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CCFBF1]">
              {filteredMembers.map((member, index) => (
                <tr key={`${member.id}-${index}`} className="hover:bg-[#F0FDFA] transition-colors relative">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center font-bold text-lg uppercase">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[#1E293B] font-bold capitalize">{member.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-[#475569]">#{member.id.slice(-4).padStart(4, '0')}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="flex items-center text-xs text-[#1E293B] font-medium"><Mail size={12} className="mr-1.5 text-[#475569]"/> {member.email}</p>
                      <p className="flex items-center text-xs text-[#1E293B] font-medium"><Phone size={12} className="mr-1.5 text-[#475569]"/> {member.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 bg-[#1E293B] text-white rounded text-xs font-bold inline-flex items-center gap-1">
                        <ShieldCheck size={12} className="text-[#CCFBF1]" /> {member.plan}
                      </span>
                      <p className="flex items-center text-[11px] text-[#475569]"><Calendar size={10} className="mr-1"/> Since {member.joined}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 border rounded-lg text-xs font-bold transition-colors inline-block ${getStatusColor(member.status)}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 items-center relative">
                      <button onClick={() => setSelectedMember(member)} className="p-1.5 text-[#475569] hover:text-[#16A34A] hover:bg-[#F0FDFA] rounded transition-colors" title="View Profile">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => handleEditClick(member)} className="p-1.5 text-[#475569] hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit Profile">
                        <Edit2 size={18} />
                      </button>

                      <button onClick={() => handleDeleteMember(member.id)} className="p-1.5 text-[#475569] hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete Member">
                        <Trash2 size={18} />
                      </button>
                      
                      {/* Dropdown Menu for Status */}
                      <div className="relative inline-block text-left ml-2">
                        <button onClick={() => setActiveDropdown(activeDropdown === `${member.id}-${index}` ? null : `${member.id}-${index}`)} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 border ${activeDropdown === `${member.id}-${index}` ? 'bg-[#1E293B] text-white border-[#1E293B]' : 'bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F8FAFC]'}`} title="Set Status">
                          <Activity size={14} className={activeDropdown === `${member.id}-${index}` ? 'text-white' : 'text-[#94A3B8]'} /> Status
                        </button>
                        
                        {activeDropdown === `${member.id}-${index}` && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)}></div>
                            <div className="absolute right-0 mt-2 w-40 rounded-xl shadow-2xl bg-white border border-[#CCFBF1] z-50 overflow-hidden">
                              <div className="px-4 py-2 bg-gray-50 border-b border-[#CCFBF1] text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                Set Status
                              </div>
                              <div className="py-1 flex flex-col">
                                {['Active', 'Inactive', 'Pending', 'Rejected', 'New', 'Existing'].map((status) => (
                                  <button
                                    key={status}
                                    type="button"
                                    onClick={() => handleStatusChange(member.id, status)}
                                    className={`block w-full text-left px-4 py-2 text-sm font-semibold hover:bg-[#F0FDFA] transition-colors ${member.status === status ? 'text-[#16A34A] bg-[#F0FDFA]' : 'text-[#1E293B]'}`}
                                  >
                                    {status}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#475569]">
                    No members found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#FFFFFF] rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-[#CCFBF1] text-center">
            <ShieldCheck size={60} className="mx-auto text-[#16A34A] mb-4" />
            <h2 className="text-2xl font-bold text-[#1E293B] mb-2">Member Limit Reached</h2>
            <p className="text-[#475569] mb-6">Your current subscription plan limits you to {getMemberLimit(user?.subscriptionPlan)} members. Upgrade your plan to add more members and grow your gym!</p>
            <div className="flex flex-col space-y-3">
              <button onClick={() => navigate('/admin/subscription')} className="w-full py-3 bg-[#16A34A] text-white font-bold rounded-xl hover:bg-[#15803D] transition-colors shadow-lg shadow-[#16A34A]/20">
                View Upgrade Options
              </button>
              <button onClick={() => setShowUpgradeModal(false)} className="w-full py-3 bg-[#F8FAFC] text-[#475569] font-bold rounded-xl hover:bg-[#F1F5F9] transition-colors">
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {showSelectorModal && (
        <AddMemberSelectorModal 
          onClose={() => setShowSelectorModal(false)}
          onSelectNew={() => { setShowSelectorModal(false); setShowNewModal(true); }}
        />
      )}

      {showExistingModal && (
        <AddExistingMemberModal
          plans={mockPlans}
          onClose={() => setShowExistingModal(false)}
          onSubmit={handleAddExisting}
        />
      )}

      {showNewModal && (
        <RegisterNewMemberModal
          plans={mockPlans}
          onClose={() => setShowNewModal(false)}
          onSubmit={handleAddNew}
        />
      )}

      {/* Member View Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-[#CCFBF1] my-8 shrink-0">
            <div className="p-6 border-b border-[#CCFBF1] flex justify-between items-center bg-[#F8FAFC]">
              <h2 className="text-xl font-bold text-[#1E293B]">Member Profile</h2>
              <button onClick={() => setSelectedMember(null)} className="text-[#475569] hover:text-[#1E293B] transition-colors p-2 hover:bg-gray-100 rounded-lg">
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-[#16A34A]/10 text-[#16A34A] rounded-2xl flex items-center justify-center text-3xl font-bold border border-[#16A34A]/20 uppercase">
                  {selectedMember.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#1E293B] mb-1 capitalize">{selectedMember.name}</h3>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedMember.status === 'Active' ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-[#0D9488]/10 text-[#0D9488]'}`}>
                      {selectedMember.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedMember.customerType === 'NEW_CUSTOMER' ? 'bg-blue-500/10 text-blue-600' : 'bg-gray-500/10 text-gray-600'}`}>
                      {selectedMember.customerType === 'NEW_CUSTOMER' ? 'New Customer' : 'Existing Customer'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-1">Email</p>
                  <p className="font-semibold text-[#1E293B]">{selectedMember.email}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-1">Phone</p>
                  <p className="font-semibold text-[#1E293B]">{selectedMember.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-1">Membership Plan</p>
                  <p className="font-semibold text-[#1E293B]">{selectedMember.plan}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-1">Join Date</p>
                  <p className="font-semibold text-[#1E293B]">{selectedMember.joined}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-1">Gender</p>
                  <p className="font-semibold text-[#1E293B]">{selectedMember.gender || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-1">Date of Birth</p>
                  <p className="font-semibold text-[#1E293B]">{selectedMember.dob || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-1">Fitness Goal</p>
                  <p className="font-semibold text-[#1E293B]">{selectedMember.fitnessGoal || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-1">Assigned Trainer</p>
                  <p className="font-semibold text-[#1E293B]">{selectedMember.trainer || 'Unassigned'}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#CCFBF1]">
                <p className="text-[#16A34A] font-bold mb-4 uppercase text-xs tracking-wider flex items-center gap-2"><Phone size={14}/> Emergency Contact</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-bold text-[#475569] mb-1">Name</p>
                    <p className="font-semibold text-[#1E293B]">{selectedMember.emergencyName || 'None provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#475569] mb-1">Phone</p>
                    <p className="font-semibold text-[#1E293B]">{selectedMember.emergencyPhone || 'None provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#475569] mb-1">Relationship</p>
                    <p className="font-semibold text-[#1E293B]">{selectedMember.emergencyRelation || 'None provided'}</p>
                  </div>
                </div>
              </div>
              
            </div>
            <div className="p-4 bg-[#F8FAFC] border-t border-[#CCFBF1] flex justify-end gap-3">
              <button onClick={() => handleDeleteMember(selectedMember.id)} className="px-6 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors">
                Delete Member
              </button>
              <button onClick={() => setSelectedMember(null)} className="px-6 py-2 bg-[#FFFFFF] border border-[#E2E8F0] text-[#1E293B] rounded-xl font-bold hover:bg-[#F1F5F9] transition-colors">
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editMember && editForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-[#CCFBF1] my-8 shrink-0">
            <div className="p-6 border-b border-[#CCFBF1] flex justify-between items-center bg-[#F8FAFC]">
              <div>
                <h2 className="text-xl font-bold text-[#1E293B]">Edit Member</h2>
                <p className="text-sm text-[#475569] mt-0.5 capitalize">Editing profile for {editMember.name}</p>
              </div>
              <button onClick={() => setEditMember(null)} className="text-[#475569] hover:text-[#1E293B] transition-colors p-2 hover:bg-gray-100 rounded-lg">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleEditSave}>
              <div className="p-6 space-y-6">
                
                {/* Personal Info */}
                <div>
                  <p className="text-xs font-bold text-[#16A34A] uppercase tracking-wider mb-3 flex items-center gap-2"><User size={14}/> Personal Information</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#475569] mb-1">Full Name *</label>
                      <input required value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-2.5 outline-none focus:border-[#16A34A] text-sm" placeholder="Full Name" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#475569] mb-1">Email Address *</label>
                      <input required type="email" value={editForm.email || ''} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-2.5 outline-none focus:border-[#16A34A] text-sm" placeholder="Email" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#475569] mb-1">Phone Number *</label>
                      <input required type="tel" value={editForm.phone || ''} onChange={e => { const v = e.target.value.replace(/\D/g,''); if(v.length<=10) setEditForm({...editForm, phone: v}); }} maxLength={10} className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-2.5 outline-none focus:border-[#16A34A] text-sm" placeholder="10-digit number" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#475569] mb-1">Gender</label>
                      <select value={editForm.gender || 'Male'} onChange={e => setEditForm({...editForm, gender: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-2.5 outline-none focus:border-[#16A34A] text-sm">
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#475569] mb-1">Date of Birth</label>
                      <input type="date" value={editForm.dob || ''} onChange={e => setEditForm({...editForm, dob: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-2.5 outline-none focus:border-[#16A34A] text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#475569] mb-1">Fitness Goal</label>
                      <select value={editForm.fitnessGoal || 'General Fitness'} onChange={e => setEditForm({...editForm, fitnessGoal: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-2.5 outline-none focus:border-[#16A34A] text-sm">
                        <option>General Fitness</option>
                        <option>Weight Loss</option>
                        <option>Muscle Gain</option>
                        <option>Endurance</option>
                        <option>Flexibility</option>
                        <option>Sports Performance</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Membership */}
                <div className="border-t border-[#CCFBF1] pt-6">
                  <p className="text-xs font-bold text-[#16A34A] uppercase tracking-wider mb-3 flex items-center gap-2"><ShieldCheck size={14}/> Membership</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#475569] mb-1">Plan</label>
                      <select value={editForm.plan || ''} onChange={e => setEditForm({...editForm, plan: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-2.5 outline-none focus:border-[#16A34A] text-sm">
                        {mockPlans.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#475569] mb-1">Status</label>
                      <select value={editForm.status || 'Active'} onChange={e => setEditForm({...editForm, status: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-2.5 outline-none focus:border-[#16A34A] text-sm">
                        <option>Active</option>
                        <option>Pending</option>
                        <option>Inactive</option>
                        <option>Suspended</option>
                        <option>Rejected</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#475569] mb-1">Join Date</label>
                      <input type="date" value={editForm.joined || ''} onChange={e => setEditForm({...editForm, joined: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-2.5 outline-none focus:border-[#16A34A] text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#475569] mb-1">Assigned Trainer</label>
                      <input value={editForm.trainer || ''} onChange={e => setEditForm({...editForm, trainer: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-2.5 outline-none focus:border-[#16A34A] text-sm" placeholder="Trainer Name" />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="border-t border-[#CCFBF1] pt-6">
                  <p className="text-xs font-bold text-[#16A34A] uppercase tracking-wider mb-3 flex items-center gap-2"><Phone size={14}/> Emergency Contact</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#475569] mb-1">Name</label>
                      <input value={editForm.emergencyName || ''} onChange={e => setEditForm({...editForm, emergencyName: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-2.5 outline-none focus:border-[#16A34A] text-sm" placeholder="Contact Name" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#475569] mb-1">Phone</label>
                      <input type="tel" value={editForm.emergencyPhone || ''} onChange={e => { const v = e.target.value.replace(/\D/g,''); if(v.length<=10) setEditForm({...editForm, emergencyPhone: v}); }} maxLength={10} className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-2.5 outline-none focus:border-[#16A34A] text-sm" placeholder="Phone" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#475569] mb-1">Relationship</label>
                      <input value={editForm.emergencyRelation || ''} onChange={e => setEditForm({...editForm, emergencyRelation: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-2.5 outline-none focus:border-[#16A34A] text-sm" placeholder="e.g. Parent" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#F8FAFC] border-t border-[#CCFBF1] flex justify-end gap-3">
                <button type="button" onClick={() => setEditMember(null)} className="px-6 py-2 bg-[#FFFFFF] border border-[#E2E8F0] text-[#475569] rounded-xl font-bold hover:bg-[#F1F5F9] transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-8 py-2 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition-colors shadow-lg shadow-[#16A34A]/20 flex items-center gap-2">
                  <Edit2 size={16}/> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymAdminMembers;
