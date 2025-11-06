# Payment System Postman Testing Guide

This guide provides step-by-step instructions for testing the complete payment system using Postman.

## 📋 Prerequisites

1. **Start Your Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```
   Server should run on `http://localhost:3003`

2. **Install Postman:**
   - Download from [postman.com](https://www.postman.com/downloads/)
   - Create account (free)

3. **Setup Environment Variables in Postman:**
   - Click on "Environments" tab (eye icon)
   - Click "+ Create"
   - Add these variables:
     ```
     baseUrl: http://localhost:3003
     authToken: [will be filled after login]
     paymentId: [will be filled after creating payment]
     ```

---

## 🔐 Step 1: Login & Get Authentication Token

**Request Details:**
- **Method:** POST
- **URL:** `{{baseUrl}}/api/users/login`
- **Headers:** 
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "email": "your-email@example.com",
    "password": "your-password"
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
            "name": "John Doe",
            "email": "your-email@example.com"
        }
    }
}
```

**✅ Action:**
Copy the token value and update your Postman environment variable `authToken` with this value.

---

## 💳 Step 2: Create Payment Intent

**Request Details:**
- **Method:** POST
- **URL:** `{{baseUrl}}/api/payments/create-intent`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer {{authToken}}
  ```
- **Body (raw JSON):**
  ```json
  {
    "amount": 50.00,
    "currency": "usd",
    "description": "Test payment for product purchase",
    "metadata": {
        "productId": "prod_123",
        "orderType": "test"
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
        "paymentId": "507f1f77bcf86cd799439012",
        "amount": 50,
        "currency": "usd"
    }
}
```

**✅ Action:**
Copy the `paymentId` value and update your Postman environment variable `paymentId` with this value.

---

## ✅ Step 3: Confirm Payment

**Request Details:**
- **Method:** POST
- **URL:** `{{baseUrl}}/api/payments/confirm`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer {{authToken}}
  ```
- **Body (raw JSON):**
  ```json
  {
    "paymentIntentId": "pi_1234567890abcdef"
  }
  ```
  *Note: Use the paymentIntentId from Step 2 response or use the clientSecret without "_secret_" part*

**Expected Response (200):**
```json
{
    "success": true,
    "message": "Payment confirmed successfully",
    "data": {
        "paymentId": "507f1f77bcf86cd799439012",
        "status": "succeeded",
        "amount": 50,
        "currency": "usd"
    }
}
```

---

## 📜 Step 4: Get Payment History

**Request Details:**
- **Method:** GET
- **URL:** `{{baseUrl}}/api/payments/history?page=1&limit=5`
- **Headers:**
  ```
  Authorization: Bearer {{authToken}}
  ```

**Expected Response (200):**
```json
{
    "success": true,
    "message": "Payment history retrieved successfully",
    "data": {
        "payments": [
            {
                "_id": "507f1f77bcf86cd799439012",
                "userId": "507f1f77bcf86cd799439011",
                "stripePaymentIntentId": "pi_1234567890abcdef",
                "amount": 50,
                "currency": "usd",
                "status": "succeeded",
                "paymentMethod": "card",
                "description": "Test payment for product purchase",
                "createdAt": "2025-01-06T11:00:00.000Z",
                "updatedAt": "2025-01-06T11:05:00.000Z"
            }
        ],
        "pagination": {
            "currentPage": 1,
            "totalPages": 1,
            "totalPayments": 1,
            "hasNext": false,
            "hasPrev": false
        }
    }
}
```

---

## 🔍 Step 5: Get Specific Payment Details

**Request Details:**
- **Method:** GET
- **URL:** `{{baseUrl}}/api/payments/{{paymentId}}`
- **Headers:**
  ```
  Authorization: Bearer {{authToken}}
  ```

**Expected Response (200):**
```json
{
    "success": true,
    "message": "Payment retrieved successfully",
    "data": {
        "_id": "507f1f77bcf86cd799439012",
        "userId": {
            "_id": "507f1f77bcf86cd799439011",
            "name": "John Doe",
            "email": "your-email@example.com"
        },
        "orderId": null,
        "stripePaymentIntentId": "pi_1234567890abcdef",
        "amount": 50,
        "currency": "usd",
        "status": "succeeded",
        "paymentMethod": "card",
        "description": "Test payment for product purchase",
        "metadata": {
            "productId": "prod_123",
            "orderType": "test"
        },
        "createdAt": "2025-01-06T11:00:00.000Z",
        "updatedAt": "2025-01-06T11:05:00.000Z"
    }
}
```

---

## ❌ Step 6: Cancel Payment (Optional - Test with Pending Payment)

**Note:** First create a new payment without confirming it, then cancel it.

**Request Details:**
- **Method:** PATCH
- **URL:** `{{baseUrl}}/api/payments/{{paymentId}}/cancel`
- **Headers:**
  ```
  Authorization: Bearer {{authToken}}
  ```

**Expected Response (200):**
```json
{
    "success": true,
    "message": "Payment canceled successfully",
    "data": {
        "paymentId": "507f1f77bcf86cd799439013",
        "status": "canceled"
    }
}
```

---

## 🚨 Error Testing Scenarios

### Test 1: Invalid Payment Amount
- **URL:** `{{baseUrl}}/api/payments/create-intent`
- **Body:** `{"amount": -10, "currency": "usd"}`
- **Expected:** 400 - "Amount must be greater than 0"

### Test 2: Missing Authorization
- **URL:** `{{baseUrl}}/api/payments/history`
- **Headers:** Remove `Authorization` header
- **Expected:** 401 - Unauthorized

### Test 3: Invalid Payment ID
- **URL:** `{{baseUrl}}/api/payments/invalid123`
- **Expected:** 404 - "Payment not found"

### Test 4: Cancel Non-Pending Payment
- **URL:** `{{baseUrl}}/api/payments/{{paymentId}}/cancel`
- **Note:** Try to cancel an already succeeded payment
- **Expected:** 400 - "Only pending payments can be canceled"

---

## 🔧 Troubleshooting

### Common Issues & Solutions:

1. **"Payment system is not properly configured"**
   - Check your `.env` file for `STRIPE_SECRET_KEY`
   - Ensure it's not the placeholder value

2. **"Invalid or expired token"**
   - Login again to get a fresh token
   - Update your `authToken` environment variable

3. **"Cannot read property 'id' of undefined"**
   - Ensure you're logged in and have a valid token
   - Check that the user exists in the database

4. **CORS Errors**
   - Ensure your backend is running
   - Check CORS configuration in `app.js`

### Check Database:
```bash
# Connect to MongoDB and check payments collection
# Look for documents with status: "pending", "succeeded", "canceled"
```

### Server Logs:
- Check your terminal for detailed error messages
- Look for Stripe API errors
- Verify database connection status

---

## 📝 Testing Checklist

- [ ] Login and get auth token
- [ ] Create payment intent successfully
- [ ] Confirm payment successfully  
- [ ] Get payment history with pagination
- [ ] Get specific payment details
- [ ] Cancel pending payment (optional)
- [ ] Test error scenarios
- [ ] Verify database records
- [ ] Check server logs for any errors

---

## 🎯 Success Indicators

✅ All endpoints return 200 status codes for valid requests  
✅ Error scenarios return appropriate 400/401/404 codes  
✅ Payment status changes correctly (pending → succeeded/canceled)  
✅ Database records are created and updated properly  
✅ Authentication works correctly  
✅ Pagination works in payment history  

You've successfully tested the complete payment system! 🎉
