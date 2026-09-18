import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import adminApi from '../services/adminApi';
import { getErrorMessage } from '../services/api';
import Pagination from '../components/Pagination';
import { SkeletonRows } from '../components/Skeletons';
import OrderDetailModal from './OrderDetailModal';
import { imageUrl } from '../utils/media';
import { formatINR } from '../utils/currency';
import { IconSearch, IconEye, IconTruck, IconTrash, IconSpinner, IconPackage } from '../components/icons';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const params = useMemo(() => ({ limit: 10, page, search }), [page, search]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/orders', { params });
      setOrders(res.data.orders);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const submitSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const markDelivered = async (order) => {
    setActionId(order._id);
    try {
      await adminApi.put(`/order/${order._id}/deliver`);
      toast.success(`Order ${order.orderId} marked as delivered`);
      fetchOrders();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  const doDelete = async () => {
    setActionId('delete');
    try {
      await adminApi.delete(`/order/${confirmDelete._id}`);
      toast.success('Order deleted');
      setConfirmDelete(null);
      fetchOrders();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold">Pending Orders</h2>
          <p className="text-sm text-slate-400">{total} pending order{total === 1 ? '' : 's'}</p>
        </div>
        <form onSubmit={submitSearch} className="relative">
          <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search order ID, name, email..." className="input pl-10 py-2.5 w-72" />
        </form>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="p-5"><SkeletonRows rows={7} /></div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center">
            <IconPackage size={36} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-400">No pending orders</p>
            <p className="text-xs text-slate-400">New orders from the store will appear here.</p>
          </div>
        ) : (
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400 dark:border-slate-800">
                <th className="px-5 py-3 font-semibold">Order ID</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Contact</th>
                <th className="px-5 py-3 font-semibold">Products</th>
                <th className="px-5 py-3 font-semibold">Total</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-b border-slate-50 transition-colors hover:bg-slate-50/60 dark:border-slate-800/50 dark:hover:bg-slate-800/30">
                  <td className="px-5 py-3 font-mono text-xs font-bold text-brand-600 dark:text-brand-300">{o.orderId}</td>
                  <td className="px-5 py-3">
                    <p className="font-bold">{o.customer.name}</p>
                    <p className="text-xs text-slate-400">{o.items.length} item{o.items.length === 1 ? '' : 's'}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-xs">{o.customer.email}</p>
                    <p className="text-xs text-slate-400">{o.customer.phone}</p>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex -space-x-2">
                      {o.items.slice(0, 4).map((item, i) =>
                        item.image ? (
                          <img key={i} src={imageUrl(item.image)} alt={item.name} title={item.name} className="h-8 w-8 rounded-lg border-2 border-white object-contain bg-slate-100 dark:bg-slate-800 dark:border-surface-dark" />
                        ) : null
                      )}
                      {o.items.length > 4 && <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-800">+{o.items.length - 4}</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-bold">{formatINR(o.total)}</td>
                  <td className="px-5 py-3 text-xs text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <span className="badge bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">Pending</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => setViewing(o)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800" aria-label="View details">
                        <IconEye size={16} />
                      </button>
                      <button
                        onClick={() => markDelivered(o)}
                        disabled={actionId === o._id}
                        className="btn bg-emerald-600 px-3 py-2 text-xs text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {actionId === o._id ? <IconSpinner size={14} /> : <IconTruck size={14} />} Delivered
                      </button>
                      <button onClick={() => setConfirmDelete(o)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10" aria-label="Delete order">
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
      <OrderDetailModal order={viewing} onClose={() => setViewing(null)} />

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="card w-full max-w-sm p-6 text-center">
              <h3 className="font-display text-lg font-bold">Delete order?</h3>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                Order {confirmDelete.orderId} will be removed and product stock restored.
              </p>
              <div className="mt-5 flex gap-2">
                <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={doDelete} disabled={actionId === 'delete'} className="btn-danger flex-1">
                  {actionId === 'delete' && <IconSpinner size={16} />} Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;
