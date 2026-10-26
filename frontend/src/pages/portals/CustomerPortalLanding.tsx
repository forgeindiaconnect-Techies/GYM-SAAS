import { Link } from 'react-router-dom';
import { 
  Bot, 
  ArrowLeft, 
  Flame, 
  Apple, 
  Dumbbell, 
  LineChart, 
  Award, 
  MapPin, 
  Activity, 
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Calendar,
  Compass,
  Trophy,
  HeartPulse,
  Scale,
  Zap,
  Timer,
  Salad
} from 'lucide-react';

const CustomerPortalLanding = () => {
  return (
    <div className="min-h-screen bg-[#080B0C] text-[#F5FAFA] selection:bg-[#2DD4BF] selection:text-[#06201D] font-sans">
      {/* Top Navigation */}
      <nav className="border-b border-[#2A3A3A] bg-[#0E1415]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Portal Badge */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[#2DD4BF] to-[#5EEAD4] rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Activity className="text-[#06201D]" size={22} strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-black tracking-tight text-[#F5FAFA] group-hover:text-[#2DD4BF] transition-colors">
                Gymora
              </span>
            </Link>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20">
              Customer Fitness Portal
            </span>
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#06201D] bg-[#2DD4BF] hover:bg-[#5EEAD4] transition-all shadow-md shadow-teal-500/20 flex items-center gap-1.5"
            >
              <ArrowLeft size={16} />
              <span>Back to Main Website</span>
            </Link>
            <Link
              to="/gyms"
              className="hidden md:inline-flex px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#06201D] bg-[#2DD4BF] hover:bg-[#5EEAD4] transition-all shadow-md shadow-teal-500/20 flex items-center gap-1.5"
            >
              <Compass size={14} className="text-[#06201D]" />
              <span>Find Gyms</span>
            </Link>
            <Link
              to="/login?portal=customer"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#06201D] bg-[#2DD4BF] hover:bg-[#5EEAD4] transition-all shadow-md shadow-teal-500/20 flex items-center gap-1.5"
            >
              <span>Customer Login</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center flex flex-col items-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#2DD4BF]/12 via-[#080B0C]/0 to-[#080B0C]/0 pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141D1E] border border-[#2A3A3A] text-xs font-medium text-[#2DD4BF] mb-6">
          <Sparkles size={14} />
          <span>Your Personalized Digital Fitness & Transformation Hub</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6 leading-tight max-w-4xl text-[#F5FAFA]">
          Elevate Your Body & Mind With <br className="hidden sm:block" />
          <span className="text-[#2DD4BF]">AI Workouts & Elite Trainers</span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-[#9AAEAE] max-w-2xl mx-auto mb-10 leading-relaxed">
          Access customized AI training and nutrition plans, book 1-on-1 certified coaches, track daily weight and calorie goals, and participate in challenges that reward your dedication.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            to="/login?portal=customer"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30"
          >
            <span>Customer Login</span>
            <ChevronRight size={18} />
          </Link>
          <Link
            to="/register/customer"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30"
          >
            <Flame size={16} className="text-[#06201D]" />
            <span>Join Now / Create Account</span>
          </Link>
        </div>

        {/* Member Success Pulse Bar */}
        <div className="mt-14 w-full max-w-4xl bg-[#141D1E]/90 border border-[#2A3A3A] rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 text-[#2DD4BF] flex items-center justify-center shrink-0">
              <Zap size={18} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#9AAEAE]">AI Routines</div>
              <div className="text-sm font-bold text-[#F5FAFA]">250,000+ Generated</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Flame size={18} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#9AAEAE]">Daily Burn</div>
              <div className="text-sm font-bold text-[#F5FAFA]">540 kcal / Session</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 text-[#2DD4BF] flex items-center justify-center shrink-0">
              <Dumbbell size={18} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#9AAEAE]">Elite Coaches</div>
              <div className="text-sm font-bold text-[#F5FAFA]">1,200+ Certified</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Trophy size={18} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#9AAEAE]">Streak Rate</div>
              <div className="text-sm font-bold text-[#F5FAFA]">84% Weekly Active</div>
            </div>
          </div>
        </div>
      </header>

      {/* Visual Showcase Section 1: AI Workout Engine & Real-Time Tracking */}
      <section className="py-20 border-t border-[#2A3A3A] bg-[#0E1415]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Copy Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141D1E] border border-[#2A3A3A] text-xs font-semibold text-[#2DD4BF] mb-4">
                <Bot size={14} />
                <span>Next-Gen Generative Training</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#F5FAFA] tracking-tight mb-4 leading-snug">
                Intelligent Workouts Adapted to Your Exact Goals & Equipment
              </h2>
              <p className="text-[#9AAEAE] text-base leading-relaxed mb-6">
                Never wonder what exercise to do next. Gymora’s AI trainer calculates your optimal muscle split, recommended weights, and rep ranges based on your current physical stats, gym machines, and energy levels.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5FAFA] text-sm">Dynamic Rep & Set Adjustments</h4>
                    <p className="text-xs text-[#9AAEAE] mt-0.5">As you get stronger, the AI automatically increases progressive overload parameters to guarantee continuous muscle hypertrophy.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5FAFA] text-sm">Interactive Rep Player & Rest Timers</h4>
                    <p className="text-xs text-[#9AAEAE] mt-0.5">Follow built-in countdown timers, audio cues between sets, and high-definition video form demos to prevent workout injuries.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5FAFA] text-sm">Injury-Aware Exercise Substitutions</h4>
                    <p className="text-xs text-[#9AAEAE] mt-0.5">Have lower back pain or shoulder stiffness? The AI instantly swaps risky compound movements for safe, biomechanically isolated alternatives.</p>
                  </div>
                </div>
              </div>

              <Link
                to="/portal/customer/ai-workout"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2DD4BF] text-[#06201D] font-bold text-sm hover:bg-[#5EEAD4] transition-all shadow-md shadow-teal-500/20"
              >
                <span>Launch AI Workout Assistant</span>
                <ChevronRight size={16} />
              </Link>
            </div>

            {/* Visual Card Right */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden border border-[#2A3A3A] bg-[#141D1E] shadow-2xl group">
                <img 
                  src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=900&q=80" 
                  alt="High Intensity Athlete Workout" 
                  className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080B0C] via-[#080B0C]/40 to-transparent" />
                
                {/* Floating Badges */}
                <div className="absolute top-4 left-4 bg-[#141D1E]/95 backdrop-blur-md border border-[#2A3A3A] rounded-xl px-3.5 py-2 flex items-center gap-2.5 shadow-lg">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-[#F5FAFA]">Today: Hypertrophy Chest & Triceps</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 bg-[#141D1E]/95 backdrop-blur-md border border-[#2A3A3A] rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#2DD4BF] flex items-center gap-1.5">
                      <Timer size={14} /> Set 3 of 4 • Incline Dumbbell Press
                    </span>
                    <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                      Rest: 45s Remaining
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-[#2A3A3A]">
                    <div>
                      <div className="text-xs font-black text-[#F5FAFA]">32 kg</div>
                      <div className="text-[10px] text-[#9AAEAE]">Target Load</div>
                    </div>
                    <div>
                      <div className="text-xs font-black text-[#2DD4BF]">10-12</div>
                      <div className="text-[10px] text-[#9AAEAE]">Target Reps</div>
                    </div>
                    <div>
                      <div className="text-xs font-black text-[#F5FAFA]">380 kcal</div>
                      <div className="text-[10px] text-[#9AAEAE]">Energy Burned</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Showcase Section 2: Macro Nutrition & Diet Planner */}
      <section className="py-20 border-t border-[#2A3A3A] bg-[#080B0C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Visual Card Left */}
            <div className="relative order-2 lg:order-1">
              <div className="relative rounded-3xl overflow-hidden border border-[#2A3A3A] bg-[#141D1E] shadow-2xl group">
                <img 
                  src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&q=80" 
                  alt="Macro Nutrition & Meal Prep" 
                  className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080B0C] via-[#080B0C]/40 to-transparent" />

                <div className="absolute top-4 left-4 bg-[#141D1E]/95 backdrop-blur-md border border-[#2A3A3A] rounded-xl px-3.5 py-2 flex items-center gap-2 shadow-lg">
                  <Apple size={15} className="text-[#2DD4BF]" />
                  <span className="text-xs font-bold text-[#F5FAFA]">Daily Calories: 2,350 / 2,400 kcal</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 bg-[#141D1E]/95 backdrop-blur-md border border-[#2A3A3A] rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#F5FAFA]">Protein Intake Goal (165g)</span>
                    <span className="text-xs font-bold text-[#2DD4BF]">100% Met Today</span>
                  </div>
                  <div className="w-full bg-[#080B0C] h-2 rounded-full overflow-hidden border border-[#2A3A3A] mb-2">
                    <div className="bg-gradient-to-r from-[#2DD4BF] to-[#5EEAD4] h-full w-[96%]" />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#9AAEAE]">
                    <span>Carbs: 210g</span>
                    <span>Fats: 62g</span>
                    <span>Hydration: 3.4L</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Copy Right */}
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141D1E] border border-[#2A3A3A] text-xs font-semibold text-[#2DD4BF] mb-4">
                <Salad size={14} />
                <span>Precision Fuel & Meal Planning</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#F5FAFA] tracking-tight mb-4 leading-snug">
                Nutrition Engineered Around Your Metabolism
              </h2>
              <p className="text-[#9AAEAE] text-base leading-relaxed mb-6">
                Exercise is only half the battle. Our nutritional engine generates meal schedules that match your caloric deficit or surplus targets, complete with regional grocery recipes and dietary preferences.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5FAFA] text-sm">Flexible Dietary Preferences (Veg, Non-Veg, Keto)</h4>
                    <p className="text-xs text-[#9AAEAE] mt-0.5">Easily switch between high-protein vegetarian, plant-based vegan, low-carb, and standard macro-balanced eating styles.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5FAFA] text-sm">Pre & Post-Workout Nutrient Timing</h4>
                    <p className="text-xs text-[#9AAEAE] mt-0.5">Get timely alerts telling you what fast-acting carbs to eat 45 minutes before training and optimal whey protein recovery meals.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5FAFA] text-sm">Hydration & Water Intake Reminders</h4>
                    <p className="text-xs text-[#9AAEAE] mt-0.5">Stay optimally hydrated throughout the day with one-tap water logging and electrolyte balance guidance.</p>
                  </div>
                </div>
              </div>

              <Link
                to="/portal/customer/diet-plan"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2DD4BF] text-[#06201D] font-bold text-sm hover:bg-[#5EEAD4] transition-all shadow-md shadow-teal-500/20"
              >
                <span>View Diet & Meal Plans</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Showcase Section 3: Trainer Coaching, Gym Marketplace & Streaks */}
      <section className="py-20 border-t border-[#2A3A3A] bg-[#0E1415]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141D1E] border border-[#2A3A3A] text-xs font-semibold text-[#2DD4BF] mb-3">
              <Trophy size={14} />
              <span>Coaching, Community & Milestones</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#F5FAFA] tracking-tight">
              Work With Elite Coaches & Stay Accountable
            </h2>
            <p className="text-sm text-[#9AAEAE] mt-2">
              Transform alone or connect with certified mentors who push your boundaries and celebrate your wins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gallery Card 1 */}
            <div className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/40 rounded-3xl overflow-hidden transition-all shadow-lg group">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=700&q=80" 
                  alt="1-on-1 Personal Trainer Coaching" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141D1E] via-transparent to-transparent" />
                <div className="absolute top-3 left-3 bg-[#080B0C]/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#2A3A3A] text-[11px] font-bold text-[#2DD4BF] flex items-center gap-1.5">
                  <Dumbbell size={13} />
                  <span>1-on-1 Mentorship</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-[#F5FAFA] mb-2">Book Certified Trainers</h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed">
                  Browse trainer specializations, read real reviews, and schedule in-gym personal training or online form correction sessions.
                </p>
              </div>
            </div>

            {/* Gallery Card 2 */}
            <div className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/40 rounded-3xl overflow-hidden transition-all shadow-lg group">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=700&q=80" 
                  alt="Multi-Gym Verified Network" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141D1E] via-transparent to-transparent" />
                <div className="absolute top-3 left-3 bg-[#080B0C]/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#2A3A3A] text-[11px] font-bold text-[#2DD4BF] flex items-center gap-1.5">
                  <MapPin size={13} />
                  <span>Gym Finder</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-[#F5FAFA] mb-2">Verified Gym Marketplace</h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed">
                  Discover partner gyms, compare amenities (steam bath, Olympic barbells, pools), and purchase flexible passes with instant QR check-in.
                </p>
              </div>
            </div>

            {/* Gallery Card 3 */}
            <div className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/40 rounded-3xl overflow-hidden transition-all shadow-lg group">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=700&q=80" 
                  alt="Fitness Streaks & Achievements" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141D1E] via-transparent to-transparent" />
                <div className="absolute top-3 left-3 bg-[#080B0C]/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#2A3A3A] text-[11px] font-bold text-[#2DD4BF] flex items-center gap-1.5">
                  <Trophy size={13} />
                  <span>Streaks & Badges</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-[#F5FAFA] mb-2">Streaks & Reward Badges</h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed">
                  Earn points for consecutive workout days, unlock discount coupons on gym store supplements, and claim your place on the leaderboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Sections Grid */}
      <section className="py-16 border-t border-[#2A3A3A] bg-[#080B0C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F5FAFA] tracking-tight">
              Everything Designed for Your Transformation
            </h2>
            <p className="text-sm text-[#9AAEAE] mt-2">
              From day 1 check-in to your milestone PRs, enjoy intelligent tools that keep you consistent, safe, and motivated.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <Link 
              to="/portal/customer/ai-workout" 
              className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/60 rounded-3xl p-6 transition-all shadow-lg hover:shadow-teal-500/10 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Bot size={24} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20">
                    AI Generator
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5FAFA] mb-2 group-hover:text-[#2DD4BF] transition-colors">
                  Smart AI Workout Engine
                </h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed mb-4">
                  Generate tailored weekly exercise programs based on your body type, fitness level, goals, available gym equipment, and past injuries.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Custom Splits</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Video Demos</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Rest Timers</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-xs font-bold text-[#2DD4BF]">
                <span>Launch AI Workout</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 2 */}
            <Link 
              to="/portal/customer/diet-plan" 
              className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/60 rounded-3xl p-6 transition-all shadow-lg hover:shadow-teal-500/10 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Apple size={24} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Macro Balanced
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5FAFA] mb-2 group-hover:text-[#2DD4BF] transition-colors">
                  Customized Diet & Nutrition
                </h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed mb-4">
                  Macro-balanced daily meal plans with vegetarian, vegan, and protein-rich preferences crafted to fuel your workouts and fat loss.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Calorie Budgets</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Veg / Non-Veg</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Hydration Log</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-xs font-bold text-[#2DD4BF]">
                <span>View Diet Plans</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 3 */}
            <Link 
              to="/portal/customer/trainers" 
              className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/60 rounded-3xl p-6 transition-all shadow-lg hover:shadow-teal-500/10 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Dumbbell size={24} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20">
                    Certified Mentors
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5FAFA] mb-2 group-hover:text-[#2DD4BF] transition-colors">
                  Certified Personal Coaches
                </h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed mb-4">
                  Discover elite trainers at your gym, book online or in-person 1-on-1 training slots, and receive professional form corrections.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">1-on-1 Slots</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Form Reviews</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Direct Chat</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-xs font-bold text-[#2DD4BF]">
                <span>Find a Coach</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 4 */}
            <Link 
              to="/portal/customer/progress" 
              className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/60 rounded-3xl p-6 transition-all shadow-lg hover:shadow-teal-500/10 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <LineChart size={24} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live Analytics
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5FAFA] mb-2 group-hover:text-[#2DD4BF] transition-colors">
                  Progress & Milestone Tracking
                </h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed mb-4">
                  Log body weight, BMI changes, workout completion streaks, and attendance records with interactive visual progression graphs.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Weight Charts</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">BMI Tracker</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Session History</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-xs font-bold text-[#2DD4BF]">
                <span>Track My Progress</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 5 */}
            <Link 
              to="/portal/customer/challenges" 
              className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/60 rounded-3xl p-6 transition-all shadow-lg hover:shadow-teal-500/10 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Award size={24} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20">
                    Badges & Rewards
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5FAFA] mb-2 group-hover:text-[#2DD4BF] transition-colors">
                  Fitness Challenges & Rewards
                </h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed mb-4">
                  Join gym-wide endurance challenges, earn badges, unlock membership fee discounts, and redeem store vouchers for protein and merchandise.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Weekly Quests</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Store Discounts</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Leaderboards</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-xs font-bold text-[#2DD4BF]">
                <span>Join Challenges</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 6 */}
            <Link 
              to="/portal/customer/marketplace" 
              className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/60 rounded-3xl p-6 transition-all shadow-lg hover:shadow-teal-500/10 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <MapPin size={24} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Nearby Gyms
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5FAFA] mb-2 group-hover:text-[#2DD4BF] transition-colors">
                  Gym Marketplace & Memberships
                </h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed mb-4">
                  Explore nearby verified fitness clubs, compare day-passes and annual plans, and pay securely via integrated digital payment gateways.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Verified Clubs</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Day Passes</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Instant QR Entry</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-xs font-bold text-[#2DD4BF]">
                <span>Find Nearby Gyms</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Member CTA Section */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#141D1E] to-[#0E1415] border border-[#2A3A3A] rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="w-14 h-14 bg-[#2DD4BF]/10 text-[#2DD4BF] rounded-2xl flex items-center justify-center mx-auto mb-5 border border-[#2DD4BF]/20">
            <Flame size={28} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5FAFA] mb-3">
            Start Your Fitness Journey Today
          </h2>
          <p className="text-sm sm:text-base text-[#9AAEAE] max-w-xl mx-auto mb-8">
            Create an account in minutes or log in to view today’s workout, check your diet macro targets, and book your next trainer session.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#9AAEAE] mb-8">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#2DD4BF]" />
              <span>Free AI Fitness Assessment</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#2DD4BF]" />
              <span>Certified Trainer Network</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#2DD4BF]" />
              <span>Instant QR Check-ins</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login?portal=customer"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold rounded-xl transition-all shadow-lg shadow-teal-500/20"
            >
              <span>Customer Login</span>
            </Link>
            <Link
              to="/register/customer"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold rounded-xl transition-all shadow-lg shadow-teal-500/20"
            >
              <span>Create Free Account</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2A3A3A] bg-[#0E1415] py-8 text-center text-xs text-[#9AAEAE]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Gymora Member Fitness Hub. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-[#2DD4BF] transition-colors">Main Website</Link>
            <Link to="/portal/super-admin" className="hover:text-[#2DD4BF] transition-colors">Super Admin Portal</Link>
            <Link to="/portal/gym-owner" className="hover:text-[#2DD4BF] transition-colors">Gym Owner Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerPortalLanding;
