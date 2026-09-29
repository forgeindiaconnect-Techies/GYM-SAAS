const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/ai-gym');
  const now = new Date('2026-09-29T15:00:00+05:30');
  const nextMonth = new Date('2026-10-29T15:00:00+05:30');
  
  const resUser = await mongoose.connection.collection('users').updateOne(
    { email: 'ananth@gmail.com' },
    {
      $set: {
        subscriptionStartDate: now,
        subscriptionExpiryDate: nextMonth,
        subscriptionExpiry: nextMonth,
        subscriptionPlan: 'GOLD',
        subscriptionStatus: 'Active'
      }
    }
  );
  console.log('Updated user:', resUser.modifiedCount);

  const resSub = await mongoose.connection.collection('subscriptions').updateOne(
    { userId: '6aba379edcdc91b24d17e867' },
    {
      $set: {
        startDate: now,
        endDate: nextMonth,
        status: 'ACTIVE',
        plan: 'GOLD'
      }
    }
  );
  console.log('Updated subscription (string id):', resSub.modifiedCount);

  const resSubObj = await mongoose.connection.collection('subscriptions').updateOne(
    { userId: new mongoose.Types.ObjectId('6aba379edcdc91b24d17e867') },
    {
      $set: {
        startDate: now,
        endDate: nextMonth,
        status: 'ACTIVE',
        plan: 'GOLD'
      }
    }
  );
  console.log('Updated subscription (ObjectId):', resSubObj.modifiedCount);

  const updatedUser = await mongoose.connection.collection('users').findOne({ email: 'ananth@gmail.com' });
  console.log('Result user subscription:', {
    subscriptionStartDate: updatedUser.subscriptionStartDate,
    subscriptionExpiryDate: updatedUser.subscriptionExpiryDate,
    subscriptionExpiry: updatedUser.subscriptionExpiry
  });
  
  await mongoose.disconnect();
}

run().catch(console.error);
