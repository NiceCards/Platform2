import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import adminApi from '../services/adminApi';
import { getErrorMessage } from '../services/api';
import toast from 'react-hot-toast';
import { IconSpinner, IconLock, IconCheck, IconChevronLeft } from '../components/icons';

const AdminResetPassword = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = params.get('email') || '';

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (!email) er.email = 'Email is missing. Start again from Forgot password.';
    if (form.password.length < 6) er.password = 'Password must be at least 6 characters';
    if (form.confirm !== form.password) er.confirm = 'Passwords do not match';
    setErrors(er);
    if (Object.keys(er).length) return;

    setLoading(true);
    try {
      await adminApi.post('/admin/reset-password', { email, newPassword: form.password });
      setDone(true);
      toast.success('Password reset successfully! You can now log in.');
    } catch (err) {
      toast.error(getErrorMessage(err));
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
            <IconLock size={26} />
          </span>
          <h1 className="font-display text-2xl font-extrabold">Reset password</h1>
          <p className="mt-1 text-sm text-white/60">Choose a new password for the admin account.</p>
        </div>

        {done ? (
          <div className="space-y-4 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-400">
              <IconCheck size={26} />
            </span>
            <p className="text-sm text-white/70">Your password has been updated successfully.</p>
            <button onClick={() => navigate('/admin/login')} className="btn-primary w-full py-3">
              Go to Admin Login
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5" noValidate>
            {!email && (
              <p className="rounded-xl bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-400">
                {errors.email || 'No email found in the URL. Go back to Forgot password and try again.'}
              </p>
            )}

            {email && (
              <div className="rounded-xl bg-white/10 px-3 py-2 text-xs text-white/70">
                Resetting password for <span className="font-semibold">{email}</span>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-white/80">New Password</label>
              <div className="relative">
                <IconLock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="password"
                  value={form.password}
                  onChange={set('password')}
                  placeholder="At least 6 characters"
                  className={`w-full rounded-xl border border-white/15 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 ${errors.password ? 'border-rose-400' : ''}`}
                />
              </div>
              {errors.password && <p className="mt-1 text-xs font-medium text-rose-400">{errors.password}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-white/80">Confirm Password</label>
              <div className="relative">
                <IconLock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="password"
                  value={form.confirm}
                  onChange={set('confirm')}
                  placeholder="Re-enter your new password"
                  className={`w-full rounded-xl border border-white/15 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 ${errors.confirm ? 'border-rose-400' : ''}`}
                />
              </div>
              {errors.confirm && <p className="mt-1 text-xs font-medium text-rose-400">{errors.confirm}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? <><IconSpinner size={18} /> Resetting...</> : 'Reset Password'}
            </button>
          </form>
        )}

        <Link to="/admin/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm text-white/50 hover:text-white/80">
          <IconChevronLeft size={15} /> Back to admin login
        </Link>
      </motion.div>
    </div>
  );
};

export default AdminResetPassword;
