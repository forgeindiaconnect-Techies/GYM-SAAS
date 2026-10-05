import { useState, useEffect, useCallback } from 'react';
import { IndianRupee, Plus, Edit, CheckCircle, XCircle, Search, ChevronDown, AlertCircle, Clock, X, Percent, Info } from 'lucide-react';
import api from '../../utils/api';

const TRAINING_TYPES = ['Online Training', 'Offline Training', 'Hybrid Training'];
const BILLING_CYCLES = ['Weekly', 'Monthly'];

const defaultForm = {
  trainerId: '',
  trainingType: 'Online Training',
  feeAmount: '',
  billingCycle: 'Monthly',
  effectiveFrom: new Date().toISOString().slice(0, 10),
  paymentMethod: 'Bank Transfer',
  status: 'Active',
  notes: '',
  commissionType: 'Percentage',
  commissionValue: '',
  accountHolder: '',
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  upiId: '',
  upiName: '',
};

const cycleBadge = (cycle: string) => {
  const map: Record<string, string> = {
    'Per Session': 'bg-purple-100 text-purple-700',
    'Weekly': 'bg-blue-100 text-blue-700',
    'Monthly': 'bg-[#D2B48C]/10 text-[#164A4A]',
    'Custom': 'bg-orange-100 text-orange-700',
  };
  return map[cycle] || 'bg-gray-100 text-gray-700';
};

const GymAdminTrainerFees = () => {
  const [fees, setFees] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editFee, setEditFee] = useState<any>(null);
  const [form, setForm] = useState<any>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [feeRes, trainerRes] = await Promise.allSettled([
        api.get('/trainer-payments/fees'),
        api.get('/trainers')
      ]);

      let feeList: any[] = [];
      let trainerList: any[] = [];

      if (feeRes.status === 'fulfilled' && feeRes.value.data) {
        feeList = feeRes.value.data.fees || [];
        trainerList = feeRes.value.data.trainers || [];
      }

      if (trainerRes.status === 'fulfilled' && trainerRes.value.data) {
        const directTrainers = trainerRes.value.data.trainers || [];
        const existingIds = new Set(trainerList.map(t => (t._id || t).toString()));
        for (const dt of directTrainers) {
          if (dt && dt._id && !existingIds.has(dt._id.toString())) {
            trainerList.push(dt);
            existingIds.add(dt._id.toString());
          }
        }
      }

      // Also ensure any trainer present in feeList.trainerId is included
      const allTrainerIds = new Set(trainerList.map(t => (t._id || t).toString()));
      feeList.forEach(f => {
        if (f.trainerId && typeof f.trainerId === 'object' && f.trainerId._id) {
          const id = f.trainerId._id.toString();
          if (!allTrainerIds.has(id)) {
            trainerList.push(f.trainerId);
            allTrainerIds.add(id);
          }
        }
      });

      setFees(feeList);
      setTrainers(trainerList);
    } catch {
      showToast('Failed to load trainer data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Build a unified "all trainers" list with their fee info merged in
  const feeMap = new Map(
    fees.map(f => [
      (f.trainerId?._id || f.trainerId)?.toString(),
      f
    ])
  );

  const getEffectiveFee = (trainer: any, feeRecord: any) => {
    if (feeRecord) return feeRecord;
    if (trainer && trainer.fee && Number(trainer.fee) > 0) {
      const modeMap: Record<string, string> = {
        'online': 'Online Training',
        'offline': 'Offline Training',
        'both': 'Hybrid Training'
      };
      const cycleMap: Record<string, string> = {
        'Per Week': 'Weekly',
        'Per Month': 'Monthly',
        'Per Session': 'Per Session'
      };
      return {
        _id: null,
        trainerId: trainer,
        trainingType: modeMap[trainer.trainingMode] || 'Offline Training',
        feeAmount: Number(trainer.fee),
        billingCycle: cycleMap[trainer.paymentType] || 'Monthly',
        paymentMethod: 'Bank Transfer',
        effectiveFrom: trainer.createdAt || new Date().toISOString(),
        status: trainer.status === 'Active' ? 'Active' : 'Pending',
        isSyncedFromProfile: true,
      };
    }
    return null;
  };

  const allRows = trainers.map(t => {
    const feeRecord = feeMap.get(t._id?.toString()) || null;
    const effectiveFee = getEffectiveFee(t, feeRecord);
    return {
      trainer: t,
      fee: effectiveFee,
      rawFee: feeRecord,
    };
  }).filter(row => {
    const q = search.toLowerCase();
    return row.trainer.name?.toLowerCase().includes(q) || row.trainer.email?.toLowerCase().includes(q);
  });

  const configuredCount = allRows.filter(r => r.fee !== null).length;
  const notConfiguredCount = allRows.length - configuredCount;

  const openSetFee = (trainer: any) => {
    setEditFee(null);
    const modeMap: Record<string, string> = {
      'online': 'Online Training',
      'offline': 'Offline Training',
      'both': 'Hybrid Training'
    };
    const cycleMap: Record<string, string> = {
      'Per Week': 'Weekly',
      'Per Month': 'Monthly',
      'Per Session': 'Per Session'
    };
    setForm({
      ...defaultForm,
      trainerId: trainer._id,
      feeAmount: trainer.fee || '',
      trainingType: modeMap[trainer.trainingMode] || 'Offline Training',
      billingCycle: cycleMap[trainer.paymentType] || 'Monthly',
      effectiveFrom: trainer.createdAt ? new Date(trainer.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      commissionType: trainer.commissionType || 'Percentage',
      commissionValue: trainer.commissionValue !== undefined && trainer.commissionValue !== null ? trainer.commissionValue.toString() : '',
      accountHolder: trainer.name || '',
      upiId: trainer.phone ? `${trainer.phone}@paytm` : '',
      upiName: trainer.name || '',
    });
    setShowModal(true);
  };

  const openEditFee = (fee: any, trainer?: any) => {
    setEditFee(fee?._id ? fee : null);
    const tr = trainer || fee?.trainerId;
    setForm({
      trainerId: (fee?.trainerId?._id || fee?.trainerId || tr?._id || '').toString(),
      trainingType: fee?.trainingType || 'Offline Training',
      feeAmount: fee?.feeAmount || tr?.fee || '',
      billingCycle: fee?.billingCycle || 'Monthly',
      effectiveFrom: fee?.effectiveFrom ? new Date(fee.effectiveFrom).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      paymentMethod: fee?.paymentMethod || 'Bank Transfer',
      status: fee?.status || 'Active',
      notes: fee?.notes || '',
      commissionType: fee?.commissionType || tr?.commissionType || 'Percentage',
      commissionValue: fee?.commissionValue !== undefined && fee?.commissionValue !== null ? fee.commissionValue.toString() : (tr?.commissionValue !== undefined && tr?.commissionValue !== null ? tr.commissionValue.toString() : ''),
      accountHolder: fee?.bankDetails?.accountHolder || tr?.name || '',
      bankName: fee?.bankDetails?.bankName || '',
      accountNumber: fee?.bankDetails?.accountNumber || '',
      ifscCode: fee?.bankDetails?.ifscCode || '',
      upiId: fee?.upiDetails?.upiId || (tr?.phone ? `${tr.phone}@paytm` : ''),
      upiName: fee?.upiDetails?.upiName || tr?.name || '',
    });
    setShowModal(true);
  };

  const openAddNew = () => {
    setEditFee(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.trainerId || !form.feeAmount || !form.billingCycle || !form.effectiveFrom) {
      const msg = 'Please fill all required fields (Fee Amount, etc)';
      showToast(msg, 'error');
      alert(msg);
      return;
    }

    const feeNum = Number(form.feeAmount) || 0;
    const commNum = form.commissionValue !== '' && form.commissionValue !== undefined && form.commissionValue !== null 
      ? Number(form.commissionValue) 
      : 0;

    if (isNaN(commNum) || commNum < 0) {
      const msg = 'Commission value cannot be negative.';
      showToast(msg, 'error');
      alert(msg);
      return;
    }
    if (form.commissionType === 'Percentage' && commNum > 100) {
      const msg = 'Commission percentage cannot exceed 100%.';
      showToast(msg, 'error');
      alert(msg);
      return;
    }
    if (form.commissionType === 'Fixed Amount' && commNum > feeNum) {
      const msg = 'Commission fixed amount cannot exceed the total fee amount.';
      showToast(msg, 'error');
      alert(msg);
      return;
    }

    const commDeduction = form.commissionType === 'Fixed Amount' ? commNum : (feeNum * commNum) / 100;
    const netAmount = Math.max(0, feeNum - commDeduction);

    setSaving(true);
    try {
      const payload = { 
        ...form, 
        paymentMethod: form.paymentMethod || 'Bank Transfer',
        commissionType: form.commissionType || 'Percentage',
        commissionValue: commNum,
        netAmount,
        accountHolder: form.accountHolder,
        bankName: form.bankName,
        accountNumber: form.accountNumber,
        ifscCode: form.ifscCode,
        upiId: form.upiId,
        upiName: form.upiName
      };
      await api.post('/trainer-payments/fee', payload);
      showToast(editFee ? 'Trainer fee updated successfully!' : 'Trainer fee set successfully!');
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message || 'Failed to save fee';
      showToast(errorMsg, 'error');
      alert('Error: ' + errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#202828]">Trainer Fee Settings</h1>
          <p className="text-[#687B78] text-sm mt-1">Configure and manage fees for your trainers</p>
        </div>
        <button
          onClick={openAddNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#164A4A] text-white rounded-xl font-semibold hover:bg-[#C6A77D] transition-colors shadow-lg shadow-green-200 text-sm"
        >
          <Plus size={16} />
          Set New Fee
        </button>
      </div>

      {/* Summary Cards */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-[#E8E5DA] rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <IndianRupee size={18} className="text-[#D2B48C]" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#202828]">{trainers.length}</p>
              <p className="text-xs text-[#687B78]">Total Trainers</p>
            </div>
          </div>
          <div className="bg-white border border-[#E8E5DA] rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <CheckCircle size={18} className="text-[#164A4A]" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#202828]">{configuredCount}</p>
              <p className="text-xs text-[#687B78]">Fee Configured</p>
            </div>
          </div>
          <div className="bg-white border border-[#E8E5DA] rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
              <AlertCircle size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#202828]">{notConfiguredCount}</p>
              <p className="text-xs text-[#687B78]">Pending Setup</p>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8ADA9]" />
        <input
          type="text"
          placeholder="Search trainer..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-[#E8E5DA] rounded-xl text-sm outline-none focus:border-[#164A4A] focus:ring-1 focus:ring-[#164A4A]/30 transition bg-white"
        />
      </div>

      {/* Table — ALL trainers */}
      <div className="bg-white border border-[#E8E5DA] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-[#164A4A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : allRows.length === 0 ? (
          <div className="text-center py-20">
            <IndianRupee size={40} className="mx-auto text-[#CBD5E1] mb-3" />
            <p className="text-[#687B78] font-semibold">No trainers found</p>
            <p className="text-[#A8ADA9] text-sm mt-1">Add trainers to your gym first, then configure fees here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#F2EFE8] border-b border-[#E8E5DA]">
                  <th className="px-5 py-3.5 font-semibold text-[#687B78]">Trainer</th>
                  <th className="px-5 py-3.5 font-semibold text-[#687B78]">Training Type</th>
                  <th className="px-5 py-3.5 font-semibold text-[#687B78] text-right">Fee (Salary)</th>
                  <th className="px-5 py-3.5 font-semibold text-[#687B78]">Commission</th>
                  <th className="px-5 py-3.5 font-semibold text-[#687B78] text-right">Remaining Amount</th>
                  <th className="px-5 py-3.5 font-semibold text-[#687B78]">Billing Cycle</th>
                  <th className="px-5 py-3.5 font-semibold text-[#687B78]">Effective From</th>
                  <th className="px-5 py-3.5 font-semibold text-[#687B78]">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-[#687B78]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {allRows.map(({ trainer, fee }) => (
                  <tr key={trainer._id} className="hover:bg-[#F2EFE8] transition-colors">
                    {/* Trainer */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#164A4A] to-[#6fa3a0] flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {trainer.name?.[0]?.toUpperCase() || 'T'}
                        </div>
                        <div>
                          <p className="font-semibold text-[#202828]">{trainer.name}</p>
                          <p className="text-xs text-[#A8ADA9]">{trainer.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Training Type */}
                    <td className="px-5 py-4 text-[#455250]">
                      {fee ? fee.trainingType : <span className="text-[#CBD5E1] italic text-xs">Not set</span>}
                    </td>

                    {/* Fee */}
                    <td className="px-5 py-4 text-right">
                      {fee ? (
                        <span className="font-bold text-[#202828]">₹{Number(fee.feeAmount).toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-[#CBD5E1] italic text-xs">—</span>
                      )}
                    </td>

                    {/* Commission */}
                    <td className="px-5 py-4">
                      {fee && fee.commissionValue !== undefined && Number(fee.commissionValue) > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                          -{fee.commissionType === 'Percentage'
                            ? `${fee.commissionValue}%`
                            : `₹${Number(fee.commissionValue).toLocaleString('en-IN')}`}
                        </span>
                      ) : (
                        <span className="text-[#CBD5E1] italic text-xs">0%</span>
                      )}
                    </td>

                    {/* Remaining Amount */}
                    <td className="px-5 py-4 text-right">
                      {fee ? (() => {
                        const base = Number(fee.feeAmount) || 0;
                        const commVal = Number(fee.commissionValue) || 0;
                        const deduction = fee.commissionType === 'Fixed Amount' ? commVal : (base * commVal) / 100;
                        const remaining = fee.netAmount !== undefined ? fee.netAmount : Math.max(0, base - deduction);
                        return (
                          <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-xs">
                            ₹{Math.round(remaining).toLocaleString('en-IN')}
                          </span>
                        );
                      })() : (
                        <span className="text-[#CBD5E1] italic text-xs">—</span>
                      )}
                    </td>

                    {/* Billing Cycle */}
                    <td className="px-5 py-4">
                      {fee ? (
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${cycleBadge(fee.billingCycle)}`}>
                          {fee.billingCycle}
                        </span>
                      ) : (
                        <span className="text-[#CBD5E1] italic text-xs">—</span>
                      )}
                    </td>

                    {/* Effective From */}
                    <td className="px-5 py-4 text-[#455250]">
                      {fee?.effectiveFrom
                        ? new Date(fee.effectiveFrom).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : <span className="text-[#CBD5E1] italic text-xs">—</span>}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      {fee ? (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${
                          fee.status === 'Active' ? 'bg-[#D2B48C]/10 text-[#164A4A]' :
                          fee.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                          fee.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {fee.status === 'Pending' && <Clock size={12} />}
                          {fee.status === 'Rejected' && <XCircle size={12} />}
                          {fee.status === 'Active' && <CheckCircle size={12} />}
                          {fee.status}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold w-fit">
                          <AlertCircle size={11} />
                          Not Set
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4">
                      {fee ? (
                        <button
                          onClick={() => openEditFee(fee, trainer)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#F1F5F3] text-[#164A4A] border border-[#D3DFDA] rounded-lg text-xs font-semibold hover:bg-[#D3DFDA] transition-colors"
                        >
                          <Edit size={13} />
                          Edit Fee
                        </button>
                      ) : (
                        <button
                          onClick={() => openSetFee(trainer)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#164A4A] text-white rounded-lg text-xs font-bold hover:bg-[#C6A77D] transition-colors shadow shadow-green-200"
                        >
                          <Plus size={13} />
                          Set Fee
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#D3DFDA] my-auto max-h-[85vh] flex flex-col">
            <div className="p-6 border-b border-[#D3DFDA] flex justify-between items-center bg-[#F8F9F8] shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#202828]">{editFee ? 'Edit Trainer Fee' : 'Set Trainer Fee'}</h2>
                <p className="text-sm text-[#687B78] mt-1">Configure fee details for the selected trainer</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form autoComplete="off" onSubmit={e => e.preventDefault()} className="flex flex-col flex-1 overflow-hidden min-h-0">
            {/* Hidden honeypot inputs — absorb Chrome password manager autofill */}
            <input type="text" style={{ display: 'none' }} aria-hidden="true" />
            <input type="password" style={{ display: 'none' }} aria-hidden="true" />
            <div className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
              {/* Trainer */}
              <div>
                <label className="block text-sm font-semibold text-[#455250] mb-1.5">Trainer <span className="text-red-400">*</span></label>
                <div className="relative">
                  <select
                    value={form.trainerId}
                    onChange={e => setForm({ ...form, trainerId: e.target.value })}
                    className="w-full appearance-none border border-[#E8E5DA] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#164A4A] focus:ring-1 focus:ring-[#164A4A]/30 bg-white pr-9"
                  >
                    <option value="">Select trainer...</option>
                    {trainers.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8ADA9] pointer-events-none" />
                </div>
              </div>

              {/* Training Type */}
              <div>
                <label className="block text-sm font-semibold text-[#455250] mb-1.5">Training Type <span className="text-red-400">*</span></label>
                <div className="relative">
                  <select
                    value={form.trainingType}
                    onChange={e => setForm({ ...form, trainingType: e.target.value })}
                    className="w-full appearance-none border border-[#E8E5DA] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#164A4A] focus:ring-1 focus:ring-[#164A4A]/30 bg-white pr-9"
                  >
                    {TRAINING_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8ADA9] pointer-events-none" />
                </div>
              </div>

              {/* Fee + Billing Cycle */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-[#455250] mb-1.5">Fee Amount (₹) <span className="text-red-400">*</span></label>
                  <input
                    type="number"
                    value={form.feeAmount}
                    onChange={e => setForm({ ...form, feeAmount: e.target.value })}
                    placeholder="e.g. 5000"
                    className="w-full border border-[#E8E5DA] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#164A4A] focus:ring-1 focus:ring-[#164A4A]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#455250] mb-1.5">Billing Cycle <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <select
                      value={form.billingCycle}
                      onChange={e => setForm({ ...form, billingCycle: e.target.value })}
                      className="w-full appearance-none border border-[#E8E5DA] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#164A4A] focus:ring-1 focus:ring-[#164A4A]/30 bg-white pr-9"
                    >
                      {BILLING_CYCLES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8ADA9] pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Commission Section */}
              <div className="p-4 bg-[#F8FAF9] border border-[#E8E5DA] rounded-2xl space-y-3">
                <div className="flex items-center gap-2 border-b border-[#E8E5DA] pb-2">
                  <div className="w-6 h-6 rounded-lg bg-[#164A4A]/10 text-[#164A4A] flex items-center justify-center">
                    <Percent size={13} className="font-bold" />
                  </div>
                  <h4 className="text-sm font-bold text-[#202828]">Commission</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#455250] mb-1.5">Commission Type</label>
                    <div className="relative">
                      <select
                        value={form.commissionType}
                        onChange={e => {
                          const newType = e.target.value;
                          let val = form.commissionValue;
                          if (newType === 'Percentage' && Number(val) > 100) {
                            val = '100';
                          }
                          setForm({ ...form, commissionType: newType, commissionValue: val });
                        }}
                        className="w-full appearance-none border border-[#E8E5DA] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#164A4A] focus:ring-1 focus:ring-[#164A4A]/30 bg-white pr-9 text-[#202828]"
                      >
                        <option value="Percentage">Percentage (%)</option>
                        <option value="Fixed Amount">Fixed Amount (₹)</option>
                      </select>
                      <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8ADA9] pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#455250] mb-1.5">
                      Commission Value {form.commissionType === 'Percentage' ? '(%)' : '(₹)'}
                    </label>
                    <div className="relative">
                      {form.commissionType === 'Fixed Amount' ? (
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8ADA9]" />
                      ) : (
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8ADA9]" />
                      )}
                      <input
                        type="number"
                        min="0"
                        max={form.commissionType === 'Percentage' ? 100 : undefined}
                        step={form.commissionType === 'Percentage' ? '0.1' : '1'}
                        value={form.commissionValue}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === '') {
                            setForm({ ...form, commissionValue: '' });
                            return;
                          }
                          const num = parseFloat(val);
                          if (num < 0) return; // Prevent negative values
                          if (form.commissionType === 'Percentage' && num > 100) {
                            setForm({ ...form, commissionValue: '100' });
                            return;
                          }
                          setForm({ ...form, commissionValue: val });
                        }}
                        placeholder={form.commissionType === 'Percentage' ? 'e.g. 10 (up to 100%)' : 'e.g. 1000'}
                        className="w-full border border-[#E8E5DA] rounded-xl pl-9 pr-10 py-2.5 text-sm outline-none focus:border-[#164A4A] focus:ring-1 focus:ring-[#164A4A]/30 bg-white text-[#202828]"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#687B78] pointer-events-none">
                        {form.commissionType === 'Percentage' ? '%' : '₹'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Automatic Live Salary Reduction & Remaining Amount Calculation */}
                {(() => {
                  const feeNum = Number(form.feeAmount) || 0;
                  const commNum = Number(form.commissionValue) || 0;
                  const commDeduction = form.commissionType === 'Fixed Amount' ? commNum : (feeNum * commNum) / 100;
                  const remaining = Math.max(0, feeNum - commDeduction);
                  const isOver = commDeduction > feeNum && feeNum > 0;

                  return (
                    <div className="pt-3 border-t border-[#E8E5DA] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#455250] uppercase tracking-wider">Salary & Commission Calculation</span>
                        {commNum > 0 && (
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                            isOver ? 'text-red-700 bg-red-100/60 border-red-200' : 'text-emerald-800 bg-emerald-100/60 border-emerald-200'
                          }`}>
                            {form.commissionType === 'Percentage' ? `${commNum}% Deduction` : `₹${commNum.toLocaleString('en-IN')} Deduction`}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white p-2.5 rounded-xl border border-[#E8E5DA] shadow-2xs">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-[#687B78]">Total Salary / Fee</p>
                          <p className="text-sm sm:text-base font-bold text-[#202828] mt-0.5">
                            ₹{feeNum.toLocaleString('en-IN')}
                          </p>
                        </div>

                        <div className="bg-red-50/70 p-2.5 rounded-xl border border-red-200 shadow-2xs">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-red-700">Commission Deducted</p>
                          <p className="text-sm sm:text-base font-bold text-red-600 mt-0.5">
                            -₹{Math.round(commDeduction).toLocaleString('en-IN')}
                          </p>
                        </div>

                        <div className="bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-300 shadow-2xs">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-800">Remaining Amount</p>
                          <p className="text-sm sm:text-base font-bold text-emerald-700 mt-0.5">
                            ₹{Math.round(remaining).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      {commNum > 0 && feeNum > 0 && (
                        <div className="text-xs text-[#164A4A] bg-[#164A4A]/5 px-3 py-2 rounded-xl font-medium flex items-center gap-1.5 border border-[#164A4A]/10">
                          <Info size={14} className="shrink-0 text-[#164A4A]" />
                          <span>
                            {form.commissionType === 'Percentage'
                              ? `Commission of ${commNum}% (-₹${Math.round(commDeduction).toLocaleString('en-IN')}) automatically reduces total salary ₹${feeNum.toLocaleString('en-IN')}. Remaining payable: `
                              : `Fixed commission of -₹${Number(commNum).toLocaleString('en-IN')} automatically reduces total salary ₹${feeNum.toLocaleString('en-IN')}. Remaining payable: `}
                            <strong className="font-extrabold text-emerald-800 underline">₹{Math.round(remaining).toLocaleString('en-IN')}</strong>
                          </span>
                        </div>
                      )}

                      {isOver && (
                        <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
                          <AlertCircle size={13} className="shrink-0" />
                          Commission deduction exceeds total salary. Please check the values.
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>


              {/* Effective From — full width */}
              <div>
                <label className="block text-sm font-semibold text-[#455250] mb-1.5">Effective From <span className="text-red-400">*</span></label>
                <input
                  type="date"
                  value={form.effectiveFrom}
                  onChange={e => setForm({ ...form, effectiveFrom: e.target.value })}
                  className="w-full border border-[#E8E5DA] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#164A4A] focus:ring-1 focus:ring-[#164A4A]/30"
                />
              </div>



              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-[#455250] mb-1.5">Status</label>
                <div className="relative">
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full appearance-none border border-[#E8E5DA] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#164A4A] focus:ring-1 focus:ring-[#164A4A]/30 bg-white pr-9"
                  >
                    {['Active', 'Inactive', 'Pending', 'Rejected'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8ADA9] pointer-events-none" />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-[#455250] mb-1.5">Notes (Optional)</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  placeholder="Any additional notes..."
                  className="w-full border border-[#E8E5DA] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#164A4A] focus:ring-1 focus:ring-[#164A4A]/30 resize-none"
                />
              </div>
            </div>

            <div className="p-5 border-t border-[#D3DFDA] flex gap-3 bg-[#F8F9F8] shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-[#D3DFDA] rounded-xl text-sm font-semibold text-[#687B78] hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 bg-[#164A4A] text-white rounded-xl text-sm font-bold hover:bg-[#164A4A]/90 transition-colors disabled:opacity-60 shadow-sm"
              >
                {saving ? 'Saving...' : 'Save Trainer Fee'}
              </button>
            </div>
            </form>
          </div>
        </div>
      )}
      {/* Toast - Moved to end of DOM so it's always on top */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[9999] px-5 py-3 rounded-xl shadow-xl font-semibold text-white text-sm flex items-center gap-2 transition-all ${toast.type === 'success' ? 'bg-[#164A4A]' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default GymAdminTrainerFees;
