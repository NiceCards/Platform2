import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import toast from 'react-hot-toast';
import { IconSpinner, IconMail, IconLock } from '../components/icons';
import Logo from '../components/Logo';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Enter a valid email';
    if (form.password.length < 6) er.password = 'Password must be at least 6 characters';
    setErrors(er);
    if (Object.keys(er).length) return;

    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
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
          <h1 className="font-display text-2xl font-extrabold">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Log in to manage your orders</p>
        </div>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <IconMail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" className={`input pl-10 ${errors.email ? 'border-rose-400' : ''}`} />
            </div>
            {errors.email && <p className="mt-1 text-xs font-medium text-rose-500">{errors.email}</p>}
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <IconLock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" className={`input pl-10 ${errors.password ? 'border-rose-400' : ''}`} />
            </div>
            {errors.password && <p className="mt-1 text-xs font-medium text-rose-500">{errors.password}</p>}
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-300">
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? <><IconSpinner size={18} /> Logging in...</> : 'Log In'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="font-bold text-brand-600 hover:underline dark:text-brand-300">
            Sign up
          </Link>
        </p>
        
      </motion.div>
    </div>
  );
};

export default Login;
