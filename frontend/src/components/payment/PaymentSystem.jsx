import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { createPaymentIntent, confirmPayment } from '../../api.js';
import './PaymentSystem.css';

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
      <div className="payment-system-loading">
        <div className="spinner"></div>
        <p>Loading payment system...</p>
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <div className="payment-success">
        <div className="success-icon">✅</div>
        <h3>Payment Successful!</h3>
        <p>Your order has been placed successfully.</p>
        <p>Amount: ₹{amount?.toLocaleString()}</p>
      </div>
    );
  }

  return (
    <div className="payment-system">
      <form id="payment-form" onSubmit={handleSubmit}>
        <div className="payment-header">
          <h3>Secure Payment</h3>
          <p className="payment-amount">Total: ₹{amount?.toLocaleString()}</p>
          <div className="security-badges">
            <span className="badge">🔒 Secured by Stripe</span>
            <span className="badge">💳 PCI Compliant</span>
          </div>
        </div>

        <div className="payment-element-container">
          <div id="payment-element"></div>
        </div>

        {error && (
          <div className="payment-error">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <div className="payment-actions">
          <button 
            type="submit" 
            disabled={loading || !stripe || !elements}
            className="payment-button"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Processing Payment...
              </>
            ) : (
              `Pay ₹${amount?.toLocaleString()}`
            )}
          </button>
        </div>

        <div className="payment-info">
          <p className="info-text">
            <strong>🛡️ Secure Payment:</strong> Your payment information is encrypted and secure.
          </p>
          <p className="info-text">
            <strong>📧 Email Confirmation:</strong> You'll receive an order confirmation via email.
          </p>
        </div>
      </form>
    </div>
  );
};

export default PaymentSystem;
