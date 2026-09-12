import { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle, User, Building2, Trash2, Mail } from 'lucide-react';
import api from '../../utils/api';

interface DeletedRecord {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role?: string;
  createdAt?: string;
  deletedAt?: string;
  gymName?: string;
  owner?: string;
  status?: string;
}

const SuperAdminDeletedDetails = () => {
  const [activeTab, setActiveTab] = useState<'CUSTOMERS' | 'GYM_OWNERS' | 'GYM_INVITATIONS'>('CUSTOMERS');
  const [records, setRecords] = useState<DeletedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDeletedRecords();
  }, [activeTab]);

  const fetchDeletedRecords = async () => {
    try {
      setLoading(true);
      if (activeTab === 'GYM_INVITATIONS') {
        const { getDb } = await import('../../utils/mockDb');
        const invs = getDb('deletedGymInvitations') || [];
        setRecords(invs);
        setError('');
        setLoading(false);
        return;
      }

      const role = activeTab === 'CUSTOMERS' ? 'MEMBER' : 'GYM_OWNER';
      const res = await api.get(`/users?role=${role}&status=DELETED`);
      setRecords(res.data.users || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch deleted records');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(r => {
    const term = searchQuery.toLowerCase();
    const name = (r.firstName ? `${r.firstName} ${r.lastName}` : (r.gymName || r.owner)) || '';
    return name.toLowerCase().includes(term) || r.email.toLowerCase().includes(term);
  });

  return (
    <div className="p-8 h-full flex flex-col overflow-hidden relative">
      <div className="flex justify-between items-center mb-6 shrink-0 relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight flex items-center space-x-3">
            <Trash2 className="text-[#0D9488]" size={32} />
            <span>Deleted Details</span>
          </h1>
          <p className="text-[#475569] text-sm mt-1">View all deleted customers and gym owners.</p>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-[#CCFBF1] pb-2 overflow-x-auto custom-scrollbar shrink-0">
        <button
          onClick={() => setActiveTab('CUSTOMERS')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors text-sm font-medium border-b-2 whitespace-nowrap ${
            activeTab === 'CUSTOMERS'
              ? 'border-[#16A34A] text-[#16A34A] bg-[#16A34A]/10'
              : 'border-transparent text-[#475569] hover:text-[#1E293B] hover:bg-[#FFFFFF]'
          }`}
        >
          <User size={16} />
          <span>Deleted Customers</span>
        </button>
        <button
          onClick={() => setActiveTab('GYM_OWNERS')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors text-sm font-medium border-b-2 whitespace-nowrap ${
            activeTab === 'GYM_OWNERS'
              ? 'border-[#16A34A] text-[#16A34A] bg-[#16A34A]/10'
              : 'border-transparent text-[#475569] hover:text-[#1E293B] hover:bg-[#FFFFFF]'
          }`}
        >
          <Building2 size={16} />
          <span>Deleted Gym Owners</span>
        </button>
        <button
          onClick={() => setActiveTab('GYM_INVITATIONS')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors text-sm font-medium border-b-2 whitespace-nowrap ${
            activeTab === 'GYM_INVITATIONS'
              ? 'border-[#16A34A] text-[#16A34A] bg-[#16A34A]/10'
              : 'border-transparent text-[#475569] hover:text-[#1E293B] hover:bg-[#FFFFFF]'
          }`}
        >
          <Mail size={16} />
          <span>Deleted Gym Invitations</span>
        </button>
      </div>

      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl p-4 flex flex-wrap gap-4 mt-4 shrink-0">
        <div className="flex-1 min-w-[250px] relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-[#16A34A] transition-colors"
          />
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl overflow-hidden relative min-h-[400px] mt-4 flex-1">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#475569]">
            <Loader2 size={32} className="animate-spin mb-4 text-[#16A34A]" />
            <p>Loading deleted records...</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#0D9488]">
            <AlertCircle size={32} className="mb-2" />
            <p>{error}</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#475569]">
            <Trash2 size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium text-[#1E293B] mb-1">No deleted records found</p>
            <p className="text-sm text-center max-w-md">
              There are no deleted {activeTab === 'CUSTOMERS' ? 'customers' : activeTab === 'GYM_OWNERS' ? 'gym owners' : 'gym invitations'} matching your search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#475569] uppercase bg-[#FFFFFF] border-b border-[#CCFBF1]">
                <tr>
                  {activeTab === 'GYM_INVITATIONS' ? (
                    <>
                      <th className="px-6 py-4 font-medium">Gym Name</th>
                      <th className="px-6 py-4 font-medium">Owner</th>
                      <th className="px-6 py-4 font-medium">Email</th>
                      <th className="px-6 py-4 font-medium">Original Status</th>
                      <th className="px-6 py-4 font-medium">Deleted Date</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4 font-medium">Name</th>
                      <th className="px-6 py-4 font-medium">Email</th>
                      <th className="px-6 py-4 font-medium">Role</th>
                      <th className="px-6 py-4 font-medium">Deleted Date</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CCFBF1]">
                {filteredRecords.map((record) => (
                  <tr key={record._id || record.id} className="hover:bg-[#F8FAFC] transition-colors opacity-70">
                    {activeTab === 'GYM_INVITATIONS' ? (
                      <>
                        <td className="px-6 py-4 font-medium text-[#1E293B]">{record.gymName}</td>
                        <td className="px-6 py-4 text-[#475569]">{record.owner}</td>
                        <td className="px-6 py-4 text-[#475569]">{record.email}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border border-slate-500/50 text-slate-500">
                            {record.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#475569]">
                          {record.deletedAt ? new Date(record.deletedAt).toLocaleDateString() : 'N/A'}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 font-medium text-[#1E293B]">
                          {record.firstName} {record.lastName}
                        </td>
                        <td className="px-6 py-4 text-[#475569]">
                          {record.email}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border border-red-500/50 text-red-500">
                            {record.role?.replace('_', ' ') || 'UNKNOWN'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#475569]">
                           {record.createdAt ? new Date(record.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDeletedDetails;
