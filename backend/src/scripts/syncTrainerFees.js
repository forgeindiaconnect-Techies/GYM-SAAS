const mongoose = require('mongoose');

async function syncTrainerFees() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/ai-gym');
    console.log('Connected to MongoDB');

    const Trainer = mongoose.connection.collection('trainers');
    const TrainerFee = mongoose.connection.collection('trainerfees');
    const User = mongoose.connection.collection('users');

    const trainers = await Trainer.find({ fee: { $exists: true, $gt: 0 } }).toArray();
    console.log(`Found ${trainers.length} trainers with fee`);

    for (const t of trainers) {
      const existing = await TrainerFee.findOne({ trainerId: t._id, status: 'Active' });
      if (!existing) {
        const modeMap = {
          'online': 'Online Training',
          'offline': 'Offline Training',
          'both': 'Hybrid Training'
        };
        const cycleMap = {
          'Per Week': 'Weekly',
          'Per Month': 'Monthly',
          'Per Session': 'Per Session'
        };
        const owner = await User.findOne({ gymId: t.gymId, role: 'GYM_OWNER' });
        const newFee = {
          gymId: t.gymId,
          branchId: t.branchId,
          trainerId: t._id,
          trainingType: modeMap[t.trainingMode] || 'Offline Training',
          feeAmount: Number(t.fee),
          billingCycle: cycleMap[t.paymentType] || 'Monthly',
          effectiveFrom: t.createdAt || new Date(),
          paymentMethod: 'Bank Transfer',
          status: 'Active',
          notes: 'Configured from trainer registration details',
          createdBy: owner ? owner._id : t.userId,
          createdAt: t.createdAt || new Date(),
          updatedAt: new Date()
        };
        await TrainerFee.insertOne(newFee);
        console.log(`Created TrainerFee for ${t.name}: ₹${t.fee} (${newFee.billingCycle})`);
      } else {
        console.log(`TrainerFee already exists for ${t.name}`);
      }
    }

    const count = await TrainerFee.countDocuments();
    console.log(`Total TrainerFee documents: ${count}`);
    process.exit(0);
  } catch (err) {
    console.error('Error syncing trainer fees:', err);
    process.exit(1);
  }
}

syncTrainerFees();
