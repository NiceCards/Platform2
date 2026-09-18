import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api, { getErrorMessage } from '../services/api';
import toast from 'react-hot-toast';
import { IconSpinner, IconLock, IconCheck } from '../components/icons';
import Logo from '../components/Logo';

const ResetPassword = () => {
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
      await api.post('/reset-password', { email, newPassword: form.password });
      setDone(true);
      toast.success('Password reset successfully! You can now log in.');
    } catch (err) {
      toast.error(getErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-brand-600/10 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card relative w-full max-w-md p-8"
      >
        <div className="mb-6 text-center">
          <Logo className="mx-auto mb-3 block h-14 w-14 text-slate-900 dark:text-white" />
          <h1 className="font-display text-2xl font-extrabold">Reset password</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose a new password for your account.</p>
        </div>

        {done ? (
          <div className="space-y-4 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <IconCheck size={26} />
            </span>
            <p className="text-sm text-slate-600 dark:text-slate-300">Your password has been updated successfully.</p>
            <button onClick={() => navigate('/login')} className="btn-primary w-full py-3">
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4" noValidate>
            {!email && (
              <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-500 dark:bg-rose-500/10">
                {errors.email || 'No email found in the URL. Go back to Forgot password and try again.'}
              </p>
            )}

            {email && (
              <div className="rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Resetting password for <span className="font-semibold">{email}</span>
              </div>
            )}

            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <IconLock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={form.password}
                  onChange={set('password')}
                  placeholder="At least 6 characters"
                  className={`input pl-10 ${errors.password ? 'border-rose-400' : ''}`}
                />
              </div>
              {errors.password && <p className="mt-1 text-xs font-medium text-rose-500">{errors.password}</p>}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <IconLock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={form.confirm}
                  onChange={set('confirm')}
                  placeholder="Re-enter your new password"
                  className={`input pl-10 ${errors.confirm ? 'border-rose-400' : ''}`}
                />
              </div>
              {errors.confirm && <p className="mt-1 text-xs font-medium text-rose-500">{errors.confirm}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? <><IconSpinner size={18} /> Resetting...</> : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
          <Link to="/login" className="font-bold text-brand-600 hover:underline dark:text-brand-300">
            Back to Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
