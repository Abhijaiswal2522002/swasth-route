# 🏥 SwasthRoute

**SwasthRoute** is a premium, full-stack emergency medicine discovery and delivery platform. It bridges the gap between patients in urgent need and local pharmacies, leveraging real-time geospatial technology and a secure, verified authentication infrastructure.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-leaf?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)

---

## 🌟 Key Pillars

### 📍 Geospatial Intelligence
Uses MongoDB `2dsphere` indexing to perform lightning-fast coordinate-based searches. Patients find the nearest pharmacies within seconds during critical emergencies.

### 🛡️ Hardened Security
Features a **"Verify-Before-Save"** registration flow. Accounts are not persisted to the database until the email address is confirmed via a secure JWT-linked token, preventing database bloat and unauthorized bot registrations.

### 🍱 Multi-Portal Ecosystem
A unified experience with dedicated, role-protected environments:
- **Patient Portal**: Search, discover, and order.
- **Pharmacy Dashboard**: Manage inventory, fulfill orders, and track earnings.
- **Admin Control Center**: Approve pharmacies and monitor platform health.

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