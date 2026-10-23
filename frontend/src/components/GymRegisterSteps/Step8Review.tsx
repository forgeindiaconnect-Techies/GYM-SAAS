import React from 'react';
import { CheckCircle2, User, MapPin, Wind, CheckSquare, CreditCard, Edit2, Image as ImageIcon } from 'lucide-react';

interface StepProps {
  form: any;
  setStep: (step: number) => void;
}

const Step8Review: React.FC<StepProps> = ({ form, setStep }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#6366F1]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#6366F1]">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-bold text-[#11111F] mb-2">Review Your Details</h2>
        <p className="text-[#A1A1AA] max-w-md mx-auto">Please review all the information below. Once submitted, your gym will be pending admin approval.</p>
      </div>

      <div className="space-y-4">
        {/* Basic Info */}
        <div className="bg-[#FFFFFF] border border-[#292940] rounded-xl p-5 relative group">
          <button onClick={() => setStep(0)} className="absolute top-4 right-4 text-[#6366F1] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm bg-[#6366F1]/10 px-2 py-1 rounded-md hover:bg-[#6366F1]/20">
            <Edit2 size={14} /> Edit
          </button>
          <h3 className="text-sm font-bold text-[#11111F] mb-4 flex items-center gap-2">
            <User size={16} className="text-[#6366F1]" /> Owner & Gym Info
          </h3>
          <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div><span className="text-[#A1A1AA] block mb-1">Owner Name</span><span className="text-[#11111F] font-medium">{form.firstName} {form.lastName}</span></div>
            <div><span className="text-[#A1A1AA] block mb-1">Owner Email</span><span className="text-[#11111F] font-medium">{form.email}</span></div>
            <div><span className="text-[#A1A1AA] block mb-1">Owner Mobile</span><span className="text-[#11111F] font-medium">{form.mobile}</span></div>
            <div><span className="text-[#A1A1AA] block mb-1">Gym Name</span><span className="text-[#11111F] font-medium">{form.gymName}</span></div>
            <div><span className="text-[#A1A1AA] block mb-1">Gym Email</span><span className="text-[#11111F] font-medium">{form.gymEmail}</span></div>
            <div><span className="text-[#A1A1AA] block mb-1">Gym Phone</span><span className="text-[#11111F] font-medium">{form.gymContactNumber}</span></div>
            <div><span className="text-[#A1A1AA] block mb-1">Gym Type</span><span className="text-[#11111F] font-medium">{form.gymType}</span></div>
            <div><span className="text-[#A1A1AA] block mb-1">Approx Members</span><span className="text-[#11111F] font-medium">{form.approxMembers}</span></div>
            <div><span className="text-[#A1A1AA] block mb-1">Trainers</span><span className="text-[#11111F] font-medium">{form.numTrainers}</span></div>
            <div><span className="text-[#A1A1AA] block mb-1">Operating Hours</span><span className="text-[#11111F] font-medium">{form.operatingHours}</span></div>
            {form.description && (
              <div className="sm:col-span-2">
                <span className="text-[#A1A1AA] block mb-1">Gym Description</span>
                <span className="text-[#11111F] font-medium leading-relaxed">{form.description}</span>
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="bg-[#FFFFFF] border border-[#292940] rounded-xl p-5 relative group">
          <button onClick={() => setStep(0)} className="absolute top-4 right-4 text-[#6366F1] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm bg-[#6366F1]/10 px-2 py-1 rounded-md hover:bg-[#6366F1]/20">
            <Edit2 size={14} /> Edit
          </button>
          <h3 className="text-sm font-bold text-[#11111F] mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-[#6366F1]" /> Location Details
          </h3>
          <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div className="sm:col-span-2"><span className="text-[#A1A1AA] block mb-1">Address</span><span className="text-[#11111F] font-medium">{form.address}</span></div>
            <div><span className="text-[#A1A1AA] block mb-1">City</span><span className="text-[#11111F] font-medium">{form.city}</span></div>
            <div><span className="text-[#A1A1AA] block mb-1">State & PIN</span><span className="text-[#11111F] font-medium">{form.state} - {form.pinCode}</span></div>
          </div>
        </div>

        {/* AC Details */}
        <div className="bg-[#FFFFFF] border border-[#292940] rounded-xl p-5 relative group">
          <button onClick={() => setStep(1)} className="absolute top-4 right-4 text-[#6366F1] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm bg-[#6366F1]/10 px-2 py-1 rounded-md hover:bg-[#6366F1]/20">
            <Edit2 size={14} /> Edit
          </button>
          <h3 className="text-sm font-bold text-[#11111F] mb-4 flex items-center gap-2">
            <Wind size={16} className="text-[#6366F1]" /> AC Details
          </h3>
          <div className="text-sm">
            <p className="mb-2"><span className="text-[#A1A1AA] mr-2">Type:</span><span className="text-[#11111F] font-medium">{form.acDetails?.type || 'Not Specified'}</span></p>
            {form.acDetails?.areas?.length > 0 && (
              <p><span className="text-[#A1A1AA] mr-2">Areas:</span><span className="text-[#11111F] font-medium">{form.acDetails.areas.join(', ')}</span></p>
            )}
          </div>
        </div>

        {/* Facilities */}
        <div className="bg-[#FFFFFF] border border-[#292940] rounded-xl p-5 relative group">
          <button onClick={() => setStep(2)} className="absolute top-4 right-4 text-[#6366F1] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm bg-[#6366F1]/10 px-2 py-1 rounded-md hover:bg-[#6366F1]/20">
            <Edit2 size={14} /> Edit
          </button>
          <h3 className="text-sm font-bold text-[#11111F] mb-4 flex items-center gap-2">
            <CheckSquare size={16} className="text-[#6366F1]" /> Facilities
          </h3>
          {form.facilities && form.facilities.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {form.facilities.map((f: string, i: number) => (
                <span key={i} className="bg-[#FFFFFF] border border-[#292940] text-[#11111F] text-xs px-2.5 py-1 rounded-md">{f}</span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#A1A1AA]">No facilities selected.</p>
          )}
        </div>

        {/* Gym Images */}
        <div className="bg-[#FFFFFF] border border-[#292940] rounded-xl p-5 relative group">
          <button onClick={() => setStep(3)} className="absolute top-4 right-4 text-[#6366F1] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm bg-[#6366F1]/10 px-2 py-1 rounded-md hover:bg-[#6366F1]/20">
            <Edit2 size={14} /> Edit
          </button>
          <h3 className="text-sm font-bold text-[#11111F] mb-4 flex items-center gap-2">
            <ImageIcon size={16} className="text-[#6366F1]" /> Gym Images
          </h3>
          {form.images && form.images.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {form.images.map((url: string, i: number) => (
                <img key={i} src={url} alt="Gym" className="w-full h-20 object-cover rounded-lg border border-[#292940]" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#A1A1AA]">No images added.</p>
          )}
        </div>

        {/* Pricing */}
        <div className="bg-[#FFFFFF] border border-[#292940] rounded-xl p-5 relative group">
          <button onClick={() => setStep(4)} className="absolute top-4 right-4 text-[#6366F1] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm bg-[#6366F1]/10 px-2 py-1 rounded-md hover:bg-[#6366F1]/20">
            <Edit2 size={14} /> Edit
          </button>
          <h3 className="text-sm font-bold text-[#11111F] mb-4 flex items-center gap-2">
            <CreditCard size={16} className="text-[#6366F1]" /> Membership Plans
          </h3>
          {form.subscriptionPlans && form.subscriptionPlans.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {form.subscriptionPlans.map((plan: any, i: number) => (
                <div key={i} className="bg-[#FFFFFF] p-3 rounded-lg border border-[#292940]">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-bold text-[#11111F]">{plan.name}</p>
                    <p className="text-[#C43D35] font-bold text-sm">₹{plan.price}</p>
                  </div>
                  <p className="text-xs text-[#A1A1AA]">Duration: {plan.duration}</p>
                  {plan.features && <p className="text-xs text-[#A1A1AA] mt-1 truncate">Features: {plan.features}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#A1A1AA]">No plans added.</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default Step8Review;
