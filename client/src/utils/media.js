const backendOrigin = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const imageUrl = (path) => {
  if (!path) return '';
  if (/^(https?:)?\/\//i.test(path)) return path;
  if (/^data:/i.test(path)) return path;
  return `${backendOrigin}${path}`;
};
