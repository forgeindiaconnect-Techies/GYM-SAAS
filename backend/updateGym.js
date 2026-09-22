const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/ai-gym')
  .then(async () => {
    const Gym = mongoose.model('Gym', new mongoose.Schema({}, { strict: false }));
    const gyms = await Gym.find({ name: { $regex: /Messy fitness/i } });
    if(gyms.length === 0) {
      console.log('No gym found');
    } else {
      const gym = gyms[0];
      const plans = gym.get('subscriptionPlans');
      if (plans) {
        plans.forEach(p => {
          if (p.name && p.name.toLowerCase() === 'premium') {
            p.features = 'Gym Setup, Unlimited Member Management, Unlimited Trainer Management, Unlimited Membership Plans, Exercise Plans, Diet Plans, Advanced AI Suggestions, Advanced Member Progress Tracking, Attendance Management, Payment Tracking, Advanced Reports & Analytics, Unlimited AI Workout Generation, Unlimited AI Diet Generation, Gym Store — Sell Supplements & Merch, Gym Store — Online Orders & Payments, Gym Store — Inventory & Offline Sales, Notifications, Multiple Branches, Priority Support';
          }
        });
        await Gym.updateOne({ _id: gym._id }, { $set: { subscriptionPlans: plans } });
        console.log('Successfully updated gym subscription plans in DB');
      }
    }
    process.exit(0);
  });
