# ShopWave — Vercel + MongoDB Atlas Deployment Guide (Free)

## Overview
- **Frontend** → Vercel (React static build, free forever)
- **Backend** → Vercel Serverless Functions (Node.js, free tier)
- **Database** → MongoDB Atlas (512MB free, no credit card needed)

---

## Step 1 — Create MongoDB Atlas Database (Free)

1. Go to https://www.mongodb.com/atlas and click **Try Free**
2. Create an account (no credit card required)
3. Choose **Free tier** (M0 Sandbox — 512MB)
4. Pick any cloud provider and region closest to your users
5. Click **Create Cluster** (takes ~2 minutes)

### Set up database access:
6. Go to **Database Access** → **Add New Database User**
   - Username: `shopwave`
   - Password: click **Autogenerate** and copy it
   - Role: **Read and Write to Any Database**
   - Click **Add User**

### Set up network access:
7. Go to **Network Access** → **Add IP Address**
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`)
   - This is required for Vercel serverless functions
   - Click **Confirm**

### Get your connection string:
8. Go to **Database** → **Connect** → **Connect your application**
9. Select **Node.js** driver
10. Copy the connection string — it looks like:
    ```
    mongodb+srv://shopwave:<password>@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
    ```
11. Replace `<password>` with your actual password
12. Add the database name before `?`:
    ```
    mongodb+srv://shopwave:yourpassword@cluster0.abc123.mongodb.net/shopwave?retryWrites=true&w=majority
    ```

---

## Step 2 — Seed the Database with Demo Data

Run this once on your local machine to populate MongoDB with products and demo users.

1. Create `backend/.env` file:
   ```env
   MONGODB_URI=mongodb+srv://shopwave:yourpassword@cluster0.abc123.mongodb.net/shopwave?retryWrites=true&w=majority
   JWT_SECRET=any_long_random_string_here
   NODE_ENV=production
   ```

2. Run the seed script:
   ```bash
   cd backend
   npm run seed
   ```

   You should see:
   ```
   Connected to MongoDB
   Cleared existing data
   Seeded 16 products
   Seeded 3 users
   Done! ✅
   Admin:  admin@shopwave.com / admin123
   User:   jane@example.com / user123
   ```

---

## Step 3 — Push Code to GitHub

Vercel deploys from GitHub (free).

1. Go to https://github.com and create a new **public or private** repository called `shopwave`

2. In your project folder, open a terminal and run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/shopwave.git
   git push -u origin main
   ```

   > Make sure `.gitignore` includes `backend/.env` and `node_modules/` — it already does.

---

## Step 4 — Deploy to Vercel (Free)

1. Go to https://vercel.com and sign up with your GitHub account
2. Click **Add New Project**
3. Select your `shopwave` repository
4. Vercel will auto-detect the config from `vercel.json`
5. Click **Deploy** — first deploy takes ~2 minutes

---

## Step 5 — Add Environment Variables in Vercel

After deploying, go to your project in Vercel:

1. **Settings** → **Environment Variables**
2. Add these variables:

| Name | Value |
|------|-------|
| `MONGODB_URI` | `mongodb+srv://shopwave:yourpassword@cluster0.abc123.mongodb.net/shopwave?retryWrites=true&w=majority` |
| `JWT_SECRET` | any long random string (e.g. `shopwave_prod_secret_abc123xyz789`) |
| `NODE_ENV` | `production` |
| `ALLOWED_ORIGINS` | `https://your-app-name.vercel.app` |

3. After adding variables, go to **Deployments** → click the 3 dots on the latest deploy → **Redeploy**

---

## Step 6 — Verify Everything Works

Visit your Vercel URL (e.g. `https://shopwave-abc123.vercel.app`) and test:

- ✅ Homepage loads
- ✅ `/shop` shows 16 products
- ✅ Login with `jane@example.com` / `user123`
- ✅ Add to cart and checkout
- ✅ Login with `admin@shopwave.com` / `admin123` → Admin Dashboard

Also test the API directly:
- `https://your-app.vercel.app/api/health` → `{"status":"ok"}`
- `https://your-app.vercel.app/api/products` → JSON array of products

---

## Step 7 — Custom Domain (Optional, Free)

1. In Vercel → **Settings** → **Domains**
2. Add your domain (e.g. `shopwave.com`)
3. Update your domain's DNS with the records Vercel shows
4. SSL certificate is automatically issued — free

Update `ALLOWED_ORIGINS` env variable to include your custom domain:
```
https://shopwave.vercel.app,https://shopwave.com,https://www.shopwave.com
```

---

## Free Tier Limits

| Service | Free Limit | Notes |
|---------|-----------|-------|
| Vercel | 100GB bandwidth/month | More than enough for most sites |
| Vercel Functions | 100GB-Hrs compute/month | Very generous |
| MongoDB Atlas | 512MB storage | Holds thousands of products/orders |
| MongoDB Atlas | Unlimited reads/writes | No rate limits on free tier |

---

## Troubleshooting

**Products not showing:**
- Check MongoDB Atlas → Collections → make sure `products` collection has data
- Re-run `npm run seed` from the `backend/` folder

**Login not working:**
- Verify `JWT_SECRET` is set in Vercel environment variables
- Verify `MONGODB_URI` is correct with the right password

**API returns 500:**
- Check Vercel → Functions → View logs for error details
- Most common cause: wrong `MONGODB_URI` or network access not set to `0.0.0.0/0`

**CORS errors:**
- Make sure `ALLOWED_ORIGINS` matches your exact Vercel URL (no trailing slash)
