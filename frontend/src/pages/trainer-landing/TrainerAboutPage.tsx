import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Award,
  Building2,
  Users,
  Target,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { TrainerPageLayout } from './TrainerPageLayout';

export const TrainerAboutPage: React.FC = () => {
  return (
    <TrainerPageLayout>
      <div className="py-16 md:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          to="/trainers"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#57534E] hover:text-[#B76E79] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          <span>Back to Trainer Landing Page</span>
        </Link>

        {/* Page Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B76E79]/10 border border-[#B76E79]/30 text-[#B76E79] text-xs font-semibold mb-4">
            <Sparkles size={13} />
            <span>Empowering Fitness Professionals</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#292524] tracking-tight mb-4">
            About Gymora Trainer Network
          </h1>
          <p className="text-base sm:text-lg text-[#57534E] leading-relaxed">
            Connecting certified trainers with reputable fitness centers to build sustainable coaching careers and guide members toward lasting health transformations.
          </p>
        </div>

        {/* Mission & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl p-8">
            <div className="w-12 h-12 rounded-xl bg-[#B76E79]/10 border border-[#B76E79]/20 flex items-center justify-center text-[#B76E79] mb-5">
              <Target size={24} />
            </div>
            <h2 className="text-xl font-bold text-[#292524] mb-3">Our Core Mission</h2>
            <p className="text-sm text-[#57534E] leading-relaxed">
              To eliminate friction in fitness hiring and career progression. We provide certified trainers with a standardized, verified platform to showcase their qualifications, find verified gym facilities, and build thriving, long-term coaching relationships.
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl p-8">
            <div className="w-12 h-12 rounded-xl bg-[#B76E79]/10 border border-[#B76E79]/20 flex items-center justify-center text-[#B76E79] mb-5">
              <Award size={24} />
            </div>
            <h2 className="text-xl font-bold text-[#292524] mb-3">Our Industry Vision</h2>
            <p className="text-sm text-[#57534E] leading-relaxed">
              We envision an interconnected fitness ecosystem where gym owners effortlessly locate vetted coaches, athletes receive trustworthy and safe guidance, and trainers gain fair compensation and career recognition.
            </p>
          </div>
        </div>

        {/* What We Provide Trainers */}
        <div className="bg-[#F3E8E8] border border-[#E7DADD] rounded-2xl p-8 sm:p-10 mb-16">
          <h2 className="text-2xl font-bold text-[#292524] mb-6">What We Stand For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-[#B76E79] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-[#292524] mb-1">Standardized Credentials</h3>
                <p className="text-xs text-[#57534E]">Transparent display of verifiable certifications, CPR/AED licenses, and accredited diplomas.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-[#B76E79] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-[#292524] mb-1">Direct Facility Placement</h3>
                <p className="text-xs text-[#57534E]">Direct communication channels with active gym owners, bypassing intermediaries.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-[#B76E79] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-[#292524] mb-1">Empowered Guidance</h3>
                <p className="text-xs text-[#57534E]">Equipping trainers with structured tools to prescribe workouts and monitor member progress.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-[#B76E79] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-[#292524] mb-1">Ethics & Safety</h3>
                <p className="text-xs text-[#57534E]">Prioritizing member well-being through evidence-backed guidance and professional standards.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA banner */}
        <div className="text-center p-8 bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h3 className="text-lg font-bold text-[#292524] mb-1">Want to join our certified trainer community?</h3>
            <p className="text-xs text-[#57534E]">Get started in minutes with our guided onboarding.</p>
          </div>
          <Link
            to="/invite/trainer/onboarding"
            className="px-6 py-3 bg-[#B76E79] hover:bg-[#9F5965] text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-[#B76E79]/20 shrink-0"
          >
            <span>Join as a Trainer</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </TrainerPageLayout>
  );
};

