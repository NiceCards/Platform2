import mongoose from 'mongoose';

/**
 * Validates that a string is a valid MongoDB ObjectId.
 */
export const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Converts an arbitrary string into a URL-friendly slug.
 */
export const slugify = (value) =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * Generates a human friendly order ID like GC-XXXXXXXX.
 */
export const generateOrderId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 8; i += 1) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `GC-${suffix}`;
};

/**
 * Generates a unique product SKU.
 */
export const generateSku = (name = 'PRODUCT') => {
  const base = slugify(name)
    .split('-')
    .slice(0, 2)
    .join('')
    .toUpperCase()
    .slice(0, 8);
  return `${base || 'GC'}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
};

/**
 * Pagination helper. Returns the page, limit and skip values.
 */
export const paginate = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 12, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Serializes a Mongoose document to a plain object (JSON).
 */
export const toJSON = (doc) => JSON.parse(JSON.stringify(doc));
