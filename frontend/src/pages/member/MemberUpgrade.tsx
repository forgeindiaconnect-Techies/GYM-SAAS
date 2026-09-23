import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, Smartphone, Upload, QrCode, Landmark, AlertCircle } from 'lucide-react';
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
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchGymData();
  }, [user]);

  const fetchGymData = async () => {
    if (!user?.gymId) return;
    try {
      setLoading(true);
      const res = await api.get(`/gyms/${user.gymId}`);
      const fetchedGym = res.data.gym;
      setGym(fetchedGym);
      setPlans(fetchedGym.subscriptionPlans || []);
    } catch (err) {
      console.error('Error fetching gym plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTimeout(() => {
        setPaymentProofUrl('https://example.com/fake-receipt.png');
        alert('Receipt uploaded successfully!');
      }, 1000);
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
        transactionId: paymentMethod === 'qr' ? paymentReference : undefined,
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
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#34483F]" size={40} /></div>;
  }

  if (!selectedPlan) {
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-[#202522]">Upgrade Subscription</h1>
        <p className="text-[#4A514D] mb-8">Choose a subscription plan to continue accessing premium gym services.</p>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, idx) => {
            const isFreePlan = Number(plan.price) === 0 || plan.name?.toLowerCase().includes('free');
            // Disable free plan if the user has already completed it (e.g. they are expired or upgrading)
            const disableFreePlan = isFreePlan;

            return (
              <div key={idx} className="bg-white rounded-2xl border border-[#DCD9CD] p-6 shadow-sm hover:shadow-xl transition-shadow flex flex-col">
                <h3 className="text-xl font-bold text-[#202522] mb-2">{plan.name}</h3>
                <div className="text-3xl font-extrabold text-[#34483F] mb-4">₹{plan.price}<span className="text-sm text-[#4A514D] font-normal"> / {plan.duration}</span></div>
                <ul className="space-y-3 mb-8 flex-1 text-sm text-[#4A514D]">
                  {plan.features?.split(',').map((f: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle size={16} className="text-[#34483F] mr-2 shrink-0 mt-0.5" />
                      <span>{f.trim()}</span>
                    </li>
                  ))}
                </ul>
                <button
                  disabled={disableFreePlan}
                  onClick={() => setSelectedPlan(plan)}
                  className={`w-full py-3 font-bold rounded-xl transition-colors ${
                    disableFreePlan 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                      : 'bg-[#34483F] text-white hover:bg-[#C6A77D]'
                  }`}
                >
                  {disableFreePlan ? 'Trial Completed' : 'Continue to Payment'}
                </button>
              </div>
            );
          })}
          {plans.length === 0 && (
            <div className="col-span-3 text-center py-10 bg-white rounded-2xl border border-dashed border-gray-300">
              <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-700">No Plans Available</h3>
              <p className="text-gray-500">The gym owner has not configured any subscription plans yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const tax = Number(selectedPlan.price) * 0.18;
  const total = Number(selectedPlan.price) + tax;
  const paymentSettings = gym?.paymentSettings || {};
  const isFreePlan = Number(selectedPlan.price) === 0;
  const isQrEnabled = paymentSettings.isQrPaymentEnabled !== false; // default true if undefined

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => setSelectedPlan(null)} className="text-[#4A514D] hover:text-[#34483F] mb-6 font-medium text-sm transition-colors">
        &larr; Back to Plans
      </button>

      <div className="bg-white rounded-2xl border border-[#DCD9CD] shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Payment Form */}
        <div className="p-8 md:w-2/3 border-r border-[#DCD9CD]">
          <h2 className="text-2xl font-bold text-[#202522] mb-6">Payment Method</h2>
          
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <label className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'bank' ? 'border-[#34483F] bg-[#34483F]/5' : 'border-[#DCD9CD] hover:border-[#34483F]/50'}`}>
              <div className="flex items-center justify-between mb-2">
                <Landmark className={paymentMethod === 'bank' ? 'text-[#34483F]' : 'text-[#4A514D]'} size={24} />
                <input type="radio" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} className="hidden" />
                {paymentMethod === 'bank' && <CheckCircle className="text-[#34483F]" size={20} />}
              </div>
              <span className="font-medium text-[#202522] mb-1">Manual Payment</span>
              <span className="text-xs text-[#4A514D]">Bank Transfer or Cash</span>
            </label>

            {isQrEnabled && (
              <label className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'qr' ? 'border-[#34483F] bg-[#34483F]/5' : 'border-[#DCD9CD] hover:border-[#34483F]/50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <QrCode className={paymentMethod === 'qr' ? 'text-[#34483F]' : 'text-[#4A514D]'} size={24} />
                  <input type="radio" checked={paymentMethod === 'qr'} onChange={() => setPaymentMethod('qr')} className="hidden" />
                  {paymentMethod === 'qr' && <CheckCircle className="text-[#34483F]" size={20} />}
                </div>
                <span className="font-medium text-[#202522] mb-1">QR Code Payment</span>
                <span className="text-xs text-[#4A514D]">GPay, PhonePe, UPI</span>
              </label>
            )}
          </div>

          {!isFreePlan && paymentMethod === 'bank' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-[#F5F3EE] p-4 rounded-xl border border-[#DCD9CD] text-sm text-[#4A514D]">
                <p className="font-semibold text-[#202522] mb-2 text-base border-b border-[#DCD9CD] pb-2">Payment Information</p>
                <div className="grid grid-cols-2 gap-y-2 mt-3">
                  <p><strong>Customer Name:</strong> {user?.firstName} {user?.lastName}</p>
                  <p><strong>Gym Name:</strong> {gym?.name}</p>
                  <p><strong>Branch:</strong> {gym?.branches?.find((b:any) => b._id === user?.branchId)?.name || 'Main Branch'}</p>
                  <p><strong>Plan:</strong> {selectedPlan.name}</p>
                  <p><strong>Billing Cycle:</strong> {selectedPlan.duration}</p>
                  <p className="col-span-2 mt-2 pt-2 border-t border-[#DCD9CD]"><strong>Total Amount:</strong> <span className="text-[#34483F] font-bold">₹{total}</span></p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-[#4A514D]">
                <p className="font-semibold text-[#202522] mb-2 text-base border-b border-slate-200 pb-2">Gym Account Details</p>
                <div className="mt-3 space-y-2">
                  <p><strong>Account Name:</strong> {paymentSettings.accountName || gym?.name || 'N/A'}</p>
                  <p><strong>Instructions:</strong> {paymentSettings.instructions || 'Please transfer the exact amount to the gym account.'}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="font-bold text-[#202522] mb-4 text-lg">Enter Payment Details</h3>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4A514D] mb-2">Payment Date <span className="text-red-500">*</span></label>
                    <input 
                      type="date" 
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-lg px-4 py-3 text-[#202522] focus:outline-none focus:border-[#34483F]" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A514D] mb-2">Bank Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={customerBankName}
                      onChange={(e) => setCustomerBankName(e.target.value)}
                      placeholder="e.g. HDFC Bank" 
                      className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-lg px-4 py-3 text-[#202522] focus:outline-none focus:border-[#34483F]" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A514D] mb-2">Account Number <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={customerAccountNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setCustomerAccountNumber(val);
                      }}
                      placeholder="e.g. 50100123456789" 
                      className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-lg px-4 py-3 text-[#202522] focus:outline-none focus:border-[#34483F]" 
                      maxLength={18}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A514D] mb-2">IFSC Code <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={customerIfscCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                        setCustomerIfscCode(val);
                      }}
                      placeholder="e.g. HDFC0001234" 
                      className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-lg px-4 py-3 text-[#202522] focus:outline-none focus:border-[#34483F]" 
                      maxLength={11}
                    />
                  </div>
                </div>

              <div>
                <label className="block text-sm font-medium text-[#4A514D] mb-2">Additional Notes (Optional)</label>
                <textarea 
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="E.g., Payment made through bank transfer from HDFC." 
                  className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-lg px-4 py-3 text-[#202522] focus:outline-none focus:border-[#34483F] h-24 resize-none" 
                ></textarea>
              </div>
              </div>
            </div>
          )}

          {!isFreePlan && paymentMethod === 'qr' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-[#F5F3EE] p-4 rounded-xl border border-[#DCD9CD] text-sm text-[#4A514D]">
                <p className="font-semibold text-[#202522] mb-2 text-base border-b border-[#DCD9CD] pb-2">Payment Details</p>
                <div className="grid grid-cols-2 gap-y-2 mt-3">
                  <p><strong>Gym Name:</strong> {gym?.name}</p>
                  <p><strong>Branch:</strong> {gym?.branches?.find((b:any) => b._id === user?.branchId)?.name || 'Main Branch'}</p>
                  <p><strong>Business Name:</strong> {paymentSettings.accountName || gym?.name}</p>
                  <p><strong>Plan:</strong> {selectedPlan.name}</p>
                  <p><strong>Billing Cycle:</strong> {selectedPlan.duration}</p>
                  <p className="col-span-2 mt-2 pt-2 border-t border-[#DCD9CD]"><strong>Amount to Pay:</strong> <span className="text-[#34483F] font-bold text-lg">₹{total}</span></p>
                </div>
                <div className="mt-4 bg-white p-3 rounded border border-green-100">
                  <p><strong>Payment Instructions:</strong> {paymentSettings.instructions || 'Pay the exact subscription amount and enter the UTR number below after completing the payment.'}</p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-semibold text-[#202522] mb-4">Scan this QR code using your preferred UPI app.</p>
                <div className="bg-white p-4 rounded-xl border-2 border-[#34483F] shadow-md mb-6">
                  <img 
                    src={paymentSettings.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`upi://pay?pa=${paymentSettings.upiId || 'gym@upi'}&pn=${encodeURIComponent(gym.name)}&am=${total}&cu=INR`)}`}
                    alt="UPI QR Code" 
                    width={160} 
                    height={160} 
                    className="rounded-lg"
                  />
                </div>
                <div className="flex gap-4 mb-2 w-full justify-center">
                  <button onClick={() => setQrApp('GPay')} disabled={isProcessing} className={`flex items-center gap-2 px-4 py-2 border rounded-full transition-colors text-sm font-bold text-[#202522] ${qrApp === 'GPay' ? 'bg-[#34483F]/10 border-[#34483F]' : 'bg-white border-gray-200 hover:border-[#34483F]'}`}>
                    <Smartphone size={16} className="text-[#8FA89B]" /> GPay
                  </button>
                  <button onClick={() => setQrApp('PhonePe')} disabled={isProcessing} className={`flex items-center gap-2 px-4 py-2 border rounded-full transition-colors text-sm font-bold text-[#202522] ${qrApp === 'PhonePe' ? 'bg-[#34483F]/10 border-[#34483F]' : 'bg-white border-gray-200 hover:border-[#34483F]'}`}>
                    <Smartphone size={16} className="text-[#8FA89B]" /> PhonePe
                  </button>
                  <button onClick={() => setQrApp('Paytm')} disabled={isProcessing} className={`flex items-center gap-2 px-4 py-2 border rounded-full transition-colors text-sm font-bold text-[#202522] ${qrApp === 'Paytm' ? 'bg-[#34483F]/10 border-[#34483F]' : 'bg-white border-gray-200 hover:border-[#34483F]'}`}>
                    <Smartphone size={16} className="text-[#8FA89B]" /> Paytm
                  </button>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h3 className="font-bold text-[#202522] mb-4 text-lg">Enter Payment Details</h3>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4A514D] mb-2">Transaction ID / UTR Number <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={paymentReference}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setPaymentReference(val);
                      }}
                      placeholder="Enter 12-digit UTR number" 
                      className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-lg px-4 py-3 text-[#202522] focus:outline-none focus:border-[#34483F]" 
                      maxLength={12}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A514D] mb-2">Payment Date <span className="text-red-500">*</span></label>
                    <input 
                      type="date" 
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-lg px-4 py-3 text-[#202522] focus:outline-none focus:border-[#34483F]" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4A514D] mb-2">Additional Notes (Optional)</label>
                  <textarea 
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="E.g., Paid using Paytm." 
                    className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-lg px-4 py-3 text-[#202522] focus:outline-none focus:border-[#34483F] h-24 resize-none" 
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
                ? 'bg-[#E8E5DA] text-[#777] cursor-not-allowed hidden'
                : 'bg-[#34483F] text-white hover:bg-[#C6A77D] shadow-lg shadow-green-200'
            }`}
          >
            {isProcessing ? <><Loader2 className="animate-spin mr-2" size={20} /> Processing...</> : (isFreePlan ? 'Activate Plan' : 'Submit Payment for Verification')}
          </button>
        </div>

        {/* Order Summary */}
        <div className="p-8 md:w-1/3 bg-[#F2EFE8]">
          <h3 className="text-lg font-bold text-[#202522] mb-6 border-b border-gray-200 pb-4">Order Summary</h3>
          <div className="space-y-4 mb-6 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Plan</p>
              <p className="font-bold text-[#202522]">{selectedPlan.name}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Duration</p>
              <p className="font-bold text-[#202522]">{selectedPlan.duration}</p>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-6 space-y-3 mb-6 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-medium text-[#202522]">₹{selectedPlan.price}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">GST (18%)</span><span className="font-medium text-[#202522]">₹{tax}</span></div>
          </div>
          <div className="border-t border-dashed border-gray-300 pt-4 flex justify-between items-end">
            <span className="text-gray-500 font-medium">Total</span>
            <div className="text-2xl font-extrabold text-[#34483F]">₹{total}</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MemberUpgrade;
