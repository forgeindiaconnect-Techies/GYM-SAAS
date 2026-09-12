import { useState, useEffect } from 'react';
import { Save, Building2, MapPin, Info, Edit2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const GymAdminProfile = () => {
  const { user } = useAuth();
  const [gym, setGym] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    gymName: '',
    type: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    description: '',
  });

  useEffect(() => {
    if (user?.gymId) {
      api.get(`/gyms/${user.gymId}`)
        .then(res => {
          const fetchedGym = res.data.gym;
          setGym(fetchedGym);
          setFormData({
            gymName: fetchedGym.name || '',
            type: fetchedGym.gymType || '',
            email: fetchedGym.email || '',
            phone: fetchedGym.phone || '',
            address: fetchedGym.location?.address || '',
            city: fetchedGym.location?.city || '',
            state: fetchedGym.location?.state || '',
            description: fetchedGym.description || '',
          });
        })
        .catch(err => console.error('Failed to fetch gym', err));
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await api.put(`/gyms/${user?.gymId}`, {
        name: formData.gymName,
        gymType: formData.type,
        email: formData.email,
        phone: formData.phone,
        description: formData.description,
        location: {
          ...gym?.location,
          address: formData.address,
          city: formData.city,
          state: formData.state,
        }
      });
      alert("Gym profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      alert("Failed to update profile.");
    }
  };

  const inputCls = `w-full rounded-xl px-4 py-3 text-[#1E293B] outline-none transition-colors ${
    isEditing 
      ? 'bg-[#FFFFFF] border border-[#CCFBF1] focus:border-[#16A34A]' 
      : 'bg-[#F8FAFC] border border-transparent cursor-not-allowed text-opacity-80'
  }`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Gym Profile</h1>
        <p className="text-[#475569] mt-1">Manage your facility's public information and details.</p>
      </div>

      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6 md:p-8 flex items-center space-x-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#16A34A]/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="w-24 h-24 bg-[#FFFFFF] border-2 border-[#16A34A] rounded-2xl flex items-center justify-center text-[#16A34A] shrink-0 z-10 overflow-hidden">
          {gym?.logo ? <img src={gym.logo} alt="Logo" className="w-full h-full object-cover" /> : <Building2 size={40} />}
        </div>
        <div className="z-10">
          <h2 className="text-2xl font-bold text-[#1E293B]">{formData.gymName || 'Loading...'}</h2>
          <p className="text-[#16A34A] font-semibold flex items-center mt-1"><MapPin size={16} className="mr-1"/> {formData.city}, {formData.state}</p>
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6 md:p-8 space-y-8">
        
        {/* Basic Info */}
        <section>
          <div className="flex items-center space-x-2 text-[#1E293B] mb-4 border-b border-[#CCFBF1] pb-2">
            <Info size={20} className="text-[#16A34A]"/>
            <h3 className="text-xl font-bold">Basic Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-[#475569] mb-2">Gym Name</label>
              <input disabled={!isEditing} value={formData.gymName} onChange={e => setFormData({...formData, gymName: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm text-[#475569] mb-2">Facility Type</label>
              <input disabled={!isEditing} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm text-[#475569] mb-2">Contact Email</label>
              <input disabled={!isEditing} type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm text-[#475569] mb-2">Contact Phone</label>
              <input disabled={!isEditing} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputCls} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-[#475569] mb-2">About the Gym</label>
              <textarea disabled={!isEditing} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className={`${inputCls} h-24 resize-none`} />
            </div>
          </div>
        </section>

        {/* Location Details */}
        <section>
          <div className="flex items-center space-x-2 text-[#1E293B] mb-4 border-b border-[#CCFBF1] pb-2">
            <MapPin size={20} className="text-[#16A34A]"/>
            <h3 className="text-xl font-bold">Location</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm text-[#475569] mb-2">Street Address</label>
              <input disabled={!isEditing} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm text-[#475569] mb-2">City</label>
              <input disabled={!isEditing} value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm text-[#475569] mb-2">State / Province</label>
              <input disabled={!isEditing} value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className={inputCls} />
            </div>
          </div>
        </section>

        {/* Operating Details */}
        <section>
          <div className="flex items-center space-x-2 text-[#1E293B] mb-4 border-b border-[#CCFBF1] pb-2">
            <Info size={20} className="text-[#16A34A]"/>
            <h3 className="text-xl font-bold">Operating Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-[#475569] mb-2">Established Year</label>
              <div className="w-full rounded-xl px-4 py-3 bg-[#F8FAFC] text-[#1E293B] text-opacity-80">
                {gym?.establishedYear || 'N/A'}
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#475569] mb-2">Training Mode</label>
              <div className="w-full rounded-xl px-4 py-3 bg-[#F8FAFC] text-[#1E293B] text-opacity-80 capitalize">
                {gym?.trainingMode || 'N/A'}
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#475569] mb-2">Approx Members</label>
              <div className="w-full rounded-xl px-4 py-3 bg-[#F8FAFC] text-[#1E293B] text-opacity-80">
                {gym?.memberCapacity || 'N/A'}
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#475569] mb-2">Total Trainers</label>
              <div className="w-full rounded-xl px-4 py-3 bg-[#F8FAFC] text-[#1E293B] text-opacity-80">
                {gym?.trainerCapacity || 'N/A'}
              </div>
            </div>
          </div>
        </section>

        {/* Additional Features */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center space-x-2 text-[#1E293B] mb-4 border-b border-[#CCFBF1] pb-2">
              <h3 className="text-xl font-bold">Services</h3>
            </div>
            {gym?.services && gym.services.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {gym.services.map((service: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-[#16A34A]/10 text-[#16A34A] font-semibold text-sm rounded-lg">
                    {service}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#475569]">No services listed</p>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2 text-[#1E293B] mb-4 border-b border-[#CCFBF1] pb-2">
              <h3 className="text-xl font-bold">Facilities</h3>
            </div>
            {gym?.facilities && gym.facilities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {gym.facilities.map((fac: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-[#0F172A]/10 text-[#0F172A] font-semibold text-sm rounded-lg">
                    {fac}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#475569]">No facilities listed</p>
            )}
          </div>
        </section>

        {/* AC Details */}
        {gym?.acDetails && gym.acDetails.type && (
          <section>
            <div className="flex items-center space-x-2 text-[#1E293B] mb-4 border-b border-[#CCFBF1] pb-2">
              <h3 className="text-xl font-bold">AC Details</h3>
            </div>
            <div className="space-y-4">
              <div className="inline-block px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-xl">
                {gym.acDetails.type}
              </div>
              {gym.acDetails.areas && gym.acDetails.areas.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {gym.acDetails.areas.map((area: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] font-medium text-sm rounded-lg">
                      {area}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <div className="pt-4 flex justify-end">
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="px-6 py-3 bg-[#1E293B] text-white font-bold rounded-xl hover:bg-[#0F172A] transition-colors flex items-center gap-2 shadow-lg">
              <Edit2 size={18} /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-4">
              <button onClick={() => setIsEditing(false)} className="px-6 py-3 bg-[#F1F5F9] text-[#475569] font-bold rounded-xl hover:bg-[#E2E8F0] transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="px-6 py-3 bg-[#16A34A] text-[#1E293B] font-bold rounded-xl hover:bg-[#15803D] transition-colors flex items-center gap-2 shadow-lg shadow-[#16A34A]/20">
                <Save size={18} /> Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GymAdminProfile;
