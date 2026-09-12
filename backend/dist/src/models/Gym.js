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
exports.GymStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var GymStatus;
(function (GymStatus) {
    GymStatus["PENDING"] = "PENDING";
    GymStatus["ACTIVE"] = "ACTIVE";
    GymStatus["SUSPENDED"] = "SUSPENDED";
    GymStatus["INACTIVE"] = "INACTIVE";
    GymStatus["DELETED"] = "DELETED";
})(GymStatus || (exports.GymStatus = GymStatus = {}));
const gymSchema = new mongoose_1.Schema({
    ownerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String },
    establishedYear: { type: Number },
    gymType: { type: String },
    logo: { type: String },
    email: { type: String },
    phone: { type: String },
    website: { type: String },
    subscription: {
        plan: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        status: { type: String },
    },
    subscriptionPlans: [{
            name: { type: String },
            price: { type: mongoose_1.Schema.Types.Mixed },
            duration: { type: String },
            features: { type: String },
        }],
    location: {
        address: { type: String, required: true },
        area: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String },
        pinCode: { type: String, required: true },
        latitude: { type: Number },
        longitude: { type: Number },
    },
    memberCapacity: { type: Number },
    trainerCapacity: { type: Number },
    equipment: [{
            category: { type: String, required: true },
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            brand: { type: String },
            condition: { type: String, enum: ['New', 'Good', 'Maintenance Required'], required: true },
            availability: { type: String, required: true },
            image: { type: String },
        }],
    acDetails: {
        type: { type: String, enum: ['Fully AC', 'Partially AC', 'Non-AC', 'AC + Non-AC Sections'] },
        areas: [{ type: String }],
    },
    facilities: [{ type: String }],
    offers: [{
            name: { type: String, required: true },
            type: { type: String, enum: ['Percentage Discount', 'Flat Discount', 'Free Days', 'Special Package'], required: true },
            description: { type: String },
            originalPrice: { type: Number, required: true },
            offerPrice: { type: Number, required: true },
            discountPercentage: { type: Number },
            validFrom: { type: Date, required: true },
            validUntil: { type: Date, required: true },
            applicablePlan: { type: String },
            terms: { type: String, required: true },
            status: { type: String, enum: ['Active', 'Inactive'], required: true, default: 'Active' },
        }],
    status: { type: String, enum: Object.values(GymStatus), default: GymStatus.PENDING },
    rejectionReason: { type: String },
}, { timestamps: true });
exports.default = mongoose_1.default.model('Gym', gymSchema);
