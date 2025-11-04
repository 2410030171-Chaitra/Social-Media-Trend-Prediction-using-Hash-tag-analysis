# 🚀 TrendSphere Setup Guide

Follow these steps to get your TrendSphere application up and running!

## 📋 Step-by-Step Setup

### Step 1: Install Node.js
1. Download Node.js from https://nodejs.org/ (LTS version recommended)
2. Install and verify: `node --version` and `npm --version`

### Step 2: Install MongoDB

**Option A - Local Installation:**
1. Download from https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. Default connection: `mongodb://localhost:27017`

**Option B - MongoDB Atlas (Cloud - Recommended for beginners):**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account and cluster
3. Get connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/trendsphere`)
4. Use this in your `.env` file

### Step 3: Install Project Dependencies

Open terminal in the TrendSphereProject folder and run:

```bash
npm install
```

This will install all required packages:
- express (web server)
- mongoose (MongoDB connection)
- bcryptjs (password hashing)
- jsonwebtoken (authentication)
- google-auth-library (Google login)
- nodemailer (email sending)
- cors (cross-origin requests)
- dotenv (environment variables)

### Step 4: Configure Environment Variables

1. Copy `.env.example` to create `.env`:
   ```bash
   copy .env.example .env
   ```

2. Open `.env` and configure:

```env
# MongoDB - Choose one option:
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/trendsphere

# OR MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster.mongodb.net/trendsphere

# JWT Secret - Change this to any random string
JWT_SECRET=my_super_secret_random_key_12345

# Email (Gmail) - For password reset feature
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_app_password_here

# Google OAuth (Optional - see Google Setup section below)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Server Port
PORT=3000
```

### Step 5: Set Up Gmail for Password Reset (Optional)

1. **Enable 2-Factor Authentication:**
   - Go to your Google Account settings
   - Security → 2-Step Verification → Enable

2. **Create App Password:**
   - Google Account → Security → 2-Step Verification
   - Scroll to "App passwords" → Select app: Mail → Generate
   - Copy the 16-character password
   - Paste into `.env` as `EMAIL_PASS`

### Step 6: Set Up Google OAuth (Optional)

1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable "Google+ API"
4. Go to "Credentials" → Create credentials → OAuth 2.0 Client ID
5. Application type: Web application
6. Authorized JavaScript origins: `http://localhost:3000`
7. Copy the Client ID
8. Update in 2 places:
   - `.env` file: `GOOGLE_CLIENT_ID=your_client_id`
   - `index.html`: Search for `YOUR_GOOGLE_CLIENT_ID` and replace with your actual ID (2 places)

### Step 7: Start the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

You should see:
```
Server running on port 3000
MongoDB connected
```

### Step 8: Open the Application

1. Open your browser
2. Navigate to one of these URLs:
   - `http://localhost:3000/index.html` (Login page)
   - Or simply open `index.html` file directly

3. Create an account or login with Google

## ✅ Testing the Application

### Create an Account:
1. Click "Create Account"
2. Fill in username, email, password
3. Click Register
4. Login with your credentials

### Test Features:
1. ✅ Search for any topic (e.g., "#AI", "Technology", "#Climate")
2. ✅ View 24-hour trend prediction with charts
3. ✅ Add topics to your liked list
4. ✅ Remove topics from liked list
5. ✅ Check predictions for liked topics
6. ✅ Logout and login again (session persists)

## 🔧 Troubleshooting

### Problem: "MongoDB connection error"
**Solution:**
- Ensure MongoDB is running: `net start MongoDB` (Windows)
- Check your `MONGODB_URI` in `.env`
- If using Atlas, check internet connection and credentials

### Problem: "Cannot GET /"
**Solution:**
- Access `http://localhost:3000/index.html` (with /index.html)
- Or open the `index.html` file directly in your browser

### Problem: "Google Sign-In not working"
**Solution:**
- Verify `GOOGLE_CLIENT_ID` is correct in both `.env` and `index.html`
- Check authorized origins in Google Cloud Console
- Make sure you're using `http://localhost:3000` (not file://)

### Problem: "Email not sending"
**Solution:**
- Verify Gmail App Password is correct (16 characters, no spaces)
- Ensure 2FA is enabled on Gmail
- Check `EMAIL_USER` and `EMAIL_PASS` in `.env`

### Problem: "Token expired" or "Invalid token"
**Solution:**
- Clear browser localStorage: F12 → Application → Local Storage → Clear
- Login again

## 📱 Next Steps

Once everything is working:

1. **Customize the UI:** Edit colors and styles in CSS
2. **Add Real Data:** Integrate with Twitter/X API for real trend data
3. **Deploy Online:** Use services like Heroku, Vercel, or Railway
4. **Add Features:** Email notifications, mobile app, advanced analytics

## 🎓 Learning Resources

- **Express.js:** https://expressjs.com/
- **MongoDB:** https://docs.mongodb.com/
- **JWT Authentication:** https://jwt.io/
- **Chart.js:** https://www.chartjs.org/

## 🆘 Need Help?

Common commands:
```bash
# Install dependencies
npm install

# Start server
npm start

# Start with auto-reload
npm run dev

# Check Node version
node --version

# Check if MongoDB is running (Windows)
net start | find "MongoDB"
```

---

**Happy Trending! 📈**

If you encounter any issues, check the console for error messages and ensure all environment variables are set correctly.
