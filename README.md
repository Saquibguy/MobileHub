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
```

## 6. Environment Variables

Copy the example files and fill them in:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

`server/.env` (minimum to run locally):
```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/mobilehub
JWT_SECRET=replace_with_a_long_random_string
CLIENT_URL=http://localhost:5173
```

`client/.env`:
```
VITE_API_URL=https://mobilehub-backend-swwo.onrender.com/
```

**Never commit your real `.env` files or secrets.** `.gitignore` already excludes them.

## 7. Seed the Database

Populates categories, demo users, sellers, ~16 products, a delivered order + review, and coupons:

```bash
npm run seed --prefix server
```

To wipe everything: `node server/seeds/seed.js --destroy`

## 8. Run in Development

Open two terminals:

```bash
# Terminal 1 — backend (http://localhost:5000)
npm run dev:server

# Terminal 2 — frontend (http://localhost:5173)
npm run dev:client
```

Visit **http://localhost:5173**. The Vite dev server proxies `/api` and `/uploads` requests to the backend, so no CORS config is needed in dev beyond what's already set.

## 9. Build for Production

```bash
npm run build:client        # outputs client/dist
cd server && npm start      # run the API with NODE_ENV=production
```

Serve `client/dist` from any static host (Netlify, Vercel, nginx, S3+CloudFront, etc.) and point `VITE_API_URL` at your deployed API's URL before building. Deploy the `server/` folder to any Node host (Render, Railway, Fly.io, a VPS, etc.) with your production `MONGODB_URI` and a strong `JWT_SECRET`.

## 10. PWA Testing

- Run `npm run build:client` then `npm run preview --prefix client` (PWA features are only active in a production build, not `vite dev`).
- Open the preview URL in Chrome, open DevTools → Application → Manifest/Service Workers to confirm registration.
- On mobile Chrome/Edge, you should see an "Install app" prompt; on iOS Safari, use Share → "Add to Home Screen".
- Turn off networking (DevTools → Network → Offline) and reload — you should see the offline fallback page for uncached routes, while previously visited product/category data served via the API remains available from cache.

## 11. Demo Accounts

Password for all: **`password123`**

| Role | Email |
|---|---|
| Admin | `admin@mobilehub.demo` |
| Customer | `customer@mobilehub.demo` |
| Seller (UrbanGear) | `seller@mobilehub.demo` |
| Seller (VoltPro) | `seller2@mobilehub.demo` |

**Change or remove these before any production deployment.**

## 12. API Overview

Base URL: `/api`

- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/forgot-password`, `POST /auth/reset-password`
- `GET /products`, `GET /products/:id`, `POST/PUT/DELETE /products/:id` (seller/admin)
- `GET /categories`, `POST/PUT/DELETE /categories/:id` (admin)
- `GET/POST/PUT/DELETE /cart` (customer)
- `GET/POST/DELETE /wishlist` (customer)
- `POST /orders`, `GET /orders`, `GET /orders/:id`, `PUT /orders/:id/status`, `POST /orders/:id/cancel`, `POST /orders/:id/return`
- `GET/POST /products/:id/reviews`, `PUT/DELETE /reviews/:id`
- `GET/POST/PUT/DELETE /coupons` (admin)
- `GET /admin/dashboard`, `/admin/users`, `/admin/sellers`, `/admin/orders`, `/admin/reviews`, `/admin/reports`
- `GET /seller/dashboard`, `/seller/products`, `/seller/orders`, `/seller/reports`, `PUT /seller/profile`

All protected routes require `Authorization: Bearer <JWT>`.

## 13. Security Notes

- Passwords are hashed with bcrypt and never returned by any endpoint.
- JWTs are signed with `JWT_SECRET` — use a long, random value in production and rotate it if ever leaked.
- Rate limiting, Helmet security headers, and mongo-sanitize are enabled by default.
- File uploads are restricted by MIME type and size (`MAX_UPLOAD_MB` in `.env`).
- The payment flow is an abstraction: `paymentMethod: "ONLINE"` currently mock-succeeds so the app runs without any payment provider configured. Swap the marked block in `server/controllers/orderController.js` for a real gateway (Razorpay, Stripe, etc.) when ready — no other code needs to change.
- Push notifications: the `Notification` model and admin/seller trigger points exist, but no push provider is wired up. Set `PUSH_PUBLIC_KEY`/`PUSH_PRIVATE_KEY` and integrate a library like `web-push` when needed.

## 14. What's Intentionally Simplified

This is a solid, working MVP, not a pixel-for-pixel implementation of every item in an extended spec. Notably:
- Product image upload UI exists on the backend (Multer) but the seller/admin "Add Product" form in the client is a stub — wiring the full multi-image upload form is a natural next step.
- Variant selection (color/storage) is modeled in the schema but not yet exposed in the product detail UI.
- Seller bank details are stored masked only, with no real payout integration.
- SEO metadata (Open Graph tags, sitemap.xml, structured data) is not yet generated — the app is client-rendered (SPA), so full SEO would benefit from server-side rendering or a static prerender step.

## 15. Troubleshooting

- **"Cannot find module 'express'"** → run `npm install` inside `server/`.
- **API calls fail with CORS errors** → confirm `CLIENT_URL` in `server/.env` matches your frontend's actual origin.
- **MongoDB connection refused** → confirm `mongod` is running locally, or that your Atlas connection string/IP allowlist is correct.
- **Login says "Invalid email or password" for demo accounts** → make sure you ran the seed script after connecting to the right database.
