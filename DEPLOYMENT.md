# GiftCart — Hostinger Web Apps Deployment Guide

This package is a **single self-contained Node.js application**: one Express server that serves
both the REST API and the built React frontend, so Hostinger's Web App platform needs only
**one app / one port**.

## What's inside

```
giftcart-prod/
├── package.json          # npm workspaces (server + client) + build/start/seed scripts
├── package-lock.json
├── server/               # Express API (config, controllers, models, routes, middleware, seed)
│   └── .env.example      # production env template
└── client/               # React (Vite) source + prebuilt dist/
    └── dist/             # built frontend (served by Express in production)
```

## Prerequisites (IMPORTANT)

1. **MongoDB** — Hostinger Web Apps does **not** include MongoDB. You need an external instance.
   The app **requires a MongoDB replica set** because orders deduct stock inside a transaction.
   - **Recommended:** MongoDB Atlas free tier (M0). It is a replica set and supports transactions.
   - Standalone `mongod` / a single-node "MongoDB Add-on" **will not work** for checkout.
   - Create a database (e.g. `giftcart`) and grab the connection string.

2. **Node.js** — select **Node 20 LTS** (or 18+) in the Hostinger Web App settings.

## Steps on Hostinger

### 1. Create the Web App
- In hPanel → **Web Apps** → **Add** (Node.js).
- Pick **Node 20 LTS**.

### 2. Upload this package
- Use the **Deployment / Upload ZIP** flow, or connect a Git repo containing these files.
- The ZIP must be extracted so that `package.json` sits at the **app root**.

### 3. Environment variables
Add these under **Web App → Settings → Environment Variables**:

| Variable        | Example / notes                                                            |
|-----------------|----------------------------------------------------------------------------|
| `NODE_ENV`      | `production`                                                               |
| `MONGO_URI`     | `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/giftcart`               |
| `JWT_SECRET`    | long random string (see below)                                             |
| `JWT_EXPIRES_IN`| `7d`                                                                       |
| `ADMIN_PASSWORD`| a strong password for the admin login                                      |
| `CLIENT_URL`    | `https://yourdomain.com` (your deployed URL)                               |
| `R2_ACCOUNT_ID` | Cloudflare account ID (for product image storage)                          |
| `R2_ACCESS_KEY_ID` | R2 S3 API access key ID                                                 |
| `R2_SECRET_ACCESS_KEY` | R2 S3 API secret access key                                         |
| `R2_BUCKET`     | R2 bucket name, e.g. `nicecards-images`                                    |
| `R2_PUBLIC_URL` | Public bucket URL, e.g. `https://pub-xxxx.r2.dev`                          |

Generate a JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 4. Build & start commands
In the Web App settings set:

- **Install command:** `npm install`
- **Build command:** `npm run build`
- **Start command:** `npm start`

`npm start` runs `NODE_ENV=production node server/index.js`, which:
- connects to MongoDB,
- serves the API on `/api`,
- uploads product images to Cloudflare R2 and serves the stored URLs,
- serves the built frontend at `/` with an SPA fallback (client-side routing works).

> PORT is injected by Hostinger automatically; the app honours `process.env.PORT`.

### 5. Seed the database (first run only)
Run the seed once so the store has categories, products, a demo user and sample orders:

```bash
npm run seed
```

You can do this from Hostinger's **Terminal** feature after deployment. The seed is idempotent.

> Note: this DELETES all existing data in the `giftcart` DB and re-creates it. Run it only
> once on an empty (or disposable) database.

### 6. Access
- Storefront: `https://yourdomain.com`
- Admin: `https://yourdomain.com/admin` — password = `ADMIN_PASSWORD` env value.

## Product image storage (Cloudflare R2)

Product images are uploaded to a **Cloudflare R2** bucket (free tier: 10 GB storage
and free egress) and only the public image URL is saved in MongoDB. This keeps the
app stateless and durable across restarts/redeploys.

Setup:

1. Create a Cloudflare account and an **R2 bucket**, e.g. `nicecards-images`.
2. Enable **Public access** for the bucket (an `r2.dev` subdomain or a custom domain).
3. Create an **R2 API token** with Object Read & Write permission for the bucket.
4. Set the `R2_*` environment variables listed above. `R2_PUBLIC_URL` is the public
   bucket URL shown in the R2 dashboard (no trailing slash).

If the `R2_*` variables are not set, the server automatically falls back to storing
base64 data URIs in MongoDB, so the demo store still works without any configuration.
The bundled seed images are regenerated each time you re-run the seed and are uploaded
to R2 when configured.

## Things you MUST change from the repo defaults

| Item                  | Current default            | Required action                                                    |
|-----------------------|----------------------------|--------------------------------------------------------------------|
| `JWT_SECRET`          | `giftcart_dev_secret`      | Set a strong random secret (env).                                  |
| `ADMIN_PASSWORD`      | `Admin123`                 | Set a strong admin password (env).                                 |
| `MONGO_URI`           | localhost                  | Point at Atlas / external MongoDB with a replica set.              |
| `CLIENT_URL`          | `http://localhost:5173`    | Set to your deployed domain.                                       |
| Payment gateway       | none (checkout w/o payment)| Add Stripe/PayPal/etc. if you want real payments (not included).   |

## Common issues

- **Checkout fails** → your MongoDB is not a replica set. Use Atlas M0 or add `--replSet rs0`.
- **Blank page / 404 on refresh** → ensure `npm run build` ran and `client/dist` exists.
- **Images broken after redeploy** → set the `R2_*` env vars (see above); without them images fall back to MongoDB.
- **Port errors** → do NOT hardcode `PORT`; let Hostinger inject it.

## Local sanity check

```bash
npm install
npm run build
npm start   # API + frontend on http://localhost:5000 (or $PORT)
```
