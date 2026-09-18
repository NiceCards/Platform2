import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { isAdminLoggedIn } from '../services/adminApi';
import { useTheme } from '../context/ThemeContext';
import Logo from '../components/Logo';
import {
  IconDashboard, IconPackage, IconTruck, IconUsers, IconSettings,
  IconLogout, IconMenu, IconX, IconMoon, IconSun, IconShield,
} from '../components/icons';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: <IconDashboard size={18} />, end: true },
  { to: '/admin/products', label: 'Products', icon: <IconPackage size={18} /> },
  { to: '/admin/orders', label: 'Orders', icon: <IconPackage size={18} /> },
  { to: '/admin/orders/delivered', label: 'Delivered Orders', icon: <IconTruck size={18} /> },
  { to: '/admin/customers', label: 'Customers', icon: <IconUsers size={18} /> },
  { to: '/admin/settings', label: 'Settings', icon: <IconSettings size={18} /> },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" replace />;
  }

  const logout = () => {
    localStorage.removeItem('nicecards_admin_token');
    toast.success('Logged out of admin');
    navigate('/admin/login', { replace: true });
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
      isActive
        ? 'bg-gradient-to-r from-brand-500 to-brand-700 text-white shadow-glow'
        : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
    }`;

  const sidebar = (
    <div className="flex h-full flex-col p-4">
      <Link to="/" className="mb-8 flex items-center gap-2 px-2">
        <Logo className="h-9 w-9 text-slate-900 dark:text-white" />
        <div>
          <p className="font-display text-base font-extrabold leading-none">Nice Cards</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Admin Panel</p>
        </div>
      </Link>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} onClick={() => setSidebarOpen(false)}>
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 space-y-1 border-t border-slate-200 pt-4 dark:border-slate-800">
        <Link to="/" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white">
          <IconShield size={18} /> View Store
        </Link>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10">
          <IconLogout size={18} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-surface-dark lg:block">
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-surface-dark lg:hidden"
            >
              <button onClick={() => setSidebarOpen(false)} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <IconX size={18} />
              </button>
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-lg dark:border-slate-800 dark:bg-surface-dark/80 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden">
              <IconMenu size={20} />
            </button>
            <h1 className="font-display text-lg font-extrabold">Admin Dashboard</h1>
          </div>
          <button onClick={toggle} className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
            {dark ? <IconSun size={19} /> : <IconMoon size={19} />}
          </button>
        </header>

        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
