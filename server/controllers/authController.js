import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import DeliveredOrder from '../models/DeliveredOrder.js';
import AppError from '../utils/appError.js';

const signToken = (user) =>
  jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
    },
  });
};

/**
 * POST /signup - Create a new user account.
 */
export const signup = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return next(new AppError('Name, email, phone and password are required', 400));
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return next(new AppError('An account with this email already exists', 409));
    }

    const user = await User.create({ name, email, phone, password });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /login - Authenticate a user and return a JWT.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Email and password are required', 400));
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Your account has been disabled. Contact support.', 403));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /forgot-password - Check whether the email belongs to an existing account.
 * No email verification is used; the response simply tells the client whether
 * the account exists so the user can proceed to set a new password directly.
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return next(new AppError('Please provide your email address', 400));
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !user.isActive) {
      return res.status(200).json({
        success: true,
        exists: false,
        message: 'No account found with this email address.',
      });
    }

    res.status(200).json({
      success: true,
      exists: true,
      message: 'Account found. You can now choose a new password.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /reset-password - Set a new password for the account matching the email.
 * No token verification is performed.
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body || {};

    if (!email) {
      return next(new AppError('Email is required', 400));
    }
    if (!newPassword || newPassword.length < 6) {
      return next(new AppError('New password must be at least 6 characters', 400));
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.isActive) {
      return next(new AppError('No account found with this email address', 404));
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully. You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /profile - Update the authenticated user's own details.
 * Name, email, phone and address are editable. The password can also be
 * changed by providing the current password and a new one.
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone, address, currentPassword, newPassword } = req.body || {};

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (name !== undefined) {
      if (String(name).trim().length < 2) {
        return next(new AppError('Name must be at least 2 characters', 400));
      }
      user.name = String(name).trim();
    }

    if (email !== undefined) {
      const nextEmail = String(email).trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(nextEmail)) {
        return next(new AppError('Please provide a valid email address', 400));
      }
      if (nextEmail !== user.email) {
        const existing = await User.findOne({ email: nextEmail, _id: { $ne: user._id } });
        if (existing) {
          return next(new AppError('An account with this email already exists', 409));
        }
        user.email = nextEmail;
      }
    }

    if (phone !== undefined) {
      const nextPhone = String(phone).trim();
      if (!/^[+\d][\d\s\-()]{6,20}$/.test(nextPhone)) {
        return next(new AppError('Please provide a valid phone number', 400));
      }
      user.phone = nextPhone;
    }

    if (address !== undefined) {
      user.address = String(address).trim();
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        return next(new AppError('New password must be at least 6 characters', 400));
      }
      if (!currentPassword) {
        return next(new AppError('Current password is required to set a new password', 400));
      }
      const matches = await user.comparePassword(currentPassword);
      if (!matches) {
        return next(new AppError('Current password is incorrect', 401));
      }
      user.password = newPassword;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /profile - Return the authenticated user's profile with order stats.
 */
export const getProfile = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    const delivered = await DeliveredOrder.find({ user: req.user._id }).sort({
      deliveredAt: -1,
    });

    // Pending orders (from the orders collection)
    const pendingOrders = orders.map((o) => ({
      id: o._id,
      orderId: o.orderId,
      total: o.total,
      status: o.status,
      itemCount: o.items.length,
      items: o.items.map((it) => ({
        product: it.product,
        name: it.name,
        price: it.price,
        quantity: it.quantity,
        image: it.image,
      })),
      createdAt: o.createdAt,
    }));

    // Delivered orders (from the deliveredorders collection)
    const deliveredOrders = delivered.map((o) => ({
      id: o._id,
      orderId: o.orderId,
      total: o.total,
      status: 'delivered',
      itemCount: o.items.length,
      items: o.items.map((it) => ({
        product: it.product,
        name: it.name,
        price: it.price,
        quantity: it.quantity,
        image: it.image,
      })),
      createdAt: o.deliveredAt || o.createdAt,
    }));

    // Newest first
    const allOrders = [...pendingOrders, ...deliveredOrders].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        address: req.user.address,
        createdAt: req.user.createdAt,
      },
      stats: {
        totalOrders: orders.length + delivered.length,
        pendingOrders: orders.filter((o) => o.status === 'pending').length,
        deliveredOrders: delivered.length,
      },
      orders: allOrders,
    });
  } catch (error) {
    next(error);
  }
};
