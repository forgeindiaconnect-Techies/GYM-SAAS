import { useState, useEffect, useMemo } from 'react';
import { BarChart3, TrendingUp, Users, UserMinus, Download, Loader2, IndianRupee, Calendar } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PLAN_COLORS = [
  'bg-[#F97316]',
  'bg-blue-500',
  'bg-purple-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500'
];

const GymAdminReports = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<'1week' | '1month' | '1year'>('1month');
  const [loading, setLoading] = useState(true);

  // Real data state
  const [members, setMembers] = useState<any[]>([]);
  const [, setMemberships] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [storeSales, setStoreSales] = useState<any[]>([]);
  const [gymDetails, setGymDetails] = useState<any>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const branchParam = user?.branchId ? `?branchId=${user.branchId}` : '';
        const userBranchParam = user?.branchId ? `&branchId=${user.branchId}` : '';
        const [usersRes, membershipsRes, paymentsRes, salesRes, gymRes] = await Promise.all([
          api.get(`/users?role=MEMBER${userBranchParam}`).catch(() => ({ data: { users: [] } })),
          api.get(`/memberships/gym${branchParam}`).catch(() => ({ data: { memberships: [] } })),
          api.get(`/payments/gym${branchParam}`).catch(() => ({ data: { payments: [] } })),
          api.get(`/store/admin/sales${branchParam}`).catch(() => ({ data: { sales: [] } })),
          user?.gymId ? api.get(`/gyms/${user.gymId}`).catch(() => ({ data: { gym: null } })) : Promise.resolve({ data: { gym: null } })
        ]);

        const userList = usersRes.data?.users || [];
        const memList = membershipsRes.data?.memberships || [];
        const payList = paymentsRes.data?.payments || [];
        const saleList = salesRes.data?.sales || [];

        setMembers(userList);
        setMemberships(memList);
        setPayments(payList);
        setStoreSales(saleList);
        if (gymRes.data?.gym) {
          setGymDetails(gymRes.data.gym);
        }
      } catch (err) {
        console.error('Failed to load analytics data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [user?.branchId, user?.gymId]);

  // Filter cutoff based on selected timeframe
  const cutoffDate = useMemo(() => {
    const now = new Date();
    if (timeframe === '1week') {
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    if (timeframe === '1month') {
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    return new Date(now.getFullYear(), 0, 1); // Start of current year
  }, [timeframe]);

  // Calculations
  const metrics = useMemo(() => {
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.approvalStatus === 'APPROVED' || m.status === 'Active' || m.subscriptionStatus === 'ACTIVE' || m.subscriptionStatus === 'FREE_TRIAL').length;
    const inactiveMembers = Math.max(0, totalMembers - activeMembers);

    const newMembersInPeriod = members.filter(m => new Date(m.createdAt) >= cutoffDate).length;

    const retentionRate = totalMembers > 0
      ? Number(((activeMembers / totalMembers) * 100).toFixed(1))
      : 100.0;

    const churnRate = totalMembers > 0
      ? Number(((inactiveMembers / totalMembers) * 100).toFixed(1))
      : 0.0;

    // Membership revenue (approved payments)
    const membershipRevenue = payments
      .filter(p => p.status === 'Approved' || p.status === 'APPROVED' || p.status === 'Paid')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    // Store sales revenue
    const storeRevenue = storeSales.reduce((sum, s) => sum + (Number(s.totalAmount || s.total || 0)), 0);

    const totalRevenue = membershipRevenue + storeRevenue;

    const avgLifetimeValue = totalMembers > 0
      ? Number((totalRevenue / totalMembers).toFixed(2))
      : 0;

    return {
      totalMembers,
      activeMembers,
      inactiveMembers,
      newMembersInPeriod,
      retentionRate,
      churnRate,
      membershipRevenue,
      storeRevenue,
      totalRevenue,
      avgLifetimeValue
    };
  }, [members, payments, storeSales, cutoffDate]);

  // Monthly Growth for current calendar year (Jan - Dec)
  const monthlyGrowth = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const counts = Array(12).fill(0);

    members.forEach(m => {
      const d = new Date(m.createdAt);
      if (d.getFullYear() === currentYear) {
        counts[d.getMonth()] += 1;
      }
    });

    const maxCount = Math.max(...counts, 1);

    return counts.map((count, index) => {
      const percent = count > 0 ? Math.max(15, Math.round((count / maxCount) * 100)) : 6;
      return {
        month: MONTH_NAMES[index],
        count,
        heightPercent: percent
      };
    });
  }, [members]);

  // Distribution by Plan Type
  const planDistribution = useMemo(() => {
    if (members.length === 0) {
      return [{ name: 'No Members Enrolled', count: 0, percentage: 0 }];
    }

    const planCounts: Record<string, number> = {};

    members.forEach(m => {
      const planName = m.subscriptionPlan || (m.customerType === 'TRIAL' ? 'Free Trial' : 'General');
      planCounts[planName] = (planCounts[planName] || 0) + 1;
    });

    const total = members.length;
    return Object.entries(planCounts).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100)
    })).sort((a, b) => b.count - a.count);
  }, [members]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const gymName = gymDetails?.name || 'Gym Center';
    
    // Header
    doc.setFillColor(22, 74, 74);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`${gymName} — Analytics & Reports`, 14, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 140, 20);

    // Summary Metrics Table
    doc.setTextColor(32, 40, 40);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Performance Indicators', 14, 42);

    autoTable(doc, {
      startY: 47,
      head: [['KPI Metric', 'Current Value', 'Status / Insights']],
      body: [
        ['Total Registered Members', `${metrics.totalMembers}`, `${metrics.activeMembers} Active · ${metrics.inactiveMembers} Inactive`],
        ['Retention Rate', `${metrics.retentionRate}%`, 'Based on active vs lapsed memberships'],
        ['Churn Rate', `${metrics.churnRate}%`, 'Inactive / non-renewed member percentage'],
        ['Total Revenue (All Time)', `Rs. ${metrics.totalRevenue.toLocaleString('en-IN')}`, `Store: Rs. ${metrics.storeRevenue.toLocaleString('en-IN')} · Memberships: Rs. ${metrics.membershipRevenue.toLocaleString('en-IN')}`],
        ['Avg. Member Lifetime Value', `Rs. ${metrics.avgLifetimeValue.toLocaleString('en-IN')}`, 'Average revenue generated per member']
      ],
      theme: 'grid',
      headStyles: { fillColor: [22, 74, 74], textColor: [255, 255, 255], fontStyle: 'bold' }
    });

    // Plan Distribution Table
    const lastY = (doc as any).lastAutoTable?.finalY || 100;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Membership Plan Breakdown', 14, lastY + 14);

    const planRows = planDistribution.map(p => [
      p.name,
      `${p.count} member(s)`,
      `${p.percentage}%`
    ]);

    autoTable(doc, {
      startY: lastY + 18,
      head: [['Plan Name', 'Total Subscribers', 'Share of Total']],
      body: planRows,
      theme: 'grid',
      headStyles: { fillColor: [22, 74, 74], textColor: [255, 255, 255], fontStyle: 'bold' }
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 160;
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('This report reflects live real-time metrics generated directly from your gym management platform.', 14, finalY + 12);

    doc.save(`Gym_Analytics_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 space-y-4">
        <Loader2 className="w-10 h-10 text-[#F97316] animate-spin" />
        <p className="text-sm font-semibold text-[#78716C]">Loading real-time gym analytics & reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#292524] tracking-tight">Analytics & Reports</h1>
          <p className="text-[#78716C] mt-1">Deep insights into your gym's performance, member retention, and revenue.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="px-4 py-2.5 bg-white border border-[#E7E5E4] text-[#292524] text-sm font-bold rounded-xl hover:border-[#F97316] transition-colors outline-none cursor-pointer appearance-none pr-8 shadow-xs"
            >
              <option value="1week">One Week</option>
              <option value="1month">One Month</option>
              <option value="1year">One Year</option>
            </select>
            <Calendar className="w-4 h-4 text-[#78716C] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 bg-[#F97316] text-white text-sm font-bold rounded-xl hover:bg-[#EA580C] transition-colors flex items-center gap-2 shadow-md shadow-[#F97316]/20 cursor-pointer"
          >
            <Download size={16} /> Export PDF
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Members */}
        <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 hover:border-[#F97316]/30 transition-all shadow-xs">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Users size={24} />
          </div>
          <p className="text-[#78716C] font-semibold text-xs uppercase tracking-wider mb-1">Total Members</p>
          <h3 className="text-3xl font-black text-[#292524]">{metrics.totalMembers.toLocaleString('en-IN')}</h3>
          <p className="text-emerald-700 text-xs font-bold mt-2 flex items-center gap-1">
            <TrendingUp size={14} /> {metrics.activeMembers} Active · {metrics.inactiveMembers} Inactive
          </p>
        </div>

        {/* Retention Rate */}
        <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 hover:border-[#F97316]/30 transition-all shadow-xs">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <BarChart3 size={24} />
          </div>
          <p className="text-[#78716C] font-semibold text-xs uppercase tracking-wider mb-1">Retention Rate</p>
          <h3 className="text-3xl font-black text-[#292524]">{metrics.retentionRate}%</h3>
          <p className="text-emerald-700 text-xs font-bold mt-2 flex items-center gap-1">
            <TrendingUp size={14} /> Active member ratio
          </p>
        </div>

        {/* Churn Rate */}
        <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 hover:border-[#F97316]/30 transition-all shadow-xs">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center mb-4">
            <UserMinus size={24} />
          </div>
          <p className="text-[#78716C] font-semibold text-xs uppercase tracking-wider mb-1">Churn Rate</p>
          <h3 className="text-3xl font-black text-[#292524]">{metrics.churnRate}%</h3>
          <p className="text-[#78716C] text-xs font-medium mt-2">
            Non-renewing / inactive members
          </p>
        </div>

        {/* Avg Lifetime Value */}
        <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 hover:border-[#F97316]/30 transition-all shadow-xs">
          <div className="w-12 h-12 bg-purple-500/10 text-purple-600 rounded-xl flex items-center justify-center mb-4">
            <IndianRupee size={24} />
          </div>
          <p className="text-[#78716C] font-semibold text-xs uppercase tracking-wider mb-1">Avg. Lifetime Value</p>
          <h3 className="text-3xl font-black text-[#292524]">₹{metrics.avgLifetimeValue.toLocaleString('en-IN')}</h3>
          <p className="text-purple-700 text-xs font-bold mt-2 flex items-center gap-1">
            Total Revenue: ₹{metrics.totalRevenue.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Charts & Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Membership Growth Bar Chart */}
        <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-3 mb-6">
              <h3 className="text-lg font-bold text-[#292524]">Membership Growth ({new Date().getFullYear()})</h3>
              <span className="text-xs font-semibold text-[#78716C]">
                {metrics.newMembersInPeriod} new in selected period
              </span>
            </div>

            <div className="h-64 flex items-end justify-between gap-1.5 pt-6 pb-2">
              {monthlyGrowth.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#292524] text-white text-xs px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-md">
                    {item.month}: {item.count} member(s)
                  </div>
                  
                  {/* Bar */}
                  <div
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      item.count > 0 ? 'bg-[#F97316] group-hover:bg-[#EA580C]' : 'bg-[#FED7AA]/60'
                    }`}
                    style={{ height: `${item.heightPercent}%` }}
                  />
                  
                  {/* Label */}
                  <span className="text-[11px] font-semibold text-[#78716C] mt-2 block group-hover:text-[#292524]">
                    {item.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-[#78716C] mt-2 text-center">
            Monthly member registrations throughout {new Date().getFullYear()}
          </p>
        </div>

        {/* Revenue & Member Share by Plan Type */}
        <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-3 mb-6">
              <h3 className="text-lg font-bold text-[#292524]">Members by Plan Type</h3>
              <span className="text-xs font-semibold text-[#78716C]">
                {planDistribution.length} Active Plan(s)
              </span>
            </div>

            <div className="space-y-5">
              {planDistribution.map((plan, idx) => {
                const colorClass = PLAN_COLORS[idx % PLAN_COLORS.length];
                return (
                  <div key={plan.name} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-[#292524] capitalize">
                        {plan.name}
                        <span className="text-xs text-[#78716C] font-normal ml-2">({plan.count} members)</span>
                      </span>
                      <span className="font-bold text-[#F97316]">{plan.percentage}%</span>
                    </div>
                    <div className="w-full bg-[#FFFDF8] rounded-full h-3 overflow-hidden">
                      <div
                        className={`${colorClass} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(5, plan.percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-[#E7E5E4] flex justify-between text-xs text-[#78716C]">
            <span>Store Sales Revenue: <strong>₹{metrics.storeRevenue.toLocaleString('en-IN')}</strong></span>
            <span>Membership Revenue: <strong>₹{metrics.membershipRevenue.toLocaleString('en-IN')}</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GymAdminReports;
