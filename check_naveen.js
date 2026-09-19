const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/ai-gym');
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Membership = mongoose.model('CustomerMembership', new mongoose.Schema({}, { strict: false, collection: 'customermemberships' }));

  const naveen = await User.findOne({ firstName: 'Naveen' });
  console.log('Naveen User:', naveen);

  if (naveen) {
    const mems = await Membership.find({ userId: naveen._id });
    console.log('Naveen Memberships:', mems);
  }

  process.exit(0);
}

test();
