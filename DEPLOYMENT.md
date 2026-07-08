# Deploying Organic Fresh

This app has three moving pieces to deploy: the **database** (MongoDB
Atlas), the **API** (Render), and the **frontend** (Vercel). None of these
need a paid plan to get a working live demo.

---

## 1. MongoDB Atlas (database)

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Database Access → add a user with a username/password.
3. Network Access → add `0.0.0.0/0` (allow from anywhere) for simplicity,
   or Render's static IP if you want to lock it down later.
4. Get your connection string from **Connect → Drivers** — it looks like
   `mongodb+srv://<user>:<password>@cluster0.mongodb.net/organic-fresh`.

## 2. Third-party accounts

You'll want these before deploying the API, since it needs their keys:

- **Razorpay** — [dashboard.razorpay.com](https://dashboard.razorpay.com),
  Settings → API Keys → generate a **Test Mode** key id/secret to start.
- **Cloudinary** — [cloudinary.com](https://cloudinary.com) console →
  Settings → Upload → add an **unsigned** upload preset (used for admin
  product photo uploads directly from the browser).
- **EmailJS** — [emailjs.com](https://www.emailjs.com) → create an email
  service + a template with `from_name`, `from_email`, `message` variables,
  then grab your Service ID, Template ID, and Public Key.

## 3. Deploy the API (Render)

1. Push this repo to GitHub.
2. On [render.com](https://render.com): New → Blueprint → point at your repo
   (it will pick up `server/render.yaml`), **or** New → Web Service manually
   with:
   - Root directory: `server`
   - Build command: `npm install`
   - Start command: `npm start`
3. Add environment variables (from `server/.env.example`):
   `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL` (set this once
   you know your Vercel URL, e.g. `https://organic-fresh.vercel.app`),
   `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`.
4. Once deployed, seed the database once (Render → Shell tab, or run
   locally against the same `MONGO_URI`):
   ```bash
   npm run seed        # loads the 32-item vegetable catalog
   npm run seed:admin  # creates admin@organicfresh.test / admin123456
   ```
   **Change the seeded admin password** after your first login.

## 4. Deploy the frontend (Vercel)

1. On [vercel.com](https://vercel.com): New Project → import the repo.
2. Root directory: `client`. Framework preset: Vite.
3. Environment variables (from `client/.env.example`):
   - `VITE_API_URL` → your Render URL + `/api`, e.g.
     `https://organic-fresh-api.onrender.com/api`
   - `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`
   - `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`
   - `VITE_RAZORPAY_KEY_ID` (same key id as the server, never the secret)
4. Deploy. `client/vercel.json` already handles SPA routing so refreshing
   `/shop` or `/product/12` won't 404.
5. Go back to Render and update `CLIENT_URL` to your live Vercel URL so
   CORS allows it, then redeploy the API.

## 5. Smoke test

- Sign up a new account, browse `/shop`, add items, and check out with
  **Cash on Delivery** — confirms auth + orders end-to-end.
- Check out again with **Razorpay** using their test card
  `4111 1111 1111 1111` (any future expiry, any CVV) — confirms the payment
  flow and signature verification.
- Log in with the seeded admin account and visit `/admin` — confirms the
  dashboard, product CRUD (try uploading an image), and order status
  updates.
- Submit the `/contact` form — confirms EmailJS is wired up.

## Notes

- Render's free tier spins down after inactivity, so the first request
  after a while may take 30–60 seconds to wake up.
- Keep Razorpay and Cloudinary in **test mode** until you're ready to
  accept real payments — switching to live keys is a settings change, not
  a code change.
