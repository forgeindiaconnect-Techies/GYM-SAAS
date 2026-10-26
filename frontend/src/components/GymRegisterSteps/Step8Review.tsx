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
        <div className="w-16 h-16 bg-[#2DD4BF]/15 rounded-full flex items-center justify-center mx-auto mb-4 text-[#2DD4BF]">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-bold text-[#F5FAFA] mb-2">Review Your Details</h2>
        <p className="text-[#9AAEAE] max-w-md mx-auto text-sm">Please review all the information below. Once submitted, your gym will be pending admin approval.</p>
      </div>

      <div className="space-y-4">
        {/* Basic Info */}
        <div className="bg-[#101819] border border-[#2A3A3A] rounded-xl p-5 relative group shadow-xs">
          <button onClick={() => setStep(0)} className="absolute top-4 right-4 text-[#2DD4BF] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm bg-[#2DD4BF]/15 px-2.5 py-1 rounded-md hover:bg-[#2DD4BF]/25 font-bold cursor-pointer">
            <Edit2 size={14} /> Edit
          </button>
          <h3 className="text-sm font-bold text-[#F5FAFA] mb-4 flex items-center gap-2">
            <User size={16} className="text-[#2DD4BF]" /> Owner & Gym Info
          </h3>
          <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div><span className="text-[#9AAEAE] block mb-1 text-xs font-semibold">Owner Name</span><span className="text-[#F5FAFA] font-bold">{form.firstName} {form.lastName}</span></div>
            <div><span className="text-[#9AAEAE] block mb-1 text-xs font-semibold">Owner Email</span><span className="text-[#F5FAFA] font-bold">{form.email}</span></div>
            <div><span className="text-[#9AAEAE] block mb-1 text-xs font-semibold">Owner Mobile</span><span className="text-[#F5FAFA] font-bold">{form.mobile}</span></div>
            <div><span className="text-[#9AAEAE] block mb-1 text-xs font-semibold">Gym Name</span><span className="text-[#F5FAFA] font-bold">{form.gymName}</span></div>
            <div><span className="text-[#9AAEAE] block mb-1 text-xs font-semibold">Gym Email</span><span className="text-[#F5FAFA] font-bold">{form.gymEmail}</span></div>
            <div><span className="text-[#9AAEAE] block mb-1 text-xs font-semibold">Gym Phone</span><span className="text-[#F5FAFA] font-bold">{form.gymContactNumber}</span></div>
            <div><span className="text-[#9AAEAE] block mb-1 text-xs font-semibold">Gym Type</span><span className="text-[#F5FAFA] font-bold">{form.gymType}</span></div>
            <div><span className="text-[#9AAEAE] block mb-1 text-xs font-semibold">Approx Members</span><span className="text-[#F5FAFA] font-bold">{form.approxMembers}</span></div>
            <div><span className="text-[#9AAEAE] block mb-1 text-xs font-semibold">Trainers</span><span className="text-[#F5FAFA] font-bold">{form.numTrainers}</span></div>
            <div><span className="text-[#9AAEAE] block mb-1 text-xs font-semibold">Operating Hours</span><span className="text-[#F5FAFA] font-bold">{form.operatingHours}</span></div>
            {form.description && (
              <div className="sm:col-span-2">
                <span className="text-[#9AAEAE] block mb-1 text-xs font-semibold">Gym Description</span>
                <span className="text-[#F5FAFA] font-medium leading-relaxed">{form.description}</span>
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="bg-[#101819] border border-[#2A3A3A] rounded-xl p-5 relative group shadow-xs">
          <button onClick={() => setStep(0)} className="absolute top-4 right-4 text-[#2DD4BF] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm bg-[#2DD4BF]/15 px-2.5 py-1 rounded-md hover:bg-[#2DD4BF]/25 font-bold cursor-pointer">
            <Edit2 size={14} /> Edit
          </button>
          <h3 className="text-sm font-bold text-[#F5FAFA] mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-[#2DD4BF]" /> Location Details
          </h3>
          <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div className="sm:col-span-2"><span className="text-[#9AAEAE] block mb-1 text-xs font-semibold">Address</span><span className="text-[#F5FAFA] font-bold">{form.address}</span></div>
            <div><span className="text-[#9AAEAE] block mb-1 text-xs font-semibold">City</span><span className="text-[#F5FAFA] font-bold">{form.city}</span></div>
            <div><span className="text-[#9AAEAE] block mb-1 text-xs font-semibold">State & PIN</span><span className="text-[#F5FAFA] font-bold">{form.state} - {form.pinCode}</span></div>
          </div>
        </div>

        {/* AC Details */}
        <div className="bg-[#101819] border border-[#2A3A3A] rounded-xl p-5 relative group shadow-xs">
          <button onClick={() => setStep(1)} className="absolute top-4 right-4 text-[#2DD4BF] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm bg-[#2DD4BF]/15 px-2.5 py-1 rounded-md hover:bg-[#2DD4BF]/25 font-bold cursor-pointer">
            <Edit2 size={14} /> Edit
          </button>
          <h3 className="text-sm font-bold text-[#F5FAFA] mb-4 flex items-center gap-2">
            <Wind size={16} className="text-[#2DD4BF]" /> AC Details
          </h3>
          <div className="text-sm">
            <p className="mb-2"><span className="text-[#9AAEAE] mr-2 font-semibold">Type:</span><span className="text-[#F5FAFA] font-bold">{form.acDetails?.type || 'Not Specified'}</span></p>
            {form.acDetails?.areas?.length > 0 && (
              <p><span className="text-[#9AAEAE] mr-2 font-semibold">Areas:</span><span className="text-[#F5FAFA] font-bold">{form.acDetails.areas.join(', ')}</span></p>
            )}
          </div>
        </div>

        {/* Facilities */}
        <div className="bg-[#101819] border border-[#2A3A3A] rounded-xl p-5 relative group shadow-xs">
          <button onClick={() => setStep(2)} className="absolute top-4 right-4 text-[#2DD4BF] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm bg-[#2DD4BF]/15 px-2.5 py-1 rounded-md hover:bg-[#2DD4BF]/25 font-bold cursor-pointer">
            <Edit2 size={14} /> Edit
          </button>
          <h3 className="text-sm font-bold text-[#F5FAFA] mb-4 flex items-center gap-2">
            <CheckSquare size={16} className="text-[#2DD4BF]" /> Facilities
          </h3>
          {form.facilities && form.facilities.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {form.facilities.map((f: string, i: number) => (
                <span key={i} className="bg-[#141D1E] border border-[#2A3A3A] text-[#F5FAFA] text-xs font-semibold px-2.5 py-1 rounded-md shadow-xs">{f}</span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#9AAEAE]">No facilities selected.</p>
          )}
        </div>

        {/* Gym Images */}
        <div className="bg-[#101819] border border-[#2A3A3A] rounded-xl p-5 relative group shadow-xs">
          <button onClick={() => setStep(3)} className="absolute top-4 right-4 text-[#2DD4BF] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm bg-[#2DD4BF]/15 px-2.5 py-1 rounded-md hover:bg-[#2DD4BF]/25 font-bold cursor-pointer">
            <Edit2 size={14} /> Edit
          </button>
          <h3 className="text-sm font-bold text-[#F5FAFA] mb-4 flex items-center gap-2">
            <ImageIcon size={16} className="text-[#2DD4BF]" /> Gym Images
          </h3>
          {form.images && form.images.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {form.images.map((url: string, i: number) => (
                <img key={i} src={url} alt="Gym" className="w-full h-20 object-cover rounded-lg border border-[#2A3A3A]" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#9AAEAE]">No images added.</p>
          )}
        </div>

        {/* Pricing */}
        <div className="bg-[#101819] border border-[#2A3A3A] rounded-xl p-5 relative group shadow-xs">
          <button onClick={() => setStep(4)} className="absolute top-4 right-4 text-[#2DD4BF] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm bg-[#2DD4BF]/15 px-2.5 py-1 rounded-md hover:bg-[#2DD4BF]/25 font-bold cursor-pointer">
            <Edit2 size={14} /> Edit
          </button>
          <h3 className="text-sm font-bold text-[#F5FAFA] mb-4 flex items-center gap-2">
            <CreditCard size={16} className="text-[#2DD4BF]" /> Membership Plans
          </h3>
          {form.subscriptionPlans && form.subscriptionPlans.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {form.subscriptionPlans.map((plan: any, i: number) => (
                <div key={i} className="bg-[#141D1E] p-3 rounded-lg border border-[#2A3A3A] shadow-xs">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-bold text-[#F5FAFA]">{plan.name}</p>
                    <p className="text-[#2DD4BF] font-black text-sm">₹{plan.price}</p>
                  </div>
                  <p className="text-xs text-[#9AAEAE]">Duration: {plan.duration}</p>
                  {plan.features && <p className="text-xs text-[#9AAEAE] mt-1 truncate">Features: {plan.features}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#9AAEAE]">No plans added.</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default Step8Review;
