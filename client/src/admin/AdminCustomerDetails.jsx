import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import adminApi from '../services/adminApi';
import { getErrorMessage } from '../services/api';
import { SkeletonRows } from '../components/Skeletons';
import OrderDetailModal from './OrderDetailModal';
import { formatINR } from '../utils/currency';
import {
  IconChevronLeft, IconUser, IconMail, IconPhone, IconPackage,
  IconClock, IconCheck, IconEye, IconSpinner, IconTruck,
} from '../components/icons';

const AdminCustomerDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    let cancelled = false;
    adminApi
      .get(`/customer/${id}`)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const toggleActive = async () => {
    setToggling(true);
    try {
      await adminApi.put(`/customer/${id}`, { isActive: !data.customer.isActive });
      setData((d) => ({ ...d, customer: { ...d.customer, isActive: !d.customer.isActive } }));
      toast.success('Customer status updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-20">
        <IconSpinner size={28} className="text-brand-600" />
      </div>
    );
  }

  if (!data?.customer) {
    return <p className="py-16 text-center text-slate-400">Customer not found.</p>;
  }

  const { customer, orderHistory } = data;
  const s = customer.stats;
  const allOrders = [...orderHistory.pending, ...orderHistory.delivered];

  const statusBadge = (status) => {
    if (status === 'pending') {
      return (
        <span className="badge bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"><IconClock size={12} /> Pending</span>
      );
    }
    if (status === 'dispatched') {
      return (
        <span className="badge bg-sky-100 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400"><IconTruck size={12} /> Dispatched</span>
      );
    }
    return (
      <span className="badge bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"><IconCheck size={12} /> Delivered</span>
    );
  };

  return (
    <div className="space-y-6">
      <Link to="/admin/customers" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-600 dark:hover:text-brand-300">
        <IconChevronLeft size={16} /> Back to customers
      </Link>

      {/* Profile */}
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-brand-500 to-brand-700 p-6 text-white">
          <div className="flex flex-wrap items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/15 text-2xl font-extrabold backdrop-blur">
              {customer.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-xl font-extrabold">{customer.name}</h2>
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/80">
                <span className="flex items-center gap-1.5"><IconMail size={14} /> {customer.email}</span>
                <span className="flex items-center gap-1.5"><IconPhone size={14} /> {customer.phone}</span>
              </p>
            </div>
            <button onClick={toggleActive} disabled={toggling} className={`btn ${customer.isActive ? 'bg-white text-emerald-600 hover:bg-emerald-50' : 'bg-white/15 text-white ring-1 ring-white/40 hover:bg-white/25'}`}>
              {toggling ? <IconSpinner size={16} /> : null}
              {customer.isActive ? 'Disable Customer' : 'Enable Customer'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400"><IconPackage size={13} /> Total Orders</p>
            <p className="mt-1 font-display text-xl font-extrabold">{s.totalOrders}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400"><IconClock size={13} /> Pending</p>
            <p className="mt-1 font-display text-xl font-extrabold">{s.pendingOrders}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400"><IconCheck size={13} /> Delivered</p>
            <p className="mt-1 font-display text-xl font-extrabold">{s.deliveredOrders}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">Total Spending</p>
            <p className="mt-1 font-display text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{formatINR(s.totalSpending)}</p>
          </div>
        </div>
      </div>

      {/* Order history */}
      <div>
        <h3 className="mb-3 font-display text-lg font-bold">Order History</h3>
        {allOrders.length === 0 ? (
          <p className="card py-10 text-center text-sm text-slate-400">This customer has no orders yet.</p>
        ) : (
          <div className="space-y-3">
            {allOrders.map((o) => (
              <div key={o._id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600/10 text-brand-600 dark:text-brand-300">
                    <IconPackage size={18} />
                  </span>
                  <div>
                    <p className="font-mono text-xs font-bold text-brand-600 dark:text-brand-300">{o.orderId}</p>
                    <p className="text-xs text-slate-400">
                      {o.items.length} item{o.items.length === 1 ? '' : 's'} • {new Date(o.createdAt || o.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">{formatINR(o.total)}</span>
                  {statusBadge(o.status)}
                  <button onClick={() => setViewing(o)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="View order">
                    <IconEye size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <OrderDetailModal order={viewing} onClose={() => setViewing(null)} />
    </div>
  );
};

export default AdminCustomerDetails;
