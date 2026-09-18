import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import Admin from '../models/Admin.js';
import AppError from '../utils/appError.js';

const signAdminToken = (payload) =>
  jwt.sign(payload, config.jwtSecret, { expiresIn: '24h' });

/**
 * Ensures a single admin record exists in the database, seeded from the
 * ADMIN_EMAIL / ADMIN_PASSWORD environment variables on first boot.
 */
export const ensureAdmin = async () => {
  try {
    const email = (config.adminEmail || 'admin@nicecards.com').toLowerCase();
    const existing = await Admin.findOne({ email });
    if (existing) return existing;

    const password = config.adminPassword || 'Admin12345';
    if (!password || password.length < 6) {
      console.error('ADMIN_PASSWORD must be at least 6 characters; admin not seeded.');
      return null;
    }

    return await Admin.create({ email, password });
  } catch (error) {
    console.error(`Failed to seed admin: ${error.message}`);
    return null;
  }
};

/**
 * Admin login handler. Only a password is required (no username).
 * Password is compared against the hashed password of the seeded admin record.
 */
export const adminLogin = async (req, res, next) => {
  try {
    const { password } = req.body || {};

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    const admin = await Admin.findOne({ email: config.adminEmail.toLowerCase() }).select('+password');
    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, message: 'Admin account not found or disabled' });
    }

    if (!(await admin.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    const token = signAdminToken({ role: 'admin', id: admin._id });
    return res.status(200).json({
      success: true,
      message: 'Admin authenticated successfully',
      token,
      role: 'admin',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /admin/forgot-password - Check whether the submitted email matches the
 * seeded admin email. Mirrors the customer forgot-password flow: if it matches,
 * the admin can proceed to set a new password directly.
 */
export const adminForgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return next(new AppError('Please provide your email address', 400));
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin || !admin.isActive || email.toLowerCase() !== config.adminEmail.toLowerCase()) {
      return res.status(200).json({
        success: true,
        exists: false,
        message: 'No admin account found with this email address.',
      });
    }

    res.status(200).json({
      success: true,
      exists: true,
      message: 'Admin account found. You can now choose a new password.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /admin/reset-password - Set a new password for the admin account.
 * Only allowed when the email matches the seeded admin email.
 */
export const adminResetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body || {};

    if (!email) {
      return next(new AppError('Email is required', 400));
    }
    if (!newPassword || newPassword.length < 6) {
      return next(new AppError('New password must be at least 6 characters', 400));
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin || !admin.isActive || email.toLowerCase() !== config.adminEmail.toLowerCase()) {
      return next(new AppError('No admin account found with this email address', 404));
    }

    admin.password = newPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully. You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Guards admin routes by verifying the admin JWT token.
 */
export const requireAdmin = (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    if (!token) {
      return next(new AppError('Admin access required. Please log in as admin.', 401));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return next(new AppError('Invalid or expired admin session.', 401));
    }

    if (decoded.role !== 'admin') {
      return next(new AppError('Admin access required.', 403));
    }

    req.admin = decoded;
    next();
  } catch (error) {
    next(error);
  }
};
