import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconStar, IconCart, IconCheck } from './icons';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/currency';
import { imageUrl } from '../utils/media';

const Rating = ({ value = 0, size = 14 }) => (
  <span className="inline-flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <IconStar key={i} size={size} filled={i <= Math.round(value)} className={i <= Math.round(value) ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'} />
    ))}
  </span>
);

export { Rating };

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const outOfStock = product.stock <= 0;
  const discount =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
      className="group card overflow-hidden hover:-translate-y-1 hover:shadow-card-lg"
    >
      <Link to={`/product/${product._id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={imageUrl(product.images?.[0]) || '/placeholder.svg'}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain transition-opacity duration-500 group-hover:opacity-0"
          />
          {product.images?.[1] && (
            <img
              src={imageUrl(product.images[1])}
              alt={`${product.name} alternate`}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-contain opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="badge bg-rose-600 text-white">-{discount}%</span>
            )}
          </div>
        </div>
      </Link>

      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link to={`/product/${product._id}`} className="block truncate text-sm font-bold hover:text-brand-600 dark:hover:text-brand-300">
              {product.name}
            </Link>
            <p className="mt-0.5 hidden text-xs font-medium text-slate-400 sm:block">{product.brand}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-extrabold text-brand-600 dark:text-brand-300 sm:text-base">{formatINR(product.price)}</p>
            {product.originalPrice > product.price && (
              <p className="text-xs text-slate-400 line-through">{formatINR(product.originalPrice)}</p>
            )}
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1.5">
            <Rating value={product.rating} />
            <span className="hidden text-xs font-medium text-slate-400 sm:inline">({product.numReviews})</span>
          </div>
          <span className={`badge w-fit ${outOfStock ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
            {outOfStock ? 'Out of Stock' : `${product.stock} in stock`}
          </span>
        </div>

        <button
          disabled={outOfStock}
          onClick={() => addItem(product)}
          className="btn-primary mt-3 w-full py-2 sm:py-2.5 disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:hover:brightness-100 disabled:active:scale-100"
        >
          {outOfStock ? (
            <><IconCheck size={16} /> Out of Stock</>
          ) : (
            <><IconCart size={16} /> Add to Cart</>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;