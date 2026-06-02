# ShopWave — CWP Deployment (No SSH, File Manager Only)

## How It Works
- Everything is built on your PC first
- You upload the pre-built files via CWP File Manager
- CWP's Node.js App panel starts the server (no SSH needed)
- Single Node.js process serves both the API and the React frontend

---

## Step 1 — Edit your .env before uploading

Open `backend/.env` and update these two lines:

```env
JWT_SECRET=pick_any_long_random_string_here_like_abc123xyz789
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

Replace `yourdomain.com` with your actual domain.

---

## Step 2 — Build is already done

The React app is already compiled at `frontend/build/`.
The backend `node_modules` are already installed at `backend/node_modules/`.

If you make any frontend code changes later, rebuild with:
```bash
npm run build
```
(run inside the `frontend/` folder)

---

## Step 3 — What to upload

Upload this exact folder structure to your CWP home directory
(e.g. `/home/yourusername/shopwave/`):

```
shopwave/
├── backend/
│   ├── .env                ← with your real values filled in
│   ├── server.js
│   ├── package.json
│   ├── data/
│   ├── middleware/
│   ├── routes/
│   └── node_modules/       ← upload this whole folder
└── frontend/
    └── build/              ← upload this whole folder
```

Use CWP File Manager → upload as a ZIP then extract, it's much faster than
uploading thousands of individual files.

### How to ZIP for upload:
Right-click `backend/` → Send to ZIP → `backend.zip`
Right-click `frontend/build/` → Send to ZIP → `build.zip`
Upload both ZIPs to the server, then extract them in File Manager.

---

## Step 4 — Set up Node.js App in CWP

1. Log in to CWP Client Panel
2. Go to **Software** → **Node.js Apps** (or **Setup Node.js App**)
3. Click **Create Application**
4. Fill in:
   - **Node.js version**: 18.x or 20.x
   - **Application mode**: Production
   - **Application root**: `/home/yourusername/shopwave/backend`
   - **Application URL**: your domain (e.g. `yourdomain.com`)
   - **Application startup file**: `server.js`
5. Click **Create**
6. The panel will start the Node.js process automatically

---

## Step 5 — Verify it works

Visit these URLs in your browser:

- `https://yourdomain.com` → should show the ShopWave homepage
- `https://yourdomain.com/api/health` → should return `{"status":"ok",...}`

---

## Troubleshooting

**App shows blank page:**
- Make sure `frontend/build/` is at `shopwave/frontend/build/` (not inside backend)
- Check that `index.html` exists inside the build folder

**API calls fail (404):**
- Visit `/api/health` to confirm the backend is running
- Check the Node.js App logs in CWP panel

**App crashes on start:**
- Make sure `.env` file exists in `backend/` with correct values
- Make sure `node_modules/` was uploaded completely

**Port conflict:**
- Change `PORT=5000` in `backend/.env` to another port like `3001`
  then update the Node.js App port in CWP panel to match

---

## Demo Login Credentials (for testing)

- **Admin**: admin@shopwave.com / admin123
- **User**: jane@example.com / user123
