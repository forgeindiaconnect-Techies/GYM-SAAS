const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/ai-gym-final').then(async () => {
  const Trainer = mongoose.model('Trainer', new mongoose.Schema({ name: String }, { strict: false }));
  await Trainer.updateOne({ name: /Selva/i }, {
    $set: {
      bio: 'I am a highly motivated and experienced fitness professional dedicated to helping you achieve your physical goals. With over 8 years in the fitness industry, I specialize in personalized strength training, high-intensity interval training (HIIT), and functional mobility. My approach combines evidence-based training methods with tailored nutritional guidance to ensure sustainable and long-lasting results. Whether your goal is to build muscle, lose weight, or improve overall athleticism, I am committed to pushing you beyond your limits safely and effectively.',
      experience: 8,
      expertise: 'Weight Loss, Strength Training, HIIT, Mobility, Functional Training',
      specialization: 'Elite Personal Trainer & Nutrition Coach'
    }
  });
  console.log('Updated Selva in database!');
  process.exit(0);
}).catch(console.error);
