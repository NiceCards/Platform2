import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import adminApi from '../services/adminApi';
import { getErrorMessage } from '../services/api';
import { useCategories } from '../hooks/useProducts';
import { IconSpinner, IconUpload, IconImage, IconChevronLeft, IconX } from '../components/icons';

const MAX_IMAGES = 2;

const emptyForm = {
  name: '',
  category: '',
  brand: 'Nice Cards',
  price: '',
  originalPrice: '',
  stock: '',
  sku: '',
  description: '',
  isActive: true,
};

const AdminProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { categories } = useCategories();

  const [form, setForm] = useState(emptyForm);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    adminApi
      .get(`/product/${id}`)
      .then((res) => {
        if (cancelled) return;
        const p = res.data.product;
        setForm({
          name: p.name,
          category: p.category?._id || '',
          brand: p.brand || '',
          price: p.price,
          originalPrice: p.originalPrice || '',
          stock: p.stock,
          sku: p.sku || '',
          description: p.description || '',
          isActive: p.isActive,
        });
        setExistingImages((p.images || []).slice(0, MAX_IMAGES));
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const imageCount = existingImages.length + newImages.length;

  const onFileChange = (e) => {
    const selected = Array.from(e.target.files || []).slice(0, MAX_IMAGES - imageCount);
    if (!selected.length) return;
    setNewImages((prev) => [...prev, ...selected.map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
  };

  const removeImage = (index) => {
    if (index < existingImages.length) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      const newIndex = index - existingImages.length;
      setNewImages((prev) => {
        const next = prev.filter((_, i) => i !== newIndex);
        next.forEach((img) => URL.revokeObjectURL(img.preview));
        return next;
      });
    }
  };

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = 'Product name is required';
    if (!form.category) er.category = 'Select a category';
    if (form.price === '' || Number(form.price) < 0) er.price = 'Enter a valid price';
    if (form.stock === '' || Number(form.stock) < 0) er.stock = 'Enter a valid stock value';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    const data = new FormData();
    data.append('name', form.name.trim());
    data.append('category', form.category);
    data.append('brand', form.brand || 'Nice Cards');
    data.append('price', form.price);
    data.append('originalPrice', form.originalPrice || 0);
    data.append('stock', form.stock);
    if (form.sku) data.append('sku', form.sku.trim());
    data.append('description', form.description);
    data.append('isActive', String(form.isActive));

    // Keep existing server images and append newly selected files.
    data.append('existingImages', JSON.stringify(existingImages));
    newImages.forEach((img) => data.append('images', img.file));

    try {
      if (isEdit) {
        await adminApi.put(`/product/${id}`, data);
        toast.success('Product updated successfully');
      } else {
        await adminApi.post('/product', data);
        toast.success('Product created successfully');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(getErrorMessage(err));
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-20">
        <IconSpinner size={28} className="text-brand-600" />
      </div>
    );
  }

  const field = (label, key, type = 'text', placeholder = '', props = {}) => (
    <div>
      <label className="label">{label}</label>
      <input type={type} value={form[key]} onChange={set(key)} placeholder={placeholder} className={`input ${errors[key] ? 'border-rose-400' : ''}`} {...props} />
      {errors[key] && <p className="mt-1 text-xs font-medium text-rose-500">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/admin/products" className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
          <IconChevronLeft size={18} />
        </Link>
        <div>
          <h2 className="font-display text-xl font-extrabold">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
          <p className="text-sm text-slate-400">{isEdit ? form.name : 'Create a new gift card product'}</p>
        </div>
      </div>

      <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} onSubmit={submit} className="card space-y-5 p-6">
        {/* Image upload */}
        <div>
          <div className="flex items-center justify-between">
            <label className="label">Product Images</label>
            <span className="text-xs font-semibold text-slate-400">{imageCount}/{MAX_IMAGES} uploaded</span>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {existingImages.map((src, i) => (
              <div key={`e-${i}`} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                <img src={src} alt={`Existing ${i + 1}`} className="h-full w-full object-contain p-1" />
                <button type="button" onClick={() => removeImage(i)} className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <IconX size={13} />
                </button>
              </div>
            ))}
            {newImages.map((img, i) => (
              <div key={`n-${i}`} className="group relative aspect-square overflow-hidden rounded-xl border border-brand-300 bg-slate-50 dark:border-brand-600 dark:bg-slate-800/50">
                <img src={img.preview} alt={`New ${i + 1}`} className="h-full w-full object-contain p-1" />
                <button type="button" onClick={() => removeImage(existingImages.length + i)} className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <IconX size={13} />
                </button>
              </div>
            ))}
            {imageCount < MAX_IMAGES && (
              <label className="grid aspect-square cursor-pointer place-items-center rounded-xl border-2 border-dashed border-slate-200 text-slate-400 transition-colors hover:border-brand-400 hover:text-brand-500 dark:border-slate-700">
                <div className="text-center">
                  <IconUpload size={22} className="mx-auto mb-1" />
                  <span className="text-xs font-semibold">Upload</span>
                </div>
                <input type="file" accept="image/*" multiple className="hidden" onChange={onFileChange} />
              </label>
            )}
          </div>
          <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
            <IconImage size={13} /> JPG, PNG, WebP or SVG. Max 2MB each. Up to {MAX_IMAGES} images per product.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Product Name</label>
            <input value={form.name} onChange={set('name')} placeholder="e.g. Amazon Gift Card" className={`input ${errors.name ? 'border-rose-400' : ''}`} />
            {errors.name && <p className="mt-1 text-xs font-medium text-rose-500">{errors.name}</p>}
          </div>

          <div>
            <label className="label">Category</label>
            <select value={form.category} onChange={set('category')} className={`input ${errors.category ? 'border-rose-400' : ''}`}>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            {errors.category && <p className="mt-1 text-xs font-medium text-rose-500">{errors.category}</p>}
          </div>

          <div>
            <label className="label">Brand</label>
            <input value={form.brand} onChange={set('brand')} placeholder="Brand name" className="input" />
          </div>

          <div>
            <label className="label">Price (₹ INR)</label>
            <input type="number" min="0" step="0.01" value={form.price} onChange={set('price')} placeholder="2075.50" className={`input ${errors.price ? 'border-rose-400' : ''}`} />
            {errors.price && <p className="mt-1 text-xs font-medium text-rose-500">{errors.price}</p>}
          </div>

          <div>
            <label className="label">Original Price (₹ INR) <span className="font-normal text-slate-400">(optional)</span></label>
            <input type="number" min="0" step="0.01" value={form.originalPrice} onChange={set('originalPrice')} placeholder="0" className="input" />
          </div>

          <div>
            <label className="label">Stock</label>
            <input type="number" min="0" value={form.stock} onChange={set('stock')} placeholder="50" className={`input ${errors.stock ? 'border-rose-400' : ''}`} />
            {errors.stock && <p className="mt-1 text-xs font-medium text-rose-500">{errors.stock}</p>}
          </div>

          <div>
            <label className="label">SKU <span className="font-normal text-slate-400">(auto-generated if empty)</span></label>
            <input value={form.sku} onChange={set('sku')} placeholder="AMZN-001" className="input" />
          </div>

          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={4} placeholder="Describe the gift card..." className="input" />
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700 sm:col-span-2">
            <input type="checkbox" checked={form.isActive} onChange={set('isActive')} className="h-4 w-4 accent-brand-600" />
            <span>
              <span className="block text-sm font-semibold">Product active</span>
              <span className="text-xs text-slate-400">Disabled products won't be shown in the store.</span>
            </span>
          </label>
        </div>

        <div className="flex gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
          <button type="submit" disabled={saving} className="btn-primary flex-1 py-3">
            {saving ? <><IconSpinner size={18} /> Saving...</> : isEdit ? 'Save Changes' : 'Create Product'}
          </button>
          <Link to="/admin/products" className="btn-secondary">Cancel</Link>
        </div>
      </motion.form>
    </div>
  );
};

export default AdminProductForm;
