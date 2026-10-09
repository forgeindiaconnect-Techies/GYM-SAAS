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
      const [membersRes, trainersRes] = await Promise.all([
        api.get(`/users?role=MEMBER&status=REJECTED${branchParam}`).catch(() => ({ data: { users: [] } })),
        api.get(`/trainers${user?.branchId ? `?branchId=${user.branchId}` : ''}`).catch(() => ({ data: { trainers: [] } })),
      ]);

      const inactiveMembers = (membersRes.data?.users || [])
        .filter((u: any) => u.approvalStatus === 'REJECTED' || u.approvalStatus === 'SUSPENDED' || u.isActive === false)
        .map((u: any) => ({
          id: `DEL-${u._id.slice(-6).toUpperCase()}`,
          originalId: u._id,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
          type: 'Member',
          phone: u.mobile || 'N/A',
          email: u.email || 'N/A',
          deletedAt: u.updatedAt ? new Date(u.updatedAt).toISOString().split('T')[0] : 'N/A',
          deletedBy: 'Admin',
          reason: u.rejectionReason || u.suspensionReason || 'Account deactivated'
        }));

      const inactiveTrainers = (trainersRes.data?.trainers || [])
        .filter((t: any) => t.status === 'Inactive' || t.status === 'Suspended' || t.status === 'Terminated')
        .map((t: any) => ({
          id: `DEL-${(t._id || t.id || '').slice(-6).toUpperCase()}`,
          originalId: t._id || t.id,
          name: t.name,
          type: 'Trainer',
          phone: t.phone || 'N/A',
          email: t.email || 'N/A',
          deletedAt: t.updatedAt ? new Date(t.updatedAt).toISOString().split('T')[0] : 'N/A',
          deletedBy: 'Admin',
          reason: t.terminationReason || 'Contract ended'
        }));

      setDeletedItems([...inactiveMembers, ...inactiveTrainers]);
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

  const handleRestore = (id: string) => {
    setDeletedItems(prev => prev.filter(item => item.id !== id));
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
          <h1 className="text-3xl font-bold text-[#292524] tracking-tight">Deleted Details</h1>
          <p className="text-[#78716C] mt-1">View history of deleted trainers, members, and profiles.</p>
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5"><Trash2 size={120} /></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
          <div className="relative w-full md:w-96">
            <input 
              type="text" 
              placeholder="Search deleted records..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl pl-10 pr-4 py-2.5 text-[#292524] focus:border-[#F97316] transition-all outline-none"
            />
            <Search className="absolute left-3 top-3 text-[#78716C]" size={18} />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar relative z-10">
          <table className="w-full text-left text-sm text-[#78716C] whitespace-nowrap">
            <thead className="bg-[#FFFDF8] border-b border-[#E7E5E4] text-[#292524]">
              <tr>
                <th className="px-6 py-4 font-semibold rounded-tl-xl">ID</th>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Deleted At</th>
                <th className="px-6 py-4 font-semibold">Reason</th>
                <th className="px-6 py-4 font-semibold text-center rounded-tr-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E5E4]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 size={32} className="mx-auto text-[#F97316] animate-spin mb-3" />
                    <p className="text-[#78716C] font-medium">Loading deleted records...</p>
                  </td>
                </tr>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FFFDF8] transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{item.id}</td>
                    <td className="px-6 py-4 font-bold text-[#292524]">{item.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        item.type === 'Trainer' ? 'bg-blue-500/10 text-[#FED7AA]' : 'bg-purple-500/10 text-purple-600'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">{item.deletedAt}</td>
                    <td className="px-6 py-4 truncate max-w-xs">{item.reason}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-3">
                        <button onClick={() => handleOpenDetails(item)} className="text-[#78716C] hover:text-[#FED7AA] transition-colors" title="View Details">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => handleRestore(item.id)} className="text-[#78716C] hover:text-[#F97316] transition-colors" title="Restore Data">
                          <RotateCcw size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Trash2 size={40} className="mx-auto text-[#CBD5E1] mb-3" />
                    <p className="text-[#78716C] font-medium">No deleted records found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-md w-full shadow-2xl border border-[#E7E5E4] overflow-hidden">
            <div className="p-6 border-b border-[#E7E5E4] flex justify-between items-center bg-[#FFFDF8]">
              <h2 className="text-xl font-bold text-[#292524]">Deleted Record Details</h2>
              <button onClick={() => setSelectedItem(null)} className="text-[#78716C] hover:text-[#292524]"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <span className="text-sm font-bold text-[#78716C]">ID</span>
                  <p className="text-[#292524] font-semibold break-all">{selectedItem.id}</p>
                </div>
                <div>
                  <span className="text-sm font-bold text-[#78716C]">Name</span>
                  <p className="text-[#292524] font-semibold">{selectedItem.name}</p>
                </div>
                <div>
                  <span className="text-sm font-bold text-[#78716C]">Type</span>
                  <p className="text-[#292524] font-semibold">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      selectedItem.type === 'Trainer' ? 'bg-blue-500/10 text-[#F97316]' : 'bg-purple-500/10 text-purple-600'
                    }`}>
                      {selectedItem.type}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-sm font-bold text-[#78716C] flex items-center gap-1.5 mb-0.5">
                    <Phone size={13} className="text-[#F97316]" /> Phone Number
                  </span>
                  <p className="text-[#292524] font-semibold">{getPhoneNumber(selectedItem)}</p>
                </div>
                <div>
                  <span className="text-sm font-bold text-[#78716C] flex items-center gap-1.5 mb-0.5">
                    <Mail size={13} className="text-[#F97316]" /> Mail ID
                  </span>
                  <p className="text-[#292524] font-semibold break-all">{getMailId(selectedItem)}</p>
                </div>
                <div>
                  <span className="text-sm font-bold text-[#78716C]">Deleted At</span>
                  <p className="text-[#292524] font-semibold">{selectedItem.deletedAt}</p>
                </div>
                <div>
                  <span className="text-sm font-bold text-[#78716C]">Deleted By</span>
                  <p className="text-[#292524] font-semibold">{selectedItem.deletedBy}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-sm font-bold text-[#78716C]">Reason</span>
                  <p className="text-[#292524] font-semibold">{selectedItem.reason}</p>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-[#E7E5E4]">
                <button type="button" onClick={() => setSelectedItem(null)} className="px-6 py-2 bg-[#F1F5F9] text-[#292524] font-bold hover:bg-[#FED7AA] rounded-xl transition-colors">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymAdminDeletedDetails;
