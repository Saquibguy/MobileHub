# MobileHub

**"Everything Your Phone Needs"** — a full-stack, multi-vendor e-commerce platform for mobile accessories, built with React + Vite + Tailwind on the frontend and Node.js + Express + MongoDB on the backend, with a real REST API, JWT auth, role-based access control, and a PWA-ready client.

This is a genuinely working full-stack app: real database, real authentication, real cart/checkout/order flow. Run the two servers locally (see below) and it functions end-to-end.

---

## 1. Features

- **Customer storefront**: browse/search/filter/sort products, product detail pages with reviews, cart, wishlist, 4-step checkout (address → delivery → payment → confirmation), order history with cancel/return, order tracking timeline.
- **Seller panel**: dashboard (revenue, orders, low stock), product listing (own products only), order fulfillment status updates, sales reports.
- **Admin panel**: dashboard (users, sellers, products, orders, revenue), user block/unblock, seller approval workflow, category management, coupon management, review moderation, order status management, reports.
- **Auth**: JWT-based, bcrypt password hashing, role-based route protection (CUSTOMER / SELLER / ADMIN), forgot/reset password flow.
- **PWA**: web app manifest, service worker (via `vite-plugin-pwa`), offline fallback page, cache-first for static assets, network-first for product/category API data, installable on mobile/desktop.
- **Security**: helmet, CORS, rate limiting, mongo-sanitize (NoSQL injection protection), input validation, passwords/tokens never returned in API responses, upload MIME/size validation.

## 2. Technology Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Axios, React Hook Form, lucide-react, vite-plugin-pwa |
| Backend | Node.js, Express, Mongoose, JWT, bcryptjs, Multer, Helmet, express-rate-limit |
| Database | MongoDB |

## 3. Folder Structure

```
mobilehub/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Navbar, ProductCard, ProtectedRoute, etc.
│   │   ├── pages/          # Home, ProductList, Cart, Checkout, Admin/, Seller/ ...
│   │   ├── context/        # AuthContext, CartContext
│   │   ├── services/       # axios API layer
│   │   ├── App.jsx / main.jsx
│   ├── public/
│   │   ├── icons/, offline.html
│   └── vite.config.js      # includes PWA plugin config
│
├── server/                 # Express backend
│   ├── models/             # Mongoose schemas
│   ├── controllers/        # business logic
│   ├── routes/             # REST endpoints
│   ├── middleware/         # auth, upload, error handling
│   ├── seeds/seed.js        # demo data
│   ├── app.js / server.js
│
├── .env.example (per-package)
└── README.md (this file)
```

## 4. Prerequisites

- Node.js 18+
- A MongoDB instance — either:
  - Local: install MongoDB Community Server and run `mongod`, **or**
  - Free cloud: create a free cluster at MongoDB Atlas and copy its connection string.

## 5. Installation

```bash
# from the mobilehub/ root
npm run install:all
# or manually:
cd server && npm install
cd ../client && npm install
