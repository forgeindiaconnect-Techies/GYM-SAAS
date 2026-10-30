import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  Briefcase,
  Sparkles,
  TrendingUp,
  HeartHandshake,
  Target,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Dumbbell,
  Users
} from 'lucide-react';
import { TrainerPageLayout } from './TrainerPageLayout';

export const TrainerBenefitsPage: React.FC = () => {
  const benefitsList = [
    {
      title: 'Professional Profile Showcase',
      icon: Award,
      desc: 'Build an authoritative, digital coaching resume that displays your verified certifications, academic degrees, specialties, and client testimonials with tamper-proof credibility.',
      highlights: [
        'Centralized credentials verification badge',
        'Custom specialization tags (e.g. Strength, Rehab, Nutrition)',
        'Public coach portfolio easily shareable with clubs'
      ]
    },
    {
      title: 'Gym Career Opportunities',
      icon: Briefcase,
      desc: 'Connect with established gym franchises and independent studios actively looking for certified personal trainers, floor instructors, and group fitness leaders.',
      highlights: [
        'Curated listing of gym hiring vacancies',
        'Direct inquiry channel to club decision makers',
        'Flexible opportunities for full-time or freelance arrangements'
      ]
    },
    {
      title: 'Fitness Expertise Recognition',
      icon: Sparkles,
      desc: 'Stand out from unregulated trainers. Your verified profile highlights your adherence to professional standards, sports science principles, and safety practices.',
      highlights: [
        'Client review and star rating verification',
        'Peer and gym facility endorsement badges',
        'Verified accreditation seals (ACE, ISSA, NASM, REPs)'
      ]
    },
    {
      title: 'Professional Career Development',
      icon: TrendingUp,
      desc: 'Advance from entry-level coaching to master trainer status. Structured progress pathways help you build seniority and demonstrate continuous improvement.',
      highlights: [
        'Clear achievement milestones based on coaching experience',
        'Continuous learning and continuing education recommendations',
        'Leadership opportunities as head trainer or gym program lead'
      ]
    },
    {
      title: 'Customer Training and Guidance',
      icon: HeartHandshake,
      desc: 'Access dedicated workflows to guide members effectively. Help clients establish realistic body transformation goals and follow safe progressive overload.',
      highlights: [
        'Custom workout routine and exercise plan prescription',
        'Technique auditing and form correction workflows',
        'General nutritional education and habit tracking'
      ]
    },
    {
      title: 'Performance and Skill Improvement',
      icon: Target,
      desc: 'Refine your personal coaching craft through structured feedback loops, member consistency data, and client milestone achievements.',
      highlights: [
        'Client workout retention and consistency metrics',
        'Actionable member feedback insights',
        'Benchmark analysis across different training modalities'
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
            <span>Why Partner with Gymora</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111827] tracking-tight mb-4">
            Trainer Benefits & Value
          </h1>
          <p className="text-base sm:text-lg text-[#64748B] leading-relaxed">
            Discover the advantages of establishing your certified trainer profile on Gymora and connecting with reputable gym operators.
          </p>
        </div>

        {/* Detailed 6 Benefit Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {benefitsList.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={i}
                className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-8 hover:border-[#FFEDD5] transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C] mb-5">
                    <Icon size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-[#111827] mb-3">{b.title}</h2>
                  <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mb-6">{b.desc}</p>
                </div>

                <div className="border-t border-[#E2E8F0]/60 pt-4 space-y-2">
                  {b.highlights.map((h, hIdx) => (
                    <div key={hIdx} className="flex items-center gap-2 text-xs text-[#111827]">
                      <CheckCircle2 size={14} className="text-[#EA580C] shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Card */}
        <div className="p-8 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-[#111827] mb-1">Ready to unlock these advantages?</h3>
            <p className="text-xs text-[#64748B]">Create your profile and start connecting with opportunities today.</p>
          </div>
          <Link
            to="/invite/trainer/onboarding"
            className="px-6 py-3 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-orange-500/15 shrink-0"
          >
            <span>Join as a Trainer</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </TrainerPageLayout>
  );
};

