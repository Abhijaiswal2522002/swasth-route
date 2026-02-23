# SwasthRoute - Emergency Medicine Delivery Platform

A complete full-stack emergency medicine delivery application with map-based pharmacy discovery, real-time order tracking, and administrative management.

## Project Structure

```
/vercel/share/v0-project/
├── app/                          # User-facing application
│   ├── page.tsx                 # Homepage with pharmacy discovery
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles with color theme
├── pharmacy/                     # Pharmacy dashboard
│   ├── page.tsx                 # Pharmacy dashboard
│   ├── auth/page.tsx            # Pharmacy login/signup
│   └── orders/page.tsx          # Pharmacy order management
├── admin/                        # Admin control panel
│   ├── page.tsx                 # Admin dashboard
│   ├── auth/page.tsx            # Admin login
│   └── pharmacies/page.tsx      # Pharmacy approval & commission
├── components/                   # React components
│   ├── PharmacyCard.tsx         # Pharmacy display card
│   ├── MedicineSearch.tsx       # Medicine search interface
│   └── CartSummary.tsx          # Shopping cart summary
├── lib/                          # Utilities
│   ├── api.ts                   # API client for all endpoints
│   ├── auth.ts                  # Authentication manager
│   └── utils.ts                 # Helper functions
├── api/                          # Express backend server
│   ├── server.js                # Main Express app
│   ├── models/                  # MongoDB schemas
│   │   ├── User.js              # User schema
│   │   ├── Pharmacy.js          # Pharmacy schema
│   │   └── Order.js             # Order schema
│   ├── routes/                  # API endpoints
│   │   ├── auth.js              # Authentication routes
│   │   ├── users.js             # User management
│   │   ├── pharmacies.js        # Pharmacy endpoints
│   │   ├── orders.js            # Order management
│   │   └── admin.js             # Admin endpoints
│   ├── middleware/              # Express middleware
│   │   └── auth.js              # JWT verification
│   └── package.json             # Backend dependencies
├── scripts/                      # Utility scripts
│   ├── setup-db.js              # Database setup
│   └── seed-data.js             # Sample data
└── .env.example                 # Environment variables template
```

## Tech Stack

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Lucide React** - Icons

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### APIs & Services
- **Mapbox** - Map-based pharmacy discovery
- **Stripe/Razorpay** - Payments (optional)

## Installation & Setup

### 1. Clone & Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd api
npm install
cd ..
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

**Required Environment Variables:**

```env
# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/swasthroute

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# Maps
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-public-token

# Admin
ADMIN_SECRET=admin-secret-password

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
PORT=3001
NODE_ENV=development
```

### 3. Database Setup

**Option A: MongoDB Atlas (Cloud)**
1. Create account at mongodb.com
2. Create a cluster
3. Get connection string and add to `MONGODB_URI`

**Option B: Local MongoDB**
```bash
# Install and run MongoDB locally
mongod
```

### 4. Run the Application

**Terminal 1 - Frontend (Next.js)**
```bash
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2 - Backend (Express)**
```bash
npm run api:dev
# Runs on http://localhost:3001
```

## User Flows

### Customer App (http://localhost:3000)
1. **Homepage** - Browse nearby pharmacies
2. **Authentication** - Sign up / Login
3. **Search** - Find medicines
4. **Orders** - Place and track orders
5. **Profile** - Manage addresses and favorites

### Pharmacy Dashboard (http://localhost:3000/pharmacy)
1. **Auth** - Login/Signup at `/pharmacy/auth`
2. **Dashboard** - View analytics and metrics
3. **Orders** - Accept/reject/dispatch orders
4. **Inventory** - Manage medicines and stock
5. **Settings** - Update profile and hours

### Admin Panel (http://localhost:3000/admin)
1. **Auth** - Login at `/admin/auth` (Demo: ID=`admin`)
2. **Dashboard** - Platform analytics
3. **Pharmacies** - Approve/reject registrations
4. **Users** - Manage user accounts
5. **Orders** - View all orders
6. **Revenue** - Commission tracking

## API Endpoints

### Authentication
- `POST /api/auth/user/signup` - User registration
- `POST /api/auth/user/login` - User login
- `POST /api/auth/pharmacy/signup` - Pharmacy registration
- `POST /api/auth/pharmacy/login` - Pharmacy login
- `POST /api/auth/admin/login` - Admin login

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/addresses` - Add address
- `GET /api/users/addresses` - Get addresses
- `POST /api/users/favorites` - Add favorite

### Pharmacies
- `GET /api/pharmacies/nearby` - Get nearby pharmacies
- `GET /api/pharmacies/:id` - Pharmacy details
- `GET /api/pharmacies/:id/medicines` - Search medicines

### Orders
- `POST /api/orders/create` - Create order
- `GET /api/orders/user/list` - User's orders
- `GET /api/orders/:id` - Order details
- `PUT /api/orders/:id/status` - Update status
- `PUT /api/orders/:id/rate` - Rate order

### Admin
- `GET /api/admin/pharmacies` - List pharmacies
- `PUT /api/admin/pharmacies/:id/approve` - Approve pharmacy
- `PUT /api/admin/pharmacies/:id/commission` - Set commission
- `GET /api/admin/analytics/dashboard` - Platform analytics
- `GET /api/admin/analytics/revenue` - Revenue details

## Database Models

### User
```javascript
{
  phone: String (unique),
  name: String,
  email: String,
  password: String (hashed),
  addresses: Array,
  favorites: Array,
  totalOrders: Number,
  rating: Number
}
```

### Pharmacy
```javascript
{
  name: String,
  phone: String (unique),
  email: String,
  location: GeoJSON (for geospatial queries),
  address: Object,
  inventory: Array,
  status: String (pending/active/suspended),
  commissionRate: Number,
  rating: Number
}
```

### Order
```javascript
{
  orderId: String (unique),
  userId: ObjectId,
  pharmacyId: ObjectId,
  items: Array,
  status: String (pending/accepted/dispatched/delivered),
  total: Number,
  isEmergency: Boolean,
  tracking: Object,
  rating: Object
}
```

## Features

### MVP Features
- ✅ User authentication (phone-based)
- ✅ Pharmacy registration & approval
- ✅ Map-based pharmacy discovery
- ✅ Medicine search and browsing
- ✅ Order creation and management
- ✅ Real-time order status tracking
- ✅ Pharmacy dashboard
- ✅ Admin approval system
- ✅ Commission management
- ✅ Analytics dashboard

### Future Enhancements
- Real-time WebSocket updates
- SMS/Push notifications
- Payment gateway integration
- Pharmacy ratings and reviews
- Delivery partner management
- Advanced analytics
- Mobile app (React Native)

## Testing

### Manual Testing Accounts

**User Login:**
- Phone: (Create via signup)
- Password: (Create via signup)

**Pharmacy Login:**
- Phone: (Create via signup)
- Status: Pending until admin approval

**Admin Login:**
- ID: `admin`
- Password: (Check ADMIN_SECRET in .env)

## Deployment

### Frontend (Vercel)
```bash
npm run build
vercel deploy
```

### Backend Options

**Option 1: Vercel Functions**
- Serverless deployment
- Auto-scaling
- No maintenance

**Option 2: Railway/Render**
- Docker-based
- Better for long-running processes
- More affordable

**Option 3: AWS/DigitalOcean**
- Full control
- VPS hosting
- Database included

## Common Issues & Solutions

### MongoDB Connection Error
```
Error: connect ENOTFOUND
```
**Solution:** Check MONGODB_URI in .env, ensure MongoDB is running

### CORS Error
```
Access to XMLHttpRequest blocked by CORS
```
**Solution:** Ensure API_URL in frontend matches backend address

### JWT Auth Failed
```
401 Invalid token
```
**Solution:** Check JWT_SECRET is same in frontend and backend

### Geolocation Not Working
```
Error getting coordinates
```
**Solution:** Use HTTPS in production, get browser permission

## Security Notes

- Passwords are hashed with bcrypt
- JWT tokens stored in localStorage (httpOnly cookies recommended for production)
- All sensitive operations require authentication
- Input validation on all endpoints
- SQL injection protection via Mongoose
- Environment variables for sensitive data

## Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add feature'`
3. Push branch: `git push origin feature/your-feature`
4. Open pull request

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
1. Check the FAQ section
2. Review API documentation
3. Check GitHub issues
4. Contact support: support@swasthroute.com

---

**Version:** 1.0.0 MVP  
**Last Updated:** February 2024
#   s w a s t h - r o u t e  
 