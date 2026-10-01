const mongoose = require('mongoose');

async function fixOnlineSessions() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/ai-gym');
    const Trainer = mongoose.model('Trainer', new mongoose.Schema({}, { strict: false }));
    const TrainerSession = mongoose.model('TrainerSession', new mongoose.Schema({}, { strict: false }));

    const onlineTrainers = await Trainer.find({ trainingMode: 'online' });
    const onlineTrainerIds = onlineTrainers.map(t => t._id);
    console.log('Online trainer IDs found:', onlineTrainerIds);

    const result = await TrainerSession.updateMany(
      { trainerId: { $in: onlineTrainerIds } },
      { $set: { mode: 'Online' } }
    );
    console.log('Updated sessions result:', result);

    const check = await TrainerSession.find({ trainerId: { $in: onlineTrainerIds } });
    check.forEach(s => console.log(s._id, s.date, s.mode, s.status));

    await mongoose.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error(err);
  }
}

fixOnlineSessions();
