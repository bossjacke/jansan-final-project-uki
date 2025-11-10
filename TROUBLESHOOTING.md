# Products Not Showing in UI - Troubleshooting Guide

## Step 1: Check Backend Server
Open terminal and run:
```bash
cd backend
npm run dev
```
You should see: `🚀 Server running on port 3003`

## Step 2: Add Products to Database
In another terminal (while backend is running):
```bash
cd backend
node add-products.js
```
You should see: `✅ Sample products created successfully!`

## Step 3: Test Backend API Directly
Open browser and go to: http://localhost:3003/api/products
You should see JSON response with products like:
```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": [...]
}
```

## Step 4: Start Frontend
In another terminal:
```bash
cd frontend
npm run dev
```
You should see frontend running on port 5173

## Step 5: Check Frontend
Open browser and go to: http://localhost:5173/products

## If Still Not Working:

### Check Browser Console
1. Press F12 in browser
2. Go to Console tab
3. Look for any red error messages
4. Look for "Products API response:" message

### Common Issues:

**Issue 1: CORS Error**
- Make sure backend server is running
- Check that port 3003 is not blocked

**Issue 2: No Products in Database**
- Run `node add-products.js` again
- Check MongoDB connection in backend/.env

**Issue 3: Frontend API Error**
- Check that frontend is calling correct URL: http://localhost:3003/api/products
- Check network tab in browser developer tools

**Issue 4: Backend Not Connected to Database**
- Check MongoDB URI in backend/.env
- Ensure you have internet connection for MongoDB Atlas

## Quick Test Commands:
```bash
# Test backend directly
curl http://localhost:3003/api/products

# Check if ports are in use
netstat -an | grep :3003
netstat -an | grep :5173
```

## Expected Output:
When everything works, you should see:
- 4 products (2 biogas units, 2 fertilizers)
- Product cards with images, prices, and "Add to Cart" buttons
- Category filters for "All Products", "Biogas Units", "Fertilizers"
