import mongoose from 'mongoose';
import Product from '../src/models/product.model.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function createSampleProducts() {
  try {
    // Check if products already exist
    const existingProducts = await Product.find();
    if (existingProducts.length > 0) {
      console.log('Products already exist. Skipping creation.');
      return;
    }

    // Create sample products
    const products = [
      {
        name: "Bio-Gas Unit 1m³",
        type: "biogas",
        capacity: "1m³",
        price: 15000,
        warrantyPeriod: "2 years",
        description: "Small biogas unit suitable for household use with 1 cubic meter capacity",
        stock: 10,
        image: "https://example.com/biogas-1m3.jpg"
      },
      {
        name: "Bio-Gas Unit 2m³",
        type: "biogas",
        capacity: "2m³",
        price: 25000,
        warrantyPeriod: "3 years",
        description: "Medium biogas unit suitable for small businesses with 2 cubic meter capacity",
        stock: 5,
        image: "https://example.com/biogas-2m3.jpg"
      },
      {
        name: "Organic Fertilizer 5kg",
        type: "fertilizer",
        price: 500,
        description: "Premium organic fertilizer suitable for all types of crops, 5kg package",
        stock: 50,
        image: "https://example.com/fertilizer-5kg.jpg"
      },
      {
        name: "Organic Fertilizer 10kg",
        type: "fertilizer",
        price: 900,
        description: "Premium organic fertilizer suitable for all types of crops, 10kg package",
        stock: 30,
        image: "https://example.com/fertilizer-10kg.jpg"
      }
    ];

    await Product.insertMany(products);
    console.log('✅ Sample products created successfully!');
    console.log('Products created:', products.length);
    
  } catch (error) {
    console.error('❌ Error creating products:', error);
  } finally {
    mongoose.disconnect();
  }
}

createSampleProducts();
