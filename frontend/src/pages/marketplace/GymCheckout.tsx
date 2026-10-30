import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Loader2, ShieldCheck, FileText, CreditCard,
  QrCode, Landmark, Banknote, CheckCircle2, Sparkles, Building2,
  Gift, Tag, AlertCircle, Mail, Receipt, ExternalLink, Coins
} from 'lucide-react';
import QRCode from 'react-qr-code';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { isSubscriptionActive } from '../../utils/routeHelpers';

const PAYMENT_METHODS = [
  { id: 'UPI', label: 'UPI / QR Code', icon: QrCode, desc: 'Instant activation via GPay, PhonePe, Paytm' },
  { id: 'Card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, MasterCard, RuPay' },
  { id: 'Net Banking', label: 'Net Banking', icon: Landmark, desc: 'All major Indian banks supported' },
  { id: 'Cash at Gym', label: 'Pay at Gym Counter', icon: Banknote, desc: 'Pay directly when you visit the gym' },
];

const GymCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshUser } = useAuth();

  const [gym, setGym] = useState<any>(null);
  const [branch, setBranch] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Net Banking' | 'Cash at Gym'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({ name: '', number: '', expiry: '', cvv: '' });
  const [bankName, setBankName] = useState('HDFC Bank');
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);

  // Referral states
  const [referralCodeInput, setReferralCodeInput] = useState<string>('');
  const [appliedReferral, setAppliedReferral] = useState<any>(null);
  const [refChecking, setRefChecking] = useState<boolean>(false);
  const [refError, setRefError] = useState<string>('');

  // Points redemption states
  const [userPointsBalance, setUserPointsBalance] = useState<number>(0);
  const [rewardSettings, setRewardSettings] = useState<any>(null);
  const [usePoints, setUsePoints] = useState<boolean>(false);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);

  useEffect(() => {
    // Only redirect away if member is trying to activate a Free Trial but ALREADY has an active plan/trial
    if (isAuthenticated && user?.role === 'MEMBER') {
      const planName = location.state?.plan?.name?.toLowerCase() || '';
      const isTrial = planName.includes('trial') || Number(location.state?.plan?.price || 0) === 0;
      if (isTrial && isSubscriptionActive(user.subscriptionStatus)) {
        sessionStorage.removeItem('checkout_intent');
        navigate('/member/dashboard', { replace: true });
        return;
      }

      api.get('/referrals/my-rewards-ledger').then(res => {
        const pts = res.data?.pointsBalance || 0;
        setUserPointsBalance(pts);
        const prefilled = location.state?.pointsToRedeem || Number(sessionStorage.getItem('redeem_membership_points') || 0);
        if (prefilled > 0) {
          setUsePoints(true);
          setPointsToRedeem(Math.min(prefilled, pts));
          sessionStorage.removeItem('redeem_membership_points');
        } else if (pts >= 100) {
          setPointsToRedeem(pts);
        }
      }).catch(() => {});
    }

    // Expect state to be passed from GymDetails
    if (!location.state?.plan || !location.state?.gym) {
      const savedIntent = sessionStorage.getItem('checkout_intent');
      if (savedIntent) {
        try {
          const parsed = JSON.parse(savedIntent);
          setGym(parsed.gym);
          setPlan(parsed.plan);
          setBranch(parsed.branch);
          if (parsed.gym?._id) {
            api.get(`/referrals/settings?gymId=${parsed.gym._id}`).then(res => setRewardSettings(res.data?.settings)).catch(() => {});
          }
          return;
        } catch {
          // silent
        }
      }
      navigate('/gyms');
      return;
    }

    const gymData = location.state.gym;
    const planData = location.state.plan;
    const branchData = location.state.branch;
    setGym(gymData);
    setPlan(planData);
    setBranch(branchData);

    if (gymData?._id) {
      api.get(`/referrals/settings?gymId=${gymData._id}`).then(res => setRewardSettings(res.data?.settings)).catch(() => {});
    }

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

  const handleApplyReferral = async (codeToTry?: string) => {
    const code = (codeToTry || referralCodeInput || '').trim().toUpperCase();
    if (!code) return;
    if (!gym?._id) return;

    try {
      setRefChecking(true);
      setRefError('');
      const res = await api.get(`/referrals/validate/${code}`, {
        params: {
          gymId: gym._id,
          currentUserId: user?.id || (user as any)?._id
        }
      });
      if (res.data?.valid) {
        setAppliedReferral(res.data);
        sessionStorage.setItem('customer_referral_code', code);
      } else {
        setAppliedReferral(null);
        setRefError(res.data?.message || 'Invalid referral code');
      }
    } catch (err: any) {
      setAppliedReferral(null);
      setRefError(err.response?.data?.message || 'Failed to apply referral code');
    } finally {
      setRefChecking(false);
    }
  };

  useEffect(() => {
    if (gym?._id && !appliedReferral) {
      const savedCode = sessionStorage.getItem('customer_referral_code');
      if (savedCode) {
        setReferralCodeInput(savedCode);
        handleApplyReferral(savedCode);
      }
    }
  }, [gym?._id]);

  if (!plan || !gym) return null;

  const numPrice = Number(plan.price) || 0;
  const isFreeTrial = numPrice === 0 || plan.name?.toLowerCase().includes('trial');
  
  // Calculate Referral Discount
  const rawDiscount = appliedReferral
    ? (appliedReferral.refereeReward?.discountType === 'Percentage'
        ? (numPrice * (appliedReferral.refereeReward?.value || 0)) / 100
        : (appliedReferral.refereeReward?.value || 0))
    : 0;
  const referralDiscount = isFreeTrial ? 0 : Math.min(numPrice, Math.round(rawDiscount));

  // Calculate Points Discount
  const convUnit = rewardSettings?.pointsPerConversionUnit || 100;
  const rupeeUnit = rewardSettings?.currencyValuePerUnit || 50;
  const rate = rupeeUnit / convUnit;
  const rawPointsDiscount = usePoints ? Math.round(pointsToRedeem * rate) : 0;
  const maxAllowedBySetting = (rewardSettings?.maxDiscountPerTransaction && rewardSettings.maxDiscountPerTransaction > 0)
    ? rewardSettings.maxDiscountPerTransaction
    : numPrice;
  const cappedPointsDiscount = Math.min(rawPointsDiscount, maxAllowedBySetting);
  const pointsDiscount = isFreeTrial ? 0 : Math.min(Math.max(0, numPrice - referralDiscount), cappedPointsDiscount);

  const combinedDiscount = isFreeTrial ? 0 : Math.min(numPrice, referralDiscount + pointsDiscount);
  const discountedPrice = Math.max(0, numPrice - combinedDiscount);
  const tax = isFreeTrial ? 0 : Math.round(discountedPrice * 0.18); // 18% GST for paid plans
  const total = isFreeTrial ? 0 : Math.round(discountedPrice + tax);

  const handleCheckout = async () => {
    if (!isAuthenticated || !user) {
      // Save intent and redirect to login/register
      sessionStorage.setItem('checkout_intent', JSON.stringify({
        gymId: gym._id,
        plan,
        gym,
        branch,
      }));
      navigate('/login', { state: { returnTo: location.pathname, ...location.state } });
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate gateway authorization
      await new Promise(resolve => setTimeout(resolve, 800));

      let featuresArray: string[] = [];
      if (Array.isArray(plan.features)) {
        featuresArray = plan.features;
      } else if (typeof plan.features === 'string') {
        featuresArray = plan.features.split(',').map((f: string) => f.trim()).filter(Boolean);
      }

      const payload = {
        gymId: gym._id,
        branchId: branch?._id,
        packageId: (plan._id && !plan._id.toString().startsWith('default')) ? plan._id : undefined,
        planName: plan.name,
        packageDescription: plan.description || `${plan.name} Membership Package`,
        features: featuresArray,
        duration: plan.duration || (isFreeTrial ? '1 Week' : '1 Month'),
        price: numPrice,
        discount: combinedDiscount,
        pointsToRedeem: usePoints ? pointsToRedeem : 0,
        referralCode: appliedReferral ? appliedReferral.referralCode : (referralCodeInput?.trim() || undefined),
        paymentMethod: isFreeTrial ? 'Free Trial' : paymentMethod,
        paymentReference: `PAY-${Date.now().toString().slice(-8)}${Math.floor(100 + Math.random() * 900)}`,
      };

      const res = await api.post('/memberships/join', payload);

      sessionStorage.removeItem('checkout_intent');
      if (refreshUser) await refreshUser();

      setPaymentSuccess({
        planName: plan.name,
        duration: plan.duration || (isFreeTrial ? '1 Week' : '1 Month'),
        amount: total,
        paymentMethod: isFreeTrial ? 'Free Trial' : paymentMethod,
        gymName: gym.name,
        membership: res.data.membership
      });

    } catch (error: any) {
      console.error('Checkout error:', error);
      if (error.response?.status === 401) {
        sessionStorage.setItem('checkout_intent', JSON.stringify({
          gymId: gym._id,
          plan,
          gym,
          branch,
        }));
        alert('Your session has expired. Please log in again to continue.');
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'Checkout failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Success Confirmation Screen (Pure Black & Charcoal Theme with Sand Gold Highlights)
  if (paymentSuccess) {
    const mem = paymentSuccess.membership || {};
    return (
      <div className="min-h-screen bg-[#FFFFFF] text-white pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="max-w-xl w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6 relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-48 h-48 bg-[#FFF7ED] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-[#FFF7ED] rounded-full blur-3xl pointer-events-none" />

          <div className="w-20 h-20 bg-[#FFF7ED] text-[#15803D] border border-[#E2E8F0]/30 rounded-full flex items-center justify-center mx-auto shadow-inner relative z-10">
            <CheckCircle2 size={44} />
          </div>

          <div className="relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#EA580C] bg-[#FFF7ED] px-3.5 py-1.5 rounded-full border border-[#FFEDD5] inline-flex items-center gap-1.5">
              <Sparkles size={12} /> {isFreeTrial ? 'Trial Activated' : 'Payment Verified & Active'}
            </span>
            <h1 className="text-3xl font-extrabold text-[#111827] mt-4 tracking-tight">
              {isFreeTrial ? 'Welcome to Your Free Trial!' : 'Membership Confirmed!'}
            </h1>
            <p className="text-[#64748B] text-sm mt-2 max-w-md mx-auto">
              {isFreeTrial
                ? `You now have 1 week of full complimentary access to ${paymentSuccess.gymName}.`
                : `Your ${paymentSuccess.planName} package at ${paymentSuccess.gymName} is now active.`}
            </p>
          </div>

          {/* Email Confirmation Notice Banner */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 text-left flex items-start gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 mt-0.5">
              <Mail size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Confirmation Email Dispatched</p>
              <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                A verified payment receipt with your membership ID, included features snapshot, and validity details has been sent to <span className="text-[#EA580C] font-medium">{user?.email || 'your registered email'}</span>.
              </p>
            </div>
          </div>

          {/* Membership & Payment Details Card */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 text-left space-y-3 text-sm relative z-10">
            {mem.membershipId && (
              <div className="flex justify-between items-center pb-2.5 border-b border-[#E2E8F0]">
                <span className="text-[#64748B] text-xs flex items-center gap-1.5">
                  <Receipt size={13} className="text-[#EA580C]" /> Membership ID:
                </span>
                <span className="font-mono text-xs font-bold text-[#EA580C] bg-[#FFF7ED] px-2.5 py-1 rounded-md border border-[#FFEDD5]">
                  {mem.membershipId}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#64748B]">Gym Name:</span>
              <span className="font-semibold text-white">{paymentSuccess.gymName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Purchased Package:</span>
              <span className="font-bold text-[#EA580C]">{paymentSuccess.planName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Validity Duration:</span>
              <span className="font-medium text-white">{paymentSuccess.duration}</span>
            </div>
            <div className="flex justify-between border-t border-[#E2E8F0] pt-3">
              <span className="text-[#64748B]">Total Paid:</span>
              <span className="font-black text-lg text-[#15803D]">
                {isFreeTrial ? '₹0 (Free Trial)' : `₹${paymentSuccess.amount.toLocaleString('en-IN')}`}
              </span>
            </div>
            <div className="flex justify-between text-xs text-[#64748B]">
              <span>Payment Mode:</span>
              <span className="font-medium text-gray-200">{paymentSuccess.paymentMethod}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 relative z-10">
            <button
              onClick={() => navigate('/member/subscription')}
              className="flex-1 py-3.5 bg-[#C2410C] hover:bg-[#3651D4] text-[#FFFFFF] font-bold font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View My Membership</span>
              <ExternalLink size={16} />
            </button>
            <button
              onClick={() => navigate('/member/dashboard')}
              className="py-3.5 px-6 bg-[#FFFFFF] hover:bg-[#FFF7ED] border border-[#E2E8F0] text-gray-300 font-semibold rounded-xl transition-all cursor-pointer"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-white pt-24 pb-16 px-4 relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FFF7ED] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FFF7ED] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Left Column - Payment Details */}
        <div className="flex-1 space-y-6">
          <button
            onClick={() => navigate(-1)}
            className="text-[#64748B] hover:text-[#C2410C] flex items-center gap-2 text-sm font-medium transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to Gym Details
          </button>
          
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="border-b border-[#E2E8F0] pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#111827]">Checkout</h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {isFreeTrial ? 'Activate your complimentary 1-week free trial' : `Complete payment to activate ${plan.name}`}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isFreeTrial ? 'bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]' : 'bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]'}`}>
                {isFreeTrial ? 'Free Trial' : `${plan.name} Plan`}
              </span>
            </div>

            {/* Free Trial Banner / Explanation */}
            {isFreeTrial ? (
              <div className="text-center py-6 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl space-y-4">
                <div className="w-16 h-16 bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5] rounded-2xl flex items-center justify-center mx-auto">
                  <Sparkles size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#111827]">1-Week Free Trial Access</h3>
                  <p className="text-sm text-[#64748B] max-w-md mx-auto mt-2 leading-relaxed">
                    Enjoy 7 days of full gym access with zero upfront payment. You can upgrade to a regular membership at any time.
                  </p>
                </div>
              </div>
            ) : (
              /* Paid Plan Payment Methods */
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-[#111827] mb-3 flex items-center gap-2">
                    <CreditCard size={18} className="text-[#EA580C]" /> Select Payment Method
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {PAYMENT_METHODS.map((method) => {
                      const Icon = method.icon;
                      const isSelected = paymentMethod === method.id;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPaymentMethod(method.id as any)}
                          className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                            isSelected
                              ? 'border-[#FDBA74] bg-[#FFF7ED] ring-1 ring-[#F97316]'
                              : 'border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#FFEDD5] hover:bg-[#FFFFFF]'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#C2410C] text-white' : 'bg-[#F8FAFC] text-[#64748B]'}`}>
                            <Icon size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className={`font-bold text-sm leading-tight ${isSelected ? 'text-[#EA580C]' : 'text-white'}`}>{method.label}</p>
                            <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">{method.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-form based on selected payment method */}
                {paymentMethod === 'UPI' && (
                  <div className="p-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      <div className="bg-[#FFFFFF] p-3 rounded-2xl border border-[#E2E8F0] shadow-sm shrink-0">
                        <QRCode
                          value={`upi://pay?pa=aigym@icici&pn=${encodeURIComponent(gym.name)}&am=${total}&cu=INR`}
                          size={110}
                        />
                      </div>
                      <div className="space-y-2 text-center sm:text-left flex-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">Scan QR Code</p>
                        <p className="text-xs text-[#64748B]">Scan with Google Pay, PhonePe, Paytm, or BHIM to pay instantly.</p>
                        <div className="text-xs font-mono bg-[#FFFFFF] px-3 py-1.5 rounded-lg border border-[#E2E8F0] inline-block font-bold text-gray-200">
                          UPI ID: <span className="text-[#EA580C]">aigym@icici</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#64748B] mb-1">Or Enter Your UPI ID</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@okhdfcbank"
                        className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#FDBA74]"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'Card' && (
                  <div className="p-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#64748B] mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                        placeholder="Name on card"
                        className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#FDBA74]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#64748B] mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        placeholder="4532 •••• •••• 8901"
                        maxLength={19}
                        className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#FDBA74] font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#64748B] mb-1">Expiry Date</label>
                        <input
                          type="text"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#FDBA74]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#64748B] mb-1">CVV</label>
                        <input
                          type="password"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          placeholder="•••"
                          maxLength={4}
                          className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#FDBA74]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'Net Banking' && (
                  <div className="p-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl space-y-3">
                    <label className="block text-xs font-semibold text-[#64748B] mb-1">Select Bank</label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#FDBA74]"
                    >
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="State Bank of India">State Bank of India (SBI)</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                      <option value="Punjab National Bank">Punjab National Bank</option>
                    </select>
                  </div>
                )}

                {paymentMethod === 'Cash at Gym' && (
                  <div className="p-4 bg-[#FFF7ED] border border-[#FFEDD5] rounded-2xl text-xs text-[#EA580C] space-y-1">
                    <p className="font-bold">Pay At Gym Counter</p>
                    <p className="text-gray-300">Your membership package will be pre-registered. You can pay via Cash, POS card machine, or UPI at the front desk upon arrival.</p>
                  </div>
                )}
              </div>
            )}

            <button 
              disabled={isProcessing}
              onClick={handleCheckout}
              className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center space-x-2 transition-all shadow-lg ${
                isProcessing
                  ? 'bg-gray-800 text-[#64748B] cursor-not-allowed'
                  : 'bg-[#C2410C] text-white hover:bg-[#3651D4] cursor-pointer'
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={18} /> Processing Activation...
                </span>
              ) : isFreeTrial ? (
                <span>Start 1-Week Free Trial</span>
              ) : (
                <span>Pay ₹{total.toLocaleString('en-IN')} & Confirm {plan.name}</span>
              )}
            </button>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 h-fit sticky top-24 shadow-2xl space-y-6">
            <h3 className="text-lg font-bold text-[#111827] border-b border-[#E2E8F0] pb-3 flex items-center gap-2">
              <FileText className="text-[#EA580C]" size={19} />
              Order Summary
            </h3>
            
            <div className="space-y-3.5 text-sm">
              <div className="flex items-start gap-3">
                <Building2 size={18} className="text-[#EA580C] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white truncate">{gym.name || 'Selected Gym'}</p>
                  <p className="text-xs text-[#64748B]">{branch?.branchName ? `${branch.branchName} • ` : ''}{gym.location?.city || 'India'}</p>
                </div>
              </div>
              
              <div className="w-full h-px bg-[#E2E8F0]"></div>
              
              <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{plan.name}</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]">
                    {plan.duration || (isFreeTrial ? '1 Week' : '1 Month')}
                  </span>
                </div>
                {plan.features && (
                  <p className="text-[11px] text-[#64748B] line-clamp-2 mt-1">
                    {Array.isArray(plan.features) ? plan.features.join(' • ') : plan.features}
                  </p>
                )}
              </div>
            </div>

            {/* Referral Code Coupon Input */}
            {!isFreeTrial && (
              <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span className="flex items-center gap-1.5"><Gift size={14} className="text-[#EA580C]" /> Referral Code</span>
                  {appliedReferral && (
                    <span className="text-[10px] text-[#15803D] bg-[#FFF7ED] px-2 py-0.5 rounded-full font-bold border border-[#E2E8F0]/20">Applied</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralCodeInput}
                    onChange={(e) => {
                      setReferralCodeInput(e.target.value.toUpperCase());
                      setRefError('');
                    }}
                    placeholder="Enter referral code"
                    className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-xs text-white uppercase font-mono outline-none focus:border-[#FDBA74]"
                  />
                  <button
                    type="button"
                    disabled={!referralCodeInput || refChecking}
                    onClick={() => handleApplyReferral()}
                    className="px-3.5 py-1.5 bg-[#C2410C] hover:bg-[#3651D4] disabled:bg-gray-800 disabled:text-[#64748B] text-[#FFFFFF] font-bold text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer"
                  >
                    {refChecking ? '...' : 'Apply'}
                  </button>
                </div>

                {appliedReferral && (
                  <p className="text-[11px] text-[#15803D] font-medium flex items-center gap-1">
                    <Sparkles size={12} /> {appliedReferral.refereeReward?.discountType === 'Percentage' ? `${appliedReferral.refereeReward?.value}%` : `₹${appliedReferral.refereeReward?.value}`} discount applied from {appliedReferral.referrer?.name}!
                  </p>
                )}
                {refError && (
                  <p className="text-[11px] text-[#B91C1C] flex items-center gap-1">
                    <AlertCircle size={12} /> {refError}
                  </p>
                )}
              </div>
            )}

            {/* Referral Points Redemption Input */}
            {!isFreeTrial && rewardSettings?.enableMembershipDiscount !== false && userPointsBalance > 0 && (
              <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={usePoints}
                      onChange={(e) => setUsePoints(e.target.checked)}
                      className="w-4 h-4 rounded text-[#EA580C] bg-[#FFFFFF] border-[#E2E8F0] focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Coins size={14} className="text-[#EA580C]" />
                      Redeem Referral Points
                    </span>
                  </label>
                  <span className="text-[11px] font-bold text-[#EA580C]">
                    {userPointsBalance} pts available
                  </span>
                </div>

                {usePoints && (
                  <div className="space-y-2 pt-2 border-t border-[#E2E8F0]/60">
                    <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                      <span>Points to Redeem:</span>
                      <span className="font-bold text-white">{pointsToRedeem} pts</span>
                    </div>
                    <input
                      type="range"
                      min={Math.min(rewardSettings?.minPointsForRedemption || 100, userPointsBalance)}
                      max={userPointsBalance}
                      step={10}
                      value={pointsToRedeem}
                      onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                      className="w-full h-1.5 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#F97316]"
                    />
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#64748B]">
                        Conversion: {convUnit} pts = ₹{rupeeUnit}
                      </span>
                      <span className="text-[#15803D] font-bold flex items-center gap-1">
                        <Sparkles size={11} /> Discount: ₹{pointsDiscount}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-[#E2E8F0] pt-4 space-y-2.5 text-sm">
              <div className="flex justify-between text-xs">
                <span className="text-[#64748B]">Package Price</span>
                <span className="text-white font-medium">
                  {isFreeTrial ? '₹0' : `₹${numPrice.toLocaleString('en-IN')}`}
                </span>
              </div>
              {referralDiscount > 0 && (
                <div className="flex justify-between text-xs text-[#15803D] font-semibold">
                  <span className="flex items-center gap-1"><Tag size={12} /> Referral Discount</span>
                  <span>- ₹{referralDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {pointsDiscount > 0 && (
                <div className="flex justify-between text-xs text-[#15803D] font-semibold">
                  <span className="flex items-center gap-1"><Coins size={12} /> Points Discount ({pointsToRedeem} pts)</span>
                  <span>- ₹{pointsDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {!isFreeTrial && (
                <div className="flex justify-between text-xs">
                  <span className="text-[#64748B]">Taxes (18% GST)</span>
                  <span className="text-white font-medium">₹{tax.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            <div className="border-t border-dashed border-[#E2E8F0] pt-4 flex justify-between items-end">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Total Payable</span>
                {isFreeTrial && <p className="text-[11px] text-[#EA580C] font-semibold">No Payment Required</p>}
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-white">
                  {isFreeTrial ? '₹0' : `₹${total.toLocaleString('en-IN')}`}
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex items-start gap-2 text-[11px] text-[#64748B] bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
              <ShieldCheck size={14} className="shrink-0 text-[#15803D] mt-0.5" />
              <p>Safe & Encrypted checkout. Instant membership activation with automated confirmation email.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GymCheckout;
