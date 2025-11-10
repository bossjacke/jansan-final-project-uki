import express from 'express';
import { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/product.controller.js';

const router = express.Router();

// GET /api/products → Return Bio-Gas and Fertilizer
router.get('/', getAllProducts);

// GET /api/products/:id → Get single product
router.get('/:id', getProductById);

// POST /api/products → Create product (admin only)
router.post('/', createProduct);

// PUT /api/products/:id → Update product (admin only)
router.put('/:id', updateProduct);

// DELETE /api/products/:id → Delete product (admin only)
router.delete('/:id', deleteProduct);

export default router;
