# MERN Marketplace Platform

## Overview
A full-featured, modern, multi-vendor marketplace platform supporting B2B, B2C, and service-based commerce (like Alibaba + Fiverr). Built with the MERN stack, it supports products, services, service requests, real-time messaging, reviews, analytics, and robust admin moderation.

---

## Features
- Multi-role: Buyer, Seller, Service Provider, Admin
- Product & Service Marketplace (physical, digital, gigs)
- Service Requests (job posts, applications)
- Real-time Messaging (buyers, sellers, providers)
- Reviews & Ratings (products, services, users)
- Advanced Admin Dashboard (analytics, moderation, CRUD)
- Modern, responsive UI (Material UI, Framer Motion, Chart.js)
- Role-based access, KYC, and security
- Category & Brand management
- Mobile-friendly, error boundaries, and feedback

---

## Architecture
- **Frontend:** React, Redux Toolkit, Material UI, Framer Motion, Chart.js
- **Backend:** Node.js, Express, MongoDB (Mongoose), RESTful API
- **State Management:** Redux for all major flows
- **Deployment:** Vercel (frontend/backend), Docker-ready

---

## User Flows
### Registration & Authentication
- Sign up as buyer, seller, provider, or admin
- Email/password, social login, KYC onboarding

### Buyer
- Browse/search/filter products & services by category/brand
- Add to cart, checkout, track orders
- Post/manage service requests (job posts)
- Manage wishlist, leave reviews, message sellers/providers

### Seller
- Multi-step onboarding (profile, KYC, store setup)
- Add/edit/suspend/delete products (B2B pricing, digital/physical)
- Manage orders, analytics, and reviews
- Dashboard: products, orders, messages, analytics

### Service Provider
- Onboard with profile, skills, portfolio, KYC
- Add/edit/suspend/delete services (gigs)
- Browse/apply to service requests
- Manage service orders, milestones, messaging

### Admin
- Analytics dashboard: user growth, sales, top products/services, flagged items
- Manage users, products, services, orders, requests, reviews (edit, suspend, delete)
- Moderate flagged/suspended items

---

## Product Categories (Sample)
- Groceries, Clothing, Electronics, Home appliances, Fresh Produce, Livestock, Farming tools, Fertilizers, Jewelery, Textile, Pottery, Cultural Artifacts, Local Food vendors, Bakeries, Beverages, Womens-jewellery, Construction & Building Material, Education & Learning, Automotive spares
- **Plus:** Tourism & Travel, Mining & Minerals, Petroleum & Energy, Carbon Credits, Charity, Healthcare, IT, Logistics, Real Estate, Environmental Services, and more

---

## Setup & Installation
### Prerequisites
- Node.js (v16+), npm
- MongoDB (local or Atlas)
- Vercel CLI (for deployment)

### 1. Clone the Repository
```sh
git clone https://github.com/your-org/mern-ecommerce.git
cd mern-ecommerce
```

### 2. Install Dependencies
```sh
cd backend && npm install
cd ../frontend && npm install
```

### 3. Environment Variables
- Copy `.env.example` to `.env` in both `backend/` and `frontend/`.
- Set MongoDB URI, JWT secret, and any API keys as needed.

### 4. Seed Database (Categories, Brands, etc)
```sh
cd backend
node seed/seed.js
```

### 5. Run Locally
#### Backend
```sh
cd backend
npm run dev
```
#### Frontend
```sh
cd frontend
npm start
```

App will be available at `http://localhost:3000` (frontend) and `http://localhost:5000` (backend).

---

## API Overview
- RESTful endpoints for all entities (users, products, services, orders, reviews, messages, service requests)
- JWT authentication, role-based access
- See `/backend/routes/` for all available endpoints

---

## Testing
- Use the provided shell script (`test-app.sh`) to run backend and frontend tests
- Manual QA: Register as different roles, test all flows, admin moderation, analytics

---

## Deployment
- See `DEPLOYMENT.md` for detailed Vercel deployment tutorial
- Vercel ready (frontend and backend as separate projects or monorepo)

---

## Contributing
- Fork, branch, and PR workflow
- Please open issues for bugs/feature requests

---

## License
MIT
