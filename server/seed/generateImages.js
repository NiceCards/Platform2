/**
 * Generates an elegant, gift-card style SVG placeholder image. The seed uploads
 * the raw SVG markup to Cloudflare R2 (falling back to a base64 data URI stored
 * in MongoDB when R2 is not configured).
 */
const palettes = [
  ['#6366f1', '#8b5cf6'],
  ['#f43f5e', '#f97316'],
  ['#10b981', '#14b8a6'],
  ['#0ea5e9', '#2563eb'],
  ['#f59e0b', '#ef4444'],
  ['#ec4899', '#8b5cf6'],
  ['#84cc16', '#10b981'],
  ['#06b6d4', '#3b82f6'],
];

const icons = [
  '🎁', '🛍️', '🍕', '✈️', '🎮', '🎬', '☕', '💄',
  '👟', '📱', '🎧', '💻', '📚', '🎵', '⚽', '🍰',
];

const createGiftCardSvg = ({ brand, amount, accent, name }) => {
  const [c1, c2] = accent;
  const icon = icons[Math.floor(Math.random() * icons.length)];
  const safeName = (name || 'Gift Card').replace(/&/g, '&amp;');
  const safeBrand = (brand || 'Nice Cards').replace(/&/g, '&amp;');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <linearGradient id="card" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.05"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  <circle cx="680" cy="80" r="180" fill="#ffffff" opacity="0.08"/>
  <circle cx="90" cy="520" r="220" fill="#ffffff" opacity="0.08"/>
  <circle cx="420" cy="300" r="320" fill="#ffffff" opacity="0.04"/>
  <g filter="url(#shadow)">
    <rect x="120" y="90" width="560" height="380" rx="36" fill="url(#card)" stroke="#ffffff" stroke-opacity="0.25"/>
  </g>
  <text x="160" y="170" font-family="Segoe UI, Arial, sans-serif" font-size="30" font-weight="600" fill="#ffffff" opacity="0.9">${safeBrand}</text>
  <text x="400" y="300" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="160" fill="#ffffff">${icon}</text>
  <text x="160" y="360" font-family="Segoe UI, Arial, sans-serif" font-size="42" font-weight="700" fill="#ffffff">${amount}</text>
  <text x="160" y="420" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="500" fill="#ffffff" opacity="0.85">${safeName}</text>
  <rect x="150" y="120" width="120" height="14" rx="7" fill="#ffffff" opacity="0.3"/>
  <rect x="640" y="430" width="40" height="26" rx="5" fill="#ffffff" opacity="0.9"/>
</svg>`;
};

/**
 * Builds the raw SVG markup for an elegant, gift-card style placeholder image.
 * `variant` selects a different accent palette + icon so each product can have
 * two distinct images. The markup is returned (not encoded) so it can be
 * uploaded to Cloudflare R2 by the caller.
 */
export const generateProductImageSvg = ({ brand, name, price, index, variant = 0 }) => {
  const accent = palettes[(index + variant) % palettes.length];

  return createGiftCardSvg({
    brand,
    amount: `₹${Number(price).toLocaleString('en-IN')}`,
    accent,
    name,
  });
};

/**
 * Generates an elegant, gift-card style SVG placeholder image and returns it as
 * a base64 data URI. Kept as a fallback for when Cloudflare R2 is not
 * configured (the image then lives inside MongoDB instead of on disk).
 */
export const generateProductImage = ({ brand, name, price, index, variant = 0 }) => {
  const svg = generateProductImageSvg({ brand, name, price, index, variant });
  const base64 = Buffer.from(svg, 'utf-8').toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
};
