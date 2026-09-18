import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import { SkeletonGrid } from '../components/Skeletons';
import EmptyState from '../components/EmptyState';
import { IconGrid, IconSearch } from '../components/icons';

const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const CategoryProducts = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState('popular');
  const [inStock, setInStock] = useState(false);

  const page = parseInt(searchParams.get('page'), 10) || 1;
  const query = useMemo(
    () => ({ category: slug, sort, limit: 12, page, ...(inStock ? { inStock: 'true' } : {}) }),
    [slug, sort, page, inStock]
  );

  const { products, total, pages, loading } = useProducts(query);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, slug]);

  return (
    <div className="container-x animate-fade-in py-10">
      <div className="mb-8 rounded-3xl bg-gradient-to-br from-brand-800 to-brand-600 p-8 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Category</p>
        <h1 className="font-display text-3xl font-extrabold capitalize sm:text-4xl">
          {slug.replace(/-/g, ' ')}
        </h1>
        <p className="mt-1 text-sm text-white/80">{total} cards available</p>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setInStock(false)}
            className={`chip ${!inStock ? 'chip-active' : ''}`}
          >
            All
          </button>
          <button
            onClick={() => setInStock(true)}
            className={`chip ${inStock ? 'chip-active' : ''}`}
          >
            In Stock
          </button>
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input max-w-56 py-2">
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <SkeletonGrid count={8} />
      ) : products.length === 0 ? (
        <EmptyState
          icon={<IconGrid size={30} />}
          title="No cards in this category yet"
          description="Check back soon or explore other categories."
          actionLabel="Browse all cards"
          actionTo="/search"
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
          <Pagination page={page} pages={pages} onChange={(p) => setSearchParams({ page: String(p) })} />
        </>
      )}
    </div>
  );
};

export default CategoryProducts;
