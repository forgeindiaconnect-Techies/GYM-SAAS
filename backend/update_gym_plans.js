const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/ai-gym');
  const db = mongoose.connection.db;
  await db.collection('gyms').updateOne(
    { name: 'Messy fitness center' },
    { $set: { 
        subscriptionPlans: [
          { name: 'free trial', price: 0, duration: '1 Day', features: 'Gym Setup, Member Management (Up to 10), Trainer Management (1 Trainer), Membership Plans (1 Plan)' },
          { name: 'basic', price: 399, duration: '1 Month', features: 'Gym Setup, Member Management (Up to 100), Trainer Management (Up to 5), Membership Plans (5 Plans), Exercise & Diet Plans, AI Suggestions, Reports & Analytics' },
          { name: 'premium', price: 799, duration: '3 Months', features: 'Gym Setup, Unlimited Members & Trainers, Unlimited Membership Plans, Exercise & Diet Plans, Advanced AI Suggestions, Multiple Branches, Priority Support' }
        ] 
      } 
    }
  );
  console.log('DB Updated');
  process.exit(0);
}

run();
