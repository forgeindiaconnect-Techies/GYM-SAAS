import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, Building2, CreditCard, Sparkles, ExternalLink, QrCode } from 'lucide-react';

export const MobileDummyPaymentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const gymName = searchParams.get('gym') || 'Perfect Fitness Studio';
  const amount = searchParams.get('amount') || '707.00';
  const planName = searchParams.get('plan') || 'Muscle Gain Package';
  const upiId = searchParams.get('upi') || 'aigym@icici';

  const [isPaid, setIsPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [txnId, setTxnId] = useState('');

  useEffect(() => {
    setTxnId(`UPI${Date.now().toString().slice(-8)}${Math.floor(100 + Math.random() * 900)}`);
  }, []);

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);

      // Broadcast to any listening tabs/windows (such as laptop checkout screen)
      try {
        const channel = new BroadcastChannel('gymora_payment_sync');
        channel.postMessage({
          status: 'SUCCESS',
          amount,
          gym: gymName,
          plan: planName,
          txnId
        });
        channel.close();
      } catch {}

      try {
        localStorage.setItem('gymora_last_payment', JSON.stringify({
          status: 'SUCCESS',
          amount,
          gym: gymName,
          plan: planName,
          txnId,
          timestamp: Date.now()
        }));
      } catch {}
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Header */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between py-3 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#EA580C] text-white flex items-center justify-center font-bold text-sm shadow-sm">
            G
          </div>
          <span className="font-extrabold text-base tracking-tight text-[#111827]">Gymora Pay</span>
        </div>
        <span className="text-[11px] font-bold text-[#15803D] bg-green-50 px-2.5 py-1 rounded-full border border-green-200 flex items-center gap-1">
          <ShieldCheck size={12} /> Secure Gateway
        </span>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-md mx-auto my-auto py-6 space-y-5">
        {!isPaid ? (
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
            <div className="text-center space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#EA580C] bg-[#FFF7ED] px-3 py-1 rounded-full border border-[#FFEDD5] inline-block">
                QR Payment Scanned
              </span>
              <h1 className="text-2xl font-black text-[#111827]">Payment Details</h1>
              <p className="text-xs text-[#64748B]">Verify payment details below and click OK to confirm</p>
            </div>

            {/* Amount Banner */}
            <div className="bg-[#FFF7ED] border border-[#FFEDD5] rounded-2xl p-5 text-center space-y-1 shadow-inner">
              <span className="text-xs font-semibold text-[#64748B]">Total Amount to Pay</span>
              <div className="text-3xl font-black text-[#EA580C]">₹{amount}</div>
              <span className="text-[11px] text-[#15803D] font-bold flex items-center justify-center gap-1">
                <Sparkles size={12} /> Zero Extra Gateway Charges
              </span>
            </div>

            {/* Details Table */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#64748B] flex items-center gap-1.5">
                  <Building2 size={14} className="text-[#EA580C]" /> Gym / Merchant:
                </span>
                <span className="font-bold text-[#111827] text-right truncate ml-2">{gymName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#64748B] flex items-center gap-1.5">
                  <CreditCard size={14} className="text-[#EA580C]" /> Selected Plan:
                </span>
                <span className="font-bold text-[#111827]">{planName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#64748B] flex items-center gap-1.5">
                  <QrCode size={14} className="text-[#EA580C]" /> Merchant UPI:
                </span>
                <span className="font-mono font-bold text-[#EA580C]">{upiId}</span>
              </div>
              <div className="flex justify-between items-center border-t border-[#E2E8F0] pt-2 text-[11px]">
                <span className="text-[#64748B]">Txn Reference:</span>
                <span className="font-mono text-[#64748B]">{txnId}</span>
              </div>
            </div>

            {/* Single "OK" Confirmation Button */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleConfirmPayment}
              className="w-full py-4 bg-[#15803D] hover:bg-[#166534] text-white rounded-2xl font-black text-base shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              {isProcessing ? (
                <>Processing Payment...</>
              ) : (
                <>
                  <CheckCircle2 size={20} /> CLICK OK TO CONFIRM PAYMENT
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-[#64748B]">
              Clicking OK will immediately confirm your payment and activate your membership on your screen.
            </p>
          </div>
        ) : (
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-7 shadow-2xl text-center space-y-6 animate-in zoom-in-95">
            <div className="w-20 h-20 bg-green-50 text-green-600 border-2 border-green-200 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={44} />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#15803D] bg-green-50 px-3 py-1 rounded-full border border-green-200">
                Payment Successful
              </span>
              <h2 className="text-2xl font-black text-[#111827] mt-3">₹{amount} Paid!</h2>
              <p className="text-xs text-[#64748B]">
                Your payment to <strong className="text-[#111827]">{gymName}</strong> is verified.
              </p>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Plan Activated:</span>
                <span className="font-bold text-[#111827]">{planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Transaction ID:</span>
                <span className="font-mono text-[#15803D] font-bold">{txnId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Status:</span>
                <span className="font-bold text-[#15803D]">Active / Approved</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              You can now look at your laptop screen — your checkout is updated automatically!
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto text-center py-4 text-[11px] text-[#94A3B8]">
        Powered by Gymora SaaS Platform • 256-Bit SSL Encrypted
      </footer>
    </div>
  );
};

export default MobileDummyPaymentPage;
