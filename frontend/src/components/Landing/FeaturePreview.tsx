import { Activity, Dumbbell, MapPin, Star, Calendar, MessageSquare, Zap, CheckCircle, Video, Utensils, TrendingUp, Map, Shield, Users, Search, Award } from 'lucide-react';

export const FeaturePreview = ({ slideIndex, items }: { tabId?: string, slideIndex: number, items: string[] }) => {
  const title = items[slideIndex];

  // ==========================================
  // AI COACH FEATURES
  // ==========================================
  if (title === 'AI Fitness Analysis') {
    return (
      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500">
        <div className="bg-[#FFFFFF] border border-[#E7DADD] shadow-xl rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#B76E79] to-[#B76E79]"></div>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-[#B76E79]/10 rounded-full flex items-center justify-center text-[#B76E79]"><Activity size={20}/></div>
            <div>
              <h4 className="font-bold text-[#292524] leading-tight text-lg">AI Fitness Analysis</h4>
              <p className="text-sm text-[#57534E]">Comprehensive Body Scan</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="relative h-40 bg-[#F3E8E8] rounded-xl border border-[#F3E8E8] flex items-end p-4 overflow-hidden">
               <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#B76E79] via-transparent to-transparent"></div>
               <div className="flex items-end space-x-3 w-full h-full px-2">
                 <div className="w-1/5 bg-[#B76E79]/30 rounded-t-lg h-[40%] animate-pulse"></div>
                 <div className="w-1/5 bg-[#B76E79]/50 rounded-t-lg h-[60%] animate-pulse" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-1/5 bg-[#B76E79]/70 rounded-t-lg h-[50%] animate-pulse" style={{ animationDelay: '300ms' }}></div>
                 <div className="w-1/5 bg-[#B76E79]/90 rounded-t-lg h-[80%] animate-pulse" style={{ animationDelay: '450ms' }}></div>
                 <div className="w-1/5 bg-[#B76E79] rounded-t-lg h-[100%] animate-pulse" style={{ animationDelay: '600ms' }}></div>
               </div>
            </div>
            <p className="text-base text-[#57534E]">Your cardiovascular endurance has improved by <span className="font-bold text-[#B76E79]">12%</span> this week.</p>
          </div>
        </div>
      </div>
    );
  }

  if (title === 'Personalized Workout Recommendations') {
    return (
      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500">
        <div className="bg-[#FFFFFF] border border-[#E7DADD] shadow-xl rounded-2xl p-6 relative overflow-hidden">
          <h4 className="font-bold text-[#292524] text-lg mb-4 flex items-center gap-2"><Dumbbell className="text-[#B76E79]" size={20}/> Today's Workout</h4>
          <div className="space-y-3">
            <div className="bg-[#F3E8E8] p-4 rounded-xl border border-[#F3E8E8] flex justify-between items-center">
              <div>
                <p className="font-bold text-[#292524] text-base">Barbell Squats</p>
                <p className="text-sm text-[#57534E]">4 Sets x 8-10 Reps</p>
              </div>
              <span className="bg-[#F3E8E8] text-[#B76E79] px-3 py-1.5 rounded text-sm font-bold">80kg</span>
            </div>
            <div className="bg-[#F3E8E8] p-4 rounded-xl border border-[#F3E8E8] flex justify-between items-center">
              <div>
                <p className="font-bold text-[#292524] text-base">Leg Press</p>
                <p className="text-sm text-[#57534E]">3 Sets x 12 Reps</p>
              </div>
              <span className="bg-[#F3E8E8] text-[#B76E79] px-3 py-1.5 rounded text-sm font-bold">120kg</span>
            </div>
            <button className="w-full py-3 bg-[#FFFFFF] text-white rounded-xl text-base font-bold mt-2 hover:bg-[#333] transition-colors">Start Session</button>
          </div>
        </div>
      </div>
    );
  }

  if (title === 'AI Diet Recommendations') {
    return (
      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500">
        <div className="bg-[#FFFFFF] border border-[#E7DADD] shadow-xl rounded-2xl p-6">
          <h4 className="font-bold text-[#292524] text-lg mb-4 flex items-center gap-2"><Utensils className="text-[#B76E79]" size={20}/> Daily Macros</h4>
          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-4xl font-black text-[#292524]">2,450</p>
              <p className="text-sm text-[#57534E] uppercase font-bold tracking-wider">kcal Goal</p>
            </div>
            <div className="w-20 h-20 rounded-full border-[5px] border-[#B76E79] flex items-center justify-center">
               <span className="font-bold text-lg">65%</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#F3E8E8] p-3 rounded-xl border border-[#F3E8E8] text-center">
               <p className="text-xs text-[#57534E] font-bold">PROTEIN</p>
               <p className="font-bold text-[#292524] text-lg">160g</p>
            </div>
            <div className="bg-[#F3E8E8] p-3 rounded-xl border border-[#F3E8E8] text-center">
               <p className="text-xs text-[#57534E] font-bold">CARBS</p>
               <p className="font-bold text-[#292524] text-lg">220g</p>
            </div>
            <div className="bg-[#F3E8E8] p-3 rounded-xl border border-[#F3E8E8] text-center">
               <p className="text-xs text-[#57534E] font-bold">FATS</p>
               <p className="font-bold text-[#292524] text-lg">65g</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (title === 'Daily Fitness Routine') {
    return (
      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500">
        <div className="bg-[#FFFFFF] border border-[#E7DADD] shadow-xl rounded-2xl p-6">
          <h4 className="font-bold text-[#292524] text-lg mb-4 flex items-center gap-2"><Calendar className="text-[#B76E79]" size={20}/> Today's Schedule</h4>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent pt-4">
             <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-6">
               <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white bg-[#B76E79] shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-[#292524]"><CheckCircle size={16}/></div>
               <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-[#F3E8E8] p-4 rounded-xl border border-[#F3E8E8] shadow-sm"><p className="font-bold text-base">Morning Run</p><p className="text-sm text-[#57534E]">07:00 AM</p></div>
             </div>
             <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
               <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white bg-slate-300 shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-white"></div>
               <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-[#F3E8E8] p-4 rounded-xl border border-[#F3E8E8] shadow-sm"><p className="font-bold text-base">Hypertrophy Session</p><p className="text-sm text-[#57534E]">05:30 PM</p></div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (title === 'Progress-Based Recommendations') {
    return (
      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500">
        <div className="bg-[#FFFFFF] border border-[#E7DADD] shadow-xl rounded-2xl p-6">
          <h4 className="font-bold text-[#292524] text-lg mb-2 flex items-center gap-2"><TrendingUp className="text-[#B76E79]" size={20}/> Weekly Progress</h4>
          <p className="text-sm text-[#57534E] mb-4">You've hit a plateau in Bench Press. We've adjusted your routine.</p>
          <div className="bg-[#F3E8E8] rounded-xl border border-[#F3E8E8] p-5 flex flex-col gap-4">
             <div className="flex items-center justify-between">
                <span className="text-base font-bold text-[#292524]">Old Routine</span>
                <span className="text-sm line-through text-[#57534E]">4x8 @ 80kg</span>
             </div>
             <div className="flex items-center justify-center text-[#B76E79]"><Activity size={24}/></div>
             <div className="flex items-center justify-between bg-[#F3E8E8] p-3 rounded-lg">
                <span className="text-base font-bold text-[#B76E79]">New Recommendation</span>
                <span className="text-sm font-bold text-[#B76E79]">5x5 @ 85kg</span>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // GYM DISCOVERY FEATURES
  // ==========================================
  if (title === 'Discover available gyms') {
    return (
      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500">
        <div className="bg-[#FFFFFF] border border-[#E7DADD] shadow-xl rounded-2xl overflow-hidden relative h-72">
           <div className="absolute inset-0 bg-[#F3E8E8] overflow-hidden">
             {/* Abstract Map Background */}
             <div className="absolute w-full h-full opacity-20" style={{ backgroundImage: 'radial-gradient(#FFFFFF 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
           </div>
           <div className="absolute top-1/4 left-1/4 animate-bounce"><MapPin size={40} className="text-[#B76E79] drop-shadow-lg" fill="white"/></div>
           <div className="absolute top-1/2 right-1/3 animate-bounce" style={{ animationDelay: '200ms' }}><MapPin size={32} className="text-rose-500 drop-shadow-lg" fill="white"/></div>
           <div className="absolute bottom-1/4 left-1/2 animate-bounce" style={{ animationDelay: '400ms' }}><MapPin size={36} className="text-[#B76E79] drop-shadow-lg" fill="white"/></div>
           
           <div className="absolute bottom-4 left-4 right-4 bg-[#FFFFFF]/95 backdrop-blur rounded-xl p-4 shadow-xl flex items-center gap-4 border border-[#F3E8E8]">
              <Search className="text-[#57534E]" size={24}/>
              <div className="flex-1">
                <p className="text-base font-bold text-[#292524]">Search area</p>
                <p className="text-sm text-[#B76E79]">Found 24 gyms nearby</p>
              </div>
           </div>
        </div>
      </div>
    );
  }

  if (title === 'View gym facilities') {
    return (
      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500">
        <div className="bg-[#FFFFFF] border border-[#E7DADD] shadow-xl rounded-2xl p-8">
          <h4 className="font-bold text-[#292524] text-lg mb-6 text-center">Premium Facilities</h4>
          <div className="grid grid-cols-3 gap-6">
             <div className="flex flex-col items-center gap-2 text-center">
               <div className="w-14 h-14 bg-[#F3E8E8] rounded-full flex items-center justify-center text-[#B76E79]"><Zap size={24}/></div>
               <span className="text-xs font-bold text-[#57534E] uppercase tracking-wider">Air Con</span>
             </div>
             <div className="flex flex-col items-center gap-2 text-center">
               <div className="w-14 h-14 bg-[#F3E8E8] rounded-full flex items-center justify-center text-[#B76E79]"><Map size={24}/></div>
               <span className="text-xs font-bold text-[#57534E] uppercase tracking-wider">Parking</span>
             </div>
             <div className="flex flex-col items-center gap-2 text-center">
               <div className="w-14 h-14 bg-[#F3E8E8] rounded-full flex items-center justify-center text-[#B76E79]"><Shield size={24}/></div>
               <span className="text-xs font-bold text-[#57534E] uppercase tracking-wider">Lockers</span>
             </div>
             <div className="flex flex-col items-center gap-2 text-center">
               <div className="w-14 h-14 bg-[#F3E8E8] rounded-full flex items-center justify-center text-[#B76E79]"><Utensils size={24}/></div>
               <span className="text-xs font-bold text-[#57534E] uppercase tracking-wider">Cafe</span>
             </div>
             <div className="flex flex-col items-center gap-2 text-center">
               <div className="w-14 h-14 bg-[#F3E8E8] rounded-full flex items-center justify-center text-[#B76E79]"><Users size={24}/></div>
               <span className="text-xs font-bold text-[#57534E] uppercase tracking-wider">Classes</span>
             </div>
             <div className="flex flex-col items-center gap-2 text-center">
               <div className="w-14 h-14 bg-[#F3E8E8] rounded-full flex items-center justify-center text-[#57534E] opacity-50"><Activity size={24}/></div>
               <span className="text-xs font-bold text-[#57534E] uppercase tracking-wider">Sauna</span>
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (title === 'Equipment information') {
    return (
      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500">
        <div className="bg-[#FFFFFF] border border-[#E7DADD] shadow-xl rounded-2xl overflow-hidden space-y-4 pb-6">
          <div className="relative h-48">
            <img src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80" alt="Equipment" className="w-full h-full object-cover"/>
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/80 to-transparent flex items-end p-5">
               <h4 className="font-bold text-[#292524] text-2xl">Equipment List</h4>
            </div>
          </div>
          <div className="px-5 space-y-3">
            <div className="flex justify-between items-center bg-[#F3E8E8] p-3 rounded-xl border border-[#F3E8E8]">
              <span className="text-base font-semibold text-[#292524]">Treadmills</span>
              <span className="text-sm bg-[#B76E79] text-white font-bold px-3 py-1 rounded">15 Units</span>
            </div>
            <div className="flex justify-between items-center bg-[#F3E8E8] p-3 rounded-xl border border-[#F3E8E8]">
              <span className="text-base font-semibold text-[#292524]">Squat Racks</span>
              <span className="text-sm bg-[#B76E79] text-white font-bold px-3 py-1 rounded">8 Units</span>
            </div>
            <div className="flex justify-between items-center bg-[#F3E8E8] p-3 rounded-xl border border-[#F3E8E8]">
              <span className="text-base font-semibold text-[#292524]">Dumbbell Sets</span>
              <span className="text-sm bg-[#B76E79] text-white font-bold px-3 py-1 rounded">1kg - 50kg</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (title === 'AC / Non-AC information') {
    return (
      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500">
        <div className="bg-[#FFFFFF] border border-[#E7DADD] shadow-xl rounded-2xl p-8 text-center">
           <div className="w-32 h-32 bg-[#F3E8E8] text-[#B76E79] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
             <Zap size={64} />
           </div>
           <h4 className="font-bold text-[#292524] text-2xl mb-4">Climate Control</h4>
           <div className="flex justify-center gap-6 mt-4">
             <div className="bg-[#F3E8E8] border-2 border-[#B76E79] rounded-xl p-4 w-40 relative">
                <div className="absolute -top-2 -right-2 bg-[#B76E79] text-white font-bold rounded-full p-1"><CheckCircle size={16}/></div>
                <p className="font-bold text-[#292524] text-base">AC Area</p>
                <p className="text-xs text-[#57534E] mt-1">Cardio & Machines</p>
             </div>
             <div className="bg-[#F3E8E8] border border-[#F3E8E8] rounded-xl p-4 w-40 opacity-70">
                <p className="font-bold text-[#292524] text-base">Non-AC Area</p>
                <p className="text-xs text-[#57534E] mt-1">Crossfit Zone</p>
             </div>
           </div>
        </div>
      </div>
    );
  }

  if (title === 'Offers') {
    return (
      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500">
        <div className="bg-[#FFFFFF] border border-[#E7DADD] shadow-xl rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Zap size={40} />
          </div>
          <h4 className="font-bold text-[#292524] text-3xl mb-3">Special Offers</h4>
          <p className="text-[#57534E] text-base mb-8">Discover exclusive discounts for annual plans and early bird registrations.</p>
          
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl p-6 shadow-xl mb-4 transform hover:scale-105 transition-transform cursor-pointer">
             <span className="uppercase text-xs font-bold tracking-widest opacity-80">Limited Time</span>
             <h5 className="text-4xl font-black mb-2 mt-1">20% OFF</h5>
             <p className="text-sm">Annual Premium Membership</p>
          </div>
        </div>
      </div>
    );
  }

  if (title === 'Ratings & Reviews') {
    return (
      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500">
        <div className="bg-[#FFFFFF] border border-[#E7DADD] shadow-xl rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-500"></div>
          <div className="text-center mb-8">
            <h4 className="font-bold text-[#292524] text-2xl mb-2">Ratings & Reviews</h4>
            <div className="flex justify-center items-center gap-2 text-yellow-500 font-bold text-2xl">
              4.9 <Star size={24} fill="currentColor" />
            </div>
            <p className="text-sm text-[#57534E] mt-1">Based on 1,245 reviews</p>
          </div>
          
          <div className="space-y-5">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4 pb-5 border-b border-[#F3E8E8] last:border-0 last:pb-0">
                <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-[#292524]">Verified Member</span>
                    <div className="flex gap-1 text-yellow-500">
                      <Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/>
                    </div>
                  </div>
                  <p className="text-sm text-[#57534E] leading-relaxed">"Great facilities and amazing trainers! Highly recommend this gym for everyone looking to improve their fitness journey."</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (title === 'Compare and choose suitable gyms') {
    return (
      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500">
        <div className="bg-[#FFFFFF] border border-[#E7DADD] shadow-xl rounded-2xl p-8">
          <h4 className="font-bold text-[#292524] mb-6 text-xl text-center">Gym Comparison</h4>
          <div className="flex w-full divide-x divide-[#F3E8E8] border border-[#F3E8E8] rounded-xl overflow-hidden text-base">
             <div className="flex-1 bg-[#F3E8E8]">
                <div className="p-4 border-b border-[#F3E8E8] font-bold text-center text-[#292524]">Iron Forge</div>
                <div className="p-3 text-center border-b border-[#F3E8E8] text-[#B76E79]"><CheckCircle size={20} className="mx-auto"/></div>
                <div className="p-3 text-center border-b border-[#F3E8E8] font-bold text-[#292524]">$40/mo</div>
                <div className="p-3 text-center text-[#B76E79]"><CheckCircle size={20} className="mx-auto"/></div>
             </div>
             <div className="flex-1 bg-[#FFFFFF]">
                <div className="p-4 border-b border-[#F3E8E8] font-bold text-center text-[#292524]">Planet Fit</div>
                <div className="p-3 text-center border-b border-[#F3E8E8] text-rose-500"><Activity size={20} className="mx-auto"/></div>
                <div className="p-3 text-center border-b border-[#F3E8E8] font-bold text-[#292524]">$30/mo</div>
                <div className="p-3 text-center text-[#B76E79]"><CheckCircle size={20} className="mx-auto"/></div>
             </div>
          </div>
          <div className="flex justify-between text-xs text-[#57534E] mt-3 px-4 font-bold uppercase tracking-wider">
            <span>Pool</span>
            <span>Price</span>
            <span>24/7</span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // HUMAN TRAINERS FEATURES
  // ==========================================
  if (title === 'Online Trainers') {
    return (
      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500">
        <div className="bg-[#FFFFFF] border border-[#E7DADD] shadow-xl rounded-2xl overflow-hidden relative">
           <div className="h-48 bg-gray-900 relative">
             <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80" alt="Video Call" className="w-full h-full object-cover opacity-70"/>
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center text-white animate-pulse shadow-lg shadow-rose-500/50">
                   <Video size={28}/>
                </div>
             </div>
             <div className="absolute top-4 right-4 flex gap-2 items-center">
               <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
               <span className="text-sm text-white font-bold drop-shadow">LIVE</span>
             </div>
             <div className="absolute bottom-4 right-4 w-24 h-32 bg-black rounded-lg border-2 border-white overflow-hidden shadow-lg">
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80" alt="Self" className="w-full h-full object-cover"/>
             </div>
           </div>
           <div className="p-6 text-center">
             <h4 className="font-bold text-[#292524] text-xl">1-on-1 Virtual Coaching</h4>
             <p className="text-sm text-[#57534E] mt-2">Train from anywhere with elite instructors guiding your form in real-time.</p>
           </div>
        </div>
      </div>
    );
  }

  if (title === 'Offline Trainers') {
    return (
      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500">
        <div className="bg-[#FFFFFF] border border-[#E7DADD] shadow-xl rounded-2xl overflow-hidden relative space-y-4 pb-6">
           <div className="relative h-48">
             <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80" alt="Gym" className="w-full h-full object-cover"/>
             <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/80 to-transparent flex items-end p-5">
                <h4 className="font-bold text-[#292524] text-2xl">In-Person Sessions</h4>
             </div>
           </div>
           <div className="px-5 space-y-4">
             <p className="text-base text-[#57534E]">Book certified trainers at your local Gymora facility for hands-on spotting and motivation.</p>
             <button className="w-full py-3 bg-[#B76E79] text-white font-bold rounded-xl text-base font-bold flex justify-center items-center gap-2">
               <MapPin size={20}/> Find Nearby Trainers
             </button>
           </div>
        </div>
      </div>
    );
  }

  if (title === 'Trainer Expertise' || title === 'Trainer Availability') {
    return (
      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500">
        <div className="bg-[#FFFFFF] border border-[#E7DADD] shadow-xl rounded-2xl overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-[#FFFFFF] to-[#FFFFFF] p-5 flex items-start justify-between">
             <span className="bg-[#FFFFFF]/20 text-white px-3 py-1 rounded text-sm font-bold backdrop-blur-sm">{title}</span>
             <div className="flex gap-2 items-center shrink-0">
               <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
               <span className="text-sm text-green-400 font-bold">Online Now</span>
             </div>
          </div>
          <div className="px-8 pb-8 pt-0 relative flex flex-col items-center text-center">
            <div className="w-32 h-32 bg-[#FFFFFF] p-2 rounded-full -mt-16 mb-4 shadow-lg border border-[#F3E8E8]">
              <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300&q=80" className="w-full h-full object-cover rounded-full" alt="Trainer"/>
            </div>
            <h4 className="font-bold text-[#292524] text-2xl">Sarah Miller</h4>
            <p className="text-[#B76E79] text-base font-semibold mb-6">Elite Transformation Specialist</p>
            
            <div className="w-full grid grid-cols-3 gap-3 border-y border-[#F3E8E8] py-4 mb-6">
              <div><p className="text-xs uppercase tracking-wider text-[#57534E] font-bold">Experience</p><p className="font-bold text-[#292524] text-lg">8 Yrs</p></div>
              <div><p className="text-xs uppercase tracking-wider text-[#57534E] font-bold">Clients</p><p className="font-bold text-[#292524] text-lg">45+</p></div>
              <div><p className="text-xs uppercase tracking-wider text-[#57534E] font-bold">Rating</p><p className="font-bold text-[#292524] text-lg flex justify-center items-center gap-1">5.0 <Star size={16} className="text-yellow-500"/></p></div>
            </div>
            
            {title === 'Trainer Availability' ? (
              <div className="w-full grid grid-cols-2 gap-3">
                 <button className="py-3 bg-[#F3E8E8] border-2 border-[#B76E79] text-[#B76E79] rounded-xl font-bold text-sm">Today 5:00 PM</button>
                 <button className="py-3 bg-[#F3E8E8] border border-[#F3E8E8] text-[#292524] rounded-xl font-bold text-sm hover:bg-[#F3E8E8]">Tomorrow 9:00 AM</button>
              </div>
            ) : (
              <div className="flex w-full gap-4">
                <button className="flex-1 py-3 bg-[#F3E8E8] border border-[#F3E8E8] text-[#292524] rounded-xl font-bold hover:bg-[#F3E8E8] transition-colors flex justify-center items-center gap-2">
                  <MessageSquare size={20} /> Chat
                </button>
                <button className="flex-1 py-3 bg-[#B76E79] text-white font-bold rounded-xl font-bold hover:bg-[#9F5965] transition-colors flex justify-center items-center gap-2">
                  <Calendar size={20} /> Book
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (title === 'Personalized Workout Guidance') {
    return (
      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500">
        <div className="bg-[#FFFFFF] border border-[#E7DADD] shadow-xl rounded-2xl p-8">
          <h4 className="font-bold text-[#292524] mb-6 flex items-center gap-3 text-lg"><MessageSquare className="text-[#B76E79]" size={24}/> Chat with Trainer</h4>
          <div className="bg-[#F3E8E8] border border-[#F3E8E8] rounded-xl p-5 h-64 overflow-y-auto flex flex-col gap-4">
             <div className="bg-[#FFFFFF] p-4 rounded-2xl rounded-tl-none border border-[#F3E8E8] shadow-sm max-w-[85%]">
                <p className="text-sm text-[#292524]">Hey Alex! I saw your squat form video. Try keeping your chest up a bit more on the descent.</p>
             </div>
             <div className="bg-[#B76E79] text-white font-bold p-4 rounded-2xl rounded-tr-none shadow-sm max-w-[85%] self-end">
                <p className="text-sm">Got it, Coach. Should I drop the weight?</p>
             </div>
             <div className="bg-[#FFFFFF] p-4 rounded-2xl rounded-tl-none border border-[#F3E8E8] shadow-sm max-w-[85%]">
                <p className="text-sm text-[#292524]">Yes, let's drop it by 5kg just for today so we can nail the mechanics.</p>
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (title === 'Diet Guidance') {
    return (
      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500">
        <div className="bg-[#FFFFFF] border border-[#E7DADD] shadow-xl rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
             <h4 className="font-bold text-[#292524] flex items-center gap-3 text-lg"><Utensils className="text-[#B76E79]" size={24}/> Meal Approval</h4>
             <span className="bg-[#F3E8E8] text-[#B76E79] px-3 py-1 rounded text-sm font-bold border border-[#E7DADD]">Reviewed</span>
          </div>
          <div className="relative rounded-xl overflow-hidden h-40 mb-5 shadow">
             <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80" alt="Food" className="w-full h-full object-cover"/>
             <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="bg-[#FFFFFF]/95 backdrop-blur rounded-xl p-3 text-center shadow-lg">
                   <p className="font-bold text-[#292524] text-base">Post-Workout Meal</p>
                   <p className="text-sm text-[#B76E79] font-bold">+45g Protein</p>
                </div>
             </div>
          </div>
          <div className="bg-[#F3E8E8] p-4 rounded-xl border border-[#F3E8E8] flex gap-3 items-start">
             <div className="w-8 h-8 rounded-full overflow-hidden shrink-0"><img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=100&q=80" alt="Trainer"/></div>
             <p className="text-sm text-[#57534E] italic mt-1">"Perfect macro breakdown for today's heavy lift session! Keep it up." - Coach Sarah</p>
          </div>
        </div>
      </div>
    );
  }

  if (title === 'Trainer-based Progress Tracking') {
    return (
      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500">
        <div className="bg-[#FFFFFF] border border-[#E7DADD] shadow-xl rounded-2xl p-8">
          <h4 className="font-bold text-[#292524] mb-6 flex items-center gap-3 text-lg"><Award className="text-[#B76E79]" size={24}/> Milestone Unlocked</h4>
          <div className="text-center py-6 bg-gradient-to-b from-[#F3E8E8] to-white rounded-2xl border border-[#E7DADD]">
             <div className="w-20 h-20 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
               <Award size={40} />
             </div>
             <h5 className="font-bold text-[#292524] text-2xl">100kg Deadlift Club</h5>
             <p className="text-sm text-[#57534E] mt-2 px-6">Your trainer has officially certified your new 1RM record.</p>
          </div>
          <button className="w-full py-3 bg-[#FFFFFF] text-white rounded-xl text-base font-bold mt-6 hover:bg-[#333] transition-colors">Share Achievement</button>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
};
