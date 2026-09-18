import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconCheck, IconGift, IconPackage, IconCalendar } from '../components/icons';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [date] = useState(() => new Date().toLocaleString());

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="container-x py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="card mx-auto max-w-lg overflow-hidden p-10 text-center"
      >
        <div className="relative mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-card-lg">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
          >
            <IconCheck size={40} className="text-white" />
          </motion.div>
          <motion.div
            className="absolute inset-0 rounded-full bg-emerald-400/40"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        </div>

        <h1 className="font-display text-2xl font-extrabold">Order Placed Successfully!</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Thank you for your purchase. Your cards are being prepared and will be delivered to you shortly.
        </p>

        <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-left dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
              <IconPackage size={15} /> Order ID
            </span>
            <span className="font-mono text-sm font-bold text-brand-600 dark:text-brand-300">{orderId}</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
              <IconCalendar size={15} /> Date
            </span>
            <span className="text-sm font-semibold">{date}</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
              <IconGift size={15} /> Status
            </span>
            <span className="badge bg-amber-100 px-3 py-1 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">Pending</span>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link to="/search" className="btn-primary">
            Continue Shopping
          </Link>
          <Link to="/dashboard" className="btn-secondary">
            Track My Orders
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
