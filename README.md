# Organic Fresh — Online Vegetable Store

## Phase 5: Razorpay, EmailJS, admin dashboard, deployment ✅

What's new in this phase:
- **Razorpay payments** — checking out with "Card / UPI / Netbanking"
  creates a Razorpay order for the exact server-computed total, opens the
  real Razorpay checkout modal, and verifies the HMAC signature server-side
  before marking the order paid. Cancelled/failed payments leave the order
  recoverable — a **"Pay Now"** button appears on `/orders` to retry.
- **EmailJS contact form** — `/contact` sends real emails via EmailJS, no
  backend mail server needed. `/about` was also added (the Navbar already
  linked to both).
- **Cloudinary image uploads** — the admin product form uploads directly
  from the browser to Cloudinary (unsigned upload preset), so there's no
  multipart backend route to maintain.
- **Admin dashboard** at `/admin` (role-gated via `AdminRoute`):
  - **Dashboard** — total sales/orders/products/users, a 7-day sales chart
  - **Products** — add/edit/delete, with the Cloudinary photo upload
  - **Orders** — every order, with an inline status dropdown
    (placed → confirmed → packed → out for delivery → delivered)
  - **Users** — list all accounts, promote/demote admin access
  - Backed by new `GET /api/admin/stats`, `GET /api/admin/users`,
    `PUT /api/admin/users/:id/role`, and `PUT /api/orders/:id/status`
- **Deployment** — `DEPLOYMENT.md` walks through MongoDB Atlas + Render
  (API) + Vercel (client); `client/vercel.json` handles SPA routing and
  `server/render.yaml` is a ready-made Render blueprint.
- `npm run seed:admin` creates a default admin login
  (`admin@organicfresh.test` / `admin123456`) for testing the dashboard —
  change the password after first login.

## Phase 4: Auth, Node/Express backend, MongoDB ✅

What's new in this phase:
- **`server/`** — a full Node.js + Express API:
  - **MongoDB (Mongoose)** models for `User`, `Product`, `Order`
  - **JWT authentication** — register/login issue a signed token; `protect`
    middleware guards private routes; `adminOnly` middleware reserved for
    the Phase 5 admin dashboard
  - **Product API** — `GET /api/products` (filter by category/search,
    paginated), `GET /api/products/:id`; admin create/update/delete routes
    are in place, ready for the Phase 5 admin UI
  - **Order API** — `POST /api/orders` re-prices every item **server-side**
    from the database (never trusts client-sent totals), `GET
    /api/orders/mine` for order history, `GET /api/orders/:id`
  - **`seed/seedProducts.js`** — loads the same 32-item catalog the client
    already uses into MongoDB, so the two stay in sync (`npm run seed`)
  - Centralized error handling (`notFound` + `errorHandler`), CORS locked to
    the client origin, Morgan request logging in dev
- **Client-side auth**:
  - **`AuthContext`** — persists the JWT + user in `localStorage`, restores
    the session on reload, exposes `login`, `register`, `logout`
  - **`/login`** and **`/signup`** pages
  - **`ProtectedRoute`** — redirects to `/login` and returns you to where
    you were headed after signing in
  - **`/orders`** (protected) — real order history pulled from the API
  - Navbar now shows "Hi, {name}" + Log out when signed in, Sign In
    otherwise
- **Checkout is now real**: placing an order calls `POST /api/orders`,
  which validates the user's session, re-prices items from MongoDB, and
  saves the order. Guests are sent to `/login` before they can check out.

Razorpay signature verification, Cloudinary image upload, and the admin
dashboard are still ahead — the order/product APIs are already shaped for
them so Phase 5 mostly wires up the existing endpoints.

## Phase 3: Cart, wishlist, checkout ✅

What's new in this phase:
- **`CartContext`** — global cart state (add/remove/update qty), a computed
  subtotal/delivery fee/total (free delivery over ₹300), and drawer
  open/close state
- **`WishlistContext`** — global wishlist state with toggle
- **Cart drawer** — slides in from the right on "Add +" or the basket icon;
  shows line items with qty controls, a free-delivery progress nudge, and a
  subtotal/total breakdown
- **`/wishlist`** — saved items with add-to-cart and remove actions
- **`/checkout`** — delivery details form, delivery slot picker, payment
  method choice (Razorpay / COD placeholder), live order summary
- **`/order-confirmation`** — order recap with a generated order number
- Navbar basket and heart icons now show live counts and are fully wired up
- "Add +" and the heart icon on every product card now actually add to
  cart / wishlist, everywhere (home, shop, product details)

Checkout **simulates** placing the order (no real payment yet) — real
Razorpay verification and persisted order history land in Phase 4/5.

## Phase 2: Products page, search, filters, product details ✅

What's new in this phase:
- **React Router** wired up (`BrowserRouter`) with a shared `MainLayout`
  (Navbar + Footer persist across pages)
- **Catalog expanded to 32 items** across Leafy Greens, Root Veg, Vegetable
  Fruits, and Herbs (`src/data/vegetables.js`)
- **`/shop`** — full catalog page with:
  - live search by name
  - category filter chips (synced to the URL, e.g. `/shop?category=root`)
  - sort by popularity, price, or rating
  - empty-state message when a search has no matches
- **`/product/:id`** — product details page with quantity selector, live
  total, add-to-cart/wishlist buttons, and a "You might also like" related
  products row
- Homepage category tiles and "View all" now route into `/shop` with the
  right filter pre-applied
- Extracted a shared `ProductCard` component used by both the homepage and
  the shop page

Cart, wishlist, and checkout are **not functional yet** — the buttons are in
place visually but wired up in Phase 3.

## Phase 1: React setup + Homepage ✅

What's included in this phase:
- Vite + React 19 project scaffold (`client/`)
- Tailwind CSS with a custom brand theme (forest/leaf/sprout/cream/turmeric)
- Navbar (with mobile menu)
- Hero section with animated floating produce and search bar
- **Mandi Ticker** — a scrolling "wholesale market rate" band, styled like a
  real Indian vegetable mandi price board. This is the homepage's signature
  visual element.
- Category strip (Leafy, Root, Fruits, Herbs)
- Featured vegetables grid with badges, ratings, and Add-to-cart buttons
- Footer

Product images are emoji placeholders for now — swap them for real photos
once Cloudinary upload is wired up in a later phase.

## How to run it

**1. Backend**

```bash
cd server
npm install
cp .env.example .env   # fill in your MongoDB Atlas URI + a JWT secret
npm run seed            # loads the 32-item catalog into MongoDB
npm run dev             # starts the API on http://localhost:5000
```

**2. Frontend**

```bash
cd client
npm install
cp .env.example .env    # defaults to http://localhost:5000/api, adjust if needed
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`). Sign
up for an account, add items to your cart, and check out — it'll create a
real order in MongoDB and show up under "Your orders".

## All five phases are complete 🎉

See `DEPLOYMENT.md` for how to put this live. Natural next steps beyond the
original plan: switching `/shop` to fetch from the live Product API instead
of the local `data/vegetables.js` catalog (so admin edits show up
immediately), delivery-slot capacity limits, coupon codes, and push
notifications for order status changes.

## Folder structure

```
organic-fresh-store/
├── DEPLOYMENT.md
├── client/
│   ├── vercel.json
│   └── src/
│       ├── components/   (Navbar, Hero, ProductCard, CartDrawer, AdminRoute, ...)
│       ├── context/      (CartContext, WishlistContext, AuthContext)
│       ├── layouts/      (MainLayout, AdminLayout)
│       ├── pages/        (Home, Products, ProductDetails, Checkout, Login, Signup,
│       │                  Orders, About, Contact, admin/Dashboard, admin/AdminProducts,
│       │                  admin/AdminOrders, admin/AdminUsers, ...)
│       ├── services/     (api.js, authService.js, orderService.js, paymentService.js,
│       │                  adminService.js, uploadService.js)
│       └── data/         (vegetables.js — the 32-item catalog shown in the shop)
└── server/
    ├── render.yaml
    ├── config/            (db.js, razorpay.js)
    ├── models/            (User, Product, Order)
    ├── middleware/        (auth.js, errorHandler.js)
    ├── controllers/       (authController, productController, orderController,
    │                       paymentController, adminController)
    ├── routes/            (authRoutes, productRoutes, orderRoutes, adminRoutes)
    ├── seed/              (seedProducts.js, seedAdmin.js)
    └── server.js
```
