# SwasthRoute - Complete Navigation Guide

## Overview
SwasthRoute now has a fully integrated navigation system with responsive menus, footers, and interconnected pages across three main sections: User App, Pharmacy Dashboard, and Admin Panel.

---

## User App Navigation (/)

### Main Navigation Links
All authenticated users see the following navigation in the header:

| Link | Path | Purpose |
|------|------|---------|
| Home | / | Browse nearby pharmacies |
| My Orders | /app/orders | View all orders |
| Medicines | /app/medicines | Browse medicine catalog |
| Track Order | /app/track-order | Real-time order tracking |
| Profile | /app/profile | User account settings |

### User App Pages

#### 1. Homepage (/)
- **Path**: `/`
- **Features**:
  - Hero section with CTA buttons
  - Browse nearby pharmacies with map integration
  - Search pharmacies by name/location
  - Pharmacy cards with rating, distance, delivery time
  - Favorites/wishlist functionality

#### 2. My Orders (/app/orders)
- **Path**: `/app/orders`
- **Features**:
  - Order history with status tracking
  - Filter orders by status (pending, delivered, cancelled)
  - Quick access to track individual orders
  - Order summary with medicines and total

#### 3. Medicines (/app/medicines)
- **Path**: `/app/medicines`
- **Features**:
  - Browse all available medicines
  - Search by medicine name
  - Filter by category
  - Stock availability indicators
  - Add to cart functionality

#### 4. Track Order (/app/track-order)
- **Path**: `/app/track-order`
- **Features**:
  - Real-time order status with step-by-step progress
  - Delivery partner information with contact
  - Estimated arrival time
  - Order summary and payment details
  - Live location tracking (integrated with Mapbox)

#### 5. My Profile (/app/profile)
- **Path**: `/app/profile`
- **Features**:
  - Personal information management
  - Phone and email display
  - Address management
  - Account statistics (total orders, spent, saved)
  - Notification preferences
  - Saved pharmacies

---

## Pharmacy Dashboard Navigation (/pharmacy)

### Main Navigation Links
Pharmacy partners see the following navigation:

| Link | Path | Purpose |
|------|------|---------|
| Dashboard | /pharmacy | Overview & KPIs |
| Orders | /pharmacy/orders | Order management |
| Medicines | /pharmacy/medicines | Inventory management |
| Earnings | /pharmacy/earnings | Revenue tracking |
| Settings | /pharmacy/settings | Configuration |

### Pharmacy Dashboard Pages

#### 1. Dashboard (/pharmacy)
- **Path**: `/pharmacy`
- **Features**:
  - KPI cards (active orders, revenue, ratings)
  - Real-time order queue
  - Pharmacy performance metrics
  - Quick action buttons

#### 2. Orders (/pharmacy/orders)
- **Path**: `/pharmacy/orders`
- **Features**:
  - Incoming order management
  - Order filtering by status
  - Accept/reject orders
  - View customer details
  - Dispatch tracking

#### 3. Medicines (/pharmacy/medicines)
- **Path**: `/pharmacy/medicines`
- **Features**:
  - Inventory management table
  - Add/edit medicine details
  - Stock level monitoring
  - Reorder level alerts
  - Batch import/export

#### 4. Earnings (/pharmacy/earnings)
- **Path**: `/pharmacy/earnings`
- **Features**:
  - Daily/monthly earnings display
  - Weekly earnings chart
  - Recent transactions list
  - Commission breakdown
  - Payment history & withdrawals

#### 5. Settings (/pharmacy/settings)
- **Path**: `/pharmacy/settings`
- **Features**:
  - Pharmacy information (name, license)
  - Contact details
  - Operating hours
  - Location management
  - Security settings (password, 2FA)

---

## Admin Panel Navigation (/admin)

### Main Navigation Links
Admin users see the following navigation:

| Link | Path | Purpose |
|------|------|---------|
| Dashboard | /admin | System overview |
| Pharmacies | /admin/pharmacies | Pharmacy management |
| Users | /admin/users | User management |
| Orders | /admin/orders | Order monitoring |
| Analytics | /admin/analytics | Platform metrics |
| Settings | /admin/settings | Platform configuration |

### Admin Pages

#### 1. Admin Dashboard (/admin)
- **Path**: `/admin`
- **Features**:
  - System KPIs
  - Total users, pharmacies, orders, revenue
  - User registration trends
  - Pharmacy approval queue
  - Recent activity log

#### 2. Pharmacies (/admin/pharmacies)
- **Path**: `/admin/pharmacies`
- **Features**:
  - Pharmacy approval management
  - Verify pharmacy documents
  - Commission settings per pharmacy
  - Suspension/activation controls
  - Performance ratings

#### 3. Users (/admin/users)
- **Path**: `/admin/users`
- **Features**:
  - User listing with search
  - Account status management
  - User activity overview
  - Report/complaint handling
  - User blocking capabilities

#### 4. Orders (/admin/orders)
- **Path**: `/admin/orders`
- **Features**:
  - Platform-wide order monitoring
  - Order filtering and search
  - Dispute resolution
  - Revenue tracking
  - Order analytics

#### 5. Analytics (/admin/analytics)
- **Path**: `/admin/analytics`
- **Features**:
  - Growth trends with charts
  - User acquisition metrics
  - Revenue analytics
  - Top performing pharmacies
  - Top medicines
  - User retention metrics

#### 6. Settings (/admin/settings)
- **Path**: `/admin/settings`
- **Features**:
  - Commission rate configuration
  - Delivery charge settings
  - Emergency fee settings
  - Subscription pricing
  - Notification preferences
  - Security management
  - Audit logs

---

## Footer Navigation

The footer appears on all pages and includes:

### User Links Section
- Find Pharmacies
- My Orders
- My Profile
- Saved Pharmacies
- Track Order

### Pharmacy Links Section
- Join As Pharmacy
- Dashboard
- Manage Orders
- View Earnings
- Settings

### Support Section
- Call us: +91 9876543210
- Email: support@swasthroute.com

### Legal Links (Bottom)
- Privacy Policy
- Terms of Service
- Contact Us
- FAQ

---

## Navigation Components

### Navbar Component (`components/Navbar.tsx`)
- **Features**:
  - Responsive navigation (desktop + mobile)
  - Hamburger menu for mobile
  - Context-aware links (changes based on user role)
  - User profile display
  - Logout functionality
  - Active page highlighting
  - Logo with brand link

### Footer Component (`components/Footer.tsx`)
- **Features**:
  - Multi-column footer layout
  - Social media links
  - Contact information
  - Quick links by category
  - Copyright information
  - Responsive grid layout

---

## Authentication Routes

### Public Routes (No login required)
- **Login**: `/auth/login` - User login page
- **Signup**: `/auth/signup` - User registration
- **Pharmacy Auth**: `/pharmacy/auth` - Pharmacy login/signup
- **Admin Auth**: `/admin/auth` - Admin login

### Protected Routes (Login required)
- All `/app/*` routes require user authentication
- All `/pharmacy/*` routes require pharmacy authentication
- All `/admin/*` routes require admin authentication

---

## Navigation Flow

### New User Flow
1. Land on homepage `/`
2. If not logged in → redirected to `/auth/login` or `/auth/signup`
3. After login → redirected to `/` (home)
4. Can now access: orders, medicines, profile, track order

### New Pharmacy Flow
1. Visit `/pharmacy/auth`
2. Register as pharmacy
3. Approval by admin at `/admin/pharmacies`
4. Access pharmacy dashboard at `/pharmacy`

### New Admin Flow
1. Login at `/admin/auth`
2. Access admin dashboard at `/admin`
3. Manage users, pharmacies, orders, and settings

---

## Mobile Navigation

### Mobile Menu Features
- **Hamburger Menu**: Toggle with X icon
- **Touch-Friendly**: Large tap targets
- **Fast Navigation**: Single-level menu
- **Quick Access**: User profile + logout in mobile menu
- **Sticky Header**: Navigation always visible
- **Active Page Indicator**: Highlight current section

---

## Integration Points

### Navbar Integration
The Navbar component is auto-imported in the root layout and displays for authenticated users only.

### Footer Integration
The Footer component is auto-imported in the root layout and appears on all pages.

### Link Highlighting
Active links in navigation automatically highlight based on current URL using `usePathname()`.

---

## Best Practices for Adding New Pages

1. **Create page folder**: `/app/feature/page.tsx`
2. **Add to navigation**: Update `Navbar.tsx` with new link
3. **Use authentication**: Wrap with `useAuth()` hook
4. **Add breadcrumbs**: For deep pages (optional)
5. **Update footer**: Add link if public-facing
6. **Mobile test**: Verify mobile menu works

---

## Testing Navigation

### Desktop Testing
- Verify all navbar links work
- Check footer links
- Test logout functionality
- Verify role-based navigation (user/pharmacy/admin)

### Mobile Testing
- Hamburger menu opens/closes
- Links are accessible on mobile
- No horizontal scroll
- Footer is responsive

---

## API Endpoints for Navigation

Navigation doesn't directly call APIs but pages do:

- User auth: `POST /api/auth/user/login`, `POST /api/auth/user/signup`
- Get user profile: `GET /api/users/me`
- Get orders: `GET /api/orders`
- Get pharmacies: `GET /api/pharmacies/nearby`
- Pharmacy auth: `POST /api/auth/pharmacy/login`
- Admin auth: `POST /api/auth/admin/login`

---

## Troubleshooting Navigation

### Links Not Showing
- Check if user is authenticated with `useAuth()` hook
- Verify path structure matches page location
- Clear browser cache

### Mobile Menu Not Working
- Check if JavaScript is enabled
- Verify `useState` is working correctly
- Test on different browsers

### Active Link Not Highlighting
- Ensure `usePathname()` is imported from `next/navigation`
- Check route path matches exactly
- Verify conditional logic in Navbar

---

## Future Enhancements

1. **Breadcrumbs**: Add to all nested pages
2. **Search**: Global search across platform
3. **Quick Actions**: Floating action button for new orders
4. **Notifications**: Bell icon with notification count
5. **Language Support**: Multi-language navigation
6. **Dark Mode Toggle**: Theme switcher in navbar
7. **Analytics Integration**: Track navigation patterns

---

**Last Updated**: February 2024  
**Maintainer**: SwasthRoute Development Team
