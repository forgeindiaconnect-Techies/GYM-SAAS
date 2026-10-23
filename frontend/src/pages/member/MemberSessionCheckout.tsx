import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, CreditCard, CheckCircle2, ArrowLeft, Calendar, Clock, MapPin, Video } from 'lucide-react';
import QRCode from 'react-qr-code';
import api from '../../utils/api';

const PAYMENT_METHODS = ['UPI', 'Credit / Debit Card', 'Net Banking', 'Cash at Gym'];

const MemberSessionCheckout = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [success, setSuccess] = useState(false);

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

  const placeOrder = async () => {
    try {
      setPlacing(true);
      const res = await api.post(`/trainer-sessions/${id}/pay`, {
        paymentMethod
      });
      if (res.data.success) {
        setSuccess(true);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center bg-white border border-[#292940] rounded-3xl p-10">
        <CheckCircle2 className="mx-auto text-[#6366F1] mb-4" size={64} />
        <h1 className="text-3xl font-bold text-[#11111F] mb-2">Payment Successful!</h1>
        <p className="text-[#A1A1AA] mb-2">
          Your training session with <span className="font-bold text-[#11111F]">{session?.trainerId?.name}</span> is confirmed.
        </p>
        <p className="text-[#A1A1AA] mb-6">
          Paid <span className="font-black text-[#6366F1]">₹{session?.fee}</span> via {paymentMethod}.
        </p>
        <button onClick={() => navigate('/member/bookings')} className="w-full py-3 bg-[#6366F1] text-white font-bold rounded-xl hover:bg-[#4F46E5] transition-colors">
          Go to My Bookings
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#6366F1]" size={40} /></div>;
  }

  if (!session) return null;

  const inputCls = 'w-full bg-[#0B0B12] border border-[#292940] rounded-xl px-3 py-2 text-sm text-[#11111F] focus:border-[#6366F1] outline-none';

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm font-bold text-[#6366F1] hover:underline mb-2">
          <ArrowLeft size={15} /> Back
        </button>
        <h1 className="text-3xl font-bold text-[#11111F] tracking-tight">Checkout Session</h1>
        <p className="text-[#A1A1AA] mt-1">Complete your payment to confirm the booking.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Payment */}
          <div className="bg-white border border-[#292940] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[#11111F] mb-4 flex items-center gap-2"><CreditCard size={19} className="text-[#6366F1]" /> Payment Method</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {PAYMENT_METHODS.map((method) => (
                <label 
                  key={method} 
                  className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-colors ${
                    paymentMethod === method 
                      ? 'border-[#6366F1] bg-[#6366F1]/5' 
                      : 'border-[#292940] hover:border-[#6366F1]/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold ${paymentMethod === method ? 'text-[#6366F1]' : 'text-[#A1A1AA]'}`}>{method}</span>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value={method} 
                      checked={paymentMethod === method} 
                      onChange={(e) => setPaymentMethod(e.target.value)} 
                      className="hidden" 
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === method ? 'border-[#6366F1]' : 'border-gray-300'}`}>
                      {paymentMethod === method && <div className="w-2.5 h-2.5 bg-[#6366F1] rounded-full"></div>}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="bg-[#0B0B12] border border-[#292940] p-5 rounded-xl">
              {paymentMethod === 'UPI' && (
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <p className="text-sm font-bold text-[#11111F]">Pay using UPI App</p>
                      <div className="flex flex-wrap gap-2">
                        {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                           <button key={app} className="px-3 py-1.5 bg-white border border-[#292940] rounded-lg text-xs font-bold text-[#A1A1AA] hover:border-[#6366F1] hover:text-[#6366F1] transition-colors shadow-sm">{app}</button>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-px bg-[#292940] flex-1"></div>
                        <span className="text-[10px] font-black text-[#4F46E5] uppercase tracking-wider">OR</span>
                        <div className="h-px bg-[#292940] flex-1"></div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[#A1A1AA] uppercase mb-1 block">Enter UPI ID</label>
                        <input placeholder="e.g. yourname@bank" className={inputCls} />
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center md:border-l md:border-[#292940] md:pl-8 pt-4 md:pt-0 border-t md:border-t-0 border-[#292940] min-w-[180px]">
                      <div className="relative p-4 bg-white border border-[#292940] rounded-2xl mb-3 shadow-sm flex items-center justify-center">
                        <QRCode value={`upi://pay?pa=aigym@ybl&pn=AI%20Gym&am=${session.fee}&cu=INR`} size={80} bgColor="transparent" fgColor="#11111F" level="L" />
                      </div>
                      <p className="text-sm font-bold text-[#11111F]">Scan QR to Pay</p>
                      <p className="text-[10px] font-semibold text-[#6366F1] uppercase tracking-wider mt-0.5">Any UPI App</p>
                    </div>
                  </div>
                </div>
              )}
              
              {paymentMethod === 'Credit / Debit Card' && (
                <div className="space-y-4">
                  <p className="text-sm font-bold text-[#11111F]">Enter Card Details</p>
                  <div>
                    <label className="text-xs font-bold text-[#A1A1AA] uppercase mb-1 block">Card Number</label>
                    <input placeholder="XXXX XXXX XXXX XXXX" maxLength={19} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#A1A1AA] uppercase mb-1 block">Name on Card</label>
                    <input placeholder="John Doe" className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[#A1A1AA] uppercase mb-1 block">Expiry</label>
                      <input placeholder="MM/YY" maxLength={5} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#A1A1AA] uppercase mb-1 block">CVV</label>
                      <input type="password" placeholder="***" maxLength={3} className={inputCls} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white border border-[#292940] rounded-2xl p-6 sticky top-6">
            <h3 className="text-lg font-bold text-[#11111F] mb-4 border-b border-[#292940] pb-4">Session Details</h3>
            
            <div className="flex items-center gap-3 mb-6">
               <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden shrink-0">
                  {session.trainerId?.profilePhoto ? (
                    <img src={session.trainerId.profilePhoto} alt="Trainer" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">T</div>
                  )}
               </div>
               <div>
                 <p className="font-bold text-[#11111F]">{session.trainerId?.name}</p>
                 <p className="text-xs text-[#A1A1AA]">{session.trainerId?.specialization || 'Personal Trainer'}</p>
               </div>
            </div>

            <div className="space-y-3 mb-6 pb-4 border-b border-[#292940]">
              <div className="flex items-center gap-2 text-sm text-[#A1A1AA]">
                <Calendar size={16} className="text-[#6366F1]" /> {new Date(session.date).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2 text-sm text-[#A1A1AA]">
                <Clock size={16} className="text-[#6366F1]" /> {session.startTime} - {session.endTime} ({session.duration} mins)
              </div>
              <div className="flex items-center gap-2 text-sm text-[#A1A1AA]">
                {session.mode === 'Online' ? <Video size={16} className="text-[#6366F1]" /> : <MapPin size={16} className="text-[#6366F1]" />}
                {session.mode} Session
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-[#A1A1AA]">
                <span>Session Fee</span>
                <span className="font-bold text-[#11111F]">₹{session.fee}</span>
              </div>
              <div className="flex justify-between text-[#A1A1AA]">
                <span>Taxes & Fees</span>
                <span className="font-bold text-[#11111F]">₹0</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-[#292940] mb-6">
              <span className="font-bold text-lg text-[#11111F]">Total Payable</span>
              <span className="font-black text-2xl text-[#6366F1]">₹{session.fee}</span>
            </div>

            <button
              onClick={placeOrder}
              disabled={placing}
              className="w-full py-4 bg-[#6366F1] text-white font-bold rounded-xl hover:bg-[#4F46E5] transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {placing ? <Loader2 className="animate-spin" size={20} /> : `Pay ₹${session.fee} & Confirm`}
            </button>
            <p className="text-[10px] text-center text-[#A1A1AA] mt-3">By confirming, you agree to our booking terms and cancellation policy.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberSessionCheckout;
