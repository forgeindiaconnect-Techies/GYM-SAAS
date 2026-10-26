import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Dumbbell,
  CalendarCheck,
  ShoppingBag,
  TrendingUp,
  Gift,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Activity,
  Layers,
  Database,
  Smartphone,
  Zap,
  BarChart3,
  QrCode,
  CreditCard,
  BellRing,
  Award,
  DollarSign,
  FileSpreadsheet,
  Clock,
  Building2,
  RefreshCw,
  Sliders,
  Check,
  Search,
  Filter,
  Plus,
  Phone,
  Send,
  Eye,
  Star,
  Tag,
  AlertTriangle
} from 'lucide-react';

interface FlowStep {
  step: string;
  title: string;
  desc: string;
  badge?: string;
  actor: 'Gym Owner' | 'System AI' | 'Member' | 'Trainer';
  output: string;
}

interface FeatureConfig {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  icon: any;
  accentColor: string;
  liveRoute: string;
  liveLabel: string;
  kpis: { label: string; value: string; change: string }[];
  flowchartTitle: string;
  flowchartSubtitle: string;
  flowSteps: FlowStep[];
  capabilities: {
    title: string;
    description: string;
    points: string[];
    highlightTag: string;
  }[];
  bestPractices: string[];
}

const FEATURE_CONFIGS: Record<string, FeatureConfig> = {
  members: {
    id: 'members',
    title: 'Member & Membership Lifecycle Management',
    subtitle: 'Streamline onboarding, contract renewals, status tracking, and automated retention alerts across all membership tiers.',
    tagline: 'MEMBER OPS & DIRECTORY',
    icon: Users,
    accentColor: '#2DD4BF',
    liveRoute: '/admin/members',
    liveLabel: 'Launch Member Management',
    kpis: [
      { label: 'Avg Member Retention', value: '88.4%', change: '+12.6% vs baseline' },
      { label: 'Automated Renewal Rate', value: '74.2%', change: '+18% with WhatsApp triggers' },
      { label: 'Onboarding Velocity', value: '< 2 mins', change: 'Digital KYC & contract' }
    ],
    flowchartTitle: 'End-to-End Member Onboarding & Retention Flow',
    flowchartSubtitle: 'Visual architecture of member journey from first enquiry to multi-year renewal',
    flowSteps: [
      {
        step: '01',
        title: 'Lead Capture & KYC Registration',
        desc: 'New member walks in or applies online. Captures phone, email, fitness goals, and health declaration.',
        actor: 'Member',
        badge: 'Intake',
        output: 'Member Record Created'
      },
      {
        step: '02',
        title: 'Plan Selection & Payment Processing',
        desc: 'Assign package plan (Monthly, Quarterly, Annual, Couple). Invoices generated with GST breakdown.',
        actor: 'Gym Owner',
        badge: 'Billing',
        output: 'Tax Invoice & Receipt'
      },
      {
        step: '03',
        title: 'AI Fitness Profile & Trainer Pairing',
        desc: 'System computes BMI/BMR benchmarks and allocates an available elite personal coach based on specializations.',
        actor: 'System AI',
        badge: 'Automation',
        output: 'Personalized Workout Plan'
      },
      {
        step: '04',
        title: 'Active Membership & Access Pass',
        desc: 'Dynamic QR access pass generated on member app for instant turnstile check-in and attendance logging.',
        actor: 'Member',
        badge: 'Daily Ops',
        output: 'Check-in Sync & Turnstile Pass'
      },
      {
        step: '05',
        title: 'Automated Expiry Alerts (T-7 / T-3 Days)',
        desc: 'Automated WhatsApp and SMS notifications dispatched prior to expiry with 1-click renewal links.',
        actor: 'System AI',
        badge: 'Retention',
        output: 'WhatsApp Notification Delivered'
      },
      {
        step: '06',
        title: 'Instant Renewal or Winback Offer',
        desc: 'Member renews instantly online or owner offers customized loyalty discounts to reactivate lapsed accounts.',
        actor: 'Gym Owner',
        badge: 'Growth',
        output: 'Contract Extended & Revenue Booked'
      }
    ],
    capabilities: [
      {
        title: 'Dynamic Member Directory',
        description: 'Instant multi-filter search by member name, phone, plan type, expiry date, branch, and status (Active, Expiring, Expired, Inactive).',
        points: ['1-click WhatsApp messaging', 'Emergency contacts archive', 'Profile photo & barcode ID'],
        highlightTag: 'Real-Time Sync'
      },
      {
        title: 'Package Plan Engine',
        description: 'Create multi-tier membership plans with customizable durations, access hours, freeze allowances, and trainer inclusion options.',
        points: ['Prorated plan upgrades', 'Couples & family discounts', 'Membership freeze policies'],
        highlightTag: 'Flexible Pricing'
      },
      {
        title: 'CSV Data Migration Tool',
        description: 'Effortlessly import hundreds of legacy gym customers from spreadsheet exports with automatic validation of phone numbers and duplicate checks.',
        points: ['Zero data loss transition', 'Template auto-mapping', 'Error reporting'],
        highlightTag: 'Migration Ready'
      },
      {
        title: 'Automated WhatsApp Bot Reminders',
        description: 'Reduce member churn with multi-stage renewal notifications sent automatically without manual receptionist effort.',
        points: ['T-7, T-3, Day 0 reminders', 'Embedded UPI payment links', 'Lapsed member re-engagement'],
        highlightTag: 'Churn Reducer'
      }
    ],
    bestPractices: [
      'Enable automated WhatsApp reminders to capture up to 80% renewals before plan expiration.',
      'Require emergency contact information during digital KYC for member safety compliance.',
      'Use membership freeze options instead of cancellations to preserve long-term member lifetime value.'
    ]
  },

  trainers: {
    id: 'trainers',
    title: 'Trainer Roster, PT Client Allocations & Splits',
    subtitle: 'Manage fitness staff schedules, assign personal training clients, monitor performance ratings, and automate commission payroll.',
    tagline: 'STAFF & COACHING ROSTER',
    icon: Dumbbell,
    accentColor: '#2DD4BF',
    liveRoute: '/admin/trainers',
    liveLabel: 'Open Trainer Rosters',
    kpis: [
      { label: 'Trainer Utilization', value: '82.5%', change: 'Optimal client-to-coach ratio' },
      { label: 'Avg Client Satisfaction', value: '4.9 / 5.0', change: 'Based on 1,420+ verified reviews' },
      { label: 'Automated Commission Speed', value: 'Instant', change: 'Zero manual payroll math' }
    ],
    flowchartTitle: 'Trainer Allocation, Workout Delivery & Payroll Flow',
    flowchartSubtitle: 'Operational sequence from trainer recruitment to client assignment and monthly split settlement',
    flowSteps: [
      {
        step: '01',
        title: 'Trainer Onboarding & Specialty Tagging',
        desc: 'Register coach credentials, certifications (ACE, ISSA, CPR), working shifts, and specialized focus areas.',
        actor: 'Gym Owner',
        badge: 'Setup',
        output: 'Verified Coach Profile'
      },
      {
        step: '02',
        title: 'Client Allocation to Trainer Roster',
        desc: 'Assign enrolled members to specific coaches according to training goals (Fat Loss, Bodybuilding, Rehab).',
        actor: 'Gym Owner',
        badge: 'Roster',
        output: 'Assigned Trainee List'
      },
      {
        step: '03',
        title: 'Program Authoring & Diet Customization',
        desc: 'Trainer crafts workout schedules, exercise reps, and macro diet plans using the platform library and AI tools.',
        actor: 'Trainer',
        badge: 'Coaching',
        output: 'Custom Exercise & Diet Plans'
      },
      {
        step: '04',
        title: 'Session Check-in & Progress Verification',
        desc: 'Each 1-on-1 personal training or group workout session is marked and verified digitally on the coach dashboard.',
        actor: 'Trainer',
        badge: 'Floor Ops',
        output: 'Session Completion Stamp'
      },
      {
        step: '05',
        title: 'Member Feedback & Performance Rating',
        desc: 'Members submit post-workout ratings and reviews, updating the trainer public benchmark scorecard.',
        actor: 'Member',
        badge: 'Quality',
        output: 'Scorecard & Review Update'
      },
      {
        step: '06',
        title: 'Commission Calculation & Payout Settlement',
        desc: 'System aggregates sessions delivered and membership sales to calculate split commissions and net payout.',
        actor: 'System AI',
        badge: 'Financials',
        output: 'Automated Pay Slip & Voucher'
      }
    ],
    capabilities: [
      {
        title: 'Live Staff Directory & Shift Logs',
        description: 'Real-time overview of active coaches on duty, assigned clients, shift timings, and current workout sessions in progress.',
        points: ['Client capacity limits', 'Emergency contact info', 'Specialization badges'],
        highlightTag: 'Capacity Control'
      },
      {
        title: 'Split Commission Configuration',
        description: 'Set custom split percentages (e.g. 70/30, 60/40) or fixed session-based fees per personal training package.',
        points: ['Tiered commission tiers', 'Bonus targets for retention', 'Instant fee ledger'],
        highlightTag: 'Automated Math'
      },
      {
        title: 'Exercise & Diet Approval Hub',
        description: 'Review and approve custom workout routines authored by your fitness trainers before dispatching to members.',
        points: ['Gym video integration', 'Macro balance checks', 'Safety guideline verification'],
        highlightTag: 'Quality Control'
      },
      {
        title: 'Performance Scorecards',
        description: 'Track member ratings, client weight-loss achievements, and class attendance compliance on trainer profiles.',
        points: ['Top coach leaderboard', 'Client milestone badges', 'Detailed feedback audit'],
        highlightTag: 'High Accountability'
      }
    ],
    bestPractices: [
      'Cap client load per trainer to prevent coach burnout and guarantee premium service delivery.',
      'Incentivize client retention with quarterly bonus multipliers on trainer commission splits.',
      'Regularly review member feedback to identify coaching training opportunities.'
    ]
  },

  attendance: {
    id: 'attendance',
    title: 'Smart Attendance, Turnstiles & Floor Occupancy',
    subtitle: 'Track member and staff check-ins with dynamic QR codes, monitor gym floor capacity, and prevent unauthorized access.',
    tagline: 'ACCESS CONTROL & OCCUPANCY',
    icon: CalendarCheck,
    accentColor: '#2DD4BF',
    liveRoute: '/admin/attendance',
    liveLabel: 'Open Attendance Logs',
    kpis: [
      { label: 'Check-in Latency', value: '< 1 sec', change: 'Instant QR & RFID validation' },
      { label: 'Defaulter Entry Block', value: '100%', change: 'Strict automated fee enforcement' },
      { label: 'Peak Capacity Tracking', value: 'Live Meter', change: 'Real-time head count' }
    ],
    flowchartTitle: 'Turnstile Validation & Live Attendance Architecture',
    flowchartSubtitle: 'Security flow ensuring only active, verified members access your gym facilities',
    flowSteps: [
      {
        step: '01',
        title: 'Member Scans Dynamic QR or RFID',
        desc: 'Member displays rolling QR code on the Gymora mobile app or taps NFC turnstile badge at gym entrance.',
        actor: 'Member',
        badge: 'Gate In',
        output: 'Biometric / QR Token'
      },
      {
        step: '02',
        title: 'Instant Database Entitlement Check',
        desc: 'System queries cloud database in <50ms: checks active membership, payment due dates, and freeze status.',
        actor: 'System AI',
        badge: 'Validation',
        output: 'Access Grant / Deny Signal'
      },
      {
        step: '03',
        title: 'Turnstile Unlock or Defaulter Alert',
        desc: 'Turnstile gate unlocks for active accounts. If expired or overdue, receptionist screen flashes fee payment prompt.',
        actor: 'System AI',
        badge: 'Security',
        output: 'Physical Gate Triggered'
      },
      {
        step: '04',
        title: 'Timestamped Check-in Record Created',
        desc: 'Entry time, member photo, and active plan are logged to the live attendance feed in the Gym Owner dashboard.',
        actor: 'Gym Owner',
        badge: 'Audit',
        output: 'Live Attendance Row Added'
      },
      {
        step: '05',
        title: 'Floor Occupancy Counter Increment',
        desc: 'Live gym capacity meter updates in real-time on owner dashboard and member mobile app.',
        actor: 'System AI',
        badge: 'Occupancy',
        output: 'Current Facility Headcount'
      },
      {
        step: '06',
        title: 'Absence Trigger & Re-engagement',
        desc: 'If an active member has not checked in for >7 consecutive days, system flags risk and sends friendly check-in WhatsApp.',
        actor: 'System AI',
        badge: 'Retention',
        output: 'Automated Motivation Alert'
      }
    ],
    capabilities: [
      {
        title: 'Live Real-Time Check-in Feed',
        description: 'See every member entering your facility with profile photo, name, plan type, and check-in timestamp.',
        points: ['Turnstile / front desk sync', 'Search by date or member', 'Manual check-in override'],
        highlightTag: 'Zero Delay'
      },
      {
        title: 'Defaulter Restriction Engine',
        description: 'Automatically prevent gate entry for customers with unpaid fees or lapsed memberships without awkward staff confrontations.',
        points: ['Instant desk audio alert', 'Display payment balance', 'Quick collect fee CTA'],
        highlightTag: 'Revenue Protection'
      },
      {
        title: 'Peak Hours Heatmap',
        description: 'Analyze hourly gym utilization to optimize equipment layout, air conditioning, and trainer staffing levels.',
        points: ['Morning vs evening peak stats', 'Day-of-week trends', 'Class capacity limits'],
        highlightTag: 'Smart Analytics'
      },
      {
        title: 'Staff & Trainer Clock-In',
        description: 'Track coach attendance compliance, shift check-ins, and floor availability for reliable payroll calculations.',
        points: ['Geofenced mobile check-in', 'Shift duration tracking', 'Overtime auditing'],
        highlightTag: 'HR Compliance'
      }
    ],
    bestPractices: [
      'Display the live gym capacity meter on your mobile app so members can choose off-peak workout hours.',
      'Set automated WhatsApp check-ins for members inactive for 7 days to prevent silent drop-offs.',
      'Audit monthly attendance trends to plan seasonal membership promotions.'
    ]
  },

  store: {
    id: 'store',
    title: 'Point of Sale (POS) Store & Inventory Management',
    subtitle: 'Sell supplements, merchandise, and gym beverages. Track inventory reorder points and record offline cash/card sales.',
    tagline: 'GYM STORE & MERCHANDISE',
    icon: ShoppingBag,
    accentColor: '#2DD4BF',
    liveRoute: '/admin/store',
    liveLabel: 'Open Store Dashboard',
    kpis: [
      { label: 'Secondary Revenue Boost', value: '+28.4%', change: 'Supplements & gear sales' },
      { label: 'Checkout Duration', value: '< 15 secs', change: 'Barcode POS quick scan' },
      { label: 'Stockout Reduction', value: '-92%', change: 'Automated low inventory alerts' }
    ],
    flowchartTitle: 'Retail POS, Inventory Tracking & Profit Settlement',
    flowchartSubtitle: 'Complete supply chain flow from supplier receiving to retail sale and profit reconciliation',
    flowSteps: [
      {
        step: '01',
        title: 'Inventory Cataloguing & SKU Tagging',
        desc: 'Add protein powders, pre-workouts, gym shirts, and water bottles with barcode numbers and cost prices.',
        actor: 'Gym Owner',
        badge: 'Inward',
        output: 'SKU Added with Cost Price'
      },
      {
        step: '02',
        title: 'Minimum Stock Alert Thresholds',
        desc: 'Define low-stock reorder thresholds (e.g. notify when Whey Protein 2kg drops below 5 units).',
        actor: 'Gym Owner',
        badge: 'Thresholds',
        output: 'Reorder Notification Rule'
      },
      {
        step: '03',
        title: 'Barcode Scanning at POS Terminal',
        desc: 'Cashier scans barcode at reception or member selects items from digital catalog on member app.',
        actor: 'Member',
        badge: 'Checkout',
        output: 'Cart Calculated with GST'
      },
      {
        step: '04',
        title: 'Multi-Mode Payment Acceptance',
        desc: 'Accept UPI QR code, debit/credit cards, cash, or charge directly to member prepaid account ledger.',
        actor: 'Gym Owner',
        badge: 'Tender',
        output: 'Payment Confirmation'
      },
      {
        step: '05',
        title: 'Real-Time Inventory Auto-Decrement',
        desc: 'System reduces stock level instantaneously and generates a compliant GST tax invoice sent via WhatsApp.',
        actor: 'System AI',
        badge: 'Inventory',
        output: 'Stock Deducted & PDF Invoice'
      },
      {
        step: '06',
        title: 'Daily Sales & Gross Margin Audit',
        desc: 'Store revenue, Cost of Goods Sold (COGS), and profit margins update automatically on owner analytics.',
        actor: 'System AI',
        badge: 'Profit',
        output: 'Audited Daily Retail Report'
      }
    ],
    capabilities: [
      {
        title: 'High-Speed POS Checkout',
        description: 'Barcode-ready checkout designed for front-desk attendants to process drinks, bars, and supplements in seconds.',
        points: ['Barcode scanner support', 'Cash/UPI split payments', 'Instant digital invoices'],
        highlightTag: 'Speedy Sales'
      },
      {
        title: 'Automated Stock Depletion Alerts',
        description: 'Receive dashboard notifications and alerts when fast-moving supplements or shaker bottles hit safety thresholds.',
        points: ['Expiry date monitoring', 'Reorder level triggers', 'Out-of-stock badges'],
        highlightTag: 'Zero Stockouts'
      },
      {
        title: 'Product Category Hub',
        description: 'Organize your store by Supplements, Apparel, Gym Accessories, Healthy Snacks, and Energy Drinks.',
        points: ['Custom pricing tiers', 'Member-only discounts', 'Visual product gallery'],
        highlightTag: 'Catalog Control'
      },
      {
        title: 'Gross Margin & Profit Tracker',
        description: 'Track exactly how much margin your gym earns per supplement brand, giving insights to negotiate better vendor rates.',
        points: ['COGS tracking', 'Top-selling item metrics', 'Daily sales breakdown'],
        highlightTag: 'Profit Insights'
      }
    ],
    bestPractices: [
      'Bundle a 1-month gym membership with a free shaker bottle and protein shake voucher to boost retail sales.',
      'Place high-margin energy drinks and protein bars directly beside the check-in turnstiles for impulse buys.',
      'Audit physical stock counts bi-weekly against the digital inventory dashboard.'
    ]
  },

  analytics: {
    id: 'analytics',
    title: 'Financial Intelligence, Cashflow & Profit Analytics',
    subtitle: 'Comprehensive financial dashboards, profit-loss statements, tax breakdowns, and automated audited reports.',
    tagline: 'FINANCIAL INTELLIGENCE',
    icon: TrendingUp,
    accentColor: '#2DD4BF',
    liveRoute: '/admin/revenue-analytics',
    liveLabel: 'View Revenue Analytics',
    kpis: [
      { label: 'Revenue Visibility', value: '100% Live', change: 'Across memberships & retail' },
      { label: 'Tax Reconciliation', value: 'Automated', change: 'CGST, SGST & IGST breakdown' },
      { label: 'Multi-Branch Audit', value: 'Unified', change: 'Consolidated cashflow views' }
    ],
    flowchartTitle: 'Multi-Stream Revenue Aggregation & Profit Flow',
    flowchartSubtitle: 'Financial data pipeline capturing every rupee across memberships, sessions, and store sales',
    flowSteps: [
      {
        step: '01',
        title: 'Multi-Stream Income Capture',
        desc: 'Transactions across memberships, PT sessions, store orders, day passes, and locker rentals are recorded in real-time.',
        actor: 'System AI',
        badge: 'Inflow',
        output: 'Unified Transaction Ledger'
      },
      {
        step: '02',
        title: 'Operational Expense Recording',
        desc: 'Owner logs facility overheads: rent, staff salaries, electricity bills, equipment maintenance, and marketing costs.',
        actor: 'Gym Owner',
        badge: 'Outflow',
        output: 'Expense Categorization'
      },
      {
        step: '03',
        title: 'Net Profit & Cashflow Calculation',
        desc: 'System dynamically deducts operational overheads and trainer commissions from gross collections.',
        actor: 'System AI',
        badge: 'Calculation',
        output: 'Net Operating Profit Margin'
      },
      {
        step: '04',
        title: 'Monthly Recurring Revenue (MRR) Analysis',
        desc: 'Calculates active subscriber revenue base, expansion revenue from upgrades, and churn drag.',
        actor: 'System AI',
        badge: 'MRR Metrics',
        output: 'Predictable Revenue Forecast'
      },
      {
        step: '05',
        title: 'Multi-Branch Financial Comparison',
        desc: 'For gym owners with multiple locations, compare revenue, overheads, and profit margins per branch.',
        actor: 'Gym Owner',
        badge: 'Multi-Unit',
        output: 'Branch Benchmarking Matrix'
      },
      {
        step: '06',
        title: '1-Click Audited Tax Ledger Export',
        desc: 'Export comprehensive Excel, CSV, and PDF balance sheets formatted for chartered accountants and tax filing.',
        actor: 'Gym Owner',
        badge: 'Tax Audit',
        output: 'Audited Financial Statements'
      }
    ],
    capabilities: [
      {
        title: 'Real-Time Revenue Dashboard',
        description: 'Live charts detailing today’s collection, monthly revenue, trainer payouts, and operating margins with visual trend indicators.',
        points: ['Daily / Weekly / Monthly views', 'Cash vs Online payment split', 'Average Revenue per Member'],
        highlightTag: 'Live Cashflow'
      },
      {
        title: 'Expense Management Ledger',
        description: 'Categorize gym expenses into Rent, Utilities, Equipment Maintenance, Marketing, and Staffing to uncover cost leakage.',
        points: ['Vendor receipt attachments', 'Recurring expense scheduler', 'Budget vs Actual variance'],
        highlightTag: 'Cost Control'
      },
      {
        title: 'Tax & GST Breakdown Hub',
        description: 'Automated GST computation across services (18% Gym Membership GST) and store goods with compliant HSN/SAC codes.',
        points: ['B2B tax invoices', 'Monthly GST filing reports', 'Tax invoice download'],
        highlightTag: 'Tax Compliant'
      },
      {
        title: 'Multi-Branch Consolidated Reporting',
        description: 'View financial health across your flagship club and all franchise locations in a single unified executive view.',
        points: ['Inter-branch comparisons', 'Branch manager accountability', 'Centralized bank deposit audit'],
        highlightTag: 'Multi-Branch'
      }
    ],
    bestPractices: [
      'Log recurring monthly expenses like rent and electricity on day 1 to maintain accurate live profit margin calculations.',
      'Review monthly churn revenue to identify whether pricing or service quality is driving member cancellations.',
      'Export financial ledgers monthly to keep accounting and tax compliance completely stress-free.'
    ]
  },

  rewards: {
    id: 'rewards',
    title: 'Gamification, Member Challenges & Referral Engine',
    subtitle: 'Engage members with automated workout milestones, club leaderboards, and organic viral referral rewards.',
    tagline: 'GAMIFICATION & VIRAL GROWTH',
    icon: Gift,
    accentColor: '#2DD4BF',
    liveRoute: '/admin/rewards-performance',
    liveLabel: 'Manage Rewards Engine',
    kpis: [
      { label: 'Organic New Referrals', value: '+34.8%', change: 'Member-driven acquisition' },
      { label: 'Challenge Completion Rate', value: '62.4%', change: 'Boosts member visit frequency' },
      { label: 'Acquisition Cost (CAC)', value: '-45%', change: 'Zero ad spend referral engine' }
    ],
    flowchartTitle: 'Challenge Participation & Viral Referral Flow',
    flowchartSubtitle: 'How gamification transforms ordinary gym members into loyal, enthusiastic brand advocates',
    flowSteps: [
      {
        step: '01',
        title: 'Gym Owner Creates Fitness Challenge',
        desc: 'Set up challenges such as "30-Day Shred", "100km Treadmill Club", or "20 Check-ins in a Month" with reward badges.',
        actor: 'Gym Owner',
        badge: 'Challenge',
        output: 'Challenge Published'
      },
      {
        step: '02',
        title: 'Member Opt-In & Daily Workout Tracking',
        desc: 'Members join via their mobile app. Turnstile check-ins and AI workout logs automatically credit progress milestones.',
        actor: 'Member',
        badge: 'Participation',
        output: 'Progress Tracked via Logs'
      },
      {
        step: '03',
        title: 'Live Gym Leaderboard Sync',
        desc: 'Real-time scoreboard ranks participants, displayed on gym reception screens and member mobile apps to drive healthy competition.',
        actor: 'System AI',
        badge: 'Scoreboard',
        output: 'Dynamic Leaderboard Updated'
      },
      {
        step: '04',
        title: 'Milestone Achievement & FitPoints Earned',
        desc: 'Completing targets unlocks achievement badges and credits loyalty FitPoints to the member digital wallet.',
        actor: 'System AI',
        badge: 'Badges',
        output: 'Reward FitPoints Awarded'
      },
      {
        step: '05',
        title: 'Viral Referral Link Sharing',
        desc: 'Satisfied members share their personalized referral link via WhatsApp with colleagues, gym buddies, and friends.',
        actor: 'Member',
        badge: 'Referral',
        output: 'Personalized Invite Sent'
      },
      {
        step: '06',
        title: 'Automated Dual Reward Distribution',
        desc: 'When the friend joins, the existing member gets 1 month free extension or store credit, and the friend receives a welcome perk.',
        actor: 'System AI',
        badge: 'Win-Win',
        output: 'Dual Benefit Dispatched'
      }
    ],
    capabilities: [
      {
        title: 'Custom Challenge Builder',
        description: 'Design seasonal fitness competitions with custom entry rules, target goals (attendance, calories, lifting volume), and prizes.',
        points: ['Start & end date scheduler', 'Individual or team formats', 'Automated badge certificates'],
        highlightTag: 'Engagement Booster'
      },
      {
        title: 'Live Club Leaderboard',
        description: 'Showcase top performers on reception TV screens and inside the mobile app to foster a vibrant community atmosphere.',
        points: ['Points-based ranking', 'Weekly & monthly resets', 'Category filters (Cardio, Strength)'],
        highlightTag: 'Social Proof'
      },
      {
        title: 'Automated Referral Tracking',
        description: 'Every member receives a unique referral link. The system tracks clicks, registrations, and conversions with zero manual paper vouchers.',
        points: ['WhatsApp 1-tap sharing', 'Fraud prevention checks', 'Tiered ambassador rewards'],
        highlightTag: 'Zero-CAC Growth'
      },
      {
        title: 'Digital Voucher Store',
        description: 'Allow members to redeem earned FitPoints for gym store discounts, free personal training sessions, or branded merchandise.',
        points: ['Custom point conversion rates', 'Instant QR voucher redemption', 'Inventory sync'],
        highlightTag: 'Loyalty Loop'
      }
    ],
    bestPractices: [
      'Launch a quarterly transformation challenge to spike gym attendance during traditionally slower months.',
      'Reward referrers with gym merchandise (hoodies, shakers) which turns members into walking advertisements.',
      'Recognize challenge winners publicly on gym social media channels to amplify pride and community spirit.'
    ]
  }
};

export default function GymOwnerFeatureDetail() {
  const { featureId } = useParams<{ featureId: string }>();
  const navigate = useNavigate();

  // Active feature config
  const currentKey = featureId && FEATURE_CONFIGS[featureId] ? featureId : 'members';
  const config = FEATURE_CONFIGS[currentKey];

  const allModules = [
    { id: 'members', label: 'Manage Members', icon: Users },
    { id: 'trainers', label: 'Trainer Rosters', icon: Dumbbell },
    { id: 'attendance', label: 'Attendance Logs', icon: CalendarCheck },
    { id: 'store', label: 'Store Dashboard', icon: ShoppingBag },
    { id: 'analytics', label: 'Revenue Analytics', icon: TrendingUp },
    { id: 'rewards', label: 'Rewards Engine', icon: Gift }
  ];

  // ----------------------------------------------------
  // Interactive Mock Data & Operations for Gym Owner
  // ----------------------------------------------------

  // Module 1: Members State
  const [memberSearch, setMemberSearch] = useState('');
  const [memberFilter, setMemberFilter] = useState('All');
  const [membersList, setMembersList] = useState([
    { id: 'm1', name: 'Rohan Gupta', phone: '+91 98765 43210', plan: 'Annual Elite', joined: '2025-11-20', expires: '2026-11-20', status: 'Active', alerted: false },
    { id: 'm2', name: 'Sneha Rao', phone: '+91 98450 11223', plan: 'Monthly Standard', joined: '2026-09-28', expires: '2026-10-28', status: 'Expiring Soon', alerted: false },
    { id: 'm3', name: 'Amit Verma', phone: '+91 97110 33445', plan: 'Quarterly Pro', joined: '2026-07-24', expires: '2026-10-24', status: 'Expired', alerted: true },
    { id: 'm4', name: 'Priya Nair', phone: '+91 99001 88776', plan: 'Couple Annual', joined: '2025-12-05', expires: '2026-12-05', status: 'Active', alerted: false },
    { id: 'm5', name: 'Kunal Singh', phone: '+91 98223 99887', plan: 'Monthly Standard', joined: '2026-09-29', expires: '2026-10-29', status: 'Expiring Soon', alerted: false }
  ]);

  const handleSendRenewalAlert = (id: string) => {
    setMembersList(prev => prev.map(m => m.id === id ? { ...m, alerted: true } : m));
  };

  const handleRenewMember = (id: string) => {
    setMembersList(prev => prev.map(m => m.id === id ? { ...m, status: 'Active', expires: '2026-11-28', alerted: false } : m));
  };

  // Module 2: Trainers Roster State
  const [trainersList, setTrainersList] = useState([
    { id: 't1', name: 'Kabir Singhania', role: 'Head Strength Coach', clients: 22, maxClients: 25, split: '70% / 30%', rate: 1200, rating: 4.95 },
    { id: 't2', name: 'Sneha Kulkarni', role: 'HIIT & Fat Loss Specialist', clients: 18, maxClients: 20, split: '65% / 35%', rate: 950, rating: 4.88 },
    { id: 't3', name: 'Arjun Nair', role: 'Yoga & Functional Rehab', clients: 15, maxClients: 20, split: '70% / 30%', rate: 1100, rating: 4.98 },
    { id: 't4', name: 'Vikram Seth', role: 'Senior Bodybuilding Coach', clients: 24, maxClients: 25, split: '75% / 25%', rate: 1500, rating: 4.92 }
  ]);

  const handleAssignClient = (trainerId: string) => {
    setTrainersList(prev => prev.map(t => t.id === trainerId ? { ...t, clients: Math.min(t.clients + 1, t.maxClients) } : t));
  };

  // Module 3: Attendance State
  const [punchMemberName, setPunchMemberName] = useState('Rohan Gupta');
  const [attendanceLogs, setAttendanceLogs] = useState([
    { id: 'a1', name: 'Rohan Gupta', time: '17:05 PM', gate: 'Turnstile A (Main Entrance)', status: 'Granted', plan: 'Annual Elite' },
    { id: 'a2', name: 'Sneha Rao', time: '16:48 PM', gate: 'Turnstile B (Cardio Floor)', status: 'Granted', plan: 'Monthly Standard' },
    { id: 'a3', name: 'Vikram Seth', time: '16:12 PM', gate: 'Staff Biometric Door', status: 'Staff Entry', plan: 'Staff PT' },
    { id: 'a4', name: 'Priya Nair', time: '15:30 PM', gate: 'Turnstile A (Main Entrance)', status: 'Granted', plan: 'Couple Annual' }
  ]);

  const handlePunchIn = () => {
    if (!punchMemberName) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAttendanceLogs(prev => [
      { id: Date.now().toString(), name: punchMemberName, time: timeStr, gate: 'Turnstile A (Main Entrance)', status: 'Granted', plan: 'Active Member' },
      ...prev
    ]);
  };

  // Module 4: Store & POS Inventory
  const [storeProducts, setStoreProducts] = useState([
    { id: 'p1', name: '100% Whey Gold Isolate 2kg', category: 'Supplements', price: 5499, stock: 24, minStock: 10 },
    { id: 'p2', name: 'Micronized Creatine Monohydrate 300g', category: 'Supplements', price: 1299, stock: 4, minStock: 10 },
    { id: 'p3', name: 'Heavy Duty Lifting Wrist Straps', category: 'Gear', price: 499, stock: 35, minStock: 15 },
    { id: 'p4', name: 'Stainless Steel Gym Shaker 750ml', category: 'Merchandise', price: 799, stock: 2, minStock: 10 },
    { id: 'p5', name: 'Explosive Pre-Workout 400g', category: 'Supplements', price: 2199, stock: 18, minStock: 10 }
  ]);
  const [posBillTotal, setPosBillTotal] = useState(0);

  const handleRestockProduct = (id: string) => {
    setStoreProducts(prev => prev.map(p => p.id === id ? { ...p, stock: p.stock + 10 } : p));
  };

  const handleAddProductToPOS = (price: number) => {
    setPosBillTotal(prev => prev + price);
  };

  // Module 6: Rewards & Referral Engine
  const [referralMember, setReferralMember] = useState('Rohan Gupta');
  const [generatedCode, setGeneratedCode] = useState('ROHAN-GYM-500');
  const [vouchersList, setVouchersList] = useState([
    { id: 'v1', title: '₹500 Protein Store Discount', points: 300, stock: 45, redeemed: 12 },
    { id: 'v2', title: '1 Free 1-on-1 PT Consultation', points: 600, stock: 20, redeemed: 8 },
    { id: 'v3', title: 'Free Month Membership Extension', points: 1500, stock: 10, redeemed: 3 }
  ]);

  const handleGenerateCode = () => {
    if (!referralMember) return;
    const clean = referralMember.split(' ')[0].toUpperCase();
    setGeneratedCode(`${clean}-GYM-${Math.floor(100 + Math.random() * 900)}`);
  };

  const handleRedeemVoucher = (id: string) => {
    setVouchersList(prev => prev.map(v => v.id === id ? { ...v, stock: Math.max(0, v.stock - 1), redeemed: v.redeemed + 1 } : v));
  };

  return (
    <div className="min-h-screen bg-[#080B0C] text-[#F5FAFA] selection:bg-[#2DD4BF] selection:text-black">
      {/* Top Navigation */}
      <nav className="border-b border-[#2A3A3A] bg-[#0E1415]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              to="/portal/gym-owner"
              className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors group mr-4"
            >
              <div className="w-8 h-8 rounded-lg bg-[#141D1E] border border-[#2A3A3A] flex items-center justify-center group-hover:border-[#2DD4BF]/50">
                <ArrowLeft size={16} className="text-[#2DD4BF]" />
              </div>
              <span className="text-xs font-semibold hidden sm:inline">Gym Owner Portal</span>
            </Link>

            <div className="h-5 w-px bg-[#2A3A3A] hidden sm:block" />

            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-[#2DD4BF] rounded-xl flex items-center justify-center shadow-lg shadow-[#2DD4BF]/20">
                <Activity className="text-black" size={20} />
              </div>
              <div>
                <span className="text-base font-bold text-white block leading-tight">Gymora</span>
                <span className="text-[10px] text-[#2DD4BF] font-semibold uppercase tracking-wider block">
                  Gym Owner Ecosystem
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/portal/gym-owner"
              className="px-4 py-2 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-black font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-[#2DD4BF]/25 flex items-center gap-2"
            >
              <span>Portal Overview</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Module Switcher Tabs */}
      <div className="border-b border-[#2A3A3A] bg-[#0E1415] overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-1 py-2">
          {allModules.map((mod) => {
            const Icon = mod.icon;
            const isActive = mod.id === currentKey;
            return (
              <button
                key={mod.id}
                onClick={() => navigate(`/portal/gym-owner/${mod.id}`)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#2DD4BF] text-black shadow-md shadow-[#2DD4BF]/20 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-[#141D1E]'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-black' : 'text-[#2DD4BF]'} />
                <span>{mod.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero Section */}
      <header className="relative py-16 px-4 sm:px-6 lg:px-8 border-b border-[#2A3A3A] bg-gradient-to-b from-[#0E1415] via-[#080B0C] to-[#080B0C] overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2DD4BF_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 space-y-6">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <config.icon size={14} />
              {config.tagline}
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400">Gym Owner Enterprise Module</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            {config.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
            {config.subtitle}
          </p>

          {/* Quick Metrics KPI Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            {config.kpis.map((kpi, idx) => (
              <div
                key={idx}
                className="bg-[#141D1E] border border-[#2A3A3A] p-4 rounded-2xl flex flex-col justify-between"
              >
                <span className="text-xs text-slate-400 font-medium">{kpi.label}</span>
                <div className="my-1">
                  <span className="text-2xl font-black text-white font-mono">{kpi.value}</span>
                </div>
                <span className="text-[11px] font-semibold text-[#2DD4BF] flex items-center gap-1">
                  <Sparkles size={11} /> {kpi.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {/* SECTION 1: VISUAL FLOWCHART */}
        <section className="space-y-8">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2DD4BF] block mb-2">
              SYSTEM ARCHITECTURE & PROCESS FLOW
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {config.flowchartTitle}
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              {config.flowchartSubtitle}
            </p>
          </div>

          {/* Flowchart Diagram Card Container */}
          <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
              {config.flowSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/50 rounded-2xl p-5 transition-all flex flex-col justify-between space-y-4 relative group"
                >
                  {/* Step Header */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-black font-mono text-[#2DD4BF]/40 group-hover:text-[#2DD4BF] transition-colors">
                        {step.step}
                      </span>
                      <div className="flex items-center gap-2">
                        {step.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1B2728] text-slate-300 border border-[#2A3A3A]">
                            {step.badge}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            step.actor === 'Gym Owner'
                              ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                              : step.actor === 'System AI'
                              ? 'bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/30'
                              : step.actor === 'Trainer'
                              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                              : 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {step.actor}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#2DD4BF] transition-colors">
                      {step.title}
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  {/* Step Output Footer */}
                  <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Output:</span>
                    <span className="font-semibold text-slate-200 truncate max-w-[180px]">
                      {step.output}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Connecting Legend */}
            <div className="mt-8 pt-6 border-t border-[#2A3A3A] flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-semibold text-white">Flow Actors:</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Gym Owner Manual Trigger
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2DD4BF]" /> System AI & Background Cron
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Member Interaction
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Trainer Floor Action
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#2DD4BF]">
                <Zap size={14} />
                <span className="font-semibold">Fully automated cloud state transitions</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1.5: INTERACTIVE OPERATIONAL MANAGEMENT SUITE */}
        {/* MODULE 1: MANAGE MEMBERS */}
        {currentKey === 'members' && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider block mb-1">
                  LIVE DIRECTORY & RETENTION WORKSPACE
                </span>
                <h3 className="text-2xl font-bold text-white">Active Member Roster & Expiry Alerts</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Monitor contract renewal deadlines, trigger automated WhatsApp notifications, and process plan renewals
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search member..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="bg-[#0E1415] border border-[#2A3A3A] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2DD4BF]"
                  />
                </div>
                <div className="flex items-center gap-1 bg-[#0E1415] p-1 rounded-xl border border-[#2A3A3A]">
                  {['All', 'Active', 'Expiring Soon', 'Expired'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setMemberFilter(filter)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        memberFilter === filter
                          ? 'bg-[#2DD4BF] text-black shadow-md shadow-[#2DD4BF]/20'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-3xl p-6 shadow-xl space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141D1E] text-slate-400 uppercase text-[10px] font-bold border-b border-[#2A3A3A]">
                    <tr>
                      <th className="px-5 py-3.5">Member Name</th>
                      <th className="px-5 py-3.5">Contact Phone</th>
                      <th className="px-5 py-3.5">Plan Package</th>
                      <th className="px-5 py-3.5">Joined Date</th>
                      <th className="px-5 py-3.5">Renewal Expiry</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Retention Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A3A3A]">
                    {membersList
                      .filter(m => memberFilter === 'All' || m.status === memberFilter)
                      .filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()))
                      .map((member) => (
                        <tr key={member.id} className="hover:bg-[#141D1E]/40 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-white flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#1B2728] border border-[#2A3A3A] flex items-center justify-center text-[#2DD4BF] text-xs font-bold">
                              {member.name.charAt(0)}
                            </div>
                            {member.name}
                          </td>
                          <td className="px-5 py-3.5 text-slate-300 font-mono">{member.phone}</td>
                          <td className="px-5 py-3.5 font-semibold text-white">{member.plan}</td>
                          <td className="px-5 py-3.5 text-slate-400 font-mono">{member.joined}</td>
                          <td className="px-5 py-3.5 text-slate-300 font-mono">{member.expires}</td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                member.status === 'Active'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : member.status === 'Expiring Soon'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {member.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {member.status !== 'Active' && (
                                <button
                                  onClick={() => handleSendRenewalAlert(member.id)}
                                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all flex items-center gap-1 ${
                                    member.alerted
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                      : 'bg-[#141D1E] hover:bg-[#2A3A3A] text-slate-300 border-[#2A3A3A]'
                                  }`}
                                >
                                  <Send size={11} /> {member.alerted ? 'Alert Sent' : 'WhatsApp Notice'}
                                </button>
                              )}
                              <button
                                onClick={() => handleRenewMember(member.id)}
                                className="px-3 py-1 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-black font-bold text-[11px] rounded-lg transition-colors"
                              >
                                Renew Plan
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* MODULE 2: TRAINERS & STAFF */}
        {currentKey === 'trainers' && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider block mb-1">
                  COACHING ROSTER & COMMISSION ENGINE
                </span>
                <h3 className="text-2xl font-bold text-white">Staff Rosters, Capacity & Split Payouts</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Track client load per trainer, manage session hourly rates, and calculate commission splits
                </p>
              </div>

              <div className="flex items-center gap-3 bg-[#0E1415] border border-[#2A3A3A] px-4 py-2 rounded-2xl">
                <Dumbbell size={18} className="text-[#2DD4BF]" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Roster Capacity</span>
                  <span className="text-sm font-black text-white">79 / 90 Clients Filled (88%)</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-3xl p-6 shadow-xl space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141D1E] text-slate-400 uppercase text-[10px] font-bold border-b border-[#2A3A3A]">
                    <tr>
                      <th className="px-5 py-3.5">Trainer Name</th>
                      <th className="px-5 py-3.5">Specialization</th>
                      <th className="px-5 py-3.5">Client Load</th>
                      <th className="px-5 py-3.5">Commission Split</th>
                      <th className="px-5 py-3.5">Hourly Session Rate</th>
                      <th className="px-5 py-3.5">Member Rating</th>
                      <th className="px-5 py-3.5 text-right">Roster Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A3A3A]">
                    {trainersList.map((trainer) => (
                      <tr key={trainer.id} className="hover:bg-[#141D1E]/40 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-white flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#1B2728] border border-[#2A3A3A] flex items-center justify-center text-[#2DD4BF] text-xs font-bold">
                            {trainer.name.charAt(0)}
                          </div>
                          {trainer.name}
                        </td>
                        <td className="px-5 py-3.5 text-slate-300">{trainer.role}</td>
                        <td className="px-5 py-3.5 font-mono text-white">
                          {trainer.clients} / {trainer.maxClients} Clients
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20">
                            {trainer.split}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-200">₹{trainer.rate} / hr</td>
                        <td className="px-5 py-3.5 text-amber-400 font-bold flex items-center gap-1">
                          <Star size={12} fill="currentColor" /> {trainer.rating}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => handleAssignClient(trainer.id)}
                            className="px-3 py-1 bg-[#141D1E] hover:bg-[#2DD4BF] hover:text-black text-[#2DD4BF] border border-[#2A3A3A] font-bold text-[11px] rounded-lg transition-colors"
                          >
                            + Assign Client
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

        {/* MODULE 3: ATTENDANCE & TURNSTILE */}
        {currentKey === 'attendance' && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider block mb-1">
                  ACCESS CONTROL TELEMETRY
                </span>
                <h3 className="text-2xl font-bold text-white">Contactless QR Turnstile & Live Check-in Stream</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verify gate punch-ins, monitor peak gym hours, and test instant entry validation
                </p>
              </div>

              {/* Checkin simulator */}
              <div className="flex items-center gap-2 bg-[#0E1415] border border-[#2A3A3A] p-1.5 rounded-2xl">
                <input
                  type="text"
                  placeholder="Enter member name..."
                  value={punchMemberName}
                  onChange={(e) => setPunchMemberName(e.target.value)}
                  className="bg-[#141D1E] border border-[#2A3A3A] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
                />
                <button
                  onClick={handlePunchIn}
                  className="px-3 py-1.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-black font-bold text-xs rounded-xl transition-all shadow-md shadow-[#2DD4BF]/20 flex items-center gap-1.5"
                >
                  <QrCode size={13} />
                  <span>Simulate QR Punch</span>
                </button>
              </div>
            </div>

            <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-3xl p-6 shadow-xl space-y-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarCheck size={16} className="text-[#2DD4BF]" />
                <span>Today's Real-Time Access Log Stream ({attendanceLogs.length} Entries)</span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141D1E] text-slate-400 uppercase text-[10px] font-bold border-b border-[#2A3A3A]">
                    <tr>
                      <th className="px-5 py-3.5">Member Name</th>
                      <th className="px-5 py-3.5">Check-in Timestamp</th>
                      <th className="px-5 py-3.5">Access Gate</th>
                      <th className="px-5 py-3.5">Membership Plan</th>
                      <th className="px-5 py-3.5 text-right">Access Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A3A3A]">
                    {attendanceLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#141D1E]/40 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          {log.name}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[#2DD4BF]">{log.time}</td>
                        <td className="px-5 py-3.5 text-slate-300">{log.gate}</td>
                        <td className="px-5 py-3.5 text-slate-400">{log.plan}</td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            ✓ {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* MODULE 4: STORE & POS INVENTORY */}
        {currentKey === 'store' && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider block mb-1">
                  SUPPLEMENT & MERCHANDISE DESK
                </span>
                <h3 className="text-2xl font-bold text-white">POS Inventory Counter & Stock Alerts</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage supplement shelf inventory, trigger quick barcode sales, and monitor low stock warnings
                </p>
              </div>

              <div className="flex items-center gap-3 bg-[#0E1415] border border-[#2A3A3A] px-4 py-2 rounded-2xl">
                <ShoppingBag size={18} className="text-[#2DD4BF]" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Quick Register Cart</span>
                  <span className="text-sm font-black text-[#2DD4BF] font-mono">₹{posBillTotal.toLocaleString()} Total</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-3xl p-6 shadow-xl space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141D1E] text-slate-400 uppercase text-[10px] font-bold border-b border-[#2A3A3A]">
                    <tr>
                      <th className="px-5 py-3.5">Product Title</th>
                      <th className="px-5 py-3.5">Category</th>
                      <th className="px-5 py-3.5">Retail Price (Inc. GST)</th>
                      <th className="px-5 py-3.5">Current Shelf Stock</th>
                      <th className="px-5 py-3.5">Threshold Alert</th>
                      <th className="px-5 py-3.5 text-right">POS Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A3A3A]">
                    {storeProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-[#141D1E]/40 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-white">{prod.name}</td>
                        <td className="px-5 py-3.5 text-slate-400">{prod.category}</td>
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-200">₹{prod.price.toLocaleString()}</td>
                        <td className="px-5 py-3.5 font-mono font-bold text-white">{prod.stock} Units</td>
                        <td className="px-5 py-3.5">
                          {prod.stock <= prod.minStock ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1 w-max">
                              <AlertTriangle size={10} /> Low Stock ({prod.stock} left)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              Adequate Stock
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleRestockProduct(prod.id)}
                              className="px-2.5 py-1 bg-[#141D1E] hover:bg-[#2A3A3A] text-slate-300 border border-[#2A3A3A] text-[11px] font-bold rounded-lg transition-colors"
                            >
                              + Restock 10
                            </button>
                            <button
                              onClick={() => handleAddProductToPOS(prod.price)}
                              className="px-3 py-1 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-black font-bold text-[11px] rounded-lg transition-colors"
                            >
                              Sell Unit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* MODULE 5: REVENUE ANALYTICS & CASHFLOW */}
        {currentKey === 'analytics' && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider block mb-1">
                  FINANCIAL PERFORMANCE & P&L
                </span>
                <h3 className="text-2xl font-bold text-white">Revenue Splits & Cashflow Forecasting</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Macro financial breakdown of membership fees, PT allocations, and retail store profits
                </p>
              </div>

              <span className="text-xs font-bold text-emerald-400 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                +18.4% Revenue Growth MoM
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl p-4">
                <span className="text-xs text-slate-400 font-bold block">Monthly Gross Collections</span>
                <span className="text-2xl font-black text-white font-mono">₹4,85,000</span>
                <span className="text-[10px] text-emerald-400 block mt-1">₹38,000 higher than target</span>
              </div>
              <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl p-4">
                <span className="text-xs text-slate-400 font-bold block">Membership Dues (65%)</span>
                <span className="text-2xl font-black text-[#2DD4BF] font-mono">₹3,15,000</span>
                <span className="text-[10px] text-slate-400 block mt-1">142 Active subscriptions</span>
              </div>
              <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl p-4">
                <span className="text-xs text-slate-400 font-bold block">Personal Training (26%)</span>
                <span className="text-2xl font-black text-amber-400 font-mono">₹1,25,000</span>
                <span className="text-[10px] text-slate-400 block mt-1">79 Clients on PT packages</span>
              </div>
              <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl p-4">
                <span className="text-xs text-slate-400 font-bold block">Net Operating Margin</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">44.2%</span>
                <span className="text-[10px] text-slate-400 block mt-1">₹2,14,000 net profit after rent</span>
              </div>
            </div>
          </section>
        )}

        {/* MODULE 6: REWARDS & REFERRAL ENGINE */}
        {currentKey === 'rewards' && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider block mb-1">
                  GAMIFICATION & LOYALTY ENGINE
                </span>
                <h3 className="text-2xl font-bold text-white">Referral Code Engine & Voucher Store</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Generate personalized member referral codes, monitor point balances, and distribute rewards
                </p>
              </div>

              {/* Code generator input */}
              <div className="flex items-center gap-2 bg-[#0E1415] border border-[#2A3A3A] p-1.5 rounded-2xl">
                <input
                  type="text"
                  placeholder="Member name..."
                  value={referralMember}
                  onChange={(e) => setReferralMember(e.target.value)}
                  className="bg-[#141D1E] border border-[#2A3A3A] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
                />
                <button
                  onClick={handleGenerateCode}
                  className="px-3 py-1.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-black font-bold text-xs rounded-xl transition-all shadow-md shadow-[#2DD4BF]/20 flex items-center gap-1"
                >
                  <Sparkles size={12} /> Generate Code
                </button>
              </div>
            </div>

            <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center font-bold">
                  %
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Generated Referral Voucher Code</span>
                  <span className="text-base font-black font-mono text-white tracking-wider">{generatedCode}</span>
                </div>
              </div>
              <span className="text-xs text-slate-400">Share with {referralMember} for 500 bonus coins per friend signup</span>
            </div>

            <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-3xl p-6 shadow-xl space-y-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Gift size={16} className="text-[#2DD4BF]" />
                <span>Rewards Store & Redeemable Member Bounties</span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141D1E] text-slate-400 uppercase text-[10px] font-bold border-b border-[#2A3A3A]">
                    <tr>
                      <th className="px-5 py-3.5">Reward Title</th>
                      <th className="px-5 py-3.5">Gymora Points Required</th>
                      <th className="px-5 py-3.5">Remaining Stock</th>
                      <th className="px-5 py-3.5">Times Redeemed</th>
                      <th className="px-5 py-3.5 text-right">Distribute Voucher</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A3A3A]">
                    {vouchersList.map((voucher) => (
                      <tr key={voucher.id} className="hover:bg-[#141D1E]/40 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-white">{voucher.title}</td>
                        <td className="px-5 py-3.5 font-mono font-bold text-[#2DD4BF]">{voucher.points} Coins</td>
                        <td className="px-5 py-3.5 text-slate-300 font-mono">{voucher.stock} Vouchers Left</td>
                        <td className="px-5 py-3.5 text-slate-400 font-mono">{voucher.redeemed} Redeemed</td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => handleRedeemVoucher(voucher.id)}
                            className="px-3 py-1 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-black font-bold text-[11px] rounded-lg transition-colors"
                          >
                            Award to Member
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

        {/* SECTION 2: CORE CAPABILITIES GRID */}
        <section className="space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#2DD4BF] block mb-2">
              ENTERPRISE CAPABILITIES
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Built for Modern Gym Owners & Multi-Branch Operators
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {config.capabilities.map((cap, idx) => (
              <div
                key={idx}
                className="bg-[#0E1415] border border-[#2A3A3A] hover:border-[#2DD4BF]/40 rounded-3xl p-6 transition-all space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20 uppercase tracking-wider">
                    {cap.highlightTag}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#141D1E] text-[#2DD4BF] flex items-center justify-center">
                    <CheckCircle2 size={18} />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white">{cap.title}</h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {cap.description}
                </p>

                <div className="space-y-2 pt-2 border-t border-[#2A3A3A]">
                  {cap.points.map((pt, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: GYM OWNER BEST PRACTICES */}
        <section className="bg-[#0E1415] border border-[#2A3A3A] rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Operational Best Practices</h3>
              <p className="text-xs text-slate-400">Recommended workflows used by high-revenue gym operators</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {config.bestPractices.map((bp, idx) => (
              <div
                key={idx}
                className="bg-[#141D1E] p-4 rounded-2xl border border-[#2A3A3A] text-xs text-slate-300 leading-relaxed flex items-start gap-3"
              >
                <span className="text-[#2DD4BF] font-bold text-sm shrink-0">0{idx + 1}.</span>
                <span>{bp}</span>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: MODULE EXPLORER & WORKSPACE DIRECTORY */}
        <section className="bg-gradient-to-r from-[#0E1415] via-[#141D1E] to-[#0E1415] border border-[#2DD4BF]/30 rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden shadow-2xl">
          <div className="max-w-3xl mx-auto space-y-6 relative z-10">
            <span className="px-3 py-1 rounded-full bg-[#2DD4BF]/15 text-[#2DD4BF] border border-[#2DD4BF]/30 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles size={13} /> Gym Owner Operational Suite
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Explore All 6 Gym Owner Modules & Live Flowcharts
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Switch between operational modules below to review detailed system processes, lifecycle flowcharts, and capability specifications.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {allModules.map((mod) => {
                const isActive = mod.id === currentKey;
                const Icon = mod.icon;
                return (
                  <Link
                    key={mod.id}
                    to={`/portal/gym-owner/${mod.id}`}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-[#2DD4BF] text-black shadow-lg shadow-[#2DD4BF]/20'
                        : 'bg-[#141D1E] text-slate-300 hover:text-white border border-[#2A3A3A] hover:border-[#2DD4BF]/40'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{mod.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[#2A3A3A] flex justify-center">
              <Link
                to="/portal/gym-owner"
                className="px-6 py-2.5 bg-[#141D1E] hover:bg-[#1B2728] text-[#2DD4BF] font-semibold rounded-xl text-xs border border-[#2A3A3A] hover:border-[#2DD4BF]/40 transition-all flex items-center gap-2"
              >
                <ArrowLeft size={14} />
                <span>Return to Gym Owner Portal Overview</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
