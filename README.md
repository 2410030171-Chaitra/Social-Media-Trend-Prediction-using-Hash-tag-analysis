# 📈 TrendSphere

**TrendSphere** is an AI-powered web application that predicts hashtag trends based on real-time analysis. It provides 24-hour trend forecasts, helping users stay ahead of trending topics.

## ✨ Features

- 🔐 **User Authentication**: Secure login/registration with JWT
- 📊 **Trend Prediction**: 24-hour hashtag trend forecasting with **real Google Trends data**
- 📈 **Visual Analytics**: Interactive charts showing 7-day historical data + 24-hour predictions
- ❤️ **Liked Topics**: Save and track your favorite topics
- 🌐 **Real-Time Data**: Integrated with Google Trends, Twitter, and Reddit APIs
- 🎯 **Accurate Predictions**: Multi-source data aggregation with smart fallback system
- 🔔 **Persistent Sessions**: Stay logged in until you logout

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Gmail account (for email verification - optional)
- **API Keys (optional for enhanced predictions)**:
  - Google Trends: ✅ **Already integrated** (no API key needed)
  - Twitter API: For social media trends (free tier available)
  - Reddit API: For community trends (free)

### Installation

1. **Clone or download the project**
   ```bash
   cd TrendSphereProject
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update the values in `.env`:
     ```
     MONGODB_URI=mongodb://127.0.0.1:27017/trendsphere
     JWT_SECRET=your_random_secret_key_here
     
     # Email Configuration (optional)
     EMAIL_USER=your_email@gmail.com
     EMAIL_PASS=your_gmail_app_password
     
     # API Keys (optional - see API_SETUP_GUIDE.md)
     TWITTER_BEARER_TOKEN=
     REDDIT_CLIENT_ID=
     REDDIT_CLIENT_SECRET=
     REDDIT_USERNAME=
     REDDIT_PASSWORD=
     
     PORT=3000
     ```
   - **Note**: Google Trends works out of the box without any API key!

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```
   Then open `index.html` in your browser

## 📁 Project Structure

```
TrendSphereProject/
├── index.html               # Login/Registration page
├── dashboard.html           # Main dashboard with predictions
├── server.js                # Express backend server
├── trendServices.js         # Real API integrations (Google, Twitter, Reddit)
├── package.json             # Dependencies
├── .env                     # Environment variables (create from .env.example)
├── .env.example             # Example environment configuration
├── test-apis.js             # Test API connections
├── test-google-trends.js    # Test Google Trends specifically
├── API_SETUP_GUIDE.md       # Complete API setup instructions
├── GOOGLE_TRENDS_STATUS.md  # Google Trends integration status
├── .gitignore               # Git ignore file
└── README.md                # This file
```

## 🔧 Configuration

### API Setup (See API_SETUP_GUIDE.md for details)

#### Google Trends (✅ Already Working)
- **No API key needed!**
- Works out of the box
- Provides real search volume data
- Primary data source (60% weight in predictions)

#### Twitter API (Optional)
1. Create a developer account at [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app and get Bearer Token
3. Add to `.env`: `TWITTER_BEARER_TOKEN=your_token`

#### Reddit API (Optional)
1. Create an app at [Reddit Apps](https://www.reddit.com/prefs/apps)
2. Get Client ID and Secret
3. Add credentials to `.env`

### Email Setup (Optional - For Email Verification)

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings → Security → 2-Step Verification → App passwords
   - Create a new app password for "Mail"
3. Use this password in `.env` as `EMAIL_PASS`

> **Note**: Email is optional. The app works without email configuration.

## 🎯 Usage

1. **Register**: Create a new account with email verification
2. **Search Topics**: Enter any hashtag or topic to predict trends
3. **View Real Data**: See predictions based on actual Google Trends data
4. **Analyze Trends**: View 7-day historical data + 24-hour predictions
5. **Check Confidence**: See prediction confidence based on data sources
6. **Related Queries**: Discover related trending topics
7. **Like Topics**: Save topics to your favorites list

### Testing APIs

```bash
# Test all APIs
node test-apis.js

# Test Google Trends specifically
node test-google-trends.js
```

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Bootstrap 5, Chart.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-Time Data**: 
  - ✅ **Google Trends API** (no key needed)
  - Twitter API v2
  - Reddit API (Snoowrap)
- **HTTP Client**: Axios
- **Email**: Nodemailer
- **UI/UX**: Material Icons, Responsive Design

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Secure password reset flow
- Protected API endpoints
- CORS enabled

## 📊 Features Roadmap

- [x] Real Google Trends integration ✅
- [x] Multi-source data aggregation ✅
- [x] Smart fallback system ✅
- [x] Accurate 24-hour predictions ✅
- [ ] Complete Twitter/Reddit API setup
- [ ] Advanced ML prediction models
- [ ] Email notifications for trending topics
- [ ] Multi-language support
- [ ] Mobile app version
- [ ] Export reports as PDF

## 🐛 Troubleshooting

**MongoDB connection error:**
- Ensure MongoDB is running on `localhost:27017`
- Check your `MONGODB_URI` in `.env`

**Google Trends rate limiting:**
- Wait 15-20 seconds between searches
- The system automatically retries with daily data
- Check `GOOGLE_TRENDS_STATUS.md` for more info

**No predictions showing:**
- Check if server is running (`node server.js`)
- Open browser console to see error messages
- Run `node test-apis.js` to check API status

**API not working:**
- Verify API keys in `.env` are correct
- Check `API_SETUP_GUIDE.md` for setup instructions
- Note: Google Trends works without any API key!

**Email not sending:**
- Verify Gmail App Password is correct
- Check if 2FA is enabled on Gmail account
- Email is optional - app works without it

## 📝 License

MIT License - Feel free to use this project for learning and development!

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

---

**Built with ❤️ for trend enthusiasts**
