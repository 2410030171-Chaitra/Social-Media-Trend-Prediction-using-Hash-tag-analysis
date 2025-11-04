# 📊 TrendSphere - Complete Feature Documentation

## Overview
TrendSphere is a hashtag trend prediction platform that uses simulated AI analysis to forecast topic trends over the next 24 hours based on historical data.

---

## 🔐 Authentication System

### Login Features
- **Username/Email Login**: Users can log in with username or email
- **Password Authentication**: Secure bcrypt password hashing
- **Google OAuth**: One-click login with Google account
- **Persistent Sessions**: JWT tokens valid for 7 days
- **Auto-redirect**: Automatically redirects to dashboard if already logged in

### Registration
- **Account Creation**: Username, email, and password required
- **Password Security**: Passwords are hashed using bcrypt before storage
- **Duplicate Prevention**: Checks for existing usernames/emails
- **Instant Login**: Users are redirected to dashboard after registration

### Password Reset
- **Email-based Reset**: Sends reset link to registered email
- **Time-limited Tokens**: Reset links expire after 1 hour
- **Secure Process**: Token-based verification

---

## 📈 Dashboard Features

### 1. KPI Cards (Key Performance Indicators)
Display real-time metrics:
- **Trending Hashtags**: Total count with percentage change
- **Active Users**: User engagement metrics
- **Prediction Accuracy**: AI model performance
- **Processing Speed**: System performance metrics

### 2. Trend Search & Prediction

**Search Functionality:**
- Input any hashtag or topic (with or without # symbol)
- Instant prediction generation
- Historical data visualization (7 days)
- Future prediction (24 hours)

**Prediction Results Include:**
- **Status Badges**: STRONG SPIKE, RISING, STABLE, FALLING
- **Confidence Score**: Percentage-based accuracy estimate
- **Prediction Message**: Detailed explanation
- **Visual Indicators**: Color-coded trends (green/red/gray)

**Trend Chart Features:**
- 7-day historical data (168 hours)
- 24-hour future prediction
- Confidence bands (upper/lower bounds)
- Clear separation between historical and predicted data
- Interactive tooltips with exact values
- Responsive design

### 3. Influencer Recommendations

For each searched topic, the system recommends:
- **Influencer Profiles**: Username and follower count
- **Engagement Levels**: High, Moderate, or Low risk assessment
- **Topic Relevance**: Hashtag associations
- **Analytics Button**: Detailed profile analysis (planned feature)

Engagement Indicators:
- 🟢 Green: Low risk, stable engagement
- 🟡 Yellow: Moderate engagement
- 🔴 Red: High risk, critical spike

### 4. Liked Topics System

**Adding Topics:**
- Click ❤️ button on any trending topic
- Automatically saved to your account
- Instant feedback on success/error
- Duplicate prevention

**Managing Liked Topics:**
- View all liked topics in dedicated card
- Quick search button (🔍) - runs prediction instantly
- Remove button (🗑️) - with confirmation dialog
- Persistent storage in MongoDB
- Loads automatically on dashboard access

**Features:**
- Unlimited liked topics
- Search any liked topic with one click
- Remove unwanted topics anytime
- Synced across devices (same account)

### 5. Global Trending Topics

Displays current trending topics with:
- **Hashtag name**
- **Trend indicator**: Percentage change or status
- **Quick add to liked**: ❤️ button
- **Color-coded badges**:
  - 🟢 Green: Rising trend (+%)
  - 🟡 Yellow: Stable trend
  - 🔴 Red: Falling trend (-%)

---

## 🔧 Technical Features

### Data Visualization
- **Chart.js Integration**: Interactive trend charts
- **7-Day Historical Data**: 168 hours of simulated data
- **24-Hour Predictions**: Future trend forecasting
- **Confidence Intervals**: Visual uncertainty representation
- **Responsive Charts**: Adapts to screen size

### Prediction Algorithm (Simulated)

The current implementation uses a sophisticated simulation that:
1. Generates realistic historical data patterns
2. Applies volatility and trend factors
3. Calculates confidence scores based on:
   - Percentage change magnitude
   - Historical stability
   - Prediction distance
4. Provides status classifications:
   - **STRONG SPIKE**: Change > 200 points
   - **RISING**: Change > 50 points
   - **STABLE**: Change between -50 and +50
   - **FALLING**: Change < -50 points

**Note**: This is a demo simulation. In production, this would integrate with:
- Twitter/X API for real hashtag data
- Machine Learning models for actual predictions
- Historical database for accurate trends

### User Data Persistence

**Local Storage:**
- JWT authentication token
- User profile data (username, email, ID)
- Auto-expires after logout

**Database Storage (MongoDB):**
- User accounts and credentials
- Liked topics list per user
- Search history tracking
- Password reset tokens

---

## 🎨 UI/UX Features

### Design System
- **Dark Theme**: Purple-blue gradient background
- **Material Icons**: Consistent iconography
- **Bootstrap 5**: Responsive grid system
- **Custom Color Palette**:
  - Primary Accent: Cyan (#00bcd4)
  - Background: Deep purple (#211f42)
  - Surface: Dark purple (#353560)
  - Text: Light gray (#f1f1f1)

### Responsive Design
- ✅ Mobile-friendly layouts
- ✅ Tablet optimization
- ✅ Desktop full-width charts
- ✅ Adaptive navigation
- ✅ Touch-friendly buttons

### Accessibility
- High contrast colors
- Clear visual hierarchy
- Icon + text labels
- Keyboard navigation support
- Screen reader compatible

---

## 🔒 Security Features

### Authentication Security
- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: 7-day expiration
- **Token Verification**: Middleware protection
- **Secure Password Reset**: Time-limited tokens

### API Security
- **CORS Enabled**: Cross-origin request handling
- **Protected Routes**: Token-based authentication
- **Input Validation**: Server-side checks
- **Error Handling**: Secure error messages

---

## 📱 User Workflow

### First-Time User Journey:
1. **Landing Page** → Click "Create Account"
2. **Register** → Enter username, email, password
3. **Auto-Login** → Redirected to dashboard
4. **Search Topic** → Enter any hashtag/topic
5. **View Prediction** → See 24-hour forecast with chart
6. **Like Topic** → Add to favorites for quick access
7. **Logout** → Session cleared

### Returning User Journey:
1. **Login Page** → Enter credentials (or Google Sign-In)
2. **Dashboard** → See liked topics automatically loaded
3. **Quick Search** → Click 🔍 on liked topic for instant prediction
4. **Explore Trends** → Check global trending topics
5. **Manage Favorites** → Add/remove liked topics

---

## 🚀 Future Enhancement Ideas

### Data Integration
- [ ] Real Twitter/X API integration
- [ ] Multi-platform support (Instagram, LinkedIn)
- [ ] Historical data storage and analysis
- [ ] Real-time data streaming

### ML/AI Features
- [ ] Actual machine learning prediction models
- [ ] Sentiment analysis integration
- [ ] Anomaly detection
- [ ] Topic clustering and categorization

### User Features
- [ ] Email notifications for trending topics
- [ ] Custom alerts for specific topics
- [ ] Export reports as PDF/CSV
- [ ] Share predictions on social media
- [ ] Topic comparison tool
- [ ] Trending timeline view

### Analytics
- [ ] User dashboard with statistics
- [ ] Prediction accuracy tracking
- [ ] Personal trend history
- [ ] Influencer network graphs
- [ ] Geographic trend distribution

### Technical Improvements
- [ ] Redis caching for faster response
- [ ] WebSocket for real-time updates
- [ ] GraphQL API
- [ ] Mobile app (React Native/Flutter)
- [ ] Progressive Web App (PWA)
- [ ] A/B testing framework

---

## 📊 API Endpoints

### Public Endpoints
- `POST /auth/register` - Create new account
- `POST /auth/login` - User login
- `POST /auth/google` - Google OAuth login
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token

### Protected Endpoints (Require JWT Token)
- `GET /dashboard` - Verify user access
- `GET /api/liked-topics` - Get user's liked topics
- `POST /api/liked-topics` - Add topic to liked list
- `DELETE /api/liked-topics/:topic` - Remove liked topic
- `POST /api/search-history` - Save search history
- `GET /api/search-history` - Get user's search history

---

## 🎓 Educational Value

This project demonstrates:
- ✅ Full-stack web development (MERN-like stack)
- ✅ RESTful API design
- ✅ JWT authentication implementation
- ✅ OAuth 2.0 integration
- ✅ Database modeling with MongoDB
- ✅ Frontend-backend communication
- ✅ Data visualization with Chart.js
- ✅ Responsive UI design
- ✅ Security best practices
- ✅ Environment configuration management

---

## 📝 Notes

**Current Implementation:**
- Uses simulated data for demonstration
- No actual API calls to social media platforms
- Predictions are algorithmically generated for demo purposes

**Production Recommendations:**
- Integrate real data sources (Twitter API, etc.)
- Implement actual ML models for predictions
- Add rate limiting and API quotas
- Set up monitoring and logging
- Use environment-specific configurations
- Implement comprehensive testing (unit, integration, E2E)

---

**TrendSphere - Predicting tomorrow's trends, today!** 📈✨
