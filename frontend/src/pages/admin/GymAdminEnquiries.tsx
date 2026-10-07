import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Phone, Mail, Calendar, Loader2, MessageSquare, ArrowRight, UserPlus, CheckCircle, Download, Clock } from 'lucide-react';
import api from '../../utils/api';
import { RegisterNewMemberModal } from '../../components/GymAdmin/RegisterNewMemberModal';
import { exportToPDF } from '../../utils/export';

export const GymAdminEnquiries = () => {
  const { user } = useAuth();
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedEnquiry, setSelectedEnquiry] = useState<any | null>(null);
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [gym, setGym] = useState<any>(null);

  // Conversion
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [conversionData, setConversionData] = useState<any>(null);

  useEffect(() => {
    fetchEnquiries();
    fetchGymDetails();
  }, []);

  const fetchGymDetails = async () => {
    if (user?.gymId) {
       try {
         const res = await api.get(`/gyms/${user.gymId}`);
         setGym(res.data.gym);
       } catch (err) {
         console.error('Failed to fetch gym', err);
       }
    }
  };

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

  const updateStatus = async (id: string, status: string, additionalNotes?: string) => {
    try {
      setUpdating(true);
      const res = await api.put(`/enquiries/${id}/status`, { 
        status, 
        ownerNotes: additionalNotes !== undefined ? additionalNotes : notes 
      });
      // Update local state
      setEnquiries(prev => prev.map(e => e._id === id ? res.data.enquiry : e));
      if (selectedEnquiry?._id === id) {
        setSelectedEnquiry(res.data.enquiry);
      }
    } catch (err) {
      console.error('Failed to update enquiry', err);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleConvert = (enquiry: any) => {
    setConversionData({
      firstName: enquiry.customerName.split(' ')[0],
      lastName: enquiry.customerName.split(' ').slice(1).join(' '),
      email: enquiry.email,
      mobile: enquiry.mobileNumber,
      enquiryId: enquiry._id,
      city: enquiry.city || '',
      pinCode: '' // Could be filled if we had it
    });
    setShowConvertModal(true);
    setSelectedEnquiry(null); // Close the detail modal
  };

  const filteredEnquiries = enquiries.filter(e => 
    e.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.mobileNumber.includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-700';
      case 'CONTACTED': return 'bg-yellow-100 text-yellow-700';
      case 'FOLLOW_UP': return 'bg-purple-100 text-purple-700';
      case 'CONVERTED': return 'bg-[#FED7AA]/10 text-[#F97316]';
      case 'CLOSED': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleDownloadPDF = () => {
    const columns = ['Customer Name', 'Mobile', 'Email', 'Training Type', 'Date', 'Status'];
    const data = filteredEnquiries.map(e => [
      e.customerName || '-',
      e.mobileNumber || '-',
      e.email || '-',
      e.type || '-',
      e.createdAt ? new Date(e.createdAt).toLocaleString('en-IN') : '-',
      e.status || '-'
    ]);
    exportToPDF({
      filename: `Customer_Enquiries_${new Date().toISOString().split('T')[0]}`,
      columns,
      data,
      title: 'Customer Enquiries Report'
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#292524] tracking-tight">Customer Enquiries</h1>
          <p className="text-[#78716C] mt-1">Manage leads and prospective members who want to join your gym.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C]" size={18} />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-[#FED7AA] rounded-xl text-sm focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] outline-none"
            />
          </div>
          <button
            onClick={handleDownloadPDF}
            disabled={filteredEnquiries.length === 0}
            className="inline-flex items-center gap-2 bg-[#F97316] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#EA580C] transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Download size={16} />
            Download PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-[#F97316]" size={40} />
        </div>
      ) : (
        <div className="bg-white border border-[#FED7AA] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFFDF8] border-b border-[#FED7AA]">
                  <th className="px-6 py-4 text-xs font-semibold text-[#78716C] uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#78716C] uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#78716C] uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#78716C] uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#78716C] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#78716C] uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FED7AA]">
                {filteredEnquiries.map((enq) => (
                  <tr key={enq._id} className="hover:bg-[#FFFDF8] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#292524]">{enq.customerName}</div>
                      <div className="text-sm text-[#78716C]">{enq.enquiryId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#292524] flex items-center gap-1"><Phone size={12}/> {enq.mobileNumber}</div>
                      <div className="text-sm text-[#78716C] flex items-center gap-1 mt-1"><Mail size={12}/> {enq.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#292524]">{enq.enquiryType}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-[#292524]">{new Date(enq.createdAt).toLocaleDateString()}</div>
                      <div className="text-xs text-[#78716C] flex items-center gap-1 font-medium mt-0.5">
                        <Clock size={11} className="text-[#F97316]" />
                        <span>{new Date(enq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(enq.status)}`}>
                        {enq.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => { setSelectedEnquiry(enq); setNotes(enq.ownerNotes || ''); }}
                        className="text-[#F97316] hover:text-[#EA580C] font-semibold text-sm flex items-center gap-1"
                      >
                        View Details <ArrowRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredEnquiries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#78716C]">
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

      {/* Enquiry Detail Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] my-auto">
            <div className="p-6 border-b border-[#FED7AA] flex justify-between items-center bg-[#FFFDF8]">
              <div>
                <h2 className="text-xl font-bold text-[#292524] flex items-center gap-2">
                  Enquiry Details
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(selectedEnquiry.status)}`}>
                    {selectedEnquiry.status.replace('_', ' ')}
                  </span>
                </h2>
                <p className="text-[#78716C] text-sm mt-1">{selectedEnquiry.enquiryId} • Submitted on {new Date(selectedEnquiry.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedEnquiry(null)} className="p-2 text-[#78716C] hover:bg-[#FED7AA] rounded-full transition-colors">
                <span className="sr-only">Close</span>✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-[#F97316] uppercase tracking-wider mb-3">Customer Information</h3>
                  <div className="border border-[#E7E5E4] rounded-xl overflow-hidden divide-y divide-[#E7E5E4] bg-white shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                      <div className="p-3.5 bg-white flex flex-col justify-center">
                        <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Customer Name</span>
                        <span className="font-bold text-sm text-[#292524]">{selectedEnquiry.customerName}</span>
                      </div>
                      <div className="p-3.5 bg-white flex flex-col justify-center">
                        <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Mobile</span>
                        <span className="font-semibold text-sm text-[#292524]">{selectedEnquiry.mobileNumber}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                      <div className="p-3.5 bg-white flex flex-col justify-center">
                        <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Email</span>
                        <span className="font-semibold text-sm text-[#292524] break-all">{selectedEnquiry.email}</span>
                      </div>
                      <div className="p-3.5 bg-white flex flex-col justify-center">
                        <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">City</span>
                        <span className="font-semibold text-sm text-[#292524]">{selectedEnquiry.city || '—'}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                      <div className="p-3.5 bg-white flex flex-col justify-center">
                        <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Preferred Contact</span>
                        <span className="font-semibold text-sm text-[#F97316]">{selectedEnquiry.preferredContactMethod || 'Any'}</span>
                      </div>
                      <div className="p-3.5 bg-white flex flex-col justify-center">
                        <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Enquiry Type</span>
                        <span className="font-semibold text-sm text-[#292524]">{selectedEnquiry.enquiryType || 'General'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-[#F97316] uppercase tracking-wider mb-3">Message</h3>
                  <div className="border border-[#E7E5E4] rounded-xl overflow-hidden divide-y divide-[#E7E5E4] bg-white shadow-sm">
                    <div className="p-3 bg-[#F8FAF9] text-[11px] font-bold uppercase tracking-wider text-[#78716C]">
                      Subject / Type: <span className="text-[#292524]">{selectedEnquiry.enquiryType}</span>
                    </div>
                    <div className="p-4 bg-white text-sm text-[#292524] leading-relaxed whitespace-pre-wrap">
                      {selectedEnquiry.message}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-[#78716C] uppercase tracking-wider mb-3">Owner Notes</h3>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Add internal notes about this lead..."
                    className="w-full bg-[#FFFDF8] border border-[#FED7AA] rounded-xl p-3 text-sm focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] outline-none transition-all resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <button 
                      onClick={() => updateStatus(selectedEnquiry._id, selectedEnquiry.status)}
                      disabled={updating}
                      className="px-4 py-2 bg-[#F1F5F9] text-[#292524] font-semibold text-sm rounded-lg hover:bg-[#FED7AA] transition-colors disabled:opacity-50"
                    >
                      {updating ? 'Saving...' : 'Save Notes'}
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#78716C] uppercase tracking-wider mb-3">Actions</h3>
                  <div className="space-y-3">
                    {selectedEnquiry.status === 'NEW' && (
                      <button onClick={() => updateStatus(selectedEnquiry._id, 'CONTACTED')} className="w-full py-3 bg-[#F97316]/10 text-[#F97316] font-bold rounded-xl hover:bg-[#F97316]/20 transition-colors flex items-center justify-center gap-2">
                        <CheckCircle size={18} /> Mark as Contacted
                      </button>
                    )}
                    {['NEW', 'CONTACTED'].includes(selectedEnquiry.status) && (
                      <button onClick={() => updateStatus(selectedEnquiry._id, 'FOLLOW_UP')} className="w-full py-3 bg-[#8B5CF6]/10 text-[#8B5CF6] font-bold rounded-xl hover:bg-[#8B5CF6]/20 transition-colors flex items-center justify-center gap-2">
                        <Calendar size={18} /> Needs Follow-up
                      </button>
                    )}
                    {['NEW', 'CONTACTED', 'FOLLOW_UP'].includes(selectedEnquiry.status) && (
                      <button onClick={() => handleConvert(selectedEnquiry)} className="w-full py-3 bg-[#F97316] text-white font-bold rounded-xl hover:bg-[#EA580C] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#F97316]/20">
                        <UserPlus size={18} /> Convert to Customer
                      </button>
                    )}
                    {['NEW', 'CONTACTED', 'FOLLOW_UP'].includes(selectedEnquiry.status) && (
                      <button onClick={() => updateStatus(selectedEnquiry._id, 'CLOSED')} className="w-full py-3 bg-[#F1F5F9] text-[#78716C] font-bold rounded-xl hover:bg-[#FED7AA] transition-colors flex items-center justify-center gap-2">
                        Close Enquiry
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Convert to Member Flow */}
      {showConvertModal && (
        <RegisterNewMemberModal 
          plans={gym?.subscriptionPlans || [{ name: 'Basic' }]}
          onClose={() => {
            setShowConvertModal(false);
            setConversionData(null);
            fetchEnquiries();
          }}
          initialData={conversionData}
          onSubmit={async (data) => {
             // In a real flow, this would call the API to create the user, then we update the enquiry
             // Assuming the parent normally handles the API call:
             try {
               await api.post('/users/member', data);
               if (conversionData?.enquiryId) {
                  await updateStatus(conversionData.enquiryId, 'CONVERTED', 'Converted to customer successfully.');
               }
               setShowConvertModal(false);
               setConversionData(null);
               fetchEnquiries();
             } catch (err) {
               console.error('Failed to create member:', err);
               alert('Failed to convert member. Ensure plans are available and inputs are correct.');
             }
          }}
        />
      )}
    </div>
  );
};

export default GymAdminEnquiries;
