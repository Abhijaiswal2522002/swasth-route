# SwasthRoute - Troubleshooting Guide

## Common Issues & Solutions

### 1. Sign In Not Working

#### Problem: "Login failed" error message
**Solution:**
1. Verify backend is running: `cd api && npm run dev`
2. Check API URL in `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```
3. Verify correct credentials:
   - Phone: `9876543210` (10 digits)
   - Password: `test123`
4. Check browser console for detailed error:
   - Press F12 → Console tab
   - Look for error messages with [v0] prefix
5. Restart both frontend and backend

#### Problem: "Network Error" or "Failed to fetch"
**Solution:**
1. Check if backend server is running on port 3001:
   ```bash
   curl http://localhost:3001/api/pharmacies
   ```
   Should return JSON response or proper error

2. If CORS error:
   - Backend CORS is already configured
   - Verify `api/server.js` has correct CORS setup
   - Restart backend server

3. Ensure correct API URL:
   ```bash
   echo $NEXT_PUBLIC_API_URL  # Should show API URL
   ```

#### Problem: "Invalid phone number" error
**Solution:**
- Phone must be 10 digits
- Must start with 6, 7, 8, or 9 (Indian format)
- Remove any special characters (dashes, spaces)
- Examples of valid phones:
  - ✅ 9876543210
  - ✅ 8765432109
  - ❌ 9876-543-210 (has dashes)
  - ❌ +919876543210 (don't include country code)

#### Problem: "Password must be at least 6 characters"
**Solution:**
- Use password with 6+ characters
- Example: `test123`

#### Problem: Phone already exists error (on signup)
**Solution:**
- User account already created with this phone
- Use different phone number or login instead
- Or use demo account: 9876543210 / test123

### 2. Geolocation Not Working

#### Problem: Location not detected, no permission prompt
**Solution:**
1. Browser must support Geolocation API:
   - ✅ Chrome, Edge, Firefox, Safari (all modern versions)
   - All mobile browsers

2. HTTPS requirement (Production):
   - Localhost works with HTTP
   - Production requires HTTPS

3. Check browser permissions:
   - Chrome: address bar icon → Site settings → Location
   - Firefox: Preferences → Privacy → Permissions → Location
   - Safari: Preferences → Websites → Location

4. Grant permission when prompted:
   - Allow location access for the app
   - Check if "Allow" button appears on first load

5. Clear browser cache and reload:
   ```
   Ctrl+Shift+R (Windows/Linux)
   Cmd+Shift+R (Mac)
   ```

#### Problem: "Geolocation is not supported by this browser"
**Solution:**
- Update browser to latest version
- Use Chrome, Firefox, Safari, or Edge
- Mobile browsers all support geolocation

#### Problem: Location detected but not updating
**Solution:**
1. Check location cache:
   - Location is cached for 5 minutes
   - Wait 5 minutes or clear localStorage:
   ```javascript
   localStorage.removeItem('userLocation');
   ```

2. Browser console should show:
   - `[v0] Geolocation: Success` - means location detected
   - `[v0] Geolocation error: ...` - means permission denied

3. Allow permission again:
   - Clear site permissions and reload
   - Click allow when prompted

### 3. Pharmacy List Not Showing

#### Problem: "No pharmacies found" even after search
**Solution:**
1. Ensure you're logged in
2. Clear search field and refresh
3. Check browser console for API errors
4. Verify API is returning data:
   ```bash
   curl http://localhost:3001/api/pharmacies
   ```

#### Problem: Pharmacy cards appear empty/broken
**Solution:**
1. Check network tab in DevTools:
   - F12 → Network tab
   - Reload page
   - Look for failed requests
   - Check response status and data

2. Verify mock data is present (should see):
   - HealthCare Pharmacy
   - MediPlus Chemist
   - Emergency Pharmacy
   - Care Chemist Store

### 4. Session/Authentication Issues

#### Problem: Logged out immediately after login
**Solution:**
1. Check localStorage:
   ```javascript
   localStorage.getItem('authToken')
   localStorage.getItem('user')
   ```

2. Verify token structure:
   - Should be JWT format (three parts separated by dots)
   - `eyJhbGc...eyJzdWI...SflKxw...`

3. Check token expiration:
   - Default is 24 hours
   - Restart backend to reset tokens

#### Problem: Logout not working
**Solution:**
1. Clear localStorage manually:
   ```javascript
   localStorage.clear()
   ```

2. Refresh page - should see login page

3. Check browser console for logout errors

### 5. Design/UI Issues

#### Problem: Colors look wrong or not applying
**Solution:**
1. Clear Tailwind cache:
   ```bash
   rm -rf .next
   npm run dev  # Rebuilds everything
   ```

2. Check color scheme in `app/globals.css`:
   - Primary color should be teal (oklch(0.45 0.15 160))
   - Should have light and dark mode versions

3. Clear browser cache:
   ```
   Ctrl+Shift+Delete (Windows)
   Cmd+Shift+Delete (Mac)
   ```

#### Problem: Components not responsive on mobile
**Solution:**
1. Test in mobile view:
   - F12 → Click device toggle (top left)
   - Select iPhone or Android

2. Check Tailwind responsive classes are present:
   - `md:grid-cols-2` for tablet
   - `lg:grid-cols-3` for desktop

3. Verify viewport meta tag in `app/layout.tsx`:
   - Should be `viewport.tsx` or meta tag in head

### 6. API/Backend Issues

#### Problem: Backend crashes on start
**Solution:**
1. Check MongoDB connection:
   ```bash
   # Verify URI
   echo $MONGODB_URI
   
   # Test connection
   mongosh $MONGODB_URI
   ```

2. Verify port 3001 is available:
   ```bash
   lsof -i :3001  # Mac/Linux
   netstat -ano | findstr :3001  # Windows
   ```

3. Install dependencies:
   ```bash
   cd api
   npm install
   npm run dev
   ```

#### Problem: "Cannot find module" error
**Solution:**
```bash
cd api
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### Problem: CORS errors in browser
**Solution:**
1. Verify CORS setup in `api/server.js`:
   ```javascript
   const cors = require('cors');
   app.use(cors());
   ```

2. Restart backend after changes

3. Clear browser cache and reload

### 7. Environment Variables

#### Problem: API URL not found
**Solution:**
1. Create `.env.local` in root:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

2. Restart frontend:
   ```bash
   npm run dev
   ```

3. Verify in browser:
   ```javascript
   console.log(process.env.NEXT_PUBLIC_API_URL)
   ```

#### Problem: MongoDB connection string missing
**Solution:**
1. Create `.env` in `api/` folder:
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/swasthroute
   PORT=3001
   JWT_SECRET=your-secret-key
   ```

2. Get connection string from MongoDB Atlas:
   - Log in to atlas.mongodb.com
   - Click Connect on your cluster
   - Select "Drivers" → Node.js
   - Copy connection string

3. Replace `user` and `pass` with your credentials

### 8. Development Tools

#### Enable Debug Logging
Add `[v0]` console statements to track execution:

```javascript
console.log('[v0] Login attempting with phone:', phone);
console.log('[v0] Login response:', response);
console.log('[v0] Geolocation error:', err);
```

#### Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Perform action (login, search)
4. Check request/response:
   - Status should be 200, 201, etc.
   - Response should be valid JSON
   - No CORS errors

#### Inspect Local Storage
1. Open DevTools (F12)
2. Application → Local Storage → localhost:3000
3. Should see:
   - `authToken`: JWT token
   - `user`: User profile data
   - `userLocation`: Cached location

### 9. Database Issues

#### Problem: Data not persisting
**Solution:**
1. Verify MongoDB Atlas cluster is active:
   - https://cloud.mongodb.com
   - Check cluster status

2. Test connection:
   ```bash
   mongosh "mongodb+srv://user:pass@cluster.mongodb.net/swasthroute"
   ```

3. Check collections were created:
   ```javascript
   db.users.find()  // Should return documents
   ```

#### Problem: Wrong database or collection
**Solution:**
1. Verify database name in connection string:
   - Should be `swasthroute`
   - MongoDB Atlas → Database → Collections

2. Check models in `api/models/`:
   - User.js → users collection
   - Pharmacy.js → pharmacies collection
   - Order.js → orders collection

### 10. Quick Diagnostic Checklist

```
□ Backend running? (npm run dev in /api)
□ Frontend running? (npm run dev in root)
□ .env.local has NEXT_PUBLIC_API_URL
□ api/.env has MONGODB_URI
□ MongoDB Atlas cluster is active
□ Using correct demo credentials
□ Browser console shows no errors
□ Location permission granted
□ Cache cleared if needed
```

## Getting Help

1. **Check Console Errors**: F12 → Console tab for [v0] messages
2. **Review SETUP_GUIDE.md**: Database and configuration steps
3. **Check Network Tab**: F12 → Network tab for API responses
4. **Verify Credentials**: Use 9876543210 / test123 for testing
5. **Restart Everything**: Stop and restart both frontend and backend

## Performance Tips

1. **Disable animations** during testing (DevTools → Rendering → Disable animations)
2. **Use Lighthouse** to audit performance (DevTools → Lighthouse)
3. **Check bundle size**: `npm run build && npm run analyze`
4. **Monitor API calls**: Network tab shows all requests

## Still Stuck?

1. Delete all local environment files and recreate
2. Clear browser data: Settings → Clear browsing data → All time
3. Reinstall node_modules:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
4. Restart computer
5. Review all error messages carefully - they usually indicate the problem

Good luck! 🚀
