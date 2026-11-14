const dns = require('dns');
try {
  dns.setDefaultResultOrder?.('ipv4first');
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcrypt');
dotenv.config({ path: path.join(__dirname, '.env') });

const uri = process.env.MONGO_URI;

async function run() {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  const User = mongoose.connection.collection('users');
  const user = await User.findOne({ email: 'renugopal5457@gmail.com' });
  console.log('Target User:', {
    _id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isActive: user.isActive,
    approvalStatus: user.approvalStatus,
    passwordHash: user.passwordHash
  });

  const candidates = [
    'Renu@123',
    'renu@123',
    'Renu@1234',
    'renugopal5457',
    'Renugopal5457',
    '123456',
    '12345678',
    'password',
    'Password@123',
    'Admin@123',
    'renugopal'
  ];

  for (const pw of candidates) {
    const isMatch = await bcrypt.compare(pw, user.passwordHash);
    if (isMatch) {
      console.log(`>>> MATCH FOUND: "${pw}"`);
    } else {
      console.log(`No match for: "${pw}"`);
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);
