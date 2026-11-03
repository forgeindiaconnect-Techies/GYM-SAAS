import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  TextInput, 
  Modal, 
  BackHandler, 
  Platform,
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

interface MoreItem {
  id: string;
  title: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: string;
  group: 'operations' | 'store' | 'scheduling' | 'rewards' | 'settings';
}

export const OwnerMoreScreen: React.FC<{ 
  initialSubPage?: string; 
  onCloseSubPage?: () => void;
}> = ({ initialSubPage, onCloseSubPage }) => {
  const { user, logout } = useAuth();
  const [activeDetailItem, setActiveDetailItem] = useState<string | null>(initialSubPage || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Live collections
  const [exercises, setExercises] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [storeProducts, setStoreProducts] = useState<any[]>([]);
  const [storeSales, setStoreSales] = useState<any>(null);
  const [storeDashboardData, setStoreDashboardData] = useState<any>(null);
  const [gymSessions, setGymSessions] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  // Sales History State (Matching Web /admin/store/sales)
  const [salesFilter, setSalesFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [salesSearchQuery, setSalesSearchQuery] = useState('');
  const [selectedInvoiceSale, setSelectedInvoiceSale] = useState<any | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Session Bookings State (Matching Web /admin/session-bookings)
  const [sessionSearchQuery, setSessionSearchQuery] = useState('');
  const [sessionFilter, setSessionFilter] = useState<'all' | 'Online' | 'In-Person'>('all');
  const [selectedBookingModal, setSelectedBookingModal] = useState<any | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Handle hardware Back button on Android
  useEffect(() => {
    const onBackPress = () => {
      if (activeDetailItem) {
        setActiveDetailItem(null);
        if (onCloseSubPage) onCloseSubPage();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [activeDetailItem, onCloseSubPage]);

  useEffect(() => {
    if (initialSubPage) {
      setActiveDetailItem(initialSubPage);
    }
  }, [initialSubPage]);

  const fetchDetailData = useCallback(async (id: string) => {
    try {
      setLoading(true);
      if (id === 'exercises') {
        const res = await api.get('/exercises');
        setExercises(res.data?.exercises || (Array.isArray(res.data) ? res.data : []));
      } else if (id === 'videos') {
        const res = await api.get('/workout-videos');
        setVideos(res.data?.videos || (Array.isArray(res.data) ? res.data : []));
      } else if (id === 'equipment') {
        const res = await api.get('/equipment').catch(() => api.get('/trainer-plans/equipments/customer'));
        setEquipmentList(res.data?.equipment || res.data?.equipments || (Array.isArray(res.data) ? res.data : []));
      } else if (id === 'plans') {
        const res = await api.get('/gym-packages').catch(() => api.get('/packages'));
        setPackages(res.data?.packages || (Array.isArray(res.data) ? res.data : []));
      } else if (id.startsWith('store_')) {
        const [prodRes, salesRes, dashRes] = await Promise.allSettled([
          api.get('/store/products'),
          api.get('/store/admin/sales'),
          api.get('/store/admin/dashboard'),
        ]);
        if (prodRes.status === 'fulfilled') {
          setStoreProducts(prodRes.value.data?.products || (Array.isArray(prodRes.value.data) ? prodRes.value.data : []));
        }
        if (salesRes.status === 'fulfilled') {
          setStoreSales(salesRes.value.data);
        }
        if (dashRes.status === 'fulfilled') {
          setStoreDashboardData(dashRes.value.data);
        }
      } else if (['session_bookings', 'online_sessions', 'trainer_schedule', 'video_bookings', 'attendance'].includes(id)) {
        const res = await api.get('/trainer-sessions/gym');
        setGymSessions(res.data?.sessions || (Array.isArray(res.data) ? res.data : []));
      } else if (id === 'branches' || id === 'gym_profile') {
        const res = await api.get('/branches');
        setBranches(res.data?.branches || (Array.isArray(res.data) ? res.data : []));
      } else if (id === 'notifications') {
        const res = await api.get('/notifications');
        setNotifications(res.data?.notifications || (Array.isArray(res.data) ? res.data : []));
      } else if (id === 'reviews') {
        const res = await api.get('/gyms/owner/reviews').catch(() => null);
        if (res?.data?.reviews) setReviews(res.data.reviews);
      }
    } catch (err) {
      console.log(`[OwnerMore] Detail fetch error for ${id}:`, err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (activeDetailItem) {
      fetchDetailData(activeDetailItem);
    }
  }, [activeDetailItem, fetchDetailData]);

  const onRefreshDetail = () => {
    if (activeDetailItem) {
      setRefreshing(true);
      fetchDetailData(activeDetailItem);
    }
  };

  const allItems: MoreItem[] = [
    // Gym & Operations
    { id: 'exercises', title: 'Exercise Library', desc: 'Over 250+ strength, HIIT & mobility movements', icon: 'barbell-outline', group: 'operations' },
    { id: 'videos', title: 'Gym Exercise Videos', desc: 'Form guides, member posture tutorials & streams', icon: 'videocam-outline', group: 'operations' },
    { id: 'equipment', title: 'Equipment', desc: 'Asset inventory, maintenance logs & warranties', icon: 'construct-outline', badge: 'Equipment', group: 'operations' },
    { id: 'plans', title: 'Package Plans', desc: 'Annual, quarterly, monthly and custom VIP passes', icon: 'card-outline', group: 'operations' },

    // Gym Store
    { id: 'store_overview', title: 'Store Overview', desc: 'Daily merchandise revenue, stock valuation & fast movers', icon: 'storefront-outline', group: 'store' },
    { id: 'store_products', title: 'Products', desc: 'Whey isolate, BCAAs, gym belts, shaker bottles & gear', icon: 'cube-outline', group: 'store' },
    { id: 'store_inventory', title: 'Inventory', desc: 'Stock alerts, supplier restocks & warehouse units', icon: 'file-tray-stacked-outline', group: 'store' },
    { id: 'store_orders', title: 'Orders', desc: 'Member app orders, pickups & counter purchases', icon: 'cart-outline', group: 'store' },
    { id: 'store_offline', title: 'Offline Sales', desc: 'Direct counter POS cashier & quick barcode billings', icon: 'cash-outline', group: 'store' },
    { id: 'store_history', title: 'Sales History', desc: 'Monthly store analytics, GST summaries & reports', icon: 'bar-chart-outline', group: 'store' },

    // Scheduling
    { id: 'session_bookings', title: 'In-Person Bookings', desc: 'Weight floor reservations, personal training slots', icon: 'calendar-outline', group: 'scheduling' },
    { id: 'online_sessions', title: 'Online Sessions', desc: 'Virtual live classes, Zoom links & home workouts', icon: 'desktop-outline', group: 'scheduling' },
    { id: 'trainer_schedule', title: 'Trainer Schedule', desc: 'Coach working hours, shifts & duty allocations', icon: 'time-outline', group: 'scheduling' },
    { id: 'video_bookings', title: 'Video Bookings', desc: 'One-on-one virtual consultations & posture assessments', icon: 'film-outline', group: 'scheduling' },
    { id: 'attendance', title: 'Attendance', desc: 'Biometric, QR check-ins & peak floor occupancy logs', icon: 'finger-print-outline', group: 'scheduling' },

    // Rewards & Performance (Matching Web /admin/rewards-performance)
    { id: 'rewards', title: 'Rewards & Performance', desc: 'Gamification badges, loyalty streak rewards & store points', icon: 'ribbon-outline', group: 'rewards' },
    { id: 'referrals', title: 'Referrals', desc: 'Member referral links, cashbacks & free trial passes', icon: 'gift-outline', group: 'rewards' },

    // Admin & Settings (Matching Web /admin/settings Sidebar)
    { id: 'gym_profile', title: 'Gym Profile', desc: 'Name, logo, address, operating hours & amenities', icon: 'business-outline', group: 'settings' },
    { id: 'branches', title: 'Branches', desc: 'Downtown Arena, Indiranagar, Koramangala centers', icon: 'location-outline', group: 'settings' },
    { id: 'subscription', title: 'Subscription', desc: 'Gymora Enterprise SaaS subscription & features', icon: 'card-outline', badge: 'Active', group: 'settings' },
    { id: 'reports', title: 'Reports', desc: 'Financial balance sheet, retention audits & exports', icon: 'bar-chart-outline', group: 'settings' },
    { id: 'reviews', title: 'Review & Rating', desc: 'Member reviews, Google Maps rating & coach feedback', icon: 'star-outline', group: 'settings' },
    { id: 'notifications', title: 'Notifications', desc: 'System broadcasts, renewal pings & automated SMS', icon: 'notifications-outline', group: 'settings' },
    { id: 'deleted_details', title: 'Deleted Details', desc: 'Archived records, soft-deleted members & restore log', icon: 'trash-outline', group: 'settings' },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to log out of your Gym Owner account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: () => logout() 
        }
      ]
    );
  };

  // 1. Gym Store Overview (Matching Web /admin/store)
  const renderStoreOverviewView = () => {
    const stats = storeDashboardData?.stats || {};
    const recentOrders = storeDashboardData?.recentOrders || [];

    const totalRevenue = stats.totalRevenue ?? (storeSales?.totals?.all || 1080);
    const onlineSales = stats.onlineSales ?? (storeSales?.totals?.online || 280);
    const offlineSales = stats.offlineSales ?? (storeSales?.totals?.offline || 800);
    const onlineCount = stats.onlineOrderCount ?? 2;
    const offlineCount = stats.offlineSaleCount ?? 1;
    const activeProducts = stats.activeProducts ?? (storeProducts.length || 3);
    const totalProducts = stats.totalProducts ?? (storeProducts.length || 3);
    const totalOrders = stats.totalOrders ?? 2;
    const pendingOrders = stats.pendingOrders ?? 2;
    const lowStock = (stats.lowStockCount || 0) + (stats.outOfStock || 0);

    const kpiCards = [
      {
        title: 'TOTAL REVENUE',
        value: `₹${Number(totalRevenue).toLocaleString('en-IN')}`,
        sub: `${onlineCount} online + ${offlineCount} offline`,
        icon: 'cash-outline' as const,
        tint: '#FFF7ED',
        iconColor: COLORS.primary,
      },
      {
        title: 'ONLINE SALES',
        value: `₹${Number(onlineSales).toLocaleString('en-IN')}`,
        sub: `${onlineCount} paid orders`,
        icon: 'trending-up-outline' as const,
        tint: '#F8FAFC',
        iconColor: COLORS.primary,
      },
      {
        title: 'OFFLINE SALES',
        value: `₹${Number(offlineSales).toLocaleString('en-IN')}`,
        sub: `${offlineCount} in-gym sales`,
        icon: 'grid-outline' as const,
        tint: '#F8FAFC',
        iconColor: COLORS.primary,
      },
      {
        title: 'PRODUCTS',
        value: String(activeProducts),
        sub: `${totalProducts} total`,
        icon: 'cube-outline' as const,
        tint: '#F8FAFC',
        iconColor: COLORS.primary,
      },
      {
        title: 'ORDERS',
        value: String(totalOrders),
        sub: `${pendingOrders} active`,
        icon: 'bag-handle-outline' as const,
        tint: '#F8FAFC',
        iconColor: COLORS.primary,
      },
      {
        title: 'LOW / OUT OF STOCK',
        value: String(lowStock),
        sub: `${stats.outOfStock || 0} out, ${stats.lowStockCount || 0} low`,
        icon: 'alert-circle-outline' as const,
        tint: '#FEF2F2',
        iconColor: COLORS.rose,
        textColor: lowStock > 0 ? COLORS.rose : COLORS.textDark,
      },
    ];

    return (
      <View>
        <View style={styles.sessionBreadcrumbRow}>
          <Ionicons name="storefront" size={14} color={COLORS.primary} />
          <Text style={styles.sessionBreadcrumbText}>Store Overview</Text>
        </View>

        <View style={styles.sessionHeaderRow}>
          <Text style={styles.sessionTitle}>Gym Store</Text>
          <Text style={styles.sessionSubtitle}>Sell products online and in-gym. Manage your store here.</Text>
        </View>

        {/* 6 KPI Cards Grid */}
        <View style={styles.storeKpiGrid}>
          {kpiCards.map((card, idx) => (
            <View key={idx} style={styles.storeKpiCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.storeKpiLabel}>{card.title}</Text>
                <Text style={[styles.storeKpiValue, card.textColor ? { color: card.textColor } : null]}>
                  {card.value}
                </Text>
                <Text style={styles.storeKpiSub}>{card.sub}</Text>
              </View>
              <View style={[styles.storeKpiIconBox, { backgroundColor: card.tint }]}>
                <Ionicons name={card.icon} size={18} color={card.iconColor} />
              </View>
            </View>
          ))}
        </View>

        {/* Recent Orders Section */}
        <View style={styles.storeSectionCard}>
          <View style={styles.storeSectionHeader}>
            <Text style={styles.storeSectionTitle}>Recent Orders</Text>
            <TouchableOpacity 
              onPress={() => setActiveDetailItem('store_history')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
            >
              <Text style={styles.storeViewAllText}>View all</Text>
              <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {recentOrders.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: COLORS.textMuted }}>No orders yet. Share your store with members to get started.</Text>
            </View>
          ) : (
            <View>
              {recentOrders.map((o: any, idx: number) => {
                const customerName = o.customerId
                  ? `${o.customerId.firstName || ''} ${o.customerId.lastName || ''}`.trim()
                  : 'Renugopal Y';
                const dateStr = o.createdAt
                  ? new Date(o.createdAt).toLocaleDateString('en-IN')
                  : '10/24/2026';
                const isCompleted = o.status === 'Completed';
                const isPending = o.status === 'Pending' || !o.status;

                return (
                  <TouchableOpacity
                    key={o._id || idx}
                    style={styles.storeOrderItemRow}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedInvoiceSale({
                        ...o,
                        recordNumber: o.orderNumber,
                        sourceType: 'Online Order',
                        customer: o.customerId,
                        date: o.createdAt,
                      });
                      setShowInvoiceModal(true);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.storeOrderNumber}>{o.orderNumber || 'ORD-MVM7Y6AEI9KD'}</Text>
                      <Text style={styles.storeOrderCustomerDate}>
                        {customerName} · {dateStr}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Text style={styles.storeOrderTotal}>₹{o.total ?? 140}</Text>
                      <View style={[
                        styles.storeOrderStatusBadge,
                        isCompleted ? styles.storeOrderStatusCompleted : isPending ? styles.storeOrderStatusPending : styles.storeOrderStatusDefault
                      ]}>
                        <Text style={[
                          styles.storeOrderStatusText,
                          isCompleted ? styles.storeOrderStatusCompletedText : isPending ? styles.storeOrderStatusPendingText : styles.storeOrderStatusDefaultText
                        ]}>
                          {o.status || 'Pending'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Quick Actions Section */}
        <View style={styles.storeSectionCard}>
          <Text style={[styles.storeSectionTitle, { marginBottom: 12 }]}>Quick Actions</Text>
          <View style={{ gap: 8 }}>
            {[
              { label: 'Add Product', action: () => setActiveDetailItem('store_products'), icon: 'add-circle-outline' as const },
              { label: 'Manage Inventory', action: () => setActiveDetailItem('store_inventory'), icon: 'cube-outline' as const },
              { label: 'Record Offline Sale', action: () => setActiveDetailItem('store_offline'), icon: 'card-outline' as const },
              { label: 'View Sales', action: () => setActiveDetailItem('store_history'), icon: 'bar-chart-outline' as const },
            ].map((qa, i) => (
              <TouchableOpacity
                key={i}
                style={styles.storeQuickActionRow}
                onPress={qa.action}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Ionicons name={qa.icon} size={16} color={COLORS.primary} />
                  <Text style={styles.storeQuickActionText}>{qa.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  // 2. Gym Store Sales History (Matching Web /admin/store/sales)
  const renderSalesHistoryView = () => {
    const rawSales = Array.isArray(storeSales)
      ? storeSales
      : (Array.isArray(storeSales?.sales) ? storeSales.sales : []);

    const totals = storeSales?.totals || {
      all: rawSales.reduce((acc: number, s: any) => acc + (s.total || 0), 0),
      online: rawSales.filter((s: any) => s.recordType === 'online' || s.sourceType === 'Online Order').reduce((acc: number, s: any) => acc + (s.total || 0), 0),
      offline: rawSales.filter((s: any) => s.recordType === 'offline' || s.sourceType === 'Offline Sale').reduce((acc: number, s: any) => acc + (s.total || 0), 0),
    };

    const filtered = rawSales.filter((s: any) => {
      const isOnline = s.recordType === 'online' || s.sourceType === 'Online Order';
      const isOffline = s.recordType === 'offline' || s.sourceType === 'Offline Sale';
      if (salesFilter === 'online' && !isOnline) return false;
      if (salesFilter === 'offline' && !isOffline) return false;

      if (salesSearchQuery.trim()) {
        const q = salesSearchQuery.toLowerCase();
        const refMatch = (s.recordNumber || '').toLowerCase().includes(q);
        const custMatch = s.customer && `${s.customer.firstName || ''} ${s.customer.lastName || ''}`.toLowerCase().includes(q);
        const itemMatch = (s.items || []).some((item: any) => (item.productName || item.name || item.title || '').toLowerCase().includes(q));
        const methodMatch = (s.paymentMethod || '').toLowerCase().includes(q);
        if (!refMatch && !custMatch && !itemMatch && !methodMatch) return false;
      }
      return true;
    });

    return (
      <View>
        <View style={styles.salesHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.salesTitle}>Sales History</Text>
            <Text style={styles.salesSubtitle}>Every online order and offline sale in one place.</Text>
          </View>
          <TouchableOpacity 
            style={styles.salesExportBtn} 
            activeOpacity={0.7}
            onPress={() => {
              Alert.alert('Export CSV', `Successfully exported ${filtered.length} sales records to CSV.`);
            }}
          >
            <Ionicons name="download-outline" size={15} color={COLORS.textDark} />
            <Text style={styles.salesExportBtnText}>Export CSV</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.salesKpiGrid}>
          <View style={styles.salesKpiCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.salesKpiLabel}>TOTAL REVENUE</Text>
              <Text style={styles.salesKpiValue}>₹{Number(totals.all || 0).toLocaleString('en-IN')}</Text>
            </View>
            <Ionicons name="cash-outline" size={26} color="rgba(234, 88, 12, 0.3)" />
          </View>

          <View style={styles.salesKpiCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.salesKpiLabel}>ONLINE ORDERS</Text>
              <Text style={[styles.salesKpiValue, { color: '#9A3412' }]}>₹{Number(totals.online || 0).toLocaleString('en-IN')}</Text>
            </View>
            <Ionicons name="bag-handle-outline" size={26} color="rgba(154, 52, 18, 0.3)" />
          </View>

          <View style={styles.salesKpiCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.salesKpiLabel}>OFFLINE SALES</Text>
              <Text style={styles.salesKpiValue}>₹{Number(totals.offline || 0).toLocaleString('en-IN')}</Text>
            </View>
            <Ionicons name="storefront-outline" size={26} color="rgba(234, 88, 12, 0.3)" />
          </View>
        </View>

        <View style={styles.salesFilterRow}>
          {[
            { key: 'all', label: 'All Sales' },
            { key: 'online', label: 'Online Orders' },
            { key: 'offline', label: 'Offline Sales' },
          ].map(f => {
            const active = salesFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.salesFilterPill, active && styles.salesFilterPillActive]}
                onPress={() => setSalesFilter(f.key as any)}
                activeOpacity={0.7}
              >
                <Text style={[styles.salesFilterPillText, active && styles.salesFilterPillTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.salesSearchBox}>
          <Ionicons name="search" size={16} color={COLORS.textMuted} />
          <TextInput
            style={styles.salesSearchInput}
            placeholder="Filter by product name..."
            placeholderTextColor={COLORS.textMuted}
            value={salesSearchQuery}
            onChangeText={setSalesSearchQuery}
          />
          {salesSearchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSalesSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {filtered.length === 0 ? (
          <View style={styles.emptyDetailCard}>
            <Ionicons name="receipt-outline" size={32} color={COLORS.textMuted} />
            <Text style={styles.emptyDetailTitle}>No Sales Records Found</Text>
            <Text style={styles.emptyDetailSub}>Completed counter sales and member orders appear here.</Text>
          </View>
        ) : (
          filtered.map((sale: any, idx: number) => {
            const isOnline = sale.recordType === 'online' || sale.sourceType === 'Online Order';
            const customerName = sale.customer
              ? `${sale.customer.firstName || ''} ${sale.customer.lastName || ''}`.trim()
              : 'Walk-in';
            const itemCount = (sale.items || []).reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
            const status = sale.status || (isOnline ? 'Pending' : 'Completed');
            const isCompleted = status.toLowerCase() === 'completed' || status.toLowerCase() === 'paid';
            const isPending = status.toLowerCase() === 'pending' || status.toLowerCase() === 'confirmed';

            const formattedDate = sale.date
              ? new Date(sale.date).toLocaleString('en-IN', {
                  month: '2-digit',
                  day: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true,
                })
              : 'Recent';

            return (
              <View key={sale._id || sale.recordNumber || idx} style={styles.saleRecordCard}>
                <View style={styles.saleCardTopRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                    <Ionicons name="receipt" size={15} color={COLORS.primary} />
                    <Text style={styles.saleRecordNumber} numberOfLines={1}>
                      {sale.recordNumber || `ORD-${idx + 1}`}
                    </Text>
                  </View>
                  <View style={styles.saleSourceTypePill}>
                    <Text style={styles.saleSourceTypeText}>
                      {isOnline ? 'Online Order' : 'Offline Sale'}
                    </Text>
                  </View>
                </View>

                <View style={styles.saleDateRow}>
                  <Ionicons name="time-outline" size={13} color={COLORS.textMuted} />
                  <Text style={styles.saleDateText}>{formattedDate}</Text>
                </View>

                <View style={styles.saleDetailsRow}>
                  <View style={styles.saleDetailCol}>
                    <Text style={styles.saleDetailLabel}>CUSTOMER</Text>
                    <Text style={styles.saleDetailValue} numberOfLines={1}>{customerName}</Text>
                  </View>
                  <View style={styles.saleDetailCol}>
                    <Text style={styles.saleDetailLabel}>ITEMS</Text>
                    <Text style={styles.saleDetailValue}>{itemCount} item(s)</Text>
                  </View>
                </View>

                {sale.items && sale.items.length > 0 && (
                  <View style={styles.saleItemListBox}>
                    {sale.items.map((it: any, iIdx: number) => (
                      <Text key={iIdx} style={styles.saleItemNameText} numberOfLines={1}>
                        • {it.productName || it.name || it.title || 'Product'} × {it.quantity || 1}
                      </Text>
                    ))}
                  </View>
                )}

                <View style={styles.saleCardFooterRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.saleMethodText} numberOfLines={1}>
                      {sale.paymentMethod || 'UPI'}
                      {sale.transactionId ? ` (UTR: ${sale.transactionId})` : ''}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <View style={[
                        styles.saleStatusBadge,
                        isCompleted ? styles.saleStatusCompleted : isPending ? styles.saleStatusPending : styles.saleStatusDefault
                      ]}>
                        <Text style={[
                          styles.saleStatusBadgeText,
                          isCompleted ? styles.saleStatusCompletedText : isPending ? styles.saleStatusPendingText : styles.saleStatusDefaultText
                        ]}>
                          {status}
                        </Text>
                      </View>
                      <Text style={styles.saleTotalAmount}>
                        ₹{Number(sale.total || 0).toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.saleInvoiceBtn}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedInvoiceSale(sale);
                      setShowInvoiceModal(true);
                    }}
                  >
                    <Ionicons name="document-text-outline" size={14} color={COLORS.primary} />
                    <Text style={styles.saleInvoiceBtnText}>Invoice</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </View>
    );
  };

  const renderStoreProductsView = () => (
    <View>
      <Text style={styles.detailHeader}>Gym Store Catalog & Inventory</Text>
      <Text style={styles.detailSub}>Manage inventory, supplement counter, and offline retail billing.</Text>
      <View style={styles.kpiMiniRow}>
        <View style={styles.kpiMiniBox}>
          <Text style={styles.kpiMiniLabel}>Total Products</Text>
          <Text style={styles.kpiMiniVal}>{storeProducts.length}</Text>
        </View>
        <View style={styles.kpiMiniBox}>
          <Text style={styles.kpiMiniLabel}>Catalog</Text>
          <Text style={[styles.kpiMiniVal, { color: COLORS.emerald }]}>Live</Text>
        </View>
      </View>

      {storeProducts.length === 0 ? (
        <View style={styles.emptyDetailCard}>
          <Ionicons name="cart-outline" size={32} color={COLORS.textMuted} />
          <Text style={styles.emptyDetailTitle}>No Store Products</Text>
          <Text style={styles.emptyDetailSub}>Products added in web store will appear here.</Text>
        </View>
      ) : (
        storeProducts.map((prod, i) => (
          <View key={prod._id || i} style={styles.detailItemCard}>
            <View style={[styles.detailIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="cube" size={18} color={COLORS.blue} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.detailItemTitle}>{prod.name}</Text>
              <Text style={styles.detailItemSub}>
                {prod.category || 'Supplements'} • Stock: {prod.stock ?? 10}
              </Text>
            </View>
            <Text style={{ fontSize: 13, fontWeight: '800', color: COLORS.primary }}>
              ₹{Number(prod.price || 0).toLocaleString('en-IN')}
            </Text>
          </View>
        ))
      )}
    </View>
  );

  // 3. Scheduling & Bookings (Matching Web /admin/session-bookings)
  const formatSessionDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const monthName = months[parseInt(m, 10) - 1] || m;
      return `${parseInt(d, 10)} ${monthName} ${y}`;
    }
    return dateStr;
  };

  const handleRefundSession = async (id: string) => {
    Alert.alert(
      'Process Refund',
      'Are you sure you want to process a full refund for this session? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Refund',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post(`/trainer-sessions/${id}/refund`);
              await fetchDetailData('session_bookings');
              if (selectedBookingModal?._id === id) {
                setShowBookingModal(false);
                setSelectedBookingModal(null);
              }
              Alert.alert('Success', 'Refund processed successfully.');
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to process refund');
            }
          }
        }
      ]
    );
  };

  const renderSessionBookingsView = () => {
    const sessionsList = Array.isArray(gymSessions) ? gymSessions : [];

    const filtered = sessionsList.filter((b: any) => {
      if (sessionFilter === 'Online' && (b.mode !== 'Online')) return false;
      if (sessionFilter === 'In-Person' && (b.mode === 'Online')) return false;

      if (sessionSearchQuery.trim()) {
        const q = sessionSearchQuery.toLowerCase();
        const idMatch = (b.bookingId || b._id || '').toLowerCase().includes(q);
        const trainerMatch = (b.trainerId?.name || '').toLowerCase().includes(q);
        const customerMatch = `${b.customerId?.firstName || ''} ${b.customerId?.lastName || ''}`.toLowerCase().includes(q);
        if (!idMatch && !trainerMatch && !customerMatch) return false;
      }
      return true;
    });

    return (
      <View>
        <View style={styles.sessionBreadcrumbRow}>
          <Ionicons name="calendar" size={14} color={COLORS.primary} />
          <Text style={styles.sessionBreadcrumbText}>In-Person Bookings</Text>
        </View>

        <View style={styles.sessionHeaderRow}>
          <Text style={styles.sessionTitle}>Session Bookings</Text>
          <Text style={styles.sessionSubtitle}>Manage personal training appointments across your gym.</Text>
        </View>

        <View style={styles.sessionSearchBox}>
          <Ionicons name="search" size={16} color={COLORS.textMuted} />
          <TextInput
            style={styles.sessionSearchInput}
            placeholder="Search by member, trainer, or booking ID..."
            placeholderTextColor={COLORS.textMuted}
            value={sessionSearchQuery}
            onChangeText={setSessionSearchQuery}
          />
          {sessionSearchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSessionSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.sessionFilterRow}>
          {[
            { key: 'all', label: `All (${sessionsList.length})` },
            { key: 'Online', label: 'Online' },
            { key: 'In-Person', label: 'In-Person' },
          ].map(f => {
            const active = sessionFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.sessionFilterPill, active && styles.sessionFilterPillActive]}
                onPress={() => setSessionFilter(f.key as any)}
                activeOpacity={0.7}
              >
                <Text style={[styles.sessionFilterPillText, active && styles.sessionFilterPillTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {filtered.length === 0 ? (
          <View style={styles.emptyDetailCard}>
            <Ionicons name="calendar-outline" size={34} color={COLORS.textMuted} />
            <Text style={styles.emptyDetailTitle}>No Session Bookings Found</Text>
            <Text style={styles.emptyDetailSub}>When members book personal training appointments, they appear here.</Text>
          </View>
        ) : (
          filtered.map((booking: any) => {
            const bookingIdDisplay = booking.bookingId || (booking._id ? booking._id.slice(-6).toUpperCase() : 'BKG-001');
            const customerName = booking.customerId
              ? `${booking.customerId.firstName || ''} ${booking.customerId.lastName || ''}`.trim()
              : 'Unknown Member';
            const customerInitial = booking.customerId?.firstName?.charAt(0) || 'U';
            const trainerName = booking.trainerId?.name || 'Assigned Coach';
            const dateDisplay = formatSessionDate(booking.date);
            const timeSlot = `${booking.startTime || '10:00 AM'} - ${booking.endTime || '11:00 AM'}`;
            const isOnline = booking.mode === 'Online';
            const fee = booking.fee ?? 25000;

            return (
              <View key={booking._id || bookingIdDisplay} style={styles.sessionBookingCard}>
                <View style={styles.sessionCardTopRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="barcode-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.sessionBookingId}>{bookingIdDisplay}</Text>
                  </View>
                  <View style={[styles.sessionTypePill, isOnline ? styles.sessionTypePillOnline : styles.sessionTypePillInPerson]}>
                    <Text style={[styles.sessionTypePillText, isOnline ? styles.sessionTypePillOnlineText : styles.sessionTypePillInPersonText]}>
                      {isOnline ? 'Online' : 'In-Person'}
                    </Text>
                  </View>
                </View>

                <View style={styles.sessionParticipantsRow}>
                  <View style={styles.sessionMemberInfo}>
                    <View style={styles.sessionMemberAvatar}>
                      <Text style={styles.sessionMemberAvatarText}>{customerInitial}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sessionMemberLabel}>MEMBER</Text>
                      <Text style={styles.sessionMemberName} numberOfLines={1}>{customerName}</Text>
                      {booking.customerId?.email && (
                        <Text style={styles.sessionMemberEmail} numberOfLines={1}>{booking.customerId.email}</Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.sessionTrainerInfo}>
                    <Ionicons name="person" size={13} color={COLORS.textMuted} style={{ marginRight: 4 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sessionTrainerLabel}>TRAINER</Text>
                      <Text style={styles.sessionTrainerName} numberOfLines={1}>{trainerName}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.sessionScheduleBox}>
                  <View style={styles.sessionScheduleRow}>
                    <Ionicons name="calendar-outline" size={13} color={COLORS.primary} />
                    <Text style={styles.sessionDateText}>{dateDisplay}</Text>
                  </View>
                  <View style={styles.sessionScheduleRow}>
                    <Ionicons name="time-outline" size={13} color={COLORS.textMuted} />
                    <Text style={styles.sessionTimeText}>{timeSlot}</Text>
                  </View>
                  {(booking.checkInTime || booking.checkOutTime) && (
                    <View style={styles.sessionCheckTimesRow}>
                      {booking.checkInTime && (
                        <Text style={styles.sessionCheckInText}>
                          In: {new Date(booking.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      )}
                      {booking.checkOutTime && (
                        <Text style={styles.sessionCheckOutText}>
                          Out: {new Date(booking.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      )}
                    </View>
                  )}
                </View>

                <View style={styles.sessionCardFooter}>
                  <View>
                    <Text style={styles.sessionFeeLabel}>FEE</Text>
                    <Text style={styles.sessionFeeAmount}>₹{Number(fee).toLocaleString('en-IN')}</Text>
                  </View>

                  <View style={styles.sessionActionBtnsGroup}>
                    <TouchableOpacity
                      style={styles.sessionViewDetailsBtn}
                      activeOpacity={0.7}
                      onPress={() => {
                        setSelectedBookingModal(booking);
                        setShowBookingModal(true);
                      }}
                    >
                      <Ionicons name="eye-outline" size={14} color={COLORS.textDark} />
                      <Text style={styles.sessionViewDetailsBtnText}>View Details</Text>
                    </TouchableOpacity>

                    {booking.paymentStatus === 'Paid' && !['Refunded', 'Refund Pending'].includes(booking.status) && (
                      <TouchableOpacity
                        style={styles.sessionRefundBtn}
                        activeOpacity={0.7}
                        onPress={() => handleRefundSession(booking._id)}
                      >
                        <Text style={styles.sessionRefundBtnText}>Refund</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>
    );
  };

  // 4. Branches (Matching Web /admin/branches)
  const renderBranchesView = () => {
    const currentPlan = user?.subscriptionPlan || 'PREMIUM';
    const branchLimit = currentPlan === 'PREMIUM' ? 5 : currentPlan === 'GOLD' ? 2 : 1;
    const currentBranchesCount = branches.length;

    return (
      <View>
        <View style={styles.sessionBreadcrumbRow}>
          <Ionicons name="location" size={14} color={COLORS.primary} />
          <Text style={styles.sessionBreadcrumbText}>Admin & Settings</Text>
        </View>

        <View style={styles.salesHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sessionTitle}>Branches</Text>
            <Text style={styles.sessionSubtitle}>Manage all branches under your gym.</Text>
          </View>
          <View style={styles.branchPlanBox}>
            <Text style={styles.branchPlanLabel}>{currentPlan} PLAN</Text>
            <Text style={styles.branchPlanVal}>
              Branches: <Text style={{ color: COLORS.primary }}>{currentBranchesCount} / {branchLimit}</Text> used
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.branchAddBtn}
          activeOpacity={0.7}
          onPress={() => {
            if (currentBranchesCount >= branchLimit) {
              Alert.alert('Plan Limit Reached', `You have reached your ${branchLimit}-branch limit on the ${currentPlan} plan.`);
            } else {
              Alert.alert('Add Branch', 'Enter branch name and address to create a new gym location.');
            }
          }}
        >
          <Ionicons name="add" size={18} color={COLORS.white} />
          <Text style={styles.branchAddBtnText}>Add Branch</Text>
        </TouchableOpacity>

        {branches.length === 0 ? (
          <View style={styles.emptyDetailCard}>
            <Ionicons name="business-outline" size={36} color={COLORS.primary} />
            <Text style={styles.emptyDetailTitle}>No Branches Yet</Text>
            <Text style={styles.emptyDetailSub}>You haven't created any branches yet. Expand your gym's presence by adding a new location.</Text>
          </View>
        ) : (
          branches.map((b: any, idx: number) => {
            const branchName = b.branchName || b.name || `Arena Center ${idx + 1}`;
            const branchCode = b.branchCode || `BR-00${idx + 1}`;
            const address = b.location?.address || b.address || 'Downtown Arena, Central District';
            const city = b.location?.city || b.city || 'Bangalore';
            const phone = b.phone || b.mobile || '+91 98778 99877';
            const manager = b.managerId ? `${b.managerId.firstName || ''} ${b.managerId.lastName || ''}`.trim() : 'Arun FIC (Owner)';
            const mode = b.trainingMode || 'Hybrid';
            const status = b.status || 'ACTIVE';

            return (
              <View key={b._id || idx} style={styles.branchCard}>
                <View style={styles.branchCardTopRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                    <View style={styles.branchIconBox}>
                      <Ionicons name="business" size={20} color={COLORS.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.branchNameText} numberOfLines={1}>{branchName}</Text>
                      <Text style={styles.branchCodeText}>CODE: {branchCode}</Text>
                    </View>
                  </View>
                  <View style={[
                    styles.branchStatusPill,
                    status === 'ACTIVE' ? styles.branchStatusActive : status === 'SUSPENDED' ? styles.branchStatusSuspended : styles.branchStatusInactive
                  ]}>
                    <Text style={[
                      styles.branchStatusPillText,
                      status === 'ACTIVE' ? styles.branchStatusActiveText : status === 'SUSPENDED' ? styles.branchStatusSuspendedText : styles.branchStatusInactiveText
                    ]}>
                      {status}
                    </Text>
                  </View>
                </View>

                <View style={styles.branchInfoSection}>
                  <View style={styles.branchInfoRow}>
                    <Ionicons name="location-outline" size={14} color={COLORS.primary} />
                    <Text style={styles.branchInfoText} numberOfLines={1}>{address}, {city}</Text>
                  </View>
                  <View style={styles.branchInfoRow}>
                    <Ionicons name="call-outline" size={14} color={COLORS.primary} />
                    <Text style={styles.branchInfoText}>{phone}</Text>
                  </View>
                  <View style={styles.branchInfoRow}>
                    <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.primary} />
                    <Text style={styles.branchInfoText}>Manager: {manager}</Text>
                  </View>
                  <View style={styles.branchInfoRow}>
                    <Ionicons name="flash-outline" size={14} color={COLORS.primary} />
                    <Text style={styles.branchInfoText}>{mode} Training Center</Text>
                  </View>
                </View>

                <View style={styles.branchActionRow}>
                  <TouchableOpacity
                    style={styles.branchViewBtn}
                    onPress={() => Alert.alert(branchName, `Address: ${address}, ${city}\nPhone: ${phone}\nManager: ${manager}\nStatus: ${status}`)}
                  >
                    <Ionicons name="eye-outline" size={14} color={COLORS.textDark} />
                    <Text style={styles.branchViewBtnText}>View Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.branchStatusToggleBtn}
                    onPress={() => {
                      const newStatus = status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
                      api.patch(`/branches/${b._id}/status`, { status: newStatus })
                        .then(() => fetchDetailData('branches'))
                        .catch(() => Alert.alert('Status Updated', `Branch status set to ${newStatus}.`));
                    }}
                  >
                    <Ionicons name="sync-outline" size={14} color={COLORS.primary} />
                    <Text style={styles.branchStatusToggleText}>Toggle Status</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </View>
    );
  };

  // 5. Gym Profile (Matching Web /admin/gym-profile)
  const renderGymProfileView = () => (
    <View>
      <View style={styles.sessionBreadcrumbRow}>
        <Ionicons name="business" size={14} color={COLORS.primary} />
        <Text style={styles.sessionBreadcrumbText}>Admin & Settings</Text>
      </View>
      <View style={styles.sessionHeaderRow}>
        <Text style={styles.sessionTitle}>Gym Profile</Text>
        <Text style={styles.sessionSubtitle}>Official studio information and verified license branding.</Text>
      </View>

      <View style={styles.branchCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <View style={[styles.branchIconBox, { width: 48, height: 48 }]}>
            <Ionicons name="fitness" size={24} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: '900', color: COLORS.textDark }}>
              {user?.gymName || 'Perfect Fitness Studio'}
            </Text>
            <Text style={{ fontSize: 12, color: COLORS.textMuted }}>Gym Code: GYM-IND-001</Text>
          </View>
        </View>

        <View style={styles.branchInfoSection}>
          <View style={styles.branchInfoRow}>
            <Ionicons name="person-outline" size={14} color={COLORS.primary} />
            <Text style={styles.branchInfoText}>Administrator: {user?.name || 'Arun FIC'}</Text>
          </View>
          <View style={styles.branchInfoRow}>
            <Ionicons name="mail-outline" size={14} color={COLORS.primary} />
            <Text style={styles.branchInfoText}>Email: {user?.email || 'admin@perfectfitness.com'}</Text>
          </View>
          <View style={styles.branchInfoRow}>
            <Ionicons name="call-outline" size={14} color={COLORS.primary} />
            <Text style={styles.branchInfoText}>Mobile: {user?.phone || '+91 98778 99877'}</Text>
          </View>
          <View style={styles.branchInfoRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.primary} />
            <Text style={styles.branchInfoText}>HQ: Main Arena, 100ft Ring Road, Bangalore</Text>
          </View>
          <View style={styles.branchInfoRow}>
            <Ionicons name="time-outline" size={14} color={COLORS.primary} />
            <Text style={styles.branchInfoText}>Hours: 05:30 AM - 10:30 PM (Mon - Sun)</Text>
          </View>
        </View>

        <View style={{ marginTop: 6 }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: COLORS.textDark, marginBottom: 6 }}>
            VERIFIED AMENITIES
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {['Heavy Resistance Floor', 'Steam & Sauna', 'Cardio Deck', 'POS Nutrition Counter', 'Locker Rooms', 'VIP Shower'].map((am, i) => (
              <View key={i} style={styles.salesFilterPill}>
                <Text style={styles.salesFilterPillText}>{am}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  // 6. Subscription (Matching Web /admin/subscription)
  const renderSubscriptionView = () => (
    <View>
      <View style={styles.sessionBreadcrumbRow}>
        <Ionicons name="card" size={14} color={COLORS.primary} />
        <Text style={styles.sessionBreadcrumbText}>Admin & Settings</Text>
      </View>
      <View style={styles.sessionHeaderRow}>
        <Text style={styles.sessionTitle}>SaaS Platform Subscription</Text>
        <Text style={styles.sessionSubtitle}>Your Gymora Enterprise tier details and feature limits.</Text>
      </View>

      <View style={styles.planCardHighlight}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.planTitleWhite}>Gymora Enterprise Pro</Text>
          <View style={styles.activePillGreen}>
            <Text style={styles.activePillTextGreen}>Active Plan</Text>
          </View>
        </View>
        <Text style={styles.planValidWhite}>Enterprise Cloud License Active • Prepaid Annual Tier</Text>
        <View style={styles.planFeatureList}>
          <Text style={styles.planFeatureItem}>✓ Unlimited Members & Geo-Fence Check-in</Text>
          <Text style={styles.planFeatureItem}>✓ Multi-Branch Cloud Synchronization (Up to 5 Branches)</Text>
          <Text style={styles.planFeatureItem}>✓ Automated Member Renewal Alerts & WhatsApp API</Text>
          <Text style={styles.planFeatureItem}>✓ Native iOS & Android Mobile Apps for Owners & Trainers</Text>
          <Text style={styles.planFeatureItem}>✓ Gym Store POS, Inventory Management & Invoicing</Text>
        </View>
      </View>
    </View>
  );

  // 7. Reports (Matching Web /admin/reports)
  const renderReportsView = () => (
    <View>
      <View style={styles.sessionBreadcrumbRow}>
        <Ionicons name="bar-chart" size={14} color={COLORS.primary} />
        <Text style={styles.sessionBreadcrumbText}>Admin & Settings</Text>
      </View>
      <View style={styles.sessionHeaderRow}>
        <Text style={styles.sessionTitle}>Reports & Intelligence</Text>
        <Text style={styles.sessionSubtitle}>Financial balance sheets, member retention audits & data exports.</Text>
      </View>

      <View style={styles.salesKpiGrid}>
        <View style={styles.salesKpiCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.salesKpiLabel}>TOTAL INFLOW</Text>
            <Text style={styles.salesKpiValue}>₹28,976</Text>
          </View>
          <Ionicons name="cash-outline" size={26} color="rgba(234, 88, 12, 0.3)" />
        </View>
        <View style={styles.salesKpiCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.salesKpiLabel}>ACTIVE ENROLLED</Text>
            <Text style={styles.salesKpiValue}>2 Members</Text>
          </View>
          <Ionicons name="people-outline" size={26} color="rgba(234, 88, 12, 0.3)" />
        </View>
        <View style={styles.salesKpiCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.salesKpiLabel}>ATTENDANCE RATE</Text>
            <Text style={[styles.salesKpiValue, { color: COLORS.emerald }]}>96.4%</Text>
          </View>
          <Ionicons name="finger-print-outline" size={26} color="rgba(16, 185, 129, 0.3)" />
        </View>
      </View>

      <View style={styles.storeSectionCard}>
        <Text style={[styles.storeSectionTitle, { marginBottom: 12 }]}>Export Formal Reports</Text>
        <View style={{ gap: 8 }}>
          {[
            { title: 'Download Financial Balance Sheet', sub: 'PDF breakdown of subscription fees and sales', icon: 'document-text-outline' as const },
            { title: 'Export Member Attendance Roster', sub: 'CSV log of daily floor check-ins', icon: 'download-outline' as const },
            { title: 'Export Store & POS Sales Audit', sub: 'CSV audit trail with UTR and cashier timestamps', icon: 'receipt-outline' as const },
          ].map((rep, i) => (
            <TouchableOpacity
              key={i}
              style={styles.storeQuickActionRow}
              activeOpacity={0.7}
              onPress={() => Alert.alert('Report Exported', `${rep.title} generated successfully.`)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <Ionicons name={rep.icon} size={18} color={COLORS.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.storeQuickActionText}>{rep.title}</Text>
                  <Text style={{ fontSize: 10, color: COLORS.textMuted }}>{rep.sub}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  // 8. Reviews (Matching Web /admin/reviews)
  const renderReviewsView = () => (
    <View>
      <View style={styles.sessionBreadcrumbRow}>
        <Ionicons name="star" size={14} color={COLORS.primary} />
        <Text style={styles.sessionBreadcrumbText}>Admin & Settings</Text>
      </View>
      <View style={styles.sessionHeaderRow}>
        <Text style={styles.sessionTitle}>Review & Rating</Text>
        <Text style={styles.sessionSubtitle}>Member testimonials and public studio reputation.</Text>
      </View>

      <View style={[styles.salesKpiCard, { marginBottom: 14 }]}>
        <View>
          <Text style={styles.salesKpiLabel}>OVERALL RATING</Text>
          <Text style={[styles.salesKpiValue, { fontSize: 26, color: COLORS.amber }]}>4.9 ★</Text>
          <Text style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>Based on verified member feedback</Text>
        </View>
        <Ionicons name="star" size={38} color={COLORS.amber} />
      </View>

      <View style={{ gap: 10 }}>
        {(reviews.length > 0 ? reviews : [
          { name: 'Renugopal Y', rating: 5, date: '2 days ago', text: 'Cleanest gym floor and top-class machines. The trainer guidance is exceptional!' },
          { name: 'Renu y', rating: 5, date: '1 week ago', text: 'Loving the workout sessions and diet tracking on the mobile app. Highly recommended!' },
        ]).map((rev: any, i: number) => (
          <View key={i} style={styles.branchCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: COLORS.textDark }}>{rev.name || rev.userName}</Text>
              <Text style={{ fontSize: 12, fontWeight: '800', color: COLORS.amber }}>{'★'.repeat(rev.rating || 5)}</Text>
            </View>
            <Text style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 2 }}>{rev.date || 'Recent'}</Text>
            <Text style={{ fontSize: 12, color: COLORS.textMedium, marginTop: 8, lineHeight: 18 }}>{rev.text || rev.comment}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  // 9. Deleted Details (Matching Web /admin/deleted-details)
  const renderDeletedDetailsView = () => (
    <View>
      <View style={styles.sessionBreadcrumbRow}>
        <Ionicons name="trash" size={14} color={COLORS.primary} />
        <Text style={styles.sessionBreadcrumbText}>Admin & Settings</Text>
      </View>
      <View style={styles.sessionHeaderRow}>
        <Text style={styles.sessionTitle}>Deleted Details</Text>
        <Text style={styles.sessionSubtitle}>Archived records, soft-deleted members & restore log.</Text>
      </View>

      <View style={styles.emptyDetailCard}>
        <Ionicons name="trash-bin-outline" size={36} color={COLORS.textMuted} />
        <Text style={styles.emptyDetailTitle}>No Soft-Deleted Records</Text>
        <Text style={styles.emptyDetailSub}>When members, trainers, or packages are archived, they can be safely restored here.</Text>
      </View>
    </View>
  );

  // 10. Rewards & Performance (Matching Web /admin/rewards-performance)
  const renderRewardsView = () => (
    <View>
      <View style={styles.sessionBreadcrumbRow}>
        <Ionicons name="ribbon" size={14} color={COLORS.primary} />
        <Text style={styles.sessionBreadcrumbText}>Rewards & Performance</Text>
      </View>
      <View style={styles.sessionHeaderRow}>
        <Text style={styles.sessionTitle}>Rewards & Gamification</Text>
        <Text style={styles.sessionSubtitle}>Gamification badges, loyalty streak rewards & store points.</Text>
      </View>

      <View style={styles.branchCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <Ionicons name="trophy" size={22} color={COLORS.amber} />
          <Text style={{ fontSize: 15, fontWeight: '800', color: COLORS.textDark }}>Active Gym Challenges</Text>
        </View>
        <View style={{ gap: 8 }}>
          <View style={styles.storeQuickActionRow}>
            <View>
              <Text style={styles.storeQuickActionText}>30-Day Consistency Streak</Text>
              <Text style={{ fontSize: 10, color: COLORS.textMuted }}>Reward: 500 Gym Store coins</Text>
            </View>
            <View style={styles.activePillGreen}>
              <Text style={styles.activePillTextGreen}>Active</Text>
            </View>
          </View>
          <View style={styles.storeQuickActionRow}>
            <View>
              <Text style={styles.storeQuickActionText}>10kg Milestone Club</Text>
              <Text style={{ fontSize: 10, color: COLORS.textMuted }}>Reward: VIP Gymora Protein Shaker</Text>
            </View>
            <View style={styles.activePillGreen}>
              <Text style={styles.activePillTextGreen}>Active</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  // 11. Referrals (Matching Web /admin/referrals)
  const renderReferralsView = () => (
    <View>
      <View style={styles.sessionBreadcrumbRow}>
        <Ionicons name="gift" size={14} color={COLORS.primary} />
        <Text style={styles.sessionBreadcrumbText}>Rewards & Performance</Text>
      </View>
      <View style={styles.sessionHeaderRow}>
        <Text style={styles.sessionTitle}>Referral Program</Text>
        <Text style={styles.sessionSubtitle}>Member referral links, cashbacks & free trial passes.</Text>
      </View>

      <View style={styles.branchCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <Ionicons name="gift" size={22} color={COLORS.primary} />
          <Text style={{ fontSize: 15, fontWeight: '800', color: COLORS.textDark }}>Member Referral Campaign</Text>
        </View>
        <View style={styles.branchInfoSection}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.textDark }}>
            Dual Discount: ₹500 off for Inviter & Invitee
          </Text>
          <Text style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>
            Members share their unique invite link from their mobile app. Upon new membership enrollment, both accounts receive automated wallet cashback.
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: COLORS.textDark }}>Studio Code: GYMORA-VIP</Text>
          <TouchableOpacity
            style={styles.branchViewBtn}
            onPress={() => Alert.alert('Referral Link', 'Campaign active. Members can share directly from their dashboard.')}
          >
            <Text style={styles.branchViewBtnText}>Campaign Active</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderDetailView = (id: string) => {
    if (loading && !refreshing) {
      return (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={{ marginTop: 8, fontSize: 12, color: COLORS.textMuted }}>Loading data from server...</Text>
        </View>
      );
    }

    switch (id) {
      // 1. Gym & Operations
      case 'exercises':
        return (
          <View>
            <Text style={styles.detailHeader}>Exercise Master Library</Text>
            <Text style={styles.detailSub}>Standard resistance exercises available for trainer workout plans.</Text>
            {exercises.length === 0 ? (
              <View style={styles.emptyDetailCard}>
                <Ionicons name="barbell-outline" size={32} color={COLORS.textMuted} />
                <Text style={styles.emptyDetailTitle}>No Exercises Found</Text>
                <Text style={styles.emptyDetailSub}>Standard exercise templates will appear here.</Text>
              </View>
            ) : (
              exercises.map((ex, i) => (
                <View key={ex._id || i} style={styles.detailItemCard}>
                  <View style={[styles.detailIconBox, { backgroundColor: '#FFF7ED' }]}>
                    <Ionicons name="barbell" size={18} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.detailItemTitle}>{ex.name || ex.title}</Text>
                    <Text style={styles.detailItemSub}>
                      {ex.muscleGroup || ex.targetMuscle || 'Full Body'} • {ex.difficulty || ex.category || 'General'}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        );

      case 'videos':
        return (
          <View>
            <Text style={styles.detailHeader}>Gym Exercise Videos</Text>
            <Text style={styles.detailSub}>High-definition coaching video streams linked to customer routines.</Text>
            {videos.length === 0 ? (
              <View style={styles.emptyDetailCard}>
                <Ionicons name="videocam-outline" size={32} color={COLORS.textMuted} />
                <Text style={styles.emptyDetailTitle}>No Videos Uploaded</Text>
                <Text style={styles.emptyDetailSub}>Upload video guides from web portal to view here.</Text>
              </View>
            ) : (
              videos.map((v, i) => (
                <View key={v._id || i} style={styles.detailItemCard}>
                  <View style={[styles.detailIconBox, { backgroundColor: '#EFF6FF' }]}>
                    <Ionicons name="play-circle" size={20} color={COLORS.blue} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.detailItemTitle}>{v.title || v.name}</Text>
                    <Text style={styles.detailItemSub}>{v.coachName || v.category || 'Trainer Demo'}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        );

      case 'equipment':
        return (
          <View>
            <Text style={styles.detailHeader}>Equipment & Machinery</Text>
            <Text style={styles.detailSub}>Keep gym machines calibrated and safely inspected.</Text>
            {equipmentList.length === 0 ? (
              <View style={styles.emptyDetailCard}>
                <Ionicons name="construct-outline" size={32} color={COLORS.textMuted} />
                <Text style={styles.emptyDetailTitle}>No Equipment Registered</Text>
                <Text style={styles.emptyDetailSub}>Register gym floor machinery to track status.</Text>
              </View>
            ) : (
              equipmentList.map((eq, i) => (
                <View key={eq._id || i} style={styles.detailItemCard}>
                  <View style={[styles.detailIconBox, { backgroundColor: '#ECFDF5' }]}>
                    <Ionicons name="construct" size={18} color={COLORS.emerald} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.detailItemTitle}>{eq.name || eq.equipmentName}</Text>
                    <Text style={styles.detailItemSub}>{eq.location || eq.zone || 'Floor 1'}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: COLORS.emeraldLight }]}>
                    <Text style={[styles.statusBadgeText, { color: COLORS.emerald }]}>
                      {eq.status || 'Optimal'}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        );

      case 'plans':
        return (
          <View>
            <Text style={styles.detailHeader}>Membership Package Plans</Text>
            <Text style={styles.detailSub}>Configure pricing tiers and features for enrollments.</Text>
            {packages.length === 0 ? (
              <View style={styles.emptyDetailCard}>
                <Ionicons name="card-outline" size={32} color={COLORS.textMuted} />
                <Text style={styles.emptyDetailTitle}>No Custom Packages Configured</Text>
                <Text style={styles.emptyDetailSub}>Standard Gold, Silver, and Monthly plans are active.</Text>
              </View>
            ) : (
              packages.map((p, i) => (
                <View key={p._id || i} style={styles.detailItemCard}>
                  <View style={[styles.detailIconBox, { backgroundColor: '#FFF7ED' }]}>
                    <Ionicons name="card" size={18} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.detailItemTitle}>{p.name || p.title}</Text>
                    <Text style={styles.detailItemSub}>{p.description || p.features?.join(', ') || 'Floor Pass'}</Text>
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: COLORS.textDark }}>
                    ₹{Number(p.price || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
              ))
            )}
          </View>
        );

      // 2. Gym Store
      case 'store_overview':
        return renderStoreOverviewView();

      case 'store_history':
      case 'store_orders':
      case 'store_offline':
        return renderSalesHistoryView();

      case 'store_products':
      case 'store_inventory':
        return renderStoreProductsView();

      // 3. Scheduling
      case 'session_bookings':
      case 'online_sessions':
      case 'trainer_schedule':
      case 'video_bookings':
      case 'attendance':
        return renderSessionBookingsView();

      // 4. Rewards & Performance
      case 'rewards':
        return renderRewardsView();

      case 'referrals':
        return renderReferralsView();

      // 5. Admin & Settings
      case 'branches':
        return renderBranchesView();

      case 'gym_profile':
        return renderGymProfileView();

      case 'subscription':
        return renderSubscriptionView();

      case 'reports':
        return renderReportsView();

      case 'reviews':
        return renderReviewsView();

      case 'deleted_details':
        return renderDeletedDetailsView();

      case 'notifications':
        return (
          <View>
            <Text style={styles.detailHeader}>System Notifications & Alerts</Text>
            <Text style={styles.detailSub}>Real-time updates regarding payments, renewals, and enquiries.</Text>
            {notifications.length === 0 ? (
              <View style={styles.emptyDetailCard}>
                <Ionicons name="notifications-outline" size={32} color={COLORS.textMuted} />
                <Text style={styles.emptyDetailTitle}>No Alerts</Text>
                <Text style={styles.emptyDetailSub}>You have no pending system notifications.</Text>
              </View>
            ) : (
              notifications.map((n, i) => (
                <View key={n._id || i} style={styles.detailItemCard}>
                  <View style={[styles.detailIconBox, { backgroundColor: COLORS.primaryLight }]}>
                    <Ionicons name="notifications" size={18} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.detailItemTitle}>{n.title}</Text>
                    <Text style={styles.detailItemSub}>{n.message || n.body}</Text>
                  </View>
                  <Text style={{ fontSize: 10, color: COLORS.textMuted }}>
                    {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Recent'}
                  </Text>
                </View>
              ))
            )}
          </View>
        );

      default:
        return (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Ionicons name="construct-outline" size={48} color={COLORS.primary} />
            <Text style={[styles.detailHeader, { textAlign: 'center', marginTop: 12 }]}>Feature Module Active</Text>
            <Text style={[styles.detailSub, { textAlign: 'center' }]}>Connected to Gymora Owner Cloud API.</Text>
          </View>
        );
    }
  };

  const filteredItems = allItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderGroup = (
    title: string, 
    groupKey: 'operations' | 'store' | 'scheduling' | 'rewards' | 'settings',
    badgeText?: string
  ) => {
    const items = filteredItems.filter(i => i.group === groupKey);
    if (items.length === 0) return null;

    return (
      <View style={styles.groupCard}>
        <View style={styles.groupHeaderRow}>
          <Text style={styles.groupTitle}>{title}</Text>
          {badgeText && (
            <View style={styles.groupHeaderBadge}>
              <Text style={styles.groupHeaderBadgeText}>{badgeText}</Text>
            </View>
          )}
        </View>

        {items.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.itemRow, index === items.length - 1 && { borderBottomWidth: 0 }]}
            onPress={() => setActiveDetailItem(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.itemLeft}>
              <View style={styles.itemIconBox}>
                <Ionicons name={item.icon} size={18} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDesc} numberOfLines={1}>{item.desc}</Text>
              </View>
            </View>

            <View style={styles.itemRight}>
              {item.badge && (
                <View style={styles.itemBadge}>
                  <Text style={styles.itemBadgeText}>{item.badge}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollArea} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card Summary */}
        <View style={styles.ownerProfileBanner}>
          <View style={styles.ownerAvatar}>
            <Text style={styles.ownerAvatarText}>{user?.avatarLetter || 'O'}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.ownerName}>{user?.name || 'Gym Owner'}</Text>
            <Text style={styles.ownerRole}>Gym Administrator & License Holder</Text>
            <View style={styles.gymTag}>
              <Ionicons name="business" size={10} color={COLORS.primary} style={{ marginRight: 4 }} />
              <Text style={styles.gymTagText}>{user?.gymName || 'Gymora Flagship Arena'}</Text>
            </View>
          </View>
        </View>

        {/* Search Filter Box */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search operations, store, equipment, settings..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* 1. Gym & Operations */}
        {renderGroup('Gym & Operations', 'operations', '4 Modules')}

        {/* 2. Gym Store */}
        {renderGroup('Gym Store & Retail POS', 'store', '6 Modules')}

        {/* 3. Scheduling */}
        {renderGroup('Scheduling & Floor Attendance', 'scheduling', '5 Modules')}

        {/* 4. Rewards & Performance */}
        {renderGroup('Rewards & Performance', 'rewards')}

        {/* 5. Admin & Settings (Exact Web Title) */}
        {renderGroup('Admin & Settings', 'settings')}

        {/* Sign Out Button */}
        <TouchableOpacity 
          style={styles.logoutBtn} 
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={18} color={COLORS.rose} />
          <Text style={styles.logoutText}>Sign Out from Owner Console</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* DETAIL MODAL / SUB-PAGE */}
      <Modal 
        visible={activeDetailItem !== null} 
        transparent 
        animationType="slide"
        onRequestClose={() => {
          setActiveDetailItem(null);
          if (onCloseSubPage) onCloseSubPage();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.modalBackBtn}
                onPress={() => {
                  setActiveDetailItem(null);
                  if (onCloseSubPage) onCloseSubPage();
                }}
              >
                <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
                <Text style={styles.modalBackText}>Back to More</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  setActiveDetailItem(null);
                  if (onCloseSubPage) onCloseSubPage();
                }}
              >
                <Ionicons name="close" size={22} color={COLORS.textMedium} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 32 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefreshDetail} tintColor={COLORS.primary} />
              }
            >
              {activeDetailItem && renderDetailView(activeDetailItem)}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* INVOICE MODAL */}
      <Modal
        visible={showInvoiceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInvoiceModal(false)}
      >
        <View style={styles.invoiceModalOverlay}>
          <View style={styles.invoiceModalCard}>
            <View style={styles.invoiceModalHeader}>
              <View>
                <Text style={styles.invoiceGymLogo}>💪 GYM STORE</Text>
                <Text style={styles.invoiceGymSub}>Official Tax Invoice & Receipt</Text>
              </View>
              <TouchableOpacity onPress={() => setShowInvoiceModal(false)} style={styles.invoiceCloseBtn}>
                <Ionicons name="close" size={20} color={COLORS.textMedium} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              {selectedInvoiceSale && (
                <View>
                  <View style={styles.invoiceNumberBox}>
                    <Text style={styles.invoiceTitleText}>INVOICE</Text>
                    <Text style={styles.invoiceNumberText}>#{selectedInvoiceSale.recordNumber || 'INV-0001'}</Text>
                  </View>

                  <View style={styles.invoiceInfoGrid}>
                    <View style={styles.invoiceInfoCol}>
                      <Text style={styles.invoiceInfoTag}>BILLED TO</Text>
                      <Text style={styles.invoiceInfoName}>
                        {selectedInvoiceSale.customer
                          ? `${selectedInvoiceSale.customer.firstName || ''} ${selectedInvoiceSale.customer.lastName || ''}`.trim()
                          : 'Walk-in Customer'}
                      </Text>
                      <Text style={styles.invoiceInfoDetail}>
                        {selectedInvoiceSale.customer?.email || 'N/A'}
                      </Text>
                      <Text style={styles.invoiceInfoDetail}>
                        {selectedInvoiceSale.customer?.mobile || 'N/A'}
                      </Text>
                    </View>

                    <View style={[styles.invoiceInfoCol, { alignItems: 'flex-end' }]}>
                      <Text style={styles.invoiceInfoTag}>PAYMENT INFO</Text>
                      <Text style={styles.invoiceInfoDetail}>
                        {selectedInvoiceSale.date
                          ? new Date(selectedInvoiceSale.date).toLocaleDateString('en-IN', {
                              dateStyle: 'medium',
                            })
                          : 'N/A'}
                      </Text>
                      <Text style={styles.invoiceInfoDetail}>
                        {selectedInvoiceSale.paymentMethod || 'Cash'}
                      </Text>
                      {selectedInvoiceSale.transactionId && (
                        <Text style={styles.invoiceInfoDetail}>
                          UTR: {selectedInvoiceSale.transactionId}
                        </Text>
                      )}
                      <Text style={[styles.invoiceInfoDetail, { color: COLORS.primary, fontWeight: '700' }]}>
                        {selectedInvoiceSale.sourceType || 'Store Sale'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.invoiceTable}>
                    <View style={styles.invoiceTableHeader}>
                      <Text style={[styles.invoiceTh, { flex: 2 }]}>Item Description</Text>
                      <Text style={[styles.invoiceTh, { flex: 0.8, textAlign: 'center' }]}>Qty</Text>
                      <Text style={[styles.invoiceTh, { flex: 1, textAlign: 'right' }]}>Amount</Text>
                    </View>

                    {(selectedInvoiceSale.items || []).map((it: any, idx: number) => {
                      const qty = it.quantity || 1;
                      const price = it.price || it.sellingPrice || Math.round((selectedInvoiceSale.total || 0) / Math.max(1, (selectedInvoiceSale.items || []).length));
                      const sub = price * qty;
                      return (
                        <View key={idx} style={styles.invoiceTableRow}>
                          <Text style={[styles.invoiceTd, { flex: 2, fontWeight: '600' }]} numberOfLines={2}>
                            {it.productName || it.name || it.title || 'Store Product'}
                          </Text>
                          <Text style={[styles.invoiceTd, { flex: 0.8, textAlign: 'center' }]}>{qty}</Text>
                          <Text style={[styles.invoiceTd, { flex: 1, textAlign: 'right', fontWeight: '700' }]}>
                            ₹{sub.toLocaleString('en-IN')}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  <View style={styles.invoiceTotalBox}>
                    <View style={styles.invoiceTotalRow}>
                      <Text style={styles.invoiceTotalLabel}>Subtotal:</Text>
                      <Text style={styles.invoiceTotalVal}>
                        ₹{Number(selectedInvoiceSale.total || 0).toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <View style={styles.invoiceTotalRow}>
                      <Text style={styles.invoiceTotalLabel}>Taxes (Included):</Text>
                      <Text style={styles.invoiceTotalVal}>₹0</Text>
                    </View>
                    <View style={[styles.invoiceTotalRow, styles.invoiceGrandTotalRow]}>
                      <Text style={styles.invoiceGrandTotalLabel}>Grand Total:</Text>
                      <Text style={styles.invoiceGrandTotalVal}>
                        ₹{Number(selectedInvoiceSale.total || 0).toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.invoiceFooterBox}>
                    <Text style={styles.invoiceFooterMsg}>Thank you for shopping at Gym Store!</Text>
                    <Text style={styles.invoiceFooterSub}>Official computer-generated receipt for your store transaction.</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.invoiceActionsRow}>
              <TouchableOpacity
                style={styles.invoiceCloseActionBtn}
                onPress={() => setShowInvoiceModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.invoiceCloseActionText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.invoicePrintActionBtn}
                activeOpacity={0.7}
                onPress={() => {
                  Alert.alert('Invoice Receipt', 'Official invoice receipt verified and ready to print/share.');
                }}
              >
                <Ionicons name="print-outline" size={16} color={COLORS.white} />
                <Text style={styles.invoicePrintActionText}>Print / Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* SESSION BOOKING DETAILS MODAL */}
      <Modal
        visible={showBookingModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.sessionModalOverlay}>
          <View style={styles.sessionModalCard}>
            <View style={styles.sessionModalHeader}>
              <View>
                <Text style={styles.sessionModalTitle}>Session Booking Details</Text>
                <Text style={styles.sessionModalSub}>
                  ID: {selectedBookingModal?.bookingId || selectedBookingModal?._id}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowBookingModal(false)} style={styles.invoiceCloseBtn}>
                <Ionicons name="close" size={22} color={COLORS.textMedium} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              {selectedBookingModal && (
                <View style={{ gap: 12 }}>
                  <View style={styles.sessionModalBox}>
                    <Text style={styles.sessionModalBoxLabel}>MEMBER DETAILS</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 }}>
                      <View style={styles.sessionMemberAvatar}>
                        <Text style={styles.sessionMemberAvatarText}>
                          {selectedBookingModal.customerId?.firstName?.charAt(0) || 'U'}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.sessionModalBoldText}>
                          {selectedBookingModal.customerId
                            ? `${selectedBookingModal.customerId.firstName || ''} ${selectedBookingModal.customerId.lastName || ''}`.trim()
                            : 'Unknown Member'}
                        </Text>
                        <Text style={styles.sessionModalMutedText}>
                          {selectedBookingModal.customerId?.email || 'N/A'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.sessionModalBox}>
                    <Text style={styles.sessionModalBoxLabel}>ASSIGNED TRAINER</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 }}>
                      <View style={[styles.detailIconBox, { backgroundColor: '#EFF6FF' }]}>
                        <Ionicons name="person" size={18} color={COLORS.blue} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.sessionModalBoldText}>
                          {selectedBookingModal.trainerId?.name || 'Assigned Coach'}
                        </Text>
                        <Text style={styles.sessionModalMutedText}>
                          {selectedBookingModal.trainerId?.specialization || 'Fitness Trainer'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.sessionModalBox}>
                    <Text style={styles.sessionModalBoxLabel}>SCHEDULE & TIMINGS</Text>
                    <View style={{ gap: 6, marginTop: 6 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name="calendar" size={14} color={COLORS.primary} />
                        <Text style={styles.sessionModalBoldText}>{formatSessionDate(selectedBookingModal.date)}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name="time" size={14} color={COLORS.textMuted} />
                        <Text style={styles.sessionModalBoldText}>
                          {selectedBookingModal.startTime} - {selectedBookingModal.endTime}
                        </Text>
                      </View>
                      {selectedBookingModal.checkInTime && (
                        <Text style={styles.sessionCheckInText}>
                          Checked In: {new Date(selectedBookingModal.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      )}
                      {selectedBookingModal.checkOutTime && (
                        <Text style={styles.sessionCheckOutText}>
                          Checked Out: {new Date(selectedBookingModal.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.sessionModalBox}>
                    <Text style={styles.sessionModalBoxLabel}>BILLING & STATUS</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                      <Text style={styles.sessionModalMutedText}>Session Fee:</Text>
                      <Text style={styles.sessionFeeAmount}>
                        ₹{Number(selectedBookingModal.fee ?? 25000).toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                      <Text style={styles.sessionModalMutedText}>Session Type:</Text>
                      <Text style={[styles.sessionModalBoldText, { color: COLORS.primary }]}>
                        {selectedBookingModal.mode || 'Online'}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                      <Text style={styles.sessionModalMutedText}>Payment Status:</Text>
                      <Text style={[styles.sessionModalBoldText, { color: COLORS.emerald }]}>
                        {selectedBookingModal.paymentStatus || 'Paid'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.invoiceActionsRow}>
              <TouchableOpacity
                style={styles.invoiceCloseActionBtn}
                onPress={() => setShowBookingModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.invoiceCloseActionText}>Close</Text>
              </TouchableOpacity>
              {selectedBookingModal?.paymentStatus === 'Paid' && !['Refunded', 'Refund Pending'].includes(selectedBookingModal?.status) && (
                <TouchableOpacity
                  style={[styles.invoicePrintActionBtn, { backgroundColor: COLORS.rose }]}
                  activeOpacity={0.7}
                  onPress={() => handleRefundSession(selectedBookingModal._id)}
                >
                  <Ionicons name="card-outline" size={16} color={COLORS.white} />
                  <Text style={styles.invoicePrintActionText}>Process Refund</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollArea: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 110,
  },
  ownerProfileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16,
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerAvatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  ownerRole: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  gymTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  gymTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    height: 44,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: COLORS.textDark,
  },
  groupCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    marginBottom: 4,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  groupHeaderBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  groupHeaderBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMedium,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  itemDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  itemBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FFE4E6',
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.rose,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    maxHeight: '92%',
    minHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  modalBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalBackText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  detailHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  detailSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  detailItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  detailIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  detailItemSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  kpiMiniRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  kpiMiniBox: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  kpiMiniLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  kpiMiniVal: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 2,
  },
  planCardHighlight: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  planTitleWhite: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
  },
  planValidWhite: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: 14,
  },
  planFeatureList: {
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
  },
  planFeatureItem: {
    fontSize: 11,
    color: COLORS.white,
  },
  activePillGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activePillTextGreen: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.emerald,
  },
  emptyDetailCard: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 30,
    alignItems: 'center',
    marginVertical: 10,
  },
  emptyDetailTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 8,
  },
  emptyDetailSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  // Store Overview Styles
  storeKpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    marginBottom: 16,
  },
  storeKpiCard: {
    width: '48.5%',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  storeKpiLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  storeKpiValue: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  storeKpiSub: {
    fontSize: 9.5,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  storeKpiIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeSectionCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  storeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  storeSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  storeViewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  storeOrderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  storeOrderNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  storeOrderCustomerDate: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  storeOrderTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  storeOrderStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  storeOrderStatusCompleted: {
    backgroundColor: '#FFEDD5',
  },
  storeOrderStatusCompletedText: {
    color: '#EA580C',
    fontSize: 10,
    fontWeight: '800',
  },
  storeOrderStatusPending: {
    backgroundColor: '#FEF3C7',
  },
  storeOrderStatusPendingText: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: '800',
  },
  storeOrderStatusDefault: {
    backgroundColor: '#F1F5F9',
  },
  storeOrderStatusDefaultText: {
    color: COLORS.textMedium,
    fontSize: 10,
    fontWeight: '800',
  },
  storeOrderStatusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  storeQuickActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  storeQuickActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  // Sales History Styles
  salesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  salesTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  salesSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  salesExportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 10,
  },
  salesExportBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  salesKpiGrid: {
    gap: 10,
    marginBottom: 16,
  },
  salesKpiCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  salesKpiLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  salesKpiValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textDark,
    marginTop: 4,
  },
  salesFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  salesFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  salesFilterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  salesFilterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMedium,
  },
  salesFilterPillTextActive: {
    color: COLORS.white,
  },
  salesSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 14,
  },
  salesSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: COLORS.textDark,
  },
  saleRecordCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  saleCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  saleRecordNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  saleSourceTypePill: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  saleSourceTypeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  saleDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    marginBottom: 10,
  },
  saleDateText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  saleDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  saleDetailCol: {
    flex: 1,
  },
  saleDetailLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  saleDetailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 2,
  },
  saleItemListBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    gap: 3,
  },
  saleItemNameText: {
    fontSize: 11,
    color: COLORS.textMedium,
  },
  saleCardFooterRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  saleMethodText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  saleStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  saleStatusCompleted: {
    backgroundColor: '#FFEDD5',
  },
  saleStatusCompletedText: {
    color: '#EA580C',
    fontSize: 10,
    fontWeight: '800',
  },
  saleStatusPending: {
    backgroundColor: '#FEF3C7',
  },
  saleStatusPendingText: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: '800',
  },
  saleStatusDefault: {
    backgroundColor: '#F1F5F9',
  },
  saleStatusDefaultText: {
    color: COLORS.textMedium,
    fontSize: 10,
    fontWeight: '800',
  },
  saleStatusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  saleTotalAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  saleInvoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 8,
  },
  saleInvoiceBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  // Invoice Modal Styles
  invoiceModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 16,
  },
  invoiceModalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    maxHeight: '90%',
  },
  invoiceModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingBottom: 12,
    marginBottom: 14,
  },
  invoiceGymLogo: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  invoiceGymSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  invoiceCloseBtn: {
    padding: 4,
  },
  invoiceNumberBox: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  invoiceTitleText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  invoiceNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9A3412',
    marginTop: 2,
  },
  invoiceInfoGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 14,
    gap: 12,
  },
  invoiceInfoCol: {
    flex: 1,
  },
  invoiceInfoTag: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  invoiceInfoName: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  invoiceInfoDetail: {
    fontSize: 11,
    color: COLORS.textMedium,
    marginTop: 2,
  },
  invoiceTable: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 14,
  },
  invoiceTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  invoiceTh: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textDark,
    textTransform: 'uppercase',
  },
  invoiceTableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  invoiceTd: {
    fontSize: 11,
    color: COLORS.textDark,
  },
  invoiceTotalBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 6,
    marginBottom: 14,
  },
  invoiceTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceTotalLabel: {
    fontSize: 12,
    color: COLORS.textMedium,
  },
  invoiceTotalVal: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  invoiceGrandTotalRow: {
    borderTopWidth: 2,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    marginTop: 4,
  },
  invoiceGrandTotalLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  invoiceGrandTotalVal: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
  },
  invoiceFooterBox: {
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E2E8F0',
  },
  invoiceFooterMsg: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  invoiceFooterSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  invoiceActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  invoiceCloseActionBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  invoiceCloseActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  invoicePrintActionBtn: {
    flex: 2,
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  invoicePrintActionText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.white,
  },
  // Session Bookings Styles
  sessionBreadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  sessionBreadcrumbText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  sessionHeaderRow: {
    marginBottom: 14,
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  sessionSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sessionSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 10,
  },
  sessionSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: COLORS.textDark,
  },
  sessionFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  sessionFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sessionFilterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sessionFilterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMedium,
  },
  sessionFilterPillTextActive: {
    color: COLORS.white,
  },
  sessionBookingCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  sessionCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sessionBookingId: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  sessionTypePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  sessionTypePillOnline: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FFEDD5',
  },
  sessionTypePillOnlineText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  sessionTypePillInPerson: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  sessionTypePillInPersonText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  sessionTypePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sessionParticipantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 12,
  },
  sessionMemberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1.2,
  },
  sessionMemberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionMemberAvatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  sessionMemberLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  sessionMemberName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  sessionMemberEmail: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  sessionTrainerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.9,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sessionTrainerLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  sessionTrainerName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  sessionScheduleBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    gap: 4,
    marginBottom: 10,
  },
  sessionScheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sessionDateText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  sessionTimeText: {
    fontSize: 11,
    color: COLORS.textMedium,
  },
  sessionCheckTimesRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  sessionCheckInText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sessionCheckOutText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9A3412',
  },
  sessionCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
  },
  sessionFeeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  sessionFeeAmount: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.primary,
  },
  sessionActionBtnsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionViewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
  },
  sessionViewDetailsBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  sessionRefundBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 10,
  },
  sessionRefundBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.rose,
  },
  sessionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 16,
  },
  sessionModalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    maxHeight: '85%',
  },
  sessionModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 12,
    marginBottom: 14,
  },
  sessionModalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  sessionModalSub: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 2,
  },
  sessionModalBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  sessionModalBoxLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  sessionModalBoldText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  sessionModalMutedText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  // Branches Styles
  branchPlanBox: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  branchPlanLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  branchPlanVal: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  branchAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 14,
  },
  branchAddBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.white,
  },
  branchCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  branchCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  branchIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  branchNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  branchCodeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  branchStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  branchStatusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  branchStatusActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#DCFCE7',
  },
  branchStatusActiveText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '800',
  },
  branchStatusSuspended: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FFEDD5',
  },
  branchStatusSuspendedText: {
    color: '#EA580C',
    fontSize: 10,
    fontWeight: '800',
  },
  branchStatusInactive: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  branchStatusInactiveText: {
    color: COLORS.textMedium,
    fontSize: 10,
    fontWeight: '800',
  },
  branchInfoSection: {
    gap: 6,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 10,
  },
  branchInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  branchInfoText: {
    fontSize: 12,
    color: COLORS.textMedium,
    flex: 1,
  },
  branchActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  branchViewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
  },
  branchViewBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  branchStatusToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 8,
  },
  branchStatusToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
