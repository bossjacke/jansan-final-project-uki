# OTP-Based Password Reset System

## 🎯 Overview
This implementation provides a secure OTP-based password reset system using React.js (frontend) and Node.js (backend). Users receive a 6-digit OTP via email to reset their password.

## 🔄 Complete Flow

### 1. User Requests Password Reset
- User enters email on Forgot Password page
- Backend generates 6-digit OTP (expires in 10 minutes)
- OTP is sent to user's email
- Rate limiting: max 3 requests per 15 minutes per email

### 2. User Resets Password
- User enters email, OTP, and new password
- Backend validates OTP and expiry
- Password is updated and OTP is cleared
- User is redirected to login page

## 📁 File Structure

### Backend Files
```
backend/
├── src/
│   ├── models/
│   │   └── user.model.js          # User model with OTP fields
│   ├── controllers/
│   │   └── password.controller.js   # OTP generation & validation
│   ├── routes/
│   │   └── password.routes.js      # API endpoints
│   └── utils/
│       └── email.js               # Email sending utility
└── .env                          # Environment variables
```

### Frontend Files
```
frontend/src/
├── components/pages/password/
│   ├── ForgotPassword.jsx          # Request OTP form
│   └── ResetPassword.jsx           # Reset password form
└── api.js                       # API calls
```

## 🔧 API Endpoints

### POST /api/user/forgot-password
**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If email exists, OTP sent successfully"
}
```

### POST /api/user/reset-password
**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

## 🛡️ Security Features

1. **OTP Generation**: 6-digit random numbers using crypto.randomInt()
2. **OTP Expiry**: 10 minutes validity
3. **Rate Limiting**: 3 requests per 15 minutes per email
4. **Email Enumeration Protection**: Always returns success message
5. **Input Validation**: Server-side validation for all inputs
6. **Password Hashing**: bcrypt with salt rounds

## 📧 Email Configuration

### Development Mode
- OTP is logged to console if email not configured
- Check backend console for OTP during testing

### Production Setup
Update `.env` file:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

**Gmail Setup:**
1. Enable 2-factor authentication
2. Generate App Password
3. Use App Password in EMAIL_PASS

## 🚀 How to Use

### 1. Start Backend
```bash
cd backend
npm install
npm start
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Test the Flow
1. Go to login page → Click "Forgot Password?"
2. Enter email → Receive OTP (check console in dev mode)
3. Go to reset password page → Enter email, OTP, new password
4. Submit → Success → Redirect to login

## 🎨 UI Features

### ForgotPassword Component
- Email input with validation
- Loading states
- Success confirmation with instructions
- "Send Again" and "Reset Password" buttons
- Consistent design with login page

### ResetPassword Component
- Email, OTP, and password inputs
- Real-time OTP validation (numbers only)
- Password confirmation
- Auto-redirect after success
- Help text and navigation links

## 🔍 Testing

### Without Email Configuration
1. Start backend server
2. Request OTP for any email
3. Check backend console for OTP
4. Use OTP to reset password

### With Email Configuration
1. Configure email in `.env`
2. Test with real email addresses
3. Check email inbox for OTP

## 📝 Notes

- OTP is stored as plaintext (hash in production)
- Rate limiting uses in-memory Map (use Redis in production)
- Frontend uses React hooks for state management
- All inputs are validated on both client and server side
- Design matches existing login page theme

## 🚨 Production Considerations

1. **HTTPS**: Required for production
2. **OTP Hashing**: Hash OTPs in database
3. **Rate Limiting**: Use Redis or database
4. **Email Templates**: Use HTML templates
5. **Logging**: Implement proper logging
6. **Monitoring**: Add error monitoring
