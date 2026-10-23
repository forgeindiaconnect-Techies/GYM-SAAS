import { CheckCircle2, ChevronRight, LayoutDashboard } from 'lucide-react';

export const Step9Success = ({ navigate }: any) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border-4 border-green-500">
        <CheckCircle2 size={48} className="text-green-500" />
      </div>
      
      <h1 className="text-4xl font-black text-[#11111F] tracking-tight mb-2">Gym Created Successfully!</h1>
      <p className="text-[#A1A1AA] text-lg text-center max-w-lg mb-8">
        The gym profile has been established, operating hours configured, and the admin account is ready for use.
      </p>

      <div className="bg-[#FFFFFF] border border-[#292940] rounded-2xl p-6 w-full max-w-md mb-8">
        <h3 className="text-sm font-bold text-[#11111F] uppercase tracking-wider mb-4 border-b border-[#292940] pb-2">What happened?</h3>
        <ul className="space-y-3">
          {[
            'Gym information & location saved',
            'Admin account credentials created',
            'Staff & Member counts initialized',
            'Verification documents uploaded',
            'Subscription plans activated'
          ].map((item, i) => (
            <li key={i} className="flex items-center text-sm text-[#A1A1AA]">
              <CheckCircle2 size={16} className="text-green-500 mr-3 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <button 
          onClick={() => navigate('/super-admin/dashboard')}
          className="flex-1 px-6 py-4 bg-[#6366F1] text-white font-bold rounded-xl hover:bg-[#4F46E5] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#6366F1]/20"
        >
          Go to Dashboard <ChevronRight size={18} />
        </button>
        <button 
          onClick={() => navigate('/super-admin/approved')}
          className="flex-1 px-6 py-4 bg-[#FFFFFF] hover:bg-[#17172A] text-[#11111F] font-bold rounded-xl border border-[#292940] transition-all flex items-center justify-center gap-2"
        >
          <LayoutDashboard size={18} /> Approved Gyms
        </button>
      </div>
    </div>
  );
};
