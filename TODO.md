# Frontend-Backend API Integration Plan

## Overview
Connect frontend cart, product, order, and payment components to backend APIs using centralized api.js functions.

## Tasks

### 1. Update api.js with all required API functions
- [x] Add cart API functions (getCart, addToCart, updateCartItem, removeFromCart, clearCart, getCartSummary)
- [x] Add order API functions (createOrder, confirmOrder, getMyOrders, getOrderById, updateOrderStatus, cancelOrder)
- [x] Add payment API functions (createPaymentIntent, confirmPayment, getPaymentHistory)
- [x] Ensure all functions use proper error handling and token authentication

### 2. Update Cart.jsx component
- [x] Replace direct fetch calls with api.js functions
- [x] Update fetchCart, updateQuantity, removeFromCart functions
- [x] Ensure proper error handling and loading states

### 3. Update Products.jsx component
- [x] Replace direct fetch call for addToCart with api.js function
- [x] Ensure consistency with other components

### 4. Update Orders.jsx component
- [x] Replace direct fetch calls with api.js functions
- [x] Update fetchOrders, cancelOrder functions
- [x] Fix any endpoint mismatches

### 5. Update Checkout.jsx component
- [x] Replace direct fetch calls with api.js functions
- [x] Update fetchCart, handleSubmit, handlePaymentSuccess functions
- [x] Ensure proper order creation and payment flow

### 6. Update OrderDetail.jsx component
- [x] Replace direct fetch calls with api.js functions
- [x] Update fetchOrderDetails, cancelOrder functions

### 7. Update Orders.jsx (pages version)
- [x] Replace axios calls with api.js functions
- [x] Update fetchCartAndShowCheckout, fetchOrders, createOrder functions
- [x] Ensure consistency with other order components

### 8. Testing and Validation
- [x] Test frontend build (successful)
- [x] Test backend syntax (successful, MongoDB connection issue noted but syntax valid)
- [ ] Test all CRUD operations for cart, products, orders, payments
- [ ] Verify error handling and loading states
- [ ] Check authentication token handling
- [ ] Validate data flow between frontend and backend

## Notes
- All API functions should use the centralized API_URL from api.js
- Ensure proper token authentication for protected routes
- Maintain consistent error handling patterns
- Update any hardcoded URLs to use environment variables
