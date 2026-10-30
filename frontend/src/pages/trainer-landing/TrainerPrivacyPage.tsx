import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Lock,
  ShieldCheck,
  Eye,
  Database,
  Sparkles
} from 'lucide-react';
import { TrainerPageLayout } from './TrainerPageLayout';

export const TrainerPrivacyPage: React.FC = () => {
  return (
    <TrainerPageLayout>
      <div className="py-16 md:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/trainers"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#57534E] hover:text-[#B76E79] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          <span>Back to Trainer Landing Page</span>
        </Link>

        {/* Header */}
        <div className="mb-10 pb-6 border-b border-[#E7DADD]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B76E79]/10 border border-[#B76E79]/30 text-[#B76E79] text-xs font-semibold mb-4">
            <Lock size={13} />
            <span>Privacy Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#292524] tracking-tight mb-3">
            Trainer Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#57534E]">
            Last Updated: October 2026 • Dedicated privacy transparency for fitness trainers on Gymora
          </p>
        </div>

        {/* 11 Policy Sections */}
        <div className="space-y-10 text-xs sm:text-sm text-[#292524] leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="text-lg font-bold text-[#292524] mb-3">1. Introduction</h2>
            <p>
              Gymora ("we", "our", or "us") respects the privacy of fitness professionals registering on our platform. This Trainer Privacy Policy explains how we collect, process, and safeguard your personal details, credentials, and coaching records when you access our trainer portal and services.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-lg font-bold text-[#292524] mb-3">2. Information We Collect</h2>
            <p className="mb-2">We collect only information necessary to create and manage your verified trainer account:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#57534E]">
              <li><strong className="text-[#292524]">Account Credentials:</strong> Full name, email address, password hash, and contact phone number.</li>
              <li><strong className="text-[#292524]">Professional Profile:</strong> Biographical summary, training philosophy, specializations, hourly rates, and profile photograph.</li>
              <li><strong className="text-[#292524]">Certifications & Proof of Qualification:</strong> Uploaded copies of certification certificates (ACE, ISSA, NASM, CPR/AED) and issuance dates.</li>
              <li><strong className="text-[#292524]">Coaching Activity:</strong> Session logs, member workout assignments, and client review ratings.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-lg font-bold text-[#292524] mb-3">3. How Information Is Used</h2>
            <p className="mb-2">We process your data for legitimate service delivery purposes, including:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#57534E]">
              <li>Verifying your identity and fitness certifications for gym approval.</li>
              <li>Displaying your professional coaching profile to partner gym facilities and prospective clients.</li>
              <li>Facilitating workout plan creation and member progress monitoring.</li>
              <li>Transmitting transactional notifications regarding gym interview invitations and session updates.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-lg font-bold text-[#292524] mb-3">4. Information Sharing</h2>
            <p>
              We do not sell your personal data to third parties. We share your profile data only with verified partner gym administrators who review your hiring credentials, and with platform members seeking personal training instruction from your verified profile.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-lg font-bold text-[#292524] mb-3">5. Data Storage and Security</h2>
            <p>
              Your data is stored in secured database environments utilizing industry-standard transport layer encryption (TLS/HTTPS) and cryptographic password hashing (bcrypt). Administrative access to trainer database records is restricted through role-based access controls.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-lg font-bold text-[#292524] mb-3">6. Data Retention</h2>
            <p>
              We retain trainer profile records as long as your account remains active. If you choose to deactivate your trainer account, we retain records only as needed to comply with audit trails, financial settlement verification, or legal obligations.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-lg font-bold text-[#292524] mb-3">7. User Privacy Rights</h2>
            <p>
              Depending on applicable privacy legislation, you have the right to access your stored personal information, request corrections to inaccurate credentials, export your profile data, or request the deletion of your trainer account. Requests can be submitted directly through our support desk.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-lg font-bold text-[#292524] mb-3">8. Cookies and Similar Technologies</h2>
            <p>
              We utilize essential authentication tokens and browser storage cookies strictly to maintain your active login session and remember your portal preferences. We do not use intrusive third-party cross-site behavioral tracking cookies.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-lg font-bold text-[#292524] mb-3">9. Third-Party Services</h2>
            <p>
              Our infrastructure may utilize reputable third-party cloud hosting and payment gateway partners (such as Razorpay or Stripe for payment processing where configured). These third parties process data solely under contractual confidentiality and data protection obligations.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-lg font-bold text-[#292524] mb-3">10. Policy Updates</h2>
            <p>
              We may update this Privacy Policy to reflect platform improvements or statutory changes. Any material updates will be announced through your trainer dashboard or via email notice prior to the effective date.
            </p>
          </section>

          {/* Section 11 */}
          <section className="pt-6 border-t border-[#E7DADD]">
            <h2 className="text-lg font-bold text-[#292524] mb-3">11. Contact Information</h2>
            <p className="mb-2">
              For any privacy concerns, data subject access requests, or information queries, contact our Data Protection Officer at:
            </p>
            <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-xl p-4 text-xs">
              <div className="text-[#292524] font-bold">Gymora Privacy & Data Governance Desk</div>
              <div className="text-[#57534E]">Email: privacy@gymora.com</div>
              <div className="text-[#57534E]">Online: <Link to="/trainers/contact" className="text-[#B76E79] hover:underline">/trainers/contact</Link></div>
            </div>
          </section>
        </div>
      </div>
    </TrainerPageLayout>
  );
};

