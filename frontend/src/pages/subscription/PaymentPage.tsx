import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Activity, CheckCircle, ShieldCheck, Lock, Landmark, QrCode, Smartphone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const PaymentPage = () => {
  const { user, updateUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const subscription = location.state?.subscription;
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bank');

  useEffect(() => {
    // Redirect if no pending subscription is found in state
    if (!subscription || subscription.status !== 'PENDING') {
      navigate('/gym-owner/subscription');
    }
  }, [subscription, navigate]);

  if (!subscription) return null;

  const handlePayment = async (method: string = paymentMethod === 'bank' ? 'Bank Transfer' : 'Online') => {
    setIsProcessing(true);
    try {
      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const res = await api.post('/subscriptions/process-payment', {
        subscriptionId: subscription.id,
        paymentMethod: method
      });

      // Update local user state so ProtectedRoute allows dashboard access
      updateUser({
        subscriptionStatus: 'ACTIVE',
        subscriptionPlan: subscription.plan
      });

      alert(res.data.message || 'Payment processed successfully. Welcome to your Gym Dashboard!');
      navigate('/admin/dashboard');

    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const tax = subscription.amount * 0.18; // 18% GST example
  const total = subscription.amount + tax;

  return (
    <div className="min-h-screen bg-[#F0FDFA] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,255,0,0.04)_0%,_transparent_60%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Payment Form */}
        <div className="flex-1 bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-[#16A34A] rounded-md flex items-center justify-center">
              <Activity className="text-black" size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#16A34A]">AI GYM Payment</span>
          </div>

          <h2 className="text-xl font-bold text-[#1E293B] mb-6">Select Payment Method</h2>

          <div className="space-y-4 mb-8">
            <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'bank' ? 'border-[#16A34A] bg-[#16A34A]/5' : 'border-[#CCFBF1] hover:border-[#16A34A]/50'}`}>
              <input type="radio" name="paymentMethod" value="bank" checked={paymentMethod === 'bank'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
              <Landmark className={paymentMethod === 'bank' ? 'text-[#16A34A]' : 'text-[#475569]'} size={24} />
              <span className="ml-4 font-medium text-[#1E293B]">Bank Transfer (Manual)</span>
              {paymentMethod === 'bank' && <CheckCircle className="ml-auto text-[#16A34A]" size={20} />}
            </label>
            <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'qr' ? 'border-[#16A34A] bg-[#16A34A]/5' : 'border-[#CCFBF1] hover:border-[#16A34A]/50'}`}>
              <input type="radio" name="paymentMethod" value="qr" checked={paymentMethod === 'qr'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
              <QrCode className={paymentMethod === 'qr' ? 'text-[#16A34A]' : 'text-[#475569]'} size={24} />
              <span className="ml-4 font-medium text-[#1E293B]">Scan QR Code (UPI)</span>
              {paymentMethod === 'qr' && <CheckCircle className="ml-auto text-[#16A34A]" size={20} />}
            </label>
          </div>

          {paymentMethod === 'bank' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div>
                <label className="block text-sm font-medium text-[#475569] mb-2">Bank Name</label>
                <div className="relative">
                  <input type="text" placeholder="e.g. State Bank of India" className="w-full bg-[#F0FDFA] border border-[#CCFBF1] rounded-lg px-4 py-3 text-[#1E293B] focus:outline-none focus:border-[#16A34A] pl-10 transition-colors" />
                  <Landmark className="absolute left-3 top-3.5 text-[#0D9488]" size={20} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#475569] mb-2">Account Number</label>
                <input 
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter 9–18 digit account number"
                  maxLength={18}
                  onInput={(e) => { (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.replace(/\D/g, ''); }}
                  className="w-full bg-[#F0FDFA] border border-[#CCFBF1] rounded-lg px-4 py-3 text-[#1E293B] focus:outline-none focus:border-[#16A34A] transition-colors tracking-widest font-mono" />
              </div>
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-[#475569] mb-2">IFSC Code</label>
                  <input 
                    type="text"
                    placeholder="e.g. SBIN0001234"
                    maxLength={11}
                    onInput={(e) => { (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase(); }}
                    className="w-full bg-[#F0FDFA] border border-[#CCFBF1] rounded-lg px-4 py-3 text-[#1E293B] focus:outline-none focus:border-[#16A34A] uppercase tracking-widest font-mono transition-colors" />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-[#475569] mb-2">Branch Name</label>
                  <input type="text" placeholder="e.g. MG Road Branch" className="w-full bg-[#F0FDFA] border border-[#CCFBF1] rounded-lg px-4 py-3 text-[#1E293B] focus:outline-none focus:border-[#16A34A] transition-colors" />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'qr' && (
            <div className="flex flex-col items-center justify-center py-6 animate-in fade-in zoom-in-95">
              <div className="bg-white p-4 rounded-xl border-2 border-[#16A34A] shadow-[0_0_20px_rgba(22,163,74,0.15)] mb-6">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`upi://pay?pa=aigym@upi&pn=AIGym&am=${total}&cu=INR`)}`} 
                  alt="UPI QR Code" 
                  width={160} 
                  height={160} 
                  className="rounded-lg"
                />
              </div>
              <p className="text-[#475569] font-medium mb-4 text-center">Scan with any UPI app to pay</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => handlePayment('GPay')}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-[#CCFBF1] rounded-full hover:border-[#16A34A] hover:bg-[#F0FDFA] transition-colors text-sm font-bold text-[#1E293B] disabled:opacity-50 disabled:cursor-not-allowed">
                  <Smartphone size={16} className="text-[#0D9488]" />
                  GPay
                </button>
                <button 
                  onClick={() => handlePayment('PhonePe')}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-[#CCFBF1] rounded-full hover:border-[#16A34A] hover:bg-[#F0FDFA] transition-colors text-sm font-bold text-[#1E293B] disabled:opacity-50 disabled:cursor-not-allowed">
                  <Smartphone size={16} className="text-[#0D9488]" />
                  PhonePe
                </button>
                <button 
                  onClick={() => handlePayment('Paytm')}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-[#CCFBF1] rounded-full hover:border-[#16A34A] hover:bg-[#F0FDFA] transition-colors text-sm font-bold text-[#1E293B] disabled:opacity-50 disabled:cursor-not-allowed">
                  <Smartphone size={16} className="text-[#0D9488]" />
                  Paytm
                </button>
              </div>
            </div>
          )}

          <button 
            disabled={isProcessing}
            onClick={() => handlePayment()}
            className={`w-full mt-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all ${
              isProcessing
                ? 'bg-[#E2E8F0] text-[#777] cursor-not-allowed'
                : 'bg-[#16A34A] text-white hover:bg-[#15803D] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:-translate-y-1'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center"><Activity className="animate-spin mr-2" size={20} /> Processing Payment...</span>
            ) : (
              <>
                <Lock size={18} />
                <span>Pay ₹{total.toLocaleString('en-IN')} Now</span>
              </>
            )}
          </button>

          <p className="text-[#475569] text-xs text-center mt-4 flex items-center justify-center space-x-1">
            <ShieldCheck size={14} className="text-green-500" />
            <span>Payments are secure and encrypted.</span>
          </p>
        </div>

        {/* Order Summary */}
        <div className="md:w-1/3 bg-[#F8FAFC] border border-[#CCFBF1] rounded-2xl p-6 h-fit sticky top-6 shadow-xl">
          <h3 className="text-lg font-bold text-[#1E293B] mb-6 border-b border-[#CCFBF1] pb-4">Order Summary</h3>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-[#475569]">Plan</span>
              <span className="font-bold text-[#1E293B]">{subscription.plan}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#475569]">Billing Cycle</span>
              <span className="font-bold text-[#1E293B] capitalize">{subscription.billingCycle}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#475569]">Gym Name</span>
              <span className="font-bold text-[#1E293B] text-right max-w-[60%] truncate" title={user?.gymName || 'Your Gym'}>{user?.gymName || 'Your Gym'}</span>
            </div>
          </div>

          <div className="border-t border-[#CCFBF1] pt-6 space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-[#475569]">Subtotal</span>
              <span className="text-[#1E293B]">₹{subscription.amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#475569]">Taxes (18% GST)</span>
              <span className="text-[#1E293B]">₹{tax.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-[#555] pt-4 flex justify-between items-end">
            <span className="text-[#475569] font-medium">Total Due</span>
            <div className="text-right">
              <div className="text-2xl font-extrabold text-[#16A34A]">₹{total.toLocaleString('en-IN')}</div>
              <div className="text-[#475569] text-xs">Includes all taxes</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PaymentPage;
