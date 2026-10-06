import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, ShieldCheck, FileText } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { isSubscriptionActive } from '../../utils/routeHelpers';

const GymCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshUser } = useAuth();
  
  const [gym, setGym] = useState<any>(null);
  const [branch, setBranch] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // If an authenticated member already has an active subscription / free trial or approval,
    // or if the plan is Free Trial and they are already a member, they should NOT see checkout.
    if (isAuthenticated && user?.role === 'MEMBER') {
      const planName = location.state?.plan?.name?.toLowerCase() || '';
      const isTrial = planName.includes('trial') || Number(location.state?.plan?.price || 0) === 0;
      if (isSubscriptionActive(user.subscriptionStatus) || isTrial || user.gymId) {
        sessionStorage.removeItem('checkout_intent');
        navigate('/member/dashboard', { replace: true });
        return;
      }
    }

    // Expect state to be passed from GymDetails
    if (!location.state?.plan || !location.state?.gym) {
      navigate('/gyms');
      return;
    }
    const gymData = location.state.gym;
    const planData = location.state.plan;
    const branchData = location.state.branch;
    setGym(gymData);
    setPlan(planData);
    setBranch(branchData);

    const isPaid = Number(planData.price || 0) > 0 && !planData.name?.toLowerCase().includes('trial');
    if (isPaid) {
      sessionStorage.setItem('checkout_intent', JSON.stringify({
        gymId: gymData._id,
        plan: planData,
        gym: gymData,
        branch: branchData,
      }));
    } else {
      sessionStorage.removeItem('checkout_intent');
    }
  }, [location, navigate, isAuthenticated, user]);

  // Refresh auth when returning from bfcache (back/forward navigation)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && refreshUser) {
        refreshUser();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refreshUser]);

  const handlePayment = async () => {
    if (!isAuthenticated || !user) {
      // Save intent and redirect to login
      if (gym && plan) {
        sessionStorage.setItem('checkout_intent', JSON.stringify({
          gymId: gym._id,
          plan,
          gym,
          branch,
        }));
      }
      navigate('/login', { state: { returnTo: location.pathname, ...location.state } });
      return;
    }

    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const payload = {
        gymId: gym._id,
        branchId: branch?._id,
        planName: plan.name,
      };

      await api.post('/memberships/join', payload);

      sessionStorage.removeItem('checkout_intent');
      alert('Free Trial activated! Welcome to the gym.');
      navigate('/member/dashboard');

    } catch (error: any) {
      console.error('Checkout error:', error);
      if (error.response?.status === 401) {
        // Token expired — save intent and go to login
        if (gym && plan) {
          sessionStorage.setItem('checkout_intent', JSON.stringify({
            gymId: gym._id,
            plan,
            gym,
            branch,
          }));
        }
        alert('Your session has expired. Please log in again to continue.');
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'Failed to start free trial. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };


  if (!plan || !gym) return null;

  const tax = plan.price * 0.18; // 18% GST example
  const total = Number(plan.price) + tax;

  return (
    <div className="min-h-screen bg-[#F1F5F3] pt-24 pb-12 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,255,0,0.04)_0%,_transparent_60%)] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Left Column - Payment Details */}
        <div className="flex-1 space-y-6">
          <button onClick={() => navigate(-1)} className="text-[#455250] hover:text-[#164A4A] flex items-center gap-2 text-sm font-medium transition-colors mb-4">
            <ArrowLeft size={16} /> Back to Gym Details
          </button>
          
          <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-[#202828] mb-6 border-b border-[#D3DFDA] pb-4">Checkout</h2>
            
            <div className="text-center py-8">
              <ShieldCheck size={64} className="mx-auto text-[#164A4A] mb-4" />
              <h3 className="text-2xl font-bold text-[#202828] mb-2">Start Your 1-Week Free Trial</h3>
              <p className="text-[#455250] mb-8">
                You will receive a 1-week free trial for the selected plan. You can upgrade to a paid subscription at any time from your dashboard.
              </p>
              <button 
                disabled={isProcessing}
                onClick={() => handlePayment()}
                className={`px-8 py-4 rounded-xl font-bold text-lg inline-flex items-center space-x-2 transition-all ${
                  isProcessing
                    ? 'bg-[#E8E5DA] text-[#777] cursor-not-allowed'
                    : 'bg-[#164A4A] text-white hover:bg-[#C6A77D] hover:shadow-[0_0_30px_rgba(22,163,74,0.4)] hover:-translate-y-1'
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
          <div className="bg-[#F2EFE8] border border-[#D3DFDA] rounded-2xl p-6 h-fit sticky top-24 shadow-2xl">
            <h3 className="text-lg font-bold text-[#202828] mb-6 border-b border-[#D3DFDA] pb-4 flex items-center gap-2">
              <FileText className="text-[#164A4A]" size={20} />
              Order Summary
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-xs text-[#455250] mb-1">Gym</p>
                <p className="font-bold text-[#202828] truncate">{gym.name || 'Selected Gym'}</p>
                <p className="text-xs text-[#555]">{gym.location?.city || 'Location unavailable'}</p>
              </div>
              
              <div className="w-full h-px bg-[#E8E5DA]"></div>
              
              <div>
                <p className="text-xs text-[#455250] mb-1">Plan Selected</p>
                <p className="font-bold text-[#202828]">{plan.name}</p>
                <p className="text-xs text-[#555]">Duration: {plan.duration}</p>
              </div>
            </div>

            <div className="border-t border-[#D3DFDA] pt-6 space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-[#455250]">Plan Amount</span>
                <span className="text-[#202828] font-medium">₹{Number(plan.price).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#455250]">Discount</span>
                <span className="text-green-500 font-medium">-₹0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#455250]">Taxes (18% GST)</span>
                <span className="text-[#202828] font-medium">₹{tax.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-[#555] pt-4 flex justify-between items-end">
              <span className="text-[#455250] font-medium">Total Payable</span>
              <div className="text-right">
                <div className="text-2xl font-extrabold text-[#164A4A]">₹{total.toLocaleString('en-IN')}</div>
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
