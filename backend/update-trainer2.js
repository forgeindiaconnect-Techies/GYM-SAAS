const { MongoClient } = require('mongodb');

async function run() {
  const client = await MongoClient.connect('mongodb://127.0.0.1:27017/');
  const db = client.db('ai-gym');
  
  const trainers = await db.collection('trainers').find({}).toArray();
  const selva = trainers.find(t => JSON.stringify(t).toLowerCase().includes('selva'));
  
  if (selva) {
    await db.collection('trainers').updateOne({ _id: selva._id }, {
      $set: {
        bio: 'I am a highly motivated and experienced fitness professional dedicated to helping you achieve your physical goals. With over 8 years in the fitness industry, I specialize in personalized strength training, high-intensity interval training (HIIT), and functional mobility. My approach combines evidence-based training methods with tailored nutritional guidance to ensure sustainable and long-lasting results. Whether your goal is to build muscle, lose weight, or improve overall athleticism, I am committed to pushing you beyond your limits safely and effectively.',
        experience: 8,
        expertise: 'Weight Loss, Strength Training, HIIT, Mobility, Functional Training',
        specialization: 'Elite Personal Trainer & Nutrition Coach'
      }
    });
    console.log('Updated Selva using MongoClient!');
  } else {
    console.log('Selva not found in trainers collection.');
  }
  
  const users = await db.collection('users').find({}).toArray();
  const selvaUser = users.find(u => JSON.stringify(u).toLowerCase().includes('selva'));
  if (selvaUser) {
    await db.collection('users').updateOne({ _id: selvaUser._id }, {
      $set: {
        bio: 'I am a highly motivated and experienced fitness professional dedicated to helping you achieve your physical goals. With over 8 years in the fitness industry, I specialize in personalized strength training, high-intensity interval training (HIIT), and functional mobility. My approach combines evidence-based training methods with tailored nutritional guidance to ensure sustainable and long-lasting results. Whether your goal is to build muscle, lose weight, or improve overall athleticism, I am committed to pushing you beyond your limits safely and effectively.',
        experienceYears: 8,
        specialization: 'Elite Personal Trainer & Nutrition Coach',
        certifications: 'ISSA Certified Personal Trainer, Precision Nutrition Level 1'
      }
    });
    console.log('Updated Selva user as well!');
  }

  process.exit(0);
}

run().catch(console.error);
