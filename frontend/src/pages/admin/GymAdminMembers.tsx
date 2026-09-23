import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ShieldCheck, Mail, Phone, Eye, Edit2, User, Trash2, Calendar, Activity, CheckCircle, Clock, XCircle, UserPlus, Users, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AddMemberSelectorModal } from '../../components/GymAdmin/AddMemberSelectorModal';
import { AddExistingMemberModal } from '../../components/GymAdmin/AddExistingMemberModal';
import { RegisterNewMemberModal } from '../../components/GymAdmin/RegisterNewMemberModal';
import api from '../../utils/api';
import { addItem, updateItem, deleteItem } from '../../utils/mockDb';



const mockPlans = [
  { id: '1', name: 'Basic' },
  { id: '2', name: 'Pro' },
  { id: '3', name: 'Elite' }
];

const GymAdminMembers = () => {
  const [members, setMembers] = useState<any[]>([]);
  
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
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
      case 'Active': return 'bg-[#34483F]/10 text-[#34483F] border-[#34483F]/20';
      case 'Pending': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Inactive': return 'bg-[#8FA89B]/10 text-[#8FA89B] border-[#8FA89B]/20';
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
          <h1 className="text-3xl font-bold text-[#202522] tracking-tight">Members</h1>
          <p className="text-[#4A514D] mt-1">Manage your gym members, subscriptions, and profiles.</p>
        </div>
        <div className="flex gap-2 self-start md:self-auto">

          <button 
            onClick={() => navigate('/admin/import-customers')}
            className="px-4 py-2 bg-white text-[#4A514D] font-bold rounded-xl border border-[#DCD9CD] hover:bg-[#F2EFE8] hover:text-[#34483F] transition-colors flex items-center gap-2"
          >
            <FileSpreadsheet size={20} /> Existing Customers Data
          </button>
          <button 
            onClick={handleAddMemberClick}
            className="px-4 py-2 bg-[#34483F] text-white font-bold rounded-xl hover:bg-[#C6A77D] transition-colors flex items-center gap-2 shadow-lg shadow-[#34483F]/20"
          >
            <Plus size={20} /> Add Member
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#DCD9CD] flex flex-col justify-center">
          <div className="flex items-center space-x-2 text-[#4A514D] mb-2"><Users size={16}/> <span className="font-semibold text-sm">Total</span></div>
          <span className="text-2xl font-bold text-[#202522]">{members.length}</span>
        </div>
        <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#DCD9CD] flex flex-col justify-center">
          <div className="flex items-center space-x-2 text-[#34483F] mb-2"><CheckCircle size={16}/> <span className="font-semibold text-sm">Active</span></div>
          <span className="text-2xl font-bold text-[#202522]">{members.filter(m => m.status === 'Active').length}</span>
        </div>
        <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#DCD9CD] flex flex-col justify-center">
          <div className="flex items-center space-x-2 text-orange-500 mb-2"><Clock size={16}/> <span className="font-semibold text-sm">Pending</span></div>
          <span className="text-2xl font-bold text-[#202522]">{members.filter(m => m.status === 'Pending').length}</span>
        </div>
        <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#DCD9CD] flex flex-col justify-center">
          <div className="flex items-center space-x-2 text-[#8FA89B] mb-2"><XCircle size={16}/> <span className="font-semibold text-sm">Inactive</span></div>
          <span className="text-2xl font-bold text-[#202522]">{members.filter(m => m.status === 'Inactive').length}</span>
        </div>
        <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#DCD9CD] flex flex-col justify-center">
          <div className="flex items-center space-x-2 text-blue-500 mb-2"><UserPlus size={16}/> <span className="font-semibold text-sm">New This Month</span></div>
          <span className="text-2xl font-bold text-[#202522]">{members.filter(m => m.customerType === 'NEW_CUSTOMER').length}</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-[#FFFFFF] p-4 rounded-2xl border border-[#DCD9CD]">
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          {['All', 'Active', 'Inactive', 'Pending', 'Rejected', 'Existing', 'New'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${filter === f ? 'bg-[#34483F] text-white' : 'bg-[#F2EFE8] text-[#4A514D] hover:bg-[#E8E5DA]'}`}
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
            className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl pl-10 pr-4 py-2 text-[#202522] outline-none focus:border-[#34483F] text-sm"
          />
          <Search className="absolute left-3 top-2.5 text-[#4A514D]" size={16} />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl overflow-visible">
        <div className="overflow-x-visible custom-scrollbar">
          <table className="w-full text-left text-sm text-[#4A514D] whitespace-nowrap">
            <thead className="bg-[#F2EFE8] border-b border-[#DCD9CD] text-[#202522]">
              <tr>
                <th className="px-6 py-4 font-semibold">Member</th>
                <th className="px-6 py-4 font-semibold">Contact Details</th>
                <th className="px-6 py-4 font-semibold">Membership</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCD9CD]">
              {filteredMembers.map((member, index) => (
                <tr key={`${member.id}-${index}`} className="hover:bg-[#F5F3EE] transition-colors relative">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[#34483F]/10 text-[#34483F] flex items-center justify-center font-bold text-lg uppercase">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[#202522] font-bold capitalize">{member.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-[#4A514D]">#{member.id.slice(-4).padStart(4, '0')}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="flex items-center text-xs text-[#202522] font-medium"><Mail size={12} className="mr-1.5 text-[#4A514D]"/> {member.email}</p>
                      <p className="flex items-center text-xs text-[#202522] font-medium"><Phone size={12} className="mr-1.5 text-[#4A514D]"/> {member.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 bg-[#202522] text-white rounded text-xs font-bold inline-flex items-center gap-1">
                        <ShieldCheck size={12} className="text-[#DCD9CD]" /> {member.plan}
                      </span>
                      <p className="flex items-center text-[11px] text-[#4A514D]">
                        <Calendar size={10} className="mr-1"/> Joined: {member.originalUser?.createdAt ? new Date(member.originalUser.createdAt).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit' }) : member.joined}
                      </p>
                      <p className="flex items-center text-[11px] text-red-500 font-medium mt-0.5">
                        <Calendar size={10} className="mr-1"/> Expiry: {member.originalUser?.subscriptionExpiry ? new Date(member.originalUser.subscriptionExpiry).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit' }) : 'N/A'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 border rounded-lg text-xs font-bold transition-colors inline-block ${getStatusColor(member.status)}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 items-center relative">
                      <button onClick={() => setSelectedMember(member)} className="p-1.5 text-[#4A514D] hover:text-[#34483F] hover:bg-[#F5F3EE] rounded transition-colors" title="View Profile">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => handleEditClick(member)} className="p-1.5 text-[#4A514D] hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit Profile">
                        <Edit2 size={18} />
                      </button>

                      <button onClick={() => handleDeleteMember(member.id)} className="p-1.5 text-[#4A514D] hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete Member">
                        <Trash2 size={18} />
                      </button>
                      
                      {/* Dropdown Menu for Status */}
                      <div className="relative inline-block text-left ml-2">
                        <button onClick={() => setActiveDropdown(activeDropdown === `${member.id}-${index}` ? null : `${member.id}-${index}`)} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 border ${activeDropdown === `${member.id}-${index}` ? 'bg-[#202522] text-white border-[#202522]' : 'bg-white text-[#4A514D] border-[#E8E5DA] hover:bg-[#F2EFE8]'}`} title="Set Status">
                          <Activity size={14} className={activeDropdown === `${member.id}-${index}` ? 'text-white' : 'text-[#A8ADA9]'} /> Status
                        </button>
                        
                        {activeDropdown === `${member.id}-${index}` && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)}></div>
                            <div className="absolute right-0 mt-2 w-40 rounded-xl shadow-2xl bg-white border border-[#DCD9CD] z-50 overflow-hidden">
                              <div className="px-4 py-2 bg-gray-50 border-b border-[#DCD9CD] text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                Set Status
                              </div>
                              <div className="py-1 flex flex-col">
                                {['Active', 'Inactive', 'Pending', 'Rejected', 'New', 'Existing'].map((status) => (
                                  <button
                                    key={status}
                                    type="button"
                                    onClick={() => handleStatusChange(member.id, status)}
                                    className={`block w-full text-left px-4 py-2 text-sm font-semibold hover:bg-[#F5F3EE] transition-colors ${member.status === status ? 'text-[#34483F] bg-[#F5F3EE]' : 'text-[#202522]'}`}
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
                  <td colSpan={6} className="px-6 py-8 text-center text-[#4A514D]">
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
          <div className="bg-[#FFFFFF] rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-[#DCD9CD] text-center">
            <ShieldCheck size={60} className="mx-auto text-[#34483F] mb-4" />
            <h2 className="text-2xl font-bold text-[#202522] mb-2">Member Limit Reached</h2>
            <p className="text-[#4A514D] mb-6">Your current subscription plan limits you to {getMemberLimit(user?.subscriptionPlan)} members. Upgrade your plan to add more members and grow your gym!</p>
            <div className="flex flex-col space-y-3">
              <button onClick={() => navigate('/admin/subscription')} className="w-full py-3 bg-[#34483F] text-white font-bold rounded-xl hover:bg-[#C6A77D] transition-colors shadow-lg shadow-[#34483F]/20">
                View Upgrade Options
              </button>
              <button onClick={() => setShowUpgradeModal(false)} className="w-full py-3 bg-[#F2EFE8] text-[#4A514D] font-bold rounded-xl hover:bg-[#F1F5F9] transition-colors">
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
          <div className="bg-[#FFFFFF] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-[#DCD9CD] my-8 shrink-0">
            <div className="p-6 border-b border-[#DCD9CD] flex justify-between items-center bg-[#F2EFE8]">
              <h2 className="text-xl font-bold text-[#202522]">Member Profile</h2>
              <button onClick={() => setSelectedMember(null)} className="text-[#4A514D] hover:text-[#202522] transition-colors p-2 hover:bg-gray-100 rounded-lg">
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-[#34483F]/10 text-[#34483F] rounded-2xl flex items-center justify-center text-3xl font-bold border border-[#34483F]/20 uppercase">
                  {selectedMember.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#202522] mb-1 capitalize">{selectedMember.name}</h3>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedMember.status === 'Active' ? 'bg-[#34483F]/10 text-[#34483F]' : 'bg-[#8FA89B]/10 text-[#8FA89B]'}`}>
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
                  <p className="text-xs font-bold text-[#4A514D] uppercase tracking-wider mb-1">Email</p>
                  <p className="font-semibold text-[#202522]">{selectedMember.email}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#4A514D] uppercase tracking-wider mb-1">Phone</p>
                  <p className="font-semibold text-[#202522]">{selectedMember.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#4A514D] uppercase tracking-wider mb-1">Membership Plan</p>
                  <p className="font-semibold text-[#202522]">{selectedMember.plan}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#4A514D] uppercase tracking-wider mb-1">Join Date</p>
                  <p className="font-semibold text-[#202522]">{selectedMember.joined}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#4A514D] uppercase tracking-wider mb-1">Gender</p>
                  <p className="font-semibold text-[#202522]">{selectedMember.gender || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#4A514D] uppercase tracking-wider mb-1">Renewal Date</p>
                  <p className="font-semibold text-[#202522]">{selectedMember.originalUser?.subscriptionExpiry ? new Date(selectedMember.originalUser.subscriptionExpiry).toLocaleDateString() : 'Not Set'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#4A514D] uppercase tracking-wider mb-1">Last Login</p>
                  <p className="font-semibold text-[#202522]">{selectedMember.originalUser?.lastLogin ? new Date(selectedMember.originalUser.lastLogin).toLocaleString() : 'Never'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#4A514D] uppercase tracking-wider mb-1">Date of Birth</p>
                  <p className="font-semibold text-[#202522]">{selectedMember.dob || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#4A514D] uppercase tracking-wider mb-1">City & PIN</p>
                  <p className="font-semibold text-[#202522]">{selectedMember.originalUser?.city || 'Not specified'} - {selectedMember.originalUser?.pinCode || ''}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#4A514D] uppercase tracking-wider mb-1">Height / Weight</p>
                  <p className="font-semibold text-[#202522]">{selectedMember.originalUser?.height ? `${selectedMember.originalUser.height} cm` : '--'} / {selectedMember.originalUser?.weight ? `${selectedMember.originalUser.weight} kg` : '--'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#4A514D] uppercase tracking-wider mb-1">Fitness Goal</p>
                  <p className="font-semibold text-[#202522]">{selectedMember.fitnessGoal || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#4A514D] uppercase tracking-wider mb-1">Experience Level</p>
                  <p className="font-semibold text-[#202522]">{selectedMember.originalUser?.experienceLevel || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#4A514D] uppercase tracking-wider mb-1">Pref. Training</p>
                  <p className="font-semibold text-[#202522]">{selectedMember.originalUser?.preferredTraining || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#4A514D] uppercase tracking-wider mb-1">Pref. Workout Time</p>
                  <p className="font-semibold text-[#202522]">{selectedMember.originalUser?.preferredWorkoutTime || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#4A514D] uppercase tracking-wider mb-1">Assigned Trainer</p>
                  <p className="font-semibold text-[#202522]">{selectedMember.trainer || 'Unassigned'}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#DCD9CD]">
                <p className="text-[#34483F] font-bold mb-4 uppercase text-xs tracking-wider flex items-center gap-2"><Phone size={14}/> Emergency Contact</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-bold text-[#4A514D] mb-1">Name</p>
                    <p className="font-semibold text-[#202522]">{selectedMember.emergencyName || 'None provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#4A514D] mb-1">Phone</p>
                    <p className="font-semibold text-[#202522]">{selectedMember.emergencyPhone || 'None provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#4A514D] mb-1">Relationship</p>
                    <p className="font-semibold text-[#202522]">{selectedMember.emergencyRelation || 'None provided'}</p>
                  </div>
                </div>
              </div>
              
            </div>
            <div className="p-4 bg-[#F2EFE8] border-t border-[#DCD9CD] flex justify-end gap-3">
              <button onClick={() => handleDeleteMember(selectedMember.id)} className="px-6 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors">
                Delete Member
              </button>
              <button onClick={() => setSelectedMember(null)} className="px-6 py-2 bg-[#FFFFFF] border border-[#E8E5DA] text-[#202522] rounded-xl font-bold hover:bg-[#F1F5F9] transition-colors">
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editMember && editForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-[#DCD9CD] my-8 shrink-0">
            <div className="p-6 border-b border-[#DCD9CD] flex justify-between items-center bg-[#F2EFE8]">
              <div>
                <h2 className="text-xl font-bold text-[#202522]">Edit Member</h2>
                <p className="text-sm text-[#4A514D] mt-0.5 capitalize">Editing profile for {editMember.name}</p>
              </div>
              <button onClick={() => setEditMember(null)} className="text-[#4A514D] hover:text-[#202522] transition-colors p-2 hover:bg-gray-100 rounded-lg">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleEditSave}>
              <div className="p-6 space-y-6">
                
                {/* Personal Info */}
                <div>
                  <p className="text-xs font-bold text-[#34483F] uppercase tracking-wider mb-3 flex items-center gap-2"><User size={14}/> Personal Information</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#4A514D] mb-1">Full Name *</label>
                      <input required value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl px-4 py-2.5 outline-none focus:border-[#34483F] text-sm" placeholder="Full Name" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#4A514D] mb-1">Email Address *</label>
                      <input required type="email" value={editForm.email || ''} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl px-4 py-2.5 outline-none focus:border-[#34483F] text-sm" placeholder="Email" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#4A514D] mb-1">Phone Number *</label>
                      <input required type="tel" value={editForm.phone || ''} onChange={e => { const v = e.target.value.replace(/\D/g,''); if(v.length<=10) setEditForm({...editForm, phone: v}); }} maxLength={10} className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl px-4 py-2.5 outline-none focus:border-[#34483F] text-sm" placeholder="10-digit number" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#4A514D] mb-1">Gender</label>
                      <select value={editForm.gender || 'Male'} onChange={e => setEditForm({...editForm, gender: e.target.value})} className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl px-4 py-2.5 outline-none focus:border-[#34483F] text-sm">
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#4A514D] mb-1">Date of Birth</label>
                      <input type="date" value={editForm.dob || ''} onChange={e => setEditForm({...editForm, dob: e.target.value})} className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl px-4 py-2.5 outline-none focus:border-[#34483F] text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#4A514D] mb-1">Fitness Goal</label>
                      <select value={editForm.fitnessGoal || 'General Fitness'} onChange={e => setEditForm({...editForm, fitnessGoal: e.target.value})} className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl px-4 py-2.5 outline-none focus:border-[#34483F] text-sm">
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
                <div className="border-t border-[#DCD9CD] pt-6">
                  <p className="text-xs font-bold text-[#34483F] uppercase tracking-wider mb-3 flex items-center gap-2"><ShieldCheck size={14}/> Membership</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#4A514D] mb-1">Plan</label>
                      <select value={editForm.plan || ''} onChange={e => setEditForm({...editForm, plan: e.target.value})} className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl px-4 py-2.5 outline-none focus:border-[#34483F] text-sm">
                        {mockPlans.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#4A514D] mb-1">Status</label>
                      <select value={editForm.status || 'Active'} onChange={e => setEditForm({...editForm, status: e.target.value})} className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl px-4 py-2.5 outline-none focus:border-[#34483F] text-sm">
                        <option>Active</option>
                        <option>Pending</option>
                        <option>Inactive</option>
                        <option>Suspended</option>
                        <option>Rejected</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#4A514D] mb-1">Join Date</label>
                      <input type="date" value={editForm.joined || ''} onChange={e => setEditForm({...editForm, joined: e.target.value})} className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl px-4 py-2.5 outline-none focus:border-[#34483F] text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#4A514D] mb-1">Assigned Trainer</label>
                      <input value={editForm.trainer || ''} onChange={e => setEditForm({...editForm, trainer: e.target.value})} className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl px-4 py-2.5 outline-none focus:border-[#34483F] text-sm" placeholder="Trainer Name" />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="border-t border-[#DCD9CD] pt-6">
                  <p className="text-xs font-bold text-[#34483F] uppercase tracking-wider mb-3 flex items-center gap-2"><Phone size={14}/> Emergency Contact</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#4A514D] mb-1">Name</label>
                      <input value={editForm.emergencyName || ''} onChange={e => setEditForm({...editForm, emergencyName: e.target.value})} className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl px-4 py-2.5 outline-none focus:border-[#34483F] text-sm" placeholder="Contact Name" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#4A514D] mb-1">Phone</label>
                      <input type="tel" value={editForm.emergencyPhone || ''} onChange={e => { const v = e.target.value.replace(/\D/g,''); if(v.length<=10) setEditForm({...editForm, emergencyPhone: v}); }} maxLength={10} className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl px-4 py-2.5 outline-none focus:border-[#34483F] text-sm" placeholder="Phone" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#4A514D] mb-1">Relationship</label>
                      <input value={editForm.emergencyRelation || ''} onChange={e => setEditForm({...editForm, emergencyRelation: e.target.value})} className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl px-4 py-2.5 outline-none focus:border-[#34483F] text-sm" placeholder="e.g. Parent" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#F2EFE8] border-t border-[#DCD9CD] flex justify-end gap-3">
                <button type="button" onClick={() => setEditMember(null)} className="px-6 py-2 bg-[#FFFFFF] border border-[#E8E5DA] text-[#4A514D] rounded-xl font-bold hover:bg-[#F1F5F9] transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-8 py-2 bg-[#34483F] text-white rounded-xl font-bold hover:bg-[#C6A77D] transition-colors shadow-lg shadow-[#34483F]/20 flex items-center gap-2">
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
