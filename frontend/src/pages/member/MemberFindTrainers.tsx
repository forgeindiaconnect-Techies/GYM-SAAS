import { useState, useEffect } from 'react';
import { Search, Star, Calendar, Eye, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const MemberFindTrainers = () => {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrainer, setSelectedTrainer] = useState<any | null>(null);

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const response = await api.get('/trainers/online-available');
        if (response.data.success && response.data.trainers?.length > 0) {
          setTrainers(response.data.trainers);
        } else {
          const fallback = await api.get('/trainers/my-gym');
          if (fallback.data.success) setTrainers(fallback.data.trainers);
        }
      } catch (error) {
        console.error("Failed to fetch trainers:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrainers();
  }, []);

  const filtered = trainers.filter(t => {
    const n = t.name || '';
    const s = t.specialization || '';
    const q = search || '';
    return n.toLowerCase().includes(q.toLowerCase()) || s.toLowerCase().includes(q.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#202828] tracking-tight">Book Online Trainer</h1>
          <p className="text-[#455250] mt-1">Select an active online trainer to review your AI Analysis and guide your live training.</p>
        </div>
        <div className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="Search by name or spec..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl pl-10 pr-4 py-2 text-[#202828] focus:border-[#164A4A] focus:ring-1 focus:ring-[#EF4444] transition-all"
          />
          <Search className="absolute left-3 top-2.5 text-[#455250]" size={18} />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-[#455250]">Loading online trainers...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(trainer => (
              <div key={trainer._id} className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6 hover:border-[#164A4A]/50 transition-colors flex flex-col h-full shadow-sm relative overflow-hidden">
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                    trainer.availabilityStatus === 'Offline' ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${trainer.availabilityStatus === 'Offline' ? 'bg-gray-400' : 'bg-emerald-500 animate-pulse'}`} />
                    {trainer.availabilityStatus || 'Available'}
                  </span>
                  <span className="text-xs font-semibold text-[#164A4A] bg-[#164A4A]/10 px-2 py-0.5 rounded-md capitalize">
                    {trainer.trainingMode === 'both' ? 'Online & Gym' : (trainer.trainingMode || 'Online')}
                  </span>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-[#FFFFFF] rounded-full flex items-center justify-center text-xl font-bold text-[#164A4A] border border-[#D3DFDA] overflow-hidden shrink-0 shadow-sm">
                    {trainer.profilePhoto ? (
                      <img src={trainer.profilePhoto} alt={trainer.name} className="w-full h-full object-cover" />
                    ) : (
                      trainer.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-[#202828] truncate">{trainer.name}</h3>
                    <p className="text-sm text-[#164A4A] font-medium truncate">{trainer.specialization || 'Fitness Specialist'}</p>
                    <div className="flex items-center space-x-1 mt-1 text-[#455250] text-xs">
                      <Star size={13} className="text-yellow-500 fill-yellow-500 shrink-0" />
                      <span className="font-bold">{trainer.averageRating || trainer.rating || '5.0'}</span>
                      <span className="text-[#687B78]">({trainer.totalReviews || trainer.reviewCount || '12'} reviews)</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-[#D3DFDA] space-y-2 text-sm text-[#455250] flex-1">
                  <p><span className="text-[#202828] font-semibold">Experience:</span> {trainer.experience ? `${trainer.experience} years` : '3+ years'}</p>
                  <p><span className="text-[#202828] font-semibold">Expertise:</span> {
                    typeof trainer.expertise === 'string'
                      ? trainer.expertise.split('\n').filter(Boolean).join(' • ')
                      : (Array.isArray(trainer.expertise) ? trainer.expertise.join(' • ') : (trainer.expertise || trainer.specialization || 'Strength & Conditioning'))
                  }</p>
                  <p><span className="text-[#202828] font-semibold">Available Slots:</span> {trainer.availableSlot || 5} per day ({trainer.availableStartTime || '09:00 AM'} - {trainer.availableEndTime || '06:00 PM'})</p>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <button onClick={() => setSelectedTrainer(trainer)} className="flex-1 flex justify-center items-center space-x-2 py-2 bg-[#F1F5F9] text-[#202828] border border-[#D3DFDA] rounded-xl font-semibold hover:bg-[#E8E5DA] transition-colors">
                    <Eye size={16} />
                    <span>View Details</span>
                  </button>
                  <Link to={`/member/book-session?trainerId=${trainer._id}`} className="flex-1 flex justify-center items-center space-x-2 py-2 bg-[#164A4A] text-white rounded-xl font-semibold hover:bg-[#C6A77D] transition-colors">
                    <Calendar size={16} />
                    <span>Book Session</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {filtered.length === 0 && (
            <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-12 text-center">
              <p className="text-[#455250] text-lg">No trainers found matching your search.</p>
            </div>
          )}
        </>
      )}

      {/* Trainer Details Modal */}
      {selectedTrainer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-scale-in flex flex-col shadow-2xl border border-[#D3DFDA]">
            <div className="flex justify-between items-center p-6 border-b border-[#D3DFDA] sticky top-0 bg-white/95 backdrop-blur z-10">
              <h2 className="text-xl font-bold text-[#202828]">Trainer Profile</h2>
              <button onClick={() => setSelectedTrainer(null)} className="text-[#455250] hover:bg-[#F1F5F9] p-2 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 md:p-8 space-y-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-32 h-32 bg-[#F1F5F9] rounded-2xl flex items-center justify-center text-4xl font-bold text-[#164A4A] border-4 border-[#D3DFDA] overflow-hidden shadow-lg shrink-0">
                  {selectedTrainer.profilePhoto ? (
                    <img src={selectedTrainer.profilePhoto} alt={selectedTrainer.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedTrainer.name.charAt(0)
                  )}
                </div>
                <div className="text-center md:text-left flex-1">
                  <h3 className="text-3xl font-bold text-[#202828] mb-2">{selectedTrainer.name}</h3>
                  <p className="text-lg text-[#164A4A] font-semibold mb-3">{selectedTrainer.specialization || 'General Fitness'}</p>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-medium border border-yellow-200">
                      <Star size={16} className="fill-yellow-500 text-yellow-500" />
                      <span>{selectedTrainer.rating || '4.8'} Rating</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Contact Info */}
              <div>
                <h4 className="text-xs font-bold text-[#455250] uppercase tracking-wider mb-3">Contact Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4">
                    <p className="text-[#687B78] text-xs font-medium mb-1.5">Email</p>
                    <p className="font-semibold text-[#202828]">{selectedTrainer.email || 'N/A'}</p>
                  </div>
                  <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4">
                    <p className="text-[#687B78] text-xs font-medium mb-1.5">Phone</p>
                    <p className="font-semibold text-[#202828]">{selectedTrainer.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Section: Professional Info */}
              <div>
                <h4 className="text-xs font-bold text-[#455250] uppercase tracking-wider mb-3">Professional Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4">
                    <p className="text-[#687B78] text-xs font-medium mb-1.5">Specialization</p>
                    <p className="font-semibold text-[#202828]">{selectedTrainer.specialization || 'N/A'}</p>
                  </div>
                  <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4">
                    <p className="text-[#687B78] text-xs font-medium mb-1.5">Experience</p>
                    <p className="font-semibold text-[#202828]">{selectedTrainer.experience ? `${selectedTrainer.experience} Years` : 'N/A'}</p>
                  </div>
                  <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4">
                    <p className="text-[#687B78] text-xs font-medium mb-1.5">Training Mode</p>
                    <p className="font-semibold text-[#202828] capitalize">{selectedTrainer.trainingMode || 'N/A'}</p>
                  </div>
                  <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4">
                    <p className="text-[#687B78] text-xs font-medium mb-1.5">Qualifications</p>
                    <p className="font-semibold text-[#202828]">
                      {selectedTrainer.qualifications && selectedTrainer.qualifications.length > 0 
                        ? (Array.isArray(selectedTrainer.qualifications) ? selectedTrainer.qualifications.join(', ') : selectedTrainer.qualifications) 
                        : 'N/A'}
                    </p>
                  </div>
                  {selectedTrainer.expertise && selectedTrainer.expertise.length > 0 && (
                    <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4">
                      <p className="text-[#687B78] text-xs font-medium mb-1.5">Expertise</p>
                      <p className="font-semibold text-[#202828]">
                        {Array.isArray(selectedTrainer.expertise) ? selectedTrainer.expertise.join(', ') : selectedTrainer.expertise}
                      </p>
                    </div>
                  )}
                  {selectedTrainer.certifications && selectedTrainer.certifications.length > 0 && (
                    <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4">
                      <p className="text-[#687B78] text-xs font-medium mb-1.5">Certifications</p>
                      <p className="font-semibold text-[#202828]">
                        {Array.isArray(selectedTrainer.certifications) ? selectedTrainer.certifications.join(', ') : selectedTrainer.certifications}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Section: Fee Info */}
              <div>
                <h4 className="text-xs font-bold text-[#455250] uppercase tracking-wider mb-3">Fee & Payment</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4">
                    <p className="text-[#687B78] text-xs font-medium mb-1.5">Fee</p>
                    <p className="font-semibold text-[#202828]">{selectedTrainer.fee ? `₹${selectedTrainer.fee}` : 'N/A'}</p>
                  </div>
                  <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4">
                    <p className="text-[#687B78] text-xs font-medium mb-1.5">Payment Type</p>
                    <p className="font-semibold text-[#202828]">{selectedTrainer.paymentType || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Section: Availability */}
              <div>
                <h4 className="text-xs font-bold text-[#455250] uppercase tracking-wider mb-3">Availability</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4">
                    <p className="text-[#687B78] text-xs font-medium mb-1.5">Available Days</p>
                    <p className="font-semibold text-[#202828]">{selectedTrainer.availableDays || 'N/A'}</p>
                  </div>
                  <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4">
                    <p className="text-[#687B78] text-xs font-medium mb-1.5">Timings</p>
                    <p className="font-semibold text-[#202828]">
                      {selectedTrainer.availableStartTime || '—'}
                      {(selectedTrainer.availableStartTime) ? ' → ' : ''}
                      {selectedTrainer.availableEndTime || 'N/A'}
                    </p>
                  </div>
                  {selectedTrainer.availableSlot && (
                    <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4 sm:col-span-2">
                      <p className="text-[#687B78] text-xs font-medium mb-1.5">Slot Duration</p>
                      <p className="font-semibold text-[#202828]">{selectedTrainer.availableSlot}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Section: Bio */}
              {selectedTrainer.bio && (
                <div>
                  <h4 className="text-xs font-bold text-[#455250] uppercase tracking-wider mb-3">About</h4>
                  <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4">
                    <p className="text-[#202828] text-sm leading-relaxed">{selectedTrainer.bio}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-[#D3DFDA] bg-[#F2EFE8] flex justify-end gap-3 sticky bottom-0 rounded-b-3xl">
              <button onClick={() => setSelectedTrainer(null)} className="px-5 py-2.5 bg-white border border-[#D3DFDA] text-[#455250] font-medium rounded-xl hover:bg-[#F1F5F9] transition-colors">
                Close
              </button>
              <Link to={`/member/book-session?trainerId=${selectedTrainer._id}`} className="px-5 py-2.5 bg-[#164A4A] text-white font-semibold rounded-xl hover:bg-[#C6A77D] transition-colors flex items-center gap-2 shadow-lg shadow-[#164A4A]/20">
                <Calendar size={18} />
                Book Session Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberFindTrainers;
