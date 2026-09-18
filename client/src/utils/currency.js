/**
 * Formats a number as Indian Rupees (INR).
 * Example: formatINR(2075) => "₹2,075"
 */
export const formatINR = (amount) =>
  `₹${Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
