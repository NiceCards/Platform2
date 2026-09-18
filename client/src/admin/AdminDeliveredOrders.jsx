import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import adminApi from '../services/adminApi';
import { getErrorMessage } from '../services/api';
import Pagination from '../components/Pagination';
import { SkeletonRows } from '../components/Skeletons';
import OrderDetailModal from './OrderDetailModal';
import { imageUrl } from '../utils/media';
import { formatINR } from '../utils/currency';
import { IconSearch, IconEye, IconTruck, IconPackage } from '../components/icons';

const AdminDeliveredOrders = () => {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);

  const params = useMemo(() => ({ limit: 10, page, search }), [page, search]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/orders/delivered', { params });
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

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold">Delivered Orders</h2>
          <p className="text-sm text-slate-400">{total} delivered order{total === 1 ? '' : 's'}</p>
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
            <IconTruck size={36} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-400">No delivered orders yet</p>
            <p className="text-xs text-slate-400">Orders move here after being marked as delivered.</p>
          </div>
        ) : (
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400 dark:border-slate-800">
                <th className="px-5 py-3 font-semibold">Order ID</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Products</th>
                <th className="px-5 py-3 font-semibold">Total</th>
                <th className="px-5 py-3 font-semibold">Order Date</th>
                <th className="px-5 py-3 font-semibold">Delivered Date</th>
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
                    <p className="text-xs text-slate-400">{o.customer.email}</p>
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
                  <td className="px-5 py-3 text-xs text-slate-400">{new Date(o.orderDate).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-xs text-slate-400">{new Date(o.deliveredAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <span className="badge bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">Delivered</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end">
                      <button onClick={() => setViewing(o)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800" aria-label="View details">
                        <IconEye size={16} />
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
    </div>
  );
};

export default AdminDeliveredOrders;
