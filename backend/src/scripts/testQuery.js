const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/ai-gym');
  const Trainer = mongoose.connection.collection('trainers');
  const gymId = new mongoose.Types.ObjectId('6aba379edcdc91b24d17e868');
  
  const all = await Trainer.find({ gymId }).toArray();
  console.log('All trainers for gym:', all.length, all.map(t => ({ name: t.name, branchId: t.branchId })));

  const existsFalse = await Trainer.find({ gymId, branchId: { $exists: false } }).toArray();
  console.log('branchId exists false:', existsFalse.length);

  const isNull = await Trainer.find({ gymId, branchId: null }).toArray();
  console.log('branchId is null:', isNull.length);

  const isOr = await Trainer.find({ gymId, $or: [{ branchId: { $exists: false } }, { branchId: null }, { branchId: 'main' }] }).toArray();
  console.log('branchId is $or [exists false, null, main]:', isOr.length);

  process.exit(0);
}

test();
