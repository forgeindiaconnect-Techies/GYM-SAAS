import { useState, useEffect } from 'react';
import { getDb, addItem } from '../../utils/mockDb';
import { Calendar, Clock, Video, MapPin, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const MemberBookSession = () => {
  const { user } = useAuth();
  const [gym, setGym] = useState<any>(null);
  const [allTrainers, setAllTrainers] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [formData, setFormData] = useState({ trainerId: '', date: '', time: '', type: 'Offline' });
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.gymId) {
      api.get(`/gyms/${user.gymId}`)
        .then(res => {
          setGym(res.data.gym);
          if (res.data.gym.trainingMode === 'online') {
            setFormData(prev => ({ ...prev, type: 'Online' }));
          } else {
            setFormData(prev => ({ ...prev, type: 'Offline' }));
          }
        })
        .catch(err => console.error(err));
    }
  }, [user]);

  useEffect(() => {
    setAllTrainers(getDb('trainers').filter((t: any) => t.status === 'Active'));
  }, []);

  useEffect(() => {
    if (gym) {
      const modeFiltered = allTrainers.filter(t => 
        gym.trainingMode === 'both' ? 
          (t.trainerMode === 'both' || t.trainerMode === formData.type.toLowerCase()) : 
          (t.trainerMode === gym.trainingMode || t.trainerMode === 'both' || !t.trainerMode)
      );
      setTrainers(modeFiltered);
    } else {
      setTrainers(allTrainers);
    }
  }, [allTrainers, gym, formData.type]);

  const handleBook = (e) => {
    e.preventDefault();
    if (!formData.trainerId || !formData.date || !formData.time) return;
    
    addItem('bookings', {
      ...formData,
      status: 'Pending',
      memberId: 'currentUser', // Mocked user ID
      createdAt: new Date().toISOString()
    });
    
    setIsSuccess(true);
    setTimeout(() => {
      navigate('/member/bookings');
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <CheckCircle size={64} className="text-green-500" />
        <h2 className="text-2xl font-bold text-[#1E293B]">Booking Confirmed!</h2>
        <p className="text-[#475569]">Your session request has been sent to the trainer.</p>
        <p className="text-sm text-[#475569]">Redirecting to your bookings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Book a Session</h1>
        <p className="text-[#475569] mt-1">Schedule your next training session with an expert.</p>
      </div>

      <form onSubmit={handleBook} className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6 md:p-8 space-y-6">
        
        {/* Trainer Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-[#475569]">Select Trainer</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trainers.map(t => (
              <label key={t.id} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.trainerId === t.id ? 'border-[#16A34A] bg-[#16A34A]/5' : 'border-[#CCFBF1] bg-[#FFFFFF] hover:border-[#444]'}`}>
                <input type="radio" name="trainer" value={t.id} checked={formData.trainerId === t.id} onChange={() => setFormData({...formData, trainerId: t.id})} className="hidden" />
                <div className="w-10 h-10 bg-[#E2E8F0] rounded-full flex items-center justify-center text-[#EF4444] font-bold mr-3">{t.name.charAt(0)}</div>
                <div>
                  <p className="font-semibold text-[#1E293B]">{t.name}</p>
                  <p className="text-xs text-[#475569]">{t.spec}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Session Type */}
        {gym?.trainingMode === 'both' && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-[#475569]">Session Type</label>
            <div className="flex space-x-4">
              <label className={`flex-1 flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${formData.type === 'Offline' ? 'border-[#16A34A] bg-[#16A34A]/5 text-[#16A34A]' : 'border-[#CCFBF1] bg-[#FFFFFF] text-[#475569] hover:border-[#444]'}`}>
                <input type="radio" name="type" value="Offline" checked={formData.type === 'Offline'} onChange={() => { setFormData({...formData, type: 'Offline', trainerId: ''}) }} className="hidden" />
                <MapPin size={24} className="mb-2" />
                <span className="font-medium">In-Gym</span>
              </label>
              <label className={`flex-1 flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${formData.type === 'Online' ? 'border-[#16A34A] bg-[#16A34A]/5 text-[#16A34A]' : 'border-[#CCFBF1] bg-[#FFFFFF] text-[#475569] hover:border-[#444]'}`}>
                <input type="radio" name="type" value="Online" checked={formData.type === 'Online'} onChange={() => { setFormData({...formData, type: 'Online', trainerId: ''}) }} className="hidden" />
                <Video size={24} className="mb-2" />
                <span className="font-medium">Online</span>
              </label>
            </div>
          </div>
        )}

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-[#475569] flex items-center gap-2"><Calendar size={16}/> Select Date</label>
            <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} min={new Date().toISOString().split('T')[0]} className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl px-4 py-3 text-[#1E293B] focus:border-[#16A34A] focus:ring-1 focus:ring-[#EF4444] transition-all" />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-[#475569] flex items-center gap-2"><Clock size={16}/> Select Time</label>
            <select required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl px-4 py-3 text-[#1E293B] focus:border-[#16A34A] focus:ring-1 focus:ring-[#EF4444] transition-all">
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

        <button type="submit" disabled={!formData.trainerId || !formData.date || !formData.time} className="w-full py-4 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8">
          Confirm Booking Request
        </button>
      </form>
    </div>
  );
};

export default MemberBookSession;
