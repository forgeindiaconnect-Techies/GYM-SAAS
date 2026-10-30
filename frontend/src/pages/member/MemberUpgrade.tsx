import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, Smartphone, QrCode, Landmark, AlertCircle } from 'lucide-react';
import api from '../../utils/api';

const MemberUpgrade = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [plans, setPlans] = useState<any[]>([]);
  const [gym, setGym] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'qr'>('bank');
  const [qrApp, setQrApp] = useState<'GPay' | 'PhonePe' | 'Paytm' | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerBankName, setCustomerBankName] = useState('');
  const [customerAccountNumber, setCustomerAccountNumber] = useState('');
  const [customerIfscCode, setCustomerIfscCode] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentProofUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchGymData();
  }, [user]);

  const fetchGymData = async () => {
    if (!user?.gymId) return;
    try {
      setLoading(true);
      const [gymRes, pkgRes] = await Promise.allSettled([
        api.get(`/gyms/${user.gymId}`),
        api.get('/gym-packages/public', { params: { gymId: user.gymId } })
      ]);
      const fetchedGym = gymRes.status === 'fulfilled' ? gymRes.value.data?.gym : null;
      setGym(fetchedGym);

      if (pkgRes.status === 'fulfilled' && Array.isArray(pkgRes.value.data?.packages) && pkgRes.value.data.packages.length > 0) {
        setPlans(pkgRes.value.data.packages.map((pkg: any) => ({
          _id: pkg._id,
          name: pkg.name,
          price: pkg.monthlyPrice ?? pkg.price ?? 0,
          duration: pkg.duration || '1 Month',
          features: Array.isArray(pkg.features) ? pkg.features.join(', ') : pkg.features,
          fitnessGoal: pkg.fitnessGoal,
          trainingType: pkg.trainingType
        })));
      } else {
        setPlans([
          {
            _id: 'default-pkg-strength',
            name: 'Strength',
            price: 399,
            duration: '1 Month',
            trainingType: 'Offline',
            fitnessGoal: 'Strength',
            features: 'Strength-focused workout programs, Progressive resistance training, Strength performance tracking'
          },
          {
            _id: 'default-pkg-muscle',
            name: 'Muscle Gain',
            price: 599,
            duration: '1 Month',
            trainingType: 'Online',
            fitnessGoal: 'Muscle Gain',
            features: 'Muscle-building workout programs, Strength training, Progressive overload training, Muscle development progress tracking'
          },
          {
            _id: 'default-pkg-weightloss',
            name: 'weight Loss',
            price: 499,
            duration: '1 Month',
            trainingType: 'Hybrid',
            fitnessGoal: 'Weight Loss',
            features: 'Fat-loss workout programs, Cardio training, Strength training, Weight and progress tracking'
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching gym plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPayment = async () => {
    let finalMethod = paymentMethod === 'bank' ? 'Bank Transfer' : 'Online';
    if (paymentMethod === 'qr' && qrApp) {
      finalMethod = qrApp;
    }
    
    const isFreePlan = Number(selectedPlan.price) === 0;
    const tax = Number(selectedPlan.price) * 0.18;
    const totalAmount = Number(selectedPlan.price) + tax;

    if (!isFreePlan) {
      if (!paymentDate || (paymentMethod === 'bank' && (!customerBankName || !customerAccountNumber || !customerIfscCode))) {
        alert('Please fill all required payment fields.');
        return;
      }
      if (paymentMethod === 'bank' && customerAccountNumber.length < 9) {
        alert('Please enter a valid Account Number (minimum 9 digits).');
        return;
      }
      if (paymentMethod === 'bank' && customerIfscCode.length !== 11) {
        alert('Please enter a valid 11-character IFSC Code.');
        return;
      }
      if (paymentMethod === 'qr' && !paymentReference) {
        alert('Please provide a transaction ID or reference number.');
        return;
      }
    }

    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const payload = {
        gymId: gym._id,
        branchId: user?.branchId,
        planName: selectedPlan.name,
        amount: totalAmount,
        duration: selectedPlan.duration,
        paymentMethod: finalMethod,
        transactionId: paymentReference || `TXN-${Date.now().toString().slice(-8)}${Math.floor(100 + Math.random() * 900)}`,
        paymentProofUrl: paymentMethod === 'qr' && !isFreePlan ? paymentProofUrl : undefined,
        paymentDate: paymentDate,
        customerBankDetails: paymentMethod === 'bank' ? {
          bankName: customerBankName,
          accountNumber: customerAccountNumber,
          ifscCode: customerIfscCode
        } : undefined,
        notes: paymentNotes
      };

      await api.post('/payments/submit', payload);

      alert('Payment submitted successfully. Your payment is currently being verified by the Gym Owner.');
      navigate('/member/dashboard');
    } catch (error: any) {
      console.error('Payment error:', error);
      alert(error.response?.data?.message || 'Payment submission failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#B76E79]" size={40} /></div>;
  }

  if (!selectedPlan) {
    return (
      <div className="max-w-6xl mx-auto">
        {(user?.subscriptionStatus?.toUpperCase() === 'EXPIRED' || (user?.subscriptionExpiry && new Date(user.subscriptionExpiry) < new Date())) && (
          <div className="mb-8 p-5 bg-red-50 border-2 border-red-300 rounded-2xl flex items-center justify-between text-red-900 shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle className="text-red-600" size={26} />
              </div>
              <div>
                <p className="font-bold text-lg text-red-950">Your subscription plan is completed</p>
                <p className="text-sm text-red-700 font-medium">Please upgrade your plan below to continue enjoying full access to your gym workouts and services.</p>
              </div>
            </div>
          </div>
        )}

        <h1 className="text-3xl font-bold mb-2 text-[#292524]">Upgrade Subscription</h1>
        <p className="text-[#57534E] mb-8">Choose a subscription plan to continue accessing premium gym services.</p>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, idx) => {
            const isFreePlan = Number(plan.price) === 0 || plan.name?.toLowerCase().includes('free');
            // Disable free plan if the user has already completed it (e.g. they are expired or upgrading)
            const disableFreePlan = isFreePlan;

            return (
              <div key={idx} className="bg-[#FFFFFF] rounded-2xl border border-[#E7DADD] p-6 shadow-sm hover:shadow-xl transition-shadow flex flex-col">
                <h3 className="text-xl font-bold text-[#292524] mb-2">{plan.name}</h3>
                <div className="text-3xl font-extrabold text-[#B76E79] mb-4">₹{plan.price}<span className="text-sm text-[#57534E] font-normal"> / {plan.duration}</span></div>
                <ul className="space-y-3 mb-8 flex-1 text-sm text-[#57534E]">
                  {plan.features?.split(',').map((f: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle size={16} className="text-[#B76E79] mr-2 shrink-0 mt-0.5" />
                      <span>{f.trim()}</span>
                    </li>
                  ))}
                </ul>
                <button
                  disabled={disableFreePlan}
                  onClick={() => setSelectedPlan(plan)}
                  className={`w-full py-3 font-bold rounded-xl transition-colors ${
                    disableFreePlan 
                      ? 'bg-[#F3E8E8] text-[#57534E] cursor-not-allowed border border-[#E7DADD]' 
                      : 'bg-[#B76E79] text-white hover:bg-[#9F5965]'
                  }`}
                >
                  {disableFreePlan ? 'Trial Completed' : 'Continue to Payment'}
                </button>
              </div>
            );
          })}
          {plans.length === 0 && (
            <div className="col-span-3 text-center py-10 bg-[#FFFFFF] rounded-2xl border border-dashed border-[#E7DADD]">
              <AlertCircle size={48} className="mx-auto text-[#57534E] mb-4" />
              <h3 className="text-xl font-bold text-[#292524]">No Plans Available</h3>
              <p className="text-[#57534E]">The gym owner has not configured any subscription plans yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const taxAmount = Number(selectedPlan.price) * 0.18;
  const totalAmount = Number(selectedPlan.price) + taxAmount;
  
  const tax = taxAmount.toFixed(2);
  const total = totalAmount.toFixed(2);
  const paymentSettings = gym?.paymentSettings || {};
  const isFreePlan = Number(selectedPlan.price) === 0;
  const isQrEnabled = paymentSettings.isQrPaymentEnabled !== false; // default true if undefined

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => setSelectedPlan(null)} className="text-[#57534E] hover:text-[#B76E79] mb-6 font-medium text-sm transition-colors">
        &larr; Back to Plans
      </button>

      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E7DADD] shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Payment Form */}
        <div className="p-8 md:w-2/3 border-r border-[#E7DADD]">
          <h2 className="text-2xl font-bold text-[#292524] mb-6">Payment Method</h2>
          
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <label className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'bank' ? 'border-[#B76E79] bg-[#B76E79]/5' : 'border-[#E7DADD] hover:border-[#B76E79]/50'}`}>
              <div className="flex items-center justify-between mb-2">
                <Landmark className={paymentMethod === 'bank' ? 'text-[#B76E79]' : 'text-[#57534E]'} size={24} />
                <input type="radio" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} className="hidden" />
                {paymentMethod === 'bank' && <CheckCircle className="text-[#B76E79]" size={20} />}
              </div>
              <span className="font-medium text-[#292524] mb-1">Manual Payment</span>
              <span className="text-xs text-[#57534E]">Bank Transfer or Cash</span>
            </label>

            {isQrEnabled && (
              <label className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'qr' ? 'border-[#B76E79] bg-[#B76E79]/5' : 'border-[#E7DADD] hover:border-[#B76E79]/50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <QrCode className={paymentMethod === 'qr' ? 'text-[#B76E79]' : 'text-[#57534E]'} size={24} />
                  <input type="radio" checked={paymentMethod === 'qr'} onChange={() => setPaymentMethod('qr')} className="hidden" />
                  {paymentMethod === 'qr' && <CheckCircle className="text-[#B76E79]" size={20} />}
                </div>
                <span className="font-medium text-[#292524] mb-1">QR Code Payment</span>
                <span className="text-xs text-[#57534E]">GPay, PhonePe, UPI</span>
              </label>
            )}
          </div>

          {!isFreePlan && paymentMethod === 'bank' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-[#F3E8E8] p-5 rounded-xl border border-[#E7DADD] text-sm text-[#57534E]">
                <p className="font-semibold text-[#292524] mb-4 text-base border-b border-[#E7DADD] pb-3">Payment Information</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-5 mt-3">
                  <div className="flex flex-col"><span className="text-[#57534E] text-xs uppercase tracking-wider mb-1">Customer Name</span><span className="font-medium text-[#292524]">{user?.firstName} {user?.lastName}</span></div>
                  <div className="flex flex-col"><span className="text-[#57534E] text-xs uppercase tracking-wider mb-1">Gym Name</span><span className="font-medium text-[#292524]">{gym?.name}</span></div>
                  <div className="flex flex-col"><span className="text-[#57534E] text-xs uppercase tracking-wider mb-1">Branch</span><span className="font-medium text-[#292524]">{gym?.branches?.find((b:any) => b._id === user?.branchId)?.name || 'Main Branch'}</span></div>
                  <div className="flex flex-col"><span className="text-[#57534E] text-xs uppercase tracking-wider mb-1">Plan</span><span className="font-medium text-[#292524]">{selectedPlan.name}</span></div>
                  <div className="flex flex-col"><span className="text-[#57534E] text-xs uppercase tracking-wider mb-1">Billing Cycle</span><span className="font-medium text-[#292524]">{selectedPlan.duration}</span></div>
                  <div className="col-span-2 mt-2 pt-4 border-t border-[#E7DADD] flex justify-between items-center">
                    <span className="text-[#292524] font-semibold text-base">Total Amount:</span> 
                    <span className="text-[#B76E79] font-black text-xl">₹{total}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#F3E8E8] p-4 rounded-xl border border-[#E7DADD] text-sm text-[#57534E]">
                <p className="font-semibold text-[#292524] mb-2 text-base border-b border-[#E7DADD] pb-2">Gym Account Details</p>
                <div className="mt-3 space-y-2">
                  <p><strong>Account Name:</strong> {paymentSettings.accountName || gym?.name || 'N/A'}</p>
                  <p><strong>Instructions:</strong> {paymentSettings.instructions || 'Please transfer the exact amount to the gym account.'}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E7DADD]">
                <h3 className="font-bold text-[#292524] mb-4 text-lg">Enter Payment Details</h3>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[#57534E] mb-2">Payment Date <span className="text-rose-600 font-bold">*</span></label>
                    <input 
                      type="date" 
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full bg-[#F3E8E8] border border-[#E7DADD] rounded-lg px-4 py-3 text-[#292524] focus:outline-none focus:border-[#B76E79]" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#57534E] mb-2">Bank Name <span className="text-rose-600 font-bold">*</span></label>
                    <input 
                      type="text" 
                      value={customerBankName}
                      onChange={(e) => setCustomerBankName(e.target.value)}
                      placeholder="e.g. HDFC Bank" 
                      className="w-full bg-[#F3E8E8] border border-[#E7DADD] rounded-lg px-4 py-3 text-[#292524] focus:outline-none focus:border-[#B76E79]" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#57534E] mb-2">Account Number <span className="text-rose-600 font-bold">*</span></label>
                    <input 
                      type="text" 
                      value={customerAccountNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setCustomerAccountNumber(val);
                      }}
                      placeholder="e.g. 50100123456789" 
                      className="w-full bg-[#F3E8E8] border border-[#E7DADD] rounded-lg px-4 py-3 text-[#292524] focus:outline-none focus:border-[#B76E79]" 
                      maxLength={18}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#57534E] mb-2">IFSC Code <span className="text-rose-600 font-bold">*</span></label>
                    <input 
                      type="text" 
                      value={customerIfscCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                        setCustomerIfscCode(val);
                      }}
                      placeholder="e.g. HDFC0001234" 
                      className="w-full bg-[#F3E8E8] border border-[#E7DADD] rounded-lg px-4 py-3 text-[#292524] focus:outline-none focus:border-[#B76E79]" 
                      maxLength={11}
                    />
                  </div>
                </div>

              <div>
                <label className="block text-sm font-medium text-[#57534E] mb-2">Additional Notes (Optional)</label>
                <textarea 
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="E.g., Payment made through bank transfer from HDFC." 
                  className="w-full bg-[#F3E8E8] border border-[#E7DADD] rounded-lg px-4 py-3 text-[#292524] focus:outline-none focus:border-[#B76E79] h-24 resize-none" 
                ></textarea>
              </div>
              </div>
            </div>
          )}

          {!isFreePlan && paymentMethod === 'qr' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-[#F3E8E8] p-5 rounded-xl border border-[#E7DADD] text-sm text-[#57534E]">
                <p className="font-semibold text-[#292524] mb-4 text-base border-b border-[#E7DADD] pb-3">Payment Details</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-5 mt-3">
                  <div className="flex flex-col"><span className="text-[#57534E] text-xs uppercase tracking-wider mb-1">Gym Name</span><span className="font-medium text-[#292524]">{gym?.name}</span></div>
                  <div className="flex flex-col"><span className="text-[#57534E] text-xs uppercase tracking-wider mb-1">Branch</span><span className="font-medium text-[#292524]">{gym?.branches?.find((b:any) => b._id === user?.branchId)?.name || 'Main Branch'}</span></div>
                  <div className="flex flex-col"><span className="text-[#57534E] text-xs uppercase tracking-wider mb-1">Business Name</span><span className="font-medium text-[#292524]">{paymentSettings.accountName || gym?.name}</span></div>
                  <div className="flex flex-col"><span className="text-[#57534E] text-xs uppercase tracking-wider mb-1">Plan</span><span className="font-medium text-[#292524]">{selectedPlan.name}</span></div>
                  <div className="flex flex-col"><span className="text-[#57534E] text-xs uppercase tracking-wider mb-1">Billing Cycle</span><span className="font-medium text-[#292524]">{selectedPlan.duration}</span></div>
                  <div className="col-span-2 mt-2 pt-4 border-t border-[#E7DADD] flex justify-between items-center">
                    <span className="text-[#292524] font-semibold text-base">Amount to Pay:</span> 
                    <span className="text-[#B76E79] font-black text-xl">₹{total}</span>
                  </div>
                </div>
                <div className="mt-5 bg-[#FFFFFF] p-4 rounded-xl border border-green-100/50 shadow-sm">
                  <p><strong>Payment Instructions:</strong> {paymentSettings.instructions || 'Pay the exact subscription amount and enter the UTR number below after completing the payment.'}</p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-6 bg-[#F3E8E8] rounded-xl border border-[#E7DADD]">
                <p className="font-semibold text-[#292524] mb-4">Scan this QR code using your preferred UPI app.</p>
                <div className="bg-[#FFFFFF] p-4 rounded-xl border-2 border-[#B76E79] shadow-md mb-6">
                  <img 
                    src={paymentSettings.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`upi://pay?pa=${paymentSettings.upiId || 'gym@upi'}&pn=${encodeURIComponent(gym.name)}&am=${total}&cu=INR`)}`}
                    alt="UPI QR Code" 
                    width={160} 
                    height={160} 
                    className="rounded-lg"
                  />
                </div>
                <div className="flex gap-4 mb-2 w-full justify-center">
                  <button onClick={() => setQrApp('GPay')} disabled={isProcessing} className={`flex items-center gap-2 px-4 py-2 border rounded-full transition-colors text-sm font-bold text-[#292524] ${qrApp === 'GPay' ? 'bg-[#B76E79]/10 border-[#B76E79]' : 'bg-[#FFFFFF] border-[#E7DADD] hover:border-[#B76E79]'}`}>
                    <Smartphone size={16} className="text-[#B76E79]" /> GPay
                  </button>
                  <button onClick={() => setQrApp('PhonePe')} disabled={isProcessing} className={`flex items-center gap-2 px-4 py-2 border rounded-full transition-colors text-sm font-bold text-[#292524] ${qrApp === 'PhonePe' ? 'bg-[#B76E79]/10 border-[#B76E79]' : 'bg-[#FFFFFF] border-[#E7DADD] hover:border-[#B76E79]'}`}>
                    <Smartphone size={16} className="text-[#B76E79]" /> PhonePe
                  </button>
                  <button onClick={() => setQrApp('Paytm')} disabled={isProcessing} className={`flex items-center gap-2 px-4 py-2 border rounded-full transition-colors text-sm font-bold text-[#292524] ${qrApp === 'Paytm' ? 'bg-[#B76E79]/10 border-[#B76E79]' : 'bg-[#FFFFFF] border-[#E7DADD] hover:border-[#B76E79]'}`}>
                    <Smartphone size={16} className="text-[#B76E79]" /> Paytm
                  </button>
                </div>
              </div>
              
              <div className="pt-4 border-t border-[#E7DADD]">
                <h3 className="font-bold text-[#292524] mb-4 text-lg">Enter Payment Details</h3>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[#57534E] mb-2">Transaction ID / UTR Number <span className="text-rose-600 font-bold">*</span></label>
                    <input 
                      type="text" 
                      value={paymentReference}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setPaymentReference(val);
                      }}
                      placeholder="Enter 12-digit UTR number" 
                      className="w-full bg-[#F3E8E8] border border-[#E7DADD] rounded-lg px-4 py-3 text-[#292524] focus:outline-none focus:border-[#B76E79]" 
                      maxLength={12}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#57534E] mb-2">Payment Date <span className="text-rose-600 font-bold">*</span></label>
                    <input 
                      type="date" 
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full bg-[#F3E8E8] border border-[#E7DADD] rounded-lg px-4 py-3 text-[#292524] focus:outline-none focus:border-[#B76E79]" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#57534E] mb-2">Additional Notes (Optional)</label>
                  <textarea 
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="E.g., Paid using Paytm." 
                    className="w-full bg-[#F3E8E8] border border-[#E7DADD] rounded-lg px-4 py-3 text-[#292524] focus:outline-none focus:border-[#B76E79] h-24 resize-none" 
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          <button 
            disabled={isProcessing}
            onClick={() => handleSubmitPayment()}
            className={`w-full mt-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all ${
              isProcessing
                ? 'bg-[#F3E8E8] text-[#57534E] cursor-not-allowed hidden'
                : 'bg-[#B76E79] text-white hover:bg-[#9F5965] shadow-lg shadow-[#B76E79]/15'
            }`}
          >
            {isProcessing ? <><Loader2 className="animate-spin mr-2" size={20} /> Processing...</> : (isFreePlan ? 'Activate Plan' : 'Submit Payment for Verification')}
          </button>
        </div>

        {/* Order Summary */}
        <div className="p-8 md:w-1/3 bg-[#F3E8E8]">
          <h3 className="text-lg font-bold text-[#292524] mb-6 border-b border-[#E7DADD] pb-4">Order Summary</h3>
          <div className="space-y-5 mb-8 text-sm">
            <div>
              <p className="text-[#57534E] mb-1 uppercase tracking-wider text-xs">Plan</p>
              <p className="font-bold text-[#292524] text-base">{selectedPlan.name}</p>
            </div>
            <div>
              <p className="text-[#57534E] mb-1 uppercase tracking-wider text-xs">Duration</p>
              <p className="font-bold text-[#292524] text-base">{selectedPlan.duration}</p>
            </div>
          </div>
          <div className="border-t border-[#E7DADD] pt-6 space-y-4 mb-6 text-sm">
            <div className="flex justify-between items-center"><span className="text-[#57534E]">Amount</span><span className="font-semibold text-[#292524]">₹{selectedPlan.price}</span></div>
            <div className="flex justify-between items-center"><span className="text-[#57534E]">GST (18%)</span><span className="font-semibold text-[#292524]">₹{tax}</span></div>
          </div>
          <div className="border-t border-dashed border-gray-400 pt-5 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-[#292524] font-semibold text-lg">Total</span>
              <div className="text-3xl font-black text-[#B76E79] tracking-tight">₹{total}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MemberUpgrade;
