import { motion } from 'framer-motion';

const SectionHeading = ({ eyebrow, title, subtitle, center = true }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className={`mb-8 ${center ? 'text-center' : ''}`}
  >
    {eyebrow && (
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-300">
        {eyebrow}
      </p>
    )}
    <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
    {subtitle && (
      <p className={`mt-2 text-sm text-slate-500 dark:text-slate-400 ${center ? 'mx-auto max-w-xl' : ''}`}>
        {subtitle}
      </p>
    )}
  </motion.div>
);

export default SectionHeading;
