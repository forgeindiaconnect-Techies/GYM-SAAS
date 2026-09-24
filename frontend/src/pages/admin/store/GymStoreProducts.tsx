import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Loader2, Pencil, Trash2, ImageIcon, Package,
  RefreshCw, X, Upload
} from 'lucide-react';
import api from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';

const PRODUCT_TYPE_CONFIG: Record<string, {
  hasVariants: boolean;
  variantFields: { name: string; label: string; placeholder: string }[];
  fields: { name: string; label: string; type: 'text' | 'number' | 'select' | 'date'; options?: string[]; placeholder?: string }[];
}> = {
  'Supplements': {
    hasVariants: true,
    variantFields: [{ name: 'flavour', label: 'Flavour', placeholder: 'e.g. Chocolate' }, { name: 'weight', label: 'Weight/Volume', placeholder: 'e.g. 1kg' }],
    fields: [
      { name: 'form', label: 'Form', type: 'select', options: ['Powder', 'Capsule', 'Liquid', 'Tablet', 'Bar'] },
      { name: 'servings', label: 'Servings', type: 'number', placeholder: 'e.g. 30' },
      { name: 'dietary', label: 'Dietary Preference', type: 'select', options: ['Vegetarian', 'Non-Vegetarian', 'Vegan'] },
      { name: 'expiryDate', label: 'Expiry Date', type: 'date' }
    ]
  },
  'Nutrition & Healthy Snacks': {
    hasVariants: true,
    variantFields: [{ name: 'flavour', label: 'Flavour', placeholder: 'e.g. Peanut Butter' }],
    fields: [
      { name: 'dietary', label: 'Dietary Preference', type: 'select', options: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Gluten-Free'] },
      { name: 'calories', label: 'Calories per serving', type: 'number' },
      { name: 'expiryDate', label: 'Expiry Date', type: 'date' }
    ]
  },
  'Fitness Drinks': {
    hasVariants: true,
    variantFields: [{ name: 'flavour', label: 'Flavour', placeholder: 'e.g. Berry' }, { name: 'volume', label: 'Volume (ml)', placeholder: 'e.g. 500' }],
    fields: [
      { name: 'drinkType', label: 'Drink Type', type: 'select', options: ['Energy Drink', 'Protein Shake', 'Electrolytes', 'Pre-Workout'] },
      { name: 'sugarFree', label: 'Sugar Free', type: 'select', options: ['Yes', 'No'] },
      { name: 'expiryDate', label: 'Expiry Date', type: 'date' }
    ]
  },
  'Gym Accessories': {
    hasVariants: true,
    variantFields: [{ name: 'color', label: 'Color', placeholder: 'e.g. Black' }, { name: 'size', label: 'Size', placeholder: 'e.g. Medium' }],
    fields: [
      { name: 'material', label: 'Material', type: 'text' }
    ]
  },
  'Yoga & Recovery': {
    hasVariants: true,
    variantFields: [{ name: 'color', label: 'Color', placeholder: 'e.g. Blue' }, { name: 'thickness', label: 'Thickness/Variant', placeholder: 'e.g. 6mm' }],
    fields: [
      { name: 'material', label: 'Material', type: 'text' }
    ]
  },
  'Gym Clothing': {
    hasVariants: true,
    variantFields: [{ name: 'size', label: 'Size', placeholder: 'e.g. L' }, { name: 'color', label: 'Color', placeholder: 'e.g. Black' }],
    fields: [
      { name: 'gender', label: 'Gender', type: 'select', options: ['Men', 'Women', 'Unisex'] },
      { name: 'fit', label: 'Fit Type', type: 'select', options: ['Slim Fit', 'Regular Fit', 'Compression', 'Oversized'] },
      { name: 'material', label: 'Material', type: 'text' }
    ]
  },
  'Gym Merchandise': {
    hasVariants: true,
    variantFields: [{ name: 'size', label: 'Size', placeholder: 'e.g. L' }, { name: 'color', label: 'Color', placeholder: 'e.g. Black' }],
    fields: []
  },
  'Fitness Monitoring': {
    hasVariants: true,
    variantFields: [{ name: 'color', label: 'Color', placeholder: 'e.g. Silver' }],
    fields: [
      { name: 'connectivity', label: 'Connectivity', type: 'select', options: ['Bluetooth', 'Wi-Fi', 'Both', 'None'] },
      { name: 'warranty', label: 'Warranty (Months)', type: 'number' }
    ]
  },
  'Personal Care': {
    hasVariants: true,
    variantFields: [{ name: 'size', label: 'Volume/Weight', placeholder: 'e.g. 250ml' }, { name: 'fragrance', label: 'Fragrance', placeholder: 'e.g. Mint' }],
    fields: [
      { name: 'type', label: 'Type', type: 'select', options: ['Deodorant', 'Body Wash', 'Shampoo', 'Cream', 'Other'] },
      { name: 'expiryDate', label: 'Expiry Date', type: 'date' }
    ]
  },
  'Healthy Meals': {
    hasVariants: false,
    variantFields: [],
    fields: [
      { name: 'dietary', label: 'Dietary Preference', type: 'select', options: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Keto'] },
      { name: 'calories', label: 'Calories', type: 'number' },
      { name: 'protein', label: 'Protein (g)', type: 'number' }
    ]
  },
  'Other': {
    hasVariants: false,
    variantFields: [],
    fields: []
  }
};

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
  productType: 'Supplements',
  hasVariants: false,
  attributes: {} as any,
  variants: [] as any[],
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
  const [filterProductType, setFilterProductType] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const loadCategories = async (pType?: string) => {
    try {
      const qs = pType ? `?productType=${encodeURIComponent(pType)}` : '';
      const res = await api.get(`/store/admin/categories${qs}`);
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
      if (filterProductType !== 'all') params.set('productType', filterProductType);
      params.set('limit', '200');
      const res = await api.get(`/store/admin/products?${params.toString()}`);
      setProducts(res.data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, status, inventory, filterProductType]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadCategories(form.productType);
  }, [form.productType, user?.id]);

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
      productType: p.productType || 'Supplements',
      hasVariants: p.hasVariants || false,
      attributes: p.attributes || {},
      variants: (p.variants || []).map((v: any) => ({
        ...v,
        price: String(v.price),
        discountPrice: v.discountPrice ? String(v.discountPrice) : '',
        stock: v.stock
      })),
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
    if (!form.name.trim() || !form.productType.trim() || !form.categoryName.trim()) {
      alert('Product name, product type, and category are required.');
      return;
    }
    if (!form.hasVariants) {
      if (form.sellingPrice === '') {
        alert('Selling price is required.');
        return;
      }
      if (Number(form.sellingPrice) < 0) {
        alert('Selling price cannot be negative.');
        return;
      }
      if (form.discountPrice !== '' && Number(form.discountPrice) >= Number(form.sellingPrice)) {
        alert('Discount amount cannot be greater than or equal to selling price.');
        return;
      }
    } else {
      if (form.variants.length === 0) {
        alert('Please add at least one variant.');
        return;
      }
      for (const v of form.variants) {
        if (!v.price || Number(v.price) < 0) {
          alert('All variants must have a valid price.');
          return;
        }
        if (v.discountPrice !== '' && Number(v.discountPrice) >= Number(v.price)) {
          alert('Discount amount cannot be greater than or equal to price in variants.');
          return;
        }
      }
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
        variants: form.hasVariants ? form.variants.map((v) => ({
          sku: v.sku,
          attributes: v.attributes,
          price: Number(v.price) || 0,
          discountPrice: v.discountPrice === '' ? undefined : Number(v.discountPrice),
          stock: Number(v.stock) || 0
        })) : []
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

  const addVariantRow = () => {
    setForm({
      ...form,
      variants: [...form.variants, { sku: '', attributes: {}, price: form.sellingPrice || '', discountPrice: form.discountPrice || '', stock: 0 }]
    });
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...form.variants];
    newVariants[index][field] = value;
    setForm({ ...form, variants: newVariants });
  };

  const removeVariant = (index: number) => {
    const newVariants = [...form.variants];
    newVariants.splice(index, 1);
    setForm({ ...form, variants: newVariants });
  };

  const inputCls = 'w-full bg-[#F2EFE8] border border-[#D3DFDA] rounded-lg px-3 py-2 text-xs text-[#202828] focus:border-[#164A4A] outline-none';

  const typeConfig = PRODUCT_TYPE_CONFIG[form.productType] || PRODUCT_TYPE_CONFIG['Other'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#202828] tracking-tight">Products</h1>
          <p className="text-[#455250] mt-1">Add, edit and manage your gym store products.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#164A4A] to-[#6fa3a0] text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:opacity-90 transition-opacity">
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="flex flex-col lg:flex-row flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl pl-9 pr-4 py-2 text-sm text-[#202828] focus:border-[#164A4A] outline-none"
          />
          <Search className="absolute left-3 top-2.5 text-[#455250]" size={16} />
        </div>
        <select value={filterProductType} onChange={(e) => setFilterProductType(e.target.value)} className="w-full bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl px-3 py-2 text-sm text-[#202828] focus:border-[#164A4A] outline-none lg:w-48">
          <option value="all">All Types</option>
          {Object.keys(PRODUCT_TYPE_CONFIG).map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl px-3 py-2 text-sm text-[#202828] focus:border-[#164A4A] outline-none lg:w-48">
          <option value="all">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl px-3 py-2 text-sm text-[#202828] focus:border-[#164A4A] outline-none lg:w-40">
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <select value={inventory} onChange={(e) => setInventory(e.target.value)} className="w-full bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl px-3 py-2 text-sm text-[#202828] focus:border-[#164A4A] outline-none lg:w-48">
          <option value="all">All Inventory</option>
          <option value="inStock">In Stock</option>
          <option value="outOfStock">Out of Stock</option>
          <option value="lowStock">Low Stock</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#164A4A]" size={40} /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#D3DFDA] rounded-2xl">
          <Package className="mx-auto text-[#164A4A]/30 mb-4" size={56} />
          <p className="text-[#687B78] font-medium">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p) => {
            let totalStock = p.stock;
            let displayPrice = p.sellingPrice - (p.discountPrice || 0);
            let originalPrice = p.sellingPrice;
            let hasDiscount = p.discountPrice != null && p.discountPrice > 0;

            if (p.hasVariants && p.variants && p.variants.length > 0) {
               totalStock = p.variants.reduce((acc: number, v: any) => acc + v.stock, 0);
               const minVariant = p.variants.reduce((prev: any, curr: any) => {
                  const prevDisplay = prev.price - (prev.discountPrice || 0);
                  const currDisplay = curr.price - (curr.discountPrice || 0);
                  return currDisplay < prevDisplay ? curr : prev;
               }, p.variants[0]);
               
               displayPrice = minVariant.price - (minVariant.discountPrice || 0);
               originalPrice = minVariant.price;
               hasDiscount = minVariant.discountPrice != null && minVariant.discountPrice > 0;
            }

            const isLow = totalStock > 0 && totalStock <= p.lowStockThreshold;
            return (
              <div key={p._id} className="bg-white border border-[#D3DFDA] rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                <div className="h-40 bg-[#F1F5F3] relative">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#164A4A]/30"><ImageIcon size={48} /></div>
                  )}
                  <span className={`absolute top-2 left-2 px-2.5 py-1 rounded-full text-xs font-bold ${
                    totalStock <= 0 ? 'bg-red-100 text-red-700' : isLow ? 'bg-amber-100 text-amber-700' : 'bg-[#D2B48C]/10 text-[#164A4A]'
                  }`}>
                    {totalStock <= 0 ? 'Out of stock' : isLow ? `Low (${totalStock})` : `In stock (${totalStock})`}
                  </span>
                  {hasDiscount && (
                    <span className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-bold bg-[#164A4A] text-white">
                      {Math.round(((originalPrice - displayPrice) / originalPrice) * 100)}% off
                    </span>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#6fa3a0] uppercase tracking-wide">{p.categoryName}</span>
                    <span className={`text-xs font-bold ${p.status === 'Active' ? 'text-[#164A4A]' : 'text-gray-400'}`}>{p.status}</span>
                  </div>
                  <h3 className="font-bold text-[#202828] truncate">{p.name}</h3>
                  {p.brand && <p className="text-xs text-[#455250]">{p.brand}{p.sku && !p.hasVariants ? ` · ${p.sku}` : ''}</p>}
                  
                  <div className="mt-2 flex items-center gap-2">
                    {p.hasVariants ? (
                       <>
                         <span className="text-lg font-black text-[#164A4A]">From ₹{displayPrice}</span>
                         {hasDiscount && (
                           <span className="text-sm text-gray-400 line-through">₹{originalPrice}</span>
                         )}
                       </>
                    ) : (
                       <>
                         <span className="text-lg font-black text-[#164A4A]">₹{displayPrice}</span>
                         {hasDiscount && (
                           <span className="text-sm text-gray-400 line-through">₹{originalPrice}</span>
                         )}
                       </>
                    )}
                  </div>
                  <div className="mt-3 text-xs text-[#455250] grid grid-cols-2 gap-1">
                    <span>Channels: {p.availability}</span>
                    <span>Fulfil: {p.fulfilmentType}</span>
                  </div>
                  {p.hasVariants && (
                    <div className="mt-2 text-xs font-bold text-[#6fa3a0]">
                      {p.variants.length} Variants Available
                    </div>
                  )}
                  <div className="mt-4 flex gap-2 pt-3 border-t border-[#F1F5F9]">
                    <button onClick={() => openEdit(p)} className="flex-1 px-3 py-1.5 bg-blue-50 text-[#D2B48C] rounded-lg hover:bg-blue-100 transition-colors text-xs font-bold flex items-center justify-center gap-1">
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
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative mt-24 mb-8">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-[#202828] mb-5">{editing ? 'Edit Product' : 'Add Product'}</h2>

            <div className="space-y-6">
              {/* PRODUCT INFORMATION */}
              <div>
                <h3 className="text-xs font-bold text-[#164A4A] uppercase tracking-wider mb-3">Product Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-[#687B78] uppercase tracking-wider mb-1 block">Product Type *</label>
                    <select value={form.productType} onChange={(e) => setForm({ ...form, productType: e.target.value, attributes: {}, variants: [], hasVariants: false })} className={inputCls}>
                      {Object.keys(PRODUCT_TYPE_CONFIG).map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#687B78] uppercase tracking-wider mb-1 block">Product Name *</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="e.g., Whey Protein 1kg" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#687B78] uppercase tracking-wider mb-1 block">Category *</label>
                    <input list="store-cats" value={form.categoryName} onChange={(e) => setForm({ ...form, categoryName: e.target.value })} className={inputCls} placeholder="Type or choose a category" />
                    <datalist id="store-cats">
                      {categories.map((c) => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#687B78] uppercase tracking-wider mb-1 block">Brand</label>
                    <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className={inputCls} placeholder="e.g., MuscleBlaze" />
                  </div>
                  {!form.hasVariants && (
                    <div>
                      <label className="text-[10px] font-bold text-[#687B78] uppercase tracking-wider mb-1 block">SKU</label>
                      <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className={inputCls} placeholder="Unique code (optional)" />
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-[#687B78] uppercase tracking-wider mb-1 block">Description</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputCls} resize-none`} rows={2} placeholder="Product description shown to members" />
                  </div>
                </div>
              </div>

              {/* PRODUCT DETAILS (DYNAMIC) */}
              {typeConfig.fields.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-xs font-bold text-[#164A4A] uppercase tracking-wider mb-3">Product Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {typeConfig.fields.map(field => (
                      <div key={field.name}>
                        <label className="text-[10px] font-bold text-[#687B78] uppercase tracking-wider mb-1 block">{field.label}</label>
                        {field.type === 'select' ? (
                          <select value={form.attributes[field.name] || ''} onChange={(e) => setForm({ ...form, attributes: { ...form.attributes, [field.name]: e.target.value } })} className={inputCls}>
                            <option value="">Select {field.label}</option>
                            {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : (
                          <input type={field.type} value={form.attributes[field.name] || ''} onChange={(e) => setForm({ ...form, attributes: { ...form.attributes, [field.name]: e.target.value } })} className={inputCls} placeholder={field.placeholder || ''} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VARIANTS OR PRICING */}
              {typeConfig.variantFields.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <label className="flex items-center gap-2 cursor-pointer w-max">
                    <input type="checkbox" checked={form.hasVariants} onChange={(e) => {
                      setForm({ ...form, hasVariants: e.target.checked });
                    }} className="accent-[#164A4A] w-4 h-4 rounded" />
                    <span className="text-sm font-bold text-[#202828]">This product has multiple options/variants</span>
                  </label>
                </div>
              )}

              {form.hasVariants ? (
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                     <h3 className="text-xs font-bold text-[#164A4A] uppercase tracking-wider">Variants</h3>
                     <button onClick={addVariantRow} type="button" className="px-3 py-1.5 bg-blue-50 text-[#D2B48C] rounded-lg hover:bg-blue-100 text-xs font-bold flex items-center gap-1"><Plus size={14}/> Add Variant</button>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-[#D3DFDA]">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-[#F1F5F3] text-[#455250]">
                        <tr>
                          {typeConfig.variantFields.map(f => <th key={f.name} className="p-2 font-semibold">{f.label}</th>)}
                          <th className="p-2 font-semibold">SKU</th>
                          <th className="p-2 font-semibold">Price (₹)</th>
                          <th className="p-2 font-semibold">Discount Amount (₹)</th>
                          <th className="p-2 font-semibold">Stock</th>
                          <th className="p-2 font-semibold"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {form.variants.length === 0 ? (
                           <tr>
                             <td colSpan={typeConfig.variantFields.length + 5} className="p-4 text-center text-gray-400">No variants added. Click "Add Variant" to create one.</td>
                           </tr>
                        ) : (
                          form.variants.map((v, idx) => (
                             <tr key={idx} className="border-t border-[#D3DFDA]">
                                {typeConfig.variantFields.map(f => (
                                   <td key={f.name} className="p-2">
                                     <input value={v.attributes[f.name] || ''} onChange={(e) => updateVariant(idx, 'attributes', { ...v.attributes, [f.name]: e.target.value })} className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs outline-none focus:border-[#164A4A] min-w-[100px]" placeholder={f.placeholder} />
                                   </td>
                                ))}
                                <td className="p-2"><input value={v.sku} onChange={(e) => updateVariant(idx, 'sku', e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs min-w-[80px]" placeholder="SKU" /></td>
                                <td className="p-2"><input type="number" value={v.price} onChange={(e) => updateVariant(idx, 'price', e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs w-20" placeholder="0" /></td>
                                <td className="p-2"><input type="number" value={v.discountPrice} onChange={(e) => updateVariant(idx, 'discountPrice', e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs w-20" placeholder="Optional" /></td>
                                <td className="p-2"><input type="number" value={v.stock} onChange={(e) => updateVariant(idx, 'stock', e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs w-20" placeholder="0" /></td>
                                <td className="p-2 text-center"><button type="button" onClick={() => removeVariant(idx)} className="text-[#6fa3a0] hover:text-red-700 bg-red-50 p-1.5 rounded"><Trash2 size={14}/></button></td>
                             </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-xs font-bold text-[#164A4A] uppercase tracking-wider mb-3">Pricing & Inventory</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-[#687B78] uppercase tracking-wider mb-1 block">Selling Price (₹) *</label>
                      <input type="number" min={0} value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} className={inputCls} placeholder="0" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#687B78] uppercase tracking-wider mb-1 block">Discount Amount (₹)</label>
                      <input type="number" min={0} value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} className={inputCls} placeholder="Optional" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#687B78] uppercase tracking-wider mb-1 block">Stock Quantity *</label>
                      <input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#687B78] uppercase tracking-wider mb-1 block">Low Stock Alert At</label>
                      <input type="number" min={0} value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })} className={inputCls} />
                    </div>
                  </div>
                </div>
              )}

              {/* SALES SETTINGS */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold text-[#164A4A] uppercase tracking-wider mb-3">Sales Settings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-[#687B78] uppercase tracking-wider mb-1 block">Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#687B78] uppercase tracking-wider mb-1 block">Sell Online</label>
                    <select value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} className={inputCls}>
                      <option value="Both">Both Online & In-Gym</option>
                      <option value="Online">Online Only</option>
                      <option value="Offline">In-Gym Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#687B78] uppercase tracking-wider mb-1 block">Fulfilment</label>
                    <select value={form.fulfilmentType} onChange={(e) => setForm({ ...form, fulfilmentType: e.target.value })} className={inputCls}>
                      <option value="Gym Pickup">Gym Pickup</option>
                      <option value="Delivery">Delivery</option>
                      <option value="Both">Pickup & Delivery</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold text-[#164A4A] uppercase tracking-wider mb-3">Product Image</h3>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl border border-[#D3DFDA] overflow-hidden bg-[#F1F5F3] flex items-center justify-center shrink-0">
                    {previewUrl ? (
                      <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-[#164A4A]/30" size={24} />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      {uploadingImg ? (
                        <Loader2 className="animate-spin text-[#164A4A]" size={16} />
                      ) : (
                        <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F1F5F3] border border-[#D3DFDA] rounded-lg text-xs font-bold text-[#164A4A] cursor-pointer hover:bg-[#D3DFDA] transition-colors">
                          <Upload size={14} /> Upload Image
                          <input type="file" accept="image/*" className="hidden" onChange={onFileUpload} />
                        </label>
                      )}
                    </div>
                    <input value={form.image} onChange={(e) => { setForm({ ...form, image: e.target.value }); setPreviewUrl(e.target.value); }} className={inputCls} placeholder="or paste an image URL" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-[#455250] text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={saveProduct} disabled={saving} className="flex-1 py-3 bg-gradient-to-r from-[#164A4A] to-[#6fa3a0] text-white text-sm font-bold rounded-xl shadow-lg shadow-green-200 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
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