import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

const CustomerMembershipSchema = new mongoose.Schema({}, { strict: false });
const CustomerMembership = mongoose.model('CustomerMembership', CustomerMembershipSchema);

async function migrateDb() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/ai-gym');
    console.log('Connected to DB');

    const users = await User.find({});
    for (let user of users) {
      let status = user.get('subscriptionStatus');
      if (status === 'TRIAL' || status === 'Free Trial') user.set('subscriptionStatus', 'Free Trial');
      else if (status === 'ACTIVE' || status === 'Active') user.set('subscriptionStatus', 'Active');
      else if (status === 'EXPIRED' || status === 'Expired') user.set('subscriptionStatus', 'Expired');
      else if (status === 'NONE' || status === 'None') user.set('subscriptionStatus', 'None');
      else if (status === 'PENDING' || status === 'Pending') user.set('subscriptionStatus', 'Payment Verification Pending');
      
      let pStatus = user.get('paymentStatus');
      if (pStatus === 'PAID') user.set('paymentStatus', 'Approved');
      else if (pStatus === 'PENDING') user.set('paymentStatus', 'Pending Verification');

      await user.save();
    }
    console.log('Migrated Users');

    const memberships = await CustomerMembership.find({});
    for (let m of memberships) {
      let status = m.get('status');
      if (status === 'TRIAL' || status === 'Free Trial') m.set('status', 'Free Trial');
      else if (status === 'ACTIVE' || status === 'Active') m.set('status', 'Active');
      else if (status === 'EXPIRED' || status === 'Expired') m.set('status', 'Expired');
      else if (status === 'PENDING_VERIFICATION') m.set('status', 'Payment Verification Pending');
      await m.save();
    }
    console.log('Migrated Memberships');
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrateDb();
