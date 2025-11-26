import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { createPaymentIntent, confirmPayment, createCheckoutSession } from '../../api.js';

// Initialize Stripe with your publishable key
// Handle HTTP for testing and HTTPS for production
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_publishable_key_here', {
  // Configure for HTTP testing in development
  apiVersion: '2023-10-16',
});

const DualPaymentSystem = ({ 
  clientSecret, 
  onPaymentSuccess, 
  onPaymentError, 
  shippingAddress,
  amount,
  cartItems
}) => {
  const [stripe, setStripe] = useState(null);
  const [elements, setElements] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'checkout'
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const initializeStripe = async () => {
      if (!clientSecret || paymentMethod !== 'card') return;

      try {
        const stripeInstance = await stripePromise;
        if (!stripeInstance) {
          throw new Error('Failed to load Stripe');
        }

        setStripe(stripeInstance);

        // Create Elements instance with enhanced appearance
        // Configure for HTTP/HTTPS compatibility
        const elementsInstance = stripeInstance.elements({
          clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#0570de',
              colorBackground: '#ffffff',
              colorText: '#30313d',
              colorDanger: '#df1b41',
              fontFamily: 'system-ui, sans-serif',
              spacingUnit: '4px',
              borderRadius: '6px',
            },
          },
          // Configure for HTTP testing
          fonts: [{
            cssSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
          }]
        });

        // Create Payment Element with card collection
        const paymentElement = elementsInstance.create('payment', {
          layout: 'tabs',
          fields: {
            billingDetails: {
              name: 'auto',
              email: 'auto',
              phone: 'auto',
              address: {
                country: 'auto',
                postalCode: 'auto',
                state: 'auto',
                city: 'auto',
                line1: 'auto',
                line2: 'auto'
              }
            }
          }
        });

        paymentElement.mount('#payment-element');

        setElements(elementsInstance);

        // Listen for changes in the Element
        paymentElement.on('change', (event) => {
          if (event.error) {
            setError(event.error.message);
          } else {
            setError('');
          }
        });

      } catch (err) {
        console.error('Stripe initialization error:', err);
        setError('Failed to initialize payment system. Please refresh the page.');
      }
    };

    initializeStripe();
  }, [clientSecret, paymentMethod]);

  const handleStripeCheckout = async () => {
    setCheckoutLoading(true);
    setError('');

    try {
      // Prepare items for Stripe Checkout
      const items = cartItems.map(item => ({
        id: item.productId._id || item.productId,
        name: item.productId.name || 'Product',
        unitPrice: item.price,
        unit: item.productId.type || 'unit',
        quantity: item.quantity,
        currency: 'inr' // Using INR for Indian Rupees
      }));

      const response = await createCheckoutSession(items);
      
      if (response.success) {
        // Redirect to Stripe Checkout
        window.location.href = response.data.url;
      } else {
        setError(response.message || 'Failed to create checkout session');
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError('Failed to create checkout session. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (paymentMethod === 'checkout') {
      handleStripeCheckout();
      return;
    }
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Confirm the payment with billing details
      // Handle HTTP/HTTPS properly for testing
      const returnUrl = `${window.location.protocol}//${window.location.host}/payment-success`;
      
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
          payment_method_data: {
            billing_details: {
              name: shippingAddress?.fullName || '',
              email: '', // You can get this from user context
              phone: shippingAddress?.phone || '',
              address: {
                line1: shippingAddress?.addressLine1 || '',
                city: shippingAddress?.city || '',
                postal_code: shippingAddress?.postalCode || '',
                country: shippingAddress?.country || 'IN',
                state: shippingAddress?.state || '',
              },
            },
          },
        },
        // Handle redirects properly for HTTP testing
        redirect: 'if_required',
      });

      if (submitError) {
        setError(submitError.message);
        onPaymentError?.(submitError);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Payment successful, confirm on backend
        const response = await confirmPayment(paymentIntent.id, shippingAddress);
        
        if (response.success) {
          setPaymentComplete(true);
          onPaymentSuccess?.(response.data.order);
        } else {
          setError(response.message || 'Payment confirmation failed');
          onPaymentError?.(response);
        }
      } else if (paymentIntent.status === 'processing') {
        setError('Your payment is being processed. Please wait...');
      } else {
        setError(`Payment failed: ${paymentIntent.status}`);
        onPaymentError?.(paymentIntent);
      }

    } catch (err) {
      console.error('Payment submission error:', err);
      setError('An unexpected error occurred. Please try again.');
      onPaymentError?.(err);
    } finally {
      setLoading(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Loading payment system...</p>
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <div className="text-center p-10">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-green-600 text-xl font-semibold mb-2">Payment Successful!</h3>
        <p className="text-gray-600 mb-2">Your order has been placed successfully.</p>
        <p className="text-gray-700 font-medium">Amount: ₹{amount?.toLocaleString()}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-md max-w-md mx-auto">
      <form id="payment-form" onSubmit={handleSubmit}>
        <div className="text-center mb-6">
          <h3 className="text-gray-900 text-lg font-semibold mb-2">Secure Payment</h3>
          <p className="text-blue-600 text-lg font-semibold mb-4">Total: ₹{amount?.toLocaleString()}</p>
          
          {/* Payment Method Selection */}
          <div className="flex gap-2 justify-center mb-4">
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                paymentMethod === 'card'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              💳 Credit/Debit Card
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('checkout')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                paymentMethod === 'checkout'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🛒 Stripe Checkout
            </button>
          </div>

          <div className="flex gap-2 justify-center flex-wrap">
            <span className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-xs text-gray-600 flex items-center gap-1">
              🔒 Secured by Stripe
            </span>
            <span className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-xs text-gray-600 flex items-center gap-1">
              💳 PCI Compliant
            </span>
            <span className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-xs text-gray-600 flex items-center gap-1">
              🛡️ 3D Secure
            </span>
          </div>
        </div>

        {/* Credit Card Payment Section */}
        {paymentMethod === 'card' && (
          <div className="mb-5">
            <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-600">💳</span>
                <h4 className="font-semibold text-gray-800">Card Payment Details</h4>
              </div>
              <p className="text-sm text-gray-600">Enter your credit or debit card information securely below.</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div id="payment-element"></div>
            </div>
          </div>
        )}

        {/* Stripe Checkout Section */}
        {paymentMethod === 'checkout' && (
          <div className="mb-5 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white">🛒</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Stripe Checkout</h4>
                <p className="text-sm text-gray-600">You'll be redirected to Stripe's secure checkout page</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Accepts all major credit/debit cards</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Supports UPI, NetBanking & Wallets</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Bank-level security & encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Save payment methods for future</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5 flex items-center gap-2 text-red-600 text-sm">
            <span className="text-base">⚠️</span>
            {error}
          </div>
        )}

        <div className="mb-5">
          <button 
            type="submit" 
            disabled={loading || checkoutLoading || (paymentMethod === 'card' && (!stripe || !elements))}
            className="w-full bg-blue-600 text-white rounded-lg py-4 px-6 font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 hover:bg-blue-700 hover:transform hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {(loading || checkoutLoading) ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                {paymentMethod === 'checkout' ? 'Redirecting to Checkout...' : 'Processing Payment...'}
              </>
            ) : (
              paymentMethod === 'checkout' 
                ? `Proceed to Stripe Checkout • ₹${amount?.toLocaleString()}`
                : `Pay ₹${amount?.toLocaleString()}`
            )}
          </button>
        </div>

        {/* Payment Features */}
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <span className="text-green-600">✓</span>
              <span>Instant Confirmation</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-600">✓</span>
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-600">✓</span>
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-600">✓</span>
              <span>Easy Refunds</span>
            </div>
          </div>
          
          {/* Additional Security Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              <strong className="text-gray-700">🛡️ Secure Payment:</strong> Your payment information is encrypted and never stored on our servers.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong className="text-gray-700">🔐 Data Protection:</strong> Compliant with PCI DSS standards for maximum security.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DualPaymentSystem;
