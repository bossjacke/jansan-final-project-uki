# 🚀 Complete E-commerce Postman Testing Guide - User Login to Payment

## 📋 Prerequisites
1. **Backend Server Running:**
   ```bash
   cd backend
   npm start
   ```
   Server: `http://localhost:3003`

2. **Postman Environment Setup:**
   - Create Environment Variables:
   ```
   baseUrl: http://localhost:3003
   userToken: [will be filled after login]
   productId: [will be filled after getting products]
   cartId: [will be filled after cart operations]
   orderId: [will be filled after order creation]
   paymentId: [will be filled after payment creation]
   ```

---

## 🔐 STEP 1: USER LOGIN & AUTHENTICATION

### **1.1 User Login**
```
POST {{baseUrl}}/api/users/login
Headers: Content-Type: application/json
Body: {
    "email": "test@example.com",
    "password": "password123"
}
```

**Expected Response (200):**
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
            "id": "507f1f77bcf86cd799439011",
            "name": "Test User",
            "email": "test@example.com"
        }
    }
}
```

**✅ Action:** Copy token and set `userToken` environment variable

---

## 🛍️ STEP 2: VIEW PRODUCTS

### **2.1 Get All Products**
```
GET {{baseUrl}}/api/products
Headers: Content-Type: application/json
```

**Expected Response (200):**
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
            "description": "High-quality biogas unit for domestic use"
        }
    ]
}
```

**✅ Action:** Copy any product `_id` and set `productId` environment variable

---

## 🛒 STEP 3: CART OPERATIONS

### **3.1 Get User Cart**
```
GET {{baseUrl}}/api/cart/
Headers: 
    Content-Type: application/json
    Authorization: Bearer {{userToken}}
```

### **3.2 Add Item to Cart**
```
POST {{baseUrl}}/api/cart/add
Headers: 
    Content-Type: application/json
    Authorization: Bearer {{userToken}}
Body: {
    "productId": "{{productId}}",
    "quantity": 1
}
```

**Expected Response (200):**
```json
{
    "success": true,
    "message": "Item added to cart successfully",
    "data": {
        "_id": "cart123",
        "userId": "507f1f77bcf86cd799439011",
        "items": [
            {
                "productId": {
                    "_id": "64a7b8c9d1e2f3g4h5i6j7k8",
                    "name": "Biogas Unit Premium",
                    "type": "biogas",
                    "price": 25000
                },
                "quantity": 1,
                "price": 25000
            }
        ],
        "totalAmount": 25000
    }
}
```

### **3.3 Get Cart Summary**
```
GET {{baseUrl}}/api/cart/summary
Headers: 
    Authorization: Bearer {{userToken}}
```

---

## 📦 STEP 4: ORDER OPERATIONS

### **4.1 Get Customer Orders**
```
GET {{baseUrl}}/api/orders/
Headers: 
    Authorization: Bearer {{userToken}}
```

### **4.2 Create Order from Cart**
```
POST {{baseUrl}}/api/orders/create
Headers: 
    Content-Type: application/json
    Authorization: Bearer {{userToken}}
Body: {
    "items": [
        {
            "productId": "{{productId}}",
            "quantity": 1,
            "price": 25000
        }
    ],
    "totalAmount": 25000
}
```

**Expected Response (201):**
```json
{
    "success": true,
    "message": "Order created successfully",
    "data": {
        "_id": "order123",
        "userId": "507f1f77bcf86cd799439011",
        "items": [...],
        "totalAmount": 25000,
        "orderStatus": "pending",
        "createdAt": "2025-01-06T10:30:00.000Z"
    }
}
```

**✅ Action:** Copy order `_id` and set `orderId` environment variable

---

## 💳 STEP 5: PAYMENT OPERATIONS

### **5.1 Create Payment Intent**
```
POST {{baseUrl}}/api/payments/create-intent
Headers: 
    Content-Type: application/json
    Authorization: Bearer {{userToken}}
Body: {
    "amount": 250.00,
    "currency": "usd",
    "description": "Payment for order 690dbccdae4df57d7756c87d",
    "metadata": {
        "orderId": "690dbccdae4df57d7756c87d",
        "orderType": "product_purchase"
    }
}
```

**Expected Response (200):**
```json
{
    "success": true,
    "message": "Payment intent created successfully",
    "data": {
        "clientSecret": "pi_1234567890abcdef_secret_abcdefghijk",
        "paymentId": "pay123",
        "amount": 250,
        "currency": "usd"
    }
}
```

**✅ Action:** Copy `paymentId` and set environment variable

### **5.2 Confirm Payment**
```
POST {{baseUrl}}/api/payments/confirm
Headers: 
    Content-Type: application/json
    Authorization: Bearer {{userToken}}
Body: {
    "paymentIntentId": "pi_1234567890abcdef"
}
```

**Expected Response (200):**
```json
{
    "success": true,
    "message": "Payment confirmed successfully",
    "data": {
        "paymentId": "pay123",
        "status": "succeeded",
        "amount": 250,
        "currency": "usd"
    }
}
```

### **5.3 Get Payment History**
```
GET {{baseUrl}}/api/payments/history?page=1&limit=5
Headers: 
    Authorization: Bearer {{userToken}}
```

---

## 🔍 STEP 6: VERIFICATION

### **6.1 Check Updated Order Status**
```
GET {{baseUrl}}/api/orders/
Headers: 
    Authorization: Bearer {{userToken}}
```

### **6.2 Get Specific Order Details**
```
GET {{baseUrl}}/api/orders/{{orderId}}
Headers: 
    Authorization: Bearer {{userToken}}
```

### **6.3 Get Payment Details**
```
GET {{baseUrl}}/api/payments/{{paymentId}}
Headers: 
    Authorization: Bearer {{userToken}}
```

---

## ❌ ERROR TESTING SCENARIOS

### **Test 1: Invalid Login**
```
POST {{baseUrl}}/api/users/login
Body: {
    "email": "wrong@example.com",
    "password": "wrongpassword"
}
```
**Expected:** 401 - Invalid credentials

### **Test 2: Access Cart Without Token**
```
GET {{baseUrl}}/api/cart/
```
**Expected:** 401 - No token provided

### **Test 3: Add Invalid Product to Cart**
```
POST {{baseUrl}}/api/cart/add
Headers: Authorization: Bearer {{userToken}}
Body: {
    "productId": "invalidProductId",
    "quantity": 1
}
```
**Expected:** 404 - Product not found

### **Test 4: Invalid Payment Amount**
```
POST {{baseUrl}}/api/payments/create-intent
Headers: Authorization: Bearer {{userToken}}
Body: {
    "amount": -100,
    "currency": "usd"
}
```
**Expected:** 400 - Amount must be greater than 0

---

## 🧪 COMPLETE TESTING WORKFLOW

### **Sequential Testing Order:**
1. **Login** → Get token
2. **View Products** → Get product ID
3. **Add to Cart** → Verify cart updated
4. **Create Order** → Get order ID
5. **Create Payment** → Get payment ID
6. **Confirm Payment** → Verify success
7. **Check History** → Verify all records

### **Environment Variable Updates:**
- After login: `userToken`
- After products: `productId`
- After order: `orderId`
- After payment: `paymentId`

---

## 📝 POSTMAN TEST SCRIPTS

### **For Login Request (Tests Tab):**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.data && response.data.token) {
        pm.environment.set("userToken", response.data.token);
    }
}
pm.test("Login successful", function () {
    pm.response.to.have.status(200);
    pm.expect(pm.response.json()).to.have.property('success');
});
```

### **For Get Products Request (Tests Tab):**
```javascript
pm.test("Products retrieved", function () {
    pm.response.to.have.status(200);
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('products');
    pm.expect(jsonData.products).to.be.an('array');
});

if (pm.response.code === 200 && pm.response.json().products.length > 0) {
    const firstProduct = pm.response.json().products[0];
    pm.environment.set("productId", firstProduct._id);
}
```

### **For Payment Create Request (Tests Tab):**
```javascript
pm.test("Payment intent created", function () {
    pm.response.to.have.status(200);
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData.data).to.have.property('paymentId');
});

if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("paymentId", response.data.paymentId);
}
```

---

## ✅ SUCCESS INDICATORS

- **Authentication**: Token received and stored
- **Products**: Product list retrieved successfully
- **Cart**: Items added and cart total calculated
- **Orders**: Order created with pending status
- **Payment**: Payment intent created and confirmed
- **History**: All transactions recorded properly

---

## 🚨 TROUBLESHOOTING

### **Common Issues:**
1. **CORS Errors**: Ensure backend allows Postman requests
2. **Token Issues**: Re-login if token expires
3. **Database Connection**: Check MongoDB connection
4. **Port Conflicts**: Ensure server runs on 3003

### **Quick Fixes:**
```bash
# Restart server
cd backend && npm start

# Check environment variables
echo $PORT
echo $MONGODB_URI

# Clear Postman cache
# File → Settings → Data → Clear → Clear All
```

---

## 🎯 ONE-LINE TESTING SUMMARY

**Complete Flow:** `Login → Get Products → Add to Cart → Create Order → Make Payment → Verify Success`

**All requests use:** `Authorization: Bearer {{userToken}}` (except login)

**Base URL:** `{{baseUrl}}` = `http://localhost:3003`

**Environment Variables:** `userToken`, `productId`, `orderId`, `paymentId`

---

## 📞 SUPPORT

If you encounter any issues:
1. Check server console logs
2. Verify database connection
3. Ensure all environment variables are set
4. Test each step individually before proceeding to next

**Happy Testing! 🚀**
