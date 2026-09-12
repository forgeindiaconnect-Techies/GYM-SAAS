import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User, { Role, ApprovalStatus, SubscriptionStatus } from '../models/User';

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-gym');
    console.log('MongoDB Connected for Seeding...');

    await User.deleteMany({});
    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    await User.create({
      firstName: 'System', lastName: 'Admin',
      email: 'admin@aigym.com',
      mobile: '1234567890',
      passwordHash,
      role: Role.ADMIN,
      approvalStatus: ApprovalStatus.APPROVED,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
    });

    await User.create({
      firstName: 'Super', lastName: 'Admin',
      email: 'superadmin@aigym.com',
      mobile: '1234567899',
      passwordHash,
      role: Role.SUPER_ADMIN,
      approvalStatus: ApprovalStatus.APPROVED,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
    });

    await User.create({
      firstName: 'Gym', lastName: 'Owner',
      email: 'owner@aigym.com',
      mobile: '0987654321',
      passwordHash,
      role: Role.GYM_OWNER,
      approvalStatus: ApprovalStatus.APPROVED,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
    });

    // Approved member with active subscription (for testing member dashboard)
    await User.create({
      firstName: 'Test', lastName: 'Member',
      email: 'member@aigym.com',
      mobile: '1112223333',
      passwordHash,
      role: Role.MEMBER,
      approvalStatus: ApprovalStatus.APPROVED,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      subscriptionPlan: 'GOLD',
    });

    await User.create({
      firstName: 'Test', lastName: 'Trainer',
      email: 'trainer@aigym.com',
      mobile: '4445556666',
      passwordHash,
      role: Role.TRAINER,
      approvalStatus: ApprovalStatus.APPROVED,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
    });

    console.log('✅ Seed data inserted successfully!');
    console.log('');
    console.log('Test Accounts:');
    console.log('  Admin       : admin@aigym.com      / password123 → /admin/dashboard');
    console.log('  Super Admin : superadmin@aigym.com / password123 → /super-admin/dashboard');
    console.log('  Gym Owner   : owner@aigym.com      / password123 → /gym-owner/dashboard');
    console.log('  Member      : member@aigym.com     / password123 → /member/dashboard');
    console.log('  Trainer     : trainer@aigym.com    / password123 → /trainer/dashboard');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
