# 🏥 SwasthRoute

**SwasthRoute** is a premium, full-stack emergency medicine discovery and delivery platform. It bridges the gap between patients in urgent need and local pharmacies, leveraging real-time geospatial technology and a secure, verified authentication infrastructure.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-leaf?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)

---

## ✨ Core Platform Features

SwasthRoute is a complete medical logistics, emergency dispatch, and pharmacy ERP ecosystem. Below is the detailed inventory of features:

### 🍱 Multi-Portal Access Control
Tailored and role-protected environments across all stakeholders:
*   **Patient (User) Dashboard**: Discover nearby open pharmacies, search medicine catalogs, place emergency checkouts, track live orders, and manage account details.
*   **Pharmacy ERP Portal**: Complete operational dashboard with stock listings, batch procurement logs, billing engines, suppliers index, invoice tracking, and revenue analytics.
*   **Ambulance/Rider Console**: Dispatch standby modes, live order route maps, client contact buttons, and transit state togglers.
*   **Administrator Control Center**: Global site metrics overview, active user management, registered pharmacy verification checks, and system parameters configuration.

### 💻 Desktop cashier Client (`SwasthRoute.exe`)
*   Located in the `/desktop` folder, a wrapper configuration allows pharmacies to compile and deploy SwasthRoute as a native Windows desktop client (`.exe`) directly on cashier terminals and billing hardware for rapid access.

### 💼 Pharmacy ERP & Billing Engine
*   **In-App Barcode & Rx Scanner**: Seamless billing invoice generation using an integrated digital barcode reader or optical prescription scanner.
*   **Medicine Expiry Tracker**: Live visual flags and warnings highlighting stock batches nearing expiration.
*   **Procurement Logs**: Log batch numbers, manufacturing dates, track stock thresholds, and register suppliers.
*   **Subscription & Invoice Tracker**: Auto-generation of professional GST-compliant invoices and subscription plans.

### 💳 Payment Operations & PayPal Integration
*   **PayPal Gateway Integration**: High-fidelity payment processing via the PayPal SDK. Supports order creation and capturing endpoints.
*   **Zero-Credentials Sandbox Simulator**: Includes a built-in PayPal login and checkout simulator modal inside the patient portal to enable flawless testing without credentials.
*   **Total Payment Calculation**:
    *   **Distance-Based Surcharges**: Real-time pickup-to-destination distance calculated via the Haversine formula.
    *   **Ambulance Care Tier pricing**: Standard base rates applied dynamically (₹500 for Basic Life Support/BLS, ₹1,500 for Advanced/ALS, ₹2,500 for ICU/Cardiac unit) plus a distance surcharge of ₹50/km.
    *   **Emergency Bypassing**: All high-priority SOS emergency medical checkouts default to Cash on Delivery (COD) to bypass card processing gates during critical situations.

### 🚨 Emergency Operations Suite
*   **One-Tap "SOS Emergency" Medicine Checkout**: Skip cart adding entirely. Patients upload a prescription photo or record an audio note of their symptoms. The request is broadcasted to the nearest 3 active pharmacies for instant quote bidding.
*   **Ambulance dispatch booking**: Request BLS, ALS, or ICU ambulances with live coordinate locking and destination trauma hospital routing.
*   **Mapbox GPS Tracking**: Real-time visual mapping tracking the driver's progress directly to the patient's coordinates.

### 🧠 AI First-Aid Companion (Google Gemini)
*   **Symptom-Aware Guidance**: The backend queries the Google Gemini Flash API (`gemini-2.5-flash`) with the emergency description to generate 4 targeted first-aid bystander instructions.
*   **Interactive Checklist**: Displays checkboxes inside the tracking dialog so bystanders can check off actions in real-time.

### 🚚 Rider Delivery & Dispatch Logistics
*   **Active Matching**: Geospatial driver allocation queries matching the closest available rider within a 15km radius.
*   **Transit State Transitions**: Riders update transit states dynamically (`accepted` -> `en_route` -> `picked_up` -> `completed`), updating patient screens in real-time.
*   **GPS Fallback Mechanism**: If browser location permission is denied, the system automatically falls back to Mumbai coordinates (`[19.0760, 72.8777]`), keeping the seeded test nodes completely searchable.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Shadcn UI, Framer Motion.
- **Backend**: Express.js, Node.js.
- **Database**: MongoDB (Geospatial & Search Indexes).
- **Services**: Brevo (Email/SMTP), Mapbox (Location Mapping).
- **Security**: JWT (Stateless Auth), Bcrypt (Hashing), RBAC.

---

## 📂 Project Architecture

```text
├── api/                  # Express Backend
│   ├── models/           # Mongoose Schemas (User, Pharmacy, Order)
│   ├── routes/           # API Endpoints (Auth, Orders, Tracking)
│   └── utils/            # Utilities (Email, JWT)
├── app/                  # Next.js Frontend (App Router)
│   ├── admin/            # Admin Restricted Portal
│   ├── auth/             # Unified Login/Signup/Verify Flow
│   ├── pharmacy/         # Pharmacy Dashboard Portal
│   └── (user)/           # Patient-facing pharmacy discovery
├── components/           # Shared UI Library
├── lib/                  # Frontend Logic (ApiClient, Hooks)
└── public/               # Static Assets
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Brevo API Key (for verification emails)

### 2. Installation
```bash
# Frontend
npm install

# Backend
cd api && npm install
```

### 3. Environment Configuration
Create a `.env` in the root and in the `/api` directory:

**Root `.env`**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
FRONTEND_URL=http://localhost:3000
```

**API `.env`**
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
BREVO_API_KEY=your_brevo_key
SENDER_EMAIL=your_verified_sender_email
```

### 4. Run Locally
```bash
# Terminal 1: Backend
cd api && npm run dev

# Terminal 2: Frontend
npm run dev
```

---

## 📝 Design & System Overview
For a deep dive into the technical architecture, design decisions, and data flow, see the [System Design Document](file:///d:/Mern/Swasth/system_design.md).

## 📄 License
This project is licensed under the [MIT License](LICENSE).

---
*Built with ❤️ for health access.*