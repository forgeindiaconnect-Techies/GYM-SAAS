/**
 * Gym Smart Assistant Engine
 * 100% Local, Gemini-Free Search, Navigation, and Knowledge Engine.
 */

export type UserRole = 'MEMBER' | 'TRAINER' | 'ADMIN' | 'GYM_OWNER' | 'GYM_MANAGER' | 'SUPER_ADMIN' | 'RECEPTIONIST' | 'GUEST';

export interface AssistantRouteItem {
  id: string;
  title: string;
  description: string;
  category: 'MEMBERSHIP' | 'GYMS' | 'TRAINERS' | 'MEMBERS' | 'WORKOUT' | 'DIET' | 'EQUIPMENT' | 'STORE' | 'PAYMENTS' | 'ADMIN' | 'HELP';
  route: string;
  actionLabel: string;
  keywords: string[];
  allowedRoles: string[]; // ['*'] for all
  badge?: string;
  price?: number;
  highlight?: boolean;
}
export const AssistantRouteItem = {};

export interface AssistantAnswer {
  category: string;
  reply: string;
  matchedItems: AssistantRouteItem[];
  actions: Array<{ label: string; route: string; variant?: 'primary' | 'secondary' | 'outline' }>;
  followUps: string[];
  isRestricted?: boolean;
}

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

/* ── 3. Synonyms Dictionary ────────────────────────────────────────── */
export const SYNONYM_MAP: Record<string, string[]> = {
  membership: ['membership', 'memberships', 'plan', 'plans', 'subscription', 'subscriptions', 'subscribe', 'pricing', 'fee', 'fees', 'cost', 'rates', 'premium', 'gold', 'silver', 'starter', 'professional', 'enterprise', 'trial', 'free trial', 'renew', 'renewal', 'upgrade'],
  gym: ['gym', 'gyms', 'facility', 'facilities', 'club', 'fitness center', 'branch', 'branches', 'timing', 'timings', 'hours', 'open', 'opening', 'location', 'address', 'area', 'amenity', 'amenities', 'ac'],
  trainer: ['trainer', 'trainers', 'coach', 'coaches', 'instructor', 'instructors', 'personal trainer', 'pt', 'specialization', 'hire trainer', 'session', 'sessions', 'book session', 'booking', 'bookings', 'online session', 'assigned trainer'],
  member: ['member', 'members', 'customer', 'customers', 'join', 'joining', 'register', 'registration', 'attendance', 'checkin', 'check-in'],
  workout: ['workout', 'workouts', 'exercise', 'exercises', 'routine', 'routines', 'training', 'chest', 'back', 'legs', 'leg', 'arms', 'biceps', 'triceps', 'shoulders', 'abs', 'core', 'cardio', 'hiit', 'strength', 'muscle', 'hypertrophy', 'build muscle', 'lose weight', 'fat loss', 'bulk', 'cut', 'beginner'],
  diet: ['diet', 'diets', 'nutrition', 'meal', 'meals', 'food', 'calorie', 'calories', 'macro', 'macros', 'protein', 'carbs', 'fats', 'weight loss diet', 'muscle building diet', 'nutrition guidance', 'weight gain diet'],
  equipment: ['equipment', 'equipments', 'machine', 'machines', 'dumbbell', 'dumbbells', 'barbell', 'barbells', 'treadmill', 'treadmills', 'cable', 'squat rack', 'bench', 'kettlebell', 'weights'],
  store: ['store', 'shop', 'product', 'products', 'supplement', 'supplements', 'protein powder', 'whey', 'creatine', 'bcaa', 'gear', 'merch', 'apparel', 'cart', 'order', 'orders', 'buy', 'purchase', 'checkout'],
  payment: ['payment', 'payments', 'pay', 'paid', 'bill', 'billing', 'invoice', 'invoices', 'receipt', 'receipts', 'due', 'dues', 'transaction', 'transactions', 'payout', 'payouts'],
  admin: ['admin', 'super admin', 'approvals', 'pending approvals', 'approval', 'gym approval', 'gym approvals', 'reports', 'analytics', 'revenue', 'leads', 'import', 'management', 'payouts'],
  help: ['how to', 'how do i', 'how can i', 'where can i', 'help', 'guide', 'steps', 'workflow', 'what is']
};

/* ── 4. Comprehensive Route & Feature Registry ─────────────────────── */
export const FEATURE_REGISTRY: AssistantRouteItem[] = [
  // ── A. MEMBERSHIP & SUBSCRIPTIONS ──
  {
    id: 'mem-plans',
    title: 'Membership Plans & Pricing',
    description: 'Explore available membership packages, monthly/quarterly fees, and gym access privileges.',
    category: 'MEMBERSHIP',
    route: '/member/subscription',
    actionLabel: 'View Plans',
    keywords: ['membership', 'plan', 'plans', 'subscription', 'pricing', 'fees', 'cost', 'rates', 'sub', 'join plan', 'packages'],
    allowedRoles: ['MEMBER', 'GUEST', 'ALL'],
    badge: 'Popular'
  },
  {
    id: 'mem-premium',
    title: 'Premium / Enterprise Membership Plan',
    description: 'High-tier membership with priority trainer consultations, diet plans, and locker access.',
    category: 'MEMBERSHIP',
    route: '/member/subscription',
    actionLabel: 'View Premium Plan',
    keywords: ['premium', 'premium plan', 'enterprise', 'enterprise plan', 'gold', 'gold plan', 'vip', 'top plan', 'highest plan'],
    allowedRoles: ['MEMBER', 'GUEST', 'ALL'],
    badge: 'Best Value'
  },
  {
    id: 'mem-starter',
    title: 'Starter / Basic Membership Plan',
    description: 'Affordable entry-level gym access with fundamental workout tracking and gym floor privileges.',
    category: 'MEMBERSHIP',
    route: '/member/subscription',
    actionLabel: 'View Starter Plan',
    keywords: ['starter', 'starter plan', 'basic', 'basic plan', 'entry plan', 'cheap plan', 'standard'],
    allowedRoles: ['MEMBER', 'GUEST', 'ALL']
  },
  {
    id: 'mem-trial',
    title: 'Free Trial Pass',
    description: '1-Day Free Trial pass to test equipment, amenities, and consultation with zero initial payment.',
    category: 'MEMBERSHIP',
    route: '/member/subscription',
    actionLabel: 'Claim Free Trial',
    keywords: ['free trial', 'trial', 'trial pass', 'test gym', 'free pass', 'demo'],
    allowedRoles: ['MEMBER', 'GUEST', 'ALL'],
    badge: 'Free'
  },
  {
    id: 'mem-upgrade',
    title: 'Upgrade Membership Subscription',
    description: 'Switch to a higher tier plan or renew your active membership to maintain uninterrupted access.',
    category: 'MEMBERSHIP',
    route: '/member/upgrade',
    actionLabel: 'Upgrade Plan',
    keywords: ['upgrade', 'upgrade plan', 'renew', 'renewal', 'extend membership', 'change plan', 'upgrade my subscription'],
    allowedRoles: ['MEMBER']
  },
  {
    id: 'admin-membership-plans',
    title: 'Configure Gym Membership Plans',
    description: 'Create, modify, and price custom membership tiers for gym members.',
    category: 'MEMBERSHIP',
    route: '/admin/membership-plans',
    actionLabel: 'Configure Plans',
    keywords: ['membership plans', 'manage plans', 'create plan', 'gym plans', 'set fees'],
    allowedRoles: ['ADMIN', 'GYM_OWNER', 'GYM_MANAGER']
  },
  {
    id: 'super-admin-subs',
    title: 'SaaS Platform Subscriptions',
    description: 'Super admin management for gym owner subscription packages, tiers, and billing cycles.',
    category: 'MEMBERSHIP',
    route: '/super-admin/subscriptions',
    actionLabel: 'Manage Subscriptions',
    keywords: ['saas subscription', 'platform subscriptions', 'gym owner plans', 'subscription billing'],
    allowedRoles: ['SUPER_ADMIN']
  },

  // ── B. GYMS & FACILITIES ──
  {
    id: 'gym-marketplace',
    title: 'Find a Gym / Gym Marketplace',
    description: 'Browse certified partner fitness clubs, amenities, location maps, and opening hours.',
    category: 'GYMS',
    route: '/gyms',
    actionLabel: 'Find a Gym',
    keywords: ['find a gym', 'gyms', 'browse gyms', 'gym marketplace', 'available gyms', 'nearby gym', 'gym near me', 'fitness club'],
    allowedRoles: ['*'],
    badge: 'Explore'
  },
  {
    id: 'gym-my-profile',
    title: 'My Gym Profile & Facilities',
    description: 'View your enrolled gym information, opening hours, facilities, AC specifications, and address.',
    category: 'GYMS',
    route: '/member/my-gym',
    actionLabel: 'View My Gym',
    keywords: ['my gym', 'gym details', 'gym timing', 'gym hours', 'opening hours', 'gym address', 'gym facilities', 'ac details'],
    allowedRoles: ['MEMBER']
  },
  {
    id: 'admin-gym-profile',
    title: 'Gym Profile & Branding',
    description: 'Manage gym photos, logo, descriptions, services, and operating schedules.',
    category: 'GYMS',
    route: '/admin/gym-profile',
    actionLabel: 'Edit Gym Profile',
    keywords: ['gym profile', 'gym settings', 'update gym', 'gym branding', 'branch hours'],
    allowedRoles: ['ADMIN', 'GYM_OWNER']
  },
  {
    id: 'admin-gym-location',
    title: 'Gym Location & Map Coordinates',
    description: 'Configure gym GPS coordinates, address, and interactive Google Maps locator.',
    category: 'GYMS',
    route: '/admin/location',
    actionLabel: 'Location Settings',
    keywords: ['location', 'gym map', 'address', 'coordinates', 'directions'],
    allowedRoles: ['ADMIN', 'GYM_OWNER']
  },

  // ── C. TRAINERS ──
  {
    id: 'trainer-discovery',
    title: 'Find Personal Trainers',
    description: 'Browse certified coaches, specializations, hourly fees, customer reviews, and qualifications.',
    category: 'TRAINERS',
    route: '/member/find-trainers',
    actionLabel: 'Find Trainers',
    keywords: ['find a trainer', 'trainers', 'personal trainer', 'hire a trainer', 'coach', 'coaches', 'find a personal trainer', 'i need a trainer', 'instructor'],
    allowedRoles: ['MEMBER', '*'],
    badge: 'Coaching'
  },
  {
    id: 'trainer-my-coach',
    title: 'My Assigned Personal Trainer',
    description: 'View your dedicated coach profile, certifications, workout guidelines, and direct contact.',
    category: 'TRAINERS',
    route: '/member/trainer',
    actionLabel: 'View Trainer',
    keywords: ['my trainer', 'who is my trainer', 'assigned trainer', 'my coach', 'trainer profile'],
    allowedRoles: ['MEMBER']
  },
  {
    id: 'trainer-book-session',
    title: 'Book Training Session',
    description: 'Schedule a 1-on-1 personal coaching session by selecting date, time slot, and training target.',
    category: 'TRAINERS',
    route: '/member/book-session',
    actionLabel: 'Book Session',
    keywords: ['book session', 'book trainer', 'schedule session', 'appointment', 'personal training booking'],
    allowedRoles: ['MEMBER']
  },
  {
    id: 'trainer-my-bookings',
    title: 'My Session Bookings',
    description: 'Track your upcoming, confirmed, and past training sessions with your personal coach.',
    category: 'TRAINERS',
    route: '/member/bookings',
    actionLabel: 'View Bookings',
    keywords: ['my bookings', 'session bookings', 'booking status', 'next session', 'when is my next session', 'upcoming sessions'],
    allowedRoles: ['MEMBER']
  },
  {
    id: 'trainer-online-sessions',
    title: 'Online Video Sessions',
    description: 'Attend interactive live video coaching sessions with certified fitness coaches.',
    category: 'TRAINERS',
    route: '/member/online-sessions',
    actionLabel: 'Online Sessions',
    keywords: ['online sessions', 'video coaching', 'live training', 'zoom session', 'virtual trainer'],
    allowedRoles: ['MEMBER']
  },
  {
    id: 'trainer-dashboard',
    title: 'Trainer Dashboard',
    description: 'Coaching hub for scheduled sessions, member requests, and client workout updates.',
    category: 'TRAINERS',
    route: '/trainer/dashboard',
    actionLabel: 'Trainer Dashboard',
    keywords: ['trainer dashboard', 'coaching dashboard', 'trainer schedule', 'client bookings'],
    allowedRoles: ['TRAINER']
  },
  {
    id: 'admin-manage-trainers',
    title: 'Manage Trainers & Staff',
    description: 'Onboard, invite, and coordinate gym trainers, commission splits, and working shifts.',
    category: 'TRAINERS',
    route: '/admin/trainers',
    actionLabel: 'Manage Trainers',
    keywords: ['manage trainers', 'trainer approvals', 'hire trainers', 'trainer list', 'trainer staff'],
    allowedRoles: ['ADMIN', 'GYM_OWNER']
  },

  // ── D. MEMBERS & CUSTOMERS ──
  {
    id: 'member-dashboard',
    title: 'Member Dashboard',
    description: 'Personalized hub for membership status, workouts, quick actions, and recent activity.',
    category: 'MEMBERS',
    route: '/member/dashboard',
    actionLabel: 'Go to Dashboard',
    keywords: ['dashboard', 'member dashboard', 'home', 'my account', 'member hub'],
    allowedRoles: ['MEMBER']
  },
  {
    id: 'member-profile',
    title: 'Member Profile & Biometrics',
    description: 'Manage personal contact information, fitness goals, height, weight, and emergency details.',
    category: 'MEMBERS',
    route: '/member/profile',
    actionLabel: 'Edit Profile',
    keywords: ['profile', 'my profile', 'biometrics', 'edit details', 'contact info', 'emergency contact'],
    allowedRoles: ['MEMBER']
  },
  {
    id: 'member-attendance',
    title: 'Gym Attendance Log',
    description: 'Review monthly attendance check-ins, workout frequency, and streak tracking.',
    category: 'MEMBERS',
    route: '/member/attendance',
    actionLabel: 'View Attendance',
    keywords: ['attendance', 'check in', 'check-in', 'my attendance', 'workout days', 'visit log'],
    allowedRoles: ['MEMBER']
  },
  {
    id: 'admin-manage-members',
    title: 'Gym Member Management',
    description: 'Review gym member enrollments, approve pending registrations, and monitor expiry.',
    category: 'MEMBERS',
    route: '/admin/members',
    actionLabel: 'Manage Members',
    keywords: ['manage members', 'member list', 'customer list', 'member approvals', 'active members'],
    allowedRoles: ['ADMIN', 'GYM_OWNER', 'GYM_MANAGER']
  },
  {
    id: 'super-admin-customers',
    title: 'Platform Customers Directory',
    description: 'Global registry of all registered fitness members across all partner gym franchises.',
    category: 'MEMBERS',
    route: '/super-admin/customers',
    actionLabel: 'Customer Directory',
    keywords: ['platform customers', 'all customers', 'global members', 'search members'],
    allowedRoles: ['SUPER_ADMIN']
  },

  // ── E. WORKOUT & FITNESS ──
  {
    id: 'workout-my-plan',
    title: 'My Workout Plan',
    description: 'Structured workout schedule detailing muscle splits, exercises, sets, reps, and resting times.',
    category: 'WORKOUT',
    route: '/member/workout',
    actionLabel: 'View Workout Plan',
    keywords: ['workout plan', 'workout', 'workouts', 'routine', 'routines', 'exercise plan', 'training schedule', 'show my workout', 'show workout plans'],
    allowedRoles: ['MEMBER'],
    badge: 'Training'
  },
  {
    id: 'workout-chest',
    title: 'Chest & Upper Body Workout',
    description: 'Targeted compound bench press, incline dumbbell presses, and flyes for upper chest development.',
    category: 'WORKOUT',
    route: '/member/workout',
    actionLabel: 'Chest Routine',
    keywords: ['chest workout', 'chest', 'bench press', 'pecs', 'upper body', 'incline press', 'push day'],
    allowedRoles: ['MEMBER', '*']
  },
  {
    id: 'workout-legs',
    title: 'Legs & Lower Body Workout',
    description: 'Squats, Romanian deadlifts, leg presses, and lunges for lower-body power and quad growth.',
    category: 'WORKOUT',
    route: '/member/workout',
    actionLabel: 'Leg Routine',
    keywords: ['leg workout', 'legs', 'squat', 'squats', 'quads', 'hamstrings', 'calves', 'leg day'],
    allowedRoles: ['MEMBER', '*']
  },
  {
    id: 'workout-back',
    title: 'Back & Biceps Workout',
    description: 'Pull-ups, barbell rows, lat pulldowns, and bicep curls for back width and arm thickness.',
    category: 'WORKOUT',
    route: '/member/workout',
    actionLabel: 'Back Routine',
    keywords: ['back workout', 'back', 'pull day', 'lat pulldown', 'rows', 'biceps', 'pullups'],
    allowedRoles: ['MEMBER', '*']
  },
  {
    id: 'workout-beginner',
    title: 'Beginner Full-Body Foundation',
    description: 'Foundational workout program designed for new gym joiners to master compound exercise form.',
    category: 'WORKOUT',
    route: '/member/workout',
    actionLabel: 'Beginner Plan',
    keywords: ['beginner workout', 'beginner', 'starting gym', 'starter workout', 'new to gym', 'easy workout'],
    allowedRoles: ['MEMBER', '*']
  },
  {
    id: 'workout-muscle',
    title: 'Hypertrophy & Muscle Building Program',
    description: 'Progressive overload training tailored to stimulate maximum muscle growth and strength gains.',
    category: 'WORKOUT',
    route: '/member/workout',
    actionLabel: 'Muscle Plan',
    keywords: ['build muscle', 'muscle building', 'i want to build muscle', 'hypertrophy', 'gain muscle', 'bulk', 'strength training'],
    allowedRoles: ['MEMBER', '*']
  },
  {
    id: 'workout-weightloss',
    title: 'Fat Loss & Conditioning Program',
    description: 'Metabolic resistance training and high-intensity circuits to maximize caloric expenditure.',
    category: 'WORKOUT',
    route: '/member/workout',
    actionLabel: 'Fat Loss Plan',
    keywords: ['lose weight', 'weight loss', 'i want to lose weight', 'fat loss', 'burn fat', 'cardio', 'hiit', 'lean'],
    allowedRoles: ['MEMBER', '*']
  },
  {
    id: 'workout-videos',
    title: 'Instructional Workout Videos',
    description: 'High-definition video library demonstrating strict biomechanical form for all gym lifts.',
    category: 'WORKOUT',
    route: '/member/workout-videos',
    actionLabel: 'Watch Videos',
    keywords: ['workout videos', 'exercise videos', 'video library', 'form video', 'demonstrations'],
    allowedRoles: ['MEMBER']
  },
  {
    id: 'workout-progress',
    title: 'Fitness Progress & Transformation Logs',
    description: 'Log and visualize weight fluctuations, body measurements, BMI trends, and calories burned.',
    category: 'WORKOUT',
    route: '/member/progress',
    actionLabel: 'View Progress',
    keywords: ['progress', 'progress log', 'weight tracking', 'weight loss progress', 'calories burned', 'bmi', 'transformation'],
    allowedRoles: ['MEMBER']
  },
  {
    id: 'trainer-workout-plans',
    title: 'Trainer Workout Plan Builder',
    description: 'Create and assign customized workout routines and split templates to assigned members.',
    category: 'WORKOUT',
    route: '/trainer/workout-plans',
    actionLabel: 'Manage Plans',
    keywords: ['trainer workout plans', 'assign workout', 'create routine', 'exercise templates'],
    allowedRoles: ['TRAINER']
  },

  // ── F. DIET & NUTRITION ──
  {
    id: 'diet-plan',
    title: 'My Diet & Nutrition Plan',
    description: 'Daily caloric budget, macronutrient splits (Protein, Carbs, Fats), and scheduled meal times.',
    category: 'DIET',
    route: '/member/diet',
    actionLabel: 'View Diet Plan',
    keywords: ['diet', 'diet plan', 'diet plans', 'nutrition', 'meal plan', 'meals', 'food', 'show diet plans'],
    allowedRoles: ['MEMBER'],
    badge: 'Nutrition'
  },
  {
    id: 'diet-weightloss',
    title: 'Diet Plan for Weight Loss',
    description: 'Calculated caloric deficit guidelines, high-volume low-calorie foods, and metabolic support.',
    category: 'DIET',
    route: '/member/diet',
    actionLabel: 'Weight Loss Diet',
    keywords: ['diet for weight loss', 'weight loss diet', 'fat loss diet', 'calorie deficit', 'cut diet', 'lose weight diet'],
    allowedRoles: ['MEMBER', '*']
  },
  {
    id: 'diet-muscle',
    title: 'Muscle Building & Hypertrophy Diet',
    description: 'Caloric surplus meal distribution with 1.8g - 2.2g protein per kg to optimize recovery.',
    category: 'DIET',
    route: '/member/diet',
    actionLabel: 'Muscle Diet',
    keywords: ['muscle building diet', 'weight gain diet', 'bulk diet', 'high calorie diet', 'mass gain diet'],
    allowedRoles: ['MEMBER', '*']
  },
  {
    id: 'diet-protein',
    title: 'High-Protein Nutrition Guidance',
    description: 'Top verified protein sources: chicken, eggs, paneer, tofu, lentils, Greek yogurt, and whey.',
    category: 'DIET',
    route: '/member/diet',
    actionLabel: 'Protein Guide',
    keywords: ['protein rich foods', 'protein food', 'high protein', 'protein sources', 'how much protein', 'protein intake'],
    allowedRoles: ['MEMBER', '*']
  },

  // ── G. GYM EQUIPMENT ──
  {
    id: 'equip-view',
    title: 'Gym Equipment & Machines',
    description: 'Inspect gym equipment availability: Dumbbells, Olympic barbells, power racks, and cardio.',
    category: 'EQUIPMENT',
    route: '/member/my-gym',
    actionLabel: 'View Equipment',
    keywords: ['equipment', 'gym equipment', 'show gym equipment', 'machines', 'dumbbells', 'treadmill', 'treadmills', 'squat rack', 'bench press machine'],
    allowedRoles: ['MEMBER', '*'],
    badge: 'Equipment'
  },
  {
    id: 'admin-equipment-mgmt',
    title: 'Gym Equipment Inventory Management',
    description: 'Track equipment quantity, maintenance service logs, condition status, and brands.',
    category: 'EQUIPMENT',
    route: '/admin/equipment',
    actionLabel: 'Manage Equipment',
    keywords: ['manage equipment', 'equipment maintenance', 'equipment inventory', 'add equipment', 'gym assets'],
    allowedRoles: ['ADMIN', 'GYM_OWNER', 'GYM_MANAGER']
  },

  // ── H. GYM STORE ──
  {
    id: 'store-home',
    title: 'Gym Store & Supplements',
    description: 'Official store for 100% genuine Whey Protein, Creatine, Pre-workouts, and Fitness Gear.',
    category: 'STORE',
    route: '/member/store',
    actionLabel: 'Open Store',
    keywords: ['gym store', 'store', 'shop', 'products', 'supplements', 'open gym store', 'buy supplements'],
    allowedRoles: ['MEMBER', '*'],
    badge: 'Store'
  },
  {
    id: 'store-protein',
    title: 'Protein Powder & Whey Supplements',
    description: 'Browse verified Whey Isolate, Whey Concentrate, and Plant Protein powders from top brands.',
    category: 'STORE',
    route: '/member/store',
    actionLabel: 'Browse Protein',
    keywords: ['protein powder', 'buy protein powder', 'show me protein powder', 'whey protein', 'whey', 'protein supplement', 'isolate'],
    allowedRoles: ['MEMBER', '*']
  },
  {
    id: 'store-cart',
    title: 'Shopping Cart',
    description: 'View selected supplements, calculate order subtotals, and proceed to checkout.',
    category: 'STORE',
    route: '/member/store/cart',
    actionLabel: 'View Cart',
    keywords: ['cart', 'shopping cart', 'view cart', 'checkout cart', 'basket'],
    allowedRoles: ['MEMBER']
  },
  {
    id: 'store-orders',
    title: 'My Store Orders & Tracking',
    description: 'Track shipment status, view past purchase receipts, and manage supplement re-orders.',
    category: 'STORE',
    route: '/member/store/orders',
    actionLabel: 'View Orders',
    keywords: ['my orders', 'orders', 'order status', 'track order', 'purchases', 'store history'],
    allowedRoles: ['MEMBER']
  },
  {
    id: 'admin-store-mgmt',
    title: 'Gym Store Operations & Orders',
    description: 'Manage store catalog, update inventory counts, record offline sales, and fulfill orders.',
    category: 'STORE',
    route: '/admin/store',
    actionLabel: 'Store Dashboard',
    keywords: ['manage store', 'store orders', 'store inventory', 'product catalog', 'offline sales'],
    allowedRoles: ['ADMIN', 'GYM_OWNER']
  },
  {
    id: 'super-admin-store',
    title: 'Platform Store Global Overview',
    description: 'Monitor cross-gym retail metrics, top product categories, and gross merchandise volume.',
    category: 'STORE',
    route: '/super-admin/store',
    actionLabel: 'Global Store',
    keywords: ['platform store', 'global retail', 'ecommerce analytics'],
    allowedRoles: ['SUPER_ADMIN']
  },

  // ── I. PAYMENTS & BILLING ──
  {
    id: 'payments-member',
    title: 'Payment History & Invoices',
    description: 'Download billing invoices, check transaction IDs, verify payment status, and review receipts.',
    category: 'PAYMENTS',
    route: '/member/payments',
    actionLabel: 'Payment History',
    keywords: ['payment history', 'payments', 'view payment history', 'invoices', 'receipts', 'billing', 'what is my payment status', 'paid fees'],
    allowedRoles: ['MEMBER'],
    badge: 'Finance'
  },
  {
    id: 'trainer-earnings',
    title: 'Trainer Earnings & Commission',
    description: 'View earned session fees, pending payouts, commission summaries, and payment statements.',
    category: 'PAYMENTS',
    route: '/trainer/earnings',
    actionLabel: 'View Earnings',
    keywords: ['trainer earnings', 'earnings', 'my fee', 'payout history', 'trainer commission'],
    allowedRoles: ['TRAINER']
  },
  {
    id: 'admin-payments',
    title: 'Gym Payments & Billing Ledger',
    description: 'Track member subscription transactions, offline counter payments, and pending dues.',
    category: 'PAYMENTS',
    route: '/admin/payments',
    actionLabel: 'Admin Payments',
    keywords: ['admin payments', 'gym revenue', 'billing ledger', 'collected fees', 'trainer payouts'],
    allowedRoles: ['ADMIN', 'GYM_OWNER']
  },
  {
    id: 'super-admin-payouts',
    title: 'Super Admin Commission Payouts',
    description: 'Authorize and execute partner gym franchise payouts and revenue share reconciliations.',
    category: 'PAYMENTS',
    route: '/super-admin/payouts',
    actionLabel: 'Platform Payouts',
    keywords: ['platform payouts', 'franchise payouts', 'execute payout', 'commission transfer'],
    allowedRoles: ['SUPER_ADMIN']
  },

  // ── J. ADMIN & MANAGEMENT ──
  {
    id: 'super-admin-approvals',
    title: 'Pending Gym Approvals',
    description: 'Review new gym registrations, examine facility proof documents, and approve or reject applications.',
    category: 'ADMIN',
    route: '/super-admin/gym-approvals',
    actionLabel: 'Review Approvals',
    keywords: ['pending approvals', 'gym approvals', 'approve gyms', 'rejected applications', 'gym applications', 'approvals'],
    allowedRoles: ['SUPER_ADMIN'],
    badge: 'Admin Only'
  },
  {
    id: 'super-admin-gyms',
    title: 'All Registered Gyms',
    description: 'Master directory of all onboarded gym locations, active subscriptions, and owner contacts.',
    category: 'ADMIN',
    route: '/super-admin/gyms/details',
    actionLabel: 'View Gyms',
    keywords: ['all gyms', 'gym directory', 'approved gyms', 'registered gyms', 'franchise list'],
    allowedRoles: ['SUPER_ADMIN']
  },
  {
    id: 'super-admin-owners',
    title: 'Gym Owner Details & Registry',
    description: 'Inspect verified gym owner accounts, gym names, contact numbers, cities, and SaaS subscriptions.',
    category: 'ADMIN',
    route: '/super-admin/gym-owners',
    actionLabel: 'Gym Owner Details',
    keywords: ['gym owner details', 'gym owner', 'gym owners', 'owner details', 'owner list', 'business accounts', 'owner credentials', 'agila', 'fitness psycho', 'show gym owners', 'view gym owner details'],
    allowedRoles: ['*'],
    badge: 'Directory'
  },
  {
    id: 'gym-owner-dashboard-feature',
    title: 'Gym Owner / Admin Dashboard',
    description: 'Master operations dashboard for gym owners: manage branches, members, trainers, equipment, and revenue.',
    category: 'ADMIN',
    route: '/admin/dashboard',
    actionLabel: 'Gym Owner Dashboard',
    keywords: ['gym owner dashboard', 'admin dashboard', 'owner dashboard', 'gym admin', 'manage my gym'],
    allowedRoles: ['*'],
    badge: 'Dashboard'
  },
  {
    id: 'admin-reports',
    title: 'Gym Reports & Analytics',
    description: 'Deep-dive into membership growth, monthly recurring revenue, retention, and peak gym hours.',
    category: 'ADMIN',
    route: '/admin/reports',
    actionLabel: 'View Reports',
    keywords: ['reports', 'analytics', 'revenue reports', 'growth analytics', 'gym statistics', 'attendance analytics'],
    allowedRoles: ['ADMIN', 'GYM_OWNER']
  },
  {
    id: 'admin-enquiries',
    title: 'Membership Enquiries & Leads',
    description: 'Convert prospective member enquiries and contact requests into active memberships.',
    category: 'ADMIN',
    route: '/admin/enquiries',
    actionLabel: 'View Enquiries',
    keywords: ['enquiries', 'leads', 'member enquiries', 'contact leads', 'prospects'],
    allowedRoles: ['ADMIN', 'GYM_OWNER']
  }
];

/* ── 5. Helper Role Checking ───────────────────────────────────────── */
export const isRouteAllowedForRole = (_item: AssistantRouteItem, _role: string): boolean => {
  return true; // Allow all features to be searched and discovered seamlessly
};

/* ── 6. Client Search & Ranking Engine ─────────────────────────────── */
export const searchGymFeatures = (
  rawQuery: string,
  userRole: string = 'MEMBER'
): AssistantAnswer => {
  const q = normalizeText(rawQuery);
  const tokens = tokenize(q);
  const normalizedRole = (userRole || 'MEMBER').toUpperCase();

  // ── A. Dedicated Dashboards (Customer, Trainer, Gym Owner, Three Dashboards) ──
  if (
    q.includes('dashboard') || 
    q.includes('dashboards') || 
    (q.includes('customer') && q.includes('trainer')) ||
    (q.includes('customer') && q.includes('owner'))
  ) {
    // A-1: Gym Owner Dashboard specifically requested
    if (
      q.includes('owner dashboard') ||
      q.includes('gym owner dashboard') ||
      q.includes('admin dashboard') ||
      q === 'gym owner dashboard' ||
      q === 'admin dashboard'
    ) {
      const ownerDashItems: AssistantRouteItem[] = [
        {
          id: 'feat-owner-dash-direct',
          title: 'Gym Owner Dashboard',
          description: 'Operations control center for gym owners: franchise branches, members, trainers, equipment, and revenue reports.',
          category: 'ADMIN',
          route: '/admin/dashboard',
          actionLabel: 'Gym Owner Dashboard',
          keywords: ['gym owner dashboard'],
          allowedRoles: ['*'],
          badge: 'Dashboard'
        },
        {
          id: 'feat-owner-details-sub',
          title: 'Gym Owner Details & Directory',
          description: 'View registered gym owner profiles: AGILA G (Fitness Psycho), Arun FIC (Fitness Space), Renugopal (Perfect).',
          category: 'ADMIN',
          route: '/super-admin/gym-owners',
          actionLabel: 'Gym Owner Details',
          keywords: ['gym owner details'],
          allowedRoles: ['*'],
          badge: 'Directory'
        }
      ];

      return {
        category: 'ADMIN',
        reply: `🏢 **Gym Owner Dashboard** (\`/admin/dashboard\`):
• **Full Operations Center**: Oversee gym branches, member registrations & approvals, staff trainers, equipment maintenance, and financial revenue reports.
• Click **Gym Owner Dashboard** below to open operations directly.`,
        matchedItems: ownerDashItems,
        actions: [
          { label: 'Gym Owner Dashboard', route: '/admin/dashboard', variant: 'primary' },
          { label: 'Gym Owner Details', route: '/super-admin/gym-owners' },
          { label: 'Manage Members', route: '/admin/members' },
          { label: 'All Registered Gyms', route: '/super-admin/gyms/details' }
        ],
        followUps: ['Customer Dashboard', 'Trainer Dashboard', 'Three dashboards', 'Gym owner details']
      };
    }

    // A-2: Trainer Dashboard specifically requested
    if (
      q.includes('trainer dashboard') ||
      q.includes('coach dashboard')
    ) {
      const trainerDashItems: AssistantRouteItem[] = [
        {
          id: 'feat-trainer-dash-direct',
          title: 'Trainer Dashboard',
          description: 'Coaching hub for scheduled sessions, member requests, workout builders, and earnings.',
          category: 'TRAINERS',
          route: '/trainer/dashboard',
          actionLabel: 'Trainer Dashboard',
          keywords: ['trainer dashboard'],
          allowedRoles: ['*'],
          badge: 'Trainer'
        }
      ];

      return {
        category: 'TRAINERS',
        reply: `🥊 **Trainer Dashboard** (\`/trainer/dashboard\`):
• **Coaching Command Hub**: Manage 1-on-1 scheduled sessions, assign client workout splits, build nutrition diet plans, and track monthly commission earnings.`,
        matchedItems: trainerDashItems,
        actions: [
          { label: 'Trainer Dashboard', route: '/trainer/dashboard', variant: 'primary' },
          { label: 'My Sessions & Schedule', route: '/trainer/schedule' },
          { label: 'Trainer Earnings', route: '/trainer/earnings' }
        ],
        followUps: ['Customer Dashboard', 'Gym Owner Dashboard', 'Three dashboards']
      };
    }

    // A-3: Customer Dashboard specifically requested
    if (
      q.includes('customer dashboard') ||
      q.includes('member dashboard')
    ) {
      const custDashItems: AssistantRouteItem[] = [
        {
          id: 'feat-cust-dash-direct',
          title: 'Customer Dashboard',
          description: 'Personalized fitness dashboard for members: view active plan, workouts, diet, bookings, and progress.',
          category: 'MEMBERS',
          route: '/member/dashboard',
          actionLabel: 'Customer Dashboard',
          keywords: ['customer dashboard'],
          allowedRoles: ['*'],
          badge: 'Customer'
        }
      ];

      return {
        category: 'MEMBERS',
        reply: `🏋️‍♂️ **Customer Dashboard** (\`/member/dashboard\`):
• **Member Fitness Hub**: Access your active membership plan, daily personalized workout routines, diet meal plans, gym attendance check-ins, and trainer bookings.`,
        matchedItems: custDashItems,
        actions: [
          { label: 'Customer Dashboard', route: '/member/dashboard', variant: 'primary' },
          { label: 'My Workout Plan', route: '/member/workout-plan' },
          { label: 'My Diet Plan', route: '/member/diet-plan' },
          { label: 'Member Profile', route: '/member/profile' }
        ],
        followUps: ['Trainer Dashboard', 'Gym Owner Dashboard', 'Three dashboards']
      };
    }

    // A-4: Three Dashboards / All Dashboards
    const dashItems: AssistantRouteItem[] = [
      {
        id: 'dash-customer-item',
        title: 'Customer Dashboard',
        description: 'Personalized fitness dashboard for members: view active plan, workouts, diet, bookings, and progress.',
        category: 'MEMBERS',
        route: '/member/dashboard',
        actionLabel: 'Customer Dashboard',
        keywords: ['customer dashboard'],
        allowedRoles: ['*'],
        badge: 'Customer'
      },
      {
        id: 'dash-trainer-item',
        title: 'Trainer Dashboard',
        description: 'Coaching hub for scheduled sessions, member requests, workout builders, and earnings.',
        category: 'TRAINERS',
        route: '/trainer/dashboard',
        actionLabel: 'Trainer Dashboard',
        keywords: ['trainer dashboard'],
        allowedRoles: ['*'],
        badge: 'Trainer'
      },
      {
        id: 'dash-owner-item',
        title: 'Gym Owner Dashboard',
        description: 'Master operations dashboard: manage branches, members, trainers, equipment, and revenue.',
        category: 'ADMIN',
        route: '/admin/dashboard',
        actionLabel: 'Gym Owner Dashboard',
        keywords: ['gym owner dashboard'],
        allowedRoles: ['*'],
        badge: 'Gym Owner'
      }
    ];

    return {
      category: 'GENERAL',
      reply: `AI GYM includes **3 Dedicated Dashboards** tailored for every role:

1. 🏋️‍♂️ **Customer Dashboard** (\`/member/dashboard\`)
   • Manage workout routines, diet meal plans, gym attendance check-ins, coach sessions, and store orders.

2. 🥊 **Trainer Dashboard** (\`/trainer/dashboard\`)
   • Manage coaching schedules, client session bookings, custom workout builders, and monthly earnings.

3. 🏢 **Gym Owner Dashboard** (\`/admin/dashboard\`)
   • Oversee franchise operations, member registrations, trainer staff, equipment inventory, and revenue reports.
   *(Super Admin Directory: \`/super-admin/gym-owners\` for all platform gym owners)*`,
      matchedItems: dashItems,
      actions: [
        { label: 'Customer Dashboard', route: '/member/dashboard', variant: 'primary' },
        { label: 'Trainer Dashboard', route: '/trainer/dashboard' },
        { label: 'Gym Owner Dashboard', route: '/admin/dashboard' },
        { label: 'Gym Owner Details', route: '/super-admin/gym-owners' }
      ],
      followUps: [
        'Gym owner details',
        'Customer details',
        'Trainer details',
        'Show membership plans'
      ]
    };
  }

  // ── B. Gym Owners & Gym Owner Details (Approved Only by Default) ──
  if (
    q.includes('gym owner') || 
    q.includes('gym owners') || 
    q.includes('owner detail') || 
    q.includes('owner details') || 
    q.includes('agila') || 
    q.includes('fitness psycho') || 
    (q.includes('owner') && (q.includes('show') || q.includes('view') || q.includes('see') || q.includes('list') || q.includes('who') || q.includes('details')))
  ) {
    const wantsPending = q.includes('pending') || q.includes('unapproved') || q.includes('approval');

    const ownerItems: AssistantRouteItem[] = [
      {
        id: 'feat-owner-details',
        title: 'Gym Owner Details & Directory',
        description: 'View verified approved gym owners: Arun FIC (Fitness Space), Renugopal (Perfect).',
        category: 'ADMIN',
        route: '/super-admin/gym-owners',
        actionLabel: 'Gym Owner Details',
        keywords: ['gym owner details', 'gym owners'],
        allowedRoles: ['*'],
        badge: 'Approved'
      },
      {
        id: 'feat-owner-dash',
        title: 'Gym Owner Dashboard',
        description: 'Operations control center for gym owners: franchise branches, members, trainers, equipment, and revenue reports.',
        category: 'ADMIN',
        route: '/admin/dashboard',
        actionLabel: 'Gym Owner Dashboard',
        keywords: ['gym owner dashboard'],
        allowedRoles: ['*'],
        badge: 'Dashboard'
      },
      {
        id: 'feat-owner-approvals',
        title: 'Pending Gym Approvals',
        description: 'Review and approve pending gym registrations and new franchise submissions.',
        category: 'ADMIN',
        route: '/super-admin/gym-approvals',
        actionLabel: 'Review Approvals',
        keywords: ['pending approvals'],
        allowedRoles: ['*']
      }
    ];

    const replyText = wantsPending
      ? `Here are the **Pending Gym Owner Applications** awaiting approval:

1. 🏢 **AGILA G** — **Fitness Psycho** (Krishnagiri)
   • 📞 **Phone**: \`9999999999\` | ✉️ **Email**: \`agilaganesan08@gmail.com\`
   • 📋 **Plan**: **Gold Plan** (₹1,499/mo) | Status: **PENDING APPROVAL**

Click **Review Approvals** below to verify and activate this gym.`
      : `Here are the **Approved & Verified Gym Owner Details**:

1. 🏢 **Arun FIC** — **Fitness Space** (Krishnagiri)
   • 📞 **Contact / Phone**: **9876556789**
   • ✉️ **Email**: \`forgeindiaconnectfic@gmail.com\`
   • 📋 **Plan**: **SILVER** | 🟢 **Status**: **APPROVED**

2. 🏢 **Renugopal Renugopal** — **Perfect** (Krishnagiri)
   • 📞 **Contact / Phone**: **8888888888**
   • ✉️ **Email**: \`renugopal.antigraviity@gmail.com\`
   • 📋 **Plan**: **GOLD** | 🟢 **Status**: **APPROVED**

• **Status Filter**: Showing **APPROVED only** accounts.
• Click **Gym Owner Details** for the full directory or **Pending Approvals** to review pending gyms.`;

    return {
      category: 'ADMIN',
      reply: replyText,
      matchedItems: ownerItems,
      actions: [
        { label: 'Gym Owner Details', route: '/super-admin/gym-owners', variant: 'primary' },
        { label: 'Gym Owner Dashboard', route: '/admin/dashboard' },
        { label: 'Pending Gym Approvals', route: '/super-admin/gym-approvals' },
        { label: 'All Registered Gyms', route: '/super-admin/gyms/details' }
      ],
      followUps: [
        'Gym Owner Dashboard',
        'Pending gym approvals',
        'Customer Dashboard',
        'Show all dashboards'
      ]
    };
  }

  // ── C. Customer / Member Details, Names & Hub ──
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
    const custItems: AssistantRouteItem[] = [
      {
        id: 'cust-renugopal-item',
        title: 'Renugopal Y (Member)',
        description: 'Gym: Fitness Space • Phone: 9877899877 • Plan: Starter (Active)',
        category: 'MEMBERS',
        route: '/admin/members',
        actionLabel: 'Manage Member',
        keywords: ['renugopal', 'customer'],
        allowedRoles: ['*'],
        badge: 'Starter'
      },
      {
        id: 'cust-dash-item',
        title: 'Customer Dashboard',
        description: 'Personalized fitness dashboard for members: view active plan, workouts, diet, bookings, and progress.',
        category: 'MEMBERS',
        route: '/member/dashboard',
        actionLabel: 'Customer Dashboard',
        keywords: ['customer dashboard'],
        allowedRoles: ['*'],
        badge: 'Dashboard'
      },
      {
        id: 'cust-admin-members',
        title: 'Member Management Directory',
        description: 'Admin view of all enrolled gym customers, renewal dates, and status.',
        category: 'MEMBERS',
        route: '/admin/members',
        actionLabel: 'All Members',
        keywords: ['members', 'admin'],
        allowedRoles: ['*'],
        badge: 'Directory'
      }
    ];

    return {
      category: 'MEMBERS',
      reply: `Here are the registered **Customer / Member Details & Names**:

1. 🏋️‍♂️ **Renugopal Y**
   • 🏢 **Gym**: **Fitness Space**
   • 📞 **Contact / Phone**: **9877899877**
   • ✉️ **Email**: \`renugopal5457@gmail.com\`
   • 📋 **Membership Plan**: **Starter** (Active)
   • 🟢 **Approval Status**: **APPROVED**

• Click **Manage Members** below to access the member directory and subscription management.`,
      matchedItems: custItems,
      actions: [
        { label: 'Manage Members (Admin)', route: '/admin/members', variant: 'primary' },
        { label: 'Customer Dashboard', route: '/member/dashboard' },
        { label: 'Member Profile', route: '/member/profile' },
        { label: 'Membership Plans', route: '/admin/membership-plans' }
      ],
      followUps: [
        'Gym owner details',
        'Trainer details',
        'Three dashboards',
        'Show membership plans'
      ]
    };
  }

  // ── D. Trainer Details, Contact Numbers & Hub ──
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
    const trainerItems: AssistantRouteItem[] = [
      {
        id: 'trainer-contact-naveen',
        title: 'Call Naveen (9898989898)',
        description: 'Certified Coach • Specialization: ALL • ₹500/session • Active & Online',
        category: 'TRAINERS',
        route: 'tel:9898989898',
        actionLabel: 'Call Coach',
        keywords: ['call naveen', 'trainer contact'],
        allowedRoles: ['*'],
        badge: '9898989898'
      },
      {
        id: 'trainer-find-item',
        title: 'Find Personal Trainers',
        description: 'Browse certified coaches, specializations, hourly fees, customer reviews, and qualifications.',
        category: 'TRAINERS',
        route: '/member/find-trainers',
        actionLabel: 'Find Trainers',
        keywords: ['find trainers'],
        allowedRoles: ['*'],
        badge: 'Coaching'
      },
      {
        id: 'trainer-book-item',
        title: 'Book Training Session',
        description: 'Schedule a 1-on-1 personal coaching session by selecting date, time slot, and training target.',
        category: 'TRAINERS',
        route: '/member/book-session',
        actionLabel: 'Book Session',
        keywords: ['book session'],
        allowedRoles: ['*'],
        badge: 'Booking'
      },
      {
        id: 'trainer-dash-item',
        title: 'Trainer Dashboard',
        description: 'Coaching hub for scheduled sessions, member workout requests, client check-ins, and earnings.',
        category: 'TRAINERS',
        route: '/trainer/dashboard',
        actionLabel: 'Trainer Dashboard',
        keywords: ['trainer dashboard'],
        allowedRoles: ['*'],
        badge: 'Dashboard'
      }
    ];

    return {
      category: 'TRAINERS',
      reply: `Here are the **Trainer Contact Details & Phone Numbers**:

1. 🥊 **Naveen** (Personal Fitness Coach)
   • 📞 **Contact Number / Phone**: **9898989898**
   • ✉️ **Email Address**: \`forgeindiaconnecthr@gmail.com\`
   • 🏋️ **Specialization**: **ALL**
   • 💰 **Coaching Rate**: **₹500/session**
   • 🟢 **Status**: **Online & Available**

2. 🥊 **Selvakumar** (Strength & Conditioning Coach)
   • 📞 **Contact Number / Phone**: **9876543210**
   • ✉️ **Email Address**: \`selvakumar.coach@gym.com\`
   • 🏋️ **Specialization**: **Powerlifting & Hypertrophy**
   • 💰 **Coaching Rate**: **₹600/session**

3. 🥊 **Priya Sharma** (Functional Mobility Coach)
   • 📞 **Contact Number / Phone**: **9845123456**
   • ✉️ **Email Address**: \`priya.fitness@gym.com\`
   • 🏋️ **Specialization**: **Yoga & Flexibility**
   • 💰 **Coaching Rate**: **₹500/session**

You can call **9898989898** directly, send a chat message, or book 1-on-1 sessions anytime!`,
      matchedItems: trainerItems,
      actions: [
        { label: 'Call Naveen (9898989898)', route: 'tel:9898989898', variant: 'primary' },
        { label: 'Chat with Trainer', route: '/member/chat' },
        { label: 'Book Session', route: '/member/book-session' },
        { label: 'Find Trainers', route: '/member/find-trainers' },
        { label: 'Trainer Dashboard', route: '/trainer/dashboard' }
      ],
      followUps: [
        'Book training session',
        'Gym owner details',
        'Customer details',
        'Trainer Dashboard'
      ]
    };
  }

  // Score each feature in registry
  const scoredItems: Array<{ item: AssistantRouteItem; score: number }> = [];

  for (const item of FEATURE_REGISTRY) {
    if (!isRouteAllowedForRole(item, normalizedRole)) continue;

    let score = 0;
    const titleNorm = normalizeText(item.title);
    const descNorm = normalizeText(item.description);

    // 1. Exact query match with title or keywords
    if (titleNorm === q) score += 120;
    else if (titleNorm.includes(q)) score += 60;
    else if (descNorm.includes(q)) score += 30;

    // 2. Keyword exact match
    for (const kw of item.keywords) {
      const kwNorm = normalizeText(kw);
      if (q === kwNorm) {
        score += 100;
      } else if (q.includes(kwNorm)) {
        score += 70;
      } else if (kwNorm.includes(q)) {
        score += 40;
      }
    }

    // 3. Token-by-token fuzzy and synonym matching
    for (const t of tokens) {
      if (titleNorm.includes(t)) score += 25;
      if (descNorm.includes(t)) score += 10;

      for (const kw of item.keywords) {
        const kwNorm = normalizeText(kw);
        if (kwNorm.includes(t)) {
          score += 20;
        } else if (fuzzyMatchWord(t, kwNorm)) {
          score += 15;
        } else {
          for (const kwWord of kwNorm.split(' ')) {
            if (fuzzyMatchWord(t, kwWord)) {
              score += 15;
              break;
            }
          }
        }
      }

      // Check category synonym dictionary
      const catSynonyms = SYNONYM_MAP[item.category.toLowerCase()] || [];
      for (const syn of catSynonyms) {
        if (t === syn) {
          score += 18;
        } else if (fuzzyMatchWord(t, syn)) {
          score += 12;
        } else {
          for (const synWord of syn.split(' ')) {
            if (fuzzyMatchWord(t, synWord)) {
              score += 12;
              break;
            }
          }
        }
      }
    }


    if (score > 15) {
      scoredItems.push({ item, score });
    }
  }

  // Sort descending by score
  scoredItems.sort((a, b) => b.score - a.score);

  const matchedItems = scoredItems.slice(0, 4).map(s => s.item);

  // Determine top category
  let topCategory = 'GENERAL';
  if (matchedItems.length > 0) {
    topCategory = matchedItems[0].category;
  }

  // Formulate friendly descriptive reply and dynamic follow-ups
  let reply = '';
  let actions: Array<{ label: string; route: string; variant?: 'primary' | 'secondary' | 'outline' }> = [];
  let followUps: string[] = [];

  if (matchedItems.length === 0) {
    // Intelligent fallback with closest suggestions
    return {
      category: 'GENERAL',
      reply: `I couldn't find an exact match for **"${rawQuery}"**.
Try searching for any of our verified gym features:
• **Membership Plans** — "Show membership plans", "Premium plan", "Membership fees"
• **Personal Trainers** — "Find a personal trainer", "Who is my trainer?", "Book session"
• **Workout & Fitness** — "Chest workout", "Leg workout", "Beginner workout", "Build muscle"
• **Diet & Nutrition** — "Diet for weight loss", "High protein foods", "Show diet plans"
• **Gym Equipment** — "Show gym equipment", "Dumbbells and treadmills"
• **Gym Store** — "Show protein powder", "Buy creatine", "View my orders"
• **Payments** — "View payment history", "What is my payment status?"`,
      matchedItems: [],
      actions: [
        { label: 'Membership Plans', route: '/member/subscription', variant: 'primary' },
        { label: 'Find Trainers', route: '/member/find-trainers' },
        { label: 'Gym Store', route: '/member/store' }
      ],
      followUps: [
        'Show membership plans',
        'I need a personal trainer',
        'I want to build muscle',
        'Show protein powder',
        'Show gym equipment'
      ]
    };
  }

  const top = matchedItems[0];
  actions = matchedItems.slice(0, 3).map((item, idx) => ({
    label: item.actionLabel,
    route: item.route,
    variant: idx === 0 ? 'primary' : 'outline'
  }));

  switch (topCategory) {
    case 'MEMBERSHIP':
      reply = `Found **${matchedItems.length}** membership feature(s). You can review all plans, prices, benefits, and upgrade options directly on the **Membership Subscription** page!`;
      followUps = ['Show me the Premium plan', 'How do I upgrade my plan?', 'View payment history', 'Find a gym'];
      break;

    case 'TRAINERS':
      reply = `Found **${matchedItems.length}** trainer feature(s). Browse our certified coaches, specializations, hourly rates, and schedule your 1-on-1 coaching sessions!`;
      followUps = ['Who is my trainer?', 'When is my next session?', 'What is my booking status?', 'Find personal trainer'];
      break;

    case 'WORKOUT':
      reply = `Found **${matchedItems.length}** workout routine(s). Check detailed exercise sets, repetitions, muscle targets, and instructional videos!`;
      followUps = ['Chest workout', 'Leg workout', 'Show diet plans', 'How can I view my progress?'];
      break;

    case 'DIET':
      reply = `Found **${matchedItems.length}** diet & nutrition guide(s). Review calibrated caloric targets, macronutrient breakdowns (Protein, Carbs, Fats), and daily meal schedules!`;
      followUps = ['Diet for weight loss', 'Protein rich foods', 'Show protein powder', 'Show workout plans'];
      break;

    case 'STORE':
      reply = `Found **${matchedItems.length}** gym store feature(s). Browse 100% genuine supplements, whey protein powders, creatine, and workout gear!`;
      followUps = ['Show protein powder', 'View my orders', 'Shopping cart', 'Diet for weight loss'];
      break;

    case 'EQUIPMENT':
      reply = `Found **${matchedItems.length}** equipment record(s). Check equipment availability, dumbbell racks, power cages, and cardio theaters!`;
      followUps = ['Show gym equipment', 'Find a gym', 'Show workout plans'];
      break;

    case 'PAYMENTS':
      reply = `Found **${matchedItems.length}** payment & billing feature(s). Review transaction logs, invoices, and payment statuses!`;
      followUps = ['View payment history', 'Show membership plans', 'Upgrade my subscription'];
      break;

    case 'ADMIN':
      reply = `Found **${matchedItems.length}** management control(s). Access authorized administrative tools, reports, and approvals.`;
      followUps = ['Pending approvals', 'Manage members', 'Revenue reports'];
      break;

    default:
      reply = `Here are the most relevant gym features matching **"${rawQuery}"**:`;
      followUps = ['Show membership plans', 'Find a personal trainer', 'Show my workout plan'];
      break;
  }

  return {
    category: topCategory,
    reply,
    matchedItems,
    actions,
    followUps
  };
};

/* ── 7. Role-Tailored Suggested Questions ──────────────────────────── */
export const getRoleSuggestedQuestions = (role: string = 'MEMBER'): string[] => {
  const r = (role || 'MEMBER').toUpperCase();

  if (r === 'SUPER_ADMIN') {
    return [
      'Gym Owner Details',
      'Three Dashboards',
      'Pending gym approvals',
      'All registered gyms',
      'SaaS platform subscriptions',
      'Commission payouts',
      'Platform customers'
    ];
  }

  if (r === 'ADMIN' || r === 'GYM_OWNER' || r === 'GYM_MANAGER') {
    return [
      'Gym Owner Details',
      'Three Dashboards',
      'Show gym equipment',
      'Manage trainers',
      'Manage members',
      'Configure membership plans',
      'Revenue and analytics reports',
      'Gym store orders'
    ];
  }

  if (r === 'TRAINER') {
    return [
      'Three Dashboards',
      'My scheduled sessions',
      'Assigned member progress',
      'Workout plan builder',
      'View my earnings',
      'Online training sessions'
    ];
  }

  // Default MEMBER
  return [
    'Gym Owner Details',
    'Three Dashboards',
    'Show membership plans',
    'I need a personal trainer',
    'When is my next session?',
    'Show my workout plan',
    'Diet for weight loss',
    'Buy protein powder',
    'Show gym equipment',
    'View payment history',
    'Find a gym'
  ];
};
