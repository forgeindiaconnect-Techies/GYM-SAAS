import { useState, useEffect } from 'react';
import { Plus, Loader2, Pencil, Trash2, X, Tag } from 'lucide-react';
import api from '../../../utils/api';

const GymStoreCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', status: 'Active' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get('/store/admin/categories');
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', status: 'Active' });
    setModalOpen(true);
  };

  const openEdit = (c: any) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description || '', status: c.status });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) { alert('Category name is required.'); return; }
    try {
      setSaving(true);
      if (editing) {
        await api.put(`/store/admin/categories/${editing._id}`, form);
      } else {
        await api.post('/store/admin/categories', form);
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: any) => {
    if (!window.confirm(`Delete category "${c.name}"?`)) return;
    try {
      await api.delete(`/store/admin/categories/${c._id}`);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#202522] tracking-tight">Product Categories</h1>
          <p className="text-[#4A514D] mt-1">Organise your store products into categories.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#34483F] to-[#8FA89B] text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:opacity-90 transition-opacity">
          <Plus size={18} /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#34483F]" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div key={c._id} className="bg-white border border-[#DCD9CD] rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl bg-[#34483F]/10 flex items-center justify-center">
                  <Tag className="text-[#34483F]" size={22} />
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {c.status}
                </span>
              </div>
              <h3 className="font-bold text-[#202522] text-lg mt-3">{c.name}</h3>
              {c.description && <p className="text-sm text-[#4A514D] mt-1 line-clamp-2">{c.description}</p>}
              <p className="text-xs text-[#8FA89B] font-bold mt-2">{c.productCount || 0} active product(s)</p>
              <div className="mt-4 flex gap-2 pt-3 border-t border-[#F1F5F9]">
                <button onClick={() => openEdit(c)} className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-bold flex items-center justify-center gap-1">
                  <Pencil size={13} /> Edit
                </button>
                <button onClick={() => remove(c)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs font-bold flex items-center justify-center gap-1">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={22} />
            </button>
            <h2 className="text-2xl font-bold text-[#202522] mb-6">{editing ? 'Edit Category' : 'Add Category'}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#727975] uppercase mb-1 block">Category Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl px-3 py-2 text-sm text-[#202522] focus:border-[#34483F] outline-none" placeholder="e.g., Supplements" />
              </div>
              <div>
                <label className="text-xs font-bold text-[#727975] uppercase mb-1 block">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl px-3 py-2 text-sm text-[#202522] focus:border-[#34483F] outline-none resize-none" rows={3} placeholder="Optional" />
              </div>
              <div>
                <label className="text-xs font-bold text-[#727975] uppercase mb-1 block">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl px-3 py-2 text-sm text-[#202522] focus:border-[#34483F] outline-none">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-[#4A514D] font-bold rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 py-3 bg-gradient-to-r from-[#34483F] to-[#8FA89B] text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                {saving && <Loader2 className="animate-spin" size={18} />}
                {editing ? 'Update Category' : 'Create Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymStoreCategories;