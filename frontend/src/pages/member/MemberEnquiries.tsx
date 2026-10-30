import { useState, useEffect } from 'react';
import { Search, Building2, MapPin, Loader2, MessageSquare } from 'lucide-react';
import api from '../../utils/api';

export const MemberEnquiries = () => {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/enquiries');
      setEnquiries(res.data.enquiries || []);
    } catch (err) {
      console.error('Failed to fetch enquiries', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEnquiries = enquiries.filter(e => 
    e.gymId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.enquiryType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-[#F8FAFC] text-[#EA580C]';
      case 'CONTACTED': return 'bg-yellow-100 text-yellow-700';
      case 'FOLLOW_UP': return 'bg-[#F8FAFC] text-[#EA580C]';
      case 'CONVERTED': return 'bg-[#FFF7ED] text-[#EA580C]';
      case 'CLOSED': return 'bg-[#F8FAFC] text-[#111827]';
      default: return 'bg-[#F8FAFC] text-[#111827]';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#111827] tracking-tight">My Enquiries</h1>
          <p className="text-[#64748B] mt-1">Track the status of your queries sent to gyms.</p>
        </div>
        <div className="flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
            <input
              type="text"
              placeholder="Search by gym or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-[#F8FAFC] rounded-xl text-sm focus:border-[#FDBA74] focus:ring-1 focus:ring-[#F97316] outline-none"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-[#EA580C]" size={40} />
        </div>
      ) : (
        <div className="bg-[#FFFFFF] border border-[#F8FAFC] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#F8FAFC]">
                  <th className="px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Gym Details</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Enquiry Info</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Date Submitted</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8FAFC]">
                {filteredEnquiries.map((enq) => (
                  <tr key={enq._id} className="hover:bg-[#FFF7ED] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#111827] flex items-center gap-1.5">
                        <Building2 size={14} className="text-[#EA580C]"/> {enq.gymId?.name || 'Unknown Gym'}
                      </div>
                      <div className="text-sm text-[#64748B] flex items-center gap-1 mt-1">
                        <MapPin size={12}/> {enq.branchId?.name || enq.city || 'Main Branch'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-[#111827]">{enq.enquiryType}</div>
                      <div className="text-sm text-[#64748B] line-clamp-1 max-w-xs">{enq.message}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#111827]">{new Date(enq.createdAt).toLocaleDateString()}</div>
                      <div className="text-xs text-[#64748B]">{new Date(enq.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(enq.status)}`}>
                        {enq.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredEnquiries.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-[#64748B]">
                      <MessageSquare size={40} className="mx-auto text-[#9A3412] mb-3" />
                      You haven't submitted any enquiries yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberEnquiries;
