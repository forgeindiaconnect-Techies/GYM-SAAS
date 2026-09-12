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
exports.deleteGym = exports.updateGym = exports.updateGymStatus = exports.getMyGym = exports.getGymById = exports.getGyms = exports.createGym = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const Gym_1 = __importStar(require("../models/Gym"));
const User_1 = __importStar(require("../models/User"));
const createGym = async (req, res) => {
    try {
        const { name, gymType, logo, description, email, phone, website, address, city, state, pinCode, ownerFirstName, ownerLastName, ownerEmail, ownerPhone, createAdminAccount, subscriptionPlan, subscriptionStartDate, subscriptionEndDate, subscriptionStatus, status, memberCapacity, trainerCapacity, equipment } = req.body;
        if (!name || !gymType || !email || !phone || !address || !city || !state || !pinCode || !ownerFirstName || !ownerLastName || !ownerEmail || !ownerPhone || !subscriptionPlan || !subscriptionStartDate) {
            res.status(400).json({ success: false, message: 'Required fields missing', errorCode: 'MISSING_FIELDS' });
            return;
        }
        const existingGym = await Gym_1.default.findOne({ $or: [{ name }, { email }] });
        if (existingGym) {
            res.status(400).json({ success: false, message: 'Gym with this name or email already exists', errorCode: 'GYM_EXISTS' });
            return;
        }
        // 1. Create or find owner
        let ownerId;
        let existingOwner = await User_1.default.findOne({ email: ownerEmail });
        if (existingOwner) {
            ownerId = existingOwner._id;
            // Optionally upgrade their role if they are just a member
            if (existingOwner.role === User_1.Role.MEMBER) {
                existingOwner.role = User_1.Role.GYM_OWNER;
                await existingOwner.save();
            }
        }
        else if (createAdminAccount) {
            const defaultPassword = 'WelcomeGymAdmin123!';
            const salt = await bcrypt_1.default.genSalt(10);
            const passwordHash = await bcrypt_1.default.hash(defaultPassword, salt);
            const newOwner = new User_1.default({
                firstName: ownerFirstName,
                lastName: ownerLastName,
                email: ownerEmail,
                mobile: ownerPhone,
                passwordHash,
                role: User_1.Role.GYM_OWNER,
                approvalStatus: User_1.ApprovalStatus.APPROVED,
                isActive: true
            });
            await newOwner.save();
            ownerId = newOwner._id;
        }
        else {
            // If we don't create an account, but the owner doesn't exist, this is an edge case
            // For now, we enforce creating an account or using an existing one.
            res.status(400).json({ success: false, message: 'Admin account must be created for a new gym if they do not exist.', errorCode: 'ADMIN_REQUIRED' });
            return;
        }
        // 2. Create the Gym
        const gym = new Gym_1.default({
            ownerId,
            name,
            gymType,
            logo,
            description,
            email,
            phone,
            website,
            subscription: {
                plan: subscriptionPlan,
                startDate: subscriptionStartDate,
                endDate: subscriptionEndDate,
                status: subscriptionStatus || 'Active'
            },
            location: {
                address,
                city,
                state,
                pinCode
            },
            memberCapacity,
            trainerCapacity,
            equipment,
            status: status || Gym_1.GymStatus.PENDING
        });
        await gym.save();
        // 3. Update the owner to reference this gym
        await User_1.default.findByIdAndUpdate(ownerId, { gymId: gym._id });
        res.status(201).json({
            success: true,
            message: 'Gym created successfully.',
            gym
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
exports.createGym = createGym;
const getGyms = async (req, res) => {
    try {
        const { status } = req.query;
        let filter = {};
        if (status) {
            filter.status = status;
        }
        else {
            filter.status = { $ne: 'DELETED' };
        }
        const gyms = await Gym_1.default.find(filter).populate('ownerId', 'firstName lastName email mobile').sort({ createdAt: -1 });
        res.status(200).json({ success: true, gyms });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
exports.getGyms = getGyms;
const getGymById = async (req, res) => {
    try {
        const { id } = req.params;
        const gym = await Gym_1.default.findById(id).populate('ownerId', 'firstName lastName email mobile');
        if (!gym) {
            res.status(404).json({ success: false, message: 'Gym not found' });
            return;
        }
        res.status(200).json({ success: true, gym });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
exports.getGymById = getGymById;
const getMyGym = async (req, res) => {
    try {
        const userGymId = req.user?.gymId;
        if (!userGymId) {
            res.status(404).json({ success: false, message: 'No gym assigned to this user' });
            return;
        }
        const gym = await Gym_1.default.findById(userGymId).populate('ownerId', 'firstName lastName email mobile');
        if (!gym) {
            res.status(404).json({ success: false, message: 'Gym not found' });
            return;
        }
        res.status(200).json({ success: true, gym });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
exports.getMyGym = getMyGym;
const updateGymStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;
        if (!Object.values(Gym_1.GymStatus).includes(status)) {
            res.status(400).json({ success: false, message: 'Invalid status' });
            return;
        }
        const gym = await Gym_1.default.findByIdAndUpdate(id, { status }, { new: true });
        if (!gym) {
            res.status(404).json({ success: false, message: 'Gym not found' });
            return;
        }
        const owner = await User_1.default.findById(gym.ownerId);
        if (owner) {
            owner.approvalStatus = status;
            if (status === 'REJECTED') {
                owner.rejectionReason = reason;
            }
            else if (status === 'SUSPENDED') {
                owner.suspensionReason = reason;
            }
            await owner.save();
        }
        res.status(200).json({ success: true, message: 'Gym status updated', gym });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
exports.updateGymStatus = updateGymStatus;
const updateGym = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, gymType, logo, description, email, phone, website, address, city, state, pinCode, subscriptionPlan, subscriptionStartDate, subscriptionEndDate, subscriptionStatus, status, memberCapacity, trainerCapacity, equipment } = req.body;
        const gym = await Gym_1.default.findById(id);
        if (!gym) {
            res.status(404).json({ success: false, message: 'Gym not found' });
            return;
        }
        const updateData = {};
        if (name)
            updateData.name = name;
        if (gymType)
            updateData.gymType = gymType;
        if (logo !== undefined)
            updateData.logo = logo;
        if (description !== undefined)
            updateData.description = description;
        if (email)
            updateData.email = email;
        if (phone)
            updateData.phone = phone;
        if (website !== undefined)
            updateData.website = website;
        if (memberCapacity !== undefined)
            updateData.memberCapacity = memberCapacity;
        if (trainerCapacity !== undefined)
            updateData.trainerCapacity = trainerCapacity;
        if (equipment)
            updateData.equipment = equipment;
        if (status)
            updateData.status = status;
        if (address || city || state || pinCode) {
            updateData.location = {
                address: address || gym.location?.address,
                city: city || gym.location?.city,
                state: state || gym.location?.state,
                pinCode: pinCode || gym.location?.pinCode,
            };
        }
        if (subscriptionPlan || subscriptionStartDate || subscriptionEndDate || subscriptionStatus) {
            updateData.subscription = {
                plan: subscriptionPlan || gym.subscription?.plan,
                startDate: subscriptionStartDate || gym.subscription?.startDate,
                endDate: subscriptionEndDate || gym.subscription?.endDate,
                status: subscriptionStatus || gym.subscription?.status || 'Active',
            };
        }
        const updatedGym = await Gym_1.default.findByIdAndUpdate(id, { $set: updateData }, { new: true });
        res.status(200).json({ success: true, message: 'Gym updated successfully', gym: updatedGym });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
exports.updateGym = updateGym;
const deleteGym = async (req, res) => {
    try {
        const { id } = req.params;
        const gym = await Gym_1.default.findByIdAndUpdate(id, { status: 'DELETED' }, { new: true });
        if (!gym) {
            res.status(404).json({ success: false, message: 'Gym not found' });
            return;
        }
        // Note: If you want to unlink the owner on delete, uncomment the next line
        // await User.findByIdAndUpdate(gym.ownerId, { $unset: { gymId: 1 } });
        res.status(200).json({ success: true, message: 'Gym deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
exports.deleteGym = deleteGym;
