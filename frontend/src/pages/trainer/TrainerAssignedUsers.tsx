import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, MoreVertical, MessageSquare, Activity, X } from 'lucide-react';
import api from '../../utils/api';

const TrainerAssignedUsers = () => {
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
                goal: 'General Fitness',
                status: 'Active',
                email: s.customerId.email || '',
                profilePhoto: s.customerId.profilePhoto,
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
          <h1 className="text-3xl font-bold text-[#344B4A]">Assigned Users</h1>
          <p className="text-[#697778]">
            {searchTerm.trim()
              ? `Showing ${filteredClients.length} of ${clients.length} active clients`
              : `Manage your ${clients.length} active clients`}
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#697778]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search clients..."
            className="w-full bg-[#FFFFFF] border border-[#D9E2E3] rounded-xl pl-10 pr-10 py-2 text-sm focus:outline-none focus:border-[#167D78] transition-colors text-[#344B4A]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#697778] hover:text-[#344B4A]"
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#697778]">Loading clients...</div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#D9E2E3] rounded-2xl p-12 text-center">
          <Users size={48} className="mx-auto text-[#697778] mb-3" />
          <h3 className="text-lg font-bold text-[#344B4A]">No clients found</h3>
          <p className="text-sm text-[#697778] mt-1">
            {searchTerm ? `No active clients matching "${searchTerm}".` : 'You have no assigned clients yet.'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 px-4 py-2 bg-[#167D78] text-white font-medium text-sm rounded-xl hover:bg-[#116660] transition-colors"
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
              className="bg-[#FFFFFF] border border-[#D9E2E3] rounded-2xl p-5 hover:shadow-sm transition-shadow flex flex-col relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#E8EFF0] rounded-full flex items-center justify-center font-bold text-[#167D78] border border-[#D9E2E3] overflow-hidden">
                    {client.profilePhoto ? (
                      <img src={client.profilePhoto} alt={client.name} className="w-full h-full object-cover" />
                    ) : (
                      client.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#344B4A] leading-tight">{client.name}</h3>
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
                    className="text-[#697778] hover:text-[#344B4A] transition-colors"
                  >
                    <MoreVertical size={18} />
                  </button>
                  {openMenu === client.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-[#D9E2E3] rounded-xl shadow-lg overflow-hidden z-10">
                      <button 
                        onClick={() => { navigate('/trainer/session-bookings'); setOpenMenu(null); }}
                        className="w-full text-left px-4 py-3 text-sm text-[#344B4A] hover:bg-[#E8EFF0] transition-colors"
                      >
                        View Sessions
                      </button>
                      <button 
                        onClick={() => { alert('Assign Workout Plan feature coming soon!'); setOpenMenu(null); }}
                        className="w-full text-left px-4 py-3 text-sm text-[#344B4A] hover:bg-[#E8EFF0] transition-colors border-t border-[#D9E2E3]"
                      >
                        Assign Workout Plan
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#697778]">Goal:</span>
                  <span className="font-medium text-[#344B4A]">{client.goal}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#697778]">Next Session:</span>
                  <span className="font-medium text-[#167D78]">{client.nextSession}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-[#D9E2E3]">
                <button
                  onClick={() => navigate(`/trainer/member-progress?userId=${client.id}`)}
                  className="flex items-center justify-center gap-2 py-2 bg-[#E8EFF0] text-[#344B4A] text-sm font-semibold rounded-xl border border-[#D9E2E3] hover:bg-[#D8EAE7] transition-colors"
                >
                  <Activity size={16} /> Progress
                </button>
                <button
                  onClick={() => navigate(`/trainer/messages?userId=${client.id}`)}
                  className="flex items-center justify-center gap-2 py-2 bg-[#D8EAE7] text-[#344B4A] text-sm font-semibold rounded-xl hover:bg-[#D9E2E3] transition-colors"
                >
                  <MessageSquare size={16} /> Chat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrainerAssignedUsers;