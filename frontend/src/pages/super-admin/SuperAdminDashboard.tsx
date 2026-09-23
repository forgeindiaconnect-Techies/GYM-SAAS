import { useState, useEffect } from 'react';
import { getDb } from '../../utils/mockDb';
import { Building2, FileText, Users, Send, CheckCircle, XCircle, AlertTriangle, Activity, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({ active: 0, approved: 0, pending: 0, suspended: 0, rejected: 0, customers: 0 });
  const [activities, setActivities] = useState<{ customers: any[], owners: any[] }>({ customers: [], owners: [] });
  const [registrationTab, setRegistrationTab] = useState<'customers' | 'owners'>('owners');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch recent users (Customers and Gym Owners)
      const res = await api.get('/users');
      let customerCount = 0;
      if (res.data.success) {
        // Filter out Super Admins, sort by createdAt descending
        const customers = res.data.users
          .filter((u: any) => u.role === 'MEMBER');
        const owners = res.data.users
          .filter((u: any) => u.role === 'GYM_OWNER');
          
        customerCount = customers.length;
        setActivities({ customers: customers.slice(0, 8), owners: owners.slice(0, 8) });
      }

      setStats({
        active: getDb('gyms').length,
        approved: getDb('gymApplications').filter((a: any) => a.status === 'Approved').length,
        pending: getDb('gymApplications').filter((a: any) => a.status === 'Pending').length,
        suspended: getDb('gymApplications').filter((a: any) => a.status === 'Suspended').length,
        rejected: getDb('gymApplications').filter((a: any) => a.status === 'Rejected').length,
        customers: customerCount
      });
    } catch (err) {
      console.error('Failed to fetch recent activity', err);
    }
  };

  const cards = [
    { title: 'Active Gyms', value: stats.active, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Approved Gyms', value: stats.approved, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'Pending Gyms', value: stats.pending, icon: FileText, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { title: 'Suspended Gyms', value: stats.suspended, icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { title: 'Rejected Gyms', value: stats.rejected, icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
    { title: 'Total Customers', value: stats.customers, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#202522] tracking-tight">Super Admin Dashboard</h1>
        <p className="text-[#4A514D] mt-1">Platform overview and gym onboarding metrics.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {cards.map((c, i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6 flex items-center space-x-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${c.bg} ${c.color}`}>
              <c.icon size={28} />
            </div>
            <div>
              <p className="text-[#4A514D] text-sm font-medium">{c.title}</p>
              <h3 className="text-2xl font-bold text-[#202522]">{c.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-[#202522] mb-6 border-b border-[#DCD9CD] pb-4">Onboarding Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/super-admin/gyms/add" className="flex flex-col items-center justify-center p-6 bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl hover:border-[#8FA89B] hover:bg-[#8FA89B]/5 transition-all text-center">
              <Building2 size={32} className="text-[#8FA89B] mb-3" />
              <span className="font-semibold text-[#202522]">Add Gym Manually</span>
            </Link>
            <Link to="/super-admin/customers" className="flex flex-col items-center justify-center p-6 bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl hover:border-[#8FA89B] hover:bg-[#8FA89B]/5 transition-all text-center">
              <Users size={32} className="text-[#8FA89B] mb-3" />
              <span className="font-semibold text-[#202522]">View Customers</span>
            </Link>
            <Link to="/super-admin/gym-owners" className="flex flex-col items-center justify-center p-6 bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl hover:border-[#8FA89B] hover:bg-[#8FA89B]/5 transition-all text-center">
              <FileText size={32} className="text-[#8FA89B] mb-3" />
              <span className="font-semibold text-[#202522]">Review Approvals</span>
            </Link>
            <Link to="/super-admin/invitations" className="flex flex-col items-center justify-center p-6 bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl hover:border-[#8FA89B] hover:bg-[#8FA89B]/5 transition-all text-center">
              <Send size={32} className="text-[#8FA89B] mb-3" />
              <span className="font-semibold text-[#202522]">View Invitations</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6 border-b border-[#DCD9CD] pb-4">
            <h2 className="text-xl font-bold text-[#202522]">Recent Registrations</h2>
            <div className="flex space-x-2 bg-[#FFFFFF] p-1 rounded-lg border border-[#DCD9CD]">
              <button 
                onClick={() => setRegistrationTab('owners')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${registrationTab === 'owners' ? 'bg-[#34483F] text-white' : 'text-[#4A514D] hover:text-[#202522]'}`}
              >
                Gym Owners
              </button>
              <button 
                onClick={() => setRegistrationTab('customers')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${registrationTab === 'customers' ? 'bg-blue-500 text-white' : 'text-[#4A514D] hover:text-[#202522]'}`}
              >
                Customers
              </button>
            </div>
          </div>
          {activities[registrationTab].length > 0 ? (
            <div className="flex-1 space-y-4 custom-scrollbar overflow-y-auto pr-2">
              {activities[registrationTab].map((user: any, idx: number) => (
                <div key={idx} className="flex items-center space-x-4 p-4 bg-[#FFFFFF] rounded-xl border border-[#DCD9CD] hover:border-[#34483F]/30 transition-colors">
                  <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] ${user.role === 'GYM_OWNER' ? 'bg-[#34483F] shadow-[#34483F]/50' : 'bg-blue-500 shadow-blue-500/50'}`} />
                  <div className="flex-1">
                    <p className="text-sm text-[#202522] font-semibold">
                      {user.role === 'GYM_OWNER' 
                        ? (user.gymId?.name ? `Gym Application: ${user.gymId.name}` : `New Gym Owner: ${user.firstName} ${user.lastName}`) 
                        : `New Customer: ${user.firstName} ${user.lastName}`}
                    </p>
                    <p className="text-xs text-[#4A514D] mt-1">
                      {user.role === 'GYM_OWNER' ? `Owner: ${user.firstName} ${user.lastName} • ` : ''}
                      Email: {user.email} • Registered: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${user.approvalStatus === 'APPROVED' ? 'bg-green-500/10 text-green-500' : user.approvalStatus === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-[#E8E5DA] text-[#4A514D]'}`}>
                    {user.approvalStatus}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 space-y-4 text-center flex flex-col items-center justify-center text-[#4A514D]">
              <BarChart size={48} className="mb-4 opacity-50" />
              <p>No recent {registrationTab === 'owners' ? 'gym owner' : 'customer'} registrations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
