import { useState, useEffect } from 'react';
import { getDb } from '../../utils/mockDb';
import { Building2, FileText, CheckCircle, XCircle, AlertTriangle, Activity, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import PlatformPortalsSection from '../../components/common/PlatformPortalsSection';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({ active: 0, approved: 0, pending: 0, suspended: 0, rejected: 0 });
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/users');
      if (res.data.success) {
        const owners = res.data.users.filter((u: any) => u.role === 'GYM_OWNER');
        setActivities(owners.slice(0, 8));
      }

      setStats({
        active: getDb('gyms').length,
        approved: getDb('gymApplications').filter((a: any) => a.status === 'Approved').length,
        pending: getDb('gymApplications').filter((a: any) => a.status === 'Pending').length,
        suspended: getDb('gymApplications').filter((a: any) => a.status === 'Suspended').length,
        rejected: getDb('gymApplications').filter((a: any) => a.status === 'Rejected').length,
      });
    } catch (err) {
      console.error('Failed to fetch recent activity', err);
    }
  };

  const cards = [
    { title: 'Active Gyms', value: stats.active, icon: Activity, color: 'text-[#F5FAFA]', bg: 'bg-[#1B2728]' },
    { title: 'Approved Gyms', value: stats.approved, icon: CheckCircle, color: 'text-[#34D399]', bg: 'bg-[#34D399]/10' },
    { title: 'Pending Gyms', value: stats.pending, icon: FileText, color: 'text-[#2DD4BF]', bg: 'bg-[#2DD4BF]/10' },
    { title: 'Suspended Gyms', value: stats.suspended, icon: AlertTriangle, color: 'text-[#2DD4BF]', bg: 'bg-[#2DD4BF]/10' },
    { title: 'Rejected Gyms', value: stats.rejected, icon: XCircle, color: 'text-[#C43D35]', bg: 'bg-[#C43D35]/10' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#F5FAFA] tracking-tight">Super Admin Dashboard</h1>
        <p className="text-[#9AAEAE] mt-1">Platform overview and gym onboarding metrics.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((c, i) => (
          <div key={i} className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-5 flex items-center space-x-3.5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center ${c.bg} ${c.color}`}>
              <c.icon size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-[#9AAEAE] text-xs font-semibold uppercase tracking-wider truncate">{c.title}</p>
              <h3 className="text-2xl font-bold text-[#F5FAFA] mt-0.5">{c.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Quick Actions */}
        <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-6 flex flex-col h-full shadow-sm">
          <div className="flex items-center justify-between mb-5 border-b border-[#2A3A3A] pb-4">
            <h2 className="text-xl font-bold text-[#F5FAFA]">Onboarding Actions</h2>
            <span className="text-xs text-[#9AAEAE] font-medium">Quick Access</span>
          </div>
          <div className="grid grid-cols-2 gap-4 flex-1">
            <Link to="/super-admin/gyms/add" className="flex flex-col items-center justify-center p-5 bg-[#141D1E] border border-[#2A3A3A] rounded-xl hover:border-[#2DD4BF] hover:bg-[#1B2728]/30 transition-all text-center group">
              <div className="w-12 h-12 rounded-xl bg-[#1B2728] text-[#F5FAFA] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Building2 size={24} />
              </div>
              <span className="font-semibold text-sm text-[#F5FAFA]">Add Gym Manually</span>
            </Link>
            <Link to="/super-admin/gym-owners" className="flex flex-col items-center justify-center p-5 bg-[#141D1E] border border-[#2A3A3A] rounded-xl hover:border-[#2DD4BF] hover:bg-[#1B2728]/30 transition-all text-center group">
              <div className="w-12 h-12 rounded-xl bg-[#1B2728] text-[#F5FAFA] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FileText size={24} />
              </div>
              <span className="font-semibold text-sm text-[#F5FAFA]">Review Approvals</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-6 flex flex-col h-full shadow-sm">
          <div className="flex justify-between items-center mb-5 border-b border-[#2A3A3A] pb-4">
            <h2 className="text-xl font-bold text-[#F5FAFA]">Recent Registrations</h2>
          </div>
          {activities.length > 0 ? (
            <div className="flex-1 space-y-3 max-h-[320px] overflow-y-auto pr-1 divide-y divide-[#2A3A3A]/40">
              {activities.map((user: any, idx: number) => (
                <div key={idx} className="flex items-center space-x-3.5 p-3 rounded-xl hover:bg-[#0E1415] transition-colors pt-3">
                  <div className="w-3 h-3 rounded-full shrink-0 bg-[#2DD4BF]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#F5FAFA] font-bold truncate">
                      {user.gymId?.name ? user.gymId.name : `${user.firstName} ${user.lastName}`}
                    </p>
                    <p className="text-xs text-[#9AAEAE] mt-0.5 truncate">
                      {user.email} • {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 border ${user.approvalStatus === 'APPROVED' ? 'bg-green-500/10 text-green-700 border-green-500/20' : user.approvalStatus === 'PENDING' ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' : 'bg-[#1B2728] text-[#C1D0D0] border-[#2A3A3A]'}`}>
                    {user.approvalStatus}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 text-center flex flex-col items-center justify-center text-[#9AAEAE] py-12">
              <BarChart size={40} className="mb-2 opacity-40 text-[#2DD4BF]" />
              <p className="text-sm font-medium">No recent gym owner registrations.</p>
            </div>
          )}
        </div>
      </div>

      {/* Role Portals & Ecosystem Section */}
      <PlatformPortalsSection currentDashboard="SUPER_ADMIN" />
    </div>
  );
};

export default SuperAdminDashboard;
