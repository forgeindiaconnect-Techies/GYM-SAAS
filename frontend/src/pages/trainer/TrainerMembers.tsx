import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, MoreVertical, X, User } from 'lucide-react';
import api from '../../utils/api';

const TrainerMembers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await api.get('/trainer-sessions/trainer');
        if (res.data.success) {
          const sessions = res.data.sessions || [];
          
          // Group sessions by customer
          const customerMap = new Map();
          
          sessions.forEach((s: any) => {
            if (!s.customerId) return;
            const cid = s.customerId._id;
            
            if (!customerMap.has(cid)) {
              customerMap.set(cid, {
                id: cid,
                name: `${s.customerId.firstName || ''} ${s.customerId.lastName || ''}`.trim() || 'Member',
                goal: s.customerId.fitnessGoal || 'General Fitness',
                status: 'Active',
                email: s.customerId.email || '',
                phone: s.customerId.phone || '+91 9876543210',
                profilePhoto: s.customerId.profilePhoto,
                originalUser: s.customerId,
                sessions: []
              });
            }
            customerMap.get(cid).sessions.push(s);
          });
          
          // Process next session
          const formatted = Array.from(customerMap.values()).map(client => {
            const upcoming = client.sessions
              .filter((s: any) => ['Pending', 'Awaiting Payment', 'Confirmed', 'Upcoming'].includes(s.status))
              .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
              
            const nextSession = upcoming.length > 0 
              ? `${new Date(upcoming[0].date).toLocaleDateString()} at ${upcoming[0].startTime}`
              : 'No upcoming sessions';
              
            return {
              ...client,
              nextSession,
              status: upcoming.length > 0 ? 'Active' : 'Inactive'
            };
          });
          
          setClients(formatted);
        }
      } catch (e) {
        console.error('Failed to load members', e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClients();
  }, []);

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openDetailsModal, setOpenDetailsModal] = useState<any>(null);

  const filteredClients = clients.filter((client) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      client.name?.toLowerCase().includes(term) ||
      client.goal?.toLowerCase().includes(term) ||
      client.status?.toLowerCase().includes(term) ||
      client.email?.toLowerCase().includes(term) ||
      client.nextSession?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#292524]">Assigned Users</h1>
          <p className="text-[#78716C]">
            {searchTerm.trim()
              ? `Showing ${filteredClients.length} of ${clients.length} active clients`
              : `Manage your ${clients.length} active clients`}
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search clients..."
            className="w-full bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl pl-10 pr-10 py-2 text-sm focus:outline-none focus:border-[#F97316] transition-colors text-[#292524]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#292524]"
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#78716C]">Loading clients...</div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-12 text-center">
          <Users size={48} className="mx-auto text-[#78716C] mb-3" />
          <h3 className="text-lg font-bold text-[#292524]">No clients found</h3>
          <p className="text-sm text-[#78716C] mt-1">
            {searchTerm ? `No active clients matching "${searchTerm}".` : 'You have no assigned clients yet.'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 px-4 py-2 bg-[#F97316] text-white font-medium text-sm rounded-xl hover:bg-[#EA580C] transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-5 hover:shadow-sm transition-shadow flex flex-col relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center font-bold text-[#F97316] border border-[#E7E5E4] overflow-hidden">
                    {client.profilePhoto ? (
                      <img src={client.profilePhoto} alt={client.name} className="w-full h-full object-cover" />
                    ) : (
                      client.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#292524] leading-tight">{client.name}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 font-medium ${
                        client.status === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {client.status}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setOpenMenu(openMenu === client.id ? null : client.id)}
                    className="text-[#78716C] hover:text-[#292524] transition-colors"
                  >
                    <MoreVertical size={18} />
                  </button>
                  {openMenu === client.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E7E5E4] rounded-xl shadow-lg overflow-hidden z-10">
                      <button 
                        onClick={() => { navigate('/trainer/session-bookings'); setOpenMenu(null); }}
                        className="w-full text-left px-4 py-3 text-sm text-[#292524] hover:bg-[#F8FAFC] transition-colors"
                      >
                        View Sessions
                      </button>
                      <button 
                        onClick={() => { alert('Assign Workout Plan feature coming soon!'); setOpenMenu(null); }}
                        className="w-full text-left px-4 py-3 text-sm text-[#292524] hover:bg-[#F8FAFC] transition-colors border-t border-[#E7E5E4]"
                      >
                        Assign Workout Plan
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#78716C]">Goal:</span>
                  <span className="font-medium text-[#292524]">{client.goal}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#78716C]">Next Session:</span>
                  <span className="font-medium text-[#F97316]">{client.nextSession}</span>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-[#E7E5E4]">
                <button
                  onClick={() => setOpenDetailsModal(client)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white text-[#F97316] text-sm font-semibold rounded-xl border border-[#F97316] hover:bg-[#F97316] hover:text-white transition-all shadow-sm"
                >
                  <User size={16} /> View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Member Details Modal */}
      {openDetailsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh] shadow-2xl border border-[#E7E5E4] my-auto">
            <div className="px-6 py-5 border-b border-[#E7E5E4] flex justify-between items-center bg-[#F8FAFC]">
              <div>
                <h2 className="text-xl font-bold text-[#292524]">Member Details</h2>
                <p className="text-xs text-[#78716C] mt-0.5">Comprehensive member overview and profile information</p>
              </div>
              <button 
                onClick={() => setOpenDetailsModal(null)} 
                className="w-9 h-9 flex items-center justify-center rounded-full text-[#78716C] hover:text-[#292524] hover:bg-[#FED7AA] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 sm:p-7 overflow-y-auto space-y-6">
              {/* Member Profile Header Card */}
              <div className="flex items-center space-x-4 bg-[#F8FAFC] p-4 rounded-2xl border border-[#E7E5E4]">
                <div className="w-16 h-16 bg-[#F97316]/10 text-[#F97316] rounded-2xl flex items-center justify-center text-2xl font-bold border border-[#F97316]/20 uppercase overflow-hidden shrink-0 shadow-sm">
                  {openDetailsModal.profilePhoto ? (
                    <img src={openDetailsModal.profilePhoto} alt={openDetailsModal.name} className="w-full h-full object-cover" />
                  ) : (
                    openDetailsModal.name.charAt(0)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-2xl font-bold text-[#292524] mb-1 capitalize truncate">{openDetailsModal.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-0.5 rounded-full text-xs font-semibold ${
                      openDetailsModal.status === 'Active' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      {openDetailsModal.status}
                    </span>
                    {openDetailsModal.goal && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {openDetailsModal.goal}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Member Info Contiguous Grid Touching One by One */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Profile Information</h4>
                <div className="border border-[#E7E5E4] rounded-xl overflow-hidden divide-y divide-[#E7E5E4] bg-white shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                    <div className="p-3.5 bg-white">
                      <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Email</p>
                      <p className="font-semibold text-sm text-[#292524] break-all">{openDetailsModal.email || 'Not specified'}</p>
                    </div>
                    <div className="p-3.5 bg-white">
                      <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Phone</p>
                      <p className="font-semibold text-sm text-[#292524]">{openDetailsModal.phone || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                    <div className="p-3.5 bg-white">
                      <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Membership Plan</p>
                      <p className="font-semibold text-sm text-[#F97316]">{openDetailsModal.originalUser?.subscriptionPlan || 'Standard Plan'}</p>
                    </div>
                    <div className="p-3.5 bg-white">
                      <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Join Date</p>
                      <p className="font-semibold text-sm text-[#292524]">
                        {openDetailsModal.originalUser?.createdAt ? new Date(openDetailsModal.originalUser.createdAt).toLocaleDateString() : 'Not specified'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                    <div className="p-3.5 bg-white">
                      <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Gender</p>
                      <p className="font-semibold text-sm text-[#292524] capitalize">{openDetailsModal.originalUser?.gender || 'Not specified'}</p>
                    </div>
                    <div className="p-3.5 bg-white">
                      <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Renewal Date</p>
                      <p className="font-semibold text-sm text-[#292524]">
                        {openDetailsModal.originalUser?.subscriptionExpiry ? new Date(openDetailsModal.originalUser.subscriptionExpiry).toLocaleDateString() : 'Not Set'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                    <div className="p-3.5 bg-white">
                      <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Height / Weight</p>
                      <p className="font-semibold text-sm text-[#292524]">
                        {openDetailsModal.originalUser?.height ? `${openDetailsModal.originalUser.height} cm` : '--'} / {openDetailsModal.originalUser?.weight ? `${openDetailsModal.originalUser.weight} kg` : '--'}
                      </p>
                    </div>
                    <div className="p-3.5 bg-white">
                      <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Experience Level</p>
                      <p className="font-semibold text-sm text-[#292524] capitalize">{openDetailsModal.originalUser?.experienceLevel || 'Intermediate'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                    <div className="p-3.5 bg-white">
                      <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Pref. Training</p>
                      <p className="font-semibold text-sm text-[#292524]">{openDetailsModal.originalUser?.preferredTraining || 'General Fitness'}</p>
                    </div>
                    <div className="p-3.5 bg-white">
                      <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Pref. Workout Time</p>
                      <p className="font-semibold text-sm text-[#292524]">{openDetailsModal.originalUser?.preferredWorkoutTime || 'Morning'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Recent Sessions */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Recent Bookings</h4>
                {openDetailsModal.sessions && openDetailsModal.sessions.length > 0 ? (
                  <div className="space-y-2.5">
                    {openDetailsModal.sessions.slice(0, 3).map((s: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-3.5 bg-[#F8FAFC] border border-[#E7E5E4] rounded-xl">
                        <div className="space-y-0.5">
                          <p className="font-bold text-sm text-[#292524]">{new Date(s.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          <p className="text-xs text-[#78716C]">{s.startTime} - {s.endTime} <span className="font-semibold text-blue-700">({s.mode || 'Online'})</span></p>
                        </div>
                        <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {s.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-[#F8FAFC] border border-[#E7E5E4] rounded-xl text-center">
                    <p className="text-xs text-[#78716C]">No session history available for this member.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 px-6 border-t border-[#E7E5E4] bg-[#F8FAFC] flex justify-end">
              <button 
                onClick={() => setOpenDetailsModal(null)}
                className="px-6 py-2.5 bg-[#F97316] text-white rounded-xl font-bold hover:bg-[#EA580C] transition-colors shadow-sm text-sm"
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

export default TrainerMembers;