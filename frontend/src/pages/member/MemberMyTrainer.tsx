import { useState, useEffect } from 'react';
import { Star, MapPin, Award, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import MemberTrainingTabs from '../../components/Member/MemberTrainingTabs';

const MemberMyTrainer = () => {
  const [trainer, setTrainer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyTrainer = async () => {
      try {
        setLoading(true);
        // First get the user's latest booked session to identify their trainer
        const sessionRes = await api.get('/trainer-sessions/member');
        const sessions = sessionRes.data.sessions;
        
        if (sessions && sessions.length > 0) {
          // Get the trainer ID from the most recent session
          const latestTrainerId = sessions[0].trainerId?._id || sessions[0].trainerId;
          
          if (latestTrainerId) {
            // Fetch full trainer details
            const trainerRes = await api.get(`/trainers/${latestTrainerId}`);
            if (trainerRes.data.trainer) {
              setTrainer(trainerRes.data.trainer);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching trainer details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyTrainer();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-[#64748B]">Loading your trainer details...</div>;
  }

  if (!trainer) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
        <MemberTrainingTabs />
        <div className="p-12 text-center bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl">
          <h1 className="text-3xl font-bold text-[#111827] mb-3">No Trainer Assigned</h1>
          <p className="text-[#64748B] mb-8">You haven't booked a session with a trainer yet.</p>
          <Link to="/member/find-trainers" className="px-6 py-3 bg-[#C2410C] text-white font-bold rounded-xl font-bold hover:bg-[#9A3412] transition-colors">
            Find a Trainer
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <MemberTrainingTabs />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#111827] tracking-tight">My Trainer</h1>
          <p className="text-[#64748B] mt-1">Your dedicated fitness coach and mentor.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Image & Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#F8FAFC] shadow-sm flex flex-col items-center text-center">
            <div className="relative mb-6">
              {trainer.profilePhoto ? (
                <img 
                  src={trainer.profilePhoto} 
                  alt={trainer.name} 
                  className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-xl"
                />
              ) : (
                <div className="w-48 h-48 rounded-full bg-[#F8FAFC] flex items-center justify-center text-5xl font-bold text-[#EA580C] border-4 border-white shadow-xl">
                  {trainer.name?.charAt(0) || 'T'}
                </div>
              )}
              <div className="absolute bottom-2 right-4 bg-[#C2410C] text-white font-bold p-2 rounded-full shadow-lg border-2 border-white">
                <Award size={20} />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-[#111827]">{trainer.name}</h2>
            <p className="text-[#EA580C] font-medium mt-1 mb-4">{trainer.specialization || 'General Fitness'}</p>
            
            <div className="flex items-center justify-center space-x-2 text-sm text-[#64748B] mb-6">
              <Star className="text-yellow-400 fill-yellow-400" size={18} />
              <span className="font-bold text-[#111827]">{trainer.rating || '4.9'}</span>
              <span>({trainer.reviews || '24'} Reviews)</span>
            </div>

          </div>
        </div>

        {/* Right Column: Details & Bio */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#FFFFFF] rounded-3xl p-6 md:p-8 border border-[#F8FAFC] shadow-sm">
            <h3 className="text-xl font-bold text-[#111827] mb-6">About {trainer.name?.split(' ')[0]}</h3>
            <p className="text-[#64748B] leading-relaxed mb-8">
              {trainer.bio || 'This trainer has not added a bio yet.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="bg-[#F8FAFC] p-4 rounded-2xl flex items-center space-x-4 border border-[#F8FAFC]">
                <div className="bg-[#F8FAFC] text-[#EA580C] p-3 rounded-xl">
                  <Award size={24} />
                </div>
                <div>
                  <p className="text-sm text-[#64748B]">Experience</p>
                  <p className="font-bold text-[#111827]">{trainer.experience ? `${trainer.experience} Years` : 'Not specified'}</p>
                </div>
              </div>
              <div className="bg-[#F8FAFC] p-4 rounded-2xl flex items-center space-x-4 border border-[#F8FAFC]">
                <div className="bg-[#F8FAFC] text-[#EA580C] p-3 rounded-xl">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-sm text-[#64748B]">Training Mode</p>
                  <p className="font-bold text-[#111827] capitalize">{trainer.trainingMode || 'In-Person'}</p>
                </div>
              </div>
              {trainer.availability && (
                <div className="bg-[#F8FAFC] p-4 rounded-2xl flex items-center space-x-4 border border-[#F8FAFC] sm:col-span-2">
                  <div className="bg-green-100 text-[#EA580C] p-3 rounded-xl">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-[#64748B]">Availability</p>
                    <p className="font-bold text-[#111827]">{trainer.availability}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Qualifications & Certifications */}
            {(trainer.qualifications || trainer.certifications) && (
              <div className="mb-8 space-y-4">
                <h3 className="text-lg font-bold text-[#111827]">Qualifications & Certifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {trainer.qualifications && (
                    <div className="bg-[#F8FAFC] border border-[#F8FAFC] rounded-xl p-4">
                      <p className="text-[#64748B] text-xs font-medium mb-1.5">Degrees / Qualifications</p>
                      <p className="font-semibold text-[#111827]">{trainer.qualifications}</p>
                    </div>
                  )}
                  {trainer.certifications && (
                    <div className="bg-[#F8FAFC] border border-[#F8FAFC] rounded-xl p-4">
                      <p className="text-[#64748B] text-xs font-medium mb-1.5">Certifications</p>
                      <p className="font-semibold text-[#111827]">{trainer.certifications}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <h3 className="text-lg font-bold text-[#111827] mb-4">Core Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {trainer.expertise ? trainer.expertise.split(',').map((specialty: string, index: number) => (
                <span 
                  key={index}
                  className="bg-green-50 text-[#EA580C] border border-green-200 px-4 py-2 rounded-full text-sm font-semibold"
                >
                  {specialty.trim()}
                </span>
              )) : (
                <span className="bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] px-4 py-2 rounded-full text-sm font-semibold">General Fitness</span>
              )}
            </div>
          </div>

          {/* Current Plan Mini-Card */}
          <div className="bg-gradient-to-r from-[#FFFFFF] to-[#FFFFFF] rounded-3xl p-6 text-white shadow-lg flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg mb-1">Personal Training Plan</h3>
              <p className="text-[#64748B] text-sm">3 sessions remaining this week</p>
            </div>
            <div className="bg-[#FFFFFF]/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20 text-center">
              <span className="block text-2xl font-bold">3</span>
              <span className="text-xs uppercase tracking-wider text-[#64748B]">Left</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberMyTrainer;
