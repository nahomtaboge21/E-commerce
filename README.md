# ShopWave — Full Stack Ecommerce

A complete, production-ready ecommerce web app built with **React** (frontend) and **Node.js/Express** (backend).

---

## Features

- 🛒 **Shopping Cart** — Add/remove items, quantity control, persistent sidebar
- 🔐 **User Auth** — Register, login, JWT tokens, profile management
- 🔍 **Product Search & Filters** — Search, category, price range, sort, pagination
- 📦 **Order System** — Checkout flow, order history, status tracking
- 👑 **Admin Dashboard** — Manage products, orders, users; view stats
- 📱 **Responsive** — Works on mobile, tablet, and desktop

---

## Project Structure

```
shopwave/
├── backend/           # Node.js / Express API
│   ├── data/db.js     # In-memory mock database (16 products, users, orders)
│   ├── middleware/    # JWT auth middleware
│   ├── routes/        # auth, products, orders, admin
│   └── server.js      # Entry point (port 5000)
│
└── frontend/          # React app (Create React App)
    ├── src/
    │   ├── api.js            # Axios API client
    │   ├── context/          # Auth + Cart context
    │   ├── components/       # Navbar, Footer, CartSidebar, ProductCard
    │   ├── pages/            # Home, Shop, ProductDetail, Checkout,
    │   │                     # Orders, Profile, Admin, Auth
    │   └── styles/           # Global CSS design system
    └── public/
```

---

## Quick Start

### 1. Start the Backend

```bash
cd backend
npm install
npm run dev       # starts on http://localhost:5000
# or: npm start
```

### 2. Start the Frontend

```bash
cd frontend
npm install
npm start         # starts on http://localhost:3000
```

The frontend proxies `/api/*` requests to `localhost:5000` automatically.

---

## Demo Credentials

| Role  | Email                   | Password   |
|-------|-------------------------|------------|
| Admin | admin@shopwave.com      | admin123   |
| User  | jane@example.com        | user123    |
| User  | bob@example.com         | user123    |

Both are pre-filled as quick-fill buttons on the login page.

---

## API Endpoints

### Auth
| Method | Endpoint             | Description         |
|--------|----------------------|---------------------|
| POST   | /api/auth/register   | Register new user   |
| POST   | /api/auth/login      | Login               |
| GET    | /api/auth/me         | Get current user    |
| PUT    | /api/auth/profile    | Update profile      |

### Products
| Method | Endpoint             | Description                  |
|--------|----------------------|------------------------------|
| GET    | /api/products        | List (search, filter, sort)  |
| GET    | /api/products/featured | Featured products           |
| GET    | /api/products/:id    | Product detail + related     |
| POST   | /api/products        | Create product (admin)       |
| PUT    | /api/products/:id    | Update product (admin)       |
| DELETE | /api/products/:id    | Delete product (admin)       |

Query params for GET /api/products:
- `search`, `category`, `minPrice`, `maxPrice`, `featured`, `sortBy`, `page`, `limit`

### Orders
| Method | Endpoint               | Description               |
|--------|------------------------|---------------------------|
| GET    | /api/orders            | My orders (admin: all)    |
| GET    | /api/orders/:id        | Order detail              |
| POST   | /api/orders            | Place order               |
| PUT    | /api/orders/:id/status | Update status (admin)     |

### Admin
| Method | Endpoint             | Description      |
|--------|----------------------|------------------|
| GET    | /api/admin/stats     | Dashboard stats  |
| GET    | /api/admin/users     | All users        |
| DELETE | /api/admin/users/:id | Delete user      |

---

## Pages

| Route                    | Page                     |
|--------------------------|--------------------------|
| /                        | Home (hero, categories, featured) |
| /shop                    | Product catalog (filters, search) |
| /product/:id             | Product detail           |
| /checkout                | 3-step checkout          |
| /order-confirmation/:id  | Order success            |
| /orders                  | Order history            |
| /profile                 | Account settings         |
| /login                   | Sign in                  |
| /register                | Create account           |
| /admin                   | Admin dashboard (admin only) |

---

## Upgrading to a Real Database

The backend uses an in-memory array as the database (data resets on restart). To persist data:

1. Install `mongoose` (MongoDB) or `sequelize` (PostgreSQL/MySQL)
2. Replace the arrays in `backend/data/db.js` with database models
3. Update each route to use async database queries instead of array methods

---

## Tech Stack

**Frontend:** React 18, React Router 6, Axios, CSS custom properties

**Backend:** Node.js, Express 4, bcryptjs, jsonwebtoken, uuid

**No external UI library** — all components are custom-built for full control.
