import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, CreditCard, CheckCircle2, ArrowLeft, Calendar, Clock, MapPin, Video } from 'lucide-react';
import QRCode from 'react-qr-code';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

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
      <div className="max-w-lg mx-auto mt-16 text-center bg-white border border-[#D3DFDA] rounded-3xl p-10">
        <CheckCircle2 className="mx-auto text-[#164A4A] mb-4" size={64} />
        <h1 className="text-3xl font-bold text-[#202828] mb-2">Payment Successful!</h1>
        <p className="text-[#455250] mb-2">
          Your training session with <span className="font-bold text-[#202828]">{session?.trainerId?.name}</span> is confirmed.
        </p>
        <p className="text-[#455250] mb-6">
          Paid <span className="font-black text-[#164A4A]">₹{session?.fee}</span> via {paymentMethod}.
        </p>
        <button onClick={() => navigate('/member/bookings')} className="w-full py-3 bg-[#164A4A] text-white font-bold rounded-xl hover:bg-[#C6A77D] transition-colors">
          Go to My Bookings
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#164A4A]" size={40} /></div>;
  }

  if (!session) return null;

  const inputCls = 'w-full bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl px-3 py-2 text-sm text-[#202828] focus:border-[#164A4A] outline-none';

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm font-bold text-[#164A4A] hover:underline mb-2">
          <ArrowLeft size={15} /> Back
        </button>
        <h1 className="text-3xl font-bold text-[#202828] tracking-tight">Checkout Session</h1>
        <p className="text-[#455250] mt-1">Complete your payment to confirm the booking.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Payment */}
          <div className="bg-white border border-[#D3DFDA] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[#202828] mb-4 flex items-center gap-2"><CreditCard size={19} className="text-[#164A4A]" /> Payment Method</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {PAYMENT_METHODS.map((method) => (
                <label 
                  key={method} 
                  className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-colors ${
                    paymentMethod === method 
                      ? 'border-[#164A4A] bg-[#164A4A]/5' 
                      : 'border-[#D3DFDA] hover:border-[#164A4A]/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold ${paymentMethod === method ? 'text-[#164A4A]' : 'text-[#455250]'}`}>{method}</span>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value={method} 
                      checked={paymentMethod === method} 
                      onChange={(e) => setPaymentMethod(e.target.value)} 
                      className="hidden" 
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === method ? 'border-[#164A4A]' : 'border-gray-300'}`}>
                      {paymentMethod === method && <div className="w-2.5 h-2.5 bg-[#164A4A] rounded-full"></div>}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="bg-[#F1F5F3] border border-[#D3DFDA] p-5 rounded-xl">
              {paymentMethod === 'UPI' && (
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <p className="text-sm font-bold text-[#202828]">Pay using UPI App</p>
                      <div className="flex flex-wrap gap-2">
                        {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                           <button key={app} className="px-3 py-1.5 bg-white border border-[#D3DFDA] rounded-lg text-xs font-bold text-[#455250] hover:border-[#164A4A] hover:text-[#164A4A] transition-colors shadow-sm">{app}</button>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-px bg-[#D3DFDA] flex-1"></div>
                        <span className="text-[10px] font-black text-[#6fa3a0] uppercase tracking-wider">OR</span>
                        <div className="h-px bg-[#D3DFDA] flex-1"></div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[#687B78] uppercase mb-1 block">Enter UPI ID</label>
                        <input placeholder="e.g. yourname@bank" className={inputCls} />
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center md:border-l md:border-[#D3DFDA] md:pl-8 pt-4 md:pt-0 border-t md:border-t-0 border-[#D3DFDA] min-w-[180px]">
                      <div className="relative p-4 bg-white border border-[#D3DFDA] rounded-2xl mb-3 shadow-sm flex items-center justify-center">
                        <QRCode value={`upi://pay?pa=aigym@ybl&pn=AI%20Gym&am=${session.fee}&cu=INR`} size={80} bgColor="transparent" fgColor="#202828" level="L" />
                      </div>
                      <p className="text-sm font-bold text-[#202828]">Scan QR to Pay</p>
                      <p className="text-[10px] font-semibold text-[#164A4A] uppercase tracking-wider mt-0.5">Any UPI App</p>
                    </div>
                  </div>
                </div>
              )}
              
              {paymentMethod === 'Credit / Debit Card' && (
                <div className="space-y-4">
                  <p className="text-sm font-bold text-[#202828]">Enter Card Details</p>
                  <div>
                    <label className="text-xs font-bold text-[#687B78] uppercase mb-1 block">Card Number</label>
                    <input placeholder="XXXX XXXX XXXX XXXX" maxLength={19} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#687B78] uppercase mb-1 block">Name on Card</label>
                    <input placeholder="John Doe" className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[#687B78] uppercase mb-1 block">Expiry</label>
                      <input placeholder="MM/YY" maxLength={5} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#687B78] uppercase mb-1 block">CVV</label>
                      <input type="password" placeholder="***" maxLength={3} className={inputCls} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white border border-[#D3DFDA] rounded-2xl p-6 sticky top-6">
            <h3 className="text-lg font-bold text-[#202828] mb-4 border-b border-[#D3DFDA] pb-4">Session Details</h3>
            
            <div className="flex items-center gap-3 mb-6">
               <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden shrink-0">
                  {session.trainerId?.profilePhoto ? (
                    <img src={session.trainerId.profilePhoto} alt="Trainer" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">T</div>
                  )}
               </div>
               <div>
                 <p className="font-bold text-[#202828]">{session.trainerId?.name}</p>
                 <p className="text-xs text-[#455250]">{session.trainerId?.specialization || 'Personal Trainer'}</p>
               </div>
            </div>

            <div className="space-y-3 mb-6 pb-4 border-b border-[#D3DFDA]">
              <div className="flex items-center gap-2 text-sm text-[#455250]">
                <Calendar size={16} className="text-[#164A4A]" /> {new Date(session.date).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2 text-sm text-[#455250]">
                <Clock size={16} className="text-[#164A4A]" /> {session.startTime} - {session.endTime} ({session.duration} mins)
              </div>
              <div className="flex items-center gap-2 text-sm text-[#455250]">
                {session.mode === 'Online' ? <Video size={16} className="text-[#164A4A]" /> : <MapPin size={16} className="text-[#164A4A]" />}
                {session.mode} Session
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-[#455250]">
                <span>Session Fee</span>
                <span className="font-bold text-[#202828]">₹{session.fee}</span>
              </div>
              <div className="flex justify-between text-[#455250]">
                <span>Taxes & Fees</span>
                <span className="font-bold text-[#202828]">₹0</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-[#D3DFDA] mb-6">
              <span className="font-bold text-lg text-[#202828]">Total Payable</span>
              <span className="font-black text-2xl text-[#164A4A]">₹{session.fee}</span>
            </div>

            <button
              onClick={placeOrder}
              disabled={placing}
              className="w-full py-4 bg-[#164A4A] text-white font-bold rounded-xl hover:bg-[#C6A77D] transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {placing ? <Loader2 className="animate-spin" size={20} /> : `Pay ₹${session.fee} & Confirm`}
            </button>
            <p className="text-[10px] text-center text-[#687B78] mt-3">By confirming, you agree to our booking terms and cancellation policy.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberSessionCheckout;
