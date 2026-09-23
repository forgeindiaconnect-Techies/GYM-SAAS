import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Store, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';

const GymStoreSettings = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/store/status')
      .then((res) => setStatus(res.data))
      .catch((err) => { if (err.response?.status === 403) setStatus({ enabled: false }); })
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#34483F]" size={40} /></div>;
  }

  const ent = status?.enabled
    ? (status.userEntitlement?.enabled ? status.userEntitlement : status.gymEntitlement)
    : null;

  const features = [
    'Sell products online to all your members',
    'Digital storefront with product images & categories',
    'Online orders with pickup or delivery',
    'Record in-gym (offline) sales with any payment method',
    'Real-time inventory tracking with low-stock alerts',
    'Sales history, dashboards & CSV export',
    'Automatic order & payment notifications',
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#202522] tracking-tight">Store Settings</h1>
        <p className="text-[#4A514D] mt-1">Gym Store feature status and configuration.</p>
      </div>

      {status?.enabled ? (
        <>
          <div className="bg-white border border-[#DCD9CD] rounded-2xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shrink-0">
              <Store size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#202522] flex items-center gap-2">
                Gym Store is Active <CheckCircle2 size={18} className="text-[#34483F]" />
              </h2>
              <p className="text-[#4A514D] mt-1">
                Your <span className="font-semibold">{ent?.plan}</span> subscription ({ent?.status}) unlocks the full gym store.
                {ent?.expiry && ` Your plan renews/expires on ${new Date(ent.expiry).toLocaleDateString()}.`}
              </p>
              <p className="text-[#4A514D] mt-2 text-sm">
                Show the store to members by adding products, setting stock, and publishing them as <span className="font-semibold">Active</span>{' '}
                with availability set to <span className="font-semibold">Online</span> or <span className="font-semibold">Both</span>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {features.map((f) => (
              <div key={f} className="bg-white border border-[#DCD9CD] rounded-2xl p-4 flex items-start gap-3">
                <CheckCircle2 className="text-[#34483F] shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-[#202522] font-medium">{f}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white border border-[#DCD9CD] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-[#202522] mb-2">Gym Store is not active for your gym</h2>
          <p className="text-[#4A514D] mb-4">
            Upgrade to <span className="font-bold text-[#34483F]">Premium</span> to unlock the full store. Your current plan:{' '}
            <span className="font-semibold">{status?.userEntitlement?.plan || 'Basic'}</span> (
            {status?.userEntitlement?.status || 'Inactive'}).
          </p>
          <Link to="/admin/subscription" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#34483F] to-[#8FA89B] text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:opacity-90 transition-opacity">
            Upgrade to Premium <ArrowRight size={16} />
          </Link>
        </div>
      )}

      <div className="bg-white border border-[#DCD9CD] rounded-2xl p-6">
        <h2 className="text-lg font-bold text-[#202522] mb-3">How the store works</h2>
        <ol className="space-y-3 text-sm text-[#4A514D] list-decimal list-inside pl-1">
          <li>Add products and set stock in <span className="font-semibold">Products</span> and <span className="font-semibold">Inventory</span>.</li>
          <li>Members see your live store in their dashboard and can place orders online.</li>
          <li>You'll get a notification for every new order — advance it through{' '}
            <span className="font-semibold">Orders</span> (Confirmed → Preparing → Ready for Pickup / Out for Delivery → Completed).</li>
          <li>Record counter sales under <span className="font-semibold">Offline Sales</span>; stock is deducted automatically.</li>
          <li>Track everything in <span className="font-semibold">Sales History</span> and the store dashboard. Stock is restored automatically if an order is cancelled or refunded.</li>
        </ol>
      </div>
    </div>
  );
};

export default GymStoreSettings;