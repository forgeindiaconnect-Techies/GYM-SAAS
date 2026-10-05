import { useState, useEffect } from 'react';
import { Users, FileQuestion, IndianRupee, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const TrainerDashboard = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/trainer-sessions/trainer');
        if (res.data.success) {
          setSessions(res.data.sessions || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  
  const uniqueClients = new Set(sessions.map(s => s.customerId?._id).filter(Boolean)).size;
  const pendingRequests = sessions.filter(s => s.status === 'Pending').length;
  const todaySessions = sessions.filter(s => (s.status === 'Confirmed' || s.status === 'Upcoming' || s.status === 'Completed') && s.date === todayStr).length;
  const thisMonthEarnings = sessions.filter(s => s.paymentStatus === 'Paid' && !['Refunded', 'Refund Pending'].includes(s.status)).reduce((acc, curr) => acc + (curr.fee || 0), 0);

  const upcomingSessions = sessions
    .filter(s => ['Pending', 'Awaiting Payment', 'Confirmed', 'Upcoming'].includes(s.status))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#202828] tracking-tight">Welcome back, <span className="text-[#164A4A]">{user?.firstName || 'Trainer'}!</span></h1>
        <p className="text-[#455250] mt-1">Here's your coaching overview, active clients, and today's schedule.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#164A4A]" size={40} /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'Active Clients', value: uniqueClients.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-500/10' },
              { label: 'Pending Requests', value: pendingRequests.toString(), icon: FileQuestion, color: 'text-amber-600', bg: 'bg-amber-500/10' },
              { label: 'Today\'s Sessions', value: todaySessions.toString(), icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
              { label: 'Total Earnings', value: `₹${thisMonthEarnings.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-[#164A4A]', bg: 'bg-[#164A4A]/10' },
            ].map((stat, i) => (
              <div key={i} className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-5 flex items-center space-x-4 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[#455250] text-xs font-semibold uppercase tracking-wider truncate">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-[#202828] mt-0.5">{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6 flex flex-col h-full shadow-sm">
              <div className="flex justify-between items-center mb-5 border-b border-[#D3DFDA] pb-4">
                <h2 className="text-xl font-bold text-[#202828]">Upcoming Sessions</h2>
                <Link to="/trainer/session-bookings" className="text-xs text-[#164A4A] hover:underline font-semibold flex items-center gap-1">
                  View All Sessions →
                </Link>
              </div>
              <div className="space-y-3 flex-1">
                {upcomingSessions.length === 0 ? (
                  <div className="text-center py-12 text-[#455250] flex flex-col items-center justify-center">
                    <Calendar className="text-[#D3DFDA] mb-2" size={36} />
                    <p className="text-sm font-medium">No upcoming sessions scheduled.</p>
                  </div>
                ) : (
                  upcomingSessions.map((session) => (
                    <div key={session._id} className="flex items-center justify-between p-3.5 bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl hover:border-[#164A4A]/50 transition-colors">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-full bg-[#164A4A]/10 text-[#164A4A] flex items-center justify-center text-sm font-bold overflow-hidden shrink-0">
                          {session.customerId?.profilePhoto ? (
                            <img src={session.customerId.profilePhoto} alt="profile" className="w-full h-full object-cover" />
                          ) : (
                            session.customerId?.firstName?.charAt(0) || 'U'
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#202828]">{session.customerId ? `${session.customerId.firstName} ${session.customerId.lastName}` : 'Client'}</h4>
                          <p className="text-xs text-[#455250]">{session.mode} Session</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm text-[#164A4A]">{new Date(session.date).toLocaleDateString()}</div>
                        <div className="text-xs text-[#455250]">{session.startTime} ({session.duration || 60}m)</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6 flex flex-col h-full shadow-sm">
              <div className="flex justify-between items-center mb-5 border-b border-[#D3DFDA] pb-4">
                <h2 className="text-xl font-bold text-[#202828]">Recent Client Progress</h2>
                <span className="text-xs text-[#687B78] font-medium">Highlights</span>
              </div>
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                {[
                  { name: 'Sarah Connor', goal: 'Weight Loss', status: '+2kg lost this week' },
                  { name: 'Mike Tyson', goal: 'Muscle Gain', status: 'Hit new PR on bench' },
                  { name: 'Alex Johnson', goal: 'Endurance', status: 'Completed 10km run' }
                ].map((prog, i) => (
                  <div key={i} className="flex gap-3.5 items-start p-3 bg-[#F8FAF9] rounded-xl border border-[#D3DFDA]/60">
                    <div className="mt-0.5 text-[#164A4A] bg-[#164A4A]/10 p-2 rounded-lg">
                      <TrendingUp size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#202828]">{prog.name}</h4>
                      <p className="text-xs text-[#455250] mt-0.5"><span className="font-medium text-[#202828]">Goal:</span> {prog.goal}</p>
                      <p className="text-xs text-emerald-600 font-semibold mt-0.5">{prog.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TrainerDashboard;