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
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, <span className="text-[#164A4A]">{user?.firstName || 'Trainer'}!</span></h1>
        <p className="text-[#455250]">Here's your coaching overview for today.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#164A4A]" size={40} /></div>
      ) : (
        <>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: 'Active Clients', value: uniqueClients.toString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Pending Requests', value: pendingRequests.toString(), icon: FileQuestion, color: 'text-orange-500', bg: 'bg-orange-500/10' },
              { label: 'Today\'s Sessions', value: todaySessions.toString(), icon: Calendar, color: 'text-green-500', bg: 'bg-green-500/10' },
              { label: 'Total Earnings', value: `₹${thisMonthEarnings.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-[#164A4A]', bg: 'bg-[#164A4A]/10' },
            ].map((stat, i) => (
              <div key={i} className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-5 hover:-translate-y-1 transition-transform">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                </div>
                <h3 className="text-[#455250] text-sm font-medium">{stat.label}</h3>
                <p className="text-2xl font-bold text-[#202828] mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Upcoming Sessions</h2>
                <Link to="/trainer/session-bookings" className="text-sm text-[#164A4A] hover:underline font-semibold">View All →</Link>
              </div>
              <div className="space-y-4">
                {upcomingSessions.length === 0 ? (
                  <div className="text-center py-8 text-[#455250]">No upcoming sessions.</div>
                ) : (
                  upcomingSessions.map((session, i) => (
                    <div key={session._id} className="flex items-center justify-between p-4 bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl hover:border-[#164A4A]/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#E8E5DA] flex items-center justify-center text-sm font-bold overflow-hidden">
                          {session.customerId?.profilePhoto ? (
                            <img src={session.customerId.profilePhoto} alt="profile" className="w-full h-full object-cover" />
                          ) : (
                            session.customerId?.firstName?.charAt(0) || 'U'
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold">{session.customerId ? `${session.customerId.firstName} ${session.customerId.lastName}` : 'Unknown'}</h4>
                          <p className="text-xs text-[#455250]">{session.mode} Session</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#164A4A]">{new Date(session.date).toLocaleDateString()}</div>
                        <div className="text-xs text-[#455250]">{session.startTime} ({session.duration}m)</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">Recent Client Progress</h2>
              <div className="space-y-6">
                {/* Mock data for progress since progress module isn't connected to sessions yet */}
                {[
                  { name: 'Sarah Connor', goal: 'Weight Loss', status: '+2kg lost this week' },
                  { name: 'Mike Tyson', goal: 'Muscle Gain', status: 'Hit new PR on bench' },
                ].map((prog, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="mt-1 text-[#164A4A]"><TrendingUp size={18} /></div>
                    <div>
                      <h4 className="font-bold text-sm">{prog.name}</h4>
                      <p className="text-xs text-[#455250] mt-1"><span className="text-[#202828]">Goal:</span> {prog.goal}</p>
                      <p className="text-xs text-green-500 mt-1">{prog.status}</p>
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