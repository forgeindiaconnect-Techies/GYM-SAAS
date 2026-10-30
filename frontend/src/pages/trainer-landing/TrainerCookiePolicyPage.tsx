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
          className="inline-flex items-center gap-2 text-xs font-bold text-[#64748B] hover:text-[#EA580C] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          <span>Back to Trainer Landing Page</span>
        </Link>

        {/* Header */}
        <div className="mb-10 pb-6 border-b border-[#E2E8F0]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF7ED] border border-[#FFEDD5] text-[#EA580C] text-xs font-semibold mb-4">
            <Cookie size={13} />
            <span>Transparency & Control</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight mb-3">
            Trainer Cookie Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Last Updated: October 2026 • Details of local storage and cookies used on Gymora
          </p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-[#111827] leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-[#111827] mb-3">1. What Are Cookies?</h2>
            <p>
              Cookies and local browser storage are small text files or key-value pairs stored on your device when you browse websites. They enable the platform to remember your active session, portal choices, and keep you securely logged into your trainer dashboard.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111827] mb-3">2. Cookies and Storage Used on Gymora</h2>
            <div className="space-y-4">
              <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5">
                <div className="font-bold text-[#EA580C] mb-1">Essential Authentication Tokens (Strictly Necessary)</div>
                <p className="text-xs text-[#64748B]">
                  JSON Web Tokens (JWT) stored in secure browser storage or HTTP cookies to authenticate your identity as a certified trainer, verify session permissions, and protect administrative actions.
                </p>
              </div>

              <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5">
                <div className="font-bold text-[#EA580C] mb-1">Portal Preference Storage (Functional)</div>
                <p className="text-xs text-[#64748B]">
                  Remembers your last accessed role portal (e.g. Trainer Portal) so you are seamlessly redirected to the correct dashboard upon returning.
                </p>
              </div>

              <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5">
                <div className="font-bold text-[#EA580C] mb-1">Session Security Storage (Security)</div>
                <p className="text-xs text-[#64748B]">
                  Temporary session tokens used to prevent Cross-Site Request Forgery (CSRF) and secure workout plan updates.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111827] mb-3">3. Third-Party Analytics Cookies</h2>
            <p>
              Gymora prioritizes user privacy and does not deploy intrusive third-party advertising trackers or sell trainer behavioral profiles to advertising networks. Any performance monitoring is conducted in an anonymized aggregate format for platform stability.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111827] mb-3">4. Managing Your Preferences</h2>
            <p>
              You can modify or disable cookies through your browser settings. However, please note that disabling essential authentication tokens will prevent you from logging into your trainer dashboard or interacting with assigned members.
            </p>
          </section>

          <section className="pt-6 border-t border-[#E2E8F0]">
            <h2 className="text-lg font-bold text-[#111827] mb-2">5. Inquiries</h2>
            <p className="text-xs text-[#64748B]">
              For any questions regarding our cookie implementation, please email <a href="mailto:privacy@gymora.com" className="text-[#EA580C] hover:underline">privacy@gymora.com</a> or visit our <Link to="/trainers/contact" className="text-[#EA580C] hover:underline">contact page</Link>.
            </p>
          </section>
        </div>
      </div>
    </TrainerPageLayout>
  );
};

