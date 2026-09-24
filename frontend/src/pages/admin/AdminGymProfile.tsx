import { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Mail, Globe, Calendar, CreditCard } from 'lucide-react';
import api from '../../utils/api';

const AdminGymProfile = () => {
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
    return <div className="flex justify-center py-20 text-[#455250]">Loading gym details...</div>;
  }

  if (error) {
    return (
      <div className="bg-[#6fa3a0]/10 border border-[#6fa3a0]/30 text-teal-400 p-4 rounded-xl text-sm max-w-3xl mx-auto">
        {error}
      </div>
    );
  }

  if (!gym) {
    return <div className="text-center py-20 text-[#455250]">No gym profile found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-20 h-20 bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
          {gym.logo ? (
            <img src={gym.logo} alt={gym.name} className="w-full h-full object-cover" />
          ) : (
            <Building2 className="text-[#555]" size={32} />
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#202828]">{gym.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[#164A4A] font-medium">{gym.gymType || 'Fitness Facility'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#555]"></span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
              gym.status === 'ACTIVE' ? 'bg-[#164A4A]/10 text-[#164A4A]' :
              gym.status === 'PENDING' ? 'bg-orange-500/10 text-orange-500' :
              'bg-[#6fa3a0]/10 text-[#6fa3a0]'
            }`}>
              {gym.status === 'ACTIVE' ? 'Active' : gym.status === 'PENDING' ? 'Pending Approval' : 'Suspended'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Contact Info */}
        <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-[#D3DFDA] pb-3">
            <Phone className="text-[#164A4A]" size={20} />
            Contact Details
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="text-[#455250] mt-1 shrink-0" size={16} />
              <div>
                <p className="text-sm text-[#455250]">Official Email</p>
                <p className="text-[#202828] font-medium">{gym.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="text-[#455250] mt-1 shrink-0" size={16} />
              <div>
                <p className="text-sm text-[#455250]">Phone Number</p>
                <p className="text-[#202828] font-medium">{gym.phone}</p>
              </div>
            </div>
            {gym.website && (
              <div className="flex items-start gap-3">
                <Globe className="text-[#455250] mt-1 shrink-0" size={16} />
                <div>
                  <p className="text-sm text-[#455250]">Website</p>
                  <a href={gym.website} target="_blank" rel="noopener noreferrer" className="text-[#164A4A] hover:underline font-medium">
                    {gym.website}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Location Info */}
        <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-[#D3DFDA] pb-3">
            <MapPin className="text-[#164A4A]" size={20} />
            Location
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="text-[#455250] mt-1 shrink-0" size={16} />
              <div>
                <p className="text-sm text-[#455250]">Full Address</p>
                <p className="text-[#202828] font-medium mt-1">
                  {gym.location?.address}<br />
                  {gym.location?.city}, {gym.location?.state} {gym.location?.pinCode}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Details */}
        <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6 md:col-span-2">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-[#D3DFDA] pb-3">
            <CreditCard className="text-[#164A4A]" size={20} />
            Platform Subscription
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-[#455250]">Plan Tier</p>
              <p className="text-[#202828] font-bold text-lg mt-1">{gym.subscription?.plan || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-[#455250]">Status</p>
              <p className="text-[#EF4444] font-bold text-lg mt-1">{gym.subscription?.status || 'Active'}</p>
            </div>
            <div>
              <p className="text-sm text-[#455250]">Start Date</p>
              <p className="text-[#202828] font-medium mt-1">
                {gym.subscription?.startDate ? new Date(gym.subscription.startDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-[#455250]">End Date</p>
              <p className="text-[#202828] font-medium mt-1">
                {gym.subscription?.endDate ? new Date(gym.subscription.endDate).toLocaleDateString() : 'Continuous'}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {gym.description && (
          <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6 md:col-span-2">
            <h2 className="text-xl font-bold mb-4 border-b border-[#D3DFDA] pb-3">About the Gym</h2>
            <p className="text-[#455250] leading-relaxed">{gym.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGymProfile;
