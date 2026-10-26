import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Bot,
  Apple,
  Dumbbell,
  LineChart,
  Award,
  MapPin,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Play,
  RotateCcw,
  Plus,
  Flame,
  Check,
  Calendar,
  Clock,
  TrendingUp,
  Droplet,
  Search,
  Filter,
  ShieldCheck,
  QrCode,
  Compass,
  Star,
  Users,
  CreditCard,
  ChevronRight
} from 'lucide-react';

interface FlowStep {
  step: string;
  title: string;
  desc: string;
  badge?: string;
  actor: 'Member' | 'AI Engine' | 'Coach' | 'Payment Gateway';
  output: string;
}

export default function CustomerFeatureDetail() {
  const { featureId } = useParams<{ featureId: string }>();
  const navigate = useNavigate();

  // Active module key
  const activeKey = featureId && ['ai-workout', 'diet-plan', 'trainers', 'progress', 'challenges', 'marketplace'].includes(featureId)
    ? featureId
    : 'ai-workout';

  const allModules = [
    { id: 'ai-workout', label: 'AI Workout Engine', icon: Bot, subtitle: 'Dynamic Splits, Rest Timers & Injury Shields' },
    { id: 'diet-plan', label: 'Diet & Nutrition', icon: Apple, subtitle: 'Macro-Balanced Plans & Calorie Budgets' },
    { id: 'trainers', label: 'Find Personal Coach', icon: Dumbbell, subtitle: 'Certified Mentors & 1-on-1 Slots' },
    { id: 'progress', label: 'Track My Progress', icon: LineChart, subtitle: 'Weight Trends, Body Fat & Streaks' },
    { id: 'challenges', label: 'Fitness Challenges', icon: Award, subtitle: 'Leaderboards, Quests & Badges' },
    { id: 'marketplace', label: 'Gym Marketplace', icon: MapPin, subtitle: 'Verified Clubs, Passes & Instant QR' }
  ];

  // ----------------------------------------------------
  // Interactive States for Each Module
  // ----------------------------------------------------

  // Module 1: AI Workout Generator State
  const [selectedSplit, setSelectedSplit] = useState('Push-Pull-Legs');
  const [selectedMuscle, setSelectedMuscle] = useState('Chest & Triceps');
  const [fitnessGoal, setFitnessGoal] = useState('Hypertrophy (Muscle Gain)');
  const [hasGeneratedWorkout, setHasGeneratedWorkout] = useState(true);
  const [activeExerciseModal, setActiveExerciseModal] = useState<any | null>(null);

  const workoutSplits = ['Push-Pull-Legs', 'Upper / Lower', '4-Day Bro Split', 'Full Body Athletic'];
  const exercisesList = [
    { name: 'Incline Dumbbell Bench Press', sets: '4 Sets', reps: '8-10 Reps', rpe: 'RPE 8.5', rest: '90s', target: 'Upper Chest', tip: 'Keep shoulder blades retracted and press at 30-degree incline.' },
    { name: 'Barbell Flat Bench Press', sets: '3 Sets', reps: '6-8 Reps', rpe: 'RPE 9.0', rest: '120s', target: 'Mid Chest', tip: 'Arch lower back slightly and drive through legs.' },
    { name: 'Cable Low-to-High Flyes', sets: '3 Sets', reps: '12-15 Reps', rpe: 'RPE 8.0', rest: '60s', target: 'Chest Cleavage', tip: 'Squeeze pecs for 1 second at full contraction.' },
    { name: 'Overhead Rope Tricep Extension', sets: '4 Sets', reps: '10-12 Reps', rpe: 'RPE 8.5', rest: '75s', target: 'Long Head Triceps', tip: 'Flare elbows out slightly and flare rope at top.' },
    { name: 'Weighted Dips / Bodyweight', sets: '3 Sets', reps: 'Till Failure', rpe: 'RPE 9.5', rest: '90s', target: 'Lower Chest & Triceps', tip: 'Lean forward 20 degrees to bias lower pectoral fibers.' }
  ];

  // Module 2: Diet Plan State
  const [dietPreference, setDietPreference] = useState('High-Protein Veg');
  const [waterGlasses, setWaterGlasses] = useState(8);
  const [calorieBudget] = useState({ target: 2350, protein: 165, carbs: 220, fats: 60 });
  const mealsList = [
    { title: 'Breakfast (8:30 AM)', items: 'Paneer Bhurji (150g) + 2 Multigrain Toasts + 1 Banana', calories: '540 kcal', protein: '32g', carbs: '60g', fats: '18g' },
    { title: 'Lunch (1:30 PM)', items: 'Brown Rice (150g) + Yellow Dal Tadka + Greek Curd (100g) + Sprouts Salad', calories: '680 kcal', protein: '38g', carbs: '85g', fats: '16g' },
    { title: 'Pre-Workout Snack (5:15 PM)', items: 'Rolled Oats Porridge with Peanut Butter (1 tbsp) + Black Coffee', calories: '320 kcal', protein: '14g', carbs: '45g', fats: '10g' },
    { title: 'Post-Workout Dinner (8:45 PM)', items: 'Whey Isolate Scoop (in water) + Soya Chunks Stir-Fry with Broccoli & Tofu', calories: '610 kcal', protein: '55g', carbs: '32g', fats: '14g' }
  ];

  // Module 3: Find Coaches State
  const [coachCategory, setCoachCategory] = useState('All');
  const [bookedCoach, setBookedCoach] = useState<string | null>(null);
  const coachesList = [
    { id: 'c1', name: 'Kabir Singhania', spec: 'Strength & Powerlifting', exp: '8 Years', rating: 4.95, rate: '₹1,200 / session', cert: 'CSCS, ISSA', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80' },
    { id: 'c2', name: 'Rohan Deshmukh', spec: 'Fat Loss & HIIT Conditioning', exp: '6 Years', rating: 4.88, rate: '₹950 / session', cert: 'ACE Certified', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80' },
    { id: 'c3', name: 'Aanya Sharma', spec: 'Mobility, Yoga & Rehab', exp: '7 Years', rating: 4.98, rate: '₹1,100 / session', cert: 'RYT-500, NASM-CES', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&q=80' },
    { id: 'c4', name: 'Vikram Rajput', spec: 'Bodybuilding Hypertrophy', exp: '10 Years', rating: 4.92, rate: '₹1,500 / session', cert: 'K11 Master Trainer', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=80' }
  ];

  // Module 4: Progress Tracking State
  const [currentWeight, setCurrentWeight] = useState(76.2);
  const [targetWeight] = useState(72.0);
  const [streakDays] = useState(18);
  const weeklyDays = [
    { day: 'Mon', completed: true },
    { day: 'Tue', completed: true },
    { day: 'Wed', completed: true },
    { day: 'Thu', completed: false, rest: true },
    { day: 'Fri', completed: true },
    { day: 'Sat', completed: true },
    { day: 'Sun', completed: false }
  ];

  // Module 5: Fitness Challenges State
  const [joinedChallenge, setJoinedChallenge] = useState<string | null>('ch1');
  const challengesList = [
    { id: 'ch1', title: '30-Day Squat & Leg Endurance', participants: '1,420 athletes', reward: '500 Gymora Coins + 15% Store Voucher', progress: '18 / 30 Days', status: 'Active' },
    { id: 'ch2', title: '10,000 Steps Daily Blitz', participants: '3,850 athletes', reward: 'Free Shaker Bottle + Badge', progress: 'Day 12 / 21', status: 'Active' },
    { id: 'ch3', title: 'Summer Shred Transformation 2026', participants: '920 athletes', reward: '₹10,000 Cash Prize + Trophy', progress: 'Starts in 4 days', status: 'Upcoming' }
  ];

  // Module 6: Gym Marketplace State
  const [searchCity, setSearchCity] = useState('');
  const [activeGymPass, setActiveGymPass] = useState<any | null>(null);
  const gymsList = [
    { id: 'g1', name: 'IronPeak Fitness & CrossCore', city: 'Indiranagar, Bangalore', distance: '1.2 km away', rating: 4.9, dayPass: '₹199', monthPass: '₹2,499', amenities: ['Steam Room', 'Olympic Platforms', 'Valet Parking'] },
    { id: 'g2', name: 'Pulse Athletic Club', city: 'Koramangala, Bangalore', distance: '2.8 km away', rating: 4.8, dayPass: '₹249', monthPass: '₹2,999', amenities: ['Swimming Pool', 'Sauna', 'CrossFit Rig'] },
    { id: 'g3', name: 'Titan Strength Factory', city: 'HSR Layout, Bangalore', distance: '3.5 km away', rating: 4.95, dayPass: '₹179', monthPass: '₹2,199', amenities: ['24/7 Access', 'Eleiko Plates', 'Ice Bath'] }
  ];

  // ----------------------------------------------------
  // Flowchart Definitions for Each Member Feature
  // ----------------------------------------------------
  const flowcharts: Record<string, { title: string; subtitle: string; steps: FlowStep[] }> = {
    'ai-workout': {
      title: 'AI Workout Plan Generation & Execution Architecture',
      subtitle: 'From biometric assessment to intelligent rest-time interval coaching',
      steps: [
        { step: '01', title: 'Goal & Biometric Intake', desc: 'Member specifies target weight, experience level, available equipment, and joint limitations.', actor: 'Member', badge: 'Input', output: 'Fitness Profile JSON' },
        { step: '02', title: 'AI Muscle Split Synthesis', desc: 'Neural algorithm analyzes recovery time and designs optimal volume and rep schemes (PPL / Bro Split).', actor: 'AI Engine', badge: 'Synthesis', output: 'Weekly Workout Splits' },
        { step: '03', title: 'Injury-Aware Movement Mapping', desc: 'System filters hazardous compound lifts if lower back or shoulder soreness is flagged, replacing them with safe alternatives.', actor: 'AI Engine', badge: 'Safety Audit', output: 'Biomechanical Exercise List' },
        { step: '04', title: 'In-Gym Interactive Rep & Rest Flow', desc: 'Member launches rep player, views HD form demo, logs weight/reps, and listens to automated countdown cues.', actor: 'Member', badge: 'Execution', output: 'Session Data Recorded' },
        { step: '05', title: 'Volume Overload & Streak Verification', desc: 'Calculates progressive overload milestones, awards streak badges, and recalibrates next week’s loads.', actor: 'AI Engine', badge: 'Analytics', output: 'Streak Badge & Next Routine' }
      ]
    },
    'diet-plan': {
      title: 'Metabolic Nutrition & Macronutrient Synthesis Flow',
      subtitle: 'From BMR calculation to precision meal timing and hydration tracking',
      steps: [
        { step: '01', title: 'BMR & TDEE Basal Rate Analysis', desc: 'Calculates Total Daily Energy Expenditure based on current weight, height, age, and workout intensity.', actor: 'AI Engine', badge: 'Metabolism', output: 'Daily Caloric Target' },
        { step: '02', title: 'Macro Partitioning (Protein/Carb/Fat)', desc: 'Allocates optimal protein intake (2.0g/kg) and balances slow-digesting carbs and healthy fats.', actor: 'AI Engine', badge: 'Macro Engine', output: 'Grams per Macronutrient' },
        { step: '03', title: 'Dietary Preference & Recipe Matching', desc: 'Filters meals by High-Protein Veg, Non-Veg, Keto, or Vegan using accessible local market groceries.', actor: 'Member', badge: 'Preference', output: '4-Meal Daily Schedule' },
        { step: '04', title: 'Pre & Post-Workout Nutrient Timing', desc: 'Schedules fast-absorbing carbs 45 mins before session and amino acid recovery meals within 60 mins post-workout.', actor: 'AI Engine', badge: 'Timing Engine', output: 'Optimal Food Windows' },
        { step: '05', title: 'Hydration & Weekly Weight Calibration', desc: 'Member logs daily water intake; AI checks weekly weigh-in trends and auto-adjusts daily calorie deficits.', actor: 'Member', badge: 'Calibration', output: 'Weekly Calorie Recalibration' }
      ]
    },
    'trainers': {
      title: 'Certified Personal Coach Discovery & Booking Flow',
      subtitle: 'Verified mentor selection, session scheduling, and 1-on-1 form reviews',
      steps: [
        { step: '01', title: 'Coach Search & Specialization Filter', desc: 'Member browses trainers filtered by Powerlifting, Fat Loss, Yoga, or Rehabilitation with verified certifications.', actor: 'Member', badge: 'Search', output: 'Filtered Trainer Directory' },
        { step: '02', title: 'Profile & Client Review Inspection', desc: 'Inspect coach certifications (ACE, ISSA, CSCS), client before/after photos, and verifiable member reviews.', actor: 'Member', badge: 'Vetting', output: 'Selected Trainer Match' },
        { step: '03', title: 'Calendar Slot Selection & Booking', desc: 'View real-time calendar availability and reserve 1-on-1 slot (in-gym or virtual video call).', actor: 'Member', badge: 'Scheduling', output: 'Confirmed Session Slot' },
        { step: '04', title: 'Pre-Session Consultation & Form Audit', desc: 'Trainer reviews member goals, checks posture imbalances, and prescribes customized exercise modifications.', actor: 'Coach', badge: 'Consultation', output: 'Personalized Coaching Plan' },
        { step: '05', title: 'Session Check-In & Feedback Rating', desc: 'QR code verified at turnstile; member submits rating and reviews trainer after session completion.', actor: 'Member', badge: 'Settlement', output: 'Trainer Payout & Rating Log' }
      ]
    },
    'progress': {
      title: 'Continuous Progression & Milestone Tracking Architecture',
      subtitle: 'Visual data analytics for weight, body fat %, workout streaks, and PRs',
      steps: [
        { step: '01', title: 'Body Biometrics Logging', desc: 'Member logs daily weight, periodic body fat %, and waist measurements.', actor: 'Member', badge: 'Intake', output: 'Encrypted Biometric Entry' },
        { step: '02', title: 'Moving Average Trend Computation', desc: 'Removes daily water fluctuation noise to generate true 7-day exponential moving average weight lines.', actor: 'AI Engine', badge: 'Math Processing', output: 'Smoothed Trend Graph' },
        { step: '03', title: 'Gym Attendance & Turnstile Sync', desc: 'Automatic turnstile check-ins feed directly into the consistency streak counter with zero manual entry.', actor: 'Member', badge: 'Turnstile Sync', output: 'Streak Days Incremented' },
        { step: '04', title: 'Personal Record (PR) Velocity Radar', desc: 'Monitors progressive overload across primary compound lifts (Squat, Bench, Deadlift, Overhead Press).', actor: 'AI Engine', badge: 'PR Radar', output: 'New PR Badge Unlocked' },
        { step: '05', title: 'Predictive Milestone Forecast', desc: 'AI forecasts the exact estimated week target goal will be reached based on compliance rate.', actor: 'AI Engine', badge: 'Prediction', output: 'Milestone Forecast Date' }
      ]
    },
    'challenges': {
      title: 'Gamification, Fitness Quests & Rewards Architecture',
      subtitle: 'Community endurance quests, leaderboard ranks, and store voucher redemption',
      steps: [
        { step: '01', title: 'Challenge Discovery & Quest Enrollment', desc: 'Member joins gym-wide or network-wide fitness challenge with a single tap.', actor: 'Member', badge: 'Enrollment', output: 'Challenge Roster Registered' },
        { step: '02', title: 'Daily Milestone Verification', desc: 'Workouts, step counts, or attendance logs automatically verify daily challenge task completion.', actor: 'AI Engine', badge: 'Verification', output: 'Daily Checklist Checked' },
        { step: '03', title: 'Real-Time Community Leaderboard', desc: 'Live points aggregation ranks competitors with dynamic badge indicators and streak multipliers.', actor: 'AI Engine', badge: 'Leaderboard', output: 'Updated Rank Position' },
        { step: '04', title: 'Gymora Loyalty Coin Disbursement', desc: 'Completing weekly and 30-day challenge phases instantly deposits digital Gymora Coins into member wallet.', actor: 'AI Engine', badge: 'Payout', output: 'Coins Deposited in Wallet' },
        { step: '05', title: 'Merchandise & Supplement Voucher Claim', desc: 'Member redeems coins for protein supplements, gym accessories, or membership fee discounts.', actor: 'Member', badge: 'Redemption', output: 'Valid POS Barcode Voucher' }
      ]
    },
    'marketplace': {
      title: 'Gym Marketplace, Day-Pass & Contactless Access Flow',
      subtitle: 'Discover clubs, compare amenities, buy passes, and enter via instant QR pass',
      steps: [
        { step: '01', title: 'Geolocation & Multi-Filter Club Search', desc: 'Find nearby verified gyms filtered by equipment, steam/sauna, operating hours, and day-pass pricing.', actor: 'Member', badge: 'Discovery', output: 'Geo-Located Gym Listings' },
        { step: '02', title: 'Pricing Pass & Membership Comparison', desc: 'Compare Day Pass (₹199), 10-Session Flexi Pass, and Monthly/Annual membership tiers with GST breakdown.', actor: 'Member', badge: 'Selection', output: 'Chosen Pass Package' },
        { step: '03', title: 'Encrypted Digital Payment Checkout', desc: 'Instant UPI, Credit Card, or NetBanking payment processing with automated tax invoice generation.', actor: 'Payment Gateway', badge: 'Payment', output: 'Digital Tax Invoice & Receipt' },
        { step: '04', title: 'Dynamic QR Entry Pass Generation', desc: 'System generates dynamic, time-limited QR access pass stored securely inside the mobile wallet.', actor: 'AI Engine', badge: 'Pass Security', output: 'Live Dynamic QR Pass' },
        { step: '05', title: 'Turnstile Scanner Validation & Entry', desc: 'Scan QR code at gym entrance turnstile; access is instantly granted with real-time log recorded.', actor: 'Member', badge: 'Check-In', output: 'Access Granted & Punch In' }
      ]
    }
  };

  const currentFlow = flowcharts[activeKey];
  const activeModuleMeta = allModules.find((m) => m.id === activeKey)!;

  return (
    <div className="min-h-screen bg-[#080B0C] text-[#F5FAFA] selection:bg-[#2DD4BF] selection:text-black">
      {/* Top Navigation */}
      <nav className="border-b border-[#2A3A3A] bg-[#0E1415]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              to="/portal/customer"
              className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors group mr-4"
            >
              <div className="w-8 h-8 rounded-lg bg-[#141D1E] border border-[#2A3A3A] flex items-center justify-center group-hover:border-[#2DD4BF]/50">
                <ArrowLeft size={16} className="text-[#2DD4BF]" />
              </div>
              <span className="text-xs font-semibold hidden sm:inline">Customer Portal</span>
            </Link>

            <div className="h-5 w-px bg-[#2A3A3A] hidden sm:block" />

            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-[#2DD4BF] rounded-xl flex items-center justify-center shadow-lg shadow-[#2DD4BF]/20">
                <activeModuleMeta.icon className="text-black" size={20} />
              </div>
              <div>
                <span className="text-base font-bold text-white block leading-tight">Gymora</span>
                <span className="text-[10px] text-[#2DD4BF] font-semibold uppercase tracking-wider block">
                  Customer & Athlete Suite
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/portal/customer"
              className="px-4 py-2 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-black font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-[#2DD4BF]/25 flex items-center gap-2"
            >
              <span>Portal Overview</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Module Switcher Tabs */}
      <div className="border-b border-[#2A3A3A] bg-[#0E1415] overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-1 py-2">
          {allModules.map((mod) => {
            const Icon = mod.icon;
            const isActive = mod.id === activeKey;
            return (
              <button
                key={mod.id}
                onClick={() => navigate(`/portal/customer/${mod.id}`)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#2DD4BF] text-black shadow-md shadow-[#2DD4BF]/20 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-[#141D1E]'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-black' : 'text-[#2DD4BF]'} />
                <span>{mod.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero Header */}
      <header className="relative py-14 px-4 sm:px-6 lg:px-8 border-b border-[#2A3A3A] bg-gradient-to-b from-[#0E1415] via-[#080B0C] to-[#080B0C]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141D1E] border border-[#2A3A3A] text-xs font-bold text-[#2DD4BF]">
              <Sparkles size={13} />
              <span>LIVE INTERACTIVE ATHLETE CAPABILITY</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              {activeModuleMeta.label}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {activeModuleMeta.subtitle}. Explore the end-to-end execution flowchart below and test the interactive athlete tools right on this page.
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col gap-3 shrink-0">
            <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center">
                <Zap size={16} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">System Status</span>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active & Operational
                </span>
              </div>
            </div>
            <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center">
                <ShieldCheck size={16} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Access Level</span>
                <span className="text-xs font-bold text-white">Public Interactive Mode</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* SECTION 1: VISUAL FLOWCHART ARCHITECTURE */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#2DD4BF] block mb-1">
                EXECUTION ARCHITECTURE & PROCESS FLOW
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {currentFlow.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {currentFlow.subtitle}
              </p>
            </div>
          </div>

          {/* Flowchart Diagram Card Grid */}
          <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
              {currentFlow.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/50 rounded-2xl p-5 transition-all flex flex-col justify-between space-y-4 relative group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-black font-mono text-[#2DD4BF]/40 group-hover:text-[#2DD4BF] transition-colors">
                        {step.step}
                      </span>
                      <div className="flex items-center gap-2">
                        {step.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1B2728] text-slate-300 border border-[#2A3A3A]">
                            {step.badge}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            step.actor === 'Member'
                              ? 'bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/30'
                              : step.actor === 'AI Engine'
                              ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                              : step.actor === 'Coach'
                              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {step.actor}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#2DD4BF] transition-colors">
                      {step.title}
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Output:</span>
                    <span className="font-semibold text-slate-200 truncate max-w-[180px]">
                      {step.output}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Connecting Legend */}
            <div className="mt-8 pt-6 border-t border-[#2A3A3A] flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-semibold text-white">Flow Actors:</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2DD4BF]" /> Member Floor Action
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> AI Neural Processing
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Certified Coach Interaction
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Banking Gateway
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#2DD4BF]">
                <Zap size={14} />
                <span className="font-semibold">Real-time state synchronization</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: INTERACTIVE LIVE OPERATIONAL WORKSPACE */}
        
        {/* MODULE 1: SMART AI WORKOUT ENGINE */}
        {activeKey === 'ai-workout' && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider block mb-1">
                  INTERACTIVE WORKOUT GENERATOR
                </span>
                <h3 className="text-2xl font-bold text-white">Custom Program Builder & Rep Player</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure your split, select target muscles, and preview dynamic exercise prescriptions
                </p>
              </div>
              <button
                onClick={() => setHasGeneratedWorkout(true)}
                className="px-5 py-2.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-black font-bold text-xs rounded-xl transition-all shadow-md shadow-[#2DD4BF]/20 flex items-center gap-2"
              >
                <RotateCcw size={14} />
                <span>Regenerate AI Routine</span>
              </button>
            </div>

            {/* Config Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl p-4 space-y-2">
                <span className="text-xs font-bold text-slate-400">Workout Split Scheme</span>
                <select
                  value={selectedSplit}
                  onChange={(e) => setSelectedSplit(e.target.value)}
                  className="w-full bg-[#141D1E] border border-[#2A3A3A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
                >
                  {workoutSplits.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl p-4 space-y-2">
                <span className="text-xs font-bold text-slate-400">Target Muscle Group</span>
                <select
                  value={selectedMuscle}
                  onChange={(e) => setSelectedMuscle(e.target.value)}
                  className="w-full bg-[#141D1E] border border-[#2A3A3A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
                >
                  <option value="Chest & Triceps">Chest & Triceps (Push Day)</option>
                  <option value="Back & Biceps">Back & Biceps (Pull Day)</option>
                  <option value="Quads & Calves">Quads & Calves (Leg Day A)</option>
                  <option value="Hamstrings & Glutes">Hamstrings & Glutes (Leg Day B)</option>
                  <option value="Shoulders & Core">Shoulders & Core</option>
                </select>
              </div>
              <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl p-4 space-y-2">
                <span className="text-xs font-bold text-slate-400">Primary Objective</span>
                <select
                  value={fitnessGoal}
                  onChange={(e) => setFitnessGoal(e.target.value)}
                  className="w-full bg-[#141D1E] border border-[#2A3A3A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
                >
                  <option value="Hypertrophy (Muscle Gain)">Hypertrophy (Muscle Gain)</option>
                  <option value="Strength & Power">Strength & Power (Low Reps)</option>
                  <option value="Metabolic Fat Loss">Metabolic Fat Loss (High Density)</option>
                </select>
              </div>
            </div>

            {/* Generated Exercise Cards Table */}
            <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Bot size={16} className="text-[#2DD4BF]" />
                  <span>Synthesized Program: {selectedSplit} — {selectedMuscle}</span>
                </h4>
                <span className="text-xs font-bold text-[#2DD4BF] px-3 py-1 bg-[#2DD4BF]/10 rounded-full border border-[#2DD4BF]/20">
                  Est. 52 Mins • 420 kcal
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141D1E] text-slate-400 uppercase text-[10px] font-bold border-b border-[#2A3A3A]">
                    <tr>
                      <th className="px-5 py-3.5">Exercise Movement</th>
                      <th className="px-5 py-3.5">Sets & Reps</th>
                      <th className="px-5 py-3.5">Target Intensity</th>
                      <th className="px-5 py-3.5">Rest Interval</th>
                      <th className="px-5 py-3.5">Target Muscle</th>
                      <th className="px-5 py-3.5">Form Coaching Tip</th>
                      <th className="px-5 py-3.5 text-right">Demo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A3A3A]">
                    {exercisesList.map((ex, idx) => (
                      <tr key={idx} className="hover:bg-[#141D1E]/40 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-white flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-[#1B2728] border border-[#2A3A3A] text-[10px] flex items-center justify-center text-[#2DD4BF]">
                            {idx + 1}
                          </span>
                          {ex.name}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-300">{ex.sets} × {ex.reps}</td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            {ex.rpe}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[#2DD4BF] flex items-center gap-1">
                          <Clock size={12} /> {ex.rest}
                        </td>
                        <td className="px-5 py-3.5 text-slate-300">{ex.target}</td>
                        <td className="px-5 py-3.5 text-slate-400 max-w-xs truncate">{ex.tip}</td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => setActiveExerciseModal(ex)}
                            className="px-3 py-1 bg-[#141D1E] hover:bg-[#2DD4BF] hover:text-black text-[#2DD4BF] border border-[#2A3A3A] font-bold rounded-lg transition-colors flex items-center gap-1 text-[11px] ml-auto"
                          >
                            <Play size={10} /> Preview
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Exercise Modal */}
            {activeExerciseModal && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#0E1415] border border-[#2DD4BF]/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-[#2A3A3A] pb-3">
                    <h3 className="text-lg font-bold text-white">{activeExerciseModal.name}</h3>
                    <button
                      onClick={() => setActiveExerciseModal(null)}
                      className="text-slate-400 hover:text-white text-sm"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="rounded-2xl overflow-hidden bg-black/60 h-48 flex items-center justify-center border border-[#2A3A3A] relative">
                    <img 
                      src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&q=80" 
                      alt="Exercise Demo" 
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute w-12 h-12 rounded-full bg-[#2DD4BF] flex items-center justify-center text-black shadow-lg shadow-[#2DD4BF]/40">
                      <Play size={20} className="ml-1" />
                    </div>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Prescribed Sets: <strong className="text-white">{activeExerciseModal.sets}</strong></span>
                      <span>Target Reps: <strong className="text-white">{activeExerciseModal.reps}</strong></span>
                      <span>Rest: <strong className="text-[#2DD4BF]">{activeExerciseModal.rest}</strong></span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#141D1E] border border-[#2A3A3A] text-slate-300">
                      <strong className="text-[#2DD4BF] block mb-1">Execution Coaching Note:</strong>
                      {activeExerciseModal.tip}
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveExerciseModal(null)}
                    className="w-full py-2.5 bg-[#2DD4BF] text-black font-bold text-xs rounded-xl"
                  >
                    Close Demo
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* MODULE 2: DIET & NUTRITION */}
        {activeKey === 'diet-plan' && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider block mb-1">
                  METABOLIC NUTRITION SYNTHESIS
                </span>
                <h3 className="text-2xl font-bold text-white">Daily Calorie Budget & Meal Schedules</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Macro-balanced nutrition tailored to muscle recovery and fat loss
                </p>
              </div>

              {/* Preference Filter */}
              <div className="flex items-center gap-2 bg-[#0E1415] p-1.5 rounded-2xl border border-[#2A3A3A]">
                {['High-Protein Veg', 'Balanced Non-Veg', 'Clean Keto'].map((diet) => (
                  <button
                    key={diet}
                    onClick={() => setDietPreference(diet)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      dietPreference === diet
                        ? 'bg-[#2DD4BF] text-black shadow-md shadow-[#2DD4BF]/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {diet}
                  </button>
                ))}
              </div>
            </div>

            {/* Macro Cards & Water Intake */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl p-4">
                <span className="text-xs text-slate-400 block font-bold">Daily Calories</span>
                <span className="text-2xl font-black text-white font-mono">{calorieBudget.target}</span>
                <span className="text-[10px] text-[#2DD4BF] block mt-1">Deficit Target for Fat Loss</span>
              </div>
              <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl p-4">
                <span className="text-xs text-slate-400 block font-bold">Protein Target</span>
                <span className="text-2xl font-black text-[#2DD4BF] font-mono">{calorieBudget.protein}g</span>
                <span className="text-[10px] text-slate-400 block mt-1">2.1g per kg bodyweight</span>
              </div>
              <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl p-4">
                <span className="text-xs text-slate-400 block font-bold">Carbohydrates</span>
                <span className="text-2xl font-black text-white font-mono">{calorieBudget.carbs}g</span>
                <span className="text-[10px] text-slate-400 block mt-1">Clean energy for workouts</span>
              </div>
              <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-slate-400 block font-bold">Hydration Tracker</span>
                  <span className="text-2xl font-black text-cyan-400 font-mono">{(waterGlasses * 0.35).toFixed(1)}L / 3.5L</span>
                </div>
                <button
                  onClick={() => setWaterGlasses((prev) => Math.min(prev + 1, 14))}
                  className="mt-2 py-1 px-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1"
                >
                  <Droplet size={11} /> +1 Glass (350ml)
                </button>
              </div>
            </div>

            {/* Meal Plan List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mealsList.map((meal, idx) => (
                <div key={idx} className="bg-[#0E1415] border border-[#2A3A3A] hover:border-[#2DD4BF]/40 rounded-3xl p-5 space-y-3 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider">{meal.title}</span>
                    <span className="text-xs font-mono font-bold text-white bg-[#141D1E] px-2.5 py-1 rounded-full border border-[#2A3A3A]">
                      {meal.calories}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{meal.items}</h4>
                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-[#2A3A3A]">
                    <span>Protein: <strong className="text-[#2DD4BF]">{meal.protein}</strong></span>
                    <span>Carbs: <strong className="text-slate-200">{meal.carbs}</strong></span>
                    <span>Fats: <strong className="text-slate-200">{meal.fats}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* MODULE 3: CERTIFIED PERSONAL COACHES */}
        {activeKey === 'trainers' && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider block mb-1">
                  1-ON-1 PERSONAL TRAINING
                </span>
                <h3 className="text-2xl font-bold text-white">Certified Coach Directory & Booking</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Book personal mentors for in-gym training, online consultations, and technique corrections
                </p>
              </div>

              {bookedCoach && (
                <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Check size={14} />
                  <span>Trial Session Booked with {bookedCoach}!</span>
                </div>
              )}
            </div>

            {/* Coach Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {coachesList.map((coach) => (
                <div
                  key={coach.id}
                  className="bg-[#0E1415] border border-[#2A3A3A] hover:border-[#2DD4BF]/50 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between transition-all group"
                >
                  <div>
                    <div className="h-44 overflow-hidden relative">
                      <img 
                        src={coach.image} 
                        alt={coach.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0E1415] via-transparent to-transparent" />
                      <div className="absolute top-3 right-3 bg-[#080B0C]/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-[#2A3A3A] text-[11px] font-bold text-amber-400 flex items-center gap-1">
                        <Star size={11} fill="currentColor" /> {coach.rating}
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <h4 className="text-base font-bold text-white group-hover:text-[#2DD4BF] transition-colors">
                        {coach.name}
                      </h4>
                      <p className="text-xs text-slate-400">{coach.spec}</p>
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#141D1E] text-slate-300 border border-[#2A3A3A]">
                          {coach.cert}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#141D1E] text-slate-300 border border-[#2A3A3A]">
                          {coach.exp} Exp
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="text-slate-400">Rate:</span>
                      <span className="font-bold font-mono text-[#2DD4BF]">{coach.rate}</span>
                    </div>
                    <button
                      onClick={() => setBookedCoach(coach.name)}
                      className="w-full py-2.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-black font-bold text-xs rounded-xl transition-all shadow-md shadow-[#2DD4BF]/20"
                    >
                      Book Free Trial Slot
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* MODULE 4: PROGRESS & MILESTONES */}
        {activeKey === 'progress' && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider block mb-1">
                  BIOMETRIC & STREAK ANALYTICS
                </span>
                <h3 className="text-2xl font-bold text-white">Transformation Milestones & Attendance Streak</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Track weight changes, consistency streaks, and strength progression metrics
                </p>
              </div>

              <div className="flex items-center gap-2 bg-[#0E1415] border border-[#2A3A3A] px-4 py-2 rounded-2xl">
                <Flame size={18} className="text-amber-400 animate-pulse" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Consistency Streak</span>
                  <span className="text-sm font-black text-white">{streakDays} Consecutive Days</span>
                </div>
              </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl p-5 space-y-2">
                <span className="text-xs text-slate-400 font-bold block">Current Bodyweight</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white font-mono">{currentWeight} kg</span>
                  <span className="text-xs font-bold text-emerald-400">-4.2 kg this month</span>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setCurrentWeight((prev) => parseFloat((prev - 0.2).toFixed(1)))}
                    className="px-2 py-1 bg-[#141D1E] hover:bg-[#2DD4BF] hover:text-black text-xs rounded border border-[#2A3A3A]"
                  >
                    -0.2 kg
                  </button>
                  <button
                    onClick={() => setCurrentWeight((prev) => parseFloat((prev + 0.2).toFixed(1)))}
                    className="px-2 py-1 bg-[#141D1E] hover:bg-[#2DD4BF] hover:text-black text-xs rounded border border-[#2A3A3A]"
                  >
                    +0.2 kg
                  </button>
                  <span className="text-[10px] text-slate-500 ml-auto">Target: {targetWeight} kg</span>
                </div>
              </div>

              <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl p-5 space-y-2">
                <span className="text-xs text-slate-400 font-bold block">Weekly Workout Compliance</span>
                <div className="flex items-center justify-between pt-1">
                  {weeklyDays.map((w, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">{w.day}</span>
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                          w.completed
                            ? 'bg-[#2DD4BF] text-black shadow-md shadow-[#2DD4BF]/20'
                            : w.rest
                            ? 'bg-[#141D1E] text-slate-500 border border-[#2A3A3A]'
                            : 'bg-[#1B2728] text-slate-600'
                        }`}
                      >
                        {w.completed ? <Check size={12} /> : w.rest ? 'Zz' : '-'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl p-5 space-y-2">
                <span className="text-xs text-slate-400 font-bold block">Personal Record (PR) Velocity</span>
                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Bench Press:</span>
                    <strong className="text-white font-mono">105 kg (+5 kg)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Barbell Back Squat:</span>
                    <strong className="text-white font-mono">140 kg (+10 kg)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Conventional Deadlift:</span>
                    <strong className="text-white font-mono">175 kg (+15 kg)</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* MODULE 5: FITNESS CHALLENGES & REWARDS */}
        {activeKey === 'challenges' && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider block mb-1">
                  GAMIFICATION & REWARD TIERS
                </span>
                <h3 className="text-2xl font-bold text-white">Active Challenges & Member Badges</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete endurance quests, climb the community leaderboard, and unlock store vouchers
                </p>
              </div>

              <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl px-4 py-2 flex items-center gap-3">
                <Award size={18} className="text-[#2DD4BF]" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Gymora Coins</span>
                  <span className="text-sm font-black text-[#2DD4BF] font-mono">1,850 Coins</span>
                </div>
              </div>
            </div>

            {/* Challenge Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {challengesList.map((ch) => (
                <div
                  key={ch.id}
                  className="bg-[#0E1415] border border-[#2A3A3A] hover:border-[#2DD4BF]/50 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#141D1E] text-slate-300 border border-[#2A3A3A]">
                        {ch.participants}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20">
                        {ch.status}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white">{ch.title}</h4>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Progress:</span>
                        <span className="font-bold text-white">{ch.progress}</span>
                      </div>
                      <div className="w-full bg-[#141D1E] h-2 rounded-full overflow-hidden border border-[#2A3A3A]">
                        <div className="bg-[#2DD4BF] h-full w-[60%]" />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#141D1E] border border-[#2A3A3A] text-[11px] text-slate-300">
                      <strong className="text-[#2DD4BF] block mb-0.5">Reward Bounty:</strong>
                      {ch.reward}
                    </div>
                  </div>

                  <button
                    onClick={() => setJoinedChallenge(ch.id)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                      joinedChallenge === ch.id
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-[#2DD4BF] hover:bg-[#5EEAD4] text-black shadow-md shadow-[#2DD4BF]/20'
                    }`}
                  >
                    {joinedChallenge === ch.id ? '✓ Participating (Day 18)' : 'Join Challenge'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* MODULE 6: GYM MARKETPLACE & PASSES */}
        {activeKey === 'marketplace' && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider block mb-1">
                  MULTI-CLUB ACCESS PASSES
                </span>
                <h3 className="text-2xl font-bold text-white">Verified Gym Explorer & Instant Turnstile QR</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Browse top-tier gym facilities, compare passes, and generate dynamic digital QR entry passes
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by area / gym..."
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full bg-[#0E1415] border border-[#2A3A3A] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2DD4BF]"
                />
              </div>
            </div>

            {/* Gym Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {gymsList.map((gym) => (
                <div
                  key={gym.id}
                  className="bg-[#0E1415] border border-[#2A3A3A] hover:border-[#2DD4BF]/50 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Verified Facility
                      </span>
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                        <Star size={12} fill="currentColor" /> {gym.rating}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white">{gym.name}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin size={12} className="text-[#2DD4BF]" /> {gym.city} • {gym.distance}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {gym.amenities.map((amenity, i) => (
                        <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#141D1E] text-slate-300 border border-[#2A3A3A]">
                          {amenity}
                        </span>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Single Day Pass</span>
                        <strong className="text-base font-black text-[#2DD4BF] font-mono">{gym.dayPass}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Monthly Unlimited</span>
                        <strong className="text-base font-black text-white font-mono">{gym.monthPass}</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveGymPass(gym)}
                    className="w-full py-2.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-black font-bold text-xs rounded-xl transition-all shadow-md shadow-[#2DD4BF]/20 flex items-center justify-center gap-1.5"
                  >
                    <QrCode size={14} />
                    <span>Generate Instant Turnstile Pass</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Instant QR Pass Modal */}
            {activeGymPass && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#0E1415] border border-[#2DD4BF]/40 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-[#2A3A3A] pb-3 text-left">
                    <div>
                      <h4 className="text-sm font-bold text-white">{activeGymPass.name}</h4>
                      <span className="text-[10px] text-emerald-400 font-semibold">Day Pass • Active Gate Entry</span>
                    </div>
                    <button onClick={() => setActiveGymPass(null)} className="text-slate-400 hover:text-white text-sm">
                      ✕
                    </button>
                  </div>

                  <div className="bg-white p-4 rounded-2xl inline-block shadow-lg">
                    {/* Simulated QR Code Canvas */}
                    <div className="w-48 h-48 bg-slate-900 rounded-xl flex flex-col items-center justify-center text-white p-3 space-y-2">
                      <QrCode size={96} className="text-[#2DD4BF]" />
                      <span className="text-[10px] font-mono text-slate-400 tracking-wider">GYMORA-PASS-88421</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-300">
                    <p className="font-semibold text-white">Scan at Entrance Turnstile A or B</p>
                    <p className="text-[11px] text-slate-500">Valid today until 11:59 PM • Contactless Gate Unlocked</p>
                  </div>

                  <button
                    onClick={() => setActiveGymPass(null)}
                    className="w-full py-2.5 bg-[#2DD4BF] text-black font-bold text-xs rounded-xl"
                  >
                    Done / Close Pass
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* SECTION 3: MODULE DIRECTORY & SWITCHER */}
        <section className="bg-gradient-to-r from-[#0E1415] via-[#141D1E] to-[#0E1415] border border-[#2DD4BF]/30 rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden shadow-2xl">
          <div className="max-w-3xl mx-auto space-y-6 relative z-10">
            <span className="px-3 py-1 rounded-full bg-[#2DD4BF]/15 text-[#2DD4BF] border border-[#2DD4BF]/30 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles size={13} /> Complete Athlete Ecosystem
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Explore All 6 Customer Features & Live Flowcharts
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Switch between modules below to review detailed system processes, interactive simulators, and technical flowcharts.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {allModules.map((mod) => {
                const isActive = mod.id === activeKey;
                const Icon = mod.icon;
                return (
                  <Link
                    key={mod.id}
                    to={`/portal/customer/${mod.id}`}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-[#2DD4BF] text-black shadow-lg shadow-[#2DD4BF]/20'
                        : 'bg-[#141D1E] text-slate-300 hover:text-white border border-[#2A3A3A] hover:border-[#2DD4BF]/40'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{mod.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[#2A3A3A] flex justify-center">
              <Link
                to="/portal/customer"
                className="px-6 py-2.5 bg-[#141D1E] hover:bg-[#1B2728] text-[#2DD4BF] font-semibold rounded-xl text-xs border border-[#2A3A3A] hover:border-[#2DD4BF]/40 transition-all flex items-center gap-2"
              >
                <ArrowLeft size={14} />
                <span>Return to Customer Portal Overview</span>
              </Link>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
