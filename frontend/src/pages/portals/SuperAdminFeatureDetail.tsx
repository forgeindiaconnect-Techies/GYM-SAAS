import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  CreditCard,
  TrendingUp,
  Users,
  ShieldCheck,
  Server,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Activity,
  Layers,
  Database,
  Lock,
  Zap,
  BarChart3,
  DollarSign,
  FileText,
  Clock,
  ShieldAlert,
  Cpu,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Check,
  X,
  AlertTriangle,
  Send,
  Download,
  Calendar,
  ToggleLeft,
  ToggleRight,
  ChevronRight
} from 'lucide-react';

interface FlowStep {
  step: string;
  title: string;
  desc: string;
  badge?: string;
  actor: 'Super Admin' | 'Gym Owner' | 'Platform AI' | 'Banking Gateway';
  output: string;
}

export default function SuperAdminFeatureDetail() {
  const { featureId } = useParams<{ featureId: string }>();
  const navigate = useNavigate();

  // Active module key
  const activeKey = featureId && ['approvals', 'subscriptions', 'analytics', 'users', 'security', 'payouts'].includes(featureId)
    ? featureId
    : 'subscriptions';

  const allModules = [
    { id: 'subscriptions', label: 'Manage Subscriptions', icon: CreditCard, subtitle: 'SaaS Tiers, Billing Cycles & MRR Engine' },
    { id: 'approvals', label: 'Gym Onboarding & Verification', icon: Building2, subtitle: 'Gym Verification, KYC & Licenses' },
    { id: 'analytics', label: 'Analytics Cockpit', icon: TrendingUp, subtitle: 'Macro Platform GMV & Churn Heatmaps' },
    { id: 'users', label: 'User Directory', icon: Users, subtitle: 'Multi-Role Governance & Identity' },
    { id: 'security', label: 'Configure Security', icon: ShieldCheck, subtitle: 'Zero-Trust Isolation & Audit Trails' },
    { id: 'payouts', label: 'Payouts & System', icon: Server, subtitle: 'Marketplace Settlements & Gateway Health' }
  ];

  // ----------------------------------------------------
  // Interactive Mock Data & States for Each Module
  // ----------------------------------------------------

  // Subscriptions Module State
  const [subSearch, setSubSearch] = useState('');
  const [subFilter, setSubFilter] = useState('All');
  const [subscribers, setSubscribers] = useState([
    { id: '1', gymName: 'IronPeak Fitness Club', owner: 'Vikram Malhotra', plan: 'Enterprise', cycle: 'Annual', mrr: 9999, nextBilling: '2026-11-15', status: 'Active' },
    { id: '2', gymName: 'Pulse Cardio & CrossFit', owner: 'Sneha Reddy', plan: 'Professional', cycle: 'Monthly', mrr: 4999, nextBilling: '2026-11-02', status: 'Active' },
    { id: '3', gymName: 'Titan Strength Gym', owner: 'Rahul Sharma', plan: 'Starter', cycle: 'Monthly', mrr: 2499, nextBilling: '2026-10-29', status: 'Active' },
    { id: '4', gymName: 'Zenith Health & Yoga Box', owner: 'Ananya Roy', plan: 'Professional', cycle: 'Annual', mrr: 4999, nextBilling: '2026-12-10', status: 'Active' },
    { id: '5', gymName: 'Gold Standard Gym', owner: 'Karan Mehra', plan: 'Starter', cycle: 'Monthly', mrr: 2499, nextBilling: '2026-10-28', status: 'Past Due' }
  ]);

  // Gym Onboarding & Verification Module State
  const [approvalTab, setApprovalTab] = useState('Pending');
  const [approvalSearch, setApprovalSearch] = useState('');
  const [selectedGymApp, setSelectedGymApp] = useState<any | null>(null);
  const [gymApplications, setGymApplications] = useState([
    { id: 'g1', name: 'Apex Elite Gym & Spa', owner: 'Arjun Verma', email: 'arjun@apexelite.in', phone: '+91 98765 43210', city: 'Bangalore, KA', area: '12,500 sq ft', capacity: 450, appliedDate: '2026-10-25', licenseId: 'GYM-LIC-2026-8812', docs: ['Trade License', 'Fire Safety NOC', 'GSTIN Reg', 'Biometric Turnstiles'], status: 'Pending' },
    { id: 'g2', name: 'FlexCore Fitness Center', owner: 'Pooja Hegde', email: 'pooja@flexcore.com', phone: '+91 98450 11223', city: 'Mumbai, MH', area: '8,200 sq ft', capacity: 300, appliedDate: '2026-10-24', licenseId: 'GYM-LIC-2026-8813', docs: ['Trade License', 'GSTIN Reg', 'Equipment Safety Audit'], status: 'Pending' },
    { id: 'g3', name: 'Titan Strength Club', owner: 'Vikram Choudhary', email: 'vikram@titanstrength.in', phone: '+91 99100 88776', city: 'Delhi, NCR', area: '15,000 sq ft', capacity: 600, appliedDate: '2026-10-23', licenseId: 'GYM-LIC-2026-8814', docs: ['Trade License', 'Fire Safety NOC', 'GSTIN Reg'], status: 'Pending' },
    { id: 'g4', name: 'Spartan Strength Lab', owner: 'Devendra Patel', email: 'dev@spartanlab.com', phone: '+91 97230 44556', city: 'Ahmedabad, GJ', area: '10,000 sq ft', capacity: 350, appliedDate: '2026-10-22', licenseId: 'GYM-LIC-2026-8799', docs: ['Trade License', 'Fire NOC', 'Equipment Safety', 'GSTIN Reg'], status: 'Approved' },
    { id: 'g5', name: 'Pulse Cardio & CrossFit', owner: 'Sneha Reddy', email: 'sneha@pulsefit.in', phone: '+91 98840 99887', city: 'Hyderabad, TS', area: '9,500 sq ft', capacity: 280, appliedDate: '2026-10-21', licenseId: 'GYM-LIC-2026-8785', docs: ['Trade License', 'Fire NOC', 'Biometric Turnstiles'], status: 'Approved' },
    { id: 'g6', name: 'Urban Pulse Studio', owner: 'Rohit Joshi', email: 'rohit@urbanpulse.in', phone: '+91 98220 33445', city: 'Pune, MH', area: '6,000 sq ft', capacity: 150, appliedDate: '2026-10-20', licenseId: 'GYM-LIC-2026-8761', docs: ['Trade License (Expired)'], status: 'Rejected' }
  ]);

  // User Directory State
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [usersList, setUsersList] = useState([
    { id: 'u1', name: 'Vikram Malhotra', email: 'vikram@ironpeak.com', role: 'GYM_OWNER', gym: 'IronPeak Fitness', status: 'Active' },
    { id: 'u2', name: 'Kabir Singhania', email: 'kabir@titanpt.com', role: 'TRAINER', gym: 'Titan Strength', status: 'Active' },
    { id: 'u3', name: 'Aarav Gupta', email: 'aarav.g@gmail.com', role: 'MEMBER', gym: 'Pulse Cardio', status: 'Active' },
    { id: 'u4', name: 'Sneha Reddy', email: 'sneha@pulsefitness.com', role: 'GYM_OWNER', gym: 'Pulse Cardio', status: 'Active' },
    { id: 'u5', name: 'Rohan Mehra', email: 'rohan.pt@gmail.com', role: 'TRAINER', gym: 'IronPeak Fitness', status: 'Suspended' }
  ]);

  // Security Toggles State
  const [securitySettings, setSecuritySettings] = useState({
    multiTenantIsolation: true,
    twoFactorEnforced: true,
    aesEncryption: true,
    rateLimitingShield: true,
    sessionExpiryRevoke: true,
    immutableAuditLogs: true
  });

  // Payouts State
  const [payoutsList, setPayoutsList] = useState([
    { id: 'p1', gym: 'IronPeak Fitness', amount: 84500, bank: 'HDFC Bank (****4912)', ifsc: 'HDFC0001234', date: '2026-10-26', status: 'Ready' },
    { id: 'p2', gym: 'Pulse Cardio Club', amount: 42100, bank: 'ICICI Bank (****8291)', ifsc: 'ICIC0000456', date: '2026-10-26', status: 'Ready' },
    { id: 'p3', gym: 'Titan Strength Gym', amount: 29800, bank: 'Axis Bank (****3301)', ifsc: 'UTIB0000789', date: '2026-10-25', status: 'Completed' },
    { id: 'p4', gym: 'Zenith Health Studio', amount: 56700, bank: 'SBI Bank (****1902)', ifsc: 'SBIN0004521', date: '2026-10-24', status: 'Completed' }
  ]);

  // Handler Helpers
  const handleApproveGym = (gymId: string) => {
    setGymApplications(prev => prev.map(g => g.id === gymId ? { ...g, status: 'Approved' } : g));
    alert('Gym application verified & approved! Tenant partition provisioned and listed on Marketplace.');
    setSelectedGymApp(null);
  };

  const handleRejectGym = (gymId: string) => {
    setGymApplications(prev => prev.map(g => g.id === gymId ? { ...g, status: 'Rejected' } : g));
    alert('Gym application marked as Rejected. Rejection reason notification sent to applicant.');
    setSelectedGymApp(null);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
        alert(`Account ${u.name} is now ${nextStatus}.`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleDispatchPayout = (payoutId: string) => {
    setPayoutsList(prev => prev.map(p => {
      if (p.id === payoutId) {
        alert(`Payout of ₹${p.amount.toLocaleString()} dispatched via IMPS. Bank UTR: UTR${Math.floor(1000000000 + Math.random() * 9000000000)} generated.`);
        return { ...p, status: 'Completed' };
      }
      return p;
    }));
  };

  // ----------------------------------------------------
  // FLOWCHART DATA PER MODULE
  // ----------------------------------------------------
  const FLOWCHARTS: Record<string, { title: string; subtitle: string; steps: FlowStep[] }> = {
    subscriptions: {
      title: 'SaaS Subscription Lifecycle & Recurring Invoicing Flow',
      subtitle: 'Architectural sequence driving SaaS plan selection, gateway tokenization, recurring auto-debit, and dunning recovery',
      steps: [
        {
          step: '01',
          title: 'SaaS Plan Configuration',
          desc: 'Super Admin sets Starter, Pro, and Enterprise pricing tiers with member, trainer, and branch quota allowances.',
          actor: 'Super Admin',
          badge: 'Setup',
          output: 'Tiers Defined in Database'
        },
        {
          step: '02',
          title: 'Gym Owner Checkout & Mandate Tokenization',
          desc: 'Owner registers payment method. Razorpay / Stripe tokenizes the recurring credit card or UPI autopay mandate.',
          actor: 'Gym Owner',
          badge: 'Payment',
          output: 'Tokenized Recurring Mandate'
        },
        {
          step: '03',
          title: 'Instant SaaS Entitlements Provisioning',
          desc: 'Multi-tenant feature flags (POS Store, Multi-branch, AI Assistant, SMS credits) activate dynamically on tenant dashboard.',
          actor: 'Platform AI',
          badge: 'Entitlements',
          output: 'SaaS Features Unlocked'
        },
        {
          step: '04',
          title: 'Automated Billing & Tax Invoice Generation',
          desc: 'System auto-debits renewal on due date, generates B2B tax invoice with 18% GST breakup, and emails PDF receipt.',
          actor: 'Banking Gateway',
          badge: 'Billing',
          output: 'GST Tax Invoice Dispatched'
        },
        {
          step: '05',
          title: 'Smart Dunning & Payment Failure Retry',
          desc: 'If renewal card fails, smart dunning triggers retry at T+1, T+3, and T+5 days with WhatsApp payment reminder.',
          actor: 'Platform AI',
          badge: 'Recovery',
          output: 'Dunning Message & Grace Period'
        },
        {
          step: '06',
          title: 'Enterprise Upgrades & Custom Contracts',
          desc: 'High-growth multi-location chains upgrade seamlessly to bespoke enterprise terms with consolidated billing.',
          actor: 'Super Admin',
          badge: 'Expansion',
          output: 'Contract Scale & MRR Increase'
        }
      ]
    },
    approvals: {
      title: 'Gym Onboarding, Document Audit & License Issuance Flow',
      subtitle: 'Verification pipeline ensuring only legally compliant, inspected fitness clubs join the Gymora network',
      steps: [
        {
          step: '01',
          title: 'Registration & Document Intake',
          desc: 'Applicant submits gym profile, uploading Trade License, GSTIN certificate, Fire Safety NOC, and gym floor photos.',
          actor: 'Gym Owner',
          badge: 'Submission',
          output: 'Application Dossier'
        },
        {
          step: '02',
          title: 'Automated Tax ID & GSTIN Cross-Check',
          desc: 'Platform bot validates legal business registration and GSTIN validity against public regulatory records.',
          actor: 'Platform AI',
          badge: 'Auto KYC',
          output: 'Business Identity Verified'
        },
        {
          step: '03',
          title: 'Super Admin Visual Facility Audit',
          desc: 'Compliance officers review facility photos, square footage, equipment safety disclosures, and emergency exits.',
          actor: 'Super Admin',
          badge: 'Audit Desk',
          output: 'Risk Assessment Scorecard'
        },
        {
          step: '04',
          title: 'Approval Decision & License Gating',
          desc: 'Super Admin confirms license approval or issues itemized correction notice specifying defective documents.',
          actor: 'Super Admin',
          badge: 'Decision',
          output: 'License Token: Approved'
        },
        {
          step: '05',
          title: 'Tenant Database Schema Provisioning',
          desc: 'System provisions secure multi-tenant cloud workspace, pre-loads exercise libraries, and creates branch credentials.',
          actor: 'Platform AI',
          badge: 'Provisioning',
          output: 'Live Tenant Partition'
        },
        {
          step: '06',
          title: 'Marketplace Publication & Verified Badge',
          desc: 'Gym is published to the public marketplace with an authenticated verified checkmark to attract athletes.',
          actor: 'Platform AI',
          badge: 'Marketplace',
          output: 'Public Listing Active'
        }
      ]
    },
    analytics: {
      title: 'Platform Telemetry, GMV Aggregation & Growth Intelligence Flow',
      subtitle: 'Macro data stream aggregating transactional volume and churn indicators across all registered clubs',
      steps: [
        {
          step: '01',
          title: 'Cross-Tenant Telemetry Ingestion',
          desc: 'Real-time telemetry captures membership purchases, turnstile scans, POS store sales, and trainer sessions.',
          actor: 'Platform AI',
          badge: 'Ingestion',
          output: 'Real-Time Event Stream'
        },
        {
          step: '02',
          title: 'Platform GMV Aggregation',
          desc: 'Calculates Gross Merchandise Volume (GMV) across all gyms, detailing cash, cards, and UPI split velocity.',
          actor: 'Platform AI',
          badge: 'GMV Metrics',
          output: 'Consolidated GMV Figures'
        },
        {
          step: '03',
          title: 'Churn Radar & Inactivity Detection',
          desc: 'Machine learning flags clubs experiencing declining member check-in trends or slow renewals before churn occurs.',
          actor: 'Platform AI',
          badge: 'Churn Radar',
          output: 'At-Risk Tenant Alerts'
        },
        {
          step: '04',
          title: 'SaaS Net Revenue Retention (NRR)',
          desc: 'Tracks revenue expansion from existing gyms upgrading plans, adding store add-ons, or purchasing trainer seats.',
          actor: 'Super Admin',
          badge: 'NRR Analytics',
          output: 'Net Retention % Score'
        },
        {
          step: '05',
          title: 'City-Level Density Benchmarking',
          desc: 'Visualizes high-performing fitness markets (Bangalore, Mumbai, Delhi) to prioritize outbound sales expansion.',
          actor: 'Super Admin',
          badge: 'Geographic',
          output: 'Territory Heatmap'
        },
        {
          step: '06',
          title: 'Audited Financial Statement Export',
          desc: 'Export institution-grade financial ledgers, balance sheets, and MRR waterfall statements in PDF and CSV format.',
          actor: 'Super Admin',
          badge: 'Financials',
          output: 'Audited Executive Pack'
        }
      ]
    },
    users: {
      title: 'Global Identity Governance, Role Binding & Access Control Flow',
      subtitle: 'Centralized administration across gym owners, branch managers, trainers, and enrolled gym members',
      steps: [
        {
          step: '01',
          title: 'Global Account Registration & Indexing',
          desc: 'Every account created on the platform is assigned a universal identity record with verified phone and email.',
          actor: 'Platform AI',
          badge: 'Identity',
          output: 'User Directory Entry'
        },
        {
          step: '02',
          title: 'Role-Based Access Control (RBAC) Binding',
          desc: 'User is assigned strict cryptographic JWT roles: SUPER_ADMIN, GYM_OWNER, GYM_MANAGER, TRAINER, or MEMBER.',
          actor: 'Super Admin',
          badge: 'RBAC',
          output: 'Cryptographic Auth Token'
        },
        {
          step: '03',
          title: 'Multi-Tenant Partition Boundary Mapping',
          desc: 'User session queries are strictly restricted to their authorized gymId and branchId partition boundaries.',
          actor: 'Platform AI',
          badge: 'Partitioning',
          output: 'Scope Enforcement'
        },
        {
          step: '04',
          title: 'Super Admin Status Governance',
          desc: 'Super Admin inspects activity history, verifies credentials, and manages Active, Suspended, or Deleted states.',
          actor: 'Super Admin',
          badge: 'Governance',
          output: 'Account Status Updated'
        },
        {
          step: '05',
          title: '1-Click Account Suspension & Token Revocation',
          desc: 'Suspension immediately terminates all active browser sessions and invalidates refresh tokens for security.',
          actor: 'Super Admin',
          badge: 'Security Lock',
          output: 'Active Sessions Killed'
        },
        {
          step: '06',
          title: 'GDPR Data Portability & Erasure Compliance',
          desc: 'Handles customer data export requests and Right-to-be-Forgotten anonymization with certified audit records.',
          actor: 'Super Admin',
          badge: 'Privacy',
          output: 'Encrypted Export / Purge'
        }
      ]
    },
    security: {
      title: 'Zero-Trust Isolation, Encryption & Audit Trail Flow',
      subtitle: 'Multi-layered defense ensuring zero cross-tenant data leakage and complete tamper-proof accountability',
      steps: [
        {
          step: '01',
          title: 'TLS 1.3 Edge Proxy Handshake',
          desc: 'All incoming web and mobile traffic connects via TLS 1.3 cryptographic protocols with HSTS security headers.',
          actor: 'Platform AI',
          badge: 'Edge Gateway',
          output: 'Encrypted Transport Tunnel'
        },
        {
          step: '02',
          title: 'JWT Signature & Expiration Validation',
          desc: 'Gateway middleware validates JWT cryptographic signature, expiration time, and role claims on every request.',
          actor: 'Platform AI',
          badge: 'Auth Guard',
          output: 'Verified Request Context'
        },
        {
          step: '03',
          title: 'Strict Multi-Tenant Database Isolation',
          desc: 'Queries dynamically bind `gymId: req.user.gymId`. Cross-tenant queries without valid authorization fail instantly.',
          actor: 'Platform AI',
          badge: 'Tenant Guard',
          output: 'Tenant Isolation Maintained'
        },
        {
          step: '04',
          title: 'AES-256 Field-Level Encryption at Rest',
          desc: 'Passwords (bcrypt cost 12), customer phone numbers, and financial bank credentials are encrypted at rest.',
          actor: 'Platform AI',
          badge: 'Encryption',
          output: 'Encrypted Database Fields'
        },
        {
          step: '05',
          title: 'Immutable Administrative Audit Logging',
          desc: 'All critical administrative events (tier changes, fee refunds, user role adjustments) are logged with IP stamps.',
          actor: 'Super Admin',
          badge: 'Audit Trail',
          output: 'Tamper-Proof Audit Row'
        },
        {
          step: '06',
          title: 'Automated Rate Limiting & Threat Shield',
          desc: 'Brute-force login attempts, scraping bots, and abnormal API bursts are automatically choked and blocked.',
          actor: 'Platform AI',
          badge: 'Threat Shield',
          output: 'Malicious IP Address Banned'
        }
      ]
    },
    payouts: {
      title: 'Marketplace Settlements, Gateway Webhooks & Infrastructure Flow',
      subtitle: 'Automated distribution pipeline dispatching marketplace booking collections directly to gym owner bank accounts',
      steps: [
        {
          step: '01',
          title: 'Marketplace Booking & Escrow Collection',
          desc: 'Athletes purchase gym memberships or session passes on Gymora Marketplace. Funds are collected into secure escrow.',
          actor: 'Banking Gateway',
          badge: 'Escrow',
          output: 'Escrow Fund Staged'
        },
        {
          step: '02',
          title: 'Platform Commission & Gateway Fee Split',
          desc: 'System dynamically deducts marketplace platform commission (5%) and gateway fee (2%) to calculate net gym balance.',
          actor: 'Platform AI',
          badge: 'Fee Split',
          output: 'Net Payout Balance Computed'
        },
        {
          step: '03',
          title: 'Settlement Holding Window & Fraud Check',
          desc: 'Transaction clears standard T+1 holding window to guarantee zero customer chargebacks or disputed payments.',
          actor: 'Platform AI',
          badge: 'Hold Window',
          output: 'Cleared for Bank Dispatch'
        },
        {
          step: '04',
          title: 'Direct Bank Account Payout Dispatch',
          desc: 'Automated Razorpay Route / Stripe Connect transfer dispatches net funds directly to gym owner verified bank account.',
          actor: 'Banking Gateway',
          badge: 'IMPS/NEFT',
          output: 'Bank UTR Generated'
        },
        {
          step: '05',
          title: 'Gateway Webhook Event Reconciliation',
          desc: 'Webhook listener verifies settlement completion (`payout.processed`), updating financial ledgers instantly.',
          actor: 'Platform AI',
          badge: 'Webhooks',
          output: 'Payout Marked: Completed'
        },
        {
          step: '06',
          title: 'System Telemetry & Cron Health Audit',
          desc: 'Real-time telemetry checks database pool connection, email queue delivery, Redis caching, and memory utilization.',
          actor: 'Super Admin',
          badge: 'Infrastructure',
          output: 'System Health: 100% Operational'
        }
      ]
    }
  };

  const currentFlow = FLOWCHARTS[activeKey] || FLOWCHARTS.subscriptions;

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111827] selection:bg-[#C2410C] selection:text-black">
      {/* Top Navbar */}
      <nav className="border-b border-[#E2E8F0] bg-[#FFFFFF]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              to="/portal/super-admin"
              className="flex items-center space-x-2 text-[#64748B] hover:text-[#C2410C] transition-colors group mr-4"
            >
              <div className="w-8 h-8 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] flex items-center justify-center group-hover:border-[#FFEDD5]">
                <ArrowLeft size={16} className="text-[#EA580C]" />
              </div>
              <span className="text-xs font-semibold hidden sm:inline">Back to Super Admin</span>
            </Link>

            <div className="h-5 w-px bg-[#E2E8F0] hidden sm:block" />

            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-[#C2410C] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/15">
                <ShieldCheck className="text-black" size={20} />
              </div>
              <div>
                <span className="text-base font-bold text-[#111827] block leading-tight">Gymora</span>
                <span className="text-[10px] text-[#EA580C] font-semibold uppercase tracking-wider block">
                  Super Admin Governance Suite
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Governance Engine
            </span>
          </div>
        </div>
      </nav>

      {/* Module Switcher Tabs */}
      <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] overflow-x-auto">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-2 py-2.5">
          {allModules.map((mod) => {
            const Icon = mod.icon;
            const isActive = mod.id === activeKey;
            return (
              <button
                key={mod.id}
                onClick={() => navigate(`/portal/super-admin/${mod.id}`)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#C2410C] text-white shadow-md shadow-orange-500/15 font-bold'
                    : 'text-[#64748B] hover:text-[#C2410C] hover:bg-[#FFFFFF]'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-black' : 'text-[#EA580C]'} />
                <span>{mod.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Body */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* ========================================================================= */}
        {/* SECTION 1: TOP FLOW CHART ARCHITECTURE (Hidden on Gym Onboarding & Verification) */}
        {/* ========================================================================= */}
        {activeKey !== 'approvals' && (
          <section className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#EA580C] flex items-center gap-1.5 mb-1">
                <Sparkles size={13} /> {allModules.find(m => m.id === activeKey)?.label.toUpperCase()} ARCHITECTURE
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
                {currentFlow.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {currentFlow.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#EA580C] bg-[#FFFFFF] px-3.5 py-2 rounded-xl border border-[#E2E8F0] shrink-0 self-start md:self-auto">
              <Zap size={14} />
              <span className="font-semibold">Interactive Process Flow</span>
            </div>
          </div>

          {/* Flow Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentFlow.steps.map((step, idx) => (
              <div
                key={idx}
                className="bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#FFEDD5] rounded-2xl p-5 transition-all flex flex-col justify-between space-y-4 relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-2xl font-black font-mono text-[#EA580C]/40 group-hover:text-[#EA580C] transition-colors">
                      {step.step}
                    </span>
                    <div className="flex items-center gap-2">
                      {step.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F8FAFC] text-slate-300 border border-[#E2E8F0]">
                          {step.badge}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          step.actor === 'Super Admin'
                            ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                            : step.actor === 'Platform AI'
                            ? 'bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]'
                            : step.actor === 'Banking Gateway'
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {step.actor}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-[#111827] mb-1.5 group-hover:text-[#EA580C] transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Output:</span>
                  <span className="font-semibold text-slate-200 truncate max-w-[190px]">
                    {step.output}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: LIVE OPERATIONAL CONTENT FOR ACTIVE MODULE                      */}
        {/* ========================================================================= */}

        {/* MODULE 1: MANAGE SUBSCRIPTIONS */}
        {activeKey === 'subscriptions' && (
          <section className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#EA580C] uppercase tracking-wider block mb-1">
                  LIVE SUBSCRIPTION ENGINE
                </span>
                <h3 className="text-2xl font-bold text-[#111827]">SaaS Pricing Tiers & Active Subscribers</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Inspect pricing plans, manage recurring billing cycles, and review subscriber status across all gyms
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => alert('New SaaS Plan Tier creation modal opened. Configure quota, pricing, and feature flags.')}
                  className="px-4 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-orange-500/15 flex items-center gap-1.5"
                >
                  <CreditCard size={14} />
                  <span>Create New SaaS Tier</span>
                </button>
              </div>
            </div>

            {/* SaaS Tiers Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#FFEDD5] rounded-3xl p-6 transition-all space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FFFFFF] text-slate-300 border border-[#E2E8F0]">
                    STARTER TIER
                  </span>
                  <span className="text-xs text-slate-400">142 Gyms Active</span>
                </div>
                <div>
                  <div className="text-3xl font-black text-[#111827] font-mono">
                    ₹2,499 <span className="text-xs font-normal text-slate-400">/ month</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">For single-location boutique gyms & studios</p>
                </div>
                <div className="space-y-2 text-xs text-slate-300 border-t border-[#E2E8F0] pt-3">
                  <div className="flex items-center gap-2"><Check size={14} className="text-[#EA580C]" /> Up to 200 Members</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-[#EA580C]" /> 1 Branch Included</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-[#EA580C]" /> 2 Trainer Logins</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-[#EA580C]" /> Dynamic QR Attendance</div>
                </div>
                <button
                  onClick={() => alert('Editing Starter Plan parameters')}
                  className="w-full py-2 bg-[#FFFFFF] hover:bg-[#FFF7ED] text-slate-300 text-xs font-semibold rounded-xl border border-[#E2E8F0] transition-colors"
                >
                  Edit Tier Parameters
                </button>
              </div>

              <div className="bg-[#F8FAFC] border-2 border-[#FDBA74] rounded-3xl p-6 transition-all space-y-4 relative shadow-xl shadow-orange-500/15">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#C2410C] text-white">
                    MOST POPULAR
                  </span>
                  <span className="text-xs text-[#EA580C] font-semibold">128 Gyms Active</span>
                </div>
                <div>
                  <div className="text-3xl font-black text-[#111827] font-mono">
                    ₹4,999 <span className="text-xs font-normal text-slate-400">/ month</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">For growing fitness centers & CrossFit boxes</p>
                </div>
                <div className="space-y-2 text-xs text-slate-300 border-t border-[#E2E8F0] pt-3">
                  <div className="flex items-center gap-2"><Check size={14} className="text-[#EA580C]" /> Up to 800 Members</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-[#EA580C]" /> Up to 3 Branches</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-[#EA580C]" /> 8 Trainer Logins & PT Splits</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-[#EA580C]" /> Integrated POS Supplement Store</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-[#EA580C]" /> WhatsApp Expiry Automation</div>
                </div>
                <button
                  onClick={() => alert('Editing Professional Plan parameters')}
                  className="w-full py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Edit Tier Parameters
                </button>
              </div>

              <div className="bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#FFEDD5] rounded-3xl p-6 transition-all space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    ENTERPRISE TIER
                  </span>
                  <span className="text-xs text-slate-400">42 Gyms Active</span>
                </div>
                <div>
                  <div className="text-3xl font-black text-[#111827] font-mono">
                    ₹9,999 <span className="text-xs font-normal text-slate-400">/ month</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">For large chains, luxury clubs & franchises</p>
                </div>
                <div className="space-y-2 text-xs text-slate-300 border-t border-[#E2E8F0] pt-3">
                  <div className="flex items-center gap-2"><Check size={14} className="text-[#EA580C]" /> Unlimited Members</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-[#EA580C]" /> Multi-Branch Franchise Hub</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-[#EA580C]" /> Unlimited Trainer Seats</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-[#EA580C]" /> Full AI Fitness Routine Engine</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-[#EA580C]" /> Dedicated Account Executive & SLA</div>
                </div>
                <button
                  onClick={() => alert('Editing Enterprise Plan parameters')}
                  className="w-full py-2 bg-[#FFFFFF] hover:bg-[#FFF7ED] text-slate-300 text-xs font-semibold rounded-xl border border-[#E2E8F0] transition-colors"
                >
                  Edit Tier Parameters
                </button>
              </div>
            </div>

            {/* Live Subscribers Table */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search gyms, owners, plans..."
                    value={subSearch}
                    onChange={(e) => setSubSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FDBA74]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {['All', 'Active', 'Past Due'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setSubFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        subFilter === f
                          ? 'bg-[#C2410C] text-white font-bold'
                          : 'bg-[#FFFFFF] text-[#64748B] hover:text-[#C2410C]'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FFFFFF] text-slate-400 uppercase text-[10px] font-bold border-b border-[#E2E8F0]">
                    <tr>
                      <th className="px-5 py-3.5">Gym Franchise</th>
                      <th className="px-5 py-3.5">Owner Contact</th>
                      <th className="px-5 py-3.5">Plan Tier</th>
                      <th className="px-5 py-3.5">Billing Cycle</th>
                      <th className="px-5 py-3.5">MRR Amount</th>
                      <th className="px-5 py-3.5">Next Renewal</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {subscribers
                      .filter(s => {
                        const matchText = s.gymName.toLowerCase().includes(subSearch.toLowerCase()) || s.owner.toLowerCase().includes(subSearch.toLowerCase());
                        const matchFilter = subFilter === 'All' || s.status === subFilter;
                        return matchText && matchFilter;
                      })
                      .map((sub) => (
                        <tr key={sub.id} className="hover:bg-[#FFFFFF]/40 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-white flex items-center gap-2">
                            <Building2 size={14} className="text-[#EA580C]" />
                            {sub.gymName}
                          </td>
                          <td className="px-5 py-3.5 text-slate-300">{sub.owner}</td>
                          <td className="px-5 py-3.5">
                            <span className="px-2 py-0.5 rounded-md bg-[#F8FAFC] text-slate-300 font-semibold border border-[#E2E8F0]">
                              {sub.plan}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-400">{sub.cycle}</td>
                          <td className="px-5 py-3.5 font-mono font-bold text-[#EA580C]">
                            ₹{sub.mrr.toLocaleString()}
                          </td>
                          <td className="px-5 py-3.5 text-slate-400">{sub.nextBilling}</td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                sub.status === 'Active'
                                  ? 'bg-emerald-500/10 text-[#15803D] border border-emerald-500/30'
                                  : 'bg-rose-500/10 text-[#B91C1C] border border-rose-500/30'
                              }`}
                            >
                              {sub.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={() => alert(`Generated B2B GST tax invoice for ${sub.gymName}. Downloading PDF...`)}
                              className="px-2.5 py-1 bg-[#FFFFFF] hover:bg-[#FFF7ED] border border-[#E2E8F0] rounded-lg text-slate-300 hover:text-[#C2410C] transition-colors"
                            >
                              Invoice
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* MODULE 2: GYM ONBOARDING & VERIFICATION DESK */}
        {activeKey === 'approvals' && (
          <section className="space-y-8">
            {/* Header Banner */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-6 mb-6">
                <div>
                  <span className="text-xs font-bold text-[#EA580C] uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                    <Building2 size={14} /> PLATFORM ONBOARDING &amp; GOVERNANCE
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
                    Gym Onboarding, Document Audit &amp; License Issuance
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
                    Review and verify incoming gym applications, inspect legal trade licenses, audit equipment safety declarations, and issue live multi-tenant franchise licenses.
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-[#15803D] border border-emerald-500/20 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Audit Pipeline Active
                  </span>
                </div>
              </div>

              {/* 4 Metric Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Pending Review</span>
                    <Clock size={14} className="text-[#B45309]" />
                  </div>
                  <div className="text-2xl font-black text-[#B45309] font-mono">
                    {gymApplications.filter(g => g.status === 'Pending').length} Gyms
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Awaiting compliance audit</p>
                </div>

                <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Approved &amp; Active</span>
                    <CheckCircle2 size={14} className="text-[#15803D]" />
                  </div>
                  <div className="text-2xl font-black text-[#15803D] font-mono">
                    {gymApplications.filter(g => g.status === 'Approved').length + 46} Gyms
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Live platform franchises</p>
                </div>

                <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Rejected / Incomplete</span>
                    <AlertTriangle size={14} className="text-[#B91C1C]" />
                  </div>
                  <div className="text-2xl font-black text-[#B91C1C] font-mono">
                    {gymApplications.filter(g => g.status === 'Rejected').length + 3} Gyms
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Correction notices dispatched</p>
                </div>

                <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>SLA Turnaround</span>
                    <Zap size={14} className="text-[#EA580C]" />
                  </div>
                  <div className="text-2xl font-black text-[#EA580C] font-mono">&lt; 24 Hours</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Average verification time</p>
                </div>
              </div>
            </div>

            {/* Compliance Standards Guidance Box */}
            <div className="bg-[#FFFFFF]/80 border border-[#E2E8F0] rounded-2xl p-5">
              <h4 className="text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShieldCheck size={15} /> Mandatory Compliance &amp; Verification Standards for Onboarding
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                  <p className="font-bold text-white mb-0.5">1. Municipal Trade License</p>
                  <p className="text-slate-400 text-[11px]">Valid Shop &amp; Establishment Act registration with local authority stamp.</p>
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                  <p className="font-bold text-white mb-0.5">2. Tax &amp; GSTIN Verification</p>
                  <p className="text-slate-400 text-[11px]">Active GSTIN number matching registered trade name &amp; banking account.</p>
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                  <p className="font-bold text-white mb-0.5">3. Fire Safety NOC</p>
                  <p className="text-slate-400 text-[11px]">Clearance for commercial occupancy, unobstructed fire exits &amp; extinguishers.</p>
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                  <p className="font-bold text-white mb-0.5">4. Equipment &amp; Biometrics</p>
                  <p className="text-slate-400 text-[11px]">Commercial grade machinery certification &amp; turnstile gate IoT compatibility.</p>
                </div>
              </div>
            </div>

            {/* Verification Queue Section */}
            <div className="space-y-4">
              {/* Filter Tabs & Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                  {['All', 'Pending', 'Approved', 'Rejected'].map((tab) => {
                    const count = tab === 'All' 
                      ? gymApplications.length 
                      : gymApplications.filter(g => g.status === tab).length;
                    return (
                      <button
                        key={tab}
                        onClick={() => setApprovalTab(tab)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                          approvalTab === tab
                            ? 'bg-[#C2410C] text-white font-bold shadow-md shadow-orange-500/15'
                            : 'bg-[#FFFFFF] text-[#64748B] hover:text-[#C2410C] border border-[#E2E8F0]'
                        }`}
                      >
                        <span>{tab === 'All' ? 'All Applications' : `${tab} Review`}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          approvalTab === tab ? 'bg-black/20 text-black' : 'bg-[#F8FAFC] text-[#EA580C]'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-72">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={approvalSearch}
                    onChange={(e) => setApprovalSearch(e.target.value)}
                    placeholder="Search by gym, owner, or city..."
                    className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FDBA74]"
                  />
                </div>
              </div>

              {/* Gym Applications Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gymApplications
                  .filter(g => {
                    const matchesTab = approvalTab === 'All' || g.status === approvalTab;
                    const matchesSearch = g.name.toLowerCase().includes(approvalSearch.toLowerCase()) ||
                                          g.owner.toLowerCase().includes(approvalSearch.toLowerCase()) ||
                                          g.city.toLowerCase().includes(approvalSearch.toLowerCase());
                    return matchesTab && matchesSearch;
                  })
                  .map((gym) => (
                    <div
                      key={gym.id}
                      className="bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#FFEDD5] rounded-3xl p-6 transition-all flex flex-col justify-between space-y-4 shadow-xl"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-[#EA580C] font-semibold flex items-center gap-1">
                            <Building2 size={13} /> {gym.city}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              gym.status === 'Approved'
                                ? 'bg-emerald-500/10 text-[#15803D] border border-emerald-500/30'
                                : gym.status === 'Pending'
                                ? 'bg-amber-500/10 text-[#B45309] border border-amber-500/30'
                                : 'bg-rose-500/10 text-[#B91C1C] border border-rose-500/30'
                            }`}
                          >
                            {gym.status}
                          </span>
                        </div>

                        <h4 className="text-lg font-bold text-[#111827] mb-1">{gym.name}</h4>
                        <p className="text-xs text-slate-400">
                          Applicant: <strong className="text-slate-200">{gym.owner}</strong>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {gym.email} &bull; {gym.phone}
                        </p>

                        {/* Facility Quick Specs */}
                        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#E2E8F0] text-[11px] text-slate-400">
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Floor Area</span>
                            <span className="font-semibold text-slate-200">{gym.area}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Capacity</span>
                            <span className="font-semibold text-slate-200">{gym.capacity} Members</span>
                          </div>
                        </div>

                        {/* Submitted Credentials */}
                        <div className="mt-3 pt-3 border-t border-[#E2E8F0] space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                            Submitted Legal Credentials:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {gym.docs.map((doc, i) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded text-slate-300 flex items-center gap-1">
                                <FileText size={10} className="text-[#EA580C]" />
                                {doc}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                        <button
                          onClick={() => setSelectedGymApp(gym)}
                          className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#FFF7ED] border border-[#E2E8F0] hover:border-[#FFEDD5] text-slate-300 hover:text-[#C2410C] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                        >
                          <Eye size={13} /> Inspect Dossier
                        </button>

                        {gym.status === 'Pending' && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleRejectGym(gym.id)}
                              className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-[#B91C1C] border border-rose-500/30 rounded-xl text-xs font-semibold transition-colors"
                              title="Reject Application"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleApproveGym(gym.id)}
                              className="px-3.5 py-1.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md shadow-orange-500/15 transition-all"
                            >
                              <Check size={13} /> Approve &amp; License
                            </button>
                          </div>
                        )}

                        {gym.status === 'Approved' && (
                          <span className="text-[11px] font-semibold text-[#15803D] flex items-center gap-1">
                            <CheckCircle2 size={13} /> License Issued
                          </span>
                        )}

                        {gym.status === 'Rejected' && (
                          <span className="text-[11px] font-semibold text-[#B91C1C] flex items-center gap-1">
                            <X size={13} /> Notice Sent
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Detailed Inspect Dossier Modal */}
            {selectedGymApp && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-3xl max-w-xl w-full p-6 text-[#1F2937] space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                    <div>
                      <h4 className="font-bold text-lg flex items-center gap-2">
                        <Building2 size={18} className="text-[#EA580C]" />
                        {selectedGymApp.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">License ID: {selectedGymApp.licenseId || 'GYM-LIC-PENDING'}</p>
                    </div>
                    <button onClick={() => setSelectedGymApp(null)} className="p-1.5 rounded-lg bg-[#FFFFFF] text-[#64748B] hover:text-[#C2410C]">
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-4 text-xs text-slate-300">
                    <div className="grid grid-cols-2 gap-3 bg-[#FFFFFF] p-3.5 rounded-xl border border-[#E2E8F0]">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Applicant / Owner</span>
                        <span className="font-bold text-white text-sm">{selectedGymApp.owner}</span>
                        <span className="block text-slate-400 text-[11px]">{selectedGymApp.email}</span>
                        <span className="block text-slate-400 text-[11px]">{selectedGymApp.phone}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Facility Location</span>
                        <span className="font-bold text-white text-sm">{selectedGymApp.city}</span>
                        <span className="block text-slate-400 text-[11px]">Floor Area: {selectedGymApp.area}</span>
                        <span className="block text-slate-400 text-[11px]">Capacity: {selectedGymApp.capacity} Members</span>
                      </div>
                    </div>

                    {/* Verified Documents Checklist */}
                    <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E2E8F0] space-y-2.5">
                      <span className="font-bold text-[#EA580C] block uppercase tracking-wider text-[10px]">
                        Verification Documents Audit:
                      </span>
                      {selectedGymApp.docs.map((doc: string, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-[#E2E8F0] last:border-none">
                          <span className="flex items-center gap-2">
                            <FileText size={13} className="text-[#EA580C]" /> {doc}
                          </span>
                          <span className="text-[#15803D] font-semibold text-[11px] flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <Check size={11} /> Digitally Audited
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Safety Inspection Checklist */}
                    <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E2E8F0] space-y-2">
                      <span className="font-bold text-[#EA580C] block uppercase tracking-wider text-[10px]">
                        Facility Safety &amp; IoT Audit:
                      </span>
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between text-slate-300">
                          <span>Unobstructed Fire Exit &amp; Evacuation Map</span>
                          <span className="text-[#15803D] font-bold">&#10003; Pass</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>First-Aid &amp; AED Emergency Station</span>
                          <span className="text-[#15803D] font-bold">&#10003; Pass</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>Biometric Turnstile &amp; QR Attendance Sync</span>
                          <span className="text-[#15803D] font-bold">&#10003; Ready</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>Commercial Equipment Load Calibration</span>
                          <span className="text-[#15803D] font-bold">&#10003; Certified</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E2E8F0] flex justify-end gap-2 text-xs">
                    <button
                      onClick={() => handleRejectGym(selectedGymApp.id)}
                      className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-[#B91C1C] border border-rose-500/30 rounded-xl font-semibold transition-colors"
                    >
                      Reject Application
                    </button>
                    <button
                      onClick={() => handleApproveGym(selectedGymApp.id)}
                      className="px-5 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold rounded-xl shadow-lg shadow-orange-500/15 transition-all"
                    >
                      Approve &amp; Issue Franchise License
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* MODULE 3: ANALYTICS COCKPIT */}
        {activeKey === 'analytics' && (
          <section className="space-y-8">
            <div>
              <span className="text-xs font-bold text-[#EA580C] uppercase tracking-wider block mb-1">
                EXECUTIVE TELEMETRY
              </span>
              <h3 className="text-2xl font-bold text-[#111827]">Platform GMV, Churn Radar & Geographic Density</h3>
            </div>

            {/* Top Counters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-5 rounded-2xl">
                <span className="text-xs text-slate-400">Annualized Platform GMV</span>
                <div className="text-3xl font-black text-[#111827] font-mono my-1">₹48.2M</div>
                <span className="text-[11px] text-[#EA580C] font-semibold">+28.4% MoM platform run rate</span>
              </div>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-5 rounded-2xl">
                <span className="text-xs text-slate-400">Active Athletes Tracked</span>
                <div className="text-3xl font-black text-[#111827] font-mono my-1">28,450</div>
                <span className="text-[11px] text-[#15803D] font-semibold">1,240 new signups this week</span>
              </div>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-5 rounded-2xl">
                <span className="text-xs text-slate-400">Monthly Net Churn Rate</span>
                <div className="text-3xl font-black text-[#111827] font-mono my-1">1.2%</div>
                <span className="text-[11px] text-[#EA580C] font-semibold">-0.4% improvement via WhatsApp</span>
              </div>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-5 rounded-2xl">
                <span className="text-xs text-slate-400">Monthly Recurring Revenue</span>
                <div className="text-3xl font-black text-[#111827] font-mono my-1">₹3.42M</div>
                <span className="text-[11px] text-purple-400 font-semibold">108.6% Net Revenue Retention</span>
              </div>
            </div>

            {/* City Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-3xl p-6 space-y-4">
                <h4 className="text-base font-bold text-[#111827] flex items-center gap-2">
                  <BarChart3 size={16} className="text-[#EA580C]" /> Top Performing Metropolitan Hubs
                </h4>
                <div className="space-y-3 text-xs">
                  {[
                    { city: 'Bangalore Tech Corridor', share: '38%', count: '64 Clubs', width: 'w-[76%]' },
                    { city: 'Mumbai Metro Region', share: '26%', count: '48 Clubs', width: 'w-[52%]' },
                    { city: 'Delhi-NCR Fitness Hubs', share: '21%', count: '36 Clubs', width: 'w-[42%]' },
                    { city: 'Hyderabad Cyberabad', share: '15%', count: '24 Clubs', width: 'w-[30%]' }
                  ].map((row, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-slate-300">
                        <span>{row.city}</span>
                        <span className="font-bold text-white">{row.share} ({row.count})</span>
                      </div>
                      <div className="w-full h-2 bg-[#FFFFFF] rounded-full overflow-hidden">
                        <div className={`h-full bg-[#C2410C] rounded-full ${row.width}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-3xl p-6 space-y-4">
                <h4 className="text-base font-bold text-[#111827] flex items-center gap-2">
                  <ShieldAlert size={16} className="text-[#B45309]" /> Churn Risk Radar (Proactive Interventions)
                </h4>
                <div className="space-y-2.5 text-xs">
                  {[
                    { gym: 'Gold Standard Gym', issue: 'Payment past due for 3 days', action: 'Send WhatsApp Dunning' },
                    { gym: 'CityPulse Workout Bar', issue: 'Check-in velocity dropped 40%', action: 'Assign Success Manager' },
                    { gym: 'CrossFit Frontier', issue: 'Owner has not logged in for 10 days', action: 'Trigger Re-engagement' }
                  ].map((alertRow, i) => (
                    <div key={i} className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E2E8F0] flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">{alertRow.gym}</div>
                        <div className="text-[11px] text-[#B45309]/90">{alertRow.issue}</div>
                      </div>
                      <button
                        onClick={() => alert(`Executed: ${alertRow.action} for ${alertRow.gym}`)}
                        className="px-2.5 py-1 bg-[#F8FAFC] hover:bg-[#C2410C] text-slate-300 hover:text-black font-semibold text-[10px] rounded-lg transition-colors"
                      >
                        {alertRow.action}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* MODULE 4: USER DIRECTORY */}
        {activeKey === 'users' && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#EA580C] uppercase tracking-wider block mb-1">
                  GLOBAL IDENTITY GOVERNANCE
                </span>
                <h3 className="text-2xl font-bold text-[#111827]">Multi-Role User Directory & Access Management</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Audit permissions, review activity history, and manage active/suspended states for owners, trainers, and athletes
                </p>
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or affiliated gym..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FDBA74]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {['All', 'GYM_OWNER', 'TRAINER', 'MEMBER'].map((role) => (
                    <button
                      key={role}
                      onClick={() => setUserRoleFilter(role)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        userRoleFilter === role
                          ? 'bg-[#C2410C] text-white font-bold'
                          : 'bg-[#FFFFFF] text-[#64748B] hover:text-[#C2410C]'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FFFFFF] text-slate-400 uppercase text-[10px] font-bold border-b border-[#E2E8F0]">
                    <tr>
                      <th className="px-5 py-3.5">User Profile</th>
                      <th className="px-5 py-3.5">Role Type</th>
                      <th className="px-5 py-3.5">Affiliated Gym</th>
                      <th className="px-5 py-3.5">Account Status</th>
                      <th className="px-5 py-3.5 text-right">Governance Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {usersList
                      .filter(u => {
                        const matchText = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
                        const matchRole = userRoleFilter === 'All' || u.role === userRoleFilter;
                        return matchText && matchRole;
                      })
                      .map((user) => (
                        <tr key={user.id} className="hover:bg-[#FFFFFF]/40 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-white">{user.name}</div>
                            <div className="text-[11px] text-slate-400">{user.email}</div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="px-2 py-0.5 rounded-md bg-[#F8FAFC] text-slate-300 font-mono text-[10px] border border-[#E2E8F0]">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-300">{user.gym}</td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                user.status === 'Active'
                                  ? 'bg-emerald-500/10 text-[#15803D] border border-emerald-500/30'
                                  : 'bg-rose-500/10 text-[#B91C1C] border border-rose-500/30'
                              }`}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={() => handleToggleUserStatus(user.id)}
                              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                                user.status === 'Active'
                                  ? 'bg-rose-500/10 hover:bg-rose-500/20 text-[#B91C1C] border border-rose-500/30'
                                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-[#15803D] border border-emerald-500/30'
                              }`}
                            >
                              {user.status === 'Active' ? 'Suspend' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* MODULE 5: CONFIGURE SECURITY */}
        {activeKey === 'security' && (
          <section className="space-y-8">
            <div>
              <span className="text-xs font-bold text-[#EA580C] uppercase tracking-wider block mb-1">
                ZERO-TRUST PROTOCOLS
              </span>
              <h3 className="text-2xl font-bold text-[#111827]">Platform Security & Multi-Tenant Isolation Controls</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Toggle encryption flags, rate limits, and inspect immutable audit trail logs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-3xl p-6 space-y-4">
                <h4 className="text-base font-bold text-[#111827] flex items-center gap-2">
                  <Lock size={16} className="text-[#EA580C]" /> Platform Isolation & Encryption Settings
                </h4>

                <div className="space-y-3 text-xs">
                  {[
                    { key: 'multiTenantIsolation', title: 'Multi-Tenant Partition Guard', desc: 'Queries strictly constrained to authenticated user gymId' },
                    { key: 'twoFactorEnforced', title: 'Enforce Two-Factor Authentication', desc: 'Mandatory 2FA OTP for all Super Admin & Owner logins' },
                    { key: 'aesEncryption', title: 'AES-256 Field Level Encryption', desc: 'Encrypt customer phone, banking, and medical data at rest' },
                    { key: 'rateLimitingShield', title: 'Edge Rate Limiting & Threat Shield', desc: 'Throttle abnormal burst requests to prevent credential stuffing' }
                  ].map((item: any) => (
                    <div key={item.key} className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E2E8F0] flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">{item.title}</div>
                        <div className="text-[11px] text-slate-400">{item.desc}</div>
                      </div>
                      <button
                        onClick={() => {
                          setSecuritySettings(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }));
                          alert(`Toggled ${item.title}`);
                        }}
                        className="text-[#EA580C]"
                      >
                        {securitySettings[item.key as keyof typeof securitySettings] ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-slate-600" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-3xl p-6 space-y-4">
                <h4 className="text-base font-bold text-[#111827] flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#15803D]" /> Immutable Security Audit Trail Ledger
                </h4>

                <div className="space-y-2 text-xs">
                  {[
                    { action: 'Super Admin Approved Gym License', target: 'Spartan Strength Lab', ip: '103.21.244.18', time: '12 mins ago' },
                    { action: 'Suspended Account Security Lock', target: 'rohan.pt@gmail.com', ip: '103.21.244.18', time: '1 hour ago' },
                    { action: 'Updated SaaS Professional Tier Pricing', target: 'Plan: Pro (₹4,999)', ip: '14.139.12.90', time: 'Yesterday' },
                    { action: 'Generated Audited Platform Tax Balance Sheet', target: 'Q3 Tax Ledger', ip: '14.139.12.90', time: '2 days ago' }
                  ].map((log, i) => (
                    <div key={i} className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E2E8F0]">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="font-bold text-white">{log.action}</span>
                        <span className="text-[10px] text-slate-500">{log.time}</span>
                      </div>
                      <div className="text-[11px] text-[#EA580C] mt-0.5">{log.target}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">IP: {log.ip}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* MODULE 6: MANAGE PAYOUTS & SYSTEM */}
        {activeKey === 'payouts' && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#EA580C] uppercase tracking-wider block mb-1">
                  MARKETPLACE SETTLEMENTS & CLOUD HEALTH
                </span>
                <h3 className="text-2xl font-bold text-[#111827]">Marketplace Payouts & Cloud Telemetry</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Batch process marketplace revenue payouts to gym bank accounts and monitor cloud microservices
                </p>
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-3xl p-6 shadow-xl space-y-4">
              <h4 className="text-base font-bold text-[#111827] flex items-center gap-2">
                <Server size={16} className="text-[#EA580C]" /> Pending & Completed Bank Payouts
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FFFFFF] text-slate-400 uppercase text-[10px] font-bold border-b border-[#E2E8F0]">
                    <tr>
                      <th className="px-5 py-3.5">Gym Franchise</th>
                      <th className="px-5 py-3.5">Net Payout Amount</th>
                      <th className="px-5 py-3.5">Beneficiary Bank Account</th>
                      <th className="px-5 py-3.5">IFSC Code</th>
                      <th className="px-5 py-3.5">Settlement Date</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Dispatch Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {payoutsList.map((payout) => (
                      <tr key={payout.id} className="hover:bg-[#FFFFFF]/40 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-white">{payout.gym}</td>
                        <td className="px-5 py-3.5 font-mono font-bold text-[#EA580C]">
                          ₹{payout.amount.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 text-slate-300">{payout.bank}</td>
                        <td className="px-5 py-3.5 font-mono text-slate-400">{payout.ifsc}</td>
                        <td className="px-5 py-3.5 text-slate-400">{payout.date}</td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              payout.status === 'Completed'
                                ? 'bg-emerald-500/10 text-[#15803D] border border-emerald-500/30'
                                : 'bg-amber-500/10 text-[#B45309] border border-amber-500/30'
                            }`}
                          >
                            {payout.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {payout.status === 'Ready' ? (
                            <button
                              onClick={() => handleDispatchPayout(payout.id)}
                              className="px-3 py-1 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-xs rounded-lg transition-colors"
                            >
                              Dispatch Payout
                            </button>
                          ) : (
                            <span className="text-[11px] text-[#15803D] font-semibold flex items-center justify-end gap-1">
                              <Check size={12} /> Settled
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
