# 🎨 TrendSphere - Visual System Diagram

## 🏗️ Complete Architecture Overview

```
╔══════════════════════════════════════════════════════════════════════╗
║                        TRENDSPHERE PLATFORM                           ║
╚══════════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE LAYER                          │
└──────────────────────────────────────────────────────────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  welcome.html   │  │   index.html    │  │ dashboard.html  │
│                 │  │                 │  │                 │
│  • Welcome msg  │→ │  • Login form   │→ │  • KPI cards    │
│  • Features     │  │  • Register     │  │  • Search       │
│  • Setup guide  │  │  • Google OAuth │  │  • Predictions  │
│  • Launch btn   │  │  • Password rst │  │  • Charts       │
└─────────────────┘  └─────────────────┘  │  • Liked topics │
                                           │  • Trending     │
                                           └─────────────────┘
         │                    │                     │
         └────────────────────┴─────────────────────┘
                              │
                     [Fetch API / HTTP]
                              │
                              ▼

┌──────────────────────────────────────────────────────────────────────┐
│                      APPLICATION SERVER LAYER                         │
└──────────────────────────────────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════════════╗
║                           server.js                                   ║
║  ┌────────────────────────────────────────────────────────────┐     ║
║  │                    Express.js Framework                     │     ║
║  └────────────────────────────────────────────────────────────┘     ║
║                                                                       ║
║  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              ║
║  │ Auth Routes  │  │ API Routes   │  │ Middleware   │              ║
║  │              │  │              │  │              │              ║
║  │ /auth/*      │  │ /api/*       │  │ • CORS       │              ║
║  │ • register   │  │ • liked-     │  │ • JWT verify │              ║
║  │ • login      │  │   topics     │  │ • Error hand │              ║
║  │ • google     │  │ • search-    │  │ • Logging    │              ║
║  │ • forgot-pwd │  │   history    │  └──────────────┘              ║
║  │ • reset-pwd  │  └──────────────┘                                 ║
║  └──────────────┘                                                    ║
║                                                                       ║
║  ┌────────────────────────────────────────────────────────────┐     ║
║  │                   Security Layer                            │     ║
║  │  • bcrypt (password hashing)                               │     ║
║  │  • JWT (token generation & verification)                   │     ║
║  │  • OAuth2 (Google authentication)                          │     ║
║  │  • Nodemailer (secure email)                               │     ║
║  └────────────────────────────────────────────────────────────┘     ║
╚══════════════════════════════════════════════════════════════════════╝
                              │
                     [Mongoose ODM]
                              │
                              ▼

┌──────────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER (MongoDB)                       │
└──────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐     ┌──────────────────────────┐
│   Users Collection      │     │ SearchHistory Collection │
├─────────────────────────┤     ├──────────────────────────┤
│ • _id                   │     │ • _id                    │
│ • username (unique)     │     │ • userId (ref)           │
│ • email (unique)        │     │ • topic                  │
│ • password (hashed)     │     │ • searchedAt             │
│ • googleId              │     └──────────────────────────┘
│ • likedTopics []        │
│ • resetPasswordToken    │
│ • resetPasswordExpires  │
│ • createdAt             │
└─────────────────────────┘

```

---

## 🔄 User Authentication Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     ▼
[Choose Login Method]
     │
     ├─────────────────────┬───────────────────┐
     │                     │                   │
     ▼                     ▼                   ▼
┌──────────┐      ┌──────────────┐    ┌─────────────┐
│ Username │      │ Google OAuth │    │  Register   │
│ Password │      └──────┬───────┘    └──────┬──────┘
└────┬─────┘             │                   │
     │                   │                   │
     ▼                   ▼                   ▼
┌─────────────────────────────────────────────────┐
│          POST /auth/login                       │
│          POST /auth/google                      │
│          POST /auth/register                    │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
            [Verify Credentials]
            [Hash Password (if register)]
                     │
                     ▼
            [Generate JWT Token]
            [7-day expiration]
                     │
                     ▼
            [Send Token to Client]
                     │
                     ▼
        [Store in localStorage]
                     │
                     ▼
          [Redirect to Dashboard]
```

---

## 📊 Trend Prediction Flow

```
┌──────────────┐
│ User enters  │
│ topic/hashtag│
└──────┬───────┘
       │
       ▼
┌────────────────────────────┐
│ Click "Predict Trend"      │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│ JavaScript: searchForm     │
│ event handler              │
└────────────┬───────────────┘
             │
             ├────────────────────┐
             │                    │
             ▼                    ▼
┌────────────────────┐  ┌──────────────────────┐
│ Save Search        │  │ Generate Dummy Data  │
│ POST /api/search-  │  │ (7 days + 24 hours)  │
│ history            │  └──────────┬───────────┘
└────────────────────┘             │
                                   ▼
                      ┌────────────────────────┐
                      │ Simulate Prediction    │
                      │ • Status (RISING/...)  │
                      │ • Confidence score     │
                      │ • Trend direction      │
                      └──────────┬─────────────┘
                                 │
                                 ▼
                      ┌────────────────────────┐
                      │ Recommend Influencers  │
                      └──────────┬─────────────┘
                                 │
                                 ▼
                      ┌────────────────────────┐
                      │ Render Chart (Chart.js)│
                      │ • Historical (green)   │
                      │ • Predicted (red dash) │
                      │ • Confidence bands     │
                      └──────────┬─────────────┘
                                 │
                                 ▼
                      ┌────────────────────────┐
                      │ Display Results        │
                      │ • Status badge         │
                      │ • Message              │
                      │ • Influencers list     │
                      │ • Interactive chart    │
                      └────────────────────────┘
```

---

## ❤️ Liked Topics Flow

```
┌─────────────────┐
│ User sees topic │
│ (trending/      │
│  searched)      │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ Click ❤️ button     │
└────────┬────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ JavaScript: addToLiked(topic)    │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ POST /api/liked-topics           │
│ Headers: Bearer {JWT}            │
│ Body: { topic: "#hashtag" }      │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Server: authenticateToken()      │
│ Verify JWT                       │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Find user by ID                  │
│ Check if already liked           │
└────────┬─────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
[Exists]  [New]
    │         │
    │         ▼
    │    ┌──────────────────────┐
    │    │ Push to likedTopics  │
    │    │ user.save()          │
    │    └──────────┬───────────┘
    │               │
    └───────┬───────┘
            │
            ▼
    ┌──────────────────┐
    │ Send response    │
    │ { success: true }│
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Update UI        │
    │ • Show alert     │
    │ • Reload list    │
    └──────────────────┘
```

---

## 🔍 Quick Search from Liked Topics

```
┌─────────────────┐
│ Liked Topics    │
│ List Display    │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ Click 🔍 button     │
│ on liked topic      │
└────────┬────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ JavaScript: searchTopic(topic)   │
│ • Set input value                │
│ • Trigger search form submit     │
└────────┬─────────────────────────┘
         │
         ▼
    [Same as normal search]
    [Shows prediction instantly]
```

---

## 🗑️ Remove from Liked Topics

```
┌─────────────────┐
│ Click 🗑️ button │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ Confirm dialog      │
└────────┬────────────┘
         │
    [Yes]│[No]
         │  └──→ [Cancel]
         ▼
┌──────────────────────────────────┐
│ DELETE /api/liked-topics/:topic  │
│ Headers: Bearer {JWT}            │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Server: filter array             │
│ user.likedTopics = ...filter()  │
│ user.save()                      │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Update UI                        │
│ • Show alert                     │
│ • Reload liked topics list       │
└──────────────────────────────────┘
```

---

## 🔐 Security Implementation

```
┌──────────────────────────────────────────────┐
│            Security Layers                    │
└──────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  1. Password Security                        │
│  ┌────────────────────────────────────┐     │
│  │ User Password → bcrypt.hash(10)    │     │
│  │ "password123" → "$2a$10$xyz..."    │     │
│  └────────────────────────────────────┘     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  2. JWT Authentication                       │
│  ┌────────────────────────────────────┐     │
│  │ Login Success → Generate Token     │     │
│  │ Token = jwt.sign(payload, SECRET)  │     │
│  │ Expires in 7 days                  │     │
│  └────────────────────────────────────┘     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  3. Protected Routes                         │
│  ┌────────────────────────────────────┐     │
│  │ Request → Extract Bearer Token     │     │
│  │        → jwt.verify(token, SECRET) │     │
│  │        → req.user = decoded        │     │
│  │        → next() or 403 Forbidden   │     │
│  └────────────────────────────────────┘     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  4. CORS & Origin Control                    │
│  ┌────────────────────────────────────┐     │
│  │ app.use(cors())                    │     │
│  │ Allows cross-origin requests       │     │
│  └────────────────────────────────────┘     │
└─────────────────────────────────────────────┘
```

---

## 📈 Data Visualization Architecture

```
┌──────────────────────────────────────────────┐
│           Chart.js Integration               │
└──────────────────────────────────────────────┘

Data Generation:
┌────────────────────────────────────────┐
│ generateDummyTrendData()               │
│                                        │
│ FOR 168 hours (7 days):                │
│   └→ Historical data (green line)     │
│                                        │
│ FOR 24 hours:                          │
│   └→ Predicted data (red dashed)      │
│                                        │
│ Confidence Bands:                      │
│   └→ Upper & Lower bounds             │
└────────────┬───────────────────────────┘
             │
             ▼
Chart Rendering:
┌────────────────────────────────────────┐
│ Chart.js Line Chart                    │
│                                        │
│ Datasets:                              │
│  1. Upper Bound (filled area)         │
│  2. Main Trend Line (primary)         │
│  3. Lower Bound (filled area)         │
│                                        │
│ Features:                              │
│  • Responsive                          │
│  • Interactive tooltips                │
│  • Grid lines                          │
│  • Axis labels                         │
│  • Time-based X-axis                   │
│  • Dynamic Y-axis                      │
└────────────────────────────────────────┘
```

---

## 🌐 Complete Request-Response Cycle

```
┌────────┐
│ Client │ (Browser)
└───┬────┘
    │ 1. User Action (click, submit)
    ▼
┌─────────────────────┐
│ JavaScript Handler  │
└────┬────────────────┘
     │ 2. Build Request
     │    • URL
     │    • Method (GET/POST/DELETE)
     │    • Headers (Authorization)
     │    • Body (JSON data)
     ▼
┌─────────────────────┐
│ Fetch API           │
│ fetch(url, options) │
└────┬────────────────┘
     │ 3. HTTP Request
     │    [Network Layer]
     ▼
┌─────────────────────┐
│ Express.js Server   │
└────┬────────────────┘
     │ 4. Route Matching
     │    app.post('/api/...')
     ▼
┌─────────────────────┐
│ Middleware Check    │
│ authenticateToken() │
└────┬────────────────┘
     │ 5. JWT Verification
     ▼
┌─────────────────────┐
│ Business Logic      │
│ (Route Handler)     │
└────┬────────────────┘
     │ 6. Database Query
     ▼
┌─────────────────────┐
│ MongoDB             │
│ (via Mongoose)      │
└────┬────────────────┘
     │ 7. Data Retrieval
     ▼
┌─────────────────────┐
│ Response Builder    │
│ res.json({...})     │
└────┬────────────────┘
     │ 8. HTTP Response
     │    [Network Layer]
     ▼
┌─────────────────────┐
│ Client Receives     │
│ .then(data => ...)  │
└────┬────────────────┘
     │ 9. UI Update
     ▼
┌─────────────────────┐
│ DOM Manipulation    │
│ Display Results     │
└─────────────────────┘
```

---

## 📦 Deployment Architecture (Future)

```
┌──────────────────────────────────────────────┐
│              Production Setup                 │
└──────────────────────────────────────────────┘

Frontend:
┌────────────────────┐
│ Static File Host   │
│ • Vercel           │
│ • Netlify          │
│ • GitHub Pages     │
└────────┬───────────┘
         │
         ▼
Backend:
┌────────────────────┐
│ Node.js Hosting    │
│ • Railway          │
│ • Render           │
│ • Heroku           │
└────────┬───────────┘
         │
         ▼
Database:
┌────────────────────┐
│ MongoDB Atlas      │
│ (Cloud Database)   │
└────────────────────┘

External Services:
┌────────────────────┐
│ • Gmail (SMTP)     │
│ • Google OAuth     │
└────────────────────┘
```

---

## 🔄 State Management

```
┌──────────────────────────────────────────────┐
│         Client-Side State                     │
└──────────────────────────────────────────────┘

localStorage:
┌────────────────────────────────────┐
│ • userToken (JWT)                  │
│ • user (profile data)              │
│   └→ { id, username, email }       │
└────────────────────────────────────┘

Session Storage:
┌────────────────────────────────────┐
│ • Temporary search results         │
│ • Chart data cache                 │
└────────────────────────────────────┘

In-Memory (Variables):
┌────────────────────────────────────┐
│ • Current chart instance           │
│ • Liked topics list (after load)   │
│ • User profile display             │
└────────────────────────────────────┘
```

---

**This diagram provides a complete visual overview of how TrendSphere works!** 📊✨
