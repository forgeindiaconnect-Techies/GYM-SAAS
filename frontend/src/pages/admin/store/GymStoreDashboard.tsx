import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Package, Boxes, AlertTriangle, IndianRupee, TrendingUp,
  Loader2, Store, ChevronRight, Bell
} from 'lucide-react';
import api from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';

const GymStoreDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<any>(null);
  const [data, setData] = useState<any>(null);

  const load = async () => {
    try {
      setLoading(true);
      const [statusRes, dashRes] = await Promise.all([
        api.get('/store/status'),
        api.get('/store/admin/dashboard'),
      ]);
      setStatus(statusRes.data);
      setData(dashRes.data);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setStatus({ enabled: false });
      }
      console.error('Failed to load store dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-[#B76E79]" size={40} />
      </div>
    );
  }

  if (!status?.enabled) {
    return (
      <div className="max-w-2xl mx-auto mt-16 bg-[#FFFFFF] border border-[#E7DADD] rounded-3xl p-8 shadow-sm text-center">
        <div className="w-20 h-20 bg-[#B76E79]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Store className="text-[#B76E79]" size={40} />
        </div>
        <h1 className="text-2xl font-bold text-[#292524] mb-3">Gym Store is a Premium feature</h1>
        <p className="text-[#57534E] mb-2">
          Sell gym merchandise, supplements, and accessories directly to your members with the
          <span className="font-bold text-[#B76E79]"> Premium </span>
          plan.
        </p>
        <p className="text-[#57534E] mb-8">
          Your current subscription:{' '}
          <span className="font-bold text-[#292524]">{status?.userEntitlement?.plan || status?.gymEntitlement?.plan || 'Basic'}</span>{' '}
          ({status?.userEntitlement?.status || status?.gymEntitlement?.status || 'Inactive'})
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/admin/subscription"
            className="px-6 py-3 bg-gradient-to-r from-[#B76E79] to-[#9F5965] text-[#FFFFFF] font-bold font-bold rounded-xl shadow-lg shadow-[#B76E79]/15 hover:opacity-90 transition-opacity"
          >
            Upgrade to Premium
          </Link>
          <Link
            to="/admin/dashboard"
            className="px-6 py-3 bg-[#F3E8E8] text-[#57534E] font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentOrders = data?.recentOrders || [];

  const cards = [
    { label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`, icon: IndianRupee, tint: 'bg-[#F3E8E8]/10 text-[#B76E79]', sub: `${stats.onlineOrderCount || 0} online + ${stats.offlineSaleCount || 0} offline` },
    { label: 'Online Sales', value: `₹${(stats.onlineSales || 0).toLocaleString('en-IN')}`, icon: TrendingUp, tint: 'bg-[#F3E8E8] text-[#B76E79]', sub: `${stats.onlineOrderCount || 0} paid orders` },
    { label: 'Offline Sales', value: `₹${(stats.offlineSales || 0).toLocaleString('en-IN')}`, icon: Boxes, tint: 'bg-[#F3E8E8] text-[#B76E79]', sub: `${stats.offlineSaleCount || 0} in-gym sales` },
    { label: 'Products', value: String(stats.activeProducts || 0), icon: Package, tint: 'bg-[#F3E8E8] text-[#B76E79]', sub: `${stats.totalProducts || 0} total` },
    { label: 'Orders', value: String(stats.totalOrders || 0), icon: ShoppingBag, tint: 'bg-[#F3E8E8] text-[#B76E79]', sub: `${stats.pendingOrders || 0} active` },
    { label: 'Low / Out of stock', value: String((stats.lowStockCount || 0) + (stats.outOfStock || 0)), icon: AlertTriangle, tint: 'bg-red-100 text-red-700', sub: `${stats.outOfStock || 0} out, ${stats.lowStockCount || 0} low` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#292524] tracking-tight">Gym Store</h1>
        <p className="text-[#57534E] mt-1">Sell products online and in-gym. Manage your store here.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl p-5 flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-[#57534E] uppercase tracking-wider mb-1">{c.label}</p>
              <h3 className="text-2xl font-black text-[#292524]">{c.value}</h3>
              <p className="text-xs text-[#57534E] mt-1">{c.sub}</p>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.tint}`}>
              <c.icon size={22} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[#E7DADD] flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#292524]">Recent Orders</h3>
            <Link to="/admin/store/orders" className="text-sm font-bold text-[#B76E79] hover:underline flex items-center gap-1">
              View all <ChevronRight size={16} />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="p-10 text-center text-[#57534E]">No orders yet. Share your store with members to get started.</div>
          ) : (
            <div className="divide-y divide-[#E7DADD]">
              {recentOrders.map((o: any) => (
                <div key={o._id} className="flex items-center justify-between px-6 py-4" onClick={() => navigate('/admin/store/orders')}>
                  <div>
                    <p className="font-bold text-[#292524] text-sm">{o.orderNumber}</p>
                    <p className="text-xs text-[#57534E]">{(o.customerId?.firstName || 'Member')} {(o.customerId?.lastName || '')} · {new Date(o.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#B76E79] font-bold">₹{o.total}</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      o.status === 'Completed' ? 'bg-[#F3E8E8]/10 text-[#B76E79]' :
                      o.status === 'Cancelled' || o.status === 'Refunded' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[#292524] mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { label: 'Add Product', path: '/admin/store/products' },
              { label: 'Manage Inventory', path: '/admin/store/inventory' },
              { label: 'Record Offline Sale', path: '/admin/store/offline-sales' },
              { label: 'View Sales', path: '/admin/store/sales' },
            ].map((q) => (
              <Link
                key={q.label}
                to={q.path}
                className="flex items-center justify-between px-4 py-3 bg-[#F3E8E8] rounded-xl hover:bg-[#E7DADD] transition-colors text-[#292524] font-semibold text-sm"
              >
                {q.label} <ChevronRight size={16} className="text-[#B76E79]" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Activity notice strip */}
      <div className="flex items-center gap-3 bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl px-5 py-4 text-sm text-[#57534E]">
        <Bell className="text-[#B76E79]" size={18} />
        <span>
          You'll be notified when members place orders, and when products go low on stock or out of stock.
        </span>
      </div>
    </div>
  );
};

export default GymStoreDashboard;