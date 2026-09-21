import mongoose from 'mongoose';
import User from './src/models/User.js';

async function checkNaveen() {
  await mongoose.connect('mongodb://localhost:27017/aigym'); // Replace with correct URI if needed
  const user = await User.findOne({ email: 'naveenkumar@gmail.com' });
  console.log(user);
  process.exit(0);
}

checkNaveen();
