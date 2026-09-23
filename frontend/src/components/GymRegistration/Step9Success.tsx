import { CheckCircle2, ChevronRight, LayoutDashboard } from 'lucide-react';

export const Step9Success = ({ navigate }: any) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border-4 border-green-500">
        <CheckCircle2 size={48} className="text-green-500" />
      </div>
      
      <h1 className="text-4xl font-black text-[#202522] tracking-tight mb-2">Gym Created Successfully!</h1>
      <p className="text-[#4A514D] text-lg text-center max-w-lg mb-8">
        The gym profile has been established, operating hours configured, and the admin account is ready for use.
      </p>

      <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6 w-full max-w-md mb-8">
        <h3 className="text-sm font-bold text-[#202522] uppercase tracking-wider mb-4 border-b border-[#DCD9CD] pb-2">What happened?</h3>
        <ul className="space-y-3">
          {[
            'Gym information & location saved',
            'Admin account credentials created',
            'Staff & Member counts initialized',
            'Verification documents uploaded',
            'Subscription plans activated'
          ].map((item, i) => (
            <li key={i} className="flex items-center text-sm text-[#4A514D]">
              <CheckCircle2 size={16} className="text-green-500 mr-3 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <button 
          onClick={() => navigate('/super-admin/dashboard')}
          className="flex-1 px-6 py-4 bg-[#34483F] text-[#202522] font-bold rounded-xl hover:bg-[#C6A77D] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#34483F]/20"
        >
          Go to Dashboard <ChevronRight size={18} />
        </button>
        <button 
          onClick={() => navigate('/super-admin/approved')}
          className="flex-1 px-6 py-4 bg-[#FFFFFF] hover:bg-[#E8E5DA] text-[#202522] font-bold rounded-xl border border-[#DCD9CD] transition-all flex items-center justify-center gap-2"
        >
          <LayoutDashboard size={18} /> Approved Gyms
        </button>
      </div>
    </div>
  );
};
