const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/ai-gym').then(async () => {
  const db = mongoose.connection.db;
  await db.collection('users').updateOne({email: 'renu@gmail.com'}, {$set: {isActive: true, suspensionReason: null, rejectionReason: null}});
  console.log('Fixed Renu');
  process.exit(0);
});
