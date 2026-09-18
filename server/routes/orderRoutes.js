import { Router } from 'express';
import {
  placeOrder,
  getOrders,
  deliverOrder,
  deleteOrder,
  cancelOrder,
  getDeliveredOrders,
  getUserDeliveredOrders,
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';

const router = Router();

// Login required - users must be authenticated to place an order
router.post('/order', protect, placeOrder);

// User (own orders)
router.get('/orders/mine', protect, getOrders);
router.get('/orders/mine/delivered', protect, getUserDeliveredOrders);
router.put('/order/:id/cancel', protect, cancelOrder);

// Admin
router.get('/orders', requireAdmin, getOrders);
router.put('/order/:id/deliver', requireAdmin, deliverOrder);
router.delete('/order/:id', requireAdmin, deleteOrder);
router.get('/orders/delivered', requireAdmin, getDeliveredOrders);

export default router;
