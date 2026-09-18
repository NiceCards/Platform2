import { Router } from 'express';
import {
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customerController.js';
import { requireAdmin } from '../middleware/admin.js';

const router = Router();

router.get('/customers', requireAdmin, getCustomers);
router.get('/customer/:id', requireAdmin, getCustomer);
router.put('/customer/:id', requireAdmin, updateCustomer);
router.delete('/customer/:id', requireAdmin, deleteCustomer);

export default router;
