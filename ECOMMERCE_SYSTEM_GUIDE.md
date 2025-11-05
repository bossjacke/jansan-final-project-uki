# Jansan E-commerce System - Complete Guide

## 🏗️ System Overview

This is a complete e-commerce system for biogas units and organic fertilizers with:
- **Admin Panel** for product and user management
- **E-commerce Frontend** for customers to browse and purchase products
- **Backend API** with MongoDB database integration
- **Product Categories**: Biogas Units & Fertilizers

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── product.controller.js  # CRUD operations for products
│   │   │   └── user.controller.js     # User management & auth
│   │   ├── models/
│   │   │   ├── product.model.js       # Product schema
│   │   │   └── user.model.js         # User schema
│   │   └── routes/
│   │       ├── product.routes.js        # Product API endpoints
│   │       └── user.routes.js          # User API endpoints
│   └── .env                         # Database & JWT config
├── frontend/
│   └── src/
│       ├── components/
│       │   └── pages/
│       │       ├── Admin.jsx            # Admin panel (products/users)
│       │       ├── EcommerceProducts.jsx # E-commerce product display
│       │       ├── Products.jsx         # Simple product list
│       │       └── Cart.jsx           # Shopping cart
│       ├── api.js                    # API integration
│       └── App.jsx                   # Routes & navigation
```

## 🚀 Getting Started

### 1. Start Backend Server
```bash
cd backend
npm install
npm start
```
*Server runs on: http://localhost:3003*

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on: http://localhost:5173*

## 📱 Pages & Features

### 🛍️ Shop Page (/shop)
**Modern E-commerce Interface:**
- Product grid with responsive design
- Search functionality
- Category filtering (Biogas/Fertilizer)
- Sort by name/price
- Real-time cart notifications
- Product statistics dashboard
- Add to cart with quantity tracking

### 🔧 Admin Panel (/admin)
**Complete Management System:**
- **Products Tab:**
  - Add new products (Biogas/Fertilizer)
  - Edit existing products
  - Delete products
  - Dynamic form based on product type
  - Real-time product list updates

- **Users Tab:**
  - View all registered users
  - User role indicators (Admin/User)
  - User registration dates
  - Email display

### 🛒 Cart System
- Local storage persistence
- Quantity management
- Real-time updates
- Product count badges

## 📊 Product Types

### 🔥 Biogas Units
Fields: name, type, capacity, price, warrantyPeriod, description
Example: "Domestic Biogas Unit - 2m³"

### 🌱 Fertilizers  
Fields: name, type, price, description
Example: "Organic Vermicompost - 5kg"

## 🔌 API Endpoints

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Users
- `POST /api/users/register` - Register user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile
- `GET /api/users/` - Get all users (Admin only)
- `DELETE /api/users/:userId` - Delete user (Admin only)

## 🗄️ Database Schema

### Product Model
```javascript
{
  name: String (required),
  type: String (enum: ['biogas', 'fertilizer']),
  capacity: String (biogas only),
  price: Number (required),
  warrantyPeriod: String (biogas only),
  description: String
}
```

### User Model
```javascript
{
  name: String,
  email: String (required, unique),
  password: String (required, hashed),
  role: String (default: 'customer'),
  phone: String,
  locationId: String
}
```

## 🎨 UI Features

### Modern Design Elements:
- Tailwind CSS styling
- Responsive grid layouts
- Hover effects and transitions
- Color-coded product badges
- Loading states
- Error handling
- Success notifications

### Interactive Elements:
- Real-time search
- Dynamic filtering
- Sorting options
- Cart management
- Form validation

## 🔐 Authentication & Security

- JWT token-based authentication
- Password hashing with bcrypt
- Admin role-based access control
- Protected routes for admin functions

## 📦 Sample Products

The system includes sample biogas units and fertilizers:
- Domestic/Commercial/Industrial Biogas Units (₹25,000 - ₹150,000)
- Organic Vermicompost (₹150 - ₹650)
- Biogas Slurry Fertilizer (₹200 - ₹850)
- Organic Compost Mix (₹400)
- Liquid Organic Fertilizer (₹120)

## 🔄 Cart Functionality

- localStorage for persistence
- Quantity tracking per product
- Real-time UI updates
- Cart count badges
- Add/remove operations

## 📱 Mobile Responsive

- Grid adapts to screen size
- Mobile-friendly navigation
- Touch-optimized buttons
- Responsive forms

## 🚀 Deployment Ready

- Environment variables configured
- Production-ready API structure
- Optimized frontend build
- MongoDB Atlas compatible

---

**🎯 This system provides a complete e-commerce solution for biogas and fertilizer products with professional admin management and customer shopping experience!**
