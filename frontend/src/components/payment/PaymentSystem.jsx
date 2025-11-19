import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent, confirmPayment } from '../../api.js';

// Initialize Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// CSS Styles
const styles = `
.stripe-payment-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: 0 auto;
}

.stripe-payment-container h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.5rem;
  text-align: center;
  font-weight: 600;
}

.payment-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-element-container {
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  background: #fafbfc;
  transition: border-color 0.3s ease;
}

.card-element-container:hover {
  border-color: #6366f1;
}

.card-element-container:focus-within {
  border-color: #4f46e5;
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.payment-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  margin: 8px 0;
}

.payment-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.pay-btn, .cancel-btn {
  flex: 1;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.pay-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.pay-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.pay-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.cancel-btn {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.cancel-btn:hover:not(:disabled) {
  background: #e5e7eb;
  color: #4b5563;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.payment-test-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.payment-test-container h2 {
  color: #333;
  margin-bottom: 24px;
  text-align: center;
  font-size: 2rem;
}

.test-controls {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid #e9ecef;
}

.amount-control {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.amount-control label {
  font-weight: 500;
  color: #495057;
  min-width: 120px;
}

.amount-control input {
  padding: 8px 12px;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  font-size: 1rem;
  width: 150px;
  transition: border-color 0.3s ease;
}

.amount-control input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.test-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.test-btn, .payment-test-btn, .clear-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.test-btn {
  background: #17a2b8;
  color: white;
}

.payment-test-btn {
  background: #28a745;
  color: white;
}

.clear-btn {
  background: #6c757d;
  color: white;
}

.test-results {
  margin-bottom: 24px;
}

.results-list {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

.result-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f3f4;
}

.result-item.success {
  background: #d4edda;
  border-left: 4px solid #28a745;
}

.result-item.error {
  background: #f8d7da;
  border-left: 4px solid #dc3545;
}

.test-info {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 20px;
  margin-top: 24px;
}

.card-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.card-item {
  background: white;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
  font-size: 0.9rem;
}

.payment-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.payment-modal {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Payment Form Component
const StripePaymentForm = ({ amount, onSuccess, onError, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });

  useEffect(() => {
    const initializePayment = async () => {
      try {
        // Fetch user information
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch('http://localhost:3003/api/user/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          if (data.success) {
            setUserInfo({
              name: data.data.fullName || data.data.name || 'Customer',
              email: data.data.email || ''
            });
          }
        }

        // Create payment intent
        const paymentResponse = await createPaymentIntent({
          amount: amount,
          currency: 'inr',
          description: 'Order payment'
        });

        if (paymentResponse.success) {
          setClientSecret(paymentResponse.data.clientSecret);
        } else {
          setError(paymentResponse.message || 'Failed to initialize payment');
        }
      } catch (err) {
        setError('Failed to initialize payment. Please try again.');
      }
    };

    if (amount > 0) {
      initializePayment();
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
            name: userInfo.name || 'Customer Name',
            email: userInfo.email || '',
          },
        },
      });

      if (paymentError) {
        setError(paymentError.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
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

// Main Payment Component
const PaymentSystem = ({ mode = 'test', amount, onSuccess, onError, onClose }) => {
  if (mode === 'payment') {
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
  }

  // Test Mode Component
  const [testAmount, setTestAmount] = useState(100);
  const [showPayment, setShowPayment] = useState(false);
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (test, status, message) => {
    setTestResults(prev => [...prev, {
      test,
      status,
      message,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const handlePaymentSuccess = (paymentIntent) => {
    addTestResult('Payment Success', 'success', `Payment ID: ${paymentIntent.id}`);
    setShowPayment(false);
  };

  const handlePaymentError = (error) => {
    addTestResult('Payment Error', 'error', error.message || 'Payment failed');
  };

  const handlePaymentClose = () => {
    addTestResult('Payment Cancelled', 'info', 'User cancelled payment');
    setShowPayment(false);
  };

  const testEnvironment = () => {
    const tests = [
      {
        name: 'Frontend Stripe Key',
        test: () => {
          const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
          return key && key.startsWith('pk_test_');
        }
      },
      {
        name: 'API URL',
        test: () => {
          const url = import.meta.env.VITE_API_URL;
          return url && url.includes('localhost');
        }
      },
      {
        name: 'User Token',
        test: () => {
          const token = localStorage.getItem('token');
          return !!token;
        }
      }
    ];

    tests.forEach(({ name, test }) => {
      try {
        const result = test();
        addTestResult(name, result ? 'success' : 'error', 
          result ? 'Configured correctly' : 'Not configured');
      } catch (error) {
        addTestResult(name, 'error', error.message);
      }
    });
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="payment-test-container">
      <h2>Stripe Payment System</h2>
      
      <div className="test-controls">
        <div className="amount-control">
          <label htmlFor="amount">Test Amount (₹):</label>
          <input
            id="amount"
            type="number"
            value={testAmount}
            onChange={(e) => setTestAmount(Number(e.target.value))}
            min="1"
            max="100000"
          />
        </div>
        
        <div className="test-buttons">
          <button onClick={testEnvironment} className="test-btn">
            Test Environment
          </button>
          <button onClick={() => setShowPayment(true)} className="payment-test-btn">
            Test Payment (₹{testAmount})
          </button>
          <button onClick={clearResults} className="clear-btn">
            Clear Results
          </button>
        </div>
      </div>

      {testResults.length > 0 && (
        <div className="test-results">
          <h3>Test Results</h3>
          <div className="results-list">
            {testResults.map((result, index) => (
              <div key={index} className={`result-item ${result.status}`}>
                <div className="result-header">
                  <span className="result-test">{result.test}</span>
                  <span className="result-time">{result.timestamp}</span>
                </div>
                <div className="result-message">{result.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showPayment && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            <Elements stripe={stripePromise}>
              <StripePaymentForm 
                amount={testAmount} 
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onClose={handlePaymentClose}
              />
            </Elements>
          </div>
        </div>
      )}

      <div className="test-info">
        <h4>Test Card Numbers</h4>
        <div className="card-info">
          <div className="card-item">
            <strong>Success:</strong> 4242 4242 4242 4242
          </div>
          <div className="card-item">
            <strong>Declined:</strong> 4000 0000 0000 0002
          </div>
          <div className="card-item">
            <strong>Insufficient Funds:</strong> 4000 0000 0000 9995
          </div>
          <div className="card-item">
            <strong>Expiry:</strong> Any future date
          </div>
          <div className="card-item">
            <strong>CVC:</strong> Any 3 digits
          </div>
          <div className="card-item">
            <strong>ZIP:</strong> Any 5 digits
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSystem;
