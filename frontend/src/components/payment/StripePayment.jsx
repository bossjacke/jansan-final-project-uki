import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent, confirmPayment } from '../../api.js';


// Initialize Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const StripePaymentForm = ({ amount, onSuccess, onError, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    // Create payment intent when component mounts
    const createIntent = async () => {
      try {
        const response = await createPaymentIntent({
          amount: amount,
          currency: 'inr', // Changed to INR for Indian Rupees
          description: 'Order payment'
        });

        if (response.success) {
          setClientSecret(response.data.clientSecret);
        } else {
          setError(response.message || 'Failed to initialize payment');
        }
      } catch (err) {
        setError('Failed to initialize payment. Please try again.');
      }
    };

    if (amount > 0) {
      createIntent();
    }
  }, [amount]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: 'Customer Name', // You can get this from user data
          },
        },
      });

      if (paymentError) {
        setError(paymentError.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        try {
          await confirmPayment({ paymentIntentId: paymentIntent.id });
          onSuccess(paymentIntent);
        } catch (confirmError) {
          setError('Payment succeeded but confirmation failed. Please contact support.');
        }
      } else {
        setError('Payment was not successful. Please try again.');
      }
    } catch (err) {
      setError('Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <div className="stripe-payment-container">
      <h3>Secure Payment</h3>
      <form onSubmit={handleSubmit} className="payment-form">
        <div className="card-element-container">
          <CardElement options={cardElementOptions} />
        </div>
        
        {error && (
          <div className="payment-error">
            {error}
          </div>
        )}
        
        <div className="payment-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={onClose}
            disabled={processing}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="pay-btn"
            disabled={processing || !stripe || !elements}
          >
            {processing ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              `Pay ₹${amount.toFixed(2)}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const StripePayment = ({ amount, onSuccess, onError, onClose }) => {
  return (
    <Elements stripe={stripePromise}>
      <StripePaymentForm 
        amount={amount} 
        onSuccess={onSuccess} 
        onError={onError} 
        onClose={onClose} 
      />
    </Elements>
  );
};

export default StripePayment;
