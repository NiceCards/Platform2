import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import adminApi, { isAdminLoggedIn } from '../services/adminApi';
import { getErrorMessage } from '../services/api';
import { IconLock, IconSpinner, IconShield, IconChevronLeft } from '../components/icons';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAdminLoggedIn()) {
    return <Navigate to="/admin" replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminApi.post('/admin/login', { password });
      localStorage.setItem('nicecards_admin_token', res.data.token);
      toast.success('Welcome back, Admin!');
      navigate('/admin', { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Invalid password'));
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
            <IconShield size={28} />
          </span>
          <h1 className="font-display text-2xl font-extrabold">Admin Portal</h1>
          <p className="mt-1 text-sm text-white/60">Enter your admin password to continue</p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-white/80">Password</label>
            <div className="relative">
              <IconLock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                autoFocus
                className="w-full rounded-xl border border-white/15 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30"
              />
            </div>
          </div>

          <button type="submit" disabled={loading || !password} className="btn-primary w-full py-3 disabled:opacity-50">
            {loading ? <><IconSpinner size={18} /> Verifying...</> : 'Log In as Admin'}
          </button>
        </form>

        <Link to="/admin/forgot-password" className="mt-4 flex items-center justify-center gap-1.5 text-sm text-white/50 hover:text-white/80">
          Forgot password?
        </Link>

        <Link to="/" className="mt-4 flex items-center justify-center gap-1.5 text-sm text-white/50 hover:text-white/80">
          <IconChevronLeft size={15} /> Back to store
        </Link>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
