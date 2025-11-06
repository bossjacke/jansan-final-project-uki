# Order API Postman Testing Guide

## Overview
This guide provides step-by-step instructions for testing the Order API endpoints using Postman.

## Prerequisites
1. Backend server running on `http://localhost:5000`
2. MongoDB database connected
3. User authentication token (JWT)
4. Admin user token for admin operations

## Base URL
```
http://localhost:5000/api/orders
```

## Authentication Setup

### 1. User Registration/Login
First, register or login to get authentication token.

**POST** `http://localhost:5000/api/users/register`
```json
{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
}
```

**POST** `http://localhost:5000/api/users/login`
```json
{
    "email": "test@example.com",
    "password": "password123"
}
```
Copy the token from response for Authorization header.

### 2. Admin Login (for admin operations)
**POST** `http://localhost:5000/api/users/login`
```json
{
    "email": "admin@example.com",
    "password": "admin123"
}
```

## Order API Endpoints

### 1. Get Customer Orders
**Endpoint:** `GET /api/orders/`

**Headers:**
```
Authorization: Bearer <your_user_token>
Content-Type: application/json
```

**Request:**
- Method: GET
- URL: `http://localhost:5000/api/orders/`
- No body required

**Expected Response (200 OK):**
```json
{
    "orders": [
        {
            "_id": "64a1b2c3d4e5f6789012345",
            "userId": "64a1b2c3d4e5f6789012346",
            "productId": "64a1b2c3d4e5f6789012347",
            "orderStatus": "pending",
            "deliveryDate": null,
            "createdAt": "2023-07-01T10:30:00.000Z",
            "updatedAt": "2023-07-01T10:30:00.000Z",
            "__v": 0
        }
    ]
}
```

**Error Response (401 Unauthorized):**
```json
{
    "message": "No token, authorization denied"
}
```

### 2. Update Order Status (Admin Only)
**Endpoint:** `PUT /api/orders/:orderId`

**Headers:**
```
Authorization: Bearer <your_admin_token>
Content-Type: application/json
```

**Request:**
- Method: PUT
- URL: `http://localhost:5000/api/orders/64a1b2c3d4e5f6789012345`
- Body:
```json
{
    "orderStatus": "confirmed",
    "deliveryDate": "2023-07-05T14:00:00.000Z"
}
```

**Expected Response (200 OK):**
```json
{
    "message": "Order status updated successfully",
    "order": {
        "_id": "64a1b2c3d4e5f6789012345",
        "userId": "64a1b2c3d4e5f6789012346",
        "productId": "64a1b2c3d4e5f6789012347",
        "orderStatus": "confirmed",
        "deliveryDate": "2023-07-05T14:00:00.000Z",
        "createdAt": "2023-07-01T10:30:00.000Z",
        "updatedAt": "2023-07-01T10:45:00.000Z",
        "__v": 0
    }
}
```

**Valid Order Status Values:**
- `"pending"` (default)
- `"confirmed"`
- `"delivered"`

**Error Responses:**

**401 Unauthorized:**
```json
{
    "message": "No token, authorization denied"
}
```

**403 Forbidden (Non-admin user):**
```json
{
    "message": "Admin access required"
}
```

**404 Not Found:**
```json
{
    "message": "Order not found"
}
```

**400 Bad Request (Invalid status):**
```json
{
    "message": "Invalid order status. Must be: pending, confirmed, or delivered"
}
```

## Postman Collection Setup

### 1. Environment Variables
Create environment variables in Postman:

```
baseUrl = http://localhost:5000
userToken = <your_user_jwt_token>
adminToken = <your_admin_jwt_token>
orderId = <sample_order_id>
```

### 2. Collection Structure

#### Folder: Authentication
- **Register User**
- **Login User**
- **Login Admin**

#### Folder: Orders
- **Get Customer Orders**
- **Update Order Status (Admin)**

### 3. Test Scripts

#### For Login Request (Tests Tab)
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.token) {
        pm.environment.set("userToken", response.token);
    }
}
```

#### For Admin Login Request (Tests Tab)
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.token) {
        pm.environment.set("adminToken", response.token);
    }
}
```

#### For Get Orders Request (Tests Tab)
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has orders array", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('orders');
    pm.expect(jsonData.orders).to.be.an('array');
});

if (pm.response.code === 200 && pm.response.json().orders.length > 0) {
    const firstOrder = pm.response.json().orders[0];
    pm.environment.set("orderId", firstOrder._id);
}
```

## Testing Workflow

### Step 1: Setup Authentication
1. Register a new user (if not exists)
2. Login as user to get user token
3. Login as admin to get admin token

### Step 2: Create Test Data
1. Create a product (using product API)
2. Create an order (this may need to be implemented)
3. Note the order ID

### Step 3: Test Order Operations
1. Get customer orders
2. Update order status as admin
3. Verify status changes

### Step 4: Error Handling Tests
1. Try accessing without token
2. Try updating order as regular user
3. Try updating with invalid status
4. Try updating non-existent order

## Common Issues & Solutions

### 1. CORS Errors
Ensure backend allows requests from Postman:
```javascript
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
```

### 2. Database Connection
Verify MongoDB is running and connection string is correct in `.env` file.

### 3. Token Expiration
If tokens expire, re-login to get fresh tokens.

### 4. Missing Order Creation
Currently, the order creation endpoint might be missing. You may need to implement it or create orders directly in the database for testing.

## Additional Test Cases

### 1. Pagination Test
```javascript
// Test with query parameters
GET /api/orders/?page=1&limit=10
```

### 2. Filter by Status Test
```javascript
// Test with status filter
GET /api/orders/?status=pending
```

### 3. Date Range Test
```javascript
// Test with date range
GET /api/orders/?startDate=2023-07-01&endDate=2023-07-31
```

## Performance Testing

### 1. Load Testing
- Send multiple concurrent requests
- Test with large datasets
- Monitor response times

### 2. Stress Testing
- Test with invalid data
- Test with missing required fields
- Test with extremely large payloads

## Security Testing

### 1. Authentication Bypass
- Try accessing endpoints without tokens
- Try with expired tokens
- Try with malformed tokens

### 2. Authorization Testing
- Try admin operations as regular user
- Try accessing other users' orders

### 3. Input Validation
- Test with SQL injection attempts
- Test with XSS payloads
- Test with malformed JSON

## Debugging Tips

### 1. Check Network Tab
- Verify request headers
- Check response status codes
- Examine response bodies

### 2. Console Logging
Add console logs in backend controllers:
```javascript
console.log('Request received:', req.body);
console.log('User ID:', req.user.id);
```

### 3. Database Queries
Log MongoDB queries to verify data operations:
```javascript
mongoose.set('debug', true);
```

## Summary

This testing guide covers:
- ✅ Authentication setup
- ✅ Order retrieval testing
- ✅ Order status updates
- ✅ Error handling
- ✅ Postman collection setup
- ✅ Test automation scripts
- ✅ Performance and security testing

Follow these steps to thoroughly test the Order API endpoints and ensure they work correctly.
