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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionStatus = exports.ApprovalStatus = exports.Role = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var Role;
(function (Role) {
    Role["SUPER_ADMIN"] = "SUPER_ADMIN";
    Role["ADMIN"] = "ADMIN";
    Role["GYM_OWNER"] = "GYM_OWNER";
    Role["GYM_MANAGER"] = "GYM_MANAGER";
    Role["RECEPTIONIST"] = "RECEPTIONIST";
    Role["TRAINER"] = "TRAINER";
    Role["NUTRITIONIST"] = "NUTRITIONIST";
    Role["MEMBER"] = "MEMBER";
})(Role || (exports.Role = Role = {}));
var ApprovalStatus;
(function (ApprovalStatus) {
    ApprovalStatus["PENDING"] = "PENDING";
    ApprovalStatus["APPROVED"] = "APPROVED";
    ApprovalStatus["REJECTED"] = "REJECTED";
    ApprovalStatus["SUSPENDED"] = "SUSPENDED";
    ApprovalStatus["DELETED"] = "DELETED";
})(ApprovalStatus || (exports.ApprovalStatus = ApprovalStatus = {}));
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["NONE"] = "NONE";
    SubscriptionStatus["ACTIVE"] = "ACTIVE";
    SubscriptionStatus["EXPIRED"] = "EXPIRED";
    SubscriptionStatus["TRIAL"] = "TRIAL";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
const userSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    mobile: { type: String, required: true },
    role: { type: String, enum: Object.values(Role), default: Role.MEMBER },
    gymId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Gym' },
    isActive: { type: Boolean, default: true },
    approvalStatus: {
        type: String,
        enum: Object.values(ApprovalStatus),
        default: ApprovalStatus.PENDING,
    },
    rejectionReason: { type: String },
    suspensionReason: { type: String },
    subscriptionStatus: {
        type: String,
        enum: Object.values(SubscriptionStatus),
        default: SubscriptionStatus.NONE,
    },
    subscriptionPlan: { type: String },
    subscriptionExpiry: { type: Date },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
    profilePhoto: { type: String },
    city: { type: String },
    pinCode: { type: String },
    height: { type: Number },
    weight: { type: Number },
    fitnessGoal: { type: String },
    experienceLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
    preferredTraining: { type: String, enum: ['Offline', 'Online', 'Hybrid'] },
    preferredWorkoutTime: { type: String },
    emergencyContact: {
        name: { type: String },
        relationship: { type: String },
        mobile: { type: String },
    },
    // Trainer specific fields
    specialization: { type: String },
    experienceYears: { type: Number },
    qualification: { type: String },
    certifications: { type: String },
    previousGym: { type: String },
    joiningDate: { type: Date },
    employmentType: { type: String, enum: ['Full-Time', 'Part-Time', 'Contract'] },
    workingDays: { type: String },
    workingHours: { type: String },
    salary: { type: String },
    bio: { type: String },
    resumeUrl: { type: String },
    certificationUrl: { type: String },
}, { timestamps: true });
exports.default = mongoose_1.default.model('User', userSchema);
