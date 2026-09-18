import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

const STORAGE_KEY = 'nicecards_cart';

const loadCart = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback(
    (product, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.product === product._id);
        if (existing) {
          return prev.map((i) =>
            i.product === product._id
              ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
              : i
          );
        }
        return [...prev, { product: product._id, name: product.name, price: product.price, image: product.images?.[0] || '', stock: product.stock, quantity }];
      });
      toast.success(`${product.name} added to cart`);
    },
    []
  );

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.product !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.product === productId
            ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const { count, total } = useMemo(() => {
    const c = items.reduce((sum, i) => sum + i.quantity, 0);
    const t = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return { count: c, total: t };
  }, [items]);

  return (
    <CartContext.Provider
      value={{ items, count, total, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
