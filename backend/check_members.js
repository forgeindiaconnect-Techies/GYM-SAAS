import mongoose from 'mongoose';

mongoose.connect('mongodb://127.0.0.1:27017/ai-gym')
  .then(async () => {
    console.log('Connected to DB');
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).sort({ createdAt: -1 }).limit(10).toArray();
    
    for (const u of users) {
      console.log(`\nUser: ${u.firstName} ${u.lastName} | Role: ${u.role} | Email: ${u.email} | Plan: ${u.subscriptionPlan} | Joined: ${u.createdAt} | Expiry: ${u.subscriptionExpiry}`);
      const mems = await db.collection('customermemberships').find({ userId: u._id }).toArray();
      console.log(`Memberships count: ${mems.length}`);
      for (const m of mems) {
         console.log(`  Mem: ${m.planName} | duration: ${m.duration} | startDate: ${m.startDate} | endDate: ${m.endDate}`);
      }
    }
    process.exit(0);
  })
  .catch(console.error);
