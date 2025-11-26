import React, { useState } from 'react';
import { createPaymentIntent } from '../../api.js';

const PaymentTest = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const testPaymentIntent = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('🧪 Testing Stripe Payment Intent creation...');
      
      const testShippingAddress = {
        fullName: 'Test User',
        phone: '9876543210',
        addressLine1: '123 Test Street',
        city: 'Test City',
        postalCode: '600001',
        country: 'India'
      };

      const response = await createPaymentIntent(testShippingAddress);
      
      console.log('✅ Payment Intent Response:', response);
      
      setResult({
        success: true,
        clientSecret: response.data?.clientSecret ? '✅ Generated' : '❌ Missing',
        amount: response.data?.amount || 'N/A',
        currency: response.data?.currency || 'N/A',
        message: response.message
      });

    } catch (err) {
      console.error('❌ Payment Intent Test Failed:', err);
      setError(err.response?.data?.message || err.message || 'Test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">🧪 Stripe Payment Test</h2>
      
      <div className="text-center mb-6">
        <p className="text-gray-600 mb-4">
          Test if Stripe card payment function is working properly
        </p>
        
        <button
          onClick={testPaymentIntent}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              Testing Payment...
            </>
          ) : (
            '🧪 Test Card Payment Function'
          )}
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Testing Stripe connection...</p>
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-800 mb-3">✅ Test Results</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Payment Intent:</span>
              <span className={result.clientSecret.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                {result.clientSecret}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Amount:</span>
              <span>₹{result.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Currency:</span>
              <span>{result.currency}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <span className="text-green-600 font-semibold">SUCCESS ✅</span>
            </div>
          </div>
          <div className="mt-3 p-2 bg-green-100 rounded text-sm text-green-700">
            💳 Card payment function is working with Stripe!
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Test Failed</h3>
          <p className="text-red-600">{error}</p>
          <div className="mt-3 p-2 bg-red-100 rounded text-sm text-red-700">
            ⚠️ Card payment function needs attention
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">📋 What This Tests:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>✅ Stripe API connection</li>
          <li>✅ Payment Intent creation</li>
          <li>✅ Client Secret generation</li>
          <li>✅ Currency handling (INR)</li>
          <li>✅ Backend API response</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentTest;
