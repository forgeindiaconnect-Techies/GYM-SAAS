import { useState, useEffect } from 'react';
import { Loader2, Store, TrendingUp, ShoppingBag, Package, IndianRupee, AlertTriangle } from 'lucide-react';
import api from '../../utils/api';

const SuperAdminGymStore = () => {
  const [gyms, setGyms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gymFilter, setGymFilter] = useState('all');

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/store/admin/overview?gymId=${gymFilter}`);
      setGyms(res.data.gyms || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [gymFilter]);

  const enabledGyms = gyms.filter((g) => g.storeEntitlement?.enabled);
  const totalRevenue = gyms.reduce((s, g) => s + (g.stats?.totalRevenue || 0), 0);
  const totalOrders = gyms.reduce((s, g) => s + (g.stats?.totalOrders || 0), 0);
  const totalProducts = gyms.reduce((s, g) => s + (g.stats?.totalProducts || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Gym Stores</h1>
          <p className="text-[#475569] mt-1">Monitor Gym Store usage and revenue across all gyms.</p>
        </div>
        <select value={gymFilter} onChange={(e) => setGymFilter(e.target.value)} className="bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-3 py-2 text-sm text-[#1E293B] focus:border-[#16A34A] outline-none">
          <option value="all">All Gyms</option>
          {gyms.map((g) => <option key={g.gymId} value={g.gymId}>{g.gymName}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#CCFBF1] rounded-2xl p-5">
          <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Gyms with Store</p>
          <h3 className="text-2xl font-black text-[#1E293B]">{enabledGyms.length} <span className="text-sm font-bold text-[#64748B]">/ {gyms.length}</span></h3>
        </div>
        <div className="bg-white border border-[#CCFBF1] rounded-2xl p-5">
          <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Store Revenue</p>
          <h3 className="text-2xl font-black text-[#16A34A]">₹{totalRevenue.toLocaleString('en-IN')}</h3>
        </div>
        <div className="bg-white border border-[#CCFBF1] rounded-2xl p-5">
          <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Total Orders</p>
          <h3 className="text-2xl font-black text-[#1E293B]">{totalOrders}</h3>
        </div>
        <div className="bg-white border border-[#CCFBF1] rounded-2xl p-5">
          <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Total Products</p>
          <h3 className="text-2xl font-black text-[#1E293B]">{totalProducts}</h3>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#16A34A]" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {gyms.map((g) => {
            const st = g.stats || {};
            return (
              <div key={g.gymId} className={`bg-white border rounded-2xl overflow-hidden ${g.storeEntitlement?.enabled ? 'border-[#CCFBF1]' : 'border-[#CCFBF1] opacity-90'}`}>
                <div className="p-5 border-b border-[#CCFBF1] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${g.storeEntitlement?.enabled ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-gray-100 text-gray-400'}`}>
                      <Store size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1E293B]">{g.gymName}</h3>
                      <p className="text-xs text-[#475569]">Gym status: {g.gymStatus}</p>
                    </div>
                  </div>
                  {g.storeEntitlement?.enabled ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Premium · Active</span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
                      {g.storeEntitlement?.plan || 'No plan'} · {g.storeEntitlement?.status || '—'}
                    </span>
                  )}
                </div>
                <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#F0FDFA] rounded-xl p-3 text-center">
                    <IndianRupee className="mx-auto text-[#16A34A] mb-1" size={18} />
                    <p className="text-lg font-black text-[#1E293B]">₹{st.totalRevenue?.toLocaleString('en-IN') || 0}</p>
                    <p className="text-[10px] font-bold text-[#64748B] uppercase">Revenue</p>
                  </div>
                  <div className="bg-[#F0FDFA] rounded-xl p-3 text-center">
                    <ShoppingBag className="mx-auto text-[#0D9488] mb-1" size={18} />
                    <p className="text-lg font-black text-[#1E293B]">{st.totalOrders || 0}</p>
                    <p className="text-[10px] font-bold text-[#64748B] uppercase">Orders</p>
                  </div>
                  <div className="bg-[#F0FDFA] rounded-xl p-3 text-center">
                    <Package className="mx-auto text-[#16A34A] mb-1" size={18} />
                    <p className="text-lg font-black text-[#1E293B]">{st.totalProducts || 0}</p>
                    <p className="text-[10px] font-bold text-[#64748B] uppercase">Products</p>
                  </div>
                  <div className="bg-[#F0FDFA] rounded-xl p-3 text-center">
                    <TrendingUp className="mx-auto text-[#0D9488] mb-1" size={18} />
                    <p className="text-lg font-black text-[#1E293B]">{st.completedOrders || 0}</p>
                    <p className="text-[10px] font-bold text-[#64748B] uppercase">Completed</p>
                  </div>
                </div>
                {(g.recentOrders || []).length > 0 && (
                  <div className="px-5 pb-5">
                    <p className="text-xs font-bold text-[#64748B] uppercase mb-2">Recent Orders</p>
                    <div className="space-y-1.5">
                      {(g.recentOrders as any[]).map((o) => (
                        <div key={o._id} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                          <span className="font-semibold text-[#1E293B]">{o.orderNumber}</span>
                          <span className="text-xs text-[#475569]">{o.status} · ₹{o.total}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!g.storeEntitlement?.enabled && (
                  <div className="px-5 pb-5 flex items-center gap-2 text-sm text-amber-600">
                    <AlertTriangle size={16} /> Store not enabled — gym has no active Premium subscription.
                  </div>
                )}
              </div>
            );
          })}
          {gyms.length === 0 && <div className="col-span-2 text-center py-16 text-[#64748B]">No gyms found.</div>}
        </div>
      )}
    </div>
  );
};

export default SuperAdminGymStore;