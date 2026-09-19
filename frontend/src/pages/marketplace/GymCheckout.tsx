import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle, Smartphone, ArrowLeft, Upload, Loader2, ShieldCheck, FileText, Landmark, QrCode } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const GymCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [gym, setGym] = useState<any>(null);
  const [branch, setBranch] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Expect state to be passed from GymDetails
    if (!location.state?.plan || !location.state?.gym) {
      navigate('/gyms');
      return;
    }
    setGym(location.state.gym);
    setPlan(location.state.plan);
    setBranch(location.state.branch);
  }, [location, navigate]);

  const handlePayment = async (method: string = paymentMethod === 'bank' ? 'Bank Transfer' : 'Online') => {
    if (paymentMethod === 'bank' && (!paymentReference || !paymentProofUrl)) {
      alert('Please provide payment reference ID and upload proof of payment.');
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const payload = {
        gymId: gym._id,
        branchId: branch?._id,
        planName: plan.name,
        duration: plan.duration,
        price: plan.price,
        discount: 0,
        paymentMethod: method,
        paymentReference: paymentMethod === 'bank' ? paymentReference : undefined,
        paymentProofUrl: paymentMethod === 'bank' ? paymentProofUrl : undefined,
      };

      const res = await api.post('/memberships/join', payload);

      if (paymentMethod === 'qr') {
        alert('Payment successful! Your membership request is now PENDING GYM APPROVAL.');
        navigate('/member/dashboard');
      } else {
        alert('Payment submitted! Your membership is PENDING GYM APPROVAL.');
        navigate('/member/dashboard');
      }

    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Simulate file upload by setting a fake URL
    if (e.target.files && e.target.files[0]) {
      setTimeout(() => {
        setPaymentProofUrl('https://example.com/fake-receipt.png');
        alert('Receipt uploaded successfully!');
      }, 1000);
    }
  };

  if (!plan || !gym) return null;

  const tax = plan.price * 0.18; // 18% GST example
  const total = Number(plan.price) + tax;

  const isFreeTrial = Number(plan.price) === 0 || plan.name.toLowerCase().includes('trial');

  return (
    <div className="min-h-screen bg-[#F0FDFA] pt-24 pb-12 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,255,0,0.04)_0%,_transparent_60%)] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Left Column - Payment Details */}
        <div className="flex-1 space-y-6">
          <button onClick={() => navigate(-1)} className="text-[#475569] hover:text-[#16A34A] flex items-center gap-2 text-sm font-medium transition-colors mb-4">
            <ArrowLeft size={16} /> Back to Gym Details
          </button>
          
          <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-[#1E293B] mb-6 border-b border-[#CCFBF1] pb-4">Checkout</h2>
            
            {isFreeTrial ? (
              <div className="text-center py-8">
                <ShieldCheck size={64} className="mx-auto text-[#16A34A] mb-4" />
                <h3 className="text-2xl font-bold text-[#1E293B] mb-2">Start Your Free Trial</h3>
                <p className="text-[#475569] mb-8">No payment is required for this plan. You can start exploring the gym immediately after approval.</p>
                <button 
                  disabled={isProcessing}
                  onClick={() => handlePayment('Free Trial')}
                  className={`px-8 py-4 rounded-xl font-bold text-lg inline-flex items-center space-x-2 transition-all ${
                    isProcessing
                      ? 'bg-[#E2E8F0] text-[#777] cursor-not-allowed'
                      : 'bg-[#16A34A] text-white hover:bg-[#15803D] hover:shadow-[0_0_30px_rgba(22,163,74,0.4)] hover:-translate-y-1'
                  }`}
                >
                  {isProcessing ? (
                    <span className="flex items-center"><Loader2 className="animate-spin mr-2" size={20} /> Processing...</span>
                  ) : (
                    <span>Confirm Free Trial</span>
                  )}
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-[#1E293B] mb-4">Select Payment Method</h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <label className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'bank' ? 'border-[#16A34A] bg-[#16A34A]/5' : 'border-[#CCFBF1] hover:border-[#16A34A]/50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <Landmark className={paymentMethod === 'bank' ? 'text-[#16A34A]' : 'text-[#475569]'} size={24} />
                  <input type="radio" name="paymentMethod" value="bank" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} className="hidden" />
                  {paymentMethod === 'bank' && <CheckCircle className="text-[#16A34A]" size={20} />}
                </div>
                <span className="font-medium text-[#1E293B] mb-1">Bank Transfer (Manual)</span>
                <span className="text-xs text-[#475569]">Direct bank transfer</span>
              </label>

              <label className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'qr' ? 'border-[#16A34A] bg-[#16A34A]/5' : 'border-[#CCFBF1] hover:border-[#16A34A]/50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <QrCode className={paymentMethod === 'qr' ? 'text-[#16A34A]' : 'text-[#475569]'} size={24} />
                  <input type="radio" name="paymentMethod" value="qr" checked={paymentMethod === 'qr'} onChange={() => setPaymentMethod('qr')} className="hidden" />
                  {paymentMethod === 'qr' && <CheckCircle className="text-[#16A34A]" size={20} />}
                </div>
                <span className="font-medium text-[#1E293B] mb-1">Scan QR Code (UPI)</span>
                <span className="text-xs text-[#475569]">GPay, PhonePe, Paytm</span>
              </label>
            </div>

            {paymentMethod === 'qr' && (
              <div className="flex flex-col items-center justify-center py-6 animate-in fade-in zoom-in-95 border border-[#CCFBF1] rounded-xl bg-white mb-6">
                <div className="bg-white p-4 rounded-xl border-2 border-[#16A34A] shadow-[0_0_20px_rgba(22,163,74,0.15)] mb-6">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`upi://pay?pa=${(gym.name || 'gym').toLowerCase().replace(/\s+/g, '')}@upi&pn=${encodeURIComponent(gym.name || 'Gym')}&am=${total}&cu=INR`)}`} 
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

            {paymentMethod === 'bank' && (
              <div className="space-y-6 animate-in fade-in border border-[#CCFBF1] bg-[#FFFFFF] p-6 rounded-xl">
                <div>
                  <h4 className="text-[#1E293B] font-bold mb-2 text-sm">Gym Payment Details</h4>
                  <div className="p-4 bg-[#F0FDFA] rounded-lg border border-[#CCFBF1] text-sm text-[#475569]">
                    <p><span className="text-[#1E293B]">UPI ID:</span> {(gym.name || 'gym').toLowerCase().replace(/\s+/g, '')}@upi</p>
                    <p className="mt-2"><span className="text-[#1E293B]">Account Name:</span> {gym.name || 'Gym Account'}</p>
                    <p className="mt-1"><span className="text-[#1E293B]">Bank:</span> HDFC Bank (IFSC: HDFC0001234)</p>
                    <p className="mt-1"><span className="text-[#1E293B]">Account No:</span> 50200012345678</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-2">Transaction ID / UTR</label>
                  <input 
                    type="text" 
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="e.g. 312345678901" 
                    className="w-full bg-[#F0FDFA] border border-[#CCFBF1] rounded-lg px-4 py-3 text-[#1E293B] focus:outline-none focus:border-[#16A34A] transition-colors" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-2">Upload Payment Proof</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#CCFBF1] hover:border-[#16A34A] rounded-lg cursor-pointer bg-[#F0FDFA] transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-[#475569] mb-3" />
                      <p className="mb-2 text-sm text-[#475569]"><span className="font-semibold text-[#1E293B]">Click to upload</span> receipt</p>
                      <p className="text-xs text-[#555]">PNG, JPG or PDF (Max. 5MB)</p>
                    </div>
                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf" />
                  </label>
                  {paymentProofUrl && (
                    <div className="mt-3 flex items-center text-green-500 text-sm font-medium">
                      <CheckCircle size={16} className="mr-2" />
                      Receipt attached successfully
                    </div>
                  )}
                </div>
              </div>
            )}

            <button 
              disabled={isProcessing || paymentMethod === 'qr'}
              onClick={() => handlePayment()}
              className={`w-full mt-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all ${
                isProcessing || paymentMethod === 'qr'
                  ? 'bg-[#E2E8F0] text-[#777] cursor-not-allowed hidden'
                  : 'bg-[#16A34A] text-white hover:bg-[#15803D] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:-translate-y-1'
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center"><Loader2 className="animate-spin mr-2" size={20} /> Processing...</span>
              ) : (
                <>
                  <span>Submit for Verification</span>
                </>
              )}
            </button>
              </>
            )}
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-[#F8FAFC] border border-[#CCFBF1] rounded-2xl p-6 h-fit sticky top-24 shadow-2xl">
            <h3 className="text-lg font-bold text-[#1E293B] mb-6 border-b border-[#CCFBF1] pb-4 flex items-center gap-2">
              <FileText className="text-[#16A34A]" size={20} />
              Order Summary
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-xs text-[#475569] mb-1">Gym</p>
                <p className="font-bold text-[#1E293B] truncate">{gym.name || 'Selected Gym'}</p>
                <p className="text-xs text-[#555]">{gym.location?.city || 'Location unavailable'}</p>
              </div>
              
              <div className="w-full h-px bg-[#E2E8F0]"></div>
              
              <div>
                <p className="text-xs text-[#475569] mb-1">Plan Selected</p>
                <p className="font-bold text-[#1E293B]">{plan.name}</p>
                <p className="text-xs text-[#555]">Duration: {plan.duration}</p>
              </div>
            </div>

            <div className="border-t border-[#CCFBF1] pt-6 space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-[#475569]">Plan Amount</span>
                <span className="text-[#1E293B] font-medium">₹{Number(plan.price).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#475569]">Discount</span>
                <span className="text-green-500 font-medium">-₹0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#475569]">Taxes (18% GST)</span>
                <span className="text-[#1E293B] font-medium">₹{tax.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-[#555] pt-4 flex justify-between items-end">
              <span className="text-[#475569] font-medium">Total Payable</span>
              <div className="text-right">
                <div className="text-2xl font-extrabold text-[#16A34A]">₹{total.toLocaleString('en-IN')}</div>
              </div>
            </div>
            
            <div className="mt-6 flex items-start gap-2 text-xs text-[#555]">
              <ShieldCheck size={14} className="shrink-0 mt-0.5" />
              <p>Your transaction is secure and encrypted. By continuing, you agree to our Terms of Service.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GymCheckout;
