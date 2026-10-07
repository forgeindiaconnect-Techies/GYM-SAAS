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
    { title: 'Rejected Gyms', value: stats.rejected, icon: XCircle, color: 'text-[#FED7AA]', bg: 'bg-red-500/10' },
    { title: 'Total Customers', value: stats.customers, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#292524] tracking-tight">Super Admin Dashboard</h1>
        <p className="text-[#78716C] mt-1">Platform overview and gym onboarding metrics.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((c, i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-5 flex items-center space-x-3.5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center ${c.bg} ${c.color}`}>
              <c.icon size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-[#78716C] text-xs font-semibold uppercase tracking-wider truncate">{c.title}</p>
              <h3 className="text-2xl font-bold text-[#292524] mt-0.5">{c.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Quick Actions */}
        <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 flex flex-col h-full shadow-sm">
          <div className="flex items-center justify-between mb-5 border-b border-[#E7E5E4] pb-4">
            <h2 className="text-xl font-bold text-[#292524]">Onboarding Actions</h2>
            <span className="text-xs text-[#78716C] font-medium">Quick Access</span>
          </div>
          <div className="grid grid-cols-2 gap-4 flex-1">
            <Link to="/super-admin/gyms/add" className="flex flex-col items-center justify-center p-5 bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl hover:border-[#F97316] hover:bg-[#F97316]/5 transition-all text-center group">
              <div className="w-12 h-12 rounded-xl bg-[#F97316]/10 text-[#F97316] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Building2 size={24} />
              </div>
              <span className="font-semibold text-sm text-[#292524]">Add Gym Manually</span>
            </Link>
            <Link to="/super-admin/customers" className="flex flex-col items-center justify-center p-5 bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl hover:border-[#F97316] hover:bg-[#F97316]/5 transition-all text-center group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Users size={24} />
              </div>
              <span className="font-semibold text-sm text-[#292524]">View Customers</span>
            </Link>
            <Link to="/super-admin/gym-owners" className="flex flex-col items-center justify-center p-5 bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl hover:border-[#F97316] hover:bg-[#F97316]/5 transition-all text-center group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FileText size={24} />
              </div>
              <span className="font-semibold text-sm text-[#292524]">Review Approvals</span>
            </Link>
            <Link to="/super-admin/invitations" className="flex flex-col items-center justify-center p-5 bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl hover:border-[#F97316] hover:bg-[#F97316]/5 transition-all text-center group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Send size={24} />
              </div>
              <span className="font-semibold text-sm text-[#292524]">View Invitations</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 flex flex-col h-full shadow-sm">
          <div className="flex justify-between items-center mb-5 border-b border-[#E7E5E4] pb-4">
            <h2 className="text-xl font-bold text-[#292524]">Recent Registrations</h2>
            <div className="flex space-x-1 bg-[#FFFDF8] p-1 rounded-xl border border-[#E7E5E4]">
              <button 
                onClick={() => setRegistrationTab('owners')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${registrationTab === 'owners' ? 'bg-[#F97316] text-white shadow-sm' : 'text-[#78716C] hover:text-[#292524]'}`}
              >
                Gym Owners
              </button>
              <button 
                onClick={() => setRegistrationTab('customers')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${registrationTab === 'customers' ? 'bg-[#F97316] text-white shadow-sm' : 'text-[#78716C] hover:text-[#292524]'}`}
              >
                Customers
              </button>
            </div>
          </div>
          {activities[registrationTab].length > 0 ? (
            <div className="flex-1 space-y-3 max-h-[320px] overflow-y-auto pr-1 divide-y divide-[#E7E5E4]/40">
              {activities[registrationTab].map((user: any, idx: number) => (
                <div key={idx} className="flex items-center space-x-3.5 p-3 rounded-xl hover:bg-[#F9FBFA] transition-colors pt-3">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${user.role === 'GYM_OWNER' ? 'bg-[#F97316]' : 'bg-blue-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#292524] font-bold truncate">
                      {user.role === 'GYM_OWNER' 
                        ? (user.gymId?.name ? user.gymId.name : `${user.firstName} ${user.lastName}`) 
                        : `${user.firstName} ${user.lastName}`}
                    </p>
                    <p className="text-xs text-[#78716C] mt-0.5 truncate">
                      {user.email} • {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 border ${user.approvalStatus === 'APPROVED' ? 'bg-green-500/10 text-green-700 border-green-500/20' : user.approvalStatus === 'PENDING' ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                    {user.approvalStatus}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 text-center flex flex-col items-center justify-center text-[#78716C] py-12">
              <BarChart size={40} className="mb-2 opacity-40 text-[#F97316]" />
              <p className="text-sm font-medium">No recent {registrationTab === 'owners' ? 'gym owner' : 'customer'} registrations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
