import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  HeartHandshake,
  Dumbbell,
  Users,
  Target,
  Sparkles
} from 'lucide-react';
import { TrainerPageLayout } from './TrainerPageLayout';

export const TrainerGuidelinesPage: React.FC = () => {
  const guidelines = [
    {
      category: '1. Member Health, Safety & Assessment',
      icon: ShieldCheck,
      points: [
        'Always verify if a member has completed standard health intake questionnaires (e.g. PAR-Q) before beginning intense physical exercise.',
        'Never recommend physical exertion that exceeds a member’s medical clearance or demonstrated functional movement capacity.',
        'Maintain current CPR, AED, and First Aid certification to handle on-floor emergencies promptly.',
        'Inspect equipment, collars, clips, and cable attachments prior to loading working weights.'
      ]
    },
    {
      category: '2. Professional Conduct & Boundaries',
      icon: HeartHandshake,
      points: [
        'Maintain strict, respectful, and professional boundaries with all gym members, facility staff, and fellow instructors.',
        'Adhere to the gym facility dress code and ensure professional athletic attire with identification.',
        'Arrive at least 10 minutes prior to scheduled private sessions or group instruction periods.',
        'Harassment, verbal disrespect, discrimination, or inappropriate conduct will result in immediate termination of platform access.'
      ]
    },
    {
      category: '3. Scope of Practice & Nutrition Advice',
      icon: BookOpen,
      points: [
        'Provide general evidence-based nutritional principles (hydration, macronutrient balance, whole foods) only.',
        'Do not prescribe medical diets, treat clinical conditions (e.g. eating disorders, diabetes), or diagnose injuries unless licensed as a clinical dietitian or physician.',
        'Do not sell or distribute unverified supplements, banned substances, or unregulated performance-enhancing compounds.',
        'Refer members to licensed physiotherapists or medical practitioners when experiencing persistent acute pain.'
      ]
    },
    {
      category: '4. Equipment Courtesy & Gym Facility Care',
      icon: Dumbbell,
      points: [
        'Ensure all weights, dumbbells, barbells, and accessories are re-racked immediately following each set or training session.',
        'Sanitize contact surfaces and benches after client usage as per facility hygiene guidelines.',
        'Respect shared floor space and avoid monopolizing multi-purpose equipment during peak facility hours.',
        'Report broken or malfunctioning machinery immediately to club floor managers.'
      ]
    }
  ];

  return (
    <TrainerPageLayout>
      <div className="py-16 md:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/trainers"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#9AAEAE] hover:text-[#2DD4BF] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          <span>Back to Trainer Landing Page</span>
        </Link>

        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 text-[#2DD4BF] text-xs font-semibold mb-4">
            <BookOpen size={13} />
            <span>Code of Practice</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#F5FAFA] tracking-tight mb-4">
            Trainer Professional Guidelines
          </h1>
          <p className="text-base sm:text-lg text-[#9AAEAE] leading-relaxed">
            Essential ethical rules, safety mandates, and professional conduct expectations for all fitness coaches on the Gymora platform.
          </p>
        </div>

        {/* Guidelines Sections */}
        <div className="space-y-8 mb-16">
          {guidelines.map((g, i) => {
            const Icon = g.icon;
            return (
              <div key={i} className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-8">
                <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-[#2A3A3A]/60">
                  <div className="w-10 h-10 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 flex items-center justify-center text-[#2DD4BF]">
                    <Icon size={20} />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#F5FAFA]">{g.category}</h2>
                </div>

                <div className="space-y-3.5">
                  {g.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-3 text-xs sm:text-sm text-[#C1D0D0] leading-relaxed">
                      <CheckCircle2 size={16} className="text-[#2DD4BF] shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Advisory Callout */}
        <div className="p-6 bg-[#0E1415] border border-amber-500/30 rounded-2xl text-xs text-[#9AAEAE] flex items-start gap-3 mb-12">
          <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#F5FAFA]">Compliance Notice: </span>
            Adherence to these guidelines is mandatory for continued listing on the Gymora platform. Repeated or severe non-compliance reported by gym facility owners or members will trigger administrative review and potential account deactivation.
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/trainers/terms"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#2DD4BF] hover:text-[#5EEAD4]"
          >
            <span>Review Full Trainer Terms & Conditions</span>
            <ArrowLeft size={14} className="rotate-180" />
          </Link>
        </div>
      </div>
    </TrainerPageLayout>
  );
};

