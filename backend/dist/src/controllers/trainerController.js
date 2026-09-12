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
exports.deleteTrainer = exports.updateTrainerStatus = exports.getTrainerById = exports.getTrainers = exports.createTrainer = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importStar(require("../models/User"));
const createTrainer = async (req, res) => {
    try {
        const { firstName, lastName, email, mobile, dateOfBirth, gender, specialization, experienceYears, qualification, certifications, previousGym, joiningDate, employmentType, workingDays, workingHours, salary, bio, profilePhoto, resumeUrl, certificationUrl, approvalStatus, isActive } = req.body;
        if (!firstName || !lastName || !email || !mobile || !specialization || experienceYears === undefined) {
            res.status(400).json({ success: false, message: 'Required fields missing', errorCode: 'MISSING_FIELDS' });
            return;
        }
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ success: false, message: 'Email already in use', errorCode: 'EMAIL_IN_USE' });
            return;
        }
        // Auto-generate a default password for the new trainer
        const defaultPassword = 'WelcomeTrainer123!';
        const salt = await bcrypt_1.default.genSalt(10);
        const passwordHash = await bcrypt_1.default.hash(defaultPassword, salt);
        const user = new User_1.default({
            firstName, lastName, email, mobile, passwordHash,
            role: User_1.Role.TRAINER,
            dateOfBirth, gender, profilePhoto,
            specialization, experienceYears, qualification, certifications,
            previousGym, joiningDate, employmentType, workingDays, workingHours,
            salary, bio, resumeUrl, certificationUrl,
            approvalStatus: approvalStatus || User_1.ApprovalStatus.PENDING,
            isActive: isActive !== undefined ? isActive : false
        });
        await user.save();
        res.status(201).json({
            success: true,
            message: 'Trainer created successfully.',
            trainer: user
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
exports.createTrainer = createTrainer;
const getTrainers = async (req, res) => {
    try {
        const trainers = await User_1.default.find({ role: User_1.Role.TRAINER }).sort({ createdAt: -1 }).select('-passwordHash');
        res.status(200).json({ success: true, trainers });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
exports.getTrainers = getTrainers;
const getTrainerById = async (req, res) => {
    try {
        const trainer = await User_1.default.findOne({ _id: req.params.id, role: User_1.Role.TRAINER }).select('-passwordHash');
        if (!trainer) {
            res.status(404).json({ success: false, message: 'Trainer not found' });
            return;
        }
        res.status(200).json({ success: true, trainer });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
exports.getTrainerById = getTrainerById;
const updateTrainerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { approvalStatus, isActive } = req.body;
        const trainer = await User_1.default.findOne({ _id: id, role: User_1.Role.TRAINER });
        if (!trainer) {
            res.status(404).json({ success: false, message: 'Trainer not found' });
            return;
        }
        if (approvalStatus)
            trainer.approvalStatus = approvalStatus;
        if (isActive !== undefined)
            trainer.isActive = isActive;
        await trainer.save();
        res.status(200).json({ success: true, message: 'Trainer status updated', trainer });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
exports.updateTrainerStatus = updateTrainerStatus;
const deleteTrainer = async (req, res) => {
    try {
        const { id } = req.params;
        const trainer = await User_1.default.findOneAndDelete({ _id: id, role: User_1.Role.TRAINER });
        if (!trainer) {
            res.status(404).json({ success: false, message: 'Trainer not found' });
            return;
        }
        res.status(200).json({ success: true, message: 'Trainer deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
exports.deleteTrainer = deleteTrainer;
