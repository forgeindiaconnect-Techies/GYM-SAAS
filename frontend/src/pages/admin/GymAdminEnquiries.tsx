import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Search, MapPin, Phone, Mail, Calendar, Loader2, MessageSquare, ArrowRight, UserPlus, CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import { RegisterNewMemberModal } from '../../components/GymAdmin/RegisterNewMemberModal';

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
      case 'CONVERTED': return 'bg-[#D2B48C]/10 text-[#164A4A]';
      case 'CLOSED': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#202828] tracking-tight">Customer Enquiries</h1>
          <p className="text-[#455250] mt-1">Manage leads and prospective members who want to join your gym.</p>
        </div>
        <div className="flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8ADA9]" size={18} />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-[#E8E5DA] rounded-xl text-sm focus:border-[#164A4A] focus:ring-1 focus:ring-[#164A4A] outline-none"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-[#164A4A]" size={40} />
        </div>
      ) : (
        <div className="bg-white border border-[#E8E5DA] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F2EFE8] border-b border-[#E8E5DA]">
                  <th className="px-6 py-4 text-xs font-semibold text-[#687B78] uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#687B78] uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#687B78] uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#687B78] uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#687B78] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#687B78] uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5DA]">
                {filteredEnquiries.map((enq) => (
                  <tr key={enq._id} className="hover:bg-[#F2EFE8] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#202828]">{enq.customerName}</div>
                      <div className="text-sm text-[#455250]">{enq.enquiryId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#202828] flex items-center gap-1"><Phone size={12}/> {enq.mobileNumber}</div>
                      <div className="text-sm text-[#687B78] flex items-center gap-1 mt-1"><Mail size={12}/> {enq.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#202828]">{enq.enquiryType}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#202828]">{new Date(enq.createdAt).toLocaleDateString()}</div>
                      <div className="text-xs text-[#687B78]">{new Date(enq.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(enq.status)}`}>
                        {enq.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => { setSelectedEnquiry(enq); setNotes(enq.ownerNotes || ''); }}
                        className="text-[#164A4A] hover:text-[#C6A77D] font-semibold text-sm flex items-center gap-1"
                      >
                        View Details <ArrowRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredEnquiries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#455250]">
                      <MessageSquare size={40} className="mx-auto text-[#E8E5DA] mb-3" />
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[#E8E5DA] flex justify-between items-center bg-[#F2EFE8]">
              <div>
                <h2 className="text-xl font-bold text-[#202828] flex items-center gap-2">
                  Enquiry Details
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(selectedEnquiry.status)}`}>
                    {selectedEnquiry.status.replace('_', ' ')}
                  </span>
                </h2>
                <p className="text-[#687B78] text-sm mt-1">{selectedEnquiry.enquiryId} • Submitted on {new Date(selectedEnquiry.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedEnquiry(null)} className="p-2 text-[#455250] hover:bg-[#E8E5DA] rounded-full transition-colors">
                <span className="sr-only">Close</span>✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-[#687B78] uppercase tracking-wider mb-3">Customer Information</h3>
                  <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4 space-y-3">
                    <p className="font-bold text-[#202828] text-lg">{selectedEnquiry.customerName}</p>
                    <div className="flex items-center gap-2 text-[#455250] text-sm"><Phone size={16} className="text-[#164A4A]"/> {selectedEnquiry.mobileNumber}</div>
                    <div className="flex items-center gap-2 text-[#455250] text-sm"><Mail size={16} className="text-[#164A4A]"/> {selectedEnquiry.email}</div>
                    {selectedEnquiry.city && <div className="flex items-center gap-2 text-[#455250] text-sm"><MapPin size={16} className="text-[#164A4A]"/> {selectedEnquiry.city}</div>}
                    <div className="flex items-center gap-2 text-[#455250] text-sm mt-2 pt-2 border-t border-[#E8E5DA]">
                      <span className="font-semibold text-[#202828]">Prefers:</span> {selectedEnquiry.preferredContactMethod}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#687B78] uppercase tracking-wider mb-3">Message</h3>
                  <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4">
                    <p className="font-semibold text-[#202828] mb-2">{selectedEnquiry.enquiryType}</p>
                    <p className="text-[#455250] whitespace-pre-wrap text-sm leading-relaxed">{selectedEnquiry.message}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-[#687B78] uppercase tracking-wider mb-3">Owner Notes</h3>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Add internal notes about this lead..."
                    className="w-full bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-3 text-sm focus:border-[#164A4A] focus:ring-1 focus:ring-[#164A4A] outline-none transition-all resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <button 
                      onClick={() => updateStatus(selectedEnquiry._id, selectedEnquiry.status)}
                      disabled={updating}
                      className="px-4 py-2 bg-[#F1F5F9] text-[#202828] font-semibold text-sm rounded-lg hover:bg-[#E8E5DA] transition-colors disabled:opacity-50"
                    >
                      {updating ? 'Saving...' : 'Save Notes'}
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#687B78] uppercase tracking-wider mb-3">Actions</h3>
                  <div className="space-y-3">
                    {selectedEnquiry.status === 'NEW' && (
                      <button onClick={() => updateStatus(selectedEnquiry._id, 'CONTACTED')} className="w-full py-3 bg-[#164A4A]/10 text-[#164A4A] font-bold rounded-xl hover:bg-[#164A4A]/20 transition-colors flex items-center justify-center gap-2">
                        <CheckCircle size={18} /> Mark as Contacted
                      </button>
                    )}
                    {['NEW', 'CONTACTED'].includes(selectedEnquiry.status) && (
                      <button onClick={() => updateStatus(selectedEnquiry._id, 'FOLLOW_UP')} className="w-full py-3 bg-[#8B5CF6]/10 text-[#8B5CF6] font-bold rounded-xl hover:bg-[#8B5CF6]/20 transition-colors flex items-center justify-center gap-2">
                        <Calendar size={18} /> Needs Follow-up
                      </button>
                    )}
                    {['NEW', 'CONTACTED', 'FOLLOW_UP'].includes(selectedEnquiry.status) && (
                      <button onClick={() => handleConvert(selectedEnquiry)} className="w-full py-3 bg-[#164A4A] text-white font-bold rounded-xl hover:bg-[#C6A77D] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#164A4A]/20">
                        <UserPlus size={18} /> Convert to Customer
                      </button>
                    )}
                    {['NEW', 'CONTACTED', 'FOLLOW_UP'].includes(selectedEnquiry.status) && (
                      <button onClick={() => updateStatus(selectedEnquiry._id, 'CLOSED')} className="w-full py-3 bg-[#F1F5F9] text-[#687B78] font-bold rounded-xl hover:bg-[#E8E5DA] transition-colors flex items-center justify-center gap-2">
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
