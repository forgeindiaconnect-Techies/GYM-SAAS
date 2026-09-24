import React from 'react';
import { CheckCircle2, User, Building2, MapPin, Dumbbell, Wind, CheckSquare, CreditCard, Edit2, Image as ImageIcon } from 'lucide-react';

interface StepProps {
  form: any;
  setStep: (step: number) => void;
}

const Step8Review: React.FC<StepProps> = ({ form, setStep }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#164A4A]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#164A4A]">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-bold text-[#202828] mb-2">Review Your Details</h2>
        <p className="text-[#455250] max-w-md mx-auto">Please review all the information below. Once submitted, your gym will be pending admin approval.</p>
      </div>

      <div className="space-y-4">
        {/* Basic Info */}
        <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl p-5 relative group">
          <button onClick={() => setStep(0)} className="absolute top-4 right-4 text-[#164A4A] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm bg-[#164A4A]/10 px-2 py-1 rounded-md hover:bg-[#164A4A]/20">
            <Edit2 size={14} /> Edit
          </button>
          <h3 className="text-sm font-bold text-[#202828] mb-4 flex items-center gap-2">
            <User size={16} className="text-[#164A4A]" /> Owner & Gym Info
          </h3>
          <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div><span className="text-[#455250] block mb-1">Owner Name</span><span className="text-[#202828] font-medium">{form.firstName} {form.lastName}</span></div>
            <div><span className="text-[#455250] block mb-1">Owner Email</span><span className="text-[#202828] font-medium">{form.email}</span></div>
            <div><span className="text-[#455250] block mb-1">Owner Mobile</span><span className="text-[#202828] font-medium">{form.mobile}</span></div>
            <div><span className="text-[#455250] block mb-1">Gym Name</span><span className="text-[#202828] font-medium">{form.gymName}</span></div>
            <div><span className="text-[#455250] block mb-1">Gym Email</span><span className="text-[#202828] font-medium">{form.gymEmail}</span></div>
            <div><span className="text-[#455250] block mb-1">Gym Phone</span><span className="text-[#202828] font-medium">{form.gymContactNumber}</span></div>
            <div><span className="text-[#455250] block mb-1">Gym Type</span><span className="text-[#202828] font-medium">{form.gymType}</span></div>
            <div><span className="text-[#455250] block mb-1">Approx Members</span><span className="text-[#202828] font-medium">{form.approxMembers}</span></div>
            <div><span className="text-[#455250] block mb-1">Trainers</span><span className="text-[#202828] font-medium">{form.numTrainers}</span></div>
            <div><span className="text-[#455250] block mb-1">Operating Hours</span><span className="text-[#202828] font-medium">{form.operatingHours}</span></div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl p-5 relative group">
          <button onClick={() => setStep(0)} className="absolute top-4 right-4 text-[#164A4A] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm bg-[#164A4A]/10 px-2 py-1 rounded-md hover:bg-[#164A4A]/20">
            <Edit2 size={14} /> Edit
          </button>
          <h3 className="text-sm font-bold text-[#202828] mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-[#164A4A]" /> Location Details
          </h3>
          <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div className="sm:col-span-2"><span className="text-[#455250] block mb-1">Address</span><span className="text-[#202828] font-medium">{form.address}</span></div>
            <div><span className="text-[#455250] block mb-1">City</span><span className="text-[#202828] font-medium">{form.city}</span></div>
            <div><span className="text-[#455250] block mb-1">State & PIN</span><span className="text-[#202828] font-medium">{form.state} - {form.pinCode}</span></div>
          </div>
        </div>

        {/* Equipment */}
        <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl p-5 relative group">
          <button onClick={() => setStep(1)} className="absolute top-4 right-4 text-[#164A4A] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm bg-[#164A4A]/10 px-2 py-1 rounded-md hover:bg-[#164A4A]/20">
            <Edit2 size={14} /> Edit
          </button>
          <h3 className="text-sm font-bold text-[#202828] mb-4 flex items-center gap-2">
            <Dumbbell size={16} className="text-[#164A4A]" /> Gym Equipment
          </h3>
          {form.equipment && form.equipment.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {form.equipment.map((eq: any, i: number) => (
                <div key={i} className="bg-[#FFFFFF] p-3 rounded-lg border border-[#D3DFDA]">
                  <p className="text-sm font-medium text-[#202828]">{eq.name} <span className="text-xs text-[#455250] font-normal">x{eq.quantity}</span></p>
                  <p className="text-xs text-[#455250] mt-1">{eq.category} • {eq.condition} • {eq.availability}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#455250]">No equipment added.</p>
          )}
        </div>

        {/* AC Details */}
        <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl p-5 relative group">
          <button onClick={() => setStep(2)} className="absolute top-4 right-4 text-[#164A4A] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm bg-[#164A4A]/10 px-2 py-1 rounded-md hover:bg-[#164A4A]/20">
            <Edit2 size={14} /> Edit
          </button>
          <h3 className="text-sm font-bold text-[#202828] mb-4 flex items-center gap-2">
            <Wind size={16} className="text-[#164A4A]" /> AC Details
          </h3>
          <div className="text-sm">
            <p className="mb-2"><span className="text-[#455250] mr-2">Type:</span><span className="text-[#202828] font-medium">{form.acDetails?.type || 'Not Specified'}</span></p>
            {form.acDetails?.areas?.length > 0 && (
              <p><span className="text-[#455250] mr-2">Areas:</span><span className="text-[#202828] font-medium">{form.acDetails.areas.join(', ')}</span></p>
            )}
          </div>
        </div>

        {/* Facilities */}
        <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl p-5 relative group">
          <button onClick={() => setStep(3)} className="absolute top-4 right-4 text-[#164A4A] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm bg-[#164A4A]/10 px-2 py-1 rounded-md hover:bg-[#164A4A]/20">
            <Edit2 size={14} /> Edit
          </button>
          <h3 className="text-sm font-bold text-[#202828] mb-4 flex items-center gap-2">
            <CheckSquare size={16} className="text-[#164A4A]" /> Facilities
          </h3>
          {form.facilities && form.facilities.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {form.facilities.map((f: string, i: number) => (
                <span key={i} className="bg-[#FFFFFF] border border-[#D3DFDA] text-[#202828] text-xs px-2.5 py-1 rounded-md">{f}</span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#455250]">No facilities selected.</p>
          )}
        </div>

        {/* Gym Images */}
        <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl p-5 relative group">
          <button onClick={() => setStep(4)} className="absolute top-4 right-4 text-[#164A4A] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm bg-[#164A4A]/10 px-2 py-1 rounded-md hover:bg-[#164A4A]/20">
            <Edit2 size={14} /> Edit
          </button>
          <h3 className="text-sm font-bold text-[#202828] mb-4 flex items-center gap-2">
            <ImageIcon size={16} className="text-[#164A4A]" /> Gym Images
          </h3>
          {form.images && form.images.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {form.images.map((url: string, i: number) => (
                <img key={i} src={url} alt="Gym" className="w-full h-20 object-cover rounded-lg border border-[#D3DFDA]" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#455250]">No images added.</p>
          )}
        </div>

        {/* Pricing */}
        <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl p-5 relative group">
          <button onClick={() => setStep(5)} className="absolute top-4 right-4 text-[#164A4A] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm bg-[#164A4A]/10 px-2 py-1 rounded-md hover:bg-[#164A4A]/20">
            <Edit2 size={14} /> Edit
          </button>
          <h3 className="text-sm font-bold text-[#202828] mb-4 flex items-center gap-2">
            <CreditCard size={16} className="text-[#164A4A]" /> Membership Plans
          </h3>
          {form.subscriptionPlans && form.subscriptionPlans.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {form.subscriptionPlans.map((plan: any, i: number) => (
                <div key={i} className="bg-[#FFFFFF] p-3 rounded-lg border border-[#D3DFDA]">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-bold text-[#202828]">{plan.name}</p>
                    <p className="text-[#EF4444] font-bold text-sm">₹{plan.price}</p>
                  </div>
                  <p className="text-xs text-[#455250]">Duration: {plan.duration}</p>
                  {plan.features && <p className="text-xs text-[#455250] mt-1 truncate">Features: {plan.features}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#455250]">No plans added.</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default Step8Review;
