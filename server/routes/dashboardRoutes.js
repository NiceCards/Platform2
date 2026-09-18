import { Router } from 'express';
import { getDashboardStats, getCharts } from '../controllers/dashboardController.js';
import {
  adminLogin,
  adminForgotPassword,
  adminResetPassword,
  requireAdmin,
} from '../middleware/admin.js';
import { adminLoginLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Admin authentication (password only)
router.post('/admin/login', adminLoginLimiter, adminLogin);
router.post('/admin/forgot-password', adminLoginLimiter, adminForgotPassword);
router.post('/admin/reset-password', adminLoginLimiter, adminResetPassword);

// Admin protected dashboard endpoints
router.get('/admin/dashboard', requireAdmin, getDashboardStats);
router.get('/admin/dashboard/charts', requireAdmin, getCharts);

export default router;
