import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import gymLandingImg1 from '../../assets/GYM landing page image 1.jpg';
import gymLandingImg2 from '../../assets/GYM landing page image 2.jpg';
import { TourSlide } from '../../components/Landing/TourSlide';
import { FaInstagram, FaTwitter, FaYoutube, FaFacebook } from 'react-icons/fa';
import { 
  Building2, 
  ArrowLeft, 
  ArrowRight,
  Users, 
  Dumbbell, 
  CalendarCheck, 
  ShoppingBag, 
  TrendingUp, 
  Gift, 
  FileText, 
  Activity, 
  ChevronRight, 
  ChevronLeft,
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  CheckCircle,
  XCircle,
  ScanLine, 
  QrCode, 
  DollarSign, 
  UserCheck, 
  Clock, 
  Layers, 
  MessageSquare,
  X,
  ArrowUp,
  ArrowDown,
  HelpCircle,
  Phone,
  Mail,
  RefreshCcw,
  Briefcase,
  CreditCard,
  ChevronDown,
  Check,
  MapPin,
  ExternalLink,
  GitBranch,
  PlayCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const GYM_OWNER_FEATURES = [
  {
    title: 'Member & Membership Management',
    description: 'Effortlessly register new members, track active subscriptions, and automate timely renewal alerts via WhatsApp and SMS. Gain complete visibility over member attendance history, payment statuses, and expiry schedules to keep your member retention consistently high.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'Trainer & Staff Management',
    description: 'Easily organize your coaching team, assign trainers to members, and oversee customized workout and nutrition plans. Monitor coach performance, review member satisfaction ratings, and automate monthly split commissions without the headache of manual calculations.',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'Smart Attendance & Bookings',
    description: 'Enable lightning-fast check-ins using QR codes, RFID cards, or biometric turnstiles that automatically prevent unpaid access. Members and trainers can easily book personal coaching sessions and group fitness classes with live gym floor occupancy tracking.',
    image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'POS Store & Inventory',
    description: 'Sell health supplements, beverages, workout apparel, and gym gear right from your front desk with a barcode-ready POS register. Track inventory levels automatically with low-stock warnings and generate daily sales summaries to maximize your retail profit.',
    image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'Sales & Financial Analytics',
    description: 'Gain total clarity on your gym’s financial health with real-time dashboards showing recurring revenues, active cash flow, and daily expenses. Produce professional GST-compliant invoices and download audited profit-and-loss reports at the click of a button.',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'Rewards & Referral Programs',
    description: 'Boost member loyalty and drive organic word-of-mouth signups by rewarding workout consistency and milestones with redeemable reward points. Host engaging fitness challenges, broadcast live leaderboards, and offer automated referral discounts to expand your gym community.',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop',
  },
];

const GymOwnerPortalLanding = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>('GOLD');
  const [activeFooterModal, setActiveFooterModal] = useState<string | null>(null);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [showTrainerHiringWorkflow, setShowTrainerHiringWorkflow] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(1);

  useEffect(() => {
    if (location.state && (location.state as any).openTour) {
      setIsTourOpen(true);
      setTourStep(1);
    }
  }, [location.state]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTourOpen) {
      interval = setInterval(() => {
        setTourStep(s => (s < 7 ? s + 1 : 1));
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isTourOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsTourOpen(false);
      }
    };
    if (isTourOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTourOpen]);

  useEffect(() => {
    if (window.location.hash === '#pricing') {
      const el = document.getElementById('pricing');
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  }, []);

  /* Trainer Hiring Workflow Modal */
  const TrainerHiringWorkflowModal = () => (
    <div 
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm px-2 py-6 animate-in fade-in duration-200"
      onClick={() => setShowTrainerHiringWorkflow(false)}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl shadow-2xl shadow-black/70 scrollbar-thin scrollbar-thumb-[#E2E8F0]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFF7ED] border border-[#FFEDD5] rounded-xl flex items-center justify-center text-[#EA580C]">
              <GitBranch size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#EA580C] bg-[#FFF7ED] border border-[#FFEDD5] px-2 py-0.5 rounded-full">Recruitment & Operations</span>
                <span className="text-[10px] text-[#64748B]">7-Stage Flowchart</span>
              </div>
              <h2 className="text-lg font-bold text-[#111827]">Trainer Hiring &amp; Onboarding Lifecycle</h2>
            </div>
          </div>
          <button 
            onClick={() => setShowTrainerHiringWorkflow(false)} 
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#64748B] hover:text-[#111827] transition-all"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Introduction Banner */}
        <div className="px-6 pt-5 pb-2">
          <p className="text-xs text-[#64748B] leading-relaxed">
            This flowchart illustrates the end-to-end recruitment lifecycle: from creating a vacancy and vetting fitness credentials, to practical trials, commission agreements, digital onboarding, roster assignment, and automated split payroll.
          </p>
        </div>

        {/* SVG Flowchart Container */}
        <div className="p-4 sm:p-6 overflow-x-auto flex justify-center bg-[#F8FAFC]">
          <svg 
            viewBox="0 0 760 980" 
            xmlns="http://www.w3.org/2000/svg" 
            style={{ width: '100%', maxWidth: '760px', minWidth: '640px', display: 'block' }}
          >
            <defs>
              <marker id="th-arr" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
                <polygon points="0 0, 9 3.5, 0 7" fill="#F97316" />
              </marker>
              <marker id="th-arrG" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
                <polygon points="0 0, 9 3.5, 0 7" fill="#15803D" />
              </marker>
              <marker id="th-arrR" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
                <polygon points="0 0, 9 3.5, 0 7" fill="#B91C1C" />
              </marker>
            </defs>

            {/* ── START ── */}
            <ellipse cx="380" cy="30" rx="90" ry="20" fill="#F8FAFC" stroke="#F97316" strokeWidth="2" />
            <text x="380" y="35" textAnchor="middle" fill="#F97316" fontSize="12" fontWeight="800" fontFamily="ui-sans-serif,sans-serif">START: HIRE TRAINER</text>

            {/* Arrow down to Stage 1 */}
            <line x1="380" y1="50" x2="380" y2="70" stroke="#F97316" strokeWidth="1.5" markerEnd="url(#th-arr)" />

            {/* ── Stage 1: Post Requirements ── */}
            <rect x="200" y="70" width="360" height="48" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
            <text x="380" y="89" textAnchor="middle" fill="#111827" fontSize="12" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">1. Post Vacancy &amp; Qualifications</text>
            <text x="380" y="105" textAnchor="middle" fill="#64748B" fontSize="10" fontFamily="ui-sans-serif,sans-serif">Specify role (Strength/PT/Yoga), shifts &amp; commission split</text>

            {/* Arrow down to Stage 2 */}
            <line x1="380" y1="118" x2="380" y2="138" stroke="#F97316" strokeWidth="1.5" markerEnd="url(#th-arr)" />

            {/* ── Stage 2: Sourcing & Applications ── */}
            <rect x="200" y="138" width="360" height="48" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
            <text x="380" y="157" textAnchor="middle" fill="#111827" fontSize="12" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">2. Sourcing &amp; Application Intake</text>
            <text x="380" y="173" textAnchor="middle" fill="#64748B" fontSize="10" fontFamily="ui-sans-serif,sans-serif">Gymora Trainer Directory + public job applicants</text>

            {/* Arrow down to Stage 3 */}
            <line x1="380" y1="186" x2="380" y2="206" stroke="#F97316" strokeWidth="1.5" markerEnd="url(#th-arr)" />

            {/* ── Stage 3: Credential Verification ── */}
            <rect x="200" y="206" width="360" height="48" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
            <text x="380" y="225" textAnchor="middle" fill="#111827" fontSize="12" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">3. Verify Certifications &amp; Practical Demo</text>
            <text x="380" y="241" textAnchor="middle" fill="#64748B" fontSize="10" fontFamily="ui-sans-serif,sans-serif">Validate ACE/ISSA/K11 certs, CPR, and floor trial session</text>

            {/* Arrow down to Decision */}
            <line x1="380" y1="254" x2="380" y2="274" stroke="#F97316" strokeWidth="1.5" markerEnd="url(#th-arr)" />

            {/* ── Decision Diamond: Approved? ── */}
            <polygon points="380,274 510,320 380,366 250,320" fill="#F8FAFC" stroke="#F97316" strokeWidth="2" />
            <text x="380" y="315" textAnchor="middle" fill="#F97316" fontSize="11" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">Candidate</text>
            <text x="380" y="331" textAnchor="middle" fill="#F97316" fontSize="11" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">Approved?</text>

            {/* NO — right branch */}
            <line x1="510" y1="320" x2="580" y2="320" stroke="#B91C1C" strokeWidth="1.5" markerEnd="url(#th-arrR)" />
            <text x="535" y="312" fill="#B91C1C" fontSize="10" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">NO</text>
            <rect x="580" y="300" width="140" height="42" rx="8" fill="#FDF2F2" stroke="#B91C1C" strokeWidth="1.5" />
            <text x="650" y="318" textAnchor="middle" fill="#B91C1C" fontSize="10" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">Application Archived</text>
            <text x="650" y="332" textAnchor="middle" fill="#B91C1C" fontSize="9" fontFamily="ui-sans-serif,sans-serif">Status update sent</text>

            {/* YES — down branch */}
            <line x1="380" y1="366" x2="380" y2="396" stroke="#15803D" strokeWidth="1.5" markerEnd="url(#th-arrG)" />
            <text x="390" y="385" fill="#15803D" fontSize="10" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">YES</text>

            {/* ── Milestone: Contract Issued & Signed ── */}
            <rect x="160" y="396" width="440" height="52" rx="10" fill="#F8FAFC" stroke="#F97316" strokeWidth="2.5" />
            <text x="380" y="419" textAnchor="middle" fill="#F97316" fontSize="13" fontWeight="800" fontFamily="ui-sans-serif,sans-serif">Contract Issued &amp; Terms Signed</text>
            <text x="380" y="437" textAnchor="middle" fill="#64748B" fontSize="10" fontFamily="ui-sans-serif,sans-serif">Digital SLA agreement, fixed base/split commission (e.g. 70/30)</text>

            {/* ── Branching to 3 Parallel Onboarding Tracks ── */}
            <line x1="380" y1="448" x2="380" y2="472" stroke="#F97316" strokeWidth="1.5" />
            {/* Horizontal Bus Line */}
            <line x1="130" y1="472" x2="630" y2="472" stroke="#F97316" strokeWidth="1.5" />
            {/* 3 verticals */}
            <line x1="130" y1="472" x2="130" y2="496" stroke="#F97316" strokeWidth="1.5" markerEnd="url(#th-arr)" />
            <line x1="380" y1="472" x2="380" y2="496" stroke="#F97316" strokeWidth="1.5" markerEnd="url(#th-arr)" />
            <line x1="630" y1="472" x2="630" y2="496" stroke="#F97316" strokeWidth="1.5" markerEnd="url(#th-arr)" />

            {/* ── Track 1: Track A - Portal Onboarding ── */}
            <rect x="25" y="496" width="210" height="48" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
            <text x="130" y="515" textAnchor="middle" fill="#111827" fontSize="11" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">A. Digital Portal Setup</text>
            <text x="130" y="531" textAnchor="middle" fill="#64748B" fontSize="9" fontFamily="ui-sans-serif,sans-serif">Trainer credentials &amp; mobile access</text>

            {/* Sub-step A2 */}
            <line x1="130" y1="544" x2="130" y2="564" stroke="#F97316" strokeWidth="1.5" markerEnd="url(#th-arr)" />
            <rect x="25" y="564" width="210" height="46" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
            <text x="130" y="583" textAnchor="middle" fill="#CBD5E1" fontSize="10" fontWeight="600" fontFamily="ui-sans-serif,sans-serif">Bank Details &amp; Direct Deposit</text>
            <text x="130" y="597" textAnchor="middle" fill="#64748B" fontSize="9" fontFamily="ui-sans-serif,sans-serif">Automated payout routing</text>

            {/* Sub-step A3 */}
            <line x1="130" y1="610" x2="130" y2="630" stroke="#F97316" strokeWidth="1.5" markerEnd="url(#th-arr)" />
            <rect x="25" y="630" width="210" height="46" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
            <text x="130" y="649" textAnchor="middle" fill="#CBD5E1" fontSize="10" fontWeight="600" fontFamily="ui-sans-serif,sans-serif">Biometric / RFID Registration</text>
            <text x="130" y="663" textAnchor="middle" fill="#64748B" fontSize="9" fontFamily="ui-sans-serif,sans-serif">Turnstile &amp; staff room door sync</text>

            {/* ── Track 2: Track B - Roster & Shifts ── */}
            <rect x="275" y="496" width="210" height="48" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
            <text x="380" y="515" textAnchor="middle" fill="#111827" fontSize="11" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">B. Shift &amp; Roster Allocation</text>
            <text x="380" y="531" textAnchor="middle" fill="#64748B" fontSize="9" fontFamily="ui-sans-serif,sans-serif">Floor hours, days &amp; branch</text>

            {/* Sub-step B2 */}
            <line x1="380" y1="544" x2="380" y2="564" stroke="#F97316" strokeWidth="1.5" markerEnd="url(#th-arr)" />
            <rect x="275" y="564" width="210" height="46" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
            <text x="380" y="583" textAnchor="middle" fill="#CBD5E1" fontSize="10" fontWeight="600" fontFamily="ui-sans-serif,sans-serif">Floor Duty Calendar</text>
            <text x="380" y="597" textAnchor="middle" fill="#64748B" fontSize="9" fontFamily="ui-sans-serif,sans-serif">Conflict-free schedule generation</text>

            {/* Sub-step B3 */}
            <line x1="380" y1="610" x2="380" y2="630" stroke="#F97316" strokeWidth="1.5" markerEnd="url(#th-arr)" />
            <rect x="275" y="630" width="210" height="46" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
            <text x="380" y="649" textAnchor="middle" fill="#CBD5E1" fontSize="10" fontWeight="600" fontFamily="ui-sans-serif,sans-serif">Group Class Scheduling</text>
            <text x="380" y="663" textAnchor="middle" fill="#64748B" fontSize="9" fontFamily="ui-sans-serif,sans-serif">HIIT, Yoga, CrossFit batch slots</text>

            {/* ── Track 3: Track C - Client Allocation ── */}
            <rect x="525" y="496" width="210" height="48" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
            <text x="630" y="515" textAnchor="middle" fill="#111827" fontSize="11" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">C. Client Roster &amp; PT Slots</text>
            <text x="630" y="531" textAnchor="middle" fill="#64748B" fontSize="9" fontFamily="ui-sans-serif,sans-serif">Member pairing &amp; quota limits</text>

            {/* Sub-step C2 */}
            <line x1="630" y1="544" x2="630" y2="564" stroke="#F97316" strokeWidth="1.5" markerEnd="url(#th-arr)" />
            <rect x="525" y="564" width="210" height="46" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
            <text x="630" y="583" textAnchor="middle" fill="#CBD5E1" fontSize="10" fontWeight="600" fontFamily="ui-sans-serif,sans-serif">Workout Plan Library</text>
            <text x="630" y="597" textAnchor="middle" fill="#64748B" fontSize="9" fontFamily="ui-sans-serif,sans-serif">Assign AI templates &amp; exercises</text>

            {/* Sub-step C3 */}
            <line x1="630" y1="610" x2="630" y2="630" stroke="#F97316" strokeWidth="1.5" markerEnd="url(#th-arr)" />
            <rect x="525" y="630" width="210" height="46" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
            <text x="630" y="649" textAnchor="middle" fill="#CBD5E1" fontSize="10" fontWeight="600" fontFamily="ui-sans-serif,sans-serif">Booking Calendar Open</text>
            <text x="630" y="663" textAnchor="middle" fill="#64748B" fontSize="9" fontFamily="ui-sans-serif,sans-serif">Members book 1-on-1 PT slots</text>

            {/* ── Convergence Lines from All 3 Tracks ── */}
            <line x1="130" y1="676" x2="130" y2="710" stroke="#F97316" strokeWidth="1.5" />
            <line x1="380" y1="676" x2="380" y2="710" stroke="#F97316" strokeWidth="1.5" />
            <line x1="630" y1="676" x2="630" y2="710" stroke="#F97316" strokeWidth="1.5" />
            <line x1="130" y1="710" x2="630" y2="710" stroke="#F97316" strokeWidth="1.5" />
            <line x1="380" y1="710" x2="380" y2="736" stroke="#F97316" strokeWidth="1.5" markerEnd="url(#th-arr)" />

            {/* ── Operational Execution: OTP-Verified Sessions ── */}
            <rect x="180" y="736" width="400" height="50" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
            <text x="380" y="755" textAnchor="middle" fill="#111827" fontSize="12" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">Dual-Verified Session Check-ins</text>
            <text x="380" y="771" textAnchor="middle" fill="#64748B" fontSize="10" fontFamily="ui-sans-serif,sans-serif">Session logged only after Member QR/OTP confirmation</text>

            {/* Arrow down to Payroll Settlement */}
            <line x1="380" y1="786" x2="380" y2="812" stroke="#15803D" strokeWidth="1.5" markerEnd="url(#th-arrG)" />

            {/* ── Automated Payroll & Star Rating Settlement ── */}
            <rect x="150" y="812" width="460" height="52" rx="10" fill="#F8FAFC" stroke="#15803D" strokeWidth="2" />
            <text x="380" y="834" textAnchor="middle" fill="#15803D" fontSize="12" fontWeight="800" fontFamily="ui-sans-serif,sans-serif">Automated Commission Settlement &amp; Feedback</text>
            <text x="380" y="852" textAnchor="middle" fill="#CBD5E1" fontSize="10" fontFamily="ui-sans-serif,sans-serif">Direct bank transfer + member star rating analytics</text>

            {/* Arrow down to Terminal */}
            <line x1="380" y1="864" x2="380" y2="890" stroke="#15803D" strokeWidth="1.5" markerEnd="url(#th-arrG)" />

            {/* ── TERMINAL: TRAINER ACTIVE ── */}
            <ellipse cx="380" cy="912" rx="110" ry="22" fill="#F8FAFC" stroke="#15803D" strokeWidth="2.5" />
            <text x="380" y="917" textAnchor="middle" fill="#15803D" fontSize="12" fontWeight="900" fontFamily="ui-sans-serif,sans-serif">ACTIVE ON ROSTER</text>
          </svg>
        </div>

        {/* Detailed 4-Stage Breakdown Cards */}
        <div className="p-6 border-t border-[#E2E8F0] space-y-4 bg-[#F8FAFC]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#EA580C] mb-2">Detailed Operational Stages:</h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0]">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded-md bg-[#FFF7ED] text-[#EA580C] text-xs font-bold flex items-center justify-center">1</span>
                <h4 className="font-bold text-[#111827] text-sm">Requisition &amp; Sourcing</h4>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Gym owners define role requirements, target disciplines (HIIT, Strength, Yoga, Crossfit), shift schedules, and commission rates. Open positions are published on the Gymora platform network to certified coaches.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0]">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded-md bg-[#FFF7ED] text-[#EA580C] text-xs font-bold flex items-center justify-center">2</span>
                <h4 className="font-bold text-[#111827] text-sm">Vetting &amp; Practical Trials</h4>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Applicants submit digital proof of ACE, ISSA, K11, or ACSM certifications and CPR/AED credentials. Shortlisted candidates undergo a floor trial session to assess posture correction and client coaching acumen.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0]">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded-md bg-[#FFF7ED] text-[#EA580C] text-xs font-bold flex items-center justify-center">3</span>
                <h4 className="font-bold text-[#111827] text-sm">Digital Contracting &amp; SLA</h4>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Once approved, a digital contract is issued specifying the split-commission model (e.g. 70% to trainer, 30% to gym) or flat hourly fee. Banking details and biometric gate access are enrolled seamlessly.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0]">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded-md bg-[#FFF7ED] text-[#EA580C] text-xs font-bold flex items-center justify-center">4</span>
                <h4 className="font-bold text-[#111827] text-sm">Roster, PT Sessions &amp; Payroll</h4>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                The trainer is added to the gym floor roster. Members book personal training sessions in the app. Each session is validated via OTP to guarantee zero ghost-booking fraud, and payroll statements generate automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 bg-[#FFFFFF] border-t border-[#E2E8F0]">
          <div className="text-xs text-[#64748B]">
            Ready to hire fitness staff? Connect with certified trainers on Gymora.
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              to="/trainer"
              onClick={() => setShowTrainerHiringWorkflow(false)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#EA580C] border border-[#E2E8F0] font-semibold text-xs text-center transition-all flex items-center justify-center gap-1.5"
            >
              <span>Explore Trainer</span>
              <ExternalLink size={14} />
            </Link>
            <button
              onClick={() => setShowTrainerHiringWorkflow(false)}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-xs transition-all text-center"
            >
              Close Workflow
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111827] selection:bg-[#C2410C] selection:text-[#FFFFFF] font-sans">
      {/* Top Navigation */}
      <nav className="border-b border-[#E2E8F0] bg-[#FFFFFF]/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Portal Badge */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[#EA580C] to-[#C2410C] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/15">
                <Activity className="text-[#FFFFFF]" size={22} strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-black tracking-tight text-[#111827] group-hover:text-[#EA580C] transition-colors">
                Gymora
              </span>
            </Link>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]">
              Gym Owner
            </span>
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#FFFFFF] bg-[#C2410C] hover:bg-[#9A3412] transition-all shadow-md shadow-orange-500/15 flex items-center gap-1.5"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </Link>
            <button
              type="button"
              onClick={() => { setTourStep(1); setIsTourOpen(true); }}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#FFFFFF] bg-[#C2410C] hover:bg-[#9A3412] transition-all shadow-md shadow-orange-500/15 flex items-center gap-1.5 cursor-pointer"
            >
              <PlayCircle size={14} className="text-[#FFFFFF]" />
              <span>Gym Owner Journey</span>
            </button>
            <a
              href="#pricing"
              className="hidden lg:inline-flex px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#FFFFFF] bg-[#C2410C] hover:bg-[#9A3412] transition-all shadow-md shadow-orange-500/15"
            >
              Platform Pricing
            </a>
            <Link
              to="/gym-owner-introduction"
              className="hidden md:inline-flex px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#FFFFFF] bg-[#C2410C] hover:bg-[#9A3412] transition-all shadow-md shadow-orange-500/15"
            >
              Register Gym
            </Link>
            <Link
              to="/login?portal=gym-owner"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#FFFFFF] bg-[#C2410C] hover:bg-[#9A3412] transition-all shadow-md shadow-orange-500/15 flex items-center gap-1.5"
            >
              <span>Gym Owner Login</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#EA580C]/12 via-[#FFFFFF]/0 to-[#FFFFFF]/0 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6 leading-tight text-[#111827]">
              Scale Your Gym Operations &amp; <br className="hidden sm:block" />
              <span className="text-[#EA580C]">Maximize Member Retention</span>
            </h1>

            <p className="text-base sm:text-lg text-[#64748B] max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              From multi-branch member tracking and trainer payroll to automated biometric attendance, inventory POS, and revenue analytics—manage everything seamlessly from one central hub.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to="/login?portal=gym-owner"
                className="w-full sm:w-auto px-7 py-3.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/15 hover:shadow-teal-500/30"
              >
                <span>Gym Owner Login</span>
                <ChevronRight size={18} />
              </Link>
              <Link
                to="/gym-owner-introduction"
                className="w-full sm:w-auto px-7 py-3.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/15 hover:shadow-teal-500/30"
              >
                <Sparkles size={16} className="text-[#FFFFFF]" />
                <span>Get Started &amp; Register Gym</span>
              </Link>
            </div>
          </div>

          {/* Right Video Container: Gym Owner Experience Video */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-[#E2E8F0] shadow-2xl shadow-black bg-[#FFFFFF] group">
              <video
                src="/videos/gym-owners.mp4"
                autoPlay
                loop
                muted
                playsInline
                controls
                className="w-full h-[360px] sm:h-[460px] object-cover object-center block"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Visual Showcase Section 1: Functional Bodyweight & Calisthenics Training */}
      <section className="py-20 border-t border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Copy Left */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight mb-4 leading-snug">
                Functional Bodyweight &amp; Calisthenics Training
              </h2>
              <p className="text-[#64748B] text-base leading-relaxed mb-6">
                Help members master bodyweight strength, core control, and pull-up progressions with clear, step-by-step coaching routines.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#111827] text-sm">Step-by-Step Progressions</h4>
                    <p className="text-xs text-[#64748B] mt-0.5">Clear coaching paths from beginner bar hangs to strict pull-ups.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#111827] text-sm">Shoulder &amp; Joint Health</h4>
                    <p className="text-xs text-[#64748B] mt-0.5">Simple warm-ups and mobility drills that protect joints and build lasting endurance.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#111827] text-sm">Video Form Guidance</h4>
                    <p className="text-xs text-[#64748B] mt-0.5">Quick technique guides and trainer tips so members train safely with confidence.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Card Right */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden border border-[#E2E8F0] bg-[#FFFFFF] shadow-2xl shadow-black">
                <img 
                  src={gymLandingImg1} 
                  alt="Functional Calisthenics and Pull-Up Training" 
                  loading="eager"
                  decoding="sync"
                  className="w-full h-[400px] sm:h-[460px] object-cover object-center block select-none pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Showcase Section 2: Personalized Strength & Muscle Building Workouts */}
      <section className="py-20 border-t border-[#E2E8F0] bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Copy Left */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight mb-4 leading-snug">
                Personalized Strength &amp; Muscle Building Workouts
              </h2>
              <p className="text-[#64748B] text-base leading-relaxed mb-6">
                Give your members structured workout routines and expert guidance to build muscle, gain strength, and stay consistent.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#111827] text-sm">Custom Workout Plans</h4>
                    <p className="text-xs text-[#64748B] mt-0.5">Tailored exercise routines designed for every fitness level and goal.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#111827] text-sm">1-on-1 Coach Guidance</h4>
                    <p className="text-xs text-[#64748B] mt-0.5">Trainers help members with proper lifting form, heavier weights, and daily motivation.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#111827] text-sm">Track Visible Progress</h4>
                    <p className="text-xs text-[#64748B] mt-0.5">Log daily workouts and personal records to see real transformation week after week.</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTrainerHiringWorkflow(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C2410C] text-white font-bold text-sm hover:bg-[#9A3412] transition-all shadow-md shadow-orange-500/15 cursor-pointer"
              >
                <span>View Trainer Hiring Workflow</span>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Visual Card Right */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden border border-[#E2E8F0] bg-[#FFFFFF] shadow-2xl shadow-black">
                <img 
                  src={gymLandingImg2} 
                  alt="Dumbbell Hypertrophy and Strength Coaching" 
                  loading="eager"
                  decoding="sync"
                  className="w-full h-[400px] sm:h-[460px] object-cover object-center block select-none pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Everything You Need to Run a Smarter Gym - Alternating Features Section */}
      <section className="py-24 sm:py-32 border-t border-[#E2E8F0] bg-[#FFFFFF]" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111827] tracking-tight mb-4">
              Everything You Need to Run a Smarter Gym
            </h2>
            <p className="text-base sm:text-lg text-[#64748B] leading-relaxed">
              Manage members, empower trainers, and grow your fitness business from one platform.
            </p>
          </div>

          {/* Alternating Feature Rows */}
          <div className="space-y-16 sm:space-y-24">
            {GYM_OWNER_FEATURES.map((feature, idx) => {
              const isEven = idx % 2 === 1; // Row 2, 4, 6 (1-based): image right, content left on desktop
              return (
                <div
                  key={feature.title}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center"
                >
                  {/* Image Column: Stacked first on mobile, alternates on desktop */}
                  <div
                    className={`lg:col-span-6 w-full ${
                      isEven ? 'lg:order-2' : 'lg:order-1'
                    }`}
                  >
                    <div className="relative rounded-2xl overflow-hidden border border-[#E2E8F0] bg-[#FFFFFF] shadow-2xl aspect-[16/10] group">
                      <img
                        src={feature.image}
                        alt={feature.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = gymLandingImg1;
                        }}
                      />
                    </div>
                  </div>

                  {/* Content Column: Below image on mobile, alternates on desktop */}
                  <div
                    className={`lg:col-span-6 w-full ${
                      isEven ? 'lg:order-1' : 'lg:order-2'
                    }`}
                  >
                    <div className="max-w-xl mx-auto lg:mx-0 text-left">
                      <h3 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-[#64748B] text-base sm:text-lg leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SaaS Platform Subscription Plans (Matches Image 2 & Image 3) */}
      <section className="py-24 bg-[#FFFFFF] border-t border-[#E2E8F0]" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-[#FFF7ED] border border-[#FFEDD5] rounded-full px-4 py-1.5 text-[#EA580C] text-xs font-bold uppercase tracking-widest mb-5">
              <span>SaaS Platform Pricing for Gyms</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-4 text-[#111827] tracking-tight">Power Your Gym. Choose Your Plan.</h2>
            <p className="text-[#64748B] mb-8 max-w-xl mx-auto text-sm sm:text-base">All plans give your gym access to the Gymora platform. Scale as your gym grows.</p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <span className={`text-sm font-semibold transition-colors ${!isAnnual ? 'text-[#111827]' : 'text-[#64748B]'}`}>Monthly</span>
              <button
                type="button"
                onClick={() => setIsAnnual(!isAnnual)}
                aria-pressed={isAnnual}
                aria-label="Toggle annual or monthly billing"
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:ring-offset-2 ${isAnnual ? 'bg-[#C2410C]' : 'bg-[#E2E8F0]'}`}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-[#FFFFFF] shadow-md transition-transform duration-300 ${isAnnual ? 'translate-x-9' : 'translate-x-1'}`} />
              </button>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold transition-colors ${isAnnual ? 'text-[#111827]' : 'text-[#64748B]'}`}>Annual</span>
                {isAnnual ? (
                  <span className="inline-flex items-center gap-1 bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5] text-xs px-3 py-1 rounded-full font-bold">🎁 2 months FREE — Save up to 25%</span>
                ) : (
                  <span className="text-xs bg-[#FFFFFF] text-[#EA580C] border border-[#E2E8F0] px-3 py-1 rounded-full font-medium">Switch to annual & save up to 25%</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 items-stretch">
            {[
              {
                key: 'FREE_TRIAL',
                name: 'Free Trial',
                badge: '1 DAY',
                price: '₹0',
                period: '/ 1 day',
                annualTotal: null,
                limits: '10 members • 1 trainer • 1 branch',
                features: [
                  'Basic Gym Profile',
                  'Basic Member Management',
                  'Basic Attendance',
                  'Basic AI Fitness Assessment',
                  '1 AI Workout Plan',
                  'Basic Diet Recommendation',
                  'Limited AI Chat',
                  'Basic Progress Tracking'
                ],
                locked: ['Advanced Analytics', 'Trainer Booking', '1-on-1 Coaching'],
                savings: null,
                buttonText: 'Start Free Trial',
                popular: false,
                trial: true,
                defaultBorder: 'border-[#E2E8F0] border-dashed',
                selBorder: 'border-[#FDBA74]',
                selBar: 'bg-[#C2410C]',
                btnDefault: 'bg-[#C2410C] text-white hover:bg-[#9A3412] shadow-md shadow-orange-500/15',
                btnSelected: 'bg-[#9A3412] text-white',
              },
              {
                key: 'SILVER',
                name: 'Silver',
                badge: 'BEGINNER',
                price: isAnnual ? '₹7,190' : '₹799',
                period: isAnnual ? '/year' : '/mo',
                annualTotal: isAnnual ? 'Equivalent to ₹599/mo' : null,
                limits: '100 members • 5 trainers • 1 branch',
                features: [
                  'Gym Profile Management',
                  'Member Management',
                  'Trainer & Staff Management',
                  'AI Fitness Assessment',
                  'Basic AI Workout & Diet Plans',
                  'AI Chat Assistant',
                  'Basic Reports (3 types)',
                  'Membership Tracking'
                ],
                locked: ['Advanced Analytics', 'Trainer Booking', '1-on-1 Coaching'],
                savings: isAnnual ? '💰 Save ₹1,598 vs monthly billing' : null,
                buttonText: 'Choose Silver',
                popular: false,
                trial: false,
                defaultBorder: 'border-[#E2E8F0]',
                selBorder: 'border-[#FDBA74]',
                selBar: 'bg-[#C2410C]',
                btnDefault: 'bg-[#C2410C] text-white hover:bg-[#9A3412] shadow-md shadow-orange-500/15',
                btnSelected: 'bg-[#9A3412] text-white',
              },
              {
                key: 'GOLD',
                name: 'Gold',
                badge: 'MOST POPULAR',
                price: isAnnual ? '₹13,490' : '₹1,499',
                period: isAnnual ? '/year' : '/mo',
                annualTotal: isAnnual ? 'Equivalent to ₹1,124/mo' : null,
                limits: '500 members • 15 trainers • 2 branches',
                features: [
                  'Everything in Silver',
                  'Advanced AI Workout & Diet Plans',
                  'AI Fitness Assistant',
                  'Goal-Based Workout Recs',
                  'Trainer Discovery & Booking',
                  'Trainer Scheduling',
                  'Detailed Progress Analytics',
                  'Revenue & Membership Analytics'
                ],
                locked: ['1-on-1 Coaching', 'Live Trainer Sessions'],
                savings: isAnnual ? '💰 Save ₹4,498 vs monthly billing' : null,
                buttonText: 'Choose Gold',
                popular: true,
                trial: false,
                defaultBorder: 'border-[#FFEDD5] border-2',
                selBorder: 'border-[#FDBA74]',
                selBar: 'bg-[#C2410C]',
                btnDefault: 'bg-[#C2410C] text-white font-bold hover:bg-[#9A3412] shadow-md shadow-orange-500/15',
                btnSelected: 'bg-[#9A3412] text-white font-bold',
              },
              {
                key: 'PREMIUM',
                name: 'Premium',
                badge: 'ADVANCED',
                price: isAnnual ? '₹22,490' : '₹2,499',
                period: isAnnual ? '/year' : '/mo',
                annualTotal: isAnnual ? 'Equivalent to ₹1,874/mo' : null,
                limits: 'Unlimited members & trainers • 5 branches',
                features: [
                  'Everything in Gold',
                  '1-on-1 Online Coaching',
                  'Live Trainer Sessions',
                  'Priority Trainer Booking',
                  'AI + Trainer Hybrid Recs',
                  'Branch-wise Analytics',
                  'Member Retention Analytics',
                  'Priority Support & Monthly Review'
                ],
                locked: [],
                savings: isAnnual ? '💰 Save ₹7,498 vs monthly billing' : null,
                buttonText: 'Choose Premium',
                popular: false,
                trial: false,
                defaultBorder: 'border-[#E2E8F0]',
                selBorder: 'border-[#FDBA74]',
                selBar: 'bg-[#C2410C]',
                btnDefault: 'bg-[#C2410C] text-white hover:bg-[#9A3412] shadow-md shadow-orange-500/15',
                btnSelected: 'bg-[#9A3412] text-white',
              }
            ].map((plan, idx) => {
              const isSelected = selectedPlan === plan.key;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedPlan(isSelected ? null : plan.key)}
                  className={`relative flex flex-col bg-[#FFFFFF] rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden border-2 text-[#111827] ${
                    isSelected
                      ? `${plan.selBorder} shadow-2xl -translate-y-2 ring-1 ring-[#F97316]/50`
                      : `${plan.defaultBorder} hover:-translate-y-1 hover:border-[#FFEDD5] hover:shadow-xl`
                  }`}
                >
                  {/* Accent bar when selected */}
                  {isSelected && (
                    <div className={`h-1.5 w-full ${plan.selBar}`} />
                  )}

                  {plan.popular && (
                    <div className="bg-[#C2410C] text-[#F8FAFC] text-[10px] font-extrabold text-center py-1.5 uppercase tracking-widest flex items-center justify-center gap-1">
                      <span>⭐</span> MOST POPULAR
                    </div>
                  )}

                  {isSelected && !plan.popular && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 text-[#FFFFFF] bg-[#C2410C] text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                      <CheckCircle size={10} /> Selected
                    </div>
                  )}

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-bold text-[#111827]">{plan.name}</h3>
                      <span className={`text-[10px] px-2.5 py-1 rounded-md font-extrabold uppercase tracking-wider ${
                        plan.popular
                          ? 'bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]'
                          : 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]'
                      }`}>
                        {plan.badge}
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-[#111827]">{plan.price}</span>
                        <span className="text-[#64748B] text-sm">{plan.period}</span>
                      </div>
                      {plan.annualTotal && <p className="text-[#64748B] text-xs mt-0.5">{plan.annualTotal}</p>}
                      {plan.savings && <p className="text-[#EA580C] text-xs mt-1 font-semibold">{plan.savings}</p>}
                      {!isAnnual && !plan.trial && (
                        <p className="text-[#64748B] text-xs mt-0.5">or save 25% with annual</p>
                      )}
                    </div>

                    <div className="bg-[#F8FAFC] rounded-xl px-3 py-2 mb-4 border border-[#E2E8F0]">
                      <p className="text-[10px] uppercase tracking-wider font-bold mb-0.5 text-[#64748B]">Platform Limits</p>
                      <p className="text-xs text-[#1F2937] font-medium">{plan.limits}</p>
                    </div>

                    <ul className="space-y-1.5 mb-4 flex-1">
                      {plan.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2 text-xs text-[#1F2937]">
                          <CheckCircle size={13} className="shrink-0 mt-0.5 text-[#EA580C]" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {plan.locked.map((feature, fIdx) => (
                        <li key={`locked-${fIdx}`} className="flex items-start gap-2 text-xs text-[#64748B]/60">
                          <XCircle size={13} className="shrink-0 mt-0.5 text-[#64748B]/40" />
                          <span className="line-through">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      to={user?.role === 'GYM_OWNER' ? `/subscription-plans?plan=${plan.key}&billing=${isAnnual ? 'annual' : 'monthly'}` : `/register/gym-owner?plan=${plan.key}&billing=${isAnnual ? 'annual' : 'monthly'}`}
                      onClick={e => e.stopPropagation()}
                      className={`w-full py-3 rounded-xl text-center font-bold transition-all text-sm block ${
                        isSelected
                          ? plan.btnSelected
                          : plan.btnDefault
                      }`}
                    >
                      {plan.buttonText}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Multi-Branch & Registration Banner */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#FFFFFF] to-[#F8FAFC] border border-[#E2E8F0] rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="w-14 h-14 bg-[#FFF7ED] text-[#EA580C] rounded-2xl flex items-center justify-center mx-auto mb-5 border border-[#FFEDD5]">
            <Building2 size={28} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mb-3">
            Ready to Take Your Gym to the Next Level?
          </h2>
          <p className="text-sm sm:text-base text-[#64748B] max-w-xl mx-auto mb-8">
            Join hundreds of forward-thinking gym owners who have streamlined their front-desk and increased monthly revenues by over 35%.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#64748B] mb-8">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#EA580C]" />
              <span>Multi-Branch Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#EA580C]" />
              <span>Automated Invoicing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#EA580C]" />
              <span>Integrated AI Workplans</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/gym-owner-introduction"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/15"
            >
              <span>Register Your Gym</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer matching reference design */}
      <footer className="border-t border-[#E2E8F0] bg-[#F8FAFC] pt-16 pb-8 text-[#64748B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              {/* Footer logo — scrolls to top */}
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                className="flex items-center space-x-2 mb-4 group cursor-pointer text-left"
              >
                <div className="w-8 h-8 bg-[#C2410C] rounded-lg flex items-center justify-center shadow-md shadow-orange-500/15">
                  <Activity className="text-[#FFFFFF]" size={18} />
                </div>
                <span className="text-xl font-bold tracking-tight text-[#111827]">Gymora</span>
              </button>
              <p className="text-[#64748B] text-sm leading-relaxed mb-6">
                The ultimate fitness ecosystem combining AI intelligence with human expertise for unmatched results.
              </p>
              <div className="flex space-x-4">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-[#64748B] hover:text-[#EA580C] transition-colors"><FaInstagram size={20} /></a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-[#64748B] hover:text-[#EA580C] transition-colors"><FaTwitter size={20} /></a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-[#64748B] hover:text-[#EA580C] transition-colors"><FaFacebook size={20} /></a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-[#64748B] hover:text-[#EA580C] transition-colors"><FaYoutube size={20} /></a>
              </div>
            </div>

            <div>
              <h4 className="text-[#111827] font-semibold mb-4">Gym Management</h4>
              <ul className="space-y-2 text-sm text-[#64748B]">
                <li>
                  <button
                    onClick={() => setActiveFooterModal('gym-profile')}
                    className="hover:text-[#EA580C] transition-colors cursor-pointer text-left"
                  >
                    Gym Profile
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveFooterModal('trainer-hiring')}
                    className="hover:text-[#EA580C] transition-colors cursor-pointer text-left"
                  >
                    Trainer Hiring
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveFooterModal('subscription-plans')}
                    className="hover:text-[#EA580C] transition-colors cursor-pointer text-left"
                  >
                    Subscription Plans
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-[#111827] font-semibold mb-4">Support &amp; Resources</h4>
              <ul className="space-y-2 text-sm text-[#64748B]">
                <li>
                  <button
                    onClick={() => setActiveFooterModal('help-support')}
                    className="hover:text-[#EA580C] transition-colors cursor-pointer text-left"
                  >
                    Help &amp; Support
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveFooterModal('faqs')}
                    className="hover:text-[#EA580C] transition-colors cursor-pointer text-left"
                  >
                    FAQs
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-[#111827] font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-[#64748B]">
                <li>
                  <button
                    onClick={() => setActiveFooterModal('privacy-policy')}
                    className="hover:text-[#EA580C] transition-colors cursor-pointer text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveFooterModal('terms-conditions')}
                    className="hover:text-[#EA580C] transition-colors cursor-pointer text-left"
                  >
                    Terms &amp; Conditions
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#E2E8F0] pt-8 text-center text-sm text-[#64748B]">
            <p>&copy; {new Date().getFullYear()} Gymora Technologies Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Interactive Content Modal for Footer Links */}
      {activeFooterModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveFooterModal(null)}
        >
          <div 
            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl w-full max-w-2xl max-h-[88vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative text-[#111827] scrollbar-thin scrollbar-thumb-[#E2E8F0]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveFooterModal(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-[#FFFFFF] hover:bg-[#FFF7ED] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#C2410C] transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* 1. Subscription Plans */}
            {activeFooterModal === 'subscription-plans' && (
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C]">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#EA580C]">Platform Tiers</span>
                    <h3 className="text-xl font-bold text-[#111827]">Platform Subscription Plans</h3>
                  </div>
                </div>
                <p className="text-sm text-[#64748B] mb-6">
                  Transparent, scalable SaaS pricing tailored for modern gym operations and fitness clubs.
                </p>

                {/* Plans Overview Grid */}
                <div className="grid sm:grid-cols-2 gap-3.5 mb-6">
                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#FFEDD5] transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-[#111827] text-base">Free Trial</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#E2E8F0] text-[#64748B] font-semibold">1 DAY</span>
                    </div>
                    <p className="text-2xl font-black text-[#EA580C] mb-2">₹0</p>
                    <p className="text-xs text-[#64748B] mb-3">10 members • 1 trainer • 1 branch</p>
                    <ul className="text-xs text-[#CBD5E1] space-y-1.5">
                      <li className="flex items-center gap-1.5"><Check size={14} className="text-[#EA580C]" /> Basic Gym Profile</li>
                      <li className="flex items-center gap-1.5"><Check size={14} className="text-[#EA580C]" /> Member Management</li>
                      <li className="flex items-center gap-1.5"><Check size={14} className="text-[#EA580C]" /> QR Attendance Sync</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#FFEDD5] transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-[#111827] text-base">Silver</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#E2E8F0] text-[#64748B] font-semibold">BEGINNER</span>
                    </div>
                    <p className="text-2xl font-black text-[#EA580C] mb-2">₹799<span className="text-xs text-[#64748B] font-normal"> /mo</span></p>
                    <p className="text-xs text-[#64748B] mb-3">100 members • 5 trainers • 1 branch</p>
                    <ul className="text-xs text-[#CBD5E1] space-y-1.5">
                      <li className="flex items-center gap-1.5"><Check size={14} className="text-[#EA580C]" /> Staff Management</li>
                      <li className="flex items-center gap-1.5"><Check size={14} className="text-[#EA580C]" /> AI Fitness Assessment</li>
                      <li className="flex items-center gap-1.5"><Check size={14} className="text-[#EA580C]" /> Automated Reminders</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FFFFFF] border-2 border-[#FDBA74] relative shadow-lg shadow-orange-500/15">
                    <div className="absolute -top-2.5 right-3 bg-[#C2410C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Most Popular
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-[#111827] text-base">Gold</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFF7ED] text-[#EA580C] font-semibold">GROWTH</span>
                    </div>
                    <p className="text-2xl font-black text-[#EA580C] mb-2">₹1,499<span className="text-xs text-[#64748B] font-normal"> /mo</span></p>
                    <p className="text-xs text-[#64748B] mb-3">500 members • 15 trainers • Multi-branch</p>
                    <ul className="text-xs text-[#CBD5E1] space-y-1.5">
                      <li className="flex items-center gap-1.5"><Check size={14} className="text-[#EA580C]" /> AI Workout & Diet Generation</li>
                      <li className="flex items-center gap-1.5"><Check size={14} className="text-[#EA580C]" /> Biometric Machine Integration</li>
                      <li className="flex items-center gap-1.5"><Check size={14} className="text-[#EA580C]" /> Revenue Analytics Cockpit</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#FFEDD5] transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-[#111827] text-base">Platinum</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold">ENTERPRISE</span>
                    </div>
                    <p className="text-2xl font-black text-[#EA580C] mb-2">₹2,999<span className="text-xs text-[#64748B] font-normal"> /mo</span></p>
                    <p className="text-xs text-[#64748B] mb-3">Unlimited members • Unlimited trainers</p>
                    <ul className="text-xs text-[#CBD5E1] space-y-1.5">
                      <li className="flex items-center gap-1.5"><Check size={14} className="text-[#EA580C]" /> Custom Gym Brand & Domain</li>
                      <li className="flex items-center gap-1.5"><Check size={14} className="text-[#EA580C]" /> Dedicated Account Manager</li>
                      <li className="flex items-center gap-1.5"><Check size={14} className="text-[#EA580C]" /> Turnstile Hardware API</li>
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#E2E8F0]">
                  <button
                    onClick={() => {
                      setActiveFooterModal(null);
                      const el = document.getElementById('pricing');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF7ED] text-[#EA580C] border border-[#E2E8F0] hover:border-[#FFEDD5] font-semibold text-sm transition-all"
                  >
                    View Full Pricing Table On Page
                  </button>
                  <Link
                    to="/gym-owner-introduction"
                    onClick={() => setActiveFooterModal(null)}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-sm transition-all text-center shadow-md shadow-orange-500/15"
                  >
                    Register Your Gym
                  </Link>
                </div>
              </div>
            )}

            {/* 2. Gym Profile */}
            {activeFooterModal === 'gym-profile' && (
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C]">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#EA580C]">Gym Management</span>
                    <h3 className="text-xl font-bold text-[#111827]">Gym Profile & Multi-Branch Setup</h3>
                  </div>
                </div>
                <p className="text-sm text-[#64748B] mb-6">
                  Set up and manage your fitness facility identity, branches, operating hours, and floor amenities.
                </p>

                <div className="space-y-3 mb-6">
                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0]">
                    <h4 className="font-bold text-[#111827] text-sm mb-1 flex items-center gap-2">
                      <Building2 size={16} className="text-[#EA580C]" /> Multi-Branch Architecture
                    </h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Link and control multiple gym centers from a central administrator panel while maintaining branch-specific member databases, local equipment inventories, and revenue tracking.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0]">
                    <h4 className="font-bold text-[#111827] text-sm mb-1 flex items-center gap-2">
                      <Sparkles size={16} className="text-[#EA580C]" /> Custom Branding & Digital Identity
                    </h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Upload gym logos, custom branch photos, and brand colors. Your branding appears seamlessly on member registration slips, invoice PDFs, and member check-in screens.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0]">
                    <h4 className="font-bold text-[#111827] text-sm mb-1 flex items-center gap-2">
                      <Clock size={16} className="text-[#EA580C]" /> Operating Hours & Amenities
                    </h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Configure custom opening and closing schedules, morning/evening batches, women-only hours, and tag amenities like Sauna, Steam Room, Olympic Free Weights, and Crossfit Rigs.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-[#E2E8F0]">
                  <Link
                    to="/gym-owner-introduction"
                    onClick={() => setActiveFooterModal(null)}
                    className="px-6 py-2.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-sm transition-all"
                  >
                    Setup Your Gym Profile
                  </Link>
                </div>
              </div>
            )}

            {/* 3. Trainer Hiring */}
            {activeFooterModal === 'trainer-hiring' && (
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C]">
                    <Users size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#EA580C]">Recruitment Engine</span>
                    <h3 className="text-xl font-bold text-[#111827]">Trainer Hiring & Staff Management</h3>
                  </div>
                </div>
                <p className="text-sm text-[#64748B] mb-6">
                  Recruit certified fitness coaches, verify certifications, and automate trainer commission payouts.
                </p>

                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0]">
                    <h4 className="font-bold text-[#111827] text-sm mb-1">Certified Trainer Pool</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Browse verified professionals holding ACE, ISSA, K11, ACSM, or CPR certifications ready for full-time or freelance floor roles.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0]">
                    <h4 className="font-bold text-[#111827] text-sm mb-1">Post Vacancies</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Publish open job postings for Strength Coaches, Yoga Instructors, Pilates Trainers, and Nutritionists directly to our trainer community.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0]">
                    <h4 className="font-bold text-[#111827] text-sm mb-1">Automated Commissions</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Set custom split percentages (e.g. 70/30) or per-session fees. Sessions are verified via member check-in before generating settlement ledgers.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0]">
                    <h4 className="font-bold text-[#111827] text-sm mb-1">Shift & Booking Calendar</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Manage floor shifts, personal training hours, and group class allocations without overlapping bookings.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-[#E2E8F0]">
                  <Link
                    to="/gym-owner-introduction"
                    onClick={() => setActiveFooterModal(null)}
                    className="px-6 py-2.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-sm transition-all"
                  >
                    Get Started With Gymora Hiring
                  </Link>
                </div>
              </div>
            )}

            {/* 4. Help & Support */}
            {activeFooterModal === 'help-support' && (
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C]">
                    <HelpCircle size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#EA580C]">Support & Resources</span>
                    <h3 className="text-xl font-bold text-[#111827]">Gym Owner Help & Support Center</h3>
                  </div>
                </div>
                <p className="text-sm text-[#64748B] mb-6">
                  24/7 dedicated support channels for gym owners, facility managers, and front-desk staff.
                </p>

                <div className="space-y-3 mb-6">
                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] flex items-start gap-4">
                    <div className="p-2.5 rounded-lg bg-[#FFF7ED] text-[#EA580C]">
                      <Phone size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#111827] text-sm">24/7 Urgent Operations Helpline</h4>
                      <p className="text-xs text-[#64748B] mt-0.5">+91 (800) 496-6721 (Toll-Free for Gym Owners)</p>
                      <p className="text-[11px] text-[#EA580C] mt-1 font-medium">Fast assistance for biometric turnstile sync & payment gateways</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] flex items-start gap-4">
                    <div className="p-2.5 rounded-lg bg-[#FFF7ED] text-[#EA580C]">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#111827] text-sm">Dedicated Email Desk</h4>
                      <p className="text-xs text-[#64748B] mt-0.5">support@gymora.com</p>
                      <p className="text-[11px] text-[#64748B] mt-1">Average response SLA: under 15 minutes</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] flex items-start gap-4">
                    <div className="p-2.5 rounded-lg bg-[#FFF7ED] text-[#EA580C]">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#111827] text-sm">Dedicated Onboarding Specialist</h4>
                      <p className="text-xs text-[#64748B] mt-0.5">Complimentary 1-on-1 migration assistance to import existing member spreadsheets</p>
                      <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded bg-emerald-500/15 text-[#15803D] font-medium">Platform Status: 99.98% Uptime</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-[#E2E8F0]">
                  <button
                    onClick={() => setActiveFooterModal(null)}
                    className="px-6 py-2.5 rounded-xl bg-[#C2410C] text-white font-bold text-sm"
                  >
                    Close Support Desk
                  </button>
                </div>
              </div>
            )}

            {/* 5. FAQs */}
            {activeFooterModal === 'faqs' && (
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C]">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#EA580C]">Knowledge Base</span>
                    <h3 className="text-xl font-bold text-[#111827]">Frequently Asked Questions</h3>
                  </div>
                </div>
                <p className="text-sm text-[#64748B] mb-6">
                  Quick answers to common questions about Gymora platform setup, member migrations, and billing.
                </p>

                <div className="space-y-3 mb-6">
                  {[
                    {
                      q: "Can I migrate my existing member records from Excel or another software?",
                      a: "Yes! Gymora features an automated Excel/CSV bulk import tool. You can upload existing member names, phone numbers, active plan durations, and expiry dates with zero operational downtime."
                    },
                    {
                      q: "How does the biometric and QR code check-in work?",
                      a: "Gymora integrates directly with popular biometric fingerprint/facial turnstiles and generates dynamic member QR passes. The system automatically permits entry only if the member's subscription is active and paid."
                    },
                    {
                      q: "Are there any hidden setup fees or long-term lock-in contracts?",
                      a: "None whatsoever. All Gymora subscription plans are month-to-month with no long-term lock-ins. You can upgrade, downgrade, or cancel whenever you choose."
                    },
                    {
                      q: "How do trainer payouts and session bookings get calculated?",
                      a: "When a member completes a personal training session, it is verified through OTP or check-in. Gymora automatically logs the session and generates weekly or monthly settlement sheets based on your commission split."
                    },
                    {
                      q: "Can I manage multiple gym branches with one subscription?",
                      a: "Yes! Gold and Platinum tiers support multi-branch management. You can switch between branch dashboards or view aggregated platform revenues with a single gym owner login."
                    }
                  ].map((item, idx) => (
                    <div 
                      key={idx}
                      className="rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                        className="w-full p-4 text-left flex items-center justify-between text-white font-semibold text-sm hover:text-[#EA580C] transition-colors"
                      >
                        <span>{item.q}</span>
                        <ChevronDown size={16} className={`transition-transform ${expandedFaq === idx ? 'rotate-180 text-[#EA580C]' : 'text-[#64748B]'}`} />
                      </button>
                      {expandedFaq === idx && (
                        <div className="px-4 pb-4 text-xs text-[#64748B] leading-relaxed border-t border-[#E2E8F0]/50 pt-3">
                          {item.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4 border-t border-[#E2E8F0]">
                  <button
                    onClick={() => setActiveFooterModal(null)}
                    className="px-6 py-2.5 rounded-xl bg-[#C2410C] text-white font-bold text-sm"
                  >
                    Got It
                  </button>
                </div>
              </div>
            )}

            {/* 6. Contact Us */}
            {activeFooterModal === 'contact-us' && (
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C]">
                    <Phone size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#EA580C]">Get In Touch</span>
                    <h3 className="text-xl font-bold text-[#111827]">Contact Gymora Operations</h3>
                  </div>
                </div>
                <p className="text-sm text-[#64748B] mb-6">
                  Speak directly with our enterprise team about custom onboarding, biometric setup, or multi-gym pricing.
                </p>

                {contactSubmitted ? (
                  <div className="p-6 rounded-xl bg-[#FFFFFF] border border-[#FFEDD5] text-center py-10 mb-6">
                    <CheckCircle2 size={44} className="text-[#EA580C] mx-auto mb-3" />
                    <h4 className="text-lg font-bold text-[#111827] mb-1">Message Received!</h4>
                    <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                      Thank you for reaching out. A Gymora enterprise onboarding specialist will call you back within 2 business hours.
                    </p>
                  </div>
                ) : (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      setContactSubmitted(true);
                    }}
                    className="space-y-3.5 mb-6"
                  >
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">Gym / Business Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Iron Fortress Gym"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] text-white text-xs focus:border-[#FDBA74] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">Contact Person Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rahul Sharma"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] text-white text-xs focus:border-[#FDBA74] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">Work Email</label>
                        <input
                          type="email"
                          required
                          placeholder="owner@yourgym.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] text-white text-xs focus:border-[#FDBA74] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">Mobile Number</label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] text-white text-xs focus:border-[#FDBA74] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">How can we assist you?</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Tell us about your facility, number of active members, and specific requirements..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] text-white text-xs focus:border-[#FDBA74] focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-sm transition-all shadow-md shadow-orange-500/15"
                    >
                      Submit Inquiry
                    </button>
                  </form>
                )}

                <div className="pt-4 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between text-xs text-[#64748B] gap-2">
                  <span>Direct Hotline: <strong className="text-white">+91 (800) 496-6721</strong></span>
                  <span>HQ: Koramangala 5th Block, Bengaluru</span>
                </div>
              </div>
            )}

            {/* 7. Privacy Policy */}
            {activeFooterModal === 'privacy-policy' && (
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C]">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#EA580C]">Data Governance</span>
                    <h3 className="text-xl font-bold text-[#111827]">Gym Owner & Member Privacy Policy</h3>
                  </div>
                </div>
                <p className="text-sm text-[#64748B] mb-6">
                  Industry-leading data isolation, encryption standards, and digital privacy protocols.
                </p>

                <div className="space-y-3.5 mb-6">
                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0]">
                    <h4 className="font-bold text-[#111827] text-sm mb-1">1. Cryptographic Tenant Data Isolation</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Every gym operates in a secure logical silo. Your member database, financial records, and staff schedules are completely inaccessible by any other gym on the platform.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0]">
                    <h4 className="font-bold text-[#111827] text-sm mb-1">2. Biometric Hashing Standards</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Fingerprint and facial check-in credentials are converted into irreversible mathematical hash templates using AES-256 encryption. Raw biometric images are never captured or stored.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0]">
                    <h4 className="font-bold text-[#111827] text-sm mb-1">3. Zero Data Monetization</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Gymora never sells, rents, or shares your gym's or members' data with third-party advertisers or insurance brokers. You retain 100% intellectual ownership of your member database.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-[#E2E8F0]">
                  <button
                    onClick={() => setActiveFooterModal(null)}
                    className="px-6 py-2.5 rounded-xl bg-[#C2410C] text-white font-bold text-sm"
                  >
                    I Understand
                  </button>
                </div>
              </div>
            )}

            {/* 8. Terms & Conditions */}
            {activeFooterModal === 'terms-conditions' && (
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C]">
                    <FileText size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#EA580C]">Agreement</span>
                    <h3 className="text-xl font-bold text-[#111827]">Platform Terms & Conditions</h3>
                  </div>
                </div>
                <p className="text-sm text-[#64748B] mb-6">
                  Clear, enforceable service level agreements governing your use of Gymora SaaS services.
                </p>

                <div className="space-y-3.5 mb-6">
                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0]">
                    <h4 className="font-bold text-[#111827] text-sm mb-1">1. Service Level Agreement (99.9% Uptime)</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      We guarantee 99.9% monthly platform uptime with automated multi-zone failovers to ensure your front-desk and turnstiles operate smoothly around the clock.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0]">
                    <h4 className="font-bold text-[#111827] text-sm mb-1">2. Subscription Licensing</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Subscriptions renew on your billing anniversary date. You can upgrade, downgrade, or alter active member capacity at any point with instant pro-rata adjustments.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0]">
                    <h4 className="font-bold text-[#111827] text-sm mb-1">3. Authorized Personnel Responsibilities</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Gym owners are responsible for allocating and revoking access roles (receptionist, floor manager, accountant) and maintaining strong security practices.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-[#E2E8F0]">
                  <button
                    onClick={() => setActiveFooterModal(null)}
                    className="px-6 py-2.5 rounded-xl bg-[#C2410C] text-white font-bold text-sm"
                  >
                    Accept & Close
                  </button>
                </div>
              </div>
            )}

            {/* 9. Cancellation & Refund Policy */}
            {activeFooterModal === 'cancellation-refund' && (
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C]">
                    <RefreshCcw size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#EA580C]">Customer First</span>
                    <h3 className="text-xl font-bold text-[#111827]">Cancellation & Refund Policy</h3>
                  </div>
                </div>
                <p className="text-sm text-[#64748B] mb-6">
                  Transparent, hassle-free subscription policies designed with complete peace of mind.
                </p>

                <div className="space-y-3.5 mb-6">
                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0]">
                    <h4 className="font-bold text-[#111827] text-sm mb-1">14-Day 100% Money-Back Guarantee</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Try any paid Gymora plan for 14 full days. If it does not streamline your gym operations, contact support for a prompt, 100% refund without questions.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0]">
                    <h4 className="font-bold text-[#111827] text-sm mb-1">Cancel Anytime With Zero Penalty</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      You are never tied to an annual contract unless you specifically select discounted annual billing. Cancel directly from your billing dashboard with 1 click.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0]">
                    <h4 className="font-bold text-[#111827] text-sm mb-1">60-Day Data Export Guarantee</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Upon cancellation, your gym database is preserved for 60 calendar days, allowing you to export complete member records, payments, and attendance ledgers in Excel/CSV format free of charge.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-[#E2E8F0]">
                  <button
                    onClick={() => setActiveFooterModal(null)}
                    className="px-6 py-2.5 rounded-xl bg-[#C2410C] text-white font-bold text-sm"
                  >
                    Understood
                  </button>
                </div>
              </div>
            )}

            {/* 10. Main Website */}
            {activeFooterModal === 'main-website' && (
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C]">
                    <Activity size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#EA580C]">Ecosystem</span>
                    <h3 className="text-xl font-bold text-[#111827]">Gymora Main Website</h3>
                  </div>
                </div>
                <p className="text-sm text-[#64748B] mb-6">
                  The consumer-facing platform where fitness enthusiasts discover nearby gyms, browse group classes, and sign up for memberships.
                </p>

                <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] mb-6 space-y-2">
                  <p className="text-xs text-[#CBD5E1]">
                    Visiting the main website lets you view how your gym appears to prospective members searching for top-rated fitness centers in their locality.
                  </p>
                  <ul className="text-xs text-[#64748B] space-y-1 pt-2">
                    <li className="flex items-center gap-1.5"><Check size={14} className="text-[#EA580C]" /> Public gym discovery directory</li>
                    <li className="flex items-center gap-1.5"><Check size={14} className="text-[#EA580C]" /> Virtual tour and gym feature showcase</li>
                    <li className="flex items-center gap-1.5"><Check size={14} className="text-[#EA580C]" /> Member registration & enquiry portal</li>
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
                  <button
                    onClick={() => setActiveFooterModal(null)}
                    className="px-4 py-2 rounded-xl bg-[#FFFFFF] text-[#64748B] hover:text-[#C2410C] text-xs"
                  >
                    Stay on Gym Owner
                  </button>
                  <Link
                    to="/"
                    onClick={() => setActiveFooterModal(null)}
                    className="px-6 py-2.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-sm transition-all flex items-center gap-2"
                  >
                    <span>Launch Main Website</span>
                    <ExternalLink size={16} />
                  </Link>
                </div>
              </div>
            )}

            {/* 11. Trainer Portal */}
            {activeFooterModal === 'trainer-portal' && (
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C]">
                    <Dumbbell size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#EA580C]">Staff Workspace</span>
                    <h3 className="text-xl font-bold text-[#111827]">Gymora Trainer</h3>
                  </div>
                </div>
                <p className="text-sm text-[#64748B] mb-6">
                  The dedicated interface for fitness instructors and personal trainers working at your gym.
                </p>

                <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] mb-6 space-y-2">
                  <p className="text-xs text-[#CBD5E1]">
                    Trainers log in here to manage their assigned clients, build customized workout plans, review member check-in progress, and track session payouts.
                  </p>
                  <ul className="text-xs text-[#64748B] space-y-1.5 pt-2">
                    <li className="flex items-center gap-1.5"><Check size={14} className="text-[#EA580C]" /> Client roster & progress graphs</li>
                    <li className="flex items-center gap-1.5"><Check size={14} className="text-[#EA580C]" /> AI-assisted workout & diet program builder</li>
                    <li className="flex items-center gap-1.5"><Check size={14} className="text-[#EA580C]" /> Floor session booking calendar</li>
                    <li className="flex items-center gap-1.5"><Check size={14} className="text-[#EA580C]" /> Direct earnings and commission ledgers</li>
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
                  <button
                    onClick={() => setActiveFooterModal(null)}
                    className="px-4 py-2 rounded-xl bg-[#FFFFFF] text-[#64748B] hover:text-[#C2410C] text-xs"
                  >
                    Close
                  </button>
                  <Link
                    to="/trainer"
                    onClick={() => setActiveFooterModal(null)}
                    className="px-6 py-2.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-sm transition-all flex items-center gap-2"
                  >
                    <span>Go to Trainer</span>
                    <ExternalLink size={16} />
                  </Link>
                </div>
              </div>
            )}

            {/* 12. Customer Portal */}
            {activeFooterModal === 'customer-portal' && (
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C]">
                    <Users size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#EA580C]">Member App</span>
                    <h3 className="text-xl font-bold text-[#111827]">Gymora Customer</h3>
                  </div>
                </div>
                <p className="text-sm text-[#64748B] mb-6">
                  The member companion interface for gym attendees to access workouts, check-in, and renew plans.
                </p>

                <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] mb-6 space-y-2">
                  <p className="text-xs text-[#CBD5E1]">
                    Provides your gym members with an interactive digital fitness experience directly from their mobile or web browser.
                  </p>
                  <ul className="text-xs text-[#64748B] space-y-1.5 pt-2">
                    <li className="flex items-center gap-1.5"><Check size={14} className="text-[#EA580C]" /> Digital QR code for turnstile check-in</li>
                    <li className="flex items-center gap-1.5"><Check size={14} className="text-[#EA580C]" /> Live workout guidance and rest timers</li>
                    <li className="flex items-center gap-1.5"><Check size={14} className="text-[#EA580C]" /> AI diet meal logger and macro tracking</li>
                    <li className="flex items-center gap-1.5"><Check size={14} className="text-[#EA580C]" /> 1-click gym membership renewal</li>
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
                  <button
                    onClick={() => setActiveFooterModal(null)}
                    className="px-4 py-2 rounded-xl bg-[#FFFFFF] text-[#64748B] hover:text-[#C2410C] text-xs"
                  >
                    Close
                  </button>
                  <Link
                    to="/portal/customer"
                    onClick={() => setActiveFooterModal(null)}
                    className="px-6 py-2.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-sm transition-all flex items-center gap-2"
                  >
                    <span>Go to Customer</span>
                    <ExternalLink size={16} />
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Trainer Hiring & Onboarding Flowchart Modal */}
      {showTrainerHiringWorkflow && <TrainerHiringWorkflowModal />}

      {/* Gym Owner Journey Interactive Tour Modal */}
      {isTourOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#FFFFFF]/90 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setIsTourOpen(false)}
        >
          <div
            className="relative w-full max-w-6xl bg-[#F8FAFC] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(183,110,121,0.18)] flex flex-col h-[85vh] border border-[#E2E8F0]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 sm:p-5 border-b border-[#E2E8F0] bg-[#FFFFFF] shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] flex items-center justify-center text-[#EA580C]">
                  <PlayCircle size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm sm:text-base tracking-wide uppercase">
                      Gym Owner Operating Journey
                    </span>
                    <span className="inline-block text-[11px] font-bold text-[#EA580C] bg-[#FFF7ED] px-2.5 py-0.5 rounded-full border border-[#FFEDD5]">
                      Step {tourStep} of 7
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] hidden sm:block">
                    Full onboarding lifecycle: registration, superadmin vetting, plan activation, biometric access & POS
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsTourOpen(false)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-xs sm:text-sm rounded-full transition-all shadow-md cursor-pointer"
                  title="Back to Gym Owner"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Gym Owner</span>
                </button>
                <button
                  onClick={() => setIsTourOpen(false)}
                  className="text-[#64748B] hover:text-[#C2410C] transition-colors cursor-pointer p-1.5 hover:bg-[#FFF7ED] rounded-full"
                  aria-label="Close Tour"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Slide Area */}
            <div className="flex-1 relative overflow-y-auto flex items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-[#F8FAFC] to-[#FFFFFF]">
              <TourSlide
                journey="owner"
                step={tourStep}
                setJourney={() => setTourStep(1)}
              />
            </div>

            {/* Step Controls Footer */}
            <div className="p-4 border-t border-[#E2E8F0] bg-[#FFFFFF] flex items-center justify-between shrink-0">
              <button
                onClick={() => setTourStep(s => (s > 1 ? s - 1 : 7))}
                className="px-4 py-2 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] text-[#64748B] hover:text-[#C2410C] hover:border-[#FDBA74] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span>Previous Step</span>
              </button>

              {/* Progress Dots */}
              <div className="hidden sm:flex items-center gap-1.5">
                {Array.from({ length: 7 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTourStep(i + 1)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      tourStep === i + 1 ? 'w-6 bg-[#C2410C]' : 'w-2 bg-[#E2E8F0] hover:bg-[#64748B]'
                    }`}
                    title={`Step ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => setTourStep(s => (s < 7 ? s + 1 : 1))}
                className="px-4 py-2 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <span>{tourStep === 7 ? 'Restart Journey' : 'Next Step'}</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymOwnerPortalLanding;
