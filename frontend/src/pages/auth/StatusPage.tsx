import { useSearchParams } from 'react-router-dom';
import { Activity, Clock, Mail, LogOut, XCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const StatusPage = () => {
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'pending';

  const renderContent = () => {
    switch (type) {
      case 'rejected':
        return (
          <>
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-8 mx-auto">
              <XCircle size={40} className="text-[#6fa3a0]" />
            </div>
            <h1 className="text-3xl font-bold text-[#202828] mb-3 text-center">Application Rejected</h1>
            <p className="text-[#455250] max-w-md mb-6 leading-relaxed text-center mx-auto">
              {user?.role === 'MEMBER' 
                ? 'Your gym membership has been rejected by the Gym Admin.'
                : 'Your gym registration has been rejected by the Super Admin.'}
            </p>
            {user?.rejectionReason && (
              <div className="bg-[#FFFFFF] border border-red-500/30 rounded-2xl p-6 max-w-md w-full mb-8 text-left mx-auto">
                <h3 className="text-red-400 font-semibold mb-2">Reason for Rejection:</h3>
                <p className="text-[#202828] text-sm">{user.rejectionReason}</p>
              </div>
            )}
            <div className="flex justify-center space-x-4 mb-8">
              <a href="mailto:support@aigym.com" className="px-6 py-2 bg-[#FFFFFF] border border-[#D3DFDA] hover:bg-[#333] text-[#202828] rounded-lg font-medium transition-colors">
                Contact Support
              </a>
            </div>
          </>
        );

      case 'suspended':
        return (
          <>
            <div className="w-20 h-20 bg-[#6fa3a0]/10 rounded-full flex items-center justify-center mb-8 mx-auto">
              <AlertTriangle size={40} className="text-[#6fa3a0]" />
            </div>
            <h1 className="text-3xl font-bold text-[#202828] mb-3 text-center">Account Suspended</h1>
            <p className="text-[#455250] max-w-md mb-6 leading-relaxed text-center mx-auto">
              Your gym account has been suspended. Please contact the administrator for assistance.
            </p>
            {user?.suspensionReason && (
              <div className="bg-[#FFFFFF] border border-[#6fa3a0]/30 rounded-2xl p-6 max-w-md w-full mb-8 text-left mx-auto">
                <h3 className="text-teal-400 font-semibold mb-2">Reason for Suspension:</h3>
                <p className="text-[#202828] text-sm">{user.suspensionReason}</p>
              </div>
            )}
            <div className="flex justify-center space-x-4 mb-8">
              <a href="mailto:support@aigym.com" className="px-6 py-2 bg-[#164A4A] hover:bg-[#C6A77D] text-white rounded-lg font-medium transition-colors">
                Contact Support
              </a>
            </div>
          </>
        );

      case 'inactive':
        return (
          <>
            <div className="w-20 h-20 bg-gray-500/10 rounded-full flex items-center justify-center mb-8 mx-auto">
              <AlertTriangle size={40} className="text-gray-500" />
            </div>
            <h1 className="text-3xl font-bold text-[#202828] mb-3 text-center">Account Inactive</h1>
            <p className="text-[#455250] max-w-md mb-6 leading-relaxed text-center mx-auto">
              Your gym account is currently inactive. Your dashboard is temporarily disabled. Please contact the administrator to reactivate your account.
            </p>
            <div className="flex justify-center space-x-4 mb-8">
              <a href="mailto:support@aigym.com" className="px-6 py-2 bg-[#FFFFFF] border border-[#D3DFDA] hover:bg-[#F1F5F3] text-[#202828] rounded-lg font-medium transition-colors">
                Contact Support
              </a>
            </div>
          </>
        );

      case 'pending':
      default:
        return (
          <>
            <div className="w-20 h-20 bg-[#F59E0B]/10 rounded-full flex items-center justify-center mb-8 mx-auto">
              <Clock size={40} className="text-[#F59E0B]" />
            </div>
            <h1 className="text-3xl font-bold text-[#202828] mb-3 text-center">Application Pending Review</h1>
            <p className="text-[#455250] max-w-md mb-6 leading-relaxed text-center mx-auto">
              Hi <strong className="text-[#202828]">{user?.firstName}</strong>, 
              {user?.role === 'MEMBER'
                ? ' your membership request is currently pending gym approval.'
                : ' your gym registration is currently pending approval. Please wait for Super Admin approval.'}
            </p>
            <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6 max-w-sm w-full mb-8 space-y-4 text-left mx-auto">
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-8 h-8 bg-[#164A4A]/10 rounded-lg flex items-center justify-center text-[#164A4A]"><Activity size={16} /></div>
                <div><p className="text-[#202828] font-medium">Account Created</p><p className="text-[#455250] text-xs">Your profile is saved</p></div>
                <div className="ml-auto text-[#22C55E] text-xs font-semibold">Done</div>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-8 h-8 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center text-[#F59E0B]"><Clock size={16} /></div>
                <div><p className="text-[#202828] font-medium">Admin Review</p><p className="text-[#455250] text-xs">Typically within 24 hours</p></div>
                <div className="ml-auto text-[#F59E0B] text-xs font-semibold">Pending</div>
              </div>
              <div className="flex items-center space-x-3 text-sm opacity-40">
                <div className="w-8 h-8 bg-[#E8E5DA] rounded-lg flex items-center justify-center text-[#455250]"><Mail size={16} /></div>
                <div><p className="text-[#202828] font-medium">Approval Notification</p><p className="text-[#455250] text-xs">You'll receive an email</p></div>
                <div className="ml-auto text-[#555] text-xs font-semibold">Waiting</div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F3] flex flex-col justify-center px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,255,0,0.04)_0%,_transparent_60%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-xl mx-auto">
        {renderContent()}

        <div className="flex justify-center">
          <button onClick={logout} className="flex items-center space-x-2 text-[#455250] hover:text-[#164A4A] transition-colors text-sm">
            <LogOut size={16} /><span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusPage;
