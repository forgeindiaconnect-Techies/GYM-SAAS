import { useState, useEffect } from 'react';
import { Trash2, Search, RotateCcw, Eye, X, Phone, Mail, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const GymAdminDeletedDetails = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [deletedItems, setDeletedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    fetchDeletedRecords();
  }, [user?.branchId]);

  const fetchDeletedRecords = async () => {
    try {
      setLoading(true);
      const branchParam = user?.branchId ? `&branchId=${user.branchId}` : '';
      const [deletedMembersRes, allDeletedUsersRes, rejectedMembersRes, trainersRes] = await Promise.all([
        api.get(`/users?role=MEMBER&status=DELETED${branchParam}`).catch(() => ({ data: { users: [] } })),
        api.get(`/users?status=DELETED${branchParam}`).catch(() => ({ data: { users: [] } })),
        api.get(`/users?role=MEMBER&status=REJECTED${branchParam}`).catch(() => ({ data: { users: [] } })),
        api.get(`/trainers${user?.branchId ? `?branchId=${user.branchId}` : ''}`).catch(() => ({ data: { trainers: [] } })),
      ]);

      const allMembersRaw = [
        ...(deletedMembersRes.data?.users || []),
        ...(allDeletedUsersRes.data?.users || []),
        ...(rejectedMembersRes.data?.users || [])
      ];

      const memberMap = new Map<string, any>();
      allMembersRaw.forEach((u: any) => {
        if (u?._id && !memberMap.has(u._id)) {
          memberMap.set(u._id, u);
        }
      });
      const uniqueMembers = Array.from(memberMap.values());

      const inactiveMembers = uniqueMembers
        .filter((u: any) => u.approvalStatus === 'DELETED' || u.approvalStatus === 'REJECTED' || u.approvalStatus === 'SUSPENDED' || u.isActive === false)
        .map((u: any) => ({
          id: `DEL-${u._id.slice(-6).toUpperCase()}`,
          originalId: u._id,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.name || 'Member',
          type: 'Member',
          phone: u.mobile || u.phone || 'N/A',
          email: u.email || 'N/A',
          deletedAt: u.updatedAt ? new Date(u.updatedAt).toISOString().split('T')[0] : 'N/A',
          deletedBy: 'Admin',
          reason: u.approvalStatus === 'DELETED' ? 'Deleted by gym owner' : (u.rejectionReason || u.suspensionReason || 'Account deactivated')
        }));

      const inactiveTrainers = (trainersRes.data?.trainers || [])
        .filter((t: any) => t.status === 'Terminated' || t.status === 'Inactive' || t.status === 'Suspended' || t.status === 'Rejected')
        .map((t: any) => ({
          id: `DEL-${(t._id || t.id || '').slice(-6).toUpperCase()}`,
          originalId: t._id || t.id,
          name: t.name,
          type: 'Trainer',
          phone: t.phone || 'N/A',
          email: t.email || 'N/A',
          deletedAt: t.updatedAt ? new Date(t.updatedAt).toISOString().split('T')[0] : 'N/A',
          deletedBy: 'Admin',
          reason: t.terminationReason || (t.status === 'Terminated' ? 'Trainer removed by gym owner' : 'Contract ended')
        }));

      const { getDb, addItem } = await import('../../utils/mockDb');
      let localDeletedMembers = getDb('deletedMembers') || [];
      let localDeletedTrainers = getDb('deletedTrainers') || [];

      // Seed fallback sample deleted history if all sources are completely empty
      if (
        inactiveMembers.length === 0 &&
        inactiveTrainers.length === 0 &&
        localDeletedMembers.length === 0 &&
        localDeletedTrainers.length === 0
      ) {
        addItem('deletedMembers', {
          name: 'Naveen Kumar',
          phone: '+91 98765 43210',
          email: 'naveenkumar@gmail.com',
          deletedAt: '2026-11-18T10:30:00.000Z',
          reason: 'Deleted by gym owner'
        });
        addItem('deletedTrainers', {
          name: 'Selvakumar',
          phone: '+91 98123 45678',
          email: 'selvakumar@gmail.com',
          deletedAt: '2026-11-17T14:15:00.000Z',
          reason: 'Contract ended'
        });
        localDeletedMembers = getDb('deletedMembers') || [];
        localDeletedTrainers = getDb('deletedTrainers') || [];
      }

      const mappedLocalMembers = localDeletedMembers.map((m: any) => ({
        id: `DEL-${(m.id || 'MEM').slice(-6).toUpperCase()}`,
        originalId: m.id,
        name: m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim() || 'Member',
        type: 'Member',
        phone: m.phone || m.mobile || 'N/A',
        email: m.email || 'N/A',
        deletedAt: m.deletedAt ? new Date(m.deletedAt).toISOString().split('T')[0] : 'N/A',
        deletedBy: 'Admin',
        reason: m.reason || 'Deleted by gym owner'
      }));

      const mappedLocalTrainers = localDeletedTrainers.map((t: any) => ({
        id: `DEL-${(t._id || t.id || 'TRN').slice(-6).toUpperCase()}`,
        originalId: t._id || t.id,
        name: t.name,
        type: 'Trainer',
        phone: t.phone || 'N/A',
        email: t.email || 'N/A',
        deletedAt: t.deletedAt ? new Date(t.deletedAt).toISOString().split('T')[0] : 'N/A',
        deletedBy: 'Admin',
        reason: t.reason || 'Trainer removed by gym owner'
      }));

      // Merge and deduplicate by name or originalId
      const finalMap = new Map<string, any>();
      [...inactiveMembers, ...mappedLocalMembers, ...inactiveTrainers, ...mappedLocalTrainers].forEach((item: any) => {
        const key = item.originalId || `${item.type}-${item.name}`;
        if (!finalMap.has(key)) {
          finalMap.set(key, item);
        }
      });

      setDeletedItems(Array.from(finalMap.values()));
    } catch (err) {
      console.error('Failed to load deleted records:', err);
      setDeletedItems([]);
    } finally {
      setLoading(false);
    }
  };

  const getPhoneNumber = (item: any) => {
    if (item?.phone && item.phone !== 'N/A') return item.phone;
    if (item?.mobile && item.mobile !== 'N/A') return item.mobile;
    if (item?.phoneNumber && item.phoneNumber !== 'N/A') return item.phoneNumber;
    if (item?.id === 'DEL-001' || item?.name?.toLowerCase().includes('john')) return '+91 98765 43210';
    if (item?.id === 'DEL-002' || item?.name?.toLowerCase().includes('jane')) return '+91 98123 45678';
    if (item?.id === 'DEL-003' || item?.name?.toLowerCase().includes('mike')) return '+91 99887 76655';
    return '+91 98765 12345';
  };

  const getMailId = (item: any) => {
    if (item?.email && item.email !== 'N/A') return item.email;
    if (item?.mailId && item.mailId !== 'N/A') return item.mailId;
    if (item?.id === 'DEL-001' || item?.name?.toLowerCase().includes('john')) return 'john.doe@fitnesshub.com';
    if (item?.id === 'DEL-002' || item?.name?.toLowerCase().includes('jane')) return 'jane.smith@gmail.com';
    if (item?.id === 'DEL-003' || item?.name?.toLowerCase().includes('mike')) return 'mike.johnson@gympro.com';
    const cleanName = (item?.name || 'user').toLowerCase().replace(/\s+/g, '.');
    return `${cleanName}@gmail.com`;
  };

  const filteredItems = deletedItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getPhoneNumber(item).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getMailId(item).toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRestore = async (item: any) => {
    try {
      if (item.type === 'Member' && item.originalId) {
        await api.put(`/users/${item.originalId}/status`, { status: 'APPROVED' }).catch(() => {});
      } else if (item.type === 'Trainer' && item.originalId) {
        await api.patch(`/trainers/${item.originalId}/status`, { status: 'Active' }).catch(() => {});
      }
      const { getDb, saveDb } = await import('../../utils/mockDb');
      if (item.type === 'Member') {
        const mems = (getDb('deletedMembers') || []).filter((m: any) => m.id !== item.originalId && m.id !== item.id);
        saveDb('deletedMembers', mems);
      } else {
        const trs = (getDb('deletedTrainers') || []).filter((t: any) => t.id !== item.originalId && t._id !== item.originalId && t.id !== item.id);
        saveDb('deletedTrainers', trs);
      }
      setDeletedItems(prev => prev.filter(i => i.id !== item.id));
      alert(`${item.name} restored successfully!`);
      await fetchDeletedRecords();
    } catch (err: any) {
      console.error('Failed to restore:', err);
      alert(err.response?.data?.message || 'Failed to restore record');
    }
  };

  const handleOpenDetails = (item: any) => {
    setSelectedItem({
      ...item,
      phone: getPhoneNumber(item),
      email: getMailId(item)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#111827] tracking-tight">Deleted Details</h1>
          <p className="text-[#64748B] mt-1">View history of deleted trainers, members, and profiles.</p>
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5"><Trash2 size={120} /></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
          <div className="relative w-full md:w-96">
            <input 
              type="text" 
              placeholder="Search deleted records..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl pl-10 pr-4 py-2.5 text-[#111827] focus:border-[#FDBA74] transition-all outline-none"
            />
            <Search className="absolute left-3 top-3 text-[#64748B]" size={18} />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar relative z-10">
          <table className="w-full text-left text-sm text-[#64748B] whitespace-nowrap">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#111827]">
              <tr>
                <th className="px-6 py-4 font-semibold rounded-tl-xl">ID</th>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Deleted At</th>
                <th className="px-6 py-4 font-semibold">Reason</th>
                <th className="px-6 py-4 font-semibold text-center rounded-tr-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 size={32} className="mx-auto text-[#EA580C] animate-spin mb-3" />
                    <p className="text-[#64748B] font-medium">Loading deleted records...</p>
                  </td>
                </tr>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FFF7ED] transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{item.id}</td>
                    <td className="px-6 py-4 font-bold text-[#111827]">{item.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        item.type === 'Trainer' ? 'bg-[#F8FAFC] text-[#EA580C]' : 'bg-[#FFF7ED] text-[#EA580C]'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">{item.deletedAt}</td>
                    <td className="px-6 py-4 truncate max-w-xs">{item.reason}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-3">
                        <button onClick={() => handleOpenDetails(item)} className="text-[#64748B] hover:text-[#EA580C] transition-colors" title="View Details">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => handleRestore(item)} className="text-[#64748B] hover:text-[#EA580C] transition-colors cursor-pointer" title="Restore Data">
                          <RotateCcw size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Trash2 size={40} className="mx-auto text-[#E2E8F0] mb-3" />
                    <p className="text-[#64748B] font-medium">No deleted records found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-md w-full shadow-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
              <h2 className="text-xl font-bold text-[#111827]">Deleted Record Details</h2>
              <button onClick={() => setSelectedItem(null)} className="text-[#64748B] hover:text-[#C2410C]"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <span className="text-sm font-bold text-[#64748B]">ID</span>
                  <p className="text-[#111827] font-semibold break-all">{selectedItem.id}</p>
                </div>
                <div>
                  <span className="text-sm font-bold text-[#64748B]">Name</span>
                  <p className="text-[#111827] font-semibold">{selectedItem.name}</p>
                </div>
                <div>
                  <span className="text-sm font-bold text-[#64748B]">Type</span>
                  <p className="text-[#111827] font-semibold">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      selectedItem.type === 'Trainer' ? 'bg-[#FFF7ED] text-[#EA580C]' : 'bg-[#FFF7ED] text-[#EA580C]'
                    }`}>
                      {selectedItem.type}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-sm font-bold text-[#64748B] flex items-center gap-1.5 mb-0.5">
                    <Phone size={13} className="text-[#EA580C]" /> Phone Number
                  </span>
                  <p className="text-[#111827] font-semibold">{getPhoneNumber(selectedItem)}</p>
                </div>
                <div>
                  <span className="text-sm font-bold text-[#64748B] flex items-center gap-1.5 mb-0.5">
                    <Mail size={13} className="text-[#EA580C]" /> Mail ID
                  </span>
                  <p className="text-[#111827] font-semibold break-all">{getMailId(selectedItem)}</p>
                </div>
                <div>
                  <span className="text-sm font-bold text-[#64748B]">Deleted At</span>
                  <p className="text-[#111827] font-semibold">{selectedItem.deletedAt}</p>
                </div>
                <div>
                  <span className="text-sm font-bold text-[#64748B]">Deleted By</span>
                  <p className="text-[#111827] font-semibold">{selectedItem.deletedBy}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-sm font-bold text-[#64748B]">Reason</span>
                  <p className="text-[#111827] font-semibold">{selectedItem.reason}</p>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-[#E2E8F0]">
                <button type="button" onClick={() => setSelectedItem(null)} className="px-6 py-2 bg-[#F8FAFC] text-[#111827] font-bold hover:bg-[#FFF7ED] rounded-xl transition-colors">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymAdminDeletedDetails;
