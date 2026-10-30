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
          <h1 className="text-3xl font-bold text-[#111827] tracking-tight">Gym Stores</h1>
          <p className="text-[#64748B] mt-1">Monitor Gym Store usage and revenue across all gyms.</p>
        </div>
        <select value={gymFilter} onChange={(e) => setGymFilter(e.target.value)} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#111827] focus:border-[#FDBA74] outline-none">
          <option value="all">All Gyms</option>
          {gyms.map((g) => <option key={g.gymId} value={g.gymId}>{g.gymName}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5">
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Gyms with Store</p>
          <h3 className="text-2xl font-black text-[#111827]">{enabledGyms.length} <span className="text-sm font-bold text-[#64748B]">/ {gyms.length}</span></h3>
        </div>
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5">
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Store Revenue</p>
          <h3 className="text-2xl font-black text-[#EA580C]">₹{totalRevenue.toLocaleString('en-IN')}</h3>
        </div>
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5">
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Total Orders</p>
          <h3 className="text-2xl font-black text-[#111827]">{totalOrders}</h3>
        </div>
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5">
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Total Products</p>
          <h3 className="text-2xl font-black text-[#111827]">{totalProducts}</h3>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#EA580C]" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {gyms.map((g) => {
            const st = g.stats || {};
            return (
              <div key={g.gymId} className={`bg-[#FFFFFF] border rounded-2xl overflow-hidden ${g.storeEntitlement?.enabled ? 'border-[#E2E8F0]' : 'border-[#E2E8F0] opacity-90'}`}>
                <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${g.storeEntitlement?.enabled ? 'bg-[#FFF7ED] text-[#EA580C]' : 'bg-[#F8FAFC] text-[#64748B]'}`}>
                      <Store size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#111827]">{g.gymName}</h3>
                      <p className="text-xs text-[#64748B]">Gym status: {g.gymStatus}</p>
                    </div>
                  </div>
                  {g.storeEntitlement?.enabled ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFF7ED] text-[#EA580C]">Premium · Active</span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#F8FAFC] text-[#64748B]">
                      {g.storeEntitlement?.plan || 'No plan'} · {g.storeEntitlement?.status || '—'}
                    </span>
                  )}
                </div>
                <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#F8FAFC] rounded-xl p-3 text-center">
                    <IndianRupee className="mx-auto text-[#EA580C] mb-1" size={18} />
                    <p className="text-lg font-black text-[#111827]">₹{st.totalRevenue?.toLocaleString('en-IN') || 0}</p>
                    <p className="text-[10px] font-bold text-[#64748B] uppercase">Revenue</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-xl p-3 text-center">
                    <ShoppingBag className="mx-auto text-[#9A3412] mb-1" size={18} />
                    <p className="text-lg font-black text-[#111827]">{st.totalOrders || 0}</p>
                    <p className="text-[10px] font-bold text-[#64748B] uppercase">Orders</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-xl p-3 text-center">
                    <Package className="mx-auto text-[#EA580C] mb-1" size={18} />
                    <p className="text-lg font-black text-[#111827]">{st.totalProducts || 0}</p>
                    <p className="text-[10px] font-bold text-[#64748B] uppercase">Products</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-xl p-3 text-center">
                    <TrendingUp className="mx-auto text-[#9A3412] mb-1" size={18} />
                    <p className="text-lg font-black text-[#111827]">{st.completedOrders || 0}</p>
                    <p className="text-[10px] font-bold text-[#64748B] uppercase">Completed</p>
                  </div>
                </div>
                {(g.recentOrders || []).length > 0 && (
                  <div className="px-5 pb-5">
                    <p className="text-xs font-bold text-[#64748B] uppercase mb-2">Recent Orders</p>
                    <div className="space-y-1.5">
                      {(g.recentOrders as any[]).map((o) => (
                        <div key={o._id} className="flex items-center justify-between text-sm bg-[#F8FAFC] rounded-lg px-3 py-2">
                          <span className="font-semibold text-[#111827]">{o.orderNumber}</span>
                          <span className="text-xs text-[#64748B]">{o.status} · ₹{o.total}</span>
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