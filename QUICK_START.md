# SwasthRoute - Quick Start Guide

## ⚡ 5-Minute Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (create free at mongodb.com)

### Step 1: Clone & Install
```bash
# Navigate to project folder
cd swasthroute

# Install frontend dependencies
npm install

# Install backend dependencies
cd api
npm install
cd ..
```

### Step 2: Configure Environment

**Create `.env.local` in root:**
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Create `api/.env`:**
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/swasthroute
JWT_SECRET=your-secret-key-12345
PORT=3001
```

### Step 3: Start Services

**Terminal 1 (Frontend):**
```bash
npm run dev
# Opens http://localhost:3000
```

**Terminal 2 (Backend):**
```bash
cd api
npm run dev
# Server on http://localhost:3001
```

### Step 4: Test Login

**Demo Credentials:**
- Phone: `9876543210`
- Password: `test123`

Or create a new account at `/auth/signup`

---

## 🎨 Design Highlights

- **Hero Landing Page**: Beautiful gradient backgrounds with animated elements
- **Auto Geolocation**: Browser automatically detects user location
- **Pharmacy Cards**: Enhanced with favorite, share, and call buttons
- **Modern Auth Pages**: Beautiful signup and login forms
- **Responsive Design**: Works perfectly on mobile, tablet, desktop
- **Dark Mode**: Fully supported with optimized colors

---

## 📁 Project Structure

```
├── app/                 # Frontend pages
├── components/          # React components
├── lib/                 # Utilities and hooks
├── api/                 # Express backend
├── public/              # Static files
└── Documentation/       # Setup guides
```

---

## 🔐 Authentication

### Users can:
- ✅ Sign up with phone + password
- ✅ Login with existing account
- ✅ Logout and clear session
- ✅ Auto-login on page reload

### Validation:
- Phone: 10 digits, starts with 6-9
- Password: Minimum 6 characters

---

## 📍 Geolocation

### How it works:
1. Page loads → Browser requests location
2. User clicks "Allow" → Location detected
3. Pharmacies sorted by distance
4. Location cached for 5 minutes

### Status Messages:
- 🔄 "Detecting your location..." - Requesting permission
- ✅ "Location detected" - Permission granted
- ❌ Click "Enable" - Permission denied

---

## 🏥 Features Implemented

### User App
- ✅ Homepage with hero + features
- ✅ Sign up page
- ✅ Login page
- ✅ Pharmacy discovery
- ✅ Medicine search
- ✅ Auto geolocation
- ✅ Responsive design

### Pharmacy Dashboard
- ✅ Dashboard with metrics
- ✅ Order management
- ✅ Order tracking
- ✅ Earnings overview

### Admin Panel
- ✅ Admin dashboard
- ✅ Pharmacy approval
- ✅ Commission tracking
- ✅ Platform analytics

---

## 🐛 Troubleshooting

### Signin not working?
```bash
# Check backend is running
curl http://localhost:3001/api/pharmacies

# Check credentials
# Phone: 9876543210
# Password: test123

# Restart both servers
```

### Location not detected?
```
1. Check browser permissions
2. Click "Allow" when prompted
3. Reload page
4. Check console: F12 → Console tab
```

### API Connection Error?
```bash
# Verify .env.local
echo $NEXT_PUBLIC_API_URL

# Should output: http://localhost:3001/api

# Restart frontend
# npm run dev
```

### MongoDB Connection Failed?
```bash
# Verify connection string in api/.env
# Test connection directly
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/swasthroute"
```

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| `SETUP_GUIDE.md` | Complete setup and installation |
| `IMPROVEMENTS.md` | All design & feature improvements |
| `DESIGN_SPECS.md` | Design system details |
| `TROUBLESHOOTING.md` | Common issues and solutions |
| `DELIVERY_SUMMARY.md` | Project overview |
| `README.md` | Main project documentation |

---

## 🎯 Key Files

```
Frontend Pages:
- app/page.tsx              → Homepage
- app/auth/login/page.tsx   → Login page
- app/auth/signup/page.tsx  → Signup page
- app/pharmacy/page.tsx     → Pharmacy dashboard
- app/admin/page.tsx        → Admin dashboard

Components:
- components/HeroSection.tsx      → Landing page hero
- components/FeaturesSection.tsx  → Features showcase
- components/PharmacyCard.tsx     → Pharmacy listing
- components/Navbar.tsx           → Navigation bar

Hooks:
- lib/hooks/useAuth.ts         → Auth management
- lib/hooks/useGeolocation.ts  → Location detection

API:
- lib/api.ts                   → API client functions
- api/routes/auth.js           → Backend auth endpoints
- api/routes/pharmacies.js     → Pharmacy endpoints
```

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Push to GitHub
git push origin main

# Connect to Vercel
# Set NEXT_PUBLIC_API_URL env var
```

### Backend (Railway/Render)
```bash
# Push to GitHub
git push origin main

# Connect to Railway/Render
# Set MONGODB_URI and JWT_SECRET
```

---

## 💡 Common Tasks

### Create New User Account
1. Visit `/auth/signup`
2. Enter: name, phone (10 digits), password (6+ chars)
3. Click "Sign Up"
4. Redirected to homepage

### Login with Demo Account
1. Visit `/auth/login`
2. Phone: `9876543210`
3. Password: `test123`
4. Click "Log In"

### Reset Location
```javascript
// Open browser console (F12)
localStorage.removeItem('userLocation');
localStorage.removeItem('authToken');
location.reload();
```

### Check Location Data
```javascript
// Open browser console (F12)
console.log(localStorage.getItem('userLocation'));
console.log(JSON.parse(localStorage.getItem('user')));
```

---

## 📊 API Endpoints

```
Authentication:
POST   /api/auth/user/signup
POST   /api/auth/user/login
POST   /api/auth/logout

Pharmacies:
GET    /api/pharmacies
GET    /api/pharmacies/:id
GET    /api/pharmacies/nearby?lat=X&lng=Y

Orders:
GET    /api/orders
POST   /api/orders
PATCH  /api/orders/:id/status

Users:
GET    /api/users/profile
PATCH  /api/users/profile
```

---

## 🎨 Design System

### Colors
- **Primary**: Teal (#00876a)
- **Accent**: Sky Blue (#0088cc)
- **Background**: Off-white (#f9fafb)
- **Text**: Charcoal (#374151)

### Fonts
- **Headings**: Geist (bold)
- **Body**: Geist Sans (regular)
- **Mono**: Geist Mono

### Effects
- Glassmorphism (backdrop blur)
- Smooth animations (300ms)
- Hover scale effects (105%)
- Gradient overlays

---

## ✅ Checklist Before Going Live

- [ ] MongoDB Atlas cluster created
- [ ] Connection string added to api/.env
- [ ] JWT_SECRET set (strong random string)
- [ ] NEXT_PUBLIC_API_URL configured
- [ ] Both servers running without errors
- [ ] Can login with test account
- [ ] Location permission works
- [ ] Pharmacy list displays
- [ ] Responsive design tested on mobile
- [ ] Console has no errors (F12)

---

## 📞 Support

**Issue with Signin?**
→ See TROUBLESHOOTING.md

**Setup Questions?**
→ See SETUP_GUIDE.md

**Design Customization?**
→ See DESIGN_SPECS.md

**Want to Add Features?**
→ See DELIVERY_SUMMARY.md for next steps

---

## 🎓 Learning Resources

- **Next.js**: nextjs.org
- **TypeScript**: typescriptlang.org
- **Tailwind**: tailwindcss.com
- **MongoDB**: docs.mongodb.com
- **Express**: expressjs.com

---

## 📝 Notes

- Passwords are hashed with bcryptjs (secure)
- JWTs expire after 24 hours
- Location data cached for 5 minutes
- All API calls logged with [v0] prefix
- Dark mode automatically enabled based on system preference

---

**You're all set! 🚀 Start with `npm run dev` in Terminal 1, then `cd api && npm run dev` in Terminal 2.**

Questions? Check the documentation files or open the browser console (F12) to see debug messages.
