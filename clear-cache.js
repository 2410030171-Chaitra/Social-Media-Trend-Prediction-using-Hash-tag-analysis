// Quick script to clear the trend cache
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://127.0.0.1:27017/trendsphere';

// Define the same schema as in cacheService.js
const trendCacheSchema = new mongoose.Schema({
  topic: String,
  data: Object,
  createdAt: Date,
  lastUpdated: Date,
  hitCount: Number
});

const TrendCache = mongoose.model('TrendCache', trendCacheSchema);

try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const result = await TrendCache.deleteMany({});
    console.log(`✅ Cleared ${result.deletedCount} cached items`);
    
    await mongoose.connection.close();
    console.log('✅ Cache cleared successfully! Now search for #fashion again.');
    process.exit(0);
} catch (error) {
    console.error('❌ Error clearing cache:', error);
    process.exit(1);
}

