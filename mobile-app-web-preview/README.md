# Gymora Mobile Application

A role-based mobile application converted from the Gym Management SaaS platform for **Gym Owners**, **Trainers**, and **Customers**.

---

## 📱 Module Architecture

The mobile application is strictly separated into three independent role-based modules:

```
mobile-app/
├── src/
│   ├── modules/
│   │   ├── auth/                    # Unified Mobile Auth & Onboarding
│   │   │   └── screens/
│   │   │       ├── RoleSelectorScreen.tsx
│   │   │       └── MobileLoginScreen.tsx
│   │   │
│   │   ├── gym-owner/               # Module 1: Gym Owner Application
│   │   │   └── screens/
│   │   │       ├── GymOwnerDashboardScreen.tsx  (Live revenue, floor check-ins, retention)
│   │   │       ├── GymOwnerMembersScreen.tsx    (Member roster, filters, add member modal)
│   │   │       ├── GymOwnerTrainersScreen.tsx   (Trainer staff, commissions, onboarding)
│   │   │       ├── GymOwnerFinancesScreen.tsx   (Revenue analytics, statements, payout logs)
│   │   │       └── GymOwnerSettingsScreen.tsx   (Branch control, operating hours, account)
│   │   │
│   │   ├── trainer/                 # Module 2: Trainer Application
│   │   │   └── screens/
│   │   │       ├── TrainerDashboardScreen.tsx   (Daily schedule timeline, next session)
│   │   │       ├── TrainerClientsScreen.tsx     (Client roster, goal tracking, adherence)
│   │   │       ├── TrainerWorkoutsScreen.tsx    (Workout split library & assignment)
│   │   │       ├── TrainerEarningsScreen.tsx    (Commission wallet, payouts, withdrawal)
│   │   │       └── TrainerProfileScreen.tsx     (Certifications, ratings, hourly rates)
│   │   │
│   │   └── customer/                # Module 3: Customer / Member Application
│   │       └── screens/
│   │           ├── CustomerDashboardScreen.tsx  (Digital QR Gym Pass, streak, calories)
│   │           ├── CustomerWorkoutsScreen.tsx   (Push/Pull/Legs splits, set/rep loggers)
│   │           ├── CustomerDietScreen.tsx       (Macro ratios, meal logging, hydration)
│   │           ├── CustomerTrainersScreen.tsx   (1-on-1 PT marketplace & slot booking)
│   │           └── CustomerProfileScreen.tsx    (Membership pass, attendance history)
│   │
│   ├── shared/                      # Reusable Utilities & Design System
│   │   ├── api/client.ts            # Axios client with auto JWT & 401 interceptors
│   │   ├── auth/AuthContext.tsx     # Role auth provider with demo 1-tap logins
│   │   ├── components/              # Native-styled touch components
│   │   │   ├── MobileLayout.tsx     (Simulated device frame, safe-areas, role-bar)
│   │   │   ├── MobileHeader.tsx     (Native top nav with role badges & back button)
│   │   │   ├── MobileBottomNav.tsx  (5-tab bottom navigation per role)
│   │   │   ├── MobileCard.tsx
│   │   │   ├── MobileStatCard.tsx
│   │   │   ├── MobileButton.tsx
│   │   │   ├── MobileInput.tsx
│   │   │   └── MobileModal.tsx
│   │   └── theme/colors.ts          # Standardized Gymora color tokens
│   │
│   ├── App.tsx                      # Central router with role routing guards
│   ├── main.tsx
│   └── index.css
│
├── capacitor.config.json            # Capacitor iOS & Android mobile config
├── package.json
└── vite.config.ts                   # Configured on port 5174 (distinct from web frontend)
```

---

## 🚀 Running the Mobile Application

### Development Server:
```bash
cd mobile-app
npx vite --port 5174
```
Access the mobile interface in your browser:
**`http://localhost:5174`**

### Building for Production:
```bash
cd mobile-app
npx vite build
```

---

## ⚡ Role-Based Routing & Demo Credentials

| Role | Landing Route | Default Bottom Tabs | 1-Tap Demo Access |
|---|---|---|---|
| **Gym Owner** | `/owner` | Overview, Members, Trainers, Finances, Settings | Instant button on `/login` |
| **Trainer** | `/trainer` | Schedule, Clients, Workouts, Earnings, Profile | Instant button on `/login` |
| **Customer** | `/customer` | Home, Workouts, Diet, Trainers, Profile | Instant button on `/login` |

---

## 🔗 Backend & Database Synchronization
- Connects directly to the existing Express REST API at `http://localhost:5600/api`.
- Authenticates using standard JWT tokens (`Bearer <token>`).
- Completely isolated session storage (`gymora_mobile_token`, `gymora_mobile_user`) to guarantee no state collision with the desktop web portal.
- Super Admin dashboard remains strictly **web-only** as requested.

