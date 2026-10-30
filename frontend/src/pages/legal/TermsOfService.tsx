import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, ArrowLeft, FileText, ShieldCheck, CreditCard, AlertTriangle, Scale, CheckCircle2, Dumbbell, Award, HelpCircle } from 'lucide-react';

const TermsOfService = () => {
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
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] selection:bg-[#C2410C] selection:text-[#111827]">
      {/* Nav */}
      <nav className="border-b border-[#E2E8F0] bg-[#FFFFFF]/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#EA580C] to-[#C2410C] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/15 group-hover:scale-105 transition-transform">
              <Activity className="text-[#FFFFFF]" size={22} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-black tracking-tight text-[#111827]">Gymora</span>
            <span className="ml-2 text-xs font-semibold bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5] px-2.5 py-0.5 rounded-full hidden sm:inline-flex">
              {isSuperAdmin ? 'Super Admin Portal' : 'Customer Fitness Portal'}
            </span>
          </Link>
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-orange-500/15 cursor-pointer"
          >
            <ArrowLeft size={16} /> <span>{returnLabel}</span>
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="border-b border-[#E2E8F0] bg-[#FFFFFF] py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#FFF7ED] border border-[#FFEDD5] rounded-xl flex items-center justify-center">
              <FileText size={20} className="text-[#EA580C]" />
            </div>
            <span className="text-[#EA580C] text-xs sm:text-sm font-bold uppercase tracking-wider">
              {isSuperAdmin ? 'Confidential — Restricted Access' : 'Member Service Agreement & Guidelines'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 text-[#111827]">
            {isSuperAdmin ? 'Super Admin Terms & Conditions' : 'Customer Terms & Conditions'}
          </h1>
          <p className="text-[#64748B] text-base sm:text-lg">
            {isSuperAdmin
              ? 'Super Admin Portal — Gymora Platform Administration'
              : 'Platform usage rules, account responsibilities, gym check-in conditions, and trainer session policies.'}
          </p>
          <p className="text-[#64748B] text-xs sm:text-sm mt-3">
            Last updated: October 2026 &nbsp;·&nbsp; Applies to: {isSuperAdmin ? 'Authorized Super Administrators only' : 'All Registered Gymora Members & Portal Visitors'}
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {isSuperAdmin ? (
          /* Super Admin View */
          <div className="space-y-12 text-[#64748B] leading-relaxed">
            <section>
              <p className="text-base">
                These Terms &amp; Conditions govern the access and use of the
                <span className="text-[#111827] font-semibold"> Gymora Super Admin Portal</span> by authorized platform administrators.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold text-[#111827] mb-4">1. Authorized Access Only</h2>
              <p>Access is restricted strictly to accounts with the SUPER_ADMIN role.</p>
            </section>
          </div>
        ) : (
          /* Customer / Member Terms View */
          <div className="space-y-12 text-[#334155] leading-relaxed">
            {/* Intro Banner */}
            <section className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0]">
              <p className="text-base text-[#1E293B] font-medium leading-relaxed">
                Welcome to <span className="text-[#EA580C] font-bold">Gymora</span>! These Terms &amp; Conditions govern your registration, fitness dashboard access, digital gym check-in privileges, personal training bookings, and store purchases made through our customer portal and partner fitness facilities.
              </p>
            </section>

            {/* 1. Eligibility & Accounts */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] flex items-center justify-center text-[#EA580C]">
                  <ShieldCheck size={18} />
                </div>
                <h2 className="text-2xl font-bold text-[#111827]">1. Eligibility &amp; Account Responsibilities</h2>
              </div>
              <ul className="list-disc pl-6 space-y-2.5">
                <li><strong className="text-[#111827]">Minimum Age:</strong> You must be at least 16 years of age (or have explicit parental/guardian consent) to register for an account and access partner gym facilities.</li>
                <li><strong className="text-[#111827]">Credential Confidentiality:</strong> You are solely responsible for maintaining the confidentiality of your login credentials. Do not share your password with others.</li>
                <li><strong className="text-[#111827]">Non-Transferable Access:</strong> Your membership pass and turnstile QR code are strictly personal to you. You may not loan, screenshot, or transfer your QR code to another individual to gain unauthorized gym entry.</li>
                <li><strong className="text-[#111827]">Accurate Profile Data:</strong> You agree to provide true, accurate, and current contact details to ensure emergency notices and receipts reach you promptly.</li>
              </ul>
            </section>

            {/* 2. Partner Gym Etiquette & Rules */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] flex items-center justify-center text-[#EA580C]">
                  <Dumbbell size={18} />
                </div>
                <h2 className="text-2xl font-bold text-[#111827]">2. Gym Facility Etiquette &amp; Safety Regulations</h2>
              </div>
              <p className="mb-4">When training at any Gymora partner facility, you agree to adhere to the standard code of conduct:</p>
              <div className="space-y-3 pl-2">
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <h3 className="font-bold text-[#111827] text-sm mb-1 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#EA580C]" />
                    Equipment Etiquette
                  </h3>
                  <p className="text-xs text-[#64748B]">Always re-rack dumbbells and weight plates after use, wipe down benches and cardio equipment with provided sanitizers, and avoid dropping weights unnecessarily.</p>
                </div>

                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <h3 className="font-bold text-[#111827] text-sm mb-1 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#EA580C]" />
                    Respectful Community Environment
                  </h3>
                  <p className="text-xs text-[#64748B]">Zero tolerance for harassment, aggressive behavior, unconsented filming of other gym members, or discriminatory conduct. Gym management reserves the right to immediately remove any individual violating safety standards.</p>
                </div>

                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <h3 className="font-bold text-[#111827] text-sm mb-1 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#EA580C]" />
                    Appropriate Gym Attire
                  </h3>
                  <p className="text-xs text-[#64748B]">Proper athletic footwear (running shoes, lifting shoes) and workout clothing are mandatory at all times on the training floor. Training barefoot or in open-toed footwear is prohibited for safety reasons.</p>
                </div>
              </div>
            </section>

            {/* 3. Trainer Sessions & Booking Policies */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] flex items-center justify-center text-[#EA580C]">
                  <Award size={18} />
                </div>
                <h2 className="text-2xl font-bold text-[#111827]">3. Trainer Bookings &amp; Session Cancellation Policy</h2>
              </div>
              <ul className="list-disc pl-6 space-y-2.5">
                <li><strong className="text-[#111827]">Authorized Scheduling:</strong> All 1-on-1 personal coaching sessions must be booked through the Gymora portal to guarantee facility insurance coverage.</li>
                <li><strong className="text-[#111827]">24-Hour Notice for Full Credit:</strong> If you cancel a session more than 24 hours prior to the scheduled time, you receive 100% session fee credit or free rescheduling.</li>
                <li><strong className="text-[#111827]">Late Cancellations (6-24 Hours):</strong> Cancellations made between 6 and 24 hours before the appointment are subject to a 50% cancellation fee to compensate the reserved trainer.</li>
                <li><strong className="text-[#111827]">No-Shows (&lt; 6 Hours):</strong> Failure to attend or cancellations with under 6 hours notice forfeit the session fee entirely.</li>
                <li><strong className="text-[#111827]">Trainer-Initiated Rescheduling:</strong> If your trainer must reschedule due to emergency, you are entitled to full rescheduling or a complete refund without penalty.</li>
              </ul>
            </section>

            {/* 4. Subscriptions & Payments */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] flex items-center justify-center text-[#EA580C]">
                  <CreditCard size={18} />
                </div>
                <h2 className="text-2xl font-bold text-[#111827]">4. Membership Subscriptions, Fees &amp; Renewals</h2>
              </div>
              <ul className="list-disc pl-6 space-y-2.5">
                <li><strong className="text-[#111827]">Advance Payments:</strong> Membership packages (monthly, quarterly, annual) must be paid in advance via our secure payment gateway (UPI, Credit/Debit cards, Net Banking).</li>
                <li><strong className="text-[#111827]">Validity Duration:</strong> Your active membership status and turnstile access remain active strictly for the paid subscription window.</li>
                <li><strong className="text-[#111827]">Expiration &amp; Grace Period:</strong> Upon reaching plan expiry, turnstile check-in access pauses automatically until a renewal plan is confirmed. Your historical workouts and progress metrics remain permanently accessible.</li>
                <li><strong className="text-[#111827]">Price Adjustments:</strong> Any price updates announced by partner gyms apply solely to future renewal periods, never retroactively to active plans.</li>
              </ul>
            </section>

            {/* 5. Health & Physical Activity Disclaimer */}
            <section className="p-6 rounded-2xl bg-[#F8FAFC] border border-amber-500/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-[#B45309]">
                  <AlertTriangle size={18} />
                </div>
                <h2 className="text-xl font-bold text-[#111827]">5. Health &amp; Physical Activity Disclaimer</h2>
              </div>
              <p className="text-sm text-[#374151] leading-relaxed mb-3">
                Physical exercise, weight lifting, cardiovascular conditioning, and nutritional modifications involve inherent risks of physical strain or injury.
              </p>
              <ul className="text-xs text-[#64748B] space-y-2 pl-4 list-disc">
                <li>You affirm that you are in adequate physical health to participate in strenuous exercise routines.</li>
                <li>AI recommendations and workout split templates are informational guidelines and do not replace personalized medical advice from a physician.</li>
                <li>You voluntarily assume all risks typically associated with physical exercise at partner gym premises.</li>
              </ul>
            </section>

            {/* 6. Gym Store & Merchandise Orders */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] flex items-center justify-center text-[#EA580C]">
                  <Scale size={18} />
                </div>
                <h2 className="text-2xl font-bold text-[#111827]">6. Gym Store Orders &amp; Product Returns</h2>
              </div>
              <ul className="list-disc pl-6 space-y-2.5">
                <li><strong className="text-[#111827]">Fulfillment &amp; Counter Pickup:</strong> Supplements and merchandise ordered through the portal are fulfilled on-site at your gym's official inventory desk using your digital pickup PIN.</li>
                <li><strong className="text-[#111827]">Seal Integrity:</strong> Inspect tubs and packaging at pickup. Supplements with broken safety seals or opened containers cannot be returned due to hygiene and food safety regulations.</li>
                <li><strong className="text-[#111827]">Unopened Product Returns:</strong> Defective apparel or factory-sealed supplements can be returned within 48 hours of pickup with the digital invoice.</li>
              </ul>
            </section>

            {/* 7. Suspension & Termination */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] flex items-center justify-center text-[#EA580C]">
                  <HelpCircle size={18} />
                </div>
                <h2 className="text-2xl font-bold text-[#111827]">7. Account Suspension &amp; Support Inquiries</h2>
              </div>
              <p className="mb-4">
                Gymora reserves the right to temporarily suspend or terminate accounts that engage in fraudulent payment activities, share turnstile QR credentials with non-members, or repeatedly violate gym safety policies.
              </p>
              <p className="text-sm">
                If you have questions about these customer terms or need assistance with your membership, please visit our{' '}
                <span className="text-[#EA580C] font-semibold">Help &amp; Support</span> desk in the Customer Portal or email{' '}
                <a href="mailto:support@gymora.com" className="text-[#EA580C] font-semibold hover:underline">support@gymora.com</a>.
              </p>
            </section>
          </div>
        )}

        {/* Footer Back */}
        <div className="mt-16 pt-8 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#64748B] text-xs sm:text-sm text-center sm:text-left">
            © 2026 Gymora. Fair terms, transparent rules, and dedicated member protection.
          </p>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md"
          >
            <ArrowLeft size={16} />
            <span>{returnLabel}</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;
