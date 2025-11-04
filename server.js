// server.js
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { getAggregatedTrends, getGlobalTrending } from './trendServices.js';
import { getCachedTrend, cacheTrend, getCacheStats, clearOldCache } from './cacheService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Serve static HTML files
app.use(express.static(__dirname));

// MongoDB Connection (using real MongoDB only)
const defaultUri = 'mongodb://127.0.0.1:27017/trendsphere';
const mongoUri = process.env.MONGODB_URI || defaultUri;

let isConnected = false;

try {
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log(`MongoDB connected (${mongoUri})`);
  isConnected = true;
} catch (err) {
  console.error('MongoDB connection error:', err);
  console.error('Please make sure MongoDB is running at:', mongoUri);
}

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  likedTopics: [{ type: String }], // Array of liked hashtags/topics
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

// Search History Schema
const searchHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  searchedAt: { type: Date, default: Date.now },
});

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to Verify Token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Register Endpoint
app.post('/auth/register', async (req, res) => {
  try {
    let { username, email, password } = req.body;
    
    // Trim only username and email, NOT password
    username = username?.trim();
    email = email?.trim();
    // password is kept as-is
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken. Please choose a different username.' });
    }
    
    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered. Please use a different email or login.' });
    }
    
    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      username, 
      email, 
      password: hashedPassword
    });
    await user.save();
    
    res.status(201).json({ 
      message: 'Registration successful! You can now login.',
      requiresVerification: false
    });
    
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `This ${field} is already registered. Please use a different ${field}.` 
      });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login Endpoint
app.post('/auth/login', async (req, res) => {
  try {
    let { username, password } = req.body;
    
    // Only trim username, NOT password (to support autofill)
    username = username?.trim();
    // password is kept as-is
    
    console.log(`Login attempt for: ${username}`);
    // Allow login with either username or email
    const user = await User.findOne({ username }) || await User.findOne({ email: username });
    
    if (!user) {
      console.log(`User not found: ${username}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`Password valid: ${isPasswordValid}`);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    console.log(`Login successful for: ${user.username}`);
    res.json({ success: true, token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected Dashboard Route
app.get('/dashboard', authenticateToken, (req, res) => {
  res.json({ message: 'Welcome to the Dashboard', user: req.user });
});

// Lightweight health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mongoState: mongoose.connection.readyState, // 0: disconnected, 1: connected
  });
});

// Get Liked Topics
app.get('/api/liked-topics', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('likedTopics');
    res.json({ success: true, likedTopics: user.likedTopics || [] });
  } catch (error) {
    console.error('Get liked topics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add Liked Topic
app.post('/api/liked-topics', authenticateToken, async (req, res) => {
  try {
    const { topic } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user.likedTopics) user.likedTopics = [];
    
    if (user.likedTopics.includes(topic)) {
      return res.status(400).json({ success: false, message: 'Topic already in liked list' });
    }
    
    user.likedTopics.push(topic);
    await user.save();
    
    res.json({ success: true, message: 'Topic added to liked list', likedTopics: user.likedTopics });
  } catch (error) {
    console.error('Add liked topic error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Remove Liked Topic
app.delete('/api/liked-topics/:topic', authenticateToken, async (req, res) => {
  try {
    const { topic } = req.params;
    const user = await User.findById(req.user.id);
    
    if (!user.likedTopics) user.likedTopics = [];
    
    user.likedTopics = user.likedTopics.filter(t => t !== topic);
    await user.save();
    
    res.json({ success: true, message: 'Topic removed from liked list', likedTopics: user.likedTopics });
  } catch (error) {
    console.error('Remove liked topic error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Save Search History
app.post('/api/search-history', authenticateToken, async (req, res) => {
  try {
    const { topic } = req.body;
    const searchHistory = new SearchHistory({
      userId: req.user.id,
      topic: topic,
    });
    await searchHistory.save();
    res.json({ success: true, message: 'Search saved' });
  } catch (error) {
    console.error('Save search history error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get Search History
app.get('/api/search-history', authenticateToken, async (req, res) => {
  try {
    const history = await SearchHistory.find({ userId: req.user.id })
      .sort({ searchedAt: -1 })
      .limit(10);
    res.json({ success: true, history });
  } catch (error) {
    console.error('Get search history error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete Search History Item
app.delete('/api/search-history/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await SearchHistory.findOneAndDelete({ 
      _id: id, 
      userId: req.user.id 
    });
    
    if (!result) {
      return res.status(404).json({ success: false, message: 'Search history item not found' });
    }
    
    res.json({ success: true, message: 'Search history deleted' });
  } catch (error) {
    console.error('Delete search history error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get Trend Prediction for Topic
app.post('/api/trends/predict', authenticateToken, async (req, res) => {
  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ success: false, message: 'Topic is required' });
    }

    console.log(`\n🔍 User searching for: ${topic}`);
    
    // Support force refresh: skip cache when query param ?force=true is provided
    const forceRefresh = String(req.query.force || 'false').toLowerCase() === 'true';

    // Check cache first (unless forced)
    if (forceRefresh) {
      console.log('⚡ Force refresh requested - bypassing cache');
    } else {
      // eslint-disable-next-line @typescript-eslint/await-thenable
      const cachedData = await getCachedTrend(topic);
      if (cachedData) {
        console.log(`✨ Serving from cache - saving API calls!`);
        return res.json({ 
          success: true, 
          cached: true,
          ...cachedData
        });
      }
    }
    
    // Cache miss - fetch fresh data
    console.log(`📡 Fetching fresh data from APIs...`);
    const trendData = await getAggregatedTrends(topic);
    
    // Save to cache for future requests (fire and forget - no need to await)
    void cacheTrend(topic, trendData).catch(err => console.error('Cache save error:', err));
    
    res.json({ 
      success: true,
      cached: false,
      ...trendData
    });
  } catch (error) {
    console.error('Trend prediction error:', error);
    res.status(500).json({ success: false, message: 'Error fetching trend data' });
  }
});

// Get Global Trending Topics
app.get('/api/trends/global', authenticateToken, async (req, res) => {
  try {
    const trends = await getGlobalTrending();
    res.json({ success: true, trends });
  } catch (error) {
    console.error('Global trends error:', error);
    res.status(500).json({ success: false, message: 'Error fetching global trends' });
  }
});

// Get Cache Statistics (Admin endpoint)
app.get('/api/cache/stats', authenticateToken, async (req, res) => {
  try {
    // eslint-disable-next-line @typescript-eslint/await-thenable
    const stats = await getCacheStats();
    res.json({ success: true, ...stats });
  } catch (error) {
    console.error('Cache stats error:', error);
    res.status(500).json({ success: false, message: 'Error fetching cache stats' });
  }
});

// Dev: Clear cache (protected) - deletes all cached entries when called with auth
app.post('/api/cache/clear', authenticateToken, async (req, res) => {
  try {
    // clear all entries
    const deleted = await clearOldCache(0);
    res.json({ success: true, deleted });
  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({ success: false, message: 'Error clearing cache' });
  }
});

// Dev debug route: fetch aggregated trends without requiring authentication
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/debug/trends', async (req, res) => {
    try {
      const topic = req.query.topic || req.query.q;
      if (!topic) return res.status(400).json({ success: false, message: 'topic query parameter is required' });

      console.log(`\n[DEBUG] Fetching aggregated trends (debug) for: ${topic}`);
      const trendData = await getAggregatedTrends(topic);
      res.json({ success: true, debug: true, ...trendData });
    } catch (error) {
      console.error('Debug trends error:', error);
      res.status(500).json({ success: false, message: 'Error fetching debug trends' });
    }
  });
}

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));