import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  Briefcase,
  ArrowRight,
  Sparkles,
  Award,
  Building2,
  TrendingUp,
  Users,
  Target,
  Dumbbell,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  Calendar,
  Activity,
  HeartHandshake,
  Compass,
  FileCheck,
  Clock,
  ExternalLink,
  ChevronRight,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import { TrainerPageLayout } from './TrainerPageLayout';
import trainerImg1 from '../../assets/Trainer landing image 1.jpg';
import trainerImg2 from '../../assets/Trainer landing image 2.jpg';
import trainerImg3 from '../../assets/Trainer landing image 3.jpg';
import trainerImg4 from '../../assets/Trainer landing image 4.jpg';
import trainerImg5 from '../../assets/Trainer landing image 5.jpg';

export const TrainerLandingPage: React.FC = () => {
  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeTrainerTab, setActiveTrainerTab] = useState<'benefits' | 'responsibilities'>('benefits');

  const toggleFaq = (index: number) => {
    setOpenFaq(prev => (prev === index ? null : index));
  };

  const steps = [
    {
      step: '01',
      stage: 'Step 01',
      title: 'Create Your Profile',
      tag: 'Profile Setup',
      desc: 'Showcase your experience, certifications, skills, and fitness specializations.',
      details: 'Highlight verified credentials (ACE, ISSA, NASM), training methodologies, available hours, and client transformations.',
      icon: UserCheck,
      image: trainerImg1
    },
    {
      step: '02',
      stage: 'Step 02',
      title: 'Explore Opportunities',
      tag: 'Gym Vacancies',
      desc: 'Discover gym opportunities that match your expertise and preferred location.',
      details: 'Browse gym partners seeking full-time staff, part-time personal trainers, strength coaches, and group class instructors.',
      icon: Compass,
      image: trainerImg2
    },
    {
      step: '03',
      stage: 'Step 03',
      title: 'Connect with Gyms',
      tag: 'Interview & Approval',
      desc: 'Learn about the recruitment and approval process.',
      details: 'Submit inquiries directly to verified gym managers, arrange facility interviews, and receive formal placement approvals.',
      icon: Building2,
      image: trainerImg3
    },
    {
      step: '04',
      stage: 'Step 04',
      title: 'Grow Your Career',
      tag: 'Active Coaching',
      desc: 'Develop your professional experience and help customers achieve their fitness goals.',
      details: 'Build your client roster, log training milestones, expand your reputation, and maximize your personal coaching revenue.',
      icon: TrendingUp,
      image: trainerImg4
    }
  ];

  const benefits = [
    {
      title: 'Professional Profile Showcase',
      desc: 'Display your bio, certifications, specialized workout regimes, and verifiable coaching milestones in a unified, verified digital card.',
      icon: Award
    },
    {
      title: 'Gym Career Opportunities',
      desc: 'Gain direct visibility among licensed gym owners actively hiring certified trainers for strength, conditioning, pilates, and HIIT.',
      icon: Briefcase
    },
    {
      title: 'Fitness Expertise Recognition',
      desc: 'Establish credibility through verified client reviews, gym endorsements, and specialized accreditation badges visible to prospects.',
      icon: Sparkles
    },
    {
      title: 'Professional Career Development',
      desc: 'Access structured career pathways, transition from floor trainer to senior coach or master trainer with clear achievement tiers.',
      icon: TrendingUp
    },
    {
      title: 'Customer Training and Guidance',
      desc: 'Equip yourself with tools to construct tailored workout splits, monitor training progress, and guide athletes towards real transformation.',
      icon: HeartHandshake
    },
    {
      title: 'Performance and Skill Improvement',
      desc: 'Continuous exposure to evolving training trends, client recovery analytics, and professional workshop announcements.',
      icon: Target
    }
  ];

  const responsibilities = [
    {
      title: 'Guide customers towards their fitness goals',
      desc: 'Conduct initial physical fitness assessments, listen to member aspirations, and establish realistic, measurable short and long-term milestones.',
      icon: Target
    },
    {
      title: 'Provide appropriate workout guidance',
      desc: 'Design progressive resistance training, cardiovascular splits, and functional mobility circuits aligned with individual member capabilities.',
      icon: Dumbbell
    },
    {
      title: 'Help customers understand workout routines and exercise techniques',
      desc: 'Teach biomechanically correct lifting form, equipment setup, pacing, breathing techniques, and active injury prevention strategies.',
      icon: BookOpen
    },
    {
      title: 'Support customers with general fitness and nutrition education',
      desc: 'Deliver evidence-based advice on hydration, macronutrient balance, sleep recovery, and healthy lifestyle habits within professional scope.',
      icon: Activity
    },
    {
      title: 'Monitor fitness progress when working with customers',
      desc: 'Track workout completion, strength progressions, endurance improvements, and body composition changes to fine-tune routines.',
      icon: TrendingUp
    },
    {
      title: 'Maintain professional communication and conduct',
      desc: 'Uphold strict punctuality, respectful member interactions, gym code of conduct, and clear client communication at all times.',
      icon: ShieldCheck
    }
  ];

  const faqs = [
    {
      q: 'How can I become a trainer on this platform?',
      a: 'You can start by clicking "Join as a Trainer" to create your preliminary coach profile. Provide your personal details, fitness specializations, certified qualifications, and preferred gym locations. Once submitted, your profile becomes discoverable by partner gyms and facility administrators.'
    },
    {
      q: 'What qualifications are recommended for fitness trainers?',
      a: 'Recognized industry certifications such as ACE, NASM, ISSA, ACSM, NSCA, or accredited national equivalents (e.g. K11, REPs Level 3) are strongly recommended. Specializations in Strength & Conditioning, Pre/Post-Natal, Rehabilitation, or Sports Nutrition significantly improve placement potential.'
    },
    {
      q: 'Can I showcase my fitness specializations?',
      a: 'Yes. Your trainer profile allows you to explicitly list your training modalities—including Hypertrophy, Powerlifting, HIIT, Functional Training, Yoga, and Mobility. You can also detail your coaching philosophy and past athletic background.'
    },
    {
      q: 'How can I discover gym opportunities?',
      a: 'You can explore available openings via the Gym Careers directory. Partner gyms regularly publish openings for floor trainers, private personal coaches, and group class instructors. You can review role criteria and submit your candidacy directly.'
    },
    {
      q: 'How does the gym approval process work?',
      a: 'When you apply or get invited by a gym owner, the facility administrator reviews your uploaded certifications, verifies your identity, and conducts an interview or practical assessment. Upon formal approval, your profile is attached to that gym facility on the platform.'
    },
    {
      q: 'Where can I get assistance?',
      a: 'Our trainer support team is accessible via the Help & Support page and contact form at /trainers/support or /trainers/contact. We provide guidance on onboarding, profile updates, and platform navigation.'
    }
  ];

  return (
    <TrainerPageLayout>
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-[#FFF7ED] rounded-full blur-[130px] -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF7ED] border border-[#FFEDD5] text-[#EA580C] text-xs font-semibold mb-6 shadow-sm">
                <Sparkles size={14} />
                <span>Dedicated Fitness Trainer</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#111827] leading-[1.15] mb-6">
                Build Your Fitness Career <br className="hidden sm:block" />
                <span className="text-[#EA580C]">with the Right Gym</span>
              </h1>

              <p className="text-base sm:text-lg text-[#111827] max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed font-normal">
                Showcase your fitness expertise, connect with gym opportunities, guide customers towards their fitness goals, and grow your career as a professional fitness trainer.
              </p>

              {/* Call-To-Action Button */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-10">
                <Link
                  to="/careers"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold text-[#FFFFFF] bg-[#C2410C] hover:bg-[#9A3412] transition-all shadow-lg shadow-orange-500/15 flex items-center justify-center gap-2 group"
                >
                  <Briefcase size={16} />
                  <span>Explore Opportunities</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Highlights row */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#E2E8F0]/70 max-w-lg mx-auto lg:mx-0">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#111827]">100%</div>
                  <div className="text-[11px] text-[#64748B] mt-0.5 font-medium">Verified Facilities</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#EA580C]">Flexible</div>
                  <div className="text-[11px] text-[#64748B] mt-0.5 font-medium">Full & Part-Time</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#111827]">Direct</div>
                  <div className="text-[11px] text-[#64748B] mt-0.5 font-medium">Gym Management</div>
                </div>
              </div>
            </div>

            {/* Right Container: Trainer Hero Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-[#E2E8F0] shadow-2xl shadow-black bg-[#FFFFFF] group">
                <img
                  src="/trainer-hero.jpg"
                  alt="Build Your Fitness Career"
                  className="w-full h-[380px] sm:h-[480px] object-cover object-center block group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. About Us Section - Split Layout with Left Content & Right Image */}
      <section className="py-20 sm:py-24 bg-[#F8FAFC] border-y border-[#E2E8F0]" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Side: Short, Clear Content */}
            <div className="lg:col-span-7 text-left">
              <span className="text-xs font-bold text-[#EA580C] uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-[#FFF7ED] border border-[#FFEDD5] inline-block mb-4">
                About Our Ecosystem
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111827] tracking-tight mb-4 leading-tight">
                Empowering Fitness Trainers
              </h2>
              <p className="text-base sm:text-lg text-[#64748B] leading-relaxed mb-8 max-w-2xl">
                We help fitness professionals showcase their expertise, connect with top gyms, and build successful coaching careers.
              </p>

              {/* 3 Short Value Points */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#FFEDD5] transition-colors group">
                  <div className="w-11 h-11 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C] shrink-0 group-hover:scale-105 transition-transform">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#111827] text-base mb-1">Showcase Your Skills</h3>
                    <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                      Build a verified coach profile featuring your certifications, specialties, and client transformations.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#FFEDD5] transition-colors group">
                  <div className="w-11 h-11 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C] shrink-0 group-hover:scale-105 transition-transform">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#111827] text-base mb-1">Discover Gym Opportunities</h3>
                    <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                      Connect directly with top gyms actively hiring certified personal trainers and class instructors.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#FFEDD5] transition-colors group">
                  <div className="w-11 h-11 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C] shrink-0 group-hover:scale-105 transition-transform">
                    <HeartHandshake size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#111827] text-base mb-1">Support Customer Goals</h3>
                    <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                      Deliver personalized workout routines and help members reach their fitness goals with confidence.
                    </p>
                  </div>
                </div>
              </div>


            </div>

            {/* Right Side: Showcase Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-[#E2E8F0] shadow-2xl shadow-black bg-[#FFFFFF] group">
                <img
                  src={trainerImg5}
                  alt="Empowering Fitness Trainers"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-[400px] sm:h-[500px] object-cover object-center block group-hover:scale-105 transition-transform duration-700 select-none pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works - Process Flowchart Section */}
      <section className="py-20 sm:py-24 bg-[#FFFFFF] border-t border-[#E2E8F0]" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold text-[#EA580C] uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-[#FFF7ED] border border-[#FFEDD5] inline-flex items-center gap-2 mb-4">
              <Sparkles size={13} />
              <span>Trainer Onboarding Flowchart</span>
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111827] tracking-tight mb-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg text-[#64748B] leading-relaxed">
              A transparent, step-by-step career flowchart guiding fitness professionals from profile verification to active gym placement and client growth.
            </p>
          </div>

          {/* Flowchart Progress Track (Desktop) */}
          <div className="hidden lg:block mb-12 max-w-5xl mx-auto">
            <div className="relative flex items-center justify-between">
              {/* Connecting line behind steps */}
              <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-0.5 bg-gradient-to-r from-[#EA580C]/30 via-[#F97316] to-[#EA580C]/30 -z-0" />

              {steps.map((item) => (
                <div key={item.step} className="relative z-10 flex flex-col items-center bg-[#FFFFFF] px-3">
                  <div className="w-10 h-10 rounded-full bg-[#FFFFFF] border-2 border-[#FDBA74] text-[#EA580C] font-black text-sm flex items-center justify-center shadow-lg shadow-orange-500/15 mb-2">
                    {item.step}
                  </div>
                  <span className="text-xs font-bold text-[#111827] tracking-wide">
                    {item.title}
                  </span>
                  <span className="text-[10px] text-[#EA580C] font-medium mt-0.5">
                    {item.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Flowchart Cards Grid with Attached Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              const isLast = idx === steps.length - 1;

              return (
                <div key={item.step} className="relative flex flex-col">
                  {/* Flowchart Card */}
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#FFEDD5] rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between group shadow-xl hover:shadow-orange-500/15 h-full">
                    {/* Top Image Container */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#FFFFFF] border-b border-[#E2E8F0]">
                      <img
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC]/20 to-transparent" />

                      {/* Step Number Badge Overlay */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFFFFF]/90 backdrop-blur-md border border-[#FFEDD5] text-xs font-mono font-bold text-[#EA580C] shadow-md">
                        <span>STAGE {item.step}</span>
                      </div>

                      {/* Icon Badge Overlay */}
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-[#FFFFFF]/90 backdrop-blur-md border border-[#E2E8F0] text-[#EA580C] flex items-center justify-center shadow-md group-hover:border-[#FDBA74] transition-colors">
                        <Icon size={16} />
                      </div>

                      {/* Tag pill at bottom of image */}
                      <div className="absolute bottom-2.5 left-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#EA580C] bg-[#FFF7ED] border border-[#FFEDD5] px-2 py-0.5 rounded-md backdrop-blur-sm">
                          {item.tag}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-[#111827] group-hover:text-[#EA580C] transition-colors mb-2">
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#111827] mb-3 leading-relaxed">
                          {item.desc}
                        </p>
                        <p className="text-xs text-[#64748B] leading-relaxed border-t border-[#E2E8F0]/60 pt-3">
                          {item.details}
                        </p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-[#E2E8F0]/60 flex items-center justify-between text-xs font-semibold text-[#EA580C]">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 size={14} className="text-[#EA580C]" />
                          <span>Verified Milestone</span>
                        </span>
                        <ChevronRight size={14} className="text-[#64748B] group-hover:text-[#EA580C] group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>

                  {/* Flowchart Connector Arrow Between Cards (Desktop) */}
                  {!isLast && (
                    <div className="hidden lg:flex absolute -right-3.5 top-[28%] z-20 w-7 h-7 rounded-full bg-[#FFFFFF] border border-[#FFEDD5] text-[#EA580C] items-center justify-center shadow-md pointer-events-none group-hover:scale-110 transition-transform">
                      <ChevronRight size={14} strokeWidth={2.5} />
                    </div>
                  )}

                  {/* Flowchart Connector Arrow for Mobile (Between stacked cards) */}
                  {!isLast && (
                    <div className="flex lg:hidden justify-center my-2 text-[#EA580C]">
                      <div className="w-6 h-6 rounded-full bg-[#FFFFFF] border border-[#FFEDD5] flex items-center justify-center">
                        <ChevronRight size={12} className="rotate-90" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>


        </div>
      </section>

      {/* 4. Interactive Showcase: Trainer Benefits & Responsibilities */}
      <section className="py-20 sm:py-24 bg-[#F8FAFC] border-t border-[#E2E8F0]" id="benefits">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header & Two Buttons */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-[#EA580C] uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-[#FFF7ED] border border-[#FFEDD5] inline-block mb-3">
              Professional Value &amp; Standards
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111827] tracking-tight mb-4">
              Trainer Benefits &amp; Responsibilities
            </h2>
            <p className="text-base sm:text-lg text-[#64748B] leading-relaxed mb-8">
              Explore the career-accelerating advantages of coaching on Gymora and the core standards expected of certified fitness mentors.
            </p>

            {/* The Two Switch Buttons */}
            <div className="inline-flex p-1.5 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] gap-2 shadow-xl">
              <button
                type="button"
                onClick={() => setActiveTrainerTab('benefits')}
                className={`px-6 sm:px-8 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                  activeTrainerTab === 'benefits'
                    ? 'bg-[#C2410C] text-white shadow-lg shadow-orange-500/15'
                    : 'text-[#64748B] hover:text-[#C2410C] hover:bg-[#FFFFFF]'
                }`}
              >
                <Award size={18} />
                <span>Trainer Benefits</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTrainerTab('responsibilities')}
                className={`px-6 sm:px-8 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                  activeTrainerTab === 'responsibilities'
                    ? 'bg-[#C2410C] text-white shadow-lg shadow-orange-500/15'
                    : 'text-[#64748B] hover:text-[#C2410C] hover:bg-[#FFFFFF]'
                }`}
              >
                <ShieldCheck size={18} />
                <span>Trainer Responsibilities</span>
              </button>
            </div>
          </div>

          {/* TAB 1: TRAINER BENEFITS (Video on Right, Content on Left) */}
          {activeTrainerTab === 'benefits' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center animate-fadeIn">
              {/* Left Side: Benefits Content */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <span className="text-xs font-bold text-[#EA580C] uppercase tracking-wider block mb-1">
                    Smart Coaching Tools
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
                    Client Profiles, Meal Plans &amp; Daily Coaching
                  </h3>
                  <p className="text-sm text-[#64748B] mt-2 leading-relaxed">
                    Directly manage individual member profiles, configure custom nutrition and breakfast meal plans, and deliver real-time coaching from your trainer app.
                  </p>
                </div>

                {/* 4 Crisp Benefit Points Matching Video */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#FFEDD5] transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center mb-2.5">
                      <Users size={18} />
                    </div>
                    <h4 className="font-bold text-[#111827] text-sm mb-1">Client Profile Management</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Review client fitness levels, baseline biometric records, and specific health targets on one unified digital screen.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#FFEDD5] transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center mb-2.5">
                      <Activity size={18} />
                    </div>
                    <h4 className="font-bold text-[#111827] text-sm mb-1">Custom Nutrition &amp; Meal Plans</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Build personalized breakfast, lunch, and daily macronutrient targets tailored to support each member's goals.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#FFEDD5] transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center mb-2.5">
                      <Dumbbell size={18} />
                    </div>
                    <h4 className="font-bold text-[#111827] text-sm mb-1">Workout &amp; Routine Prescriptions</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Prescribe structured exercise splits, rep targets, and rest intervals directly to member smartphones in real time.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#FFEDD5] transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center mb-2.5">
                      <TrendingUp size={18} />
                    </div>
                    <h4 className="font-bold text-[#111827] text-sm mb-1">Real-Time Progress &amp; Check-Ins</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Monitor client meal logging and habit adherence, enter coaching notes, and celebrate weekly transformation gains.
                    </p>
                  </div>
                </div>


              </div>

              {/* Right Side: Benefits Image */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-3xl overflow-hidden border border-[#E2E8F0] shadow-2xl shadow-black bg-[#FFFFFF] group">
                  <img
                    src="/trainer-benefit.jpg"
                    alt="Trainer Benefits & Client Coaching"
                    className="w-full h-[360px] sm:h-[460px] object-cover object-center block group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TRAINER RESPONSIBILITIES (Video on Right, Content on Left) */}
          {activeTrainerTab === 'responsibilities' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center animate-fadeIn">
              {/* Left Side: Responsibilities Content */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <span className="text-xs font-bold text-[#EA580C] uppercase tracking-wider block mb-1">
                    Code of Practice
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
                    Professional Standards &amp; Member Care
                  </h3>
                  <p className="text-sm text-[#64748B] mt-2 leading-relaxed">
                    Core duties expected of certified fitness mentors to ensure member safety, optimal progress, and exemplary gym culture.
                  </p>
                </div>

                {/* 4 Crisp Responsibility Points */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#FFEDD5] transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center mb-2.5">
                      <Target size={18} />
                    </div>
                    <h4 className="font-bold text-[#111827] text-sm mb-1">Goal Setting &amp; Milestones</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Conduct initial physical evaluations and establish realistic, measurable short and long-term milestones.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#FFEDD5] transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center mb-2.5">
                      <Dumbbell size={18} />
                    </div>
                    <h4 className="font-bold text-[#111827] text-sm mb-1">Appropriate Workout Guidance</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Design progressive resistance routines, functional circuits, and safe exercise adaptations.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#FFEDD5] transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center mb-2.5">
                      <BookOpen size={18} />
                    </div>
                    <h4 className="font-bold text-[#111827] text-sm mb-1">Technique &amp; Injury Prevention</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Teach biomechanically correct form, pacing, breathing, and proper equipment setup at all times.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#FFEDD5] transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center mb-2.5">
                      <ShieldCheck size={18} />
                    </div>
                    <h4 className="font-bold text-[#111827] text-sm mb-1">Professional Conduct</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Maintain strict punctuality, respectful member communication, and full compliance with gym codes.
                    </p>
                  </div>
                </div>


              </div>

              {/* Right Side: Responsibilities Image */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-3xl overflow-hidden border border-[#E2E8F0] shadow-2xl shadow-black bg-[#FFFFFF] group">
                  <img
                    src="/trainer-responsibility.jpg"
                    alt="Trainer Responsibilities & Proper Exercise Guidance"
                    className="w-full h-[360px] sm:h-[460px] object-cover object-center block group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. Frequently Asked Questions Accordion */}
      <section className="py-20 bg-[#F8FAFC] border-t border-[#E2E8F0]" id="faqs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#EA580C] uppercase tracking-wider px-3 py-1 rounded-full bg-[#FFF7ED] border border-[#FFEDD5] inline-block mb-3">
              Clear Answers
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-base text-[#64748B]">
              Everything you need to know about joining, qualifying, and growing your fitness coaching career.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-[#FFFFFF] border-[#FFEDD5] shadow-lg shadow-teal-500/5'
                      : 'bg-[#FFFFFF]/70 border-[#E2E8F0] hover:border-[#E2E8F0]/90'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base font-bold text-[#111827]">
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-[#EA580C] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 text-xs sm:text-sm text-[#111827] leading-relaxed border-t border-[#E2E8F0]/60 pt-4 animate-fadeIn">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>


        </div>
      </section>

      {/* 7. Call-to-Action Section */}
      <section className="py-20 bg-gradient-to-b from-[#FFFFFF] to-[#F8FAFC] border-t border-[#E2E8F0] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-[#FFF7ED] rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF7ED] border border-[#FFEDD5] text-[#EA580C] text-xs font-semibold mb-6">
            <Award size={14} />
            <span>Step into Professional Coaching</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111827] tracking-tight mb-6">
            Ready to Take Your Fitness Career to the Next Level?
          </h2>

          <p className="text-base sm:text-lg text-[#111827] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Showcase your expertise, discover opportunities, and take the next step in your fitness career.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/careers"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-bold text-[#FFFFFF] bg-[#C2410C] hover:bg-[#9A3412] transition-all shadow-xl shadow-teal-500/25 flex items-center justify-center gap-2 group"
            >
              <Briefcase size={18} />
              <span>Explore Opportunities</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </TrainerPageLayout>
  );
};

