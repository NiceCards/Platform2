/**
 * Builds an Express middleware that sanitizes incoming request bodies,
 * params and queries by stripping MongoDB operator keys ($, $gt, $ne, ...)
 * to prevent NoSQL injection.
 */
const sanitizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }
  if (value && typeof value === 'object' && value.constructor === Object) {
    const clean = {};
    Object.keys(value).forEach((key) => {
      if (key.startsWith('$')) return;
      clean[key] = sanitizeValue(value[key]);
    });
    return clean;
  }
  return value;
};

const sanitizeMiddleware = (req, _res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.params) req.params = sanitizeValue(req.params);
  if (req.query) req.query = sanitizeValue(req.query);
  next();
};

export default sanitizeMiddleware;
