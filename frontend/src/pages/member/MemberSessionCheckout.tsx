import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, CreditCard, CheckCircle2, ArrowLeft, Calendar, Clock, MapPin, Video, Shield, Crown } from 'lucide-react';
import api from '../../utils/api';
import PaymentModal, { type PaymentConfirmData } from '../../components/common/PaymentModal';

const PAYMENT_METHODS = ['Card', 'UPI', 'NetBanking'];

const MemberSessionCheckout = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'UPI' | 'NetBanking'>('Card');
  const [success, setSuccess] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        // We get it from /trainer-sessions/member and filter
        const res = await api.get('/trainer-sessions/member');
        const sess = res.data.sessions.find((s: any) => s._id === id);
        if (sess) {
          setSession(sess);
        } else {
          alert('Session not found');
          navigate('/member/bookings');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchSession();
  }, [id, navigate]);

  const handleOpenPaymentModal = () => {
    setPaymentError(null);
    setShowPaymentModal(true);
  };

  const handleModalConfirm = async (data: PaymentConfirmData) => {
    try {
      setPlacing(true);
      setPaymentError(null);
      const res = await api.post(`/trainer-sessions/${id}/pay`, {
        paymentMethod: data.paymentMethod,
        transactionReference: `TXN-${Date.now()}`
      });
      if (res.data.success) {
        setShowPaymentModal(false);
        setSuccess(true);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Payment failed. Please try again.';
      setPaymentError(msg);
      throw new Error(msg);
    } finally {
      setPlacing(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-10">
        <CheckCircle2 className="mx-auto text-[#EA580C] mb-4" size={64} />
        <h1 className="text-3xl font-bold text-[#111827] mb-2">Payment Successful!</h1>
        <p className="text-[#64748B] mb-2">
          Your training session with <span className="font-bold text-[#111827]">{session?.trainerId?.name}</span> is confirmed.
        </p>
        <p className="text-[#64748B] mb-6">
          Paid <span className="font-black text-[#EA580C]">₹{session?.fee}</span> via {paymentMethod}.
        </p>
        <button onClick={() => navigate('/member/bookings')} className="w-full py-3 bg-[#C2410C] text-white font-bold font-bold rounded-xl hover:bg-[#9A3412] transition-colors">
          Go to My Bookings
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#EA580C]" size={40} /></div>;
  }

  if (!session) return null;

  const inputCls = 'w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#111827] focus:border-[#FDBA74] outline-none';

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm font-bold text-[#EA580C] hover:underline mb-2">
          <ArrowLeft size={15} /> Back
        </button>
        <h1 className="text-3xl font-bold text-[#111827] tracking-tight">Checkout Session</h1>
        <p className="text-[#64748B] mt-1">Complete your payment to confirm the booking.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Payment */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                <CreditCard size={19} className="text-[#EA580C]" /> Payment Selection
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <Shield size={14} className="text-[#EA580C]" />
                <span>256-bit TLS Encrypted</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">
                SELECT PAYMENT METHOD
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method as any)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      paymentMethod === method
                        ? 'bg-[#C2410C] text-white border-[#FDBA74]'
                        : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:border-[#FDBA74]'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#64748B]">
              {paymentMethod === 'Card' && (
                <p>Card Number, Expiry, and CVV will be verified via secure 256-bit TLS encryption in the confirmation modal.</p>
              )}
              {paymentMethod === 'UPI' && (
                <p>Pay via Google Pay, PhonePe, Paytm, BHIM, UPI ID or Scan QR in the payment dialog.</p>
              )}
              {paymentMethod === 'NetBanking' && (
                <p>Transfer directly via your online bank portal securely with instant booking confirmation.</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 sticky top-6">
            <h3 className="text-lg font-bold text-[#111827] mb-4 border-b border-[#E2E8F0] pb-4">Session Details</h3>
            
            <div className="flex items-center gap-3 mb-6">
               <div className="w-12 h-12 bg-[#F8FAFC] rounded-full overflow-hidden shrink-0">
                  {session.trainerId?.profilePhoto ? (
                    <img src={session.trainerId.profilePhoto} alt="Trainer" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-[#64748B]">T</div>
                  )}
               </div>
               <div>
                 <p className="font-bold text-[#111827]">{session.trainerId?.name}</p>
                 <p className="text-xs text-[#64748B]">{session.trainerId?.specialization || 'Personal Trainer'}</p>
               </div>
            </div>

            <div className="space-y-3 mb-6 pb-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2 text-sm text-[#64748B]">
                <Calendar size={16} className="text-[#EA580C]" /> {new Date(session.date).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2 text-sm text-[#64748B]">
                <Clock size={16} className="text-[#EA580C]" /> {session.startTime} - {session.endTime} ({session.duration} mins)
              </div>
              <div className="flex items-center gap-2 text-sm text-[#64748B]">
                {session.mode === 'Online' ? <Video size={16} className="text-[#EA580C]" /> : <MapPin size={16} className="text-[#EA580C]" />}
                {session.mode} Session
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-[#64748B]">
                <span>Session Fee</span>
                <span className="font-bold text-[#111827]">₹{session.fee}</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Taxes & Fees</span>
                <span className="font-bold text-[#111827]">₹0</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-[#E2E8F0] mb-6">
              <span className="font-bold text-lg text-[#111827]">Total Payable</span>
              <span className="font-black text-2xl text-[#EA580C]">₹{session.fee}</span>
            </div>

            <button
              onClick={handleOpenPaymentModal}
              disabled={placing}
              className="w-full py-4 bg-[#C2410C] text-white font-bold rounded-xl hover:bg-[#9A3412] transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {placing ? <Loader2 className="animate-spin" size={20} /> : `Pay ₹${session.fee} & Confirm`}
            </button>
            <p className="text-[10px] text-center text-[#64748B] mt-3">By confirming, you agree to our booking terms and cancellation policy.</p>
          </div>
        </div>
      </div>

      {/* Confirmation & Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title={`Confirm Session with ${session.trainerId?.name || 'Trainer'}`}
        subtitle="Unlock 1-on-1 personalized coaching & guidance"
        icon={<Crown size={24} />}
        summaryItems={[
          {
            label: 'Selected Trainer',
            value: session.trainerId?.name || 'Personal Trainer'
          },
          {
            label: 'Session Mode',
            value: `${session.mode || 'In-Person'} Session`
          },
          {
            label: 'Scheduled Date & Time',
            value: `${new Date(session.date).toLocaleDateString()} (${session.startTime} - ${session.endTime})`
          }
        ]}
        totalAmount={session.fee || 0}
        onConfirm={handleModalConfirm}
        loading={placing}
        error={paymentError}
      />
    </div>
  );
};

export default MemberSessionCheckout;
