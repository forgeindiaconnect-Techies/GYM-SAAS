import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { api, resolveMediaUrl } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { FileDownloader } from '../../utils/fileDownloader';
import { ScannableQRCode } from '../../components/ScannableQRCode';
import { sanitizeTenDigitPhone, isValidTenDigitPhone } from '../../utils/phoneUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CHECKOUT_PAYMENT_METHODS = ['UPI', 'Credit / Debit Card', 'Net Banking', 'Cash at Gym'] as const;
const UPI_APPS = ['Google Pay', 'PhonePe', 'Paytm', 'BHIM'];
const NET_BANKING_BANKS = [
  'State Bank of India (SBI)',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank (PNB)',
  'Bank of Baroda',
  'Canara Bank',
  'Other Banks',
];

export const ALL_STORE_CATEGORIES = [
  'All Categories',
  'Supplements',
  'Nutrition & Healthy Snacks',
  'Fitness Drinks',
  'Gym Accessories',
  'Yoga & Recovery',
  'Gym Clothing',
  'Gym Merchandise',
  'Other',
];

interface CartItem {
  _id?: string;
  productId: any;
  variantId?: string;
  name: string;
  category?: string;
  attributes?: string;
  fulfilmentType?: string;
  price: number;
  quantity: number;
  image?: string;
}

export const getMobileTrackingTimeline = (order: any) => {
  if (!order) return [];
  const isCancelFlow = order.status === 'Cancelled' || order.status === 'Refunded';
  const isDelivery = order.fulfilmentType === 'Delivery';

  const pipeline = isDelivery
    ? [
        { status: 'Pending', label: 'Order Placed', defaultNote: 'Order placed and payment received' },
        { status: 'Confirmed', label: 'Order Confirmed', defaultNote: 'Order confirmed by store manager' },
        { status: 'Preparing', label: 'Order Preparing', defaultNote: 'Order is being packed at gym store' },
        { status: 'Out for Delivery', label: 'Out for Delivery', defaultNote: 'Package is on the way to delivery address' },
        { status: 'Completed', label: 'Delivered', defaultNote: 'Order successfully delivered to customer' },
      ]
    : [
        { status: 'Pending', label: 'Order Placed', defaultNote: 'Order placed and payment received' },
        { status: 'Confirmed', label: 'Order Confirmed', defaultNote: 'Order confirmed by store manager' },
        { status: 'Preparing', label: 'Order Preparing', defaultNote: 'Order is being packed at gym store' },
        { status: 'Ready for Pickup', label: 'Ready for Pickup', defaultNote: 'Order ready for collection at gym front desk' },
        { status: 'Completed', label: 'Picked Up', defaultNote: 'Order picked up by customer' },
      ];

  if (isCancelFlow) {
    const rawHistory: any[] = Array.isArray(order.statusHistory) && order.statusHistory.length > 0
      ? order.statusHistory
      : (Array.isArray(order.trackingTimeline) && order.trackingTimeline.length > 0
          ? order.trackingTimeline
          : [
              { status: 'Pending', at: order.createdAt, note: 'Order placed and payment received' },
              { status: order.status, at: order.updatedAt || new Date(), note: order.cancellationReason || 'Order cancelled' }
            ]);

    // --- BULLETPROOF dedup: build a map keyed by status (case-insensitive),
    //     preserving insertion order, keeping last timestamp per status.
    //     This eliminates ALL duplicates regardless of whether they are consecutive. ---
    const statusMap = new Map<string, any>();
    rawHistory.forEach((h: any) => {
      const key = (h.status || '').toString().toLowerCase().trim();
      if (key) statusMap.set(key, h); // later entry overwrites, keeping last timestamp
    });

    // Convert back to ordered unique array (Map preserves insertion order of FIRST seen key)
    // We need first-seen order but last timestamp, so rebuild carefully:
    const seenOrder: string[] = [];
    rawHistory.forEach((h: any) => {
      const key = (h.status || '').toString().toLowerCase().trim();
      if (key && !seenOrder.includes(key)) seenOrder.push(key);
    });
    const deduplicatedHistory = seenOrder.map(key => statusMap.get(key)).filter(Boolean);

    const safeFormatDate = (val: any, fallback = ''): string => {
      if (!val) return fallback;
      try {
        const d = new Date(val);
        if (isNaN(d.getTime())) return typeof val === 'string' ? val : fallback;
        const month = d.getMonth() + 1;
        const day = d.getDate();
        const year = d.getFullYear();
        let hours = d.getHours();
        const minutes = d.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${month}/${day}/${year}, ${hours}:${minutes} ${ampm}`;
      } catch {
        return typeof val === 'string' ? val : fallback;
      }
    };

    return deduplicatedHistory.map((h: any, idx: number, arr: any[]) => {
      const isLast = idx === arr.length - 1;
      const isCancelled = h.status === 'Cancelled' || h.status === 'Refunded';
      return {
        status: h.status,
        label: h.status === 'Completed' ? (isDelivery ? 'Delivered' : 'Picked Up') : h.status,
        time: safeFormatDate(h.at, h.time || 'Completed'),
        note: h.note || `Status changed to ${h.status}`,
        completed: true,
        isCurrent: isLast,
        future: false,
        isCancelled,
      };
    });
  }

  const safeFormatDate = (val: any, fallback = ''): string => {
    if (!val) return fallback;
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return typeof val === 'string' ? val : fallback;
      const month = d.getMonth() + 1;
      const day = d.getDate();
      const year = d.getFullYear();
      let hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${month}/${day}/${year}, ${hours}:${minutes} ${ampm}`;
    } catch {
      return typeof val === 'string' ? val : fallback;
    }
  };

  const currentStatus = (order.status || 'Pending').toLowerCase();
  let currentIndex = pipeline.findIndex(p => p.status.toLowerCase() === currentStatus);
  if (currentIndex === -1 && currentStatus === 'delivered') {
    currentIndex = pipeline.length - 1;
  }
  const maxReachedIndex = currentIndex >= 0 ? currentIndex : 0;

  const historyMap: Record<string, { time?: string; note?: string }> = {};
  if (Array.isArray(order.statusHistory)) {
    order.statusHistory.forEach((h: any) => {
      if (h?.status) {
        historyMap[h.status.toLowerCase()] = {
          time: safeFormatDate(h.at),
          note: h.note
        };
      }
    });
  }
  if (Array.isArray(order.trackingTimeline)) {
    order.trackingTimeline.forEach((t: any) => {
      if (t?.status) {
        historyMap[t.status.toLowerCase()] = {
          time: t.time || safeFormatDate(t.at),
          note: t.note
        };
      }
    });
  }

  const orderCreatedFormatted = safeFormatDate(order.createdAt);

  return pipeline.map((stage, idx) => {
    const isReached = idx <= maxReachedIndex;
    const isCurrent = idx === maxReachedIndex;
    const recorded = historyMap[stage.status.toLowerCase()];

    let timeStr = 'Upcoming step';
    if (isReached) {
      if (recorded?.time) {
        timeStr = recorded.time;
      } else if (idx === 0 && orderCreatedFormatted) {
        timeStr = orderCreatedFormatted;
      } else {
        timeStr = isCurrent ? 'In Progress' : 'Completed';
      }
    }

    return {
      status: stage.status,
      label: stage.label,
      time: timeStr,
      note: recorded?.note || stage.defaultNote,
      completed: isReached,
      future: !isReached,
      isCurrent,
    };
  });
};

export const CustomerStoreScreen: React.FC<{ initialSubTab?: string }> = ({ initialSubTab = 'store' }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'store' | 'cart' | 'checkout' | 'orders' | 'payments'>(
    initialSubTab === 'cart' ? 'cart' : initialSubTab === 'orders' ? 'orders' : initialSubTab === 'payments' ? 'payments' : 'store'
  );

  // General state
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Catalog state
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [modalQty, setModalQty] = useState(1);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);
  const [failedProductImgKeys, setFailedProductImgKeys] = useState<Record<string, boolean>>({});

  // Cart state (default matching Web Page 3)
  const [cart, setCart] = useState<CartItem[]>([
    {
      _id: 'cart_item_1',
      productId: 'prod_classy',
      name: 'classy',
      category: 'Energy Drink • No • Berry Blast',
      price: 140,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
    }
  ]);
  const [fulfilmentType, setFulfilmentType] = useState<'Gym Pickup' | 'Delivery'>('Gym Pickup');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Credit / Debit Card' | 'Net Banking' | 'Cash at Gym'>('UPI');
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('');
  const [upiId, setUpiId] = useState<string>('');
  const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [bankName, setBankName] = useState<string>('');
  const [showBankPicker, setShowBankPicker] = useState<boolean>(false);
  const [delivery, setDelivery] = useState({ name: '', phone: '', address: '', city: '', state: '', pinCode: '' });
  const [placedOrder, setPlacedOrder] = useState<any | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Rewards & Points State (Matching Web MemberCheckout.tsx)
  const [pointsBalance, setPointsBalance] = useState<number>(0);
  const [rewardSettings, setRewardSettings] = useState<any>(null);
  const [usePoints, setUsePoints] = useState<boolean>(false);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);

  // Orders State (default matching Web Page 5)
  const [orderFilter, setOrderFilter] = useState<string>('All Orders');
  const [orders, setOrders] = useState<any[]>([
    {
      _id: 'ord_1',
      orderNumber: 'ORD-MVM7Y6AEI9KD',
      itemCount: 1,
      createdAt: '2026-10-24T15:21:10.000Z',
      dateDisplay: '10/24/2026 at 03:21 PM',
      fulfilmentType: 'Gym Pickup',
      total: 140,
      status: 'Preparing',
      paymentStatus: 'Paid',
      paymentMethod: 'UPI',
      items: [
        { name: 'classy', quantity: 1, price: 140, attributes: 'Flavor: Berry Blast' }
      ],
      trackingTimeline: [
        { status: 'Pending', time: '10/24/2026, 3:21:10 PM', note: 'Order placed and payment received', completed: true },
        { status: 'Out for Delivery', time: '11/4/2026, 2:43:07 PM', note: 'Status changed to Out for Delivery', completed: true },
        { status: 'Out for Delivery', time: '11/4/2026, 2:43:09 PM', note: 'Status changed to Out for Delivery', completed: true },
        { status: 'Out for Delivery', time: '11/4/2026, 2:43:09 PM', note: 'Status changed to Out for Delivery', completed: true },
      ]
    },
    {
      _id: 'ord_2',
      orderNumber: 'ORD-MV7UN75JW1MY',
      itemCount: 1,
      createdAt: '2026-10-14T13:59:56.000Z',
      dateDisplay: '10/14/2026 at 01:59 PM',
      fulfilmentType: 'Delivery',
      total: 140,
      status: 'Confirmed',
      paymentStatus: 'Paid',
      paymentMethod: 'UPI',
      items: [
        { name: 'classy', quantity: 1, price: 140, attributes: 'Flavor: Berry Blast' }
      ],
      trackingTimeline: [
        { status: 'Pending', time: '10/14/2026, 1:59:56 PM', note: 'Order placed and payment received', completed: true },
        { status: 'Confirmed', time: '10/14/2026, 2:10:00 PM', note: 'Order confirmed by store manager', completed: true },
      ]
    }
  ]);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<any | null>(null);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<any | null>(null);

  // Payments State (default matching Web Page 8)
  const [paymentFilter, setPaymentFilter] = useState<'All Payments' | 'Paid' | 'Refunded' | 'Failed'>('All Payments');
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<any | null>(null);
  const [pdfReceiptModal, setPdfReceiptModal] = useState<any | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null);

  // Download PDF Invoice / Payment Receipt for Store Order
  const handleDownloadInvoice = async (paymentOrOrder: any) => {
    if (!paymentOrOrder) return;
    try {
      const targetId = paymentOrOrder._id || paymentOrOrder.orderNumber;
      setDownloadingPdfId(targetId);

      const customerFullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || (user as any)?.name || 'Valued Member';
      const gymName = (user as any)?.gymName || (user as any)?.gymId?.name || 'AI Gym Store';

      await FileDownloader.downloadStoreReceiptPDF({
        orderNumber: paymentOrOrder.orderNumber || `ORD-${Date.now()}`,
        gymName,
        gymAddress: 'Premier Fitness, Training & Wellness Club',
        customerName: customerFullName,
        customerEmail: user?.email,
        customerPhone: user?.phone,
        dateDisplay: paymentOrOrder.dateDisplay || (paymentOrOrder.createdAt ? new Date(paymentOrOrder.createdAt).toLocaleString() : new Date().toLocaleString()),
        paymentMethod: paymentOrOrder.paymentMethod || 'UPI',
        paymentStatus: (paymentOrOrder.paymentStatus || paymentOrOrder.status || 'PAID').toUpperCase(),
        fulfilmentType: paymentOrOrder.fulfilmentType || 'Store Delivery',
        items: paymentOrOrder.items && paymentOrOrder.items.length > 0 ? paymentOrOrder.items : undefined,
        subtotal: paymentOrOrder.subtotal || paymentOrOrder.total || 0,
        discount: paymentOrOrder.discount || 0,
        tax: paymentOrOrder.tax || 0,
        total: paymentOrOrder.total || 0,
        shippingAddress: paymentOrOrder.deliveryDetails ? 
          [paymentOrOrder.deliveryDetails.address, paymentOrOrder.deliveryDetails.city, paymentOrOrder.deliveryDetails.pincode].filter(Boolean).join(', ') 
          : undefined,
      });

      setSelectedPaymentForReceipt(null);
      setPdfReceiptModal(null);
    } catch (err: any) {
      console.error('Failed to download invoice PDF:', err);
      Alert.alert('Download Error', 'Unable to generate invoice PDF. Please try again.');
    } finally {
      setDownloadingPdfId(null);
    }
  };

  // Load Real Customer Orders
  const loadOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      const res = await api.get('/store/customer/orders?limit=50').catch(() => null);
      if (res?.data?.orders && Array.isArray(res.data.orders) && res.data.orders.length > 0) {
        const mappedOrders = res.data.orders.map((o: any) => ({
          ...o,
          _id: o._id,
          orderNumber: o.orderNumber,
          itemCount: o.items?.reduce((acc: number, it: any) => acc + (it.quantity || 1), 0) || 1,
          createdAt: o.createdAt,
          dateDisplay: (() => {
            if (!o.createdAt) return 'Recent';
            try {
              const d = new Date(o.createdAt);
              if (isNaN(d.getTime())) return 'Recent';
              const m = d.getMonth() + 1;
              const day = d.getDate();
              const y = d.getFullYear();
              let h = d.getHours();
              const min = d.getMinutes().toString().padStart(2, '0');
              const ampm = h >= 12 ? 'PM' : 'AM';
              h = h % 12 || 12;
              return `${m}/${day}/${y}, ${h}:${min} ${ampm}`;
            } catch {
              return 'Recent';
            }
          })(),
          fulfilmentType: o.fulfilmentType || 'Delivery',
          total: o.total || 0,
          status: o.status || 'Pending',
          paymentStatus: o.paymentStatus || 'Paid',
          paymentMethod: o.paymentMethod || 'UPI',
          items: o.items?.map((it: any) => ({
            name: it.name,
            quantity: it.quantity || 1,
            price: it.sellingPrice || it.unitPrice || it.total || 0,
            attributes: it.attributes ? Object.entries(it.attributes).map(([k, v]) => `${k}: ${v}`).join(' • ') : '',
          })) || [],
          statusHistory: o.statusHistory || [],
          deliveryDetails: o.deliveryDetails,
        }));
        setOrders(mappedOrders);
        setSelectedOrderForTracking((prev: any) => {
          if (!prev) return null;
          const refreshed = mappedOrders.find((m: any) => m._id === prev._id || m.orderNumber === prev.orderNumber);
          return refreshed || prev;
        });
      }
    } catch (err) {
      console.log('[CustomerStore] Load orders note:', err);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // Load Catalog Products
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/store/customer/products').catch(() => null);
      if (res?.data?.products && res.data.products.length > 0) {
        const normalized = res.data.products.map((p: any) => {
          let totalStock = Number(p?.stock ?? 0);
          let origPrice = Number(p?.sellingPrice ?? 0);
          let discAmt = Number(p?.discountPrice) || 0;
          let displayPrice = Math.max(0, origPrice - discAmt);
          let hasDisc = discAmt > 0 && origPrice > discAmt;
          let mappedVariants = p?.variants;

          if (p?.hasVariants && Array.isArray(p?.variants) && p.variants.length > 0) {
            totalStock = p.variants.reduce((acc: number, v: any) => acc + (Number(v?.stock) || 0), 0);
            mappedVariants = p.variants.map((v: any) => {
              const vp = Number(v?.price) || 0;
              const vd = Number(v?.discountPrice) || 0;
              return {
                ...v,
                originalPrice: vp,
                finalPrice: Math.max(0, vp - vd),
              };
            });
            const minV = mappedVariants.reduce((prev: any, curr: any) =>
              curr.finalPrice < prev.finalPrice ? curr : prev
            , mappedVariants[0]);
            if (minV) {
              origPrice = minV.originalPrice;
              displayPrice = minV.finalPrice;
              const vDisc = Number(minV.discountPrice) || 0;
              hasDisc = vDisc > 0 && origPrice > vDisc;
            }
          }

          const discountPct = hasDisc && origPrice > 0
            ? Math.max(1, Math.round(((origPrice - displayPrice) / origPrice) * 100))
            : null;

          return {
            ...p,
            image: resolveMediaUrl(p?.image),
            stock: totalStock,
            sellingPrice: origPrice,
            displayPrice,
            discountPct,
            isFromPrice: Boolean(p?.hasVariants && mappedVariants?.length > 0),
            variants: mappedVariants,
          };
        });
        setProducts(normalized);
      } else {
        // Fallback default matching Web Image 1 exactly
        setProducts([
          {
            _id: 'prod_classy',
            name: 'classy',
            brand: 'No',
            categoryName: 'Fitness Drinks',
            productType: 'Fitness Drinks',
            sellingPrice: 199,
            displayPrice: 140,
            discountPrice: 59,
            discountPct: 30,
            stock: 13,
            image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
            description: 'Refreshing pre-workout energy drink rich in electrolytes, taurine and B-vitamins.',
            attributes: { Category: 'Energy Drink', Brand: 'No' },
          },
          {
            _id: 'prod_tshirt',
            name: 'Gym T-Shirt',
            brand: 'Nike',
            categoryName: 'Gym Clothing',
            productType: 'Gym Clothing',
            sellingPrice: 999,
            displayPrice: 999,
            isFromPrice: true,
            stock: 10,
            image: null,
            description: 'Dri-FIT breathable athletic t-shirt designed for heavy gym training and sweat resistance.',
            hasVariants: true,
            variants: [
              { _id: 'v_s', name: 'Size S - Black', price: 999 },
              { _id: 'v_m', name: 'Size M - Black', price: 999 },
              { _id: 'v_l', name: 'Size L - Black', price: 999 },
              { _id: 'v_xl', name: 'Size XL - Black', price: 1099 },
            ],
          },
          {
            _id: 'prod_whey',
            name: 'Gold Standard Whey Protein',
            brand: 'Optimum Nutrition',
            categoryName: 'Supplements',
            productType: 'Supplements',
            sellingPrice: 4500,
            displayPrice: 4000,
            discountPrice: 500,
            discountPct: 11,
            stock: 20,
            image: null,
            description: '100% Whey Gold Standard protein isolate with 24g pure whey protein and 5.5g BCAAs per scoop.',
            attributes: { Type: 'Powder', Servings: '30' },
          },
        ]);
      }
    } catch (err) {
      console.log('[CustomerStore] Load products note:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadCart = useCallback(async () => {
    try {
      const res = await api.get('/store/customer/cart').catch(() => null);
      if (res?.data?.success && Array.isArray(res.data.cart)) {
        const mapped: CartItem[] = res.data.cart.map((row: any, idx: number) => {
          const p = row.product || {};
          const v = row.variant || null;
          const unitPrice = v
            ? (v.price - (v.discountPrice || 0))
            : (p.sellingPrice - (p.discountPrice || 0));
          const attrs = v?.attributes
            ? Object.values(v.attributes).join(' / ')
            : (p.attributes ? Object.values(p.attributes).slice(0, 2).join(' / ') : '');
          return {
            _id: `${p._id || idx}_${v?._id || 'base'}`,
            productId: p._id,
            variantId: v?._id,
            name: p.name || 'Product',
            category: p.categoryName || 'Store Product',
            attributes: attrs,
            fulfilmentType: p.fulfilmentType,
            price: Math.max(0, Number(unitPrice) || 0),
            quantity: Number(row.quantity) || 1,
            image: resolveMediaUrl(p.image),
          };
        });
        setCart(mapped);
        if (mapped.length > 0 && mapped.every((row) => row.fulfilmentType === 'Delivery')) {
          setFulfilmentType('Delivery');
        }
      }
    } catch (err) {
      console.log('[CustomerStore] Load cart note:', err);
    }
  }, []);

  const loadRewards = useCallback(async () => {
    try {
      const [walletRes, settingsRes] = await Promise.all([
        api.get('/referrals/my-rewards-ledger').catch(() => ({ data: { pointsBalance: 0 } })),
        api.get('/referrals/settings').catch(() => ({ data: { settings: null } })),
      ]);
      const pts = Number(walletRes?.data?.pointsBalance || 0);
      setPointsBalance(pts);
      const st = settingsRes?.data?.settings || null;
      setRewardSettings(st);
      if (st && st.enableStorePurchase && pts >= (st.minPointsForRedemption || 100)) {
        setPointsToRedeem(pts);
      } else {
        setUsePoints(false);
        setPointsToRedeem(0);
      }
    } catch (err) {
      console.log('[CustomerStore] Load rewards note:', err);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadCart();
    loadRewards();
    loadOrders();
  }, [loadProducts, loadCart, loadRewards, loadOrders]);

  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    } else if (activeTab === 'cart' || activeTab === 'checkout') {
      loadCart();
      loadRewards();
    }
  }, [activeTab, loadOrders, loadCart, loadRewards]);

  useEffect(() => {
    if (fulfilmentType === 'Delivery' && paymentMethod === 'Cash at Gym') {
      setPaymentMethod('UPI');
    }
  }, [fulfilmentType, paymentMethod]);

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
    loadCart();
    loadRewards();
    loadOrders();
  };

  // Cart & Checkout Totals (Matching Web MemberCheckout.tsx)
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const isPremium = Boolean((user as any)?.subscriptionPlan?.toLowerCase?.().includes('premium'));
  const discountAmount = isPremium ? Math.round(cartSubtotal * 0.3) : 0;
  const convUnit = rewardSettings?.pointsPerConversionUnit || 100;
  const rupeeUnit = rewardSettings?.currencyValuePerUnit || 50;
  const rate = rupeeUnit / convUnit;
  const maxPossibleDiscount = Math.max(0, cartSubtotal - discountAmount);
  const rawPointsDiscount = usePoints ? Math.round(pointsToRedeem * rate) : 0;
  const pointsDiscount = Math.min(rawPointsDiscount, maxPossibleDiscount);
  const finalTotal = Math.max(0, cartSubtotal - discountAmount - pointsDiscount);

  // Cart Management
  const handleAddToCart = async (product: any, qty: number = 1, variant?: any) => {
    const itemPrice = variant
      ? (variant.finalPrice ?? Math.max(0, Number(variant.price || 0) - Number(variant.discountPrice || 0)))
      : (product.displayPrice ?? Math.max(0, Number(product.sellingPrice || 0) - Number(product.discountPrice || 0)));
    const itemName = variant ? `${product.name} (${variant.name || Object.values(variant.attributes || {}).join(' ') || 'Variant'})` : product.name;
    const itemAttrs = variant?.attributes
      ? Object.values(variant.attributes).join(' / ')
      : (product.attributes ? Object.values(product.attributes).slice(0, 2).join(' / ') : '');

    setCart(prev => {
      const existing = prev.find(i => i.productId === product._id && (!variant || i.variantId === variant._id));
      if (existing) {
        return prev.map(i => i === existing ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [
        ...prev,
        {
          _id: `${product._id}_${variant?._id || 'base'}`,
          productId: product._id,
          variantId: variant?._id,
          name: product.name,
          category: product.categoryName || 'Store Product',
          attributes: itemAttrs,
          fulfilmentType: product.fulfilmentType,
          price: itemPrice,
          quantity: qty,
          image: product.image,
        }
      ];
    });

    if (product._id && !String(product._id).startsWith('prod_')) {
      try {
        await api.post('/store/customer/cart', {
          productId: product._id,
          variantId: variant?._id,
          quantity: qty,
        });
        await loadCart();
      } catch (err: any) {
        const msg = err?.response?.data?.message;
        if (msg) {
          Alert.alert('Cart Notice', msg);
          await loadCart();
          return;
        }
      }
    }

    setSelectedProduct(null);
    Alert.alert('Added to Cart! 🛒', `"${itemName}" (${qty}x) has been added to your shopping cart.`);
  };

  const handleUpdateQty = async (itemId: string, delta: number) => {
    const target = cart.find(item => item._id === itemId);
    if (!target) return;
    const newQty = target.quantity + delta;

    setCart(prev => prev.map(item => {
      if (item._id === itemId) {
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);

    if (target.productId && !String(target.productId).startsWith('prod_')) {
      try {
        if (newQty > 0) {
          await api.put('/store/customer/cart/items', {
            productId: target.productId,
            variantId: target.variantId,
            quantity: newQty,
          });
        } else {
          const q = target.variantId ? `?variantId=${encodeURIComponent(target.variantId)}` : '';
          await api.delete(`/store/customer/cart/items/${target.productId}${q}`);
        }
        await loadCart();
      } catch (err: any) {
        if (err?.response?.data?.message) {
          Alert.alert('Cart Notice', err.response.data.message);
        }
        await loadCart();
      }
    }
  };

  const handleRemoveCartItem = async (itemId: string) => {
    const target = cart.find(i => i._id === itemId);
    setCart(prev => prev.filter(i => i._id !== itemId));
    if (target?.productId && !String(target.productId).startsWith('prod_')) {
      try {
        const q = target.variantId ? `?variantId=${encodeURIComponent(target.variantId)}` : '';
        await api.delete(`/store/customer/cart/items/${target.productId}${q}`);
      } catch {}
    }
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive', 
          onPress: async () => {
            setCart([]);
            await api.delete('/store/customer/cart').catch(() => {});
          }
        }
      ]
    );
  };

  // Checkout Submission (Matching Web MemberCheckout.tsx)
  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Cart Empty', 'Please add products to your cart before proceeding to checkout.');
      return;
    }
    setPlacedOrder(null);
    if (cart.every((row) => row.fulfilmentType === 'Delivery')) {
      setFulfilmentType('Delivery');
    }
    loadRewards();
    setActiveTab('checkout');
  };

  const handleConfirmOrder = async () => {
    if (cart.length === 0) {
      Alert.alert('Cart Empty', 'Your cart is empty.');
      return;
    }
    if (fulfilmentType === 'Delivery') {
      const missingField = (['name', 'phone', 'address', 'city', 'state', 'pinCode'] as const).find(
        (key) => !delivery[key].trim()
      );
      if (missingField) {
        Alert.alert(
          'Missing Delivery Details',
          `Please fill in the delivery ${missingField === 'pinCode' ? 'pincode' : missingField}.`
        );
        return;
      }
      if (!isValidTenDigitPhone(delivery.phone)) {
        Alert.alert('Invalid Phone', 'Please enter a valid 10-digit mobile number for delivery.');
        return;
      }
      if (!/^\d{6}$/.test(delivery.pinCode.trim())) {
        Alert.alert('Invalid Pincode', 'Please enter a valid 6-digit pincode.');
        return;
      }
    }
    if (paymentMethod === 'Net Banking' && !bankName) {
      Alert.alert('Select Bank', 'Please select a bank to continue with Net Banking.');
      return;
    }

    setIsCheckingOut(true);
    try {
      const payload = {
        fulfilmentType,
        deliveryDetails: fulfilmentType === 'Delivery' ? delivery : undefined,
        paymentMethod,
        bankName: paymentMethod === 'Net Banking' ? bankName : undefined,
        discount: discountAmount,
        pointsToRedeem: usePoints ? pointsToRedeem : 0,
      };
      const res = await api.post('/store/customer/checkout', payload);
      if (res?.data?.order) {
        setPlacedOrder(res.data.order);
        setCart([]);
        setIsCheckingOut(false);
        await loadOrders();
        await loadRewards();
        return;
      }
    } catch (err: any) {
      setIsCheckingOut(false);
      if (err?.response) {
        Alert.alert('Checkout Failed', err.response?.data?.message || 'Checkout failed. Please try again.');
        return;
      }
    }

    // Offline fallback order only when server is unreachable
    const newOrder = {
      _id: `ord_${Date.now()}`,
      orderNumber: `ORD-MVM${Math.random().toString(36).substring(2, 7).toUpperCase()}KD`,
      itemCount: cart.length,
      createdAt: new Date().toISOString(),
      dateDisplay: new Date().toLocaleString(),
      fulfilmentType,
      total: finalTotal,
      status: 'Preparing',
      paymentStatus: 'Paid',
      paymentMethod,
      items: cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price, attributes: i.attributes })),
      statusHistory: [
        { status: 'Pending', at: new Date().toISOString(), note: 'Order placed and payment received' },
        { status: 'Preparing', at: new Date().toISOString(), note: 'Order is being packed at gym store' },
      ],
      trackingTimeline: [
        { status: 'Pending', time: new Date().toLocaleTimeString(), note: 'Order placed and payment received', completed: true },
        { status: 'Preparing', time: 'Just now', note: 'Order is being packed at gym store', completed: true },
      ]
    };

    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    setPlacedOrder(newOrder);
    setIsCheckingOut(false);
  };

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = !search.trim() || 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      (p.brand || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.categoryName || '').toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All Categories' || p.categoryName === selectedCategory || p.productType === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'All Orders') return true;
    if (orderFilter === 'Cancelled / Refunded') return o.status === 'Cancelled' || o.status === 'Refunded';
    return o.status?.toLowerCase() === orderFilter.toLowerCase();
  });

  // Filtered Payments
  const filteredPayments = orders.filter(o => {
    if (paymentFilter === 'All Payments') return true;
    if (paymentFilter === 'Paid') return o.paymentStatus === 'Paid' || o.status === 'Completed';
    if (paymentFilter === 'Refunded') return o.paymentStatus === 'Refunded' || o.status === 'Refunded';
    if (paymentFilter === 'Failed') return o.paymentStatus === 'Failed';
    return true;
  });

  return (
    <View style={styles.container}>
      {/* ======================================================== */}
      {/* 4 STORE SUB-TABS (Matching Web MemberStoreTabs Exactly) */}
      {/* ======================================================== */}
      <View style={styles.subTabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subTabsContainer}>
          <TouchableOpacity
            style={[styles.subTabBtn, activeTab === 'store' && styles.subTabBtnActive]}
            onPress={() => setActiveTab('store')}
            activeOpacity={0.7}
          >
            <Ionicons name="storefront-outline" size={14} color={activeTab === 'store' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.subTabText, activeTab === 'store' && styles.subTabTextActive]}>Store</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabBtn, (activeTab === 'cart' || activeTab === 'checkout') && styles.subTabBtnActive]}
            onPress={() => { setPlacedOrder(null); setActiveTab('cart'); }}
            activeOpacity={0.7}
          >
            <Ionicons name="cart-outline" size={14} color={(activeTab === 'cart' || activeTab === 'checkout') ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.subTabText, (activeTab === 'cart' || activeTab === 'checkout') && styles.subTabTextActive]}>My Cart</Text>
            {cartCount > 0 && (
              <View style={[styles.cartBadgePill, (activeTab === 'cart' || activeTab === 'checkout') && { backgroundColor: '#FFFFFF' }]}>
                <Text style={[styles.cartBadgePillText, (activeTab === 'cart' || activeTab === 'checkout') && { color: '#EA580C' }]}>
                  {cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabBtn, activeTab === 'orders' && styles.subTabBtnActive]}
            onPress={() => setActiveTab('orders')}
            activeOpacity={0.7}
          >
            <Ionicons name="receipt-outline" size={14} color={activeTab === 'orders' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.subTabText, activeTab === 'orders' && styles.subTabTextActive]}>My Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabBtn, activeTab === 'payments' && styles.subTabBtnActive]}
            onPress={() => setActiveTab('payments')}
            activeOpacity={0.7}
          >
            <Ionicons name="card-outline" size={14} color={activeTab === 'payments' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.subTabText, activeTab === 'payments' && styles.subTabTextActive]}>Payment History</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ======================================================== */}
      {/* 1. STORE CATALOG TAB (Matching Web Page 1) */}
      {/* ======================================================== */}
      {activeTab === 'store' && (
        <ScrollView 
          style={styles.contentScroll} 
          contentContainerStyle={{ padding: 14, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        >
          {/* Top Title & Cart Button Matching Web Page 1 */}
          <View style={styles.webHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.webHeaderTitle}>Gym Store</Text>
              <Text style={styles.webHeaderSub}>Supplements, merch & more from your gym.</Text>
            </View>

            <TouchableOpacity 
              style={styles.webCartButton}
              onPress={() => setActiveTab('cart')}
              activeOpacity={0.8}
            >
              <Ionicons name="cart" size={16} color="#FFFFFF" />
              <Text style={styles.webCartButtonText}>Cart</Text>
              {cartCount > 0 && (
                <View style={styles.webCartBadgeCount}>
                  <Text style={styles.webCartBadgeCountText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Category Chips Scroll */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {ALL_STORE_CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.categoryPillText, isSelected && styles.categoryPillTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Products Grid Matching Web Image 1 */}
          {loading && !refreshing ? (
            <ActivityIndicator size="small" color="#EA580C" style={{ marginVertical: 30 }} />
          ) : filteredProducts.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="storefront-outline" size={44} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No Products Found</Text>
              <Text style={styles.emptySub}>No products match your search or filter.</Text>
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {filteredProducts.map((p) => {
                const stock = Number(p.stock ?? 0);
                const isOutOfStock = stock <= 0;
                return (
                  <View key={p._id} style={styles.productCard}>
                    {/* Image / Fallback Container */}
                    <View style={styles.productImageContainer}>
                      {p.image && !failedProductImgKeys[`${p._id}:${p.image}`] ? (
                        <Image
                          source={{ uri: resolveMediaUrl(p.image) }}
                          style={styles.productImage}
                          resizeMode="cover"
                          onError={() => setFailedProductImgKeys((prev) => ({ ...prev, [`${p._id}:${p.image}`]: true }))}
                        />
                      ) : (
                        <View style={styles.productFallback}>
                          <Ionicons name="image-outline" size={32} color="#CBD5E1" />
                          <Text style={styles.productFallbackText}>No Image Available</Text>
                        </View>
                      )}

                      {/* In Stock Badge Top Left */}
                      <View style={[styles.inStockBadge, isOutOfStock && { backgroundColor: '#FEE2E2' }]}>
                        <Text style={[styles.inStockBadgeText, isOutOfStock && { color: '#B91C1C' }]}>
                          {isOutOfStock ? 'Out of stock' : `In stock (${stock})`}
                        </Text>
                      </View>

                      {/* Discount Badge Top Right */}
                      {p.discountPct ? (
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountBadgeText}>{p.discountPct}% off</Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Content */}
                    <View style={styles.productContent}>
                      <View style={styles.productTypeBrandRow}>
                        <Text style={styles.productTypeText}>{(p.productType || p.categoryName || 'GENERAL').toUpperCase()}</Text>
                        <Text style={styles.productBrandText}>{p.brand}</Text>
                      </View>

                      <Text style={styles.productName} numberOfLines={1}>{p.name}</Text>

                      {/* Attributes */}
                      <View style={styles.productAttrsRow}>
                        {p.attributes && Object.entries(p.attributes).map(([k, v]) => (
                          <Text key={k} style={styles.productAttrText}>{k} {String(v)}</Text>
                        ))}
                      </View>

                      {/* Price Row */}
                      <View style={styles.priceRow}>
                        <Text style={styles.mainPrice}>
                          {p.isFromPrice ? 'From ' : ''}₹{(p.displayPrice || p.sellingPrice).toLocaleString('en-IN')}
                        </Text>
                        {p.discountPrice && p.sellingPrice > p.displayPrice ? (
                          <Text style={styles.strikePrice}>₹{p.sellingPrice.toLocaleString('en-IN')}</Text>
                        ) : null}
                      </View>

                      {/* Action Buttons: View & Add/Options */}
                      <View style={styles.productActionRow}>
                        <TouchableOpacity
                          style={styles.viewDetailsBtn}
                          onPress={() => {
                            setSelectedProduct(p);
                            setSelectedVariant(p.variants?.[0] || null);
                            setModalQty(1);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.viewDetailsBtnText}>View</Text>
                        </TouchableOpacity>

                        {p.hasVariants ? (
                          <TouchableOpacity
                            style={styles.optionsBtn}
                            onPress={() => {
                              setSelectedProduct(p);
                              setSelectedVariant(p.variants?.[0] || null);
                              setModalQty(1);
                            }}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="settings-outline" size={13} color="#FFFFFF" />
                            <Text style={styles.optionsBtnText}>Options</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            style={styles.addCartBtn}
                            onPress={() => handleAddToCart(p, 1)}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="add" size={14} color="#FFFFFF" />
                            <Text style={styles.addCartBtnText}>Add</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      {/* ======================================================== */}
      {/* 2. MY CART TAB (Matching Web Page 3) */}
      {/* ======================================================== */}
      {activeTab === 'cart' && (
        <ScrollView 
          style={styles.contentScroll} 
          contentContainerStyle={{ padding: 14, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Row: Title & Clear Cart Button Matching Web Page 3 */}
          <View style={styles.webHeaderRow}>
            <View>
              <Text style={styles.webHeaderTitle}>Your Cart</Text>
              <Text style={styles.webHeaderSub}>{cart.length} item type(s) in your cart.</Text>
            </View>

            {cart.length > 0 && (
              <TouchableOpacity 
                style={styles.clearCartButton}
                onPress={handleClearCart}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={14} color="#DC2626" />
                <Text style={styles.clearCartButtonText}>Clear Cart</Text>
              </TouchableOpacity>
            )}
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="cart-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Your cart is empty</Text>
              <Text style={styles.emptySub}>Explore protein powders, BCAAs, clothing and accessories.</Text>
              <TouchableOpacity
                style={styles.continueShopButton}
                onPress={() => setActiveTab('store')}
                activeOpacity={0.8}
              >
                <Text style={styles.continueShopButtonText}>Browse Gym Store</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 14 }}>
              {/* Cart Items List */}
              {cart.map((item) => (
                <View key={item._id} style={styles.cartItemCard}>
                  {/* Thumbnail */}
                  <View style={styles.cartThumbBox}>
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={styles.cartThumbImage} resizeMode="cover" />
                    ) : (
                      <Ionicons name="cube-outline" size={24} color="#EA580C" />
                    )}
                  </View>

                  {/* Name & Subtitle */}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <Text style={styles.cartItemCategory}>{item.category || item.attributes}</Text>

                    {/* Stepper Controls Matching Web Page 3 */}
                    <View style={styles.cartStepperRow}>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => handleUpdateQty(item._id!, -1)}
                      >
                        <Ionicons name="remove" size={14} color="#334155" />
                      </TouchableOpacity>
                      <Text style={styles.stepperText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => handleUpdateQty(item._id!, 1)}
                      >
                        <Ionicons name="add" size={14} color="#334155" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Delete & Total Price */}
                  <View style={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <TouchableOpacity onPress={() => handleRemoveCartItem(item._id!)}>
                      <Ionicons name="trash-outline" size={18} color="#DC2626" />
                    </TouchableOpacity>
                    <Text style={styles.cartItemPriceTotal}>₹{item.price * item.quantity}</Text>
                  </View>
                </View>
              ))}

              {/* Order Summary Box Matching Web Page 3 */}
              <View style={styles.orderSummaryCard}>
                <Text style={styles.orderSummaryTitle}>Order Summary</Text>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryVal}>₹{cartSubtotal}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Delivery</Text>
                  <Text style={[styles.summaryVal, { color: '#64748B' }]}>At next step</Text>
                </View>

                <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                  <Text style={styles.summaryTotalLabel}>Total</Text>
                  <Text style={styles.summaryTotalVal}>₹{cartSubtotal}</Text>
                </View>

                {/* Proceed to Checkout Button Matching Web Page 3 */}
                <TouchableOpacity
                  style={styles.proceedCheckoutBtn}
                  onPress={handleProceedToCheckout}
                  activeOpacity={0.8}
                >
                  <Text style={styles.proceedCheckoutBtnText}>Proceed to Checkout →</Text>
                </TouchableOpacity>

                {/* Continue Shopping Button */}
                <TouchableOpacity
                  style={styles.continueShopLinkBtn}
                  onPress={() => setActiveTab('store')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.continueShopLinkText}>Continue shopping</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* ======================================================== */}
      {/* 2B. CHECKOUT PAGE (1:1 Parity with Web MemberCheckout)   */}
      {/* ======================================================== */}
      {activeTab === 'checkout' && (
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={{ padding: 14, paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {placedOrder ? (
            <View style={styles.checkoutSuccessCard}>
              <Ionicons name="checkmark-circle" size={64} color="#EA580C" />
              <Text style={styles.checkoutSuccessTitle}>Order Placed!</Text>
              <Text style={styles.checkoutSuccessSub}>
                Order <Text style={{ fontWeight: '800', color: '#111827' }}>{placedOrder.orderNumber}</Text> is confirmed.
              </Text>
              <Text style={styles.checkoutSuccessSub}>
                Paid <Text style={{ fontWeight: '900', color: '#EA580C' }}>₹{placedOrder.total}</Text> via {placedOrder.paymentMethod}. Track it under My Orders.
              </Text>
              <TouchableOpacity
                style={styles.proceedCheckoutBtn}
                onPress={() => {
                  setPlacedOrder(null);
                  setActiveTab('orders');
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.proceedCheckoutBtnText}>Go to My Orders</Text>
              </TouchableOpacity>
            </View>
          ) : cart.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="cart-outline" size={44} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Nothing to checkout</Text>
              <Text style={styles.emptySub}>Your cart is empty.</Text>
              <TouchableOpacity
                style={styles.continueShopButton}
                onPress={() => setActiveTab('store')}
                activeOpacity={0.8}
              >
                <Text style={styles.continueShopButtonText}>← Browse Store</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 16 }}>
              {/* Top Back link & Checkout Title */}
              <View>
                <TouchableOpacity
                  style={styles.checkoutBackBtn}
                  onPress={() => setActiveTab('cart')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={15} color="#9A3412" />
                  <Text style={styles.checkoutBackText}>Back to cart</Text>
                </TouchableOpacity>
                <Text style={styles.checkoutPageTitle}>Checkout</Text>
                <Text style={styles.webHeaderSub}>Confirm your order and payment.</Text>
              </View>

              {/* Card 1: Fulfilment (How would you like to receive it?) */}
              <View style={styles.checkoutCard}>
                <Text style={styles.checkoutCardHeading}>How would you like to receive it?</Text>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    style={[styles.fulfilmentCard, fulfilmentType === 'Gym Pickup' && styles.fulfilmentCardActive]}
                    onPress={() => setFulfilmentType('Gym Pickup')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="location-outline" size={22} color="#EA580C" />
                    <Text style={styles.fulfilmentCardTitle}>Gym Pickup</Text>
                    <Text style={styles.fulfilmentCardDesc}>Collect from the gym at your convenience.</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.fulfilmentCard, fulfilmentType === 'Delivery' && styles.fulfilmentCardActive]}
                    onPress={() => setFulfilmentType('Delivery')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="car-outline" size={22} color="#EA580C" />
                    <Text style={styles.fulfilmentCardTitle}>Delivery</Text>
                    <Text style={styles.fulfilmentCardDesc}>Get it delivered to your address.</Text>
                  </TouchableOpacity>
                </View>

                {fulfilmentType === 'Delivery' && (
                  <View style={styles.deliveryFormWrap}>
                    <View style={styles.deliveryRow2}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.deliveryFieldLabel}>FULL NAME *</Text>
                        <TextInput
                          style={styles.deliveryInput}
                          value={delivery.name}
                          onChangeText={(txt) => setDelivery(prev => ({ ...prev, name: txt }))}
                          placeholder="Receiver name"
                          placeholderTextColor="#94A3B8"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.deliveryFieldLabel}>PHONE *</Text>
                        <TextInput
                          style={styles.deliveryInput}
                          value={delivery.phone}
                          onChangeText={(txt) => setDelivery(prev => ({ ...prev, phone: sanitizeTenDigitPhone(txt) }))}
                          placeholder="10-digit mobile"
                          placeholderTextColor="#94A3B8"
                          keyboardType="number-pad"
                          maxLength={10}
                        />
                      </View>
                    </View>

                    <View>
                      <Text style={styles.deliveryFieldLabel}>ADDRESS *</Text>
                      <TextInput
                        style={styles.deliveryInput}
                        value={delivery.address}
                        onChangeText={(txt) => setDelivery(prev => ({ ...prev, address: txt }))}
                        placeholder="House no, street, area"
                        placeholderTextColor="#94A3B8"
                      />
                    </View>

                    <View style={styles.deliveryRow2}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.deliveryFieldLabel}>CITY *</Text>
                        <TextInput
                          style={styles.deliveryInput}
                          value={delivery.city}
                          onChangeText={(txt) => setDelivery(prev => ({ ...prev, city: txt }))}
                          placeholder="City"
                          placeholderTextColor="#94A3B8"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.deliveryFieldLabel}>STATE *</Text>
                        <TextInput
                          style={styles.deliveryInput}
                          value={delivery.state}
                          onChangeText={(txt) => setDelivery(prev => ({ ...prev, state: txt }))}
                          placeholder="State"
                          placeholderTextColor="#94A3B8"
                        />
                      </View>
                    </View>

                    <View style={{ width: '50%', paddingRight: 5 }}>
                      <Text style={styles.deliveryFieldLabel}>PINCODE *</Text>
                      <TextInput
                        style={styles.deliveryInput}
                        value={delivery.pinCode}
                        onChangeText={(txt) => setDelivery(prev => ({ ...prev, pinCode: txt.replace(/\D/g, '').slice(0, 6) }))}
                        placeholder="6-digit pincode"
                        placeholderTextColor="#94A3B8"
                        keyboardType="number-pad"
                        maxLength={6}
                      />
                    </View>
                  </View>
                )}
              </View>

              {/* Card 2: Payment Method */}
              <View style={styles.checkoutCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Ionicons name="card-outline" size={19} color="#EA580C" />
                  <Text style={[styles.checkoutCardHeading, { marginBottom: 0 }]}>Payment Method</Text>
                </View>

                <View style={styles.payGrid}>
                  {CHECKOUT_PAYMENT_METHODS.filter(m => fulfilmentType === 'Delivery' ? m !== 'Cash at Gym' : true).map((method) => {
                    const isSelected = paymentMethod === method;
                    return (
                      <TouchableOpacity
                        key={method}
                        style={[styles.payGridCard, isSelected && styles.payGridCardActive]}
                        onPress={() => setPaymentMethod(method)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.payGridLabel, isSelected && styles.payGridLabelActive]} numberOfLines={1}>
                          {method}
                        </Text>
                        <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                          {isSelected && <View style={styles.radioDotInner} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Dynamic Payment Method Sub-panel */}
                <View style={styles.paymentDetailBox}>
                  {paymentMethod === 'UPI' && (
                    <View style={{ gap: 14 }}>
                      <View style={{ gap: 10 }}>
                        <Text style={styles.paymentSubHeading}>Pay using UPI App</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {UPI_APPS.map((app) => {
                            const activeApp = selectedUpiApp === app;
                            return (
                              <TouchableOpacity
                                key={app}
                                style={[styles.upiAppPill, activeApp && styles.upiAppPillActive]}
                                onPress={() => setSelectedUpiApp(app)}
                                activeOpacity={0.75}
                              >
                                <Text style={[styles.upiAppPillText, activeApp && styles.upiAppPillTextActive]}>{app}</Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>

                        <View style={styles.orDividerRow}>
                          <View style={styles.orDividerLine} />
                          <Text style={styles.orDividerText}>OR</Text>
                          <View style={styles.orDividerLine} />
                        </View>

                        <View>
                          <Text style={styles.deliveryFieldLabel}>ENTER UPI ID</Text>
                          <TextInput
                            style={[styles.deliveryInput, { backgroundColor: '#FFFFFF' }]}
                            value={upiId}
                            onChangeText={setUpiId}
                            placeholder="e.g. yourname@bank"
                            placeholderTextColor="#94A3B8"
                            autoCapitalize="none"
                          />
                        </View>
                      </View>

                      <View style={styles.qrSectionBox}>
                        <ScannableQRCode
                          value={`upi://pay?pa=aigymstore@ybl&pn=AI%20Gym%20Store&am=${finalTotal}&cu=INR`}
                          size={104}
                          showScannerCorners={true}
                          showScanBeam={false}
                          centerBadgeIcon=""
                        />
                        <Text style={styles.qrScanTitle}>Scan QR to Pay</Text>
                        <Text style={styles.qrScanSub}>ANY UPI APP</Text>
                      </View>
                    </View>
                  )}

                  {paymentMethod === 'Credit / Debit Card' && (
                    <View style={{ gap: 10 }}>
                      <Text style={styles.paymentSubHeading}>Enter Card Details</Text>
                      <View>
                        <Text style={styles.deliveryFieldLabel}>CARD NUMBER</Text>
                        <TextInput
                          style={[styles.deliveryInput, { backgroundColor: '#FFFFFF' }]}
                          value={cardDetails.number}
                          onChangeText={(txt) => setCardDetails(prev => ({ ...prev, number: txt.slice(0, 19) }))}
                          placeholder="XXXX XXXX XXXX XXXX"
                          placeholderTextColor="#94A3B8"
                          keyboardType="number-pad"
                          maxLength={19}
                        />
                      </View>
                      <View>
                        <Text style={styles.deliveryFieldLabel}>NAME ON CARD</Text>
                        <TextInput
                          style={[styles.deliveryInput, { backgroundColor: '#FFFFFF' }]}
                          value={cardDetails.name}
                          onChangeText={(txt) => setCardDetails(prev => ({ ...prev, name: txt }))}
                          placeholder="John Doe"
                          placeholderTextColor="#94A3B8"
                        />
                      </View>
                      <View style={styles.deliveryRow2}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.deliveryFieldLabel}>EXPIRY (MM/YY)</Text>
                          <TextInput
                            style={[styles.deliveryInput, { backgroundColor: '#FFFFFF' }]}
                            value={cardDetails.expiry}
                            onChangeText={(txt) => setCardDetails(prev => ({ ...prev, expiry: txt.slice(0, 5) }))}
                            placeholder="MM/YY"
                            placeholderTextColor="#94A3B8"
                            maxLength={5}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.deliveryFieldLabel}>CVV</Text>
                          <TextInput
                            style={[styles.deliveryInput, { backgroundColor: '#FFFFFF' }]}
                            value={cardDetails.cvv}
                            onChangeText={(txt) => setCardDetails(prev => ({ ...prev, cvv: txt.replace(/\D/g, '').slice(0, 4) }))}
                            placeholder="***"
                            placeholderTextColor="#94A3B8"
                            keyboardType="number-pad"
                            secureTextEntry
                            maxLength={4}
                          />
                        </View>
                      </View>
                    </View>
                  )}

                  {paymentMethod === 'Net Banking' && (
                    <View style={{ gap: 10 }}>
                      <Text style={styles.paymentSubHeading}>Select your Bank</Text>
                      <TouchableOpacity
                        style={styles.bankPickerBtn}
                        onPress={() => setShowBankPicker(prev => !prev)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.bankPickerBtnText, !bankName && { color: '#64748B' }]}>
                          {bankName || 'Choose a bank...'}
                        </Text>
                        <Ionicons name={showBankPicker ? 'chevron-up' : 'chevron-down'} size={16} color="#64748B" />
                      </TouchableOpacity>

                      {showBankPicker && (
                        <View style={styles.bankDropdownList}>
                          {NET_BANKING_BANKS.map((bank) => (
                            <TouchableOpacity
                              key={bank}
                              style={[styles.bankOptionRow, bankName === bank && styles.bankOptionRowActive]}
                              onPress={() => {
                                setBankName(bank);
                                setShowBankPicker(false);
                              }}
                              activeOpacity={0.75}
                            >
                              <Text style={[styles.bankOptionText, bankName === bank && { color: '#EA580C', fontWeight: '800' }]}>
                                {bank}
                              </Text>
                              {bankName === bank && <Ionicons name="checkmark" size={16} color="#EA580C" />}
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}

                      {!bankName && (
                        <Text style={styles.bankWarningText}>Please select a bank to continue</Text>
                      )}
                    </View>
                  )}

                  {paymentMethod === 'Cash at Gym' && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={styles.cashIconCircle}>
                        <Ionicons name="checkmark-circle-outline" size={20} color="#EA580C" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.paymentSubHeading}>Pay at Front Desk</Text>
                        <Text style={styles.cashSubDesc}>
                          Your order will be reserved. Please pay by cash or card when you pick up your items.
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>

              {/* Card 3: Order Summary */}
              <View style={styles.checkoutCard}>
                <Text style={styles.checkoutCardHeading}>Order Summary</Text>

                {/* Itemized Lines */}
                <View style={{ gap: 10 }}>
                  {cart.map((item, idx) => (
                    <View key={`${item._id || item.productId}-${idx}`} style={styles.checkoutItemLine}>
                      <Text style={styles.checkoutItemLineName} numberOfLines={2}>
                        {item.name}
                        {item.attributes ? ` (${item.attributes})` : item.category ? ` (${item.category})` : ''} × {item.quantity}
                      </Text>
                      <Text style={styles.checkoutItemLinePrice}>₹{item.price * item.quantity}</Text>
                    </View>
                  ))}
                </View>

                {/* Referral Points Redemption Box */}
                {rewardSettings?.enableStorePurchase && pointsBalance > 0 && (
                  <View style={styles.referralBox}>
                    <TouchableOpacity
                      style={styles.referralHeaderRow}
                      onPress={() => setUsePoints(prev => !prev)}
                      activeOpacity={0.8}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={[styles.checkboxSquare, usePoints && styles.checkboxSquareActive]}>
                          {usePoints && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                        </View>
                        <Ionicons name="cash-outline" size={14} color="#EA580C" />
                        <Text style={styles.referralTitle}>Use Referral Points</Text>
                      </View>
                      <Text style={styles.referralAvailableText}>{pointsBalance} pts available</Text>
                    </TouchableOpacity>

                    {usePoints && (
                      <View style={styles.referralExpanded}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={styles.referralMetaText}>Points to Redeem:</Text>
                          <Text style={[styles.referralMetaText, { fontWeight: '800', color: '#111827' }]}>
                            {pointsToRedeem} pts
                          </Text>
                        </View>

                        <View style={styles.pointsStepperRow}>
                          <TouchableOpacity
                            style={styles.pointsStepBtn}
                            onPress={() => {
                              const minPts = Math.min(rewardSettings.minPointsForRedemption || 100, pointsBalance);
                              setPointsToRedeem(prev => Math.max(minPts, prev - 10));
                            }}
                          >
                            <Text style={styles.pointsStepBtnText}>-10</Text>
                          </TouchableOpacity>
                          <View style={styles.pointsTrackBg}>
                            <View
                              style={[
                                styles.pointsTrackFill,
                                { width: `${Math.min(100, Math.round((pointsToRedeem / Math.max(1, pointsBalance)) * 100))}%` },
                              ]}
                            />
                          </View>
                          <TouchableOpacity
                            style={styles.pointsStepBtn}
                            onPress={() => setPointsToRedeem(prev => Math.min(pointsBalance, prev + 10))}
                          >
                            <Text style={styles.pointsStepBtnText}>+10</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.pointsMaxBtn}
                            onPress={() => setPointsToRedeem(pointsBalance)}
                          >
                            <Text style={styles.pointsMaxBtnText}>Max</Text>
                          </TouchableOpacity>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={styles.referralMetaText}>
                            Rate: {convUnit} pts = ₹{rupeeUnit}
                          </Text>
                          <Text style={styles.referralDiscountBadge}>
                            ✨ Discount: ₹{pointsDiscount}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* Subtotal / Discounts / Total */}
                <View style={styles.checkoutTotalsDivider}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryVal}>₹{cartSubtotal}</Text>
                  </View>

                  {discountAmount > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: '#16A34A' }]}>Premium Discount (30%)</Text>
                      <Text style={[styles.summaryVal, { color: '#16A34A' }]}>-₹{discountAmount}</Text>
                    </View>
                  )}

                  {pointsDiscount > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: '#15803D' }]}>Referral Points Discount</Text>
                      <Text style={[styles.summaryVal, { color: '#15803D' }]}>-₹{pointsDiscount}</Text>
                    </View>
                  )}

                  <View style={[styles.summaryRow, { marginTop: 4, marginBottom: 0 }]}>
                    <Text style={styles.checkoutTotalLabel}>Total</Text>
                    <Text style={styles.checkoutTotalVal}>₹{finalTotal}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.proceedCheckoutBtn, isCheckingOut && { opacity: 0.6 }]}
                  onPress={handleConfirmOrder}
                  disabled={isCheckingOut}
                  activeOpacity={0.85}
                >
                  {isCheckingOut ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                      <Text style={styles.proceedCheckoutBtnText}>Pay ₹{finalTotal} & Place Order</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* ======================================================== */}
      {/* 3. MY ORDERS TAB (Matching Web Page 5 & 7) */}
      {/* ======================================================== */}
      {activeTab === 'orders' && (
        <ScrollView 
          style={styles.contentScroll} 
          contentContainerStyle={{ padding: 14, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        >
          {/* Header Matching Web Page 5 */}
          <View style={{ marginBottom: 12 }}>
            <Text style={styles.webHeaderTitle}>My Orders</Text>
            <Text style={styles.webHeaderSub}>Track your gym store orders from placement to pickup/delivery.</Text>
          </View>

          {/* Status Filter Tabs Matching Web Page 5 */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.orderFilterScroll}>
            {[
              'All Orders',
              'Pending',
              'Confirmed',
              'Preparing',
              'Ready for Pickup',
              'Out for Delivery',
              'Completed',
              'Cancelled / Refunded',
            ].map(filter => {
              const isSelected = orderFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  style={[styles.orderFilterPill, isSelected && styles.orderFilterPillActive]}
                  onPress={() => setOrderFilter(filter)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.orderFilterPillText, isSelected && styles.orderFilterPillTextActive]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Orders List Matching Web Page 5 */}
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="receipt-outline" size={44} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No Orders Found</Text>
              <Text style={styles.emptySub}>No orders matching {orderFilter}.</Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {filteredOrders.map(order => (
                <View key={order._id} style={styles.orderWebCard}>
                  {/* Left Badges & ID */}
                  <View style={styles.orderWebTopRow}>
                    <View style={styles.itemCountBadge}>
                      <Text style={styles.itemCountBadgeText}>{order.itemCount || 1} ITEMS</Text>
                    </View>
                    <Text style={styles.orderWebNumber}>{order.orderNumber}</Text>
                    <Text style={styles.orderWebAmount}>₹{order.total}</Text>
                  </View>

                  <View style={styles.orderWebMetaRow}>
                    <Text style={styles.orderWebDate}>{order.dateDisplay}</Text>
                    <View style={styles.fulfilmentPill}>
                      <Ionicons name={order.fulfilmentType === 'Delivery' ? 'car-outline' : 'storefront-outline'} size={12} color="#64748B" />
                      <Text style={styles.fulfilmentPillText}>{order.fulfilmentType}</Text>
                    </View>

                    <View style={[styles.statusBadgeGreen, order.status === 'Preparing' && { backgroundColor: '#FFF7ED', borderColor: '#FFEDD5' }]}>
                      <Text style={[styles.statusBadgeGreenText, order.status === 'Preparing' && { color: '#EA580C' }]}>
                        {order.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {/* Buttons: View Details, Track Order, and Download PDF */}
                  <View style={styles.orderWebActionRow}>
                    <TouchableOpacity
                      style={styles.orderWebDetailsBtn}
                      onPress={() => setSelectedOrderForDetails(order)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="eye-outline" size={14} color="#475569" />
                      <Text style={styles.orderWebDetailsBtnText}>View Details</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.paymentPdfBtn}
                      onPress={() => handleDownloadInvoice(order)}
                      activeOpacity={0.8}
                      disabled={downloadingPdfId === (order._id || order.orderNumber)}
                    >
                      {downloadingPdfId === (order._id || order.orderNumber) ? (
                        <ActivityIndicator size="small" color="#FFFFFF" style={{ transform: [{ scale: 0.75 }] }} />
                      ) : (
                        <>
                          <Ionicons name="download-outline" size={13} color="#FFFFFF" />
                          <Text style={styles.paymentPdfBtnText}>Download PDF</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.orderWebTrackBtn}
                      onPress={() => setSelectedOrderForTracking(order)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="navigate-outline" size={14} color="#FFFFFF" />
                      <Text style={styles.orderWebTrackBtnText}>Track Order</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* ======================================================== */}
      {/* 4. PAYMENT HISTORY TAB (Matching Web Page 8) */}
      {/* ======================================================== */}
      {activeTab === 'payments' && (
        <ScrollView 
          style={styles.contentScroll} 
          contentContainerStyle={{ padding: 14, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        >
          {/* Header Matching Web Page 8 */}
          <View style={{ marginBottom: 12 }}>
            <Text style={styles.webHeaderTitle}>Store Payment History</Text>
            <Text style={styles.webHeaderSub}>Track your payments for all Gym Store orders.</Text>
          </View>

          {/* Filter Tabs Matching Web Page 8 */}
          <View style={styles.paymentFilterRow}>
            {['All Payments', 'Paid', 'Refunded', 'Failed'].map((filter) => {
              const isSelected = paymentFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  style={[styles.paymentFilterPill, isSelected && styles.paymentFilterPillActive]}
                  onPress={() => setPaymentFilter(filter as any)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.paymentFilterPillText, isSelected && styles.paymentFilterPillTextActive]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Payment History List Matching Web Page 8 Table */}
          {filteredPayments.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="card-outline" size={44} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No Payments Found</Text>
              <Text style={styles.emptySub}>No payment history for {paymentFilter}.</Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {filteredPayments.map((p) => (
                <View key={p._id} style={styles.paymentWebCard}>
                  {/* Date & Order Number */}
                  <View style={styles.paymentWebTopRow}>
                    <View>
                      <Text style={styles.paymentWebDate}>{p.dateDisplay}</Text>
                      <Text style={styles.paymentWebOrderNum}>{p.orderNumber}</Text>
                      <Text style={styles.paymentWebType}>({p.fulfilmentType.toUpperCase()})</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.paymentWebAmount}>₹{p.total}</Text>
                      <View style={styles.paidDotRow}>
                        <View style={styles.paidDot} />
                        <Text style={styles.paidDotText}>{p.paymentStatus || 'Paid'}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Method & Action Buttons Matching Web Page 8 */}
                  <View style={styles.paymentWebBottomRow}>
                    <View style={styles.paymentMethodPill}>
                      <Ionicons name="phone-portrait-outline" size={13} color="#64748B" />
                      <Text style={styles.paymentMethodText}>{p.paymentMethod || 'UPI'}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        style={styles.paymentViewBtn}
                        onPress={() => setSelectedPaymentForReceipt(p)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="eye-outline" size={13} color="#475569" />
                        <Text style={styles.paymentViewBtnText}>View</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.paymentPdfBtn}
                        onPress={() => handleDownloadInvoice(p)}
                        activeOpacity={0.8}
                        disabled={downloadingPdfId === (p._id || p.orderNumber)}
                      >
                        {downloadingPdfId === (p._id || p.orderNumber) ? (
                          <ActivityIndicator size="small" color="#FFFFFF" style={{ transform: [{ scale: 0.75 }] }} />
                        ) : (
                          <>
                            <Ionicons name="download-outline" size={13} color="#FFFFFF" />
                            <Text style={styles.paymentPdfBtnText}>Download PDF</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: PRODUCT DETAILS MODAL (View Button Action) */}
      {/* ======================================================== */}
      <Modal visible={Boolean(selectedProduct)} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>{selectedProduct?.name}</Text>
              <TouchableOpacity onPress={() => setSelectedProduct(null)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {selectedProduct && (
              <ScrollView style={{ padding: 16 }}>
                <View style={styles.productModalImgBox}>
                  {resolveMediaUrl(selectedProduct.image) && !failedProductImgKeys[`${selectedProduct._id}:${selectedProduct.image}`] ? (
                    <Image
                      source={{ uri: resolveMediaUrl(selectedProduct.image) }}
                      style={styles.productModalImg}
                      resizeMode="contain"
                      onError={() =>
                        setFailedProductImgKeys((prev) => ({
                          ...prev,
                          [`${selectedProduct._id}:${selectedProduct.image}`]: true,
                        }))
                      }
                    />
                  ) : (
                    <Ionicons name="cube-outline" size={54} color="#CBD5E1" />
                  )}
                </View>

                <Text style={styles.productModalBrand}>{selectedProduct.brand} • {selectedProduct.categoryName}</Text>
                <Text style={styles.productModalTitle}>{selectedProduct.name}</Text>
                <Text style={styles.productModalDesc}>{selectedProduct.description}</Text>

                <View style={styles.productModalPriceRow}>
                  <Text style={styles.productModalPriceMain}>
                    ₹{(selectedVariant
                      ? (selectedVariant.finalPrice ?? Math.max(0, Number(selectedVariant.price || 0) - Number(selectedVariant.discountPrice || 0)))
                      : (selectedProduct.displayPrice ?? selectedProduct.sellingPrice)
                    ).toLocaleString('en-IN')}
                  </Text>
                  {selectedVariant ? (
                    Number(selectedVariant.discountPrice || 0) > 0 && (
                      <Text style={styles.productModalPriceStrike}>₹{Number(selectedVariant.price || 0).toLocaleString('en-IN')}</Text>
                    )
                  ) : selectedProduct.discountPrice && selectedProduct.sellingPrice > (selectedProduct.displayPrice ?? selectedProduct.sellingPrice) ? (
                    <Text style={styles.productModalPriceStrike}>₹{Number(selectedProduct.sellingPrice).toLocaleString('en-IN')}</Text>
                  ) : null}
                </View>

                {/* Variants Selector if clothing/merch */}
                {selectedProduct.hasVariants && (
                  <View style={{ marginTop: 14 }}>
                    <Text style={styles.modalSectionLabel}>CHOOSE SIZE / VARIANT</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                      {selectedProduct.variants?.map((v: any) => {
                        const isVSelected = selectedVariant?._id === v._id;
                        const vDisplayPrice = v.finalPrice ?? Math.max(0, Number(v.price || 0) - Number(v.discountPrice || 0));
                        const vLabel = v.name || Object.values(v.attributes || {}).join(' / ') || v.sku || 'Variant';
                        return (
                          <TouchableOpacity
                            key={v._id || vLabel}
                            style={[styles.variantPill, isVSelected && styles.variantPillActive]}
                            onPress={() => setSelectedVariant(v)}
                          >
                            <Text style={[styles.variantPillText, isVSelected && styles.variantPillTextActive]}>
                              {vLabel} (₹{vDisplayPrice})
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Quantity */}
                <View style={{ marginTop: 14 }}>
                  <Text style={styles.modalSectionLabel}>QUANTITY</Text>
                  <View style={styles.cartStepperRow}>
                    <TouchableOpacity style={styles.stepperBtn} onPress={() => setModalQty(q => Math.max(1, q - 1))}>
                      <Ionicons name="remove" size={14} color="#334155" />
                    </TouchableOpacity>
                    <Text style={styles.stepperText}>{modalQty}</Text>
                    <TouchableOpacity style={styles.stepperBtn} onPress={() => setModalQty(q => q + 1)}>
                      <Ionicons name="add" size={14} color="#334155" />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.modalAddCartBtn}
                  onPress={() => handleAddToCart(selectedProduct, modalQty, selectedVariant)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="cart" size={16} color="#FFFFFF" />
                  <Text style={styles.modalAddCartBtnText}>Add {modalQty} to Cart</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 3: TRACK ORDER ZIGZAG TIMELINE (Matching Web Page 7) */}
      {/* ======================================================== */}
      <Modal visible={Boolean(selectedOrderForTracking)} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="navigate-circle" size={18} color="#EA580C" />
                  <Text style={styles.modalTitle}>Track Order</Text>
                </View>
                <Text style={styles.modalOrderNumberSub}>
                  {selectedOrderForTracking?.orderNumber} • {selectedOrderForTracking?.fulfilmentType}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedOrderForTracking(null)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {selectedOrderForTracking && (
              <ScrollView style={{ padding: 16 }}>
                {/* Status Badge */}
                <View style={styles.trackTopStatusBadge}>
                  <Text style={styles.trackTopStatusText}>Status: {selectedOrderForTracking.status}</Text>
                  <Text style={styles.trackPlacedSub}>Placed {selectedOrderForTracking.dateDisplay}</Text>
                </View>

                {/* Zigzag Timeline Matching Web Page 7 */}
                <View style={styles.zigzagContainer}>
                  {/* Center vertical line */}
                  <View style={styles.centerTimelineLine} />

                  {getMobileTrackingTimeline(selectedOrderForTracking).map((step: any, idx: number) => {
                    const isLeft = idx % 2 === 0;
                    const isCancelled = Boolean(step.isCancelled);
                    const isCurrent = Boolean(step.isCurrent);
                    const isReached = Boolean(step.completed);
                    const isFuture = Boolean(step.future);

                    const stepCard = (
                      <View style={[
                        styles.timelineStepCard,
                        isCurrent && styles.timelineStepCardCurrent,
                        isCancelled && styles.timelineStepCardCancelled,
                        isFuture && styles.timelineStepCardFuture,
                      ]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                          <Text style={[
                            styles.timelineStepStatus,
                            isCurrent && { color: '#EA580C', fontWeight: '900' },
                            isCancelled && { color: '#DC2626' },
                            isFuture && { color: '#94A3B8' },
                          ]} numberOfLines={1}>
                            {step.label || step.status}
                          </Text>
                          {isCurrent && (
                            <View style={styles.currentStepPill}>
                              <Text style={styles.currentStepPillText}>Current</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.timelineStepTime, isFuture && { color: '#CBD5E1' }]}>{step.time}</Text>
                        <Text style={[styles.timelineStepNote, isFuture && { color: '#94A3B8' }]}>{step.note}</Text>
                      </View>
                    );

                    return (
                      <View key={idx} style={styles.timelineRow}>
                        {/* Left Column */}
                        <View style={styles.timelineColSide}>
                          {isLeft ? stepCard : null}
                        </View>

                        {/* Center Dot Circle */}
                        <View style={[
                          styles.centerDotCircle,
                          isCancelled && { backgroundColor: '#EF4444' },
                          isCurrent && { backgroundColor: '#EA580C' },
                          isReached && !isCurrent && !isCancelled && { backgroundColor: '#16A34A' },
                          isFuture && { backgroundColor: '#FFFFFF', borderColor: '#CBD5E1' },
                        ]}>
                          {isCancelled ? (
                            <Ionicons name="close" size={12} color="#FFFFFF" />
                          ) : isCurrent ? (
                            <Ionicons name="radio-button-on" size={13} color="#FFFFFF" />
                          ) : isReached ? (
                            <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                          ) : (
                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#CBD5E1' }} />
                          )}
                        </View>

                        {/* Right Column */}
                        <View style={styles.timelineColSide}>
                          {!isLeft ? stepCard : null}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalCloseBtn}
                onPress={() => setSelectedOrderForTracking(null)}
              >
                <Text style={styles.modalCloseBtnText}>Close Tracker</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 4: ORDER DETAILS (View Details Action) */}
      {/* ======================================================== */}
      <Modal visible={Boolean(selectedOrderForDetails)} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Details</Text>
              <TouchableOpacity onPress={() => setSelectedOrderForDetails(null)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {selectedOrderForDetails && (
              <ScrollView style={{ padding: 16 }}>
                <Text style={styles.detailOrderNum}>{selectedOrderForDetails.orderNumber}</Text>
                <Text style={styles.detailOrderDate}>Placed: {selectedOrderForDetails.dateDisplay}</Text>
                <Text style={styles.detailOrderFulfilment}>Fulfilment: {selectedOrderForDetails.fulfilmentType} • {selectedOrderForDetails.paymentMethod}</Text>

                <Text style={[styles.modalSectionLabel, { marginTop: 14 }]}>ORDERED ITEMS</Text>
                {selectedOrderForDetails.items?.map((it: any, i: number) => (
                  <View key={i} style={styles.detailItemRow}>
                    <Text style={styles.detailItemName}>{it.name} × {it.quantity}</Text>
                    <Text style={styles.detailItemPrice}>₹{it.price * it.quantity}</Text>
                  </View>
                ))}

                <View style={styles.detailTotalRow}>
                  <Text style={styles.detailTotalLabel}>Grand Total</Text>
                  <Text style={styles.detailTotalVal}>₹{selectedOrderForDetails.total}</Text>
                </View>
              </ScrollView>
            )}

            <View style={styles.modalFooterSingleBtn}>
              <TouchableOpacity 
                style={styles.modalClosePrimaryBtn}
                onPress={() => setSelectedOrderForDetails(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalClosePrimaryBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 5: PAYMENT RECEIPT & PDF INVOICE (Matching Web Page 8 & 10) */}
      {/* ======================================================== */}
      <Modal visible={Boolean(selectedPaymentForReceipt || pdfReceiptModal)} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {pdfReceiptModal ? 'Tax Invoice Receipt' : 'Payment Receipt'}
              </Text>
              <TouchableOpacity onPress={() => { setSelectedPaymentForReceipt(null); setPdfReceiptModal(null); }}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {(selectedPaymentForReceipt || pdfReceiptModal) && (
              <ScrollView style={{ padding: 16 }}>
                <View style={styles.receiptHeaderBox}>
                  <Text style={styles.receiptBrand}>Gymora Store</Text>
                  <Text style={styles.receiptSub}>Official Payment Receipt</Text>
                  <Text style={styles.receiptNum}>{(selectedPaymentForReceipt || pdfReceiptModal).orderNumber}</Text>
                </View>

                <View style={styles.receiptInfoGrid}>
                  <View style={styles.receiptInfoRow}>
                    <Text style={styles.receiptLabel}>Transaction Date</Text>
                    <Text style={styles.receiptVal}>{(selectedPaymentForReceipt || pdfReceiptModal).dateDisplay}</Text>
                  </View>
                  <View style={styles.receiptInfoRow}>
                    <Text style={styles.receiptLabel}>Payment Method</Text>
                    <Text style={styles.receiptVal}>{(selectedPaymentForReceipt || pdfReceiptModal).paymentMethod || 'UPI'}</Text>
                  </View>
                  <View style={styles.receiptInfoRow}>
                    <Text style={styles.receiptLabel}>Fulfilment Type</Text>
                    <Text style={styles.receiptVal}>{(selectedPaymentForReceipt || pdfReceiptModal).fulfilmentType}</Text>
                  </View>
                  <View style={styles.receiptInfoRow}>
                    <Text style={styles.receiptLabel}>Payment Status</Text>
                    <Text style={[styles.receiptVal, { color: '#16A34A' }]}>PAID / VERIFIED</Text>
                  </View>
                  <View style={[styles.receiptInfoRow, { borderBottomWidth: 0, marginTop: 10 }]}>
                    <Text style={styles.receiptTotalLabel}>Total Paid</Text>
                    <Text style={styles.receiptTotalVal}>₹{(selectedPaymentForReceipt || pdfReceiptModal).total}</Text>
                  </View>
                </View>
              </ScrollView>
            )}

            <View style={styles.modalFooterSingleBtn}>
              <TouchableOpacity 
                style={styles.modalClosePrimaryBtn}
                onPress={() => { setSelectedPaymentForReceipt(null); setPdfReceiptModal(null); }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalClosePrimaryBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // Sub Tab Navigation Bar matching Web MemberStoreTabs
  subTabBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
  },
  subTabsContainer: {
    paddingHorizontal: 12,
    gap: 8,
  },
  subTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  subTabBtnActive: {
    backgroundColor: '#EA580C',
  },
  subTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  subTabTextActive: {
    color: '#FFFFFF',
  },
  cartBadgePill: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  cartBadgePillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  contentScroll: { flex: 1 },

  // Web Header & Cart Button Matching Web Page 1
  webHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  webHeaderTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },
  webHeaderSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  webCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EA580C',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    position: 'relative',
  },
  webCartButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  webCartBadgeCount: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 10,
    marginLeft: 2,
  },
  webCartBadgeCountText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#EA580C',
  },

  // Search & Category
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 13,
    color: '#111827',
    marginLeft: 6,
  },
  categoryScroll: {
    gap: 6,
    marginBottom: 14,
  },
  categoryPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryPillActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },

  // Products Grid
  productsGrid: {
    gap: 12,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    overflow: 'hidden',
  },
  productImageContainer: {
    height: 150,
    backgroundColor: '#F8FAFC',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  productFallbackText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  inStockBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  inStockBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16A34A',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EA580C',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  discountBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  productContent: {
    padding: 14,
  },
  productTypeBrandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  productTypeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
  },
  productBrandText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  productName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  productAttrsRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 4,
  },
  productAttrText: {
    fontSize: 11,
    color: '#64748B',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginVertical: 6,
  },
  mainPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  strikePrice: {
    fontSize: 13,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  productActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  viewDetailsBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    borderRadius: 10,
  },
  viewDetailsBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  addCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#EA580C',
    paddingVertical: 8,
    borderRadius: 10,
  },
  addCartBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  optionsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#EA580C',
    paddingVertical: 8,
    borderRadius: 10,
  },
  optionsBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Cart View Matching Web Page 3
  clearCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  clearCartButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },
  cartItemCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartThumbBox: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cartThumbImage: {
    width: '100%',
    height: '100%',
  },
  cartItemName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  cartItemCategory: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  cartStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  stepperBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  cartItemPriceTotal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  orderSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 16,
  },
  orderSummaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  summaryTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 6,
    paddingTop: 10,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  summaryTotalVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#EA580C',
  },
  proceedCheckoutBtn: {
    backgroundColor: '#EA580C',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  proceedCheckoutBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  continueShopLinkBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  continueShopLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },

  // Orders Tab
  orderFilterScroll: {
    gap: 6,
    marginBottom: 14,
  },
  orderFilterPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  orderFilterPillActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  orderFilterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  orderFilterPillTextActive: {
    color: '#FFFFFF',
  },
  orderWebCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
  },
  orderWebTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  itemCountBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  itemCountBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },
  orderWebNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
    marginLeft: 8,
  },
  orderWebAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#EA580C',
  },
  orderWebMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  orderWebDate: {
    fontSize: 11,
    color: '#64748B',
  },
  fulfilmentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  fulfilmentPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  statusBadgeGreen: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeGreenText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  orderWebActionRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  orderWebDetailsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    borderRadius: 10,
  },
  orderWebDetailsBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  orderWebTrackBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#EA580C',
    paddingVertical: 8,
    borderRadius: 10,
  },
  orderWebTrackBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Payment History
  paymentFilterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  paymentFilterPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  paymentFilterPillActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  paymentFilterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  paymentFilterPillTextActive: {
    color: '#FFFFFF',
  },
  paymentWebCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
  },
  paymentWebTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paymentWebDate: {
    fontSize: 11,
    color: '#64748B',
  },
  paymentWebOrderNum: {
    fontSize: 13,
    fontWeight: '800',
    color: '#EA580C',
    marginTop: 2,
  },
  paymentWebType: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
  },
  paymentWebAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  paidDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  paidDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  paidDotText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16A34A',
  },
  paymentWebBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  paymentMethodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  paymentMethodText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  paymentViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  paymentViewBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  paymentPdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EA580C',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  paymentPdfBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  modalOrderNumberSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  modalCloseBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  modalFooterSingleBtn: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  modalClosePrimaryBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalClosePrimaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  modalFooterTwoBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  modalDownloadPdfBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EA580C',
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalDownloadPdfBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalCloseSecondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseSecondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  modalSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  productModalImgBox: {
    height: 160,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  productModalImg: {
    width: '100%',
    height: '100%',
  },
  productModalBrand: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  productModalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginTop: 2,
  },
  productModalDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 4,
  },
  productModalPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginVertical: 12,
  },
  productModalPriceMain: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },
  productModalPriceStrike: {
    fontSize: 14,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  variantPill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  variantPillActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  variantPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  variantPillTextActive: {
    color: '#FFFFFF',
  },
  modalAddCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EA580C',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 18,
  },
  modalAddCartBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  fulfilmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    borderRadius: 10,
  },
  fulfilmentBtnActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
  },
  fulfilmentBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  fulfilmentBtnTextActive: {
    color: '#EA580C',
  },
  payMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  payMethodOptionActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
  },
  payMethodText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  payMethodTextActive: {
    color: '#EA580C',
  },
  checkoutTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 14,
    paddingTop: 10,
  },
  checkoutTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  checkoutTotalVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#EA580C',
  },

  // Zigzag Tracking Timeline Matching Web Page 7
  trackTopStatusBadge: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  trackTopStatusText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#EA580C',
  },
  trackPlacedSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  zigzagContainer: {
    position: 'relative',
    paddingVertical: 10,
  },
  centerTimelineLine: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#E2E8F0',
    marginLeft: -1,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timelineColSide: {
    width: '44%',
  },
  timelineStepCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  timelineStepCardCurrent: {
    borderColor: '#EA580C',
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
  },
  timelineStepCardCancelled: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  timelineStepCardFuture: {
    borderColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
    opacity: 0.8,
  },
  currentStepPill: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  currentStepPillText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  timelineStepStatus: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  timelineStepTime: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
  },
  timelineStepNote: {
    fontSize: 10,
    color: '#475569',
    marginTop: 4,
    fontStyle: 'italic',
  },
  centerDotCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#16A34A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  // Detail Modal
  detailOrderNum: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  detailOrderDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  detailOrderFulfilment: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
    marginTop: 2,
  },
  detailItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailItemName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  detailItemPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EA580C',
  },
  detailTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  detailTotalLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111827',
  },
  detailTotalVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#EA580C',
  },

  // Receipt Modal
  receiptHeaderBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  receiptBrand: {
    fontSize: 18,
    fontWeight: '900',
    color: '#EA580C',
  },
  receiptSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  receiptNum: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    marginTop: 6,
  },
  receiptInfoGrid: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
  },
  receiptInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  receiptLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  receiptVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
  },
  receiptTotalLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111827',
  },
  receiptTotalVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#EA580C',
  },

  // Empty Card
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 30,
    alignItems: 'center',
    marginVertical: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
  continueShopButton: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 14,
  },
  continueShopButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Full Checkout Screen Styles (Matching Web MemberCheckout.tsx)
  checkoutBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  checkoutBackText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9A3412',
  },
  checkoutPageTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.4,
  },
  checkoutCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 16,
  },
  checkoutCardHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  fulfilmentCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  fulfilmentCardActive: {
    borderColor: '#FDBA74',
    backgroundColor: '#F8FAFC',
  },
  fulfilmentCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginTop: 8,
  },
  fulfilmentCardDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  deliveryFormWrap: {
    marginTop: 14,
    gap: 10,
  },
  deliveryRow2: {
    flexDirection: 'row',
    gap: 10,
  },
  deliveryFieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  deliveryInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#111827',
  },
  payGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  payGridCard: {
    width: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  payGridCardActive: {
    borderColor: '#FDBA74',
    backgroundColor: '#FFF7ED',
  },
  payGridLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    flex: 1,
    marginRight: 6,
  },
  payGridLabelActive: {
    color: '#EA580C',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#FDBA74',
  },
  radioDotInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#C2410C',
  },
  paymentDetailBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
  },
  paymentSubHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  upiAppPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
  },
  upiAppPillActive: {
    borderColor: '#FDBA74',
    backgroundColor: '#FFF7ED',
  },
  upiAppPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  upiAppPillTextActive: {
    color: '#EA580C',
  },
  orDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  orDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  orDividerText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#9A3412',
    letterSpacing: 0.8,
  },
  qrSectionBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  qrScanTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    marginTop: 4,
  },
  qrScanSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9A3412',
    letterSpacing: 0.6,
    marginTop: 2,
  },
  bankPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  bankPickerBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  bankDropdownList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  bankOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  bankOptionRowActive: {
    backgroundColor: '#FFF7ED',
  },
  bankOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  bankWarningText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97706',
  },
  cashIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cashSubDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  checkoutItemLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  checkoutItemLineName: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  checkoutItemLinePrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  referralBox: {
    marginTop: 14,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    gap: 10,
  },
  referralHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  checkboxSquare: {
    width: 17,
    height: 17,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSquareActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  referralTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  referralAvailableText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  referralExpanded: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
    gap: 8,
  },
  referralMetaText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  pointsStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointsStepBtn: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pointsStepBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
  },
  pointsTrackBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  pointsTrackFill: {
    height: '100%',
    backgroundColor: '#EA580C',
  },
  pointsMaxBtn: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  pointsMaxBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },
  referralDiscountBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  checkoutTotalsDivider: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 14,
    paddingTop: 12,
    gap: 6,
  },
  checkoutSuccessCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 22,
    padding: 26,
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  checkoutSuccessTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    marginTop: 4,
  },
  checkoutSuccessSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
  },
});
