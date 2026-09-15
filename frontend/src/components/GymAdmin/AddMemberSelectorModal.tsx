import React from 'react';
import { X, UserCheck, UserPlus } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSelectExisting: () => void;
  onSelectNew: () => void;
}

export const AddMemberSelectorModal: React.FC<Props> = ({ onClose, onSelectExisting, onSelectNew }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full shadow-2xl border border-[#CCFBF1] overflow-hidden">
        <div className="p-6 border-b border-[#CCFBF1] flex justify-between items-center bg-[#F8FAFC]">
          <div>
            <h2 className="text-xl font-bold text-[#1E293B]">Add Member</h2>
            <p className="text-sm text-[#475569] mt-1">Select the type of member you want to add.</p>
          </div>
          <button onClick={onClose} className="text-[#475569] hover:text-[#1E293B] transition-colors p-2 rounded-lg hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          
          <button 
            onClick={onSelectExisting}
            className="w-full text-left p-6 rounded-xl border-2 border-[#E2E8F0] hover:border-[#16A34A] hover:bg-[#F0FDFA] transition-all group flex items-start space-x-4"
          >
            <div className="p-3 bg-[#E2E8F0] group-hover:bg-[#16A34A]/20 rounded-lg shrink-0 transition-colors">
              <UserCheck size={28} className="text-[#475569] group-hover:text-[#16A34A] transition-colors" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1E293B] group-hover:text-[#16A34A] transition-colors">Existing Customer</h3>
              <p className="text-sm text-[#475569] mt-1">Already a member of this physical gym before using the software. Add their existing details and current membership instantly.</p>
            </div>
          </button>

          <button 
            onClick={onSelectNew}
            className="w-full text-left p-6 rounded-xl border-2 border-[#E2E8F0] hover:border-[#16A34A] hover:bg-[#F0FDFA] transition-all group flex items-start space-x-4"
          >
            <div className="p-3 bg-[#E2E8F0] group-hover:bg-[#16A34A]/20 rounded-lg shrink-0 transition-colors">
              <UserPlus size={28} className="text-[#475569] group-hover:text-[#16A34A] transition-colors" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1E293B] group-hover:text-[#16A34A] transition-colors">New Customer</h3>
              <p className="text-sm text-[#475569] mt-1">A new person joining this gym for the first time. Go through the full registration and account creation flow.</p>
            </div>
          </button>

        </div>
      </div>
    </div>
  );
};
