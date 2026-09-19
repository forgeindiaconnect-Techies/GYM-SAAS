import React from 'react';
import { Star, MapPin, Award, MessageCircle, Calendar } from 'lucide-react';

const MemberMyTrainer = () => {
  const trainer = {
    name: 'Alex Johnson',
    specialization: 'Elite Personal Trainer & Nutrition Coach',
    rating: 4.9,
    reviews: 124,
    experience: '8+ Years',
    location: 'Main Floor & HIIT Zone',
    bio: 'Passionate about helping people transform their lives through sustainable fitness and nutrition. I specialize in strength training, HIIT, and functional movement. My philosophy is simple: consistency over perfection.',
    image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=600&q=80',
    specialties: ['Weight Loss', 'Strength Training', 'HIIT', 'Mobility'],
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">My Trainer</h1>
          <p className="text-[#475569] mt-1">Your dedicated fitness coach and mentor.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Image & Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm flex flex-col items-center text-center">
            <div className="relative mb-6">
              <img 
                src={trainer.image} 
                alt={trainer.name} 
                className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-xl"
              />
              <div className="absolute bottom-2 right-4 bg-[#16A34A] text-white p-2 rounded-full shadow-lg border-2 border-white">
                <Award size={20} />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-[#1E293B]">{trainer.name}</h2>
            <p className="text-[#16A34A] font-medium mt-1 mb-4">{trainer.specialization}</p>
            
            <div className="flex items-center justify-center space-x-2 text-sm text-[#475569] mb-6">
              <Star className="text-yellow-400 fill-yellow-400" size={18} />
              <span className="font-bold text-[#1E293B]">{trainer.rating}</span>
              <span>({trainer.reviews} Reviews)</span>
            </div>

            <div className="w-full space-y-3">
              <button className="w-full py-3 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition-all shadow-lg shadow-green-500/20 flex items-center justify-center space-x-2">
                <MessageCircle size={20} />
                <span>Message Trainer</span>
              </button>
              <button className="w-full py-3 bg-white text-[#16A34A] border-2 border-[#16A34A] rounded-xl font-bold hover:bg-green-50 transition-all flex items-center justify-center space-x-2">
                <Calendar size={20} />
                <span>Book Session</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Bio */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E2E8F0] shadow-sm">
            <h3 className="text-xl font-bold text-[#1E293B] mb-6">About {trainer.name.split(' ')[0]}</h3>
            <p className="text-[#475569] leading-relaxed mb-8">
              {trainer.bio}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="bg-[#F8FAFC] p-4 rounded-2xl flex items-center space-x-4 border border-[#E2E8F0]">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                  <Award size={24} />
                </div>
                <div>
                  <p className="text-sm text-[#64748B]">Experience</p>
                  <p className="font-bold text-[#1E293B]">{trainer.experience}</p>
                </div>
              </div>
              <div className="bg-[#F8FAFC] p-4 rounded-2xl flex items-center space-x-4 border border-[#E2E8F0]">
                <div className="bg-purple-100 text-purple-600 p-3 rounded-xl">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-sm text-[#64748B]">Usual Location</p>
                  <p className="font-bold text-[#1E293B]">{trainer.location}</p>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold text-[#1E293B] mb-4">Core Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {trainer.specialties.map((specialty, index) => (
                <span 
                  key={index}
                  className="bg-green-50 text-[#16A34A] border border-green-200 px-4 py-2 rounded-full text-sm font-semibold"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>

          {/* Current Plan Mini-Card */}
          <div className="bg-gradient-to-r from-[#1E293B] to-[#334155] rounded-3xl p-6 text-white shadow-lg flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg mb-1">Personal Training Plan</h3>
              <p className="text-gray-300 text-sm">3 sessions remaining this week</p>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20 text-center">
              <span className="block text-2xl font-bold">3</span>
              <span className="text-xs uppercase tracking-wider text-gray-300">Left</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberMyTrainer;
