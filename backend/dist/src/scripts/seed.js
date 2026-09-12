"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importStar(require("../models/User"));
dotenv_1.default.config();
const seedDB = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-gym');
        console.log('MongoDB Connected for Seeding...');
        await User_1.default.deleteMany({});
        const salt = await bcrypt_1.default.genSalt(10);
        const passwordHash = await bcrypt_1.default.hash('password123', salt);
        await User_1.default.create({
            firstName: 'System', lastName: 'Admin',
            email: 'admin@aigym.com',
            mobile: '1234567890',
            passwordHash,
            role: User_1.Role.ADMIN,
            approvalStatus: User_1.ApprovalStatus.APPROVED,
            subscriptionStatus: User_1.SubscriptionStatus.ACTIVE,
        });
        await User_1.default.create({
            firstName: 'Super', lastName: 'Admin',
            email: 'superadmin@aigym.com',
            mobile: '1234567899',
            passwordHash,
            role: User_1.Role.SUPER_ADMIN,
            approvalStatus: User_1.ApprovalStatus.APPROVED,
            subscriptionStatus: User_1.SubscriptionStatus.ACTIVE,
        });
        await User_1.default.create({
            firstName: 'Gym', lastName: 'Owner',
            email: 'owner@aigym.com',
            mobile: '0987654321',
            passwordHash,
            role: User_1.Role.GYM_OWNER,
            approvalStatus: User_1.ApprovalStatus.APPROVED,
            subscriptionStatus: User_1.SubscriptionStatus.ACTIVE,
        });
        // Approved member with active subscription (for testing member dashboard)
        await User_1.default.create({
            firstName: 'Test', lastName: 'Member',
            email: 'member@aigym.com',
            mobile: '1112223333',
            passwordHash,
            role: User_1.Role.MEMBER,
            approvalStatus: User_1.ApprovalStatus.APPROVED,
            subscriptionStatus: User_1.SubscriptionStatus.ACTIVE,
            subscriptionPlan: 'GOLD',
        });
        await User_1.default.create({
            firstName: 'Test', lastName: 'Trainer',
            email: 'trainer@aigym.com',
            mobile: '4445556666',
            passwordHash,
            role: User_1.Role.TRAINER,
            approvalStatus: User_1.ApprovalStatus.APPROVED,
            subscriptionStatus: User_1.SubscriptionStatus.ACTIVE,
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
    }
    catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};
seedDB();
