import { useState } from 'react';
import { Save, Building2, MapPin, Clock, Info } from 'lucide-react';

const GymAdminProfile = () => {
  const [formData, setFormData] = useState({
    gymName: 'Iron Palace Fitness',
    type: 'Commercial Gym',
    email: 'contact@ironpalace.com',
    phone: '9876543210',
    address: '123 Muscle Street, Fitness District',
    city: 'Los Angeles',
    state: 'CA',
    description: 'A premium fitness facility dedicated to weight training, crossfit, and overall wellness.',
  });

  const inputCls = "w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl px-4 py-3 text-[#1E293B] outline-none focus:border-[#16A34A] transition-colors";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Gym Profile</h1>
        <p className="text-[#475569] mt-1">Manage your facility's public information and details.</p>
      </div>

      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6 md:p-8 flex items-center space-x-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#16A34A]/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="w-24 h-24 bg-[#FFFFFF] border-2 border-[#16A34A] rounded-2xl flex items-center justify-center text-[#16A34A] shrink-0 z-10">
          <Building2 size={40} />
        </div>
        <div className="z-10">
          <h2 className="text-2xl font-bold text-[#1E293B]">{formData.gymName}</h2>
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
              <input value={formData.gymName} onChange={e => setFormData({...formData, gymName: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm text-[#475569] mb-2">Facility Type</label>
              <input value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm text-[#475569] mb-2">Contact Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm text-[#475569] mb-2">Contact Phone</label>
              <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputCls} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-[#475569] mb-2">About the Gym</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className={`${inputCls} h-24 resize-none`} />
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
              <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm text-[#475569] mb-2">City</label>
              <input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm text-[#475569] mb-2">State / Province</label>
              <input value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className={inputCls} />
            </div>
          </div>
        </section>

        <div className="pt-4 flex justify-end">
          <button className="px-6 py-3 bg-[#16A34A] text-[#1E293B] font-bold rounded-xl hover:bg-[#15803D] transition-colors flex items-center gap-2 shadow-lg shadow-[#16A34A]/20">
            <Save size={18} /> Save Gym Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default GymAdminProfile;
