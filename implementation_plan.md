# Raise Medicine Request Feature Implementation Plan

The goal is to allow users to "Raise a Request" for a medicine when it is not found in nearby pharmacies during a search. This request will be broadcasted to nearby pharmacies, who can view and accept these requests. A prepaid option will be available for users and visible to pharmacies in their UI.

## User Review Required

> [!IMPORTANT]
> - Should an accepted medicine request automatically convert into an order (`Order.js`), or should we track it entirely inside the new `MedicineRequest.js` schema until fulfillment? Converting to an order might be better for re-using delivery tracking/rider assignment. For this plan, I'll update it to create an `Order` once a pharmacy confirms they have it.
> - For the "prepaid option", should we integrate a full mock checkout immediately upon raising the request, or just mark the request preference as "Prepaid" and process the mock payment (success message) when creating the request? I will use a simple "Prepaid" checkbox in the request modal for now.

## Proposed Changes

### Backend APIs & Models

#### [NEW] `api/models/MedicineRequest.js`
Schema for medicine requests:
- `user`: ObjectId, ref 'User'
- `medicineName`: String
- `quantity`: Number
- `deliveryAddress`: Object (same as Order address schema)
- `paymentMethod`: String (Enum: ['Prepaid', 'COD'])
- `status`: String (Enum: ['Pending', 'Accepted', 'Completed'])
- `acceptedBy`: ObjectId, ref 'Pharmacy' (nullable)

#### [NEW] `api/routes/medicineRequests.js`
Create new express routes:
- `POST /` - Create a new request (User).
- `GET /nearby` - Get nearby pending requests based on lat/lng (for Pharmacy).
- `POST /:id/accept` - Pharmacy accepts the request and sets a price. This will update the status to 'Accepted' and create a corresponding `Order`.

#### [MODIFY] `api/server.js`
- Register `api/routes/medicineRequests.js` under `/api/medicine-requests`.

---

### Frontend Shared & Client API

#### [MODIFY] `lib/api.ts`
Add the following methods:
- `createMedicineRequest(payload)`
- `getNearbyMedicineRequests(lat, lng, radius)`
- `acceptMedicineRequest(requestId, price)`

---

### Frontend User App

#### [MODIFY] `app/app/medicines/page.tsx`
- Update the empty state (`filteredMedicines.length === 0`) to show a **"Raise a Request"** button.
- Create a Modal/Dialog triggered by this button. The modal collects:
  - Medicine Name (pre-filled from search term).
  - Quantity needed.
  - Delivery Address (reusing selected location / user addresses).
  - Payment Method: Toggle for COD vs Prepaid option.
- Call `createMedicineRequest` on submit.

#### [NEW] `app/app/requests/page.tsx` (Optional but recommended)
- A simple page for the user to view their pending and accepted requests.

---

### Frontend Pharmacy App

#### [MODIFY] `app/pharmacy/layout.tsx`
- Add a new sidebar navigation item: "User Requests".

#### [NEW] `app/pharmacy/requests/page.tsx`
- A dashboard for pharmacies to see all `Pending` requests within a 10km radius of their location.
- Each request card will show:
  * Medicine Name & Quantity
  * Payment Method (Highlighting if it is "Prepaid" so the shop can see the UI change).
  * Distance to the user.
- Include an "Accept Request & Fulfill" action that prompts the pharmacy to enter the price they will charge. This resolves the request and potentially creates the user order to be delivered.

## Open Questions

- We currently restrict APIs via JWT roles. Are pharmacies the only ones allowed to call the `/nearby` requests endpoint?
- How is the price communicated transparently if the user pre-pays? Usually, for custom item requests, a price must be quoted first. For MVP, we can let the user mark it as "Prepaid" and assume a flat advance or assume the payment happens asynchronously when the pharmacy inputs the price.

## Verification Plan

### Automated/Manual Tests
- Log in as a User, search for a random unlisted string "XYZ-Med".
- Click "Raise Request", fill the form with Prepaid selected.
- Log in as a Pharmacy, navigate to Requests tab.
- Verify the "XYZ-Med" request appears with "Prepaid" badge.
- Click "Accept", enter price, and verify success state.
