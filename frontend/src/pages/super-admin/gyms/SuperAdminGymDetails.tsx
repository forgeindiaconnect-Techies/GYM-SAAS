import { Info } from 'lucide-react';

const SuperAdminGymDetails = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#2A3A3A] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Info className="text-[#2DD4BF]" size={32} />
            Gym Details
          </h1>
          <p className="text-[#9AAEAE] mt-2 font-mono text-sm">Deep dive into specific organizational parameters.</p>
        </div>
        <button className="px-6 py-2 bg-[#1B2728]/10 text-[#5EEAD4] border border-[#1B2728]/30 rounded-xl font-bold hover:bg-[#1B2728] hover:text-[#2DD4BF] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="bg-[#FFFFFF] border border-[#2A3A3A] rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-6 text-[#F5FAFA]">Gymora Core Branch</h2>
        <div className="grid grid-cols-2 gap-6 font-mono text-sm">
          <div><p className="text-[#9AAEAE] mb-1">LOCATION</p><p>New York, NY 10001</p></div>
          <div><p className="text-[#9AAEAE] mb-1">OWNER</p><p>owner@aigym.com</p></div>
          <div><p className="text-[#9AAEAE] mb-1">CAPACITY</p><p>5,000 members</p></div>
          <div><p className="text-[#9AAEAE] mb-1">TIER</p><p className="text-[#2DD4BF]">Enterprise</p></div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminGymDetails;