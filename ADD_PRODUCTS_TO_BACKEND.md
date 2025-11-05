# How to Add Products to Backend Database

## Step 1: Start the Backend Server
```bash
cd backend
npm start
```

## Step 2: Add Products Using API (Recommended)

You can add products using any API client like Postman or curl:

### Example using curl:
```bash
# Add a Biogas Product
curl -X POST http://localhost:3003/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Domestic Biogas Unit - 1m³",
    "type": "biogas",
    "capacity": "1 cubic meter",
    "price": 25000,
    "warrantyPeriod": "2 years",
    "description": "Compact biogas unit suitable for small households"
  }'

# Add a Fertilizer Product
curl -X POST http://localhost:3003/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Organic Vermicompost - 5kg",
    "type": "fertilizer",
    "price": 150,
    "description": "Premium quality vermicompost for home gardening"
  }'
```

## Step 3: Verify Products
```bash
curl http://localhost:3003/api/products
```

## Sample Products to Add:

### Biogas Products:
1. Domestic Biogas Unit - 1m³ (₹25,000)
2. Domestic Biogas Unit - 2m³ (₹35,000)
3. Commercial Biogas Unit - 5m³ (₹75,000)
4. Industrial Biogas Unit - 10m³ (₹150,000)

### Fertilizer Products:
1. Organic Vermicompost - 5kg (₹150)
2. Organic Vermicompost - 25kg (₹650)
3. Biogas Slurry Fertilizer - 10kg (₹200)
4. Biogas Slurry Fertilizer - 50kg (₹850)

## Step 4: Start Frontend
```bash
cd frontend
npm run dev
```

Now the frontend will fetch and display the products from your backend database!
