import { useState, useEffect } from 'react';
import { Search, Star, Calendar, Eye, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import MemberTrainingTabs from '../../components/Member/MemberTrainingTabs';

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
      <MemberTrainingTabs />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#292524] tracking-tight">Find Trainers</h1>
          <p className="text-[#57534E] mt-1">Select an active online trainer to review your AI Analysis and guide your live training.</p>
        </div>
        <div className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="Search by name or spec..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#E7DADD] rounded-xl pl-10 pr-4 py-2 text-[#292524] placeholder:text-[#57534E] focus:border-[#B76E79] focus:ring-1 focus:ring-[#B76E79]/20 transition-all outline-none"
          />
          <Search className="absolute left-3 top-2.5 text-[#57534E]" size={18} />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-[#57534E]">Loading online trainers...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(trainer => (
              <div key={trainer._id} className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl p-6 hover:border-[#B76E79]/50 transition-colors flex flex-col h-full shadow-lg relative overflow-hidden">
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                    trainer.availabilityStatus === 'Offline' ? 'bg-[#F3E8E8] text-[#57534E] border border-[#E7DADD]' : 'bg-[#B76E79]/15 text-[#B76E79] border border-[#B76E79]/30'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${trainer.availabilityStatus === 'Offline' ? 'bg-gray-400' : 'bg-[#B76E79] animate-pulse'}`} />
                    {trainer.availabilityStatus || 'Available'}
                  </span>
                  <span className="text-xs font-semibold text-[#B76E79] bg-[#B76E79]/10 border border-[#B76E79]/20 px-2 py-0.5 rounded-md capitalize">
                    {trainer.trainingMode === 'both' ? 'Online & Gym' : (trainer.trainingMode || 'Online')}
                  </span>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-[#F3E8E8] rounded-full flex items-center justify-center text-xl font-bold text-[#B76E79] border border-[#B76E79]/40 overflow-hidden shrink-0 shadow-md">
                    {trainer.profilePhoto ? (
                      <img src={trainer.profilePhoto} alt={trainer.name} className="w-full h-full object-cover" />
                    ) : (
                      trainer.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-[#292524] truncate">{trainer.name}</h3>
                    <p className="text-sm text-[#B76E79] font-semibold truncate">{trainer.specialization || 'Fitness Specialist'}</p>
                    <div className="flex items-center space-x-1 mt-1 text-[#57534E] text-xs">
                      <Star size={13} className="text-amber-400 fill-amber-400 shrink-0" />
                      <span className="font-bold text-[#292524]">{trainer.averageRating || trainer.rating || '5.0'}</span>
                      <span className="text-[#57534E]">({trainer.totalReviews || trainer.reviewCount || '12'} reviews)</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-[#E7DADD] space-y-2 text-sm text-[#292524] flex-1">
                  <p><span className="text-[#292524] font-semibold">Experience:</span> {trainer.experience ? `${trainer.experience} years` : '3+ years'}</p>
                  <p><span className="text-[#292524] font-semibold">Expertise:</span> {
                    typeof trainer.expertise === 'string'
                      ? trainer.expertise.split('\n').filter(Boolean).join(' • ')
                      : (Array.isArray(trainer.expertise) ? trainer.expertise.join(' • ') : (trainer.expertise || trainer.specialization || 'Strength & Conditioning'))
                  }</p>
                  <p><span className="text-[#292524] font-semibold">Available Slots:</span> {trainer.availableSlot || 5} per day ({trainer.availableStartTime || '09:00 AM'} - {trainer.availableEndTime || '06:00 PM'})</p>
                </div>
                
                <div className="mt-6 flex items-center gap-2">
                  <button 
                    onClick={() => setSelectedTrainer(trainer)} 
                    className="flex-1 py-2.5 px-3 bg-[#F3E8E8] text-[#292524] border border-[#E7DADD] rounded-xl font-bold text-xs sm:text-sm hover:bg-[#F3E8E8] hover:border-[#B76E79]/40 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shadow-xs min-w-0 cursor-pointer"
                  >
                    <Eye size={15} className="shrink-0 text-[#B76E79]" />
                    <span className="whitespace-nowrap truncate">View Details</span>
                  </button>
                  <Link 
                    to={`/member/book-session?trainerId=${trainer._id}`} 
                    className="flex-1 py-2.5 px-3 bg-[#B76E79] text-white font-bold rounded-xl font-bold text-xs sm:text-sm hover:bg-[#9F5965] transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shadow-xs min-w-0 cursor-pointer"
                  >
                    <Calendar size={15} className="shrink-0" />
                    <span className="whitespace-nowrap truncate">Book Session</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {filtered.length === 0 && (
            <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl p-12 text-center">
              <p className="text-[#57534E] text-lg">No trainers found matching your search.</p>
            </div>
          )}
        </>
      )}

      {/* Trainer Details Modal */}
      {selectedTrainer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-scale-in flex flex-col shadow-2xl border border-[#E7DADD]">
            <div className="flex justify-between items-center p-6 border-b border-[#E7DADD] sticky top-0 bg-[#FFFFFF]/95 backdrop-blur z-10">
              <h2 className="text-xl font-bold text-[#292524]">Trainer Profile</h2>
              <button onClick={() => setSelectedTrainer(null)} className="text-[#57534E] hover:bg-[#F3E8E8] p-2 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 md:p-8 space-y-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-32 h-32 bg-[#F3E8E8] rounded-2xl flex items-center justify-center text-4xl font-bold text-[#B76E79] border-4 border-[#E7DADD] overflow-hidden shadow-lg shrink-0">
                  {selectedTrainer.profilePhoto ? (
                    <img src={selectedTrainer.profilePhoto} alt={selectedTrainer.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedTrainer.name.charAt(0)
                  )}
                </div>
                <div className="text-center md:text-left flex-1">
                  <h3 className="text-3xl font-bold text-[#292524] mb-2">{selectedTrainer.name}</h3>
                  <p className="text-lg text-[#B76E79] font-semibold mb-3">{selectedTrainer.specialization || 'General Fitness'}</p>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 text-amber-400 rounded-xl text-sm font-semibold border border-amber-500/30">
                      <Star size={16} className="fill-amber-400 text-amber-400" />
                      <span>{selectedTrainer.rating || '4.8'} Rating</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Contact Info */}
              <div>
                <h4 className="text-xs font-bold text-[#57534E] uppercase tracking-wider mb-3">Contact Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-[#F3E8E8] border border-[#F3E8E8] rounded-xl p-4">
                    <p className="text-[#57534E] text-xs font-medium mb-1.5">Email</p>
                    <p className="font-semibold text-[#292524]">{selectedTrainer.email || 'N/A'}</p>
                  </div>
                  <div className="bg-[#F3E8E8] border border-[#F3E8E8] rounded-xl p-4">
                    <p className="text-[#57534E] text-xs font-medium mb-1.5">Phone</p>
                    <p className="font-semibold text-[#292524]">{selectedTrainer.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Section: Professional Info */}
              <div>
                <h4 className="text-xs font-bold text-[#57534E] uppercase tracking-wider mb-3">Professional Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-[#F3E8E8] border border-[#F3E8E8] rounded-xl p-4">
                    <p className="text-[#57534E] text-xs font-medium mb-1.5">Specialization</p>
                    <p className="font-semibold text-[#292524]">{selectedTrainer.specialization || 'N/A'}</p>
                  </div>
                  <div className="bg-[#F3E8E8] border border-[#F3E8E8] rounded-xl p-4">
                    <p className="text-[#57534E] text-xs font-medium mb-1.5">Experience</p>
                    <p className="font-semibold text-[#292524]">{selectedTrainer.experience ? `${selectedTrainer.experience} Years` : 'N/A'}</p>
                  </div>
                  <div className="bg-[#F3E8E8] border border-[#F3E8E8] rounded-xl p-4">
                    <p className="text-[#57534E] text-xs font-medium mb-1.5">Training Mode</p>
                    <p className="font-semibold text-[#292524] capitalize">{selectedTrainer.trainingMode || 'N/A'}</p>
                  </div>
                  <div className="bg-[#F3E8E8] border border-[#F3E8E8] rounded-xl p-4">
                    <p className="text-[#57534E] text-xs font-medium mb-1.5">Qualifications</p>
                    <p className="font-semibold text-[#292524]">
                      {selectedTrainer.qualifications && selectedTrainer.qualifications.length > 0 
                        ? (Array.isArray(selectedTrainer.qualifications) ? selectedTrainer.qualifications.join(', ') : selectedTrainer.qualifications) 
                        : 'N/A'}
                    </p>
                  </div>
                  {selectedTrainer.expertise && selectedTrainer.expertise.length > 0 && (
                    <div className="bg-[#F3E8E8] border border-[#F3E8E8] rounded-xl p-4">
                      <p className="text-[#57534E] text-xs font-medium mb-1.5">Expertise</p>
                      <p className="font-semibold text-[#292524]">
                        {Array.isArray(selectedTrainer.expertise) ? selectedTrainer.expertise.join(', ') : selectedTrainer.expertise}
                      </p>
                    </div>
                  )}
                  {selectedTrainer.certifications && selectedTrainer.certifications.length > 0 && (
                    <div className="bg-[#F3E8E8] border border-[#F3E8E8] rounded-xl p-4">
                      <p className="text-[#57534E] text-xs font-medium mb-1.5">Certifications</p>
                      <p className="font-semibold text-[#292524]">
                        {Array.isArray(selectedTrainer.certifications) ? selectedTrainer.certifications.join(', ') : selectedTrainer.certifications}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Section: Fee Info */}
              <div>
                <h4 className="text-xs font-bold text-[#57534E] uppercase tracking-wider mb-3">Fee & Payment</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-[#F3E8E8] border border-[#F3E8E8] rounded-xl p-4">
                    <p className="text-[#57534E] text-xs font-medium mb-1.5">Fee</p>
                    <p className="font-semibold text-[#292524]">{selectedTrainer.fee ? `₹${selectedTrainer.fee}` : 'N/A'}</p>
                  </div>
                  <div className="bg-[#F3E8E8] border border-[#F3E8E8] rounded-xl p-4">
                    <p className="text-[#57534E] text-xs font-medium mb-1.5">Payment Type</p>
                    <p className="font-semibold text-[#292524]">{selectedTrainer.paymentType || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Section: Availability */}
              <div>
                <h4 className="text-xs font-bold text-[#57534E] uppercase tracking-wider mb-3">Availability</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-[#F3E8E8] border border-[#F3E8E8] rounded-xl p-4">
                    <p className="text-[#57534E] text-xs font-medium mb-1.5">Available Days</p>
                    <p className="font-semibold text-[#292524]">{selectedTrainer.availableDays || 'N/A'}</p>
                  </div>
                  <div className="bg-[#F3E8E8] border border-[#F3E8E8] rounded-xl p-4">
                    <p className="text-[#57534E] text-xs font-medium mb-1.5">Timings</p>
                    <p className="font-semibold text-[#292524]">
                      {selectedTrainer.availableStartTime || '—'}
                      {(selectedTrainer.availableStartTime) ? ' → ' : ''}
                      {selectedTrainer.availableEndTime || 'N/A'}
                    </p>
                  </div>
                  {selectedTrainer.availableSlot && (
                    <div className="bg-[#F3E8E8] border border-[#F3E8E8] rounded-xl p-4 sm:col-span-2">
                      <p className="text-[#57534E] text-xs font-medium mb-1.5">Slot Duration</p>
                      <p className="font-semibold text-[#292524]">{selectedTrainer.availableSlot}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Section: Bio */}
              {selectedTrainer.bio && (
                <div>
                  <h4 className="text-xs font-bold text-[#57534E] uppercase tracking-wider mb-3">About</h4>
                  <div className="bg-[#F3E8E8] border border-[#F3E8E8] rounded-xl p-4">
                    <p className="text-[#292524] text-sm leading-relaxed">{selectedTrainer.bio}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-[#E7DADD] bg-[#F3E8E8] flex justify-end gap-3 sticky bottom-0 rounded-b-3xl">
              <button onClick={() => setSelectedTrainer(null)} className="px-5 py-2.5 bg-[#FFFFFF] border border-[#E7DADD] text-[#57534E] font-medium rounded-xl hover:bg-[#F3E8E8] transition-colors">
                Close
              </button>
              <Link to={`/member/book-session?trainerId=${selectedTrainer._id}`} className="px-5 py-2.5 bg-[#B76E79] text-white font-bold font-semibold rounded-xl hover:bg-[#9F5965] transition-colors flex items-center gap-2 shadow-lg shadow-[#B76E79]/20">
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
