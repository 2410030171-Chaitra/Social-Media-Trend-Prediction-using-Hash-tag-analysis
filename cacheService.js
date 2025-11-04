import mongoose from 'mongoose';

// ==================== CACHE SCHEMA ====================
const trendCacheSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  data: {
    type: Object,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 1800 // Auto-delete after 30 minutes (1800 seconds)
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  hitCount: {
    type: Number,
    default: 1
  }
});

const TrendCache = mongoose.model('TrendCache', trendCacheSchema);

// ==================== CACHE SERVICE ====================

/**
 * Get cached trend data for a topic
 * @param {string} topic - The topic to search for
 * @returns {Promise<object|null>} - Cached data or null if not found/expired
 */
export async function getCachedTrend(topic) {
  try {
    const normalizedTopic = normalizeTopic(topic);
    const cached = await TrendCache.findOne({ topic: normalizedTopic });
    
    if (!cached) {
      console.log(`📦 Cache MISS: "${topic}" - not in cache`);
      return null;
    }
    
    // Check if cache is still fresh (less than 30 minutes old)
    const cacheAge = Date.now() - cached.lastUpdated.getTime();
    const maxAge = 30 * 60 * 1000; // 30 minutes in milliseconds
    
    if (cacheAge > maxAge) {
      console.log(`📦 Cache EXPIRED: "${topic}" - ${Math.round(cacheAge / 60000)} minutes old`);
      await TrendCache.deleteOne({ topic: normalizedTopic });
      return null;
    }
    
    // Increment hit count
    cached.hitCount += 1;
    await cached.save();
    
    const minutesOld = Math.round(cacheAge / 60000);
    console.log(`✅ Cache HIT: "${topic}" - ${minutesOld} min old, ${cached.hitCount} hits`);
    
    return cached.data;
  } catch (error) {
    console.error('Cache retrieval error:', error.message);
    return null;
  }
}

/**
 * Save trend data to cache
 * @param {string} topic - The topic to cache
 * @param {object} data - The trend data to cache
 */
export async function cacheTrend(topic, data) {
  try {
    const normalizedTopic = normalizeTopic(topic);
    
    // Update existing or create new cache entry
    await TrendCache.findOneAndUpdate(
      { topic: normalizedTopic },
      { 
        data,
        lastUpdated: Date.now(),
        $inc: { hitCount: 0 } // Don't increment on save, only on retrieve
      },
      { upsert: true, new: true }
    );
    
    console.log(`💾 Cached: "${topic}" - will expire in 30 minutes`);
  } catch (error) {
    console.error('Cache save error:', error.message);
  }
}

/**
 * Get cache statistics
 * @returns {Promise<object>} - Cache statistics
 */
export async function getCacheStats() {
  try {
    const totalCached = await TrendCache.countDocuments();
    const topTopics = await TrendCache.find()
      .sort({ hitCount: -1 })
      .limit(10)
      .select('topic hitCount lastUpdated');
    
    return {
      totalCached,
      topTopics: topTopics.map(t => ({
        topic: t.topic,
        hits: t.hitCount,
        lastUpdated: t.lastUpdated
      }))
    };
  } catch (error) {
    console.error('Cache stats error:', error.message);
    return { totalCached: 0, topTopics: [] };
  }
}

/**
 * Clear old cache entries manually (beyond auto-expiration)
 * @param {number} maxAgeMinutes - Maximum age in minutes before clearing
 */
export async function clearOldCache(maxAgeMinutes = 30) {
  try {
    const maxAge = Date.now() - (maxAgeMinutes * 60 * 1000);
    const result = await TrendCache.deleteMany({
      lastUpdated: { $lt: new Date(maxAge) }
    });
    
    console.log(`🧹 Cleared ${result.deletedCount} old cache entries`);
    return result.deletedCount;
  } catch (error) {
    console.error('Cache clear error:', error.message);
    return 0;
  }
}

/**
 * Normalize topic name for consistent caching
 * @param {string} topic - The topic to normalize
 * @returns {string} - Normalized topic
 */
function normalizeTopic(topic) {
  return topic.toLowerCase().trim().replace(/^#/, '');
}

// ==================== CACHE WARMUP (Optional) ====================

/**
 * Pre-cache popular topics on server start
 * @param {array} topics - Array of popular topics to pre-cache
 */
export async function warmupCache(topics = []) {
  console.log('🔥 Warming up cache with popular topics...');
  // This can be called on server start with popular topics
  // For now, we'll let it build naturally from user searches
}

export default {
  getCachedTrend,
  cacheTrend,
  getCacheStats,
  clearOldCache,
  warmupCache
};
