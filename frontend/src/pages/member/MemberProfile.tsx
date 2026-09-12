import { User, Mail, Phone, MapPin, Edit3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const MemberProfile = () => {
  const { user } = useAuth();
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#16A34A]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          <div className="w-24 h-24 bg-[#FFFFFF] rounded-full border-2 border-[#16A34A] flex items-center justify-center text-[#16A34A] text-3xl font-bold shadow-[0_0_15px_rgba(212,255,0,0.2)]">
            {user?.firstName?.[0] || 'U'}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[#1E293B] mb-1">{user?.firstName || 'User'} {user?.lastName || ''}</h1>
            <p className="text-[#16A34A] font-medium capitalize mb-4">{user?.subscriptionPlan || 'Member'} Plan</p>
            <div className="flex flex-wrap gap-4 text-sm text-[#475569]">
              <div className="flex items-center gap-2"><Mail size={16} /> {user?.email || 'user@example.com'}</div>
              <div className="flex items-center gap-2"><Phone size={16} /> +1 (555) 012-3456</div>
              <div className="flex items-center gap-2"><MapPin size={16} /> New York, NY</div>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#E2E8F0] hover:bg-[#333] text-white rounded-xl transition-colors">
            <Edit3 size={16} /> Edit Profile
          </button>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Personal Details</h2>
          <div className="space-y-4">
            {[
              { label: 'Date of Birth', value: 'Jan 15, 1990' },
              { label: 'Gender', value: 'Male' },
              { label: 'Height', value: '180 cm' },
              { label: 'Weight', value: '75 kg' },
              { label: 'Emergency Contact', value: '+1 (555) 987-6543' }
            ].map((item, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-[#CCFBF1] last:border-0">
                <span className="text-[#475569]">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Fitness Goals</h2>
          <div className="space-y-4">
            <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#CCFBF1]">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-[#16A34A]">Weight Loss</span>
                <span className="text-sm">70%</span>
              </div>
              <div className="w-full bg-[#E2E8F0] rounded-full h-2">
                <div className="bg-[#16A34A] h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
            <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#CCFBF1]">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-[#1E293B]">Muscle Gain</span>
                <span className="text-sm text-[#475569]">In Progress</span>
              </div>
              <p className="text-sm text-[#475569] mt-2">Target: +5kg lean muscle mass by end of year.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;