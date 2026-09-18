import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, BarChart, Bar,
} from 'recharts';
import adminApi from '../services/adminApi';
import { getErrorMessage } from '../services/api';
import toast from 'react-hot-toast';
import { SkeletonRows } from '../components/Skeletons';
import { formatINR } from '../utils/currency';
import { imageUrl } from '../utils/media';
import {
  IconPackage, IconUsers, IconClock, IconTruck, IconDollar, IconAlert, IconSpinner,
} from '../components/icons';

const StatCard = ({ label, value, icon, accent, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="card flex items-center gap-4 p-5"
  >
    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${accent}`}>{icon}</span>
    <div className="min-w-0">
      <p className="truncate font-display text-2xl font-extrabold">{value}</p>
      <p className="truncate text-xs font-medium text-slate-400">{label}</p>
    </div>
  </motion.div>
);

const chartTooltipStyle = {
  borderRadius: '12px',
  border: '1px solid rgba(124, 58, 237, 0.2)',
  background: 'rgba(15, 17, 23, 0.95)',
  color: '#f1f5f9',
  fontSize: '12px',
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [extras, setExtras] = useState(null);
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [s, c] = await Promise.all([
          adminApi.get('/admin/dashboard'),
          adminApi.get('/admin/dashboard/charts'),
        ]);
        if (!cancelled) {
          setStats(s.data.stats);
          setExtras({ latestCustomers: s.data.latestCustomers, recentOrders: s.data.recentOrders });
          setSeries(c.data.series);
        }
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <SkeletonRows rows={6} />;

  if (!stats || !series) {
    return (
      <div className="card p-10 text-center text-slate-500 dark:text-slate-400">
        Failed to load dashboard data. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total Products" value={stats.totalProducts} delay={0} accent="bg-brand-600/10 text-brand-600 dark:text-brand-300" icon={<IconPackage size={22} />} />
        <StatCard label="Total Customers" value={stats.totalCustomers} delay={0.05} accent="bg-sky-500/10 text-sky-600 dark:text-sky-400" icon={<IconUsers size={22} />} />
        <StatCard label="Pending Orders" value={stats.pendingOrders} delay={0.1} accent="bg-amber-500/10 text-amber-600 dark:text-amber-400" icon={<IconClock size={22} />} />
        <StatCard label="Delivered Orders" value={stats.deliveredOrders} delay={0.15} accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" icon={<IconTruck size={22} />} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Revenue" value={formatINR(stats.totalRevenue)} delay={0} accent="bg-amber-500/10 text-brand-600 dark:text-brand-300" icon={<IconDollar size={22} />} />
        <StatCard label="Pending Revenue" value={formatINR(stats.pendingRevenue)} delay={0.05} accent="bg-orange-500/10 text-orange-600 dark:text-orange-400" icon={<IconDollar size={22} />} />
        <StatCard label="Low Stock Items" value={stats.lowStockCount} delay={0.1} accent="bg-rose-500/10 text-rose-600 dark:text-rose-400" icon={<IconAlert size={22} />} />
      </div>

      {/* Charts */}
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 font-display text-lg font-bold">Monthly Orders</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={series} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,140,0.15)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'rgba(124,58,237,0.06)' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar name="Pending" dataKey="pendingOrders" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              <Bar name="Delivered" dataKey="deliveredOrders" fill="#a06d11" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 font-display text-lg font-bold">Sales Graph (Revenue)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,140,0.15)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line name="Pending Sales" type="monotone" dataKey="pendingSales" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line name="Delivered Sales" type="monotone" dataKey="deliveredSales" stroke="#c08a1c" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Low stock */}
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold">
            <IconAlert size={18} className="text-rose-500" /> Low Stock Alerts
          </h3>
          <Link to="/admin/products" className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300">Manage products</Link>
        </div>
        {stats.lowStock.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">No low stock products. All good!</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.lowStock.map((p) => (
              <div key={p._id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                <img src={imageUrl(p.images?.[0]) || '/placeholder.svg'} alt={p.name} className="h-10 w-10 rounded-lg object-contain bg-slate-100 dark:bg-slate-800" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{p.name}</p>
                  <p className={`text-xs font-semibold ${p.stock === 0 ? 'text-rose-500' : 'text-amber-500'}`}>
                    {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-400">{formatINR(p.price)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Newest customers */}
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Newest Customers</h3>
            <Link to="/admin/customers" className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300">View all</Link>
          </div>
          <div className="space-y-3">
            {extras ? (
              extras.latestCustomers.map((c) => (
                <div key={c._id} className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white">
                    {c.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{c.name}</p>
                    <p className="truncate text-xs text-slate-400">{c.email}</p>
                  </div>
                  <span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
              ))
            ) : (
              <IconSpinner size={20} className="mx-auto text-brand-600" />
            )}
          </div>
        </div>

        {/* Recent orders */}
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Recent Orders</h3>
            <Link to="/admin/orders" className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300">View all</Link>
          </div>
          <div className="space-y-3">
            {extras?.recentOrders.map((o) => (
              <div key={o._id} className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-300">{o.orderId}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{o.customer.name}</p>
                  <p className="truncate text-xs text-slate-400">{o.items.length} item{o.items.length === 1 ? '' : 's'}</p>
                </div>
                <span className="text-sm font-bold">{formatINR(o.total)}</span>
                <span className="badge bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">Pending</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
