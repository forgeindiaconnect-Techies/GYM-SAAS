import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, MoreVertical, MessageSquare, Activity, X, User, Phone } from 'lucide-react';
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
          <h1 className="text-3xl font-bold text-[#202828]">Assigned Users</h1>
          <p className="text-[#455250]">
            {searchTerm.trim()
              ? `Showing ${filteredClients.length} of ${clients.length} active clients`
              : `Manage your ${clients.length} active clients`}
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#455250]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search clients..."
            className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl pl-10 pr-10 py-2 text-sm focus:outline-none focus:border-[#164A4A] transition-colors text-[#202828]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8ADA9] hover:text-[#202828]"
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#455250]">Loading clients...</div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-12 text-center">
          <Users size={48} className="mx-auto text-[#A8ADA9] mb-3" />
          <h3 className="text-lg font-bold text-[#202828]">No clients found</h3>
          <p className="text-sm text-[#455250] mt-1">
            {searchTerm ? `No active clients matching "${searchTerm}".` : 'You have no assigned clients yet.'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 px-4 py-2 bg-[#164A4A] text-white font-medium text-sm rounded-xl hover:bg-[#C6A77D] transition-colors"
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
              className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-5 hover:shadow-sm transition-shadow flex flex-col relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center font-bold text-[#164A4A] border border-[#D3DFDA] overflow-hidden">
                    {client.profilePhoto ? (
                      <img src={client.profilePhoto} alt={client.name} className="w-full h-full object-cover" />
                    ) : (
                      client.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#202828] leading-tight">{client.name}</h3>
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
                    className="text-[#A8ADA9] hover:text-[#202828] transition-colors"
                  >
                    <MoreVertical size={18} />
                  </button>
                  {openMenu === client.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-[#D3DFDA] rounded-xl shadow-lg overflow-hidden z-10">
                      <button 
                        onClick={() => { navigate('/trainer/session-bookings'); setOpenMenu(null); }}
                        className="w-full text-left px-4 py-3 text-sm text-[#202828] hover:bg-[#F8FAFC] transition-colors"
                      >
                        View Sessions
                      </button>
                      <button 
                        onClick={() => { alert('Assign Workout Plan feature coming soon!'); setOpenMenu(null); }}
                        className="w-full text-left px-4 py-3 text-sm text-[#202828] hover:bg-[#F8FAFC] transition-colors border-t border-[#D3DFDA]"
                      >
                        Assign Workout Plan
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#455250]">Goal:</span>
                  <span className="font-medium text-[#202828]">{client.goal}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#455250]">Next Session:</span>
                  <span className="font-medium text-[#164A4A]">{client.nextSession}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-[#D3DFDA]">
                <button
                  onClick={() => setOpenDetailsModal(client)}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-white text-[#164A4A] text-sm font-semibold rounded-xl border border-[#164A4A] hover:bg-[#164A4A]/5 transition-colors"
                >
                  <User size={16} /> View Details
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => navigate(`/trainer/member-progress?userId=${client.id}`)}
                    className="flex items-center justify-center gap-2 py-2 bg-[#F8FAFC] text-[#202828] text-sm font-semibold rounded-xl border border-[#D3DFDA] hover:bg-[#E8E5DA] transition-colors"
                  >
                    <Activity size={16} /> Progress
                  </button>
                  <button
                    onClick={() => navigate(`/trainer/messages?userId=${client.id}`)}
                    className="flex items-center justify-center gap-2 py-2 bg-[#E8E5DA] text-[#202828] text-sm font-semibold rounded-xl hover:bg-[#D3DFDA] transition-colors"
                  >
                    <MessageSquare size={16} /> Chat
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Member Details Modal */}
      {openDetailsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6 sm:p-12 overflow-hidden">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] shadow-2xl">
            <div className="p-6 border-b border-[#D3DFDA] flex justify-between items-center bg-[#F8FAFC]">
              <h2 className="text-xl font-bold text-[#202828]">Member Details</h2>
              <button onClick={() => setOpenDetailsModal(null)} className="text-[#A8ADA9] hover:text-[#202828] transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-[#164A4A]/10 text-[#164A4A] rounded-2xl flex items-center justify-center text-3xl font-bold border border-[#164A4A]/20 uppercase overflow-hidden shrink-0">
                  {openDetailsModal.profilePhoto ? (
                    <img src={openDetailsModal.profilePhoto} alt={openDetailsModal.name} className="w-full h-full object-cover" />
                  ) : (
                    openDetailsModal.name.charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#202828] mb-1 capitalize">{openDetailsModal.name}</h3>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${openDetailsModal.status === 'Active' ? 'bg-[#164A4A]/10 text-[#164A4A]' : 'bg-[#6fa3a0]/10 text-[#6fa3a0]'}`}>
                      {openDetailsModal.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-xs font-bold text-[#455250] uppercase tracking-wider mb-1">Email</p>
                  <p className="font-semibold text-[#202828]">{openDetailsModal.email || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#455250] uppercase tracking-wider mb-1">Phone</p>
                  <p className="font-semibold text-[#202828]">{openDetailsModal.phone || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#455250] uppercase tracking-wider mb-1">Membership Plan</p>
                  <p className="font-semibold text-[#202828]">{openDetailsModal.originalUser?.subscriptionPlan || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#455250] uppercase tracking-wider mb-1">Join Date</p>
                  <p className="font-semibold text-[#202828]">{openDetailsModal.originalUser?.createdAt ? new Date(openDetailsModal.originalUser.createdAt).toISOString().split('T')[0] : 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#455250] uppercase tracking-wider mb-1">Gender</p>
                  <p className="font-semibold text-[#202828]">{openDetailsModal.originalUser?.gender || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#455250] uppercase tracking-wider mb-1">Renewal Date</p>
                  <p className="font-semibold text-[#202828]">{openDetailsModal.originalUser?.subscriptionExpiry ? new Date(openDetailsModal.originalUser.subscriptionExpiry).toLocaleDateString() : 'Not Set'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#455250] uppercase tracking-wider mb-1">Last Login</p>
                  <p className="font-semibold text-[#202828]">{openDetailsModal.originalUser?.lastLogin ? new Date(openDetailsModal.originalUser.lastLogin).toLocaleString() : 'Never'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#455250] uppercase tracking-wider mb-1">Date of Birth</p>
                  <p className="font-semibold text-[#202828]">{openDetailsModal.originalUser?.dateOfBirth || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#455250] uppercase tracking-wider mb-1">City & PIN</p>
                  <p className="font-semibold text-[#202828]">{openDetailsModal.originalUser?.city || 'Not specified'} - {openDetailsModal.originalUser?.pinCode || ''}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#455250] uppercase tracking-wider mb-1">Height / Weight</p>
                  <p className="font-semibold text-[#202828]">{openDetailsModal.originalUser?.height ? `${openDetailsModal.originalUser.height} cm` : '--'} / {openDetailsModal.originalUser?.weight ? `${openDetailsModal.originalUser.weight} kg` : '--'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#455250] uppercase tracking-wider mb-1">Fitness Goal</p>
                  <p className="font-semibold text-[#202828]">{openDetailsModal.goal || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#455250] uppercase tracking-wider mb-1">Experience Level</p>
                  <p className="font-semibold text-[#202828]">{openDetailsModal.originalUser?.experienceLevel || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#455250] uppercase tracking-wider mb-1">Pref. Training</p>
                  <p className="font-semibold text-[#202828]">{openDetailsModal.originalUser?.preferredTraining || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#455250] uppercase tracking-wider mb-1">Pref. Workout Time</p>
                  <p className="font-semibold text-[#202828]">{openDetailsModal.originalUser?.preferredWorkoutTime || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#455250] uppercase tracking-wider mb-1">Assigned Trainer</p>
                  <p className="font-semibold text-[#202828]">{'You'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-[#202828] mb-3">Recent Bookings</h4>
                {openDetailsModal.sessions && openDetailsModal.sessions.length > 0 ? (
                  <div className="space-y-3">
                    {openDetailsModal.sessions.slice(0, 3).map((s: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-3 border border-[#D3DFDA] rounded-lg">
                        <div>
                          <p className="font-medium text-[#202828]">{new Date(s.date).toLocaleDateString()}</p>
                          <p className="text-sm text-[#455250]">{s.startTime} - {s.endTime} ({s.mode})</p>
                        </div>
                        <span className="text-xs font-bold uppercase">{s.status}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#455250]">No session history available.</p>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-[#D3DFDA] bg-[#F8FAFC] flex justify-end">
              <button 
                onClick={() => setOpenDetailsModal(null)}
                className="px-6 py-2 bg-[#164A4A] text-white rounded-xl font-bold hover:bg-[#C6A77D] transition-colors"
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