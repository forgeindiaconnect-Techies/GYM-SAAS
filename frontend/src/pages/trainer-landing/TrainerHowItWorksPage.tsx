import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Compass,
  UserCheck,
  Building2,
  TrendingUp,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Award,
  HelpCircle
} from 'lucide-react';
import { TrainerPageLayout } from './TrainerPageLayout';

export const TrainerHowItWorksPage: React.FC = () => {
  const steps = [
    {
      step: 'Step 01',
      title: 'Create Your Profile',
      tagline: 'Showcase your experience, certifications, skills, and fitness specializations',
      icon: UserCheck,
      details: [
        'Input your biographical information, coaching philosophy, and years of experience.',
        'Upload verified industry accreditations (ACE, ISSA, NASM, ACSM, NSCA, K11).',
        'Specify your core fitness domains: Strength & Hypertrophy, Fat Loss, Calisthenics, Yoga, Mobility, or Rehab.',
        'Set your training availability (weekday/weekend slots, full-time or freelance preferences).'
      ]
    },
    {
      step: 'Step 02',
      title: 'Explore Opportunities',
      tagline: 'Discover gym opportunities that match your expertise and preferred location',
      icon: Compass,
      details: [
        'Browse open trainer requirements listed by registered Gymora partner clubs.',
        'Filter gym listings by city, facility amenities, training focus, and compensation model.',
        'Review club culture, equipment availability, member demographics, and floor expectations.',
        'Save matching listings or submit direct interest to club hiring managers.'
      ]
    },
    {
      step: 'Step 03',
      title: 'Connect with Gyms',
      tagline: 'Learn about the recruitment and approval process',
      icon: Building2,
      details: [
        'Gym owners review your verified profile, client track record, and certificates.',
        'Attend facility interviews, practical coaching evaluations, or orientation sessions.',
        'Receive formal onboarding approval from the club administration.',
        'Your profile gets linked to the gym facility on the Gymora platform for member discovery.'
      ]
    },
    {
      step: 'Step 04',
      title: 'Grow Your Career',
      tagline: 'Develop your professional experience and help customers achieve their fitness goals',
      icon: TrendingUp,
      details: [
        'Receive assigned members and build customized workout routines suited to their physical levels.',
        'Monitor customer consistency, workout completion, and progress milestones.',
        'Gain authentic customer ratings and facility endorsements to elevate your rank.',
        'Unlock higher coaching tiers, expand your earning potential, and lead advanced workshops.'
      ]
    }
  ];

  return (
    <TrainerPageLayout>
      <div className="py-16 md:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/trainers"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#64748B] hover:text-[#EA580C] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          <span>Back to Trainer Landing Page</span>
        </Link>

        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF7ED] border border-[#FFEDD5] text-[#EA580C] text-xs font-semibold mb-4">
            <Sparkles size={13} />
            <span>Path to Professional Placement</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111827] tracking-tight mb-4">
            How It Works for Trainers
          </h1>
          <p className="text-base sm:text-lg text-[#64748B] leading-relaxed">
            A clear, four-stage journey from building your verified professional profile to securing gym placement and coaching dedicated athletes.
          </p>
        </div>

        {/* 4 Step Process Cards */}
        <div className="space-y-8 mb-16">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-8 hover:border-[#FFEDD5] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-[#E2E8F0]/60">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C] shrink-0">
                      <Icon size={24} />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">
                        {s.step}
                      </span>
                      <h2 className="text-xl font-bold text-[#111827]">{s.title}</h2>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-[#64748B] bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#E2E8F0] self-start sm:self-auto">
                    Phase {idx + 1}
                  </span>
                </div>

                <p className="text-sm font-semibold text-[#111827] mb-4">{s.tagline}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {s.details.map((detail, dIdx) => (
                    <div key={dIdx} className="flex items-start gap-2.5 text-xs text-[#64748B] leading-relaxed">
                      <CheckCircle2 size={15} className="text-[#EA580C] shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Informational Scope Note */}
        <div className="p-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#64748B] mb-12 flex items-start gap-3">
          <ShieldCheck size={20} className="text-[#EA580C] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#111827]">Informational Notice: </span>
            This walkthrough explains the general onboarding workflow and career milestones. Facility recruitment policies, compensation terms, and evaluation criteria are determined directly between verified gym facilities and the trainer.
          </div>
        </div>

        {/* Bottom Navigation CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-8 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl">
          <div>
            <h3 className="text-base font-bold text-[#111827] mb-1">Ready to create your profile?</h3>
            <p className="text-xs text-[#64748B]">Join partner gyms and begin your verified coaching journey.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/trainers/benefits"
              className="px-5 py-2.5 bg-[#F8FAFC] hover:bg-[#FFF7ED] text-xs font-bold text-[#111827] border border-[#E2E8F0] rounded-xl"
            >
              See Benefits
            </Link>
            <Link
              to="/invite/trainer/onboarding"
              className="px-5 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-xs font-bold text-[#FFFFFF] rounded-xl shadow-md shadow-orange-500/15 flex items-center gap-1.5"
            >
              <span>Join as a Trainer</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </TrainerPageLayout>
  );
};

