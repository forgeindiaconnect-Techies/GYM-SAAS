import { useState, useEffect, useCallback } from 'react';
import {
  IndianRupee, Percent, ArrowUpRight, CheckCircle, Clock,
  Search, Filter, Building2, Smartphone, Copy, Check, X,
  AlertCircle, ShieldCheck, Wallet, RefreshCw, Send, CheckCircle2,
  XCircle, ChevronRight, Eye, CreditCard
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const GymAdminTrainerCommission = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'commission' | 'withdrawals'>('commission');

  // Data states
  const [fees, setFees] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [commTypeFilter, setCommTypeFilter] = useState('All');
  const [withdrawalFilter, setWithdrawalFilter] = useState('All');

  // Copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Modals
  const [approveModal, setApproveModal] = useState<any>(null);
  const [rejectModal, setRejectModal] = useState<any>(null);
  const [directPayoutModal, setDirectPayoutModal] = useState(false);
  const [selectedWithdrawalDetail, setSelectedWithdrawalDetail] = useState<any>(null);

  // Action forms
  const [approveForm, setApproveForm] = useState({ transactionId: '', notes: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [payoutForm, setPayoutForm] = useState({
    trainerId: '',
    amount: '',
    withdrawalMethod: 'Bank Transfer',
    transactionId: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const copyToClipboard = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [feesRes, paymentsRes, withdrawalsRes, trainersRes] = await Promise.allSettled([
        api.get('/trainer-payments/fees'),
        api.get('/trainer-payments/history'),
        api.get('/trainer-payments/withdrawals'),
        api.get('/trainers')
      ]);

      if (feesRes.status === 'fulfilled' && feesRes.value.data) {
        setFees(feesRes.value.data.fees?.filter((f: any) => f.status === 'Active') || []);
      }
      if (paymentsRes.status === 'fulfilled' && paymentsRes.value.data) {
        setPayments(paymentsRes.value.data.payments || []);
      }
      if (withdrawalsRes.status === 'fulfilled' && withdrawalsRes.value.data) {
        setWithdrawals(withdrawalsRes.value.data.requests || []);
      }
      if (trainersRes.status === 'fulfilled' && trainersRes.value.data) {
        setTrainers(trainersRes.value.data.trainers || []);
      }
    } catch {
      showToast('Failed to load commission data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper for fee & commission calculation
  const getFeeCalc = (fee: any) => {
    if (!fee) return { baseFee: 0, commType: 'Percentage', commValue: 0, commDeduction: 0, netAmount: 0 };
    const baseFee = Number(fee.feeAmount) || 0;
    const trainer = fee.trainerId || {};
    const commType = fee.commissionType || trainer.commissionType || 'Percentage';
    const commValue = Number(
      fee.commissionValue !== undefined && fee.commissionValue !== null && fee.commissionValue !== ''
        ? fee.commissionValue
        : (trainer.commissionValue || 0)
    ) || 0;

    let commDeduction = 0;
    if (commValue > 0) {
      commDeduction = commType === 'Fixed Amount' ? commValue : (baseFee * commValue) / 100;
    }

    let netAmount = fee.netAmount;
    if (netAmount === undefined || netAmount === null || isNaN(Number(netAmount))) {
      netAmount = Math.max(0, Math.round(baseFee - commDeduction));
    } else {
      netAmount = Math.round(Number(netAmount));
    }

    return {
      baseFee,
      commType,
      commValue,
      commDeduction: Math.round(commDeduction),
      netAmount
    };
  };

  // Calculations for stats
  // Total Commission Retained: sum from historical payments where fee had commission
  const totalCommissionRetained = payments.reduce((sum, p) => {
    const baseFee = Number(p.trainerFeeId?.feeAmount) || 0;
    const paidAmount = Number(p.amount) || 0;
    if (baseFee > paidAmount) {
      return sum + (baseFee - paidAmount);
    }
    return sum;
  }, 0);

  const totalNetDisbursed = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const pendingWithdrawalsList = withdrawals.filter(w => w.status === 'Pending' || w.status === 'Processing');
  const totalPendingWithdrawalAmount = pendingWithdrawalsList.reduce((sum, w) => sum + (Number(w.amount) || 0), 0);
  const completedWithdrawalsList = withdrawals.filter(w => w.status === 'Completed' || w.status === 'Approved');
  const totalCompletedWithdrawalsAmount = completedWithdrawalsList.reduce((sum, w) => sum + (Number(w.amount) || 0), 0);

  // Filtered active commission fees
  const filteredFees = fees.filter(f => {
    const trainerName = f.trainerId?.name?.toLowerCase() || '';
    const matchSearch = trainerName.includes(search.toLowerCase());
    const commType = f.commissionType || 'Percentage';
    const matchType = commTypeFilter === 'All' || commType === commTypeFilter;
    return matchSearch && matchType;
  });

  // Filtered withdrawals
  const filteredWithdrawals = withdrawals.filter(w => {
    const trainerName = w.trainerId?.name?.toLowerCase() || '';
    const matchSearch = trainerName.includes(search.toLowerCase());
    const matchStatus = withdrawalFilter === 'All' || w.status === withdrawalFilter;
    return matchSearch && matchStatus;
  });

  // Handle Approve Withdrawal
  const handleApproveWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approveModal) return;
    setSubmitting(true);
    try {
      await api.put(`/trainer-payments/withdrawals/${approveModal._id}/status`, {
        status: 'Completed',
        transactionId: approveForm.transactionId.trim() || undefined,
        notes: approveForm.notes
      });
      showToast('Withdrawal payout approved and marked as Completed!');
      setApproveModal(null);
      setApproveForm({ transactionId: '', notes: '' });
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to approve withdrawal', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Reject Withdrawal
  const handleRejectWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModal) return;
    setSubmitting(true);
    try {
      await api.put(`/trainer-payments/withdrawals/${rejectModal._id}/status`, {
        status: 'Rejected',
        rejectionReason: rejectReason.trim() || 'Declined by gym management'
      });
      showToast('Withdrawal request rejected and balance refunded to trainer.');
      setRejectModal(null);
      setRejectReason('');
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to reject withdrawal', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Direct Manual Payout
  const handleDirectPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutForm.trainerId || !payoutForm.amount || Number(payoutForm.amount) <= 0) {
      showToast('Please select a trainer and specify a valid payout amount', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/trainer-payments/withdrawals/payout', {
        trainerId: payoutForm.trainerId,
        amount: Number(payoutForm.amount),
        withdrawalMethod: payoutForm.withdrawalMethod,
        transactionId: payoutForm.transactionId.trim() || undefined,
        notes: payoutForm.notes
      });
      showToast('Direct trainer payout recorded successfully!');
      setDirectPayoutModal(false);
      setPayoutForm({
        trainerId: '',
        amount: '',
        withdrawalMethod: 'Bank Transfer',
        transactionId: '',
        notes: ''
      });
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to process payout', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTrainerForPayout = trainers.find(t => t._id === payoutForm.trainerId);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#202828]">Trainer Commission &amp; Withdrawals</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#164A4A]/10 text-[#164A4A]">
              Finance Hub
            </span>
          </div>
          <p className="text-sm text-[#687B78] mt-1">
            Track gym commission deductions, net disbursements, and manage trainer withdrawal payouts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDirectPayoutModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#164A4A] text-white rounded-xl font-bold text-xs hover:bg-[#123E3E] transition-all shadow-md shadow-[#164A4A]/15 cursor-pointer"
          >
            <Wallet className="w-4 h-4" /> Record Direct Payout
          </button>
          <Link
            to="/admin/trainer-fees"
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#D3DFDA] text-[#164A4A] rounded-xl font-bold text-xs hover:bg-gray-50 transition-all shadow-sm"
          >
            <Percent className="w-4 h-4" /> Configure Fees
          </Link>
        </div>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div className={`p-4 rounded-xl flex items-center gap-3 transition-all ${
          toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-500 shrink-0" /> : <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />}
          <p className="font-semibold text-sm">{toast.msg}</p>
        </div>
      )}

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Commission Earned by Gym */}
        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#687B78] uppercase tracking-wider">Gym Commission Retained</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#164A4A] mt-2">
            ₹{totalCommissionRetained.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-[#687B78] mt-1 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            Retained across all trainer disbursements
          </p>
        </div>

        {/* Metric 2: Net Disbursed to Trainers */}
        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#687B78] uppercase tracking-wider">Net Paid to Trainers</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">
            ₹{totalNetDisbursed.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-[#687B78] mt-1">
            Total {payments.length} payment records processed
          </p>
        </div>

        {/* Metric 3: Pending Withdrawal Requests */}
        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#687B78] uppercase tracking-wider">Pending Withdrawals</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2">
            ₹{totalPendingWithdrawalAmount.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-[#687B78] mt-1">
            {pendingWithdrawalsList.length} request{pendingWithdrawalsList.length !== 1 ? 's' : ''} awaiting approval
          </p>
        </div>

        {/* Metric 4: Total Completed Payouts */}
        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#687B78] uppercase tracking-wider">Completed Payouts</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">
            ₹{totalCompletedWithdrawalsAmount.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-[#687B78] mt-1">
            {completedWithdrawalsList.length} successful withdrawal payouts
          </p>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#D3DFDA] space-x-2">
        <button
          onClick={() => setActiveTab('commission')}
          className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'commission'
              ? 'border-[#164A4A] text-[#164A4A]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Percent className="w-4 h-4" /> Commission Breakdown &amp; Amount Details
        </button>

        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer relative ${
            activeTab === 'withdrawals'
              ? 'border-[#164A4A] text-[#164A4A]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Wallet className="w-4 h-4" /> Trainer Withdrawal Options
          {pendingWithdrawalsList.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-black">
              {pendingWithdrawalsList.length}
            </span>
          )}
        </button>
      </div>

      {/* ==================== TAB 1: COMMISSION BREAKDOWN ==================== */}
      {activeTab === 'commission' && (
        <div className="space-y-6">

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-[#D3DFDA] shadow-sm">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search trainers by name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-[#D3DFDA] rounded-xl text-sm outline-none focus:border-[#164A4A]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={commTypeFilter}
                onChange={e => setCommTypeFilter(e.target.value)}
                className="px-3 py-2 border border-[#D3DFDA] rounded-xl text-xs font-semibold outline-none focus:border-[#164A4A] bg-white cursor-pointer"
              >
                <option value="All">All Commission Models</option>
                <option value="Percentage">Percentage (%)</option>
                <option value="Fixed Amount">Fixed Amount (₹)</option>
              </select>
            </div>
          </div>

          {/* Active Trainer Commission Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#D3DFDA] overflow-hidden">
            <div className="p-4 bg-[#F2EFE8] border-b border-[#D3DFDA] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#202828] text-sm">Trainer Commission &amp; Net Payable Rates</h3>
                <p className="text-xs text-[#687B78] mt-0.5">Exact fee disbursement calculation for active trainers</p>
              </div>
              <span className="text-xs font-semibold text-[#687B78]">{filteredFees.length} active configurations</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-[#D3DFDA] text-xs font-bold text-[#455250] uppercase tracking-wider">
                    <th className="p-4">Trainer</th>
                    <th className="p-4">Base Fee</th>
                    <th className="p-4">Commission Model</th>
                    <th className="p-4">Gym Retains</th>
                    <th className="p-4">Net Disbursed</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">Loading commission data...</td>
                    </tr>
                  ) : filteredFees.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">No trainer fees matching search.</td>
                    </tr>
                  ) : (
                    filteredFees.map(fee => {
                      const calc = getFeeCalc(fee);
                      return (
                        <tr key={fee._id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#164A4A]/10 text-[#164A4A] flex items-center justify-center font-bold text-sm shrink-0">
                                {fee.trainerId?.name?.[0]?.toUpperCase() || 'T'}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{fee.trainerId?.name || 'Trainer'}</p>
                                <p className="text-xs text-gray-500">{fee.trainerId?.email}</p>
                                <span className="inline-block mt-0.5 text-[10px] font-semibold text-[#164A4A] bg-[#164A4A]/10 px-1.5 py-0.2 rounded">
                                  {fee.trainingType}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Base Fee */}
                          <td className="p-4 font-bold text-gray-800">
                            ₹{calc.baseFee.toLocaleString('en-IN')}
                            <span className="text-xs text-gray-400 block font-normal">/ {fee.billingCycle}</span>
                          </td>

                          {/* Commission Rate */}
                          <td className="p-4">
                            {calc.commValue > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {calc.commType === 'Fixed Amount' ? `₹${calc.commValue.toLocaleString('en-IN')} Fixed` : `${calc.commValue}% Rate`}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400 italic">No Commission (0%)</span>
                            )}
                          </td>

                          {/* Gym Retains */}
                          <td className="p-4">
                            <span className="font-black text-emerald-800">
                              +₹{calc.commDeduction.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[11px] text-gray-400 block">per {fee.billingCycle?.toLowerCase()}</span>
                          </td>

                          {/* Net Disbursed */}
                          <td className="p-4">
                            <span className="font-black text-[#164A4A] text-base">
                              ₹{calc.netAmount.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[11px] text-gray-400 block">exact amount paid</span>
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-right">
                            <button
                              onClick={() => navigate('/admin/trainer-payments')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#164A4A] text-white rounded-lg text-xs font-bold hover:bg-[#123E3E] transition-all shadow-sm cursor-pointer"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> Disburse
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Historical Commission Revenue Ledger */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#D3DFDA] overflow-hidden">
            <div className="p-4 bg-[#F2EFE8] border-b border-[#D3DFDA] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#202828] text-sm">Commission Deduction History</h3>
                <p className="text-xs text-[#687B78] mt-0.5">Audit log of commission revenues retained from completed disbursements</p>
              </div>
              <span className="text-xs font-semibold text-[#687B78]">{payments.length} transactions</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-[#D3DFDA] text-xs font-bold text-[#455250] uppercase tracking-wider">
                    <th className="p-4">Date</th>
                    <th className="p-4">Trainer</th>
                    <th className="p-4">Base Fee</th>
                    <th className="p-4">Commission Retained</th>
                    <th className="p-4">Net Disbursed</th>
                    <th className="p-4">Method &amp; Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">No payment records logged yet.</td>
                    </tr>
                  ) : (
                    payments.map(p => {
                      const baseFee = Number(p.trainerFeeId?.feeAmount) || Number(p.amount);
                      const paidAmount = Number(p.amount);
                      const commissionKept = Math.max(0, baseFee - paidAmount);

                      return (
                        <tr key={p._id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="p-4 text-xs text-gray-600 whitespace-nowrap">
                            {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                          </td>
                          <td className="p-4 font-semibold text-gray-900">
                            {p.trainerId?.name || 'Trainer'}
                          </td>
                          <td className="p-4 font-semibold text-gray-700">
                            ₹{baseFee.toLocaleString('en-IN')}
                          </td>
                          <td className="p-4">
                            {commissionKept > 0 ? (
                              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                                +₹{commissionKept.toLocaleString('en-IN')}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">₹0</span>
                            )}
                          </td>
                          <td className="p-4 font-black text-[#164A4A]">
                            ₹{paidAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="p-4 text-xs text-gray-500">
                            <span className="font-medium text-gray-800 block">{p.paymentMethod}</span>
                            <span className="font-mono text-[11px] text-gray-400">{p.transactionId || 'Manual Entry'}</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ==================== TAB 2: WITHDRAWAL OPTIONS ==================== */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-6">

          {/* Withdrawal Filter and Actions bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-[#D3DFDA] shadow-sm">
            <div className="flex items-center gap-2">
              {['All', 'Pending', 'Completed', 'Rejected'].map(st => (
                <button
                  key={st}
                  onClick={() => setWithdrawalFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    withdrawalFilter === st
                      ? 'bg-[#164A4A] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {st} {st === 'Pending' && pendingWithdrawalsList.length > 0 && `(${pendingWithdrawalsList.length})`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDirectPayoutModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 bg-[#164A4A] text-white rounded-xl text-xs font-bold hover:bg-[#123E3E] transition-all cursor-pointer shadow-sm"
              >
                <Wallet className="w-3.5 h-3.5" /> + Record Direct Payout
              </button>
              <button
                onClick={fetchData}
                className="p-2 border border-[#D3DFDA] rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors"
                title="Refresh requests"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Withdrawal Requests Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#D3DFDA] overflow-hidden">
            <div className="p-4 bg-[#F2EFE8] border-b border-[#D3DFDA] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#202828] text-sm">Trainer Withdrawal Requests &amp; Payouts</h3>
                <p className="text-xs text-[#687B78] mt-0.5">Review, verify bank/UPI credentials, and record payout confirmation</p>
              </div>
              <span className="text-xs font-semibold text-[#687B78]">{filteredWithdrawals.length} request(s)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-[#D3DFDA] text-xs font-bold text-[#455250] uppercase tracking-wider">
                    <th className="p-4">Trainer</th>
                    <th className="p-4">Requested Amount</th>
                    <th className="p-4">Requested On</th>
                    <th className="p-4">Disbursement Method</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">Loading withdrawal requests...</td>
                    </tr>
                  ) : filteredWithdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">
                        No withdrawal requests found for this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredWithdrawals.map(w => {
                      const isPending = w.status === 'Pending' || w.status === 'Processing';
                      const isCompleted = w.status === 'Completed' || w.status === 'Approved';

                      return (
                        <tr key={w._id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#164A4A] to-[#6fa3a0] text-white flex items-center justify-center font-bold text-sm shrink-0">
                                {w.trainerId?.name?.[0]?.toUpperCase() || 'T'}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{w.trainerId?.name || 'Trainer'}</p>
                                <p className="text-xs text-gray-500">{w.trainerId?.email}</p>
                                {w.trainerId?.availableBalance !== undefined && (
                                  <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                                    Bal: ₹{Number(w.trainerId.availableBalance).toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Amount */}
                          <td className="p-4">
                            <span className="font-black text-base text-gray-900">
                              ₹{Number(w.amount).toLocaleString('en-IN')}
                            </span>
                          </td>

                          {/* Requested Date */}
                          <td className="p-4 text-xs text-gray-600">
                            {w.requestedAt ? new Date(w.requestedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                          </td>

                          {/* Disbursement Method & Credentials */}
                          <td className="p-4">
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-800">
                                {w.withdrawalMethod === 'Bank Transfer' ? <Building2 className="w-3 h-3 text-blue-600" /> : <Smartphone className="w-3 h-3 text-emerald-600" />}
                                {w.withdrawalMethod}
                              </span>

                              {w.withdrawalMethod === 'Bank Transfer' && w.bankDetails && (
                                <div className="text-xs text-gray-600 bg-blue-50/50 p-2 rounded-lg border border-blue-100 mt-1 flex items-center justify-between">
                                  <div>
                                    <p className="font-mono font-bold text-gray-900">{w.bankDetails.accountNumber}</p>
                                    <p className="text-[11px] text-gray-500">{w.bankDetails.bankName} • {w.bankDetails.ifscCode}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(`A/C: ${w.bankDetails.accountNumber}, IFSC: ${w.bankDetails.ifscCode}, Name: ${w.bankDetails.accountHolder}`, `b-${w._id}`)}
                                    className="p-1 text-blue-700 hover:text-blue-900"
                                    title="Copy bank details"
                                  >
                                    {copiedKey === `b-${w._id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              )}

                              {w.withdrawalMethod === 'UPI' && w.upiDetails && (
                                <div className="text-xs text-gray-600 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100 mt-1 flex items-center justify-between">
                                  <p className="font-mono font-bold text-gray-900">{w.upiDetails.upiId}</p>
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(w.upiDetails.upiId, `u-${w._id}`)}
                                    className="p-1 text-emerald-700 hover:text-emerald-900"
                                    title="Copy UPI ID"
                                  >
                                    {copiedKey === `u-${w._id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                              isCompleted ? 'bg-emerald-100 text-emerald-800' :
                              w.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {isCompleted && <CheckCircle className="w-3.5 h-3.5" />}
                              {isPending && <Clock className="w-3.5 h-3.5" />}
                              {w.status === 'Rejected' && <XCircle className="w-3.5 h-3.5" />}
                              {w.status}
                            </span>
                            {w.transactionId && (
                              <p className="font-mono text-[10px] text-gray-400 mt-0.5">Ref: {w.transactionId}</p>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td className="p-4 text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setApproveModal(w)}
                                  className="px-3 py-1.5 bg-[#164A4A] text-white rounded-lg text-xs font-bold hover:bg-[#123E3E] transition-all shadow-sm cursor-pointer"
                                >
                                  Disburse &amp; Complete
                                </button>
                                <button
                                  onClick={() => setRejectModal(w)}
                                  className="px-2.5 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition-all cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setSelectedWithdrawalDetail(w)}
                                className="px-3 py-1.5 text-xs font-semibold text-[#164A4A] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                              >
                                View Details
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ==================== MODAL: APPROVE WITHDRAWAL ==================== */}
      {approveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-[#D3DFDA] animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-[#D3DFDA] bg-[#F8F9F8] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#202828] text-base">Complete Withdrawal Payout</h3>
                <p className="text-xs text-[#687B78] mt-0.5">Confirm payment disbursement to trainer</p>
              </div>
              <button onClick={() => setApproveModal(null)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApproveWithdrawal} className="p-5 space-y-4">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#687B78]">Trainer</p>
                  <p className="font-bold text-gray-900">{approveModal.trainerId?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#687B78]">Disbursement Amount</p>
                  <p className="text-2xl font-black text-[#164A4A]">₹{Number(approveModal.amount).toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Bank or UPI info card */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1">
                <p className="font-bold text-gray-700">Transfer Credentials ({approveModal.withdrawalMethod}):</p>
                {approveModal.withdrawalMethod === 'Bank Transfer' ? (
                  <>
                    <p className="font-mono text-gray-900">A/C: {approveModal.bankDetails?.accountNumber}</p>
                    <p className="text-gray-600">IFSC: {approveModal.bankDetails?.ifscCode} • Bank: {approveModal.bankDetails?.bankName}</p>
                    <p className="text-gray-600">Holder: {approveModal.bankDetails?.accountHolder}</p>
                  </>
                ) : (
                  <p className="font-mono font-bold text-emerald-800">UPI ID: {approveModal.upiDetails?.upiId}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#455250] uppercase tracking-wider mb-1">
                  Bank UTR / Transaction Reference ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR847291039847"
                  value={approveForm.transactionId}
                  onChange={e => setApproveForm({ ...approveForm, transactionId: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D3DFDA] rounded-xl text-sm font-mono outline-none focus:border-[#164A4A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#455250] uppercase tracking-wider mb-1">
                  Notes / Audit Remarks (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional confirmation note..."
                  value={approveForm.notes}
                  onChange={e => setApproveForm({ ...approveForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D3DFDA] rounded-xl text-xs outline-none focus:border-[#164A4A]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setApproveModal(null)}
                  className="flex-1 py-2.5 border border-[#D3DFDA] rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-[#164A4A] text-white rounded-xl text-xs font-bold hover:bg-[#123E3E] disabled:opacity-50"
                >
                  {submitting ? 'Confirming...' : 'Confirm Disbursed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: REJECT WITHDRAWAL ==================== */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-[#D3DFDA]">
            <div className="p-5 border-b border-[#D3DFDA] bg-red-50/50 flex items-center justify-between">
              <h3 className="font-bold text-red-900 text-base">Decline Withdrawal Request</h3>
              <button onClick={() => setRejectModal(null)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRejectWithdrawal} className="p-5 space-y-4">
              <p className="text-xs text-gray-600">
                Rejecting this request will automatically refund the requested amount of <strong>₹{Number(rejectModal.amount).toLocaleString('en-IN')}</strong> back to <strong>{rejectModal.trainerId?.name}</strong>'s available balance.
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Reason for Rejection *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Bank account details incorrect, please resubmit."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 border border-red-200 rounded-xl text-xs outline-none focus:border-red-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModal(null)}
                  className="flex-1 py-2.5 border border-[#D3DFDA] rounded-xl text-xs font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 disabled:opacity-50"
                >
                  {submitting ? 'Declining...' : 'Confirm Reject & Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: RECORD DIRECT PAYOUT ==================== */}
      {directPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-[#D3DFDA] my-auto">
            <div className="p-5 border-b border-[#D3DFDA] bg-[#F8F9F8] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#202828] text-base">Record Direct Trainer Payout</h3>
                <p className="text-xs text-[#687B78] mt-0.5">Disburse withdrawal funds directly to a trainer</p>
              </div>
              <button onClick={() => setDirectPayoutModal(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDirectPayout} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#455250] uppercase tracking-wider mb-1">
                  Select Trainer *
                </label>
                <select
                  required
                  value={payoutForm.trainerId}
                  onChange={e => setPayoutForm({ ...payoutForm, trainerId: e.target.value })}
                  className="w-full px-3 py-2.5 border border-[#D3DFDA] rounded-xl text-sm font-semibold outline-none focus:border-[#164A4A] bg-white cursor-pointer"
                >
                  <option value="">-- Choose Trainer --</option>
                  {trainers.map(t => (
                    <option key={t._id} value={t._id}>
                      {t.name} (Available Bal: ₹{Number(t.availableBalance || 0).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {selectedTrainerForPayout && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs flex justify-between items-center">
                  <span className="text-emerald-900 font-medium">Trainer Available Balance:</span>
                  <span className="text-sm font-black text-[#164A4A]">
                    ₹{Number(selectedTrainerForPayout.availableBalance || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#455250] uppercase tracking-wider mb-1">
                  Payout Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedTrainerForPayout ? selectedTrainerForPayout.availableBalance : undefined}
                  placeholder="Amount to withdraw"
                  value={payoutForm.amount}
                  onChange={e => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                  className="w-full px-3 py-2.5 border border-[#D3DFDA] rounded-xl text-base font-bold text-[#202828] outline-none focus:border-[#164A4A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#455250] uppercase tracking-wider mb-1">
                  Disbursement Method *
                </label>
                <select
                  value={payoutForm.withdrawalMethod}
                  onChange={e => setPayoutForm({ ...payoutForm, withdrawalMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D3DFDA] rounded-xl text-xs font-semibold outline-none focus:border-[#164A4A] bg-white"
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Cash">Cash Handover</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#455250] uppercase tracking-wider mb-1">
                  Transaction Reference / UTR
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR102938475"
                  value={payoutForm.transactionId}
                  onChange={e => setPayoutForm({ ...payoutForm, transactionId: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D3DFDA] rounded-xl text-xs font-mono outline-none focus:border-[#164A4A]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDirectPayoutModal(false)}
                  className="flex-1 py-2.5 border border-[#D3DFDA] rounded-xl text-xs font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-[#164A4A] text-white rounded-xl text-xs font-bold hover:bg-[#123E3E] disabled:opacity-50"
                >
                  {submitting ? 'Recording...' : 'Disburse Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: VIEW WITHDRAWAL DETAIL ==================== */}
      {selectedWithdrawalDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-[#D3DFDA]">
            <div className="p-5 border-b border-[#D3DFDA] bg-[#F8F9F8] flex items-center justify-between">
              <h3 className="font-bold text-[#202828] text-base">Withdrawal Record Details</h3>
              <button onClick={() => setSelectedWithdrawalDetail(null)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Trainer</span>
                <span className="font-bold text-gray-900">{selectedWithdrawalDetail.trainerId?.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Amount</span>
                <span className="text-lg font-black text-[#164A4A]">₹{Number(selectedWithdrawalDetail.amount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Status</span>
                <span className="font-bold text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {selectedWithdrawalDetail.status}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Method</span>
                <span className="font-medium text-gray-800">{selectedWithdrawalDetail.withdrawalMethod}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Reference ID</span>
                <span className="font-mono text-xs text-gray-800">{selectedWithdrawalDetail.transactionId || 'None'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500">Requested Date</span>
                <span className="text-xs text-gray-800">
                  {new Date(selectedWithdrawalDetail.requestedAt).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            <div className="p-4 border-t border-[#D3DFDA] bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedWithdrawalDetail(null)}
                className="px-4 py-2 bg-[#164A4A] text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GymAdminTrainerCommission;
