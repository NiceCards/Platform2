import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';
import {
  IconCart, IconSearch, IconMoon, IconSun, IconMenu, IconX, IconUser,
  IconShield, IconGift, IconLogout, IconGrid, IconCard, IconEdit,
} from './icons';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
    setMobileOpen(false);
  };

  const navLink = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
      isActive
        ? 'text-brand-600 dark:text-brand-300'
        : 'text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-300'
    }`;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-lg' : 'bg-white/60 dark:bg-surface-dark/60 backdrop-blur-lg'
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2" onClick={() => setMobileOpen(false)}>
          <Logo className="h-9 w-9 text-slate-900 dark:text-white" />
          <span className="font-display text-xl font-extrabold tracking-tight">
            Nice<span className="gradient-text">Cards</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          <NavLink to="/" end className={navLink}>
            Home
          </NavLink>
          <NavLink to="/categories" className={navLink}>
            Categories
          </NavLink>
          <NavLink to="/search" className={navLink}>
            All Cards
          </NavLink>
        </nav>

        {/* Search (desktop) */}
        <form onSubmit={submitSearch} className="relative hidden flex-1 max-w-xs md:block">
          <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cards..."
            className="input pl-9 py-2"
          />
        </form>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {dark ? <IconSun size={19} /> : <IconMoon size={19} />}
          </button>

          <Link
            to="/cart"
            aria-label="Cart"
            className="relative grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <IconCart size={20} />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-gradient-to-r from-brand-500 to-brand-700 px-1 text-[11px] font-bold text-white"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <a
            href="https://nicecards.shop/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-600/5 px-3 py-2 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-600 hover:text-white md:flex dark:border-brand-500/30 dark:text-brand-300 dark:hover:bg-brand-600 dark:hover:text-white"
          >
            <IconCard size={16} /> Design Card
          </a>

          {user ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserOpen((o) => !o)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 py-1.5 pl-1.5 pr-3 transition-colors hover:border-brand-400 dark:border-slate-700"
              >
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-24 truncate text-sm font-semibold">{user.name.split(' ')[0]}</span>
              </button>
              <AnimatePresence>
                {userOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-2xl bg-white p-1.5 shadow-card-lg ring-1 ring-slate-100 dark:bg-surface-card dark:ring-slate-700"
                    >
                      <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
                        <p className="text-sm font-bold">{user.name}</p>
                        <p className="truncate text-xs text-slate-400">{user.email}</p>
                      </div>
                      <Link to="/dashboard" onClick={() => setUserOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
                        <IconUser size={16} /> My Dashboard
                      </Link>
                      <Link to="/profile" onClick={() => setUserOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
                        <IconEdit size={16} /> Edit Profile
                      </Link>
                      <button onClick={() => { logout(); setUserOpen(false); navigate('/'); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10">
                        <IconLogout size={16} /> Logout
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden items-center gap-1.5 md:flex">
              <Link to="/login" className="btn-ghost">
                Login
              </Link>
              <Link to="/signup" className="btn-primary">
                Sign up
              </Link>
            </div>
          )}

          {/* Admin icon */}
          <Link
            to="/admin/login"
            aria-label="Admin"
            title="Admin"
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:text-slate-300"
          >
            <IconShield size={18} />
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
            className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
          >
            {mobileOpen ? <IconX size={20} /> : <IconMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-100 bg-white dark:border-slate-800 dark:bg-surface-dark lg:hidden"
          >
            <div className="container-x flex flex-col gap-2 py-4">
              <form onSubmit={submitSearch} className="relative">
                <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search gift cards..."
                  className="input pl-9"
                />
              </form>
              <NavLink to="/" end onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">
                <IconGrid size={17} /> Home
              </NavLink>
              <NavLink to="/categories" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">
                <IconGift size={17} /> Categories
              </NavLink>
              <NavLink to="/search" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">
                <IconSearch size={17} /> All Cards
              </NavLink>
              {user ? (
                <>
                  <NavLink to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">
                    <IconUser size={17} /> My Dashboard
                  </NavLink>
                  <NavLink to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">
                    <IconEdit size={17} /> Edit Profile
                  </NavLink>
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10">
                    <IconLogout size={17} /> Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <a
                    href="https://nicecards.shop/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileOpen(false)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-600/5 px-3 py-2.5 font-semibold text-brand-600 hover:bg-brand-600 hover:text-white dark:border-brand-500/30 dark:text-brand-300 dark:hover:bg-brand-600 dark:hover:text-white"
                  >
                    <IconCard size={17} /> Card Design
                  </a>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1">
                    Login
                  </Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn-primary flex-1">
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
