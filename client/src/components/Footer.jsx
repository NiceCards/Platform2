import { Link } from 'react-router-dom';
import { IconShield } from './icons';
import Logo from './Logo';

const Footer = () => (
  <footer className="mt-auto border-t border-slate-100 bg-white/70 backdrop-blur-lg dark:border-slate-800 dark:bg-surface-dark/70">
    <div className="container-x grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-slate-900 dark:text-white" />
          <span className="font-display text-lg font-extrabold">
            Nice<span className="gradient-text">Cards</span>
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Elegant invitation cards designed for weddings, birthdays, anniversaries, baby showers, and every special occasion.
        </p>
      </div>

      <div>
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Shop</h4>
        <ul className="mt-3 space-y-2 text-sm">
          <li><Link to="/categories" className="text-slate-600 hover:text-brand-600 dark:text-slate-300">Categories</Link></li>
          <li><Link to="/search" className="text-slate-600 hover:text-brand-600 dark:text-slate-300">All Cards</Link></li>
          <li><Link to="/cart" className="text-slate-600 hover:text-brand-600 dark:text-slate-300">Cart</Link></li>
          <li><Link to="/dashboard" className="text-slate-600 hover:text-brand-600 dark:text-slate-300">My Orders</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Account</h4>
        <ul className="mt-3 space-y-2 text-sm">
          <li><Link to="/login" className="text-slate-600 hover:text-brand-600 dark:text-slate-300">Login</Link></li>
          <li><Link to="/signup" className="text-slate-600 hover:text-brand-600 dark:text-slate-300">Create Account</Link></li>
          <li><Link to="/admin/login" className="text-slate-600 hover:text-brand-600 dark:text-slate-300">Admin</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Support</h4>
        <ul className="mt-3 space-y-2 text-sm">
          <li><span className="text-slate-600 dark:text-slate-300">nicecardramgarh@gmail.com</span></li>
          <li><span className="text-slate-600 dark:text-slate-300">+91 9905240717</span></li>
          <li><span className="text-slate-600 dark:text-slate-300">Instant delivery</span></li>
        </ul>
      </div>
    </div>

    <div className="border-t border-slate-100 py-5 dark:border-slate-800">
      <div className="container-x flex flex-col items-center justify-between gap-2 text-xs text-slate-400 sm:flex-row">
        <p>&copy; {new Date().getFullYear()} Nice Cards. All rights reserved.</p>
        <p className="flex items-center gap-1">
          {/* Made by Sanu <IconShield size={13} /> */}
            <a
    href="https://www.linkedin.com/in/kumar-sanu-57a990227/"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-1 hover:text-blue-500 transition-colors"
  >
    Made by Sanu <IconShield size={13} />
  </a>
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
