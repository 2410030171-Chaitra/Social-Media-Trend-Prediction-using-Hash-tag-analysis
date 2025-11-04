# 🌐 API Integration Setup Guide

This guide will help you set up real API integrations for TrendSphere to fetch live trend data from Twitter, Google Trends, and Reddit.

---

## 📊 **Current Status**

- ✅ **Google Trends**: Works without API key (free, no authentication required)
- ⚙️ **Twitter/X API**: Requires setup (free tier available)
- ⚙️ **Reddit API**: Requires setup (free)

---

## 🔑 **API Setup Instructions**

### 1️⃣ **Twitter/X API Setup** (Recommended - Free Tier Available)

**Steps:**
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a developer account (if you don't have one)
3. Create a new project and app
4. Navigate to "Keys and Tokens"
5. Generate a **Bearer Token**
6. Copy the Bearer Token and add to `.env`:

```env
TWITTER_BEARER_TOKEN=your_bearer_token_here
```

**Free Tier Limits:**
- 500,000 tweets per month
- 50 requests per 15 minutes

**What you get:**
- Real-time tweet search
- Hashtag volume data
- Engagement metrics (likes, retweets, replies)

---

### 2️⃣ **Reddit API Setup** (Free)

**Steps:**
1. Go to [Reddit Apps](https://www.reddit.com/prefs/apps)
2. Scroll to bottom and click "Create App" or "Create Another App"
3. Fill in:
   - Name: `TrendSphere`
   - Type: Select `script`
   - Description: `Trend analysis application`
   - Redirect URI: `http://localhost:3000`
4. Click "Create app"
5. Copy your **Client ID** (under the app name) and **Client Secret**
6. Add to `.env`:

```env
REDDIT_CLIENT_ID=your_client_id_here
REDDIT_CLIENT_SECRET=your_client_secret_here
REDDIT_USERNAME=your_reddit_username
REDDIT_PASSWORD=your_reddit_password
REDDIT_USER_AGENT=TrendSphere/1.0
```

**What you get:**
- Post data from all subreddits
- Upvote counts and comments
- Community engagement metrics
- Trending topics by subreddit

---

### 3️⃣ **Google Trends** (Already Working - No Setup Needed! ✅)

Google Trends API is **free and doesn't require authentication**. It's already integrated and will work out of the box!

**What you get:**
- Interest over time (last 7 days)
- Regional interest
- Related queries
- Rising topics

---

## 🚀 **Quick Start (Minimal Setup)**

### **Option 1: Google Trends Only** (FREE - No Setup)
Already working! Just use the application as is. Google Trends will provide decent trend data.

### **Option 2: Google + Reddit** (FREE - 10 mins setup)
Best free option! Provides:
- Google Trends data (no auth needed)
- Reddit community trends (free API)

Setup: Just configure Reddit API (see steps above)

### **Option 3: Full Integration** (Recommended)
Setup all APIs for the most accurate trend predictions:
- Google Trends (free, no setup)
- Reddit (free, 10 min setup)
- Twitter (free tier, 15 min setup)

---

## 📝 **Configuration in .env File**

Open your `.env` file and add your API keys:

```env
# ==================== API KEYS FOR TREND DATA ====================

# Twitter/X API - Get from: https://developer.twitter.com/
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAABCDEFGHIJKLMNOPQRSTUVWXYZabcdefg

# Reddit API - Get from: https://www.reddit.com/prefs/apps
REDDIT_CLIENT_ID=abc123def456
REDDIT_CLIENT_SECRET=xyz789uvw012
REDDIT_USERNAME=your_reddit_username
REDDIT_PASSWORD=your_reddit_password
REDDIT_USER_AGENT=TrendSphere/1.0

# Note: Google Trends API doesn't require authentication ✅
```

---

## 🔄 **How It Works**

### **Without API Keys** (Default Mode)
- Uses **Google Trends** (free, no setup)
- Falls back to simulated data for missing sources
- Still provides useful trend predictions

### **With API Keys** (Full Power Mode)
- Fetches real data from multiple sources
- Aggregates trends from Twitter, Reddit, and Google
- Provides accurate 24-hour predictions
- Shows source-specific insights

---

## 📊 **Data Aggregation**

TrendSphere combines data from all configured sources:

```
Final Trend Score = (Google × 60%) + (Twitter × 30%) + (Reddit × 10%)
```

**More sources = More accurate predictions!**

---

## 🧪 **Testing Your Setup**

1. Add at least one API key to `.env`
2. Restart your server:
   ```bash
   node server.js
   ```
3. Search for a trending topic (e.g., `#AI`, `#ClimateChange`)
4. Check the console logs to see which APIs are being called
5. The prediction message will show which sources were used

---

## ⚠️ **Important Notes**

### **Rate Limits**
- **Twitter**: 50 requests/15 mins (free tier)
- **Reddit**: 60 requests/minute (free)
- **Google Trends**: No official limit (use responsibly)

### **API Key Security**
- ⚠️ **Never commit `.env` file to Git!**
- The `.env` file is already in `.gitignore`
- Keep your API keys secret
- Regenerate keys if accidentally exposed

### **Fallback Behavior**
If an API fails or is not configured:
- The system automatically falls back to simulated data
- Shows a warning toast notification
- Application continues to work normally

---

## 🎯 **Recommended Setup for Different Use Cases**

### **Personal Project / Learning**
- Setup: Google Trends only
- Cost: FREE
- Accuracy: Good

### **Portfolio / Demo**
- Setup: Google + Reddit
- Cost: FREE
- Accuracy: Very Good
- Setup Time: 10 minutes

### **Production / Business**
- Setup: All APIs (Google + Reddit + Twitter)
- Cost: FREE
- Accuracy: Excellent
- Setup Time: 30 minutes

---

## 📚 **Additional Resources**

- [Twitter API Docs](https://developer.twitter.com/en/docs/twitter-api)
- [Reddit API Docs](https://www.reddit.com/dev/api)
- [Google Trends API](https://www.npmjs.com/package/google-trends-api)

---

## 🐛 **Troubleshooting**

### "Twitter API not configured"
- Check if `TWITTER_BEARER_TOKEN` is set in `.env`
- Verify the token is valid (no extra spaces)
- Restart the server after adding the token

### "Reddit API error: 401 Unauthorized"
- Double-check your Client ID and Secret
- Verify your Reddit username and password
- Make sure you created a "script" type app, not "web app"

### "Error fetching trends"
- Check your internet connection
- Verify API keys are correct
- Check API rate limits
- Look at server console logs for detailed error messages

---

## ✅ **Next Steps**

1. Choose your setup level (see recommendations above)
2. Get API keys from the respective platforms
3. Add keys to `.env` file
4. Restart the server
5. Test with a trending topic!

Happy trending! 🚀
