import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  Briefcase,
  LogIn,
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

export const TrainerLandingPage: React.FC = () => {
  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(prev => (prev === index ? null : index));
  };

  const steps = [
    {
      step: '01',
      title: 'Create Your Profile',
      desc: 'Showcase your experience, certifications, skills, and fitness specializations.',
      details: 'Highlight verified credentials (ACE, ISSA, NASM), training methodologies, available hours, and client transformations.',
      icon: UserCheck
    },
    {
      step: '02',
      title: 'Explore Opportunities',
      desc: 'Discover gym opportunities that match your expertise and preferred location.',
      details: 'Browse gym partners seeking full-time staff, part-time personal trainers, strength coaches, and group class instructors.',
      icon: Compass
    },
    {
      step: '03',
      title: 'Connect with Gyms',
      desc: 'Learn about the recruitment and approval process.',
      details: 'Submit inquiries directly to verified gym managers, arrange facility interviews, and receive formal placement approvals.',
      icon: Building2
    },
    {
      step: '04',
      title: 'Grow Your Career',
      desc: 'Develop your professional experience and help customers achieve their fitness goals.',
      details: 'Build your client roster, log training milestones, expand your reputation, and maximize your personal coaching revenue.',
      icon: TrendingUp
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-[#2DD4BF]/10 rounded-full blur-[130px] -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 text-[#2DD4BF] text-xs font-semibold mb-6 shadow-sm">
                <Sparkles size={14} />
                <span>Dedicated Fitness Trainer Portal</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#F5FAFA] leading-[1.15] mb-6">
                Build Your Fitness Career <br className="hidden sm:block" />
                <span className="text-[#2DD4BF]">with the Right Gym</span>
              </h1>

              <p className="text-base sm:text-lg text-[#C1D0D0] max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed font-normal">
                Showcase your fitness expertise, connect with gym opportunities, guide customers towards their fitness goals, and grow your career as a professional fitness trainer.
              </p>

              {/* 3 Call-To-Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-10">
                <Link
                  to="/careers"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold text-[#06201D] bg-[#2DD4BF] hover:bg-[#5EEAD4] transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 group"
                >
                  <Briefcase size={16} />
                  <span>Explore Opportunities</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/invite/trainer/onboarding"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold text-[#06201D] bg-[#2DD4BF] hover:bg-[#5EEAD4] transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
                >
                  <UserCheck size={16} className="text-[#06201D]" />
                  <span>Join as a Trainer</span>
                </Link>

                <Link
                  to="/login?portal=trainer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold text-[#06201D] bg-[#2DD4BF] hover:bg-[#5EEAD4] transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
                >
                  <LogIn size={16} />
                  <span>Trainer Login</span>
                </Link>
              </div>

              {/* Highlights row */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#2A3A3A]/70 max-w-lg mx-auto lg:mx-0">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#F5FAFA]">100%</div>
                  <div className="text-[11px] text-[#9AAEAE] mt-0.5 font-medium">Verified Facilities</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#2DD4BF]">Flexible</div>
                  <div className="text-[11px] text-[#9AAEAE] mt-0.5 font-medium">Full & Part-Time</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#F5FAFA]">Direct</div>
                  <div className="text-[11px] text-[#9AAEAE] mt-0.5 font-medium">Gym Management</div>
                </div>
              </div>
            </div>

            {/* Right Video Container: Trainer Video */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-[#2A3A3A] shadow-2xl shadow-black bg-[#141D1E] group">
                <video
                  src="/videos/trainer.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  className="w-full h-[380px] sm:h-[480px] object-cover object-center block"
                />

                {/* Floating badge top */}
                <div className="absolute top-4 right-4 bg-[#0E1415]/90 border border-[#2A3A3A] backdrop-blur-md rounded-xl px-3 py-1.5 shadow-xl pointer-events-none">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#2DD4BF]">
                    <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse"></span>
                    <span>Certified Trainer Hub</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. About Us Section */}
      <section className="py-20 bg-[#0E1415] border-y border-[#2A3A3A]" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider px-3 py-1 rounded-full bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 inline-block mb-3">
              About Our Ecosystem
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F5FAFA] tracking-tight mb-4">
              Empowering Fitness Trainers
            </h2>
            <p className="text-base text-[#9AAEAE] leading-relaxed">
              We empower fitness professionals to showcase their skills, discover rewarding gym opportunities, develop their careers, and support customers in achieving their lifelong fitness goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-7 hover:border-[#2DD4BF]/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 flex items-center justify-center text-[#2DD4BF] mb-5">
                <Sparkles size={22} />
              </div>
              <h3 className="text-lg font-bold text-[#F5FAFA] mb-2.5">Showcase Your Skills</h3>
              <p className="text-xs sm:text-sm text-[#9AAEAE] leading-relaxed">
                Build a certified digital trainer identity highlighting your verified accreditations, client transformations, exercise philosophies, and specific specializations.
              </p>
            </div>

            <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-7 hover:border-[#2DD4BF]/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 flex items-center justify-center text-[#2DD4BF] mb-5">
                <Building2 size={22} />
              </div>
              <h3 className="text-lg font-bold text-[#F5FAFA] mb-2.5">Discover Gym Opportunities</h3>
              <p className="text-xs sm:text-sm text-[#9AAEAE] leading-relaxed">
                Connect with verified local and regional fitness centers seeking dedicated professionals for personalized training, group classes, and strength coaching.
              </p>
            </div>

            <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-7 hover:border-[#2DD4BF]/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 flex items-center justify-center text-[#2DD4BF] mb-5">
                <HeartHandshake size={22} />
              </div>
              <h3 className="text-lg font-bold text-[#F5FAFA] mb-2.5">Support Customer Goals</h3>
              <p className="text-xs sm:text-sm text-[#9AAEAE] leading-relaxed">
                Empower athletes and gym members through customized workout plans, posture audits, nutritional coaching, and motivational guidance that drives real results.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/trainers/about"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#2DD4BF] hover:text-[#5EEAD4] transition-colors"
            >
              <span>Learn more about our mission & values</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section className="py-20 bg-[#080B0C]" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider px-3 py-1 rounded-full bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 inline-block mb-3">
              Simple 4-Step Pathway
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F5FAFA] tracking-tight mb-4">
              How It Works
            </h2>
            <p className="text-base text-[#9AAEAE] leading-relaxed">
              A transparent, informational walkthrough designed to help fitness professionals establish credentials and navigate gym partnerships.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-6 relative hover:border-[#2DD4BF]/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 flex items-center justify-center text-[#2DD4BF] group-hover:scale-110 transition-transform">
                        <Icon size={22} />
                      </div>
                      <span className="text-2xl font-black text-[#2A3A3A] group-hover:text-[#2DD4BF]/40 transition-colors">
                        {item.step}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#F5FAFA] mb-2">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-[#C1D0D0] mb-3 leading-relaxed">{item.desc}</p>
                    <p className="text-xs text-[#9AAEAE] leading-relaxed border-t border-[#2A3A3A]/60 pt-3">{item.details}</p>
                  </div>

                  <div className="mt-5 pt-3 flex items-center gap-1.5 text-xs font-semibold text-[#2DD4BF]">
                    <CheckCircle2 size={13} />
                    <span>Verified Milestone</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/trainers/how-it-works"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#2DD4BF] hover:text-[#5EEAD4] transition-colors"
            >
              <span>Explore full step-by-step onboarding details</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Trainer Benefits Section */}
      <section className="py-20 bg-[#0E1415] border-t border-[#2A3A3A]" id="benefits">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider px-3 py-1 rounded-full bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 inline-block mb-3">
              Professional Value
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F5FAFA] tracking-tight mb-4">
              Trainer Benefits
            </h2>
            <p className="text-base text-[#9AAEAE] leading-relaxed">
              Designed to support your personal brand, foster direct relationships with gym operators, and elevate client satisfaction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {benefits.map((b, index) => {
              const Icon = b.icon;
              return (
                <div
                  key={index}
                  className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-7 hover:border-[#2DD4BF]/40 transition-all hover:translate-y-[-2px]"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 flex items-center justify-center text-[#2DD4BF] mb-5">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-[#F5FAFA] mb-2">{b.title}</h3>
                  <p className="text-xs sm:text-sm text-[#9AAEAE] leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/trainers/benefits"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#2DD4BF] hover:text-[#5EEAD4] transition-colors"
            >
              <span>View in-depth breakdown of trainer perks</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Trainer Responsibilities Section */}
      <section className="py-20 bg-[#080B0C] border-t border-[#2A3A3A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider px-3 py-1 rounded-full bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 inline-block mb-3">
              Core Code of Practice
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F5FAFA] tracking-tight mb-4">
              Trainer Responsibilities
            </h2>
            <p className="text-base text-[#9AAEAE] leading-relaxed">
              Professional standards expected of fitness mentors to ensure member safety, optimal progress, and exemplary gym culture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {responsibilities.map((r, i) => {
              const Icon = r.icon;
              return (
                <div
                  key={i}
                  className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-6 hover:border-[#2DD4BF]/40 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 flex items-center justify-center text-[#2DD4BF] mb-4">
                      <Icon size={18} />
                    </div>
                    <h3 className="text-base font-bold text-[#F5FAFA] mb-2">{r.title}</h3>
                    <p className="text-xs text-[#9AAEAE] leading-relaxed">{r.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#2A3A3A]/60 flex items-center gap-1.5 text-[11px] text-[#2DD4BF] font-semibold">
                    <CheckCircle2 size={13} />
                    <span>Professional Standard</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/trainers/guidelines"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#2DD4BF] hover:text-[#5EEAD4] transition-colors"
            >
              <span>Read the comprehensive Trainer Guidelines</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Frequently Asked Questions Accordion */}
      <section className="py-20 bg-[#0E1415] border-t border-[#2A3A3A]" id="faqs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider px-3 py-1 rounded-full bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 inline-block mb-3">
              Clear Answers
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F5FAFA] tracking-tight mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-base text-[#9AAEAE]">
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
                      ? 'bg-[#141D1E] border-[#2DD4BF]/50 shadow-lg shadow-teal-500/5'
                      : 'bg-[#141D1E]/70 border-[#2A3A3A] hover:border-[#2A3A3A]/90'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base font-bold text-[#F5FAFA]">
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-[#2DD4BF] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 text-xs sm:text-sm text-[#C1D0D0] leading-relaxed border-t border-[#2A3A3A]/60 pt-4 animate-fadeIn">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/trainers/faqs"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#2DD4BF] hover:text-[#5EEAD4] transition-colors"
            >
              <span>View full searchable FAQ library</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Call-to-Action Section */}
      <section className="py-20 bg-gradient-to-b from-[#080B0C] to-[#0E1415] border-t border-[#2A3A3A] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-[#2DD4BF]/15 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 text-[#2DD4BF] text-xs font-semibold mb-6">
            <Award size={14} />
            <span>Step into Professional Coaching</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#F5FAFA] tracking-tight mb-6">
            Ready to Take Your Fitness Career to the Next Level?
          </h2>

          <p className="text-base sm:text-lg text-[#C1D0D0] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Showcase your expertise, discover opportunities, and take the next step in your fitness career.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/invite/trainer/onboarding"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-bold text-[#06201D] bg-[#2DD4BF] hover:bg-[#5EEAD4] transition-all shadow-xl shadow-teal-500/25 flex items-center justify-center gap-2 group"
            >
              <UserCheck size={18} />
              <span>Join as a Trainer</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </TrainerPageLayout>
  );
};

