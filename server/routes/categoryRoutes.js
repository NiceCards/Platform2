import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { requireAdmin } from '../middleware/admin.js';

const router = Router();

// Public
router.get('/categories', getCategories);

// Admin only
router.post('/category', requireAdmin, createCategory);
router.put('/category/:id', requireAdmin, updateCategory);
router.delete('/category/:id', requireAdmin, deleteCategory);

export default router;
