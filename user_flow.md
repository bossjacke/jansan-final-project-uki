# User Flow on Jansan Eco Solutions Website

This document outlines the typical user journey on the Jansan Eco Solutions website, integrating frontend pages and backend API interactions. The website is an e-commerce platform for biogas systems and organic fertilizers.

## 1. Landing on the Website (Home Page)

**Frontend Route:** `/` (Home.jsx)
- User visits the homepage
- **Backend Interaction:** Fetches featured products via `GET /api/products` (first 3 products displayed)
- Displays hero section, features, and featured products
- Navigation options: Shop Now (to /products), Learn More (to /about)

## 2. Browsing Products

**Frontend Route:** `/products` (ProductsPage.jsx)
- User clicks "Shop Now" or "View All Products"
- **Backend Interaction:** `GET /api/products` to fetch all products
- Displays product grid with filters (category: biogas/fertilizer)
- Each product shows name, description, price, capacity, warranty
- User can add products to cart

## 3. User Registration/Login

**Frontend Routes:** `/register` (Register.jsx), `/login` (Login.jsx)
- New users register via `/register`
  - **Backend Interaction:** `POST /api/auth/register` with user details
- Existing users login via `/login`
  - **Backend Interaction:** `POST /api/auth/login` returns JWT token
- AuthContext manages user state across the app
- Password reset available via `/forgot-password` and `/reset-password/:token`
  - **Backend Interaction:** `POST /api/password/forgot-password`, `POST /api/password/reset-password`

## 4. Adding Products to Cart

**Frontend Route:** `/cart` (Cart.jsx)
- From products page, user adds items to cart
- **Backend Interaction:** `POST /api/cart/add` to add items
- Cart displays items, quantities, prices
- User can update quantities or remove items
  - **Backend Interaction:** `PUT /api/cart/update`, `DELETE /api/cart/remove`

## 5. Checkout Process

**Frontend Route:** `/checkout` (Checkout.jsx)
- User proceeds to checkout from cart
- **Backend Interaction:** `POST /api/orders` to create order
- Integrates with Stripe payment
  - **Backend Interaction:** `POST /api/payments/create-payment-intent` for Stripe integration

## 6. Order Management

**Frontend Routes:** `/orders` (Orders.jsx), `/order/:orderId` (OrderDetail.jsx)
- User views order history
  - **Backend Interaction:** `GET /api/orders` to fetch user's orders
- Detailed order view shows order status, items, payment info
  - **Backend Interaction:** `GET /api/orders/:orderId`

## 7. Admin Panel (Admin Users Only)

**Frontend Route:** `/admin` (Admin.jsx)
- Admin users access dashboard
- **Backend Interaction:** Various admin endpoints (requires role check middleware)
- Manage products: Add/edit/delete products
  - **Backend Interaction:** `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`
- Manage users: View user list, manage roles
  - **Backend Interaction:** `GET /api/users`, `PUT /api/users/:id`
- Manage orders: View all orders, update status
  - **Backend Interaction:** `GET /api/orders` (admin), `PUT /api/orders/:id/status`

## 8. Additional Features

- **About Page:** `/about` (About.jsx) - Static information
- **Contact Page:** `/contact` (Contact.jsx) - Contact form (likely sends email via backend)
- **Footer/Navigation:** Consistent across pages
- **Auth Middleware:** Protects routes like /admin, /orders (frontend checks auth state)
- **Role Check:** Backend middleware ensures admin-only actions

## Backend Architecture

- **Server:** Express.js on port 3003
- **Database:** MongoDB (via Mongoose models: User, Product, Order, Cart, etc.)
- **Authentication:** JWT tokens, Google OAuth available
- **Payments:** Stripe integration
- **Email:** Nodemailer for password resets and notifications
- **CORS:** Allows frontend on localhost:5173/5175

## Typical User Journey Summary

1. Visit homepage → See featured products
2. Browse all products → Filter by category
3. Register/Login if needed
4. Add products to cart
5. Checkout with payment
6. View order history
7. (Optional) Contact support

Admins can manage the platform through the admin panel.
