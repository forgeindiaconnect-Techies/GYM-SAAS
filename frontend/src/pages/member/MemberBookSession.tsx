import { useState, useEffect } from 'react';

import { Calendar, Clock, Video, MapPin, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const MemberBookSession = () => {
  const { user } = useAuth();
  const [gym, setGym] = useState<any>(null);
  const [allTrainers, setAllTrainers] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialTrainerId = searchParams.get('trainerId');

  const [formData, setFormData] = useState({ trainerId: initialTrainerId || '', date: '', time: '', type: 'Online' });
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.gymId) {
      api.get(`/gyms/${user.gymId}`)
        .then(res => {
          setGym(res.data.gym);
          if (res.data.gym.trainingMode === 'offline') {
            setFormData(prev => ({ ...prev, type: 'Offline' }));
          } else {
            setFormData(prev => ({ ...prev, type: 'Online' }));
          }
        })
        .catch(err => console.error(err));
    }
  }, [user]);

  useEffect(() => {
    if (user?.gymId) {
      api.get('/trainers/my-gym')
        .then(res => {
          if (res.data.success) {
            setAllTrainers(res.data.trainers || []);
          }
        })
        .catch(err => console.error(err));
    }
  }, [user]);

  // Synchronize session type with selected trainer's capability
  useEffect(() => {
    if (formData.trainerId && allTrainers.length > 0) {
      const selected = allTrainers.find(t => t._id === formData.trainerId);
      if (selected) {
        const mode = (selected.trainingMode || 'online').toLowerCase();
        if (mode === 'online') {
          setFormData(prev => ({ ...prev, type: 'Online' }));
        } else if (mode === 'offline') {
          setFormData(prev => ({ ...prev, type: 'Offline' }));
        } else {
          setFormData(prev => ({ ...prev, type: prev.type || 'Online' }));
        }
      }
    }
  }, [formData.trainerId, allTrainers]);

  useEffect(() => {
    if (gym) {
      const modeFiltered = allTrainers.filter(t => 
        gym.trainingMode === 'both' ? 
          (t.trainingMode === 'both' || t.trainingMode === formData.type.toLowerCase()) : 
          (t.trainingMode === gym.trainingMode || t.trainingMode === 'both' || !t.trainingMode)
      );
      setTrainers(modeFiltered);
    } else {
      setTrainers(allTrainers);
    }
  }, [allTrainers, gym, formData.type]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.trainerId || !formData.date || !formData.time) return;
    
    try {
      setIsSubmitting(true);
      const startParts = formData.time.split(':');
      let hour = parseInt(startParts[0]);
      const minAMPM = startParts[1].split(' ');
      const min = parseInt(minAMPM[0]);
      const ampm = minAMPM[1];
      
      let endHour = hour + 1;
      let endAmpm = ampm;
      if (endHour === 12) {
        endAmpm = ampm === 'AM' ? 'PM' : 'AM';
      } else if (endHour > 12) {
        endHour -= 12;
      }
      
      const computedEndTime = `${endHour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')} ${endAmpm}`;

      const res = await api.post('/trainer-sessions/request', {
        trainerId: formData.trainerId,
        mode: formData.type,
        date: formData.date,
        startTime: formData.time,
        endTime: computedEndTime,
        duration: 60
      });
      
      if (res.data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/member/bookings');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to send booking request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <CheckCircle size={64} className="text-green-500" />
        <h2 className="text-2xl font-bold text-[#344B4A]">Booking Confirmed!</h2>
        <p className="text-[#697778]">Your session request has been sent to the trainer.</p>
        <p className="text-sm text-[#697778]">Redirecting to your bookings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-[#D8EAE7]/50 hover:bg-[#D8EAE7] text-[#344B4A] rounded-full transition-colors">
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-[#344B4A] tracking-tight">Book a Session</h1>
          <p className="text-[#697778] mt-1">Schedule your next training session with an expert.</p>
        </div>
      </div>

      <form onSubmit={handleBook} className="bg-[#FFFFFF] border border-[#D9E2E3] rounded-2xl p-6 md:p-8 space-y-6">
        
        {/* Trainer Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-[#697778]">{initialTrainerId ? 'Selected Trainer' : 'Select Trainer'}</label>
          
          {initialTrainerId ? (
            // Read-only view for pre-selected trainer
            trainers.filter(t => t._id === initialTrainerId).map(t => (
              <div key={t._id} className="flex items-center justify-between p-4 border border-[#167D78] bg-[#167D78]/5 rounded-xl">
                <div className="flex items-center">
                  {t.profilePhoto ? (
                    <img src={t.profilePhoto} alt={t.name} className="w-12 h-12 rounded-full object-cover mr-4 border border-[#D9E2E3]" />
                  ) : (
                    <div className="w-12 h-12 bg-[#D8EAE7] rounded-full flex items-center justify-center text-[#167D78] font-bold mr-4 text-lg">{t.name ? t.name.charAt(0) : '?'}</div>
                  )}
                  <div>
                    <p className="font-bold text-[#344B4A] text-lg">{t.name}</p>
                    <p className="text-sm text-[#697778] font-medium">{t.specialization || 'Trainer'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-[#167D78] text-lg">₹{t.fee || 0}</p>
                  <p className="text-xs text-[#697778]">{t.duration || 60} mins/session</p>
                </div>
              </div>
            ))
          ) : (
            // Grid selection view if no trainer pre-selected
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trainers.map(t => (
                <label key={t._id} className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${formData.trainerId === t._id ? 'border-[#167D78] bg-[#167D78]/5' : 'border-[#D9E2E3] bg-[#FFFFFF] hover:border-[#167D78]/50'}`}>
                  <div className="flex items-center">
                    <input type="radio" name="trainer" value={t._id} checked={formData.trainerId === t._id} onChange={() => setFormData({...formData, trainerId: t._id})} className="hidden" />
                    {t.profilePhoto ? (
                      <img src={t.profilePhoto} alt={t.name} className="w-10 h-10 rounded-full object-cover mr-3 border border-[#D9E2E3]" />
                    ) : (
                      <div className="w-10 h-10 bg-[#D8EAE7] rounded-full flex items-center justify-center text-[#167D78] font-bold mr-3">{t.name ? t.name.charAt(0) : '?'}</div>
                    )}
                    <div>
                      <p className="font-semibold text-[#344B4A]">{t.name}</p>
                      <p className="text-xs text-[#697778]">{t.specialization || 'Trainer'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#167D78]">₹{t.fee || 0}</p>
                    <p className="text-[10px] text-[#697778]">{t.duration || 60} min</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Session Type */}
        {(() => {
          const selectedTrainer = trainers.find(t => t._id === formData.trainerId) || allTrainers.find(t => t._id === formData.trainerId);
          const tMode = (selectedTrainer?.trainingMode || 'offline').toLowerCase(); // default to offline if not set
          
          if (tMode === 'both') {
            return (
              <div className="space-y-3">
                <label className="text-sm font-medium text-[#697778]">Session Type</label>
                <div className="flex space-x-4">
                  <label className={`flex-1 flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${formData.type === 'Offline' ? 'border-[#167D78] bg-[#167D78]/5 text-[#167D78]' : 'border-[#D9E2E3] bg-[#FFFFFF] text-[#697778] hover:border-[#167D78]/50'}`}>
                    <input type="radio" name="type" value="Offline" checked={formData.type === 'Offline'} onChange={() => { setFormData({...formData, type: 'Offline'}) }} className="hidden" />
                    <MapPin size={24} className="mb-2" />
                    <span className="font-medium">In-Gym</span>
                  </label>
                  <label className={`flex-1 flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${formData.type === 'Online' ? 'border-[#167D78] bg-[#167D78]/5 text-[#167D78]' : 'border-[#D9E2E3] bg-[#FFFFFF] text-[#697778] hover:border-[#167D78]/50'}`}>
                    <input type="radio" name="type" value="Online" checked={formData.type === 'Online'} onChange={() => { setFormData({...formData, type: 'Online'}) }} className="hidden" />
                    <Video size={24} className="mb-2" />
                    <span className="font-medium">Online</span>
                  </label>
                </div>
              </div>
            );
          } else {
            return (
              <div className="space-y-3">
                <label className="text-sm font-medium text-[#697778]">Session Type</label>
                <div className="p-4 border border-[#D9E2E3] bg-[#E8EFF0] rounded-xl flex items-center gap-3">
                  {tMode === 'online' ? <Video size={20} className="text-[#167D78]" /> : <MapPin size={20} className="text-[#167D78]" />}
                  <span className="font-semibold text-[#344B4A] capitalize">{tMode} Only</span>
                </div>
              </div>
            );
          }
        })()}

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-[#697778] flex items-center gap-2"><Calendar size={16}/> Select Date</label>
            <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} min={new Date().toISOString().split('T')[0]} className="w-full bg-[#FFFFFF] border border-[#D9E2E3] rounded-xl px-4 py-3 text-[#344B4A] focus:border-[#167D78] focus:ring-1 focus:ring-[#C43D35] transition-all" />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-[#697778] flex items-center gap-2"><Clock size={16}/> Select Time</label>
            <select required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full bg-[#FFFFFF] border border-[#D9E2E3] rounded-xl px-4 py-3 text-[#344B4A] focus:border-[#167D78] focus:ring-1 focus:ring-[#C43D35] transition-all">
              <option value="">Choose a slot</option>
              <option value="09:00 AM">09:00 AM</option>
              <option value="10:00 AM">10:00 AM</option>
              <option value="11:00 AM">11:00 AM</option>
              <option value="04:00 PM">04:00 PM</option>
              <option value="05:00 PM">05:00 PM</option>
              <option value="06:00 PM">06:00 PM</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={isSubmitting || !formData.trainerId || !formData.date || !formData.time} className="w-full py-4 bg-[#167D78] text-white rounded-xl font-bold hover:bg-[#116660] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8">
          {isSubmitting ? 'Sending Request...' : 'Send Booking Request'}
        </button>
      </form>
    </div>
  );
};

export default MemberBookSession;
