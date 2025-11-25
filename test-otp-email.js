#!/usr/bin/env node

// Test script for OTP email functionality
const axios = require('axios');

const API_URL = 'http://localhost:3003/api';

async function testOTPEmail() {
  console.log('🧪 Testing OTP Email Functionality\n');
  
  // Test 1: Send OTP to email
  console.log('1️⃣ Sending OTP to test email...');
  try {
    const response = await axios.post(`${API_URL}/password/forgot-password`, {
      email: 'test@example.com'
    });
    console.log('✅ Forgot Password Response:', response.data);
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }

  console.log('\n2️⃣ Testing with a real user email (if exists)...');
  try {
    const response = await axios.post(`${API_URL}/password/forgot-password`, {
      email: 'bossjansan1234@gmail.com'
    });
    console.log('✅ Response for real user:', response.data);
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }

  console.log('\n3️⃣ Testing invalid email format...');
  try {
    const response = await axios.post(`${API_URL}/password/forgot-password`, {
      email: 'invalid-email'
    });
    console.log('❌ Should have failed but got:', response.data);
  } catch (error) {
    console.log('✅ Correctly rejected invalid email:', error.response?.data);
  }

  console.log('\n🎉 OTP Email Test Complete!');
  console.log('\n📝 Instructions:');
  console.log('1. Check your backend console for email sending logs');
  console.log('2. If email credentials are set up correctly, you should receive OTP emails');
  console.log('3. The OTP will be displayed in the console if email sending fails (development mode)');
  console.log('4. Use the received OTP to test password reset functionality');
}

// Run the test
testOTPEmail().catch(console.error);
