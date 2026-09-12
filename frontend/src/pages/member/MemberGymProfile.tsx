import { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Mail, Globe } from 'lucide-react';
import api from '../../utils/api';

const MemberGymProfile = () => {
  const [gym, setGym] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGym = async () => {
      try {
        const res = await api.get('/gyms/my-gym');
        setGym(res.data.gym);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch gym details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchGym();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center py-20 text-[#475569]">Loading gym details...</div>;
  }

  if (error) {
    return (
      <div className="bg-[#0D9488]/10 border border-[#0D9488]/30 text-teal-400 p-4 rounded-xl text-sm max-w-3xl mx-auto">
        {error}
      </div>
    );
  }

  if (!gym) {
    return <div className="text-center py-20 text-[#475569]">You are not assigned to any specific gym yet.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-[#CCFBF1] pb-8">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-[#FFFFFF] border border-[#CCFBF1] rounded-3xl flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
            {gym.logo ? (
              <img src={gym.logo} alt={gym.name} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="text-[#555]" size={40} />
            )}
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#1E293B] tracking-tight">{gym.name}</h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-[#EF4444] font-bold text-sm tracking-wide uppercase">{gym.gymType || 'Fitness Facility'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Contact Info */}
        <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6 md:p-8 shadow-xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-[#CCFBF1] pb-3 text-[#1E293B]">
            <Phone className="text-[#16A34A]" size={20} />
            Contact Info
          </h2>
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#475569]">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-xs text-[#475569] uppercase tracking-wider font-semibold mb-0.5">Email</p>
                <p className="text-[#1E293B] font-medium">{gym.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#475569]">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-xs text-[#475569] uppercase tracking-wider font-semibold mb-0.5">Phone</p>
                <p className="text-[#1E293B] font-medium">{gym.phone}</p>
              </div>
            </div>
            {gym.website && (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#475569]">
                  <Globe size={18} />
                </div>
                <div>
                  <p className="text-xs text-[#475569] uppercase tracking-wider font-semibold mb-0.5">Website</p>
                  <a href={gym.website} target="_blank" rel="noopener noreferrer" className="text-[#16A34A] hover:underline font-medium">
                    {gym.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Location Info */}
        <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6 md:p-8 shadow-xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-[#CCFBF1] pb-3 text-[#1E293B]">
            <MapPin className="text-[#16A34A]" size={20} />
            Location
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#475569] shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-xs text-[#475569] uppercase tracking-wider font-semibold mb-0.5">Address</p>
                <p className="text-[#1E293B] font-medium leading-relaxed">
                  {gym.location?.address}<br />
                  {gym.location?.city}, {gym.location?.state} {gym.location?.pinCode}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {gym.description && (
          <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6 md:p-8 shadow-xl md:col-span-2">
            <h2 className="text-xl font-bold mb-4 border-b border-[#CCFBF1] pb-3 text-[#1E293B]">About the Gym</h2>
            <p className="text-[#475569] leading-relaxed whitespace-pre-wrap">{gym.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberGymProfile;
