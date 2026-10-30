import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, ArrowLeft, Shield, Eye, Lock, Database, Bell, UserCheck, Heart, FileCheck, CheckCircle2 } from 'lucide-react';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const roleParam = searchParams.get('role');
  const storedPortal = typeof window !== 'undefined' ? sessionStorage.getItem('last_portal') : null;

  const referrer = typeof document !== 'undefined' ? document.referrer : '';
  const fromTrainerRegister = referrer.includes('/register/trainer') || referrer.includes('/register/trainers');
  const fromTrainerCareers = referrer.includes('/careers') || referrer.includes('/trainers/careers');

  const returnPath: string =
    (location.state as any)?.from ??
    (fromTrainerRegister
      ? '/register/trainer'
      : fromTrainerCareers
      ? '/careers'
      : storedPortal === 'customer' || (typeof document !== 'undefined' && document.referrer.includes('/portal/customer'))
      ? '/portal/customer'
      : '/');

  const returnLabel: string =
    (location.state as any)?.fromLabel ??
    (fromTrainerRegister
      ? 'Back to Registration'
      : fromTrainerCareers
      ? 'Back to Careers'
      : returnPath.includes('/portal/customer')
      ? 'Back to Customer'
      : 'Back to Home');

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
    } else if (fromTrainerRegister) {
      navigate('/register/trainer');
    } else {
      navigate(returnPath);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3E8E8] text-[#292524] selection:bg-[#B76E79] selection:text-[#292524]">
      {/* Nav */}
      <nav className="border-b border-[#E7DADD] bg-[#F3E8E8]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#B76E79] to-[#9F5965] rounded-xl flex items-center justify-center shadow-lg shadow-[#B76E79]/20 group-hover:scale-105 transition-transform">
              <Activity className="text-[#FFFFFF]" size={22} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-black tracking-tight text-[#292524]">Gymora</span>
            <span className="ml-2 text-xs font-semibold bg-[#B76E79]/10 text-[#B76E79] border border-[#B76E79]/30 px-2.5 py-0.5 rounded-full hidden sm:inline-flex">
              {isSuperAdmin ? 'Super Admin Portal' : 'Customer Fitness Portal'}
            </span>
          </Link>
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#B76E79] hover:bg-[#9F5965] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-[#B76E79]/20 cursor-pointer"
          >
            <ArrowLeft size={16} /> <span>{returnLabel}</span>
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="border-b border-[#E7DADD] bg-[#FFFFFF] py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#B76E79]/10 border border-[#B76E79]/30 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-[#B76E79]" />
            </div>
            <span className="text-[#B76E79] text-xs sm:text-sm font-bold uppercase tracking-wider">
              {isSuperAdmin ? 'Confidential — Restricted Access' : 'Customer Data Protection & Privacy Rights'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 text-[#292524]">
            {isSuperAdmin ? 'Super Admin Privacy Policy' : 'Customer Privacy Policy'}
          </h1>
          <p className="text-[#57534E] text-base sm:text-lg">
            {isSuperAdmin
              ? 'Super Admin Portal — Gymora Platform Administration'
              : 'How Gymora protects your personal fitness records, biometric data, gym attendance, and payment security.'}
          </p>
          <p className="text-[#57534E] text-xs sm:text-sm mt-3">
            Last updated: October 2026 &nbsp;·&nbsp; Applies to: {isSuperAdmin ? 'Authorized Super Administrators only' : 'All Registered Gymora Members & Portal Visitors'}
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {isSuperAdmin ? (
          /* Super Admin Policy View */
          <div className="space-y-12 text-[#57534E] leading-relaxed">
            <section>
              <p className="text-base">
                This Privacy Policy governs the collection, use, storage, and protection of data processed through the
                <span className="text-[#292524] font-semibold"> Gymora Super Admin Portal</span>. This portal is exclusively
                accessible to authorized Gymora Super Administrators.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold text-[#292524] mb-4">1. Data Accessed by Super Administrators</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>All registered gym owner accounts, business details, and billing status.</li>
                <li>System audit logs, login histories, and platform analytics.</li>
              </ul>
            </section>
          </div>
        ) : (
          /* Customer / Member Policy View */
          <div className="space-y-12 text-[#57534E] leading-relaxed">
            {/* Intro */}
            <section className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E7DADD]">
              <p className="text-base text-[#CBD5E1] leading-relaxed">
                At <span className="text-[#B76E79] font-bold">Gymora</span>, we believe your personal health and fitness journey belongs to you. This Customer Privacy Policy explains what personal information we collect when you use the Gymora Customer Portal, how we use it to deliver personalized workouts and seamless gym access, and how we safeguard your sensitive health data.
              </p>
            </section>

            {/* 1. Information We Collect */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#B76E79]/10 flex items-center justify-center text-[#B76E79]">
                  <Database size={18} />
                </div>
                <h2 className="text-2xl font-bold text-[#292524]">1. Information We Collect from Customers</h2>
              </div>
              <p className="mb-4">To deliver an intelligent, seamless fitness experience, we collect only necessary data including:</p>
              <div className="space-y-3 pl-2">
                <div className="p-4 rounded-xl bg-[#F3E8E8] border border-[#E7DADD]">
                  <h3 className="font-bold text-[#292524] text-sm mb-1 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#B76E79]" />
                    Profile &amp; Account Identity
                  </h3>
                  <p className="text-xs text-[#57534E]">Your name, contact email, phone number, hashed password, and profile avatar.</p>
                </div>

                <div className="p-4 rounded-xl bg-[#F3E8E8] border border-[#E7DADD]">
                  <h3 className="font-bold text-[#292524] text-sm mb-1 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#B76E79]" />
                    Biometrics &amp; Health Metrics
                  </h3>
                  <p className="text-xs text-[#57534E]">Age, height, body weight, BMI estimations, target body fat percentages, and body circumference records (chest, waist, arms).</p>
                </div>

                <div className="p-4 rounded-xl bg-[#F3E8E8] border border-[#E7DADD]">
                  <h3 className="font-bold text-[#292524] text-sm mb-1 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#B76E79]" />
                    Workouts, Nutrition &amp; Activity Logs
                  </h3>
                  <p className="text-xs text-[#57534E]">Assigned workout plans, completed sets, reps and lifted weight volumes, rest timer intervals, and meal breakdown logs.</p>
                </div>

                <div className="p-4 rounded-xl bg-[#F3E8E8] border border-[#E7DADD]">
                  <h3 className="font-bold text-[#292524] text-sm mb-1 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#B76E79]" />
                    Gym Check-ins &amp; Attendance Records
                  </h3>
                  <p className="text-xs text-[#57534E]">Digital QR code check-in timestamps, attendance streaks, and visited partner gym branches.</p>
                </div>

                <div className="p-4 rounded-xl bg-[#F3E8E8] border border-[#E7DADD]">
                  <h3 className="font-bold text-[#292524] text-sm mb-1 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#B76E79]" />
                    Payment &amp; Billing History
                  </h3>
                  <p className="text-xs text-[#57534E]">Itemized receipts, invoice references, and encrypted transaction IDs. We never store raw debit/credit card numbers or CVVs.</p>
                </div>
              </div>
            </section>

            {/* 2. How We Use Data */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#B76E79]/10 flex items-center justify-center text-[#B76E79]">
                  <UserCheck size={18} />
                </div>
                <h2 className="text-2xl font-bold text-[#292524]">2. How We Use Customer Information</h2>
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
            <section className="p-6 rounded-2xl bg-[#F3E8E8] border border-[#B76E79]/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#B76E79]/20 flex items-center justify-center text-[#B76E79]">
                  <Heart size={18} />
                </div>
                <h2 className="text-xl font-bold text-[#292524]">3. Strict No-Sale &amp; Health Privacy Pledge</h2>
              </div>
              <p className="text-sm text-[#CBD5E1] leading-relaxed mb-3">
                Gymora will <span className="text-[#B76E79] font-bold">never sell, rent, or trade</span> your personal workout records, body measurements, or dietary logs to third-party data brokers, marketing agencies, or health insurance companies.
              </p>
              <p className="text-xs text-[#57534E]">
                Your health data is used solely to empower your training consistency and gym membership experience.
              </p>
            </section>

            {/* 4. Data Security */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#B76E79]/10 flex items-center justify-center text-[#B76E79]">
                  <Lock size={18} />
                </div>
                <h2 className="text-2xl font-bold text-[#292524]">4. Data Security &amp; Storage Architecture</h2>
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
                <div className="w-8 h-8 rounded-lg bg-[#B76E79]/10 flex items-center justify-center text-[#B76E79]">
                  <FileCheck size={18} />
                </div>
                <h2 className="text-2xl font-bold text-[#292524]">5. Your Privacy Rights &amp; Data Control</h2>
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
                <div className="w-8 h-8 rounded-lg bg-[#B76E79]/10 flex items-center justify-center text-[#B76E79]">
                  <Bell size={18} />
                </div>
                <h2 className="text-2xl font-bold text-[#292524]">6. Questions &amp; Data Protection Inquiries</h2>
              </div>
              <p className="text-sm">
                If you have questions regarding this Customer Privacy Policy, or wish to exercise your data rights, contact us at{' '}
                <a href="mailto:privacy@gymora.com" className="text-[#B76E79] font-semibold hover:underline">privacy@gymora.com</a>{' '}
                or submit a ticket via our Help &amp; Support desk in the Customer Portal.
              </p>
            </section>
          </div>
        )}

        {/* Footer Back */}
        <div className="mt-16 pt-8 border-t border-[#E7DADD] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#57534E] text-xs sm:text-sm text-center sm:text-left">
            © 2026 Gymora. Dedicated to member privacy, fitness data security, and platform transparency.
          </p>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#B76E79] hover:bg-[#9F5965] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md"
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
