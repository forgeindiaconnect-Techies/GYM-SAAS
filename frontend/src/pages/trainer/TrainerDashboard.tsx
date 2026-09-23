import { Users, FileQuestion, IndianRupee, Calendar, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const TrainerDashboard = () => {
  const { user } = useAuth();
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, <span className="text-[#34483F]">{user?.firstName || 'Trainer'}!</span></h1>
        <p className="text-[#4A514D]">Here's your coaching overview for today.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: 'Active Clients', value: '24', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Pending Requests', value: '5', icon: FileQuestion, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Today\'s Sessions', value: '4', icon: Calendar, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'This Month Earnings', value: '₹2,450', icon: IndianRupee, color: 'text-[#34483F]', bg: 'bg-[#34483F]/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-5 hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
            <h3 className="text-[#4A514D] text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold text-[#202522] mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Upcoming Sessions</h2>
            <Link to="/trainer/session-bookings" className="text-sm text-[#34483F] hover:underline font-semibold">View All →</Link>
          </div>
          <div className="space-y-4">
            {[
              { client: 'Sarah Connor', type: '1-on-1 Online', time: '10:00 AM', duration: '60 min' },
              { client: 'John Doe', type: 'Offline Training', time: '02:00 PM', duration: '45 min' },
              { client: 'Mike Tyson', type: 'Group Class', time: '05:00 PM', duration: '90 min' },
            ].map((session, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl hover:border-[#34483F]/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#E8E5DA] flex items-center justify-center text-sm font-bold">
                    {session.client[0]}
                  </div>
                  <div>
                    <h4 className="font-bold">{session.client}</h4>
                    <p className="text-xs text-[#4A514D]">{session.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#34483F]">{session.time}</div>
                  <div className="text-xs text-[#4A514D]">{session.duration}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6">Recent Client Progress</h2>
          <div className="space-y-6">
            {[
              { name: 'Sarah Connor', goal: 'Weight Loss', status: '+2kg lost this week' },
              { name: 'Mike Tyson', goal: 'Muscle Gain', status: 'Hit new PR on bench' },
              { name: 'John Doe', goal: 'Endurance', status: 'Ran 5k in 25 mins' },
            ].map((prog, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="mt-1 text-[#34483F]"><TrendingUp size={18} /></div>
                <div>
                  <h4 className="font-bold text-sm">{prog.name}</h4>
                  <p className="text-xs text-[#4A514D] mt-1"><span className="text-[#202522]">Goal:</span> {prog.goal}</p>
                  <p className="text-xs text-green-500 mt-1">{prog.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;