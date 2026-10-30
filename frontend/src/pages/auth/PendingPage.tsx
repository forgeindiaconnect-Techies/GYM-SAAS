
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4 text-center relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,255,0,0.04)_0%,_transparent_60%)] pointer-events-none" />

      {/* Top Left Back to Home / Landing Page Arrow */}
      <Link 
        to="/" 
        id="back-to-home-arrow"
        className="absolute top-6 left-6 sm:top-8 sm:left-8 text-[#64748B] hover:text-[#EA580C] flex items-center gap-2.5 transition-all z-20 group"
        title="Back to Landing Page"
      >
        <div className="w-10 h-10 rounded-full bg-[#FFFFFF] border border-[#E2E8F0] flex items-center justify-center shadow-sm group-hover:border-[#FDBA74] group-hover:bg-[#FFF7ED] transition-all">
          <ArrowLeft size={20} className="text-[#64748B] group-hover:text-[#EA580C] group-hover:-translate-x-0.5 transition-transform" />
        </div>
        <span className="font-semibold text-sm text-[#64748B] group-hover:text-[#EA580C]">Back to Landing Page</span>
      </Link>

      <div className="w-20 h-20 bg-[#FFF7ED] rounded-full flex items-center justify-center mb-8">
        <Clock size={40} className="text-[#EA580C]" />
      </div>

      <h1 className="text-3xl font-bold text-[#111827] mb-3">Application Pending Review</h1>
      <p className="text-[#64748B] max-w-md mb-6 leading-relaxed">
        Hi <strong className="text-[#111827]">{user?.firstName}</strong>, your Gymora account has been created. Our team is reviewing your application and will notify you once approved.
      </p>

      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 max-w-sm w-full mb-8 space-y-4 text-left">
        <div className="flex items-center space-x-3 text-sm">
          <div className="w-8 h-8 bg-[#FFF7ED] rounded-lg flex items-center justify-center text-[#EA580C]"><Activity size={16} /></div>
          <div><p className="text-[#111827] font-medium">Account Created</p><p className="text-[#64748B] text-xs">Your profile is saved</p></div>
          <div className="ml-auto text-[#15803D] text-xs font-semibold">Done</div>
        </div>
        <div className="flex items-center space-x-3 text-sm">
          <div className="w-8 h-8 bg-[#FFF7ED] rounded-lg flex items-center justify-center text-[#EA580C]"><Clock size={16} /></div>
          <div><p className="text-[#111827] font-medium">Admin Review</p><p className="text-[#64748B] text-xs">Typically within 24 hours</p></div>
          <div className="ml-auto text-[#EA580C] text-xs font-semibold">Pending</div>
        </div>
        <div className="flex items-center space-x-3 text-sm opacity-40">
          <div className="w-8 h-8 bg-[#F8FAFC] rounded-lg flex items-center justify-center text-[#64748B]"><Mail size={16} /></div>
          <div><p className="text-[#111827] font-medium">Approval Notification</p><p className="text-[#64748B] text-xs">You'll receive an email</p></div>
          <div className="ml-auto text-[#64748B] text-xs font-semibold">Waiting</div>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-6">
        <Link 
          to="/" 
          className="flex items-center space-x-2 text-[#64748B] hover:text-[#EA580C] transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} /><span>Back to Landing Page</span>
        </Link>
        <span className="text-[#E2E8F0]">|</span>
        <button onClick={logout} className="flex items-center space-x-2 text-[#64748B] hover:text-[#EA580C] transition-colors text-sm font-medium">
          <LogOut size={16} /><span>Sign out</span>
        </button>
      </div>
    </div>
  );
};

export default PendingPage;
