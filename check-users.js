// check-users.js - Database user management tool
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trendsphere';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  likedTopics: [String],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function checkUsers() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');
    
    const users = await User.find({}).select('-password');
    console.log(`📊 Total users in database: ${users.length}\n`);
    
    if (users.length === 0) {
      console.log('❌ No users found. Database is empty.');
    } else {
      console.log('👥 Registered Users:');
      console.log('==================');
      for (const [index, user] of users.entries()) {
        console.log(`${index + 1}. Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Email Verified: ${user.isEmailVerified ? '✓ Yes' : '✗ No'}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log(`   Liked Topics: ${user.likedTopics.length}`);
        console.log('');
      }
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

await checkUsers();
