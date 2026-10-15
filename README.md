# TechShop 🛒💻

[![Live Demo](https://img.shields.io/badge/demo-live-green.svg)](https://techshop-mec5.onrender.com)
[![Figma Design](https://img.shields.io/badge/design-Figma-purple.svg)](https://www.figma.com/design/tfLqZf3NEnD5b1GmvrkyOK/techshop?node-id=4-282&t=DI5SGQdduE11qyVy-1)
[![API Documentation](https://img.shields.io/badge/docs-Postman-orange.svg)](https://documenter.getpostman.com/view/39791338/2sBYHRWNLh)

TechShop is an e-commerce web application designed for selling electronic gadgets and related products. The platform provides customers with a convenient way to browse products, manage their shopping carts and wishlists, place orders, and make online payments. 

The application consists of two modules: **Admin** and **Customer**. The Admin module provides tools for managing the store, while the Customer module enables users to explore and purchase products through a user-friendly interface.

---

## 📸 Screenshots

*(Add your screenshots or GIFs here. Examples below:)*
* Homepage & Product Listing
* Shopping Cart & Checkout Flow
* Admin Dashboard & Inventory Management

---

## 🎯 Project Objectives

- Develop an online platform for purchasing electronic gadgets.
- Provide efficient product, category, and brand management.
- Simplify order placement and order status tracking.
- Support secure online payment processing.
- Provide user authentication through Google login.
- Enable customers to manage their profiles, addresses, carts, and wishlists.
- Provide administrators with a centralized dashboard to manage e-commerce operations.

---

## ✨ User Roles

### 🧑‍💻 Customer
- Browse and view available gadgets.
- Add products to the shopping cart and wishlist.
- Manage profile and delivery addresses.
- Place orders and complete online payments.
- View orders and track their status.
- Sign in using Google authentication.

### 🛡️ Admin
- Access the admin dashboard to monitor store activities.
- View and manage customer orders and update statuses throughout the order lifecycle.
- Add, edit, and delete products, categories, and brands.
- Manage the store's product catalog and order operations.

---

## 🛠️ Technology Stack

- **Frontend:** EJS, JavaScript, HTML, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Architecture:** Model-View-Controller (MVC)
- **Authentication:** Google Login (OAuth)
- **Payment Integration:** Razorpay
- **Media Storage:** Cloudinary
- **Email Service:** Brevo
- **Deployment:** Render

---

## 🏗️ System Architecture

TechShop follows the **Model-View-Controller (MVC)** architectural pattern to separate application responsibilities:
- **Model:** Handles database schemas, data structures, and interactions with MongoDB.
- **View:** Uses EJS templates to render dynamic web pages and display application data.
- **Controller:** Handles incoming requests, processes application logic, and coordinates interactions between models and views.
- **Routes:** Define application endpoints and direct incoming requests to the appropriate controllers.

This structure helps keep the application organized, maintainable, and easier to extend.

---

## 🚀 Local Setup & Installation

### Prerequisites
Make sure you have the following installed and set up:
* Node.js
* MongoDB (Local instance or MongoDB Atlas)
* Accounts and API keys for: Google Cloud Console, Razorpay, Cloudinary, and Brevo (Sendinblue).

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/suhailts133/techShop.git
   cd techShop
