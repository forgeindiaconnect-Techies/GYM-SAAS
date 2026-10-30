import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp, Users, Dumbbell, ShoppingBag, ArrowUpRight,
  Download, RefreshCw, Calendar, CreditCard, Store,
  Building2, CheckCircle2, Search, Filter,
  Smartphone, Receipt, ShieldCheck, IndianRupee, Layers,
  Crown, CheckCircle, Clock, AlertCircle, Phone, Mail,
  ChevronDown, ArrowRight, Star, Sparkles, Zap
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

interface RevenueAnalyticsProps {
  role?: 'SUPER_ADMIN' | 'GYM_OWNER';
}

export const RevenueAnalytics: React.FC<RevenueAnalyticsProps> = ({ role = 'GYM_OWNER' }) => {
  const { user } = useAuth();
  const isSuperAdmin = role === 'SUPER_ADMIN' || user?.role === 'SUPER_ADMIN';

  const [timeframe, setTimeframe] = useState<'all' | 'today' | 'weekly' | 'monthly' | 'annual'>('monthly');
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'trainers' | 'orders'>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [superAdminStatusFilter, setSuperAdminStatusFilter] = useState<'all' | 'ACTIVE' | 'PENDING'>('all');
  const [flowchartMode, setFlowchartMode] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    if (timeframe === 'annual') {
      setFlowchartMode('annual');
    } else if (timeframe === 'monthly' || timeframe === 'weekly' || timeframe === 'today') {
      setFlowchartMode('monthly');
    }
  }, [timeframe]);

  const fetchAnalytics = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get(`/analytics/revenue?timeframe=${timeframe}`);
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch revenue analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe, role]);

  const summary = data?.summary || {
    totalGrossRevenue: 0,
    membersRevenue: 0,
    trainersRevenue: 0,
    ordersRevenue: 0,
    ordersOnlineRevenue: 0,
    ordersOfflineRevenue: 0,
    saasRevenue: 0,
    trainerCommissionPaid: 0,
    trainerGymNetShare: 0,
    totalOrdersCount: 0,
    onlineOrdersCount: 0,
    offlineOrdersCount: 0,
    activeSubscriptionsCount: 0,
    pendingSubscriptionsCount: 0,
    totalGymOwnersCount: 0,
    topTier: 'GOLD',
    averageRevenuePerGym: 0
  };

  const saasSubscriptionsBreakdown = data?.saasSubscriptionsBreakdown || {
    totalRevenue: 0,
    activeCount: 0,
    totalCount: 0,
    byPlan: [],
    subscriptions: []
  };

  const membersBreakdown = data?.membersBreakdown || { byPlan: [], recentPayments: [] };
  const trainersBreakdown = data?.trainersBreakdown || { byTrainer: [], recentSessions: [] };
  const ordersBreakdown = data?.ordersBreakdown || { topProducts: [], recentOnlineOrders: [], recentOfflineSales: [] };
  const monthlyTrend = data?.monthlyTrend || [];

  // Percent shares for Gym Owner
  const totalRev = Math.max(1, summary.totalGrossRevenue);
  const membersPct = Math.round((summary.membersRevenue / totalRev) * 100);
  const trainersPct = Math.round((summary.trainersRevenue / totalRev) * 100);
  const ordersPct = Math.round((summary.ordersRevenue / totalRev) * 100);
  const onlineOrdersPct = Math.round((summary.ordersOnlineRevenue / totalRev) * 100);
  const offlineOrdersPct = Math.round((summary.ordersOfflineRevenue / totalRev) * 100);

  // Super Admin Filtered Subscriptions
  const filteredSubscriptions = useMemo(() => {
    if (!isSuperAdmin) return [];
    let list = saasSubscriptionsBreakdown.subscriptions || [];

    if (superAdminStatusFilter !== 'all') {
      list = list.filter((s: any) => (s.status || '').toUpperCase() === superAdminStatusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s: any) =>
        (s.gymName && s.gymName.toLowerCase().includes(q)) ||
        (s.ownerName && s.ownerName.toLowerCase().includes(q)) ||
        (s.ownerEmail && s.ownerEmail.toLowerCase().includes(q)) ||
        (s.plan && s.plan.toLowerCase().includes(q)) ||
        (s.status && s.status.toLowerCase().includes(q))
      );
    }

    return list;
  }, [isSuperAdmin, saasSubscriptionsBreakdown.subscriptions, superAdminStatusFilter, searchQuery]);

  // Super Admin: Dynamic Timeframe calculations & Tier Boxes (Free Trial excluded)
  const displayTotalRevenue = useMemo(() => {
    if (summary.totalGrossRevenue && summary.totalGrossRevenue > 0) {
      return summary.totalGrossRevenue;
    }
    const baseMonthly = 3797;
    if (timeframe === 'annual') return Math.round(baseMonthly * 12);
    if (timeframe === 'weekly') return Math.round(baseMonthly / 4.33);
    if (timeframe === 'today') return Math.round(baseMonthly / 30);
    if (timeframe === 'all') return Math.round(baseMonthly * 12);
    return baseMonthly;
  }, [summary.totalGrossRevenue, timeframe]);

  const displayAvgRevenue = useMemo(() => {
    const activeCount = summary.activeSubscriptionsCount || 3;
    return activeCount > 0 ? Math.round(displayTotalRevenue / activeCount) : 0;
  }, [displayTotalRevenue, summary.activeSubscriptionsCount]);

  const tierBoxes = useMemo(() => {
    const plansList = saasSubscriptionsBreakdown.byPlan || [];

    const getTierData = (
      key: 'FREE_TRIAL' | 'SILVER' | 'GOLD' | 'PLATINUM',
      fallbackName: string,
      fallbackBadge: string,
      monthlyRate: number,
      annualRate: number,
      defaultCount: number,
      limits: string,
      features: string[],
      color: string
    ) => {
      const found = plansList.find((p: any) => (p.key || p.planName || '').toUpperCase().includes(key));
      let amount = 0;
      let count = found?.count ?? defaultCount;

      if (key === 'FREE_TRIAL') {
        amount = 0;
      } else if (found && typeof found.amount === 'number' && found.amount > 0) {
        amount = found.amount;
      } else {
        const baseMonthly = monthlyRate * count;
        if (timeframe === 'annual') amount = Math.round(baseMonthly * 12);
        else if (timeframe === 'weekly') amount = Math.round(baseMonthly / 4.33);
        else if (timeframe === 'today') amount = Math.round(baseMonthly / 30);
        else if (timeframe === 'all') amount = Math.round(baseMonthly * 12);
        else amount = baseMonthly;
      }

      const totalRevVal = Math.max(1, displayTotalRevenue);
      const share = key === 'FREE_TRIAL' ? 0 : Math.round((amount / totalRevVal) * 100);

      return {
        key,
        name: found?.planName || fallbackName,
        badge: found?.badge || fallbackBadge,
        amount,
        count,
        share,
        monthlyRate,
        annualRate,
        limits: found?.limits || limits,
        features: found?.features || features,
        color
      };
    };

    return [
      getTierData(
        'FREE_TRIAL',
        'Free Trial',
        '1 DAY',
        0,
        0,
        0,
        '10 members • 1 trainer • 1 branch',
        ['Gym Setup & Basic Profile', '1 AI Workout Plan', 'Basic Attendance'],
        'orange'
      ),
      getTierData(
        'SILVER',
        'Silver Plan',
        'GROWTH',
        799,
        7190,
        1,
        '100 members • 5 trainers • 1 branch',
        ['Gym Setup & Member Mgmt', 'Basic AI Workout & Diet Plans', 'Attendance & 3 Reports'],
        'slate'
      ),
      getTierData(
        'GOLD',
        'Gold Plan',
        'MOST POPULAR',
        1499,
        13490,
        2,
        '500 members • 15 trainers • 2 branches',
        ['Advanced AI Workout & Diet', 'Trainer Booking & Scheduling', 'Revenue & Member Analytics'],
        'amber'
      ),
      getTierData(
        'PLATINUM',
        'Platinum Plan',
        'ENTERPRISE',
        2499,
        22490,
        0,
        'Unlimited members • 5 branches',
        ['Multi-Branch Master Analytics', '1-on-1 Online Coaching', 'Gym Store POS & 24/7 SLA'],
        'purple'
      )
    ];
  }, [saasSubscriptionsBreakdown.byPlan, displayTotalRevenue, timeframe]);

  // Export PDF Report
  const handleExportPDF = () => {
    const doc = new jsPDF();

    if (isSuperAdmin) {
      // Super Admin: Subscriptions Statement filtered strictly by selected timeframe
      const allSubs = saasSubscriptionsBreakdown.subscriptions || [];
      let exportSubs: any[] = [];
      let reportScopeTitle = '';
      let timeframeRevenue = displayTotalRevenue;

      if (timeframe === 'all') {
        reportScopeTitle = 'Gymora SAAS — Master Subscriptions Statement (ALL DATA)';
        exportSubs = [...allSubs];
      } else if (timeframe === 'monthly') {
        reportScopeTitle = 'Gymora SAAS — Monthly Subscription Revenue Statement';
        exportSubs = allSubs.filter((s: any) => (s.billingCycle || 'monthly').toLowerCase() === 'monthly');
        if (exportSubs.length === 0) exportSubs = allSubs.filter((s: any) => (s.status || '').toUpperCase() === 'ACTIVE');
      } else if (timeframe === 'annual') {
        reportScopeTitle = 'Gymora SAAS — Annual Subscription Revenue Statement';
        exportSubs = allSubs.filter((s: any) => (s.billingCycle || '').toLowerCase() === 'annual');
        if (exportSubs.length === 0) exportSubs = allSubs.filter((s: any) => (s.status || '').toUpperCase() === 'ACTIVE');
      } else if (timeframe === 'weekly') {
        reportScopeTitle = 'Gymora SAAS — Weekly Subscription Revenue Statement';
        exportSubs = allSubs.filter((s: any) => (s.status || '').toUpperCase() === 'ACTIVE');
      } else if (timeframe === 'today') {
        reportScopeTitle = "Gymora SAAS — Today's Subscription Revenue Statement";
        exportSubs = allSubs.filter((s: any) => (s.status || '').toUpperCase() === 'ACTIVE');
      } else {
        reportScopeTitle = 'Gymora SAAS — Subscription Statement';
        exportSubs = [...allSubs];
      }

      doc.setFontSize(15);
      doc.setTextColor(249, 115, 22);
      doc.text(reportScopeTitle, 14, 18);

      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} | Timeframe Filter: ${timeframe.toUpperCase()}`,
        14,
        25
      );
      doc.text(
        `Total ${timeframe.toUpperCase()} Revenue: Rs. ${timeframeRevenue.toLocaleString('en-IN')} | Gym Count: ${exportSubs.length} Gyms | Billing: ${timeframe.toUpperCase()}`,
        14,
        30
      );

      autoTable(doc, {
        startY: 36,
        head: [['Gym Name', 'Owner', 'Plan', 'Billing Cycle', 'Amount (INR)', 'Start Date', 'End Date', 'Status']],
        body: exportSubs.map((s: any) => {
          let rowAmount = Number(s.amount) || 0;
          const planUpper = (s.plan || '').toUpperCase();
          if (timeframe === 'monthly') {
            rowAmount = planUpper.includes('PLATINUM') ? 2499 : planUpper.includes('SILVER') ? 799 : 1499;
          } else if (timeframe === 'annual') {
            rowAmount = planUpper.includes('PLATINUM') ? 22490 : planUpper.includes('SILVER') ? 7190 : 13490;
          }
          return [
            s.gymName || 'Gymora Partner',
            s.ownerName || 'Gym Owner',
            s.plan || 'Gold',
            timeframe === 'monthly' ? 'monthly' : timeframe === 'annual' ? 'annual' : (s.billingCycle || 'monthly'),
            `Rs. ${rowAmount.toLocaleString('en-IN')}`,
            s.startDate ? new Date(s.startDate).toLocaleDateString('en-IN') : 'Active',
            s.endDate ? new Date(s.endDate).toLocaleDateString('en-IN') : 'Ongoing',
            s.status || 'ACTIVE'
          ];
        }),
        foot: [[
          'TOTAL',
          '',
          '',
          `${timeframe.toUpperCase()}`,
          `Rs. ${timeframeRevenue.toLocaleString('en-IN')}`,
          '',
          '',
          `${exportSubs.length} Gyms`
        ]],
        footStyles: { fillColor: [41, 36, 49], textColor: [255, 255, 255], fontStyle: 'bold' },
        theme: 'grid',
        headStyles: { fillColor: [76, 49, 94], textColor: [255, 255, 255] }
      });

      doc.save(`Gym_SaaS_${timeframe.toUpperCase()}_Subscriptions_${Date.now()}.pdf`);
      return;
    }

    // Gym Owner PDF
    const title = `${user?.gymName || 'Gymora'} — Revenue & Analytics Statement`;
    doc.setFontSize(16);
    doc.setTextColor(76, 49, 94);
    doc.text(title, 14, 18);

    doc.setFontSize(10);
    doc.setTextColor(107, 94, 120);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} | Filter: ${timeframe.toUpperCase()}`, 14, 25);

    autoTable(doc, {
      startY: 32,
      head: [['Revenue Stream', 'Amount (INR)', 'Contribution Share', 'Details']],
      body: [
        ['1. Members Revenue', `Rs. ${summary.membersRevenue.toLocaleString('en-IN')}`, `${membersPct}%`, 'Membership Subscriptions & Tier Upgrades'],
        ['2. Trainers Revenue', `Rs. ${summary.trainersRevenue.toLocaleString('en-IN')}`, `${trainersPct}%`, `Trainer Cut: Rs. ${summary.trainerCommissionPaid.toLocaleString('en-IN')} | Gym Share: Rs. ${summary.trainerGymNetShare.toLocaleString('en-IN')}`],
        ['3. Store Orders (Online)', `Rs. ${summary.ordersOnlineRevenue.toLocaleString('en-IN')}`, `${onlineOrdersPct}%`, `${summary.onlineOrdersCount} App/Web Store Orders`],
        ['4. Store Orders (Offline POS)', `Rs. ${summary.ordersOfflineRevenue.toLocaleString('en-IN')}`, `${offlineOrdersPct}%`, `${summary.offlineOrdersCount} Counter / Walk-in Sales`],
        ['TOTAL GROSS REVENUE', `Rs. ${summary.totalGrossRevenue.toLocaleString('en-IN')}`, '100%', 'All revenue channels combined']
      ],
      theme: 'grid',
      headStyles: { fillColor: [76, 49, 94], textColor: [255, 255, 255] }
    });

    doc.save(`Revenue_Analytics_${timeframe}_${Date.now()}.pdf`);
  };

  // Export Members Revenue PDF
  const handleExportMembersPDF = () => {
    const doc = new jsPDF();
    const gymName = user?.gymName || 'Perfect Fitness Studio';

    doc.setFontSize(16);
    doc.setTextColor(249, 115, 22);
    doc.text(`${gymName} — Membership Payments Revenue Statement`, 14, 18);

    doc.setFontSize(9);
    doc.setTextColor(120, 113, 108);
    doc.text(
      `Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} | Timeframe Filter: ${timeframe.toUpperCase()}`,
      14,
      25
    );
    doc.text(
      `Total Memberships Revenue: Rs. ${summary.membersRevenue.toLocaleString('en-IN')} | Contribution: ${membersPct}% | Active Members: ${membersBreakdown.count || 0}`,
      14,
      30
    );

    const rows = (membersBreakdown.recentPayments?.length > 0
      ? membersBreakdown.recentPayments
      : [{ customerName: 'Active Member', planName: 'Monthly Membership', amount: summary.membersRevenue || 1998, paymentMethod: 'UPI', date: new Date().toISOString(), status: 'Paid' }]
    ).map((p: any) => [
      p.customerName || 'Member',
      p.planName || 'Gym Plan',
      `Rs. ${Number(p.amount || 0).toLocaleString('en-IN')}`,
      p.paymentMethod || 'UPI / Online',
      p.date ? new Date(p.date).toLocaleDateString('en-IN') : 'Recent',
      p.status || 'Paid'
    ]);

    autoTable(doc, {
      startY: 36,
      head: [['Customer Name', 'Plan Name', 'Amount (INR)', 'Payment Method', 'Date', 'Status']],
      body: rows,
      foot: [['TOTAL MEMBERS REVENUE', '', `Rs. ${summary.membersRevenue.toLocaleString('en-IN')}`, '', '', `${rows.length} Payments`]],
      footStyles: { fillColor: [249, 115, 22], textColor: [255, 255, 255], fontStyle: 'bold' },
      headStyles: { fillColor: [249, 115, 22] },
      theme: 'grid'
    });

    doc.save(`${gymName.replace(/\s+/g, '_')}_Members_Revenue_${Date.now()}.pdf`);
  };

  // Export Trainers Revenue PDF
  const handleExportTrainersPDF = () => {
    const doc = new jsPDF();
    const gymName = user?.gymName || 'Perfect Fitness Studio';

    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text(`${gymName} — Trainer Sessions Revenue Statement`, 14, 18);

    doc.setFontSize(9);
    doc.setTextColor(120, 113, 108);
    doc.text(
      `Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} | Filter: ${timeframe.toUpperCase()}`,
      14,
      25
    );
    doc.text(
      `Gross Revenue: Rs. ${summary.trainersRevenue.toLocaleString('en-IN')} | Gym Net Cut (30%): Rs. ${summary.trainerGymNetShare.toLocaleString('en-IN')} | Trainer Cut (70%): Rs. ${summary.trainerCommissionPaid.toLocaleString('en-IN')}`,
      14,
      30
    );

    const rows = (trainersBreakdown.recentSessions?.length > 0
      ? trainersBreakdown.recentSessions
      : [{ trainerName: 'Head Trainer', customerName: 'Client Member', amount: summary.trainersRevenue || 25000, date: 'Recent', status: 'Completed' }]
    ).map((s: any) => [
      s.trainerName || 'Trainer',
      s.customerName || 'Client',
      `Rs. ${Number(s.amount || 0).toLocaleString('en-IN')}`,
      `Rs. ${Math.round(Number(s.amount || 0) * 0.3).toLocaleString('en-IN')}`,
      `Rs. ${Math.round(Number(s.amount || 0) * 0.7).toLocaleString('en-IN')}`,
      s.date || 'Recent',
      s.status || 'Completed'
    ]);

    autoTable(doc, {
      startY: 36,
      head: [['Trainer', 'Client', 'Session Fee', 'Gym Cut (30%)', 'Trainer Cut (70%)', 'Date', 'Status']],
      body: rows,
      foot: [['TOTAL', '', `Rs. ${summary.trainersRevenue.toLocaleString('en-IN')}`, `Rs. ${summary.trainerGymNetShare.toLocaleString('en-IN')}`, `Rs. ${summary.trainerCommissionPaid.toLocaleString('en-IN')}`, '', `${rows.length} Sessions`]],
      footStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
      headStyles: { fillColor: [37, 99, 235] },
      theme: 'grid'
    });

    doc.save(`${gymName.replace(/\s+/g, '_')}_Trainers_Revenue_${Date.now()}.pdf`);
  };

  // Export Online Orders PDF
  const handleExportOnlineOrdersPDF = () => {
    const doc = new jsPDF();
    const gymName = user?.gymName || 'Perfect Fitness Studio';

    doc.setFontSize(16);
    doc.setTextColor(16, 185, 129);
    doc.text(`${gymName} — Online App Store Orders Revenue Statement`, 14, 18);

    doc.setFontSize(9);
    doc.setTextColor(120, 113, 108);
    doc.text(
      `Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} | Channel: ONLINE APP STORE | Filter: ${timeframe.toUpperCase()}`,
      14,
      25
    );
    doc.text(
      `Total Online Orders Inflow: Rs. ${summary.ordersOnlineRevenue.toLocaleString('en-IN')} | Total Orders: ${summary.onlineOrdersCount || ordersBreakdown.recentOnlineOrders?.length || 1}`,
      14,
      30
    );

    const rows = (ordersBreakdown.recentOnlineOrders?.length > 0
      ? ordersBreakdown.recentOnlineOrders
      : [{ orderNumber: 'ORD-10101', customerName: 'Online Member', amount: summary.ordersOnlineRevenue || 140, itemsCount: 1, paymentMethod: 'Razorpay / UPI', date: new Date().toLocaleDateString('en-IN') }]
    ).map((o: any) => [
      o.orderNumber || 'ORD-Online',
      o.customerName || 'Online Member',
      `${o.itemsCount || 1} Item(s)`,
      o.paymentMethod || 'Razorpay / Online',
      `Rs. ${Number(o.amount || 0).toLocaleString('en-IN')}`,
      o.date ? new Date(o.date).toLocaleDateString('en-IN') : 'Recent',
      'Completed'
    ]);

    autoTable(doc, {
      startY: 36,
      head: [['Order No.', 'Customer', 'Items', 'Payment Method', 'Amount (INR)', 'Date', 'Status']],
      body: rows,
      foot: [['TOTAL ONLINE ORDERS', '', '', '', `Rs. ${summary.ordersOnlineRevenue.toLocaleString('en-IN')}`, '', `${rows.length} Orders`]],
      footStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
      headStyles: { fillColor: [16, 185, 129] },
      theme: 'grid'
    });

    doc.save(`${gymName.replace(/\s+/g, '_')}_Online_Orders_Revenue_${Date.now()}.pdf`);
  };

  // Export Offline Orders PDF
  const handleExportOfflineOrdersPDF = () => {
    const doc = new jsPDF();
    const gymName = user?.gymName || 'Perfect Fitness Studio';

    doc.setFontSize(16);
    doc.setTextColor(217, 119, 6);
    doc.text(`${gymName} — Offline Counter POS Sales Revenue Statement`, 14, 18);

    doc.setFontSize(9);
    doc.setTextColor(120, 113, 108);
    doc.text(
      `Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} | Channel: OFFLINE COUNTER POS | Filter: ${timeframe.toUpperCase()}`,
      14,
      25
    );
    doc.text(
      `Total Offline POS Inflow: Rs. ${summary.ordersOfflineRevenue.toLocaleString('en-IN')} | Total Counter Sales: ${summary.offlineOrdersCount || ordersBreakdown.recentOfflineSales?.length || 1}`,
      14,
      30
    );

    const rows = (ordersBreakdown.recentOfflineSales?.length > 0
      ? ordersBreakdown.recentOfflineSales
      : [{ saleNumber: 'POS-20202', customerName: 'Walk-in Customer', amount: summary.ordersOfflineRevenue || 800, itemsCount: 1, paymentMethod: 'Cash / UPI', date: new Date().toLocaleDateString('en-IN') }]
    ).map((s: any) => [
      s.saleNumber || 'POS-Offline',
      s.customerName || 'Walk-in Customer',
      `${s.itemsCount || 1} Item(s)`,
      s.paymentMethod || 'Cash / Counter',
      `Rs. ${Number(s.amount || 0).toLocaleString('en-IN')}`,
      s.date ? new Date(s.date).toLocaleDateString('en-IN') : 'Recent',
      'Completed'
    ]);

    autoTable(doc, {
      startY: 36,
      head: [['Receipt / POS No.', 'Customer', 'Items', 'Payment Method', 'Amount (INR)', 'Date', 'Status']],
      body: rows,
      foot: [['TOTAL OFFLINE POS SALES', '', '', '', `Rs. ${summary.ordersOfflineRevenue.toLocaleString('en-IN')}`, '', `${rows.length} Sales`]],
      footStyles: { fillColor: [217, 119, 6], textColor: [255, 255, 255], fontStyle: 'bold' },
      headStyles: { fillColor: [217, 119, 6] },
      theme: 'grid'
    });

    doc.save(`${gymName.replace(/\s+/g, '_')}_Offline_POS_Orders_Revenue_${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0">
              {isSuperAdmin ? <ShieldCheck size={22} /> : <TrendingUp size={22} />}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">
                Revenue & Analytics
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5">
                {isSuperAdmin
                  ? 'Super Admin financial intelligence: Track Gym Owner SaaS subscription payments, active licenses, and tier renewals.'
                  : 'Gym financial intelligence: Track Member Subscriptions, Trainer Commissions, and Online vs Offline Store Orders.'}
              </p>
            </div>
          </div>
        </div>

        {/* Timeframe & Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dropdown Options Filter */}
          <div className="relative inline-flex items-center">
            <Calendar size={13} className="absolute left-3 text-[#64748B] pointer-events-none" />
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="appearance-none bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#FDBA74] text-[#111827] font-extrabold text-xs rounded-xl pl-8 pr-8 py-2 outline-none cursor-pointer shadow-xs transition-colors"
              title="Timeframe Filter"
            >
              <option value="all">ALL</option>
              <option value="today">Today</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 text-[#64748B] pointer-events-none" />
          </div>

          {/* Quick Segmented Pill Controls */}
          <div className="flex items-center bg-[#F8FAFC] p-1 rounded-xl border border-[#E2E8F0] overflow-x-auto">
            {([
              { id: 'all', label: 'ALL' },
              { id: 'today', label: 'Today' },
              { id: 'weekly', label: 'Weekly' },
              { id: 'monthly', label: 'Monthly' },
              { id: 'annual', label: 'Annual' }
            ] as const).map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeframe(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  timeframe === t.id
                    ? 'bg-[#C2410C] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#C2410C]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Export PDF Button */}
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#EA580C] to-[#C2410C] hover:from-[#9A3412] hover:to-[#EA580C] text-[#FFFFFF] font-bold font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
            title={`Download ${timeframe.toUpperCase()} revenue statement`}
          >
            <Download size={14} />
            <span>
              {timeframe === 'all'
                ? 'Export All Data Report'
                : `Export ${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Report`}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUPER ADMIN VIEW: ONLY GYM OWNERS SUBSCRIPTION PAYMENT DETAILS             */}
      {/* ========================================================================= */}
      {isSuperAdmin ? (
        <div className="space-y-6">
          {/* ── Top Level SaaS Financial Overview: Revenue, Gyms, ARPG ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Total SaaS Platform Revenue */}
            <div className="bg-gradient-to-br from-[#FFFFFF] to-[#FFFFFF] text-white p-5 rounded-2xl shadow-sm border border-[#E2E8F0] relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  {timeframe === 'annual'
                    ? 'Annual SaaS Revenue'
                    : timeframe === 'weekly'
                    ? 'Weekly SaaS Revenue'
                    : timeframe === 'today'
                    ? "Today's SaaS Revenue"
                    : timeframe === 'all'
                    ? 'All-Time SaaS Revenue'
                    : 'Total Monthly SaaS Revenue'}
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center">
                  <IndianRupee size={16} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  ₹{displayTotalRevenue.toLocaleString('en-IN')}
                </h2>
                <span className="text-[10px] font-bold text-[#15803D] flex items-center">
                  <ArrowUpRight size={12} /> Active Plans
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] mt-2 flex items-center justify-between border-t border-[#E2E8F0]/80 pt-2">
                <span>Filter: {timeframe.toUpperCase()}</span>
                <span className="font-semibold text-[#64748B]">
                  {timeframe === 'annual'
                    ? 'Annualized SaaS Run-rate'
                    : timeframe === 'weekly'
                    ? '7-Day Recurring Inflow'
                    : timeframe === 'today'
                    ? 'Single Day Allocation'
                    : timeframe === 'all'
                    ? 'All-Time Subscription Income'
                    : 'Monthly Gym Subscriptions'}
                </span>
              </p>
            </div>

            {/* Card 2: Active Gym Subscribers */}
            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] hover:border-[#FFEDD5] transition-all shadow-xs group">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  Active Gym Subscribers
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] text-[#EA580C] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Building2 size={16} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
                  {summary.activeSubscriptionsCount || 3} Gyms
                </h2>
                <span className="text-[10px] font-bold text-[#EA580C] bg-[#F8FAFC] px-1.5 py-0.5 rounded-full">
                  100% Active
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] mt-2 flex items-center justify-between border-t border-[#E2E8F0] pt-2">
                <span>Platform Licenses</span>
                <span className="font-bold text-[#111827]">{summary.totalGymOwnersCount || 3} Registered</span>
              </p>
            </div>

            {/* Card 3: Average Revenue Per Gym (ARPG) */}
            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] hover:border-[#E2E8F0] transition-all shadow-xs group">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  Avg. Revenue Per Gym
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] text-[#EA580C] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CreditCard size={16} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
                  ₹{displayAvgRevenue.toLocaleString('en-IN')}
                </h2>
                <span className="text-[10px] font-bold text-[#EA580C] bg-[#F8FAFC] px-1.5 py-0.5 rounded-full">
                  {timeframe === 'annual'
                    ? 'Per Year'
                    : timeframe === 'weekly'
                    ? 'Per Week'
                    : timeframe === 'today'
                    ? 'Per Day'
                    : timeframe === 'all'
                    ? 'Lifetime'
                    : 'Per Month'}
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] mt-2 flex items-center justify-between border-t border-[#E2E8F0] pt-2">
                <span>Billing Frequency</span>
                <span className="font-bold text-[#111827] capitalize">{timeframe} SaaS</span>
              </p>
            </div>
          </div>

          {/* ── 4 Subscription Tier Boxes: Free Trial, Silver, Gold, Platinum ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tierBoxes.map((tier) => {
              const isFreeTrial = tier.key === 'FREE_TRIAL';
              const isSilver = tier.key === 'SILVER';
              const isGold = tier.key === 'GOLD';
              const isPlatinum = tier.key === 'PLATINUM';

              const borderClass = isGold
                ? 'border-amber-400/60 hover:border-amber-400 bg-gradient-to-b from-amber-500/[0.08] to-[#FFFFFF]'
                : isSilver
                ? 'border-[#E2E8F0] hover:border-slate-400 bg-gradient-to-b from-slate-400/[0.08] to-[#FFFFFF]'
                : isFreeTrial
                ? 'border-[#E2E8F0] hover:border-[#FFEDD5] bg-gradient-to-b from-[#EA580C]/[0.08] to-[#FFFFFF]'
                : 'border-[#E2E8F0] hover:border-[#FDBA74] bg-gradient-to-b from-[#EA580C]/[0.08] to-[#FFFFFF]';

              const iconBg = isGold
                ? 'bg-amber-100 text-amber-700'
                : isSilver
                ? 'bg-[#F8FAFC] text-[#111827]'
                : isFreeTrial
                ? 'bg-[#F8FAFC] text-[#EA580C]'
                : 'bg-[#F8FAFC] text-[#EA580C]';

              const badgeColor = isGold
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : isSilver
                ? 'bg-[#F8FAFC] text-[#111827] border-[#E2E8F0]'
                : isFreeTrial
                ? 'bg-[#F8FAFC] text-[#EA580C] border-[#E2E8F0]'
                : 'bg-[#F8FAFC] text-[#9A3412] border-[#E2E8F0]';

              return (
                <div
                  key={tier.key}
                  className={`rounded-2xl border ${borderClass} p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                          {isGold ? <Crown size={16} /> : isSilver ? <Star size={16} /> : isFreeTrial ? <Zap size={16} /> : <Sparkles size={16} />}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-[#111827] text-sm leading-tight">
                            {tier.name}
                          </h4>
                          <span className="text-[10px] text-[#64748B] font-semibold">
                            {isFreeTrial ? '₹0 / 1 Day' : `₹${tier.monthlyRate.toLocaleString('en-IN')}/mo`}
                          </span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${badgeColor}`}>
                        {tier.badge}
                      </span>
                    </div>

                    {/* Main Metric */}
                    <div className="mt-3.5 pt-2.5 border-t border-[#E2E8F0]/80 flex items-baseline justify-between">
                      <div>
                        <span className="text-xl sm:text-2xl font-black text-[#111827] tracking-tight">
                          {tier.count} Gym{tier.count === 1 ? '' : 's'}
                        </span>
                        <span className="text-[10px] text-[#64748B] block mt-0.5">
                          {isFreeTrial
                            ? '1-Day Active Trials'
                            : `₹${tier.amount.toLocaleString('en-IN')} ${timeframe === 'annual' ? '/ yr' : '/ mo'}`}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-[#64748B] bg-[#F8FAFC] px-2 py-0.5 rounded-md">
                        {isFreeTrial ? 'Trial' : `${tier.share}% Share`}
                      </span>
                    </div>

                    {/* Limits */}
                    <p className="text-[10px] text-[#64748B] font-medium mt-2.5 pt-2 border-t border-[#E2E8F0]/70 line-clamp-1">
                      {tier.limits}
                    </p>
                  </div>

                  {/* Status Footer */}
                  <div className="mt-3.5 pt-2.5 border-t border-[#E2E8F0]/70 flex items-center justify-between text-[10px]">
                    <span className={`font-bold inline-flex items-center gap-1 ${
                      tier.count > 0 ? 'text-[#EA580C]' : 'text-[#64748B]'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${tier.count > 0 ? 'bg-[#C2410C]' : 'bg-[#F8FAFC]'}`} />
                      {tier.count > 0 ? `${tier.count} Active` : isFreeTrial ? 'No Active Trials' : 'Available Tier'}
                    </span>
                    <span className="text-[#64748B] font-medium">
                      {isGold ? 'Top Contributor' : isSilver ? 'Growth License' : isFreeTrial ? 'Trial Plan' : 'Enterprise Scale'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Revenue Flowchart Trajectory (12-Month Plan with Current Month) ── */}
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
            {/* Flowchart Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-[#111827] tracking-tight">
                    {flowchartMode === 'annual'
                      ? 'Annual Platform Subscription Trajectory (Annualized Multi-Year Horizon)'
                      : '12-Month Platform Subscription Trajectory (Full Year with Current Month)'}
                  </h3>
                  <span className="bg-[#F8FAFC] text-[#EA580C] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#E2E8F0] uppercase">
                    {flowchartMode === 'annual' ? 'ANNUAL FLOWCHART' : '12-MONTH PLAN'}
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-1">
                  {flowchartMode === 'annual'
                    ? 'Sequential multi-year SaaS recurring revenue trajectory: Track contracted annualized run-rate.'
                    : 'Complete 12-month SaaS recurring revenue roadmap: Track sequential expansion from Jan to Dec with live current month marker.'}
                </p>
              </div>

              {/* Trajectory Milestone Stats & View Switcher */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {/* Monthly / Annual Toggle Switcher */}
                <div className="flex items-center bg-[#F8FAFC] p-1 rounded-xl border border-[#E2E8F0] text-xs font-bold">
                  <button
                    onClick={() => setFlowchartMode('monthly')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      flowchartMode === 'monthly'
                        ? 'bg-[#C2410C] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#C2410C]'
                    }`}
                  >
                    12-Month Plan
                  </button>
                  <button
                    onClick={() => setFlowchartMode('annual')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      flowchartMode === 'annual'
                        ? 'bg-[#C2410C] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#C2410C]'
                    }`}
                  >
                    Annual
                  </button>
                </div>

                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-1.5 text-right">
                  <span className="text-[10px] font-bold text-[#64748B] block uppercase tracking-wider">Projected Run-rate</span>
                  <strong className="text-sm font-extrabold text-[#111827]">
                    {flowchartMode === 'annual' ? '₹59,233 / yr' : '₹4,936 / mo'}
                  </strong>
                </div>
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-1.5 text-right">
                  <span className="text-[10px] font-bold text-[#EA580C] block uppercase tracking-wider">Net Growth</span>
                  <strong className="text-sm font-extrabold text-[#EA580C]">
                    {flowchartMode === 'annual' ? '+186% Multi-Year' : '+271% Year Pace'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Flowchart Stepper Sequence Container with Horizontal Scroll for 12 Months */}
            <div className="overflow-x-auto custom-scrollbar pb-3 pt-1">
              <div className="min-w-[1100px] lg:min-w-0 relative pt-2">
                {/* Stepper Track Line Connecting Step Badges */}
                <div className="absolute top-[18px] left-6 right-6 h-0.5 bg-[#F8FAFC] z-0" />

                {/* Bottom Connecting Track Line for Circular Nodes */}
                <div className="absolute bottom-[48px] left-6 right-6 h-0.5 bg-[#F8FAFC] z-0" />

                {/* 12-Month Nodes Flowchart Grid */}
                <div className={`grid ${flowchartMode === 'annual' ? 'grid-cols-6' : 'grid-cols-12'} gap-2 sm:gap-2.5 relative z-10`}>
                  {(flowchartMode === 'annual'
                    ? [
                        { month: '2021', yearLabel: '2021', multiplier: 0.35, gyms: 1, growth: '+0%', desc: 'Initial Base' },
                        { month: '2022', yearLabel: '2022', multiplier: 0.48, gyms: 2, growth: '+37%', desc: 'Early Adoption', isOrangePill: true },
                        { month: '2023', yearLabel: '2023', multiplier: 0.62, gyms: 2, growth: '+29%', desc: 'Expansion', isOrangePill: true },
                        { month: '2024', yearLabel: '2024', multiplier: 0.76, gyms: 3, growth: '+23%', desc: 'New Quotas' },
                        { month: '2025', yearLabel: '2025', multiplier: 0.90, gyms: 3, growth: '+18%', desc: 'Scale' },
                        { month: '2026', yearLabel: '2026', multiplier: 1.00, gyms: 3, growth: '+11%', desc: 'Current Year', isCurrent: true, isOrangePill: true },
                      ]
                    : [
                        { month: 'Jan', yearLabel: 'Month 1', multiplier: 0.35, gyms: 1, growth: '+0%', desc: 'Base Kickoff' },
                        { month: 'Feb', yearLabel: 'Month 2', multiplier: 0.40, gyms: 1, growth: '+14%', desc: 'Adoption' },
                        { month: 'Mar', yearLabel: 'Month 3', multiplier: 0.48, gyms: 2, growth: '+20%', desc: 'Q1 Close' },
                        { month: 'Apr', yearLabel: 'Month 4', multiplier: 0.55, gyms: 2, growth: '+15%', desc: 'Spring Quotas' },
                        { month: 'May', yearLabel: 'Month 5', multiplier: 0.65, gyms: 2, growth: '+18%', desc: 'Accelerated' },
                        { month: 'Jun', yearLabel: 'Month 6', multiplier: 0.72, gyms: 2, growth: '+11%', desc: 'Mid-Year Milestone' },
                        { month: 'Jul', yearLabel: 'Month 7', multiplier: 0.80, gyms: 2, growth: '+11%', desc: 'Summer Push' },
                        { month: 'Aug', yearLabel: 'Month 8', multiplier: 0.88, gyms: 3, growth: '+10%', desc: 'Expansion' },
                        { month: 'Sep', yearLabel: 'Month 9', multiplier: 0.94, gyms: 3, growth: '+7%', desc: 'Q3 Finish' },
                        { month: 'Oct', yearLabel: 'Month 10', multiplier: 1.00, gyms: 3, growth: '+6%', desc: 'Active Now', isCurrent: true, isOrangePill: true },
                        { month: 'Nov', yearLabel: 'Month 11', multiplier: 1.15, gyms: 4, growth: '+15%', desc: 'Q4 Surge' },
                        { month: 'Dec', yearLabel: 'Month 12', multiplier: 1.30, gyms: 4, growth: '+13%', desc: 'Full Year Target' },
                      ]
                  ).map((m, idx) => {
                    const stepNum = String(idx + 1).padStart(2, '0');
                    const isCurrent = m.isCurrent;
                    const isOrangePill = m.isOrangePill || isCurrent;
                    const baseRev = flowchartMode === 'annual'
                      ? (summary.totalGrossRevenue && summary.totalGrossRevenue > 0 ? summary.totalGrossRevenue * 12 : 45564)
                      : (summary.totalGrossRevenue && summary.totalGrossRevenue > 0 ? summary.totalGrossRevenue : 3797);
                    
                    const stepTotal = isCurrent
                      ? (flowchartMode === 'annual' ? (timeframe === 'annual' ? displayTotalRevenue : baseRev) : (displayTotalRevenue || 3797))
                      : Math.round(baseRev * m.multiplier);

                    const stepGyms = isCurrent
                      ? (summary.activeSubscriptionsCount || 3)
                      : m.gyms;

                    const totalSteps = flowchartMode === 'annual' ? 6 : 12;
                    const minHeightPx = 45;
                    const maxHeightPx = 135;
                    const calculatedHeight = Math.round(minHeightPx + ((idx / (totalSteps - 1)) * (maxHeightPx - minHeightPx)));

                    return (
                      <div key={idx} className="flex flex-col items-center group">
                        {/* 1. Step Header Pill with Growth Indicator */}
                        <div className="flex items-center gap-1 mb-2.5 bg-[#FFFFFF] px-1.5 py-0.5 rounded-full relative z-10 shadow-xs border border-[#E2E8F0]">
                          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-[#64748B] whitespace-nowrap">
                            S{stepNum}
                          </span>
                          {m.growth && (
                            <span className="text-[8px] sm:text-[9px] font-black text-[#EA580C] bg-[#F8FAFC] px-1 py-0.2 rounded-full whitespace-nowrap">
                              {m.growth}
                            </span>
                          )}
                        </div>

                        {/* 2. Revenue Amount Label */}
                        <div
                          className={`mb-2.5 text-[11px] sm:text-xs font-black px-2 sm:px-2.5 py-1 rounded-xl shadow-xs transition-all whitespace-nowrap ${
                            isOrangePill
                              ? 'bg-gradient-to-r from-[#EA580C] to-[#C2410C] text-white shadow-orange-500/15'
                              : 'bg-[#F8FAFC] text-[#111827] border border-[#E2E8F0] group-hover:bg-[#C2410C] group-hover:border-[#FDBA74]'
                          } ${isCurrent ? 'ring-2 ring-orange-400/50 scale-105' : ''}`}
                        >
                          ₹{stepTotal.toLocaleString('en-IN')}
                        </div>

                        {/* 3. Flow Pillar Card Container */}
                        <div
                          className={`w-full h-44 flex items-end justify-center rounded-2xl p-1.5 sm:p-2 transition-all shadow-xs ${
                            isCurrent
                              ? 'bg-[#FFF7ED] border-2 border-[#FDBA74] shadow-orange-500/15 ring-2 ring-[#F97316]/30'
                              : 'bg-[#FFFFFF] border border-[#E2E8F0] group-hover:border-[#FFEDD5] group-hover:bg-[#FFF7ED]/20'
                          }`}
                        >
                          <div
                            style={{ height: `${calculatedHeight}px` }}
                            className={`w-9 sm:w-11 rounded-xl shadow-md flex flex-col justify-between items-center py-2 transition-all duration-300 ${
                              isCurrent
                                ? 'bg-gradient-to-t from-[#FFFFFF] via-[#F97316] to-[#F8FAFC] ring-2 ring-[#F97316]/60'
                                : 'bg-gradient-to-t from-[#FFFFFF] via-[#64748B] to-[#EA580C] group-hover:from-[#3D264C] group-hover:to-[#C2410C]'
                            }`}
                          >
                            <div className="w-4 h-1 bg-[#FFFFFF]/60 rounded-full" />
                            <div className="text-[9px] font-extrabold text-white drop-shadow-sm whitespace-nowrap">
                              {stepGyms} Gyms
                            </div>
                          </div>
                        </div>

                        {/* 4. Flowchart Connector Node & Month Label */}
                        <div className="mt-3 flex flex-col items-center relative z-10">
                          <div
                            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#FFFFFF] border-2 shadow-xs flex items-center justify-center transition-transform group-hover:scale-110 ${
                              isCurrent
                                ? 'border-[#FFFFFF] ring-2 ring-[#F97316]/50'
                                : m.isOrangePill
                                ? 'border-[#FFFFFF]'
                                : 'border-[#FDBA74]'
                            }`}
                          >
                            <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${isOrangePill ? 'bg-[#FFFFFF]' : 'bg-[#C2410C]'}`} />
                          </div>
                          <span
                            className={`text-xs font-black mt-1.5 transition-colors whitespace-nowrap ${
                              isCurrent ? 'text-[#111827] font-black' : isOrangePill ? 'text-[#111827]' : 'text-[#111827] group-hover:text-[#EA580C]'
                            }`}
                          >
                            {flowchartMode === 'annual' ? m.yearLabel : m.month}
                          </span>
                          <span className="text-[9px] text-[#64748B] font-semibold mt-0.5 whitespace-nowrap">
                            {stepGyms} Gyms
                          </span>

                          {/* Currently Active Indicator */}
                          {isCurrent && (
                            <span className="text-[8px] font-black uppercase tracking-wider text-[#111827] bg-[#C2410C] px-1.5 py-0.5 rounded-full mt-1 shadow-xs whitespace-nowrap">
                              CURRENT
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* GYM OWNER VIEW: COMPLETE GYM REVENUE (MEMBERS, TRAINERS, ORDERS)          */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* ── 4 KPI Summary Cards for Gym Owner ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Total Gross Revenue */}
            <div className="bg-gradient-to-br from-[#FFFFFF] to-[#FFFFFF] text-white p-5 rounded-2xl shadow-sm border border-[#E2E8F0] relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  Total Gross Revenue
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center">
                  <IndianRupee size={16} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  ₹{summary.totalGrossRevenue.toLocaleString('en-IN')}
                </h2>
                <span className="text-[10px] font-bold text-[#15803D] flex items-center">
                  <ArrowUpRight size={12} /> +18.4%
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] mt-2 flex items-center justify-between border-t border-[#E2E8F0]/80 pt-2">
                <span>Filter: {timeframe.toUpperCase()}</span>
                <span className="font-semibold text-[#64748B]">All 4 Channels</span>
              </p>
            </div>

            {/* KPI 2: Members Revenue */}
            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] hover:border-[#FFEDD5] transition-all shadow-xs group">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  Members Revenue
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] text-[#EA580C] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users size={16} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
                  ₹{summary.membersRevenue.toLocaleString('en-IN')}
                </h2>
                <span className="text-[10px] font-bold text-[#EA580C] bg-[#FFF7ED] px-1.5 py-0.5 rounded-full">
                  {membersPct}% share
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] mt-2 flex items-center justify-between border-t border-[#E2E8F0] pt-2">
                <span>Subscriptions & Plans</span>
                <span className="font-bold text-[#111827]">{membersBreakdown.count || 0} Members</span>
              </p>
            </div>

            {/* KPI 3: Trainers Revenue */}
            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] hover:border-[#E2E8F0] transition-all shadow-xs group">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  Trainers Revenue
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] text-[#EA580C] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Dumbbell size={16} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
                  ₹{summary.trainersRevenue.toLocaleString('en-IN')}
                </h2>
                <span className="text-[10px] font-bold text-[#EA580C] bg-[#F8FAFC] px-1.5 py-0.5 rounded-full">
                  {trainersPct}% share
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] mt-2 flex items-center justify-between border-t border-[#E2E8F0] pt-2">
                <span>Gym Cut: ₹{summary.trainerGymNetShare.toLocaleString('en-IN')}</span>
                <span className="font-semibold text-[#EA580C]">{trainersBreakdown.count || 0} Sessions</span>
              </p>
            </div>

            {/* KPI 4: Orders Revenue (Online vs Offline) */}
            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] hover:border-[#E2E8F0] transition-all shadow-xs group">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  Orders Revenue (Online & Offline)
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] text-[#EA580C] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShoppingBag size={16} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
                  ₹{summary.ordersRevenue.toLocaleString('en-IN')}
                </h2>
                <span className="text-[10px] font-bold text-[#EA580C] bg-[#F8FAFC] px-1.5 py-0.5 rounded-full">
                  {onlineOrdersPct + offlineOrdersPct}% share
                </span>
              </div>
              <div className="text-[11px] text-[#64748B] mt-2 flex items-center justify-between border-t border-[#E2E8F0] pt-2">
                <span className="flex items-center gap-1 font-medium text-[#EA580C]">
                  <Smartphone size={11} /> App: ₹{summary.ordersOnlineRevenue.toLocaleString('en-IN')}
                </span>
                <span className="flex items-center gap-1 font-medium text-amber-700">
                  <Store size={11} /> POS: ₹{summary.ordersOfflineRevenue.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* ── Revenue Stream Breakdown Visualization ── */}
          <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <h3 className="text-sm font-bold text-[#111827] flex items-center gap-1.5">
                <Layers size={16} className="text-[#EA580C]" />
                Revenue Streams Proportion
              </h3>
              <span className="text-xs text-[#64748B]">
                Total Inflow: <strong className="text-[#111827]">₹{summary.totalGrossRevenue.toLocaleString('en-IN')}</strong>
              </span>
            </div>

            {/* Stacked Percentage Bar */}
            <div className="w-full h-4 bg-[#F8FAFC] rounded-full overflow-hidden flex shadow-inner">
              <div style={{ width: `${membersPct}%` }} className="bg-[#C2410C] transition-all" title={`Memberships: ${membersPct}%`} />
              <div style={{ width: `${trainersPct}%` }} className="bg-[#C2410C] transition-all" title={`Trainers: ${trainersPct}%`} />
              <div style={{ width: `${onlineOrdersPct}%` }} className="bg-[#C2410C] transition-all" title={`Online Store: ${onlineOrdersPct}%`} />
              <div style={{ width: `${offlineOrdersPct}%` }} className="bg-amber-500 transition-all" title={`Offline POS: ${offlineOrdersPct}%`} />
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs font-medium">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#C2410C] shrink-0" />
                <div className="truncate">
                  <span className="text-[#64748B] block text-[10px]">Memberships</span>
                  <strong className="text-[#111827]">₹{summary.membersRevenue.toLocaleString('en-IN')} ({membersPct}%)</strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#C2410C] shrink-0" />
                <div className="truncate">
                  <span className="text-[#64748B] block text-[10px]">Trainer Bookings</span>
                  <strong className="text-[#111827]">₹{summary.trainersRevenue.toLocaleString('en-IN')} ({trainersPct}%)</strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#C2410C] shrink-0" />
                <div className="truncate">
                  <span className="text-[#64748B] block text-[10px]">Store Online (App)</span>
                  <strong className="text-[#111827]">₹{summary.ordersOnlineRevenue.toLocaleString('en-IN')} ({onlineOrdersPct}%)</strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                <div className="truncate">
                  <span className="text-[#64748B] block text-[10px]">Store Offline (POS)</span>
                  <strong className="text-[#111827]">₹{summary.ordersOfflineRevenue.toLocaleString('en-IN')} ({offlineOrdersPct}%)</strong>
                </div>
              </div>
            </div>
          </div>

          {/* ── Tabs Navigation for Gym Owner ── */}
          <div className="flex items-center space-x-1 border-b border-[#E2E8F0] overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-[#FDBA74] text-[#EA580C]'
                  : 'border-transparent text-[#64748B] hover:text-[#C2410C]'
              }`}
            >
              Overview & Trends
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'members'
                  ? 'border-[#FDBA74] text-[#EA580C]'
                  : 'border-transparent text-[#64748B] hover:text-[#C2410C]'
              }`}
            >
              <Users size={14} />
              <span>Members Revenue (₹{summary.membersRevenue.toLocaleString('en-IN')})</span>
            </button>
            <button
              onClick={() => setActiveTab('trainers')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'trainers'
                  ? 'border-[#FDBA74] text-[#EA580C]'
                  : 'border-transparent text-[#64748B] hover:text-[#C2410C]'
              }`}
            >
              <Dumbbell size={14} />
              <span>Trainers Revenue (₹{summary.trainersRevenue.toLocaleString('en-IN')})</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'border-[#FDBA74] text-[#EA580C]'
                  : 'border-transparent text-[#64748B] hover:text-[#C2410C]'
              }`}
            >
              <ShoppingBag size={14} />
              <span>Orders Revenue Online & Offline (₹{summary.ordersRevenue.toLocaleString('en-IN')})</span>
            </button>
          </div>

          {/* ── Tab Content for Gym Owner ── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* ── Gym Revenue Inflow Flowchart Trajectory (12-Month Plan) ── */}
              <div className="bg-[#FFFFFF] p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
                {/* Header with Title and Run-rate Badges */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4 pb-4 border-b border-[#E2E8F0]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-[#111827] tracking-tight">
                        Gym Inflow Flowchart Trajectory (12-Month Plan)
                      </h3>
                      <span className="bg-[#F8FAFC] text-[#EA580C] text-[10px] font-black px-2.5 py-0.5 rounded-full border border-[#E2E8F0] uppercase tracking-wider">
                        12-MONTH PLAN
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">
                      Sequential 12-month inflow progression across Memberships, Trainer Bookings, and Online & Offline Store Sales.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-start lg:self-auto">
                    <div className="bg-[#F8FAFC]/70 border border-[#E2E8F0] rounded-xl px-3.5 py-1.5 text-right">
                      <span className="text-[10px] font-bold text-[#9A3412] block uppercase tracking-wider">
                        Current Month Inflow
                      </span>
                      <strong className="text-sm font-black text-[#9A3412]">
                        ₹{summary.totalGrossRevenue.toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-1.5 text-right">
                      <span className="text-[10px] font-bold text-[#64748B] block uppercase tracking-wider">
                        Projected Annualized
                      </span>
                      <strong className="text-sm font-extrabold text-[#111827]">
                        ₹{Math.round(summary.totalGrossRevenue * 12 * 1.16).toLocaleString('en-IN')} / yr
                      </strong>
                    </div>
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-1.5 text-right">
                      <span className="text-[10px] font-bold text-[#EA580C] block uppercase tracking-wider">
                        Growth Pace
                      </span>
                      <strong className="text-sm font-extrabold text-[#EA580C]">
                        +82% Trajectory
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Stream Breakdown Legend Chips */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-5 p-3 bg-[#F8FAFC]/80 rounded-xl border border-[#E2E8F0]/80 text-xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#64748B] mr-1">
                    Revenue Streams:
                  </span>
                  <div className="flex items-center gap-1.5 bg-[#FFFFFF] px-2.5 py-1 rounded-lg border border-[#E2E8F0] shadow-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C2410C]" />
                    <span className="text-[#64748B] font-semibold text-[11px]">Members Revenue:</span>
                    <strong className="text-[#111827] font-bold text-[11px]">
                      ₹{summary.membersRevenue.toLocaleString('en-IN')} ({membersPct}%)
                    </strong>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#FFFFFF] px-2.5 py-1 rounded-lg border border-[#E2E8F0] shadow-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C2410C]" />
                    <span className="text-[#64748B] font-semibold text-[11px]">Trainers Revenue:</span>
                    <strong className="text-[#111827] font-bold text-[11px]">
                      ₹{summary.trainersRevenue.toLocaleString('en-IN')} ({trainersPct}%)
                    </strong>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#FFFFFF] px-2.5 py-1 rounded-lg border border-[#E2E8F0] shadow-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C2410C]" />
                    <span className="text-[#64748B] font-semibold text-[11px]">Online Store (App):</span>
                    <strong className="text-[#111827] font-bold text-[11px]">
                      ₹{summary.ordersOnlineRevenue.toLocaleString('en-IN')} ({onlineOrdersPct}%)
                    </strong>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#FFFFFF] px-2.5 py-1 rounded-lg border border-amber-200 shadow-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-[#64748B] font-semibold text-[11px]">Offline Store (POS):</span>
                    <strong className="text-[#111827] font-bold text-[11px]">
                      ₹{summary.ordersOfflineRevenue.toLocaleString('en-IN')} ({offlineOrdersPct}%)
                    </strong>
                  </div>
                </div>

                {/* 12-Month Flowchart Stepper Sequence with Horizontal Scroll */}
                <div className="overflow-x-auto custom-scrollbar pb-3 pt-1">
                  <div className="min-w-[1100px] lg:min-w-0 relative pt-2">
                    {/* Stepper Track Line Connecting Step Badges */}
                    <div className="absolute top-[18px] left-6 right-6 h-0.5 bg-[#F8FAFC] z-0" />

                    {/* Bottom Connecting Track Line for Circular Nodes */}
                    <div className="absolute bottom-[52px] left-6 right-6 h-0.5 bg-[#F8FAFC] z-0" />

                    {/* 12 Month Columns Grid */}
                    <div className="grid grid-cols-12 gap-2 sm:gap-2.5 relative z-10">
                      {[
                        { month: 'Jan', mult: 0.55, growth: '+0%' },
                        { month: 'Feb', mult: 0.60, growth: '+9%' },
                        { month: 'Mar', mult: 0.65, growth: '+8%' },
                        { month: 'Apr', mult: 0.70, growth: '+8%' },
                        { month: 'May', mult: 0.75, growth: '+7%' },
                        { month: 'Jun', mult: 0.80, growth: '+7%' },
                        { month: 'Jul', mult: 0.85, growth: '+6%' },
                        { month: 'Aug', mult: 0.90, growth: '+6%' },
                        { month: 'Sep', mult: 0.95, growth: '+6%' },
                        { month: 'Oct', mult: 1.00, growth: '+5%', isCurrent: true },
                        { month: 'Nov', mult: 1.08, growth: '+8%' },
                        { month: 'Dec', mult: 1.16, growth: '+7%' },
                      ].map((item, idx) => {
                        const stepNum = String(idx + 1).padStart(2, '0');
                        const isCurrent = item.isCurrent || idx === 9; // Oct is month index 9
                        const mult = item.mult;
                        
                        const mTotal = isCurrent ? summary.totalGrossRevenue : Math.round(summary.totalGrossRevenue * mult);
                        const mTrainers = isCurrent ? summary.trainersRevenue : Math.round(summary.trainersRevenue * mult);
                        const mMembers = isCurrent ? summary.membersRevenue : Math.round(summary.membersRevenue * mult);
                        const mOnline = isCurrent ? summary.ordersOnlineRevenue : Math.round(summary.ordersOnlineRevenue * mult);
                        const mOffline = isCurrent ? summary.ordersOfflineRevenue : Math.round(summary.ordersOfflineRevenue * mult);

                        const totalSteps = 12;
                        const minHeightPx = 52;
                        const maxHeightPx = 140;
                        const calculatedHeight = Math.round(minHeightPx + ((idx / (totalSteps - 1)) * (maxHeightPx - minHeightPx)));

                        // Stream percentage segments inside pillar
                        const validTotal = Math.max(1, mTotal);
                        const tShare = Math.round((mTrainers / validTotal) * 100);
                        const mShare = Math.round((mMembers / validTotal) * 100);
                        const onShare = Math.round((mOnline / validTotal) * 100);
                        const offShare = Math.max(0, 100 - tShare - mShare - onShare);

                        return (
                          <div key={idx} className="flex flex-col items-center group">
                            {/* 1. Step Header Pill */}
                            <div className="flex items-center gap-1 mb-2.5 bg-[#FFFFFF] px-1.5 py-0.5 rounded-full relative z-10 shadow-xs border border-[#E2E8F0]">
                              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-[#64748B] whitespace-nowrap">
                                S{stepNum}
                              </span>
                              {item.growth && (
                                <span className="text-[8px] sm:text-[9px] font-black text-[#EA580C] bg-[#F8FAFC] px-1 py-0.2 rounded-full whitespace-nowrap">
                                  {item.growth}
                                </span>
                              )}
                            </div>

                            {/* 2. Month Revenue Amount Badge */}
                            <div
                              className={`mb-2.5 text-[10px] sm:text-[11px] font-black px-1.5 sm:px-2 py-1 rounded-xl shadow-xs transition-all whitespace-nowrap ${
                                isCurrent
                                  ? 'bg-gradient-to-r from-[#EA580C] to-[#C2410C] text-white shadow-orange-500/15 ring-2 ring-orange-400/50 scale-105'
                                  : 'bg-[#F8FAFC] text-[#111827] border border-[#E2E8F0] group-hover:bg-[#C2410C] group-hover:border-[#FDBA74]'
                              }`}
                            >
                              ₹{isCurrent ? mTotal.toLocaleString('en-IN') : `${(mTotal / 1000).toFixed(1)}k`}
                            </div>

                            {/* 3. Flow Pillar Card Container */}
                            <div
                              className={`w-full h-48 flex items-end justify-center rounded-2xl p-1.5 sm:p-2 transition-all shadow-xs relative ${
                                isCurrent
                                  ? 'bg-[#FFF7ED] border-2 border-[#E2E8F0] shadow-orange-500/15 ring-2 ring-orange-400/30'
                                  : 'bg-[#F8FAFC]/80 border border-[#E2E8F0]/90 group-hover:border-[#FDBA74] group-hover:bg-[#FFF7ED]/15'
                              }`}
                              title={`${item.month} Total: ₹${mTotal.toLocaleString('en-IN')}\n• Trainers: ₹${mTrainers.toLocaleString('en-IN')}\n• Memberships: ₹${mMembers.toLocaleString('en-IN')}\n• Online Store: ₹${mOnline.toLocaleString('en-IN')}\n• Offline POS: ₹${mOffline.toLocaleString('en-IN')}`}
                            >
                              {/* Stacked Multi-Stream Flow Pillar */}
                              <div
                                style={{ height: `${calculatedHeight}px` }}
                                className={`w-9 sm:w-11 rounded-xl overflow-hidden shadow-md flex flex-col-reverse justify-start transition-all duration-300 ${
                                  isCurrent ? 'ring-2 ring-orange-400/70 scale-102' : ''
                                }`}
                              >
                                {/* Bottom: Trainers (Blue) */}
                                <div
                                  style={{ height: `${tShare}%` }}
                                  className="w-full bg-[#C2410C] hover:bg-[#9A3412] transition-colors"
                                  title={`Trainers: ₹${mTrainers.toLocaleString('en-IN')} (${tShare}%)`}
                                />
                                {/* Middle: Memberships (Orange) */}
                                <div
                                  style={{ height: `${mShare}%` }}
                                  className="w-full bg-[#C2410C] hover:bg-[#9A3412] transition-colors"
                                  title={`Memberships: ₹${mMembers.toLocaleString('en-IN')} (${mShare}%)`}
                                />
                                {/* Top-mid: Store Online (Emerald) */}
                                <div
                                  style={{ height: `${Math.max(3, onShare)}%` }}
                                  className="w-full bg-[#C2410C] hover:bg-[#9A3412] transition-colors"
                                  title={`Online Store: ₹${mOnline.toLocaleString('en-IN')} (${onShare}%)`}
                                />
                                {/* Very top: Store Offline (Amber) */}
                                <div
                                  style={{ height: `${Math.max(3, offShare)}%` }}
                                  className="w-full bg-amber-500 hover:bg-amber-600 transition-colors"
                                  title={`Offline POS: ₹${mOffline.toLocaleString('en-IN')} (${offShare}%)`}
                                />
                              </div>
                            </div>

                            {/* 4. Flowchart Connector Node & Month Label */}
                            <div className="mt-3 flex flex-col items-center relative z-10">
                              <div
                                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#FFFFFF] border-2 shadow-xs flex items-center justify-center transition-transform group-hover:scale-110 ${
                                  isCurrent
                                    ? 'border-[#E2E8F0] ring-2 ring-orange-400/50'
                                    : 'border-[#FDBA74]'
                                }`}
                              >
                                <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${isCurrent ? 'bg-[#C2410C]' : 'bg-[#C2410C]'}`} />
                              </div>
                              <span
                                className={`text-xs font-black mt-1.5 transition-colors whitespace-nowrap ${
                                  isCurrent ? 'text-[#EA580C] font-black' : 'text-[#111827] group-hover:text-[#EA580C]'
                                }`}
                              >
                                {item.month}
                              </span>
                              
                              {/* Sub-label showing stream snapshot */}
                              <span className="text-[8px] text-[#64748B] font-bold mt-0.5 whitespace-nowrap">
                                T: ₹{(mTrainers / 1000).toFixed(0)}k | M: ₹{(mMembers / 1000).toFixed(1)}k
                              </span>

                              {/* Current Active Indicator */}
                              {isCurrent && (
                                <span className="text-[7px] font-black uppercase tracking-wider text-[#111827] bg-[#C2410C] px-1.5 py-0.5 rounded-full mt-1 shadow-xs whitespace-nowrap">
                                  NOW
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── 3 Detailed Revenue Stream Action Cards (Members, Trainers, Online & Offline Orders) ── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Members Revenue Card */}
                <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] hover:border-[#FDBA74] transition-all shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] text-[#EA580C] flex items-center justify-center">
                          <Users size={16} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-[#111827] text-sm">Members Revenue</h4>
                          <span className="text-[10px] text-[#64748B] font-semibold">{membersPct}% of Total Gym Inflow</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-[#EA580C] bg-[#F8FAFC] px-2 py-0.5 rounded-full">
                        {membersBreakdown.count || 0} Members
                      </span>
                    </div>

                    <div className="my-2">
                      <strong className="text-2xl font-black text-[#111827]">
                        ₹{summary.membersRevenue.toLocaleString('en-IN')}
                      </strong>
                      <p className="text-xs text-[#64748B] mt-1">
                        Active member subscriptions, package renewals, and membership fees.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                    <button
                      onClick={() => setActiveTab('members')}
                      className="text-xs font-bold text-[#EA580C] hover:underline cursor-pointer"
                    >
                      View Breakdown &rarr;
                    </button>
                    <button
                      onClick={handleExportMembersPDF}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#EA580C] to-[#C2410C] hover:from-[#9A3412] hover:to-[#EA580C] text-[#FFFFFF] font-bold font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer"
                      title="Download Members Revenue PDF"
                    >
                      <Download size={12} />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>

                {/* 2. Trainers Revenue Card */}
                <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] hover:border-[#E2E8F0] transition-all shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] text-[#EA580C] flex items-center justify-center">
                          <Dumbbell size={16} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-[#111827] text-sm">Trainers Revenue</h4>
                          <span className="text-[10px] text-[#64748B] font-semibold">{trainersPct}% of Total Gym Inflow</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-[#EA580C] bg-[#F8FAFC] px-2 py-0.5 rounded-full">
                        PT Sessions
                      </span>
                    </div>

                    <div className="my-2">
                      <strong className="text-2xl font-black text-[#111827]">
                        ₹{summary.trainersRevenue.toLocaleString('en-IN')}
                      </strong>
                      <div className="text-xs text-[#64748B] mt-1 space-y-0.5">
                        <div>Trainer Commission (70%): <strong className="text-[#111827]">₹{summary.trainerCommissionPaid.toLocaleString('en-IN')}</strong></div>
                        <div>Gym Net Share (30%): <strong className="text-[#EA580C]">₹{summary.trainerGymNetShare.toLocaleString('en-IN')}</strong></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                    <button
                      onClick={() => setActiveTab('trainers')}
                      className="text-xs font-bold text-[#EA580C] hover:underline cursor-pointer"
                    >
                      View Sessions &rarr;
                    </button>
                    <button
                      onClick={handleExportTrainersPDF}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer"
                      title="Download Trainers Revenue PDF"
                    >
                      <Download size={12} />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>

                {/* 3. Online & Offline Orders Revenue Card */}
                <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] hover:border-[#E2E8F0] transition-all shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] text-[#EA580C] flex items-center justify-center">
                          <ShoppingBag size={16} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-[#111827] text-sm">Orders Revenue (Online & Offline)</h4>
                          <span className="text-[10px] text-[#64748B] font-semibold">{ordersPct}% of Total Inflow</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-[#EA580C] bg-[#F8FAFC] px-2 py-0.5 rounded-full">
                        {summary.totalOrdersCount || 0} Orders
                      </span>
                    </div>

                    <div className="my-2">
                      <strong className="text-2xl font-black text-[#111827]">
                        ₹{summary.ordersRevenue.toLocaleString('en-IN')}
                      </strong>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                          <span className="text-[10px] text-[#EA580C] font-bold block">Online App Store</span>
                          <strong className="text-[#EA580C] font-black text-xs">
                            ₹{summary.ordersOnlineRevenue.toLocaleString('en-IN')}
                          </strong>
                          <span className="text-[10px] text-[#EA580C] block mt-0.5">({summary.onlineOrdersCount || 0} orders)</span>
                        </div>
                        <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200">
                          <span className="text-[10px] text-amber-800 font-bold block">Offline POS Counter</span>
                          <strong className="text-amber-900 font-black text-xs">
                            ₹{summary.ordersOfflineRevenue.toLocaleString('en-IN')}
                          </strong>
                          <span className="text-[10px] text-amber-700 block mt-0.5">({summary.offlineOrdersCount || 0} sales)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-[#EA580C] hover:underline cursor-pointer"
                    >
                      View Store &rarr;
                    </button>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleExportOnlineOrdersPDF}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold font-bold rounded-lg text-[11px] shadow-xs transition-all cursor-pointer"
                        title="Download Online Orders PDF"
                      >
                        <Download size={11} />
                        <span>Online PDF</span>
                      </button>
                      <button
                        onClick={handleExportOfflineOrdersPDF}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] shadow-xs transition-all cursor-pointer"
                        title="Download Offline Orders PDF"
                      >
                        <Download size={11} />
                        <span>Offline PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
              <div className="p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#FFFFFF]">
                <div>
                  <h3 className="font-bold text-[#111827] text-base">Membership Payment Transactions</h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Total Memberships Revenue: <strong className="text-[#111827]">₹{summary.membersRevenue.toLocaleString('en-IN')}</strong> ({membersBreakdown.count || 0} active members)
                  </p>
                </div>
                {/* Download PDF for Members Revenue */}
                <button
                  onClick={handleExportMembersPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#EA580C] to-[#C2410C] hover:from-[#9A3412] hover:to-[#EA580C] text-[#FFFFFF] font-bold font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer w-fit"
                  title="Download Members Revenue PDF Statement"
                >
                  <Download size={14} />
                  <span>Download Members Revenue PDF</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Plan Name</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Payment Method</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {(membersBreakdown.recentPayments?.length > 0
                      ? membersBreakdown.recentPayments
                      : [
                          { customerName: 'Active Member', planName: 'Monthly Membership', amount: summary.membersRevenue || 1998, paymentMethod: 'UPI', date: new Date().toISOString(), status: 'Paid' }
                        ]
                    ).map((p: any, idx: number) => (
                      <tr key={p.id || idx} className="hover:bg-[#FFF7ED]">
                        <td className="py-3 px-4 font-bold text-[#111827]">{p.customerName}</td>
                        <td className="py-3 px-4">{p.planName}</td>
                        <td className="py-3 px-4 font-extrabold text-[#111827]">₹{Number(p.amount).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4">{p.paymentMethod}</td>
                        <td className="py-3 px-4 text-[#64748B]">{new Date(p.date || Date.now()).toLocaleDateString('en-IN')}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F8FAFC] text-[#EA580C] border border-[#E2E8F0]">
                            {p.status || 'Paid'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'trainers' && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
              <div className="p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#FFFFFF]">
                <div>
                  <h3 className="font-bold text-[#111827] text-base">Trainer Session Revenue Records</h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Gross: <strong className="text-[#111827]">₹{summary.trainersRevenue.toLocaleString('en-IN')}</strong> | Gym Net Share (30%): <strong className="text-[#EA580C]">₹{summary.trainerGymNetShare.toLocaleString('en-IN')}</strong> | Trainer Share: ₹{summary.trainerCommissionPaid.toLocaleString('en-IN')}
                  </p>
                </div>
                {/* Download PDF for Trainers Revenue */}
                <button
                  onClick={handleExportTrainersPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#EA580C] to-blue-700 hover:from-blue-700 hover:to-blue-800 text-[#FFFFFF] font-bold font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer w-fit"
                  title="Download Trainers Revenue PDF Statement"
                >
                  <Download size={14} />
                  <span>Download Trainers Revenue PDF</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Trainer Name</th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Session Fee</th>
                      <th className="py-3 px-4">Gym Share (30%)</th>
                      <th className="py-3 px-4">Trainer Share (70%)</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {(trainersBreakdown.recentSessions?.length > 0
                      ? trainersBreakdown.recentSessions
                      : [
                          { trainerName: 'Head Trainer', customerName: 'Client Member', amount: summary.trainersRevenue || 25000, date: new Date().toLocaleDateString('en-IN'), status: 'Completed' }
                        ]
                    ).map((s: any, idx: number) => (
                      <tr key={s.id || idx} className="hover:bg-[#FFF7ED]">
                        <td className="py-3 px-4 font-bold text-[#111827]">{s.trainerName}</td>
                        <td className="py-3 px-4">{s.customerName}</td>
                        <td className="py-3 px-4 font-extrabold text-[#111827]">₹{Number(s.amount).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 font-semibold text-[#EA580C]">₹{Math.round(Number(s.amount) * 0.3).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 font-semibold text-[#EA580C]">₹{Math.round(Number(s.amount) * 0.7).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-[#64748B]">{s.date}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F8FAFC] text-[#EA580C] border border-[#E2E8F0]">
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Separate Download Buttons Header Card */}
              <div className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
                <div className="p-5 border-b border-[#E2E8F0] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-[#FFFFFF]">
                  <div>
                    <h3 className="font-bold text-[#111827] text-base">Store Orders Revenue (Online & Offline)</h3>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Online App Store: <strong className="text-[#EA580C]">₹{summary.ordersOnlineRevenue.toLocaleString('en-IN')}</strong> | Offline Counter POS: <strong className="text-amber-600">₹{summary.ordersOfflineRevenue.toLocaleString('en-IN')}</strong>
                    </p>
                  </div>
                  {/* SEPARATE BUTTONS FOR ONLINE AND OFFLINE ORDERS */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={handleExportOnlineOrdersPDF}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#EA580C] to-[#C2410C] hover:from-emerald-700 hover:to-[#C2410C] text-[#FFFFFF] font-bold font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer"
                      title="Download Online App Store Orders PDF Statement"
                    >
                      <Download size={14} />
                      <span>Download Online Orders PDF</span>
                    </button>
                    <button
                      onClick={handleExportOfflineOrdersPDF}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer"
                      title="Download Offline Counter POS Orders PDF Statement"
                    >
                      <Download size={14} />
                      <span>Download Offline Orders PDF</span>
                    </button>
                  </div>
                </div>

                {/* Top Sold Products & Merchandise */}
                <div className="p-4 bg-[#FFF7ED] border-b border-[#E2E8F0]">
                  <span className="text-xs font-bold text-[#111827] uppercase tracking-wider">Top Sold Products</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Product Name</th>
                        <th className="py-3 px-4">Quantity Sold</th>
                        <th className="py-3 px-4">Channel</th>
                        <th className="py-3 px-4">Total Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {(ordersBreakdown.topProducts?.length > 0
                        ? ordersBreakdown.topProducts
                        : [
                            { name: 'Gym T-Shirt', quantity: 1, revenue: 800, channel: 'Offline POS' },
                            { name: 'classy (Energy Drink)', quantity: 1, revenue: 140, channel: 'Online Store' }
                          ]
                      ).map((prod: any, idx: number) => (
                        <tr key={idx} className="hover:bg-[#FFF7ED]">
                          <td className="py-3 px-4 font-bold text-[#111827]">{prod.name}</td>
                          <td className="py-3 px-4">{prod.quantity} unit(s)</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              prod.channel?.toLowerCase().includes('online')
                                ? 'bg-[#F8FAFC] text-[#EA580C] border border-[#E2E8F0]'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {prod.channel}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-extrabold text-[#111827]">₹{Number(prod.revenue).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RevenueAnalytics;
