import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Building2, 
  CreditCard, 
  TrendingUp, 
  Lock, 
  Users, 
  Server, 
  Activity, 
  ChevronRight,
  FileCheck2,
  CheckCircle2,
  Cpu,
  Database,
  Globe2,
  Layers,
  Sparkles,
  BarChart3,
  ShieldAlert,
  TerminalSquare
} from 'lucide-react';

const SuperAdminPortalLanding = () => {
  return (
    <div className="min-h-screen bg-[#080B0C] text-[#F5FAFA] selection:bg-[#2DD4BF] selection:text-[#06201D] font-sans">
      {/* Top Navigation */}
      <nav className="border-b border-[#2A3A3A] bg-[#0E1415]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Portal Badge */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[#2DD4BF] to-[#5EEAD4] rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Activity className="text-[#06201D]" size={22} strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-black tracking-tight text-[#F5FAFA] group-hover:text-[#2DD4BF] transition-colors">
                Gymora
              </span>
            </Link>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20">
              Super Admin Portal
            </span>
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#06201D] bg-[#2DD4BF] hover:bg-[#5EEAD4] transition-all shadow-md shadow-teal-500/20 flex items-center gap-1.5"
            >
              <ArrowLeft size={16} />
              <span>Back to Main Website</span>
            </Link>
            <Link
              to="/login?portal=super-admin"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#06201D] bg-[#2DD4BF] hover:bg-[#5EEAD4] transition-all shadow-md shadow-teal-500/20 flex items-center gap-1.5"
            >
              <Lock size={14} />
              <span>Super Admin Login</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center flex flex-col items-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#2DD4BF]/12 via-[#080B0C]/0 to-[#080B0C]/0 pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141D1E] border border-[#2A3A3A] text-xs font-medium text-[#2DD4BF] mb-6">
          <ShieldCheck size={14} />
          <span>Platform Infrastructure & Global Governance Cockpit</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6 leading-tight max-w-4xl text-[#F5FAFA]">
          Centralized Platform Control & <br className="hidden sm:block" />
          <span className="text-[#2DD4BF]">Multi-Tenant SaaS Administration</span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-[#9AAEAE] max-w-2xl mx-auto mb-10 leading-relaxed">
          The authorized administrative cockpit for managing gym ecosystems, global subscriptions, tenant security, facility verification, and platform financials across all regions.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            to="/login?portal=super-admin"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30"
          >
            <span>Super Admin Secure Login</span>
            <ChevronRight size={18} />
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30"
          >
            <ArrowLeft size={16} />
            <span>Return to Public Home</span>
          </Link>
        </div>

        {/* Live Platform Health Bar */}
        <div className="mt-14 w-full max-w-4xl bg-[#141D1E]/90 border border-[#2A3A3A] rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Activity size={18} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#9AAEAE]">Platform Uptime</div>
              <div className="text-sm font-bold text-[#F5FAFA]">99.98% Healthy</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 text-[#2DD4BF] flex items-center justify-center shrink-0">
              <Database size={18} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#9AAEAE]">Data Isolation</div>
              <div className="text-sm font-bold text-[#F5FAFA]">100% Multi-Tenant</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 text-[#2DD4BF] flex items-center justify-center shrink-0">
              <Globe2 size={18} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#9AAEAE]">Gateway Latency</div>
              <div className="text-sm font-bold text-[#F5FAFA]">14ms Global Edge</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#9AAEAE]">Security Posture</div>
              <div className="text-sm font-bold text-[#F5FAFA]">SOC2 & ISO Ready</div>
            </div>
          </div>
        </div>
      </header>

      {/* Visual Showcase Section 1: Multi-Tenant Network & Global Gym Fleet */}
      <section className="py-20 border-t border-[#2A3A3A] bg-[#0E1415]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Copy Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141D1E] border border-[#2A3A3A] text-xs font-semibold text-[#2DD4BF] mb-4">
                <Globe2 size={14} />
                <span>Global Multi-Tenant Architecture</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#F5FAFA] tracking-tight mb-4 leading-snug">
                Oversee Hundreds of Gyms With Complete Data Isolation
              </h2>
              <p className="text-[#9AAEAE] text-base leading-relaxed mb-6">
                Gymora’s enterprise partition engine guarantees that every gym franchise, branch, and owner operates inside an isolated logical workspace while allowing platform admins total aggregate oversight.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5FAFA] text-sm">Instant Gym Onboarding & Facility Verification</h4>
                    <p className="text-xs text-[#9AAEAE] mt-0.5">Review facility licenses, branch registration certificates, and equipment inspections before issuing operational access.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5FAFA] text-sm">Cross-Branch License & Quota Controls</h4>
                    <p className="text-xs text-[#9AAEAE] mt-0.5">Dynamically throttle active member seats, staff accounts, and biometric turnstiles according to the gym’s subscribed SaaS tier.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5FAFA] text-sm">Zero-Downtime Multi-Location Deployments</h4>
                    <p className="text-xs text-[#9AAEAE] mt-0.5">Deploy new features, compliance rules, and AI workout models platform-wide without disrupting daily member check-ins.</p>
                  </div>
                </div>
              </div>

              <Link
                to="/login?portal=super-admin"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2DD4BF] text-[#06201D] font-bold text-sm hover:bg-[#5EEAD4] transition-all shadow-md shadow-teal-500/20"
              >
                <span>Access Tenant Management</span>
                <ChevronRight size={16} />
              </Link>
            </div>

            {/* Visual Card Right */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden border border-[#2A3A3A] bg-[#141D1E] shadow-2xl group">
                <img 
                  src="https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=1200&q=80" 
                  alt="Multi-Location Gym Franchises" 
                  className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-700 opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080B0C] via-[#080B0C]/40 to-transparent" />
                
                {/* Floating Badges */}
                <div className="absolute top-4 left-4 bg-[#141D1E]/95 backdrop-blur-md border border-[#2A3A3A] rounded-xl px-3.5 py-2 flex items-center gap-2.5 shadow-lg">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-[#F5FAFA]">480+ Active Gym Franchises</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 bg-[#141D1E]/95 backdrop-blur-md border border-[#2A3A3A] rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#2DD4BF] flex items-center gap-1.5">
                      <Cpu size={14} /> Fleet Cluster Telemetry
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                      Zero Anomalies
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-[#2A3A3A]">
                    <div>
                      <div className="text-xs font-black text-[#F5FAFA]">1.2M+</div>
                      <div className="text-[10px] text-[#9AAEAE]">Daily Check-ins</div>
                    </div>
                    <div>
                      <div className="text-xs font-black text-[#2DD4BF]">99.99%</div>
                      <div className="text-[10px] text-[#9AAEAE]">API Success</div>
                    </div>
                    <div>
                      <div className="text-xs font-black text-[#F5FAFA]">12 Reg.</div>
                      <div className="text-[10px] text-[#9AAEAE]">Edge Clusters</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Showcase Section 2: Platform Financial Engine & Automated Billing */}
      <section className="py-20 border-t border-[#2A3A3A] bg-[#080B0C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Visual Card Left */}
            <div className="relative order-2 lg:order-1">
              <div className="relative rounded-3xl overflow-hidden border border-[#2A3A3A] bg-[#141D1E] shadow-2xl group">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80" 
                  alt="SaaS Analytics and Financial Engine" 
                  className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080B0C] via-[#080B0C]/40 to-transparent" />

                <div className="absolute top-4 left-4 bg-[#141D1E]/95 backdrop-blur-md border border-[#2A3A3A] rounded-xl px-3.5 py-2 flex items-center gap-2 shadow-lg">
                  <BarChart3 size={15} className="text-[#2DD4BF]" />
                  <span className="text-xs font-bold text-[#F5FAFA]">Platform GMV: ₹3.42 Cr / Mo</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 bg-[#141D1E]/95 backdrop-blur-md border border-[#2A3A3A] rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#F5FAFA]">Automated Tier Recurring Cycles</span>
                    <span className="text-xs font-bold text-[#2DD4BF]">+28.4% MRR Growth</span>
                  </div>
                  <div className="w-full bg-[#080B0C] h-2 rounded-full overflow-hidden border border-[#2A3A3A] mb-2">
                    <div className="bg-gradient-to-r from-[#2DD4BF] to-[#5EEAD4] h-full w-[88%]" />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#9AAEAE]">
                    <span>Target: ₹4.0 Cr</span>
                    <span>88% Achieved</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Copy Right */}
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141D1E] border border-[#2A3A3A] text-xs font-semibold text-[#2DD4BF] mb-4">
                <CreditCard size={14} />
                <span>Monetization & Financial Architecture</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#F5FAFA] tracking-tight mb-4 leading-snug">
                Automated Platform Tier Billing & Multi-Branch Payouts
              </h2>
              <p className="text-[#9AAEAE] text-base leading-relaxed mb-6">
                Manage global subscription plans for gym owners, configure per-branch add-on fees, automate tax invoices, and monitor merchant payout flows seamlessly.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5FAFA] text-sm">Configurable SaaS Tiers & Add-on Marketplace</h4>
                    <p className="text-xs text-[#9AAEAE] mt-0.5">Customize Basic, Pro, and Enterprise subscription tiers with custom limits for members, trainers, and AI workout tokens.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5FAFA] text-sm">Automated Recurring Razorpay/Stripe Processing</h4>
                    <p className="text-xs text-[#9AAEAE] mt-0.5">Automatic recurring debits with dunning management, intelligent payment retry sequences, and instant PDF invoice dispatch.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5FAFA] text-sm">Split Payout Settlements & Platform Commission</h4>
                    <p className="text-xs text-[#9AAEAE] mt-0.5">Automate member subscription payouts to gym owners while deducting platform commissions and gateway charges.</p>
                  </div>
                </div>
              </div>

              <Link
                to="/login?portal=super-admin"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2DD4BF] text-[#06201D] font-bold text-sm hover:bg-[#5EEAD4] transition-all shadow-md shadow-teal-500/20"
              >
                <span>View Financial Cockpit</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Showcase Section 3: Enterprise Security & Audit Log Triad */}
      <section className="py-20 border-t border-[#2A3A3A] bg-[#0E1415]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141D1E] border border-[#2A3A3A] text-xs font-semibold text-[#2DD4BF] mb-3">
              <ShieldAlert size={14} />
              <span>Zero-Trust Enterprise Compliance</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#F5FAFA] tracking-tight">
              Platform Auditing & Cryptographic Protection
            </h2>
            <p className="text-sm text-[#9AAEAE] mt-2">
              Every action taken within the platform is signed, recorded, and verified against immutable audit ledgers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gallery Card 1 */}
            <div className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/40 rounded-3xl overflow-hidden transition-all shadow-lg group">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=700&q=80" 
                  alt="Gym Facility Verification & Auditing" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141D1E] via-transparent to-transparent" />
                <div className="absolute top-3 left-3 bg-[#080B0C]/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#2A3A3A] text-[11px] font-bold text-[#2DD4BF] flex items-center gap-1.5">
                  <TerminalSquare size={13} />
                  <span>Immutable Logs</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-[#F5FAFA] mb-2">Cryptographic Audit Logs</h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed">
                  Every user permission change, gym approval, bank update, and subscription change generates a tamper-evident audit record.
                </p>
              </div>
            </div>

            {/* Gallery Card 2 */}
            <div className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/40 rounded-3xl overflow-hidden transition-all shadow-lg group">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=700&q=80" 
                  alt="Central Command Operations" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141D1E] via-transparent to-transparent" />
                <div className="absolute top-3 left-3 bg-[#080B0C]/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#2A3A3A] text-[11px] font-bold text-[#2DD4BF] flex items-center gap-1.5">
                  <Layers size={13} />
                  <span>Command Center</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-[#F5FAFA] mb-2">Centralized Incident Response</h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed">
                  Real-time webhook monitors, background job dispatch queues, and automated incident escalation for mission-critical operations.
                </p>
              </div>
            </div>

            {/* Gallery Card 3 */}
            <div className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/40 rounded-3xl overflow-hidden transition-all shadow-lg group">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=700&q=80" 
                  alt="Data Protection and Privacy" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141D1E] via-transparent to-transparent" />
                <div className="absolute top-3 left-3 bg-[#080B0C]/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#2A3A3A] text-[11px] font-bold text-[#2DD4BF] flex items-center gap-1.5">
                  <Lock size={13} />
                  <span>Tenant Isolation</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-[#F5FAFA] mb-2">Data Isolation & Sovereignty</h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed">
                  Role-based JWT claims, field-level customer data encryption, and GDPR/DPDP-compliant privacy architecture across all gyms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Management Highlights Grid */}
      <section className="py-16 border-t border-[#2A3A3A] bg-[#080B0C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F5FAFA] tracking-tight">
              Administrative Capabilities & Oversight
            </h2>
            <p className="text-sm text-[#9AAEAE] mt-2">
              Enterprise-grade tools built for total operational transparency, audit logging, and automated compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <Link 
              to="/portal/super-admin/approvals" 
              className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/60 rounded-3xl p-6 transition-all shadow-lg hover:shadow-teal-500/10 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Building2 size={24} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    12 Pending Review
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5FAFA] mb-2 group-hover:text-[#2DD4BF] transition-colors">
                  Gym Onboarding & Verification
                </h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed mb-4">
                  Review and approve new gym applications, verify facilities, equipment safety declarations, and issue operational franchise licenses.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">KYC Verification</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Equipment Audits</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Branch Approvals</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-xs font-bold text-[#2DD4BF]">
                <span>Open Approvals Desk</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 2 */}
            <Link 
              to="/portal/super-admin/subscriptions" 
              className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/60 rounded-3xl p-6 transition-all shadow-lg hover:shadow-teal-500/10 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <CreditCard size={24} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20">
                    3 SaaS Tiers Active
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5FAFA] mb-2 group-hover:text-[#2DD4BF] transition-colors">
                  Subscription & Tier Management
                </h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed mb-4">
                  Oversee platform pricing plans, manage gym owner billing cycles, process automated recurring invoices, and manage tier upgrades.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Recurring Billing</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Invoicing Engine</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Custom Pricing</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-xs font-bold text-[#2DD4BF]">
                <span>Manage Subscriptions</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 3 */}
            <Link 
              to="/portal/super-admin/analytics" 
              className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/60 rounded-3xl p-6 transition-all shadow-lg hover:shadow-teal-500/10 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <TrendingUp size={24} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    +28.4% MoM
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5FAFA] mb-2 group-hover:text-[#2DD4BF] transition-colors">
                  Global Analytics & Reporting
                </h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed mb-4">
                  Gain macro insights into tenant retention, platform gross merchandise volume (GMV), system health, and cross-gym member engagement.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">GMV Trends</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Churn Heatmaps</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Revenue Splits</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-xs font-bold text-[#2DD4BF]">
                <span>Open Analytics Cockpit</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 4 */}
            <Link 
              to="/portal/super-admin/users" 
              className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/60 rounded-3xl p-6 transition-all shadow-lg hover:shadow-teal-500/10 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Users size={24} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20">
                    4,850+ Accounts
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5FAFA] mb-2 group-hover:text-[#2DD4BF] transition-colors">
                  Multi-Role Governance
                </h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed mb-4">
                  Comprehensive directory for gym owners, managers, trainers, and customers with role auditing, state management, and suspended account controls.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Gym Owners</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Trainer Licensing</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Access Audit</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-xs font-bold text-[#2DD4BF]">
                <span>Manage User Directory</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 5 */}
            <Link 
              to="/portal/super-admin/security" 
              className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/60 rounded-3xl p-6 transition-all shadow-lg hover:shadow-teal-500/10 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Lock size={24} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    AES-256 Active
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5FAFA] mb-2 group-hover:text-[#2DD4BF] transition-colors">
                  Security & Isolation
                </h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed mb-4">
                  Strict multi-tenant database isolation, encrypted credentials, JWT claim verification, and centralized audit trails for enterprise compliance.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Database Isolation</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Audit Trails</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Zero-Trust JWT</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-xs font-bold text-[#2DD4BF]">
                <span>Configure Security</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 6 */}
            <Link 
              to="/portal/super-admin/payouts" 
              className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/60 rounded-3xl p-6 transition-all shadow-lg hover:shadow-teal-500/10 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Server size={24} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20">
                    Auto-Settlement Live
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5FAFA] mb-2 group-hover:text-[#2DD4BF] transition-colors">
                  Platform Infrastructure & Payouts
                </h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed mb-4">
                  Monitor API health, system background tasks, marketplace listings, payouts dispatch, and global notifications in real time.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Payout Dispatches</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Gateway Health</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Webhook Feeds</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-xs font-bold text-[#2DD4BF]">
                <span>Manage Payouts & System</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Security & Access Protocol */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#141D1E] to-[#0E1415] border border-[#2A3A3A] rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="w-14 h-14 bg-[#2DD4BF]/10 text-[#2DD4BF] rounded-2xl flex items-center justify-center mx-auto mb-5 border border-[#2DD4BF]/20">
            <FileCheck2 size={28} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5FAFA] mb-3">
            Authorized Personnel Access Only
          </h2>
          <p className="text-sm sm:text-base text-[#9AAEAE] max-w-xl mx-auto mb-8">
            Access to this portal requires Super Administrator privileges. All login sessions and operational actions are cryptographically signed and logged.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#9AAEAE] mb-8">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#2DD4BF]" />
              <span>Role-Based Access Verification</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#2DD4BF]" />
              <span>End-to-End Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#2DD4BF]" />
              <span>Instant Revocation</span>
            </div>
          </div>

          <Link
            to="/login?portal=super-admin"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold rounded-xl transition-all shadow-lg shadow-teal-500/20"
          >
            <Lock size={16} />
            <span>Enter Super Admin Portal</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2A3A3A] bg-[#0E1415] py-8 text-center text-xs text-[#9AAEAE]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Gymora Platform Administration. Confidential & Proprietary.</p>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-[#2DD4BF] transition-colors">Main Website</Link>
            <Link to="/portal/gym-owner" className="hover:text-[#2DD4BF] transition-colors">Gym Owner Portal</Link>
            <Link to="/portal/customer" className="hover:text-[#2DD4BF] transition-colors">Customer Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SuperAdminPortalLanding;
