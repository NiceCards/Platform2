import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api, { getErrorMessage } from '../services/api';
import { formatINR } from '../utils/currency';
import { imageUrl } from '../utils/media';
import { IconCart, IconSpinner, IconShield, IconUser, IconMail, IconPhone, IconMapPin } from '../components/icons';

const Checkout = () => {
  const { items, total, count, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Keep the delivery form in sync with the signed-in user's saved details.
  // Only fills fields the user hasn't typed into yet.
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      name: f.name || user.name || '',
      email: f.email || user.email || '',
      phone: f.phone || user.phone || '',
      address: f.address || user.address || '',
    }));
  }, [user]);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = 'Name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Valid email is required';
    if (!form.phone.trim()) er.phone = 'Phone number is required';
    if (form.address.trim().length < 10) er.address = 'Please enter a full address (min 10 characters)';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  if (items.length === 0) {
    return (
      <div className="container-x py-16">
        <div className="card mx-auto max-w-md p-10 text-center">
          <IconCart size={36} className="mx-auto mb-3 text-brand-600" />
          <h2 className="font-display text-xl font-bold">Your cart is empty</h2>
          <p className="mt-2 text-sm text-slate-500">Add some gift cards before checking out.</p>
          <Link to="/search" className="btn-primary mt-5">Browse cards</Link>
        </div>
      </div>
    );
  }

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (submitting) return; // prevent duplicate submissions

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        items: items.map((i) => ({ product: i.product, quantity: i.quantity })),
      };

      const res = await api.post('/order', payload);
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-success/${res.data.order.orderId}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setSubmitting(false);
    }
  };

  const field = (label, value, onChange, placeholder, type = 'text', icon) => (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        {icon && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input ${icon ? 'pl-10' : ''} ${errors[label.toLowerCase()] ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-400/30' : ''}`}
        />
      </div>
      {errors[label.toLowerCase()] && <p className="mt-1 text-xs font-medium text-rose-500">{errors[label.toLowerCase()]}</p>}
    </div>
  );

  return (
    <div className="container-x animate-fade-in py-10">
      <h1 className="mb-8 font-display text-3xl font-extrabold">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Form */}
        <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} onSubmit={placeOrder} className="card space-y-5 p-6">
          <div>
            <h2 className="font-display text-lg font-bold">Delivery Details</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              We've pre-filled your saved details. Your e-gift cards will be delivered to this email address.
              {' '}
              <Link to="/profile" className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
                Edit profile
              </Link>
            </p>
          </div>

          {field('Name', form.name, set('name'), 'Full name', 'text', <IconUser size={16} />)}
          {field('Email', form.email, set('email'), 'Email address', 'email', <IconMail size={16} />)}
          {field('Phone', form.phone, set('phone'), 'Phone number', 'tel', <IconPhone size={16} />)}

          <div>
            <label className="label">Address</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-3 text-slate-400"><IconMapPin size={16} /></span>
              <textarea
                value={form.address}
                onChange={set('address')}
                placeholder="Street address, city, state, zip code"
                rows={3}
                className={`input pl-10 ${errors.address ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-400/30' : ''}`}
              />
            </div>
            {errors.address && <p className="mt-1 text-xs font-medium text-rose-500">{errors.address}</p>}
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5 text-base">
            {submitting ? (
              <><IconSpinner size={18} /> Placing order...</>
            ) : (
              <>Place Order</>
            )}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <IconShield size={14} /> This is a demo store — no payment is collected.
          </p>
        </motion.form>

        {/* Summary */}
        <div className="card h-fit p-6 lg:sticky lg:top-24">
          <h3 className="font-display text-lg font-bold">Order Summary</h3>
          <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
            {items.map((i) => (
              <div key={i.product} className="flex items-center gap-3">
                <img src={imageUrl(i.image) || '/placeholder.svg'} alt={i.name} className="h-12 w-12 rounded-lg object-contain bg-slate-100 dark:bg-slate-800" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{i.name}</p>
                  <p className="text-xs text-slate-400">Qty {i.quantity}</p>
                </div>
                <span className="text-sm font-bold">{formatINR(i.price * i.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-dashed border-slate-200 pt-4 text-sm dark:border-slate-700">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Items</span><span>{count}</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Delivery</span><span className="text-emerald-500">Instant</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="font-bold">Total</span>
              <span className="font-display text-2xl font-extrabold text-brand-600 dark:text-brand-300">{formatINR(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
