// reset-database.js - Clear all users and start fresh
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
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

async function resetDatabase() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');
    
    // Clear all users
    const result = await User.deleteMany({});
    console.log(`🗑️  Deleted ${result.deletedCount} users\n`);
    
    // Create a fresh user "Srija" with password "srija123"
    const hashedPassword = await bcrypt.hash('srija123', 10);
    const newUser = new User({
      username: 'Srija',
      email: 'srija@example.com',
      password: hashedPassword,
      isEmailVerified: true // Auto-verify for development
    });
    
    await newUser.save();
    console.log('✅ Created new user:');
    console.log('   Username: Srija');
    console.log('   Email: srija@example.com');
    console.log('   Password: srija123');
    console.log('   Email Verified: ✓ Yes (auto-verified for development)');
    console.log('\n🎉 Database reset complete! You can now login with these credentials.');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

await resetDatabase();
