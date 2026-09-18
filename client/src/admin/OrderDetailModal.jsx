import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { IconX, IconUser, IconMail, IconPhone, IconMapPin, IconPackage, IconDownload, IconSpinner } from '../components/icons';
import { formatINR } from '../utils/currency';
import { imageUrl } from '../utils/media';
import { downloadOrderBillPdf } from '../utils/pdf';

/**
 * Reusable order detail modal used by both pending and delivered order pages.
 * Includes a bill generator that downloads the order as a PDF invoice.
 */
const OrderDetailModal = ({ order, onClose }) => {
  const [generatingBill, setGeneratingBill] = useState(false);

  const handleDownloadBill = async () => {
    setGeneratingBill(true);
    const toastId = toast.loading('Generating bill...');
    try {
      await downloadOrderBillPdf(order);
      toast.success('Bill downloaded', { id: toastId });
    } catch (err) {
      toast.error('Could not generate bill', { id: toastId });
    } finally {
      setGeneratingBill(false);
    }
  };

  return (
  <AnimatePresence>
    {order && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, y: 16 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="card my-8 w-full max-w-lg overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-brand-500 to-brand-700 px-6 py-4 text-white dark:border-slate-800">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Order</p>
              <h3 className="font-mono text-lg font-extrabold">{order.orderId}</h3>
            </div>
            <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg bg-white/15 hover:bg-white/25">
              <IconX size={18} />
            </button>
          </div>

          <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6">
            {/* Customer */}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Customer</p>
              <div className="space-y-1.5 text-sm">
                <p className="flex items-center gap-2 font-semibold"><IconUser size={15} className="text-brand-600 dark:text-brand-300" /> {order.customer.name}</p>
                <p className="flex items-center gap-2 text-slate-500 dark:text-slate-400"><IconMail size={15} /> {order.customer.email}</p>
                <p className="flex items-center gap-2 text-slate-500 dark:text-slate-400"><IconPhone size={15} /> {order.customer.phone}</p>
                <p className="flex items-start gap-2 text-slate-500 dark:text-slate-400"><IconMapPin size={15} className="mt-0.5 shrink-0" /> {order.customer.address}</p>
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Items</p>
              <div className="space-y-2.5">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                    {item.image ? (
                      <img src={imageUrl(item.image)} alt={item.name} className="h-11 w-11 rounded-lg object-contain bg-slate-100 dark:bg-slate-800" />
                    ) : (
                      <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-600/10 text-brand-600"><IconPackage size={18} /></span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{item.name}</p>
                      <p className="text-xs text-slate-400">{formatINR(item.price)} × {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold">{formatINR(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/50">
              <div>
                <p className="text-xs text-slate-400">Order Date</p>
                <p className="font-semibold">{new Date(order.createdAt || order.orderDate).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Status</p>
                <p className="font-semibold capitalize">{order.status}</p>
              </div>
              {order.deliveredAt && (
                <div className="col-span-2">
                  <p className="text-xs text-slate-400">Delivered At</p>
                  <p className="font-semibold">{new Date(order.deliveredAt).toLocaleString()}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-4 dark:border-slate-700">
              <span className="font-bold">Total</span>
              <span className="font-display text-2xl font-extrabold text-brand-600 dark:text-brand-300">{formatINR(order.total)}</span>
            </div>

            <button
              type="button"
              onClick={handleDownloadBill}
              disabled={generatingBill}
              className="btn-primary w-full py-3"
            >
              {generatingBill ? <IconSpinner size={16} /> : <IconDownload size={16} />}
              {generatingBill ? 'Generating Bill...' : 'Generate & Download Bill (PDF)'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
  );
};

export default OrderDetailModal;
