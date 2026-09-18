import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import adminApi from '../services/adminApi';
import { getErrorMessage } from '../services/api';
import toast from 'react-hot-toast';
import { IconSpinner, IconMail, IconChevronLeft } from '../components/icons';

const AdminForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await adminApi.post('/admin/forgot-password', { email: email.toLowerCase() });
      if (res.data.exists) {
        toast.success('Admin account found. Set your new password.');
        navigate(`/admin/reset-password?email=${encodeURIComponent(email.toLowerCase())}`);
      } else {
        toast.error('No admin account found with this email address.');
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-amber-500/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-sm rounded-3xl bg-white/[0.06] p-8 text-white shadow-card-lg ring-1 ring-white/15 backdrop-blur-xl"
      >
        <div className="mb-7 text-center">
          <span className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-glow">
            <IconMail size={26} />
          </span>
          <h1 className="font-display text-2xl font-extrabold">Forgot password?</h1>
          <p className="mt-1 text-sm text-white/60">
            Enter the admin email.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5" noValidate>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-white/80">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="admin@example.com"
              autoFocus
              className={`w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 ${error ? 'border-rose-400' : ''}`}
            />
            {error && <p className="mt-1 text-xs font-medium text-rose-400">{error}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? <><IconSpinner size={18} /> Checking...</> : 'Continue'}
          </button>
        </form>

        <Link to="/admin/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm text-white/50 hover:text-white/80">
          <IconChevronLeft size={15} /> Back to admin login
        </Link>
      </motion.div>
    </div>
  );
};

export default AdminForgotPassword;
