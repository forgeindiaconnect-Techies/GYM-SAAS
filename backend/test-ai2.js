const mongoose = require('mongoose');
const AIRecommendation = require('./dist/models/AIRecommendation').default;
const User = require('./dist/models/User').default;
const Gym = require('./dist/models/Gym').default;

mongoose.connect('mongodb://127.0.0.1:27017/ai-gym')
  .then(async () => {
    try {
      const user = await User.findOne({ role: 'GYM_OWNER' });
      if (!user) { console.log('No user'); return process.exit(0); }
      
      const gym = await Gym.findOne({ ownerId: user._id });
      if (!gym) { console.log('No gym'); return process.exit(0); }

      console.log('Found gym:', gym._id);

      const recommendations = await AIRecommendation.aggregate([
        { $match: { gymId: new mongoose.Types.ObjectId(gym._id) } },
        { $sort: { createdAt: -1 } },
        { 
          $group: {
            _id: '$customerId',
            latestRecommendation: { $first: '$$ROOT' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'customer'
          }
        },
        {
          $lookup: {
            from: 'trainers',
            localField: 'latestRecommendation.trainerId',
            foreignField: '_id',
            as: 'trainer'
          }
        },
        { $unwind: '$customer' },
        { $unwind: { path: '$trainer', preserveNullAndEmptyArrays: true } }
      ]);
      console.log('Results length:', recommendations.length);
      console.log('Gym from user ID test:', gym._id.toString());
      const rawMatches = await AIRecommendation.find({ gymId: gym._id });
      console.log('Raw matches length:', rawMatches.length);
    } catch (e) {
      console.error('Error:', e.message);
    }
    process.exit(0);
  });
