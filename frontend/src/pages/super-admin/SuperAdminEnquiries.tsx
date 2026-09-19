import { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Mail, Loader2, MessageSquare } from 'lucide-react';
import api from '../../utils/api';

export const SuperAdminEnquiries = () => {
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
    e.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.mobileNumber.includes(searchTerm) ||
    e.gymId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-700';
      case 'CONTACTED': return 'bg-yellow-100 text-yellow-700';
      case 'FOLLOW_UP': return 'bg-purple-100 text-purple-700';
      case 'CONVERTED': return 'bg-green-100 text-green-700';
      case 'CLOSED': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Platform Enquiries</h1>
          <p className="text-[#475569] mt-1">Overview of all customer leads across all gyms.</p>
        </div>
        <div className="flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
            <input
              type="text"
              placeholder="Search enquiries, gyms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] outline-none"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-[#0D9488]" size={40} />
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th className="px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Gym Target</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Date & Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredEnquiries.map((enq) => (
                  <tr key={enq._id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#1E293B]">{enq.customerName}</div>
                      <div className="text-sm text-[#475569]">{enq.enquiryId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#1E293B] flex items-center gap-1"><Phone size={12}/> {enq.mobileNumber}</div>
                      <div className="text-sm text-[#64748B] flex items-center gap-1 mt-1"><Mail size={12}/> {enq.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-[#0D9488]">{enq.gymId?.name || 'Unknown Gym'}</div>
                      <div className="text-xs text-[#64748B] flex items-center gap-1 mt-0.5"><MapPin size={10}/> {enq.branchId?.name || enq.city || 'Main Branch'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#1E293B] mb-2">{new Date(enq.createdAt).toLocaleDateString()}</div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(enq.status)}`}>
                        {enq.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredEnquiries.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-[#475569]">
                      <MessageSquare size={40} className="mx-auto text-[#E2E8F0] mb-3" />
                      No enquiries found.
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

export default SuperAdminEnquiries;
