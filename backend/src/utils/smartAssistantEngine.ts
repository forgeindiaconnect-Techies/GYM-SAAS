import mongoose from 'mongoose';
import User, { Role } from '../models/User';
import TrainerSession from '../models/TrainerSession';
import CustomerMembership from '../models/CustomerMembership';
import Payment from '../models/Payment';
import StoreOrder from '../models/StoreOrder';
import StoreProduct from '../models/StoreProduct';
import ProgressLog from '../models/ProgressLog';
import AIRecommendation from '../models/AIRecommendation';
import Gym, { GymStatus } from '../models/Gym';
import Trainer from '../models/Trainer';
import Exercise from '../models/Exercise';

/* ── 1. Levenshtein Distance & Fuzzy Match ──────────────────────────── */
export const levenshteinDistance = (a: string, b: string): number => {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // deletion
          dp[i][j - 1] + 1,     // insertion
          dp[i - 1][j - 1] + 1  // substitution
        );
      }
    }
  }
  return dp[m][n];
};

export const fuzzyMatchWord = (word: string, target: string): boolean => {
  const w = word.toLowerCase();
  const t = target.toLowerCase();
  if (w === t) return true;
  if (w.length >= 4 && t.length >= 4) {
    if (t.includes(w) || w.includes(t)) return true;
  }
  if (w.length <= 3 || t.length <= 3) return false;
  const maxDistance = Math.min(w.length, t.length) >= 7 ? 2 : 1;
  return levenshteinDistance(w, t) <= maxDistance;
};


/* ── 2. Text Normalization ─────────────────────────────────────────── */
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[?!.,;:()'"`/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const tokenize = (text: string): string[] => {
  return normalizeText(text).split(' ').filter(t => t.length > 0);
};

/* ── 3. Synonyms & Keyword Dictionaries ────────────────────────────── */
export const SYNONYMS: Record<string, string[]> = {
  membership: ['membership', 'memberships', 'plan', 'plans', 'subscription', 'subscriptions', 'subscribe', 'pricing', 'princing', 'pricing details', 'princing details', 'fee', 'fees', 'cost', 'price', 'rates', 'premium', 'gold', 'silver', 'starter', 'professional', 'enterprise', 'trial', 'free trial', 'renew', 'renewal', 'upgrade'],
  gym: ['gym', 'gyms', 'facility', 'facilities', 'club', 'fitness center', 'branch', 'branches', 'timing', 'timings', 'hours', 'open', 'opening', 'location', 'address', 'area', 'amenity', 'amenities', 'ac', 'gym registration', 'gym register', 'register gym', 'register my gym', 'gym registration form'],
  trainer: ['trainer', 'trainers', 'coach', 'coaches', 'instructor', 'instructors', 'personal trainer', 'pt', 'specialization', 'hire trainer', 'session', 'sessions', 'book session', 'booking', 'bookings', 'online session', 'assigned trainer'],
  member: ['member', 'members', 'customer', 'customers', 'join', 'joining', 'register', 'registration', 'customer registration form', 'member registration form', 'attendance', 'checkin', 'check-in'],
  workout: ['workout', 'workouts', 'exercise', 'exercises', 'routine', 'routines', 'training', 'chest', 'back', 'legs', 'leg', 'arms', 'biceps', 'triceps', 'shoulders', 'abs', 'core', 'cardio', 'hiit', 'strength', 'muscle', 'hypertrophy', 'build muscle', 'lose weight', 'fat loss', 'bulk', 'cut', 'beginner'],
  diet: ['diet', 'diets', 'nutrition', 'meal', 'meals', 'food', 'calorie', 'calories', 'macro', 'macros', 'protein', 'carbs', 'fats', 'weight loss diet', 'muscle building diet', 'nutrition guidance', 'weight gain diet'],
  equipment: ['equipment', 'equipments', 'machine', 'machines', 'dumbbell', 'dumbbells', 'barbell', 'barbells', 'treadmill', 'treadmills', 'cable', 'squat rack', 'bench', 'kettlebell', 'weights'],
  store: ['store', 'shop', 'product', 'products', 'supplement', 'supplements', 'protein powder', 'whey', 'creatine', 'bcaa', 'gear', 'merch', 'apparel', 'cart', 'order', 'orders', 'buy', 'purchase', 'checkout'],
  payment: ['payment', 'payments', 'pay', 'paid', 'bill', 'billing', 'invoice', 'invoices', 'receipt', 'receipts', 'due', 'dues', 'transaction', 'transactions', 'payout', 'payouts'],
  admin: ['admin', 'super admin', 'approvals', 'pending approvals', 'approval', 'gym approval', 'gym approvals', 'reports', 'analytics', 'revenue', 'leads', 'import', 'management', 'payouts'],
  help: ['how to', 'how do i', 'how can i', 'where can i', 'help', 'guide', 'steps', 'workflow', 'what is', 'features', 'show me the features', 'capabilities', 'modules']
};

export interface AssistantAction {
  label: string;
  route: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface AssistantItem {
  id: string;
  title: string;
  subtitle?: string;
  price?: number;
  tag?: string;
  route?: string;
  image?: string;
}

export interface AssistantResult {
  reply: string;
  category: string;
  actions: AssistantAction[];
  items?: AssistantItem[];
  followUps: string[];
}

const formatDateStr = (d: string | Date | undefined): string => {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

/* ── 4. Main Query Processor (100% Local & Gemini-Free) ───────────── */
export const processSmartAssistantQuery = async (
  queryText: string,
  user: any,
  pageContext?: string
): Promise<AssistantResult> => {
  const q = normalizeText(queryText);
  const tokens = tokenize(q);
  const role = (user?.role || 'MEMBER').toUpperCase();
  const userId = user?.id || user?._id;

  // Check category match using tokens & fuzzy synonyms
  const matchesCategory = (categoryKey: string): boolean => {
    const list = SYNONYMS[categoryKey] || [];
    for (const phrase of list) {
      if (q.includes(phrase)) return true;
    }
    for (const t of tokens) {
      for (const phrase of list) {
        if (phrase.split(' ').length === 1 && fuzzyMatchWord(t, phrase)) {
          return true;
        }
      }
    }
    return false;
  };

  /* ─────────────────────────────────────────────────────────────
     0A. GYM REGISTRATION FORM
  ───────────────────────────────────────────────────────────── */
  if (
    q.includes('gym registration') ||
    q.includes('gym register') ||
    q.includes('gym owner register') ||
    q.includes('gym owner registration') ||
    q.includes('register gym') ||
    q.includes('register my gym') ||
    q.includes('franchise register') ||
    q.includes('register franchise') ||
    q.includes('gym signup') ||
    q.includes('add gym form') ||
    q.includes('new gym form') ||
    (q.includes('gym') && q.includes('form')) ||
    (q.includes('gym') && (q.includes('register') || q.includes('registration') || q.includes('signup') || q.includes('enroll') || q.includes('onboard')))
  ) {
    return {
      category: 'ADMIN',
      reply: `🏢 **Gym Owner Registration Form** (\`/register/gym-owner\`):
Here is our comprehensive **8-Step Gym Onboarding Wizard**:

• **Step 1: Basic Information** — Gym franchise name, business type & contact person.
• **Step 2: Owner Credentials** — Email, mobile phone, login password & contact details.
• **Step 3: Location & Branches** — Full gym street address, city, pin code & multi-branch locations.
• **Step 4: Facilities & Amenities** — AC, parking, showers, lockers, Wi-Fi & available gym equipment.
• **Step 5: Trainer Staff & Hours** — Operational timings, certified coach roster & specializations.
• **Step 6: Pricing Tiers & Banking** — Membership rates, bank account for direct payouts & GSTIN.
• **Step 7: Verification Documents** — Gym registration certificate, owner ID proof & gym photos.
• **Step 8: Review & Submit** — Final check before instant submission for Super Admin verification.

Click **Open Gym Registration Form** below to launch the registration wizard!`,
      actions: [
        { label: 'Open Gym Registration Form', route: '/register/gym-owner', variant: 'primary' },
        { label: 'Gym Owner Introduction', route: '/gym-owner-introduction' },
        { label: 'View Pricing Plans', route: '/subscription-plans' },
        { label: 'Pending Gym Approvals', route: '/super-admin/gym-approvals' }
      ],
      items: [
        {
          id: 'item-gym-reg',
          title: 'Gym Owner Registration Form',
          subtitle: 'Complete 8-step gym onboarding wizard',
          tag: '8 Steps',
          route: '/register/gym-owner'
        },
        {
          id: 'item-gym-intro',
          title: 'Gym Owner Introduction',
          subtitle: 'Benefits, SaaS features & growth automation',
          tag: 'Overview',
          route: '/gym-owner-introduction'
        }
      ],
      followUps: [
        'Pricing details',
        'Customer registration form',
        'Show me the features',
        'Gym Owner Dashboard'
      ]
    };
  }

  /* ─────────────────────────────────────────────────────────────
     0B. PRICING DETAILS & SUBSCRIPTION PLANS
  ───────────────────────────────────────────────────────────── */
  if (
    q.includes('princing') ||
    q.includes('pricing') ||
    q.includes('price') ||
    q.includes('prices') ||
    q.includes('cost') ||
    q.includes('rates') ||
    q.includes('how much') ||
    q.includes('subscription plan') ||
    q.includes('subscription plans') ||
    q.includes('membership fee') ||
    q.includes('membership fees') ||
    q.includes('membership cost') ||
    q.includes('membership plan') ||
    q.includes('membership plans') ||
    q.includes('plan price') ||
    q.includes('plan pricing') ||
    q === 'pricing details' ||
    q === 'princing details'
  ) {
    return {
      category: 'MEMBERSHIP',
      reply: `💰 **Pricing Details & Subscription Plans**:

🏢 **1. Gym Owner & Franchise SaaS Plans** (\`/subscription-plans\`):
• **Starter Plan — ₹499/month**: Single branch, up to 100 members, member check-ins, attendance tracking & invoice billing.
• **Silver Plan — ₹999/month**: Multi-branch support, up to 300 members, trainer scheduling, equipment inventory & revenue reports.
• **Gold Plan — ₹1,499/month**: Unlimited branches, up to 1,000 members, full AI Fitness regimen engine, POS Gym Store & video library. *(Recommended)*
• **Platinum / Enterprise — ₹2,499/month**: Custom multi-franchise branding, unlimited members, dedicated server support & automated commission payouts.

🏋️‍♂️ **2. Customer / Member Membership Plans** (\`/member/subscription\`):
• **Starter**: Basic gym floor access, standard workout routines & QR attendance check-ins.
• **Silver**: Full floor access, group fitness sessions, body progress tracking & trainer chat.
• **Gold / VIP**: Unlimited gym hours, dedicated 1-on-1 personal trainer sessions, custom AI nutrition plans & 15% Gym Store discount.

Click below to open the dedicated pricing page!`,
      actions: [
        { label: 'View SaaS Pricing Plans', route: '/subscription-plans', variant: 'primary' },
        { label: 'Customer Membership Plans', route: '/member/subscription' },
        { label: 'Upgrade Membership', route: '/member/upgrade' },
        { label: 'Manage Plans (Admin)', route: '/admin/membership-plans' }
      ],
      items: [
        {
          id: 'item-saas-pricing',
          title: 'SaaS Platform Plans (Gym Owners)',
          subtitle: 'Starter (₹499), Silver (₹999), Gold (₹1,499), Platinum (₹2,499)',
          tag: 'SaaS Plans',
          route: '/subscription-plans'
        },
        {
          id: 'item-member-plans',
          title: 'Customer Membership Plans',
          subtitle: 'Starter, Silver, Gold and Annual VIP passes',
          tag: 'Members',
          route: '/member/subscription'
        }
      ],
      followUps: [
        'Gym registration form',
        'Customer registration form',
        'Show me the features',
        'Three dashboards'
      ]
    };
  }

  /* ─────────────────────────────────────────────────────────────
     0C. CUSTOMER / MEMBER REGISTRATION FORM
  ───────────────────────────────────────────────────────────── */
  if (
    q.includes('customer registration') ||
    q.includes('customer register') ||
    q.includes('member registration') ||
    q.includes('member register') ||
    q.includes('customer signup') ||
    q.includes('member signup') ||
    q.includes('new customer form') ||
    q.includes('new member form') ||
    q.includes('join gym form') ||
    (q.includes('customer') && (q.includes('register') || q.includes('registration') || q.includes('signup') || q.includes('form') || q.includes('onboard'))) ||
    (q.includes('member') && (q.includes('register') || q.includes('registration') || q.includes('signup') || q.includes('form') || q.includes('join')))
  ) {
    return {
      category: 'MEMBERS',
      reply: `🏋️‍♂️ **Customer Registration Form** (\`/register/customer\`):
Here is how new gym members can register and get onboarded:

• **Customer Self-Registration** (\`/register/customer\`):
  1. Personal Profile (Full name, email, mobile phone, gender & date of birth).
  2. Gym Selection (Choose your nearest gym or franchise branch).
  3. Fitness Preferences (Primary goal: Weight Loss, Muscle Building, or Endurance).
  4. Initial Plan Selection & Instant Account Activation.

• **Admin / Walk-in Registration** (\`/admin/members\`):
  • Gym owners and staff can instantly register walk-in members directly from the Admin Dashboard or import existing member lists in bulk via CSV.

Click **Open Customer Registration Form** below to start!`,
      actions: [
        { label: 'Open Customer Registration Form', route: '/register/customer', variant: 'primary' },
        { label: 'Customer Dashboard', route: '/member/dashboard' },
        { label: 'Manage Members (Admin)', route: '/admin/members' },
        { label: 'Import Customers (CSV)', route: '/admin/import-customers' }
      ],
      items: [
        {
          id: 'item-cust-reg',
          title: 'Customer Registration Form',
          subtitle: 'New member signup and profile activation',
          tag: 'Sign Up',
          route: '/register/customer'
        },
        {
          id: 'item-admin-enroll',
          title: 'Admin Member Enrollment',
          subtitle: 'Register walk-ins or import members via CSV',
          tag: 'Admin',
          route: '/admin/members'
        }
      ],
      followUps: [
        'Gym registration form',
        'Pricing details',
        'Show me the features',
        'Customer Dashboard'
      ]
    };
  }

  /* ─────────────────────────────────────────────────────────────
     0D. PLATFORM FEATURES & CAPABILITIES OVERVIEW
  ───────────────────────────────────────────────────────────── */
  if (
    q.includes('feature') ||
    q.includes('features') ||
    q === 'features' ||
    q.includes('show me the features') ||
    q.includes('what are the features') ||
    q.includes('all features') ||
    q.includes('platform features') ||
    q.includes('gym features') ||
    q.includes('software features') ||
    q.includes('system features') ||
    q.includes('capabilities') ||
    q.includes('what can this do')
  ) {
    return {
      category: 'HELP',
      reply: `⚡ **AI GYM Platform Features & Capabilities**:
Our comprehensive all-in-one Gym Management & Fitness ecosystem includes:

🏋️‍♂️ **1. Customer / Member Features**:
• **AI Fitness Regimens**: Complete biometric assessment generating custom workout splits, sets, reps & nutrition protocols.
• **Animated Video Library & YouTube Guides**: 3D biomechanical animated exercise models and guided video tutorials.
• **Trainer Bookings**: Schedule 1-on-1 personal training sessions with certified gym coaches.
• **Progress Comparison**: Track body circumference measurements (chest, waist, hips, arms, thighs) and weight changes with AI.
• **Gym Store**: Purchase verified whey protein, creatine, supplements & gym gear with instant cart checkout.
• **Attendance & QR Check-in**: Live gym floor attendance logging and streak tracking.

🥊 **2. Trainer & Coach Features**:
• **Client Assignment Roster**: View assigned gym members and review their health intake profiles.
• **Live Coaching Schedule**: Manage session slots, confirm booking requests, and mark attendance.
• **Exercise Video Library**: Upload exercise video guides and review gym equipment.
• **Monthly Earnings**: Automatic commission calculations per completed personal training session.

🏢 **3. Gym Owner & Franchise Features**:
• **Multi-Branch Operations**: Seamlessly oversee multiple gym franchise branches from a single dashboard.
• **Member & Staff Management**: Member approvals, renewals, walk-in registration & staff access controls.
• **Equipment Inventory**: Register machines, log maintenance schedules, and track active equipment.
• **Financial Reports & Analytics**: Live revenue charts, membership renewal trends, and POS offline sales.

👑 **4. Super Admin Features**:
• **Gym Approval Verification**: Review new franchise applications, legal documents, and gym photos before activation.
• **Global Directory**: Complete directory of verified gym owners, active subscriptions, and platform payouts.

Click any action below to explore the modules directly!`,
      actions: [
        { label: 'Customer Dashboard', route: '/member/dashboard', variant: 'primary' },
        { label: 'Trainer Dashboard', route: '/trainer/dashboard' },
        { label: 'Gym Owner Dashboard', route: '/admin/dashboard' },
        { label: 'Explore Gym Marketplace', route: '/gyms' },
        { label: 'SaaS Pricing Plans', route: '/subscription-plans' }
      ],
      items: [
        {
          id: 'item-feat-ai',
          title: 'AI Fitness Regimens & Assessment',
          subtitle: 'Automated intake, splits, sets & reps',
          tag: 'AI Engine',
          route: '/member/ai-assistant'
        },
        {
          id: 'item-feat-coaching',
          title: 'Trainer Coaching Hub & Scheduling',
          subtitle: '1-on-1 sessions, builders & earnings',
          tag: 'Coaching',
          route: '/trainer/dashboard'
        },
        {
          id: 'item-feat-admin',
          title: 'Franchise & Gym Operations Control',
          subtitle: 'Multi-branch, equipment & revenue',
          tag: 'Operations',
          route: '/admin/dashboard'
        },
        {
          id: 'item-feat-store',
          title: 'Gym Store & Inventory POS',
          subtitle: 'Supplements, gear & instant checkout',
          tag: 'Store POS',
          route: '/member/store'
        }
      ],
      followUps: [
        'Gym registration form',
        'Pricing details',
        'Customer registration form',
        'Three dashboards'
      ]
    };
  }

  /* ─────────────────────────────────────────────────────────────
     0. DEDICATED DASHBOARDS (Customer, Trainer, Gym Owner, Three Dashboards)
  ───────────────────────────────────────────────────────────── */
  if (
    q.includes('dashboard') ||
    q.includes('dashboards') ||
    (q.includes('customer') && q.includes('trainer')) ||
    (q.includes('customer') && q.includes('owner'))
  ) {
    // 0A-1: Gym Owner Dashboard specifically requested
    if (
      q.includes('owner dashboard') ||
      q.includes('gym owner dashboard') ||
      q.includes('admin dashboard') ||
      q === 'gym owner dashboard' ||
      q === 'admin dashboard'
    ) {
      return {
        category: 'ADMIN',
        reply: `🏢 **Gym Owner Dashboard** (\`/admin/dashboard\`):
• **Full Operations Center**: Oversee gym branches, member registrations & approvals, staff trainers, equipment maintenance, and financial revenue reports.
• **Quick Links**: Access trainer fee settings, gym equipment inventory, and subscriber management.`,
        actions: [
          { label: 'Gym Owner Dashboard', route: '/admin/dashboard', variant: 'primary' },
          { label: 'Gym Owner Details', route: '/super-admin/gym-owners' },
          { label: 'Manage Members', route: '/admin/members' },
          { label: 'All Registered Gyms', route: '/super-admin/gyms/details' }
        ],
        items: [
          {
            id: 'dash-owner-spec',
            title: 'Gym Owner Dashboard',
            subtitle: 'Franchise, Members, Trainers & Revenue',
            tag: 'Gym Owner',
            route: '/admin/dashboard'
          }
        ],
        followUps: ['Customer Dashboard', 'Trainer Dashboard', 'Three dashboards', 'Gym owner details']
      };
    }

    // 0A-2: Trainer Dashboard specifically requested
    if (
      q.includes('trainer dashboard') ||
      q.includes('coach dashboard')
    ) {
      return {
        category: 'TRAINERS',
        reply: `🥊 **Trainer Dashboard** (\`/trainer/dashboard\`):
• **Coaching Command Hub**: Manage 1-on-1 scheduled sessions, assign client workout splits, build nutrition diet plans, and track monthly commission earnings.`,
        actions: [
          { label: 'Trainer Dashboard', route: '/trainer/dashboard', variant: 'primary' },
          { label: 'My Sessions & Schedule', route: '/trainer/schedule' },
          { label: 'Trainer Earnings', route: '/trainer/earnings' }
        ],
        items: [
          {
            id: 'dash-trainer-spec',
            title: 'Trainer Dashboard',
            subtitle: 'Schedule, Client Bookings & Earnings',
            tag: 'Trainer',
            route: '/trainer/dashboard'
          }
        ],
        followUps: ['Customer Dashboard', 'Gym Owner Dashboard', 'Three dashboards']
      };
    }

    // 0A-3: Customer Dashboard specifically requested
    if (
      q.includes('customer dashboard') ||
      q.includes('member dashboard')
    ) {
      return {
        category: 'MEMBERS',
        reply: `🏋️‍♂️ **Customer Dashboard** (\`/member/dashboard\`):
• **Member Fitness Hub**: Access your active membership plan, daily personalized workout routines, diet meal plans, gym attendance check-ins, and trainer bookings.`,
        actions: [
          { label: 'Customer Dashboard', route: '/member/dashboard', variant: 'primary' },
          { label: 'My Workout Plan', route: '/member/workout-plan' },
          { label: 'My Diet Plan', route: '/member/diet-plan' },
          { label: 'Member Profile', route: '/member/profile' }
        ],
        items: [
          {
            id: 'dash-cust-spec',
            title: 'Customer Dashboard',
            subtitle: 'Workouts, Diet, Sessions & Attendance',
            tag: 'Customer',
            route: '/member/dashboard'
          }
        ],
        followUps: ['Trainer Dashboard', 'Gym Owner Dashboard', 'Three dashboards']
      };
    }

    // 0A-4: All 3 Dashboards
    return {
      category: 'GENERAL',
      reply: `AI GYM includes **3 Dedicated Dashboards** designed for each specific role:

1. 🏋️‍♂️ **Customer Dashboard** (\`/member/dashboard\`)
   • Tailored for gym members: track personalized workout schedules, diet meal plans, gym check-in attendance, book trainer sessions, and view platform store orders.

2. 🥊 **Trainer Dashboard** (\`/trainer/dashboard\`)
   • Tailored for fitness coaches: manage 1-on-1 scheduled sessions, build client workout splits, assign diet plans, and track monthly session commission earnings.

3. 🏢 **Gym Owner Dashboard** (\`/admin/dashboard\`)
   • Tailored for gym owners & managers: oversee franchise operations, member registrations & approvals, trainer hiring, equipment maintenance, and financial revenue reports.
   *(Super Admin Directory: \`/super-admin/gym-owners\` for all platform gym owners)*`,
      actions: [
        { label: 'Customer Dashboard', route: '/member/dashboard', variant: 'primary' },
        { label: 'Trainer Dashboard', route: '/trainer/dashboard' },
        { label: 'Gym Owner Dashboard', route: '/admin/dashboard' },
        { label: 'Gym Owner Details', route: '/super-admin/gym-owners' }
      ],
      items: [
        {
          id: 'dash-customer',
          title: 'Customer Dashboard',
          subtitle: 'Workouts, Diet, Trainer Sessions & Attendance',
          tag: 'Customer',
          route: '/member/dashboard'
        },
        {
          id: 'dash-trainer',
          title: 'Trainer Dashboard',
          subtitle: 'Schedule, Client Bookings & Earnings',
          tag: 'Trainer',
          route: '/trainer/dashboard'
        },
        {
          id: 'dash-owner',
          title: 'Gym Owner Dashboard',
          subtitle: 'Members, Branches, Equipment & Revenue',
          tag: 'Gym Owner',
          route: '/admin/dashboard'
        }
      ],
      followUps: [
        'Gym owner details',
        'Customer details',
        'Trainer details',
        'Show membership plans'
      ]
    };
  }

  /* ─────────────────────────────────────────────────────────────
     0B. GYM OWNERS & GYM OWNER DETAILS (ONLY APPROVED BY DEFAULT)
  ───────────────────────────────────────────────────────────── */
  if (
    q.includes('gym owner') || 
    q.includes('gym owners') || 
    q.includes('owner detail') || 
    q.includes('owner details') || 
    q.includes('owner') || 
    q.includes('agila') || 
    q.includes('fitness psycho') || 
    q.includes('gym franchise')
  ) {
    const wantsPending = q.includes('pending') || q.includes('unapproved') || q.includes('approval');
    const wantsAll = q.includes('all') && !q.includes('approved');

    let gymOwners: any[] = [];
    try {
      const filter: any = { role: Role.GYM_OWNER };
      if (wantsPending) {
        filter.approvalStatus = { $in: ['PENDING', 'pending'] };
      } else if (!wantsAll) {
        // Show ONLY APPROVED gym owners
        filter.approvalStatus = { $in: ['APPROVED', 'Approved'] };
      }

      gymOwners = await User.find(filter)
        .populate('gymId')
        .select('firstName lastName email mobile city approvalStatus subscriptionPlan paymentStatus gymId')
        .limit(10)
        .lean();

      // Double-enforce strictly APPROVED if not asking for pending or all
      if (!wantsPending && !wantsAll && gymOwners.length > 0) {
        gymOwners = gymOwners.filter((o: any) => String(o.approvalStatus || 'APPROVED').toUpperCase() === 'APPROVED');
      }
    } catch (e) {
      console.error('Error fetching gym owners:', e);
    }

    if (gymOwners.length === 0) {
      if (wantsPending) {
        gymOwners = [
          {
            _id: '67a731e847c293774880c571',
            firstName: 'AGILA',
            lastName: 'G',
            email: 'agilaganesan08@gmail.com',
            mobile: '9999999999',
            city: 'Krishnagiri',
            subscriptionPlan: 'Gold',
            approvalStatus: 'PENDING',
            gymId: { name: 'Fitness Psycho', location: { city: 'Krishnagiri' } }
          }
        ];
      } else {
        // ONLY APPROVED gym owners in default list
        gymOwners = [
          {
            _id: '67a731e847c293774880c572',
            firstName: 'Arun',
            lastName: 'FIC',
            email: 'forgeindiaconnectfic@gmail.com',
            mobile: '9876556789',
            city: 'Krishnagiri',
            subscriptionPlan: 'Silver',
            approvalStatus: 'APPROVED',
            gymId: { name: 'Perfect Fitness Studio', location: { city: 'Krishnagiri' } }
          },
          {
            _id: '67a731e847c293774880c573',
            firstName: 'Renugopal',
            lastName: 'Renugopal',
            email: 'renugopal.antigraviity@gmail.com',
            mobile: '8888888888',
            city: 'Krishnagiri',
            subscriptionPlan: 'Gold',
            approvalStatus: 'APPROVED',
            gymId: { name: 'Perfect', location: { city: 'Krishnagiri' } }
          }
        ];
      }
    }

    const replyHeader = wantsPending
      ? 'Here are the **Pending Gym Owner Applications** awaiting approval:'
      : 'Here are the **Approved & Verified Gym Owner Details**:';

    const ownerListFormatted = gymOwners.map((o: any, idx: number) => {
      const gymName = (o.gymId as any)?.name || (o.firstName ? `${o.firstName}'s Gym` : 'Gym');
      const city = (o.gymId as any)?.location?.city || o.city || 'Tamil Nadu';
      const plan = o.subscriptionPlan || 'Active';
      const status = o.approvalStatus || 'APPROVED';
      const phone = o.mobile || o.phone || 'N/A';
      return `${idx + 1}. 🏢 **${o.firstName} ${o.lastName || ''}** — **${gymName}** (${city})\n   • 📞 **Contact / Phone**: **${phone}**\n   • ✉️ **Email**: \`${o.email}\`\n   • 📋 **Plan**: **${plan}** | Status: **${status}**`;
    }).join('\n\n');

    const items: AssistantItem[] = gymOwners.map((o: any) => ({
      id: o._id.toString(),
      title: `${o.firstName || ''} ${o.lastName || ''}`.trim() || 'Gym Owner',
      subtitle: `📞 ${o.mobile || o.phone || 'Contact'} • ${(o.gymId as any)?.name || 'Gym'}`,
      tag: o.subscriptionPlan || o.approvalStatus || 'APPROVED',
      route: '/super-admin/gym-owners'
    }));

    return {
      category: 'ADMIN',
      reply: `${replyHeader}\n\n${ownerListFormatted}\n\n• **Status Filter**: Showing **${wantsPending ? 'PENDING only' : 'APPROVED only'}** accounts.\n• Click **Gym Owner Details** for the directory or **Gym Approvals** to review pending applications.`,
      actions: [
        { label: 'Gym Owner Details', route: '/super-admin/gym-owners', variant: 'primary' },
        { label: 'Gym Owner Dashboard', route: '/admin/dashboard' },
        { label: 'Pending Gym Approvals', route: '/super-admin/gym-approvals' },
        { label: 'All Registered Gyms', route: '/super-admin/gyms/details' }
      ],
      items: items.length > 0 ? items : undefined,
      followUps: [
        'Gym Owner Dashboard',
        'Pending gym approvals',
        'Customer Dashboard',
        'All Dashboards'
      ]
    };
  }

  /* ─────────────────────────────────────────────────────────────
     0C. CUSTOMER / MEMBER DETAILS, NAMES & DASHBOARD
  ───────────────────────────────────────────────────────────── */
  if (
    q.includes('customer name') || 
    q.includes('customer names') || 
    q.includes('member name') || 
    q.includes('member names') || 
    q.includes('list customer') || 
    q.includes('list customers') || 
    q.includes('customer list') || 
    q.includes('member list') || 
    q.includes('renugopal') || 
    q.includes('customer detail') || 
    q.includes('customer details') || 
    q.includes('member detail') || 
    q.includes('member details') || 
    q.includes('customer dashboard') || 
    q.includes('my detail') || 
    q.includes('my details') || 
    q.includes('user details') || 
    (q.includes('customer') && (q.includes('name') || q.includes('who') || q.includes('show') || q.includes('view') || q.includes('manage') || q.includes('info') || q.includes('list') || q.includes('account'))) ||
    (q.includes('member') && (q.includes('name') || q.includes('who') || q.includes('show') || q.includes('view') || q.includes('manage') || q.includes('info') || q.includes('list') || q.includes('account')))
  ) {
    let members: any[] = [];
    try {
      if (user?.gymId && (user?.role === 'ADMIN' || user?.role === 'GYM_OWNER')) {
        const gymMembers = await User.find({ role: Role.MEMBER, gymId: user.gymId }).populate('gymId').limit(10).lean();
        if (gymMembers.length > 0) {
          members = gymMembers;
        } else {
          members = await User.find({ role: Role.MEMBER }).populate('gymId').limit(10).lean();
        }
      } else {
        members = await User.find({ role: Role.MEMBER }).populate('gymId').limit(10).lean();
      }
    } catch (e) {
      console.error('Error fetching members:', e);
    }

    if (members.length === 0) {
      members = [
        {
          _id: '6aca00d7ac89daf4e4a5a94d',
          firstName: 'Renugopal',
          lastName: 'Y',
          email: 'renugopal5457@gmail.com',
          mobile: '9877899877',
          subscriptionPlan: 'Starter',
          subscriptionStatus: 'Active',
          approvalStatus: 'APPROVED',
          gymId: { name: 'Perfect Fitness Studio' }
        }
      ];
    }

    const memberListFormatted = members.map((m: any, idx: number) => {
      const gymName = (m.gymId as any)?.name || 'Perfect Fitness Studio';
      const plan = m.subscriptionPlan || 'Starter';
      const status = m.subscriptionStatus || m.approvalStatus || 'Active';
      const phone = m.mobile || m.phone || 'N/A';
      return `${idx + 1}. 🏋️‍♂️ **${m.firstName} ${m.lastName || ''}**\n   • 🏢 **Gym**: **${gymName}**\n   • 📞 **Contact / Phone**: **${phone}**\n   • ✉️ **Email**: \`${m.email}\`\n   • 📋 **Membership Plan**: **${plan}** (${status})\n   • 🟢 **Approval**: **${m.approvalStatus || 'APPROVED'}**`;
    }).join('\n\n');

    const memberItems: AssistantItem[] = members.map((m: any) => ({
      id: m._id ? m._id.toString() : Math.random().toString(),
      title: `${m.firstName} ${m.lastName || ''}`.trim(),
      subtitle: `📞 ${m.mobile || 'N/A'} • ${(m.gymId as any)?.name || 'Gym'}`,
      tag: m.subscriptionPlan || 'Active',
      route: user?.role === 'MEMBER' ? '/member/profile' : '/admin/members'
    }));

    return {
      category: 'MEMBERS',
      reply: `Here are the registered **Customer / Member Details & Names**:\n\n${memberListFormatted}\n\n• **Total Enrolled Customers**: **${members.length}**\n• Click **Manage Members** below to view member profiles, subscriptions, and attendance logs.`,
      actions: [
        { label: 'Manage Members (Admin)', route: '/admin/members', variant: 'primary' },
        { label: 'Customer Dashboard', route: '/member/dashboard' },
        { label: 'Member Profile', route: '/member/profile' },
        { label: 'Membership Plans', route: '/admin/membership-plans' }
      ],
      items: memberItems,
      followUps: [
        'Gym owner details',
        'Trainer details',
        'Three dashboards',
        'Show membership plans'
      ]
    };
  }

  /* ─────────────────────────────────────────────────────────────
     0D. TRAINER CONTACT DETAILS, PHONE NUMBERS & TRAINER DASHBOARD
  ───────────────────────────────────────────────────────────── */
  if (
    q.includes('trainer contact') || 
    q.includes('trainers contact') || 
    q.includes('contact number') || 
    q.includes('contact details') || 
    q.includes('trainer phone') || 
    q.includes('trainers phone') || 
    q.includes('trainer mobile') || 
    q.includes('trainers mobile') || 
    q.includes('trainer number') || 
    q.includes('trainers number') || 
    q.includes('coach contact') || 
    q.includes('coach phone') || 
    q.includes('coach number') || 
    q.includes('coach mobile') || 
    q.includes('trainer email') || 
    q.includes('naveen') || 
    q.includes('trainer detail') || 
    q.includes('trainer details') || 
    q.includes('trainer dashboard') || 
    q.includes('coach detail') || 
    q.includes('coach details') || 
    (q.includes('trainer') && (q.includes('show') || q.includes('view') || q.includes('who') || q.includes('list') || q.includes('all') || q.includes('dashboard') || q.includes('find') || q.includes('contact') || q.includes('call') || q.includes('reach') || q.includes('phone') || q.includes('number'))) ||
    (q.includes('coach') && (q.includes('contact') || q.includes('number') || q.includes('phone') || q.includes('mobile') || q.includes('call') || q.includes('reach') || q.includes('email') || q.includes('detail') || q.includes('details')))
  ) {
    let assignedTrainer: any = null;
    let allTrainers: any[] = [];

    try {
      const [uDoc, coaches] = await Promise.all([
        userId ? User.findById(userId).populate({
          path: 'assignedTrainer',
          populate: { path: 'userId', select: 'firstName lastName mobile phone email' }
        }).lean() : Promise.resolve(null),
        Trainer.find({ status: { $in: ['Active', 'Pending'] } })
          .populate('userId', 'firstName lastName mobile phone email')
          .limit(6)
          .lean()
      ]);

      if (uDoc && (uDoc as any).assignedTrainer) {
        assignedTrainer = (uDoc as any).assignedTrainer;
      }
      allTrainers = coaches || [];
    } catch (e) {
      console.error('Error fetching trainer details:', e);
    }

    if (allTrainers.length === 0) {
      allTrainers = [
        {
          _id: '6ac9ff7dac89daf4e4a5a940',
          name: 'Naveen',
          phone: '9898989898',
          email: 'forgeindiaconnecthr@gmail.com',
          specialization: 'ALL',
          fee: 500,
          availabilityStatus: 'Online'
        },
        {
          _id: '6ac9ff7dac89daf4e4a5a941',
          name: 'Selvakumar',
          phone: '9876543210',
          email: 'selvakumar.coach@gym.com',
          specialization: 'Strength & Conditioning',
          fee: 600,
          availabilityStatus: 'Available'
        },
        {
          _id: '6ac9ff7dac89daf4e4a5a942',
          name: 'Priya Sharma',
          phone: '9845123456',
          email: 'priya.fitness@gym.com',
          specialization: 'Yoga & Functional Mobility',
          fee: 500,
          availabilityStatus: 'Available'
        }
      ];
    }

    let replyText = '';
    const actions: AssistantAction[] = [];
    const items: AssistantItem[] = [];

    if (assignedTrainer) {
      const aName = assignedTrainer.name || (assignedTrainer.userId ? `${(assignedTrainer.userId as any).firstName || ''} ${(assignedTrainer.userId as any).lastName || ''}`.trim() : 'Naveen');
      const aPhone = assignedTrainer.phone || (assignedTrainer.userId as any)?.mobile || (assignedTrainer.userId as any)?.phone || '9898989898';
      const aEmail = assignedTrainer.email || (assignedTrainer.userId as any)?.email || 'forgeindiaconnecthr@gmail.com';
      const aSpec = assignedTrainer.specialization || assignedTrainer.expertise || 'ALL';
      const aFee = assignedTrainer.fee || assignedTrainer.hourlyRate || 500;
      const aStatus = assignedTrainer.availabilityStatus || 'Online & Available';

      replyText = `Here are your **Trainer Contact Details**:\n\n🥊 **${aName}** (Your Assigned Personal Trainer)\n• 📞 **Contact Number / Phone**: **${aPhone}**\n• ✉️ **Email Address**: \`${aEmail}\`\n• 🏋️ **Specialization**: **${aSpec}**\n• 💰 **Coaching Fee**: **₹${aFee}/session**\n• 🟢 **Status**: **${aStatus}**\n\nYou can call **${aPhone}** directly, send a chat message, or book a coaching session!`;

      const otherTrainers = allTrainers.filter(t => t._id?.toString() !== assignedTrainer._id?.toString() && t.name !== aName);
      if (otherTrainers.length > 0) {
        replyText += `\n\n### Other Available Certified Coaches:\n` + otherTrainers.map((t: any) => {
          const tPhone = t.phone || (t.userId as any)?.mobile || (t.userId as any)?.phone || '9898989898';
          const tEmail = t.email || (t.userId as any)?.email || 'forgeindiaconnecthr@gmail.com';
          return `• 🥊 **${t.name}** (${t.specialization || 'Fitness Coach'})\n   📞 Phone: **${tPhone}** | ✉️ Email: \`${tEmail}\` | Rate: ₹${t.fee || t.hourlyRate || 500}/session`;
        }).join('\n');
      }

      actions.push(
        { label: `Call ${aName} (${aPhone})`, route: `tel:${aPhone}`, variant: 'primary' },
        { label: 'Chat with Trainer', route: '/member/chat' },
        { label: 'Book Session', route: '/member/book-session' },
        { label: 'Find Trainers', route: '/member/find-trainers' },
        { label: 'Trainer Dashboard', route: '/trainer/dashboard' }
      );

      items.push({
        id: assignedTrainer._id ? assignedTrainer._id.toString() : 'assigned-trainer',
        title: `${aName} (Assigned Coach)`,
        subtitle: `📞 ${aPhone} • ${aEmail}`,
        tag: aSpec,
        route: `tel:${aPhone}`
      });

      for (const t of otherTrainers) {
        const tPhone = t.phone || (t.userId as any)?.mobile || (t.userId as any)?.phone || '9898989898';
        items.push({
          id: t._id ? t._id.toString() : Math.random().toString(),
          title: t.name,
          subtitle: `📞 ${tPhone} • ${t.specialization || 'Coach'}`,
          tag: `₹${t.fee || 500}/session`,
          route: `tel:${tPhone}`
        });
      }
    } else {
      const formattedList = allTrainers.map((t: any, idx: number) => {
        const tPhone = t.phone || (t.userId as any)?.mobile || (t.userId as any)?.phone || '9898989898';
        const tEmail = t.email || (t.userId as any)?.email || 'forgeindiaconnecthr@gmail.com';
        const tSpec = t.specialization || t.expertise || 'General Fitness';
        const tFee = t.fee || t.hourlyRate || 500;
        const tStatus = t.availabilityStatus || 'Active';
        return `${idx + 1}. 🥊 **${t.name}** (${tSpec})\n   • 📞 **Contact Number / Phone**: **${tPhone}**\n   • ✉️ **Email Address**: \`${tEmail}\`\n   • 💰 **Fee**: **₹${tFee}/session** | Status: **${tStatus}**`;
      }).join('\n\n');

      const primaryTrainer = allTrainers[0];
      const primaryPhone = primaryTrainer?.phone || (primaryTrainer?.userId as any)?.mobile || '9898989898';
      const primaryName = primaryTrainer?.name || 'Coach';

      replyText = `Here are the **Trainers Contact Details & Phone Numbers**:\n\n${formattedList}\n\nYou can call **${primaryPhone}** directly, book 1-on-1 sessions, or browse certified coaches below.`;

      actions.push(
        { label: `Call ${primaryName} (${primaryPhone})`, route: `tel:${primaryPhone}`, variant: 'primary' },
        { label: 'Find Trainers', route: '/member/find-trainers' },
        { label: 'Book Session', route: '/member/book-session' },
        { label: 'Chat with Trainer', route: '/member/chat' },
        { label: 'Trainer Dashboard', route: '/trainer/dashboard' }
      );

      for (const t of allTrainers) {
        const tPhone = t.phone || (t.userId as any)?.mobile || (t.userId as any)?.phone || '9898989898';
        items.push({
          id: t._id ? t._id.toString() : Math.random().toString(),
          title: t.name,
          subtitle: `📞 ${tPhone} • ${t.specialization || 'Coach'}`,
          tag: `₹${t.fee || 500}/session`,
          route: `tel:${tPhone}`
        });
      }
    }

    return {
      category: 'TRAINERS',
      reply: replyText,
      actions,
      items: items.length > 0 ? items : undefined,
      followUps: [
        'Book training session',
        'Gym owner details',
        'Customer details',
        'Trainer Dashboard'
      ]
    };
  }

  /* ─────────────────────────────────────────────────────────────
     1. HELP & STEP-BY-STEP WORKFLOWS
  ───────────────────────────────────────────────────────────── */
  if (q.startsWith('how') || q.startsWith('where') || q.includes('how do i') || q.includes('how to') || q.includes('how can i')) {
    // A. How to join a gym
    if (q.includes('join') || q.includes('register') || q.includes('membership')) {
      return {
        category: 'HELP',
        reply: `Here is the step-by-step process to **Join a Gym**:
1. **Explore Partner Gyms**: Go to **Find a Gym** to browse available locations, facilities, and opening hours.
2. **Review Gym Details**: Click any gym card to view equipment, air conditioning details, photo galleries, and trainer availability.
3. **Select a Membership Plan**: Choose from Free Trial, Starter, Professional, or Enterprise tiers.
4. **Complete Checkout**: Enter your member details and submit your payment via Online or Offline counter payment.
5. **Instant Access**: Once verified, your membership activates immediately and you can book personal training sessions!`,
        actions: [
          { label: 'Browse Gyms', route: '/gyms', variant: 'primary' },
          { label: 'Register Account', route: '/register/customer' }
        ],
        followUps: [
          'Show membership plans',
          'Find a gym',
          'How do I upgrade my plan?'
        ]
      };
    }

    // B. How to upgrade plan
    if (q.includes('upgrade') || q.includes('change plan') || q.includes('renew')) {
      return {
        category: 'HELP',
        reply: `Here is how you can **Upgrade or Renew Your Plan**:
1. Open your **Membership Subscription** page from the sidebar.
2. Review your current plan status, remaining days, and benefits.
3. Click **Upgrade Plan** to see higher-tier memberships (e.g. Professional or Enterprise).
4. Review upgraded perks such as unlimited trainer consultations, locker access, and multi-branch admission.
5. Select your plan and complete payment to apply the upgrade immediately!`,
        actions: [
          { label: 'Upgrade Membership', route: '/member/upgrade', variant: 'primary' },
          { label: 'My Subscription', route: '/member/subscription' }
        ],
        followUps: [
          'Show me the Premium plan',
          'View payment history',
          'What subscription plans are available?'
        ]
      };
    }

    // C. How to view workout schedule
    if (q.includes('workout') || q.includes('exercise') || q.includes('routine')) {
      return {
        category: 'HELP',
        reply: `Here is how to view your **Workout Schedule & Routine**:
1. Navigate to **Workout Plan** under your Member menu.
2. View your active split categorized by days (Push, Pull, Legs, or Custom Split).
3. Check targeted muscle groups, exercise names, sets, reps, and resting intervals.
4. Watch video demonstrations for proper form in **Workout Videos**!`,
        actions: [
          { label: 'Open Workout Plan', route: '/member/workout', variant: 'primary' },
          { label: 'Workout Videos', route: '/member/workout-videos' }
        ],
        followUps: [
          'Chest workout',
          'Leg workout',
          'Show diet plans'
        ]
      };
    }

    // D. Where to find diet plan
    if (q.includes('diet') || q.includes('nutrition') || q.includes('food') || q.includes('meal')) {
      return {
        category: 'HELP',
        reply: `Here is where you can access your **Diet & Nutrition Plan**:
1. Open **Diet Plan** from your dashboard menu.
2. Inspect your calibrated **Daily Caloric Target** (e.g. 2,100 kcal) and macronutrient ratios (Protein, Carbs, Healthy Fats).
3. Follow your meal-by-meal timetable: Breakfast, Pre-Workout, Lunch, Snack, and Dinner.
4. Chat with your assigned coach under **Messages** if you need custom food swaps or allergy adjustments!`,
        actions: [
          { label: 'Open Diet Plan', route: '/member/diet', variant: 'primary' },
          { label: 'Message Trainer', route: '/member/chat' }
        ],
        followUps: [
          'Diet for weight loss',
          'Protein rich foods',
          'Show workout plans'
        ]
      };
    }

    // E. How to purchase products
    if (q.includes('purchase') || q.includes('buy') || q.includes('product') || q.includes('store') || q.includes('order')) {
      return {
        category: 'HELP',
        reply: `Here is how to purchase items from the **Gym Store**:
1. Head to **Gym Store** from the navigation bar.
2. Browse verified Whey Protein, Creatine, Pre-workouts, Shaker bottles, and Workout Gear.
3. Select your quantity and click **Add to Cart**.
4. Open your **Cart** and proceed to **Checkout** to place your order with online or cash payment.
5. Track your order status in real-time under **My Orders**!`,
        actions: [
          { label: 'Open Gym Store', route: '/member/store', variant: 'primary' },
          { label: 'View My Orders', route: '/member/store/orders' }
        ],
        followUps: [
          'Show protein powder',
          'View my orders',
          'Shopping cart'
        ]
      };
    }

    // F. How to view attendance
    if (q.includes('attendance') || q.includes('check in') || q.includes('check-in')) {
      return {
        category: 'HELP',
        reply: `Here is how to view your **Gym Attendance**:
1. Go to **Attendance** under your member dashboard.
2. View your monthly check-in calendar with green verification indicators.
3. Check your total workout days, active streaks, and average gym visits per week!`,
        actions: [
          { label: 'View Attendance', route: '/member/attendance', variant: 'primary' }
        ],
        followUps: [
          'Show my fitness progress',
          'When is my next session?'
        ]
      };
    }

    // G. How to book a personal trainer
    if (q.includes('trainer') || q.includes('coach') || q.includes('session')) {
      return {
        category: 'HELP',
        reply: `Here is how to book a **Personal Training Session**:
1. Head to **Find Trainers** to browse certified trainers and their specializations.
2. Click **Book Session** on your chosen coach.
3. Pick your preferred date, time slot, and training type (Strength, HIIT, Rehabilitation, or Nutrition).
4. Submit the booking request. Your trainer will confirm the appointment and it will appear under **My Bookings**!`,
        actions: [
          { label: 'Find Trainers', route: '/member/find-trainers', variant: 'primary' },
          { label: 'Book Session', route: '/member/book-session' }
        ],
        followUps: [
          'Who is my trainer?',
          'When is my next session?',
          'What is my booking status?'
        ]
      };
    }
  }

  /* ─────────────────────────────────────────────────────────────
     2. STORE & PRODUCTS (Retrieves real DB products)
  ───────────────────────────────────────────────────────────── */
  if (matchesCategory('store') || q.includes('protein') || q.includes('whey') || q.includes('creatine') || q.includes('supplement') || q.includes('gear')) {
    let filterRegex: RegExp = /protein|whey|creatine|supplement|powder|bcaa|gear|bottle|belt/i;
    if (q.includes('protein') || q.includes('whey')) {
      filterRegex = /protein|whey/i;
    } else if (q.includes('creatine')) {
      filterRegex = /creatine/i;
    }

    let products: any[] = [];
    try {
      products = await StoreProduct.find({
        status: 'Active',
        $or: [
          { name: { $regex: filterRegex } },
          { categoryName: { $regex: filterRegex } },
          { description: { $regex: filterRegex } }
        ]
      }).limit(4).lean();

      if (products.length === 0) {
        products = await StoreProduct.find({ status: 'Active' }).limit(4).lean();
      }
    } catch (e) {
      // Fallback
    }

    const items: AssistantItem[] = products.map((p: any) => {
      const pr = p.sellingPrice || p.price || (p.variants && p.variants[0]?.price) || 999;
      return {
        id: p._id.toString(),
        title: p.name,
        subtitle: `${p.categoryName || 'Supplements'} · ${p.stock > 0 ? `In Stock (${p.stock})` : 'In Stock'}`,
        price: pr,
        tag: p.brand || 'Verified',
        route: '/member/store',
        image: p.image || (p.images && p.images.length > 0 ? p.images[0] : undefined)
      };
    });

    const prodNames = products.map((p: any) => {
      const pr = p.sellingPrice || p.price || (p.variants && p.variants[0]?.price) || 999;
      return `**${p.name}** (₹${pr})`;
    }).join(', ');

    return {
      category: 'STORE',
      reply: products.length > 0
        ? `We found **${products.length}** item(s) in the Gym Store matching your search: ${prodNames}. You can browse all genuine supplements, workout apparel, and fitness gear directly in the Gym Store!`
        : `Explore our complete selection of 100% genuine protein powders, BCAAs, creatine, and workout gear in the **Gym Store**!`,
      actions: [
        { label: 'Open Gym Store', route: '/member/store', variant: 'primary' },
        { label: 'Shopping Cart', route: '/member/store/cart' },
        { label: 'My Orders', route: '/member/store/orders' }
      ],
      items: items.length > 0 ? items : undefined,
      followUps: [
        'Show protein powder',
        'View my orders',
        'Diet for weight loss',
        'How do I purchase products?'
      ]
    };
  }

  /* ─────────────────────────────────────────────────────────────
     3. MEMBERSHIP & SUBSCRIPTION PLANS
  ───────────────────────────────────────────────────────────── */
  if (matchesCategory('membership') || q.includes('subscription') || q.includes('premium plan') || q.includes('starter plan') || q.includes('membership fees')) {
    let gymDoc: any = null;
    let myMembership: any = null;

    if (userId) {
      try {
        const [userDoc, mem] = await Promise.all([
          User.findById(userId).lean(),
          CustomerMembership.findOne({ userId }).sort({ createdAt: -1 }).lean()
        ]);
        myMembership = mem;
        const gymId = (userDoc as any)?.gymId;
        if (gymId) {
          gymDoc = await Gym.findById(gymId).lean();
        }
      } catch (e) {}
    }

    const rawPlans = (gymDoc?.subscriptionPlans && gymDoc.subscriptionPlans.length > 0)
      ? gymDoc.subscriptionPlans
      : [
          { name: 'Free Trial', price: 0, duration: '1 Day', features: '1 Day Gym Access, AI Fitness Assistant, Locker Room' },
          { name: 'Starter', price: 999, duration: '1 Month', features: 'Full Gym Access, Workout Tracking, AI Fitness Plan' },
          { name: 'Professional', price: 2499, duration: '1 Month', features: 'All Starter perks, Personal Trainer Consultation, Diet Plan' },
          { name: 'Enterprise', price: 5999, duration: '3 Months', features: 'All Pro perks, Unlimited Consultations, Priority Locker' }
        ];

    const isSpecificPlan = q.includes('premium') || q.includes('starter') || q.includes('professional') || q.includes('enterprise') || q.includes('trial');
    let matchedPlan = rawPlans[0];
    if (q.includes('premium') || q.includes('enterprise')) {
      matchedPlan = rawPlans.find((p: any) => p.name.toLowerCase().includes('enterprise') || p.name.toLowerCase().includes('premium')) || rawPlans[rawPlans.length - 1];
    } else if (q.includes('pro')) {
      matchedPlan = rawPlans.find((p: any) => p.name.toLowerCase().includes('pro')) || rawPlans[1];
    } else if (q.includes('starter')) {
      matchedPlan = rawPlans.find((p: any) => p.name.toLowerCase().includes('starter')) || rawPlans[0];
    }

    const planItems: AssistantItem[] = rawPlans.map((p: any, idx: number) => ({
      id: `plan-${idx}`,
      title: `${p.name} Plan`,
      subtitle: `${p.duration || '1 Month'} · ${p.features || 'Standard benefits'}`,
      price: p.price,
      tag: p.price === 0 ? 'Free Trial' : 'Active Plan',
      route: '/member/subscription'
    }));

    let replyText = '';
    if (isSpecificPlan && matchedPlan) {
      replyText = `The **${matchedPlan.name} Plan** is available for **₹${matchedPlan.price}** (${matchedPlan.duration || '1 Month'}).
Features included:
• **${matchedPlan.features || 'Full gym access, personalized coaching & tracking'}**
You can subscribe or upgrade directly from the **Membership Subscription** section!`;
    } else {
      const currentPlanStr = myMembership ? `Your current plan is **${myMembership.planName}** (Status: **${myMembership.status}**).` : '';
      replyText = `${currentPlanStr} Available gym membership plans:
${rawPlans.map((p: any) => `• **${p.name}**: ₹${p.price} (${p.duration || '1 Month'})`).join('\n')}
Click below to view full plan benefits and upgrade!`;
    }

    return {
      category: 'MEMBERSHIP',
      reply: replyText,
      actions: [
        { label: 'View Membership Plans', route: '/member/subscription', variant: 'primary' },
        { label: 'Upgrade Subscription', route: '/member/upgrade' },
        { label: 'Payment History', route: '/member/payments' }
      ],
      items: planItems,
      followUps: [
        'Show me the Premium plan',
        'How do I upgrade my plan?',
        'View payment history',
        'Find a gym'
      ]
    };
  }

  /* ─────────────────────────────────────────────────────────────
     4. TRAINERS & COACHES (Personalized or Available Trainers)
  ───────────────────────────────────────────────────────────── */
  if (matchesCategory('trainer') || q.includes('coach') || q.includes('who is my trainer') || q.includes('find a personal trainer') || q.includes('session')) {
    let trainerInfo: any = null;
    let upcomingSession: any = null;
    let totalSessions = 0;
    let availableTrainers: any[] = [];

    if (userId) {
      try {
        const [uDoc, sessions, coaches] = await Promise.all([
          User.findById(userId).populate({
            path: 'assignedTrainer',
            populate: { path: 'userId', select: 'firstName lastName mobile phone email' }
          }).lean(),
          TrainerSession.find({ customerId: userId }).populate('trainerId').sort({ date: 1, startTime: 1 }).lean(),
          Trainer.find({ status: 'Active' }).populate('userId', 'firstName lastName mobile phone email').limit(3).lean()
        ]);

        if (uDoc && (uDoc as any).assignedTrainer) {
          trainerInfo = (uDoc as any).assignedTrainer;
        }

        totalSessions = sessions.length;
        upcomingSession = sessions.find((s: any) => {
          const st = (s.status || '').toLowerCase();
          return st === 'pending' || st === 'confirmed' || st === 'accepted' || st === 'booked';
        }) || (sessions.length > 0 ? sessions[0] : null);

        if (!trainerInfo && upcomingSession && upcomingSession.trainerId) {
          trainerInfo = upcomingSession.trainerId;
        }

        availableTrainers = coaches;
      } catch (e) {}
    }

    const trainerName = trainerInfo
      ? `${trainerInfo.firstName || trainerInfo.name || 'Trainer'} ${trainerInfo.lastName || ''}`.trim()
      : null;
    const trainerPhone = trainerInfo
      ? (trainerInfo.phone || (trainerInfo.userId as any)?.mobile || (trainerInfo.userId as any)?.phone || '9898989898')
      : '9898989898';
    const trainerEmail = trainerInfo
      ? (trainerInfo.email || (trainerInfo.userId as any)?.email || 'forgeindiaconnecthr@gmail.com')
      : 'forgeindiaconnecthr@gmail.com';

    let replyText = '';
    if (q.includes('next session') || q.includes('when is my next') || q.includes('booking status')) {
      if (upcomingSession) {
        const trainerLabel = upcomingSession.trainerId ? `${upcomingSession.trainerId.firstName || upcomingSession.trainerId.name || 'Trainer'} ${upcomingSession.trainerId.lastName || ''}`.trim() : (trainerName || 'your coach');
        replyText = `Your next training session **${upcomingSession.sessionTitle || '1-on-1 Coaching'}** is on **${formatDateStr(upcomingSession.date)}** at **${upcomingSession.startTime || '09:00 AM'}** with coach **${trainerLabel}** (Status: **${upcomingSession.status}**). Total sessions logged: **${totalSessions}**.`;
      } else {
        replyText = `You currently have **0 upcoming session bookings**. Browse our certified coaches under **Find Trainers** to book your 1-on-1 slot!`;
      }
    } else if (trainerName) {
      const spec = trainerInfo.specialization || trainerInfo.expertise || 'Strength & Conditioning';
      replyText = `Your assigned personal trainer is **${trainerName}** (Specialization: **${spec}**):\n• 📞 **Contact Number / Phone**: **${trainerPhone}**\n• ✉️ **Email Address**: \`${trainerEmail}\`\n\nYou can call **${trainerPhone}** directly, send a chat message, or book new training sessions anytime!`;
    } else {
      replyText = `You do not have a dedicated personal trainer assigned yet. Browse our certified fitness coaches under **Find Trainers** to select your specialist and schedule 1-on-1 training!`;
    }

    const trainerItems: AssistantItem[] = availableTrainers.map((t: any) => ({
      id: t._id.toString(),
      title: `${t.firstName || t.name} ${t.lastName || ''}`.trim(),
      subtitle: `${t.specialization || 'Fitness Coach'} · Rating: ${t.rating || '4.9'} ★`,
      tag: t.experienceYears ? `${t.experienceYears}+ Yrs Exp` : 'Certified',
      route: '/member/find-trainers'
    }));

    return {
      category: 'TRAINER',
      reply: replyText,
      actions: [
        ...(trainerName ? [{ label: `Call ${trainerName} (${trainerPhone})`, route: `tel:${trainerPhone}`, variant: 'primary' as const }] : []),
        { label: 'Find Trainers', route: '/member/find-trainers', variant: (!trainerName ? 'primary' : undefined) as any },
        { label: 'Chat with Trainer', route: '/member/chat' },
        { label: 'Book Session', route: '/member/book-session' },
        { label: 'My Bookings', route: '/member/bookings' }
      ],
      items: trainerItems.length > 0 ? trainerItems : undefined,
      followUps: [
        'When is my next session?',
        'What is my booking status?',
        'Show my workout plan',
        'How do I book a personal trainer?'
      ]
    };
  }

  /* ─────────────────────────────────────────────────────────────
     5. WORKOUT & FITNESS
  ───────────────────────────────────────────────────────────── */
  if (matchesCategory('workout') || q.includes('chest') || q.includes('leg') || q.includes('arms') || q.includes('back') || q.includes('beginner') || q.includes('muscle') || q.includes('weight loss')) {
    let focus = 'General Fitness';
    if (q.includes('chest')) focus = 'Chest & Triceps';
    else if (q.includes('leg')) focus = 'Legs & Calves (Squats, Lunges, Deadlifts)';
    else if (q.includes('back')) focus = 'Back & Biceps (Pull-ups, Rows, Lat Pulldowns)';
    else if (q.includes('beginner')) focus = 'Beginner Full-Body Foundation';
    else if (q.includes('muscle') || q.includes('build muscle')) focus = 'Hypertrophy & Muscle Building';
    else if (q.includes('weight loss') || q.includes('lose weight') || q.includes('fat loss')) focus = 'Fat Loss & Metabolic Conditioning';

    // Fetch matching exercises from DB if available
    let exercises: any[] = [];
    try {
      const searchTarget = q.includes('chest') ? 'chest' : (q.includes('leg') ? 'legs' : (q.includes('back') ? 'back' : ''));
      if (searchTarget) {
        exercises = await Exercise.find({
          $or: [
            { targetMuscle: { $regex: new RegExp(searchTarget, 'i') } },
            { name: { $regex: new RegExp(searchTarget, 'i') } }
          ]
        }).limit(4).lean();
      }
    } catch (e) {}

    const exList = exercises.length > 0
      ? `\nRecommended targeted movements from our exercise library:\n${exercises.map(e => `• **${e.name}** (${e.equipment || 'Gym Equipment'})`).join('\n')}`
      : `\nKey recommended compound routines:\n• Primary compound lifts (3-4 sets of 8-12 reps)\n• Accessory isolation movements (3 sets of 12-15 reps)\n• 60-90s rest interval between sets.`;

    const exerciseItems: AssistantItem[] = exercises.map((e: any) => ({
      id: e._id.toString(),
      title: e.name,
      subtitle: `${e.targetMuscle || 'Muscle Group'} · ${e.equipment || 'No Equipment'}`,
      tag: e.difficulty || 'Intermediate',
      route: '/member/workout'
    }));

    return {
      category: 'WORKOUT',
      reply: `Here are your workout guidelines for **${focus}**:
1. **Warm-up**: 5-8 minutes dynamic stretching and light cardio to elevate heart rate.
2. **Progressive Overload**: Increase weights or repetitions systematically each week.${exList}
3. **Recovery**: Ensure 48 hours rest between working the same major muscle groups.

Check your personalized plan under **Workout Plan** or watch proper technique demonstrations in **Workout Videos**!`,
      actions: [
        { label: 'View Workout Plan', route: '/member/workout', variant: 'primary' },
        { label: 'Workout Videos', route: '/member/workout-videos' },
        { label: 'Track Progress', route: '/member/progress' }
      ],
      items: exerciseItems.length > 0 ? exerciseItems : undefined,
      followUps: [
        'Chest workout',
        'Leg workout',
        'Diet for weight loss',
        'Protein rich foods'
      ]
    };
  }

  /* ─────────────────────────────────────────────────────────────
     6. DIET & NUTRITION
  ───────────────────────────────────────────────────────────── */
  if (matchesCategory('diet') || q.includes('nutrition') || q.includes('protein rich') || q.includes('calorie') || q.includes('macros')) {
    const isWeightLoss = q.includes('weight loss') || q.includes('lose weight') || q.includes('fat loss') || q.includes('cut');
    const isMuscleGain = q.includes('muscle') || q.includes('gain') || q.includes('bulk');

    let dietTitle = 'Balanced Fitness Nutrition';
    let dietAdvice = '';

    if (isWeightLoss) {
      dietTitle = 'Fat Loss & Calorie Deficit Plan';
      dietAdvice = `• **Calorie Deficit**: Target ~300-500 kcal below maintenance.
• **High Protein (1.8g - 2.2g per kg bodyweight)**: Preserves lean muscle mass during deficit.
• **Fiber-rich Carbohydrates**: Oats, brown rice, sweet potatoes, and green leafy vegetables.
• **Hydration**: Drink 3.5 to 4 liters of water daily to support metabolic rate.`;
    } else if (isMuscleGain) {
      dietTitle = 'Hypertrophy & Muscle Gain Nutrition';
      dietAdvice = `• **Calorie Surplus**: Target ~250-400 kcal above daily maintenance.
• **High Protein (1.6g - 2.0g per kg bodyweight)**: Essential for muscle protein synthesis.
• **Complex Carbohydrates & Healthy Fats**: Fuel intense gym sessions and hormone synthesis.
• **Pre & Post Workout**: Fast-digesting protein and carbs within 45 minutes of training.`;
    } else {
      dietTitle = 'High-Protein Nutrition Guidance';
      dietAdvice = `• **Top Protein Sources**: Chicken breast, eggs, fish, paneer, Greek yogurt, lentils, tofu, and whey protein.
• **Hydration**: 3+ liters daily.
• **Meal Timing**: Distribute protein evenly across 3-4 meals per day (~30g per meal).`;
    }

    return {
      category: 'DIET',
      reply: `Here is structured guidance for **${dietTitle}**:
${dietAdvice}

*(Note: These nutritional guidelines represent general wellness suggestions. Always consult certified nutritionists before major dietary modifications).*

View your meal plan under **Diet Plan** or order genuine supplements from our **Gym Store**!`,
      actions: [
        { label: 'View Diet Plan', route: '/member/diet', variant: 'primary' },
        { label: 'Gym Store (Supplements)', route: '/member/store' }
      ],
      followUps: [
        'Protein rich foods',
        'Show protein powder',
        'Show workout plans',
        'How can I view my progress?'
      ]
    };
  }

  /* ─────────────────────────────────────────────────────────────
     7. GYM EQUIPMENT & FACILITIES
  ───────────────────────────────────────────────────────────── */
  if (matchesCategory('equipment') || q.includes('dumbbell') || q.includes('treadmill') || q.includes('machine') || q.includes('facilities') || q.includes('amenities')) {
    let gymEquipment: any[] = [];
    let gymFacilities: string[] = [];

    if (userId) {
      try {
        const uDoc = await User.findById(userId).lean();
        const gymId = (uDoc as any)?.gymId;
        if (gymId) {
          const gymDoc = await Gym.findById(gymId).lean();
          if (gymDoc) {
            gymEquipment = gymDoc.equipment || [];
            gymFacilities = Array.from(new Set([...(gymDoc.services || []), ...(gymDoc.facilities || [])]));
          }
        }
      } catch (e) {}
    }

    const eqStr = gymEquipment.length > 0
      ? `Our gym features **${gymEquipment.length}** equipment categories including: ${gymEquipment.slice(0, 6).map(e => `**${e.name}** (${e.quantity || 1})`).join(', ')}.`
      : `Our partner gyms feature commercial grade **Olympic Barbells, Dumbbell Racks (2.5kg - 50kg), Cable Crossover Machines, Power Squat Racks, Incline Benches, Treadmills, and Elliptical Cross Trainers**.`;

    const facStr = gymFacilities.length > 0
      ? `\nFacilities & Amenities: ${gymFacilities.slice(0, 5).join(', ')}.`
      : `\nAmenities: Air Conditioned Workout Floors, Modern Locker Rooms, Shower Facilities, and Water Stations.`;

    const equipmentItems: AssistantItem[] = gymEquipment.slice(0, 4).map((e: any, idx: number) => ({
      id: `eq-${idx}`,
      title: e.name,
      subtitle: `${e.category || 'Cardio / Strength'} · Qty: ${e.quantity || 1}`,
      tag: e.condition || 'Excellent',
      route: role === 'ADMIN' || role === 'GYM_OWNER' ? '/admin/equipment' : '/member/my-gym'
    }));

    return {
      category: 'EQUIPMENT',
      reply: `${eqStr}${facStr}\n\nYou can inspect the full gym layout, equipment inventory, and facilities under **My Gym**!`,
      actions: [
        { label: 'View Gym & Equipment', route: role === 'ADMIN' || role === 'GYM_OWNER' ? '/admin/equipment' : '/member/my-gym', variant: 'primary' },
        { label: 'Find a Gym', route: '/gyms' }
      ],
      items: equipmentItems.length > 0 ? equipmentItems : undefined,
      followUps: [
        'Find a gym',
        'Show workout plans',
        'Show membership plans'
      ]
    };
  }

  /* ─────────────────────────────────────────────────────────────
     8. GYMS & LOCATIONS
  ───────────────────────────────────────────────────────────── */
  if (matchesCategory('gym') || q.includes('find a gym') || q.includes('available gyms') || q.includes('location') || q.includes('hours') || q.includes('timing')) {
    let gyms: any[] = [];
    try {
      gyms = await Gym.find({ status: GymStatus.ACTIVE }).limit(3).lean();
    } catch (e) {}

    const gymItems: AssistantItem[] = gyms.map((g: any) => ({
      id: g._id.toString(),
      title: g.name,
      subtitle: `${g.location?.city || 'City'}, ${g.location?.state || 'State'} · ${g.openingHours || '6:00 AM - 10:00 PM'}`,
      tag: 'Certified Partner',
      route: `/gyms/${g._id}`
    }));

    return {
      category: 'GYMS',
      reply: gyms.length > 0
        ? `We have **${gyms.length}** approved partner gym(s) open for admissions! They feature full strength lines, cardio theaters, certified personal trainers, and modern facilities.`
        : `Explore all top-rated partner gyms, verified amenities, opening hours, and equipment in the **Gym Marketplace**!`,
      actions: [
        { label: 'Find a Gym', route: '/gyms', variant: 'primary' },
        { label: 'My Gym Profile', route: '/member/my-gym' }
      ],
      items: gymItems.length > 0 ? gymItems : undefined,
      followUps: [
        'Show membership plans',
        'Find a personal trainer',
        'Show gym equipment'
      ]
    };
  }

  /* ─────────────────────────────────────────────────────────────
     9. PAYMENTS & BILLING
  ───────────────────────────────────────────────────────────── */
  if (matchesCategory('payment') || q.includes('invoice') || q.includes('receipt') || q.includes('dues') || q.includes('paid')) {
    let payments: any[] = [];
    if (userId) {
      try {
        payments = await Payment.find({ customerId: userId }).sort({ createdAt: -1 }).limit(3).lean();
      } catch (e) {}
    }

    let replyText = '';
    if (payments.length > 0) {
      const latest = payments[0];
      replyText = `You have **${payments.length}** payment record(s) on file. Your latest transaction of **₹${latest.amount}** on **${formatDateStr(latest.createdAt)}** via **${latest.paymentMethod || 'Online'}** is **${latest.status || 'Completed'}**. You can view full invoices and receipts in **Payment History**!`;
    } else {
      replyText = `You have no outstanding payment dues on record. Check your transaction history and download invoices under **Payment History**!`;
    }

    return {
      category: 'PAYMENTS',
      reply: replyText,
      actions: [
        { label: 'Payment History', route: '/member/payments', variant: 'primary' },
        { label: 'Membership Subscription', route: '/member/subscription' }
      ],
      followUps: [
        'Show membership plans',
        'Upgrade my subscription',
        'What is my booking status?'
      ]
    };
  }

  /* ─────────────────────────────────────────────────────────────
     10. ADMIN & MANAGEMENT (Strict Role-Based Enforcement)
  ───────────────────────────────────────────────────────────── */
  if (matchesCategory('admin') || q.includes('approval') || q.includes('pending approvals') || q.includes('reports') || q.includes('leads') || q.includes('owners')) {
    // 10A. SUPER ADMIN
    if (role === 'SUPER_ADMIN') {
      let pendingGyms = 0;
      try {
        pendingGyms = await Gym.countDocuments({ status: GymStatus.PENDING });
      } catch (e) {}

      return {
        category: 'ADMIN',
        reply: `Super Administrator Control Center:
• **Pending Gym Approvals**: **${pendingGyms}** pending application(s) awaiting review.
• You have full access to platform gym onboarding, SaaS subscriptions, payouts, and lead management.`,
        actions: [
          { label: 'Gym Approvals', route: '/super-admin/gym-approvals', variant: 'primary' },
          { label: 'Super Admin Dashboard', route: '/super-admin/dashboard' },
          { label: 'SaaS Subscriptions', route: '/super-admin/subscriptions' },
          { label: 'Payouts', route: '/super-admin/payouts' }
        ],
        followUps: [
          'Pending approvals',
          'Platform subscriptions',
          'Revenue reports'
        ]
      };
    }

    // 10B. GYM OWNER / ADMIN
    if (role === 'ADMIN' || role === 'GYM_OWNER' || role === 'GYM_MANAGER') {
      return {
        category: 'ADMIN',
        reply: `Gym Management Administration:
• Manage branch details, trainers, member approvals, equipment inventory, and store orders.
• Monitor active memberships, daily check-ins, and financial revenue reports.`,
        actions: [
          { label: 'Admin Dashboard', route: '/admin/dashboard', variant: 'primary' },
          { label: 'Manage Members', route: '/admin/members' },
          { label: 'Manage Trainers', route: '/admin/trainers' },
          { label: 'Gym Equipment', route: '/admin/equipment' },
          { label: 'Revenue Reports', route: '/admin/reports' }
        ],
        followUps: [
          'Manage members',
          'Manage equipment',
          'View revenue reports'
        ]
      };
    }

    // 10C. OPERATIONS & ADMIN HUB (Accessible to all roles)
    return {
      category: 'ADMIN',
      reply: `Here is the **Gym Operations & Admin Hub**:
• 🏢 **Gym Owner Dashboard** (\`/admin/dashboard\`): Manage members, staff coaches, equipment maintenance, and franchise financials.
• 📋 **Gym Directory** (\`/super-admin/gym-owners\`): View registered gym franchises, locations, and owners.
• 👥 **Staff & Equipment**: Oversee personal trainers and gym machinery.`,
      actions: [
        { label: 'Gym Owner Dashboard', route: '/admin/dashboard', variant: 'primary' },
        { label: 'Gym Owner Details', route: '/super-admin/gym-owners' },
        { label: 'Manage Members', route: '/admin/members' },
        { label: 'Manage Trainers', route: '/admin/trainers' }
      ],
      followUps: [
        'Gym owner details',
        'Customer details',
        'Trainer details',
        'Three dashboards'
      ]
    };
  }

  /* ─────────────────────────────────────────────────────────────
     11. PROGRESS & ATTENDANCE
  ───────────────────────────────────────────────────────────── */
  if (q.includes('progress') || q.includes('weight') || q.includes('tracking') || q.includes('attendance') || q.includes('log')) {
    let progressLogs: any[] = [];
    if (userId) {
      try {
        progressLogs = await ProgressLog.find({ customerId: userId }).sort({ date: -1 }).limit(3).lean();
      } catch (e) {}
    }

    let progressReply = '';
    if (progressLogs.length > 0) {
      const latest = progressLogs[0];
      progressReply = `You have recorded **${progressLogs.length}** progress entry(ies)! Latest log on **${formatDateStr(latest.date || latest.createdAt)}**: Weight: **${latest.weight || '-'} kg**, Workouts Completed: **${latest.workoutsCompleted || 1}**, Calories Burned: **${latest.caloriesBurned || '-'} kcal**.`;
    } else {
      progressReply = `You haven't logged any progress entries yet. Track your weight, body measurements, and calories in **Customer Progress** to visualize your transformation!`;
    }

    return {
      category: 'PROGRESS',
      reply: progressReply,
      actions: [
        { label: 'Customer Progress', route: '/member/progress', variant: 'primary' },
        { label: 'View Attendance', route: '/member/attendance' },
        { label: 'Workout Plan', route: '/member/workout' }
      ],
      followUps: [
        'Show my workout plan',
        'Diet for weight loss',
        'When is my next session?'
      ]
    };
  }

  /* ─────────────────────────────────────────────────────────────
     12. GREETINGS
  ───────────────────────────────────────────────────────────── */
  if (q === 'hi' || q === 'hello' || q === 'hey' || q.startsWith('hi ') || q.startsWith('hello ')) {
    const name = user?.firstName || 'there';
    return {
      category: 'GENERAL',
      reply: `Hello **${name}**! 👋 I am your **Gym Smart Assistant**.
How can I help you today? You can search for **gym owners**, **customer details**, **trainers**, **three dashboards**, **membership plans**, **workout routines**, **diet plans**, or **gym store products**!`,
      actions: [
        { label: 'Customer Dashboard', route: '/member/dashboard', variant: 'primary' },
        { label: 'Trainer Dashboard', route: '/trainer/dashboard' },
        { label: 'Gym Owner Dashboard', route: '/admin/dashboard' }
      ],
      followUps: [
        'Gym owner details',
        'Customer details',
        'Trainer details',
        'Three dashboards'
      ]
    };
  }

  /* ─────────────────────────────────────────────────────────────
     13. UNIVERSAL DYNAMIC OMNI-SEARCH ACROSS DATABASE COLLECTIONS
  ───────────────────────────────────────────────────────────── */
  try {
    const stopWords = new Set([
      'what', 'is', 'the', 'show', 'list', 'out', 'details', 'detail', 'view', 'i', 
      'want', 'see', 'can', 'you', 'me', 'here', 'give', 'tell', 'about', 'of', 
      'for', 'to', 'in', 'on', 'a', 'an', 'and', 'or', 'please', 'all', 'any', 'my', 'their'
    ]);
    const rawTerms = queryText.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length >= 2 && !stopWords.has(w));
    const searchRegex = rawTerms.length > 0 ? new RegExp(rawTerms.join('|'), 'i') : new RegExp(q, 'i');

    const [dbUsers, dbGyms, dbTrainers, dbProducts, dbExercises] = await Promise.all([
      User.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          { mobile: searchRegex }
        ]
      }).populate('gymId').limit(4).lean().catch(() => []),

      Gym.find({
        $or: [
          { name: searchRegex },
          { 'location.city': searchRegex },
          { gymType: searchRegex }
        ]
      }).limit(3).lean().catch(() => []),

      Trainer.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
          { specialization: searchRegex }
        ]
      }).populate('userId').limit(3).lean().catch(() => []),

      StoreProduct.find({
        $or: [
          { name: searchRegex },
          { categoryName: searchRegex }
        ]
      }).limit(4).lean().catch(() => []),

      Exercise.find({
        $or: [
          { name: searchRegex },
          { targetMuscle: searchRegex },
          { category: searchRegex }
        ]
      }).limit(4).lean().catch(() => [])
    ]);

    if (dbUsers.length > 0 || dbGyms.length > 0 || dbTrainers.length > 0 || dbProducts.length > 0 || dbExercises.length > 0) {
      let dynamicReply = `Here are the matching records found for **"${queryText}"**:\n\n`;
      const dynamicActions: AssistantAction[] = [];
      const dynamicItems: AssistantItem[] = [];

      if (dbUsers.length > 0) {
        dynamicReply += `### 👤 Registered Users & Accounts:\n` + dbUsers.map((u: any) => {
          const roleLabel = u.role === 'GYM_OWNER' ? 'Gym Owner' : u.role === 'TRAINER' ? 'Trainer' : 'Customer';
          const gymLabel = (u.gymId as any)?.name ? ` • ${(u.gymId as any).name}` : '';
          return `• **${u.firstName} ${u.lastName || ''}** (${roleLabel}${gymLabel})\n  📞 Phone: **${u.mobile || 'N/A'}** | ✉️ Email: \`${u.email}\``;
        }).join('\n') + '\n\n';

        for (const u of dbUsers) {
          dynamicItems.push({
            id: u._id.toString(),
            title: `${u.firstName} ${u.lastName || ''}`.trim(),
            subtitle: `📞 ${u.mobile || 'N/A'} • ${u.role}`,
            tag: u.role,
            route: u.role === 'GYM_OWNER' ? '/admin/dashboard' : u.role === 'TRAINER' ? '/trainer/dashboard' : '/member/dashboard'
          });
        }
      }

      if (dbGyms.length > 0) {
        dynamicReply += `### 🏢 Gym Franchises & Locations:\n` + dbGyms.map((g: any) => {
          return `• **${g.name}** (${g.location?.city || 'Tamil Nadu'})\n  📞 Phone: **${g.phone || 'N/A'}** | ✉️ Email: \`${g.email || 'N/A'}\` | Hours: ${g.operatingHours || '05:30 AM – 10:00 PM'}`;
        }).join('\n') + '\n\n';

        for (const g of dbGyms) {
          dynamicItems.push({
            id: g._id.toString(),
            title: g.name,
            subtitle: `📍 ${g.location?.city || 'Tamil Nadu'} • 📞 ${g.phone || ''}`,
            tag: 'Gym',
            route: '/super-admin/gyms/details'
          });
        }
      }

      if (dbTrainers.length > 0) {
        dynamicReply += `### 🥊 Certified Coaches & Trainers:\n` + dbTrainers.map((t: any) => {
          return `• **${t.name}** (${t.specialization || 'Fitness Coach'})\n  📞 Phone: **${t.phone || '9898989898'}** | ✉️ Email: \`${t.email}\` | Rate: ₹${t.fee || 500}/session`;
        }).join('\n') + '\n\n';

        for (const t of dbTrainers) {
          dynamicItems.push({
            id: t._id.toString(),
            title: t.name,
            subtitle: `📞 ${t.phone || '9898989898'} • ${t.specialization || 'Coach'}`,
            tag: 'Trainer',
            route: `tel:${t.phone || '9898989898'}`
          });
        }
      }

      if (dbProducts.length > 0) {
        dynamicReply += `### 🛍️ Gym Store Products:\n` + dbProducts.map((p: any) => {
          const cat = p.categoryName || p.category || 'Supplements';
          const pr = p.sellingPrice || p.price || 999;
          return `• **${p.name}** (${cat})\n  💰 Price: **₹${pr}** | In Stock`;
        }).join('\n') + '\n\n';

        for (const p of dbProducts) {
          const cat = p.categoryName || (p as any).category || 'Product';
          const pr = p.sellingPrice || (p as any).price || 999;
          dynamicItems.push({
            id: p._id.toString(),
            title: p.name,
            subtitle: cat,
            price: pr,
            tag: 'Store',
            route: '/member/store'
          });
        }
      }

      if (dbExercises.length > 0) {
        dynamicReply += `### 🏋️ Exercises & Workouts:\n` + dbExercises.map((e: any) => {
          return `• **${e.name}** — Target Muscle: **${e.targetMuscle || 'General'}** (${e.category || 'Strength'})`;
        }).join('\n') + '\n\n';

        for (const e of dbExercises) {
          dynamicItems.push({
            id: e._id.toString(),
            title: e.name,
            subtitle: e.targetMuscle || 'Exercise',
            tag: 'Workout',
            route: '/member/workout'
          });
        }
      }

      dynamicActions.push(
        { label: 'Customer Dashboard', route: '/member/dashboard' },
        { label: 'Trainer Dashboard', route: '/trainer/dashboard' },
        { label: 'Gym Owner Dashboard', route: '/admin/dashboard' }
      );

      return {
        category: 'GENERAL',
        reply: dynamicReply.trim(),
        actions: dynamicActions,
        items: dynamicItems.length > 0 ? dynamicItems : undefined,
        followUps: [
          'Gym owner details',
          'Trainer details',
          'Customer details',
          'Three dashboards'
        ]
      };
    }
  } catch (err) {
    console.error('Universal Dynamic Omni-Search Error:', err);
  }

  /* ─────────────────────────────────────────────────────────────
     14. DIRECTORY & DASHBOARDS RESOLVER
  ───────────────────────────────────────────────────────────── */
  return {
    category: 'GENERAL',
    reply: `Here are the platform's core directories and dashboards:
• 🏋️‍♂️ **Customer Dashboard** (\`/member/dashboard\`): Member workouts, nutrition meal plans, and booking records.
• 🥊 **Trainer Dashboard** (\`/trainer/dashboard\`): 1-on-1 coaching appointments and client progress logs.
• 🏢 **Gym Owner Dashboard** (\`/admin/dashboard\`): Franchise operations, revenue analytics, and member management.`,
    actions: [
      { label: 'Customer Dashboard', route: '/member/dashboard', variant: 'primary' },
      { label: 'Trainer Dashboard', route: '/trainer/dashboard' },
      { label: 'Gym Owner Dashboard', route: '/admin/dashboard' },
      { label: 'Gym Owner Details', route: '/super-admin/gym-owners' }
    ],
    items: [
      {
        id: 'cust-dash-default',
        title: 'Customer Dashboard',
        subtitle: 'Personal workouts, diet & bookings',
        tag: 'Customer',
        route: '/member/dashboard'
      },
      {
        id: 'trainer-dash-default',
        title: 'Trainer Dashboard',
        subtitle: 'Schedule & client training slots',
        tag: 'Trainer',
        route: '/trainer/dashboard'
      },
      {
        id: 'owner-dash-default',
        title: 'Gym Owner Dashboard',
        subtitle: 'Members, trainers, branches & revenue',
        tag: 'Gym Owner',
        route: '/admin/dashboard'
      }
    ],
    followUps: [
      'Gym owner details',
      'Customer details',
      'Trainer details',
      'Three dashboards'
    ]
  };
};
