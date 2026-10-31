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

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const uploadsDir = path.join(__dirname, '../uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
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
app.use('/api/diet-progress', dietProgressRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/awards', awardRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/hiring', hiringRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running' });
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
