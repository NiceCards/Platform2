import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import User from '../models/User.js';
import AppError from '../utils/appError.js';

/**
 * Optional auth: attaches the authenticated user to req.user when a valid
 * token is present, but does NOT block requests without one (guest checkout).
 */
export const optionalProtect = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next();
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return next();
    }

    const user = await User.findById(decoded.id);
    if (user && user.isActive) {
      req.user = user;
    }
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Protects routes by validating the JWT sent in the Authorization header.
 * Attaches the authenticated user to `req.user`.
 */
export const protect = async (req, _res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized. Please log in to continue.', 401));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return next(new AppError('Session expired or invalid token. Please log in again.', 401));
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Your account has been disabled. Contact support.', 403));
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
