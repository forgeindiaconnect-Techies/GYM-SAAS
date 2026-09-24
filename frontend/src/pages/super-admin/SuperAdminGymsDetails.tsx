import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Building2, ArrowLeft, MapPin, Phone, Users, Calendar, Settings, CreditCard, Dumbbell } from 'lucide-react';
import api from '../../utils/api';

const SuperAdminGymsDetails = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  
  const [gym, setGym] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGym = async () => {
      try {
        const res = await api.get(`/gyms/${id}`);
        setGym(res.data.gym);
      } catch (err) {
        setError('Failed to load gym details');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchGym();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-[#164A4A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !gym) {
    return (
      <div className="bg-[#6fa3a0]/10 text-[#6fa3a0] p-4 rounded-xl text-center">
        {error || 'Gym not found'}
        <div className="mt-4">
          <Link to="/super-admin/gyms/all" className="text-[#164A4A] hover:underline">Return to All Gyms</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4 mb-8 border-b border-[#D3DFDA] pb-6">
        <Link to="/super-admin/gyms/all" className="p-2 bg-[#FFFFFF] hover:bg-[#E8E5DA] rounded-xl transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            {gym.logo ? (
              <img src={gym.logo} alt={gym.name} className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <Building2 className="text-[#6fa3a0]" size={32} />
            )}
            {gym.name}
          </h1>
          <p className="text-[#455250] mt-2 font-mono text-sm">{gym.gymType} • ID: {gym._id}</p>
        </div>
        <div className="ml-auto">
          <Link to={`/super-admin/gyms/edit/${gym._id}`} className="px-4 py-2 bg-[#FFFFFF] hover:bg-[#E8E5DA] border border-[#D3DFDA] rounded-xl transition-colors flex items-center gap-2">
            <Settings size={16} /> Edit Gym
          </Link>
        </div>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#D3DFDA]">
          <p className="text-xs text-[#455250] mb-1 flex items-center gap-1"><Users size={14} /> Member Capacity</p>
          <p className="text-xl font-bold text-[#202828]">{gym.memberCapacity || 'Unlimited'}</p>
        </div>
        <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#D3DFDA]">
          <p className="text-xs text-[#455250] mb-1 flex items-center gap-1"><Users size={14} /> Trainer Capacity</p>
          <p className="text-xl font-bold text-[#202828]">{gym.trainerCapacity || 'Unlimited'}</p>
        </div>
        <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#D3DFDA]">
          <p className="text-xs text-[#455250] mb-1 flex items-center gap-1"><Calendar size={14} /> Joined</p>
          <p className="text-xl font-bold text-[#202828]">{new Date(gym.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#D3DFDA]">
          <p className="text-xs text-[#455250] mb-1 flex items-center gap-1">Status</p>
          <p className={`text-xl font-bold ${gym.status === 'ACTIVE' ? 'text-green-500' : gym.status === 'PENDING' ? 'text-orange-500' : 'text-[#6fa3a0]'}`}>
            {gym.status}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D3DFDA]">
            <h3 className="text-lg font-bold mb-4 border-b border-[#D3DFDA] pb-3 text-[#164A4A] flex items-center gap-2">
              <Dumbbell size={18} /> Training & Services
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-[#455250] mb-1 font-medium">Training Mode:</p>
                <span className="px-3 py-1 bg-[#164A4A]/10 text-[#164A4A] rounded-lg font-bold capitalize">
                  {gym.trainingMode || 'Offline'}
                </span>
              </div>
              <div>
                <p className="text-[#455250] mb-2 font-medium">Services Offered:</p>
                {gym.services && gym.services.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {gym.services.map((service: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-[#F2EFE8] border border-[#CBD5E1] rounded-lg text-xs text-[#202828]">
                        {service}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#455250] text-xs">No services specified.</p>
                )}
              </div>
            </div>
          </div>
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D3DFDA]">
            <h3 className="text-lg font-bold mb-4 border-b border-[#D3DFDA] pb-3 text-[#164A4A] flex items-center gap-2">
              <MapPin size={18} /> Location & Contact
            </h3>
            <div className="space-y-3 text-sm">
              <p><span className="text-[#455250] inline-block w-24">Address:</span> {gym.location?.address}, {gym.location?.city}, {gym.location?.state} {gym.location?.pinCode}</p>
              <p><span className="text-[#455250] inline-block w-24">Email:</span> {gym.email}</p>
              <p><span className="text-[#455250] inline-block w-24">Phone:</span> {gym.phone}</p>
              {gym.website && <p><span className="text-[#455250] inline-block w-24">Website:</span> <a href={gym.website} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{gym.website}</a></p>}
            </div>
          </div>

          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D3DFDA]">
            <h3 className="text-lg font-bold mb-4 border-b border-[#D3DFDA] pb-3 text-[#164A4A] flex items-center gap-2">
              <Phone size={18} /> Owner Information
            </h3>
            <div className="space-y-3 text-sm">
              {gym.ownerId ? (
                <>
                  <p><span className="text-[#455250] inline-block w-24">Name:</span> {gym.ownerId.firstName} {gym.ownerId.lastName}</p>
                  <p><span className="text-[#455250] inline-block w-24">Email:</span> {gym.ownerId.email}</p>
                  <p><span className="text-[#455250] inline-block w-24">Phone:</span> {gym.ownerId.mobile}</p>
                </>
              ) : (
                <p className="text-[#455250]">No owner linked.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D3DFDA]">
            <h3 className="text-lg font-bold mb-4 border-b border-[#D3DFDA] pb-3 text-[#164A4A] flex items-center gap-2">
              <CreditCard size={18} /> Subscription
            </h3>
            <div className="space-y-3 text-sm">
              <p><span className="text-[#455250] inline-block w-24">Plan:</span> <span className="font-bold text-[#202828]">{gym.subscription?.plan || 'N/A'}</span></p>
              <p><span className="text-[#455250] inline-block w-24">Status:</span> {gym.subscription?.status}</p>
              <p><span className="text-[#455250] inline-block w-24">Start Date:</span> {gym.subscription?.startDate ? new Date(gym.subscription.startDate).toLocaleDateString() : 'N/A'}</p>
              <p><span className="text-[#455250] inline-block w-24">End Date:</span> {gym.subscription?.endDate ? new Date(gym.subscription.endDate).toLocaleDateString() : 'Ongoing'}</p>
              <p><span className="text-[#455250] inline-block w-24">Payment:</span> <span className="text-[#164A4A] font-medium">{gym.subscription?.paymentMethod || 'Manual'}</span></p>
            </div>
          </div>

          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D3DFDA]">
            <h3 className="text-lg font-bold mb-4 border-b border-[#D3DFDA] pb-3 text-[#164A4A] flex items-center gap-2">
              <Dumbbell size={18} /> Equipment & Facilities
            </h3>
            {gym.equipment && gym.equipment.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {gym.equipment.map((eq: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 bg-[#FFFFFF] border border-[#D3DFDA] rounded-lg text-sm text-[#455250]">
                    {eq}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[#455250] text-sm">No equipment listed.</p>
            )}
            
            {gym.description && (
              <div className="mt-6 pt-4 border-t border-[#D3DFDA]">
                <h4 className="text-sm font-semibold mb-2">Description</h4>
                <p className="text-[#455250] text-sm leading-relaxed">{gym.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    
    </div>
  );
};

export default SuperAdminGymsDetails;
