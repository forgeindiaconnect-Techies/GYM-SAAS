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

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const payload = {
        gymId: gym._id,
        branchId: branch?._id,
        planName: plan.name,
      };

      await api.post('/memberships/join', payload);

      alert('Free Trial activated! Welcome to the gym.');
      navigate('/member/dashboard');

    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.response?.data?.message || 'Failed to start free trial. Please try again.');
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
            
            <div className="text-center py-8">
              <ShieldCheck size={64} className="mx-auto text-[#16A34A] mb-4" />
              <h3 className="text-2xl font-bold text-[#1E293B] mb-2">Start Your 1-Week Free Trial</h3>
              <p className="text-[#475569] mb-8">
                You will receive a 1-week free trial for the selected plan. You can upgrade to a paid subscription at any time from your dashboard.
              </p>
              <button 
                disabled={isProcessing}
                onClick={() => handlePayment()}
                className={`px-8 py-4 rounded-xl font-bold text-lg inline-flex items-center space-x-2 transition-all ${
                  isProcessing
                    ? 'bg-[#E2E8F0] text-[#777] cursor-not-allowed'
                    : 'bg-[#16A34A] text-white hover:bg-[#15803D] hover:shadow-[0_0_30px_rgba(22,163,74,0.4)] hover:-translate-y-1'
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center"><Loader2 className="animate-spin mr-2" size={20} /> Processing...</span>
                ) : (
                  <span>Start Free Trial</span>
                )}
              </button>
            </div>
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
