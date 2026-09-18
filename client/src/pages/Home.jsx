import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProducts, useCategories } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import SectionHeading from '../components/SectionHeading';
import { SkeletonGrid } from '../components/Skeletons';
import { IconGift, IconArrowRight, IconTruck, IconShield, IconClock, IconSpinner, IconCard } from '../components/icons';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(
    () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false)
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    setMatches(mq.matches);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
};

const Hero = () => {
  const [q, setQ] = useState('');
  return (
    <section className="relative overflow-hidden text-brand-950 dark:text-white">
      <picture className="contents">
        <source media="(max-width: 767px)" srcSet="/bg2.jpg" />
        <img
          src="/bg1.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
        />
      </picture>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-50/95 via-brand-50/80 to-brand-100/30 dark:from-brand-950/92 dark:via-brand-900/75 dark:to-brand-700/40" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-amber-400/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-orange-400/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.45),transparent_45%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_45%)]" />
      </div>

      <div className="container-x relative grid items-center gap-10 py-20 lg:py-28">
        <motion.div initial="hidden" animate="show" className="max-w-2xl">
          <motion.p variants={fadeUp} custom={0} className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200/60 bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 px-4 py-1.5 shadow-[0_8px_24px_-8px_rgba(214,166,60,0.9)]">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-950 text-amber-300"><IconGift size={12} /></span>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-950">Premium Printed Invitation Cards</span>
          </motion.p>
          <motion.h1 variants={fadeUp} custom={1} className="font-display text-4xl font-extrabold leading-tight tracking-tight text-brand-950 sm:text-5xl lg:text-6xl dark:text-white">
            Beautiful Cards,
            <span className="block bg-gradient-to-r from-brand-700 to-orange-500 bg-clip-text text-transparent dark:from-amber-300 dark:to-orange-300">Printed to
Perfection.</span>
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="mt-5 max-w-lg text-lg text-brand-900/80 dark:text-white/85">
           From elegant wedding invitations to fun birthday and party cards, explore beautifully crafted designs.
          </motion.p>

          <motion.form
            variants={fadeUp}
            custom={3}
            onSubmit={(e) => { e.preventDefault(); window.location.href = `/search?q=${encodeURIComponent(q)}`; }}
            className="mt-8 flex max-w-md gap-2 rounded-2xl bg-white p-1.5 shadow-card-lg ring-1 ring-brand-200/70 dark:ring-0"
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search cards here"
              className="flex-1 bg-transparent px-3 text-sm text-slate-800 outline-none"
            />
            <button type="submit" className="btn-primary">
              Search
            </button>
          </motion.form>

          <motion.div variants={fadeUp} custom={4} className="mt-8 flex flex-wrap gap-6 text-sm">
            {[
              { icon: <IconTruck size={18} />, label: 'Instant Delivery' },
              { icon: <IconShield size={18} />, label: 'Secure Checkout' },
              { icon: <IconClock size={18} />, label: 'No Expiry' },
            ].map((f) => (
              <span key={f.label} className="flex items-center gap-2 text-brand-900 dark:text-white/90">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/70 text-brand-700 ring-1 ring-brand-200 dark:bg-white/15 dark:text-white dark:ring-0">{f.icon}</span>
                {f.label}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Stats bar */}
      <div className="relative border-t border-brand-200/70 bg-white/50 backdrop-blur dark:border-white/10 dark:bg-black/10">
        <div className="container-x grid grid-cols-3 divide-x divide-brand-200/70 py-5 text-center dark:divide-white/10">
          {[
            { n: '10+', l: 'Category' },
            { n: '25k+', l: 'Cards Delivered' },
            { n: '4.9/5', l: 'Average Rating' },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-display text-2xl font-extrabold text-brand-950 dark:text-white">{s.n}</p>
              <p className="text-xs text-brand-800/70 dark:text-white/70">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CategoryStrip = () => {
  const { categories, loading } = useCategories();
  const active = categories.filter((c) => c.isActive && c.productCount > 0).slice(0, 8);

  if (loading) {
    return <div className="flex justify-center py-6"><IconSpinner size={24} className="text-brand-600" /></div>;
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      {active.map((c, i) => (
        <motion.div key={c._id} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
          <Link
            to={`/category/${c.slug}`}
            className="group relative flex h-full flex-col items-center overflow-hidden rounded-xl border border-brand-200/80 bg-gradient-to-b from-white via-brand-50/50 to-brand-100/60 p-2.5 text-center shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-400 hover:shadow-card-lg dark:border-slate-700 dark:from-surface-card dark:via-surface-card dark:to-surface-card"
          >
            <span className="pointer-events-none absolute left-1.5 top-1.5 h-3.5 w-3.5 rounded-tl-md border-l border-t border-brand-300/80" />
            <span className="pointer-events-none absolute right-1.5 top-1.5 h-3.5 w-3.5 rounded-tr-md border-r border-t border-brand-300/80" />
            <span className="pointer-events-none absolute bottom-1.5 left-1.5 h-3.5 w-3.5 rounded-bl-md border-b border-l border-brand-300/80" />
            <span className="pointer-events-none absolute bottom-1.5 right-1.5 h-3.5 w-3.5 rounded-br-md border-b border-r border-brand-300/80" />
            <span className="grid w-full flex-1 place-items-center py-3">
              <span className="grid h-12 w-12 place-items-center rounded-full border border-brand-200 bg-white text-brand-600 shadow-sm transition-colors duration-300 group-hover:border-brand-400 group-hover:bg-brand-50 group-hover:text-brand-700 dark:border-slate-700 dark:bg-surface-card dark:text-brand-300">
                <IconCard size={24} className="transition-transform duration-500 group-hover:scale-110" />
              </span>
            </span>
            <span className="flex flex-col items-center">
              <span className="font-serif text-base font-semibold leading-tight text-slate-800 transition-colors group-hover:text-brand-700 dark:text-slate-100 dark:group-hover:text-brand-300">{c.name}</span>
              <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-500/80 dark:text-brand-300/80">{c.productCount} Cards</span>
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

const Home = () => {
  const featured = useProducts({ sort: 'popular', limit: 8 });
  const newArrivals = useProducts({ sort: 'newest', limit: 4 });
  const isMobile = useMediaQuery('(max-width: 639px)');

  // On mobile show fewer cards so customers don't have to scroll too much,
  // while still laying them out two per row instead of a single column.
  const featuredList = isMobile ? featured.products.slice(0, 4) : featured.products;
  const newArrivalsList = isMobile ? newArrivals.products.slice(0, 2) : newArrivals.products;

  return (
    <div className="animate-fade-in">
      <Hero />

      {/* Categories */}
      <section className="container-x py-14">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading eyebrow="Browse" title="Shop by Category" center={false} subtitle="From weddings to birthdays — find the perfect invitation for every celebration." />
          <Link to="/categories" className="btn-secondary mb-8 hidden shrink-0 sm:inline-flex">
            View all <IconArrowRight size={16} />
          </Link>
        </div>
        <CategoryStrip />
      </section>

      {/* Featured */}
      <section className="container-x pb-14">
        <div className="mb-6 flex items-end justify-between">
          <SectionHeading eyebrow="Best Sellers" title="Featured Cards" center={false} />
          <Link to="/search" className="btn-secondary hidden sm:inline-flex">
            View all <IconArrowRight size={16} />
          </Link>
        </div>
        {featured.loading ? (
          <SkeletonGrid count={8} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {featuredList.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {/* New arrivals */}
      <section className="bg-gradient-to-b from-transparent to-brand-50/60 py-14 dark:to-brand-900/10">
        <div className="container-x">
          <div className="mb-6 flex items-end justify-between">
            <SectionHeading eyebrow="Fresh" title="New Arrivals" center={false} />
          </div>
          {newArrivals.loading ? (
            <SkeletonGrid count={4} />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {newArrivalsList.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="container-x py-14">
        <SectionHeading eyebrow="Simple" title="How It Works" subtitle="Three easy steps from card idea to delivered." />
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { step: '01', title: 'Choose a card', desc: 'Browse hundreds of cards  and pick the perfect one.', emoji: '🛒' },
            { step: '02', title: 'Checkout instantly', desc: 'Fill in delivery details and place your order — no payment needed to try the demo.', emoji: '⚡' },
            { step: '03', title: 'Delivered to your door', desc: 'Your card lands to your door.', emoji: '💌' },
          ].map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card relative p-6 text-center"
            >
              <span className="absolute left-5 top-5 font-display text-4xl font-extrabold text-brand-600/10 dark:text-brand-300/10">{s.step}</span>
              <span className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500/10 to-brand-700/10 text-3xl">{s.emoji}</span>
              <h3 className="font-display text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-x pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 via-brand-600 to-brand-500 px-8 py-14 text-center text-white">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-orange-400/20 blur-2xl" />
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Never run out of ideas again</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            Join thousands of happy customers and discover the easiest way to send cards.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/search" className="btn bg-white text-brand-700 hover:bg-brand-50">
              Explore  Cards
            </Link>
            <Link to="/signup" className="btn bg-black/20 text-white ring-1 ring-white/40 hover:bg-black/30">
              Create an Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
