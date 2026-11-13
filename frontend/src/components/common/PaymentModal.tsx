import React, { useState } from 'react';
import { Crown, XCircle, AlertCircle, Shield, Loader2, QrCode } from 'lucide-react';
import QRCode from 'react-qr-code';

export interface SummaryItem {
  label: string;
  value: string;
}

export interface PaymentConfirmData {
  paymentMethod: 'Card' | 'UPI' | 'NetBanking';
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  cardHolder?: string;
  upiId?: string;
  bankName?: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  summaryItems: SummaryItem[];
  totalAmount: number;
  totalLabel?: string;
  onConfirm: (data: PaymentConfirmData) => Promise<void> | void;
  loading?: boolean;
  error?: string | null;
  upiVpa?: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  summaryItems,
  totalAmount,
  totalLabel = 'Total Payable Amount:',
  onConfirm,
  loading = false,
  error = null,
  upiVpa = 'gymora@ybl'
}) => {
  const [paymentMethodSelect, setPaymentMethodSelect] = useState<'Card' | 'UPI' | 'NetBanking'>('Card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [upiId, setUpiId] = useState('');
  const [showQr, setShowQr] = useState(false);
  const [bankName, setBankName] = useState('State Bank of India (SBI)');
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2, 4)}`;
    }
    setCardExpiry(raw);
  };

  const handleSubmit = async () => {
    setLocalError(null);
    if (paymentMethodSelect === 'Card') {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length < 16) {
        setLocalError('Please enter a valid 16-digit card number.');
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        setLocalError('Please enter a valid expiry date (MM/YY).');
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        setLocalError('Please enter a valid 3 or 4-digit CVV.');
        return;
      }
      if (!cardHolder.trim()) {
        setLocalError('Please enter the cardholder full name.');
        return;
      }
    } else if (paymentMethodSelect === 'UPI') {
      if (!showQr && !upiId.trim()) {
        setLocalError('Please enter a valid UPI ID (e.g. name@oksbi) or scan the QR.');
        return;
      }
    }

    try {
      await onConfirm({
        paymentMethod: paymentMethodSelect,
        cardNumber,
        cardExpiry,
        cardCvv,
        cardHolder,
        upiId: paymentMethodSelect === 'UPI' ? (upiId.trim() || 'scan-qr@upi') : undefined,
        bankName: paymentMethodSelect === 'NetBanking' ? bankName : undefined
      });
    } catch (err: any) {
      setLocalError(err.message || 'Payment processing failed. Please try again.');
    }
  };

  const displayError = error || localError;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 max-h-[95vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] border border-[#FFEDD5] text-[#EA580C] flex items-center justify-center shrink-0">
              {icon || <Crown size={24} />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#111827]">
                {title}
              </h3>
              <p className="text-xs text-[#64748B]">
                {subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#64748B] hover:text-[#C2410C] rounded-xl cursor-pointer transition-colors"
          >
            <XCircle size={20} />
          </button>
        </div>

        {/* Error banner if any */}
        {displayError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-[#B91C1C]" />
            <span>{displayError}</span>
          </div>
        )}

        {/* Pricing / Plan / Order Summary Box */}
        <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl space-y-3 text-xs">
          {summaryItems.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-[#64748B]">
              <span>{item.label}:</span>
              <span className="font-extrabold text-[#111827]">{item.value}</span>
            </div>
          ))}
          <div className="flex justify-between items-center border-t border-[#E2E8F0] pt-2 text-sm font-bold">
            <span className="text-[#111827]">{totalLabel}</span>
            <span className="text-xl font-black text-[#EA580C]">₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Simulated Payment Method Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
            SELECT PAYMENT METHOD
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['Card', 'UPI', 'NetBanking'] as const).map(method => (
              <button
                key={method}
                type="button"
                onClick={() => {
                  setPaymentMethodSelect(method);
                  setLocalError(null);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  paymentMethodSelect === method
                    ? 'bg-[#C2410C] text-white border-[#FDBA74]'
                    : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:border-[#FDBA74]'
                }`}
              >
                {method}
              </button>
            ))}
          </div>

          {/* Card Inputs */}
          {paymentMethodSelect === 'Card' && (
            <div className="space-y-2.5 pt-1">
              <input
                type="text"
                placeholder="Card Number (4000 1234 5678 9010)"
                value={cardNumber}
                onChange={handleCardNumberChange}
                maxLength={19}
                className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E2E8F0] focus:border-[#FDBA74] rounded-xl text-xs text-[#111827] placeholder:text-[#64748B] focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="MM / YY"
                  value={cardExpiry}
                  onChange={handleExpiryChange}
                  maxLength={5}
                  className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E2E8F0] focus:border-[#FDBA74] rounded-xl text-xs text-[#111827] placeholder:text-[#64748B] focus:outline-none"
                />
                <input
                  type="password"
                  placeholder="CVV"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                  className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E2E8F0] focus:border-[#FDBA74] rounded-xl text-xs text-[#111827] placeholder:text-[#64748B] focus:outline-none"
                />
              </div>
              <input
                type="text"
                placeholder="Cardholder Full Name"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E2E8F0] focus:border-[#FDBA74] rounded-xl text-xs text-[#111827] placeholder:text-[#64748B] focus:outline-none"
              />
            </div>
          )}

          {/* UPI Inputs */}
          {paymentMethodSelect === 'UPI' && (
            <div className="space-y-3 pt-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter UPI ID (e.g. name@oksbi)"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E2E8F0] focus:border-[#FDBA74] rounded-xl text-xs text-[#111827] placeholder:text-[#64748B] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowQr(!showQr)}
                  className={`px-3 py-2 border rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    showQr ? 'bg-[#FFF7ED] text-[#EA580C] border-[#FDBA74]' : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]'
                  }`}
                >
                  <QrCode size={14} />
                  <span>{showQr ? 'Hide QR' : 'Show QR'}</span>
                </button>
              </div>

              {showQr ? (
                <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl flex flex-col items-center justify-center">
                  <div className="p-3 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl mb-2 shadow-sm">
                    <QRCode
                      value={`upi://pay?pa=${upiVpa}&pn=Gymora&am=${totalAmount}&cu=INR`}
                      size={120}
                      bgColor="#FFFFFF"
                      fgColor="#0F172A"
                      level="M"
                    />
                  </div>
                  <p className="text-xs font-bold text-[#111827]">Scan with any UPI App</p>
                  <p className="text-[10px] text-[#64748B]">Google Pay, PhonePe, Paytm, BHIM</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                    <button
                      key={app}
                      type="button"
                      onClick={() => setUpiId(`${app.toLowerCase().replace(/\s/g, '')}@upi`)}
                      className="px-2.5 py-1 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#FDBA74] hover:text-[#EA580C] rounded-lg text-[11px] font-bold text-[#64748B] transition-colors cursor-pointer"
                    >
                      {app}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* NetBanking Inputs */}
          {paymentMethodSelect === 'NetBanking' && (
            <div className="space-y-2.5 pt-1">
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E2E8F0] focus:border-[#FDBA74] rounded-xl text-xs text-[#111827] focus:outline-none cursor-pointer"
              >
                <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="Axis Bank">Axis Bank</option>
                <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                <option value="Punjab National Bank (PNB)">Punjab National Bank (PNB)</option>
                <option value="Bank of Baroda">Bank of Baroda</option>
                <option value="Canara Bank">Canara Bank</option>
                <option value="Other Banks">Other Banks...</option>
              </select>
              <p className="text-[11px] text-[#64748B]">You will be safely redirected to your bank portal after confirming.</p>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-1/3 py-3 bg-[#F8FAFC] hover:bg-[#FFF7ED] border border-[#E2E8F0] text-[#64748B] hover:text-[#C2410C] rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-2/3 py-3 bg-[#C2410C] hover:bg-[#9A3412] disabled:opacity-50 text-white font-bold rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/15 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Verifying Payment...</span>
              </>
            ) : (
              <span>Confirm & Pay ₹{totalAmount.toLocaleString('en-IN')}</span>
            )}
          </button>
        </div>

        {/* Security Footnote */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#64748B]">
          <Shield size={13} className="text-[#EA580C]" />
          <span>256-bit TLS encrypted & verified payment gateway</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

