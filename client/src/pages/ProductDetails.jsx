import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useProduct } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { Rating } from '../components/ProductCard';
import QuantityStepper from '../components/QuantityStepper';
import { SkeletonText } from '../components/Skeletons';
import EmptyState from '../components/EmptyState';
import { formatINR } from '../utils/currency';
import { imageUrl } from '../utils/media';
import { downloadProductPdf } from '../utils/pdf';
import {
  IconCart, IconShield, IconTruck, IconClock,
  IconChevronLeft, IconPackage, IconCheck, IconSearch,
  IconDownload, IconSpinner,
} from '../components/icons';

const ProductDetails = () => {
  const { id } = useParams();
  const { product, loading, error, refetch } = useProduct(id);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    setQuantity(1);
    setActiveImage(0);
  }, [id]);

  if (loading) {
    return (
      <div className="container-x grid gap-10 py-12 lg:grid-cols-2">
        <div className="skeleton aspect-[4/3] rounded-3xl" />
        <div className="space-y-4">
          <SkeletonText className="h-8 w-2/3" />
          <SkeletonText className="h-4 w-1/3" />
          <SkeletonText className="h-28 w-full" />
          <SkeletonText className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-x py-16">
        <EmptyState
          icon={<IconSearch size={30} />}
          title="Product not found"
          description={error || 'The card you are looking for does not exist or has been removed.'}
          actionLabel="Back to store"
          actionTo="/search"
        />
      </div>
    );
  }

  const outOfStock = product.stock <= 0;
  const discount =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;
  const images = product.images?.length ? product.images.map(imageUrl) : ['/placeholder.svg'];

  const handleAdd = () => {
    if (outOfStock) {
      toast.error('This card is currently out of stock');
      return;
    }
    addItem(product, quantity);
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    const toastId = toast.loading('Preparing PDF...');
    try {
      await downloadProductPdf(product, { imageSrc: images[activeImage] || images[0] });
      toast.success('Details downloaded', { id: toastId });
    } catch (err) {
      toast.error('Could not generate PDF', { id: toastId });
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="container-x animate-fade-in py-10">
      <Link to="/search" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-600 dark:hover:text-brand-300">
        <IconChevronLeft size={16} /> Back to store
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Image gallery */}
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="relative">
          <div className="overflow-hidden rounded-3xl bg-slate-50 shadow-card-lg ring-1 ring-slate-100 dark:bg-slate-800/50 dark:ring-slate-800">
            <img
              key={activeImage}
              src={images[activeImage] || '/placeholder.svg'}
              alt={product.name}
              className="aspect-[4/3] w-full object-contain"
            />
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {images.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`relative h-20 w-24 overflow-hidden rounded-xl bg-slate-50 ring-2 transition-all dark:bg-slate-800/50 sm:h-24 sm:w-28 ${
                    activeImage === i
                      ? 'ring-brand-500 shadow-glow'
                      : 'ring-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={src} alt={`${product.name} ${i + 1}`} className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}

          <div className="absolute left-4 top-4 flex flex-col gap-2">
            {discount > 0 && <span className="badge bg-rose-600 px-3 py-1.5 text-white">Save {discount}%</span>}
            {outOfStock ? (
              <span className="badge bg-rose-600 px-3 py-1.5 text-white">Out of Stock</span>
            ) : (
              <span className="badge bg-white/90 px-3 py-1.5 text-emerald-600 backdrop-blur">
                <IconCheck size={13} /> In Stock
              </span>
            )}
          </div>
        </motion.div>

        {/* Info */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <nav className="text-xs text-slate-400">
            <Link to="/" className="hover:text-brand-600">Home</Link>
            <span className="mx-1.5">/</span>
            <Link to={`/category/${product.category?.slug}`} className="hover:text-brand-600">
              {product.category?.name}
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500 dark:text-slate-300">{product.name}</span>
          </nav>

          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{product.name}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Rating value={product.rating} size={16} />
            <span className="text-sm font-semibold text-slate-500">{product.rating || 'N/A'}</span>
            <span className="text-sm text-slate-400">({product.numReviews} reviews)</span>
            <span className="badge bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">{product.brand}</span>
            <span className="badge bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">SKU: {product.sku}</span>
          </div>

          <div className="mt-5 flex items-end gap-3">
            <p className="font-display text-4xl font-extrabold text-brand-600 dark:text-brand-300">{formatINR(product.price)}</p>
            {product.originalPrice > product.price && (
              <p className="mb-1 text-xl text-slate-400 line-through">{formatINR(product.originalPrice)}</p>
            )}
          </div>

          <p className="mt-5 leading-relaxed text-slate-600 dark:text-slate-300">{product.description}</p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className={`badge px-3 py-1.5 ${outOfStock ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
              <IconPackage size={14} />
              {outOfStock ? 'Out of Stock' : `${product.stock} available`}
            </span>
            <span className="badge bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              <IconTruck size={14} /> Delivered via email
            </span>
            <span className="badge bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              <IconClock size={14} /> No expiry
            </span>
          </div>

          {/* Quantity + add to cart */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <QuantityStepper
              value={quantity}
              max={Math.max(product.stock, 1)}
              onChange={setQuantity}
            />

            <button
              onClick={handleAdd}
              disabled={outOfStock}
              className="btn-primary flex-1 px-8 py-3 text-base sm:flex-none"
            >
              <IconCart size={18} />
              {outOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="btn-secondary px-6 py-3 text-base"
            >
              {downloadingPdf ? <IconSpinner size={18} /> : <IconDownload size={18} />}
              {downloadingPdf ? 'Preparing...' : 'Download Details'}
            </button>
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <IconShield size={16} className="text-emerald-500" /> 100% Secure Checkout
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              No payment required to place an order. Your card will delivered instantly after checkout.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Related? skip; keep single product page simple */}
    </div>
  );
};

export default ProductDetails;
