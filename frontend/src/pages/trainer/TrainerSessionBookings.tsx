import { useState, useEffect } from 'react';
import { Clock, Calendar as CalendarIcon, Video, MapPin, Loader2, CheckCircle2, FileText, PlaySquare, X, Star } from 'lucide-react';
import api from '../../utils/api';

const TrainerSessionBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modals state
  const [notesModalBooking, setNotesModalBooking] = useState<any | null>(null);
  const [videoModalBooking, setVideoModalBooking] = useState<any | null>(null);

  // Session Notes Form State
  const [notesForm, setNotesForm] = useState({
    exercisesCompleted: '',
    customerPerformance: 'Good',
    problemsNoticed: '',
    dietRecommendations: '',
    workoutModifications: '',
    nextSessionFocus: '',
    additionalComments: ''
  });

  // Video Assignment Form State
  const [videoForm, setVideoForm] = useState({
    title: '',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    exerciseName: '',
    category: 'Strength',
    difficulty: 'Intermediate',
    durationMinutes: 15,
    sets: 3,
    reps: 12,
    instructions: '',
    trainerNotes: ''
  });

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/trainer-sessions/trainer');
      if (res.data.success) {
        setBookings(res.data.sessions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id: string, action: 'accept' | 'reject' | 'complete') => {
    try {
      setActionLoading(id);
      if (action === 'reject') {
        const reason = prompt('Reason for rejection (optional):') || 'Trainer rejected';
        await api.post(`/trainer-sessions/${id}/reject`, { reason });
      } else {
        await api.post(`/trainer-sessions/${id}/${action}`);
      }
      await fetchBookings();
    } catch (err) {
      console.error(err);
      alert(`Failed to ${action} session.`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckIn = async (id: string) => {
    try {
      setActionLoading(id);
      await api.post(`/trainer-sessions/${id}/check-in`);
      await fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Check in failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      setActionLoading(id);
      await api.post(`/trainer-sessions/${id}/check-out`);
      await fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Check out failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitNotes = async () => {
    if (!notesModalBooking) return;
    try {
      setActionLoading(notesModalBooking._id);
      await api.post(`/trainer-sessions/${notesModalBooking._id}/notes`, notesForm);
      setNotesModalBooking(null);
      await fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit session notes');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssignVideo = async () => {
    if (!videoModalBooking) return;
    try {
      setActionLoading(videoModalBooking._id);
      const customerId = videoModalBooking.customerId?._id || videoModalBooking.customerId;
      await api.post('/workout-videos/assign', {
        ...videoForm,
        customerId
      });
      alert('Self-Learning Workout Video assigned to customer successfully!');
      setVideoModalBooking(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign video');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusCategory = (status: string) => {
    if (['Pending', 'Reschedule Requested'].includes(status)) return 'Pending';
    if (['Confirmed', 'Awaiting Payment', 'Upcoming'].includes(status)) return 'Confirmed';
    if (status === 'Completed') return 'Completed';
    if (['Cancelled', 'Rejected', 'Refunded', 'Refund Pending'].includes(status)) return 'Cancelled';
    return 'Other';
  };

  const filtered = filter === 'All' 
    ? bookings 
    : bookings.filter(b => getStatusCategory(b.status) === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#202828] tracking-tight">Session Bookings</h1>
          <p className="text-[#455250] mt-1">Manage online training sessions, attendance check-in, notes & video assignments.</p>
        </div>
        <div className="flex space-x-2 bg-[#F8FAFC] p-1 rounded-xl border border-[#D3DFDA] overflow-x-auto w-fit max-w-full">
          {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${filter === f ? 'bg-[#164A4A] text-white shadow-sm' : 'bg-transparent text-[#455250] hover:bg-[#E8E5DA]'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#164A4A]" size={40} /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(booking => (
              <div key={booking._id} className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col h-full relative overflow-hidden">
                {actionLoading === booking._id && (
                   <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                     <Loader2 className="animate-spin text-[#164A4A]" size={32} />
                   </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#F1F5F9] border border-[#D3DFDA] flex items-center justify-center overflow-hidden shrink-0">
                      {booking.customerId?.profilePhoto ? (
                        <img src={booking.customerId.profilePhoto} alt={booking.customerId.firstName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-[#164A4A]">{booking.customerId?.firstName?.charAt(0) || 'U'}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#202828] leading-tight">
                        {booking.customerId ? `${booking.customerId.firstName} ${booking.customerId.lastName}` : 'Unknown User'}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                          ${getStatusCategory(booking.status) === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                            getStatusCategory(booking.status) === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                            getStatusCategory(booking.status) === 'Completed' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'}`}>
                          {booking.status}
                        </span>
                        {booking.attendanceStatus && (
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                            ${booking.attendanceStatus === 'Present' ? 'bg-emerald-100 text-emerald-800' :
                              booking.attendanceStatus === 'Late' ? 'bg-amber-100 text-amber-800' :
                              booking.attendanceStatus === 'Self-Learning' ? 'bg-indigo-100 text-indigo-800' : 'bg-rose-100 text-rose-800'}`}>
                            {booking.attendanceStatus}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-[#F8FAFC] rounded-full flex items-center justify-center text-[#164A4A] shrink-0" title={`${booking.mode} Session`}>
                    {booking.mode === 'Online' ? <Video size={14} /> : <MapPin size={14} />}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-[#455250] border-t border-[#D3DFDA] pt-3 mb-3">
                  <div className="flex items-center space-x-3">
                    <CalendarIcon size={16} className="text-[#164A4A]" />
                    <span className="font-medium text-[#202828]">{new Date(booking.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock size={16} className="text-[#164A4A]" />
                    <span className="font-medium text-[#202828]">{booking.startTime} - {booking.endTime}</span>
                  </div>
                  {booking.checkInTime && (
                    <div className="text-xs text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      Check-in: {new Date(booking.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {booking.checkOutTime && ` | Check-out: ${new Date(booking.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </div>
                  )}
                  {booking.mode === 'Online' && booking.meetingLink && (
                    <div className="flex items-center space-x-3 mt-2 bg-blue-50 p-2 rounded-lg border border-blue-100">
                      <Video size={16} className="text-blue-600" />
                      <a href={booking.meetingLink} target="_blank" rel="noreferrer" className="text-blue-600 font-semibold hover:underline">
                        Join Meeting Link
                      </a>
                    </div>
                  )}
                </div>

                {/* Session Rating if available */}
                {booking.rating && (
                  <div className="mb-3 bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-xs">
                    <div className="flex items-center gap-1 text-amber-700 font-bold mb-0.5">
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                      Rating: {booking.rating} / 5
                    </div>
                    {booking.review && <p className="text-gray-700 italic">"{booking.review}"</p>}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-auto pt-3 border-t border-[#D3DFDA] space-y-2">
                  {booking.status === 'Pending' && (
                    <div className="flex space-x-3">
                      <button onClick={() => handleUpdateStatus(booking._id, 'reject')} className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold transition-colors text-xs">
                        Reject
                      </button>
                      <button onClick={() => handleUpdateStatus(booking._id, 'accept')} className="flex-1 py-2 bg-[#164A4A] text-white rounded-xl font-semibold hover:bg-[#C6A77D] transition-colors text-xs">
                        Accept
                      </button>
                    </div>
                  )}
                  
                  {booking.status === 'Confirmed' && (
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        {!booking.checkInTime ? (
                          <button onClick={() => handleCheckIn(booking._id)} className="flex-1 py-1.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors text-xs flex items-center justify-center gap-1">
                            <CheckCircle2 size={14} /> Check In
                          </button>
                        ) : !booking.checkOutTime ? (
                          <button onClick={() => handleCheckOut(booking._id)} className="flex-1 py-1.5 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors text-xs flex items-center justify-center gap-1">
                            <Clock size={14} /> Check Out
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-700 font-bold flex items-center gap-1"><CheckCircle2 size={14} /> Checked Out</span>
                        )}
                        <button onClick={() => handleUpdateStatus(booking._id, 'complete')} className="flex-1 py-1.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors text-xs">
                          Complete
                        </button>
                      </div>

                      <div className="flex space-x-2">
                        <button onClick={() => { setNotesModalBooking(booking); setNotesForm({ exercisesCompleted: '', customerPerformance: 'Good', problemsNoticed: '', dietRecommendations: '', workoutModifications: '', nextSessionFocus: '', additionalComments: '' }); }} className="flex-1 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl font-semibold hover:bg-blue-100 transition-colors text-xs flex items-center justify-center gap-1">
                          <FileText size={13} /> Session Notes
                        </button>
                        <button onClick={() => setVideoModalBooking(booking)} className="flex-1 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl font-semibold hover:bg-indigo-100 transition-colors text-xs flex items-center justify-center gap-1">
                          <PlaySquare size={13} /> Assign Video
                        </button>
                      </div>
                    </div>
                  )}

                  {booking.status === 'Completed' && (
                    <div className="flex space-x-2">
                      <button onClick={() => { setNotesModalBooking(booking); setNotesForm(booking.sessionNotes || { exercisesCompleted: '', customerPerformance: 'Good', problemsNoticed: '', dietRecommendations: '', workoutModifications: '', nextSessionFocus: '', additionalComments: '' }); }} className="flex-1 py-1.5 bg-gray-50 border border-gray-200 text-[#164A4A] rounded-xl font-semibold hover:bg-gray-100 transition-colors text-xs flex items-center justify-center gap-1">
                        <FileText size={13} /> {booking.sessionNotes?.exercisesCompleted ? 'View/Edit Notes' : 'Add Notes'}
                      </button>
                      <button onClick={() => setVideoModalBooking(booking)} className="flex-1 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl font-semibold hover:bg-indigo-100 transition-colors text-xs flex items-center justify-center gap-1">
                        <PlaySquare size={13} /> Assign Video
                      </button>
                    </div>
                  )}

                  {booking.status === 'Awaiting Payment' && (
                    <button disabled className="w-full py-2 bg-gray-100 text-gray-400 rounded-xl font-semibold cursor-not-allowed text-xs">
                      Waiting for Customer Payment
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {filtered.length === 0 && (
            <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-16 text-center flex flex-col items-center shadow-sm">
              <CalendarIcon size={48} className="text-[#A8ADA9] mb-4" />
              <h3 className="text-xl font-bold text-[#202828] mb-1">No {filter.toLowerCase()} bookings</h3>
              <p className="text-[#455250]">You don't have any sessions matching this filter right now.</p>
            </div>
          )}
        </>
      )}

      {/* ── Submit Session Notes Modal ───────────────────────── */}
      {notesModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-[#D3DFDA] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-[#202828]">
                Session Notes: {notesModalBooking.customerId?.firstName} {notesModalBooking.customerId?.lastName}
              </h3>
              <button onClick={() => setNotesModalBooking(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#455250] mb-1">Exercises Completed</label>
                <textarea rows={2} value={notesForm.exercisesCompleted} onChange={e => setNotesForm({...notesForm, exercisesCompleted: e.target.value})} placeholder="e.g. Barbell Squats 3x10, Incline Press 4x8, Planks 3x60s" className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:border-[#164A4A] focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#455250] mb-1">Customer Performance</label>
                <select value={notesForm.customerPerformance} onChange={e => setNotesForm({...notesForm, customerPerformance: e.target.value})} className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:border-[#164A4A] focus:outline-none">
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Struggling">Struggling</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#455250] mb-1">Problems / Technique Corrections Noticed</label>
                <input type="text" value={notesForm.problemsNoticed} onChange={e => setNotesForm({...notesForm, problemsNoticed: e.target.value})} placeholder="e.g. Knee valgus on heavy squats, shallow depth" className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:border-[#164A4A] focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#455250] mb-1">Diet Recommendations / Adjustments</label>
                <input type="text" value={notesForm.dietRecommendations} onChange={e => setNotesForm({...notesForm, dietRecommendations: e.target.value})} placeholder="e.g. Increase post-workout protein by 20g" className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:border-[#164A4A] focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#455250] mb-1">Workout Modifications</label>
                <input type="text" value={notesForm.workoutModifications} onChange={e => setNotesForm({...notesForm, workoutModifications: e.target.value})} placeholder="e.g. Substituted Barbell Bench with Dumbbell Bench" className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:border-[#164A4A] focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#455250] mb-1">Next Session Focus</label>
                <input type="text" value={notesForm.nextSessionFocus} onChange={e => setNotesForm({...notesForm, nextSessionFocus: e.target.value})} placeholder="e.g. Lower body mobility and hamstring activation" className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:border-[#164A4A] focus:outline-none" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button onClick={() => setNotesModalBooking(null)} className="px-4 py-2 border border-gray-300 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
              <button onClick={handleSubmitNotes} className="px-5 py-2 bg-[#164A4A] text-white rounded-xl text-sm font-bold hover:bg-[#C6A77D] transition-colors">Save Notes & Complete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Assign Self-Learning Video Modal ───────────────────── */}
      {videoModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#D3DFDA] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-[#202828]">
                Assign Self-Learning Workout Video
              </h3>
              <button onClick={() => setVideoModalBooking(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#455250] mb-1">Video Title *</label>
                <input type="text" value={videoForm.title} onChange={e => setVideoForm({...videoForm, title: e.target.value})} placeholder="e.g. High-Intensity Core Workout" className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:border-[#164A4A] focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#455250] mb-1">Video URL (YouTube / MP4) *</label>
                <input type="text" value={videoForm.videoUrl} onChange={e => setVideoForm({...videoForm, videoUrl: e.target.value})} placeholder="https://www.youtube.com/watch?v=..." className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:border-[#164A4A] focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#455250] mb-1">Exercise Name</label>
                  <input type="text" value={videoForm.exerciseName} onChange={e => setVideoForm({...videoForm, exerciseName: e.target.value})} placeholder="e.g. Dumbbell Romanian Deadlift" className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:border-[#164A4A] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#455250] mb-1">Difficulty</label>
                  <select value={videoForm.difficulty} onChange={e => setVideoForm({...videoForm, difficulty: e.target.value})} className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:border-[#164A4A] focus:outline-none">
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#455250] mb-1">Duration (mins)</label>
                  <input type="number" value={videoForm.durationMinutes} onChange={e => setVideoForm({...videoForm, durationMinutes: parseInt(e.target.value) || 0})} className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:border-[#164A4A] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#455250] mb-1">Sets</label>
                  <input type="number" value={videoForm.sets} onChange={e => setVideoForm({...videoForm, sets: parseInt(e.target.value) || 0})} className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:border-[#164A4A] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#455250] mb-1">Reps</label>
                  <input type="number" value={videoForm.reps} onChange={e => setVideoForm({...videoForm, reps: parseInt(e.target.value) || 0})} className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:border-[#164A4A] focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#455250] mb-1">Trainer Instructions / Notes</label>
                <textarea rows={2} value={videoForm.instructions} onChange={e => setVideoForm({...videoForm, instructions: e.target.value})} placeholder="e.g. Focus on keeping your spine neutral throughout the movement." className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:border-[#164A4A] focus:outline-none" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button onClick={() => setVideoModalBooking(null)} className="px-4 py-2 border border-gray-300 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
              <button onClick={handleAssignVideo} className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">Assign to Customer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerSessionBookings;

