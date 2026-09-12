"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.updateUserStatus = exports.getUsersByRole = void 0;
const User_1 = __importDefault(require("../models/User"));
const Gym_1 = __importDefault(require("../models/Gym"));
const getUsersByRole = async (req, res) => {
    try {
        const { role, status } = req.query;
        let filter = {};
        if (role) {
            filter.role = role;
        }
        if (status) {
            filter.approvalStatus = status;
        }
        else {
            filter.approvalStatus = { $ne: 'DELETED' };
        }
        const users = await User_1.default.find(filter).populate('gymId').select('-passwordHash').sort({ createdAt: -1 });
        res.status(200).json({ success: true, users });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
exports.getUsersByRole = getUsersByRole;
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;
        const user = await User_1.default.findById(id);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        user.approvalStatus = status;
        if (status === 'REJECTED') {
            user.rejectionReason = reason;
        }
        else if (status === 'SUSPENDED') {
            user.suspensionReason = reason;
        }
        await user.save();
        // Sync gym status if the user is a gym owner and has a gym
        if (user.role === 'GYM_OWNER' && user.gymId) {
            await Gym_1.default.findByIdAndUpdate(user.gymId, { status: status });
        }
        res.status(200).json({ success: true, user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
exports.updateUserStatus = updateUserStatus;
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { gymData, ...updateData } = req.body;
        let user = await User_1.default.findById(id);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        if (gymData && user.gymId) {
            // Handle nested location data correctly if provided
            const updateGymObj = { ...gymData };
            if (gymData.location) {
                delete updateGymObj.location;
                for (const [key, value] of Object.entries(gymData.location)) {
                    updateGymObj[`location.${key}`] = value;
                }
            }
            await Gym_1.default.findByIdAndUpdate(user.gymId, { $set: updateGymObj }, { new: true, runValidators: true });
        }
        user = await User_1.default.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).populate('gymId').select('-passwordHash');
        res.status(200).json({ success: true, user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User_1.default.findByIdAndUpdate(id, { approvalStatus: 'DELETED' }, { new: true });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
exports.deleteUser = deleteUser;
