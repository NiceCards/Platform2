import { Link } from 'react-router-dom';

const EmptyState = ({ icon, title, description, actionLabel, actionTo }) => (
  <div className="card mx-auto max-w-md p-10 text-center">
    <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500/10 to-brand-700/10 text-brand-600 dark:text-brand-300">
      {icon}
    </div>
    <h3 className="font-display text-lg font-bold">{title}</h3>
    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
    {actionLabel && actionTo && (
      <Link to={actionTo} className="btn-primary mt-5">
        {actionLabel}
      </Link>
    )}
  </div>
);

export default EmptyState;
