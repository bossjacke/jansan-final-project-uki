# Payment Schema - Postman Testing Guide

This guide demonstrates how the simplified Payment schema works in real-world scenarios using Postman.

## 🏗️ Payment Schema Overview

```javascript
// Simplified Payment Model Fields
{
  userId: ObjectId,           // Reference to User model (required)
  orderId: ObjectId,          // Reference to Order model (optional)
  stripePaymentIntentId: String, // Stripe payment ID (conditional)
  amount: Number,             // Payment amount (required)
  currency: String,           // Currency code (default: "usd")
  status: String,             // Payment status (pending/succeeded/failed/canceled)
  paymentMethod: String,      // Payment method (card/paypal/bank_transfer/cash_on_delivery)
  description: String,        // Payment description (optional)
  metadata: Object,           // Additional data (default: {})
  createdAt: Date,            // Auto-managed timestamp
  updatedAt: Date             // Auto-managed timestamp
}
```

## 🚀 Postman Collection Setup

### Base URL
```
{{BASE_URL}}/api/payments
```

### Headers
```
Content-Type: application/json
Authorization: Bearer {{JWT_TOKEN}}
```

## 📋 Use Case 1: Create Payment Intent (Card Payment)

### Request
```http
POST {{BASE_URL}}/api/payments/create-intent
```

### Body
```json
{
  "amount": 99.99,
  "currency": "usd",
  "description": "Payment for Order #12345",
  "metadata": {
    "orderId": "64a1b2c3d4e5f6789012345",
    "productType": "electronics"
  }
}
```

### Response (201)
```json
{
  "success": true,
  "message": "Payment intent created successfully",
  "data": {
    "clientSecret": "pi_1234567890_secret_abcdefghijk",
    "paymentId": "64a1b2c3d4e5f6789012346",
    "amount": 99.99,
    "currency": "usd"
  }
}
```

### Database Record Created
```json
{
  "_id": "64a1b2c3d4e5f6789012346",
  "userId": "64a1b2c3d4e5f6789012340",
  "orderId": null,
  "stripePaymentIntentId": "pi_1234567890",
  "amount": 99.99,
  "currency": "usd",
  "status": "pending",
  "paymentMethod": "card",
  "description": "Payment for Order #12345",
  "metadata": {
    "orderId": "64a1b2c3d4e5f6789012345",
    "productType": "electronics"
  },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

## ✅ Use Case 2: Confirm Successful Payment

### Request
```http
POST {{BASE_URL}}/api/payments/confirm
```

### Body
```json
{
  "paymentIntentId": "pi_1234567890"
}
```

### Response (200)
```json
{
  "success": true,
  "message": "Payment confirmed successfully",
  "data": {
    "paymentId": "64a1b2c3d4e5f6789012346",
    "status": "succeeded",
    "amount": 99.99,
    "currency": "usd"
  }
}
```

### Database Record Updated
```json
{
  "_id": "64a1b2c3d4e5f6789012346",
  "userId": "64a1b2c3d4e5f6789012340",
  "stripePaymentIntentId": "pi_1234567890",
  "amount": 99.99,
  "status": "succeeded",  // Updated from "pending"
  "paymentMethod": "card",
  "updatedAt": "2024-01-15T10:35:00.000Z"  // Timestamp updated
}
```

## 💵 Use Case 3: Cash on Delivery Payment

### Request (Create Order with COD)
```http
POST {{BASE_URL}}/api/orders
```

### Body
```json
{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "cash_on_delivery"
}
```

### Database Record for COD Payment
```json
{
  "_id": "64a1b2c3d4e5f6789012347",
  "userId": "64a1b2c3d4e5f6789012340",
  "orderId": "64a1b2c3d4e5f6789012348",
  "stripePaymentIntentId": null,  // Not required for COD
  "amount": 149.99,
  "currency": "usd",
  "status": "pending",
  "paymentMethod": "cash_on_delivery",
  "description": "Cash on delivery for Order #12346",
  "metadata": {},
  "createdAt": "2024-01-15T11:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

## 📊 Use Case 4: Get Payment History

### Request
```http
GET {{BASE_URL}}/api/payments/history?page=1&limit=5&status=succeeded
```

### Response (200)
```json
{
  "success": true,
  "message": "Payment history retrieved successfully",
  "data": {
    "payments": [
      {
        "_id": "64a1b2c3d4e5f6789012346",
        "userId": "64a1b2c3d4e5f6789012340",
        "orderId": null,
        "amount": 99.99,
        "currency": "usd",
        "status": "succeeded",
        "paymentMethod": "card",
        "description": "Payment for Order #12345",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:35:00.000Z"
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

## 🔍 Use Case 5: Get Specific Payment Details

### Request
```http
GET {{BASE_URL}}/api/payments/64a1b2c3d4e5f6789012346
```

### Response (200)
```json
{
  "success": true,
  "message": "Payment retrieved successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6789012346",
    "userId": {
      "_id": "64a1b2c3d4e5f6789012340",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "orderId": null,
    "stripePaymentIntentId": "pi_1234567890",
    "amount": 99.99,
    "currency": "usd",
    "status": "succeeded",
    "paymentMethod": "card",
    "description": "Payment for Order #12345",
    "metadata": {
      "orderId": "64a1b2c3d4e5f6789012345",
      "productType": "electronics"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

## ❌ Use Case 6: Cancel Pending Payment

### Request
```http
PATCH {{BASE_URL}}/api/payments/64a1b2c3d4e5f6789012349/cancel
```

### Response (200)
```json
{
  "success": true,
  "message": "Payment canceled successfully",
  "data": {
    "paymentId": "64a1b2c3d4e5f6789012349",
    "status": "canceled"
  }
}
```

## 🔄 Use Case 7: Failed Payment Scenario

### Request (Confirm Failed Payment)
```http
POST {{BASE_URL}}/api/payments/confirm
```

### Body
```json
{
  "paymentIntentId": "pi_failed_payment_123"
}
```

### Response (200)
```json
{
  "success": true,
  "message": "Payment confirmed successfully",
  "data": {
    "paymentId": "64a1b2c3d4e5f678901234a",
    "status": "failed",
    "amount": 49.99,
    "currency": "usd"
  }
}
```

## 🧪 Test Scenarios

### Scenario 1: Complete Payment Flow
1. Create payment intent → Status: `pending`
2. Confirm payment → Status: `succeeded`
3. Get payment details → Verify all fields

### Scenario 2: Cash on Delivery Flow
1. Create order with COD → No stripePaymentIntentId
2. Payment status remains `pending` until delivery
3. Manual status update to `succeeded` after delivery

### Scenario 3: Payment Cancellation
1. Create payment intent → Status: `pending`
2. Cancel payment → Status: `canceled`
3. Verify updatedAt timestamp changed

### Scenario 4: Payment History Filtering
1. Get all payments → No status filter
2. Get succeeded payments → `?status=succeeded`
3. Get failed payments → `?status=failed`
4. Paginate results → `?page=1&limit=10`

## 📝 Schema Validation Examples

### Valid Payment Methods
```json
"paymentMethod": "card"              // ✅ Valid
"paymentMethod": "paypal"            // ✅ Valid
"paymentMethod": "bank_transfer"     // ✅ Valid
"paymentMethod": "cash_on_delivery"  // ✅ Valid
"paymentMethod": "crypto"             // ❌ Invalid - will return error
```

### Valid Status Values
```json
"status": "pending"     // ✅ Valid
"status": "succeeded"   // ✅ Valid
"status": "failed"      // ✅ Valid
"status": "canceled"    // ✅ Valid
"status": "processing"  // ❌ Invalid - will return error
```

### Conditional stripePaymentIntentId
```json
// Card payment (required)
{
  "paymentMethod": "card",
  "stripePaymentIntentId": "pi_123456"  // ✅ Required
}

// Cash on delivery (optional)
{
  "paymentMethod": "cash_on_delivery",
  "stripePaymentIntentId": null  // ✅ Not required
}
```

## 🔧 Environment Variables

Set these in your Postman environment:

```json
{
  "BASE_URL": "http://localhost:5000",
  "JWT_TOKEN": "your_jwt_token_here"
}
```

## 📊 Response Codes Summary

| Code | Description | Example |
|------|-------------|---------|
| 200 | Success | Payment confirmed, retrieved |
| 201 | Created | Payment intent created |
| 400 | Bad Request | Invalid amount, missing fields |
| 403 | Forbidden | Accessing another user's payment |
| 404 | Not Found | Payment doesn't exist |
| 500 | Server Error | Stripe API failure |

This comprehensive guide demonstrates how the simplified Payment schema handles all real-world payment scenarios with clean, maintainable code structure.
