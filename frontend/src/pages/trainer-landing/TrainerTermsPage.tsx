import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { TrainerPageLayout } from './TrainerPageLayout';

export const TrainerTermsPage: React.FC = () => {
  return (
    <TrainerPageLayout>
      <div className="py-16 md:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/trainers"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#64748B] hover:text-[#EA580C] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          <span>Back to Trainer Landing Page</span>
        </Link>

        {/* Header */}
        <div className="mb-10 pb-6 border-b border-[#E2E8F0]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF7ED] border border-[#FFEDD5] text-[#EA580C] text-xs font-semibold mb-4">
            <FileText size={13} />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight mb-3">
            Trainer Terms & Conditions
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Last Updated: October 2026 • Effective for all registered fitness coaches and trainers on Gymora
          </p>
        </div>

        {/* Review Notice Alert */}
        <div className="p-5 bg-[#FFFFFF] border border-amber-500/30 rounded-2xl text-xs text-[#64748B] flex items-start gap-3 mb-10">
          <AlertCircle size={18} className="text-[#B45309] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#111827]">Notice Regarding Legal Content: </span>
            This document outlines the standard operational terms governing trainer participation on the Gymora platform. Final jurisdiction-specific legal phrasing, insurance indemnification limits, and local labor classification rules are subject to review by qualified corporate counsel prior to final commercial execution.
          </div>
        </div>

        {/* Structured Terms Content */}
        <div className="space-y-10 text-xs sm:text-sm text-[#111827] leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="text-lg font-bold text-[#111827] mb-3">1. Introduction and Acceptance of Terms</h2>
            <p>
              Welcome to Gymora. By registering as a fitness trainer, creating a coach profile, or accessing our trainer-oriented services, you agree to be bound by these Trainer Terms & Conditions ("Terms"). If you do not agree with any part of these Terms, you must not register or provide services through the Gymora platform.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-lg font-bold text-[#111827] mb-3">2. Eligibility</h2>
            <p>
              To participate as a trainer on Gymora, you must be at least 18 years of age and hold verified fitness coaching qualifications or valid industry accreditations. You represent and warrant that all information, certifications, and identification submitted during registration are accurate, truthful, and currently active.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-lg font-bold text-[#111827] mb-3">3. User Account Responsibilities</h2>
            <p>
              You are responsible for maintaining the confidentiality of your login credentials (username and password). You agree to immediately notify Gymora of any unauthorized access to your account. You accept responsibility for all activities and workout recommendations submitted under your authenticated profile.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-lg font-bold text-[#111827] mb-3">4. Acceptable Use</h2>
            <p>
              You agree to use Gymora exclusively for legitimate fitness coaching, profile showcasing, and gym collaboration purposes. You must comply with all applicable local, regional, and national fitness regulations, facility house rules, and intellectual property rights.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-lg font-bold text-[#111827] mb-3">5. Trainer Professional Conduct</h2>
            <p>
              Trainers must maintain the highest standards of professional conduct, decorum, and safety. This includes punctuality for client sessions, respectful communication, adhering to facility hygiene protocols, and zero tolerance for harassment, discrimination, or abusive behavior toward members, gym staff, or fellow instructors.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-lg font-bold text-[#111827] mb-3">6. General Fitness Guidance Responsibilities</h2>
            <p>
              All exercise routines, workout splits, and lifestyle tips provided by trainers must conform to evidence-based fitness principles. Trainers expressly acknowledge that fitness guidance does not constitute medical diagnosis, physical therapy, or clinical dietetics. Trainers must advise members to consult licensed healthcare providers for pre-existing conditions or medical clearance.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-lg font-bold text-[#111827] mb-3">7. Intellectual Property</h2>
            <p>
              Gymora retains all intellectual property rights to the platform software, trademarks, graphics, and interface. You retain ownership of personal bio material and workout plans you author; however, you grant Gymora a non-exclusive license to display this content to partner gyms and platform members.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-lg font-bold text-[#111827] mb-3">8. Prohibited Activities</h2>
            <p className="mb-2">Trainers are strictly prohibited from:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#64748B]">
              <li>Submitting fraudulent, expired, or altered fitness certification documents.</li>
              <li>Distributing, promoting, or prescribing banned athletic substances, unapproved anabolic drugs, or prescription medications.</li>
              <li>Attempting to bypass platform security, scrape member data, or reverse engineer platform code.</li>
              <li>Engaging in off-platform billing fraud or unauthorized financial solicitations on gym premises.</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-lg font-bold text-[#111827] mb-3">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Gymora shall not be liable for any indirect, incidental, or consequential damages resulting from coaching sessions, facility injuries, equipment failures, or disputes between trainers and independent gym facilities. Independent gym operators and trainers maintain their own liability coverage.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-lg font-bold text-[#111827] mb-3">10. Changes to Terms</h2>
            <p>
              Gymora reserves the right to amend these Terms periodically. Registered trainers will be notified of material modifications via email or an in-platform notification. Continued use of the platform after such notice constitutes acceptance of the amended Terms.
            </p>
          </section>

          {/* Section 11 */}
          <section className="pt-6 border-t border-[#E2E8F0]">
            <h2 className="text-lg font-bold text-[#111827] mb-3">11. Contact Information</h2>
            <p className="mb-2">
              For legal inquiries, contract clarifications, or compliance notices, please contact:
            </p>
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-4 text-xs">
              <div className="text-[#111827] font-bold">Gymora Legal & Compliance Desk</div>
              <div className="text-[#64748B]">Email: legal@gymora.com</div>
              <div className="text-[#64748B]">Web: <Link to="/trainers/contact" className="text-[#EA580C] hover:underline">/trainers/contact</Link></div>
            </div>
          </section>
        </div>
      </div>
    </TrainerPageLayout>
  );
};

