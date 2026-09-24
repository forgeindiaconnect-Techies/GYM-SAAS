import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, AlertCircle, Loader2, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const MemberSubscription = () => {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      const res = await api.get('/memberships/my');
      setMemberships(res.data.memberships || []);
    } catch (err) {
      console.error('Error fetching memberships', err);
    } finally {
      setLoading(false);
    }
  };

  const activeMembership = memberships.find(m => (m.status === 'Active' || m.status === 'Free Trial') && (!m.endDate || new Date(m.endDate) >= new Date()));
  const pendingMembership = memberships.find(m => m.status === 'Payment Verification Pending');
  const membership = activeMembership || pendingMembership;

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#164A4A]" size={40} /></div>;
  }

  if (!membership) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 text-center py-20 bg-[#FFFFFF] rounded-2xl border border-[#D3DFDA]">
        <CreditCard size={48} className="mx-auto text-[#555] mb-4" />
        <h2 className="text-2xl font-bold text-[#202828] mb-2">No Active Subscription</h2>
        <p className="text-[#455250] mb-6">You don't have any active memberships right now.</p>
      </div>
    );
  }

  const isActive = membership.status === 'Active' || membership.status === 'Free Trial';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-br from-[#FFFFFF] to-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#164A4A]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="text-[#164A4A]" size={24} />
              <h1 className="text-2xl font-bold">Current Subscription</h1>
            </div>
            <p className="text-[#455250]">Manage your membership and billing details for <strong className="text-[#202828]">{membership.gymId?.name}</strong></p>
          </div>
          
          <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 border ${
            isActive ? 'bg-[#164A4A]/10 text-[#164A4A] border-[#164A4A]/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#164A4A] animate-pulse' : 'bg-yellow-500'}`}></span> 
            {isActive ? 'Active' : 'Pending Verification'}
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-3xl font-bold text-[#202828] mb-1 capitalize">{membership.planName}</h2>
            <p className="text-[#455250]">Duration: {membership.duration}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[#164A4A]">₹{Number(membership.finalAmount).toFixed(2).replace(/\.00$/, '')}</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Plan Benefits</h3>
          <ul className="space-y-3">
            {['24/7 Gym Access', 'AI Fitness Assistant', 'Locker Room Access', 'Group Classes', 'Diet Plan Generator'].map((benefit, i) => (
              <li key={i} className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-[#164A4A]" />
                <span className="text-[#455250]">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-4">Membership Details</h3>
            <div className="flex items-center gap-4 p-4 border border-[#D3DFDA] bg-[#FFFFFF] rounded-xl mb-4">
              <div className="w-12 h-10 bg-[#E8E5DA] rounded flex items-center justify-center text-xs font-bold text-[#202828]">
                <Calendar size={18} />
              </div>
              <div>
                <p className="font-medium text-[#455250] text-xs">Start Date</p>
                <p className="text-[#202828] font-medium">{membership.startDate ? new Date(membership.startDate).toLocaleDateString() : 'Pending'}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="font-medium text-[#455250] text-xs">End Date</p>
                <p className="text-[#202828] font-medium">{membership.endDate ? new Date(membership.endDate).toLocaleDateString() : 'Pending'}</p>
              </div>
            </div>
            
            <div className="p-4 border border-[#D3DFDA] bg-[#FFFFFF] rounded-xl mb-4 text-sm">
              <p className="text-[#455250] mb-1">Payment Method: <span className="text-[#164A4A] font-bold">{membership.paymentMethod || 'Manual'}</span></p>
              {membership.paymentMethod === 'Bank Transfer' && membership.paymentReference && (
                <p className="text-[#455250]">Reference ID: <span className="text-[#202828]">{membership.paymentReference}</span></p>
              )}
            </div>
            
            {!isActive && (
              <p className="text-sm text-yellow-500 flex items-start gap-2 mt-4">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                Your manual payment is currently being verified by the gym owner.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberSubscription;