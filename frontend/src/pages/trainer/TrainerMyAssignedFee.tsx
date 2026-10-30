import { useState, useEffect } from 'react';
import { IndianRupee, Clock, CheckCircle, Info, History, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import TrainerFinancialsTabs from '../../components/Trainer/TrainerFinancialsTabs';

const cycleBadge = (cycle: string) => {
  const map: Record<string, string> = {
    'Per Session': 'bg-[#F3E8E8] text-[#B76E79] border border-[#E7DADD]',
    'Weekly': 'bg-[#F3E8E8] text-[#B76E79] border border-[#E7DADD]',
    'Monthly': 'bg-[#F3E8E8] text-[#B76E79] border border-[#E7DADD]',
    'Custom': 'bg-[#F3E8E8] text-[#B76E79] border border-[#E7DADD]',
  };
  return map[cycle] || 'bg-[#F3E8E8] text-[#292524] border border-[#E7DADD]';
};

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    'Active': 'bg-[#F3E8E8] text-[#B76E79] border border-[#E7DADD]',
    'Pending': 'bg-amber-950/40 text-amber-400 border border-amber-800/50',
    'Rejected': 'bg-red-950/40 text-red-400 border border-red-800/50',
    'Inactive': 'bg-[#F3E8E8] text-[#57534E] border border-[#E7DADD]',
  };
  return map[status] || 'bg-[#F3E8E8] text-[#292524] border border-[#E7DADD]';
};

const TrainerMyAssignedFee = () => {
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFee, setSelectedFee] = useState<any>(null);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const res = await api.get('/trainer-payments/my-fee');
        const list = res.data.fees || (res.data.fee ? [res.data.fee] : []);
        setFees(list);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load assigned fees');
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  if (loading) return <div className="p-8 text-center text-[#57534E]">Loading fee details...</div>;

  const activeFee = fees.find(f => f.status === 'Active');

  // Helper to calculate exact net payable amount factoring in commission
  const getNetPayable = (f: any) => {
    if (!f) return 0;
    const base = Number(f.feeAmount) || 0;
    const commVal = Number(f.commissionValue) || 0;
    const commType = f.commissionType || 'Percentage';
    if (f.netAmount !== undefined && f.netAmount !== null && !isNaN(Number(f.netAmount))) {
      return Number(f.netAmount);
    }
    if (commVal > 0) {
      const deduction = commType === 'Fixed Amount' ? commVal : (base * commVal) / 100;
      return Math.max(0, Math.round(base - deduction));
    }
    return base;
  };

  // Sort: Active first → Pending → Inactive/Rejected, then newest date within each group
  const STATUS_ORDER: Record<string, number> = { Active: 0, Pending: 1, Inactive: 2, Rejected: 3 };
  const sortedFees = [...fees].sort((a, b) => {
    const statusDiff = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
    if (statusDiff !== 0) return statusDiff;
    return new Date(b.effectiveFrom || 0).getTime() - new Date(a.effectiveFrom || 0).getTime();
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <TrainerFinancialsTabs />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#292524]">My Assigned Fee</h1>
          <p className="text-sm text-[#57534E]">View the payment configurations set by your Gym Owner.</p>
        </div>
        <Link
          to="/trainer/payments-received"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#B76E79] text-white font-bold text-sm font-bold rounded-xl hover:bg-[#9F5965] transition-colors shadow-sm"
        >
          <Clock size={16} />
          View Payments Received
        </Link>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
          {error}
        </div>
      ) : fees.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center space-y-3">
          <Info className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold text-amber-900">No Fee Configured</h3>
          <p className="text-amber-700 text-sm">Your gym owner has not assigned a payment fee for you yet.</p>
        </div>
      ) : (
        <>
          {/* Active Configuration */}
          {activeFee ? (
            <div className="bg-[#FFFFFF] rounded-xl shadow-sm border border-[#E7DADD] overflow-hidden">
              <div className="p-6 border-b border-[#E7DADD] bg-[#F3E8E8] flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#292524] flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" /> Active Configuration
                </h2>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${cycleBadge(activeFee.billingCycle)}`}>
                  {activeFee.billingCycle}
                </span>
              </div>

              <div className="p-6 grid grid-cols-2 md:grid-cols-5 gap-6">
                <div>
                  <p className="text-sm font-medium text-[#57534E]">Net Payable Amount</p>
                  <p className="text-2xl font-black text-[#B76E79] flex items-center mt-1">
                    <IndianRupee className="w-5 h-5 mr-0.5 text-[#B76E79]" />
                    {getNetPayable(activeFee).toLocaleString('en-IN')}
                  </p>
                  <span className="text-[11px] text-[#57534E]">Exact disbursement</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#57534E]">Base Fee</p>
                  <p className="text-xl font-bold text-[#292524] mt-1">
                    ₹{Number(activeFee.feeAmount).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#57534E]">Training Type</p>
                  <p className="text-[#292524] font-medium mt-1">{activeFee.trainingType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#57534E]">Effective From</p>
                  <p className="text-[#292524] mt-1">{new Date(activeFee.effectiveFrom).toLocaleDateString()}</p>
                </div>
              </div>

              {activeFee.notes && (
                <div className="px-6 pb-6 border-t border-[#E7DADD] pt-4">
                  <p className="text-sm font-medium text-[#57534E]">Notes from Owner</p>
                  <p className="text-sm text-[#292524] bg-[#F3E8E8] p-3 rounded-lg mt-1 italic border border-[#E7DADD]">
                    "{activeFee.notes}"
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center space-y-3">
              <Info className="w-8 h-8 text-amber-500 mx-auto" />
              <h3 className="text-lg font-bold text-amber-900">No Active Configuration</h3>
              <p className="text-amber-700 text-sm">You have fee records, but none is currently active. Contact your Gym Owner.</p>
            </div>
          )}

          {/* Full Fee History */}
          <div className="bg-[#FFFFFF] rounded-xl shadow-sm border border-[#E7DADD] overflow-hidden">
            <div className="p-6 border-b border-[#E7DADD] bg-[#F3E8E8] flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#292524] flex items-center gap-2">
                <History className="w-5 h-5 text-[#57534E]" /> All Assigned Fees
              </h2>
              <span className="text-xs font-semibold text-[#57534E]">{fees.length} record{fees.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="divide-y divide-[#E7DADD]">
              {sortedFees.map((f, index) => (
                <div
                  key={f._id}
                  className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                    f.status === 'Active' ? 'bg-[#FFFFFF] hover:bg-[#F3E8E8]' : 'bg-[#F3E8E8] hover:bg-[#FFFFFF]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Order Number */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      f.status === 'Active' ? 'bg-[#B76E79] text-white' :
                      f.status === 'Pending' ? 'bg-amber-500 text-[#FFFFFF]' :
                      'bg-[#F3E8E8] text-[#57534E]'
                    }`}>
                      {index + 1}
                    </div>

                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      f.status === 'Active' ? 'bg-[#B76E79]/10 border border-[#B76E79]/20' : 'bg-[#F3E8E8] border border-[#E7DADD]'
                    }`}>
                      <IndianRupee className={`w-5 h-5 ${f.status === 'Active' ? 'text-[#B76E79]' : 'text-[#57534E]'}`} />
                    </div>

                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[#B76E79]">{f.trainingType}</p>
                        {f.status === 'Active' && (
                          <span className="text-[10px] font-bold text-[#B76E79] bg-[#B76E79]/10 border border-[#B76E79]/30 px-2 py-0.5 rounded-full uppercase tracking-wide">Current</span>
                        )}
                      </div>
                      <p className="text-xs text-[#57534E] mt-0.5">
                        {new Date(f.effectiveFrom).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {f.effectiveUntil && ` – ${new Date(f.effectiveUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-auto flex-wrap justify-end">
                    <div className="text-right">
                      <span className="text-base font-black text-[#B76E79] block">
                        ₹{getNetPayable(f).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] text-[#57534E] font-medium block">
                          Net Payable
                        </span>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${cycleBadge(f.billingCycle)}`}>
                      {f.billingCycle}
                    </span>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${statusBadge(f.status)}`}>
                      {f.status}
                    </span>
                    <button
                      onClick={() => setSelectedFee(f)}
                      className="px-3.5 py-1.5 text-xs font-semibold bg-[#F3E8E8] border border-[#E7DADD] text-[#B76E79] hover:bg-[#B76E79] hover:text-[#FFFFFF] font-bold rounded-xl transition-all whitespace-nowrap shadow-xs cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Fee Details Modal */}
      {selectedFee && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden my-auto max-h-[85vh] flex flex-col border border-[#E7DADD]">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E7DADD] bg-[#F3E8E8] shrink-0">
              <h3 className="font-bold text-[#292524] text-base">Assigned Fee Details</h3>
              <button
                onClick={() => setSelectedFee(null)}
                className="text-[#57534E] hover:text-[#FFFFFF] p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
              <div className="bg-[#F3E8E8] p-4 rounded-xl border border-[#E7DADD]">
                <div className="flex justify-between items-center">
                  <span className="text-[#B76E79] text-sm font-semibold">Exact Net Payable</span>
                  <span className="text-2xl font-black text-[#B76E79]">₹{getNetPayable(selectedFee).toLocaleString('en-IN')}</span>
                </div>
                {selectedFee.commissionValue !== undefined && Number(selectedFee.commissionValue) > 0 && (
                  <div className="mt-2 pt-2 border-t border-[#E7DADD]/60 flex justify-between text-xs text-[#B76E79] font-medium">
                    <span>Base Fee: ₹{Number(selectedFee.feeAmount).toLocaleString('en-IN')}</span>
                    <span>
                      Commission: {selectedFee.commissionType === 'Percentage' ? `${selectedFee.commissionValue}%` : `₹${selectedFee.commissionValue}`} (−₹{(Number(selectedFee.feeAmount) - getNetPayable(selectedFee)).toLocaleString('en-IN')})
                    </span>
                  </div>
                )}
              </div>

              {/* Contiguous details grid touching one by one */}
              <div className="border border-[#E7DADD] rounded-xl overflow-hidden divide-y divide-[#E7DADD] bg-[#FFFFFF] shadow-sm">
                <div className="grid grid-cols-2 divide-x divide-[#E7DADD]">
                  <div className="p-3 bg-[#FFFFFF]">
                    <p className="text-[#57534E] text-[11px] font-bold uppercase tracking-wider mb-0.5">Training Type</p>
                    <p className="font-semibold text-sm text-[#292524]">{selectedFee.trainingType || '-'}</p>
                  </div>
                  <div className="p-3 bg-[#FFFFFF]">
                    <p className="text-[#57534E] text-[11px] font-bold uppercase tracking-wider mb-0.5">Billing Cycle</p>
                    <p className="font-semibold text-sm text-[#292524]">{selectedFee.billingCycle || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 divide-x divide-[#E7DADD]">
                  <div className="p-3 bg-[#FFFFFF]">
                    <p className="text-[#57534E] text-[11px] font-bold uppercase tracking-wider mb-0.5">Commission</p>
                    <p className="font-semibold text-sm text-[#292524]">
                      {selectedFee.commissionValue !== undefined && Number(selectedFee.commissionValue) > 0
                        ? selectedFee.commissionType === 'Percentage'
                          ? `${selectedFee.commissionValue}%`
                          : `₹${Number(selectedFee.commissionValue).toLocaleString('en-IN')}`
                        : 'No Commission'}
                    </p>
                  </div>
                  <div className="p-3 bg-[#FFFFFF]">
                    <p className="text-[#57534E] text-[11px] font-bold uppercase tracking-wider mb-0.5">Commission Type</p>
                    <p className="font-semibold text-sm text-[#292524]">{selectedFee.commissionType || 'Percentage'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 divide-x divide-[#E7DADD]">
                  <div className="p-3 bg-[#FFFFFF]">
                    <p className="text-[#57534E] text-[11px] font-bold uppercase tracking-wider mb-0.5">Status</p>
                    <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-semibold ${statusBadge(selectedFee.status)}`}>
                      {selectedFee.status}
                    </span>
                  </div>
                  <div className="p-3 bg-[#FFFFFF]">
                    <p className="text-[#57534E] text-[11px] font-bold uppercase tracking-wider mb-0.5">Effective From</p>
                    <p className="font-semibold text-sm text-[#292524]">
                      {selectedFee.effectiveFrom ? new Date(selectedFee.effectiveFrom).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                    </p>
                  </div>
                </div>

                {selectedFee.effectiveUntil && (
                  <div className="p-3 bg-[#FFFFFF]">
                    <p className="text-[#57534E] text-[11px] font-bold uppercase tracking-wider mb-0.5">Effective Until</p>
                    <p className="font-semibold text-sm text-[#292524]">
                      {new Date(selectedFee.effectiveUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>

              {selectedFee.notes && (
                <div className="p-3.5 bg-[#F3E8E8] border border-[#E7DADD] rounded-xl">
                  <p className="text-[#57534E] text-xs font-semibold mb-1">Notes from Gym Owner</p>
                  <p className="text-xs text-[#292524] italic">{selectedFee.notes}</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#E7DADD] bg-[#F3E8E8] flex justify-end shrink-0">
              <button
                onClick={() => setSelectedFee(null)}
                className="px-5 py-2 bg-[#B76E79] text-white font-bold rounded-xl text-xs font-bold hover:bg-[#B76E79]/90 transition-colors shadow-sm"
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

export default TrainerMyAssignedFee;