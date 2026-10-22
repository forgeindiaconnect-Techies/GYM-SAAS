import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Loader2, ShieldCheck, FileText, CreditCard,
  QrCode, Landmark, Banknote, CheckCircle2, Sparkles, Building2,
  Gift, Tag, AlertCircle
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
    }

    // Expect state to be passed from GymDetails
    if (!location.state?.plan || !location.state?.gym) {
      // Check session storage
      const savedIntent = sessionStorage.getItem('checkout_intent');
      if (savedIntent) {
        try {
          const parsed = JSON.parse(savedIntent);
          setGym(parsed.gym);
          setPlan(parsed.plan);
          setBranch(parsed.branch);
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
  const discountedPrice = Math.max(0, numPrice - referralDiscount);
  const tax = isFreeTrial ? 0 : discountedPrice * 0.18; // 18% GST for paid plans
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
      // Simulate network processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      const payload = {
        gymId: gym._id,
        branchId: branch?._id,
        planName: plan.name,
        duration: plan.duration || (isFreeTrial ? '1 Week' : '1 Month'),
        price: numPrice,
        discount: referralDiscount,
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

  // Success Confirmation Screen
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-[#E8EFF0] pt-24 pb-16 px-4">
        <div className="max-w-xl mx-auto bg-white border border-[#D9E2E3] rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 size={44} />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {isFreeTrial ? 'Free Trial Activated' : 'Membership Confirmed'}
            </span>
            <h1 className="text-3xl font-extrabold text-[#344B4A] mt-3 tracking-tight">
              {isFreeTrial ? 'Welcome to Your Free Trial!' : 'Payment Successful!'}
            </h1>
            <p className="text-[#697778] text-sm mt-2">
              {isFreeTrial
                ? `You now have 1 week of free full access to ${paymentSuccess.gymName}.`
                : `Your ${paymentSuccess.planName} membership has been activated.`}
            </p>
          </div>

          <div className="bg-[#E8EFF0] border border-[#D9E2E3] rounded-2xl p-5 text-left space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#697778]">Gym:</span>
              <span className="font-bold text-[#344B4A]">{paymentSuccess.gymName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#697778]">Selected Plan:</span>
              <span className="font-bold text-[#167D78]">{paymentSuccess.planName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#697778]">Duration:</span>
              <span className="font-medium text-[#344B4A]">{paymentSuccess.duration}</span>
            </div>
            <div className="flex justify-between border-t border-[#D9E2E3] pt-3">
              <span className="text-[#697778]">Amount Paid:</span>
              <span className="font-black text-lg text-[#167D78]">
                {isFreeTrial ? '₹0 (Free Trial)' : `₹${paymentSuccess.amount.toLocaleString('en-IN')}`}
              </span>
            </div>
            <div className="flex justify-between text-xs text-[#697778]">
              <span>Payment Mode:</span>
              <span className="font-semibold text-[#344B4A]">{paymentSuccess.paymentMethod}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/member/dashboard')}
            className="w-full py-4 bg-[#167D78] hover:bg-[#116660] text-white font-bold rounded-2xl transition-colors shadow-lg"
          >
            Go to Member Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8EFF0] pt-24 pb-16 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(22,74,74,0.04)_0%,_transparent_60%)] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Left Column - Payment Details */}
        <div className="flex-1 space-y-6">
          <button
            onClick={() => navigate(-1)}
            className="text-[#697778] hover:text-[#167D78] flex items-center gap-2 text-sm font-medium transition-colors mb-2"
          >
            <ArrowLeft size={16} /> Back to Gym Details
          </button>
          
          <div className="bg-[#FFFFFF] border border-[#D9E2E3] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="border-b border-[#D9E2E3] pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#344B4A]">Checkout</h2>
                <p className="text-xs text-[#697778] mt-0.5">
                  {isFreeTrial ? 'Activate your complimentary 1-week free trial' : `Complete payment to activate ${plan.name}`}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isFreeTrial ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                {isFreeTrial ? 'Free Trial' : `${plan.name} Plan`}
              </span>
            </div>

            {/* Free Trial Banner / Explanation */}
            {isFreeTrial ? (
              <div className="text-center py-6 px-4 bg-[#E8EFF0] border border-[#D9E2E3] rounded-2xl space-y-4">
                <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
                  <Sparkles size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#344B4A]">1-Week Free Trial Access</h3>
                  <p className="text-sm text-[#697778] max-w-md mx-auto mt-2 leading-relaxed">
                    Enjoy 7 days of full gym access with zero upfront payment. You can upgrade to a paid subscription (like Silver Plan) at any time.
                  </p>
                </div>
              </div>
            ) : (
              /* Paid Plan Payment Methods */
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-[#344B4A] mb-3 flex items-center gap-2">
                    <CreditCard size={18} className="text-[#167D78]" /> Select Payment Method
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
                              ? 'border-[#167D78] bg-[#167D78]/5 ring-1 ring-[#167D78]'
                              : 'border-[#D9E2E3] bg-white hover:border-[#167D78]/40'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#167D78] text-white' : 'bg-[#E8EFF0] text-[#697778]'}`}>
                            <Icon size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className={`font-bold text-sm leading-tight ${isSelected ? 'text-[#167D78]' : 'text-[#344B4A]'}`}>{method.label}</p>
                            <p className="text-[11px] text-[#697778] mt-0.5 leading-snug">{method.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-form based on selected payment method */}
                {paymentMethod === 'UPI' && (
                  <div className="p-5 bg-[#E8EFF0] border border-[#D9E2E3] rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      <div className="bg-white p-3 rounded-2xl border border-[#D9E2E3] shadow-sm shrink-0">
                        <QRCode
                          value={`upi://pay?pa=aigym@icici&pn=${encodeURIComponent(gym.name)}&am=${total}&cu=INR`}
                          size={110}
                        />
                      </div>
                      <div className="space-y-2 text-center sm:text-left flex-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#167D78]">Scan QR Code</p>
                        <p className="text-xs text-[#697778]">Scan with Google Pay, PhonePe, Paytm, or BHIM to pay instantly.</p>
                        <div className="text-xs font-mono bg-white px-3 py-1.5 rounded-lg border border-[#D9E2E3] inline-block font-bold text-[#344B4A]">
                          UPI ID: aigym@icici
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#697778] mb-1">Or Enter Your UPI ID</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@okhdfcbank"
                        className="w-full bg-white border border-[#D9E2E3] rounded-xl px-3.5 py-2.5 text-sm text-[#344B4A] outline-none focus:border-[#167D78]"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'Card' && (
                  <div className="p-5 bg-[#E8EFF0] border border-[#D9E2E3] rounded-2xl space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#697778] mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                        placeholder="Name on card"
                        className="w-full bg-white border border-[#D9E2E3] rounded-xl px-3.5 py-2.5 text-sm text-[#344B4A] outline-none focus:border-[#167D78]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#697778] mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        placeholder="4532 •••• •••• 8901"
                        maxLength={19}
                        className="w-full bg-white border border-[#D9E2E3] rounded-xl px-3.5 py-2.5 text-sm text-[#344B4A] outline-none focus:border-[#167D78] font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#697778] mb-1">Expiry Date</label>
                        <input
                          type="text"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full bg-white border border-[#D9E2E3] rounded-xl px-3.5 py-2.5 text-sm text-[#344B4A] outline-none focus:border-[#167D78]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#697778] mb-1">CVV</label>
                        <input
                          type="password"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          placeholder="•••"
                          maxLength={4}
                          className="w-full bg-white border border-[#D9E2E3] rounded-xl px-3.5 py-2.5 text-sm text-[#344B4A] outline-none focus:border-[#167D78]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'Net Banking' && (
                  <div className="p-5 bg-[#E8EFF0] border border-[#D9E2E3] rounded-2xl space-y-3">
                    <label className="block text-xs font-semibold text-[#697778] mb-1">Select Bank</label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-white border border-[#D9E2E3] rounded-xl px-3.5 py-2.5 text-sm text-[#344B4A] outline-none focus:border-[#167D78]"
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
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 space-y-1">
                    <p className="font-bold">Pay At Gym Counter</p>
                    <p>Your membership plan will be pre-registered. You can pay via Cash, POS card machine, or UPI at the front desk.</p>
                  </div>
                )}
              </div>
            )}

            <button 
              disabled={isProcessing}
              onClick={handleCheckout}
              className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center space-x-2 transition-all shadow-lg ${
                isProcessing
                  ? 'bg-[#D8EAE7] text-[#697778] cursor-not-allowed'
                  : 'bg-[#167D78] text-white hover:bg-[#116660] cursor-pointer'
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
          <div className="bg-[#FFFFFF] border border-[#D9E2E3] rounded-3xl p-6 h-fit sticky top-24 shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-[#344B4A] border-b border-[#D9E2E3] pb-3 flex items-center gap-2">
              <FileText className="text-[#167D78]" size={19} />
              Order Summary
            </h3>
            
            <div className="space-y-3.5 text-sm">
              <div className="flex items-start gap-3">
                <Building2 size={18} className="text-[#167D78] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#344B4A] truncate">{gym.name || 'Selected Gym'}</p>
                  <p className="text-xs text-[#697778]">{branch?.branchName ? `${branch.branchName} • ` : ''}{gym.location?.city || 'India'}</p>
                </div>
              </div>
              
              <div className="w-full h-px bg-[#D8EAE7]"></div>
              
              <div className="bg-[#E8EFF0] p-3.5 rounded-2xl border border-[#D9E2E3]/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#344B4A]">{plan.name}</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#167D78]/10 text-[#167D78]">
                    {plan.duration || (isFreeTrial ? '1 Week' : '1 Month')}
                  </span>
                </div>
                {plan.features && (
                  <p className="text-[11px] text-[#697778] line-clamp-2 mt-1">{plan.features}</p>
                )}
              </div>
            </div>

            {/* Referral Code Coupon Input */}
            {!isFreeTrial && (
              <div className="p-3 bg-[#E8EFF0]/70 rounded-2xl border border-[#D9E2E3] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#344B4A]">
                  <span className="flex items-center gap-1.5"><Gift size={14} className="text-[#167D78]" /> Referral Code</span>
                  {appliedReferral && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">Applied</span>
                  )}
                </div>

                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={referralCodeInput}
                    onChange={(e) => {
                      setReferralCodeInput(e.target.value.toUpperCase());
                      setRefError('');
                    }}
                    placeholder="Enter referral code"
                    className="w-full bg-white border border-[#D9E2E3] rounded-xl px-3 py-1.5 text-xs text-[#344B4A] uppercase font-mono outline-none focus:border-[#167D78]"
                  />
                  <button
                    type="button"
                    disabled={!referralCodeInput || refChecking}
                    onClick={() => handleApplyReferral()}
                    className="px-3 py-1.5 bg-[#167D78] hover:bg-[#116660] disabled:bg-[#D8EAE7] text-white text-xs font-bold rounded-xl transition-all whitespace-nowrap"
                  >
                    {refChecking ? '...' : 'Apply'}
                  </button>
                </div>

                {appliedReferral && (
                  <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <Sparkles size={12} /> {appliedReferral.refereeReward?.discountType === 'Percentage' ? `${appliedReferral.refereeReward?.value}%` : `₹${appliedReferral.refereeReward?.value}`} discount applied from {appliedReferral.referrer?.name}!
                  </p>
                )}
                {refError && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1">
                    <AlertCircle size={12} /> {refError}
                  </p>
                )}
              </div>
            )}

            <div className="border-t border-[#D9E2E3] pt-4 space-y-2.5 text-sm">
              <div className="flex justify-between text-xs">
                <span className="text-[#697778]">Plan Price</span>
                <span className="text-[#344B4A] font-medium">
                  {isFreeTrial ? '₹0' : `₹${numPrice.toLocaleString('en-IN')}`}
                </span>
              </div>
              {referralDiscount > 0 && (
                <div className="flex justify-between text-xs text-emerald-700 font-semibold">
                  <span className="flex items-center gap-1"><Tag size={12} /> Referral Discount</span>
                  <span>- ₹{referralDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {!isFreeTrial && (
                <div className="flex justify-between text-xs">
                  <span className="text-[#697778]">Taxes (18% GST)</span>
                  <span className="text-[#344B4A] font-medium">₹{tax.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            <div className="border-t border-dashed border-[#D9E2E3] pt-4 flex justify-between items-end">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#697778]">Total Payable</span>
                {isFreeTrial && <p className="text-[11px] text-emerald-600 font-semibold">No Payment Required</p>}
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-[#167D78]">
                  {isFreeTrial ? '₹0' : `₹${total.toLocaleString('en-IN')}`}
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex items-start gap-2 text-[11px] text-[#697778] bg-[#E8EFF0] p-3 rounded-xl">
              <ShieldCheck size={14} className="shrink-0 text-emerald-700 mt-0.5" />
              <p>Safe & Encrypted checkout. Instant membership activation.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GymCheckout;
