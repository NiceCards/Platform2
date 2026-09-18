import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import toast from 'react-hot-toast';
import { IconSpinner, IconMail, IconLock, IconUser, IconPhone } from '../components/icons';
import Logo from '../components/Logo';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (form.name.trim().length < 2) er.name = 'Name must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Enter a valid email';
    if (!/^[+\d][\d\s\-()]{6,20}$/.test(form.phone.trim())) er.phone = 'Enter a valid phone number';
    if (form.password.length < 6) er.password = 'Password must be at least 6 characters';
    if (form.confirm !== form.password) er.confirm = 'Passwords do not match';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signup({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
      });
      navigate('/dashboard');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const field = (label, key, value, placeholder, type, icon) => (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
        <input type={type} value={value} onChange={set(key)} placeholder={placeholder} className={`input pl-10 ${errors[key] ? 'border-rose-400' : ''}`} />
      </div>
      {errors[key] && <p className="mt-1 text-xs font-medium text-rose-500">{errors[key]}</p>}
    </div>
  );

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
          <h1 className="font-display text-2xl font-extrabold">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Join Nice Cards and start ordering</p>
        </div>

        <form onSubmit={submit} className="space-y-4" noValidate>
          {field('Full Name', 'name', form.name, 'John Doe', 'text', <IconUser size={16} />)}
          {field('Email', 'email', form.email, 'you@example.com', 'email', <IconMail size={16} />)}
          {field('Phone', 'phone', form.phone, '+1 555 000 0000', 'tel', <IconPhone size={16} />)}
          {field('Password', 'password', form.password, 'At least 6 characters', 'password', <IconLock size={16} />)}
          {field('Confirm Password', 'confirm', form.confirm, 'Repeat your password', 'password', <IconLock size={16} />)}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? <><IconSpinner size={18} /> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:underline dark:text-brand-300">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
