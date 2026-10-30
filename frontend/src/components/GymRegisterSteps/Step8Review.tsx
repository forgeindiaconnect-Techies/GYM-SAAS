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
        <div className="w-16 h-16 bg-[#FFF7ED] rounded-full flex items-center justify-center mx-auto mb-4 text-[#EA580C]">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-bold text-[#111827] mb-2">Review Your Details</h2>
        <p className="text-[#64748B] max-w-md mx-auto text-sm">Please review all the information below. Once submitted, your gym will be pending admin approval.</p>
      </div>

      <div className="space-y-4">
        {/* Basic Info */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 relative group shadow-xs">
          <button onClick={() => setStep(0)} className="absolute top-4 right-4 text-[#EA580C] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm bg-[#FFF7ED] px-2.5 py-1 rounded-md hover:bg-[#FFF7ED] font-bold cursor-pointer">
            <Edit2 size={14} /> Edit
          </button>
          <h3 className="text-sm font-bold text-[#111827] mb-4 flex items-center gap-2">
            <User size={16} className="text-[#EA580C]" /> Owner & Gym Info
          </h3>
          <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div><span className="text-[#64748B] block mb-1 text-xs font-semibold">Owner Name</span><span className="text-[#111827] font-bold">{form.firstName} {form.lastName}</span></div>
            <div><span className="text-[#64748B] block mb-1 text-xs font-semibold">Owner Email</span><span className="text-[#111827] font-bold">{form.email}</span></div>
            <div><span className="text-[#64748B] block mb-1 text-xs font-semibold">Owner Mobile</span><span className="text-[#111827] font-bold">{form.mobile}</span></div>
            <div><span className="text-[#64748B] block mb-1 text-xs font-semibold">Gym Name</span><span className="text-[#111827] font-bold">{form.gymName}</span></div>
            <div><span className="text-[#64748B] block mb-1 text-xs font-semibold">Gym Email</span><span className="text-[#111827] font-bold">{form.gymEmail}</span></div>
            <div><span className="text-[#64748B] block mb-1 text-xs font-semibold">Gym Phone</span><span className="text-[#111827] font-bold">{form.gymContactNumber}</span></div>
            <div><span className="text-[#64748B] block mb-1 text-xs font-semibold">Gym Type</span><span className="text-[#111827] font-bold">{form.gymType}</span></div>
            <div><span className="text-[#64748B] block mb-1 text-xs font-semibold">Approx Members</span><span className="text-[#111827] font-bold">{form.approxMembers}</span></div>
            <div><span className="text-[#64748B] block mb-1 text-xs font-semibold">Trainers</span><span className="text-[#111827] font-bold">{form.numTrainers}</span></div>
            <div><span className="text-[#64748B] block mb-1 text-xs font-semibold">Operating Hours</span><span className="text-[#111827] font-bold">{form.operatingHours}</span></div>
            {form.description && (
              <div className="sm:col-span-2">
                <span className="text-[#64748B] block mb-1 text-xs font-semibold">Gym Description</span>
                <span className="text-[#111827] font-medium leading-relaxed">{form.description}</span>
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 relative group shadow-xs">
          <button onClick={() => setStep(0)} className="absolute top-4 right-4 text-[#EA580C] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm bg-[#FFF7ED] px-2.5 py-1 rounded-md hover:bg-[#FFF7ED] font-bold cursor-pointer">
            <Edit2 size={14} /> Edit
          </button>
          <h3 className="text-sm font-bold text-[#111827] mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-[#EA580C]" /> Location Details
          </h3>
          <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div className="sm:col-span-2"><span className="text-[#64748B] block mb-1 text-xs font-semibold">Address</span><span className="text-[#111827] font-bold">{form.address}</span></div>
            <div><span className="text-[#64748B] block mb-1 text-xs font-semibold">City</span><span className="text-[#111827] font-bold">{form.city}</span></div>
            <div><span className="text-[#64748B] block mb-1 text-xs font-semibold">State & PIN</span><span className="text-[#111827] font-bold">{form.state} - {form.pinCode}</span></div>
          </div>
        </div>

        {/* AC Details */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 relative group shadow-xs">
          <button onClick={() => setStep(1)} className="absolute top-4 right-4 text-[#EA580C] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm bg-[#FFF7ED] px-2.5 py-1 rounded-md hover:bg-[#FFF7ED] font-bold cursor-pointer">
            <Edit2 size={14} /> Edit
          </button>
          <h3 className="text-sm font-bold text-[#111827] mb-4 flex items-center gap-2">
            <Wind size={16} className="text-[#EA580C]" /> AC Details
          </h3>
          <div className="text-sm">
            <p className="mb-2"><span className="text-[#64748B] mr-2 font-semibold">Type:</span><span className="text-[#111827] font-bold">{form.acDetails?.type || 'Not Specified'}</span></p>
            {form.acDetails?.areas?.length > 0 && (
              <p><span className="text-[#64748B] mr-2 font-semibold">Areas:</span><span className="text-[#111827] font-bold">{form.acDetails.areas.join(', ')}</span></p>
            )}
          </div>
        </div>

        {/* Facilities */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 relative group shadow-xs">
          <button onClick={() => setStep(2)} className="absolute top-4 right-4 text-[#EA580C] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm bg-[#FFF7ED] px-2.5 py-1 rounded-md hover:bg-[#FFF7ED] font-bold cursor-pointer">
            <Edit2 size={14} /> Edit
          </button>
          <h3 className="text-sm font-bold text-[#111827] mb-4 flex items-center gap-2">
            <CheckSquare size={16} className="text-[#EA580C]" /> Facilities
          </h3>
          {form.facilities && form.facilities.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {form.facilities.map((f: string, i: number) => (
                <span key={i} className="bg-[#FFFFFF] border border-[#E2E8F0] text-[#111827] text-xs font-semibold px-2.5 py-1 rounded-md shadow-xs">{f}</span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#64748B]">No facilities selected.</p>
          )}
        </div>

        {/* Gym Images */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 relative group shadow-xs">
          <button onClick={() => setStep(3)} className="absolute top-4 right-4 text-[#EA580C] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm bg-[#FFF7ED] px-2.5 py-1 rounded-md hover:bg-[#FFF7ED] font-bold cursor-pointer">
            <Edit2 size={14} /> Edit
          </button>
          <h3 className="text-sm font-bold text-[#111827] mb-4 flex items-center gap-2">
            <ImageIcon size={16} className="text-[#EA580C]" /> Gym Images
          </h3>
          {form.images && form.images.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {form.images.map((url: string, i: number) => (
                <img key={i} src={url} alt="Gym" className="w-full h-20 object-cover rounded-lg border border-[#E2E8F0]" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#64748B]">No images added.</p>
          )}
        </div>

        {/* Pricing */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 relative group shadow-xs">
          <button onClick={() => setStep(4)} className="absolute top-4 right-4 text-[#EA580C] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm bg-[#FFF7ED] px-2.5 py-1 rounded-md hover:bg-[#FFF7ED] font-bold cursor-pointer">
            <Edit2 size={14} /> Edit
          </button>
          <h3 className="text-sm font-bold text-[#111827] mb-4 flex items-center gap-2">
            <CreditCard size={16} className="text-[#EA580C]" /> Membership Plans
          </h3>
          {form.subscriptionPlans && form.subscriptionPlans.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {form.subscriptionPlans.map((plan: any, i: number) => (
                <div key={i} className="bg-[#FFFFFF] p-3 rounded-lg border border-[#E2E8F0] shadow-xs">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-bold text-[#111827]">{plan.name}</p>
                    <p className="text-[#EA580C] font-black text-sm">₹{plan.price}</p>
                  </div>
                  <p className="text-xs text-[#64748B]">Duration: {plan.duration}</p>
                  {plan.features && <p className="text-xs text-[#64748B] mt-1 truncate">Features: {plan.features}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#64748B]">No plans added.</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default Step8Review;
