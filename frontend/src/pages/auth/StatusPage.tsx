import { useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Activity, Clock, Mail, LogOut, XCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const StatusPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'pending';

  // Handle browser back arrow button so it reliably navigates to the landing page
  useEffect(() => {
    window.history.pushState({ page: 'status' }, '', window.location.href);
    const handlePopState = () => {
      navigate('/', { replace: true });
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  const renderContent = () => {
    switch (type) {
      case 'rejected':
        return (
          <>
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-8 mx-auto">
              <XCircle size={40} className="text-[#D8EAE7]" />
            </div>
            <h1 className="text-3xl font-bold text-[#344B4A] mb-3 text-center">Application Rejected</h1>
            <p className="text-[#697778] max-w-md mb-6 leading-relaxed text-center mx-auto">
              {user?.role === 'MEMBER' 
                ? 'Your gym membership has been rejected by the Gym Admin.'
                : 'Your gym registration has been rejected by the Super Admin.'}
            </p>
            {user?.rejectionReason && (
              <div className="bg-[#FFFFFF] border border-red-500/30 rounded-2xl p-6 max-w-md w-full mb-8 text-left mx-auto">
                <h3 className="text-red-400 font-semibold mb-2">Reason for Rejection:</h3>
                <p className="text-[#344B4A] text-sm">{user.rejectionReason}</p>
              </div>
            )}
            <div className="flex justify-center space-x-4 mb-8">
              <a href="mailto:support@aigym.com" className="px-6 py-2 bg-[#FFFFFF] border border-[#D9E2E3] hover:bg-[#333] text-[#344B4A] rounded-lg font-medium transition-colors">
                Contact Support
              </a>
            </div>
          </>
        );

      case 'suspended':
        return (
          <>
            <div className="w-20 h-20 bg-[#D8EAE7]/10 rounded-full flex items-center justify-center mb-8 mx-auto">
              <AlertTriangle size={40} className="text-[#D8EAE7]" />
            </div>
            <h1 className="text-3xl font-bold text-[#344B4A] mb-3 text-center">Account Suspended</h1>
            <p className="text-[#697778] max-w-md mb-6 leading-relaxed text-center mx-auto">
              Your gym account has been suspended. Please contact the administrator for assistance.
            </p>
            {user?.suspensionReason && (
              <div className="bg-[#FFFFFF] border border-[#D8EAE7]/30 rounded-2xl p-6 max-w-md w-full mb-8 text-left mx-auto">
                <h3 className="text-teal-400 font-semibold mb-2">Reason for Suspension:</h3>
                <p className="text-[#344B4A] text-sm">{user.suspensionReason}</p>
              </div>
            )}
            <div className="flex justify-center space-x-4 mb-8">
              <a href="mailto:support@aigym.com" className="px-6 py-2 bg-[#167D78] hover:bg-[#116660] text-white rounded-lg font-medium transition-colors">
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
            <h1 className="text-3xl font-bold text-[#344B4A] mb-3 text-center">Account Inactive</h1>
            <p className="text-[#697778] max-w-md mb-6 leading-relaxed text-center mx-auto">
              Your gym account is currently inactive. Your dashboard is temporarily disabled. Please contact the administrator to reactivate your account.
            </p>
            <div className="flex justify-center space-x-4 mb-8">
              <a href="mailto:support@aigym.com" className="px-6 py-2 bg-[#FFFFFF] border border-[#D9E2E3] hover:bg-[#E8EFF0] text-[#344B4A] rounded-lg font-medium transition-colors">
                Contact Support
              </a>
            </div>
          </>
        );

      case 'pending':
      default:
        return (
          <>
            <div className="w-20 h-20 bg-[#D99A27]/10 rounded-full flex items-center justify-center mb-8 mx-auto">
              <Clock size={40} className="text-[#D99A27]" />
            </div>
            <h1 className="text-3xl font-bold text-[#344B4A] mb-3 text-center">Application Pending Review</h1>
            <p className="text-[#697778] max-w-md mb-6 leading-relaxed text-center mx-auto">
              Hi <strong className="text-[#344B4A]">{user?.firstName}</strong>, 
              {user?.role === 'MEMBER'
                ? ' your membership request is currently pending gym approval.'
                : ' your gym registration is currently pending approval. Please wait for Super Admin approval.'}
            </p>
            <div className="bg-[#FFFFFF] border border-[#D9E2E3] rounded-2xl p-6 max-w-sm w-full mb-8 space-y-4 text-left mx-auto">
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-8 h-8 bg-[#167D78]/10 rounded-lg flex items-center justify-center text-[#167D78]"><Activity size={16} /></div>
                <div><p className="text-[#344B4A] font-medium">Account Created</p><p className="text-[#697778] text-xs">Your profile is saved</p></div>
                <div className="ml-auto text-[#27845A] text-xs font-semibold">Done</div>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-8 h-8 bg-[#D99A27]/10 rounded-lg flex items-center justify-center text-[#D99A27]"><Clock size={16} /></div>
                <div><p className="text-[#344B4A] font-medium">Admin Review</p><p className="text-[#697778] text-xs">Typically within 24 hours</p></div>
                <div className="ml-auto text-[#D99A27] text-xs font-semibold">Pending</div>
              </div>
              <div className="flex items-center space-x-3 text-sm opacity-40">
                <div className="w-8 h-8 bg-[#D8EAE7] rounded-lg flex items-center justify-center text-[#697778]"><Mail size={16} /></div>
                <div><p className="text-[#344B4A] font-medium">Approval Notification</p><p className="text-[#697778] text-xs">You'll receive an email</p></div>
                <div className="ml-auto text-[#697778] text-xs font-semibold">Waiting</div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#E8EFF0] flex flex-col justify-center px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,255,0,0.04)_0%,_transparent_60%)] pointer-events-none" />

      {/* Top Left Back to Home / Landing Page Arrow */}
      <Link 
        to="/" 
        id="back-to-home-arrow"
        className="absolute top-6 left-6 sm:top-8 sm:left-8 text-[#697778] hover:text-[#167D78] flex items-center gap-2.5 transition-all z-20 group"
        title="Back to Landing Page"
      >
        <div className="w-10 h-10 rounded-full bg-white border border-[#D9E2E3] flex items-center justify-center shadow-sm group-hover:border-[#167D78] group-hover:bg-[#167D78]/5 transition-all">
          <ArrowLeft size={20} className="text-[#697778] group-hover:text-[#167D78] group-hover:-translate-x-0.5 transition-transform" />
        </div>
        <span className="font-semibold text-sm text-[#697778] group-hover:text-[#167D78]">Back to Landing Page</span>
      </Link>

      <div className="relative z-10 w-full max-w-xl mx-auto">
        {renderContent()}

        <div className="flex items-center justify-center space-x-6">
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-[#697778] hover:text-[#167D78] transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /><span>Back to Landing Page</span>
          </Link>
          <span className="text-[#D9E2E3]">|</span>
          <button onClick={logout} className="flex items-center space-x-2 text-[#697778] hover:text-[#167D78] transition-colors text-sm font-medium">
            <LogOut size={16} /><span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusPage;
