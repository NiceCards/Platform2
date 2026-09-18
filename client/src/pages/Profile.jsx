import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import toast from 'react-hot-toast';
import {
  IconUser, IconMail, IconPhone, IconMapPin, IconLock, IconSpinner, IconEdit,
} from '../components/icons';

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const setPassword = (key) => (e) => {
    setPasswords((p) => ({ ...p, [key]: e.target.value }));
    setPasswordErrors((er) => ({ ...er, [key]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (form.name.trim().length < 2) er.name = 'Name must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Enter a valid email';
    if (!/^[+\d][\d\s\-()]{6,20}$/.test(form.phone.trim())) er.phone = 'Enter a valid phone number';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!validate() || saving) return;
    setSaving(true);
    try {
      await updateProfile({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const validatePassword = () => {
    const er = {};
    if (!passwords.currentPassword) er.currentPassword = 'Current password is required';
    if (passwords.newPassword.length < 6) er.newPassword = 'New password must be at least 6 characters';
    if (passwords.confirmPassword !== passwords.newPassword) er.confirmPassword = 'Passwords do not match';
    setPasswordErrors(er);
    return Object.keys(er).length === 0;
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (!validatePassword() || savingPassword) return;
    setSavingPassword(true);
    try {
      await updateProfile({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingPassword(false);
    }
  };

  const field = (label, key, value, onChange, placeholder, type = 'text', icon) => (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        {icon && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input ${icon ? 'pl-10' : ''} ${errors[key] ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-400/30' : ''}`}
        />
      </div>
      {errors[key] && <p className="mt-1 text-xs font-medium text-rose-500">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="container-x animate-fade-in py-10">
      {/* Header */}
      <div className="mb-8 rounded-3xl bg-gradient-to-br from-brand-800 to-brand-600 p-8 text-white">
        <div className="flex flex-wrap items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/15 text-2xl font-extrabold backdrop-blur">
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </span>
          <div>
            <h1 className="font-display text-2xl font-extrabold">Edit Profile</h1>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/80">
              <span className="flex items-center gap-1.5"><IconMail size={14} /> {user?.email}</span>
              <span className="flex items-center gap-1.5"><IconPhone size={14} /> {user?.phone}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Personal information */}
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={saveProfile}
          className="card space-y-5 p-6"
        >
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600/10 text-brand-600 dark:text-brand-300">
              <IconEdit size={18} />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold">Personal Information</h2>
              <p className="text-xs text-slate-400">This information is auto-filled at checkout.</p>
            </div>
          </div>

          {field('Full Name', 'name', form.name, set('name'), 'Full name', 'text', <IconUser size={16} />)}
          {field('Email', 'email', form.email, set('email'), 'Email address', 'email', <IconMail size={16} />)}
          {field('Phone', 'phone', form.phone, set('phone'), 'Phone number', 'tel', <IconPhone size={16} />)}

          <div>
            <label className="label">Address</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-3 text-slate-400"><IconMapPin size={16} /></span>
              <textarea
                value={form.address}
                onChange={set('address')}
                placeholder="Street address, city, state, zip code"
                rows={3}
                className="input pl-10"
              />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full py-3">
            {saving ? <><IconSpinner size={18} /> Saving...</> : 'Save Changes'}
          </button>
        </motion.form>

        {/* Password */}
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={savePassword}
          className="card h-fit space-y-5 p-6"
        >
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
              <IconLock size={18} />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold">Change Password</h2>
              <p className="text-xs text-slate-400">Leave blank to keep your current password.</p>
            </div>
          </div>

          <div>
            <label className="label">Current Password</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><IconLock size={16} /></span>
              <input
                type="password"
                value={passwords.currentPassword}
                onChange={setPassword('currentPassword')}
                placeholder="Enter current password"
                className={`input pl-10 ${passwordErrors.currentPassword ? 'border-rose-400' : ''}`}
              />
            </div>
            {passwordErrors.currentPassword && <p className="mt-1 text-xs font-medium text-rose-500">{passwordErrors.currentPassword}</p>}
          </div>

          <div>
            <label className="label">New Password</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><IconLock size={16} /></span>
              <input
                type="password"
                value={passwords.newPassword}
                onChange={setPassword('newPassword')}
                placeholder="At least 6 characters"
                className={`input pl-10 ${passwordErrors.newPassword ? 'border-rose-400' : ''}`}
              />
            </div>
            {passwordErrors.newPassword && <p className="mt-1 text-xs font-medium text-rose-500">{passwordErrors.newPassword}</p>}
          </div>

          <div>
            <label className="label">Confirm New Password</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><IconLock size={16} /></span>
              <input
                type="password"
                value={passwords.confirmPassword}
                onChange={setPassword('confirmPassword')}
                placeholder="Repeat new password"
                className={`input pl-10 ${passwordErrors.confirmPassword ? 'border-rose-400' : ''}`}
              />
            </div>
            {passwordErrors.confirmPassword && <p className="mt-1 text-xs font-medium text-rose-500">{passwordErrors.confirmPassword}</p>}
          </div>

          <button type="submit" disabled={savingPassword} className="btn-secondary w-full py-3">
            {savingPassword ? <><IconSpinner size={18} /> Updating...</> : 'Update Password'}
          </button>
        </motion.form>
      </div>
    </div>
  );
};

export default Profile;
