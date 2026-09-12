"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const subscriptionController_1 = require("../controllers/subscriptionController");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
router.post('/select', auth_1.authenticate, subscriptionController_1.selectPlan);
router.post('/process-payment', auth_1.authenticate, subscriptionController_1.processPayment);
router.get('/my', auth_1.authenticate, subscriptionController_1.getMySubscription);
exports.default = router;
