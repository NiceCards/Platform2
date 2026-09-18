import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api, { getErrorMessage } from '../services/api';
import toast from 'react-hot-toast';
import { IconSpinner, IconMail } from '../components/icons';
import Logo from '../components/Logo';

const ForgotPassword = () => {
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
      const res = await api.post('/forgot-password', { email: email.toLowerCase() });
      if (res.data.exists) {
        toast.success('Account found. Set your new password.');
        navigate(`/reset-password?email=${encodeURIComponent(email.toLowerCase())}`);
      } else {
        toast.error('No account found with this email address.');
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
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
          <h1 className="font-display text-2xl font-extrabold">Forgot password?</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Enter the email linked to your account. If it exists, you can set a new password.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <IconMail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com"
                className={`input pl-10 ${error ? 'border-rose-400' : ''}`}
              />
            </div>
            {error && <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? <><IconSpinner size={18} /> Checking...</> : 'Continue'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
          Remembered your password?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:underline dark:text-brand-300">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
