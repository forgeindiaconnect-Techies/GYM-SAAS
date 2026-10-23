
import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Clock, Mail, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const PendingPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    window.history.pushState({ page: 'pending' }, '', window.location.href);
    const handlePopState = () => {
      navigate('/', { replace: true });
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0B0B12] flex flex-col items-center justify-center px-4 text-center relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,255,0,0.04)_0%,_transparent_60%)] pointer-events-none" />

      {/* Top Left Back to Home / Landing Page Arrow */}
      <Link 
        to="/" 
        id="back-to-home-arrow"
        className="absolute top-6 left-6 sm:top-8 sm:left-8 text-[#A1A1AA] hover:text-[#6366F1] flex items-center gap-2.5 transition-all z-20 group"
        title="Back to Landing Page"
      >
        <div className="w-10 h-10 rounded-full bg-white border border-[#292940] flex items-center justify-center shadow-sm group-hover:border-[#6366F1] group-hover:bg-[#6366F1]/5 transition-all">
          <ArrowLeft size={20} className="text-[#A1A1AA] group-hover:text-[#6366F1] group-hover:-translate-x-0.5 transition-transform" />
        </div>
        <span className="font-semibold text-sm text-[#A1A1AA] group-hover:text-[#6366F1]">Back to Landing Page</span>
      </Link>

      <div className="w-20 h-20 bg-[#D99A27]/10 rounded-full flex items-center justify-center mb-8">
        <Clock size={40} className="text-[#D99A27]" />
      </div>

      <h1 className="text-3xl font-bold text-[#11111F] mb-3">Application Pending Review</h1>
      <p className="text-[#A1A1AA] max-w-md mb-6 leading-relaxed">
        Hi <strong className="text-[#11111F]">{user?.firstName}</strong>, your Gymora account has been created. Our team is reviewing your application and will notify you once approved.
      </p>

      <div className="bg-[#FFFFFF] border border-[#292940] rounded-2xl p-6 max-w-sm w-full mb-8 space-y-4 text-left">
        <div className="flex items-center space-x-3 text-sm">
          <div className="w-8 h-8 bg-[#6366F1]/10 rounded-lg flex items-center justify-center text-[#6366F1]"><Activity size={16} /></div>
          <div><p className="text-[#11111F] font-medium">Account Created</p><p className="text-[#A1A1AA] text-xs">Your profile is saved</p></div>
          <div className="ml-auto text-[#27845A] text-xs font-semibold">Done</div>
        </div>
        <div className="flex items-center space-x-3 text-sm">
          <div className="w-8 h-8 bg-[#D99A27]/10 rounded-lg flex items-center justify-center text-[#D99A27]"><Clock size={16} /></div>
          <div><p className="text-[#11111F] font-medium">Admin Review</p><p className="text-[#A1A1AA] text-xs">Typically within 24 hours</p></div>
          <div className="ml-auto text-[#D99A27] text-xs font-semibold">Pending</div>
        </div>
        <div className="flex items-center space-x-3 text-sm opacity-40">
          <div className="w-8 h-8 bg-[#17172A] rounded-lg flex items-center justify-center text-[#A1A1AA]"><Mail size={16} /></div>
          <div><p className="text-[#11111F] font-medium">Approval Notification</p><p className="text-[#A1A1AA] text-xs">You'll receive an email</p></div>
          <div className="ml-auto text-[#A1A1AA] text-xs font-semibold">Waiting</div>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-6">
        <Link 
          to="/" 
          className="flex items-center space-x-2 text-[#A1A1AA] hover:text-[#6366F1] transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} /><span>Back to Landing Page</span>
        </Link>
        <span className="text-[#292940]">|</span>
        <button onClick={logout} className="flex items-center space-x-2 text-[#A1A1AA] hover:text-[#6366F1] transition-colors text-sm font-medium">
          <LogOut size={16} /><span>Sign out</span>
        </button>
      </div>
    </div>
  );
};

export default PendingPage;
