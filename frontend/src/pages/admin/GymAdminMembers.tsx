import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ShieldCheck, Mail, Phone, Eye, Edit2, User, Trash2, Calendar, Activity, CheckCircle, Clock, XCircle, UserPlus, Users, FileSpreadsheet, Download, Check, History, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AddMemberSelectorModal } from '../../components/GymAdmin/AddMemberSelectorModal';
import { AddExistingMemberModal } from '../../components/GymAdmin/AddExistingMemberModal';
import { RegisterNewMemberModal } from '../../components/GymAdmin/RegisterNewMemberModal';
import api from '../../utils/api';
import { addItem, updateItem, deleteItem } from '../../utils/mockDb';
import { exportToPDF } from '../../utils/export';



const mockPlans = [
  { id: '1', name: 'Basic' },
  { id: '2', name: 'Pro' },
  { id: '3', name: 'Elite' }
];

const getPlanBadge = (planName: string, isSmall = false) => {
  const p = (planName || '').trim().toLowerCase();
  let bgClass = 'bg-[#292524] text-white';
  let iconColor = 'text-[#E7E5E4]';
  let label = planName || 'None';

  if (p.includes('trial')) {
    bgClass = 'bg-amber-100 text-amber-800 border border-amber-300 shadow-xs';
    iconColor = 'text-amber-600';
    label = 'Free Trial';
  } else if (p.includes('silver')) {
    bgClass = 'bg-slate-800 text-slate-100 border border-slate-600 shadow-xs';
    iconColor = 'text-slate-300';
    label = 'Silver';
  } else if (p.includes('gold')) {
    bgClass = 'bg-amber-600 text-white border border-amber-500 shadow-xs';
    iconColor = 'text-amber-200';
    label = 'Gold';
  } else if (p.includes('platinum')) {
    bgClass = 'bg-indigo-700 text-indigo-50 border border-indigo-500 shadow-xs';
    iconColor = 'text-indigo-200';
    label = 'Platinum';
  } else if (p.includes('basic')) {
    bgClass = 'bg-emerald-700 text-emerald-50 border border-emerald-600';
    iconColor = 'text-emerald-200';
    label = planName;
  } else if (p.includes('premium') || p.includes('pro')) {
    bgClass = 'bg-purple-700 text-purple-50 border border-purple-600';
    iconColor = 'text-purple-200';
    label = planName;
  }

  return (
    <span className={`px-2 py-0.5 rounded font-bold inline-flex items-center gap-1 ${isSmall ? 'text-[10px]' : 'text-xs'} ${bgClass}`}>
      <ShieldCheck size={isSmall ? 10 : 12} className={iconColor} />
      {label}
    </span>
  );
};

const GymAdminMembers = () => {
  const [members, setMembers] = useState<any[]>([]);
  
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const [usersRes, membershipsRes] = await Promise.all([
        api.get('/users?role=MEMBER'),
        api.get('/memberships/gym').catch(() => ({ data: { memberships: [] } })),
      ]);
      if (usersRes.data.success) {
        // Build maps: latest membership and full membership history per user
        const membershipMap: Record<string, any> = {};
        const allMembershipsMap: Record<string, any[]> = {};

        for (const m of (membershipsRes.data.memberships || [])) {
          const uid = (m.userId?._id ?? m.userId)?.toString?.() ?? String(m.userId);
          if (uid) {
            if (!membershipMap[uid]) membershipMap[uid] = m;
            if (!allMembershipsMap[uid]) allMembershipsMap[uid] = [];
            allMembershipsMap[uid].push(m);
          }
        }

        const mapped = usersRes.data.users.map((u: any) => {
          const userId = u._id?.toString?.() ?? String(u._id);
          const membership = membershipMap[userId] || null;
          let membershipHistory = allMembershipsMap[userId] || [];

          // Sort history newest first
          membershipHistory.sort((a, b) => new Date(b.createdAt || b.startDate || 0).getTime() - new Date(a.createdAt || a.startDate || 0).getTime());

          if (membershipHistory.length === 0) {
            membershipHistory = [{
              _id: 'default-' + userId,
              planName: u.subscriptionPlan || (u.subscriptionStatus === 'Free Trial' ? 'Free Trial' : 'Active Plan'),
              status: u.subscriptionStatus || 'Active',
              duration: u.subscriptionStatus === 'Free Trial' ? '1 Day' : '1 Year',
              startDate: u.createdAt,
              endDate: u.subscriptionExpiry,
              paymentMethod: 'Membership',
            }];
          }

          // If user had Free Trial originally or registered with trial, ensure it is represented in history
          const hasTrial = membershipHistory.some((h: any) => (h.planName || '').toLowerCase().includes('trial') || h.status === 'Free Trial' || h.paymentMethod === 'Trial');
          if (!hasTrial && (u.subscriptionStatus === 'Free Trial' || u.customerType === 'NEW_CUSTOMER')) {
            membershipHistory.push({
              _id: 'trial-' + userId,
              planName: 'Free Trial',
              status: 'Free Trial',
              duration: '1 Day',
              startDate: u.createdAt,
              endDate: new Date(new Date(u.createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString(),
              paymentMethod: 'Trial',
              createdAt: u.createdAt,
            });
          }

          // Ensure sorted newest first
          membershipHistory.sort((a, b) => new Date(b.createdAt || b.startDate || 0).getTime() - new Date(a.createdAt || a.startDate || 0).getTime());

          return {
            id: u._id,
            name: `${u.firstName} ${u.lastName}`,
            email: u.email,
            phone: u.mobile,
            plan: u.subscriptionPlan || (membership?.status === 'Free Trial' ? 'Free Trial' : membership?.planName || 'None'),
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
            membership,
            membershipHistory,
            originalUser: u,
          };
        });
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
  const [statusDropdown, setStatusDropdown] = useState<{
    memberId: string;
    memberStatus: string;
    top?: number;
    bottom?: number;
    right: number;
    maxHeight?: number;
  } | null>(null);
  const [editMember, setEditMember] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>(null);

  // Close dropdown on window scroll or resize
  useEffect(() => {
    if (!statusDropdown) return;
    const close = () => setStatusDropdown(null);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [statusDropdown]);

  const handleToggleStatusDropdown = (e: React.MouseEvent<HTMLButtonElement>, member: any) => {
    e.stopPropagation();
    if (statusDropdown?.memberId === member.id) {
      setStatusDropdown(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Total dropdown height is around 250px (header + 6 items + padding)
    // If not enough room below and more room above, flip upward
    const openUpward = spaceBelow < 260 && spaceAbove > spaceBelow;
    const right = Math.max(12, window.innerWidth - rect.right);
    const maxHeight = openUpward 
      ? Math.max(180, spaceAbove - 16) 
      : Math.max(180, spaceBelow - 16);

    if (openUpward) {
      setStatusDropdown({
        memberId: member.id,
        memberStatus: member.status,
        bottom: Math.max(8, window.innerHeight - rect.top + 6),
        right,
        maxHeight,
      });
    } else {
      setStatusDropdown({
        memberId: member.id,
        memberStatus: member.status,
        top: rect.bottom + 6,
        right,
        maxHeight,
      });
    }
  };
  
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
      setStatusDropdown(null);
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
      setStatusDropdown(null);
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
    const matchesSearch = (m.name || '').toLowerCase().includes(search.toLowerCase()) || 
                          (m.email || '').toLowerCase().includes(search.toLowerCase()) || 
                          (m.phone || '').includes(search);
    if (!matchesSearch) return false;
    if (filter === 'All') return true;
    if (filter === 'Free Trial') {
      return (
        m.plan?.toLowerCase().includes('trial') ||
        m.membership?.status === 'Free Trial' ||
        m.originalUser?.subscriptionStatus === 'Free Trial' ||
        m.membershipHistory?.some((h: any) => 
          (h.planName || '').toLowerCase().includes('trial') || 
          h.status === 'Free Trial' || 
          h.paymentMethod === 'Trial'
        )
      );
    }
    if (filter === 'New') return m.customerType === 'NEW_CUSTOMER';
    if (filter === 'Existing') return m.customerType !== 'NEW_CUSTOMER';
    return m.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30';
      case 'Pending': return 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30';
      case 'Inactive': return 'bg-stone-500/10 text-[#78716C] border-stone-300';
      case 'Rejected': return 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30';
      case 'New': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'Existing': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const handleDownloadPDF = () => {
    const columns = ['Name', 'Email', 'Phone', 'Plan', 'Plan History', 'Status', 'Join Date', 'Expiry Date'];
    const data = filteredMembers.map(m => {
      let expiry = m.membership?.endDate || m.originalUser?.subscriptionExpiry || '-';
      if (expiry !== '-') {
        try { expiry = new Date(expiry).toLocaleDateString('en-IN'); } catch {}
      }
      const historyStr = m.membershipHistory && m.membershipHistory.length > 1
        ? m.membershipHistory.slice().reverse().map((h: any) => h.planName || h.status || 'Free Trial').join(' → ')
        : (m.plan || '-');
      return [
        m.name || '-',
        m.email || '-',
        m.phone || '-',
        m.plan || '-',
        historyStr,
        m.status || '-',
        m.joined || '-',
        expiry
      ];
    });
    exportToPDF({
      filename: `Gym_Members_${new Date().toISOString().split('T')[0]}`,
      columns,
      data,
      title: 'Gym Members Directory'
    });
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#292524] tracking-tight">Members</h1>
          <p className="text-sm text-[#78716C] mt-1">Manage your gym members, subscriptions, and profiles.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
          <button 
            onClick={handleDownloadPDF}
            className="px-3.5 py-2.5 bg-white text-[#F97316] font-bold rounded-xl border border-[#E7E5E4] hover:bg-[#FFFDF8] hover:border-[#F97316]/40 transition-all flex items-center gap-2 cursor-pointer shadow-xs text-xs sm:text-sm active:scale-95"
            title="Export Members Directory"
          >
            <Download size={16} /> Download PDF
          </button>
          <button 
            onClick={() => navigate('/admin/import-customers')}
            className="px-3.5 py-2.5 bg-white text-[#78716C] font-bold rounded-xl border border-[#E7E5E4] hover:bg-[#FFFDF8] hover:text-[#F97316] hover:border-[#F97316]/40 transition-all flex items-center gap-2 text-xs sm:text-sm shadow-xs active:scale-95"
          >
            <FileSpreadsheet size={16} /> Existing Customers Data
          </button>
          <button 
            onClick={handleAddMemberClick}
            className="px-4 py-2.5 bg-[#F97316] text-white font-bold rounded-xl hover:bg-[#EA580C] transition-all flex items-center gap-2 shadow-md shadow-[#F97316]/20 text-xs sm:text-sm active:scale-95 shrink-0"
          >
            <Plus size={18} /> Add Member
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div 
          onClick={() => setFilter('All')}
          className={`bg-[#FFFFFF] p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${filter === 'All' ? 'border-[#F97316] ring-2 ring-[#F97316]/20 shadow-sm' : 'border-[#E7E5E4] hover:border-[#F97316]/40 hover:shadow-xs'}`}
        >
          <div className="flex items-center space-x-1.5 text-[#78716C] mb-1.5"><Users size={15}/> <span className="font-semibold text-xs">Total</span></div>
          <span className="text-2xl font-extrabold text-[#292524]">{members.length}</span>
        </div>
        <div 
          onClick={() => setFilter('Active')}
          className={`bg-[#FFFFFF] p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${filter === 'Active' ? 'border-[#22C55E] ring-2 ring-[#22C55E]/20 shadow-sm' : 'border-[#E7E5E4] hover:border-[#22C55E]/40 hover:shadow-xs'}`}
        >
          <div className="flex items-center space-x-1.5 text-[#22C55E] mb-1.5"><CheckCircle size={15}/> <span className="font-semibold text-xs">Active</span></div>
          <span className="text-2xl font-extrabold text-[#292524]">{members.filter(m => m.status === 'Active').length}</span>
        </div>
        <div 
          onClick={() => setFilter(filter === 'Free Trial' ? 'All' : 'Free Trial')}
          className={`bg-[#FFFFFF] p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${filter === 'Free Trial' ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-sm bg-amber-50/20' : 'border-[#E7E5E4] hover:border-amber-400 hover:shadow-xs'}`}
        >
          <div className="flex items-center space-x-1.5 text-amber-600 mb-1.5"><Sparkles size={15}/> <span className="font-semibold text-xs">Free Trial</span></div>
          <span className="text-2xl font-extrabold text-[#292524]">
            {members.filter(m => m.plan?.toLowerCase().includes('trial') || m.membership?.status === 'Free Trial' || m.membershipHistory?.some((h: any) => (h.planName || '').toLowerCase().includes('trial') || h.status === 'Free Trial' || h.paymentMethod === 'Trial')).length}
          </span>
        </div>
        <div 
          onClick={() => setFilter('Pending')}
          className={`bg-[#FFFFFF] p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${filter === 'Pending' ? 'border-[#F59E0B] ring-2 ring-[#F59E0B]/20 shadow-sm' : 'border-[#E7E5E4] hover:border-[#F59E0B]/40 hover:shadow-xs'}`}
        >
          <div className="flex items-center space-x-1.5 text-[#F59E0B] mb-1.5"><Clock size={15}/> <span className="font-semibold text-xs">Pending</span></div>
          <span className="text-2xl font-extrabold text-[#292524]">{members.filter(m => m.status === 'Pending').length}</span>
        </div>
        <div 
          onClick={() => setFilter('Inactive')}
          className={`bg-[#FFFFFF] p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${filter === 'Inactive' ? 'border-stone-400 ring-2 ring-stone-400/20 shadow-sm' : 'border-[#E7E5E4] hover:border-stone-400 hover:shadow-xs'}`}
        >
          <div className="flex items-center space-x-1.5 text-[#78716C] mb-1.5"><XCircle size={15}/> <span className="font-semibold text-xs">Inactive</span></div>
          <span className="text-2xl font-extrabold text-[#292524]">{members.filter(m => m.status === 'Inactive').length}</span>
        </div>
        <div 
          onClick={() => setFilter('New')}
          className={`bg-[#FFFFFF] p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${filter === 'New' ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-sm' : 'border-[#E7E5E4] hover:border-blue-400 hover:shadow-xs'}`}
        >
          <div className="flex items-center space-x-1.5 text-blue-600 mb-1.5"><UserPlus size={15}/> <span className="font-semibold text-xs">New</span></div>
          <span className="text-2xl font-extrabold text-[#292524]">{members.filter(m => m.customerType === 'NEW_CUSTOMER').length}</span>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col xl:flex-row gap-3 justify-between items-stretch xl:items-center bg-[#FFFFFF] p-3 sm:p-3.5 rounded-2xl border border-[#E7E5E4] shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5 min-w-0">
          {['All', 'Active', 'Free Trial', 'Inactive', 'Pending', 'Rejected', 'Existing', 'New'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                filter === f 
                  ? 'bg-[#F97316] text-white shadow-xs' 
                  : 'bg-[#FFFDF8] border border-[#E7E5E4] text-[#78716C] hover:bg-[#FED7AA]/30 hover:text-[#292524]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full xl:w-72 shrink-0">
          <input 
            type="text" 
            placeholder="Search by name, email or phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl pl-9 pr-4 py-2 text-[#292524] outline-none focus:border-[#F97316] text-xs font-medium placeholder-[#78716C]"
          />
          <Search className="absolute left-3 top-2.5 text-[#78716C]" size={15} />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-[#78716C] whitespace-nowrap min-w-[800px]">
            <thead className="bg-[#FFFDF8] border-b border-[#E7E5E4] text-[#292524]">
              <tr>
                <th className="px-6 py-4 font-semibold text-left">Member</th>
                <th className="px-6 py-4 font-semibold text-left">Contact Details</th>
                <th className="px-6 py-4 font-semibold text-left">Membership</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E5E4]">
              {filteredMembers.map((member, index) => (
                <tr key={`${member.id}-${index}`} className="hover:bg-[#FFFDF8] transition-colors relative">
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[#F97316]/10 text-[#F97316] flex items-center justify-center font-bold text-lg uppercase shrink-0">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[#292524] font-bold capitalize">{member.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="space-y-1">
                      <p className="flex items-center text-xs text-[#292524] font-medium"><Mail size={12} className="mr-1.5 text-[#78716C] shrink-0"/> {member.email}</p>
                      <p className="flex items-center text-xs text-[#292524] font-medium"><Phone size={12} className="mr-1.5 text-[#78716C] shrink-0"/> {member.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="space-y-1.5">
                      {/* Active/Current Plan Badge + History Tag */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {getPlanBadge(member.plan)}
                        {member.membershipHistory && member.membershipHistory.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMember(member);
                            }}
                            className="text-[10px] font-bold bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/25 px-2 py-0.5 rounded-md hover:bg-[#F97316]/20 transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Click to view plan history"
                          >
                            <History size={10} />
                            <span>{member.membershipHistory.length} Plans</span>
                          </button>
                        )}
                      </div>

                      {/* Plan History — separate rows per plan */}
                      {member.membershipHistory && member.membershipHistory.length > 1 && (
                        <div className="space-y-1 mt-1">
                          {member.membershipHistory
                            .slice()
                            .reverse()
                            .map((hist: any, hIdx: number) => (
                              <button
                                key={hIdx}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMember(member);
                                }}
                                className="flex items-center gap-2 text-[10px] bg-[#F8FAFA] px-2 py-1 rounded-lg border border-[#E7E5E4]/70 w-full max-w-fit hover:bg-[#FFFDF8] transition-colors cursor-pointer"
                                title={`${hist.planName || hist.status} (${hist.duration || 'N/A'})${hist.startDate ? ' — ' + new Date(hist.startDate).toLocaleDateString() : ''}`}
                              >
                                <span className="text-[10px] font-bold text-[#899794] shrink-0">
                                  {hIdx + 1}.
                                </span>
                                {getPlanBadge(hist.planName || hist.status || 'Free Trial', true)}
                                {hist.startDate && (
                                  <span className="text-[#78716C] font-medium ml-1">
                                    {new Date(hist.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                                  </span>
                                )}
                              </button>
                            ))}
                        </div>
                      )}
                      <p className="flex items-center text-[11px] text-[#78716C]">
                        <Calendar size={10} className="mr-1 shrink-0"/> Joined: {member.originalUser?.createdAt ? new Date(member.originalUser.createdAt).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' }) : member.joined}
                      </p>
                      {(() => {
                        let expiryRaw = member.membership?.endDate || member.originalUser?.subscriptionExpiry;
                        const isTrial = member.membership?.status === 'Free Trial' || member.plan === 'Free Trial' || member.originalUser?.subscriptionStatus === 'Free Trial' || member.originalUser?.subscriptionStatus === 'FREE_TRIAL';
                        // Fallback: If free trial member has no explicit expiry, calculate 1 day (24 hours) from joined date
                        if (!expiryRaw && isTrial && member.originalUser?.createdAt) {
                          const joinDate = new Date(member.originalUser.createdAt);
                          expiryRaw = new Date(joinDate.getTime() + 24 * 60 * 60 * 1000).toISOString();
                        }
                        if (!expiryRaw) return (
                          <p className="flex items-center text-[11px] text-[#78716C] font-medium mt-0.5">
                            <Calendar size={10} className="mr-1 shrink-0"/> Expiry: N/A
                          </p>
                        );
                        const expiryDate = new Date(expiryRaw);
                        const now = new Date();
                        const hoursLeft = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
                        const isExpired = expiryDate < now;
                        const isSoon = !isExpired && hoursLeft <= 24;
                        return (
                          <p className={`flex items-center gap-1 text-[11px] font-medium mt-0.5 ${isExpired ? 'text-red-500' : isSoon ? 'text-orange-500 font-bold' : 'text-[#78716C]'}`}>
                            <Calendar size={10} className="shrink-0"/>
                            {isExpired ? 'Expired: ' : 'Expires: '}
                            {expiryDate.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            {isSoon && !isExpired && <span className="text-orange-500 font-bold">(Soon!)</span>}
                            {isExpired && <span className="text-red-500 font-bold">(Expired)</span>}
                          </p>
                        );
                      })()}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle text-center">
                    <span className={`px-2.5 py-1 border rounded-lg text-xs font-bold transition-colors inline-block ${getStatusColor(member.status)}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-middle text-right pr-6">
                    <div className="flex justify-end gap-1.5 items-center relative">
                      <button onClick={() => setSelectedMember(member)} className="p-1.5 text-[#78716C] hover:text-[#F97316] hover:bg-[#FFFDF8] rounded-lg transition-colors" title="View Profile">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => handleEditClick(member)} className="p-1.5 text-[#78716C] hover:text-[#F97316] hover:bg-[#FFFDF8] rounded-lg transition-colors" title="Edit Profile">
                        <Edit2 size={18} />
                      </button>

                      <button onClick={() => handleDeleteMember(member.id)} className="p-1.5 text-[#78716C] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Member">
                        <Trash2 size={18} />
                      </button>
                      
                      {/* Status Button */}
                      <button 
                        onClick={(e) => handleToggleStatusDropdown(e, member)} 
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 border ml-1 ${
                          statusDropdown?.memberId === member.id 
                            ? 'bg-[#292524] text-white border-[#292524]' 
                            : 'bg-white text-[#78716C] border-[#FED7AA] hover:bg-[#FFFDF8]'
                        }`} 
                        title="Set Status"
                      >
                        <Activity size={14} className={statusDropdown?.memberId === member.id ? 'text-white' : 'text-[#78716C]'} /> Status
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#78716C]">
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
          <div className="bg-[#FFFFFF] rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-[#E7E5E4] text-center">
            <ShieldCheck size={60} className="mx-auto text-[#F97316] mb-4" />
            <h2 className="text-2xl font-bold text-[#292524] mb-2">Member Limit Reached</h2>
            <p className="text-[#78716C] mb-6">Your current subscription plan limits you to {getMemberLimit(user?.subscriptionPlan)} members. Upgrade your plan to add more members and grow your gym!</p>
            <div className="flex flex-col space-y-3">
              <button onClick={() => navigate('/admin/subscription')} className="w-full py-3 bg-[#F97316] text-white font-bold rounded-xl hover:bg-[#EA580C] transition-colors shadow-lg shadow-[#F97316]/20">
                View Upgrade Options
              </button>
              <button onClick={() => setShowUpgradeModal(false)} className="w-full py-3 bg-[#FFFDF8] text-[#78716C] font-bold rounded-xl hover:bg-[#F1F5F9] transition-colors">
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
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-[#E7E5E4] flex flex-col max-h-[calc(100vh-6rem)] mt-16 sm:mt-20 mb-12 shrink-0">
            <div className="p-6 border-b border-[#E7E5E4] flex justify-between items-center bg-[#FFFDF8] shrink-0">
              <h2 className="text-xl font-bold text-[#292524]">Member Profile</h2>
              <button onClick={() => setSelectedMember(null)} className="text-[#78716C] hover:text-[#292524] transition-colors p-2 hover:bg-gray-100 rounded-lg">
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-[#F97316]/10 text-[#F97316] rounded-2xl flex items-center justify-center text-3xl font-bold border border-[#F97316]/20 uppercase">
                  {selectedMember.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#292524] mb-1 capitalize">{selectedMember.name}</h3>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedMember.status === 'Active' ? 'bg-[#F97316]/10 text-[#F97316]' : 'bg-[#FED7AA]/10 text-[#FED7AA]'}`}>
                      {selectedMember.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedMember.customerType === 'NEW_CUSTOMER' ? 'bg-blue-500/10 text-[#FED7AA]' : 'bg-gray-500/10 text-gray-600'}`}>
                      {selectedMember.customerType === 'NEW_CUSTOMER' ? 'New Customer' : 'Existing Customer'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">Email</p>
                  <p className="font-semibold text-[#292524]">{selectedMember.email}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">Phone</p>
                  <p className="font-semibold text-[#292524]">{selectedMember.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">Membership Plan</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {getPlanBadge(selectedMember.plan)}
                    {selectedMember.membershipHistory && selectedMember.membershipHistory.length > 1 && (
                      <span className="text-xs text-[#F97316] font-semibold bg-[#F97316]/10 px-2 py-0.5 rounded-full border border-[#F97316]/20">
                        {selectedMember.membershipHistory.length} Total Plans
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">Join Date</p>
                  <p className="font-semibold text-[#292524]">{selectedMember.joined}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">Gender</p>
                  <p className="font-semibold text-[#292524]">{selectedMember.gender || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">Expiry Date & Time</p>
                  {(() => {
                    let expiryRaw = selectedMember.membership?.endDate || selectedMember.originalUser?.subscriptionExpiry;
                    const isTrial = selectedMember.membership?.status === 'Free Trial' || selectedMember.plan === 'Free Trial' || selectedMember.originalUser?.subscriptionStatus === 'Free Trial' || selectedMember.originalUser?.subscriptionStatus === 'FREE_TRIAL';
                    if (!expiryRaw && isTrial && selectedMember.originalUser?.createdAt) {
                      const joinDate = new Date(selectedMember.originalUser.createdAt);
                      expiryRaw = new Date(joinDate.getTime() + 24 * 60 * 60 * 1000).toISOString();
                    }
                    if (!expiryRaw) return <p className="font-semibold text-gray-400">Not Set</p>;
                    const expiryDate = new Date(expiryRaw);
                    const now = new Date();
                    const hoursLeft = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
                    const isExpired = expiryDate < now;
                    const isSoon = !isExpired && hoursLeft <= 24;
                    return (
                      <div>
                        <p className={`font-semibold ${ isExpired ? 'text-red-500' : isSoon ? 'text-orange-500' : 'text-[#292524]'}`}>
                          {expiryDate.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {isSoon && !isExpired && <p className="text-xs text-orange-500 font-bold mt-0.5">⚠ Expiring in {Math.round(hoursLeft)}h</p>}
                        {isExpired && <p className="text-xs text-red-500 font-bold mt-0.5">✕ Expired</p>}
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">Last Login</p>
                  <p className="font-semibold text-[#292524]">{selectedMember.originalUser?.lastLogin ? new Date(selectedMember.originalUser.lastLogin).toLocaleString() : 'Never'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">Date of Birth</p>
                  <p className="font-semibold text-[#292524]">{selectedMember.dob || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">City & PIN</p>
                  <p className="font-semibold text-[#292524]">{selectedMember.originalUser?.city || 'Not specified'} - {selectedMember.originalUser?.pinCode || ''}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">Height / Weight</p>
                  <p className="font-semibold text-[#292524]">{selectedMember.originalUser?.height ? `${selectedMember.originalUser.height} cm` : '--'} / {selectedMember.originalUser?.weight ? `${selectedMember.originalUser.weight} kg` : '--'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">Fitness Goal</p>
                  <p className="font-semibold text-[#292524]">{selectedMember.fitnessGoal || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">Experience Level</p>
                  <p className="font-semibold text-[#292524]">{selectedMember.originalUser?.experienceLevel || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">Pref. Training</p>
                  <p className="font-semibold text-[#292524]">{selectedMember.originalUser?.preferredTraining || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">Pref. Workout Time</p>
                  <p className="font-semibold text-[#292524]">{selectedMember.originalUser?.preferredWorkoutTime || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">Assigned Trainer</p>
                  <p className="font-semibold text-[#292524]">{selectedMember.trainer || 'Unassigned'}</p>
                </div>
              </div>

              {/* Membership & Plan History Section */}
              <div className="bg-white p-5 rounded-2xl border border-[#E7E5E4] space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#F97316]/10 text-[#F97316] flex items-center justify-center">
                      <History size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#292524]">Membership & Plan History</h4>
                      <p className="text-[11px] text-[#78716C]">Complete history of Free Trial and paid plans</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20">
                    {selectedMember.membershipHistory?.length || 1} {selectedMember.membershipHistory?.length === 1 ? 'Record' : 'Records'}
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedMember.membershipHistory && selectedMember.membershipHistory.length > 0 ? (
                    selectedMember.membershipHistory.map((item: any, idx: number) => {
                      const isCurrent = idx === 0;
                      const isTrialPlan = (item.planName || item.status || '').toLowerCase().includes('trial');
                      const startDateStr = item.startDate || item.createdAt;
                      const endDateStr = item.endDate;
                      
                      return (
                        <div 
                          key={item._id || idx}
                          className={`p-4 rounded-xl border transition-all ${
                            isCurrent 
                              ? 'bg-[#F8FAFA] border-[#F97316]/30 shadow-xs ring-1 ring-[#F97316]/10' 
                              : 'bg-white border-[#E7E5E4]/80'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                {getPlanBadge(item.planName || item.status || (isTrialPlan ? 'Free Trial' : 'Active Plan'))}
                                {isCurrent && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                                    Current Active Plan
                                  </span>
                                )}
                                {isTrialPlan && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                                    Initial Free Trial
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-[#78716C] flex items-center gap-2 flex-wrap">
                                <span className="flex items-center gap-1 font-medium">
                                  <Clock size={12} className="text-[#899794]" />
                                  Duration: <strong className="text-[#292524]">{item.duration || (isTrialPlan ? '1 Day' : '1 Month')}</strong>
                                </span>
                                <span className="text-gray-300">•</span>
                                <span className="font-medium">
                                  Method: <strong className="text-[#292524]">{item.paymentMethod || (isTrialPlan ? 'Free Trial' : 'Membership')}</strong>
                                </span>
                                {item.finalAmount !== undefined && (
                                  <>
                                    <span className="text-gray-300">•</span>
                                    <span className="font-medium">
                                      Amount: <strong className="text-[#F97316]">₹{Number(item.finalAmount).toFixed(2).replace(/\.00$/, '')}</strong>
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="text-left sm:text-right text-xs shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                              <p className="font-bold text-[#292524]">
                                {startDateStr ? new Date(startDateStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                {endDateStr && ` – ${new Date(endDateStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`}
                              </p>
                              <p className="text-[11px] font-semibold text-[#899794] mt-0.5">
                                Status: <span className={item.status === 'Active' ? 'text-emerald-600' : 'text-[#899794]'}>{item.status || 'Active'}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-[#E7E5E4] text-center text-sm text-[#78716C]">
                      No previous membership records found.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-[#E7E5E4]">
                <p className="text-[#F97316] font-bold mb-4 uppercase text-xs tracking-wider flex items-center gap-2"><Phone size={14}/> Emergency Contact</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-bold text-[#78716C] mb-1">Name</p>
                    <p className="font-semibold text-[#292524]">{selectedMember.emergencyName || 'None provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#78716C] mb-1">Phone</p>
                    <p className="font-semibold text-[#292524]">{selectedMember.emergencyPhone || 'None provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#78716C] mb-1">Relationship</p>
                    <p className="font-semibold text-[#292524]">{selectedMember.emergencyRelation || 'None provided'}</p>
                  </div>
                </div>
              </div>
              
            </div>
            <div className="p-4 bg-[#FFFDF8] border-t border-[#E7E5E4] flex justify-end gap-3 shrink-0">
              <button onClick={() => handleDeleteMember(selectedMember.id)} className="px-6 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors">
                Delete Member
              </button>
              <button onClick={() => setSelectedMember(null)} className="px-6 py-2 bg-[#FFFFFF] border border-[#FED7AA] text-[#292524] rounded-xl font-bold hover:bg-[#F1F5F9] transition-colors">
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editMember && editForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-[#E7E5E4] flex flex-col max-h-[calc(100vh-6rem)] mt-16 sm:mt-20 mb-12 shrink-0">
            <div className="p-6 border-b border-[#E7E5E4] flex justify-between items-center bg-[#FFFDF8] shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#292524]">Edit Member</h2>
                <p className="text-sm text-[#78716C] mt-0.5 capitalize">Editing profile for {editMember.name}</p>
              </div>
              <button onClick={() => setEditMember(null)} className="text-[#78716C] hover:text-[#292524] transition-colors p-2 hover:bg-gray-100 rounded-lg">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleEditSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                
                {/* Personal Info */}
                <div>
                  <p className="text-xs font-bold text-[#F97316] uppercase tracking-wider mb-3 flex items-center gap-2"><User size={14}/> Personal Information</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#78716C] mb-1">Full Name *</label>
                      <input required value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl px-4 py-2.5 outline-none focus:border-[#F97316] text-sm" placeholder="Full Name" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#78716C] mb-1">Email Address *</label>
                      <input required type="email" value={editForm.email || ''} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl px-4 py-2.5 outline-none focus:border-[#F97316] text-sm" placeholder="Email" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#78716C] mb-1">Phone Number *</label>
                      <input required type="tel" value={editForm.phone || ''} onChange={e => { const v = e.target.value.replace(/\D/g,''); if(v.length<=10) setEditForm({...editForm, phone: v}); }} maxLength={10} className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl px-4 py-2.5 outline-none focus:border-[#F97316] text-sm" placeholder="10-digit number" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#78716C] mb-1">Gender</label>
                      <select value={editForm.gender || 'Male'} onChange={e => setEditForm({...editForm, gender: e.target.value})} className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl px-4 py-2.5 outline-none focus:border-[#F97316] text-sm">
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#78716C] mb-1">Date of Birth</label>
                      <input type="date" value={editForm.dob || ''} onChange={e => setEditForm({...editForm, dob: e.target.value})} className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl px-4 py-2.5 outline-none focus:border-[#F97316] text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#78716C] mb-1">Fitness Goal</label>
                      <select value={editForm.fitnessGoal || 'General Fitness'} onChange={e => setEditForm({...editForm, fitnessGoal: e.target.value})} className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl px-4 py-2.5 outline-none focus:border-[#F97316] text-sm">
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
                <div className="border-t border-[#E7E5E4] pt-6">
                  <p className="text-xs font-bold text-[#F97316] uppercase tracking-wider mb-3 flex items-center gap-2"><ShieldCheck size={14}/> Membership</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#78716C] mb-1">Plan</label>
                      <select value={editForm.plan || ''} onChange={e => setEditForm({...editForm, plan: e.target.value})} className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl px-4 py-2.5 outline-none focus:border-[#F97316] text-sm">
                        {mockPlans.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#78716C] mb-1">Status</label>
                      <select value={editForm.status || 'Active'} onChange={e => setEditForm({...editForm, status: e.target.value})} className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl px-4 py-2.5 outline-none focus:border-[#F97316] text-sm">
                        <option>Active</option>
                        <option>Pending</option>
                        <option>Inactive</option>
                        <option>Suspended</option>
                        <option>Rejected</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#78716C] mb-1">Join Date</label>
                      <input type="date" value={editForm.joined || ''} onChange={e => setEditForm({...editForm, joined: e.target.value})} className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl px-4 py-2.5 outline-none focus:border-[#F97316] text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#78716C] mb-1">Assigned Trainer</label>
                      <input value={editForm.trainer || ''} onChange={e => setEditForm({...editForm, trainer: e.target.value})} className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl px-4 py-2.5 outline-none focus:border-[#F97316] text-sm" placeholder="Trainer Name" />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="border-t border-[#E7E5E4] pt-6">
                  <p className="text-xs font-bold text-[#F97316] uppercase tracking-wider mb-3 flex items-center gap-2"><Phone size={14}/> Emergency Contact</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#78716C] mb-1">Name</label>
                      <input value={editForm.emergencyName || ''} onChange={e => setEditForm({...editForm, emergencyName: e.target.value})} className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl px-4 py-2.5 outline-none focus:border-[#F97316] text-sm" placeholder="Contact Name" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#78716C] mb-1">Phone</label>
                      <input type="tel" value={editForm.emergencyPhone || ''} onChange={e => { const v = e.target.value.replace(/\D/g,''); if(v.length<=10) setEditForm({...editForm, emergencyPhone: v}); }} maxLength={10} className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl px-4 py-2.5 outline-none focus:border-[#F97316] text-sm" placeholder="Phone" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#78716C] mb-1">Relationship</label>
                      <input value={editForm.emergencyRelation || ''} onChange={e => setEditForm({...editForm, emergencyRelation: e.target.value})} className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl px-4 py-2.5 outline-none focus:border-[#F97316] text-sm" placeholder="e.g. Parent" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#FFFDF8] border-t border-[#E7E5E4] flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setEditMember(null)} className="px-6 py-2 bg-[#FFFFFF] border border-[#FED7AA] text-[#78716C] rounded-xl font-bold hover:bg-[#F1F5F9] transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-8 py-2 bg-[#F97316] text-white rounded-xl font-bold hover:bg-[#EA580C] transition-colors shadow-lg shadow-[#F97316]/20 flex items-center gap-2">
                  <Edit2 size={16}/> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Status Dropdown Menu via Portal */}
      {statusDropdown && createPortal(
        <>
          <div 
            className="fixed inset-0 z-[9998] bg-transparent" 
            onClick={() => setStatusDropdown(null)} 
          />
          <div 
            className="fixed w-48 rounded-xl shadow-2xl bg-white border border-[#E7E5E4] z-[9999] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100"
            style={{
              ...(statusDropdown.top !== undefined ? { top: `${statusDropdown.top}px` } : {}),
              ...(statusDropdown.bottom !== undefined ? { bottom: `${statusDropdown.bottom}px` } : {}),
              right: `${statusDropdown.right}px`,
              maxHeight: statusDropdown.maxHeight ? `${statusDropdown.maxHeight}px` : undefined,
            }}
          >
            <div className="px-3.5 py-2 bg-[#FFFDF8] border-b border-[#E7E5E4] flex items-center justify-between shrink-0">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider">Set Status</span>
              <span className="text-[10px] font-semibold text-[#F97316] bg-[#F97316]/10 px-1.5 py-0.5 rounded">
                {statusDropdown.memberStatus}
              </span>
            </div>
            <div className="p-1.5 flex flex-col gap-0.5 overflow-y-auto">
              {['Active', 'Inactive', 'Pending', 'Rejected', 'New', 'Existing'].map((status) => {
                const isCurrent = statusDropdown.memberStatus === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => {
                      handleStatusChange(statusDropdown.memberId, status);
                      setStatusDropdown(null);
                    }}
                    className={`block w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-between ${
                      isCurrent ? 'text-[#F97316] bg-[#FFFDF8] font-bold' : 'text-[#292524] hover:bg-[#FFFDF8]'
                    }`}
                  >
                    <span>{status}</span>
                    {isCurrent && <Check size={13} className="text-[#F97316]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default GymAdminMembers;
