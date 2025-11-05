// Simple test script to verify backend API endpoints
const axios = require('axios');

const API_URL = 'http://localhost:3003/api';

async function testAPI() {
  console.log('🧪 Testing API Endpoints...\n');

  try {
    // Test products endpoint
    console.log('1. Testing GET /api/products...');
    const productsResponse = await axios.get(`${API_URL}/products`);
    console.log('✅ Products endpoint works:', productsResponse.data.products?.length || 0, 'products found');

    // Test users endpoint (should fail without auth)
    console.log('\n2. Testing GET /api/users (without auth)...');
    try {
      await axios.get(`${API_URL}/users`);
      console.log('❌ Users endpoint should require authentication');
    } catch (error) {
      console.log('✅ Users endpoint correctly requires authentication');
    }

    console.log('\n3. Testing POST /api/users/register...');
    try {
      const registerResponse = await axios.post(`${API_URL}/users/register`, {
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'password123',
        role: 'customer',
        locationId: 'test-location'
      });
      console.log('✅ Registration works:', registerResponse.data.message);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already registered')) {
        console.log('✅ User already exists (expected)');
      } else {
        console.log('❌ Registration failed:', error.response?.data?.message || error.message);
      }
    }

    console.log('\n4. Testing POST /api/users/login...');
    try {
      const loginResponse = await axios.post(`${API_URL}/users/login`, {
        email: 'test@example.com',
        password: 'password123'
      });
      console.log('✅ Login works:', loginResponse.data.message);
      
      // Test protected endpoint with token
      console.log('\n5. Testing GET /api/users (with auth)...');
      const usersResponse = await axios.get(`${API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`
        }
      });
      console.log('✅ Protected endpoint works:', usersResponse.data.users?.length || 0, 'users found');
      
    } catch (error) {
      console.log('❌ Login failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 API Testing Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests if backend is running
testAPI().catch(console.error);
