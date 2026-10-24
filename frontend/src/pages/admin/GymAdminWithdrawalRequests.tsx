import { useState, useEffect } from 'react';
import { IndianRupee, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const GymAdminWithdrawalRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const branchParam = user?.branchId ? `?branchId=${user.branchId}` : '';
      const res = await api.get(`/trainer-payments/withdrawals${branchParam}`);
      setRequests(res.data.requests);
    } catch (err) {
      console.error('Failed to fetch withdrawal requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user?.branchId]);

  const handleApprove = async (id: string) => {
    setProcessing(id);
    try {
      await api.put(`/trainer-payments/withdrawals/${id}/approve`);
      await fetchRequests();
    } catch (err: any) {
      console.error('Failed to approve withdrawal', err);
      alert(err.response?.data?.message || 'Failed to approve');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessing(id);
    try {
      await api.put(`/trainer-payments/withdrawals/${id}/reject`);
      await fetchRequests();
    } catch (err: any) {
      console.error('Failed to reject withdrawal', err);
      alert(err.response?.data?.message || 'Failed to reject');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-[#2DD4BF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F5FAFA]">Withdrawal Requests</h1>
        <p className="text-[#9AAEAE] text-sm mt-1">Review and process trainer withdrawal requests</p>
      </div>

      <div className="bg-[#141D1E] border border-[#1B2728] rounded-2xl overflow-hidden shadow-sm">
        {requests.length === 0 ? (
          <div className="p-12 text-center">
            <IndianRupee size={40} className="mx-auto text-[#2A3A3A] mb-4" />
            <h3 className="text-lg font-semibold text-[#9AAEAE]">No Pending Requests</h3>
            <p className="text-[#9AAEAE] text-sm mt-2">There are currently no withdrawal requests from trainers.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0E1415] border-b border-[#1B2728] text-xs uppercase tracking-wider text-[#9AAEAE]">
                  <th className="px-5 py-3 font-semibold">Trainer</th>
                  <th className="px-5 py-3 font-semibold">Date Requested</th>
                  <th className="px-5 py-3 font-semibold text-right">Amount</th>
                  <th className="px-5 py-3 font-semibold text-center">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1B2728] text-sm">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-[#0E1415] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1B2728] flex items-center justify-center text-[#5EEAD4] font-bold shrink-0">
                          {req.trainerId?.name?.[0] || 'T'}
                        </div>
                        <div>
                          <p className="font-semibold text-[#F5FAFA]">{req.trainerId?.name || 'Unknown'}</p>
                          <p className="text-xs text-[#9AAEAE]">{req.trainerId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#9AAEAE]">
                      {new Date(req.requestedAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-[#F5FAFA]">
                      ₹{req.amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {req.status === 'Pending' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-700">
                          <Clock size={12} />
                          Pending
                        </span>
                      )}
                      {req.status === 'Approved' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#1B2728]/10 text-[#2DD4BF]">
                          <CheckCircle size={12} />
                          Approved
                        </span>
                      )}
                      {req.status === 'Rejected' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-700">
                          <XCircle size={12} />
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {req.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(req._id)}
                            disabled={processing === req._id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2DD4BF] text-[#06201D] font-bold rounded-lg text-xs font-semibold hover:bg-[#5EEAD4] transition-colors disabled:opacity-50"
                          >
                            {processing === req._id ? (
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <CheckCircle size={14} />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(req._id)}
                            disabled={processing === req._id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            <XCircle size={14} />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-[#9AAEAE]">
                          {new Date(req.processedAt || req.updatedAt).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GymAdminWithdrawalRequests;
