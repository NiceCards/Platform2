import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts, useCategories } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import { SkeletonGrid } from '../components/Skeletons';
import EmptyState from '../components/EmptyState';
import { IconSearch, IconX } from '../components/icons';

const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const priceRanges = [
  { label: 'Rs 10 - 20', min: '10', max: '20' },
  { label: 'Rs 20 - 50', min: '20', max: '50' },
  { label: 'Rs 50 - 100', min: '50', max: '100' },
  { label: 'Rs 100+', min: '100', max: '' },
];

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'popular';
  const page = parseInt(searchParams.get('page'), 10) || 1;
  const inStock = searchParams.get('inStock') === 'true';
  const minPrice = searchParams.get('min') || '';
  const maxPrice = searchParams.get('max') || '';

  const [localQ, setLocalQ] = useState(q);
  const { categories } = useCategories();

  useEffect(() => setLocalQ(q), [q]);

  const query = useMemo(() => {
    const params = { sort, limit: 12, page };
    if (q) params.search = q;
    if (category) params.category = category;
    if (inStock) params.inStock = 'true';
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    return params;
  }, [q, category, sort, page, inStock, minPrice, maxPrice]);

  const { products, total, pages, loading } = useProducts(query);

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) next.delete(key);
      else next.set(key, value);
    });
    // Reset to the first page whenever a filter changes, but keep the page
    // when the change is itself a pagination request.
    if (!('page' in updates)) next.delete('page');
    setSearchParams(next);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    updateParams({ q: localQ });
  };

  const hasFilters = q || category || inStock || minPrice || maxPrice;

  return (
    <div className="container-x animate-fade-in py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold">Find Your Perfect Card</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {loading ? 'Searching...' : `${total} card${total === 1 ? '' : 's'} found`}
          {q && <> for &quot;{q}&quot;</>}
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={submitSearch} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <IconSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            placeholder="Search by type, name or SKU..."
            className="input pl-11 py-3"
          />
        </div>
        <button type="submit" className="btn-primary px-6">
          Search
        </button>
      </form>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Filters sidebar */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold">Filters</h3>
              {hasFilters && (
                <button
                  onClick={() => setSearchParams({})}
                  className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-600"
                >
                  <IconX size={13} /> Clear all
                </button>
              )}
            </div>

            <div className="space-y-5">
              <div>
                <p className="label">Category</p>
                <select value={category} onChange={(e) => updateParams({ category: e.target.value })} className="input py-2">
                  <option value="">All categories</option>
                  {categories.filter((c) => c.isActive).map((c) => (
                    <option key={c._id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <p className="label">Price range</p>
                <div className="space-y-2">
                  {priceRanges.map((r) => {
                    const active = minPrice === r.min && (maxPrice || '') === (r.max || '');
                    return (
                      <button
                        key={r.label}
                        type="button"
                        onClick={() =>
                          updateParams(active ? { min: '', max: '' } : { min: r.min, max: r.max })
                        }
                        className={`flex w-full items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                          active
                            ? 'border-transparent bg-gradient-to-r from-brand-500 to-brand-700 text-white'
                            : 'border-slate-200 text-slate-600 hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-brand-500'
                        }`}
                      >
                        <span
                          className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
                            active ? 'border-white' : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {active && <span className="h-2 w-2 rounded-full bg-white" />}
                        </span>
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700">
                <span className="text-sm font-semibold">In stock only</span>
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => updateParams({ inStock: e.target.checked ? 'true' : '' })}
                  className="h-4 w-4 accent-brand-600"
                />
              </label>

              <div>
                <p className="label">Sort by</p>
                <select value={sort} onChange={(e) => updateParams({ sort: e.target.value })} className="input py-2">
                  {sortOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div>
          <AnimatePresence mode="popLayout">
            {loading ? (
              <motion.div layout>
                <SkeletonGrid count={8} />
              </motion.div>
            ) : products.length === 0 ? (
              <EmptyState
                icon={<IconSearch size={30} />}
                title="No cards match your search"
                description="Try different keywords or remove some filters."
                actionLabel="Reset filters"
                actionTo="/search"
              />
            ) : (
              <motion.div layout className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </motion.div>
            )}
          </AnimatePresence>

          {!loading && products.length > 0 && (
            <Pagination page={page} pages={pages} onChange={(p) => updateParams({ page: String(p) })} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
