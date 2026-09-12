import { User, Mail, Phone, MapPin, Edit3, Star, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const TrainerProfile = () => {
  const { user } = useAuth();
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#16A34A]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          <div className="w-24 h-24 bg-[#FFFFFF] rounded-full border-2 border-[#16A34A] flex items-center justify-center text-[#16A34A] text-3xl font-bold shadow-[0_0_15px_rgba(212,255,0,0.2)]">
            {user?.firstName?.[0] || 'T'}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[#1E293B] mb-1">{user?.firstName || 'Trainer'} {user?.lastName || ''}</h1>
            <p className="text-[#16A34A] font-medium mb-4 flex items-center gap-2">
              Elite Fitness Coach <Star size={16} fill="currentColor" /> 4.9 (120 reviews)
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-[#475569]">
              <div className="flex items-center gap-2"><Mail size={16} /> {user?.email || 'trainer@aigym.com'}</div>
              <div className="flex items-center gap-2"><Phone size={16} /> +1 (555) 012-3456</div>
              <div className="flex items-center gap-2"><MapPin size={16} /> Main Branch</div>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#E2E8F0] hover:bg-[#333] text-white rounded-xl transition-colors">
            <Edit3 size={16} /> Edit Profile
          </button>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Award size={20} className="text-[#16A34A]"/> Specializations</h2>
          <div className="flex flex-wrap gap-2">
            {['Strength Training', 'HIIT', 'Nutrition', 'Bodybuilding', 'CrossFit'].map((spec, i) => (
              <span key={i} className="px-3 py-1 bg-[#FFFFFF] border border-[#CCFBF1] rounded-full text-sm">
                {spec}
              </span>
            ))}
          </div>
          <div className="mt-6">
             <h3 className="font-bold mb-2">Bio</h3>
             <p className="text-sm text-[#475569] leading-relaxed">
               Certified personal trainer with over 5 years of experience in helping clients achieve their dream physiques. Passionate about strength and conditioning.
             </p>
          </div>
        </div>
        
        <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Availability</h2>
          <div className="space-y-3">
            {[
              { day: 'Monday - Friday', time: '06:00 AM - 08:00 PM' },
              { day: 'Saturday', time: '08:00 AM - 02:00 PM' },
              { day: 'Sunday', time: 'Off' }
            ].map((schedule, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-[#CCFBF1] last:border-0">
                <span className="text-[#475569] font-medium">{schedule.day}</span>
                <span className={schedule.time === 'Off' ? 'text-[#0D9488]' : 'text-[#1E293B]'}>{schedule.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerProfile;