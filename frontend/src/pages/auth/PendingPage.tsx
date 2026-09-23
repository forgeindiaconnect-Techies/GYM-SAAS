
import { Activity, Clock, Mail, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const PendingPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#F5F3EE] flex flex-col items-center justify-center px-4 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,255,0,0.04)_0%,_transparent_60%)] pointer-events-none" />

      <div className="w-20 h-20 bg-[#F59E0B]/10 rounded-full flex items-center justify-center mb-8">
        <Clock size={40} className="text-[#F59E0B]" />
      </div>

      <h1 className="text-3xl font-bold text-[#202522] mb-3">Application Pending Review</h1>
      <p className="text-[#4A514D] max-w-md mb-6 leading-relaxed">
        Hi <strong className="text-[#202522]">{user?.firstName}</strong>, your AI GYM account has been created. Our team is reviewing your application and will notify you once approved.
      </p>

      <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6 max-w-sm w-full mb-8 space-y-4 text-left">
        <div className="flex items-center space-x-3 text-sm">
          <div className="w-8 h-8 bg-[#34483F]/10 rounded-lg flex items-center justify-center text-[#34483F]"><Activity size={16} /></div>
          <div><p className="text-[#202522] font-medium">Account Created</p><p className="text-[#4A514D] text-xs">Your profile is saved</p></div>
          <div className="ml-auto text-[#22C55E] text-xs font-semibold">Done</div>
        </div>
        <div className="flex items-center space-x-3 text-sm">
          <div className="w-8 h-8 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center text-[#F59E0B]"><Clock size={16} /></div>
          <div><p className="text-[#202522] font-medium">Admin Review</p><p className="text-[#4A514D] text-xs">Typically within 24 hours</p></div>
          <div className="ml-auto text-[#F59E0B] text-xs font-semibold">Pending</div>
        </div>
        <div className="flex items-center space-x-3 text-sm opacity-40">
          <div className="w-8 h-8 bg-[#E8E5DA] rounded-lg flex items-center justify-center text-[#4A514D]"><Mail size={16} /></div>
          <div><p className="text-[#202522] font-medium">Approval Notification</p><p className="text-[#4A514D] text-xs">You'll receive an email</p></div>
          <div className="ml-auto text-[#555] text-xs font-semibold">Waiting</div>
        </div>
      </div>

      <button onClick={logout} className="flex items-center space-x-2 text-[#4A514D] hover:text-[#34483F] transition-colors text-sm">
        <LogOut size={16} /><span>Sign out</span>
      </button>
    </div>
  );
};

export default PendingPage;
