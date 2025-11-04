# Postman Testing Guide - Password Reset (Port 3003)

## 🚀 Server Setup
Make sure your backend server is running on port 3003:
```bash
cd backend
npm start
```
Server should be running at: `http://localhost:3003`

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
