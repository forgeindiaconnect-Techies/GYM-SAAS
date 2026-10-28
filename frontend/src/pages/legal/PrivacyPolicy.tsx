import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, ArrowLeft, Shield, Eye, Lock, Database, Bell, UserCheck, Heart, FileCheck, CheckCircle2 } from 'lucide-react';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const roleParam = searchParams.get('role');
  const storedPortal = typeof window !== 'undefined' ? sessionStorage.getItem('last_portal') : null;

  const returnPath: string =
    (location.state as any)?.from ??
    (storedPortal === 'customer' || (typeof document !== 'undefined' && document.referrer.includes('/portal/customer'))
      ? '/portal/customer'
      : '/');
  const returnLabel: string =
    (location.state as any)?.fromLabel ??
    (returnPath.includes('/portal/customer') ? 'Back to Customer' : 'Back to Home');

  const isSuperAdmin = roleParam === 'super-admin' || (location.state as any)?.from?.includes('/portal/super-admin');

  const handleBack = () => {
    if ((location.state as any)?.from) {
      const [path, hash] = returnPath.split('#');
      navigate(path, { replace: false });
      if (hash) {
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(returnPath);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1415] text-[#F5FAFA] selection:bg-[#2DD4BF] selection:text-[#F5FAFA]">
      {/* Nav */}
      <nav className="border-b border-[#2A3A3A] bg-[#0E1415]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#2DD4BF] to-[#5EEAD4] rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Activity className="text-[#06201D]" size={22} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-black tracking-tight text-[#F5FAFA]">Gymora</span>
            <span className="ml-2 text-xs font-semibold bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/30 px-2.5 py-0.5 rounded-full hidden sm:inline-flex">
              {isSuperAdmin ? 'Super Admin Portal' : 'Customer Fitness Portal'}
            </span>
          </Link>
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-teal-500/20 cursor-pointer"
          >
            <ArrowLeft size={16} /> <span>{returnLabel}</span>
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="border-b border-[#2A3A3A] bg-[#080B0C] py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-[#2DD4BF]" />
            </div>
            <span className="text-[#2DD4BF] text-xs sm:text-sm font-bold uppercase tracking-wider">
              {isSuperAdmin ? 'Confidential — Restricted Access' : 'Customer Data Protection & Privacy Rights'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 text-white">
            {isSuperAdmin ? 'Super Admin Privacy Policy' : 'Customer Privacy Policy'}
          </h1>
          <p className="text-[#9AAEAE] text-base sm:text-lg">
            {isSuperAdmin
              ? 'Super Admin Portal — Gymora Platform Administration'
              : 'How Gymora protects your personal fitness records, biometric data, gym attendance, and payment security.'}
          </p>
          <p className="text-[#6A7F7F] text-xs sm:text-sm mt-3">
            Last updated: October 2026 &nbsp;·&nbsp; Applies to: {isSuperAdmin ? 'Authorized Super Administrators only' : 'All Registered Gymora Members & Portal Visitors'}
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {isSuperAdmin ? (
          /* Super Admin Policy View */
          <div className="space-y-12 text-[#9AAEAE] leading-relaxed">
            <section>
              <p className="text-base">
                This Privacy Policy governs the collection, use, storage, and protection of data processed through the
                <span className="text-[#F5FAFA] font-semibold"> Gymora Super Admin Portal</span>. This portal is exclusively
                accessible to authorized Gymora Super Administrators.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold text-[#F5FAFA] mb-4">1. Data Accessed by Super Administrators</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>All registered gym owner accounts, business details, and billing status.</li>
                <li>System audit logs, login histories, and platform analytics.</li>
              </ul>
            </section>
          </div>
        ) : (
          /* Customer / Member Policy View */
          <div className="space-y-12 text-[#9AAEAE] leading-relaxed">
            {/* Intro */}
            <section className="p-6 rounded-2xl bg-[#141D1E] border border-[#2A3A3A]">
              <p className="text-base text-[#CBD5E1] leading-relaxed">
                At <span className="text-[#2DD4BF] font-bold">Gymora</span>, we believe your personal health and fitness journey belongs to you. This Customer Privacy Policy explains what personal information we collect when you use the Gymora Customer Portal, how we use it to deliver personalized workouts and seamless gym access, and how we safeguard your sensitive health data.
              </p>
            </section>

            {/* 1. Information We Collect */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#2DD4BF]/10 flex items-center justify-center text-[#2DD4BF]">
                  <Database size={18} />
                </div>
                <h2 className="text-2xl font-bold text-[#F5FAFA]">1. Information We Collect from Customers</h2>
              </div>
              <p className="mb-4">To deliver an intelligent, seamless fitness experience, we collect only necessary data including:</p>
              <div className="space-y-3 pl-2">
                <div className="p-4 rounded-xl bg-[#0E1415] border border-[#2A3A3A]">
                  <h3 className="font-bold text-[#F5FAFA] text-sm mb-1 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#2DD4BF]" />
                    Profile &amp; Account Identity
                  </h3>
                  <p className="text-xs text-[#9AAEAE]">Your name, contact email, phone number, hashed password, and profile avatar.</p>
                </div>

                <div className="p-4 rounded-xl bg-[#0E1415] border border-[#2A3A3A]">
                  <h3 className="font-bold text-[#F5FAFA] text-sm mb-1 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#2DD4BF]" />
                    Biometrics &amp; Health Metrics
                  </h3>
                  <p className="text-xs text-[#9AAEAE]">Age, height, body weight, BMI estimations, target body fat percentages, and body circumference records (chest, waist, arms).</p>
                </div>

                <div className="p-4 rounded-xl bg-[#0E1415] border border-[#2A3A3A]">
                  <h3 className="font-bold text-[#F5FAFA] text-sm mb-1 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#2DD4BF]" />
                    Workouts, Nutrition &amp; Activity Logs
                  </h3>
                  <p className="text-xs text-[#9AAEAE]">Assigned workout plans, completed sets, reps and lifted weight volumes, rest timer intervals, and meal breakdown logs.</p>
                </div>

                <div className="p-4 rounded-xl bg-[#0E1415] border border-[#2A3A3A]">
                  <h3 className="font-bold text-[#F5FAFA] text-sm mb-1 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#2DD4BF]" />
                    Gym Check-ins &amp; Attendance Records
                  </h3>
                  <p className="text-xs text-[#9AAEAE]">Digital QR code check-in timestamps, attendance streaks, and visited partner gym branches.</p>
                </div>

                <div className="p-4 rounded-xl bg-[#0E1415] border border-[#2A3A3A]">
                  <h3 className="font-bold text-[#F5FAFA] text-sm mb-1 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#2DD4BF]" />
                    Payment &amp; Billing History
                  </h3>
                  <p className="text-xs text-[#9AAEAE]">Itemized receipts, invoice references, and encrypted transaction IDs. We never store raw debit/credit card numbers or CVVs.</p>
                </div>
              </div>
            </section>

            {/* 2. How We Use Data */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#2DD4BF]/10 flex items-center justify-center text-[#2DD4BF]">
                  <UserCheck size={18} />
                </div>
                <h2 className="text-2xl font-bold text-[#F5FAFA]">2. How We Use Customer Information</h2>
              </div>
              <ul className="list-disc pl-6 space-y-2.5">
                <li><strong className="text-white">Personalized Workouts &amp; Meal Plans:</strong> Calculating maintenance calories, configuring progressive overload sets, and breaking plateaus.</li>
                <li><strong className="text-white">Seamless Turnstile Access:</strong> Authenticating your digital QR entry pass when arriving at partner gym locations.</li>
                <li><strong className="text-white">Trainer 1-on-1 Coaching:</strong> Allowing your hired trainer to review workout completions, form feedback, and session reservations.</li>
                <li><strong className="text-white">Support &amp; Inquiries:</strong> Resolving support tickets, technical reports, and billing clarifications submitted through Help &amp; Support.</li>
                <li><strong className="text-white">Rewards &amp; Gamification:</strong> Allocating loyalty points for workout milestones and crediting legitimate referral perks.</li>
              </ul>
            </section>

            {/* 3. Strict No-Sale Pledge */}
            <section className="p-6 rounded-2xl bg-[#0E1415] border border-[#2DD4BF]/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#2DD4BF]/20 flex items-center justify-center text-[#2DD4BF]">
                  <Heart size={18} />
                </div>
                <h2 className="text-xl font-bold text-[#F5FAFA]">3. Strict No-Sale &amp; Health Privacy Pledge</h2>
              </div>
              <p className="text-sm text-[#CBD5E1] leading-relaxed mb-3">
                Gymora will <span className="text-[#2DD4BF] font-bold">never sell, rent, or trade</span> your personal workout records, body measurements, or dietary logs to third-party data brokers, marketing agencies, or health insurance companies.
              </p>
              <p className="text-xs text-[#9AAEAE]">
                Your health data is used solely to empower your training consistency and gym membership experience.
              </p>
            </section>

            {/* 4. Data Security */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#2DD4BF]/10 flex items-center justify-center text-[#2DD4BF]">
                  <Lock size={18} />
                </div>
                <h2 className="text-2xl font-bold text-[#F5FAFA]">4. Data Security &amp; Storage Architecture</h2>
              </div>
              <p className="mb-4">We maintain strict technical and operational safeguards:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">TLS 1.3 / SSL Encryption:</strong> All communications between your device and our servers are encrypted in transit.</li>
                <li><strong className="text-white">Tenant Data Isolation:</strong> Member records are logically separated in the database; gym staff can only view attendees registered with their facility.</li>
                <li><strong className="text-white">PCI-DSS Payment Processing:</strong> Payments are processed through certified banking gateways with zero local storage of sensitive payment credentials.</li>
                <li><strong className="text-white">Session Security:</strong> Authenticated sessions use JSON Web Tokens (JWT) with automated expiry to protect against unauthorized account takeover.</li>
              </ul>
            </section>

            {/* 5. Customer Privacy Rights */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#2DD4BF]/10 flex items-center justify-center text-[#2DD4BF]">
                  <FileCheck size={18} />
                </div>
                <h2 className="text-2xl font-bold text-[#F5FAFA]">5. Your Privacy Rights &amp; Data Control</h2>
              </div>
              <p className="mb-4">As a Gymora customer, you retain full sovereignty over your personal records:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Right to Inspect:</strong> View your full historical workouts, weigh-ins, attendance logs, and invoices in your dashboard at any time.</li>
                <li><strong className="text-white">Right to Correct:</strong> Update contact info, phone numbers, or target fitness preferences directly in Member Settings.</li>
                <li><strong className="text-white">Right to Data Portability:</strong> Request an export of your fitness progression history by contacting our support team.</li>
                <li><strong className="text-white">Right to Account Deletion:</strong> Request complete account erasure and biometric purging upon conclusion of your gym membership.</li>
              </ul>
            </section>

            {/* 6. Contact */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#2DD4BF]/10 flex items-center justify-center text-[#2DD4BF]">
                  <Bell size={18} />
                </div>
                <h2 className="text-2xl font-bold text-[#F5FAFA]">6. Questions &amp; Data Protection Inquiries</h2>
              </div>
              <p className="text-sm">
                If you have questions regarding this Customer Privacy Policy, or wish to exercise your data rights, contact us at{' '}
                <a href="mailto:privacy@gymora.com" className="text-[#2DD4BF] font-semibold hover:underline">privacy@gymora.com</a>{' '}
                or submit a ticket via our Help &amp; Support desk in the Customer Portal.
              </p>
            </section>
          </div>
        )}

        {/* Footer Back */}
        <div className="mt-16 pt-8 border-t border-[#2A3A3A] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#6A7F7F] text-xs sm:text-sm text-center sm:text-left">
            © 2026 Gymora. Dedicated to member privacy, fitness data security, and platform transparency.
          </p>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md"
          >
            <ArrowLeft size={16} />
            <span>{returnLabel}</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
