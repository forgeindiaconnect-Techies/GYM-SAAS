import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Cookie,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles
} from 'lucide-react';
import { TrainerPageLayout } from './TrainerPageLayout';

export const TrainerCookiePolicyPage: React.FC = () => {
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

        {/* Header */}
        <div className="mb-10 pb-6 border-b border-[#2A3A3A]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 text-[#2DD4BF] text-xs font-semibold mb-4">
            <Cookie size={13} />
            <span>Transparency & Control</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F5FAFA] tracking-tight mb-3">
            Trainer Cookie Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#9AAEAE]">
            Last Updated: October 2026 • Details of local storage and cookies used on Gymora
          </p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-[#C1D0D0] leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-[#F5FAFA] mb-3">1. What Are Cookies?</h2>
            <p>
              Cookies and local browser storage are small text files or key-value pairs stored on your device when you browse websites. They enable the platform to remember your active session, portal choices, and keep you securely logged into your trainer dashboard.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#F5FAFA] mb-3">2. Cookies and Storage Used on Gymora</h2>
            <div className="space-y-4">
              <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-xl p-5">
                <div className="font-bold text-[#2DD4BF] mb-1">Essential Authentication Tokens (Strictly Necessary)</div>
                <p className="text-xs text-[#9AAEAE]">
                  JSON Web Tokens (JWT) stored in secure browser storage or HTTP cookies to authenticate your identity as a certified trainer, verify session permissions, and protect administrative actions.
                </p>
              </div>

              <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-xl p-5">
                <div className="font-bold text-[#2DD4BF] mb-1">Portal Preference Storage (Functional)</div>
                <p className="text-xs text-[#9AAEAE]">
                  Remembers your last accessed role portal (e.g. Trainer Portal) so you are seamlessly redirected to the correct dashboard upon returning.
                </p>
              </div>

              <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-xl p-5">
                <div className="font-bold text-[#2DD4BF] mb-1">Session Security Storage (Security)</div>
                <p className="text-xs text-[#9AAEAE]">
                  Temporary session tokens used to prevent Cross-Site Request Forgery (CSRF) and secure workout plan updates.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#F5FAFA] mb-3">3. Third-Party Analytics Cookies</h2>
            <p>
              Gymora prioritizes user privacy and does not deploy intrusive third-party advertising trackers or sell trainer behavioral profiles to advertising networks. Any performance monitoring is conducted in an anonymized aggregate format for platform stability.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#F5FAFA] mb-3">4. Managing Your Preferences</h2>
            <p>
              You can modify or disable cookies through your browser settings. However, please note that disabling essential authentication tokens will prevent you from logging into your trainer dashboard or interacting with assigned members.
            </p>
          </section>

          <section className="pt-6 border-t border-[#2A3A3A]">
            <h2 className="text-lg font-bold text-[#F5FAFA] mb-2">5. Inquiries</h2>
            <p className="text-xs text-[#9AAEAE]">
              For any questions regarding our cookie implementation, please email <a href="mailto:privacy@gymora.com" className="text-[#2DD4BF] hover:underline">privacy@gymora.com</a> or visit our <Link to="/trainers/contact" className="text-[#2DD4BF] hover:underline">contact page</Link>.
            </p>
          </section>
        </div>
      </div>
    </TrainerPageLayout>
  );
};

