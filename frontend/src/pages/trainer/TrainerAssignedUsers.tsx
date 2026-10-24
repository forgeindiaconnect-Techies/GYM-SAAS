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
          <h1 className="text-3xl font-bold text-[#F5FAFA]">Assigned Users</h1>
          <p className="text-[#9AAEAE]">
            {searchTerm.trim()
              ? `Showing ${filteredClients.length} of ${clients.length} active clients`
              : `Manage your ${clients.length} active clients`}
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AAEAE]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search clients..."
            className="w-full bg-[#101819] border border-[#2A3A3A] rounded-xl pl-10 pr-10 py-2 text-sm focus:outline-none focus:border-[#2DD4BF] transition-colors text-[#F5FAFA] placeholder:text-[#9AAEAE]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AAEAE] hover:text-[#FFFFFF]"
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#9AAEAE]">Loading clients...</div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-12 text-center">
          <Users size={48} className="mx-auto text-[#9AAEAE] mb-3" />
          <h3 className="text-lg font-bold text-[#F5FAFA]">No clients found</h3>
          <p className="text-sm text-[#9AAEAE] mt-1">
            {searchTerm ? `No active clients matching "${searchTerm}".` : 'You have no assigned clients yet.'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 px-4 py-2 bg-[#2DD4BF] text-[#06201D] font-bold font-medium text-sm rounded-xl hover:bg-[#5EEAD4] transition-colors"
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
              className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-5 hover:border-[#2DD4BF]/40 transition-all flex flex-col relative shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#0E1415] rounded-full flex items-center justify-center font-bold text-[#2DD4BF] border border-[#2A3A3A] overflow-hidden">
                    {client.profilePhoto ? (
                      <img src={client.profilePhoto} alt={client.name} className="w-full h-full object-cover" />
                    ) : (
                      client.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#F5FAFA] leading-tight">{client.name}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 font-medium ${
                        client.status === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-[#1B2728] text-[#C1D0D0]'
                      }`}
                    >
                      {client.status}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setOpenMenu(openMenu === client.id ? null : client.id)}
                    className="text-[#9AAEAE] hover:text-[#FFFFFF] transition-colors"
                  >
                    <MoreVertical size={18} />
                  </button>
                  {openMenu === client.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#141D1E] border border-[#2A3A3A] rounded-xl shadow-lg overflow-hidden z-10">
                      <button 
                        onClick={() => { navigate('/trainer/session-bookings'); setOpenMenu(null); }}
                        className="w-full text-left px-4 py-3 text-sm text-[#F5FAFA] hover:bg-[#0E1415] transition-colors"
                      >
                        View Sessions
                      </button>
                      <button 
                        onClick={() => { alert('Assign Workout Plan feature coming soon!'); setOpenMenu(null); }}
                        className="w-full text-left px-4 py-3 text-sm text-[#F5FAFA] hover:bg-[#0E1415] transition-colors border-t border-[#2A3A3A]"
                      >
                        Assign Workout Plan
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#9AAEAE]">Goal:</span>
                  <span className="font-medium text-[#F5FAFA]">{client.goal}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#9AAEAE]">Next Session:</span>
                  <span className="font-medium text-[#2DD4BF]">{client.nextSession}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-[#2A3A3A]">
                <button
                  onClick={() => navigate(`/trainer/member-progress?userId=${client.id}`)}
                  className="flex items-center justify-center gap-2 py-2 bg-[#0E1415] text-[#F5FAFA] text-sm font-semibold rounded-xl border border-[#2A3A3A] hover:bg-[#1B2728] transition-colors"
                >
                  <Activity size={16} /> Progress
                </button>
                <button
                  onClick={() => navigate(`/trainer/messages?userId=${client.id}`)}
                  className="flex items-center justify-center gap-2 py-2 bg-[#1B2728] text-[#F5FAFA] text-sm font-semibold rounded-xl hover:bg-[#2A3A3A] transition-colors"
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