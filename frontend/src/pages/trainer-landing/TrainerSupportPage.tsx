import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  HelpCircle,
  Mail,
  FileText,
  ShieldCheck,
  ArrowRight,
  MessageSquare,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { TrainerPageLayout } from './TrainerPageLayout';

export const TrainerSupportPage: React.FC = () => {
  const supportCategories = [
    {
      title: 'Profile & Credential Verification',
      desc: 'Assistance with uploading fitness certifications (ACE, ISSA, NASM), degrees, and getting your coach verification badge approved.',
      action: 'Submit Credentials',
      link: '/trainers/contact'
    },
    {
      title: 'Gym Linking & Facility Inquiries',
      desc: 'Guidance on connecting your profile to partner gym facilities, reviewing interview invites, and resolving facility linkage status.',
      action: 'View How It Works',
      link: '/trainers/how-it-works'
    },
    {
      title: 'Account & Security Assistance',
      desc: 'Help with logging into your trainer portal, resetting forgotten passwords, and updating personal contact details.',
      action: 'Go to Login',
      link: '/login?portal=trainer'
    },
    {
      title: 'Platform Navigation & FAQs',
      desc: 'Browse our complete catalog of answers covering coach responsibilities, schedule coordination, and directory listings.',
      action: 'Explore FAQs',
      link: '/trainers/faqs'
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
            <HelpCircle size={13} />
            <span>Dedicated Assistance Desk</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111827] tracking-tight mb-4">
            Trainer Help & Support
          </h1>
          <p className="text-base sm:text-lg text-[#64748B] leading-relaxed">
            We are dedicated to providing clear, responsive support for personal trainers, fitness mentors, and group instructors using the Gymora ecosystem.
          </p>
        </div>

        {/* Support Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {supportCategories.map((cat, i) => (
            <div
              key={i}
              className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-7 hover:border-[#FFEDD5] transition-colors flex flex-col justify-between"
            >
              <div>
                <h2 className="text-lg font-bold text-[#111827] mb-2.5">{cat.title}</h2>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mb-6">{cat.desc}</p>
              </div>

              <Link
                to={cat.link}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#EA580C] hover:text-[#9A3412] transition-colors pt-4 border-t border-[#E2E8F0]/60"
              >
                <span>{cat.action}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>

        {/* Direct Contact Banner */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-2">
              <Clock size={14} />
              <span>Average Response: Under 24 Business Hours</span>
            </div>
            <h3 className="text-xl font-bold text-[#111827] mb-1">Need direct assistance from an agent?</h3>
            <p className="text-xs text-[#64748B]">Email us directly at trainers@gymora.com or send a web message.</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/trainers/contact"
              className="px-6 py-3 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-orange-500/15"
            >
              Send Support Message
            </Link>
          </div>
        </div>
      </div>
    </TrainerPageLayout>
  );
};

