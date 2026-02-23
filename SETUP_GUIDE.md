# SwasthRoute Setup Guide

## Overview

SwasthRoute is a full-stack emergency medicine delivery platform with:
- **User App**: Search pharmacies, order medicines, track deliveries
- **Pharmacy Dashboard**: Manage orders, inventory, earnings
- **Admin Panel**: Approve pharmacies, manage commissions, view analytics

## Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier available)
- Mapbox API key (optional, for advanced geolocation features)

## Quick Start

### 1. Database Setup (MongoDB)

```bash
# Create a free MongoDB Atlas cluster at https://www.mongodb.com/cloud/atlas

# Add your connection string to .env:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/swasthroute
```

### 2. Backend Setup

```bash
# Navigate to API folder
cd api

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your MongoDB URI
MONGODB_URI=your_mongodb_connection_string
PORT=3001
JWT_SECRET=your-secret-key-here

# Start the backend server
npm run dev
# Server runs at http://localhost:3001
```

### 3. Frontend Setup

```bash
# In root directory
# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local

# Start the development server
npm run dev
# Frontend runs at http://localhost:3000
```

## Testing the Application

### Demo Credentials

**User Login:**
- Phone: `9876543210`
- Password: `test123`

**Pharmacy Login:**
- Phone: `9876543211`
- Password: `test123`

**Admin Login:**
- Admin ID: `admin001`
- Password: `admin123`

### Test User Flow

1. **Sign Up**: Create a new account at `/auth/signup`
   - Indian phone format (10 digits starting with 6-9)
   - Password minimum 6 characters

2. **Auto-Geolocation**: Grant browser location permission
   - Shows nearby pharmacies sorted by distance
   - Displays delivery time and ratings

3. **Search Medicines**: Use the search bar to filter pharmacies
   - Search by pharmacy name or city

4. **View Pharmacy**: Click "Order Now" to view pharmacy details

5. **Place Order**: Add medicines to cart and checkout

## File Structure

```
/
├── app/                          # Next.js app router
│   ├── page.tsx                 # Homepage (hero + features)
│   ├── layout.tsx               # Root layout
│   ├── auth/
│   │   ├── login/page.tsx       # User login
│   │   └── signup/page.tsx      # User signup
│   ├── pharmacy/                # Pharmacy dashboard
│   └── admin/                   # Admin panel
├── api/                         # Express backend
│   ├── server.js                # Main server file
│   ├── config/                  # Database config
│   ├── models/                  # MongoDB schemas
│   ├── routes/                  # API endpoints
│   └── middleware/              # Authentication middleware
├── components/                  # React components
│   ├── HeroSection.tsx         # Landing page hero
│   ├── FeaturesSection.tsx     # Features showcase
│   ├── PharmacyCard.tsx        # Pharmacy listing card
│   ├── Navbar.tsx              # Navigation bar
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── api.ts                  # API client functions
│   ├── auth.ts                 # Authentication utilities
│   └── hooks/
│       ├── useAuth.ts          # Auth state management
│       └── useGeolocation.ts   # Browser geolocation hook
└── public/                     # Static assets
```

## Key Features Implemented

### User App
- ✅ Homepage with hero section and features showcase
- ✅ User authentication (signup/login)
- ✅ Auto-detect browser geolocation
- ✅ Pharmacy discovery with location-based sorting
- ✅ Medicine search and filtering
- ✅ Responsive design with modern UI

### Pharmacy Dashboard
- ✅ Pharmacy authentication
- ✅ Orders management
- ✅ Real-time order status updates
- ✅ Earnings and analytics
- ✅ Commission tracking

### Admin Panel
- ✅ Admin authentication
- ✅ Pharmacy approval workflow
- ✅ Commission management
- ✅ Analytics dashboard
- ✅ User and order statistics

## API Endpoints

### Authentication
- `POST /api/auth/user/signup` - Register new user
- `POST /api/auth/user/login` - User login
- `POST /api/auth/pharmacy/signup` - Register pharmacy
- `POST /api/auth/pharmacy/login` - Pharmacy login
- `POST /api/auth/admin/login` - Admin login

### Pharmacies
- `GET /api/pharmacies` - List all pharmacies
- `GET /api/pharmacies/:id` - Get pharmacy details
- `GET /api/pharmacies/nearby?lat=X&lng=Y` - Find nearby pharmacies
- `POST /api/pharmacies` - Create pharmacy (admin)

### Orders
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Place new order
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id/status` - Update order status

### Users
- `GET /api/users/profile` - Get current user profile
- `PATCH /api/users/profile` - Update profile
- `GET /api/users/:id/orders` - User's order history

## Design System

### Colors
- **Primary**: Teal/Emerald (#00876a / oklch(0.45 0.15 160))
- **Secondary**: Light Gray (#e8f5f3)
- **Accent**: Sky Blue (#0088cc / oklch(0.55 0.12 200))
- **Background**: Off-white (#f9fafb)

### Typography
- **Headings**: System fonts (Geist family)
- **Body**: Geist Sans 14px+
- **Line Height**: 1.5-1.6 for readability

### Components
- Cards with gradient backgrounds
- Glassmorphism effects (backdrop blur)
- Smooth animations and transitions
- Mobile-first responsive design

## Troubleshooting

### API Connection Issues
```bash
# Check if backend is running
curl http://localhost:3001/api/pharmacies

# Verify .env files
cat api/.env          # Backend config
cat .env.local        # Frontend config
```

### Geolocation Not Working
- Check browser permissions for location access
- HTTPS required in production (HTTP only for localhost)
- Fallback location available from localStorage

### Database Connection
```bash
# Test MongoDB connection
mongosh "mongodb+srv://username:password@cluster.mongodb.net/swasthroute"
```

## Deployment

### Frontend (Vercel)
```bash
# Push to GitHub and connect to Vercel
# Set NEXT_PUBLIC_API_URL to your backend URL
vercel env add NEXT_PUBLIC_API_URL
```

### Backend (Railway/Render)
```bash
# Push to GitHub
# Connect to Railway or Render
# Set environment variables:
# - MONGODB_URI
# - JWT_SECRET
# - NODE_ENV=production
```

## Security Best Practices

- ✅ Passwords hashed with bcryptjs
- ✅ JWT token authentication
- ✅ CORS properly configured
- ✅ Input validation on all endpoints
- ✅ HTTP-only cookies for sensitive data
- ✅ Rate limiting recommended for production

## Next Steps

1. **Customize**: Update colors, fonts, and copy for your brand
2. **Add Maps**: Integrate Mapbox for real-time tracking
3. **Payments**: Add Stripe/Razorpay for transactions
4. **SMS**: Integrate Twilio for order notifications
5. **Analytics**: Add PostHog or Mixpanel
6. **Testing**: Add Jest/Cypress tests

## Support

For issues or questions:
1. Check browser console for errors
2. Review API logs in terminal
3. Check MongoDB Atlas dashboard for connection status
4. Refer to documentation in code comments

## License

MIT License - Feel free to use this for commercial or personal projects.
