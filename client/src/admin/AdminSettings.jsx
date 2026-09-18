import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import adminApi from '../services/adminApi';
import { getErrorMessage } from '../services/api';
import { useCategories } from '../hooks/useProducts';
import { SkeletonRows } from '../components/Skeletons';
import { IconPlus, IconEdit, IconTrash, IconSpinner, IconShield, IconSettings, IconX } from '../components/icons';

const AdminSettings = () => {
  const { categories, loading, refetch } = useCategories();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const addCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Category name is required');
    setAdding(true);
    try {
      await adminApi.post('/category', { name: name.trim(), description: description.trim() });
      toast.success('Category created');
      setName('');
      setDescription('');
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.put(`/category/${editing._id}`, { name: editName.trim(), description: editDesc.trim() });
      toast.success('Category updated');
      setEditing(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (category) => {
    setDeletingId(category._id);
    try {
      await adminApi.delete(`/category/${category._id}`);
      toast.success('Category deleted');
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Security info */}
      {/* <div className="card flex items-start gap-4 p-6">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-600/10 text-brand-600 dark:text-brand-300">
          <IconShield size={22} />
        </span>
        <div>
          <h2 className="font-display text-lg font-extrabold">Admin Security</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            The admin password is stored in the backend environment variable <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">ADMIN_PASSWORD</code> on the server (see <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">server/.env</code>). It can only be changed on the server — never exposed to the frontend. For security, avoid using the default password in production.
          </p>
        </div>
      </div> */}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Add category */}
        <div className="card h-fit p-6">
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
            <IconSettings size={18} className="text-brand-600" /> Add Category
          </h3>
          <form onSubmit={addCategory} className="space-y-4">
            <div>
              <label className="label">Category Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cards" className="input" />
            </div>
            <div>
              <label className="label">Description <span className="font-normal text-slate-400">(optional)</span></label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Short description" className="input" />
            </div>
            <button type="submit" disabled={adding} className="btn-primary w-full">
              {adding ? <IconSpinner size={16} /> : <IconPlus size={16} />} Create Category
            </button>
          </form>
        </div>

        {/* Category list */}
        <div className="card p-6">
          <h3 className="mb-4 font-display text-lg font-bold">Categories</h3>
          {loading ? (
            <SkeletonRows rows={4} />
          ) : (
            <div className="space-y-2.5">
              {categories.map((c) => (
                <div key={c._id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{c.name}</p>
                    <p className="truncate text-xs text-slate-400">{c.productCount} products</p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button onClick={() => { setEditing(c); setEditName(c.name); setEditDesc(c.description || ''); }} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-500/10" aria-label="Edit">
                      <IconEdit size={15} />
                    </button>
                    <button onClick={() => deleteCategory(c)} disabled={deletingId === c._id} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10" aria-label="Delete">
                      {deletingId === c._id ? <IconSpinner size={15} /> : <IconTrash size={15} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.form initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95, opacity: 0 }} onSubmit={saveEdit} className="card w-full max-w-md space-y-4 p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">Edit Category</h3>
                <button type="button" onClick={() => setEditing(null)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <IconX size={16} />
                </button>
              </div>
              <div>
                <label className="label">Name</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} className="input" />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditing(null)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving && <IconSpinner size={16} />} Save
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSettings;
