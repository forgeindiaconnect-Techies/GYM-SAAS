import { Bot, User, MapPin, Activity, ArrowRight, CheckCircle, XCircle, TrendingUp, Dumbbell, ShieldCheck, Calendar, FileText, Settings, HeartPulse, CreditCard, Monitor } from 'lucide-react';

export const TourSlide = ({ journey, step, setJourney }: { journey: 'select' | 'customer' | 'owner', step: number, setJourney: (j: 'select' | 'customer' | 'owner') => void }) => {
  
  if (journey === 'select') {
    return (
      <div className="flex flex-col md:flex-row items-stretch justify-center gap-8 w-full max-w-4xl mx-auto h-full animate-in fade-in zoom-in duration-500">
        <div onClick={() => setJourney('customer')} className="flex-1 w-full bg-[#344B4A] border-2 border-[#344B4A] rounded-3xl p-8 hover:border-[#167D78] hover:bg-[#344B4A]/80 transition-all cursor-pointer group shadow-xl flex flex-col">
          <div className="w-16 h-16 bg-[#167D78]/20 rounded-2xl flex items-center justify-center text-[#167D78] mb-6 group-hover:scale-110 transition-transform">
            <User size={32} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#167D78] transition-colors">Customer Journey</h3>
          <p className="text-[#697778] mb-6">See how a fitness enthusiast joins a gym, gets AI guidance, and tracks progress.</p>
          <ul className="space-y-3 mb-8 flex-1">
            {['Join a gym', 'Create fitness profile', 'Get AI recommendations', 'Connect with trainers', 'Track progress'].map((item, idx) => (
              <li key={idx} className="flex items-center text-sm text-[#D9E2E3]"><CheckCircle size={16} className="text-[#167D78] mr-2" /> {item}</li>
            ))}
          </ul>
          <div className="inline-flex items-center gap-2 text-[#167D78] font-bold">Start Journey <ArrowRight size={16} /></div>
        </div>

        <div onClick={() => setJourney('owner')} className="flex-1 w-full bg-[#344B4A] border-2 border-[#344B4A] rounded-3xl p-8 hover:border-[#D8EAE7] hover:bg-[#344B4A]/80 transition-all cursor-pointer group shadow-xl flex flex-col">
          <div className="w-16 h-16 bg-[#D8EAE7]/20 rounded-2xl flex items-center justify-center text-[#D8EAE7] mb-6 group-hover:scale-110 transition-transform">
            <Activity size={32} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#D8EAE7] transition-colors">Gym Owner Journey</h3>
          <p className="text-[#697778] mb-6">See how a gym owner registers, gets approved, and manages their facility.</p>
          <ul className="space-y-3 mb-8 flex-1">
            {['Register gym', 'Get Superadmin approval', 'Choose SaaS subscription', 'Complete payment', 'Access Dashboard'].map((item, idx) => (
              <li key={idx} className="flex items-center text-sm text-[#D9E2E3]"><CheckCircle size={16} className="text-[#D8EAE7] mr-2" /> {item}</li>
            ))}
          </ul>
          <div className="inline-flex items-center gap-2 text-[#D8EAE7] font-bold">Start Journey <ArrowRight size={16} /></div>
        </div>
      </div>
    );
  }

  if (journey === 'customer') {
    const customerSteps = [
      {
        id: 1, title: 'Customer Registration', desc: 'Create Your Fitness Profile',
        render: () => (
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-10">
            <h4 className="text-xl font-bold text-[#344B4A] mb-4">Create Profile</h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-[#E8EFF0] border border-[#D8EAE7] p-3 rounded-xl"><div className="text-xs text-[#697778] mb-1">Full Name</div><div className="font-semibold text-sm">Alex Johnson</div></div>
              <div className="bg-[#E8EFF0] border border-[#D8EAE7] p-3 rounded-xl"><div className="text-xs text-[#697778] mb-1">Fitness Goal</div><div className="font-semibold text-sm">Muscle Gain</div></div>
              <div className="bg-[#E8EFF0] border border-[#D8EAE7] p-3 rounded-xl"><div className="text-xs text-[#697778] mb-1">Height / Weight</div><div className="font-semibold text-sm">180 cm / 75 kg</div></div>
              <div className="bg-[#E8EFF0] border border-[#D8EAE7] p-3 rounded-xl"><div className="text-xs text-[#697778] mb-1">Activity Level</div><div className="font-semibold text-sm">Moderate</div></div>
            </div>
            <button className="w-full bg-[#167D78] text-white py-3 rounded-xl font-bold">Complete Registration</button>
          </div>
        )
      },
      {
        id: 2, title: 'Approval & Login', desc: 'Registration Submitted → Admin Review → Approved → Login',
        render: () => (
          <div className="w-full max-w-2xl bg-white rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in">
            <div className="flex items-center justify-between mb-8 relative">
               <div className="absolute top-1/2 left-0 w-full h-1 bg-[#D8EAE7] -z-10 -translate-y-1/2"></div>
               <div className="absolute top-1/2 left-0 w-[80%] h-1 bg-[#167D78] -z-10 -translate-y-1/2 transition-all duration-1000"></div>
               {[
                 { label: 'Submitted', active: true, icon: CheckCircle },
                 { label: 'Review', active: true, icon: CheckCircle },
                 { label: 'Approved', active: true, icon: CheckCircle },
                 { label: 'Login', active: false, icon: User }
               ].map((s, i) => (
                 <div key={i} className="flex flex-col items-center bg-white px-2">
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white ${s.active ? 'bg-[#167D78] text-white' : 'bg-[#D8EAE7] text-[#697778]'}`}><s.icon size={20}/></div>
                   <span className="text-xs font-bold mt-2 text-[#697778]">{s.label}</span>
                 </div>
               ))}
            </div>
            <div className="bg-[#E8EFF0] border border-[#D8EAE7] rounded-xl p-6 text-center max-w-sm mx-auto">
               <h4 className="font-bold text-[#344B4A] mb-2">Welcome Back</h4>
               <p className="text-xs text-[#697778] mb-4">Once your registration is approved, sign in to access your personalized dashboard.</p>
               <input type="email" placeholder="Email" className="w-full mb-3 p-2 border border-[#D8EAE7] rounded bg-white text-sm" value="alex@example.com" readOnly/>
               <input type="password" placeholder="Password" className="w-full mb-4 p-2 border border-[#D8EAE7] rounded bg-white text-sm" value="********" readOnly/>
               <button className="w-full bg-[#167D78] text-white py-2 rounded font-bold">Sign In</button>
            </div>
          </div>
        )
      },
      {
        id: 3, title: 'Customer Dashboard', desc: 'Your Central Fitness Hub',
        render: () => (
          <div className="w-full max-w-3xl bg-[#E8EFF0] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-right-10 flex flex-col h-[500px]">
            <div className="bg-white p-4 border-b border-[#D8EAE7] flex justify-between items-center shrink-0">
               <div>
                 <h4 className="font-bold text-[#344B4A] text-lg">Welcome back, Alex!</h4>
                 <p className="text-xs text-[#697778]">Premium Member at Iron Forge Barbell</p>
               </div>
               <div className="w-10 h-10 bg-[#167D78]/10 text-[#167D78] rounded-full flex items-center justify-center"><User size={20}/></div>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4 overflow-y-auto">
               <div className="col-span-2 space-y-4">
                 <div className="bg-white p-4 rounded-xl border border-[#D8EAE7] flex justify-between items-center shadow-sm">
                   <div>
                     <h5 className="font-bold text-sm text-[#344B4A]">Today's Workout</h5>
                     <p className="text-xs text-[#167D78] font-semibold">Upper Body Hypertrophy • 45 mins</p>
                   </div>
                   <button className="bg-[#344B4A] text-white px-4 py-2 rounded-lg text-sm font-bold">Start</button>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white p-4 rounded-xl border border-[#D8EAE7] shadow-sm">
                     <div className="flex items-center gap-2 mb-2"><Activity size={16} className="text-[#167D78]"/><span className="font-bold text-sm">Attendance</span></div>
                     <div className="text-2xl font-bold text-[#344B4A]">12/15 <span className="text-sm text-[#697778] font-normal">days</span></div>
                   </div>
                   <div className="bg-white p-4 rounded-xl border border-[#D8EAE7] shadow-sm">
                     <div className="flex items-center gap-2 mb-2"><TrendingUp size={16} className="text-[#167D78]"/><span className="font-bold text-sm">Progress</span></div>
                     <div className="text-2xl font-bold text-[#344B4A]">-2.5 <span className="text-sm text-[#697778] font-normal">kg</span></div>
                   </div>
                 </div>
               </div>
               <div className="col-span-1 space-y-4">
                 <div className="bg-white p-4 rounded-xl border border-[#D8EAE7] shadow-sm">
                   <h5 className="font-bold text-sm text-[#344B4A] mb-3">AI Diet Goal</h5>
                   <div className="relative w-24 h-24 mx-auto mb-2">
                     <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                       <path className="text-[#D8EAE7]" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                       <path className="text-[#167D78]" strokeDasharray="65, 100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="font-bold text-sm">1850</span>
                       <span className="text-[10px] text-[#697778]">kcal</span>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        )
      },
      {
        id: 4, title: 'AI Fitness Analysis', desc: 'Analyzing your profile to create the perfect plan',
        render: () => (
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden animate-in zoom-in duration-700">
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#167D78]/5 to-transparent"></div>
             <div className="relative z-10 flex flex-col items-center">
               <div className="w-20 h-20 bg-white border border-[#167D78]/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(22,125,120,0.25)] mb-6 animate-pulse">
                 <Bot size={40} className="text-[#167D78]" />
               </div>
               <div className="grid grid-cols-4 gap-4 w-full mb-8 text-center">
                 {['Height: 180cm', 'Weight: 75kg', 'Goal: Muscle', 'Level: Mid'].map((t, i) => (
                   <div key={i} className="bg-[#E8EFF0] py-2 px-3 rounded-lg border border-[#D8EAE7] text-xs font-bold text-[#697778]">{t}</div>
                 ))}
               </div>
               <div className="w-full space-y-3">
                 <div className="h-2 w-full bg-[#D8EAE7] rounded-full overflow-hidden"><div className="h-full bg-[#167D78] w-[100%] transition-all duration-1000 ease-out"></div></div>
                 <div className="flex justify-between text-xs font-bold text-[#344B4A]"><span>Analyzing Profile...</span><span>100%</span></div>
               </div>
               <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                 <div className="bg-[#E8EFF0] border border-[#D9E2E3] p-4 rounded-xl">
                   <h5 className="font-bold text-sm text-[#D8EAE7] mb-1">Recommended Approach</h5>
                   <p className="text-xs text-[#697778]">4-day upper/lower split focusing on progressive overload.</p>
                 </div>
                 <div className="bg-[#E8EFF0] border border-[#D9E2E3] p-4 rounded-xl">
                   <h5 className="font-bold text-sm text-[#D8EAE7] mb-1">Diet Guidance</h5>
                   <p className="text-xs text-[#697778]">Caloric surplus of 300kcal with 160g daily protein target.</p>
                 </div>
               </div>
             </div>
          </div>
        )
      },
      {
        id: 5, title: 'Personalized Workout Plan', desc: 'Your Weekly Schedule & Exercise Details',
        render: () => (
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-6 flex flex-col h-[500px] animate-in fade-in">
             <div className="flex justify-between items-center mb-6 border-b border-[#D8EAE7] pb-4">
               <h4 className="font-bold text-lg text-[#344B4A]">Weekly Plan</h4>
               <div className="flex space-x-2">
                 {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                   <div key={i} className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-[#344B4A] text-white' : i === 3 || i === 6 ? 'bg-[#E8EFF0] text-[#697778] border border-[#D8EAE7]' : 'bg-[#E8EFF0] text-[#D8EAE7]'}`}>
                     {d}
                   </div>
                 ))}
               </div>
             </div>
             <div className="flex-1 overflow-y-auto pr-2 space-y-4">
               {[
                 { name: 'Barbell Bench Press', sets: '4 sets x 8-10 reps', target: 'Chest', desc: 'Keep core tight, lower bar to mid-chest.' },
                 { name: 'Incline Dumbbell Press', sets: '3 sets x 10-12 reps', target: 'Upper Chest', desc: 'Set bench to 30 degrees. Squeeze at the top.' },
                 { name: 'Lat Pulldown', sets: '4 sets x 10-12 reps', target: 'Back', desc: 'Pull bar to upper chest, retracting scapula.' }
               ].map((ex, i) => (
                 <div key={i} className="bg-[#E8EFF0] border border-[#D8EAE7] p-4 rounded-xl flex gap-4 hover:border-[#167D78] transition-colors">
                   <div className="w-16 h-16 bg-[#D8EAE7] rounded-lg flex items-center justify-center shrink-0">
                     <Dumbbell size={24} className="text-[#697778]"/>
                   </div>
                   <div className="flex-1">
                     <div className="flex justify-between mb-1">
                       <h5 className="font-bold text-[#344B4A] text-sm">{ex.name}</h5>
                       <span className="text-xs px-2 py-0.5 bg-[#E8EFF0] text-[#D8EAE7] rounded-md font-semibold">{ex.target}</span>
                     </div>
                     <p className="text-xs text-[#167D78] font-bold mb-1">{ex.sets}</p>
                     <p className="text-xs text-[#697778]">{ex.desc}</p>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )
      },
      {
        id: 6, title: 'Your Personalized Diet Guidance', desc: 'AI-Generated Nutritional Suggestions',
        render: () => (
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-6 flex flex-col h-[500px] animate-in fade-in">
             <div className="mb-4 bg-orange-50 border border-orange-200 text-orange-800 text-xs p-3 rounded-lg flex items-start gap-2">
               <Activity size={16} className="shrink-0 mt-0.5" />
               <p><strong>Disclaimer:</strong> This AI-generated guidance is based on your fitness profile and goals. It does not constitute medical advice or guarantee specific weight-loss results.</p>
             </div>
             <div className="flex justify-between items-center mb-4">
               <div className="text-2xl font-black text-[#344B4A]">2,450 <span className="text-sm text-[#697778] font-medium">kcal/day</span></div>
               <div className="flex gap-4">
                 <div className="text-center"><div className="text-xs text-[#697778]">Protein</div><div className="font-bold text-[#D8EAE7]">160g</div></div>
                 <div className="text-center"><div className="text-xs text-[#697778]">Carbs</div><div className="font-bold text-[#167D78]">240g</div></div>
                 <div className="text-center"><div className="text-xs text-[#697778]">Fats</div><div className="font-bold text-yellow-600">70g</div></div>
               </div>
             </div>
             <div className="flex-1 overflow-y-auto space-y-3">
               {[
                 { meal: 'Breakfast', time: '8:00 AM', items: 'Oatmeal with whey protein, 1 banana, handful of almonds.', kcal: '450 kcal' },
                 { meal: 'Lunch', time: '1:00 PM', items: 'Grilled chicken breast (200g), brown rice, mixed broccoli.', kcal: '650 kcal' },
                 { meal: 'Pre-Workout', time: '4:30 PM', items: '2 slices whole wheat bread with peanut butter.', kcal: '350 kcal' },
                 { meal: 'Dinner', time: '8:00 PM', items: 'Baked salmon, sweet potato, side salad with olive oil.', kcal: '600 kcal' }
               ].map((m, i) => (
                 <div key={i} className="flex justify-between items-center p-4 bg-[#E8EFF0] border border-[#D8EAE7] rounded-xl">
                   <div>
                     <h5 className="font-bold text-sm text-[#344B4A]">{m.meal} <span className="text-xs text-[#697778] font-normal ml-2">{m.time}</span></h5>
                     <p className="text-xs text-[#697778] mt-1">{m.items}</p>
                   </div>
                   <div className="font-bold text-sm text-[#167D78]">{m.kcal}</div>
                 </div>
               ))}
             </div>
          </div>
        )
      },
      {
        id: 7, title: 'Need Personal Guidance?', desc: 'Connect with expert Human Trainers',
        render: () => (
          <div className="w-full max-w-4xl bg-transparent animate-in zoom-in flex flex-col md:flex-row gap-6 justify-center">
            <div className="bg-white rounded-2xl shadow-xl p-6 flex-1 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-[#D8EAE7] mb-4"><Monitor size={24}/></div>
              <h4 className="font-bold text-lg mb-2">Online Trainer</h4>
              <p className="text-xs text-[#697778] mb-6">Get remote video guidance, diet tracking, and workout adjustments anywhere.</p>
              <div className="bg-[#E8EFF0] border border-[#D8EAE7] p-4 rounded-xl w-full text-left">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden"><img src="https://images.unsplash.com/photo-1594381898411-846e7d193883?w=100&q=80" className="object-cover w-full h-full"/></div>
                  <div><h5 className="font-bold text-sm">Mike Tyson</h5><span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Online Expert</span></div>
                </div>
                <button className="w-full py-2 bg-[#344B4A] text-white text-xs font-bold rounded-lg mt-2">Connect via Chat</button>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 flex-1 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-[#167D78] mb-4"><MapPin size={24}/></div>
              <h4 className="font-bold text-lg mb-2">Offline Trainer</h4>
              <p className="text-xs text-[#697778] mb-6">In-person form correction, spotting, and personalized motivation at your gym.</p>
              <div className="bg-[#E8EFF0] border border-[#D8EAE7] p-4 rounded-xl w-full text-left">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden"><img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=100&q=80" className="object-cover w-full h-full"/></div>
                  <div><h5 className="font-bold text-sm">Sarah Miller</h5><span className="text-[10px] bg-[#D8EAE7]/10 text-[#167D78] px-1.5 py-0.5 rounded">At Iron Forge</span></div>
                </div>
                <button className="w-full py-2 bg-[#167D78] text-white text-xs font-bold rounded-lg mt-2">Book Session</button>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 8, title: 'Trainer Guidance', desc: 'Real-time feedback and weekly reviews',
        render: () => (
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[450px] animate-in fade-in">
             <div className="w-full md:w-1/2 bg-[#E8EFF0] p-6 border-r border-[#D8EAE7] flex flex-col justify-center">
               <h4 className="font-bold text-lg text-[#344B4A] mb-4">Interactive Support</h4>
               <ul className="space-y-4">
                 {[
                   { icon: Activity, title: 'Exercise Modifications', desc: 'Swap exercises based on equipment or injury.' },
                   { icon: CheckCircle, title: 'Form Correction', desc: 'Upload videos or meet in-person for form checks.' },
                   { icon: Calendar, title: 'Weekly Reviews', desc: 'Adjust macros and volume based on progress.' }
                 ].map((item, i) => (
                   <li key={i} className="flex gap-3">
                     <div className="w-8 h-8 rounded-full bg-[#167D78]/10 text-[#167D78] flex items-center justify-center shrink-0"><item.icon size={16}/></div>
                     <div><h5 className="font-bold text-sm text-[#344B4A]">{item.title}</h5><p className="text-xs text-[#697778]">{item.desc}</p></div>
                   </li>
                 ))}
               </ul>
             </div>
             <div className="w-full md:w-1/2 bg-white p-6 flex flex-col">
               <div className="flex-1 overflow-y-auto space-y-4">
                 <div className="flex gap-3">
                   <div className="w-8 h-8 rounded-full bg-blue-100 shrink-0 overflow-hidden"><img src="https://images.unsplash.com/photo-1594381898411-846e7d193883?w=100&q=80"/></div>
                   <div className="bg-[#E8EFF0] p-3 rounded-xl rounded-tl-none border border-[#D8EAE7] text-sm text-[#344B4A]"><p>Great job on the deadlifts! Next week, let's increase the weight by 5kg.</p></div>
                 </div>
                 <div className="flex gap-3 flex-row-reverse">
                   <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0 overflow-hidden flex items-center justify-center font-bold text-xs">AJ</div>
                   <div className="bg-[#167D78] p-3 rounded-xl rounded-tr-none text-[#344B4A] text-sm"><p>Sounds good! Though my left shoulder feels slightly tight during bench press.</p></div>
                 </div>
                 <div className="flex gap-3">
                   <div className="w-8 h-8 rounded-full bg-blue-100 shrink-0 overflow-hidden"><img src="https://images.unsplash.com/photo-1594381898411-846e7d193883?w=100&q=80"/></div>
                   <div className="bg-[#E8EFF0] p-3 rounded-xl rounded-tl-none border border-[#D8EAE7] text-sm text-[#344B4A]">
                     <p className="mb-2">Let's modify that. I've updated your plan to use Dumbbell Presses instead to allow free rotation.</p>
                     <div className="bg-white border border-[#D8EAE7] rounded p-2 text-xs flex items-center gap-2"><Dumbbell size={14} className="text-[#167D78]"/><span className="font-bold">Plan Updated</span></div>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        )
      },
      {
        id: 9, title: 'Stay Consistent', desc: 'Mark workouts complete and track attendance',
        render: () => (
          <div className="w-full max-w-3xl flex flex-col md:flex-row gap-6 animate-in slide-in-from-bottom-10">
            <div className="flex-1 bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center border-t-4 border-[#167D78]">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-4 shadow-inner"><CheckCircle size={40}/></div>
              <h4 className="font-bold text-2xl text-[#344B4A] mb-1">Workout Complete!</h4>
              <p className="text-sm text-[#697778] mb-6">Upper Body Hypertrophy</p>
              <div className="flex gap-4 w-full justify-center text-center border-t border-[#D8EAE7] pt-4">
                <div><div className="font-black text-xl text-[#344B4A]">45m</div><div className="text-xs text-[#697778]">Duration</div></div>
                <div><div className="font-black text-xl text-[#344B4A]">12k</div><div className="text-xs text-[#697778]">Volume</div></div>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-4">
              <div className="bg-white rounded-2xl shadow-xl p-5 border border-[#D8EAE7] flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-xl flex items-center justify-center"><Activity size={24}/></div>
                <div><h5 className="font-bold text-[#344B4A]">4 Day Streak!</h5><p className="text-xs text-[#697778]">You're on fire this week.</p></div>
              </div>
              <div className="bg-white rounded-2xl shadow-xl p-5 border border-[#D8EAE7] flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-[#167D78] rounded-xl flex items-center justify-center"><Calendar size={24}/></div>
                <div><h5 className="font-bold text-[#344B4A]">Attendance Logged</h5><p className="text-xs text-[#697778]">Iron Forge Barbell at 5:30 PM</p></div>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 10, title: 'Progress Tracking', desc: 'Visualize your transformation over time',
        render: () => (
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-6 h-[450px] flex flex-col animate-in zoom-in">
             <div className="flex justify-between items-center mb-6">
               <h4 className="font-bold text-lg text-[#344B4A]">Weight Trend</h4>
               <div className="bg-gray-100 p-1 rounded-lg text-xs font-semibold text-[#697778] flex gap-1">
                 <span className="bg-white px-2 py-1 rounded shadow-sm">1M</span>
                 <span className="px-2 py-1">3M</span>
                 <span className="px-2 py-1">6M</span>
               </div>
             </div>
             <div className="flex-1 relative border-l border-b border-[#D8EAE7] ml-6 mb-6">
               {/* Mock Graph */}
               <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                 <polyline points="0,20 20,25 40,35 60,45 80,50 100,65" fill="none" stroke="#167D78" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                 <polyline points="0,100 0,20 20,25 40,35 60,45 80,50 100,65 100,100" fill="rgba(22,125,120,0.1)" stroke="none" />
                 
                 <circle cx="0" cy="20" r="2" fill="#167D78" />
                 <circle cx="20" cy="25" r="2" fill="#167D78" />
                 <circle cx="40" cy="35" r="2" fill="#167D78" />
                 <circle cx="60" cy="45" r="2" fill="#167D78" />
                 <circle cx="80" cy="50" r="2" fill="#167D78" />
                 <circle cx="100" cy="65" r="2" fill="#167D78" />
               </svg>
               <div className="absolute top-[20%] -left-12 text-[10px] text-[#697778]">80 kg</div>
               <div className="absolute top-[65%] -left-12 text-[10px] text-[#167D78] font-bold">75 kg</div>
               <div className="absolute bottom-[-20px] left-0 text-[10px] text-[#697778]">Week 1</div>
               <div className="absolute bottom-[-20px] right-0 text-[10px] text-[#697778]">Week 8</div>
             </div>
             <div className="bg-slate-50 border border-slate-200 text-slate-500 text-[10px] p-2 rounded text-center">
               * Estimated progress is based on user goals and activity. Actual results vary from person to person.
             </div>
          </div>
        )
      },
      {
        id: 11, title: 'Smart Technology + Human Guidance', desc: 'The ultimate hybrid approach',
        render: () => (
          <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6 animate-in slide-in-from-bottom-10">
             <div className="flex-1 bg-gradient-to-br from-[#344B4A] to-[#344B4A] border border-[#344B4A] rounded-2xl p-6 text-white shadow-xl">
               <div className="w-12 h-12 bg-[#167D78]/20 rounded-xl flex items-center justify-center text-[#167D78] mb-4"><Bot size={24}/></div>
               <h4 className="font-bold text-xl mb-4">AI Coach</h4>
               <ul className="space-y-3 text-sm text-[#D9E2E3]">
                 <li className="flex gap-2 items-center"><Activity size={16} className="text-[#167D78]"/> Analyzes millions of data points</li>
                 <li className="flex gap-2 items-center"><TrendingUp size={16} className="text-[#167D78]"/> Creates optimized recommendations</li>
                 <li className="flex gap-2 items-center"><MapPin size={16} className="text-[#167D78]"/> Tracks patterns automatically</li>
                 <li className="flex gap-2 items-center"><CheckCircle size={16} className="text-[#167D78]"/> Updates suggestions instantly</li>
               </ul>
             </div>
             <div className="flex items-center justify-center shrink-0 w-12 text-white font-black text-3xl hidden md:flex">+</div>
             <div className="flex-1 bg-white border border-[#D8EAE7] rounded-2xl p-6 shadow-xl">
               <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-[#D8EAE7] mb-4"><User size={24}/></div>
               <h4 className="font-bold text-xl text-[#344B4A] mb-4">Human Trainer</h4>
               <ul className="space-y-3 text-sm text-[#697778]">
                 <li className="flex gap-2 items-center"><CheckCircle size={16} className="text-[#167D78]"/> Guides complex exercises</li>
                 <li className="flex gap-2 items-center"><CheckCircle size={16} className="text-[#167D78]"/> Corrects physical form</li>
                 <li className="flex gap-2 items-center"><CheckCircle size={16} className="text-[#167D78]"/> Provides psychological motivation</li>
                 <li className="flex gap-2 items-center"><CheckCircle size={16} className="text-[#167D78]"/> Gives personalized emotional support</li>
               </ul>
             </div>
          </div>
        )
      },
      {
        id: 12, title: 'Your Membership', desc: 'Transparent Subscription Management',
        render: () => (
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 animate-in zoom-in">
             <div className="bg-gradient-to-r from-[#167D78] to-[#116660] rounded-xl p-6 text-white mb-6 shadow-lg relative overflow-hidden">
                <div className="absolute -right-10 -top-10 opacity-20"><Activity size={150}/></div>
                <div className="relative z-10">
                  <h4 className="text-lg font-bold mb-1">PRO All-Access Pass</h4>
                  <p className="text-sm opacity-90 mb-4">Valid at Iron Forge Barbell</p>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-xs opacity-80 uppercase tracking-widest mb-1">Status</div>
                      <div className="font-black text-xl">ACTIVE</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs opacity-80 uppercase tracking-widest mb-1">Renewal</div>
                      <div className="font-bold">Oct 12, 2026</div>
                    </div>
                  </div>
                </div>
             </div>
             <h5 className="font-bold text-[#344B4A] mb-3">Subscription Details</h5>
             <div className="bg-[#E8EFF0] border border-[#D8EAE7] rounded-xl overflow-hidden text-sm">
               <div className="flex justify-between p-3 border-b border-[#D8EAE7]"><span className="text-[#697778]">Plan</span><span className="font-bold">Monthly Billed</span></div>
               <div className="flex justify-between p-3 border-b border-[#D8EAE7]"><span className="text-[#697778]">Amount</span><span className="font-bold">₹1,499 / mo</span></div>
               <div className="flex justify-between p-3"><span className="text-[#697778]">Payment Method</span><span className="font-bold flex items-center gap-2"><CreditCard size={14}/> •••• 4242</span></div>
             </div>
          </div>
        )
      },
      {
        id: 13, title: 'Your Fitness Journey Starts Here', desc: 'Everything you need to succeed in one platform.',
        render: () => (
          <div className="w-full max-w-2xl flex flex-col items-center animate-in fade-in slide-in-from-bottom-10">
            <div className="w-24 h-24 bg-gradient-to-br from-[#167D78] to-[#116660] rounded-full flex items-center justify-center text-white mb-6 shadow-xl shadow-teal-900/10">
              <Activity size={48} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full mb-8">
              {['AI Fitness Analysis', 'Personalized Workout', 'Diet Guidance', 'Human Trainer Support', 'Attendance Tracking', 'Progress Tracking'].map((item, i) => (
                <div key={i} className="bg-[#344B4A] border border-[#344B4A] p-3 rounded-lg flex items-center gap-2 text-white text-xs font-bold shadow-sm">
                  <CheckCircle size={14} className="text-[#167D78] shrink-0" /> {item}
                </div>
              ))}
            </div>
            <button onClick={() => setJourney('select')} className="px-8 py-4 bg-[#167D78] hover:bg-[#116660] text-white rounded-xl font-black text-lg transition-transform hover:scale-105 shadow-[0_0_20px_rgba(22,125,120,0.25)]">
              Back to Start
            </button>
          </div>
        )
      }
    ];

    const slide = customerSteps[step - 1];
    if (!slide) return null;

    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <div className="text-center mb-8 animate-in slide-in-from-top-4">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{slide.title}</h3>
          <p className="text-[#697778]">{slide.desc}</p>
        </div>
        <div className="flex-1 w-full flex items-center justify-center">
          {slide.render()}
        </div>
      </div>
    );
  }

  if (journey === 'owner') {
    const ownerSteps = [
      {
        id: 1, title: 'Gym Owner Registration', desc: 'Claim your facility on the Gymora platform',
        render: () => (
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-10">
            <h4 className="text-xl font-bold text-[#344B4A] mb-4">Register as Partner</h4>
            <div className="space-y-3 mb-6">
              <input type="text" placeholder="Owner Full Name" className="w-full p-3 border border-[#D8EAE7] rounded-xl bg-[#E8EFF0] text-sm" readOnly value="David Chen"/>
              <input type="email" placeholder="Business Email" className="w-full p-3 border border-[#D8EAE7] rounded-xl bg-[#E8EFF0] text-sm" readOnly value="david@ironforge.com"/>
              <input type="text" placeholder="Phone Number" className="w-full p-3 border border-[#D8EAE7] rounded-xl bg-[#E8EFF0] text-sm" readOnly value="+91 9876543210"/>
            </div>
            <button className="w-full bg-[#344B4A] text-white py-3 rounded-xl font-bold">Continue to Gym Details</button>
          </div>
        )
      },
      {
        id: 2, title: 'Submit Gym Details', desc: 'Build your public profile to attract customers',
        render: () => (
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 animate-in zoom-in h-[450px] flex flex-col">
            <div className="flex items-center gap-4 mb-6 border-b border-[#D8EAE7] pb-4">
               <div className="w-16 h-16 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                 <span className="text-xs font-bold text-center">Upload<br/>Logo</span>
               </div>
               <div className="flex-1">
                 <input type="text" placeholder="Gym Name" className="w-full p-2 mb-2 border border-[#D8EAE7] rounded bg-[#E8EFF0] text-sm font-bold" readOnly value="Iron Forge Barbell"/>
                 <input type="text" placeholder="Full Address" className="w-full p-2 border border-[#D8EAE7] rounded bg-[#E8EFF0] text-sm" readOnly value="123 Fitness Avenue, Downtown"/>
               </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              <div>
                <h5 className="text-sm font-bold text-[#344B4A] mb-2">Facilities & Tags</h5>
                <div className="flex flex-wrap gap-2">
                  {['Cardio Section', 'Free Weights', 'CrossFit', 'AC', '24/7 Access', 'Sauna'].map((tag, i) => (
                    <span key={i} className="bg-[#167D78]/10 text-[#167D78] border border-[#167D78]/30 px-3 py-1 rounded-full text-xs font-bold">{tag}</span>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-sm font-bold text-[#344B4A] mb-2">Current Offers</h5>
                <input type="text" placeholder="e.g. 20% off annual plan" className="w-full p-3 border border-[#D8EAE7] rounded-xl bg-[#E8EFF0] text-sm" readOnly value="First month free for new members!"/>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 3, title: 'Superadmin Review', desc: 'We verify every partner to ensure quality',
        render: () => (
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-8 animate-in fade-in slide-in-from-right-10">
            <div className="flex flex-col items-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Settings className="text-yellow-500 animate-pulse" size={32}/>
                </div>
              </div>
              <h4 className="text-xl font-bold text-[#344B4A] mb-2">Under Review</h4>
              <p className="text-sm text-[#697778] text-center mb-8">Your application for <span className="font-bold text-[#344B4A]">Iron Forge Barbell</span> is being reviewed by our team. This usually takes 1-2 hours.</p>
              
              <div className="w-full bg-[#E8EFF0] border border-[#D8EAE7] rounded-xl p-4">
                <div className="text-xs text-[#697778] font-bold uppercase tracking-wider mb-2">Possible Statuses</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-white p-2 border border-[#D8EAE7] rounded shadow-sm"><span className="text-xs font-semibold">Approved</span> <CheckCircle size={14} className="text-green-500"/></div>
                  <div className="flex justify-between items-center bg-white p-2 border border-[#D8EAE7] rounded shadow-sm"><span className="text-xs font-semibold">Pending</span> <Activity size={14} className="text-yellow-500"/></div>
                  <div className="flex justify-between items-center bg-white p-2 border border-[#D8EAE7] rounded shadow-sm"><span className="text-xs font-semibold">Rejected / Suspended</span> <XCircle size={14} className="text-[#D8EAE7]"/></div>
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 4, title: 'Login & Choose SaaS Plan', desc: 'Select the management platform plan that fits your gym size',
        render: () => (
          <div className="w-full max-w-4xl bg-transparent flex flex-col md:flex-row gap-6 animate-in zoom-in">
            <div className="bg-white rounded-2xl p-6 shadow-xl flex-1 border border-[#D8EAE7]">
              <div className="inline-block bg-[#167D78] text-white text-[10px] font-bold px-2 py-1 rounded mb-4">GOLD PLAN</div>
              <div className="text-3xl font-black text-[#344B4A] mb-1">₹1,499<span className="text-sm text-[#697778] font-normal">/mo</span></div>
              <p className="text-xs text-[#697778] mb-4">For growing gyms</p>
              <ul className="space-y-2 text-xs mb-6">
                <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-[#167D78]"/> 500 members</li>
                <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-[#167D78]"/> 15 trainers</li>
                <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-[#167D78]"/> Detailed Analytics</li>
                <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-[#167D78]"/> Trainer Booking System</li>
              </ul>
              <button className="w-full py-2 bg-[#344B4A] text-white rounded-lg text-sm font-bold">Select Gold</button>
            </div>
            <div className="bg-gradient-to-b from-[#344B4A] to-[#344B4A] rounded-2xl p-6 shadow-2xl flex-1 border border-[#344B4A] transform md:-translate-y-4 md:scale-105">
              <div className="inline-block bg-[#E8EFF0]0 text-white text-[10px] font-bold px-2 py-1 rounded mb-4">PREMIUM PLAN</div>
              <div className="text-3xl font-black text-white mb-1">₹2,499<span className="text-sm text-[#697778] font-normal">/mo</span></div>
              <p className="text-xs text-[#697778] mb-4">Enterprise-grade power</p>
              <ul className="space-y-2 text-xs mb-6 text-[#D9E2E3]">
                <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-[#D8EAE7]"/> Unlimited members</li>
                <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-[#D8EAE7]"/> Unlimited trainers</li>
                <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-[#D8EAE7]"/> Advanced Revenue Analytics</li>
                <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-[#D8EAE7]"/> Priority Support</li>
              </ul>
              <button className="w-full py-2 bg-[#167D78] text-white rounded-lg text-sm font-bold shadow-[0_0_20px_rgba(147,51,234,0.4)]">Select Premium</button>
            </div>
          </div>
        )
      },
      {
        id: 5, title: 'Payment', desc: 'Secure checkout to activate your dashboard',
        render: () => (
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 animate-in slide-in-from-bottom-10 flex flex-col items-center">
            <div className="w-full bg-[#E8EFF0] border border-[#D8EAE7] p-4 rounded-xl mb-6 flex justify-between items-center">
              <div>
                <h5 className="font-bold text-[#344B4A]">Premium Plan (Annual)</h5>
                <p className="text-xs text-[#167D78]">Includes 2 months free</p>
              </div>
              <div className="text-lg font-black text-[#344B4A]">₹22,490</div>
            </div>
            
            <div className="relative w-full mb-8">
              <div className="absolute inset-0 bg-green-50 rounded-xl border-2 border-green-500 scale-105 opacity-50 animate-pulse"></div>
              <div className="relative w-full bg-white border border-green-500 rounded-xl p-6 text-center shadow-lg">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-[#167D78] mx-auto mb-4">
                  <ShieldCheck size={32}/>
                </div>
                <h4 className="text-xl font-bold text-[#344B4A] mb-2">Payment Successful!</h4>
                <p className="text-sm text-[#697778]">Your gym is now live on the Gymora platform.</p>
              </div>
            </div>
            
            <button className="w-full py-3 bg-[#167D78] text-white font-bold rounded-xl shadow-lg">Go to Dashboard</button>
          </div>
        )
      },
      {
        id: 6, title: 'Gym Management Dashboard', desc: 'Your gym\'s performance at a glance',
        render: () => (
          <div className="w-full max-w-4xl bg-[#E8EFF0] rounded-2xl shadow-2xl p-4 md:p-6 flex flex-col h-[500px] animate-in zoom-in border border-[#D8EAE7]">
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-[#D8EAE7]">
              <div><h4 className="font-bold text-[#344B4A]">Iron Forge Barbell</h4><span className="text-xs bg-[#D8EAE7] text-[#167D78] px-2 py-0.5 rounded font-bold">Premium Plan</span></div>
              <div className="text-right"><div className="text-xs text-[#697778]">Monthly Revenue</div><div className="font-black text-xl text-[#167D78]">₹4,25,000</div></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {[
                { title: 'Total Members', val: '450', icon: User, color: 'text-[#167D78]', bg: 'bg-blue-50' },
                { title: 'Active Trainers', val: '12', icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50' },
                { title: 'Today\'s Check-ins', val: '128', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
                { title: 'New Leads', val: '24', icon: TrendingUp, color: 'text-[#167D78]', bg: 'bg-[#E8EFF0]' }
              ].map((c, i) => (
                <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-[#D8EAE7]">
                  <div className={`w-8 h-8 ${c.bg} ${c.color} rounded-lg flex items-center justify-center mb-2`}><c.icon size={16}/></div>
                  <div className="text-2xl font-black text-[#344B4A]">{c.val}</div>
                  <div className="text-xs text-[#697778]">{c.title}</div>
                </div>
              ))}
            </div>
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-[#D8EAE7] p-4 flex items-center justify-center text-center">
               <div>
                 <Activity size={48} className="mx-auto text-[#D8EAE7] mb-2"/>
                 <p className="text-sm font-bold text-[#697778]">Detailed Analytics & Charts Area</p>
               </div>
            </div>
          </div>
        )
      },
      {
        id: 7, title: 'Complete Management Control', desc: 'Everything you need to run your business smoothly',
        render: () => (
          <div className="w-full max-w-3xl flex flex-col items-center animate-in fade-in slide-in-from-bottom-10">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full mb-8">
              {[
                { icon: User, label: 'Customer Management' },
                { icon: Dumbbell, label: 'Trainer Management' },
                { icon: CreditCard, label: 'Membership Management' },
                { icon: Calendar, label: 'Attendance Tracking' },
                { icon: HeartPulse, label: 'Gym Facilities & Equipment' },
                { icon: FileText, label: 'Detailed Reports' }
              ].map((item, i) => (
                <div key={i} className="bg-[#344B4A] border border-[#344B4A] p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2 hover:border-[#167D78] transition-colors shadow-lg group">
                  <div className="w-10 h-10 bg-[#344B4A] rounded-full flex items-center justify-center group-hover:bg-[#167D78]/20 transition-colors">
                    <item.icon size={20} className="text-white group-hover:text-[#167D78]" />
                  </div>
                  <span className="text-white text-xs font-bold">{item.label}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setJourney('select')} className="px-8 py-4 bg-[#167D78] hover:bg-[#116660] text-white rounded-xl font-black text-lg transition-transform hover:scale-105 shadow-[0_0_20px_rgba(22,125,120,0.25)]">
              Back to Start
            </button>
          </div>
        )
      }
    ];

    const slide = ownerSteps[step - 1];
    if (!slide) return null;

    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <div className="text-center mb-8 animate-in slide-in-from-top-4">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{slide.title}</h3>
          <p className="text-[#697778]">{slide.desc}</p>
        </div>
        <div className="flex-1 w-full flex items-center justify-center">
          {slide.render()}
        </div>
      </div>
    );
  }

  return null;
};
