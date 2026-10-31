/**
 * Smart URL Resolver
 * Intelligently resolves search terms, mistyped URLs, or spaces entered in the browser address bar
 * (e.g. '/member/dashboard/progress tracking', '/member/progress-tracking', '/trainer/dashboard/schedule')
 * to their respective target page instead of kicking the user out to the main landing page.
 */

interface RouteKeywordRule {
  target: string;
  keywords: string[];
}

const MEMBER_ROUTE_RULES: RouteKeywordRule[] = [
  // Progress Tracking
  { target: '/member/progress', keywords: ['progress tracking', 'progress-tracking', 'progress', 'tracking', 'milestone', 'milestones', 'analytics', 'bmi', 'weight tracker'] },
  // Workouts
  { target: '/member/workout-videos', keywords: ['workout videos', 'workout-videos', 'exercise videos', 'videos'] },
  { target: '/member/workout', keywords: ['workout plan', 'workout-plan', 'workout', 'workouts', 'exercise plan', 'routine', 'exercises'] },
  // Diet
  { target: '/member/diet', keywords: ['diet plan', 'diet-plan', 'diet', 'nutrition', 'meals', 'meal plan', 'calories', 'macros', 'food'] },
  // Training & Trainers
  { target: '/member/trainer-plan', keywords: ['trainer plan', 'trainers plan', 'trainer-plan', 'trainers-plan', 'assigned plan'] },
  { target: '/member/trainer', keywords: ['my trainer', 'my-trainer', 'personal trainer', 'trainer coach'] },
  { target: '/member/online-sessions', keywords: ['online sessions', 'online-sessions', 'virtual session', 'video coaching'] },
  { target: '/member/book-session', keywords: ['book session', 'book-session', 'book trainer', 'schedule trainer'] },
  { target: '/member/bookings', keywords: ['my bookings', 'my-bookings', 'bookings', 'appointments', 'sessions'] },
  { target: '/member/find-trainers', keywords: ['find trainers', 'find-trainers', 'trainers', 'training', 'coach', 'coaches', 'hire trainer'] },
  // AI Fitness
  { target: '/member/ai-assistant', keywords: ['ai fitness', 'ai-fitness', 'ai assistant', 'ai-assistant', 'smart assistant', 'ai coach', 'ai recommendations'] },
  // Attendance
  { target: '/member/attendance', keywords: ['attendance', 'checkin', 'check-in', 'gym visits', 'logs'] },
  // Membership & Subscription
  { target: '/member/upgrade', keywords: ['upgrade', 'upgrade membership', 'renew', 'change plan'] },
  { target: '/member/subscription', keywords: ['membership plan', 'membership-plan', 'subscription', 'membership', 'plans', 'my plan'] },
  { target: '/member/payments', keywords: ['payment history', 'payment-history', 'payments', 'billing', 'invoices', 'receipts', 'transactions'] },
  // Communication & Feedback
  { target: '/member/trainer-review', keywords: ['trainer feedback', 'trainer-review', 'feedback', 'trainer review'] },
  { target: '/member/session-review', keywords: ['session review', 'session-review', 'reviews', 'ratings'] },
  { target: '/member/chat', keywords: ['chat', 'messages', 'messaging', 'inbox'] },
  { target: '/member/notifications', keywords: ['notifications', 'alerts'] },
  // Store
  { target: '/member/store/cart', keywords: ['cart', 'shopping cart', 'basket'] },
  { target: '/member/store/orders', keywords: ['orders', 'my orders', 'order history', 'store orders'] },
  { target: '/member/store/checkout', keywords: ['checkout', 'store checkout'] },
  { target: '/member/store', keywords: ['gym store', 'store', 'shop', 'supplements', 'merchandise', 'products'] },
  // Rewards & Referrals
  { target: '/member/challenges', keywords: ['challenges', 'rewards', 'my rewards', 'badges', 'leaderboard', 'trophies', 'points'] },
  { target: '/member/referrals', keywords: ['referrals', 'refer and earn', 'refer-earn', 'invite friends', 'referral'] },
  // Profile & Settings
  { target: '/member/profile', keywords: ['profile', 'my profile', 'account', 'user profile', 'settings'] },
  { target: '/member/my-gym', keywords: ['my gym', 'my-gym', 'gym profile', 'gym details', 'club'] },
  { target: '/member/dashboard', keywords: ['dashboard', 'home', 'overview'] },
];

const TRAINER_ROUTE_RULES: RouteKeywordRule[] = [
  // Schedule & Bookings
  { target: '/trainer/session-bookings', keywords: ['session bookings', 'session-bookings', 'bookings', 'appointments'] },
  { target: '/trainer/online-sessions', keywords: ['online sessions', 'online-sessions', 'virtual sessions'] },
  { target: '/trainer/schedule', keywords: ['schedule', 'calendar', 'scheduling', 'timetable', 'shifts'] },
  // Clients / Members
  { target: '/trainer/customer-workplan-completed', keywords: ['completed workplan', 'customer workplan', 'customer-workplan-completed', 'member progress', 'progress tracking', 'completed'] },
  { target: '/trainer/attendance', keywords: ['attendance', 'client attendance'] },
  { target: '/trainer/members', keywords: ['members', 'clients', 'customers', 'trainees'] },
  // Programs
  { target: '/trainer/exercise-videos', keywords: ['exercise videos', 'workout videos', 'videos'] },
  { target: '/trainer/exercises', keywords: ['exercises', 'exercise library', 'library'] },
  { target: '/trainer/workout-plans', keywords: ['workout plans', 'workout-plans', 'workouts'] },
  { target: '/trainer/diet-plans', keywords: ['diet plans', 'diet-plans', 'diet', 'nutrition'] },
  { target: '/trainer/equipments', keywords: ['equipments', 'equipment', 'gym equipment'] },
  // Financials
  { target: '/trainer/payments-received', keywords: ['payments received', 'payments-received', 'received payments'] },
  { target: '/trainer/payment-history', keywords: ['payment history', 'payment-history', 'payouts'] },
  { target: '/trainer/my-fee', keywords: ['my fee', 'my-fee', 'fee', 'rate', 'commission'] },
  { target: '/trainer/earnings', keywords: ['earnings', 'income', 'revenue', 'salary'] },
  // Jobs
  { target: '/trainer/applications', keywords: ['my applications', 'applications'] },
  { target: '/trainer/hiring-requests', keywords: ['hiring requests', 'hiring-requests'] },
  { target: '/trainer/interviews', keywords: ['interviews'] },
  { target: '/trainer/job-offers', keywords: ['job offers', 'job-offers', 'offers'] },
  { target: '/trainer/jobs', keywords: ['find jobs', 'jobs', 'vacancies', 'opportunities'] },
  // Communication & AI
  { target: '/trainer/ai-assistant', keywords: ['ai assistant', 'ai-assistant', 'ai recommendations'] },
  { target: '/trainer/ai-feedback', keywords: ['ai feedback', 'ai-feedback', 'feedback'] },
  { target: '/trainer/reviews', keywords: ['reviews', 'ratings'] },
  { target: '/trainer/rewards', keywords: ['rewards', 'performance'] },
  { target: '/trainer/messages', keywords: ['messages', 'chat', 'inbox'] },
  { target: '/trainer/notifications', keywords: ['notifications', 'alerts'] },
  // Profile & Dashboard
  { target: '/trainer/profile', keywords: ['profile', 'my profile', 'account'] },
  { target: '/trainer/settings', keywords: ['settings'] },
  { target: '/trainer/dashboard', keywords: ['dashboard', 'home'] },
];

const ADMIN_ROUTE_RULES: RouteKeywordRule[] = [
  // Members
  { target: '/admin/members', keywords: ['members', 'customers', 'member list'] },
  { target: '/admin/offline-memberships', keywords: ['offline memberships', 'walk-in', 'walk in'] },
  { target: '/admin/attendance', keywords: ['attendance', 'member attendance'] },
  { target: '/admin/biometric', keywords: ['biometric', 'fingerprint', 'devices', 'gate'] },
  // Trainers & Hiring
  { target: '/admin/hiring/trainers', keywords: ['browse trainers', 'hire trainers', 'hiring trainers'] },
  { target: '/admin/hiring/jobs', keywords: ['job postings', 'post jobs', 'hiring jobs'] },
  { target: '/admin/hiring/hired', keywords: ['hired trainers'] },
  { target: '/admin/trainer-schedule', keywords: ['trainer schedule', 'coach schedule', 'schedules'] },
  { target: '/admin/trainers', keywords: ['trainers', 'coaches', 'staff'] },
  // Programs & Management
  { target: '/admin/diet-management', keywords: ['diet management', 'diet plans', 'nutrition'] },
  { target: '/admin/workout-management', keywords: ['workout management', 'workout plans'] },
  { target: '/admin/equipment', keywords: ['equipment', 'equipments', 'machines'] },
  { target: '/admin/membership-plans', keywords: ['membership plans', 'membership-plans', 'plans', 'pricing'] },
  { target: '/admin/reports', keywords: ['reports', 'analytics', 'revenue reports'] },
  // POS & Store
  { target: '/admin/pos', keywords: ['pos', 'point of sale', 'counter sales', 'cashier'] },
  { target: '/admin/store', keywords: ['store', 'inventory', 'shop', 'products'] },
  // Financials & Subscription
  { target: '/admin/trainer-fees', keywords: ['trainer fees', 'trainer-fees'] },
  { target: '/admin/trainer-payments', keywords: ['trainer payments', 'trainer-payments', 'payroll'] },
  { target: '/admin/trainer-payments-history', keywords: ['trainer payments history', 'payroll history'] },
  { target: '/admin/billing', keywords: ['billing', 'invoices', 'payments'] },
  { target: '/admin/subscription', keywords: ['subscription', 'saas subscription', 'platform plan'] },
  // Account & Dashboard
  { target: '/admin/notifications', keywords: ['notifications', 'alerts'] },
  { target: '/admin/profile', keywords: ['profile', 'gym profile', 'gym details'] },
  { target: '/admin/settings', keywords: ['settings'] },
  { target: '/admin/dashboard', keywords: ['dashboard', 'home'] },
];

const SUPER_ADMIN_ROUTE_RULES: RouteKeywordRule[] = [
  { target: '/super-admin/gyms/add', keywords: ['add gym', 'register gym', 'new gym'] },
  { target: '/super-admin/gyms/details', keywords: ['gym details', 'all gyms'] },
  { target: '/super-admin/gym-owners', keywords: ['gym owners', 'gym-owners', 'owners', 'gyms'] },
  { target: '/super-admin/invitations', keywords: ['invitations', 'invites', 'send invitation'] },
  { target: '/super-admin/revenue-analytics', keywords: ['revenue', 'analytics', 'financials'] },
  { target: '/super-admin/subscriptions', keywords: ['subscriptions', 'saas plans', 'pricing plans'] },
  { target: '/super-admin/gym-approvals', keywords: ['approvals', 'pending gyms'] },
  { target: '/super-admin/customers', keywords: ['customers', 'members'] },
  { target: '/super-admin/leads', keywords: ['leads', 'enquiries'] },
  { target: '/super-admin/payouts', keywords: ['payouts', 'payments'] },
  { target: '/super-admin/deleted', keywords: ['deleted', 'trash', 'archived'] },
  { target: '/super-admin/store', keywords: ['store', 'products'] },
  { target: '/super-admin/notifications', keywords: ['notifications'] },
  { target: '/super-admin/profile', keywords: ['profile'] },
  { target: '/super-admin/settings', keywords: ['settings'] },
  { target: '/super-admin/dashboard', keywords: ['dashboard', 'home'] },
];

/**
 * Normalizes raw URL input and removes dashboard prefixes so e.g.
 * 'dashboard/progress tracking' becomes 'progress tracking'
 */
export const normalizeQueryString = (rawPath: string): string => {
  try {
    let clean = decodeURIComponent(rawPath || '').toLowerCase().trim();
    // Remove query params or hash
    clean = clean.split('?')[0].split('#')[0];
    // Normalize dashes and underscores to spaces for token matching
    clean = clean.replace(/[-_+]/g, ' ');
    // Strip leading / trailing slashes
    clean = clean.replace(/^\/+|\/+$/g, '');
    // Strip common dashboard prefixes
    clean = clean
      .replace(/^(member|trainer|admin|super admin|super-admin)\s*\/\s*/i, '')
      .replace(/^dashboard\s*\/\s*/i, '')
      .replace(/^dashboard\s+/i, '')
      .trim();
    return clean;
  } catch {
    return (rawPath || '').toLowerCase().trim();
  }
};

/**
 * Matches a query string against a list of RouteKeywordRules
 */
const matchRule = (normalizedQuery: string, rules: RouteKeywordRule[]): string | null => {
  if (!normalizedQuery) return null;

  // 1. Exact match against keyword
  for (const rule of rules) {
    for (const kw of rule.keywords) {
      if (normalizedQuery === kw) {
        return rule.target;
      }
    }
  }

  // 2. Starts with or contains exact keyword phrase
  for (const rule of rules) {
    for (const kw of rule.keywords) {
      if (normalizedQuery.includes(kw) || kw.includes(normalizedQuery)) {
        return rule.target;
      }
    }
  }

  // 3. Word-by-word token matching
  const queryTokens = normalizedQuery.split(/\s+/).filter(t => t.length > 2);
  let bestMatch: string | null = null;
  let bestScore = 0;

  for (const rule of rules) {
    for (const kw of rule.keywords) {
      const kwTokens = kw.split(/\s+/);
      const matched = queryTokens.filter(t => kwTokens.some(kt => kt.includes(t) || t.includes(kt)));
      if (matched.length > bestScore) {
        bestScore = matched.length;
        bestMatch = rule.target;
      }
    }
  }

  return bestScore > 0 ? bestMatch : null;
};

/**
 * Resolves any URL typed within the Member dashboard area
 */
export const resolveMemberRoute = (rawPath: string): string => {
  const query = normalizeQueryString(rawPath);
  const matched = matchRule(query, MEMBER_ROUTE_RULES);
  return matched || '/member/dashboard';
};

/**
 * Resolves any URL typed within the Trainer dashboard area
 */
export const resolveTrainerRoute = (rawPath: string): string => {
  const query = normalizeQueryString(rawPath);
  const matched = matchRule(query, TRAINER_ROUTE_RULES);
  return matched || '/trainer/dashboard';
};

/**
 * Resolves any URL typed within the Admin / Gym Owner dashboard area
 */
export const resolveAdminRoute = (rawPath: string): string => {
  const query = normalizeQueryString(rawPath);
  const matched = matchRule(query, ADMIN_ROUTE_RULES);
  return matched || '/admin/dashboard';
};

/**
 * Resolves any URL typed within the Super Admin dashboard area
 */
export const resolveSuperAdminRoute = (rawPath: string): string => {
  const query = normalizeQueryString(rawPath);
  const matched = matchRule(query, SUPER_ADMIN_ROUTE_RULES);
  return matched || '/super-admin/dashboard';
};

/**
 * Global fallback resolver: inspects the entire URL and user role
 * to route intelligently to the correct feature instead of defaulting to '/'
 */
export const resolveGlobalRoute = (
  rawPath: string,
  user?: { role?: string } | null,
  isAuthenticated?: boolean
): string => {
  const path = (rawPath || '').toLowerCase();

  // 1. If path explicitly mentions member, trainer, admin, super-admin:
  if (path.includes('member')) return resolveMemberRoute(rawPath);
  if (path.includes('trainer') && !path.includes('trainers')) return resolveTrainerRoute(rawPath);
  if (path.includes('admin') && !path.includes('super-admin')) return resolveAdminRoute(rawPath);
  if (path.includes('super-admin')) return resolveSuperAdminRoute(rawPath);

  // 2. If authenticated, route based on user's role:
  if (isAuthenticated && user?.role) {
    const role = user.role.toUpperCase();
    if (role === 'MEMBER') return resolveMemberRoute(rawPath);
    if (role === 'TRAINER') return resolveTrainerRoute(rawPath);
    if (role === 'ADMIN' || role === 'GYM_OWNER') return resolveAdminRoute(rawPath);
    if (role === 'SUPER_ADMIN') return resolveSuperAdminRoute(rawPath);
  }

  // 3. Public landing / marketing keywords:
  const query = normalizeQueryString(rawPath);
  if (query.includes('trainer') || query.includes('coach')) return '/trainers';
  if (query.includes('gym')) return '/gyms';
  if (query.includes('pricing') || query.includes('plan')) return '/subscription-plans';
  if (query.includes('customer')) return '/portal/customer';
  if (query.includes('owner')) return '/portal/gym-owner';
  if (query.includes('login') || query.includes('signin')) return '/login';
  if (query.includes('register') || query.includes('signup')) return '/register/customer';

  // Default fallback
  return '/';
};

