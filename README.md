# 🛒 TechShop

A full-stack e-commerce web application for selling electronic gadgets. TechShop has a **Customer** storefront for browsing, carting, and paying for products, and an **Admin** panel for managing the catalog and orders.

🔗 **Live demo:** https://techshop-mec5.onrender.com

> Hosted on Render's free tier, so the first request after inactivity may take ~50 seconds to wake up.

<!-- Add real screenshots, then uncomment:
![Home page](docs/screenshots/home.png)
![Product page](docs/screenshots/product.png)
![Admin dashboard](docs/screenshots/admin-dashboard.png)
-->

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Documentation](#-documentation)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Third-Party Service Setup](#-third-party-service-setup)
- [Admin Access](#-admin-access)
- [Testing Payments](#-testing-payments)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Author](#-author)

---

## ✨ Features

### Customer
- Sign in with Google
- Browse and view gadgets
- Add products to the cart and wishlist
- Manage profile and delivery addresses
- Apply coupons at checkout
- Place orders and pay online via Razorpay
- Download order invoices
- View orders and track their status

### Admin
- Dashboard to monitor store activity
- Add, edit, and delete products
- Create, update, and delete categories and brands
- View customer orders and update order status through its lifecycle

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | EJS, HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Authentication | Google OAuth (Google Login) |
| Payments | Razorpay |
| Media Storage | Cloudinary |
| Email | Brevo |
| Deployment | Render |

---

## 🏗️ Architecture

TechShop follows the **MVC (Model-View-Controller)** pattern:

- **Model**: database schemas and MongoDB interactions
- **View**: EJS templates that render dynamic pages
- **Controller**: request handling and application logic
- **Routes**: endpoint definitions that direct requests to controllers

---

## 📚 Documentation

| Resource | Link |
|---|---|
| Database design | [Eraser workspace](https://app.eraser.io/workspace/TLscIxNpoY8SJhao7g19) |
| API / route documentation | [Postman docs](https://documenter.getpostman.com/view/39791338/2sBYHRWNLh) |
| UI/UX design | [Figma](https://www.figma.com/design/tfLqZf3NEnD5b1GmvrkyOK/techshop?node-id=4-282&t=DI5SGQdduE11qyVy-1) |
| Source code | [GitHub](https://github.com/suhailts133/techShop) |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v22.0 or later, and npm
- [MongoDB](https://www.mongodb.com/try/download/community) (local install or a free MongoDB Atlas cluster)
- Accounts for: Google Cloud (OAuth), Razorpay (test mode), Cloudinary, and Brevo

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/suhailts133/techShop.git
cd techShop

# 2. Install dependencies
npm install

# 3. Create your environment file and fill in the values
cp .env.example .env

# 4. Start the app
npm start
```

The app will be available at **http://localhost:3000**.

### Database

Run MongoDB locally (default port `27017`), or skip the local install and use a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster by setting `MONGODB_ATLAS_URI`.

---

## 🔐 Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```env
NODE_ENV=development
PORT=3000

# Database URIs
MONGODB_URI=mongodb://127.0.0.1:27017/techshop
MONGODB_ATLAS_URI=your_mongodb_atlas_uri

# Authentication & Sessions
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Payment Gateway
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Media Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Service (Brevo)
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER=your_verified_sender_email

# Application URIs
DEV_URI=http://localhost:3000/
DEV_CALLBACK_URI=http://localhost:3000/auth/google/callback
PROD_URI=https://techshop-mec5.onrender.com/
PROD_CALLBACK_URI=https://techshop-mec5.onrender.com/auth/google/callback
```

| Variable | Description |
|---|---|
| `NODE_ENV` | `development` or `production` |
| `PORT` | Port the server listens on (default `3000`) |
| `MONGODB_URI` | Local MongoDB connection string |
| `MONGODB_ATLAS_URI` | MongoDB Atlas connection string (production) |
| `SESSION_SECRET` | Long random string used to sign sessions |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Razorpay API keys (use test keys in development) |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary credentials for product images |
| `BREVO_API_KEY`, `BREVO_SENDER` | Brevo API key and a **verified** sender email |
| `DEV_URI`, `DEV_CALLBACK_URI` | Local base URL and Google OAuth callback |
| `PROD_URI`, `PROD_CALLBACK_URI` | Production base URL and Google OAuth callback |

> ⚠️ Never commit your `.env` file. Make sure it is listed in `.gitignore`.
> The URL values must be plain URLs (no Markdown link syntax).

---

## 🔌 Third-Party Service Setup

**Google OAuth**
1. Open [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials.
2. Create an **OAuth 2.0 Client ID** (Web application).
3. Add these Authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback`
   - `https://techshop-mec5.onrender.com/auth/google/callback`
4. Copy the Client ID and Secret into `.env`.

**Razorpay**
1. Create an account and switch to **Test Mode**.
2. Generate API keys and add them to `.env`.

**Cloudinary**
1. Create a free account and copy the cloud name, API key, and API secret from the dashboard.

**Brevo**
1. Create an account, generate an API key, and verify the sender email you use for `BREVO_SENDER`.

---

## 👑 Admin Access

<!-- Replace this section with your actual process. -->

To access the admin panel locally:

1. Sign in once with Google so your user is created in the database.
2. In MongoDB, set that user's role to admin, for example:
   ```js
   db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
   ```
3. Open the admin dashboard at `/admin`.

> Adjust the collection name, field name, and route above to match your code.

---

## 💳 Testing Payments

Use Razorpay **test mode** keys. Do not use real cards.

| Method | Details |
|---|---|
| Test card | See [Razorpay test cards](https://razorpay.com/docs/payments/payments/test-card-details/) |
| Test UPI | `success@razorpay` (success) / `failure@razorpay` (failure) |

---

## 📁 Project Structure

```
techShop/
├── config/            # DB, Passport (Google auth), and Razorpay setup
│   ├── db.js
│   ├── passport.js
│   └── razorpay.js
├── controllers/
│   ├── admin/         # Admin logic (dashboard, brands, products, orders, ...)
│   └── user/          # Customer logic (checkout, cart, profile, ...)
├── helpers/           # Coupons, invoice generation, user authentication helpers
├── middlewares/       # Auth and access-control middleware
├── models/            # Mongoose schemas (address, ...)
├── public/            # Static assets
│   ├── banner/
│   ├── css/
│   ├── js/
│   └── favicon.svg
├── routes/            # Route definitions (admin and user)
├── services/          # External services (Cloudinary)
├── views/
│   ├── admin/         # Admin EJS pages
│   ├── layouts/       # Boilerplates (admin, user, profile)
│   ├── partials/      # Reusable components (navbars, ...)
│   ├── profile/       # Profile, addresses, wishlist
│   └── user/          # Storefront pages
├── .env.example
├── .gitignore
├── app.js             # App entry point
└── package.json
```

---

## ☁️ Deployment

TechShop is deployed on [Render](https://render.com/).

1. Create a new **Web Service** from the GitHub repository.
2. Build command: `npm install`
3. Start command: `npm start`
4. Add all environment variables from the table above in the Render dashboard, with `NODE_ENV=production`.
5. Make sure the production callback URL is added in Google Cloud Console.

**Live:** https://techshop-mec5.onrender.com

---

## 🗺️ Roadmap

- [ ] Product reviews and ratings
- [ ] Product search with filters and sorting
- [ ] Add your own ideas here

---

## 👤 Author

**Suhail**
GitHub: [@suhailts133](https://github.com/suhailts133)

---

## 📄 License

This project is licensed under the MIT License. Add a `LICENSE` file to the repo if you keep this.
