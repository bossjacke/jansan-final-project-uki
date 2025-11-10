# 🚀 Complete E-commerce Postman Testing Guide - Registration to Payment

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

## 🔐 STEP 1: USER REGISTRATION & AUTHENTICATION

### **1.1 User Registration (New User)**
```
POST {{baseUrl}}/api/auth/register
Headers: Content-Type: application/json
Body: {
    "name": "Test User",
    "email": "testuser@example.com",
    "phone": "1234567890",
    "password": "password123",
    "location": "Chennai, Tamil Nadu",
    "role": "customer"
}
```

**Expected Response (201):**
```json
{
    "message": "User registered successfully",
    "user": {
        "id": "507f1f77bcf86cd799439011",
        "name": "Test User",
        "email": "testuser@example.com",
        "role": "customer"
    }
}
```

### **1.2 User Login**
```
POST {{baseUrl}}/api/auth/login
Headers: Content-Type: application/json
Body: {
    "email": "testuser@example.com",
    "password": "password123"
}
```

**Expected Response (200):**
```json
{
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": "507f1f77bcf86cd799439011",
        "name": "Test User",
        "email": "testuser@example.com",
        "role": "customer"
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

## 📦 STEP 4: ORDER CREATION WITH PAYMENT OPTIONS

### **4.1 Get Customer Orders (Check Existing)**
```
GET {{baseUrl}}/api/orders/my
Headers: 
    Authorization: Bearer {{userToken}}
```

### **4.2 Create Order with CASH ON DELIVERY**
```
POST {{baseUrl}}/api/orders/create
Headers: 
    Content-Type: application/json
    Authorization: Bearer {{userToken}}
Body: {
    "paymentMethod": "cash"
}
```

**📋 COMPLETE JSON STRUCTURE (if needed):**
```json
{
    "paymentMethod": "cash",
    "shippingAddress": {
        "fullName": "Test User",
        "phone": "1234567890",
        "addressLine1": "123 Main Street",
        "city": "Chennai",
        "postalCode": "600001",
        "country": "India"
    }
}
```

**Expected Response (201):**
```json
{
    "success": true,
    "message": "Order created successfully",
    "data": {
        "order": {
            "_id": "order123",
            "userId": "507f1f77bcf86cd799439011",
            "products": [
                {
                    "productId": "64a7b8c9d1e2f3g4h5i6j7k8",
                    "quantity": 1,
                    "price": 25000
                }
            ],
            "totalAmount": 25000,
            "paymentMethod": "cash",
            "paymentStatus": "pending",
            "orderStatus": "Processing",
            "deliveryLocation": "Chennai, Tamil Nadu",
            "orderNumber": "ORD-1704123456789-ABC123XYZ"
        }
    }
}
```

### **4.3 Create Order with CARD PAYMENT**
```
POST {{baseUrl}}/api/orders/create
Headers: 
    Content-Type: application/json
    Authorization: Bearer {{userToken}}
Body: {
    "paymentMethod": "card"
}
```

**📋 COMPLETE JSON STRUCTURE (if needed):**
```json
{
    "paymentMethod": "card",
    "shippingAddress": {
        "fullName": "Test User",
        "phone": "1234567890", 
        "addressLine1": "123 Main Street",
        "city": "Chennai",
        "postalCode": "600001",
        "country": "India"
    }
}
```

**Expected Response (201):**
```json
{
    "success": true,
    "message": "Order created successfully",
    "data": {
        "order": {
            "_id": "order123",
            "userId": "507f1f77bcf86cd799439011",
            "products": [
                {
                    "productId": "64a7b8c9d1e2f3g4h5i6j7k8",
                    "quantity": 1,
                    "price": 25000
                }
            ],
            "totalAmount": 25000,
            "paymentMethod": "card",
            "paymentStatus": "pending",
            "orderStatus": "Processing",
            "orderNumber": "ORD-1704123456789-ABC123XYZ"
        },
        "clientSecret": "pi_1234567890abcdef_secret_abcdefghijk"
    }
}
```

**✅ Action:** Copy order `_id` and set `orderId` environment variable

---

## 💳 STEP 5: PAYMENT PROCESSING

### **5.1 For Cash on Delivery Orders**
No additional payment steps needed! Order is created and will be delivered.

### **5.2 For Card Payment - Simulate Card Details Form**
In a real frontend, user would see a card form. For testing, we'll use the clientSecret:

**Card Details (for testing with Stripe):**
- Card Number: `4242 4242 4242 4242`
- Expiry: `12/25`
- CVV: `123`
- Name: `Test User`

### **5.3 Confirm Card Payment**
```
POST {{baseUrl}}/api/orders/confirm
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
        "orderId": "order123",
        "paymentStatus": "succeeded",
        "message": "Your order has been placed successfully. It will arrive in 3 days."
    }
}
```

### **5.4 Get Payment History**
```
GET {{baseUrl}}/api/payments/history?page=1&limit=5
Headers: 
    Authorization: Bearer {{userToken}}
```

---

## 🔍 STEP 6: VERIFICATION

### **6.1 Check Updated Order Status**
```
GET {{baseUrl}}/api/orders/my
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
POST {{baseUrl}}/api/auth/login
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

## 🧪 COMPLETE TESTING WORKFLOWS

### **WORKFLOW 1: CASH ON DELIVERY FLOW**
1. **Register** → Create new user account
2. **Login** → Get authentication token
3. **View Products** → Get product ID
4. **Add to Cart** → Verify cart updated
5. **Create Order (Cash)** → Order created with cash payment
6. **Verify Order** → Check order status
7. **Check History** → Verify order records

### **WORKFLOW 2: CARD PAYMENT FLOW**
1. **Register** → Create new user account
2. **Login** → Get authentication token
3. **View Products** → Get product ID
4. **Add to Cart** → Verify cart updated
5. **Create Order (Card)** → Get clientSecret for payment
6. **Simulate Card Payment** → Use test card details
7. **Confirm Payment** → Verify payment success
8. **Check History** → Verify payment and order records

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
5. **❌ ORDER CREATION FAILS**: **Cart is empty!** You MUST add products to cart first

### **🔥 ORDER CREATION TROUBLESHOOTING:**

**Problem:** "Cart is empty" error when creating order

**Solution:** Follow these steps EXACTLY:
1. ✅ Register & Login (get token)
2. ✅ Get Products (copy product ID)
3. ✅ Add to Cart (IMPORTANT!)
4. ✅ Verify Cart has items
5. ✅ Create Order

**Quick Test:**
```bash
# Check if products exist in database
cd backend
node -e "
const mongoose = require('mongoose');
const Product = require('./src/models/product.model.js');
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const count = await Product.countDocuments();
  console.log('Products in DB:', count);
  process.exit(0);
});
"

# Create sample products if needed
cd backend && node scripts/create-products.js
```

### **Quick Fixes:**
```bash
# Restart server
cd backend && npm start

# Check environment variables
echo $PORT
echo $MONGO_URI

# Create sample products
cd backend && node scripts/create-products.js

# Clear Postman cache
# File → Settings → Data → Clear → Clear All
```

### **📋 ORDER CREATION CHECKLIST:**
- [ ] User logged in? (Token in headers)
- [ ] Products exist in database?
- [ ] Items added to cart?
- [ ] Cart not empty?
- [ ] User has location? (Required for order)

---

## 🎯 ONE-LINE TESTING SUMMARY

**Cash on Delivery Flow:** `Register → Login → Get Products → Add to Cart → Create Order (Cash) → Verify Success`

**Card Payment Flow:** `Register → Login → Get Products → Add to Cart → Create Order (Card) → Confirm Payment → Verify Success`

**All requests use:** `Authorization: Bearer {{userToken}}` (except register and login)

**Base URL:** `{{baseUrl}}` = `http://localhost:3003`

**Environment Variables:** `userToken`, `productId`, `orderId`, `paymentId`

**Payment Options:**
- `"paymentMethod": "cash"` → Cash on delivery (no additional steps)
- `"paymentMethod": "card"` → Card payment (requires confirmation)

---

## 📞 SUPPORT

If you encounter any issues:
1. Check server console logs
2. Verify database connection
3. Ensure all environment variables are set
4. Test each step individually before proceeding to next

**Happy Testing! 🚀**

## 💡 TAMIL GUIDE (தமிழ் வழிகாட்டி)

### **படிப்படியான பரிசோதனை:**

1. **பயனர் பதிவு** → புதிய கணக்கு உருவாக்கம்
2. **உள்நுழைவு** → டோக்கன் பெறுதல்
3. **தயாரிப்புகள் பார்க்க** → தயாரிப்பு ஐடி பெறுதல்
4. **கார்ட்டில் சேர்க்க** → கார்ட் புதுப்பித்தல்
5. **ஆர்டர் புருவாக்கம்** → கட்டண முறை தேர்வு
   - **பணம் வழங்கும் போது** (Cash on delivery) → நேரடி ஆர்டர்
   - **கார்டு கட்டணம்** (Card payment) → கார்டு விவரங்கள் மற்றும் உறுதிப்படுத்தல்
6. **ஆர்டர் உறுதிப்படுத்தல்** → வெற்றி சரிபார்ப்பு

### **கட்டண விருப்பங்கள்:**
- **"paymentMethod": "cash"** → டெலிவரியின் போது பணம் செலுத்துதல்
- **"paymentMethod": "card"** → கார்டு மூலம் கட்டணம் செலுத்துதல்

**வெற்றியான பரிசோதனை! 🎉**
