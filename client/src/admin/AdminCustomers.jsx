import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import adminApi from '../services/adminApi';
import { getErrorMessage } from '../services/api';
import Pagination from '../components/Pagination';
import { SkeletonRows } from '../components/Skeletons';
import { formatINR } from '../utils/currency';
import { IconSearch, IconEye, IconTrash, IconSpinner, IconUsers, IconPackage } from '../components/icons';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const params = useMemo(() => ({ limit: 10, page, search }), [page, search]);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/customers', { params });
      setCustomers(res.data.customers);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const submitSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const toggleActive = async (customer) => {
    setActionId(customer._id);
    try {
      await adminApi.put(`/customer/${customer._id}`, { isActive: !customer.isActive });
      toast.success(`${customer.name} ${customer.isActive ? 'disabled' : 'enabled'}`);
      fetchCustomers();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  const doDelete = async () => {
    setActionId('delete');
    try {
      await adminApi.delete(`/customer/${confirmAction._id}`);
      toast.success('Customer deleted');
      setConfirmAction(null);
      fetchCustomers();
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
          <h2 className="font-display text-xl font-extrabold">Customers</h2>
          <p className="text-sm text-slate-400">{total} registered customer{total === 1 ? '' : 's'}</p>
        </div>
        <form onSubmit={submitSearch} className="relative">
          <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search name, email, phone..." className="input pl-10 py-2.5 w-72" />
        </form>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="p-5"><SkeletonRows rows={7} /></div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center">
            <IconUsers size={36} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-400">No customers found</p>
          </div>
        ) : (
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400 dark:border-slate-800">
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Phone</th>
                <th className="px-5 py-3 font-semibold">Registered</th>
                <th className="px-5 py-3 font-semibold">Orders</th>
                <th className="px-5 py-3 font-semibold">Spending</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id} className="border-b border-slate-50 transition-colors hover:bg-slate-50/60 dark:border-slate-800/50 dark:hover:bg-slate-800/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white">
                        {c.name.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-bold">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs">{c.phone}</td>
                  <td className="px-5 py-3 text-xs text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1.5 font-semibold"><IconPackage size={14} className="text-slate-400" /> {c.totalOrders}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">{formatINR(c.totalSpending)}</span>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => toggleActive(c)} disabled={actionId === c._id} className={`badge cursor-pointer transition-colors disabled:opacity-50 ${c.isActive ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300'}`}>
                      {actionId === c._id ? <IconSpinner size={12} /> : c.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link to={`/admin/customers/${c._id}`} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800" aria-label="View customer">
                        <IconEye size={16} />
                      </Link>
                      <button onClick={() => setConfirmAction(c)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10" aria-label="Delete customer">
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

      <AnimatePresence>
        {confirmAction && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="card w-full max-w-sm p-6 text-center">
              <h3 className="font-display text-lg font-bold">Delete customer?</h3>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                {confirmAction.name} and their orders will be permanently removed.
              </p>
              <div className="mt-5 flex gap-2">
                <button onClick={() => setConfirmAction(null)} className="btn-secondary flex-1">Cancel</button>
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

export default AdminCustomers;
