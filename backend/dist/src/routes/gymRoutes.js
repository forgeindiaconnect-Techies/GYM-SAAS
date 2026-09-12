"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const gymController_1 = require("../controllers/gymController");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
router.post('/', gymController_1.createGym);
router.get('/', gymController_1.getGyms);
router.get('/my-gym', auth_1.authenticate, gymController_1.getMyGym);
router.get('/:id', gymController_1.getGymById);
router.patch('/:id/status', gymController_1.updateGymStatus);
router.put('/:id', gymController_1.updateGym);
router.delete('/:id', gymController_1.deleteGym);
exports.default = router;
