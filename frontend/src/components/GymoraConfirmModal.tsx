import React from 'react';
import { AlertCircle, HelpCircle, X } from 'lucide-react';

interface GymoraConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const GymoraConfirmModal: React.FC<GymoraConfirmModalProps> = ({
  isOpen,
  title = 'Confirmation',
  message,
  confirmText = 'Continue',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 text-[#64748B] hover:text-[#111827] p-1.5 rounded-lg hover:bg-[#F8FAFC] transition-colors"
          title="Close"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5] flex items-center justify-center shrink-0">
            <HelpCircle size={24} />
          </div>
          <div className="space-y-1 pr-4">
            <h3 className="text-base font-bold text-[#111827]">{title}</h3>
            <p className="text-sm text-[#64748B] leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-bold text-[#64748B] hover:text-[#111827] hover:bg-[#F8FAFC] transition-all cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GymoraConfirmModal;
