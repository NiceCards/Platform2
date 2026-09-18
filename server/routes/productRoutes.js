import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getBrands,
} from '../controllers/productController.js';
import { requireAdmin } from '../middleware/admin.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Public
router.get('/products', getProducts);
router.get('/products/brands', getBrands);
router.get('/product/:id', getProduct);

// Admin only
router.post('/product', requireAdmin, upload.array('images', 5), createProduct);
router.put('/product/:id', requireAdmin, upload.array('images', 5), updateProduct);
router.delete('/product/:id', requireAdmin, deleteProduct);

export default router;
