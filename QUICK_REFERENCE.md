# ⚡ TrendSphere - Quick Reference

## 🚀 Quick Start Commands

### Installation
```bash
# Install all dependencies
npm install

# Or use the setup script (Windows)
setup.bat
```

### Running the Server
```bash
# Start the server (production mode)
npm start

# Start with auto-reload (development mode)
npm run dev
```

### MongoDB
```bash
# Start MongoDB (Windows - as service)
net start MongoDB

# Check if MongoDB is running
net start | find "MongoDB"

# Stop MongoDB
net stop MongoDB
```

---

## 📂 File Structure

```
TrendSphereProject/
│
├── index.html              ← Login/Registration page
├── dashboard.html          ← Main dashboard
├── welcome.html           ← Welcome/launcher page
├── server.js              ← Express backend server
│
├── package.json           ← Dependencies
├── .env                   ← Your configuration (create from .env.example)
├── .env.example           ← Example configuration
├── .gitignore            ← Git ignore file
│
├── setup.bat              ← Windows setup script
├── README.md             ← Project overview
├── SETUP_GUIDE.md        ← Detailed setup instructions
├── FEATURES.md           ← Feature documentation
└── QUICK_REFERENCE.md    ← This file
```

---

## 🔑 Environment Variables

Create `.env` file with these values:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/trendsphere

# JWT Secret (change to random string)
JWT_SECRET=your_secret_key_here

# Email (for password reset)
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Server
PORT=3000
```

---

## 🌐 URLs

```
Login Page:      http://localhost:3000/index.html
Dashboard:       http://localhost:3000/dashboard.html
Welcome Page:    http://localhost:3000/welcome.html
API Base:        http://localhost:3000/
```

---

## 🔌 API Endpoints

### Authentication
```
POST /auth/register          - Create account
POST /auth/login            - Login
POST /auth/google           - Google OAuth
POST /auth/forgot-password  - Request password reset
POST /auth/reset-password   - Reset password
```

### Protected Routes (require JWT token)
```
GET  /dashboard                      - Verify access
GET  /api/liked-topics              - Get liked topics
POST /api/liked-topics              - Add liked topic
DELETE /api/liked-topics/:topic     - Remove liked topic
POST /api/search-history            - Save search
GET  /api/search-history            - Get search history
```

---

## 🛠️ Common Tasks

### First Time Setup
1. Run `setup.bat` or `npm install`
2. Copy `.env.example` to `.env`
3. Edit `.env` with your configuration
4. Start MongoDB
5. Run `npm start`
6. Open `http://localhost:3000/welcome.html`

### Development Workflow
1. Make code changes
2. Save files
3. Server auto-reloads (if using `npm run dev`)
4. Refresh browser to see changes

### Testing Features
1. Register a new account
2. Login
3. Search for topic: `#Technology`
4. Add topic to liked list
5. Remove topic from liked list
6. Logout and login again

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process using port 3000 (replace PID)
taskkill /F /PID <PID>
```

### MongoDB Connection Error
- ✅ Is MongoDB running? `net start | find "MongoDB"`
- ✅ Is connection string correct in `.env`?
- ✅ Try: `mongodb://127.0.0.1:27017/trendsphere`

### Can't Login
- ✅ Clear browser cache and localStorage
- ✅ Check console for errors (F12)
- ✅ Verify JWT_SECRET is set in `.env`

### Google OAuth Not Working
- ✅ Check GOOGLE_CLIENT_ID in `.env` and `index.html`
- ✅ Add `http://localhost:3000` to authorized origins
- ✅ Use localhost, not 127.0.0.1

---

## 💡 Tips & Tricks

### Browser DevTools
```
F12              - Open developer tools
Ctrl + Shift + C - Inspect element
Ctrl + Shift + J - Console
Ctrl + Shift + I - Developer tools
```

### Clear Data
```javascript
// Run in browser console to clear localStorage
localStorage.clear()
```

### Check Token
```javascript
// Run in browser console
console.log(localStorage.getItem('userToken'))
```

### Test API
```bash
# Using curl (if installed)
curl -X POST http://localhost:3000/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"test\",\"email\":\"test@test.com\",\"password\":\"password123\"}"
```

---

## 📊 Sample Test Data

### Test Account
```
Username: testuser
Email: test@example.com
Password: Test123!
```

### Sample Topics to Search
```
#AI
#Technology
#Climate
#Sports
#Entertainment
Bitcoin
Crypto
```

---

## 🔒 Security Checklist

- ✅ JWT_SECRET is unique and random
- ✅ .env file is in .gitignore
- ✅ Passwords are hashed (bcrypt)
- ✅ Email credentials use App Password
- ✅ Google Client ID is from authorized project

---

## 📝 Git Commands (Optional)

```bash
# Initialize git repository
git init

# Add files
git add .

# Commit
git commit -m "Initial commit"

# Create repository on GitHub and push
git remote add origin <your-repo-url>
git push -u origin main
```

---

## 🚀 Deployment Options

### Free Hosting
- **Backend**: Railway, Render, Heroku
- **Database**: MongoDB Atlas (free tier)
- **Frontend**: Vercel, Netlify, GitHub Pages

### Environment for Production
- Set `NODE_ENV=production`
- Use HTTPS
- Update CORS origins
- Set secure JWT_SECRET
- Use environment-specific .env files

---

## 📞 Support Resources

### Official Documentation
- Node.js: https://nodejs.org/docs
- Express: https://expressjs.com/
- MongoDB: https://docs.mongodb.com/
- Chart.js: https://www.chartjs.org/docs

### Learning Resources
- JavaScript: https://developer.mozilla.org/
- Bootstrap: https://getbootstrap.com/docs
- JWT: https://jwt.io/introduction

---

## ⚡ Performance Tips

1. **Use indexes** in MongoDB for frequently queried fields
2. **Implement caching** with Redis for repeated searches
3. **Compress responses** with gzip
4. **Optimize images** and assets
5. **Use CDN** for static files in production

---

## 🎯 Next Features to Build

- [ ] Email notifications
- [ ] Real API integration
- [ ] Advanced search filters
- [ ] Export reports
- [ ] Mobile app
- [ ] Dark/light theme toggle
- [ ] Multi-language support

---

**Last Updated:** 2025-10-27
**Version:** 1.0.0

📈 **Happy Trending with TrendSphere!**
