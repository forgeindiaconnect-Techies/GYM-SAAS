import React from 'react';
import { X, UserCheck, UserPlus, FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  onClose: () => void;
  onSelectNew: () => void;
}

export const AddMemberSelectorModal: React.FC<Props> = ({ onClose, onSelectNew }) => {
  const navigate = useNavigate();

  const handleBulkImport = () => {
    onClose();
    navigate('/admin/import-customers');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full shadow-2xl border border-[#DCD9CD] overflow-hidden">
        <div className="p-6 border-b border-[#DCD9CD] flex justify-between items-center bg-[#F2EFE8]">
          <div>
            <h2 className="text-xl font-bold text-[#202522]">Add Member</h2>
            <p className="text-sm text-[#4A514D] mt-1">Select the type of member you want to add.</p>
          </div>
          <button onClick={onClose} className="text-[#4A514D] hover:text-[#202522] transition-colors p-2 rounded-lg hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-3">

          <button 
            onClick={onSelectNew}
            className="w-full text-left p-5 rounded-xl border-2 border-[#E8E5DA] hover:border-[#34483F] hover:bg-[#F5F3EE] transition-all group flex items-start space-x-4"
          >
            <div className="p-3 bg-[#E8E5DA] group-hover:bg-[#34483F]/20 rounded-lg shrink-0 transition-colors">
              <UserPlus size={26} className="text-[#4A514D] group-hover:text-[#34483F] transition-colors" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#202522] group-hover:text-[#34483F] transition-colors">New Customer</h3>
              <p className="text-sm text-[#4A514D] mt-0.5">A new person joining this gym for the first time. Go through the full registration and account creation flow.</p>
            </div>
          </button>

          <button 
            onClick={handleBulkImport}
            className="w-full text-left p-5 rounded-xl border-2 border-[#E8E5DA] hover:border-[#34483F] hover:bg-[#F5F3EE] transition-all group flex items-start space-x-4"
          >
            <div className="p-3 bg-[#E8E5DA] group-hover:bg-[#34483F]/20 rounded-lg shrink-0 transition-colors">
              <FileSpreadsheet size={26} className="text-[#4A514D] group-hover:text-[#34483F] transition-colors" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#202522] group-hover:text-[#34483F] transition-colors">Bulk Import (Excel / CSV)</h3>
              <p className="text-sm text-[#4A514D] mt-0.5">Import multiple existing customers at once from an Excel or CSV file. Supports up to 5,000 rows with full validation and duplicate detection.</p>
            </div>
          </button>

        </div>
      </div>
    </div>
  );
};
