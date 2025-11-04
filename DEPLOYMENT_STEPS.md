# 🚀 TrendSphere Deployment Guide

## Prerequisites Checklist

Before deployment, ensure you have:

- [ ] Node.js installed (v18 or higher)
- [ ] Python 3.8+ installed
- [ ] MongoDB Atlas account (for cloud database)
- [ ] GitHub account
- [ ] API keys ready (Reddit, NewsAPI)

---

## 📋 STEP-BY-STEP DEPLOYMENT PROCESS

### **Phase 1: Prepare Your Local Repository**

#### Step 1.1: Initialize Git (if not already done)

```bash
cd c:\Users\user\OneDrive\Desktop\TrendSphereProject
git init
```

#### Step 1.2: Verify .gitignore is working

```bash
git status
```

✅ Make sure you DON'T see:
- `.env` file
- `node_modules/` folder
- `__pycache__/` folder

❌ If you see these files, your .gitignore is not working properly!

#### Step 1.3: Create initial commit

```bash
git add .
git commit -m "Initial commit: TrendSphere Prediction Dashboard"
```

---

### **Phase 2: Set Up MongoDB Atlas (Cloud Database)**

#### Step 2.1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account
3. Create a new cluster (Free tier is fine)

#### Step 2.2: Set Up Database User
1. Go to Database Access
2. Add New Database User
3. Set username and password (SAVE THESE!)
4. Give "Read and write to any database" permissions

#### Step 2.3: Set Up Network Access
1. Go to Network Access
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for testing)
4. Click Confirm

#### Step 2.4: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. It looks like: `mongodb+srv://username:password@cluster.mongodb.net/`

#### Step 2.5: Update Your Connection String
Replace `<username>`, `<password>`, and add database name:
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/trendsphere?retryWrites=true&w=majority
```

---

### **Phase 3: Create GitHub Repository**

#### Step 3.1: Create New Repository on GitHub
1. Go to https://github.com/new
2. Repository name: `trendsphere` (or your choice)
3. Description: "AI-powered trend prediction dashboard using Facebook Prophet ML"
4. Choose: **Public** or **Private**
5. ❌ DON'T initialize with README (you already have one)
6. Click "Create repository"

#### Step 3.2: Connect Local Repository to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/trendsphere.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

#### Step 3.3: Verify Push Success
Go to your GitHub repository URL and verify all files are there EXCEPT:
- ✅ .env should NOT be visible
- ✅ node_modules/ should NOT be visible
- ✅ .env.example SHOULD be visible

---

### **Phase 4: Deploy to Render (Recommended Platform)**

#### Why Render?
- ✅ Free tier available
- ✅ Automatic deployments from GitHub
- ✅ Supports Node.js + Python
- ✅ Easy environment variable management
- ✅ Free SSL certificates

#### Step 4.1: Sign Up for Render
1. Go to https://render.com
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

#### Step 4.2: Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select `trendsphere` repository
4. Click "Connect"

#### Step 4.3: Configure Service
**Basic Settings:**
- Name: `trendsphere` (or your choice)
- Region: Choose closest to your users
- Branch: `main`
- Root Directory: Leave empty
- Runtime: `Node`
- Build Command: `npm install && pip install -r requirements.txt`
- Start Command: `npm start`

**Advanced Settings:**
- Instance Type: `Free`
- Auto-Deploy: `Yes`

#### Step 4.4: Add Environment Variables

Click "Environment" tab and add these variables:

```
MONGODB_URI = your_mongodb_atlas_connection_string
JWT_SECRET = generate_a_random_64_character_string
PORT = 3000
REDDIT_CLIENT_ID = your_reddit_client_id
REDDIT_CLIENT_SECRET = your_reddit_client_secret
REDDIT_USERNAME = your_reddit_username
REDDIT_PASSWORD = your_reddit_password
REDDIT_USER_AGENT = TrendSphere/1.0
NEWSAPI_KEY = your_newsapi_key
ENABLE_TWITTER = false
USE_IN_MEMORY = false
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Step 4.5: Deploy!
1. Click "Create Web Service"
2. Wait for build to complete (5-10 minutes)
3. Your app will be available at: `https://trendsphere.onrender.com`

---

### **Phase 5: Post-Deployment Verification**

#### Step 5.1: Test Your Deployed App
1. Visit your Render URL
2. Try registering a new user
3. Try searching for a trend (e.g., "bitcoin")
4. Verify predictions are working

#### Step 5.2: Monitor Logs
In Render dashboard:
1. Click on your service
2. Go to "Logs" tab
3. Check for any errors

#### Step 5.3: Common Issues & Solutions

**Issue: "Application failed to start"**
- Check logs for error messages
- Verify all environment variables are set
- Check if MongoDB connection string is correct

**Issue: "Prophet predictions not working"**
- Verify `requirements.txt` has `prophet`
- Check build logs to ensure Python packages installed
- Restart the service

**Issue: "Cannot connect to database"**
- Verify MongoDB Atlas IP whitelist includes Render's IPs
- Check connection string format
- Ensure database user has correct permissions

---

## 🎉 Success Checklist

- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas configured
- [ ] Environment variables set on Render
- [ ] Application deployed successfully
- [ ] Can access the website
- [ ] User registration works
- [ ] Predictions work for test topics
- [ ] No errors in logs

---

## 📱 Sharing Your App

Your app is now live at:
```
https://your-service-name.onrender.com
```

Share this URL with:
- Portfolio websites
- LinkedIn projects
- GitHub README
- Resume

---

## 🔒 Security Best Practices

✅ **DO:**
- Use strong, unique passwords
- Keep API keys in environment variables
- Use MongoDB Atlas instead of local MongoDB
- Enable HTTPS (Render does this automatically)
- Regularly update dependencies

❌ **DON'T:**
- Commit .env file to GitHub
- Share API keys publicly
- Use weak JWT secrets
- Expose admin credentials

---

## 🔄 Making Updates After Deployment

### To update your deployed app:

1. Make changes to your code locally
2. Test locally first
3. Commit changes:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```
4. Render will automatically rebuild and deploy!

---

## 📞 Support Resources

- **Render Docs**: https://render.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Your GitHub Repo**: https://github.com/YOUR_USERNAME/trendsphere

---

## ⚡ Quick Commands Reference

```bash
# Check what will be committed
git status

# Add all files
git add .

# Commit changes
git commit -m "Your message"

# Push to GitHub
git push origin main

# View git history
git log --oneline

# Check remote repository
git remote -v
```

---

Good luck with your deployment! 🚀
