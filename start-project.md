# How to Start the Project

## Step 1: Start the Backend Server

1. Open a terminal and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Add sample products to the database:
```bash
node add-products.js
```

4. Start the backend server:
```bash
npm run dev
```

The backend server will start on port 3003.

## Step 2: Start the Frontend

1. Open another terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Start the frontend development server:
```bash
npm run dev
```

The frontend will start on port 5173.

## Step 3: Access the Application

1. Open your browser and go to: http://localhost:5173

2. You can now:
   - View products at http://localhost:5173/products
   - Register/login to access cart functionality
   - Add products to cart (requires login)

## What's Connected

✅ **Frontend-Backend Connection**: 
- API calls configured to connect frontend to backend
- CORS enabled for frontend origin (http://localhost:5173)
- Product data will be fetched from MongoDB database

✅ **Database Connection**:
- MongoDB Atlas connection configured
- Sample products (biogas units and fertilizers) ready to be added
- Product model supports both biogas and fertilizer types

✅ **Product Display**:
- Products categorized by type (biogas/fertilizer)
- Clean UI with product details, pricing, and add-to-cart functionality
- Responsive design with filtering options

## Troubleshooting

If products don't show up:
1. Make sure the backend server is running on port 3003
2. Run `node add-products.js` in the backend directory to populate the database
3. Check browser console for any API errors
4. Verify MongoDB connection in backend/.env file

If you get CORS errors:
1. Ensure backend server is running
2. Check that the frontend URL (http://localhost:5173) is in the CORS allowed origins
