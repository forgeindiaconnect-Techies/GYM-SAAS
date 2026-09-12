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
exports.getMe = exports.login = exports.registerGymOwner = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importStar(require("../models/User"));
const Gym_1 = __importStar(require("../models/Gym"));
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
const register = async (req, res) => {
    try {
        const { firstName, lastName, email, mobile, password, dateOfBirth, gender, city, pinCode, fitnessGoal, experienceLevel, preferredTraining, preferredWorkoutTime, height, weight, emergencyContact, } = req.body;
        if (!firstName || !lastName || !email || !mobile || !password) {
            res.status(400).json({ success: false, message: 'Required fields missing', errorCode: 'MISSING_FIELDS' });
            return;
        }
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ success: false, message: 'Email already in use', errorCode: 'EMAIL_IN_USE' });
            return;
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const passwordHash = await bcrypt_1.default.hash(password, salt);
        const user = new User_1.default({
            firstName,
            lastName,
            email,
            mobile,
            passwordHash,
            role: User_1.Role.MEMBER,
            approvalStatus: User_1.ApprovalStatus.APPROVED,
            isActive: true,
            subscriptionStatus: User_1.SubscriptionStatus.NONE,
            dateOfBirth,
            gender,
            city,
            pinCode,
            fitnessGoal,
            experienceLevel,
            preferredTraining,
            preferredWorkoutTime,
            height,
            weight,
            emergencyContact,
        });
        await user.save();
        const payload = {
            id: user._id,
            role: user.role,
            gymId: user.gymId,
            approvalStatus: user.approvalStatus,
            subscriptionStatus: user.subscriptionStatus,
        };
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            success: true,
            message: 'Registration successful.',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                gymId: user.gymId,
                approvalStatus: user.approvalStatus,
                subscriptionStatus: user.subscriptionStatus,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
exports.register = register;
const registerGymOwner = async (req, res) => {
    try {
        const { firstName, lastName, email, mobile, password, gymName, gymType, gymEmail, gymContactNumber, address, city, state, pinCode, approxMembers, numTrainers, operatingHours, subscriptionPlans, equipment, acDetails, facilities, offers } = req.body;
        if (!firstName || !lastName || !email || !mobile || !password || !gymName || !gymType || !address || !city) {
            res.status(400).json({ success: false, message: 'Required fields missing', errorCode: 'MISSING_FIELDS' });
            return;
        }
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ success: false, message: 'Email already in use', errorCode: 'EMAIL_IN_USE' });
            return;
        }
        const existingGym = await Gym_1.default.findOne({ $or: [{ name: gymName }] });
        if (existingGym) {
            res.status(400).json({ success: false, message: 'Gym with this name already exists', errorCode: 'GYM_EXISTS' });
            return;
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const passwordHash = await bcrypt_1.default.hash(password, salt);
        const user = new User_1.default({
            firstName,
            lastName,
            email,
            mobile,
            passwordHash,
            role: User_1.Role.GYM_OWNER,
            approvalStatus: User_1.ApprovalStatus.PENDING,
            subscriptionStatus: User_1.SubscriptionStatus.NONE,
            isActive: true,
        });
        await user.save();
        const gym = new Gym_1.default({
            ownerId: user._id,
            name: gymName,
            gymType,
            email: gymEmail || email,
            phone: gymContactNumber || mobile,
            location: {
                address,
                city,
                state,
                pinCode
            },
            status: Gym_1.GymStatus.PENDING,
            memberCapacity: approxMembers,
            trainerCapacity: numTrainers,
            subscriptionPlans: subscriptionPlans || [],
            equipment: equipment || [],
            acDetails: acDetails || undefined,
            facilities: facilities || [],
            offers: offers || [],
        });
        await gym.save();
        user.gymId = gym._id;
        await user.save();
        res.status(201).json({
            success: true,
            message: 'Gym Owner registration successful. Pending Admin approval.',
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                approvalStatus: user.approvalStatus,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
exports.registerGymOwner = registerGymOwner;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: 'Email and password are required', errorCode: 'MISSING_FIELDS' });
            return;
        }
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid credentials', errorCode: 'INVALID_CREDENTIALS' });
            return;
        }
        if (!user.isActive) {
            res.status(403).json({ success: false, message: 'Account is suspended', errorCode: 'ACCOUNT_SUSPENDED' });
            return;
        }
        const isMatch = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Invalid credentials', errorCode: 'INVALID_CREDENTIALS' });
            return;
        }
        const payload = {
            id: user._id,
            role: user.role,
            gymId: user.gymId,
            approvalStatus: user.approvalStatus,
            subscriptionStatus: user.subscriptionStatus,
        };
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                gymId: user.gymId,
                approvalStatus: user.approvalStatus,
                subscriptionStatus: user.subscriptionStatus,
                rejectionReason: user.rejectionReason,
                suspensionReason: user.suspensionReason,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const userId = req.user?.id;
        const user = await User_1.default.findById(userId).select('-passwordHash');
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.status(200).json({ success: true, user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
exports.getMe = getMe;
