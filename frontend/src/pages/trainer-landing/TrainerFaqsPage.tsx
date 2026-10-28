import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  HelpCircle,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Search,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { TrainerPageLayout } from './TrainerPageLayout';

export const TrainerFaqsPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const allFaqs = [
    {
      q: 'How can I become a trainer on this platform?',
      a: 'To register as a trainer on Gymora, click on "Join as a Trainer" to start the onboarding intake form. You will be asked to fill in your personal contact details, years of coaching experience, accredited certifications, and preferred training specializations. Your profile will then be listed for verified gym partners to review.',
      category: 'Onboarding'
    },
    {
      q: 'What qualifications are recommended for fitness trainers?',
      a: 'We strongly recommend holding valid, accredited certifications from recognized organizations such as ACE (American Council on Exercise), NASM (National Academy of Sports Medicine), ISSA, ACSM, or NSCA. For region-specific trainers, recognized national vocational diplomas (e.g. K11, REPs Level 3 or 4) and current CPR/AED life-support certification are standard recommendations.',
      category: 'Qualifications'
    },
    {
      q: 'Can I showcase my fitness specializations?',
      a: 'Yes. You can select and display specific fitness disciplines on your profile—including Hypertrophy & Bodybuilding, Powerlifting, Functional Mobility, HIIT & Cardiovascular Conditioning, Yoga, Calisthenics, and Sports Rehabilitation. This helps gym owners and members find the exact coaching profile they require.',
      category: 'Profile'
    },
    {
      q: 'How can I discover gym opportunities?',
      a: 'You can explore current openings published by partner gyms directly on the Gym Careers page (/careers). Gyms regularly post vacancies for full-time floor trainers, private personal trainers, and specialized group fitness coaches.',
      category: 'Opportunities'
    },
    {
      q: 'How does the gym approval process work?',
      a: 'When you express interest in a gym listing or receive an invitation link from a facility manager, the club administrator reviews your credentials. The gym may invite you for an interview or practical assessment. Upon their review and mutual agreement, the gym owner formally approves and links your profile to their facility.',
      category: 'Recruitment'
    },
    {
      q: 'Where can I get assistance?',
      a: 'For platform technical help, account verification queries, or profile update guidance, you can contact the Gymora trainer support team at /trainers/support or submit an inquiry through /trainers/contact. We are here to support your onboarding journey.',
      category: 'Support'
    },
    {
      q: 'Is there a fee to register as a trainer?',
      a: 'Creating your initial trainer profile and exploring gym opportunities on Gymora is free. Any commercial or compensation arrangements are established directly between you and the hiring gym facility.',
      category: 'Pricing'
    },
    {
      q: 'Can I be affiliated with more than one gym facility?',
      a: 'Depending on your employment agreement with the respective gym facilities, freelance coaches may hold affiliations with multiple independent studios if mutually agreed upon by all parties.',
      category: 'Policy'
    }
  ];

  const filteredFaqs = allFaqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <TrainerPageLayout>
      <div className="py-16 md:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/trainers"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#9AAEAE] hover:text-[#2DD4BF] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          <span>Back to Trainer Landing Page</span>
        </Link>

        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 text-[#2DD4BF] text-xs font-semibold mb-4">
            <HelpCircle size={13} />
            <span>Trainer Knowledge Base</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#F5FAFA] tracking-tight mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-base sm:text-lg text-[#9AAEAE] leading-relaxed">
            Find answers to common questions regarding trainer verification, gym opportunities, profile showcases, and platform assistance.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-10">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AAEAE]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by topic, qualification, or opportunity..."
            className="w-full bg-[#141D1E] border border-[#2A3A3A] rounded-2xl py-3.5 pl-12 pr-4 text-sm text-[#F5FAFA] placeholder-[#9AAEAE] focus:outline-none focus:border-[#2DD4BF] transition-colors"
          />
        </div>

        {/* FAQ List */}
        <div className="space-y-4 mb-16">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => {
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
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#0E1415] text-[#2DD4BF] border border-[#2A3A3A]">
                        {faq.category}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-[#F5FAFA]">
                        {faq.q}
                      </span>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`text-[#2DD4BF] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 text-xs sm:text-sm text-[#C1D0D0] leading-relaxed border-t border-[#2A3A3A]/60 pt-4 animate-fadeIn">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-[#141D1E] rounded-2xl border border-[#2A3A3A]">
              <p className="text-sm text-[#9AAEAE] mb-3">No matching questions found.</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold text-[#2DD4BF] hover:underline"
              >
                Clear Search Filter
              </button>
            </div>
          )}
        </div>

        {/* Still Have Questions Box */}
        <div className="p-8 bg-[#0E1415] border border-[#2A3A3A] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-base font-bold text-[#F5FAFA] mb-1">Still have a question?</h3>
            <p className="text-xs text-[#9AAEAE]">Our team is ready to provide personalized guidance for coaches.</p>
          </div>
          <Link
            to="/trainers/contact"
            className="px-6 py-3 bg-[#141D1E] hover:bg-[#1B2728] text-xs sm:text-sm font-bold text-[#F5FAFA] border border-[#2A3A3A] hover:border-[#2DD4BF]/40 rounded-xl flex items-center gap-2"
          >
            <MessageSquare size={16} className="text-[#2DD4BF]" />
            <span>Contact Support</span>
          </Link>
        </div>
      </div>
    </TrainerPageLayout>
  );
};

