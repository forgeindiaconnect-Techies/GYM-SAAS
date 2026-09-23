import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, MoreVertical, MessageSquare, Activity, X } from 'lucide-react';
import { getDb } from '../../utils/mockDb';

const defaultClients = [
  { id: '1', name: 'Sarah Connor', goal: 'Weight Loss', status: 'Active', nextSession: 'Today, 10:00 AM', email: 'sarah@example.com' },
  { id: '2', name: 'Mike Tyson', goal: 'Muscle Gain', status: 'Active', nextSession: 'Tomorrow, 5:00 PM', email: 'mike.t@example.com' },
  { id: '3', name: 'John Doe', goal: 'Endurance', status: 'Inactive', nextSession: 'Not Scheduled', email: 'john@example.com' },
  { id: '4', name: 'Jane Smith', goal: 'Flexibility', status: 'Active', nextSession: 'Oct 20, 08:00 AM', email: 'jane@example.com' },
  { id: '5', name: 'Bruce Wayne', goal: 'Strength', status: 'Active', nextSession: 'Oct 21, 06:00 PM', email: 'bruce@example.com' },
  { id: '6', name: 'Clark Kent', goal: 'General Fitness', status: 'Active', nextSession: 'Oct 22, 07:00 AM', email: 'clark@example.com' },
];

const TrainerAssignedUsers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<any[]>(defaultClients);

  useEffect(() => {
    try {
      const dbMembers = getDb('members');
      if (dbMembers && Array.isArray(dbMembers) && dbMembers.length > 0) {
        const formatted = dbMembers.map((m: any, idx: number) => ({
          id: m.id || String(idx + 10),
          name: m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim() || 'Member',
          goal: m.fitnessGoal || m.plan ? `${m.plan} Plan` : 'General Fitness',
          status: m.status || 'Active',
          nextSession: m.joined ? `Member since ${m.joined}` : 'Scheduled',
          email: m.email || ''
        }));
        setClients(formatted);
      }
    } catch (e) {
      console.error('Failed to load members from storage', e);
    }
  }, []);

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
          <h1 className="text-3xl font-bold">Assigned Users</h1>
          <p className="text-[#4A514D]">
            {searchTerm.trim()
              ? `Showing ${filteredClients.length} of ${clients.length} active clients`
              : `Manage your ${clients.length} active clients`}
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A514D]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search clients..."
            className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl pl-10 pr-10 py-2 text-sm focus:outline-none focus:border-[#34483F] transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8ADA9] hover:text-[#202522]"
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-12 text-center">
          <Users size={48} className="mx-auto text-[#A8ADA9] mb-3" />
          <h3 className="text-lg font-bold text-[#202522]">No clients found</h3>
          <p className="text-sm text-[#4A514D] mt-1">
            No active clients matching &quot;{searchTerm}&quot;.
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-4 px-4 py-2 bg-[#34483F] text-white font-medium text-sm rounded-xl hover:bg-[#C6A77D] transition-colors"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div
              key={client.id || client.name}
              className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-5 hover:border-[#34483F]/30 transition-colors relative group"
            >
              <button className="absolute top-4 right-4 text-[#4A514D] hover:text-[#202522]">
                <MoreVertical size={18} />
              </button>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#E8E5DA] rounded-full flex items-center justify-center font-bold text-lg text-[#202522]">
                  {client.name ? client.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#202522]">{client.name}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      client.status === 'Active'
                        ? 'bg-green-500/10 text-green-600'
                        : 'bg-[#8FA89B]/10 text-[#8FA89B]'
                    }`}
                  >
                    {client.status}
                  </span>
                </div>
              </div>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[#4A514D]">Goal:</span>
                  <span className="font-medium text-[#202522]">{client.goal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#4A514D]">Next Session:</span>
                  <span className="font-medium text-[#34483F]">{client.nextSession}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/trainer/member-progress')}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#34483F]/10 hover:bg-[#34483F]/20 text-[#34483F] rounded-xl text-sm font-bold transition-colors"
                >
                  <Activity size={16} /> Progress
                </button>
                <button
                  onClick={() => navigate('/trainer/messages')}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#E8E5DA] hover:bg-[#CBD5E1] text-[#202522] rounded-xl text-sm font-bold transition-colors"
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