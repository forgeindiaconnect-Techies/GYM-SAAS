"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireActiveGymOwner = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'Unauthorized', errorCode: 'MISSING_TOKEN' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ success: false, message: 'Invalid or expired token', errorCode: 'INVALID_TOKEN' });
    }
};
exports.authenticate = authenticate;
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ success: false, message: 'Forbidden: Insufficient privileges', errorCode: 'INSUFFICIENT_PRIVILEGES' });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
const requireActiveGymOwner = (req, res, next) => {
    if (!req.user || req.user.role !== 'GYM_OWNER') {
        res.status(403).json({ success: false, message: 'Forbidden: Only gym owners are allowed', errorCode: 'NOT_GYM_OWNER' });
        return;
    }
    if (req.user.approvalStatus !== 'APPROVED') {
        res.status(403).json({ success: false, message: 'Gym registration is not approved yet', errorCode: 'NOT_APPROVED' });
        return;
    }
    if (req.user.subscriptionStatus !== 'ACTIVE') {
        res.status(402).json({ success: false, message: 'Active subscription required', errorCode: 'PAYMENT_REQUIRED' });
        return;
    }
    next();
};
exports.requireActiveGymOwner = requireActiveGymOwner;
