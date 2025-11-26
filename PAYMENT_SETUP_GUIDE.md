# Payment System Setup Guide

This guide explains how to set up and use the dual payment system that includes both Credit Card payment and Stripe Checkout functionality.

## 🎯 Features

### Credit Card Payment (Stripe Elements)
- Direct card input on your website
- Real-time validation
- 3D Secure support
- Instant payment confirmation

### Stripe Checkout
- Redirect to Stripe's hosted checkout page
- Supports multiple payment methods:
  - Credit/Debit Cards
  - UPI (Unified Payments Interface)
  - NetBanking
  - Digital Wallets
- Mobile-optimized checkout
- Saved payment methods

## 📋 Prerequisites

1. **Stripe Account**: Create a free account at [stripe.com](https://stripe.com)
2. **API Keys**: Get your test and live API keys from Stripe Dashboard
3. **Domain**: Add your domain to Stripe's allowed domains

## 🔧 Environment Setup

### Backend (.env)
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Your frontend URL
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)
```env
# Stripe Publishable Key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# API URL
VITE_API_URL=http://localhost:3003/api
```

## 🚀 How It Works

### 1. Credit Card Payment Flow
1. User selects "Credit/Debit Card & Stripe Checkout"
2. System creates a Payment Intent
3. Stripe Elements loads the card input form
4. User enters card details securely
5. Payment is processed instantly
6. Order is created on success

### 2. Stripe Checkout Flow
1. User selects "Credit/Debit Card & Stripe Checkout"
2. User clicks "Stripe Checkout" tab
3. System creates a Checkout Session
4. User is redirected to Stripe's secure page
5. User chooses payment method and pays
6. Webhook confirms payment and creates order

## 📁 File Structure

```
frontend/src/components/payment/
├── DualPaymentSystem.jsx     # Main payment component
├── PaymentSystem.jsx         # Original card payment
├── PaymentSuccess.jsx        # Success page
├── PaymentCancel.jsx         # Cancel page
└── PaymentSystem.css        # Styles

backend/src/controllers/
└── payment.controller.js     # Payment logic

backend/src/routes/
└── payment.routes.js        # API endpoints
```

## 🔌 API Endpoints

### Create Payment Intent
```http
POST /api/payments/create-payment-intent
```

### Confirm Payment
```http
POST /api/payments/confirm-payment
```

### Create Checkout Session
```http
POST /api/payments/create-checkout-session
```

### Webhook Handler
```http
POST /api/payments/webhook
```

## 💳 Payment Methods Supported

### Credit/Debit Cards
- Visa
- Mastercard
- American Express
- Discover
- RuPay (India)

### Indian Payment Methods
- **UPI**: PhonePe, Google Pay, Paytm
- **NetBanking**: All major Indian banks
- **Wallets**: Paytm Wallet, Mobikwik, etc.

## 🛡️ Security Features

- **PCI DSS Compliance**: Stripe handles all card data
- **SSL Encryption**: All communications are encrypted
- **3D Secure**: Additional verification for card payments
- **Fraud Detection**: Built-in fraud prevention
- **Tokenization**: Card details are never stored

## 🔧 Testing

### Test Cards for Credit Card Payment
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date
CVV: Any 3 digits
Name: Any name
```

### Test UPI for Stripe Checkout
```
UPI ID: test@stripe
```

## 🎨 Customization

### Styling
The payment form uses Stripe Elements with customizable appearance:
```javascript
appearance: {
  theme: 'stripe',
  variables: {
    colorPrimary: '#0570de',
    colorBackground: '#ffffff',
    colorText: '#30313d',
    // ... more variables
  },
}
```

### Branding
- Add your logo to Stripe Checkout
- Customize colors and fonts
- Add business information

## 📱 Mobile Support

Both payment methods are fully responsive:
- Credit Card: Optimized card input for mobile
- Stripe Checkout: Mobile-first design by Stripe

## 🔍 Error Handling

Common errors and solutions:

### Card Declined
- Check card details
- Verify sufficient funds
- Try different card

### 3D Secure Failed
- Ensure 3D Secure is enabled
- Check with bank

### Checkout Session Failed
- Verify webhook URL
- Check API keys
- Ensure domain is whitelisted

## 📊 Monitoring

### Stripe Dashboard
- Monitor payments in real-time
- View transaction details
- Handle disputes
- Generate reports

### Backend Logs
- Payment intent creation
- Webhook events
- Error tracking

## 🚀 Going Live

1. **Update API Keys**: Replace test keys with live keys
2. **Domain Verification**: Add production domain to Stripe
3. **Webhook Setup**: Configure production webhook URL
4. **Testing**: Test with real cards (small amounts)
5. **Monitoring**: Set up alerts for payment failures

## 🆘 Support

### Stripe Documentation
- [Payment Intents](https://stripe.com/docs/payments/payment-intents)
- [Checkout](https://stripe.com/docs/payments/checkout)
- [Webhooks](https://stripe.com/docs/webhooks)

### Common Issues
1. **CORS Errors**: Ensure frontend URL is in CORS allowed list
2. **Webhook Failures**: Verify webhook URL and secret
3. **Payment Failures**: Check Stripe logs for detailed errors

## 📈 Best Practices

1. **Always use HTTPS** in production
2. **Implement proper error handling**
3. **Log all payment events**
4. **Test thoroughly** before going live
5. **Monitor payment success rates**
6. **Have backup payment methods**

## 🔄 Refunds

Refunds can be processed through:
- Stripe Dashboard (manual)
- API (automated)
- Admin panel (if implemented)

## 📝 Compliance

- **PCI DSS**: Compliant through Stripe
- **GDPR**: Data handling compliance
- **RBI Guidelines**: For Indian payments
- **3D Secure**: Required for Indian cards

---

## 🎉 Ready to Use!

Your dual payment system is now ready with:
✅ Credit Card payments via Stripe Elements
✅ Stripe Checkout for multiple payment methods
✅ UPI, NetBanking, and Wallet support
✅ Mobile-optimized interface
✅ Enterprise-grade security
✅ Comprehensive error handling

Start accepting payments immediately! 🚀
