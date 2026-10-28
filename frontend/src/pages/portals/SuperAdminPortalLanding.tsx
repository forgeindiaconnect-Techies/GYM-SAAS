import { useState } from 'react';
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
  TerminalSquare,
  X,
  GitBranch,
  ArrowRight,
  ArrowDown
} from 'lucide-react';

const SuperAdminPortalLanding = () => {
  const [showWorkflow, setShowWorkflow] = useState(false);

  /* ── Workflow Modal ── */
  const WorkflowModal = () => (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 backdrop-blur-sm px-2 py-6" onClick={() => setShowWorkflow(false)}>
      <div
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-[#0E1415] border border-[#2A3A3A] rounded-2xl shadow-2xl shadow-black/60"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-[#0E1415] border-b border-[#2A3A3A]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 rounded-lg flex items-center justify-center">
              <GitBranch size={16} className="text-[#2DD4BF]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F5FAFA]">Super Admin Platform Workflow</h2>
              <p className="text-xs text-[#6A7F7F]">End-to-end administrative governance flowchart</p>
            </div>
          </div>
          <button onClick={() => setShowWorkflow(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1B2728] hover:bg-[#2A3A3A] text-[#9AAEAE] hover:text-[#F5FAFA] transition-all">
            <X size={16} />
          </button>
        </div>

        {/* SVG Flowchart */}
        <div className="p-4 overflow-x-auto flex justify-center">
          <svg viewBox="0 0 680 830" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: '680px', minWidth: '580px', display: 'block' }}>
            <defs>
              <marker id="wf-arr" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
                <polygon points="0 0, 9 3.5, 0 7" fill="#2DD4BF" />
              </marker>
              <marker id="wf-arrG" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
                <polygon points="0 0, 9 3.5, 0 7" fill="#4ade80" />
              </marker>
              <marker id="wf-arrR" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
                <polygon points="0 0, 9 3.5, 0 7" fill="#f87171" />
              </marker>
            </defs>

            {/* ── START ── */}
            <ellipse cx="340" cy="30" rx="72" ry="20" fill="#0a2820" stroke="#2DD4BF" strokeWidth="2" />
            <text x="340" y="35" textAnchor="middle" fill="#2DD4BF" fontSize="13" fontWeight="800" fontFamily="ui-sans-serif,sans-serif">START</text>

            {/* arrow */}
            <line x1="340" y1="50" x2="340" y2="68" stroke="#2DD4BF" strokeWidth="1.5" markerEnd="url(#wf-arr)" />

            {/* ── Box 1: Visit Portal ── */}
            <rect x="180" y="68" width="320" height="46" rx="8" fill="#141D1E" stroke="#3A5050" strokeWidth="1.5" />
            <text x="340" y="87" textAnchor="middle" fill="#F5FAFA" fontSize="12" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">Visit Super Admin Portal</text>
            <text x="340" y="103" textAnchor="middle" fill="#9AAEAE" fontSize="10" fontFamily="ui-sans-serif,sans-serif">/portal/super-admin</text>

            {/* arrow */}
            <line x1="340" y1="114" x2="340" y2="132" stroke="#2DD4BF" strokeWidth="1.5" markerEnd="url(#wf-arr)" />

            {/* ── Box 2: Click Login ── */}
            <rect x="180" y="132" width="320" height="46" rx="8" fill="#141D1E" stroke="#3A5050" strokeWidth="1.5" />
            <text x="340" y="151" textAnchor="middle" fill="#F5FAFA" fontSize="12" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">Click "Super Admin Login"</text>
            <text x="340" y="167" textAnchor="middle" fill="#9AAEAE" fontSize="10" fontFamily="ui-sans-serif,sans-serif">Redirects to /login?portal=super-admin</text>

            {/* arrow */}
            <line x1="340" y1="178" x2="340" y2="196" stroke="#2DD4BF" strokeWidth="1.5" markerEnd="url(#wf-arr)" />

            {/* ── Box 3: Enter Credentials ── */}
            <rect x="180" y="196" width="320" height="46" rx="8" fill="#141D1E" stroke="#3A5050" strokeWidth="1.5" />
            <text x="340" y="215" textAnchor="middle" fill="#F5FAFA" fontSize="12" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">Enter Credentials + MFA</text>
            <text x="340" y="231" textAnchor="middle" fill="#9AAEAE" fontSize="10" fontFamily="ui-sans-serif,sans-serif">JWT token verification &amp; session claim</text>

            {/* arrow */}
            <line x1="340" y1="242" x2="340" y2="260" stroke="#2DD4BF" strokeWidth="1.5" markerEnd="url(#wf-arr)" />

            {/* ── Decision Diamond: SUPER_ADMIN Role? ── */}
            <polygon points="340,260 460,305 340,350 220,305" fill="#1B2728" stroke="#2DD4BF" strokeWidth="2" />
            <text x="340" y="300" textAnchor="middle" fill="#2DD4BF" fontSize="11" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">SUPER_ADMIN</text>
            <text x="340" y="316" textAnchor="middle" fill="#2DD4BF" fontSize="11" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">Role Valid?</text>

            {/* YES — down */}
            <line x1="340" y1="350" x2="340" y2="380" stroke="#4ade80" strokeWidth="1.5" markerEnd="url(#wf-arrG)" />
            <text x="350" y="368" fill="#4ade80" fontSize="10" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">YES</text>

            {/* NO — right to Access Denied */}
            <line x1="460" y1="305" x2="530" y2="305" stroke="#f87171" strokeWidth="1.5" markerEnd="url(#wf-arrR)" />
            <text x="480" y="297" fill="#f87171" fontSize="10" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">NO</text>
            <rect x="530" y="284" width="118" height="42" rx="8" fill="#1a0a0a" stroke="#f87171" strokeWidth="1.5" />
            <text x="589" y="302" textAnchor="middle" fill="#f87171" fontSize="10" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">Access Denied</text>
            <text x="589" y="316" textAnchor="middle" fill="#f87171" fontSize="9" fontFamily="ui-sans-serif,sans-serif">403 Forbidden</text>

            {/* ── Dashboard (highlighted) ── */}
            <rect x="140" y="380" width="400" height="52" rx="10" fill="#0a2820" stroke="#2DD4BF" strokeWidth="2.5" />
            <text x="340" y="403" textAnchor="middle" fill="#2DD4BF" fontSize="13" fontWeight="800" fontFamily="ui-sans-serif,sans-serif">Super Admin Dashboard</text>
            <text x="340" y="421" textAnchor="middle" fill="#9AAEAE" fontSize="10" fontFamily="ui-sans-serif,sans-serif">Tenant Cockpit · Global Metrics · System Governance</text>

            {/* ── Branch lines from Dashboard to 4 Modules ── */}
            <line x1="340" y1="432" x2="340" y2="452" stroke="#2DD4BF" strokeWidth="1.5" />
            {/* Horizontal bus line across columns */}
            <line x1="85" y1="452" x2="595" y2="452" stroke="#2DD4BF" strokeWidth="1.5" />
            {/* 4 verticals to Level 1 module boxes */}
            <line x1="85"  y1="452" x2="85"  y2="476" stroke="#2DD4BF" strokeWidth="1.5" markerEnd="url(#wf-arr)" />
            <line x1="255" y1="452" x2="255" y2="476" stroke="#2DD4BF" strokeWidth="1.5" markerEnd="url(#wf-arr)" />
            <line x1="425" y1="452" x2="425" y2="476" stroke="#2DD4BF" strokeWidth="1.5" markerEnd="url(#wf-arr)" />
            <line x1="595" y1="452" x2="595" y2="476" stroke="#2DD4BF" strokeWidth="1.5" markerEnd="url(#wf-arr)" />

            {/* ════ LEVEL 1: MODULE HEADERS ════ */}
            {/* Col 1 */}
            <rect x="17"  y="476" width="136" height="44" rx="8" fill="#141D1E" stroke="#3A5050" strokeWidth="1.5" />
            <text x="85"  y="495" textAnchor="middle" fill="#F5FAFA" fontSize="10" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">Gym Tenant</text>
            <text x="85"  y="509" textAnchor="middle" fill="#9AAEAE" fontSize="9"  fontFamily="ui-sans-serif,sans-serif">Management</text>

            {/* Col 2 */}
            <rect x="187" y="476" width="136" height="44" rx="8" fill="#141D1E" stroke="#3A5050" strokeWidth="1.5" />
            <text x="255" y="495" textAnchor="middle" fill="#F5FAFA" fontSize="10" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">Subscription</text>
            <text x="255" y="509" textAnchor="middle" fill="#9AAEAE" fontSize="9"  fontFamily="ui-sans-serif,sans-serif">&amp; Billing</text>

            {/* Col 3 */}
            <rect x="357" y="476" width="136" height="44" rx="8" fill="#141D1E" stroke="#3A5050" strokeWidth="1.5" />
            <text x="425" y="495" textAnchor="middle" fill="#F5FAFA" fontSize="10" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">User &amp; Trainer</text>
            <text x="425" y="509" textAnchor="middle" fill="#9AAEAE" fontSize="9"  fontFamily="ui-sans-serif,sans-serif">Oversight</text>

            {/* Col 4 */}
            <rect x="527" y="476" width="136" height="44" rx="8" fill="#141D1E" stroke="#3A5050" strokeWidth="1.5" />
            <text x="595" y="495" textAnchor="middle" fill="#F5FAFA" fontSize="10" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">Security &amp;</text>
            <text x="595" y="509" textAnchor="middle" fill="#9AAEAE" fontSize="9"  fontFamily="ui-sans-serif,sans-serif">Governance</text>

            {/* Down arrows from Level 1 to Level 2 */}
            <line x1="85"  y1="520" x2="85"  y2="542" stroke="#2DD4BF" strokeWidth="1.5" markerEnd="url(#wf-arr)" />
            <line x1="255" y1="520" x2="255" y2="542" stroke="#2DD4BF" strokeWidth="1.5" markerEnd="url(#wf-arr)" />
            <line x1="425" y1="520" x2="425" y2="542" stroke="#2DD4BF" strokeWidth="1.5" markerEnd="url(#wf-arr)" />
            <line x1="595" y1="520" x2="595" y2="542" stroke="#2DD4BF" strokeWidth="1.5" markerEnd="url(#wf-arr)" />

            {/* ════ LEVEL 2: OPERATIONS ════ */}
            {/* Col 1 */}
            <rect x="17"  y="542" width="136" height="44" rx="8" fill="#141D1E" stroke="#3A5050" strokeWidth="1.5" />
            <text x="85"  y="561" textAnchor="middle" fill="#F5FAFA" fontSize="10" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">Review Gym</text>
            <text x="85"  y="574" textAnchor="middle" fill="#9AAEAE" fontSize="9"  fontFamily="ui-sans-serif,sans-serif">Applications</text>

            {/* Col 2 */}
            <rect x="187" y="542" width="136" height="44" rx="8" fill="#141D1E" stroke="#3A5050" strokeWidth="1.5" />
            <text x="255" y="561" textAnchor="middle" fill="#F5FAFA" fontSize="10" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">Manage Plans</text>
            <text x="255" y="574" textAnchor="middle" fill="#9AAEAE" fontSize="9"  fontFamily="ui-sans-serif,sans-serif">&amp; Pricing Tiers</text>

            {/* Col 3 */}
            <rect x="357" y="542" width="136" height="44" rx="8" fill="#141D1E" stroke="#3A5050" strokeWidth="1.5" />
            <text x="425" y="561" textAnchor="middle" fill="#F5FAFA" fontSize="10" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">Verify Trainers</text>
            <text x="425" y="574" textAnchor="middle" fill="#9AAEAE" fontSize="9"  fontFamily="ui-sans-serif,sans-serif">&amp; Credentials</text>

            {/* Col 4 */}
            <rect x="527" y="542" width="136" height="44" rx="8" fill="#141D1E" stroke="#3A5050" strokeWidth="1.5" />
            <text x="595" y="561" textAnchor="middle" fill="#F5FAFA" fontSize="10" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">Monitor Threats</text>
            <text x="595" y="574" textAnchor="middle" fill="#9AAEAE" fontSize="9"  fontFamily="ui-sans-serif,sans-serif">&amp; Active Sessions</text>

            {/* Down arrows from Level 2 to Level 3 */}
            <line x1="85"  y1="586" x2="85"  y2="608" stroke="#2DD4BF" strokeWidth="1.5" markerEnd="url(#wf-arr)" />
            <line x1="255" y1="586" x2="255" y2="608" stroke="#2DD4BF" strokeWidth="1.5" markerEnd="url(#wf-arr)" />
            <line x1="425" y1="586" x2="425" y2="608" stroke="#2DD4BF" strokeWidth="1.5" markerEnd="url(#wf-arr)" />
            <line x1="595" y1="586" x2="595" y2="608" stroke="#2DD4BF" strokeWidth="1.5" markerEnd="url(#wf-arr)" />

            {/* ════ LEVEL 3: DECISION & INTERMEDIATE ════ */}
            {/* Col 1: Decision Diamond inside column (x: 17..153) */}
            <polygon points="85,608 135,631 85,654 35,631" fill="#1B2728" stroke="#2DD4BF" strokeWidth="1.5" />
            <text x="85" y="628" textAnchor="middle" fill="#2DD4BF" fontSize="9" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">Approve</text>
            <text x="85" y="640" textAnchor="middle" fill="#2DD4BF" fontSize="9" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">Gym?</text>

            {/* Col 2 */}
            <rect x="187" y="608" width="136" height="46" rx="8" fill="#141D1E" stroke="#3A5050" strokeWidth="1.5" />
            <text x="255" y="627" textAnchor="middle" fill="#F5FAFA" fontSize="10" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">Invoicing &amp;</text>
            <text x="255" y="641" textAnchor="middle" fill="#9AAEAE" fontSize="9"  fontFamily="ui-sans-serif,sans-serif">Payment Gateways</text>

            {/* Col 3 */}
            <rect x="357" y="608" width="136" height="46" rx="8" fill="#141D1E" stroke="#3A5050" strokeWidth="1.5" />
            <text x="425" y="627" textAnchor="middle" fill="#F5FAFA" fontSize="10" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">Member Quotas</text>
            <text x="425" y="641" textAnchor="middle" fill="#9AAEAE" fontSize="9"  fontFamily="ui-sans-serif,sans-serif">&amp; Permissions</text>

            {/* Col 4 */}
            <rect x="527" y="608" width="136" height="46" rx="8" fill="#141D1E" stroke="#3A5050" strokeWidth="1.5" />
            <text x="595" y="627" textAnchor="middle" fill="#F5FAFA" fontSize="10" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">Immutable</text>
            <text x="595" y="641" textAnchor="middle" fill="#9AAEAE" fontSize="9"  fontFamily="ui-sans-serif,sans-serif">Audit Logs</text>

            {/* Arrows from Level 3 to Level 4 */}
            {/* Col 1 Branching from Diamond: NO goes left to Rejected, YES goes right to Approved */}
            <path d="M 35,631 H 49 V 678" stroke="#f87171" strokeWidth="1.5" fill="none" markerEnd="url(#wf-arrR)" />
            <text x="32" y="624" fill="#f87171" fontSize="9" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">NO</text>

            <path d="M 135,631 H 121 V 678" stroke="#4ade80" strokeWidth="1.5" fill="none" markerEnd="url(#wf-arrG)" />
            <text x="135" y="624" fill="#4ade80" fontSize="9" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">YES</text>

            {/* Cols 2, 3, 4 Down Arrows */}
            <line x1="255" y1="654" x2="255" y2="678" stroke="#2DD4BF" strokeWidth="1.5" markerEnd="url(#wf-arr)" />
            <line x1="425" y1="654" x2="425" y2="678" stroke="#2DD4BF" strokeWidth="1.5" markerEnd="url(#wf-arr)" />
            <line x1="595" y1="654" x2="595" y2="678" stroke="#2DD4BF" strokeWidth="1.5" markerEnd="url(#wf-arr)" />

            {/* ════ LEVEL 4: EXECUTION / METRICS ════ */}
            {/* Col 1: Left = Rejected, Right = Activated (both inside x: 17..153) */}
            <rect x="17" y="678" width="64" height="44" rx="7" fill="#1a0707" stroke="#f87171" strokeWidth="1.5" />
            <text x="49" y="697" textAnchor="middle" fill="#f87171" fontSize="9" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">Rejected</text>
            <text x="49" y="709" textAnchor="middle" fill="#9AAEAE" fontSize="8" fontFamily="ui-sans-serif,sans-serif">Suspended</text>

            <rect x="89" y="678" width="64" height="44" rx="7" fill="#071a07" stroke="#4ade80" strokeWidth="1.5" />
            <text x="121" y="697" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">Approved</text>
            <text x="121" y="709" textAnchor="middle" fill="#9AAEAE" fontSize="8" fontFamily="ui-sans-serif,sans-serif">Activated</text>

            {/* Col 2 */}
            <rect x="187" y="678" width="136" height="44" rx="8" fill="#141D1E" stroke="#3A5050" strokeWidth="1.5" />
            <text x="255" y="697" textAnchor="middle" fill="#F5FAFA" fontSize="10" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">Revenue &amp; MRR</text>
            <text x="255" y="710" textAnchor="middle" fill="#9AAEAE" fontSize="9"  fontFamily="ui-sans-serif,sans-serif">Growth Analytics</text>

            {/* Col 3 */}
            <rect x="357" y="678" width="136" height="44" rx="8" fill="#141D1E" stroke="#3A5050" strokeWidth="1.5" />
            <text x="425" y="697" textAnchor="middle" fill="#F5FAFA" fontSize="10" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">Member Activity</text>
            <text x="425" y="710" textAnchor="middle" fill="#9AAEAE" fontSize="9"  fontFamily="ui-sans-serif,sans-serif">&amp; Retention</text>

            {/* Col 4 */}
            <rect x="527" y="678" width="136" height="44" rx="8" fill="#141D1E" stroke="#3A5050" strokeWidth="1.5" />
            <text x="595" y="697" textAnchor="middle" fill="#F5FAFA" fontSize="10" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">Platform Uptime</text>
            <text x="595" y="710" textAnchor="middle" fill="#9AAEAE" fontSize="9"  fontFamily="ui-sans-serif,sans-serif">&amp; Health Monitor</text>

            {/* ════ BOTTOM MERGE & END ════ */}
            {/* Verticals dropping from each column outcome */}
            <line x1="49"  y1="722" x2="49"  y2="750" stroke="#f87171" strokeWidth="1" />
            <line x1="121" y1="722" x2="121" y2="750" stroke="#4ade80" strokeWidth="1" />
            <line x1="255" y1="722" x2="255" y2="750" stroke="#2DD4BF" strokeWidth="1" />
            <line x1="425" y1="722" x2="425" y2="750" stroke="#2DD4BF" strokeWidth="1" />
            <line x1="595" y1="722" x2="595" y2="750" stroke="#2DD4BF" strokeWidth="1" />

            {/* Horizontal bus line at y=750 */}
            <line x1="49" y1="750" x2="595" y2="750" stroke="#2DD4BF" strokeWidth="1.5" />

            {/* Central pointer down to END */}
            <line x1="340" y1="750" x2="340" y2="770" stroke="#2DD4BF" strokeWidth="1.5" markerEnd="url(#wf-arr)" />

            {/* END Oval */}
            <ellipse cx="340" cy="792" rx="96" ry="22" fill="#0a2820" stroke="#2DD4BF" strokeWidth="2" />
            <text x="340" y="797" textAnchor="middle" fill="#2DD4BF" fontSize="12" fontWeight="800" fontFamily="ui-sans-serif,sans-serif">PLATFORM MANAGED</text>
          </svg>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 flex items-center justify-between px-5 py-4 bg-[#0E1415] border-t border-[#2A3A3A]">
          <p className="text-xs text-[#6A7F7F]">Restricted to authorized Gymora Super Administrators only.</p>
          <Link
            to="/login?portal=super-admin"
            className="flex items-center gap-2 px-4 py-2 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold text-sm rounded-xl transition-all"
            onClick={() => setShowWorkflow(false)}
          >
            <Lock size={14} /> Super Admin Login
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080B0C] text-[#F5FAFA] selection:bg-[#2DD4BF] selection:text-[#06201D] font-sans">
      {showWorkflow && <WorkflowModal />}
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
              <span>Back</span>
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
      <header className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#2DD4BF]/12 via-[#080B0C]/0 to-[#080B0C]/0 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141D1E] border border-[#2A3A3A] text-xs font-medium text-[#2DD4BF] mb-6">
              <ShieldCheck size={14} />
              <span>Platform Infrastructure & Global Governance Cockpit</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6 leading-tight text-[#F5FAFA]">
              Centralized Platform Control & <br className="hidden sm:block" />
              <span className="text-[#2DD4BF]">Multi-Tenant SaaS Administration</span>
            </h1>

            <p className="text-base sm:text-lg text-[#9AAEAE] max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              The authorized administrative cockpit for managing gym ecosystems, global subscriptions, tenant security, facility verification, and platform financials across all regions.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8">
              <Link
                to="/login?portal=super-admin"
                className="w-full sm:w-auto px-7 py-3.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30"
              >
                <span>Super Admin Secure Login</span>
                <ChevronRight size={18} />
              </Link>
              <Link
                to="/"
                className="w-full sm:w-auto px-7 py-3.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30"
              >
                <ArrowLeft size={16} />
                <span>Return to Public Home</span>
              </Link>
            </div>

            {/* Live Platform Health Bar */}
            <div className="w-full bg-[#141D1E]/90 border border-[#2A3A3A] rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Activity size={18} />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#9AAEAE]">Platform Uptime</div>
                  <div className="text-xs sm:text-sm font-bold text-[#F5FAFA]">99.98% Healthy</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 text-[#2DD4BF] flex items-center justify-center shrink-0">
                  <Database size={18} />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#9AAEAE]">Data Isolation</div>
                  <div className="text-xs sm:text-sm font-bold text-[#F5FAFA]">100% Multi-Tenant</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 text-[#2DD4BF] flex items-center justify-center shrink-0">
                  <Globe2 size={18} />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#9AAEAE]">Gateway Latency</div>
                  <div className="text-xs sm:text-sm font-bold text-[#F5FAFA]">14ms Global Edge</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#9AAEAE]">Security Posture</div>
                  <div className="text-xs sm:text-sm font-bold text-[#F5FAFA]">SOC2 &amp; ISO Ready</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Video Container: Super Admin Video */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-[#2A3A3A] shadow-2xl shadow-black bg-[#141D1E] group">
              <video
                src="/videos/superadmin.mp4"
                autoPlay
                loop
                muted
                playsInline
                controls
                className="w-full h-[360px] sm:h-[460px] object-cover object-center block"
              />
              <div className="absolute top-4 right-4 bg-[#0E1415]/90 border border-[#2A3A3A] backdrop-blur-md rounded-xl px-3 py-1.5 shadow-xl pointer-events-none">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2DD4BF]">
                  <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse"></span>
                  <span>Super Admin Platform</span>
                </div>
              </div>
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

              <button
                onClick={() => setShowWorkflow(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2DD4BF] text-[#06201D] font-bold text-sm hover:bg-[#5EEAD4] transition-all shadow-md shadow-teal-500/20"
              >
                <GitBranch size={16} />
                <span>View Admin Workflow</span>
                <ChevronRight size={16} />
              </button>
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
            <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-3xl p-6 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center">
                    <Building2 size={24} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    12 Pending Review
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5FAFA] mb-2">
                  Gym Onboarding &amp; Verification
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
              <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-xs font-semibold text-[#2DD4BF]">
                <span>Gym Onboarding &amp; Verification</span>
                <CheckCircle2 size={15} className="text-emerald-400" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-3xl p-6 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center">
                    <CreditCard size={24} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20">
                    3 SaaS Tiers Active
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5FAFA] mb-2">
                  Subscription &amp; Tier Management
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
              <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-xs font-semibold text-[#2DD4BF]">
                <span>Manage Subscriptions</span>
                <CheckCircle2 size={15} className="text-emerald-400" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-3xl p-6 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center">
                    <TrendingUp size={24} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    +28.4% MoM
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5FAFA] mb-2">
                  Global Analytics &amp; Reporting
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
              <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-xs font-semibold text-[#2DD4BF]">
                <span>Open Analytics Cockpit</span>
                <CheckCircle2 size={15} className="text-emerald-400" />
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-3xl p-6 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center">
                    <Users size={24} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20">
                    4,850+ Accounts
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5FAFA] mb-2">
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
              <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-xs font-semibold text-[#2DD4BF]">
                <span>Manage User Directory</span>
                <CheckCircle2 size={15} className="text-emerald-400" />
              </div>
            </div>

            {/* Card 5 */}
            <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-3xl p-6 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center">
                    <Lock size={24} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    AES-256 Active
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5FAFA] mb-2">
                  Security &amp; Isolation
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
              <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-xs font-semibold text-[#2DD4BF]">
                <span>Configure Security</span>
                <CheckCircle2 size={15} className="text-emerald-400" />
              </div>
            </div>

            {/* Card 6 */}
            <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-3xl p-6 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center">
                    <Server size={24} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20">
                    Auto-Settlement Live
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5FAFA] mb-2">
                  Platform Infrastructure &amp; Payouts
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
              <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-xs font-semibold text-[#2DD4BF]">
                <span>Manage Payouts &amp; System</span>
                <CheckCircle2 size={15} className="text-emerald-400" />
              </div>
            </div>
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
      <footer id="footer" className="border-t border-[#2A3A3A] bg-[#0E1415] py-10 text-xs text-[#9AAEAE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          {/* Top row: copyright + portal nav */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-center sm:text-left">
              © {new Date().getFullYear()} Gymora Platform Administration. All rights reserved.
            </p>
            {/* Portal Navigation Links */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              <span className="text-[#2DD4BF] font-semibold uppercase tracking-wider hidden sm:block">Portals:</span>
              <Link to="/" className="hover:text-[#2DD4BF] transition-colors">Main Website</Link>
              <span className="text-[#2A3A3A]">|</span>
              <Link to="/portal/gym-owner" className="hover:text-[#2DD4BF] transition-colors">Gym Owner Portal</Link>
            </div>
          </div>

          {/* Bottom row: support & legal links */}
          <div className="border-t border-[#2A3A3A] pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[#6A7F7F] text-[11px] text-center sm:text-left">
              This portal is restricted to authorized Gymora Super Administrators only.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              <span className="text-[#2DD4BF] font-semibold uppercase tracking-wider hidden sm:block">Support & Legal:</span>
              <Link to="/contact" state={{ from: '/portal/super-admin#footer', fromLabel: 'Back to Super Admin Portal' }} className="hover:text-[#2DD4BF] transition-colors">Help & Support</Link>
              <span className="text-[#2A3A3A]">|</span>
              <Link to="/privacy-policy" state={{ from: '/portal/super-admin#footer', fromLabel: 'Back to Super Admin Portal' }} className="hover:text-[#2DD4BF] transition-colors">Privacy Policy</Link>
              <span className="text-[#2A3A3A]">|</span>
              <Link to="/terms-of-service" state={{ from: '/portal/super-admin#footer', fromLabel: 'Back to Super Admin Portal' }} className="hover:text-[#2DD4BF] transition-colors">Terms & Conditions</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SuperAdminPortalLanding;
