import { Link } from 'react-router-dom';
import { 
  Building2, 
  ArrowLeft, 
  Users, 
  Dumbbell, 
  CalendarCheck, 
  ShoppingBag, 
  TrendingUp, 
  Gift, 
  FileText, 
  Activity, 
  ChevronRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ScanLine,
  QrCode,
  DollarSign,
  UserCheck,
  Clock,
  Layers,
  MessageSquare
} from 'lucide-react';

const GymOwnerPortalLanding = () => {
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
              Gym Owner Portal
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
              to="/gym-owner-introduction"
              className="hidden md:inline-flex px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#06201D] bg-[#2DD4BF] hover:bg-[#5EEAD4] transition-all shadow-md shadow-teal-500/20"
            >
              Register Gym
            </Link>
            <Link
              to="/login?portal=gym-owner"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#06201D] bg-[#2DD4BF] hover:bg-[#5EEAD4] transition-all shadow-md shadow-teal-500/20 flex items-center gap-1.5"
            >
              <span>Gym Owner Login</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center flex flex-col items-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#2DD4BF]/12 via-[#080B0C]/0 to-[#080B0C]/0 pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141D1E] border border-[#2A3A3A] text-xs font-medium text-[#2DD4BF] mb-6">
          <Building2 size={14} />
          <span>Complete Operating System for Modern Gyms, Fitness Clubs & Studios</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6 leading-tight max-w-4xl text-[#F5FAFA]">
          Scale Your Gym Operations & <br className="hidden sm:block" />
          <span className="text-[#2DD4BF]">Maximize Member Retention</span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-[#9AAEAE] max-w-2xl mx-auto mb-10 leading-relaxed">
          From multi-branch member tracking and trainer payroll to automated biometric attendance, inventory POS, and revenue analytics—manage everything seamlessly from one central hub.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            to="/login?portal=gym-owner"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30"
          >
            <span>Gym Owner Login</span>
            <ChevronRight size={18} />
          </Link>
          <Link
            to="/gym-owner-introduction"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30"
          >
            <Sparkles size={16} className="text-[#06201D]" />
            <span>Get Started & Register Gym</span>
          </Link>
        </div>

        {/* Club Performance Pulse Bar */}
        <div className="mt-14 w-full max-w-4xl bg-[#141D1E]/90 border border-[#2A3A3A] rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 text-[#2DD4BF] flex items-center justify-center shrink-0">
              <ScanLine size={18} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#9AAEAE]">Check-in Speed</div>
              <div className="text-sm font-bold text-[#F5FAFA]">&lt; 0.8s Scan-to-Door</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp size={18} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#9AAEAE]">Member Retention</div>
              <div className="text-sm font-bold text-[#F5FAFA]">89.4% (+32% Avg)</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 text-[#2DD4BF] flex items-center justify-center shrink-0">
              <UserCheck size={18} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#9AAEAE]">Trainer Roster</div>
              <div className="text-sm font-bold text-[#F5FAFA]">Automated Payroll</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
              <Building2 size={18} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#9AAEAE]">Multi-Branch</div>
              <div className="text-sm font-bold text-[#F5FAFA]">Single Pane Sync</div>
            </div>
          </div>
        </div>
      </header>

      {/* Visual Showcase Section 1: Front-Desk Operations & Turnstile Check-ins */}
      <section className="py-20 border-t border-[#2A3A3A] bg-[#0E1415]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Copy Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141D1E] border border-[#2A3A3A] text-xs font-semibold text-[#2DD4BF] mb-4">
                <ScanLine size={14} />
                <span>Smart Access & Front-Desk Automation</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#F5FAFA] tracking-tight mb-4 leading-snug">
                Frictionless Biometric & QR Attendance That Stops Lost Revenue
              </h2>
              <p className="text-[#9AAEAE] text-base leading-relaxed mb-6">
                Prevent unauthorized walk-ins and expired memberships automatically. Our hardware-agnostic check-in engine integrates directly with RFID turnstiles, biometric scanners, and tablet QR codes.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5FAFA] text-sm">Automated Gate Lockout for Expired Plans</h4>
                    <p className="text-xs text-[#9AAEAE] mt-0.5">The turnstile immediately flashes red and alerts the front desk if an unpaid member attempts entry, prompting instant on-spot renewal.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5FAFA] text-sm">Real-Time Floor Capacity & Peak Hour Heatmaps</h4>
                    <p className="text-xs text-[#9AAEAE] mt-0.5">Track live headcount inside your weights room, cardio area, and locker facilities to optimize staffing and HVAC energy usage.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5FAFA] text-sm">WhatsApp & SMS Check-in Confirmations</h4>
                    <p className="text-xs text-[#9AAEAE] mt-0.5">Trigger welcome pings, daily motivational quotes, and locker assignments straight to your member's phone upon arrival.</p>
                  </div>
                </div>
              </div>

              <Link
                to="/login?portal=gym-owner"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2DD4BF] text-[#06201D] font-bold text-sm hover:bg-[#5EEAD4] transition-all shadow-md shadow-teal-500/20"
              >
                <span>Explore Front-Desk Tools</span>
                <ChevronRight size={16} />
              </Link>
            </div>

            {/* Visual Card Right */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden border border-[#2A3A3A] bg-[#141D1E] shadow-2xl group">
                <img 
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=80" 
                  alt="Modern Gym Floor and Turnstiles" 
                  className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080B0C] via-[#080B0C]/40 to-transparent" />
                
                {/* Floating Badges */}
                <div className="absolute top-4 left-4 bg-[#141D1E]/95 backdrop-blur-md border border-[#2A3A3A] rounded-xl px-3.5 py-2 flex items-center gap-2.5 shadow-lg">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-[#F5FAFA]">Turnstile #01 Active • 0.6s Sync</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 bg-[#141D1E]/95 backdrop-blur-md border border-[#2A3A3A] rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#2DD4BF] flex items-center gap-1.5">
                      <QrCode size={14} /> Live Check-in Stream
                    </span>
                    <span className="text-[10px] text-[#34D399] bg-[#34D399]/10 border border-[#34D399]/20 px-2 py-0.5 rounded-full font-bold">
                      All Passes Valid
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-[#2A3A3A]">
                    <div>
                      <div className="text-xs font-black text-[#F5FAFA]">74 Active</div>
                      <div className="text-[10px] text-[#9AAEAE]">Floor Occupants</div>
                    </div>
                    <div>
                      <div className="text-xs font-black text-[#2DD4BF]">0 Unpaid</div>
                      <div className="text-[10px] text-[#9AAEAE]">Walk-in Attempts</div>
                    </div>
                    <div>
                      <div className="text-xs font-black text-[#F5FAFA]">98.2%</div>
                      <div className="text-[10px] text-[#9AAEAE]">Cardio Avail.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Showcase Section 2: Trainer Scheduling, Commission & Performance */}
      <section className="py-20 border-t border-[#2A3A3A] bg-[#080B0C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Visual Card Left */}
            <div className="relative order-2 lg:order-1">
              <div className="relative rounded-3xl overflow-hidden border border-[#2A3A3A] bg-[#141D1E] shadow-2xl group">
                <img 
                  src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&q=80" 
                  alt="Trainer Coaching Client" 
                  className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080B0C] via-[#080B0C]/40 to-transparent" />

                <div className="absolute top-4 left-4 bg-[#141D1E]/95 backdrop-blur-md border border-[#2A3A3A] rounded-xl px-3.5 py-2 flex items-center gap-2 shadow-lg">
                  <Users size={15} className="text-[#2DD4BF]" />
                  <span className="text-xs font-bold text-[#F5FAFA]">PT Packages: ₹4.8 Lakhs Generated</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 bg-[#141D1E]/95 backdrop-blur-md border border-[#2A3A3A] rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#F5FAFA]">Trainer Split Commission Payouts</span>
                    <span className="text-xs font-bold text-[#2DD4BF]">Auto-Calculated 70/30</span>
                  </div>
                  <div className="w-full bg-[#080B0C] h-2 rounded-full overflow-hidden border border-[#2A3A3A] mb-2">
                    <div className="bg-gradient-to-r from-[#2DD4BF] to-[#5EEAD4] h-full w-[94%]" />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#9AAEAE]">
                    <span>18 Active Coaches</span>
                    <span>100% Attendance Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Copy Right */}
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141D1E] border border-[#2A3A3A] text-xs font-semibold text-[#2DD4BF] mb-4">
                <Dumbbell size={14} />
                <span>Trainer Roster & Commission Engine</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#F5FAFA] tracking-tight mb-4 leading-snug">
                Empower Your Coaches & Automate Split Commission Payroll
              </h2>
              <p className="text-[#9AAEAE] text-base leading-relaxed mb-6">
                Eliminate manual spreadsheet headaches. Set up customizable commission tiers for personal training sessions, track group class attendance, and disburse payouts with complete financial accuracy.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5FAFA] text-sm">Automated 1-on-1 PT Session Check-ins</h4>
                    <p className="text-xs text-[#9AAEAE] mt-0.5">Sessions are only marked as completed when both the trainer and the member confirm attendance, preventing false claims.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5FAFA] text-sm">Trainer Workout & Diet Template Library</h4>
                    <p className="text-xs text-[#9AAEAE] mt-0.5">Give your trainers access to certified exercise video databases and diet macros to build personalized routines in minutes.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5FAFA] text-sm">Member Satisfaction & Star Ratings</h4>
                    <p className="text-xs text-[#9AAEAE] mt-0.5">Collect anonymous post-workout member feedback to identify top-performing trainers and reward excellence.</p>
                  </div>
                </div>
              </div>

              <Link
                to="/login?portal=gym-owner"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2DD4BF] text-[#06201D] font-bold text-sm hover:bg-[#5EEAD4] transition-all shadow-md shadow-teal-500/20"
              >
                <span>Manage Trainer Roster</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Showcase Section 3: POS Store, Group Classes & Lead Pipeline */}
      <section className="py-20 border-t border-[#2A3A3A] bg-[#0E1415]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141D1E] border border-[#2A3A3A] text-xs font-semibold text-[#2DD4BF] mb-3">
              <ShoppingBag size={14} />
              <span>Revenue Diversification & Club Growth</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#F5FAFA] tracking-tight">
              Boost Non-Dues Revenue With Integrated POS & Classes
            </h2>
            <p className="text-sm text-[#9AAEAE] mt-2">
              Transform your gym into a thriving fitness destination by selling high-margin supplements and filling group studios.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gallery Card 1 */}
            <div className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/40 rounded-3xl overflow-hidden transition-all shadow-lg group">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=700&q=80" 
                  alt="Supplement POS and Retail" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141D1E] via-transparent to-transparent" />
                <div className="absolute top-3 left-3 bg-[#080B0C]/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#2A3A3A] text-[11px] font-bold text-[#2DD4BF] flex items-center gap-1.5">
                  <ShoppingBag size={13} />
                  <span>Point of Sale</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-[#F5FAFA] mb-2">Supplement & Merchandise POS</h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed">
                  Barcode scanning for whey protein, pre-workouts, and gym gear. Real-time stock alerts ensure you never run out of bestsellers.
                </p>
              </div>
            </div>

            {/* Gallery Card 2 */}
            <div className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/40 rounded-3xl overflow-hidden transition-all shadow-lg group">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=700&q=80" 
                  alt="Group Fitness Classes" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141D1E] via-transparent to-transparent" />
                <div className="absolute top-3 left-3 bg-[#080B0C]/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#2A3A3A] text-[11px] font-bold text-[#2DD4BF] flex items-center gap-1.5">
                  <CalendarCheck size={13} />
                  <span>Class Schedules</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-[#F5FAFA] mb-2">Group Training & Studio Bookings</h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed">
                  Host Zumba, HIIT, Crossfit, and Yoga sessions with automated booking limits, waitlists, and instant member notification broadcasts.
                </p>
              </div>
            </div>

            {/* Gallery Card 3 */}
            <div className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/40 rounded-3xl overflow-hidden transition-all shadow-lg group">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=700&q=80" 
                  alt="Lead Management CRM" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141D1E] via-transparent to-transparent" />
                <div className="absolute top-3 left-3 bg-[#080B0C]/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#2A3A3A] text-[11px] font-bold text-[#2DD4BF] flex items-center gap-1.5">
                  <MessageSquare size={13} />
                  <span>Enquiry CRM</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-[#F5FAFA] mb-2">Lead Conversion & WhatsApp CRM</h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed">
                  Capture online trial enquiries, schedule trial workouts, and convert leads into paying annual members with automated nurture sequences.
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
              All-In-One Gym Management Platform
            </h2>
            <p className="text-sm text-[#9AAEAE] mt-2">
              Engineered specifically to automate daily club tasks, eliminate lost revenues, and deliver a premium experience to your members.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <Link 
              to="/portal/gym-owner/members" 
              className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/60 rounded-3xl p-6 transition-all shadow-lg hover:shadow-teal-500/10 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Users size={24} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20">
                    Active Directory
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5FAFA] mb-2 group-hover:text-[#2DD4BF] transition-colors">
                  Member & Membership Management
                </h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed mb-4">
                  Manage memberships, renewals, active subscriptions, and customer lifecycle statuses with automated WhatsApp/SMS expiry reminders.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Plan Renewals</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Expiry Alerts</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Import CSV</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-xs font-bold text-[#2DD4BF]">
                <span>Manage Members</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 2 */}
            <Link 
              to="/portal/gym-owner/trainers" 
              className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/60 rounded-3xl p-6 transition-all shadow-lg hover:shadow-teal-500/10 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Dumbbell size={24} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20">
                    Staff & PT
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5FAFA] mb-2 group-hover:text-[#2DD4BF] transition-colors">
                  Trainer & Staff Management
                </h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed mb-4">
                  Assign client rosters, track trainer performance ratings, approve exercise & diet programs, and calculate split commissions automatically.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Client Rosters</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Commission Split</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Ratings</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-xs font-bold text-[#2DD4BF]">
                <span>View Trainer Rosters</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 3 */}
            <Link 
              to="/portal/gym-owner/attendance" 
              className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/60 rounded-3xl p-6 transition-all shadow-lg hover:shadow-teal-500/10 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <CalendarCheck size={24} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live Check-in
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5FAFA] mb-2 group-hover:text-[#2DD4BF] transition-colors">
                  Smart Attendance & Bookings
                </h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed mb-4">
                  Real-time check-in logs, biometric & QR tracking, online/offline session booking calendars, and capacity utilization analytics.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">QR Scanning</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Turnstile Access</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Live Occupancy</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-xs font-bold text-[#2DD4BF]">
                <span>Open Attendance Logs</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 4 */}
            <Link 
              to="/portal/gym-owner/store" 
              className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/60 rounded-3xl p-6 transition-all shadow-lg hover:shadow-teal-500/10 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ShoppingBag size={24} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20">
                    POS & Stock
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5FAFA] mb-2 group-hover:text-[#2DD4BF] transition-colors">
                  POS Store & Inventory
                </h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed mb-4">
                  Sell supplements, merchandise, and gym gear. Manage stock replenishment alerts and handle offline and online point-of-sale transactions.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Barcode POS</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Low Stock Alerts</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Daily Sales</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-xs font-bold text-[#2DD4BF]">
                <span>Open Store Dashboard</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 5 */}
            <Link 
              to="/portal/gym-owner/analytics" 
              className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/60 rounded-3xl p-6 transition-all shadow-lg hover:shadow-teal-500/10 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <TrendingUp size={24} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live Cashflow
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5FAFA] mb-2 group-hover:text-[#2DD4BF] transition-colors">
                  Sales & Financial Analytics
                </h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed mb-4">
                  Interactive revenue dashboards, profit-loss insights, cashflow tracking, invoice generation, and downloadable audited financial reports.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Profit & Loss</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Invoices</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Tax Breakdown</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-xs font-bold text-[#2DD4BF]">
                <span>View Revenue Analytics</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 6 */}
            <Link 
              to="/portal/gym-owner/rewards" 
              className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/60 rounded-3xl p-6 transition-all shadow-lg hover:shadow-teal-500/10 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Gift size={24} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20">
                    Gamification
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5FAFA] mb-2 group-hover:text-[#2DD4BF] transition-colors">
                  Rewards & Referral Engine
                </h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed mb-4">
                  Gamify your gym with fitness challenges, loyalty point redemption, and automated referral programs that bring in organic new memberships.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Referral Codes</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Leaderboards</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Voucher Store</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-xs font-bold text-[#2DD4BF]">
                <span>Manage Rewards Engine</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Multi-Branch & Registration Banner */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#141D1E] to-[#0E1415] border border-[#2A3A3A] rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="w-14 h-14 bg-[#2DD4BF]/10 text-[#2DD4BF] rounded-2xl flex items-center justify-center mx-auto mb-5 border border-[#2DD4BF]/20">
            <Building2 size={28} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5FAFA] mb-3">
            Ready to Take Your Gym to the Next Level?
          </h2>
          <p className="text-sm sm:text-base text-[#9AAEAE] max-w-xl mx-auto mb-8">
            Join hundreds of forward-thinking gym owners who have streamlined their front-desk and increased monthly revenues by over 35%.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#9AAEAE] mb-8">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#2DD4BF]" />
              <span>Multi-Branch Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#2DD4BF]" />
              <span>Automated Invoicing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#2DD4BF]" />
              <span>Integrated AI Workplans</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login?portal=gym-owner"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold rounded-xl transition-all shadow-lg shadow-teal-500/20"
            >
              <span>Gym Owner Sign In</span>
            </Link>
            <Link
              to="/gym-owner-introduction"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold rounded-xl transition-all shadow-lg shadow-teal-500/20"
            >
              <span>Register Your Gym</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2A3A3A] bg-[#0E1415] py-8 text-center text-xs text-[#9AAEAE]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Gymora Gym Operations. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-[#2DD4BF] transition-colors">Main Website</Link>
            <Link to="/portal/super-admin" className="hover:text-[#2DD4BF] transition-colors">Super Admin Portal</Link>
            <Link to="/portal/customer" className="hover:text-[#2DD4BF] transition-colors">Customer Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GymOwnerPortalLanding;
