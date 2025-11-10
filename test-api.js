// Simple test to check if backend API is working
import axios from 'axios';

const API_URL = 'http://localhost:3003/api';

async function testAPI() {
  console.log('🔍 Testing Backend API...');
  
  try {
    // Test products endpoint
    console.log('\n📦 Testing /products endpoint...');
    const productsResponse = await axios.get(`${API_URL}/products`);
    console.log('✅ Products API working!');
    console.log('Response:', productsResponse.data);
    
    if (productsResponse.data.success && productsResponse.data.data) {
      console.log(`\n🎉 Found ${productsResponse.data.data.length} products in database:`);
      productsResponse.data.data.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (${product.type}) - ₹${product.price}`);
      });
    } else {
      console.log('❌ No products found or invalid response format');
    }
    
  } catch (error) {
    console.error('❌ API Test Failed:');
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Backend server is not running. Start it with: cd backend && npm run dev');
    } else if (error.response) {
      console.log('Server responded with error:', error.response.status, error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testAPI();
