import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import EmptyState from '../components/EmptyState';
import QuantityStepper from '../components/QuantityStepper';
import { formatINR } from '../utils/currency';
import { imageUrl } from '../utils/media';
import { IconCart, IconTrash, IconArrowRight } from '../components/icons';

const Cart = () => {
  const { items, total, count, removeItem, updateQuantity, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="container-x py-16">
        <EmptyState
          icon={<IconCart size={30} />}
          title="Your cart is empty"
          description="Browse our collection and find the perfect card to add."
          actionLabel="Explore cards"
          actionTo="/search"
        />
      </div>
    );
  }

  return (
    <div className="container-x animate-fade-in py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-extrabold">
          Your Cart <span className="text-lg font-semibold text-slate-400">({count} items)</span>
        </h1>
        <button onClick={clearCart} className="flex items-center gap-1.5 text-sm font-semibold text-rose-500 hover:text-rose-600">
          <IconTrash size={15} /> Clear cart
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.div
                key={item.product}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -24 }}
                className="card flex gap-4 p-4"
              >
                <Link to={`/product/${item.product}`} className="shrink-0">
                  <img src={imageUrl(item.image) || '/placeholder.svg'} alt={item.name} className="h-24 w-24 rounded-xl object-contain bg-slate-100 dark:bg-slate-800" />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link to={`/product/${item.product}`} className="block truncate font-bold hover:text-brand-600 dark:hover:text-brand-300">
                        {item.name}
                      </Link>
                      <p className="text-sm text-slate-400">{formatINR(item.price)} each</p>
                    </div>
                    <button onClick={() => removeItem(item.product)} aria-label="Remove item" className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10">
                      <IconTrash size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <QuantityStepper compact value={item.quantity} max={item.stock} onChange={(q) => updateQuantity(item.product, q)} />
                    <p className="font-display text-lg font-extrabold text-brand-600 dark:text-brand-300">
                      {formatINR(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="card h-fit p-6 lg:sticky lg:top-24">
          <h3 className="font-display text-lg font-bold">Order Summary</h3>
          <div className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Subtotal ({count} items)</span>
              <span>{formatINR(total)}</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Delivery</span>
              <span className="font-semibold text-emerald-500">Instant</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Fees</span>
              <span>₹0</span>
            </div>
            <div className="border-t border-dashed border-slate-200 pt-3 dark:border-slate-700">
              <div className="flex justify-between">
                <span className="font-bold">Total</span>
                <span className="font-display text-2xl font-extrabold text-brand-600 dark:text-brand-300">{formatINR(total)}</span>
              </div>
            </div>
          </div>

          <Link to="/checkout" className="btn-primary mt-6 w-full py-3 text-base">
            Proceed to Checkout <IconArrowRight size={18} />
          </Link>
          <Link to="/search" className="btn-ghost mt-2 w-full">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
