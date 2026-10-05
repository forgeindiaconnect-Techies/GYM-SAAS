const mongoose = require('mongoose');

async function restore() {
  await mongoose.connect('mongodb://127.0.0.1:27017/ai-gym');
  const db = mongoose.connection.db;

  // 1. Rename Gym to "Messy fitness center"
  const gymRes = await db.collection('gyms').updateOne(
    {},
    {
      $set: {
        name: 'Messy fitness center',
        email: 'ananth@gmail.com',
        phone: '9876543212',
        subscriptionPlans: [
          {
            name: 'free trial',
            price: 0,
            duration: '1 Day',
            features: 'Gym Setup, Member Management (Up to 10), Trainer Management (1 Trainer), Membership Plans (1 Plan)'
          },
          {
            name: 'basic',
            price: 399,
            duration: '1 Month',
            features: 'Gym Setup, Member Management (Up to 100), Trainer Management (Up to 5), Membership Plans (5 Plans), Exercise & Diet Plans, AI Suggestions, Reports & Analytics'
          },
          {
            name: 'premium',
            price: 799,
            duration: '3 Months',
            features: 'Gym Setup, Unlimited Member Management, Unlimited Trainer Management, Unlimited Membership Plans, Exercise Plans, Diet Plans, Advanced AI Suggestions, Advanced Member Progress Tracking, Attendance Management, Payment Tracking, Advanced Reports & Analytics, Unlimited AI Workout Generation, Unlimited AI Diet Generation, Gym Store — Sell Supplements & Merch, Gym Store — Online Orders & Payments, Gym Store — Inventory & Offline Sales, Notifications, Multiple Branches, Priority Support'
          }
        ]
      }
    }
  );
  console.log('Gym updated to Messy fitness center:', gymRes.modifiedCount);

  // 2. Update Ananth user subscription and details
  const now = new Date();
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const userRes = await db.collection('users').updateOne(
    { email: 'ananth@gmail.com' },
    {
      $set: {
        firstName: 'Ananth',
        lastName: '',
        subscriptionStartDate: now,
        subscriptionExpiryDate: nextMonth,
        subscriptionExpiry: nextMonth,
        subscriptionPlan: 'GOLD',
        subscriptionStatus: 'Active',
        paymentStatus: 'Approved',
        isActive: true,
      }
    }
  );
  console.log('Ananth user updated:', userRes.modifiedCount);

  // 3. Update Renu user
  const renuRes = await db.collection('users').updateOne(
    { email: { $in: ['renu@gmail.com', 'renugopal@gmail.com'] } },
    {
      $set: {
        isActive: true,
        suspensionReason: null,
        rejectionReason: null,
        subscriptionStatus: 'Active',
        paymentStatus: 'Approved'
      }
    }
  );
  console.log('Renu user updated:', renuRes.modifiedCount);

  await mongoose.disconnect();
  console.log('Done!');
}

restore().catch(console.error);
