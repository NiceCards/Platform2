# Nice Cards — Netlify + Render + MongoDB Atlas Deployment Guide

This app is a full-stack web application (React + Vite frontend, Express + MongoDB backend).
This guide covers hosting it with **free tiers** only, using **split hosting**:

- **Frontend** on Netlify (static hosting)
- **Backend API** on Render (Node web service)
- **Database** on MongoDB Atlas (free M0, a replica set)
- **Product images** on Cloudflare R2 (free tier object storage)

Product images are uploaded to a **Cloudflare R2** bucket and served from its public
URL, so MongoDB only stores the image URL. This keeps documents small and lets the
browser cache images aggressively for fast rendering. When R2 is not configured the
server falls back to storing base64 data URIs in MongoDB, so local development works
without any cloud account.

---

## Architecture summary

```
Browser
  |-> Netlify (React storefront, client/dist)
  |       `-> VITE_API_URL -> Render Express API (/api)
  |                              |-> MongoDB Atlas (data)
  |                              `-> Cloudflare R2 (product images)
```

- The frontend calls the backend via an absolute `VITE_API_URL` (no proxy needed).
- `CLIENT_URL` on the backend enables CORS for the Netlify domain.
- Checkout uses MongoDB transactions, which is why the Atlas M0 replica set is required.

---

## Prerequisites

- A Git repository containing this project (for auto-deploy).
- Accounts at mongodb.com, render.com, and netlify.com.

---

## Step 1 — Create the MongoDB Atlas cluster

1. Sign up at https://www.mongodb.com/ and create a free **M0 cluster**.
2. Under **Database Access**, add a database user with a strong password.
3. Under **Network Access**, allow `0.0.0.0/0` (or your server IPs).
4. Click **Connect → Drivers** and copy the connection string, e.g.:

```
mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/nicecards
```

Atlas M0 is a replica set, so the transactional checkout works out of the box.

---

## Step 2 — Deploy the backend to Render

1. At https://render.com/, create a **New → Web Service** and connect the Git repository.
2. Configure the service:

| Setting            | Value                              |
|--------------------|------------------------------------|
| Root Directory     | `server`                           |
| Build Command      | `npm install`                      |
| Start Command      | `node index.js`                    |
| Instance Type      | Free                               |

3. Add the environment variables:

| Variable        | Value                                                  |
|-----------------|--------------------------------------------------------|
| `NODE_ENV`      | `production`                                           |
| `MONGO_URI`     | Your Atlas connection string from Step 1               |
| `JWT_SECRET`    | A long random string                                   |
| `ADMIN_PASSWORD`| The password for the admin panel                       |
| `CLIENT_URL`    | Your Netlify URL (set in Step 4; `*` works initially)  |
| `R2_ACCOUNT_ID` | Your Cloudflare account ID                             |
| `R2_ACCESS_KEY_ID` | R2 S3 API access key ID                             |
| `R2_SECRET_ACCESS_KEY` | R2 S3 API secret access key                     |
| `R2_BUCKET`     | R2 bucket name, e.g. `nicecards-images`                |
| `R2_PUBLIC_URL` | Public bucket URL, e.g. `https://pub-xxxx.r2.dev`      |

> Cloudflare R2 requires an account (the free tier includes 10 GB storage and free
> egress). Create a bucket, enable **Public access** (an `r2.dev` subdomain or a
> custom domain), then create an **R2 API token** with Object Read & Write for that
> bucket to obtain the S3 credentials above. Set `R2_PUBLIC_URL` to the public
> bucket URL shown in the dashboard. If these variables are omitted, images fall
> back to base64 in MongoDB.

Generate a JWT secret:

```bash
openssl rand -hex 32
```

4. Click **Deploy** and wait for the service to go live.
5. Copy the backend URL, e.g. `https://nicecards-api.onrender.com`.

---

## Step 3 — Seed the database (run once)

In Render, open your service and use the **Shell** tab, then run:

```bash
npm run seed
```

Or seed locally with your Atlas string:

```bash
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/nicecards npm run seed
```

This creates 8 categories, 24 products (images uploaded to Cloudflare R2 when
configured, otherwise embedded as base64 in MongoDB), a demo user, and 32 sample
orders. It is idempotent and safe to re-run.

Demo user: `demo@nicecards.com` / `demo123`

---

## Step 4 — Deploy the frontend to Netlify

1. At https://www.netlify.com/, choose **Add new site → Import an existing project**
   and connect the same Git repository.
2. The root `netlify.toml` is auto-detected:

```toml
[build]
  command = "npm run build"
  publish = "client/dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

3. Add the environment variable in **Site settings → Environment variables**:

| Variable        | Value                                                  |
|-----------------|--------------------------------------------------------|
| `VITE_API_URL`  | Your Render backend URL, e.g. `https://nicecards-api.onrender.com` |

4. Click **Deploy**. Copy the Netlify URL, e.g. `https://nice-cards.netlify.app`.

---

## Step 5 — Wire up CORS

1. On Render, update `CLIENT_URL` to your Netlify URL:

```
CLIENT_URL=https://nice-cards.netlify.app
```

Multiple origins are supported (comma-separated), e.g.:

```
CLIENT_URL=https://nice-cards.netlify.app,http://localhost:5173
```

2. **Redeploy** the Render service so it picks up the new variable.

---

## Step 6 — Verify

- Storefront: `https://nice-cards.netlify.app`
- Product images load from Cloudflare R2 (`R2_PUBLIC_URL`) when configured.
- Admin panel: `https://nice-cards.netlify.app/admin` with your `ADMIN_PASSWORD`.
- Admin image uploads are stored in Cloudflare R2 (or MongoDB as a fallback) and survive server restarts.
- Demo customer login: `demo@nicecards.com` / `demo123`.
- Place a test order to confirm the transactional checkout works on Atlas M0.

---

## Notes and limitations

- **Image storage**: product images are uploaded to Cloudflare R2 and only their
  public URL is stored in MongoDB. When R2 is not configured, the server falls back
  to base64 data URIs in MongoDB. Uploaded images are limited to **2MB each** and a
  maximum of **2 per product** (enforced by the server).
- **Cloudflare R2** free tier includes 10 GB storage, 1M Class A and 10M Class B
  operations per month, and zero egress fees.
- **Free tier caveats**: Render free instances sleep after ~15 minutes of idle and
  cold-start on the next request; Netlify free builds are shared. MongoDB data is unaffected.
- **Redeploys**: pushing to the Git repo auto-deploys on both Render and Netlify.

---

## Development without env vars

When `VITE_API_URL` is empty, the frontend uses relative `/api` paths,
which the Vite dev server proxies to `http://localhost:5000` (see `client/vite.config.js`).

```bash
npm install
npm run dev
```

The backend reads `server/.env` (see `server/.env.example`).
