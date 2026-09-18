import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import adminApi from '../services/adminApi';
import { getErrorMessage } from '../services/api';
import { useCategories } from '../hooks/useProducts';
import Pagination from '../components/Pagination';
import { SkeletonRows } from '../components/Skeletons';
import { formatINR } from '../utils/currency';
import { imageUrl } from '../utils/media';
import {
  IconPlus, IconSearch, IconEdit, IconTrash, IconSpinner, IconX, IconImage,
} from '../components/icons';

const AdminProducts = () => {
  const { categories } = useCategories();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const params = useMemo(
    () => ({ limit: 10, page, search, category, status, sort: 'newest' }),
    [page, search, category, status]
  );

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/products', { params });
      setProducts(res.data.products);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const submitSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const toggleActive = async (product) => {
    try {
      await adminApi.put(`/product/${product._id}`, { isActive: !product.isActive });
      toast.success(`${product.name} ${product.isActive ? 'disabled' : 'enabled'}`);
      fetchProducts();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await adminApi.delete(`/product/${confirmDelete._id}`);
      toast.success('Product deleted');
      setConfirmDelete(null);
      fetchProducts();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold">Products</h2>
          <p className="text-sm text-slate-400">{total} products total</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary">
          <IconPlus size={17} /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <form onSubmit={submitSearch} className="relative flex-1 min-w-56">
          <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search name, brand, SKU..." className="input pl-10 py-2.5" />
        </form>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="input w-auto py-2.5">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input w-auto py-2.5">
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        {loading ? (
          <div className="p-5"><SkeletonRows rows={8} /></div>
        ) : products.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-400">No products found.</p>
        ) : (
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400 dark:border-slate-800">
                <th className="px-5 py-3 font-semibold">Product</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Price</th>
                <th className="px-5 py-3 font-semibold">Stock</th>
                <th className="px-5 py-3 font-semibold">Rating</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-slate-50 transition-colors hover:bg-slate-50/60 dark:border-slate-800/50 dark:hover:bg-slate-800/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={imageUrl(p.images?.[0]) || '/placeholder.svg'} alt={p.name} className="h-11 w-11 rounded-lg object-contain bg-slate-100 dark:bg-slate-800" />
                      <div>
                        <p className="font-bold">{p.name}</p>
                        <p className="text-xs text-slate-400">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="badge bg-brand-600/10 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">{p.category?.name}</span>
                  </td>
                  <td className="px-5 py-3 font-semibold">{formatINR(p.price)}</td>
                  <td className="px-5 py-3">
                    <span className={`font-semibold ${p.stock === 0 ? 'text-rose-500' : p.stock <= 1000 ? 'text-amber-500' : ''}`}>{p.stock}</span>
                  </td>
                  <td className="px-5 py-3">{p.rating.toFixed(1)} ({p.numReviews})</td>
                  <td className="px-5 py-3">
                    <button onClick={() => toggleActive(p)} className={`badge cursor-pointer transition-colors ${p.isActive ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300'}`}>
                      {p.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link to={`/admin/products/${p._id}/edit`} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-500/10" aria-label="Edit">
                        <IconEdit size={16} />
                      </Link>
                      <button onClick={() => setConfirmDelete(p)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10" aria-label="Delete">
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={page} pages={pages} onChange={(p) => setPage(p)} />

      {/* Delete confirm modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} className="card w-full max-w-sm p-6 text-center">
              <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-rose-100 text-rose-500 dark:bg-rose-500/10">
                <IconTrash size={22} />
              </span>
              <h3 className="font-display text-lg font-bold">Delete product?</h3>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                &quot;{confirmDelete.name}&quot; will be permanently removed. This action cannot be undone.
              </p>
              <div className="mt-5 flex gap-2">
                <button onClick={() => setConfirmDelete(null)} disabled={deleting} className="btn-secondary flex-1">Cancel</button>
                <button onClick={doDelete} disabled={deleting} className="btn-danger flex-1">
                  {deleting ? <IconSpinner size={16} /> : <IconX size={16} />} Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;
