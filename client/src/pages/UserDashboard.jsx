import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api, { getErrorMessage } from '../services/api';
import { SkeletonRows } from '../components/Skeletons';
import EmptyState from '../components/EmptyState';
import { formatINR } from '../utils/currency';
import { imageUrl } from '../utils/media';
import { IconPackage, IconClock, IconCheck, IconUser, IconMail, IconPhone, IconX, IconEdit } from '../components/icons';

const UserDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const loadProfile = useCallback(async () => {
    try {
      const res = await api.get('/profile');
      setProfile(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleCancel = async (order) => {
    setCancellingId(order.id);
    try {
      await api.put(`/order/${order.id}/cancel`);
      toast.success('Order cancelled successfully');
      setConfirmingId(null);
      await loadProfile();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCancellingId(null);
    }
  };

  const statusBadge = (status) =>
    status === 'pending' ? (
      <span className="badge bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"><IconClock size={12} /> Pending</span>
    ) : (
      <span className="badge bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"><IconCheck size={12} /> Delivered</span>
    );

  return (
    <div className="container-x animate-fade-in py-10">
      {/* Header */}
      <div className="mb-8 rounded-3xl bg-gradient-to-br from-brand-800 to-brand-600 p-8 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/15 text-2xl font-extrabold backdrop-blur">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </span>
            <div>
              <h1 className="font-display text-2xl font-extrabold">Welcome, {user?.name}!</h1>
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/80">
                <span className="flex items-center gap-1.5"><IconMail size={14} /> {user?.email}</span>
                <span className="flex items-center gap-1.5"><IconPhone size={14} /> {user?.phone}</span>
              </p>
            </div>
          </div>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/25"
          >
            <IconEdit size={16} /> Edit Profile
          </Link>
        </div>
      </div>

      {loading ? (
        <SkeletonRows rows={4} />
      ) : (
        <>
          {/* Stats */}
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Total Orders', value: profile?.stats?.totalOrders ?? 0, icon: <IconPackage size={20} /> },
              { label: 'Pending', value: profile?.stats?.pendingOrders ?? 0, icon: <IconClock size={20} /> },
              { label: 'Delivered', value: profile?.stats?.deliveredOrders ?? 0, icon: <IconCheck size={20} /> },
              { label: 'Member Since', value: new Date(profile?.user?.createdAt || Date.now()).toLocaleDateString(), icon: <IconUser size={20} /> },
            ].map((s) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card p-5">
                <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-brand-600/10 text-brand-600 dark:text-brand-300">{s.icon}</span>
                <p className="font-display text-2xl font-extrabold">{s.value}</p>
                <p className="text-xs font-medium text-slate-400">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Orders */}
          <h2 className="mb-4 font-display text-xl font-bold">My Orders</h2>
          {profile?.orders?.length === 0 ? (
            <EmptyState
              icon={<IconPackage size={28} />}
              title="No orders yet"
              description="When you place an order it will show up here."
              actionLabel="Start shopping"
              actionTo="/search"
            />
          ) : (
            <div className="space-y-3">
              {profile?.orders?.map((o) => (
                <div key={o.orderId} className="card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <Link to={`/order-success/${o.orderId}`} className="font-mono text-sm font-bold text-brand-600 hover:underline dark:text-brand-300">
                        {o.orderId}
                      </Link>
                      <p className="text-xs text-slate-400">
                        {new Date(o.createdAt).toLocaleDateString()} • {o.itemCount} item{o.itemCount === 1 ? '' : 's'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-display text-lg font-extrabold">{formatINR(o.total)}</span>
                      {statusBadge(o.status)}
                    </div>
                  </div>

                  {o.items?.length > 0 && (
                    <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                      {o.items.map((it, i) => (
                        <li key={`${o.orderId}-${i}`} className="flex items-center gap-3">
                          <img
                            src={imageUrl(it.image) || '/placeholder.svg'}
                            alt={it.name}
                            className="h-10 w-10 shrink-0 rounded-lg object-contain bg-slate-100 dark:bg-slate-800"
                          />
                          <span className="min-w-0 flex-1 truncate text-sm font-medium">{it.name}</span>
                          <span className="text-xs text-slate-400">x{it.quantity}</span>
                          <span className="text-sm font-semibold">{formatINR(it.price)}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {o.status === 'pending' && (
                    <div className="mt-4 flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
                      {confirmingId === o.id ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Cancel this order?</span>
                          <button
                            type="button"
                            onClick={() => handleCancel(o)}
                            disabled={cancellingId === o.id}
                            className="btn-danger px-3 py-1.5 text-xs"
                          >
                            {cancellingId === o.id ? 'Cancelling...' : 'Yes, cancel'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmingId(null)}
                            disabled={cancellingId === o.id}
                            className="btn-secondary px-3 py-1.5 text-xs"
                          >
                            Keep order
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmingId(o.id)}
                          className="btn-secondary px-3 py-1.5 text-xs text-rose-500 hover:border-rose-300 hover:text-rose-600 dark:hover:border-rose-500/50"
                        >
                          <IconX size={13} /> Cancel order
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserDashboard;
