import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCategories } from '../hooks/useProducts';
import { SkeletonGrid } from '../components/Skeletons';
import SectionHeading from '../components/SectionHeading';
import { IconGift, IconArrowRight, IconCard } from '../components/icons';

const Categories = () => {
  const { categories, loading } = useCategories();

  return (
    <div className="container-x animate-fade-in py-12">
      <SectionHeading
        eyebrow="Explore"
        title="All Categories"
        subtitle="Discover cards for every categories and every occasion."
      />

      {loading ? (
        <SkeletonGrid count={8} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c, i) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 6) * 0.06 }}
            >
              <Link to={`/category/${c.slug}`} className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-brand-200/80 bg-gradient-to-b from-white via-brand-50/50 to-brand-100/60 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-400 hover:shadow-card-lg dark:border-slate-700 dark:from-surface-card dark:via-surface-card dark:to-surface-card">
                <span className="pointer-events-none absolute left-2 top-2 z-10 h-4 w-4 rounded-tl-md border-l border-t border-brand-300/80" />
                <span className="pointer-events-none absolute right-2 top-2 z-10 h-4 w-4 rounded-tr-md border-r border-t border-brand-300/80" />
                <span className="pointer-events-none absolute bottom-2 left-2 z-10 h-4 w-4 rounded-bl-md border-b border-l border-brand-300/80" />
                <span className="pointer-events-none absolute bottom-2 right-2 z-10 h-4 w-4 rounded-br-md border-b border-r border-brand-300/80" />
                <div className="relative grid aspect-[16/10] place-items-center">
                  <span className="absolute right-3 top-3 rounded-full border border-brand-200/80 bg-white/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-600 backdrop-blur dark:border-slate-700 dark:bg-black/40 dark:text-brand-300">
                    {c.productCount} Cards
                  </span>
                  <span className="grid h-16 w-16 place-items-center rounded-full border border-brand-200 bg-white text-brand-600 shadow-sm transition-colors duration-300 group-hover:border-brand-400 group-hover:bg-brand-50 group-hover:text-brand-700 dark:border-slate-700 dark:bg-surface-card dark:text-brand-300">
                    <IconCard size={28} className="transition-transform duration-500 group-hover:scale-105" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col items-center px-4 pb-4 pt-1 text-center">
                  <span className="mx-auto mb-2 h-px w-12 bg-brand-300/70" />
                  <h3 className="font-serif text-xl font-semibold leading-tight text-slate-800 transition-colors group-hover:text-brand-700 dark:text-slate-100 dark:group-hover:text-brand-300">{c.name}</h3>
                  <p className="mt-1.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                    {c.description || 'Explore our hand-picked collection for this category.'}
                  </p>
                  <span className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-300">
                    Browse category <IconArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-14 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 p-8 text-center text-white">
        <IconGift size={36} className="mx-auto mb-3" />
        <h3 className="font-display text-2xl font-bold">Can't find what you're looking for?</h3>
        <p className="mx-auto mt-2 max-w-md text-white/85">We're adding new cards every week. Keep an eye out!</p>
      </div>
    </div>
  );
};

export default Categories;
