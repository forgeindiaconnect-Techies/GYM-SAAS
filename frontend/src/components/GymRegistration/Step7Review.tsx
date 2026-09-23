import { CheckCircle2, AlertCircle } from 'lucide-react';

export const Step7Review = ({ data, setStep }: any) => {
  const SectionHeader = ({ title, step }: { title: string, step: number }) => (
    <div className="flex justify-between items-center border-b border-[#DCD9CD] pb-2 mb-4">
      <h3 className="text-lg font-bold text-[#202522]">{title}</h3>
      <button onClick={() => setStep(step)} className="text-xs font-bold text-[#34483F] hover:underline px-3 py-1 bg-[#34483F]/10 rounded-lg transition-colors">Edit</button>
    </div>
  );

  const DataRow = ({ label, value }: { label: string, value: any }) => (
    <div className="grid grid-cols-3 py-2 border-b border-[#FFFFFF]">
      <span className="text-[#4A514D] text-sm">{label}</span>
      <span className="col-span-2 text-[#202522] text-sm font-medium">{value || <span className="text-gray-600 italic">Not provided</span>}</span>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex gap-3 items-start mb-6">
        <AlertCircle className="text-yellow-500 shrink-0" size={20} />
        <div>
          <h4 className="text-yellow-500 font-bold text-sm">Please review carefully</h4>
          <p className="text-yellow-500/80 text-xs mt-1">Check all the details below before creating the gym. Ensure the admin credentials and subscription plans are correct.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Step 1 & 2 */}
        <div className="space-y-6">
          <section className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#DCD9CD]">
            <SectionHeader title="Gym & Owner Info" step={1} />
            <DataRow label="Gym Name" value={data.gymName} />
            <DataRow label="Gym Type" value={data.type} />
            <DataRow label="Reg Number" value={data.regNum} />
            <div className="mt-4 pt-4 border-t border-[#FFFFFF]">
              <DataRow label="Owner Name" value={data.ownerName} />
              <DataRow label="Email" value={data.email} />
              <DataRow label="Phone" value={data.phone} />
            </div>
          </section>

          <section className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#DCD9CD]">
            <SectionHeader title="Location" step={3} />
            <DataRow label="City & State" value={`${data.city}, ${data.state}`} />
            <DataRow label="Address" value={data.address} />
            <DataRow label="Pincode" value={data.pincode} />
            <DataRow label="Max Capacity" value={data.maxCapacity} />
          </section>
        </div>

        {/* Step 4 & 5 */}
        <div className="space-y-6">
          <section className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#DCD9CD]">
            <SectionHeader title="Admin Account" step={4} />
            <DataRow label="Admin Name" value={data.adminName} />
            <DataRow label="Admin Email" value={data.adminEmail} />
          </section>

          <section className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#DCD9CD]">
            <SectionHeader title="Gym Details" step={5} />
            <DataRow label="Trainers" value={data.trainersCount} />
            <DataRow label="Members" value={data.membersCount} />
            <DataRow label="Specialties" value={data.specialties?.length ? data.specialties.join(', ') : ''} />
            <DataRow label="Facilities" value={data.facilities?.length ? data.facilities.join(', ') : ''} />
            <DataRow label="Sessions" value={`${data.sessions?.length || 0} Configured`} />
          </section>
        </div>
      </div>

      <section className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#DCD9CD]">
        <SectionHeader title="Operating Hours" step={5} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {data.operatingHours?.map((h: any) => (
            <div key={h.dayOfWeek} className="bg-[#FFFFFF] p-3 rounded-xl">
              <span className="text-xs text-[#4A514D] block">{h.dayOfWeek}</span>
              <span className={`text-sm font-bold ${h.isOpen ? 'text-[#202522]' : 'text-[#8FA89B]'}`}>
                {h.isOpen ? (h.is24Hours ? '24 Hours' : `${h.openingTime} - ${h.closingTime}`) : 'Closed'}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#DCD9CD]">
        <SectionHeader title="Subscription Plans" step={6} />
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          {data.plans?.map((p: any) => (
            <div key={p.id} className="bg-[#FFFFFF] p-4 rounded-xl border border-[#DCD9CD]">
              <div className="flex justify-between items-start">
                <span className="font-bold text-[#202522]">{p.planName}</span>
                <span className="text-xs bg-green-500/20 text-green-500 px-2 rounded-full">{p.status}</span>
              </div>
              <p className="text-[#EF4444] font-bold mt-2 flex items-center">₹{p.finalPrice} <span className="text-xs text-[#4A514D] font-normal ml-1">/ {p.duration} {p.durationUnit}</span></p>
            </div>
          ))}
          {!data.plans?.length && (
            <div className="col-span-3 text-center py-4 text-[#4A514D] text-sm">No plans configured.</div>
          )}
        </div>
      </section>
    </div>
  );
};