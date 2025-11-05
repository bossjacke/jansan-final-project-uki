# Postman Testing Guide - Complete API Testing (Port 3003)
itha ui la fertilizer and biogas  endu product page la kaddura mari code tha
## 🚀 Server Setup
Make sure your backend server is running on port 3003:
```bash
cd backend
npm start
```
Server should be running at: `http://localhost:3003`

## 🔐 Authentication Setup (Required for Admin Operations)

Before testing product operations, you need to get an authentication token:

### **1. Register User (if not already registered)**
- **Method**: POST
- **URL**: `http://localhost:3003/api/user/register`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
}
```

### **2. Login to Get Token**
- **Method**: POST
- **URL**: `http://localhost:3003/api/user/login`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
    "email": "admin@example.com",
    "password": "admin123"
}
```

### **3. Copy the Token**
From the login response, copy the token value. You'll need it for admin operations.
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "id": "...", "name": "Admin User", "role": "admin" }
}
```

**For all admin operations (POST, PUT, DELETE), add this header:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

## 📧 Test 1: Forgot Password (Send OTP)

### **Request Details:**
- **Method**: POST
- **URL**: `http://localhost:3003/api/user/forgot-password`
- **Headers**: 
  ```
  Content-Type: application/json
  ```

### **Body (raw JSON):**
```json
{
    "email": "test@example.com"
}
```

### **Expected Response:**
```json
{
    "message": "If email exists, OTP sent successfully"
}
```

### **Console Output (Development Mode):**
```
=== DEVELOPMENT MODE ===
Email: test@example.com
OTP: 123456
Expires: Mon Nov 04 2024 13:05:00 GMT+0530
========================
```

---

## 🔐 Test 2: Reset Password (Use OTP)

### **Request Details:**
- **Method**: POST
- **URL**: `http://localhost:3003/api/user/reset-password`
- **Headers**: 
  ```
  Content-Type: application/json
  ```

### **Body (raw JSON):**
```json
{
    "email": "test@example.com",
    "otp": "123456",
    "newPassword": "newpassword123"
}
```

### **Expected Response:**
```json
{
    "message": "Password reset successfully"
}
```

---

## 📋 Complete Testing Steps

### **Step 1: Start Backend Server**
```bash
cd backend
npm start
```
✅ Verify server is running on port 3003

### **Step 2: Test Forgot Password**
1. Open Postman
2. Create new request → POST
3. URL: `http://localhost:3003/api/user/forgot-password`
4. Headers → Add `Content-Type: application/json`
5. Body → raw → JSON
6. Add: `{"email": "test@example.com"}`
7. Click Send
8. Check backend console for OTP

### **Step 3: Test Reset Password**
1. Create new request → POST
2. URL: `http://localhost:3003/api/user/reset-password`
3. Headers → Add `Content-Type: application/json`
4. Body → raw → JSON
5. Add: `{"email": "test@example.com", "otp": "123456", "newPassword": "newpassword123"}`
6. Click Send
7. Should get success response

---

## 🔍 Additional Test Cases

### **Test Invalid Email:**
```json
{
    "email": "invalid-email"
}
```
**Response**: `{"message": "Valid email required"}`

### **Test Invalid OTP:**
```json
{
    "email": "test@example.com",
    "otp": "000000",
    "newPassword": "newpassword123"
}
```
**Response**: `{"message": "Invalid or expired OTP"}`

### **Test Short Password:**
```json
{
    "email": "test@example.com",
    "otp": "123456",
    "newPassword": "123"
}
```
**Response**: `{"message": "Password must be at least 6 characters"}`

### **Test Missing Fields:**
```json
{
    "email": "test@example.com"
}
```
**Response**: `{"message": "Email, OTP, and new password are required"}`

---

## 📱 Postman Screenshots Guide

### **1. Forgot Password Request:**
```
POST | http://localhost:3003/api/user/forgot-password
Headers: Content-Type: application/json
Body: {"email": "test@example.com"}
```

### **2. Reset Password Request:**
```
POST | http://localhost:3003/api/user/reset-password
Headers: Content-Type: application/json
Body: {"email": "test@example.com", "otp": "123456", "newPassword": "newpassword123"}
```

---

## 🛠️ Troubleshooting

### **Server Not Running:**
- Check if backend server is started
- Verify port 3003 is not in use
- Check for any error messages

### **CORS Issues:**
- If testing from browser, ensure CORS is configured
- Backend should allow requests from your frontend

### **Database Connection:**
- Ensure MongoDB is running
- Check database connection string in `.env`

### **Email Issues:**
- In development mode, OTP is logged to console
- Check backend console for OTP value
- Use the OTP from console in Postman

---

## 📝 Quick Test Script

You can also test using curl:

### **Forgot Password:**
```bash
curl -X POST http://localhost:3003/api/user/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### **Reset Password:**
```bash
curl -X POST http://localhost:3003/api/user/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "otp": "123456", "newPassword": "newpassword123"}'
```

---

## ✅ Success Indicators

- **Forgot Password**: Status 200 + OTP in console
- **Reset Password**: Status 200 + "Password reset successfully"
- **Database**: User password updated, OTP fields cleared
- **Rate Limiting**: After 3 requests, get 429 status

Test both endpoints sequentially to verify complete password reset flow! 🎯

---

## 🛍️ Product CRUD Testing (Complete Guide)

### **Product Model Structure:**
```json
{
    "name": "string (required)",
    "type": "biogas|fertilizer (required)",
    "capacity": "string (optional, for biogas)",
    "price": "number (required)",
    "warrantyPeriod": "string (optional, for biogas)",
    "description": "string (optional)"
}
```

---

## 📦 Product Operations

### **1. Create Product (POST) - Admin Only**
- **Method**: POST
- **URL**: `http://localhost:3003/api/products`
- **Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer YOUR_ADMIN_TOKEN
  ```

#### **Example 1: Create Biogas Product**
**Body**:
```json
{
    "name": "Biogas Unit Premium",
    "type": "biogas",
    "capacity": "500L",
    "price": 25000,
    "warrantyPeriod": "2 years",
    "description": "High-quality biogas unit for domestic use"
}
```

#### **Example 2: Create Fertilizer Product**
**Body**:
```json
{
    "name": "Organic Fertilizer Premium",
    "type": "fertilizer",
    "price": 500,
    "description": "Premium organic fertilizer for agriculture"
}
```

**Expected Response (Status 201)**:
```json
{
    "message": "Product created successfully",
    "product": {
        "_id": "64a7b8c9d1e2f3g4h5i6j7k8",
        "name": "Biogas Unit Premium",
        "type": "biogas",
        "capacity": "500L",
        "price": 25000,
        "warrantyPeriod": "2 years",
        "description": "High-quality biogas unit for domestic use",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z",
        "__v": 0
    }
}
```

---

### **2. Get All Products (GET) - Public**
- **Method**: GET
- **URL**: `http://localhost:3003/api/products`
- **Headers**: `Content-Type: application/json`

**Expected Response (Status 200)**:
```json
{
    "products": [
        {
            "_id": "64a7b8c9d1e2f3g4h5i6j7k8",
            "name": "Biogas Unit Premium",
            "type": "biogas",
            "capacity": "500L",
            "price": 25000,
            "warrantyPeriod": "2 years",
            "description": "High-quality biogas unit for domestic use",
            "createdAt": "2024-01-15T10:30:00.000Z",
            "updatedAt": "2024-01-15T10:30:00.000Z"
        },
        {
            "_id": "64a7b8c9d1e2f3g4h5i6j7k9",
            "name": "Organic Fertilizer Premium",
            "type": "fertilizer",
            "price": 500,
            "description": "Premium organic fertilizer for agriculture",
            "createdAt": "2024-01-15T10:35:00.000Z",
            "updatedAt": "2024-01-15T10:35:00.000Z"
        }
    ]
}
```

---

### **3. Get Single Product by ID (GET) - Public**
- **Method**: GET
- **URL**: `http://localhost:3003/api/products/PRODUCT_ID_HERE`
- **Headers**: `Content-Type: application/json`

**Example URL**: `http://localhost:3003/api/products/64a7b8c9d1e2f3g4h5i6j7k8`

**Expected Response (Status 200)**:
```json
{
    "product": {
        "_id": "64a7b8c9d1e2f3g4h5i6j7k8",
        "name": "Biogas Unit Premium",
        "type": "biogas",
        "capacity": "500L",
        "price": 25000,
        "warrantyPeriod": "2 years",
        "description": "High-quality biogas unit for domestic use",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
    }
}
```

**Error Response (Status 404)**:
```json
{
    "message": "Product not found"
}
```

---

### **4. Update Product (PUT) - Admin Only**
- **Method**: PUT
- **URL**: `http://localhost:3003/api/products/PRODUCT_ID_HERE`
- **Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer YOUR_ADMIN_TOKEN
  ```

**Example URL**: `http://localhost:3003/api/products/64a7b8c9d1e2f3g4h5i6j7k8`

**Body**:
```json
{
    "price": 28000,
    "description": "Updated: High-quality biogas unit with enhanced features",
    "warrantyPeriod": "3 years"
}
```

**Expected Response (Status 200)**:
```json
{
    "message": "Product updated successfully",
    "updated": {
        "_id": "64a7b8c9d1e2f3g4h5i6j7k8",
        "name": "Biogas Unit Premium",
        "type": "biogas",
        "capacity": "500L",
        "price": 28000,
        "warrantyPeriod": "3 years",
        "description": "Updated: High-quality biogas unit with enhanced features",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T11:00:00.000Z"
    }
}
```

---

### **5. Delete Product (DELETE) - Admin Only**
- **Method**: DELETE
- **URL**: `http://localhost:3003/api/products/PRODUCT_ID_HERE`
- **Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer YOUR_ADMIN_TOKEN
  ```

**Example URL**: `http://localhost:3003/api/products/64a7b8c9d1e2f3g4h5i6j7k9`

**Expected Response (Status 200)**:
```json
{
    "message": "Product deleted successfully"
}
```

---

## 🧪 Product Testing Scenarios

### **✅ Valid Test Cases:**

#### **Test 1: Create Biogas Product**
```json
{
    "name": "Compact Biogas Unit",
    "type": "biogas",
    "capacity": "200L",
    "price": 15000,
    "warrantyPeriod": "1 year",
    "description": "Compact biogas unit for small households"
}
```

#### **Test 2: Create Fertilizer Product**
```json
{
    "name": "Bio-Compost Fertilizer",
    "type": "fertilizer",
    "price": 300,
    "description": "Natural compost fertilizer for organic farming"
}
```

#### **Test 3: Update Product Price Only**
```json
{
    "price": 17500
}
```

### **❌ Error Test Cases:**

#### **Test 4: Missing Required Fields**
```json
{
    "type": "biogas",
    "price": 25000
}
```
**Expected Error**: `{"message": "Product validation failed"}`

#### **Test 5: Invalid Product Type**
```json
{
    "name": "Invalid Product",
    "type": "invalid_type",
    "price": 1000
}
```
**Expected Error**: `{"message": "Product validation failed"}`

#### **Test 6: Negative Price**
```json
{
    "name": "Invalid Price Product",
    "type": "fertilizer",
    "price": -500
}
```
**Expected Error**: `{"message": "Product validation failed"}`

#### **Test 7: Unauthorized Access (No Token)**
Try to create/update/delete product without Authorization header.
**Expected Error**: `{"message": "No token, authorization denied"}`

#### **Test 8: Invalid Token**
Use invalid token in Authorization header.
**Expected Error**: `{"message": "Token is not valid"}`

---

## 📋 Complete Product Testing Workflow

### **Step 1: Authentication**
1. Login as admin user
2. Copy the authentication token
3. Set Authorization header for admin operations

### **Step 2: Create Products**
1. Create a biogas product
2. Create a fertilizer product
3. Verify both products are created successfully

### **Step 3: Read Operations**
1. Get all products list
2. Get single product by ID
3. Verify product details

### **Step 4: Update Operations**
1. Update product price
2. Update product description
3. Verify changes are applied

### **Step 5: Delete Operations**
1. Delete a test product
2. Verify product is removed
3. Try to get deleted product (should return 404)

---

## 🚀 Quick Test Commands (curl)

### **Create Product (Admin)**:
```bash
curl -X POST http://localhost:3003/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Test Biogas Unit",
    "type": "biogas",
    "capacity": "300L",
    "price": 20000,
    "warrantyPeriod": "2 years"
  }'
```

### **Get All Products**:
```bash
curl -X GET http://localhost:3003/api/products \
  -H "Content-Type: application/json"
```

### **Get Single Product**:
```bash
curl -X GET http://localhost:3003/api/products/PRODUCT_ID_HERE \
  -H "Content-Type: application/json"
```

### **Update Product (Admin)**:
```bash
curl -X PUT http://localhost:3003/api/products/PRODUCT_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"price": 22000, "description": "Updated description"}'
```

### **Delete Product (Admin)**:
```bash
curl -X DELETE http://localhost:3003/api/products/PRODUCT_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## ✅ Product Testing Success Indicators

- **Create**: Status 201 + Product object in response
- **Get All**: Status 200 + Array of products
- **Get Single**: Status 200 + Single product object
- **Update**: Status 200 + Updated product object
- **Delete**: Status 200 + Success message
- **Auth Errors**: Status 401 for missing/invalid tokens
- **Validation Errors**: Status 500 for invalid data

Test all CRUD operations to ensure complete product management functionality! 🎯
