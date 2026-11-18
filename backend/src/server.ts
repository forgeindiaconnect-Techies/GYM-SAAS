import dns from 'dns';
try {
  dns.setDefaultResultOrder?.('ipv4first');
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (dnsErr) {
  console.warn('[Server] DNS setup notice:', dnsErr);
}

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import trainerRoutes from './routes/trainerRoutes';
import gymRoutes from './routes/gymRoutes';
import userRoutes from './routes/userRoutes';
import membershipRoutes from './routes/membershipRoutes';
import branchRoutes from './routes/branchRoutes';
import importRoutes from './routes/importRoutes';
import enquiryRoutes from './routes/enquiryRoutes';
import aiRoutes from './routes/aiRoutes';
import paymentRoutes from './routes/paymentRoutes';
import trainerPaymentRoutes from './routes/trainerPayment.routes';
import notificationRoutes from './routes/notification.routes';
import storeRoutes from './routes/storeRoutes';
import trainerSessionRoutes from './routes/trainerSessionRoutes';
import workoutVideoRoutes from './routes/workoutVideoRoutes';
import progressRoutes from './routes/progressRoutes';
import exerciseRoutes from './routes/exerciseRoutes';
import workoutPlanRoutes from './routes/workoutPlanRoutes';
import workoutProgressRoutes from './routes/workoutProgressRoutes';
import directMessageRoutes from './routes/directMessageRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import trainerPlanRoutes from './routes/trainerPlanRoutes';
import gymPackageRoutes from './routes/gymPackageRoutes';
import dietProgressRoutes from './routes/dietProgressRoutes';
import challengeRoutes from './routes/challengeRoutes';
import rewardRoutes from './routes/rewardRoutes';
import awardRoutes from './routes/awardRoutes';
import performanceRoutes from './routes/performanceRoutes';
import referralRoutes from './routes/referralRoutes';
import hiringRoutes from './routes/hiringRoutes';
import attendanceRoutes from './routes/attendanceRoutes';

dotenv.config();

const app = express();

// Middleware
const allowedOrigins = [
  'https://gym-saas-vmjm-theta.vercel.app',
  'https://gym-saas-jade.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  'http://localhost:5600',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests or tools (curl, server-to-server)
    if (!origin) return callback(null, true);
    // Allow any localhost / 127.0.0.1 port
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    if (
      allowedOrigins.includes(origin) ||
      /\.vercel\.app$/.test(origin)
    ) {
      return callback(null, true);
    }
    // Fallback allow origin to prevent breaking custom domains
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200,
  maxAge: 86400,
};

app.use(cors(corsOptions));

// Health check endpoints for uptime, Render wake-up and monitoring
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), time: new Date().toISOString() });
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running', time: new Date().toISOString() });
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const uploadsDir = path.join(__dirname, '../uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Super Admin backwards-compatible aliases
app.get('/api/super-admin/stats', async (_req, res) => {
  try {
    const Gym = (await import('./models/Gym')).default;
    const User = (await import('./models/User')).default;
    const [totalGyms, totalUsers] = await Promise.all([
      Gym.countDocuments({}),
      User.countDocuments({})
    ]);
    res.json({ success: true, totalGyms, totalUsers });
  } catch (err: any) {
    res.json({ success: true, totalGyms: 0, totalUsers: 0 });
  }
});

app.get('/api/super-admin/invitations', async (_req, res) => {
  try {
    const User = (await import('./models/User')).default;
    const owners = await (User as any).find({ role: 'GYM_OWNER' }).limit(50);
    res.json({ success: true, invitations: owners });
  } catch (err: any) {
    res.json({ success: true, invitations: [] });
  }
});
app.use('/api/trainers', trainerRoutes);
app.use('/api/gyms', gymRoutes);
app.use('/api/users', userRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/import', importRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/contact', enquiryRoutes);
app.use('/api/trainer-payments', trainerPaymentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/trainer-sessions', trainerSessionRoutes);
app.use('/api/workout-videos', workoutVideoRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/workout-plans', workoutPlanRoutes);
app.use('/api/workout-progress', workoutProgressRoutes);
app.use('/api/direct-messages', directMessageRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/trainer-plans', trainerPlanRoutes);
app.use('/api/gym-packages', gymPackageRoutes);
app.use('/api/packages', gymPackageRoutes);
app.use('/api/customer-memberships', membershipRoutes);
app.use('/api/equipment', (req, res, next) => {
  req.url = '/equipments/customer';
  trainerPlanRoutes(req, res, next);
});
app.use('/api/diet-progress', dietProgressRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/awards', awardRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/hiring', hiringRoutes);
app.use('/api/attendance', attendanceRoutes);

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'Gymora Gym SaaS Backend API is live and operational',
    version: '1.0.0',
    health: '/health',
    apiHealth: '/api/health',
    timestamp: new Date().toISOString()
  });
});

// Structured JSON 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    status: 404,
    error: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method,
    message: `Cannot ${req.method} ${req.originalUrl}. Verify endpoint path and HTTP method.`
  });
});

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    status: 404,
    error: 'Not Found',
    path: req.originalUrl,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

const PORT = process.env.PORT || 5600;

const startServer = async () => {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use.`);
    } else {
      console.error('Server error:', err);
    }
  });

  await connectDB();

  // Run membership expiry check worker on startup & every 1 hour
  try {
    const { runMembershipExpiryCheck } = require('./controllers/membershipController');
    runMembershipExpiryCheck()
      .then((res: any) => console.log(`[ExpiryWorker] Initial check complete: ${res.processed} memberships processed, ${res.remindersSent} reminders sent`))
      .catch((e: any) => console.error('[ExpiryWorker] Initial check error:', e));

    setInterval(() => {
      runMembershipExpiryCheck()
        .then((res: any) => {
          if (res.remindersSent > 0) {
            console.log(`[ExpiryWorker] Periodic check: ${res.remindersSent} reminder emails dispatched`);
          }
        })
        .catch((e: any) => console.error('[ExpiryWorker] Periodic check error:', e));
    }, 60 * 60 * 1000); // 1 hour
  } catch (workerErr) {
    console.error('[ExpiryWorker] Failed to initialize expiry scheduler:', workerErr);
  }
};

startServer();
