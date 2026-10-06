import { useState, useEffect, useCallback } from 'react';
import {
  Percent, ArrowUpRight, CheckCircle, Clock,
  Search, Building2, Smartphone, Copy, Check, X,
  AlertCircle, Wallet, RefreshCw, Send, CheckCircle2,
  Eye, Filter, Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../../utils/api';

const GymAdminTrainerCommission = () => {
  const [activeTab, setActiveTab] = useState<'commission' | 'withdrawals'>('commission');

  // Stats - ONLY Commission Amounts
  const [stats, setStats] = useState({
    totalCommissionEarned: 0,
    availableBalance: 0,
    totalCommissionWithdrawn: 0,
    pendingWithdrawal: 0
  });

  // Lists
  const [commissionLedger, setCommissionLedger] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [modelFilter, setModelFilter] = useState('All');
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState('All');

  // Clipboard & Toast
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Modals
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [receiptModal, setReceiptModal] = useState<any | null>(null);

  // Form for Gym Owner Commission Withdrawal
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    withdrawalMethod: 'Bank Transfer' as 'Bank Transfer' | 'UPI',
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
    upiName: '',
    notes: ''
  });
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);

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

  // Download Single Commission Withdrawal PDF Receipt
  const handleDownloadWithdrawalPDF = (w: any) => {
    if (!w) return;
    const doc = new jsPDF();
    const dateFormatted = w.requestedAt || w.createdAt
      ? new Date(w.requestedAt || w.createdAt).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      : new Date().toLocaleDateString('en-IN');

    // Header banner
    doc.setFillColor(22, 74, 74);
    doc.rect(0, 0, 210, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('COMMISSION WITHDRAWAL RECEIPT', 14, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Ref #: ${w.transactionId || w._id?.slice(-8).toUpperCase() || 'COMM-WD'}`, 140, 20);

    // Sub-header Info
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.text(`Issued Date: ${dateFormatted}`, 14, 42);
    doc.text(`Status: ${w.status || 'Completed'}`, 14, 48);

    const infoRows: any[] = [
      ['Receipt Type', 'Gym Owner Commission Payout'],
      ['Withdrawn Amount', `Rs. ${Number(w.amount || 0).toLocaleString('en-IN')}`],
      ['Payout Method', w.withdrawalMethod || 'Bank Transfer'],
    ];

    if (w.withdrawalMethod === 'Bank Transfer') {
      infoRows.push(['Account Holder', w.bankDetails?.accountHolder || 'N/A']);
      infoRows.push(['Bank Name', w.bankDetails?.bankName || 'N/A']);
      infoRows.push(['Account Number', w.bankDetails?.accountNumber || 'N/A']);
      infoRows.push(['IFSC Code', w.bankDetails?.ifscCode || 'N/A']);
    } else {
      infoRows.push(['UPI ID (VPA)', w.upiDetails?.upiId || 'N/A']);
      infoRows.push(['Beneficiary Name', w.upiDetails?.upiName || 'N/A']);
    }

    infoRows.push(
      ['Transaction Reference', w.transactionId || w._id || 'N/A'],
      ['Payout Status', w.status || 'Completed'],
      ['Date & Time', dateFormatted],
      ['Notes / Remarks', w.notes || 'Gym owner commission withdrawal']
    );

    autoTable(doc, {
      startY: 54,
      head: [['Commission Payout Details', 'Information']],
      body: infoRows,
      theme: 'grid',
      headStyles: { fillColor: [22, 74, 74], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 5 }
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 140;
    doc.setFontSize(9);
    doc.setTextColor(130, 130, 130);
    doc.text('This commission payout receipt was generated electronically and is valid without signature.', 14, finalY + 14);

    const safeRef = (w.transactionId || w._id || 'receipt').replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Commission_Receipt_${safeRef}.pdf`);
  };

  const fetchCommissionData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/trainer-payments/gym-commission');
      if (res.data?.success) {
        setStats(res.data.stats || {
          totalCommissionEarned: 0,
          availableBalance: 0,
          totalCommissionWithdrawn: 0,
          pendingWithdrawal: 0
        });
        setCommissionLedger(res.data.commissionLedger || []);
        setWithdrawals(res.data.withdrawals || []);
      }
    } catch {
      // Fallback: fetch from payments and history if new endpoint is spinning up
      try {
        const [, paymentsRes] = await Promise.allSettled([
          api.get('/trainer-payments/fees'),
          api.get('/trainer-payments/history')
        ]);
        let totalRetained = 0;
        let ledger: any[] = [];
        if (paymentsRes.status === 'fulfilled' && paymentsRes.value.data?.payments) {
          const list = paymentsRes.value.data.payments;
          ledger = list.map((p: any) => {
            const baseFee = Number(p.trainerFeeId?.feeAmount) || Number(p.amount) || 0;
            const netPaid = Number(p.amount) || 0;
            const commissionTaken = Math.max(0, baseFee - netPaid);
            totalRetained += commissionTaken;
            return {
              _id: p._id,
              paymentDate: p.paymentDate,
              transactionId: p.transactionId,
              paymentMethod: p.paymentMethod,
              trainer: p.trainerId,
              baseFee,
              commissionType: p.trainerFeeId?.commissionType || 'Percentage',
              commissionValue: p.trainerFeeId?.commissionValue || 0,
              commissionEarned: commissionTaken,
              netDisbursed: netPaid,
              notes: p.notes
            };
          });
        }
        setStats({
          totalCommissionEarned: totalRetained,
          availableBalance: totalRetained,
          totalCommissionWithdrawn: 0,
          pendingWithdrawal: 0
        });
        setCommissionLedger(ledger);
      } catch {
        showToast('Failed to load commission data', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommissionData();
  }, [fetchCommissionData]);

  // Handle Withdrawal Submission by Gym Owner
  const handleWithdrawCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = Number(withdrawForm.amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
      showToast('Please enter a valid withdrawal amount', 'error');
      return;
    }

    if (withdrawAmount > stats.availableBalance) {
      showToast(`Amount cannot exceed available commission balance (₹${stats.availableBalance.toLocaleString('en-IN')})`, 'error');
      return;
    }

    if (withdrawForm.withdrawalMethod === 'Bank Transfer') {
      if (!withdrawForm.accountHolder.trim() || !withdrawForm.accountNumber.trim() || !withdrawForm.ifscCode.trim()) {
        showToast('Please fill in all bank account details', 'error');
        return;
      }
    } else {
      if (!withdrawForm.upiId.trim() || !withdrawForm.upiId.includes('@')) {
        showToast('Please enter a valid UPI ID (e.g. name@okhdfcbank)', 'error');
        return;
      }
    }

    setSubmittingWithdrawal(true);
    try {
      const payload = {
        amount: withdrawAmount,
        withdrawalMethod: withdrawForm.withdrawalMethod,
        bankDetails: withdrawForm.withdrawalMethod === 'Bank Transfer' ? {
          accountHolder: withdrawForm.accountHolder.trim(),
          bankName: withdrawForm.bankName.trim() || 'Bank Account',
          accountNumber: withdrawForm.accountNumber.trim(),
          ifscCode: withdrawForm.ifscCode.trim().toUpperCase()
        } : undefined,
        upiDetails: withdrawForm.withdrawalMethod === 'UPI' ? {
          upiId: withdrawForm.upiId.trim(),
          upiName: withdrawForm.upiName.trim() || withdrawForm.accountHolder.trim()
        } : undefined,
        notes: withdrawForm.notes.trim() || 'Gym owner commission withdrawal'
      };

      const res = await api.post('/trainer-payments/gym-commission/withdraw', payload);
      if (res.data?.success) {
        showToast(`Successfully withdrawn ₹${withdrawAmount.toLocaleString('en-IN')}!`, 'success');
        setWithdrawModalOpen(false);
        setWithdrawForm({
          amount: '',
          withdrawalMethod: 'Bank Transfer',
          accountHolder: '',
          bankName: '',
          accountNumber: '',
          ifscCode: '',
          upiId: '',
          upiName: '',
          notes: ''
        });
        fetchCommissionData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to process commission withdrawal', 'error');
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

  // Filtered Commission Ledger
  const filteredLedger = commissionLedger.filter(item => {
    const trainerName = item.trainer?.name?.toLowerCase() || '';
    const ref = item.transactionId?.toLowerCase() || '';
    const matchSearch = trainerName.includes(search.toLowerCase()) || ref.includes(search.toLowerCase());
    const matchModel = modelFilter === 'All' || item.commissionType === modelFilter;
    return matchSearch && matchModel;
  });

  // Filtered Withdrawals
  const filteredWithdrawals = withdrawals.filter(w => {
    const matchStatus = withdrawalStatusFilter === 'All' || w.status === withdrawalStatusFilter;
    return matchStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#202828]">Commission &amp; Withdrawals</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#164A4A]/10 text-[#164A4A]">
              Gym Owner Revenue
            </span>
          </div>
          <p className="text-sm text-[#687B78] mt-1">
            Track commission retained from trainer disbursements and withdraw your commission earnings directly to your bank account or UPI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (stats.availableBalance <= 0) {
                showToast('No commission balance available for withdrawal yet', 'error');
                return;
              }
              setWithdrawModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#164A4A] text-white rounded-xl font-bold text-xs hover:bg-[#123E3E] transition-all shadow-md shadow-[#164A4A]/20 cursor-pointer"
          >
            <Wallet className="w-4 h-4" /> Withdraw Commission
          </button>
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

      {/* Top 4 KPI Metrics - ONLY Commission Amounts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Commission Earned */}
        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#687B78] uppercase tracking-wider">Total Commission Earned</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#164A4A] mt-2">
            ₹{stats.totalCommissionEarned.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-[#687B78] mt-1 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            Total commission taken across trainer payments
          </p>
        </div>

        {/* Metric 2: Available Commission Balance */}
        <div className="bg-gradient-to-br from-[#164A4A] to-[#0F3535] rounded-2xl p-5 shadow-sm text-white relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-100 uppercase tracking-wider">Available to Withdraw</span>
            <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">
            ₹{stats.availableBalance.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-teal-100 font-medium">
              Ready for bank/UPI withdrawal
            </p>
            {stats.availableBalance > 0 && (
              <button
                onClick={() => setWithdrawModalOpen(true)}
                className="text-[11px] font-bold text-white underline hover:text-emerald-200 cursor-pointer"
              >
                Withdraw &rarr;
              </button>
            )}
          </div>
        </div>

        {/* Metric 3: Withdrawn Commission */}
        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#687B78] uppercase tracking-wider">Withdrawn Commission</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#202828] mt-2">
            ₹{stats.totalCommissionWithdrawn.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-[#687B78] mt-1 font-medium">
            {withdrawals.filter(w => w.status === 'Completed').length} completed payouts to gym owner
          </p>
        </div>

        {/* Metric 4: Pending Withdrawals */}
        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#687B78] uppercase tracking-wider">Pending Withdrawals</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">
            ₹{stats.pendingWithdrawal.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-[#687B78] mt-1 font-medium">
            {withdrawals.filter(w => w.status === 'Pending' || w.status === 'Processing').length} requests in verification
          </p>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#D3DFDA] gap-6">
        <button
          onClick={() => setActiveTab('commission')}
          className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'commission'
              ? 'border-[#164A4A] text-[#164A4A]'
              : 'border-transparent text-[#687B78] hover:text-[#202828]'
          }`}
        >
          <Percent className="w-4 h-4" /> Commission Earned from Trainers
        </button>
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'withdrawals'
              ? 'border-[#164A4A] text-[#164A4A]'
              : 'border-transparent text-[#687B78] hover:text-[#202828]'
          }`}
        >
          <Wallet className="w-4 h-4" /> Gym Owner Withdrawal Options ({withdrawals.length})
        </button>
      </div>

      {/* TAB 1: Commission Earned Breakdown */}
      {activeTab === 'commission' && (
        <div className="space-y-6">

          {/* Search & Model Filter */}
          <div className="bg-white border border-[#D3DFDA] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#687B78] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by trainer name or payment ref..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#D3DFDA] rounded-xl text-xs focus:outline-none focus:border-[#164A4A]"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Filter className="w-4 h-4 text-[#687B78]" />
              <select
                value={modelFilter}
                onChange={e => setModelFilter(e.target.value)}
                className="border border-[#D3DFDA] rounded-xl px-3 py-2 text-xs font-semibold text-[#202828] bg-white focus:outline-none focus:border-[#164A4A]"
              >
                <option value="All">All Commission Models</option>
                <option value="Percentage">Percentage (%)</option>
                <option value="Fixed Amount">Fixed Amount (₹)</option>
              </select>
            </div>
          </div>

          {/* Commission Collection Ledger */}
          <div className="bg-white border border-[#D3DFDA] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#D3DFDA] flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="font-bold text-sm text-[#202828]">Commission Earned from Trainer Fee Disbursements</h3>
                <p className="text-xs text-[#687B78] mt-0.5">
                  Exact commission retained and added to your gym commission balance upon paying trainers
                </p>
              </div>
              <span className="text-xs font-bold text-[#164A4A] bg-[#164A4A]/10 px-2.5 py-1 rounded-full">
                {filteredLedger.length} Records Found
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-[#687B78]">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#164A4A]" />
                <p className="text-xs font-semibold">Loading commission records...</p>
              </div>
            ) : filteredLedger.length === 0 ? (
              <div className="p-12 text-center text-[#687B78]">
                <Percent className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="font-bold text-sm text-[#202828]">No Commission Records Found</p>
                <p className="text-xs text-[#687B78] mt-1 max-w-sm mx-auto">
                  When you disburse trainer fees with a commission rate applied, your retained commission will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/75 border-b border-[#D3DFDA] text-[11px] font-bold text-[#687B78] uppercase tracking-wider">
                      <th className="py-3 px-4">Trainer</th>
                      <th className="py-3 px-4">Payment Date</th>
                      <th className="py-3 px-4">Base Fee</th>
                      <th className="py-3 px-4">Commission Rate</th>
                      <th className="py-3 px-4 text-emerald-800 bg-emerald-50/60 font-black">Gym Takes (Commission)</th>
                      <th className="py-3 px-4">Net Paid to Trainer</th>
                      <th className="py-3 px-4">Transaction Ref</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D3DFDA] text-xs">
                    {filteredLedger.map((row) => (
                      <tr key={row._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#164A4A]/10 text-[#164A4A] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              {row.trainer?.name ? row.trainer.name.charAt(0) : 'T'}
                            </div>
                            <div>
                              <p className="font-bold text-[#202828]">{row.trainer?.name || 'Trainer'}</p>
                              <p className="text-[11px] text-[#687B78]">{row.trainer?.email || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#687B78]">
                          {row.paymentDate ? new Date(row.paymentDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#202828]">
                          ₹{row.baseFee.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                            {row.commissionType === 'Percentage' ? `${row.commissionValue}% Rate` : `₹${row.commissionValue} Fixed`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 bg-emerald-50/40">
                          <div className="flex items-center gap-1.5 font-black text-emerald-700 text-sm">
                            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                            +₹{row.commissionEarned.toLocaleString('en-IN')}
                          </div>
                          <span className="text-[10px] text-emerald-800 font-semibold uppercase tracking-wider">
                            Retained in Balance
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#202828]">
                          ₹{row.netDisbursed.toLocaleString('en-IN')}
                          <p className="text-[10px] text-[#687B78] font-normal">{row.paymentMethod || 'Disbursed'}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1 text-[#687B78]">
                            <span className="font-mono text-[11px] bg-gray-100 px-2 py-0.5 rounded">
                              {row.transactionId || 'DIRECT-PAY'}
                            </span>
                            {row.transactionId && (
                              <button
                                onClick={() => copyToClipboard(row.transactionId, row._id)}
                                className="p-1 hover:text-[#164A4A] cursor-pointer"
                                title="Copy Transaction ID"
                              >
                                {copiedKey === row._id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Gym Owner Withdrawal Options & History */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-6">

          {/* Top Section: Available Balance Card & Quick Withdraw Options */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Quick Withdraw Hero Card */}
            <div className="lg:col-span-2 bg-gradient-to-br from-[#164A4A] to-[#0D2D2D] rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-teal-100 border border-white/10">
                    Gym Owner Commission Wallet
                  </span>
                </div>
                <h3 className="text-xl font-black">Commission Withdrawal Options</h3>
                <p className="text-xs text-teal-100/90 mt-1 max-w-xl">
                  Gym owners take the commission amount. You can withdraw your accumulated commission revenue to your bank account or UPI ID instantly.
                </p>

                <div className="mt-5 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">₹{stats.availableBalance.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-teal-200 font-semibold">Available for Withdrawal</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    if (stats.availableBalance <= 0) {
                      showToast('You currently have no available commission to withdraw', 'error');
                      return;
                    }
                    setWithdrawModalOpen(true);
                  }}
                  disabled={stats.availableBalance <= 0}
                  className="flex items-center gap-2 px-5 py-3 bg-white text-[#164A4A] rounded-xl font-black text-xs hover:bg-gray-100 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Wallet className="w-4 h-4" /> Withdraw Commission Now
                </button>
                <div className="text-xs text-teal-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Direct payout to registered Bank or UPI
                </div>
              </div>
            </div>

            {/* Withdrawal Methods Info Card */}
            <div className="bg-white border border-[#D3DFDA] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-sm text-[#202828] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#164A4A]" /> Supported Payout Channels
                </h4>
                <p className="text-xs text-[#687B78] mt-1">
                  Commission funds are directly transferred via Indian banking channels:
                </p>

                <div className="mt-4 space-y-3">
                  <div className="p-3 rounded-xl border border-[#D3DFDA] bg-gray-50 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#202828]">Bank Account (IMPS / NEFT)</p>
                      <p className="text-[11px] text-[#687B78]">Requires Account No, IFSC, &amp; Holder Name</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-[#D3DFDA] bg-gray-50 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#202828]">UPI Transfer (VPA)</p>
                      <p className="text-[11px] text-[#687B78]">Instant payout to any valid UPI ID (e.g. name@upi)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#D3DFDA] text-[11px] text-[#687B78]">
                Payout requests are logged with unique reference IDs for accounting and tax records.
              </div>
            </div>

          </div>

          {/* Section: Withdrawal History Table */}
          <div className="bg-white border border-[#D3DFDA] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#D3DFDA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
              <div>
                <h3 className="font-bold text-sm text-[#202828]">Commission Withdrawal History</h3>
                <p className="text-xs text-[#687B78] mt-0.5">
                  Complete record of commission revenue transferred to the gym owner
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#687B78]" />
                <select
                  value={withdrawalStatusFilter}
                  onChange={e => setWithdrawalStatusFilter(e.target.value)}
                  className="border border-[#D3DFDA] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#202828] bg-white focus:outline-none focus:border-[#164A4A]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Completed">Completed</option>
                  <option value="Processing">Processing</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-[#687B78]">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#164A4A]" />
                <p className="text-xs font-semibold">Loading withdrawal records...</p>
              </div>
            ) : filteredWithdrawals.length === 0 ? (
              <div className="p-12 text-center text-[#687B78]">
                <Wallet className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="font-bold text-sm text-[#202828]">No Commission Withdrawals Yet</p>
                <p className="text-xs text-[#687B78] mt-1 max-w-sm mx-auto">
                  When you withdraw your commission balance, your payout receipts and transfer logs will appear here.
                </p>
                {stats.availableBalance > 0 && (
                  <button
                    onClick={() => setWithdrawModalOpen(true)}
                    className="mt-4 px-4 py-2 bg-[#164A4A] text-white rounded-xl font-bold text-xs hover:bg-[#123E3E] cursor-pointer"
                  >
                    Withdraw ₹{stats.availableBalance.toLocaleString('en-IN')} Now
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/75 border-b border-[#D3DFDA] text-[11px] font-bold text-[#687B78] uppercase tracking-wider">
                      <th className="py-3 px-4">Reference ID</th>
                      <th className="py-3 px-4">Date &amp; Time</th>
                      <th className="py-3 px-4">Amount Withdrawn</th>
                      <th className="py-3 px-4">Payout Method</th>
                      <th className="py-3 px-4">Destination Account</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Receipt &amp; Download</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D3DFDA] text-xs">
                    {filteredWithdrawals.map((w: any) => (
                      <tr key={w._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1 text-[#687B78]">
                            <span className="font-mono text-[11px] font-bold text-[#202828] bg-gray-100 px-2 py-0.5 rounded">
                              {w.transactionId || `COMM-WD-${w._id.slice(-6)}`}
                            </span>
                            <button
                              onClick={() => copyToClipboard(w.transactionId || w._id, w._id)}
                              className="p-1 hover:text-[#164A4A] cursor-pointer"
                              title="Copy Ref"
                            >
                              {copiedKey === w._id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#687B78]">
                          {w.requestedAt ? new Date(w.requestedAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 font-black text-emerald-700 text-sm">
                          ₹{Number(w.amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                            {w.withdrawalMethod}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#687B78]">
                          {w.withdrawalMethod === 'Bank Transfer' ? (
                            <div>
                              <p className="font-semibold text-[#202828] text-xs">
                                {w.bankDetails?.bankName || 'Bank'} (A/C: ****{w.bankDetails?.accountNumber?.slice(-4) || 'XXXX'})
                              </p>
                              <p className="text-[10px] text-[#687B78]">IFSC: {w.bankDetails?.ifscCode || 'N/A'}</p>
                            </div>
                          ) : (
                            <div>
                              <p className="font-semibold text-[#202828] text-xs">{w.upiDetails?.upiId || 'UPI ID'}</p>
                              <p className="text-[10px] text-[#687B78]">{w.upiDetails?.upiName || 'Beneficiary'}</p>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            w.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            w.status === 'Processing' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {w.status || 'Completed'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setReceiptModal(w)}
                              className="p-1.5 text-[#164A4A] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                              title="View Receipt Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadWithdrawalPDF(w)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#164A4A] text-white hover:bg-[#123E3E] rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                              title="Download PDF Receipt"
                            >
                              <Download className="w-3.5 h-3.5" /> Download Receipt
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* WITHDRAW COMMISSION MODAL */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center items-start pt-20 pb-16 px-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-[#D3DFDA] pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#202828]">Withdraw Gym Commission</h3>
                <p className="text-xs text-[#687B78] mt-0.5">Transfer your retained commission balance</p>
              </div>
              <button
                onClick={() => setWithdrawModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Available Balance Pill */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Available Commission</span>
                <span className="text-xl font-black text-[#164A4A]">₹{stats.availableBalance.toLocaleString('en-IN')}</span>
              </div>
              <button
                type="button"
                onClick={() => setWithdrawForm({ ...withdrawForm, amount: String(stats.availableBalance) })}
                className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 cursor-pointer shadow-sm"
              >
                Withdraw Full
              </button>
            </div>

            <form onSubmit={handleWithdrawCommission} className="space-y-4">
              
              {/* Amount Input */}
              <div>
                <label className="block text-xs font-bold text-[#202828] mb-1">
                  Withdrawal Amount (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#687B78]">₹</span>
                  <input
                    type="number"
                    min="1"
                    max={stats.availableBalance}
                    required
                    placeholder="e.g. 750"
                    value={withdrawForm.amount}
                    onChange={e => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                    className="w-full pl-8 pr-4 py-2.5 border border-[#D3DFDA] rounded-xl text-sm font-bold text-[#202828] focus:outline-none focus:border-[#164A4A]"
                  />
                </div>
              </div>

              {/* Method Selector */}
              <div>
                <label className="block text-xs font-bold text-[#202828] mb-1">
                  Payout Method <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawForm({ ...withdrawForm, withdrawalMethod: 'Bank Transfer' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      withdrawForm.withdrawalMethod === 'Bank Transfer'
                        ? 'border-[#164A4A] bg-[#164A4A]/5 text-[#164A4A]'
                        : 'border-[#D3DFDA] text-[#687B78] hover:bg-gray-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4" /> Bank Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawForm({ ...withdrawForm, withdrawalMethod: 'UPI' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      withdrawForm.withdrawalMethod === 'UPI'
                        ? 'border-[#164A4A] bg-[#164A4A]/5 text-[#164A4A]'
                        : 'border-[#D3DFDA] text-[#687B78] hover:bg-gray-50'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" /> UPI ID
                  </button>
                </div>
              </div>

              {/* Bank Transfer Inputs */}
              {withdrawForm.withdrawalMethod === 'Bank Transfer' ? (
                <div className="space-y-3 bg-gray-50/70 p-3.5 rounded-xl border border-[#D3DFDA]">
                  <div>
                    <label className="block text-[11px] font-bold text-[#687B78] mb-0.5">Account Holder Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pooja Hegde"
                      value={withdrawForm.accountHolder}
                      onChange={e => setWithdrawForm({ ...withdrawForm, accountHolder: e.target.value })}
                      className="w-full px-3 py-1.5 border border-[#D3DFDA] rounded-lg text-xs font-medium focus:outline-none focus:border-[#164A4A] bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-[#687B78] mb-0.5">Bank Name</label>
                      <input
                        type="text"
                        placeholder="e.g. HDFC Bank"
                        value={withdrawForm.bankName}
                        onChange={e => setWithdrawForm({ ...withdrawForm, bankName: e.target.value })}
                        className="w-full px-3 py-1.5 border border-[#D3DFDA] rounded-lg text-xs font-medium focus:outline-none focus:border-[#164A4A] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#687B78] mb-0.5">IFSC Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="HDFC0001234"
                        value={withdrawForm.ifscCode}
                        onChange={e => setWithdrawForm({ ...withdrawForm, ifscCode: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-1.5 border border-[#D3DFDA] rounded-lg text-xs font-mono font-medium focus:outline-none focus:border-[#164A4A] bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#687B78] mb-0.5">Account Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 5010023456789"
                      value={withdrawForm.accountNumber}
                      onChange={e => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value })}
                      className="w-full px-3 py-1.5 border border-[#D3DFDA] rounded-lg text-xs font-mono font-medium focus:outline-none focus:border-[#164A4A] bg-white"
                    />
                  </div>
                </div>
              ) : (
                /* UPI Inputs */
                <div className="space-y-3 bg-gray-50/70 p-3.5 rounded-xl border border-[#D3DFDA]">
                  <div>
                    <label className="block text-[11px] font-bold text-[#687B78] mb-0.5">UPI ID (VPA) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. pooja@okhdfcbank"
                      value={withdrawForm.upiId}
                      onChange={e => setWithdrawForm({ ...withdrawForm, upiId: e.target.value })}
                      className="w-full px-3 py-1.5 border border-[#D3DFDA] rounded-lg text-xs font-medium focus:outline-none focus:border-[#164A4A] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#687B78] mb-0.5">Beneficiary Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Pooja Hegde"
                      value={withdrawForm.upiName}
                      onChange={e => setWithdrawForm({ ...withdrawForm, upiName: e.target.value })}
                      className="w-full px-3 py-1.5 border border-[#D3DFDA] rounded-lg text-xs font-medium focus:outline-none focus:border-[#164A4A] bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold text-[#687B78] mb-0.5">Reference Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. October Commission Payout"
                  value={withdrawForm.notes}
                  onChange={e => setWithdrawForm({ ...withdrawForm, notes: e.target.value })}
                  className="w-full px-3 py-1.5 border border-[#D3DFDA] rounded-lg text-xs focus:outline-none focus:border-[#164A4A]"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#D3DFDA]">
                <button
                  type="button"
                  onClick={() => setWithdrawModalOpen(false)}
                  className="px-4 py-2 border border-[#D3DFDA] text-[#687B78] rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWithdrawal || !withdrawForm.amount || Number(withdrawForm.amount) <= 0 || Number(withdrawForm.amount) > stats.availableBalance}
                  className="px-5 py-2.5 bg-[#164A4A] text-white rounded-xl text-xs font-bold hover:bg-[#123E3E] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                >
                  {submittingWithdrawal ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Confirm &amp; Withdraw ₹{Number(withdrawForm.amount || 0).toLocaleString('en-IN')}
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* WITHDRAWAL RECEIPT MODAL */}
      {receiptModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center items-start pt-20 pb-16 px-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-[#D3DFDA] pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-[#202828]">Commission Payout Receipt</h3>
              </div>
              <button
                onClick={() => setReceiptModal(null)}
                className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-center">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Withdrawn Amount</span>
              <span className="text-3xl font-black text-emerald-800 mt-1 block">
                ₹{Number(receiptModal.amount || 0).toLocaleString('en-IN')}
              </span>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white uppercase">
                {receiptModal.status || 'Completed'}
              </span>
            </div>

            <div className="divide-y divide-[#D3DFDA] text-xs">
              <div className="py-2 flex justify-between">
                <span className="text-[#687B78]">Transaction Ref</span>
                <span className="font-mono font-bold text-[#202828]">{receiptModal.transactionId || receiptModal._id}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-[#687B78]">Date &amp; Time</span>
                <span className="font-semibold text-[#202828]">{new Date(receiptModal.requestedAt).toLocaleString('en-IN')}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-[#687B78]">Payout Method</span>
                <span className="font-semibold text-[#202828]">{receiptModal.withdrawalMethod}</span>
              </div>
              {receiptModal.withdrawalMethod === 'Bank Transfer' ? (
                <>
                  <div className="py-2 flex justify-between">
                    <span className="text-[#687B78]">Account Holder</span>
                    <span className="font-semibold text-[#202828]">{receiptModal.bankDetails?.accountHolder || 'N/A'}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-[#687B78]">Bank Name</span>
                    <span className="font-semibold text-[#202828]">{receiptModal.bankDetails?.bankName || 'N/A'}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-[#687B78]">Account Number</span>
                    <span className="font-mono font-semibold text-[#202828]">{receiptModal.bankDetails?.accountNumber || 'N/A'}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-[#687B78]">IFSC Code</span>
                    <span className="font-mono font-semibold text-[#202828]">{receiptModal.bankDetails?.ifscCode || 'N/A'}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="py-2 flex justify-between">
                    <span className="text-[#687B78]">UPI ID (VPA)</span>
                    <span className="font-mono font-semibold text-[#202828]">{receiptModal.upiDetails?.upiId || 'N/A'}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-[#687B78]">Beneficiary Name</span>
                    <span className="font-semibold text-[#202828]">{receiptModal.upiDetails?.upiName || 'N/A'}</span>
                  </div>
                </>
              )}
              {receiptModal.notes && (
                <div className="py-2 flex justify-between">
                  <span className="text-[#687B78]">Notes</span>
                  <span className="font-medium text-[#202828]">{receiptModal.notes}</span>
                </div>
              )}
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-[#D3DFDA]">
              <button
                type="button"
                onClick={() => handleDownloadWithdrawalPDF(receiptModal)}
                className="flex items-center gap-2 px-4 py-2 bg-[#164A4A] text-white rounded-xl text-xs font-bold hover:bg-[#123E3E] transition-all shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download PDF Receipt
              </button>
              <button
                type="button"
                onClick={() => setReceiptModal(null)}
                className="px-4 py-2 border border-[#D3DFDA] text-[#687B78] hover:bg-gray-50 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GymAdminTrainerCommission;
