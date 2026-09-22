import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Loader2, Pencil, Trash2, ImageIcon, Package,
  RefreshCw, X, Upload
} from 'lucide-react';
import api from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';

const emptyForm = {
  name: '',
  description: '',
  brand: '',
  sku: '',
  categoryName: '',
  image: '',
  sellingPrice: '',
  discountPrice: '',
  stock: 0,
  status: 'Active',
  availability: 'Both',
  fulfilmentType: 'Gym Pickup',
  lowStockThreshold: 5,
};

const GymStoreProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['Uncategorized']);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [inventory, setInventory] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const loadCategories = async () => {
    try {
      const res = await api.get('/store/admin/categories');
      const cats = (res.data.categories || []).filter((c: any) => c.status === 'Active').map((c: any) => c.name);
      const distinct = Array.from(new Set([...cats, 'Uncategorized']));
      setCategories(distinct);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (category !== 'all') params.set('category', category);
      if (status !== 'all') params.set('status', status);
      if (inventory !== 'all') params.set('inventory', inventory);
      params.set('limit', '200');
      const res = await api.get(`/store/admin/products?${params.toString()}`);
      setProducts(res.data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, status, inventory]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadCategories();
  }, [user?.id]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setPreviewUrl('');
    setModalOpen(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description || '',
      brand: p.brand || '',
      sku: p.sku || '',
      categoryName: p.categoryName,
      image: p.image || '',
      sellingPrice: String(p.sellingPrice),
      discountPrice: p.discountPrice ? String(p.discountPrice) : '',
      stock: p.stock,
      status: p.status,
      availability: p.availability,
      fulfilmentType: p.fulfilmentType,
      lowStockThreshold: p.lowStockThreshold,
    });
    setPreviewUrl(p.image || '');
    setModalOpen(true);
  };

  const onFileUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    try {
      setUploadingImg(true);
      const res = await api.post('/store/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = `http://localhost:5600${res.data.url}`;
      setForm((f: any) => ({ ...f, image: url }));
      setPreviewUrl(url);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Image upload failed');
    } finally {
      setUploadingImg(false);
    }
  };

  const saveProduct = async () => {
    if (!form.name.trim() || form.sellingPrice === '') {
      alert('Product name and selling price are required.');
      return;
    }
    if (form.sellingPrice !== '' && Number(form.sellingPrice) < 0) {
      alert('Selling price cannot be negative.');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        ...form,
        sellingPrice: Number(form.sellingPrice) || 0,
        discountPrice: form.discountPrice === '' ? undefined : Number(form.discountPrice),
        stock: Number(form.stock) || 0,
        lowStockThreshold: Number(form.lowStockThreshold) || 0,
        image: form.image || undefined,
      };
      if (editing) {
        await api.put(`/store/admin/products/${editing._id}`, payload);
      } else {
        await api.post('/store/admin/products', payload);
      }
      setModalOpen(false);
      loadProducts();
      loadCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (p: any) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/store/admin/products/${p._id}`);
      loadProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const inputCls = 'w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-3 py-2 text-sm text-[#1E293B] focus:border-[#16A34A] outline-none';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Products</h1>
          <p className="text-[#475569] mt-1">Add, edit and manage your gym store products.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#16A34A] to-[#0D9488] text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:opacity-90 transition-opacity">
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl pl-9 pr-4 py-2 text-sm text-[#1E293B] focus:border-[#16A34A] outline-none"
          />
          <Search className="absolute left-3 top-2.5 text-[#475569]" size={16} />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${inputCls} lg:w-48`}>
          <option value="all">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputCls} lg:w-40`}>
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <select value={inventory} onChange={(e) => setInventory(e.target.value)} className={`${inputCls} lg:w-48`}>
          <option value="all">All Inventory</option>
          <option value="outOfStock">Out of Stock</option>
          <option value="lowStock">Low Stock</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#16A34A]" size={40} /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#CCFBF1] rounded-2xl">
          <Package className="mx-auto text-[#16A34A]/30 mb-4" size={56} />
          <p className="text-[#64748B] font-medium">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p) => {
            const price = p.discountPrice ?? p.sellingPrice;
            const isLow = p.stock > 0 && p.stock <= p.lowStockThreshold;
            return (
              <div key={p._id} className="bg-white border border-[#CCFBF1] rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                <div className="h-40 bg-[#F0FDFA] relative">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#16A34A]/30"><ImageIcon size={48} /></div>
                  )}
                  <span className={`absolute top-2 left-2 px-2.5 py-1 rounded-full text-xs font-bold ${
                    p.stock <= 0 ? 'bg-red-100 text-red-700' : isLow ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {p.stock <= 0 ? 'Out of stock' : isLow ? `Low (${p.stock})` : `In stock (${p.stock})`}
                  </span>
                  {p.discountPrice != null && p.discountPrice < p.sellingPrice && (
                    <span className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-bold bg-[#16A34A] text-white">
                      {Math.round(((p.sellingPrice - p.discountPrice) / p.sellingPrice) * 100)}% off
                    </span>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wide">{p.categoryName}</span>
                    <span className={`text-xs font-bold ${p.status === 'Active' ? 'text-green-600' : 'text-gray-400'}`}>{p.status}</span>
                  </div>
                  <h3 className="font-bold text-[#1E293B]">{p.name}</h3>
                  {p.brand && <p className="text-xs text-[#475569]">{p.brand}{p.sku ? ` · ${p.sku}` : ''}</p>}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-lg font-black text-[#16A34A]">₹{price}</span>
                    {p.discountPrice != null && p.discountPrice < p.sellingPrice && (
                      <span className="text-sm text-gray-400 line-through">₹{p.sellingPrice}</span>
                    )}
                  </div>
                  <div className="mt-3 text-xs text-[#475569] grid grid-cols-2 gap-1">
                    <span>Channels: {p.availability}</span>
                    <span>Fulfil: {p.fulfilmentType}</span>
                  </div>
                  <div className="mt-4 flex gap-2 pt-3 border-t border-[#F1F5F9]">
                    <button onClick={() => openEdit(p)} className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-bold flex items-center justify-center gap-1">
                      <Pencil size={13} /> Edit
                    </button>
                    <button onClick={() => deleteProduct(p)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs font-bold flex items-center justify-center gap-1">
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={22} />
            </button>
            <h2 className="text-2xl font-bold text-[#1E293B] mb-6">{editing ? 'Edit Product' : 'Add Product'}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase mb-1 block">Product Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="e.g., Whey Protein 1kg" />
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase mb-1 block">Category</label>
                <input list="store-cats" value={form.categoryName} onChange={(e) => setForm({ ...form, categoryName: e.target.value })} className={inputCls} placeholder="Type or choose a category" />
                <datalist id="store-cats">
                  {categories.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase mb-1 block">Brand</label>
                <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className={inputCls} placeholder="e.g., MuscleBlaze" />
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase mb-1 block">SKU</label>
                <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className={inputCls} placeholder="Unique code (optional)" />
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase mb-1 block">Selling Price (₹) *</label>
                <input type="number" min={0} value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} className={inputCls} placeholder="0" />
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase mb-1 block">Discount Price (₹)</label>
                <input type="number" min={0} value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} className={inputCls} placeholder="Optional" />
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase mb-1 block">Stock *</label>
                <input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase mb-1 block">Low Stock Alert At</label>
                <input type="number" min={0} value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase mb-1 block">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase mb-1 block">Sell Online</label>
                <select value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} className={inputCls}>
                  <option value="Both">Both Online & In-Gym</option>
                  <option value="Online">Online Only</option>
                  <option value="Offline">In-Gym Only</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase mb-1 block">Fulfilment</label>
                <select value={form.fulfilmentType} onChange={(e) => setForm({ ...form, fulfilmentType: e.target.value })} className={inputCls}>
                  <option value="Gym Pickup">Gym Pickup</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Both">Pickup & Delivery</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-bold text-[#64748B] uppercase mb-1 block">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputCls} resize-none`} rows={2} placeholder="Product description shown to members" />
            </div>

            <div className="mt-4">
              <label className="text-xs font-bold text-[#64748B] uppercase mb-2 block">Product Image</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl border border-[#CCFBF1] overflow-hidden bg-[#F0FDFA] flex items-center justify-center">
                  {previewUrl ? (
                    <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="text-[#16A34A]/30" size={32} />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  {uploadingImg ? (
                    <Loader2 className="animate-spin text-[#16A34A]" size={20} />
                  ) : (
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-sm font-bold text-[#16A34A] cursor-pointer hover:bg-[#CCFBF1] transition-colors">
                      <Upload size={16} /> Upload Image
                      <input type="file" accept="image/*" className="hidden" onChange={onFileUpload} />
                    </label>
                  )}
                  <input value={form.image} onChange={(e) => { setForm({ ...form, image: e.target.value }); setPreviewUrl(e.target.value); }} className={`${inputCls} text-xs`} placeholder="or paste an image URL" />
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3 pt-4 border-t border-gray-100">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-[#475569] font-bold rounded-xl hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={saveProduct} disabled={saving} className="flex-1 py-3 bg-gradient-to-r from-[#16A34A] to-[#0D9488] text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                {saving ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                {editing ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymStoreProducts;