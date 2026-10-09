import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dns from 'dns';
import User, { Role, ApprovalStatus, SubscriptionStatus } from './src/models/User';

dns.setServers(['8.8.8.8', '1.1.1.1']);

async function ensureSuperAdmin() {
  const uri = process.env.MONGO_URI || 'mongodb+srv://forgeindiaconnectfic_db_user:Renugopal@cluster0.tnlxx1f.mongodb.net/ai-gym?retryWrites=true&w=majority&appName=Cluster0';
  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('Connected to DB:', mongoose.connection.host);

  const email = 'superadminaigym@gmail.com';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const existing = await User.findOne({ email });
  if (existing) {
    existing.passwordHash = passwordHash;
    existing.role = Role.SUPER_ADMIN;
    existing.approvalStatus = ApprovalStatus.APPROVED;
    existing.isActive = true;
    await existing.save();
    console.log(`Updated existing user ${email} with password123 and SUPER_ADMIN role.`);
  } else {
    await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email,
      mobile: '9876543210',
      passwordHash,
      role: Role.SUPER_ADMIN,
      approvalStatus: ApprovalStatus.APPROVED,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      isActive: true,
    });
    console.log(`Created new SUPER_ADMIN user ${email} with password123.`);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

ensureSuperAdmin().catch(console.error);
