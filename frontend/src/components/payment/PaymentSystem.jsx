import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { createPaymentIntent, confirmPayment } from '../../api.js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_publishable_key_here');

const PaymentSystem = ({ 
  clientSecret, 
  onPaymentSuccess, 
  onPaymentError, 
  shippingAddress,
  amount 
}) => {
  const [stripe, setStripe] = useState(null);
  const [elements, setElements] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentComplete, setPaymentComplete] = useState(false);

  useEffect(() => {
    const initializeStripe = async () => {
      if (!clientSecret) return;

      try {
        const stripeInstance = await stripePromise;
        if (!stripeInstance) {
          throw new Error('Failed to load Stripe');
        }

        setStripe(stripeInstance);

        // Create Elements instance
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
        });

        // Create Payment Element
        const paymentElement = elementsInstance.create('payment', {
          layout: 'tabs',
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
  }, [clientSecret]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Confirm the payment
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
          payment_method_data: {
            billing_details: {
              name: shippingAddress?.fullName || '',
              email: '',
              phone: shippingAddress?.phone || '',
              address: {
                line1: shippingAddress?.addressLine1 || '',
                city: shippingAddress?.city || '',
                postal_code: shippingAddress?.postalCode || '',
                country: shippingAddress?.country || 'IN',
              },
            },
          },
        },
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
          <div className="flex gap-2 justify-center flex-wrap">
            <span className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-xs text-gray-600 flex items-center gap-1">
              🔒 Secured by Stripe
            </span>
            <span className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-xs text-gray-600 flex items-center gap-1">
              💳 PCI Compliant
            </span>
          </div>
        </div>

        <div className="mb-5 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div id="payment-element"></div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5 flex items-center gap-2 text-red-600 text-sm">
            <span className="text-base">⚠️</span>
            {error}
          </div>
        )}

        <div className="mb-5">
          <button 
            type="submit" 
            disabled={loading || !stripe || !elements}
            className="w-full bg-blue-600 text-white rounded-lg py-4 px-6 font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 hover:bg-blue-700 hover:transform hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Processing Payment...
              </>
            ) : (
              `Pay ₹${amount?.toLocaleString()}`
            )}
          </button>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-500 mb-2 leading-relaxed">
            <strong className="text-gray-700">🛡️ Secure Payment:</strong> Your payment information is encrypted and secure.
          </p>
          <p className="text-xs text-gray-500 leading-relaxed">
            <strong className="text-gray-700">📧 Email Confirmation:</strong> You'll receive an order confirmation via email.
          </p>
        </div>
      </form>
    </div>
  );
};

export default PaymentSystem;
