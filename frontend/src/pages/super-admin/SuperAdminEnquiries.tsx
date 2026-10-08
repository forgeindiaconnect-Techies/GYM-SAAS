import { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  Loader2, 
  MessageSquare, 
  Eye, 
  X, 
  Building,
  Tag,
  Clock,
  Download
} from 'lucide-react';
import api from '../../utils/api';
import { exportToExcel, exportToPDF, exportToWord } from '../../utils/export';

export const SuperAdminEnquiries = () => {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState<any | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

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

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setUpdatingStatus(true);
      const res = await api.put(`/enquiries/${id}/status`, { status: newStatus });
      if (res.data?.enquiry) {
        setEnquiries(prev => prev.map(e => e._id === id ? { ...e, ...res.data.enquiry } : e));
        setSelectedEnquiry((prev: any) => ({ ...prev, ...res.data.enquiry }));
      }
    } catch (err) {
      console.error('Failed to update enquiry status', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredEnquiries = enquiries.filter(e => 
    e.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.mobileNumber?.includes(searchTerm) ||
    e.enquiryId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.enquiryType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.gymId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CONTACTED': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'FOLLOW_UP': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'CONVERTED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CLOSED': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDateTime = (dateStr: string | Date | undefined) => {
    if (!dateStr) return 'Not available';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Not available';
    return `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const handleDownloadReport = (format: 'excel' | 'pdf' | 'word') => {
    const columns = [
      'Enquiry ID',
      'Customer Name',
      'Mobile Number',
      'Email Address',
      'Target Gym',
      'Target Branch',
      'Enquiry Category',
      'Status',
      'Date & Time'
    ];

    const data = filteredEnquiries.map(e => [
      e.enquiryId || e._id?.slice(-8) || 'N/A',
      e.customerName || 'N/A',
      e.mobileNumber || 'N/A',
      e.email || 'N/A',
      e.gymId?.name || 'Unknown Gym',
      e.branchId?.name || e.city || 'Main Branch',
      e.enquiryType || 'General Enquiry',
      e.status?.replace('_', ' ') || 'NEW',
      new Date(e.createdAt).toLocaleString('en-IN')
    ]);

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `Customer_Enquiries_Report_${dateStr}`;
    const title = `Platform Customer Enquiries Report (${new Date().toLocaleDateString()})`;

    if (format === 'pdf') {
      exportToPDF({ filename, columns, data, title });
    } else if (format === 'excel') {
      exportToExcel({ filename, columns, data, title });
    } else if (format === 'word') {
      exportToWord({ filename, columns, data, title });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#292524] tracking-tight">Platform Enquiries</h1>
          <p className="text-[#78716C] mt-1">Overview of all customer leads across all gyms.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C]" size={18} />
            <input
              type="text"
              placeholder="Search enquiries, gyms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-[#FED7AA] rounded-xl text-sm focus:border-[#FED7AA] focus:ring-1 focus:ring-[#FED7AA] outline-none bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownloadReport('excel')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FFFDF8] border border-[#FED7AA] hover:bg-[#F97316] hover:text-white hover:border-[#F97316] text-[#292524] font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
              title="Download Excel Report"
            >
              <Download size={16} />
              <span>Excel</span>
            </button>
            <button
              onClick={() => handleDownloadReport('pdf')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs shrink-0 cursor-pointer"
              title="Download PDF Report"
            >
              <Download size={16} />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-[#FED7AA]" size={40} />
        </div>
      ) : (
        <div className="bg-white border border-[#FED7AA] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFFDF8] border-b border-[#FED7AA]">
                  <th className="px-6 py-4 text-xs font-semibold text-[#78716C] uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#78716C] uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#78716C] uppercase tracking-wider">Gym Target</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#78716C] uppercase tracking-wider">Date & Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#78716C] uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FED7AA]">
                {filteredEnquiries.map((enq) => (
                  <tr key={enq._id} className="hover:bg-[#FFFDF8] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#292524]">{enq.customerName}</div>
                      <div className="text-xs font-mono text-[#78716C] mt-0.5">{enq.enquiryId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#292524] flex items-center gap-1.5">
                        <Phone size={13} className="text-[#F97316] shrink-0"/> 
                        <span>{enq.mobileNumber}</span>
                      </div>
                      <div className="text-sm text-[#78716C] flex items-center gap-1.5 mt-1">
                        <Mail size={13} className="text-[#F97316] shrink-0"/> 
                        <span className="truncate max-w-[180px]">{enq.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-[#F97316]">{enq.gymId?.name || 'Unknown Gym'}</div>
                      <div className="text-xs text-[#78716C] flex items-center gap-1 mt-0.5">
                        <MapPin size={11} className="shrink-0"/> 
                        <span>{enq.branchId?.name || enq.city || 'Main Branch'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold text-[#292524]">{new Date(enq.createdAt).toLocaleDateString()}</div>
                      <div className="text-[11px] text-[#78716C] mb-1.5 flex items-center gap-1 font-medium">
                        <Clock size={11} className="text-[#F97316]" />
                        <span>{new Date(enq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(enq.status)}`}>
                        {enq.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedEnquiry(enq)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F97316] text-white hover:bg-[#EA580C] text-xs font-semibold rounded-lg shadow-sm transition-colors"
                        title="View Enquiry Details"
                      >
                        <Eye size={13} />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredEnquiries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#78716C]">
                      <MessageSquare size={40} className="mx-auto text-[#FED7AA] mb-3" />
                      No enquiries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enquiry Details Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[85vh] overflow-hidden my-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E5E4] bg-[#FFFFFF] shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[#292524]">Customer Enquiry Details</h2>
                  <span className="font-mono text-xs px-2 py-0.5 bg-[#FFFDF8] text-[#F97316] rounded-md border border-[#E7E5E4] font-semibold">
                    {selectedEnquiry.enquiryId}
                  </span>
                </div>
                <p className="text-xs text-[#78716C] mt-0.5">
                  Submitted on {formatDateTime(selectedEnquiry.createdAt)}
                </p>
              </div>
              <button 
                onClick={() => setSelectedEnquiry(null)}
                className="p-1.5 text-[#78716C] hover:text-[#F97316] hover:bg-[#FFFDF8] rounded-lg transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm">
              {/* Category & Status Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#F8FAF9] border border-[#E7E5E4] rounded-xl shadow-sm">
                <div>
                  <p className="text-xs text-[#78716C] mb-0.5">Enquiry Category</p>
                  <p className="font-bold text-[#F97316] text-base flex items-center gap-1.5">
                    <Tag size={15} />
                    {selectedEnquiry.enquiryType || 'General Enquiry'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#78716C] mb-0.5">Current Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedEnquiry.status)}`}>
                    {selectedEnquiry.status?.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="text-[#F97316] font-semibold mb-3 border-b border-[#E7E5E4] pb-2 text-sm uppercase tracking-wider">
                  Customer Information
                </h3>
                <div className="border border-[#E7E5E4] rounded-xl overflow-hidden divide-y divide-[#E7E5E4] bg-white shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                    <div className="p-3.5 bg-white">
                      <p className="text-[#78716C] text-[11px] font-bold uppercase tracking-wider mb-1">Customer Name</p>
                      <p className="font-bold text-[#292524] text-sm">{selectedEnquiry.customerName}</p>
                    </div>
                    <div className="p-3.5 bg-white">
                      <p className="text-[#78716C] text-[11px] font-bold uppercase tracking-wider mb-1">Mobile Number</p>
                      <a href={`tel:${selectedEnquiry.mobileNumber}`} className="font-semibold text-[#F97316] hover:underline flex items-center gap-1.5 text-sm">
                        <Phone size={13} /> {selectedEnquiry.mobileNumber}
                      </a>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                    <div className="p-3.5 bg-white">
                      <p className="text-[#78716C] text-[11px] font-bold uppercase tracking-wider mb-1">Email Address</p>
                      <a href={`mailto:${selectedEnquiry.email}`} className="font-semibold text-[#F97316] hover:underline flex items-center gap-1.5 break-all text-sm">
                        <Mail size={13} /> {selectedEnquiry.email}
                      </a>
                    </div>
                    <div className="p-3.5 bg-white">
                      <p className="text-[#78716C] text-[11px] font-bold uppercase tracking-wider mb-1">Preferred Contact</p>
                      <span className="font-semibold text-[#292524] text-sm">
                        {selectedEnquiry.preferredContactMethod || 'Phone Call'}
                      </span>
                    </div>
                  </div>
                  {(selectedEnquiry.city || selectedEnquiry.address) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                      <div className="p-3.5 bg-white">
                        <p className="text-[#78716C] text-[11px] font-bold uppercase tracking-wider mb-1">City</p>
                        <p className="font-medium text-[#292524] text-sm">{selectedEnquiry.city || 'N/A'}</p>
                      </div>
                      <div className="p-3.5 bg-white">
                        <p className="text-[#78716C] text-[11px] font-bold uppercase tracking-wider mb-1">Address</p>
                        <p className="font-medium text-[#292524] text-sm">{selectedEnquiry.address || 'N/A'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Gym Target */}
              <div>
                <h3 className="text-[#F97316] font-semibold mb-3 border-b border-[#E7E5E4] pb-2 text-sm uppercase tracking-wider">
                  Target Gym Details
                </h3>
                <div className="border border-[#E7E5E4] rounded-xl overflow-hidden divide-y divide-[#E7E5E4] bg-white shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                    <div className="p-3.5 bg-white">
                      <p className="text-[#78716C] text-[11px] font-bold uppercase tracking-wider mb-1">Gym Name</p>
                      <p className="font-bold text-[#292524] text-sm flex items-center gap-1.5">
                        <Building size={14} className="text-[#F97316]" />
                        {selectedEnquiry.gymId?.name || 'Unknown Gym'}
                      </p>
                    </div>
                    <div className="p-3.5 bg-white">
                      <p className="text-[#78716C] text-[11px] font-bold uppercase tracking-wider mb-1">Branch / Location</p>
                      <p className="font-medium text-[#292524] text-sm flex items-center gap-1.5">
                        <MapPin size={14} className="text-[#F97316]" />
                        {selectedEnquiry.branchId?.name || selectedEnquiry.gymId?.location?.address || selectedEnquiry.city || 'Main Branch'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enquiry Message */}
              <div>
                <h3 className="text-[#F97316] font-semibold mb-3 border-b border-[#E7E5E4] pb-2 text-sm uppercase tracking-wider">
                  Customer Enquiry Message
                </h3>
                <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl p-4 shadow-sm">
                  <p className="text-[#292524] whitespace-pre-wrap leading-relaxed">
                    {selectedEnquiry.message || 'No specific message provided.'}
                  </p>
                </div>
              </div>

              {/* Status Update Controls */}
              <div>
                <h3 className="text-[#F97316] font-semibold mb-3 border-b border-[#E7E5E4] pb-2 text-sm uppercase tracking-wider">
                  Update Enquiry Status
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {['NEW', 'CONTACTED', 'FOLLOW_UP', 'CONVERTED', 'CLOSED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedEnquiry._id, st)}
                      disabled={updatingStatus}
                      className={`px-2.5 py-2 text-xs font-semibold rounded-lg border transition-all text-center ${
                        selectedEnquiry.status === st
                          ? 'bg-[#F97316] text-white border-[#F97316] shadow-sm'
                          : 'bg-white text-[#78716C] border-[#E7E5E4] hover:bg-[#FFFDF8]'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
                {selectedEnquiry.ownerNotes && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs font-semibold text-amber-800 mb-1">Notes / Log:</p>
                    <p className="text-xs text-amber-900 whitespace-pre-wrap">{selectedEnquiry.ownerNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-[#F8FAF9] border-t border-[#E7E5E4] flex items-center justify-between shrink-0">
              <span className="text-xs text-[#78716C]">
                Enquiry ID: <span className="font-mono font-medium text-[#292524]">{selectedEnquiry.enquiryId}</span>
              </span>
              <button 
                onClick={() => setSelectedEnquiry(null)}
                className="px-5 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C] transition-colors text-sm font-semibold shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminEnquiries;
