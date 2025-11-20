# Stripe Payment Integration Setup Guide

This guide will help you set up Stripe payment integration for your e-commerce application.

## 📋 Prerequisites

1. **Stripe Account**: Create a free Stripe account at [stripe.com](https://stripe.com)
2. **API Keys**: Get your Stripe API keys from the Stripe Dashboard

## 🔧 Backend Setup

### 1. Environment Variables

Add the following to your `backend/.env` file:

```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

**To get these keys:**
1. Log into your Stripe Dashboard
2. Go to Developers → API keys
3. Copy the **Secret key** (starts with `sk_test_`)
4. Copy the **Publishable key** (starts with `pk_test_`)

### 2. Install Dependencies

The Stripe package is already installed:
```bash
npm install stripe
```

### 3. Backend Implementation

✅ **Already implemented:**
- Payment intent creation (`/api/payments/create-payment-intent`)
- Payment confirmation (`/api/payments/confirm-payment`)
- Payment status checking (`/api/payments/status/:paymentIntentId`)
- Refund processing (`/api/payments/refund/:orderId`)

## 🎨 Frontend Setup

### 1. Environment Variables

Add the following to your `frontend/.env` file:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### 2. Install Dependencies

The Stripe.js package is already installed:
```bash
npm install @stripe/stripe-js
```

### 3. Frontend Implementation

✅ **Already implemented:**
- PaymentSystem component with Stripe Elements
- Checkout page with payment method selection
- Payment form with card input
- Error handling and loading states
- Success confirmation

## 🚀 How It Works

### Payment Flow:

1. **User selects payment method** (Cash on Delivery or Credit/Debit Card)
2. **For Stripe payments:**
   - User fills shipping address
   - Clicks "Continue to Payment"
   - Backend creates payment intent
   - Stripe Elements renders payment form
   - User enters card details
   - Payment is processed
   - Order is created on success
3. **For COD:**
   - User fills shipping address
   - Order is created directly
   - Payment status = "pending"

### API Endpoints:

- `POST /api/payments/create-payment-intent` - Create payment intent
- `POST /api/payments/confirm-payment` - Confirm successful payment
- `GET /api/payments/status/:paymentIntentId` - Check payment status
- `POST /api/payments/refund/:orderId` - Process refund

## 🛡️ Security Features

- **PCI Compliance**: Stripe handles card data directly
- **Encryption**: All payment data is encrypted
- **Webhooks**: For payment event handling (can be added later)
- **Error Handling**: Comprehensive error management
- **Validation**: Form validation before payment

## 💳 Testing

### Test Card Numbers:

Use these Stripe test cards for testing:

| Card Type | Card Number | Expiry | CVC | Result |
|------------|---------------|---------|-----|---------|
| Visa | 4242424242424242 | Any future date | Any 3 digits | Success |
| Visa (3DS) | 4000002500003155 | Any future date | Any 3 digits | Requires authentication |
| Declined | 4000000000000002 | Any future date | Any 3 digits | Declined |
| Insufficient Funds | 4000000000009995 | Any future date | Any 3 digits | Insufficient funds |

## 🔧 Configuration Options

### Currency Settings

Currently set to Indian Rupees (INR). To change:

**Backend:** `payment.controller.js`
```javascript
currency: 'inr', // Change to 'usd', 'eur', etc.
```

**Frontend:** `PaymentSystem.jsx`
```javascript
country: shippingAddress?.country || 'US', // Update default country
```

### Payment Methods

Currently supports:
- Credit/Debit Cards (via Stripe)
- Cash on Delivery

To add more methods:
1. Update payment options in `Checkout.jsx`
2. Add corresponding backend logic
3. Update order model if needed

## 🚨 Important Notes

1. **Test Mode**: Always test with test keys before going live
2. **Live Keys**: Never expose secret keys in frontend code
3. **HTTPS**: Stripe requires HTTPS in production
4. **Webhooks**: Set up webhooks for reliable payment notifications
5. **Compliance**: Ensure PCI compliance by using Stripe Elements

## 📞 Support

If you encounter issues:

1. **Check API Keys**: Ensure they're correctly set
2. **Network Issues**: Check browser console for errors
3. **Stripe Dashboard**: Monitor payment attempts
4. **Logs**: Check backend logs for detailed errors

## 🔄 Going Live

1. **Get Live Keys**: Replace test keys with live ones
2. **Update Environment**: Update all environment files
3. **Test Live**: Make small test transactions
4. **Monitor**: Keep an eye on Stripe Dashboard

## 📝 Next Steps

Consider adding:
- **Webhooks** for real-time payment notifications
- **Saved Cards** for returning customers
- **Multiple Currencies** support
- **Subscription** payments
- **Dispute** handling
- **Analytics** for payment tracking

---

**🎉 Your Stripe payment integration is now ready!**

Users can choose between Cash on Delivery and secure Credit/Debit Card payments powered by Stripe.
