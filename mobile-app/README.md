# Gymora Mobile Application (React Native / Expo)

A unified, role-based mobile application built with **React Native & Expo** for:
1. **Gym Owner Mobile Application**
2. **Trainer Mobile Application**
3. **Customer / Member Mobile Application**

---

## 📱 Role-Based Modules & Features

### 1. 🏢 Gym Owner Dashboard (`src/screens/owner/`)
- **Overview**: Live gym floor counter (38 members on floor right now), Monthly Net Revenue (₹4.82L +18%), Quick action buttons (Add Member, Scan Pass, Trainers, Payouts), urgent renewal alert cards, live check-in stream.
- **Members**: Complete roster with search and filter chips (All, Active, Expiring, Expired), plan badges, and renewal dates.
- **Trainers**: Certified trainer directory with ratings (★ 4.9), active client loads, commission rates, and 1-tap call button.
- **Finances**: Financial health summary (Inflow vs Outflow), platform fee tracking, and transaction history.
- **Settings**: Branch info, geo-fence radius, push notifications, and sign-out.

### 2. 🏋️ Trainer Dashboard (`src/screens/trainer/`)
- **Schedule**: Today's 4-session timeline (Completed, Next Up, Upcoming) with 1-tap contact buttons.
- **Clients**: Client roster with fitness targets (Hypertrophy, Weight Loss, Rehab), current vs target weights, sessions left counters.
- **Workouts**: Workout splits library (Chest/Triceps, HIIT, Legs/Glutes) with exercise counts, duration, and calories.
- **Earnings**: Available commission wallet (₹37,800), payout breakdown (70% PT split, group classes, bonuses), withdrawal request button.
- **Profile**: Coach accreditation badges (ACSM, Precision Nutrition), hourly rates, and reviews.

### 3. 🔥 Customer / Member Dashboard (`src/screens/customer/`)
- **Today**: Digital Gym Entry Pass modal with QR code, 14-day streak flame badge, daily active calories ring (620 / 850 kcal), water hydration logger (+250ml quick add), assigned trainer card.
- **Workout**: Mon-Sun day split selector with interactive exercise checklist and set/rep/weight tracking.
- **Diet**: Daily macronutrient balance (Protein, Carbs, Fats) and logged meals (Breakfast, Lunch, Pre-workout, Dinner).
- **Trainers**: 1-on-1 PT marketplace with coach ratings, specialties, hourly rates, and session slot booking.
- **Pass**: Digital Gold Annual Pass card with renewal countdown, and monthly attendance log (22 visits).

---

## 🚀 How to Run with Expo

Navigate to the `mobile-app` directory:

```bash
cd mobile-app
```

### Option A: Run on Mobile Device via Expo Go (Recommended)
```bash
npx expo start
```
Scan the QR code displayed in the terminal using the **Expo Go** app on your iPhone or Android phone.

### Option B: Run in Web Browser
```bash
npx expo start --web
```

---

## 🔄 Quick Role Switcher
You can instantly switch between the **Gym Owner**, **Trainer**, and **Customer** mobile views at any time by tapping the **Role Pill** in the top navigation bar.

