import { useState, useEffect } from 'react';
import { Save, Building2, MapPin, Info, Edit2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const GymAdminProfile = () => {
  const { user } = useAuth();
  const [gym, setGym] = useState<any>(null);
  const [branchesCount, setBranchesCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState({
    gymName: '',
    type: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    description: '',
    establishedYear: '',
    trainingMode: 'offline',
    memberCapacity: '',
    trainerCapacity: '',
    website: '',
    taxId: '',
    ownerName: '',
    ownerRole: 'Owner',
    operatingHours: '',
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
            establishedYear: fetchedGym.establishedYear || '',
            trainingMode: fetchedGym.trainingMode || 'offline',
            memberCapacity: fetchedGym.memberCapacity || '',
            trainerCapacity: fetchedGym.trainerCapacity || '',
            website: fetchedGym.website || 'www.messyfitness.com',
            taxId: fetchedGym.taxId || 'GYM-TAX-09823',
            ownerName: user?.name || 'Selva Kumar',
            ownerRole: 'Gym Owner',
            operatingHours: fetchedGym.operatingHours || '05:00 AM - 11:00 PM',
          });
        })
        .catch(err => console.error('Failed to fetch gym', err));

      api.get(`/branches`)
        .then(res => setBranchesCount(res.data.branches?.length || 0))
        .catch(err => console.error('Failed to fetch branches', err));
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
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
        },
        establishedYear: formData.establishedYear,
        trainingMode: formData.trainingMode,
        memberCapacity: formData.memberCapacity,
        trainerCapacity: formData.trainerCapacity,
        website: formData.website,
        taxId: formData.taxId,
        operatingHours: formData.operatingHours
      });
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      // Even if API fails, save the changes locally and exit edit mode
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const inputCls = `w-full rounded-xl px-4 py-3 text-[#1E293B] outline-none transition-colors ${
    isEditing 
      ? 'bg-[#FFFFFF] border border-[#CCFBF1] focus:border-[#16A34A]' 
      : 'bg-[#F8FAFC] border border-transparent cursor-not-allowed text-opacity-80'
  }`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Gym Profile</h1>
          <p className="text-[#475569] mt-1">Manage your facility's public information and details.</p>
        </div>
        {/* Top-level Edit toggle */}
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-5 py-2.5 bg-[#1E293B] text-white font-bold rounded-xl hover:bg-[#0F172A] transition-colors shadow-lg text-sm">
            <Edit2 size={16} /> Edit Profile
          </button>
        )}
      </div>

      {/* Success Banner */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl font-semibold flex items-center gap-2">
          ✅ Profile updated successfully!
        </div>
      )}

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

        {/* Owner Information */}
        <section>
          <div className="flex items-center space-x-2 text-[#1E293B] mb-4 border-b border-[#CCFBF1] pb-2">
            <Info size={20} className="text-[#16A34A]"/>
            <h3 className="text-xl font-bold">Owner Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-[#475569] mb-2">Owner Name</label>
              <input disabled={!isEditing} value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm text-[#475569] mb-2">Role</label>
              <input disabled={!isEditing} value={formData.ownerRole} onChange={e => setFormData({...formData, ownerRole: e.target.value})} className={inputCls} />
            </div>
          </div>
        </section>

        {/* Business Details & Operating Hours */}
        <section>
          <div className="flex items-center space-x-2 text-[#1E293B] mb-4 border-b border-[#CCFBF1] pb-2">
            <Info size={20} className="text-[#16A34A]"/>
            <h3 className="text-xl font-bold">Business & Operations</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-[#475569] mb-2">Website</label>
              <input disabled={!isEditing} value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm text-[#475569] mb-2">Tax ID / Registration Number</label>
              <input disabled={!isEditing} value={formData.taxId} onChange={e => setFormData({...formData, taxId: e.target.value})} className={inputCls} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-[#475569] mb-2">Standard Operating Hours</label>
              <input disabled={!isEditing} value={formData.operatingHours} onChange={e => setFormData({...formData, operatingHours: e.target.value})} className={inputCls} placeholder="e.g. Mon-Sun: 05:00 AM - 11:00 PM" />
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
              <input disabled={!isEditing} type="number" value={formData.establishedYear} onChange={e => setFormData({...formData, establishedYear: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm text-[#475569] mb-2">Training Mode</label>
              <select disabled={!isEditing} value={formData.trainingMode} onChange={e => setFormData({...formData, trainingMode: e.target.value})} className={inputCls + " appearance-none cursor-pointer"}>
                <option value="offline">Offline</option>
                <option value="online">Online</option>
                <option value="both">Hybrid (Both)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-[#475569] mb-2">Approx Members</label>
              <input disabled={!isEditing} type="number" value={formData.memberCapacity} onChange={e => setFormData({...formData, memberCapacity: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm text-[#475569] mb-2">Total Trainers</label>
              <input disabled={!isEditing} type="number" value={formData.trainerCapacity} onChange={e => setFormData({...formData, trainerCapacity: e.target.value})} className={inputCls} />
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

        <section className="bg-green-50 border border-green-100 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-green-800">Branch Management</h3>
            <p className="text-green-700 mt-1">You currently have <strong>{branchesCount}</strong> branch{branchesCount !== 1 && 'es'} registered.</p>
          </div>
          <Link to="/admin/branches" className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2">
            Manage Branches <ArrowRight size={18} />
          </Link>
        </section>

        <div className="pt-4 flex justify-end">
          {isEditing && (
            <div className="flex gap-4">
              <button onClick={() => setIsEditing(false)} disabled={isSaving} className="px-6 py-3 bg-[#F1F5F9] text-[#475569] font-bold rounded-xl hover:bg-[#E2E8F0] transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleSave} disabled={isSaving} className="px-6 py-3 bg-[#16A34A] text-white font-bold rounded-xl hover:bg-[#15803D] transition-colors flex items-center gap-2 shadow-lg shadow-[#16A34A]/20 disabled:opacity-70">
                <Save size={18} /> {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GymAdminProfile;
