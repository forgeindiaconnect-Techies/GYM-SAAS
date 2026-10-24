import { CheckCircle2, Edit } from 'lucide-react';

export const Step10Review = ({ data, setStep }: any) => {
  const renderSectionHeader = (title: string, stepNumber: number) => (
    <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#2A3A3A]">
      <div className="flex items-center space-x-2">
        <CheckCircle2 className="text-green-500" size={18} />
        <h3 className="text-lg font-bold text-[#F5FAFA]">{title}</h3>
      </div>
      <button onClick={() => setStep(stepNumber)} className="text-[#2DD4BF] hover:text-[#C43D35] text-sm font-bold flex items-center space-x-1">
        <Edit size={14} /><span>Edit</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#F5FAFA] mb-2">Review Gym Configuration</h2>
        <p className="text-[#9AAEAE]">Please verify all information before finalizing the setup.</p>
      </div>

      <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#2A3A3A]">
        {renderSectionHeader('1. Gym Information', 1)}
        <div className="grid grid-cols-2 gap-4 text-sm mb-8">
          <div><span className="text-[#9AAEAE]">Name:</span> <span className="text-[#F5FAFA] ml-2">{data.gymName || 'N/A'}</span></div>
          <div><span className="text-[#9AAEAE]">Type:</span> <span className="text-[#F5FAFA] ml-2">{data.gymType || 'N/A'}</span></div>
        </div>

        {renderSectionHeader('2. Owner Information', 2)}
        <div className="grid grid-cols-2 gap-4 text-sm mb-8">
          <div><span className="text-[#9AAEAE]">Name:</span> <span className="text-[#F5FAFA] ml-2">{data.ownerName || 'N/A'}</span></div>
          <div><span className="text-[#9AAEAE]">Email:</span> <span className="text-[#F5FAFA] ml-2">{data.ownerEmail || 'N/A'}</span></div>
          <div><span className="text-[#9AAEAE]">Phone:</span> <span className="text-[#F5FAFA] ml-2">{data.ownerPhone || 'N/A'}</span></div>
        </div>

        {renderSectionHeader('3. Location', 3)}
        <div className="grid grid-cols-2 gap-4 text-sm mb-8">
          <div><span className="text-[#9AAEAE]">City:</span> <span className="text-[#F5FAFA] ml-2">{data.city || 'N/A'}</span></div>
          <div><span className="text-[#9AAEAE]">State:</span> <span className="text-[#F5FAFA] ml-2">{data.state || 'N/A'}</span></div>
          <div><span className="text-[#9AAEAE]">Max Capacity:</span> <span className="text-[#F5FAFA] ml-2">{data.maxCapacity || 'N/A'}</span></div>
        </div>

        {renderSectionHeader('4. Admin Account', 4)}
        <div className="grid grid-cols-2 gap-4 text-sm mb-8">
          <div><span className="text-[#9AAEAE]">Admin Name:</span> <span className="text-[#F5FAFA] ml-2">{data.adminName || 'N/A'}</span></div>
          <div><span className="text-[#9AAEAE]">Admin Email:</span> <span className="text-[#F5FAFA] ml-2">{data.adminEmail || 'N/A'}</span></div>
        </div>

        {renderSectionHeader('5. Entities Setup', 8)}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#2A3A3A] text-center">
            <p className="text-[#9AAEAE] mb-1">Trainers</p>
            <p className="text-2xl font-bold text-[#F5FAFA]">{data.trainers.length}</p>
          </div>
          <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#2A3A3A] text-center">
            <p className="text-[#9AAEAE] mb-1">Plans</p>
            <p className="text-2xl font-bold text-[#F5FAFA]">{data.plans.length}</p>
          </div>
          <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#2A3A3A] text-center">
            <p className="text-[#9AAEAE] mb-1">Members</p>
            <p className="text-2xl font-bold text-[#F5FAFA]">{data.members.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
