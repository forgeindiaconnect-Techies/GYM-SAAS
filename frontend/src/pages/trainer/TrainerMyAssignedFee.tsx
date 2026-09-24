import { useState, useEffect } from 'react';
import { IndianRupee, Clock, CheckCircle, Info, History, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const cycleBadge = (cycle: string) => {
  const map: Record<string, string> = {
    'Per Session': 'bg-purple-100 text-purple-700',
    'Weekly': 'bg-blue-100 text-blue-700',
    'Monthly': 'bg-[#D2B48C]/10 text-[#164A4A]',
    'Custom': 'bg-orange-100 text-orange-700',
  };
  return map[cycle] || 'bg-gray-100 text-gray-700';
};

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    'Active': 'bg-[#D2B48C]/10 text-[#164A4A]',
    'Pending': 'bg-amber-100 text-amber-700',
    'Rejected': 'bg-red-100 text-red-700',
    'Inactive': 'bg-gray-100 text-gray-500',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
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

  if (loading) return <div className="p-8 text-center text-gray-500">Loading fee details...</div>;

  const activeFee = fees.find(f => f.status === 'Active');

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Assigned Fee</h1>
          <p className="text-sm text-gray-500">View the payment configurations set by your Gym Owner.</p>
        </div>
        <Link
          to="/trainer/payments-received"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#164A4A] text-white text-sm font-bold rounded-xl hover:bg-[#C6A77D] transition-colors shadow-sm"
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" /> Active Configuration
                </h2>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${cycleBadge(activeFee.billingCycle)}`}>
                  {activeFee.billingCycle}
                </span>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Fee Amount</p>
                    <p className="text-2xl font-bold text-gray-900 flex items-center mt-1">
                      <IndianRupee className="w-5 h-5 mr-1 text-gray-400" />
                      {activeFee.feeAmount}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Training Type</p>
                    <p className="text-gray-900 font-medium mt-1">{activeFee.trainingType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Effective From</p>
                    <p className="text-gray-900 mt-1">{new Date(activeFee.effectiveFrom).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-4 md:border-l md:pl-6 border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Default Payment Method</p>
                    <p className="text-gray-900 font-medium mt-1">{activeFee.paymentMethod}</p>
                  </div>

                  {activeFee.paymentMethod === 'Bank Transfer' && activeFee.bankDetails && (
                    <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                      <p><span className="text-gray-500">Bank:</span> {activeFee.bankDetails.bankName}</p>
                      <p><span className="text-gray-500">A/C:</span> {activeFee.bankDetails.accountNumber}</p>
                      <p><span className="text-gray-500">IFSC:</span> {activeFee.bankDetails.ifscCode}</p>
                    </div>
                  )}

                  {activeFee.paymentMethod === 'UPI' && activeFee.upiDetails && (
                    <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                      <p><span className="text-gray-500">UPI ID:</span> {activeFee.upiDetails.upiId}</p>
                      <p><span className="text-gray-500">Name:</span> {activeFee.upiDetails.upiName}</p>
                    </div>
                  )}

                  {activeFee.notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Notes from Owner</p>
                      <p className="text-sm text-gray-700 bg-amber-50 p-3 rounded-lg mt-1 italic border border-amber-100">
                        "{activeFee.notes}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center space-y-3">
              <Info className="w-8 h-8 text-amber-500 mx-auto" />
              <h3 className="text-lg font-bold text-amber-900">No Active Configuration</h3>
              <p className="text-amber-700 text-sm">You have fee records, but none is currently active. Contact your Gym Owner.</p>
            </div>
          )}

          {/* Full Fee History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <History className="w-5 h-5 text-gray-500" /> All Assigned Fees
              </h2>
              <span className="text-xs font-semibold text-gray-500">{fees.length} record{fees.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="divide-y divide-gray-100">
              {fees.map(f => (
                <div key={f._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
                      <IndianRupee className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-purple-700">{f.trainingType}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {new Date(f.effectiveFrom).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {f.effectiveUntil && ` – ${new Date(f.effectiveUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold text-gray-900">₹{f.feeAmount?.toLocaleString('en-IN')}</p>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${cycleBadge(f.billingCycle)}`}>
                      {f.billingCycle}
                    </span>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${statusBadge(f.status)}`}>
                      {f.status}
                    </span>
                    <button
                      onClick={() => setSelectedFee(f)}
                      className="px-3 py-1.5 text-xs font-semibold text-[#3B82F6] hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#E8E5DA] bg-[#F2EFE8]">
              <h3 className="font-bold text-[#202828]">Assigned Fee Details</h3>
              <button
                onClick={() => setSelectedFee(null)}
                className="text-[#687B78] hover:text-[#202828]"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-gray-500 text-sm font-medium">Fee Amount</span>
                <span className="text-2xl font-bold text-[#202828]">₹{selectedFee.feeAmount?.toLocaleString('en-IN')}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Training Type</p>
                  <p className="font-semibold text-gray-900">{selectedFee.trainingType || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Billing Cycle</p>
                  <p className="font-semibold text-gray-900">{selectedFee.billingCycle || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Status</p>
                  <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${statusBadge(selectedFee.status)}`}>
                    {selectedFee.status}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Payment Method</p>
                  <p className="font-semibold text-gray-900">{selectedFee.paymentMethod || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Effective From</p>
                  <p className="font-semibold text-gray-900">
                    {selectedFee.effectiveFrom ? new Date(selectedFee.effectiveFrom).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Effective Until</p>
                  <p className="font-semibold text-gray-900">
                    {selectedFee.effectiveUntil ? new Date(selectedFee.effectiveUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not set'}
                  </p>
                </div>
              </div>

              {selectedFee.paymentMethod === 'Bank Transfer' && selectedFee.bankDetails && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-gray-500 mb-2 text-sm">Bank Details</p>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                    <p><span className="text-gray-500">Bank:</span> <span className="font-semibold text-gray-900">{selectedFee.bankDetails.bankName || '-'}</span></p>
                    <p><span className="text-gray-500">Account:</span> <span className="font-semibold text-gray-900">{selectedFee.bankDetails.accountNumber || '-'}</span></p>
                    <p><span className="text-gray-500">IFSC:</span> <span className="font-semibold text-gray-900">{selectedFee.bankDetails.ifscCode || '-'}</span></p>
                  </div>
                </div>
              )}

              {selectedFee.paymentMethod === 'UPI' && selectedFee.upiDetails && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-gray-500 mb-2 text-sm">UPI Details</p>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                    <p><span className="text-gray-500">UPI ID:</span> <span className="font-semibold text-gray-900">{selectedFee.upiDetails.upiId || '-'}</span></p>
                    <p><span className="text-gray-500">Name:</span> <span className="font-semibold text-gray-900">{selectedFee.upiDetails.upiName || '-'}</span></p>
                  </div>
                </div>
              )}

              {selectedFee.notes && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-gray-500 mb-1 text-sm">Notes from Owner</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">{selectedFee.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerMyAssignedFee;