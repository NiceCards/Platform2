import { Link } from 'react-router-dom';
import { IconSearch } from '../components/icons';

const NotFound = () => (
  <div className="container-x grid place-items-center py-24 text-center">
    <p className="font-display text-8xl font-extrabold text-brand-600/20 dark:text-brand-300/20">404</p>
    <h1 className="mt-2 font-display text-2xl font-bold">Page not found</h1>
    <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <Link to="/" className="btn-primary mt-6">
      <IconSearch size={16} /> Back to Home
    </Link>
  </div>
);

export default NotFound;
