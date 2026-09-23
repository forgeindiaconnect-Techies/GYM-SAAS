import { useState, useEffect } from 'react';
import { Search, Star, Calendar, Eye, X, Award, FileText, CheckCircle2 } from 'lucide-react';
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
        const response = await api.get('/trainers/my-gym');
        if (response.data.success) {
          setTrainers(response.data.trainers);
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
          <h1 className="text-3xl font-bold text-[#202522] tracking-tight">Find Trainers</h1>
          <p className="text-[#4A514D] mt-1">Discover expert trainers at your gym and book a session.</p>
        </div>
        <div className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="Search by name or spec..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl pl-10 pr-4 py-2 text-[#202522] focus:border-[#34483F] focus:ring-1 focus:ring-[#EF4444] transition-all"
          />
          <Search className="absolute left-3 top-2.5 text-[#4A514D]" size={18} />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-[#4A514D]">Loading trainers...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(trainer => (
              <div key={trainer._id} className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6 hover:border-[#34483F]/50 transition-colors flex flex-col h-full">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-[#FFFFFF] rounded-full flex items-center justify-center text-xl font-bold text-[#34483F] border border-[#DCD9CD] overflow-hidden">
                    {trainer.profilePhoto ? (
                      <img src={trainer.profilePhoto} alt={trainer.name} className="w-full h-full object-cover" />
                    ) : (
                      trainer.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#202522]">{trainer.name}</h3>
                    <p className="text-sm text-[#34483F] font-medium">{trainer.specialization || 'General Fitness'}</p>
                    <div className="flex items-center space-x-1 mt-1 text-[#4A514D] text-xs">
                      <Star size={12} className="text-yellow-500 fill-yellow-500" />
                      <span>{trainer.rating || '4.8'} ({trainer.reviewCount || '24'} reviews)</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-[#DCD9CD] space-y-2 text-sm text-[#4A514D] flex-1">
                  <p><span className="text-[#202522]">Experience:</span> {trainer.experience ? `${trainer.experience} years` : 'Not specified'}</p>
                  <p><span className="text-[#202522]">Availability:</span> {trainer.availability || 'Weekdays'}</p>
                  {trainer.trainingMode && (
                    <p><span className="text-[#202522]">Mode:</span> <span className="capitalize">{trainer.trainingMode}</span></p>
                  )}
                </div>
                
                <div className="mt-6 flex gap-3">
                  <button onClick={() => setSelectedTrainer(trainer)} className="flex-1 flex justify-center items-center space-x-2 py-2 bg-[#F1F5F9] text-[#202522] border border-[#DCD9CD] rounded-xl font-semibold hover:bg-[#E8E5DA] transition-colors">
                    <Eye size={16} />
                    <span>View Details</span>
                  </button>
                  <Link to={`/member/book-session?trainerId=${trainer._id}`} className="flex-1 flex justify-center items-center space-x-2 py-2 bg-[#34483F] text-white rounded-xl font-semibold hover:bg-[#C6A77D] transition-colors">
                    <Calendar size={16} />
                    <span>Book Session</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {filtered.length === 0 && (
            <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-12 text-center">
              <p className="text-[#4A514D] text-lg">No trainers found matching your search.</p>
            </div>
          )}
        </>
      )}

      {/* Trainer Details Modal */}
      {selectedTrainer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-scale-in flex flex-col shadow-2xl border border-[#DCD9CD]">
            <div className="flex justify-between items-center p-6 border-b border-[#DCD9CD] sticky top-0 bg-white/95 backdrop-blur z-10">
              <h2 className="text-xl font-bold text-[#202522]">Trainer Profile</h2>
              <button onClick={() => setSelectedTrainer(null)} className="text-[#4A514D] hover:bg-[#F1F5F9] p-2 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 md:p-8 space-y-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-32 h-32 bg-[#F1F5F9] rounded-2xl flex items-center justify-center text-4xl font-bold text-[#34483F] border-4 border-[#DCD9CD] overflow-hidden shadow-lg shrink-0">
                  {selectedTrainer.profilePhoto ? (
                    <img src={selectedTrainer.profilePhoto} alt={selectedTrainer.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedTrainer.name.charAt(0)
                  )}
                </div>
                <div className="text-center md:text-left flex-1">
                  <h3 className="text-3xl font-bold text-[#202522] mb-2">{selectedTrainer.name}</h3>
                  <p className="text-lg text-[#34483F] font-semibold mb-3">{selectedTrainer.specialization || 'General Fitness'}</p>
                  
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
                <h4 className="text-xs font-bold text-[#4A514D] uppercase tracking-wider mb-3">Contact Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4">
                    <p className="text-[#727975] text-xs font-medium mb-1.5">Email</p>
                    <p className="font-semibold text-[#202522]">{selectedTrainer.email || 'N/A'}</p>
                  </div>
                  <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4">
                    <p className="text-[#727975] text-xs font-medium mb-1.5">Phone</p>
                    <p className="font-semibold text-[#202522]">{selectedTrainer.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Section: Professional Info */}
              <div>
                <h4 className="text-xs font-bold text-[#4A514D] uppercase tracking-wider mb-3">Professional Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4">
                    <p className="text-[#727975] text-xs font-medium mb-1.5">Specialization</p>
                    <p className="font-semibold text-[#202522]">{selectedTrainer.specialization || 'N/A'}</p>
                  </div>
                  <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4">
                    <p className="text-[#727975] text-xs font-medium mb-1.5">Experience</p>
                    <p className="font-semibold text-[#202522]">{selectedTrainer.experience ? `${selectedTrainer.experience} Years` : 'N/A'}</p>
                  </div>
                  <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4">
                    <p className="text-[#727975] text-xs font-medium mb-1.5">Training Mode</p>
                    <p className="font-semibold text-[#202522] capitalize">{selectedTrainer.trainingMode || 'N/A'}</p>
                  </div>
                  <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4">
                    <p className="text-[#727975] text-xs font-medium mb-1.5">Qualifications</p>
                    <p className="font-semibold text-[#202522]">
                      {selectedTrainer.qualifications && selectedTrainer.qualifications.length > 0 
                        ? (Array.isArray(selectedTrainer.qualifications) ? selectedTrainer.qualifications.join(', ') : selectedTrainer.qualifications) 
                        : 'N/A'}
                    </p>
                  </div>
                  {selectedTrainer.expertise && selectedTrainer.expertise.length > 0 && (
                    <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4">
                      <p className="text-[#727975] text-xs font-medium mb-1.5">Expertise</p>
                      <p className="font-semibold text-[#202522]">
                        {Array.isArray(selectedTrainer.expertise) ? selectedTrainer.expertise.join(', ') : selectedTrainer.expertise}
                      </p>
                    </div>
                  )}
                  {selectedTrainer.certifications && selectedTrainer.certifications.length > 0 && (
                    <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4">
                      <p className="text-[#727975] text-xs font-medium mb-1.5">Certifications</p>
                      <p className="font-semibold text-[#202522]">
                        {Array.isArray(selectedTrainer.certifications) ? selectedTrainer.certifications.join(', ') : selectedTrainer.certifications}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Section: Fee Info */}
              <div>
                <h4 className="text-xs font-bold text-[#4A514D] uppercase tracking-wider mb-3">Fee & Payment</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4">
                    <p className="text-[#727975] text-xs font-medium mb-1.5">Fee</p>
                    <p className="font-semibold text-[#202522]">{selectedTrainer.fee ? `₹${selectedTrainer.fee}` : 'N/A'}</p>
                  </div>
                  <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4">
                    <p className="text-[#727975] text-xs font-medium mb-1.5">Payment Type</p>
                    <p className="font-semibold text-[#202522]">{selectedTrainer.paymentType || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Section: Availability */}
              <div>
                <h4 className="text-xs font-bold text-[#4A514D] uppercase tracking-wider mb-3">Availability</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4">
                    <p className="text-[#727975] text-xs font-medium mb-1.5">Available Days</p>
                    <p className="font-semibold text-[#202522]">{selectedTrainer.availableDays || 'N/A'}</p>
                  </div>
                  <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4">
                    <p className="text-[#727975] text-xs font-medium mb-1.5">Timings</p>
                    <p className="font-semibold text-[#202522]">
                      {selectedTrainer.availableStartTime || '—'}
                      {(selectedTrainer.availableStartTime) ? ' → ' : ''}
                      {selectedTrainer.availableEndTime || 'N/A'}
                    </p>
                  </div>
                  {selectedTrainer.availableSlot && (
                    <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4 sm:col-span-2">
                      <p className="text-[#727975] text-xs font-medium mb-1.5">Slot Duration</p>
                      <p className="font-semibold text-[#202522]">{selectedTrainer.availableSlot}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Section: Bio */}
              {selectedTrainer.bio && (
                <div>
                  <h4 className="text-xs font-bold text-[#4A514D] uppercase tracking-wider mb-3">About</h4>
                  <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4">
                    <p className="text-[#202522] text-sm leading-relaxed">{selectedTrainer.bio}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-[#DCD9CD] bg-[#F2EFE8] flex justify-end gap-3 sticky bottom-0 rounded-b-3xl">
              <button onClick={() => setSelectedTrainer(null)} className="px-5 py-2.5 bg-white border border-[#DCD9CD] text-[#4A514D] font-medium rounded-xl hover:bg-[#F1F5F9] transition-colors">
                Close
              </button>
              <Link to={`/member/book-session?trainerId=${selectedTrainer._id}`} className="px-5 py-2.5 bg-[#34483F] text-white font-semibold rounded-xl hover:bg-[#C6A77D] transition-colors flex items-center gap-2 shadow-lg shadow-[#34483F]/20">
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
