import { useLocation, useNavigate } from 'react-router-dom';
import { IconChevronLeft, IconChevronRight } from './icons';

/**
 * Pagination controls. `pages` and `page` come from the API response;
 * `onChange` updates the parent's query state.
 */
const Pagination = ({ page, pages, onChange }) => {
  if (pages <= 1) return null;
  const navigate = useNavigate();
  const location = useLocation();

  const go = (p) => {
    if (onChange) {
      onChange(p);
      return;
    }
    const params = new URLSearchParams(location.search);
    if (p > 1) params.set('page', p);
    else params.delete('page');
    navigate({ search: params.toString() });
  };

  const pageNumbers = [];
  for (let i = 1; i <= pages; i += 1) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) pageNumbers.push(i);
    else if (pageNumbers[pageNumbers.length - 1] !== '...') pageNumbers.push('...');
  }

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5">
      <button
        disabled={page <= 1}
        onClick={() => go(page - 1)}
        className="btn-secondary px-3 py-2"
        aria-label="Previous page"
      >
        <IconChevronLeft size={16} />
      </button>
      {pageNumbers.map((n, i) =>
        n === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-slate-400">
            ...
          </span>
        ) : (
          <button
            key={n}
            onClick={() => go(n)}
            className={`h-9 min-w-9 rounded-xl px-2 text-sm font-semibold transition-colors ${
              n === page
                ? 'bg-gradient-to-r from-brand-500 to-brand-700 text-white'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {n}
          </button>
        )
      )}
      <button
        disabled={page >= pages}
        onClick={() => go(page + 1)}
        className="btn-secondary px-3 py-2"
        aria-label="Next page"
      >
        <IconChevronRight size={16} />
      </button>
    </nav>
  );
};

export default Pagination;
