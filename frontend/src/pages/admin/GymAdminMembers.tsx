import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ShieldCheck, Mail, Phone, Eye, Edit2, User, Trash2, Calendar, Activity, CheckCircle, Clock, XCircle, UserPlus, Users, Download, Check, History, Sparkles, X } from 'lucide-react';
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
  let bgClass = 'bg-[#FFFFFF] text-[#EA580C] border border-[#FFEDD5]';
  let iconColor = 'text-[#EA580C]';
  let label = planName || 'Starter';

  if (p.includes('starter')) {
    bgClass = 'bg-[#FFFFFF] text-[#EA580C] border border-[#FFEDD5] shadow-xs';
    iconColor = 'text-[#EA580C]';
    label = 'Starter';
  } else if (p.includes('professional') || p.includes('pro')) {
    bgClass = 'bg-[#C2410C] text-white border border-[#FDBA74] shadow-xs';
    iconColor = 'text-white';
    label = 'Professional';
  } else if (p.includes('enterprise')) {
    bgClass = 'bg-[#F8FAFC] text-[#111827] border border-[#FDBA74] shadow-xs';
    iconColor = 'text-[#EA580C]';
    label = 'Enterprise';
  } else if (p.includes('trial')) {
    bgClass = 'bg-amber-500/15 text-[#B45309] border border-amber-500/30 shadow-xs';
    iconColor = 'text-[#B45309]';
    label = 'Free Trial';
  } else if (p.includes('silver')) {
    bgClass = 'bg-[#FFFFFF] text-[#111827] border border-slate-600 shadow-xs';
    iconColor = 'text-[#64748B]';
    label = 'Silver';
  } else if (p.includes('gold')) {
    bgClass = 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs';
    iconColor = 'text-[#B45309]';
    label = 'Gold';
  } else if (p.includes('platinum') || p.includes('premium')) {
    bgClass = 'bg-[#F8FAFC] text-white border border-[#FDBA74] shadow-xs';
    iconColor = 'text-[#EA580C]';
    label = planName;
  } else if (p.includes('basic')) {
    bgClass = 'bg-[#FFFFFF] text-[#EA580C] border border-[#E2E8F0]';
    iconColor = 'text-[#EA580C]';
    label = planName;
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-lg font-bold inline-flex items-center gap-1 ${isSmall ? 'text-[10px]' : 'text-xs'} ${bgClass}`}>
      <ShieldCheck size={isSmall ? 10 : 12} className={iconColor} />
      {label}
    </span>
  );
};

const GymAdminMembers = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  
  useEffect(() => {
    fetchMembers();
  }, [user?.branchId]);

  const fetchMembers = async () => {
    try {
      const branchParam = user?.branchId ? `?branchId=${user.branchId}` : '';
      const userBranchParam = user?.branchId ? `&branchId=${user.branchId}` : '';
      const [usersRes, membershipsRes, trainersRes] = await Promise.all([
        api.get(`/users?role=MEMBER${userBranchParam}`),
        api.get(`/memberships/gym${branchParam}`).catch(() => ({ data: { memberships: [] } })),
        api.get('/trainers').catch(() => ({ data: { trainers: [] } })),
      ]);
      if (trainersRes.data?.trainers) {
        setTrainers(trainersRes.data.trainers.filter((t: any) => t.status === 'Active' || t.status === 'Pending'));
      }
      if (usersRes.data.success) {
        // Build maps: latest membership and full membership history per user
        const membershipMap: Record<string, any> = {};
        const allMembershipsMap: Record<string, any[]> = {};

        for (const m of (membershipsRes.data.memberships || [])) {
          const uid = (m.userId?._id ?? m.userId)?.toString?.() ?? String(m.userId);
          if (uid) {
            if (!allMembershipsMap[uid]) allMembershipsMap[uid] = [];
            allMembershipsMap[uid].push(m);
            // Prioritize active or completed membership
            if (!membershipMap[uid] || m.status === 'ACTIVE' || m.status === 'Active' || m.status === 'Free Trial') {
              membershipMap[uid] = m;
            }
          }
        }

        const mapped = usersRes.data.users.map((u: any) => {
          const userId = u._id?.toString?.() ?? String(u._id);
          const membership = membershipMap[userId] || null;
          const rawHistory = allMembershipsMap[userId] || [];

          // Filter out unpaid/pending plan attempts to show only genuine records (Bug 5)
          const genuineHistory = rawHistory.filter((m: any) => {
            const isTrial = (m.planName || '').toLowerCase().includes('trial') || m.status === 'Free Trial' || m.paymentMethod === 'Trial' || m.paymentMethod === 'Free Trial';
            const isCompleted = m.status === 'ACTIVE' || m.status === 'Active' || m.status === 'EXPIRED' || m.status === 'Expired' ||
              m.paymentStatus === 'Completed' || m.paymentStatus === 'Approved' || m.paymentId?.status === 'Approved' ||
              (m.finalAmount === 0 && !String(m.status).toLowerCase().includes('pending'));
            
            if (m.status === 'PENDING_APPROVAL' || m.status === 'Pending' || m.paymentStatus === 'Pending' || m.paymentStatus === 'Unpaid') {
              return false;
            }
            return isTrial || isCompleted;
          });

          // Deduplicate records to avoid duplicate entries (Bug 5)
          const seenPlans = new Set<string>();
          const dedupedHistory: any[] = [];
          for (const item of genuineHistory) {
            const key = `${item.planName || ''}-${new Date(item.startDate || item.createdAt || 0).toDateString()}-${item.finalAmount || 0}`;
            if (!seenPlans.has(key)) {
              seenPlans.add(key);
              dedupedHistory.push(item);
            }
          }
          let membershipHistory = dedupedHistory;

          // Sort history newest first
          membershipHistory.sort((a, b) => new Date(b.createdAt || b.startDate || 0).getTime() - new Date(a.createdAt || a.startDate || 0).getTime());

          if (membershipHistory.length === 0) {
            const isTrial = (u.subscriptionPlan || u.subscriptionStatus || '').toLowerCase().includes('trial');
            membershipHistory = [{
              _id: 'default-' + userId,
              planName: u.subscriptionPlan || (isTrial ? 'Free Trial' : 'Starter'),
              status: u.subscriptionStatus || (isTrial ? 'Free Trial' : 'Active'),
              duration: isTrial ? '1 Day' : '1 Month',
              startDate: u.createdAt,
              endDate: u.subscriptionExpiry || (isTrial ? new Date(new Date(u.createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString() : new Date(new Date(u.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()),
              paymentMethod: isTrial ? 'Free Trial' : 'Membership',
              finalAmount: isTrial ? 0 : undefined,
            }];
          }

          // If user had Free Trial originally, ensure it is represented in history
          const hasTrial = membershipHistory.some((h: any) => (h.planName || '').toLowerCase().includes('trial') || h.status === 'Free Trial' || h.paymentMethod === 'Trial');
          if (!hasTrial && u.subscriptionStatus === 'Free Trial') {
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
            plan: u.subscriptionPlan || membership?.planName || 'Starter',
            status: u.statusDetail || (
                    u.approvalStatus === 'PENDING' ? 'Pending' :
                    u.approvalStatus === 'APPROVED' ? 'Active' :
                    u.approvalStatus === 'REJECTED' ? 'Rejected' :
                    u.approvalStatus === 'INACTIVE' ? 'Inactive' :
                    u.approvalStatus === 'SUSPENDED' ? 'Inactive' : 'Inactive'),
            joined: new Date(u.createdAt).toISOString().split('T')[0],
            customerType: u.customerType,
            gender: u.gender,
            dob: u.dateOfBirth,
            fitnessGoal: u.fitnessGoal,
            assignedTrainer: u.assignedTrainer?._id || u.assignedTrainer || '',
            trainer: u.assignedTrainer?.name || '',
            emergencyName: u.emergencyContact?.name,
            emergencyPhone: u.emergencyContact?.mobile,
            emergencyRelation: u.emergencyContact?.relationship,
            height: u.height,
            weight: u.weight,
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
    top: number;
    right: number;
    maxHeight?: number;
  } | null>(null);
  const [editMember, setEditMember] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [membershipPopupMember, setMembershipPopupMember] = useState<any | null>(null);

  const getMemberExpiryDateRaw = (member: any): string => {
    let expiryRaw = member?.membership?.endDate || member?.originalUser?.subscriptionExpiry || member?.originalUser?.subscriptionExpiryDate;
    if (!expiryRaw && (member?.membershipHistory || []).length > 0) {
      const latest = member.membershipHistory.find((h: any) => h.endDate);
      if (latest?.endDate) expiryRaw = latest.endDate;
    }
    if (!expiryRaw && member?.originalUser?.createdAt) {
      const joinDate = new Date(member.originalUser.createdAt);
      const isTrial = member.membership?.status === 'Free Trial' || member.plan === 'Free Trial' ||
        member.originalUser?.subscriptionStatus === 'Free Trial' || member.originalUser?.subscriptionStatus === 'FREE_TRIAL';
      const exp = new Date(joinDate);
      if (isTrial) {
        exp.setDate(exp.getDate() + 1);
      } else {
        exp.setMonth(exp.getMonth() + 1);
      }
      expiryRaw = exp.toISOString();
    }
    return expiryRaw || '';
  };

  const getMemberExpiryDisplay = (member: any): string => {
    const raw = getMemberExpiryDateRaw(member);
    if (!raw) return 'Up to: N/A';
    const d = new Date(raw);
    if (isNaN(d.getTime())) return 'Up to: N/A';
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `Up to: ${day} ${month} ${year}`;
  };

  const formatDateDisplay = (dateVal: any): string => {
    if (!dateVal) return 'N/A';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return 'N/A';
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Close dropdown on window scroll or resize (ignoring scroll inside the dropdown)
  useEffect(() => {
    if (!statusDropdown) return;
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest?.('.status-dropdown-menu')) return;
      setStatusDropdown(null);
    };
    const handleResize = () => setStatusDropdown(null);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [statusDropdown]);

  const handleToggleStatusDropdown = (e: React.MouseEvent<HTMLButtonElement>, member: any) => {
    e.stopPropagation();
    if (statusDropdown?.memberId === member.id) {
      setStatusDropdown(null);
      return;
    }

    let rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;

    // Ensure the menu always opens DOWNWARDS below the button ("come down")
    // If the button is close to the bottom of the viewport, scroll window down so dropdown has ample room
    if (spaceBelow < 260) {
      const needed = 260 - spaceBelow + 24;
      window.scrollBy({ top: needed, behavior: 'instant' });
      rect = e.currentTarget.getBoundingClientRect();
    }

    const right = Math.max(12, window.innerWidth - rect.right);
    const top = rect.bottom + 6;
    const availableBelow = Math.max(180, window.innerHeight - top - 12);

    setStatusDropdown({
      memberId: member.id,
      memberStatus: member.status,
      top,
      right,
      maxHeight: Math.min(availableBelow, 280),
    });
  };
  
  const navigate = useNavigate();

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

  const handleDeleteMember = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      const targetMember = members.find(m => m.id === id || (m as any)._id === id);
      try {
        await api.delete(`/users/${id}`);
      } catch (err) {
        console.error('Failed to delete member from server:', err);
      }
      deleteItem('members', id);
      if (targetMember) {
        addItem('deletedMembers', {
          ...targetMember,
          deletedAt: new Date().toISOString(),
          reason: 'Deleted by gym owner'
        });
      }
      setMembers(members.filter(m => m.id !== id && (m as any)._id !== id));
      setStatusDropdown(null);
      if (selectedMember?.id === id || (selectedMember as any)?._id === id) {
        setSelectedMember(null);
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    let apiStatus = 'PENDING';
    if (newStatus === 'Active' || newStatus === 'Existing') apiStatus = 'APPROVED';
    else if (newStatus === 'Inactive') apiStatus = 'INACTIVE';
    else if (newStatus === 'Rejected') apiStatus = 'REJECTED';
    else if (newStatus === 'Pending' || newStatus === 'New') apiStatus = 'PENDING';

    try {
      const res = await api.put(`/users/${id}/status`, { status: apiStatus, statusDetail: newStatus });
      if (res.data?.success) {
        setMembers(members.map(m => m.id === id ? { ...m, status: newStatus, originalUser: { ...m.originalUser, statusDetail: newStatus, approvalStatus: apiStatus } } : m));
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to update member status.';
      alert(`Failed to update member status: ${msg}`);
    } finally {
      setStatusDropdown(null);
    }
  };

  const handleEditClick = (member: any) => {
    setEditMember(member);
    setEditForm({ ...member });
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editForm.phone && !/^[6-9]\d{9}$/.test(editForm.phone)) {
      alert('Phone number must be exactly 10 digits and start with 6, 7, 8, or 9');
      return;
    }
    if (editForm.emergencyPhone && !/^[6-9]\d{9}$/.test(editForm.emergencyPhone)) {
      alert('Emergency contact phone must be exactly 10 digits and start with 6, 7, 8, or 9');
      return;
    }
    try {
      const nameParts = (editForm.name || '').trim().split(/\s+/);
      const firstName = nameParts[0] || editForm.originalUser?.firstName || 'Member';
      const lastName = nameParts.slice(1).join(' ') || editForm.originalUser?.lastName || '-';
      const res = await api.put(`/users/${editForm.id}`, {
        firstName,
        lastName,
        email: editForm.email,
        mobile: editForm.phone,
        gender: editForm.gender,
        fitnessGoal: editForm.fitnessGoal,
        assignedTrainer: editForm.assignedTrainer || null,
      });
      if (res.data?.success) {
        const selectedTrainer = trainers.find((t: any) => t._id === editForm.assignedTrainer);
        const trainerName = res.data.user?.assignedTrainer?.name || selectedTrainer?.name || '';
        const updatedMember = {
          ...editForm,
          trainer: trainerName,
          assignedTrainer: editForm.assignedTrainer || '',
        };
        updateItem('members', editForm.id, updatedMember);
        setMembers(members.map(m => m.id === editForm.id ? updatedMember : m));
        setEditMember(null);
        setEditForm(null);
      }
    } catch (err: any) {
      console.error('Failed to update member:', err);
      alert(err.response?.data?.message || 'Failed to save member changes.');
    }
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
      case 'Active': return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200 font-bold';
      case 'Inactive':
      case 'Expired':
      case 'Suspended': return 'bg-gray-100 text-gray-700 border-gray-300 font-bold';
      case 'Rejected': return 'bg-red-50 text-red-700 border-red-200 font-bold';
      case 'New': return 'bg-blue-50 text-blue-700 border-blue-200 font-bold';
      case 'Existing': return 'bg-[#FFF7ED] text-[#EA580C] border-[#FFEDD5] font-bold';
      default: return 'bg-gray-100 text-gray-700 border-gray-300 font-bold';
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
          <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">Members</h1>
          <p className="text-sm text-[#64748B] mt-1">Manage your gym members, subscriptions, and profiles.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
          <button 
            onClick={handleDownloadPDF}
            className="px-3.5 py-2.5 bg-[#FFFFFF] text-[#EA580C] font-bold rounded-xl border border-[#E2E8F0] hover:border-[#FDBA74] hover:bg-[#FFF7ED] transition-all flex items-center gap-2 cursor-pointer shadow-xs text-xs sm:text-sm active:scale-95"
            title="Export Members Directory"
          >
            <Download size={16} /> Download PDF
          </button>
          <button 
            onClick={handleAddMemberClick}
            className="px-4 py-2.5 bg-[#C2410C] text-white font-bold font-bold rounded-xl hover:bg-[#9A3412] transition-all flex items-center gap-2 shadow-md shadow-orange-500/15 text-xs sm:text-sm active:scale-95 shrink-0 cursor-pointer"
          >
            <Plus size={18} /> Add Member
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div 
          onClick={() => setFilter('All')}
          className={`bg-[#FFFFFF] p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${filter === 'All' ? 'border-[#FDBA74] ring-2 ring-[#F97316]/25 shadow-md shadow-orange-500/15' : 'border-[#E2E8F0] hover:border-[#FFEDD5]'}`}
        >
          <div className="flex items-center space-x-1.5 text-[#64748B] mb-1.5"><Users size={15}/> <span className="font-semibold text-xs">Total</span></div>
          <span className="text-2xl font-extrabold text-[#111827]">{members.length}</span>
        </div>
        <div 
          onClick={() => setFilter('Active')}
          className={`bg-[#FFFFFF] p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${filter === 'Active' ? 'border-[#E2E8F0] ring-2 ring-emerald-500/25 shadow-md shadow-emerald-500/15' : 'border-[#E2E8F0] hover:border-[#E2E8F0]/40'}`}
        >
          <div className="flex items-center space-x-1.5 text-[#15803D] mb-1.5"><CheckCircle size={15}/> <span className="font-semibold text-xs">Active</span></div>
          <span className="text-2xl font-extrabold text-[#111827]">{members.filter(m => m.status === 'Active').length}</span>
        </div>
        <div 
          onClick={() => setFilter(filter === 'Free Trial' ? 'All' : 'Free Trial')}
          className={`bg-[#FFFFFF] p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${filter === 'Free Trial' ? 'border-amber-500 ring-2 ring-amber-500/25 shadow-md shadow-amber-500/15' : 'border-[#E2E8F0] hover:border-amber-400'}`}
        >
          <div className="flex items-center space-x-1.5 text-[#B45309] mb-1.5"><Sparkles size={15}/> <span className="font-semibold text-xs">Free Trial</span></div>
          <span className="text-2xl font-extrabold text-[#111827]">
            {members.filter(m => m.plan?.toLowerCase().includes('trial') || m.membership?.status === 'Free Trial' || m.membershipHistory?.some((h: any) => (h.planName || '').toLowerCase().includes('trial') || h.status === 'Free Trial' || h.paymentMethod === 'Trial')).length}
          </span>
        </div>
        <div 
          onClick={() => setFilter('Pending')}
          className={`bg-[#FFFFFF] p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${filter === 'Pending' ? 'border-amber-500 ring-2 ring-amber-500/25 shadow-md shadow-amber-500/15' : 'border-[#E2E8F0] hover:border-amber-400'}`}
        >
          <div className="flex items-center space-x-1.5 text-[#B45309] mb-1.5"><Clock size={15}/> <span className="font-semibold text-xs">Pending</span></div>
          <span className="text-2xl font-extrabold text-[#111827]">{members.filter(m => m.status === 'Pending').length}</span>
        </div>
        <div 
          onClick={() => setFilter('Inactive')}
          className={`bg-[#FFFFFF] p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${filter === 'Inactive' ? 'border-slate-500 ring-2 ring-slate-500/25 shadow-md' : 'border-[#E2E8F0] hover:border-slate-500'}`}
        >
          <div className="flex items-center space-x-1.5 text-[#64748B] mb-1.5"><XCircle size={15}/> <span className="font-semibold text-xs">Inactive</span></div>
          <span className="text-2xl font-extrabold text-[#111827]">{members.filter(m => m.status === 'Inactive').length}</span>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col xl:flex-row gap-3 justify-between items-stretch xl:items-center bg-[#FFFFFF] p-3 sm:p-3.5 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5 min-w-0">
          {['All', 'Active', 'Free Trial', 'Inactive', 'Pending', 'Rejected'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                filter === f 
                  ? 'bg-[#C2410C] text-white shadow-md shadow-orange-500/15' 
                  : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#111827] hover:border-[#FFEDD5]'
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
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2 text-[#111827] outline-none focus:border-[#FDBA74] text-xs font-medium placeholder-[#94A3B8]"
          />
          <Search className="absolute left-3 top-2.5 text-[#64748B]" size={15} />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-[#64748B] whitespace-nowrap min-w-[800px]">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B]">
              <tr>
                <th className="px-4 py-4 font-semibold text-center w-16">S.No</th>
                <th className="px-6 py-4 font-semibold text-left">Member</th>
                <th className="px-6 py-4 font-semibold text-left">Contact Details</th>
                <th className="px-6 py-4 font-semibold text-left">Membership</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredMembers.map((member, index) => (
                <tr key={`${member.id}-${index}`} className="hover:bg-[#FFF7ED] transition-colors relative">
                  <td className="px-4 py-4 align-middle text-center font-medium text-xs text-[#64748B] w-16">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5] flex items-center justify-center font-bold text-lg uppercase shrink-0">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[#111827] font-bold capitalize">{member.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="space-y-1">
                      <p className="flex items-center text-xs text-[#111827] font-medium"><Mail size={12} className="mr-1.5 text-[#64748B] shrink-0"/> {member.email}</p>
                      <p className="flex items-center text-xs text-[#111827] font-medium"><Phone size={12} className="mr-1.5 text-[#64748B] shrink-0"/> {member.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMembershipPopupMember(member);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF7ED] hover:bg-[#FFEDD5] text-[#C2410C] border border-[#FFEDD5] font-bold text-xs transition-all shadow-xs cursor-pointer hover:scale-105 active:scale-95 whitespace-nowrap"
                      title="Click to view full membership details"
                    >
                      <Calendar size={13} className="text-[#EA580C]" />
                      <span>{getMemberExpiryDisplay(member)}</span>
                    </button>
                  </td>
                  <td className="px-6 py-4 align-top text-center">
                    <span className={`px-2.5 py-1 border rounded-lg text-xs font-bold transition-colors inline-block ${getStatusColor(member.status)}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top text-right pr-6">
                    <div className="flex justify-end gap-1.5 items-center relative">
                      <button onClick={() => setSelectedMember(member)} className="p-1.5 text-[#64748B] hover:text-[#EA580C] hover:bg-[#FFF7ED] rounded-lg transition-colors cursor-pointer" title="View Profile">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => handleEditClick(member)} className="p-1.5 text-[#64748B] hover:text-[#EA580C] hover:bg-[#FFF7ED] rounded-lg transition-colors cursor-pointer" title="Edit Profile">
                        <Edit2 size={18} />
                      </button>

                      <button onClick={() => handleDeleteMember(member.id)} className="p-1.5 text-[#64748B] hover:text-[#B91C1C] hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete Member">
                        <Trash2 size={18} />
                      </button>
                      
                      {/* Status Button */}
                      <button 
                        onClick={(e) => handleToggleStatusDropdown(e, member)} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ml-1 shrink-0 whitespace-nowrap shadow-xs cursor-pointer ${
                          statusDropdown?.memberId === member.id 
                            ? 'bg-[#FFF7ED] text-[#EA580C] border-[#FFEDD5]' 
                            : 'bg-[#FFFFFF] text-[#475569] border-[#CBD5E1] hover:bg-[#FFF7ED] hover:text-[#EA580C] hover:border-[#FFEDD5]'
                        }`} 
                        title="Set Status"
                      >
                        <Activity size={14} className={statusDropdown?.memberId === member.id ? 'text-[#EA580C]' : 'text-[#64748B]'} />
                        <span>Status</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#64748B]">
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
          <div className="bg-[#FFFFFF] rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-[#E2E8F0] text-center">
            <ShieldCheck size={60} className="mx-auto text-[#EA580C] mb-4" />
            <h2 className="text-2xl font-bold text-[#111827] mb-2">Member Limit Reached</h2>
            <p className="text-[#64748B] mb-6">Your current subscription plan limits you to {getMemberLimit(user?.subscriptionPlan)} members. Upgrade your plan to add more members and grow your gym!</p>
            <div className="flex flex-col space-y-3">
              <button onClick={() => navigate('/admin/subscription')} className="w-full py-3 bg-[#C2410C] text-white font-bold font-bold rounded-xl hover:bg-[#9A3412] transition-colors shadow-lg shadow-orange-500/15">
                View Upgrade Options
              </button>
              <button onClick={() => setShowUpgradeModal(false)} className="w-full py-3 bg-[#F8FAFC] text-[#64748B] font-bold rounded-xl hover:bg-[#FFF7ED] transition-colors">
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
          <div className="bg-[#FFFFFF] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-[#E2E8F0] flex flex-col max-h-[calc(100vh-6rem)] mt-16 sm:mt-20 mb-12 shrink-0">
            <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC] shrink-0">
              <h2 className="text-xl font-bold text-[#111827]">Member Profile</h2>
              <button onClick={() => setSelectedMember(null)} className="text-[#64748B] hover:text-[#C2410C] transition-colors p-2 hover:bg-[#FFF7ED] rounded-lg">
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-[#FFF7ED] text-[#EA580C] rounded-2xl flex items-center justify-center text-3xl font-bold border border-[#FFEDD5] uppercase">
                  {selectedMember.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#111827] mb-1 capitalize">{selectedMember.name}</h3>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${selectedMember.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : selectedMember.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-100 text-gray-700 border-gray-300'}`}>
                      {selectedMember.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedMember.customerType === 'NEW_CUSTOMER' ? 'bg-[#F8FAFC] text-[#EA580C]' : 'bg-gray-500/10 text-[#111827]'}`}>
                      {selectedMember.customerType === 'NEW_CUSTOMER' ? 'New Customer' : 'Existing Customer'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#F8FAFC] p-6 rounded-2xl border border-[#E2E8F0]">
                <div>
                  <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Email</p>
                  <p className="font-semibold text-[#111827]">{selectedMember.email}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Phone</p>
                  <p className="font-semibold text-[#111827]">{selectedMember.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Membership Plan</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {getPlanBadge(selectedMember.plan)}
                    {selectedMember.membershipHistory && selectedMember.membershipHistory.length > 1 && (
                      <span className="text-xs text-[#EA580C] font-semibold bg-[#FFF7ED] px-2 py-0.5 rounded-full border border-[#FFEDD5]">
                        {selectedMember.membershipHistory.length} Total Plans
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Join Date</p>
                  <p className="font-semibold text-[#111827]">{selectedMember.joined}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Gender</p>
                  <p className="font-semibold text-[#111827]">{selectedMember.gender || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Expiry Date & Time</p>
                  {(() => {
                    let expiryRaw = selectedMember.membership?.endDate || selectedMember.originalUser?.subscriptionExpiry;
                    const isTrial = selectedMember.membership?.status === 'Free Trial' || selectedMember.plan === 'Free Trial' || selectedMember.originalUser?.subscriptionStatus === 'Free Trial' || selectedMember.originalUser?.subscriptionStatus === 'FREE_TRIAL';
                    if (!expiryRaw && isTrial && selectedMember.originalUser?.createdAt) {
                      const joinDate = new Date(selectedMember.originalUser.createdAt);
                      expiryRaw = new Date(joinDate.getTime() + 24 * 60 * 60 * 1000).toISOString();
                    }
                    if (!expiryRaw) return <p className="font-semibold text-[#64748B]">Not Set</p>;
                    const expiryDate = new Date(expiryRaw);
                    const now = new Date();
                    const hoursLeft = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
                    const isExpired = expiryDate < now;
                    const isSoon = !isExpired && hoursLeft <= 24;
                    return (
                      <div>
                        <p className={`font-semibold ${ isExpired ? 'text-red-500' : isSoon ? 'text-[#EA580C]' : 'text-[#111827]'}`}>
                          {expiryDate.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {isSoon && !isExpired && <p className="text-xs text-[#EA580C] font-bold mt-0.5">⚠ Expiring in {Math.round(hoursLeft)}h</p>}
                        {isExpired && <p className="text-xs text-red-500 font-bold mt-0.5">✕ Expired</p>}
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Last Login</p>
                  <p className="font-semibold text-[#111827]">{selectedMember.originalUser?.lastLogin ? new Date(selectedMember.originalUser.lastLogin).toLocaleString() : 'Never'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Date of Birth</p>
                  <p className="font-semibold text-[#111827]">{selectedMember.dob || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">City & PIN</p>
                  <p className="font-semibold text-[#111827]">{selectedMember.originalUser?.city || 'Not specified'} - {selectedMember.originalUser?.pinCode || ''}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Height / Weight</p>
                  <p className="font-semibold text-[#111827]">
                    {(selectedMember.originalUser?.height || selectedMember.height) ? `${selectedMember.originalUser?.height || selectedMember.height} cm` : '--'} / {(selectedMember.originalUser?.weight || selectedMember.weight) ? `${selectedMember.originalUser?.weight || selectedMember.weight} kg` : '--'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Fitness Goal</p>
                  <p className="font-semibold text-[#111827]">{selectedMember.fitnessGoal || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Experience Level</p>
                  <p className="font-semibold text-[#111827]">{selectedMember.originalUser?.experienceLevel || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Pref. Training</p>
                  <p className="font-semibold text-[#111827]">{selectedMember.originalUser?.preferredTraining || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Pref. Workout Time</p>
                  <p className="font-semibold text-[#111827]">{selectedMember.originalUser?.preferredWorkoutTime || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Assigned Trainer</p>
                  <p className="font-semibold text-[#111827]">{selectedMember.trainer || 'Unassigned'}</p>
                </div>
              </div>

              {/* Membership & Plan History Section */}
              <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center">
                      <History size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#111827]">Membership & Plan History</h4>
                      <p className="text-[11px] text-[#64748B]">Complete history of Free Trial and paid plans</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]">
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
                              ? 'bg-[#F8FAFC] border-[#FFEDD5] shadow-xs ring-1 ring-[#F97316]/10' 
                              : 'bg-[#FFFFFF] border-[#E2E8F0]/80'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                {getPlanBadge(item.planName || item.status || (isTrialPlan ? 'Free Trial' : 'Active Plan'))}
                                {isCurrent && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F8FAFC] text-[#EA580C] border border-[#E2E8F0]">
                                    Current Active Plan
                                  </span>
                                )}
                                {isTrialPlan && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                                    Initial Free Trial
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-[#64748B] flex items-center gap-2 flex-wrap">
                                <span className="flex items-center gap-1 font-medium">
                                  <Clock size={12} className="text-[#64748B]" />
                                  Duration: <strong className="text-[#111827]">{item.duration || (isTrialPlan ? '1 Day' : '1 Month')}</strong>
                                </span>
                                <span className="text-[#64748B]">•</span>
                                <span className="font-medium">
                                  Method: <strong className="text-[#111827]">{item.paymentMethod || (isTrialPlan ? 'Free Trial' : 'Membership')}</strong>
                                </span>
                                {item.finalAmount !== undefined && (
                                  <>
                                    <span className="text-[#64748B]">•</span>
                                    <span className="font-medium">
                                      Amount: <strong className="text-[#EA580C]">₹{Number(item.finalAmount).toFixed(2).replace(/\.00$/, '')}</strong>
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="text-left sm:text-right text-xs shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E2E8F0]">
                              <p className="font-bold text-[#111827]">
                                {startDateStr ? new Date(startDateStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                {endDateStr && ` – ${new Date(endDateStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`}
                              </p>
                              <p className="text-[11px] font-semibold text-[#64748B] mt-0.5">
                                Status: <span className={item.status === 'Active' || !item.status ? 'text-emerald-700 font-bold' : item.status === 'Pending' ? 'text-amber-700 font-bold' : item.status === 'Rejected' ? 'text-red-700 font-bold' : 'text-gray-700 font-bold'}>{item.status || 'Active'}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-[#E2E8F0] text-center text-sm text-[#64748B]">
                      No previous membership records found.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-[#E2E8F0]">
                <p className="text-[#EA580C] font-bold mb-4 uppercase text-xs tracking-wider flex items-center gap-2"><Phone size={14}/> Emergency Contact</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-bold text-[#64748B] mb-1">Name</p>
                    <p className="font-semibold text-[#111827]">{selectedMember.emergencyName || 'None provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#64748B] mb-1">Phone</p>
                    <p className="font-semibold text-[#111827]">{selectedMember.emergencyPhone || 'None provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#64748B] mb-1">Relationship</p>
                    <p className="font-semibold text-[#111827]">{selectedMember.emergencyRelation || 'None provided'}</p>
                  </div>
                </div>
              </div>
              
            </div>
            <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex justify-end gap-3 shrink-0">
              <button onClick={() => handleDeleteMember(selectedMember.id)} className="px-6 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors">
                Delete Member
              </button>
              <button onClick={() => setSelectedMember(null)} className="px-6 py-2 bg-[#FFFFFF] border border-[#F8FAFC] text-[#111827] rounded-xl font-bold hover:bg-[#FFF7ED] transition-colors">
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editMember && editForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-[#E2E8F0] flex flex-col max-h-[calc(100vh-6rem)] mt-16 sm:mt-20 mb-12 shrink-0">
            <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC] shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#111827]">Edit Member</h2>
                <p className="text-sm text-[#64748B] mt-0.5 capitalize">Editing profile for {editMember.name}</p>
              </div>
              <button onClick={() => setEditMember(null)} className="text-[#64748B] hover:text-[#C2410C] transition-colors p-2 hover:bg-[#FFF7ED] rounded-lg">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleEditSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                
                {/* Personal Info */}
                <div>
                  <p className="text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-3 flex items-center gap-2"><User size={14}/> Personal Information</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#64748B] mb-1">Full Name *</label>
                      <input required value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 outline-none focus:border-[#FDBA74] text-sm" placeholder="Full Name" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#64748B] mb-1">Email Address *</label>
                      <input required type="email" value={editForm.email || ''} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 outline-none focus:border-[#FDBA74] text-sm" placeholder="Email" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#64748B] mb-1">Phone Number *</label>
                      <input 
                        required 
                        type="tel" 
                        value={editForm.phone || ''} 
                        onChange={e => { 
                          const v = e.target.value.replace(/\D/g,'').slice(0, 10); 
                          if (v.length > 0 && !/^[6-9]/.test(v)) return; // Reject 0,1,2,3,4,5
                          setEditForm({...editForm, phone: v}); 
                        }} 
                        maxLength={10} 
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 outline-none focus:border-[#FDBA74] text-sm" 
                        placeholder="10-digit number (starts with 6-9)" 
                      />
                      {editForm.phone && (!/^[6-9]\d{9}$/.test(editForm.phone)) && (
                        <p className="text-[11px] text-red-500 mt-1">
                          {editForm.phone.length < 10 ? `Enter 10 digits (${editForm.phone.length}/10)` : 'Must start with 6, 7, 8, or 9'}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#64748B] mb-1">Gender</label>
                      <select value={editForm.gender || 'Male'} onChange={e => setEditForm({...editForm, gender: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 outline-none focus:border-[#FDBA74] text-sm">
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#64748B] mb-1">Date of Birth</label>
                      <input type="date" value={editForm.dob || ''} onChange={e => setEditForm({...editForm, dob: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 outline-none focus:border-[#FDBA74] text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#64748B] mb-1">Fitness Goal</label>
                      <select value={editForm.fitnessGoal || 'General Fitness'} onChange={e => setEditForm({...editForm, fitnessGoal: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 outline-none focus:border-[#FDBA74] text-sm">
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
                <div className="border-t border-[#E2E8F0] pt-6">
                  <p className="text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-3 flex items-center gap-2"><ShieldCheck size={14}/> Membership</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#64748B] mb-1">Plan</label>
                      <select value={editForm.plan || ''} onChange={e => setEditForm({...editForm, plan: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 outline-none focus:border-[#FDBA74] text-sm">
                        {mockPlans.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#64748B] mb-1">Status</label>
                      <select value={editForm.status || 'Active'} onChange={e => setEditForm({...editForm, status: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 outline-none focus:border-[#FDBA74] text-sm">
                        <option>Active</option>
                        <option>Pending</option>
                        <option>Inactive</option>
                        <option>Suspended</option>
                        <option>Rejected</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#64748B] mb-1">Join Date</label>
                      <input type="date" value={editForm.joined || ''} onChange={e => setEditForm({...editForm, joined: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 outline-none focus:border-[#FDBA74] text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#64748B] mb-1">Assigned Trainer</label>
                      <select
                        value={editForm.assignedTrainer || ''}
                        onChange={e => {
                          const selected = trainers.find((t: any) => t._id === e.target.value);
                          setEditForm({ ...editForm, assignedTrainer: e.target.value, trainer: selected?.name || '' });
                        }}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 outline-none focus:border-[#FDBA74] text-sm text-[#111827]"
                      >
                        <option value="">Unassigned</option>
                        {trainers.map((t: any) => (
                          <option key={t._id} value={t._id}>
                            {t.name}{t.trainerId ? ` (${t.trainerId})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="border-t border-[#E2E8F0] pt-6">
                  <p className="text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-3 flex items-center gap-2"><Phone size={14}/> Emergency Contact</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#64748B] mb-1">Name</label>
                      <input value={editForm.emergencyName || ''} onChange={e => setEditForm({...editForm, emergencyName: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 outline-none focus:border-[#FDBA74] text-sm" placeholder="Contact Name" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#64748B] mb-1">Phone</label>
                      <input 
                        type="tel" 
                        value={editForm.emergencyPhone || ''} 
                        onChange={e => { 
                          const v = e.target.value.replace(/\D/g,'').slice(0, 10); 
                          if (v.length > 0 && !/^[6-9]/.test(v)) return; // Reject 0,1,2,3,4,5
                          setEditForm({...editForm, emergencyPhone: v}); 
                        }} 
                        maxLength={10} 
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 outline-none focus:border-[#FDBA74] text-sm" 
                        placeholder="10-digit number (starts with 6-9)" 
                      />
                      {editForm.emergencyPhone && (!/^[6-9]\d{9}$/.test(editForm.emergencyPhone)) && (
                        <p className="text-[11px] text-red-500 mt-1">
                          {editForm.emergencyPhone.length < 10 ? `Enter 10 digits (${editForm.emergencyPhone.length}/10)` : 'Must start with 6, 7, 8, or 9'}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#64748B] mb-1">Relationship</label>
                      <input value={editForm.emergencyRelation || ''} onChange={e => setEditForm({...editForm, emergencyRelation: e.target.value})} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 outline-none focus:border-[#FDBA74] text-sm" placeholder="e.g. Parent" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setEditMember(null)} className="px-6 py-2 bg-[#FFFFFF] border border-[#F8FAFC] text-[#64748B] rounded-xl font-bold hover:bg-[#FFF7ED] transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-8 py-2 bg-[#C2410C] text-white font-bold rounded-xl font-bold hover:bg-[#9A3412] transition-colors shadow-lg shadow-orange-500/15 flex items-center gap-2">
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
            className="status-dropdown-menu fixed w-48 rounded-xl shadow-2xl bg-[#FFFFFF] border border-[#E2E8F0] z-[9999] overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-1 duration-150"
            style={{
              top: `${statusDropdown.top}px`,
              right: `${statusDropdown.right}px`,
              maxHeight: statusDropdown.maxHeight ? `${statusDropdown.maxHeight}px` : '280px',
            }}
          >
            <div className="px-3.5 py-2 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Set Status</span>
              <span className="text-[10px] font-semibold text-[#EA580C] bg-[#FFF7ED] px-1.5 py-0.5 rounded">
                {statusDropdown.memberStatus}
              </span>
            </div>
            <div className="p-1.5 flex flex-col gap-0.5 overflow-y-auto">
              {['Active', 'Inactive', 'Pending', 'Rejected', 'Existing'].map((status) => {
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
                      isCurrent ? 'text-[#EA580C] bg-[#F8FAFC] font-bold' : 'text-[#111827] hover:bg-[#FFF7ED]'
                    }`}
                  >
                    <span>{status}</span>
                    {isCurrent && <Check size={13} className="text-[#EA580C]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>,
        document.body
      )}
      {/* MEMBERSHIP DETAILS POPUP MODAL (Bug 3) */}
      {membershipPopupMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C]">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#111827]">Membership Details</h3>
                  <p className="text-xs text-[#64748B] font-medium">{membershipPopupMember.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMembershipPopupMember(null)}
                className="w-8 h-8 rounded-full bg-[#F8FAFC] hover:bg-[#FFF7ED] text-[#64748B] hover:text-[#C2410C] flex items-center justify-center transition-colors cursor-pointer border border-[#E2E8F0]"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Membership Plan Name</span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-[#111827]">
                    {membershipPopupMember.plan || membershipPopupMember.membership?.planName || 'Standard Membership'}
                  </span>
                  {getPlanBadge(membershipPopupMember.plan || membershipPopupMember.membership?.planName)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Start Date</span>
                  <span className="text-xs font-bold text-[#111827] block">
                    {formatDateDisplay(membershipPopupMember.membership?.startDate || membershipPopupMember.originalUser?.createdAt)}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Expiry Date</span>
                  <span className="text-xs font-bold text-[#C2410C] block">
                    {formatDateDisplay(membershipPopupMember.membership?.endDate || membershipPopupMember.originalUser?.subscriptionExpiry || getMemberExpiryDateRaw(membershipPopupMember))}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Membership Status</span>
                  <span className="text-xs font-bold text-[#111827]">
                    {membershipPopupMember.membership?.status || membershipPopupMember.status || 'Active'}
                  </span>
                </div>
                <span className={`px-2.5 py-1 border rounded-lg text-xs font-bold ${getStatusColor(membershipPopupMember.status)}`}>
                  {membershipPopupMember.status}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setMembershipPopupMember(null)}
                className="px-5 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-orange-500/15 cursor-pointer"
              >
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
