import React, { useState, useEffect } from 'react';
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
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

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
  }, [activeDetailItem]);

  useEffect(() => {
    if (initialSubPage) {
      setActiveDetailItem(initialSubPage);
    }
  }, [initialSubPage]);

  const allItems: MoreItem[] = [
    // Gym & Operations
    { id: 'exercises', title: 'Exercise Library', desc: 'Over 250+ strength, HIIT & mobility movements', icon: 'barbell-outline', group: 'operations' },
    { id: 'videos', title: 'Gym Exercise Videos', desc: 'Form guides, member posture tutorials & streams', icon: 'videocam-outline', group: 'operations' },
    { id: 'equipment', title: 'Equipment', desc: 'Asset inventory, maintenance logs & warranties', icon: 'construct-outline', badge: '1 Due', group: 'operations' },
    { id: 'plans', title: 'Package Plans', desc: 'Annual, quarterly, monthly and custom VIP passes', icon: 'card-outline', group: 'operations' },

    // Gym Store
    { id: 'store_overview', title: 'Store Overview', desc: 'Daily merchandise revenue, stock valuation & fast movers', icon: 'storefront-outline', group: 'store' },
    { id: 'store_products', title: 'Products', desc: 'Whey isolate, BCAAs, gym belts, shaker bottles & gear', icon: 'cube-outline', group: 'store' },
    { id: 'store_inventory', title: 'Inventory', desc: 'Stock alerts, supplier restocks & warehouse units', icon: 'file-tray-stacked-outline', badge: '3 Low', group: 'store' },
    { id: 'store_orders', title: 'Orders', desc: 'Member app orders, pickups & counter purchases', icon: 'cart-outline', group: 'store' },
    { id: 'store_offline', title: 'Offline Sales', desc: 'Direct counter POS cashier & quick barcode billings', icon: 'cash-outline', group: 'store' },
    { id: 'store_history', title: 'Sales History', desc: 'Monthly store analytics, GST summaries & reports', icon: 'bar-chart-outline', group: 'store' },

    // Scheduling
    { id: 'session_bookings', title: 'In-Person Bookings', desc: 'Weight floor reservations, personal training slots', icon: 'calendar-outline', group: 'scheduling' },
    { id: 'online_sessions', title: 'Online Sessions', desc: 'Virtual live classes, Zoom links & home workouts', icon: 'desktop-outline', group: 'scheduling' },
    { id: 'trainer_schedule', title: 'Trainer Schedule', desc: 'Coach working hours, shifts & duty allocations', icon: 'time-outline', group: 'scheduling' },
    { id: 'video_bookings', title: 'Video Bookings', desc: 'One-on-one virtual consultations & posture assessments', icon: 'film-outline', group: 'scheduling' },
    { id: 'attendance', title: 'Attendance', desc: 'Biometric, QR check-ins & peak floor occupancy logs', icon: 'finger-print-outline', group: 'scheduling' },

    // Rewards & Performance
    { id: 'rewards', title: 'Rewards & Performance', desc: 'Gamification badges, loyalty streak rewards & store points', icon: 'trophy-outline', group: 'rewards' },
    { id: 'referrals', title: 'Referrals', desc: 'Member referral links, cashbacks & free trial passes', icon: 'gift-outline', group: 'rewards' },

    // Gym & Account Settings
    { id: 'gym_profile', title: 'Gym Profile', desc: 'Name, logo, address, operating hours & amenities', icon: 'business-outline', group: 'settings' },
    { id: 'branches', title: 'Branches', desc: 'Downtown Arena, Indiranagar, Koramangala centers', icon: 'location-outline', group: 'settings' },
    { id: 'subscription', title: 'Subscription', desc: 'Gymora Enterprise SaaS subscription & features', icon: 'diamond-outline', badge: 'Active', group: 'settings' },
    { id: 'reports', title: 'Reports', desc: 'Financial balance sheet, retention audits & exports', icon: 'pie-chart-outline', group: 'settings' },
    { id: 'reviews', title: 'Review & Rating', desc: 'Member reviews, Google Maps rating & coach feedback', icon: 'star-outline', group: 'settings' },
    { id: 'notifications', title: 'Notifications', desc: 'System broadcasts, renewal pings & automated SMS', icon: 'notifications-outline', badge: '3 New', group: 'settings' },
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

  const renderDetailView = (id: string) => {
    switch (id) {
      // 1. Gym & Operations
      case 'exercises':
        return (
          <View>
            <Text style={styles.detailHeader}>Exercise Master Library</Text>
            <Text style={styles.detailSub}>250+ standard resistance exercises available for trainer workout plans.</Text>
            {[
              { name: 'Barbell Flat Bench Press', target: 'Chest & Triceps', cat: 'Strength' },
              { name: 'Incline Dumbbell Press', target: 'Upper Chest', cat: 'Hypertrophy' },
              { name: 'Romanian Deadlift', target: 'Hamstrings & Glutes', cat: 'Strength' },
              { name: 'Cable Lateral Raise', target: 'Lateral Deltoids', cat: 'Isolation' },
              { name: 'Bulgarian Split Squat', target: 'Quadriceps', cat: 'Functional' },
            ].map((ex, i) => (
              <View key={i} style={styles.detailItemCard}>
                <View style={[styles.detailIconBox, { backgroundColor: '#FFF7ED' }]}>
                  <Ionicons name="barbell" size={18} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.detailItemTitle}>{ex.name}</Text>
                  <Text style={styles.detailItemSub}>{ex.target} • {ex.cat}</Text>
                </View>
                <TouchableOpacity style={styles.subActionBtn}>
                  <Text style={styles.subActionText}>Edit</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        );

      case 'videos':
        return (
          <View>
            <Text style={styles.detailHeader}>Gym Exercise Videos</Text>
            <Text style={styles.detailSub}>High-definition coaching video streams linked to customer routines.</Text>
            {[
              { title: 'Perfect Squat Depth & Foot Angle', coach: 'Vikram Malhotra', views: '1,420 views' },
              { title: 'Overhead Shoulder Press Stabilization', coach: 'Rohit Verma', views: '980 views' },
              { title: 'Core Anti-Rotation Cable Woodchopper', coach: 'Karan Mehra', views: '840 views' },
            ].map((v, i) => (
              <View key={i} style={styles.detailItemCard}>
                <View style={[styles.detailIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="play-circle" size={20} color={COLORS.blue} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.detailItemTitle}>{v.title}</Text>
                  <Text style={styles.detailItemSub}>{v.coach} • {v.views}</Text>
                </View>
                <TouchableOpacity style={styles.subActionBtn}>
                  <Text style={styles.subActionText}>Play</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        );

      case 'equipment':
        return (
          <View>
            <Text style={styles.detailHeader}>Equipment & Machinery Maintenance</Text>
            <Text style={styles.detailSub}>Keep gym machines calibrated and safely inspected.</Text>
            {[
              { name: 'Hammer Strength Iso-Lateral Chest Press', status: 'Optimal', service: 'Serviced 10 Oct' },
              { name: 'LifeFitness Treadmill Series 95T #3', status: 'Maintenance Due', service: 'Belt Calibration' },
              { name: 'Concept2 RowErg Machine #2', status: 'Optimal', service: 'Chain Lubricated' },
              { name: 'Cable Crossover 8-Stack Station', status: 'Optimal', service: 'Pulleys Checked' },
            ].map((eq, i) => (
              <View key={i} style={styles.detailItemCard}>
                <View style={[styles.detailIconBox, { backgroundColor: eq.status === 'Optimal' ? '#ECFDF5' : '#FEF3C7' }]}>
                  <Ionicons name="construct" size={18} color={eq.status === 'Optimal' ? COLORS.emerald : '#D97706'} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.detailItemTitle}>{eq.name}</Text>
                  <Text style={styles.detailItemSub}>{eq.service}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: eq.status === 'Optimal' ? COLORS.emeraldLight : '#FEF3C7' }]}>
                  <Text style={[styles.statusBadgeText, { color: eq.status === 'Optimal' ? COLORS.emerald : '#D97706' }]}>
                    {eq.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        );

      case 'plans':
        return (
          <View>
            <Text style={styles.detailHeader}>Membership Package Plans</Text>
            <Text style={styles.detailSub}>Configure pricing tiers and features for new enrollments.</Text>
            {[
              { name: 'Gold Annual Membership', price: '₹18,000 / yr', access: 'All Access + Steam + Locker' },
              { name: 'Silver Quarterly Plan', price: '₹6,500 / 3 mo', access: 'Strength & Cardio Floor' },
              { name: 'Monthly Flexi Pass', price: '₹2,500 / mo', access: 'Single Branch Floor Access' },
              { name: 'Platinum VIP Elite Club', price: '₹32,000 / yr', access: 'Unlimited PT + Nutritionist + Spa' },
            ].map((p, i) => (
              <View key={i} style={styles.detailItemCard}>
                <View style={[styles.detailIconBox, { backgroundColor: '#FFF7ED' }]}>
                  <Ionicons name="card" size={18} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.detailItemTitle}>{p.name}</Text>
                  <Text style={styles.detailItemSub}>{p.access}</Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: '800', color: COLORS.textDark }}>{p.price}</Text>
              </View>
            ))}
          </View>
        );

      // 2. Gym Store
      case 'store_overview':
      case 'store_products':
      case 'store_inventory':
      case 'store_orders':
      case 'store_offline':
      case 'store_history':
        return (
          <View>
            <Text style={styles.detailHeader}>Gym Store & Nutrition</Text>
            <Text style={styles.detailSub}>Manage inventory, supplement counter, and offline retail billing.</Text>
            <View style={styles.kpiMiniRow}>
              <View style={styles.kpiMiniBox}>
                <Text style={styles.kpiMiniLabel}>Today Sales</Text>
                <Text style={styles.kpiMiniVal}>₹14,800</Text>
              </View>
              <View style={styles.kpiMiniBox}>
                <Text style={styles.kpiMiniLabel}>Stock Value</Text>
                <Text style={styles.kpiMiniVal}>₹3,40,000</Text>
              </View>
              <View style={styles.kpiMiniBox}>
                <Text style={styles.kpiMiniLabel}>Low Stock</Text>
                <Text style={[styles.kpiMiniVal, { color: COLORS.rose }]}>3 Items</Text>
              </View>
            </View>

            {[
              { name: 'Optimum Nutrition Gold Standard Whey 5lb', price: '₹6,499', stock: '18 in stock', cat: 'Protein' },
              { name: 'MuscleBlaze Creatine Monohydrate 250g', price: '₹899', stock: '24 in stock', cat: 'Strength' },
              { name: 'Gymora Pro Lifting Straps (Pair)', price: '₹499', stock: '32 in stock', cat: 'Gear' },
              { name: 'Dymatize ISO100 Hydrolyzed 4lb', price: '₹7,999', stock: 'Only 2 left', cat: 'Protein' },
            ].map((prod, i) => (
              <View key={i} style={styles.detailItemCard}>
                <View style={[styles.detailIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="cube" size={18} color={COLORS.blue} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.detailItemTitle}>{prod.name}</Text>
                  <Text style={styles.detailItemSub}>{prod.cat} • {prod.stock}</Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: '800', color: COLORS.primary }}>{prod.price}</Text>
              </View>
            ))}

            <TouchableOpacity 
              style={styles.actionPrimaryBtn}
              onPress={() => Alert.alert('POS Counter Ready', 'Offline Counter POS terminal ready for billing barcode scan.')}
            >
              <Ionicons name="calculator-outline" size={16} color={COLORS.white} />
              <Text style={styles.actionPrimaryText}>Open Quick Counter POS Billing</Text>
            </TouchableOpacity>
          </View>
        );

      // 3. Scheduling
      case 'session_bookings':
      case 'online_sessions':
      case 'trainer_schedule':
      case 'video_bookings':
      case 'attendance':
        return (
          <View>
            <Text style={styles.detailHeader}>Scheduling & Floor Sessions</Text>
            <Text style={styles.detailSub}>Real-time appointments, trainer rosters, and live attendance check-ins.</Text>
            {[
              { client: 'Naveen Kumar', type: 'Personal Training Session', trainer: 'Coach Vikram', time: '06:00 PM Today' },
              { client: 'Priya Sharma', type: 'Diet & Body Composition Check', trainer: 'Coach Ananya', time: '06:30 PM Today' },
              { client: 'Aditya Roy', type: 'Trial Workout Induction', trainer: 'Coach Karan', time: '07:00 PM Today' },
              { client: 'Corporate Batch', type: 'Zumba & Aerobics Studio', trainer: 'Studio Team', time: '07:30 PM Today' },
            ].map((s, i) => (
              <View key={i} style={styles.detailItemCard}>
                <View style={[styles.detailIconBox, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="calendar" size={18} color={COLORS.emerald} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.detailItemTitle}>{s.client}</Text>
                  <Text style={styles.detailItemSub}>{s.type} • {s.trainer}</Text>
                </View>
                <Text style={{ fontSize: 10, fontWeight: '700', color: COLORS.primary }}>{s.time}</Text>
              </View>
            ))}
          </View>
        );

      // 4. Rewards & Performance
      case 'rewards':
      case 'referrals':
        return (
          <View>
            <Text style={styles.detailHeader}>Member Gamification & Referrals</Text>
            <Text style={styles.detailSub}>Reward members for loyalty, streak consistency, and inviting friends.</Text>
            {[
              { title: 'Top Referrer of the Month', holder: 'Naveen Kumar (4 referrals)', reward: '₹2,000 Store Credit' },
              { title: '14-Day Consistency Master', holder: 'Priya Sharma (14 check-ins)', reward: 'Gold Streak Badge' },
              { title: '30-Day Hardcore Lifter', holder: 'Rahul Varma (30 days streak)', reward: 'Free Protein Shake' },
            ].map((r, i) => (
              <View key={i} style={styles.detailItemCard}>
                <View style={[styles.detailIconBox, { backgroundColor: '#FFFBEB' }]}>
                  <Ionicons name="trophy" size={18} color={COLORS.amber} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.detailItemTitle}>{r.title}</Text>
                  <Text style={styles.detailItemSub}>{r.holder}</Text>
                </View>
                <Text style={{ fontSize: 10, fontWeight: '700', color: COLORS.emerald }}>{r.reward}</Text>
              </View>
            ))}
          </View>
        );

      // 5. Gym Profile & Branches
      case 'gym_profile':
      case 'branches':
        return (
          <View>
            <Text style={styles.detailHeader}>Gym Profile & Branch Management</Text>
            <Text style={styles.detailSub}>Authorized branch locations and operational controls.</Text>
            {[
              { name: 'Gymora Flagship Arena (Main)', address: '100ft Road, Indiranagar, Bengaluru', members: '840 Members', status: 'Primary HQ' },
              { name: 'Gymora Koramangala Center', address: '80ft Road, 4th Block, Koramangala', members: '408 Members', status: 'Branch 2' },
              { name: 'Gymora Whitefield Tech Arena', address: 'ITPL Main Road, Whitefield', members: 'Opening Dec', status: 'Upcoming' },
            ].map((b, i) => (
              <View key={i} style={styles.detailItemCard}>
                <View style={[styles.detailIconBox, { backgroundColor: '#FFF7ED' }]}>
                  <Ionicons name="business" size={18} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.detailItemTitle}>{b.name}</Text>
                  <Text style={styles.detailItemSub}>{b.address}</Text>
                  <Text style={{ fontSize: 10, color: COLORS.primary, marginTop: 2, fontWeight: '700' }}>{b.members}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: COLORS.primaryLight }]}>
                  <Text style={[styles.statusBadgeText, { color: COLORS.primary }]}>{b.status}</Text>
                </View>
              </View>
            ))}
          </View>
        );

      // 6. Subscription
      case 'subscription':
        return (
          <View>
            <Text style={styles.detailHeader}>SaaS Platform Subscription</Text>
            <Text style={styles.detailSub}>Your Gymora Enterprise tier details and feature limits.</Text>
            <View style={styles.planCardHighlight}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.planTitleWhite}>Gymora Enterprise Pro</Text>
                <View style={styles.activePillGreen}>
                  <Text style={styles.activePillTextGreen}>Active Plan</Text>
                </View>
              </View>
              <Text style={styles.planValidWhite}>Valid until: 31 December 2027 • Auto-Renew Active</Text>
              <View style={styles.planFeatureList}>
                <Text style={styles.planFeatureItem}>✓ Unlimited Members & Geo-Fence Check-in</Text>
                <Text style={styles.planFeatureItem}>✓ Multi-Branch Cloud Synchronization</Text>
                <Text style={styles.planFeatureItem}>✓ WhatsApp Automated Renewal Alerts</Text>
                <Text style={styles.planFeatureItem}>✓ Native iOS & Android Mobile Apps</Text>
              </View>
            </View>
          </View>
        );

      // 7. Notifications
      case 'notifications':
        return (
          <View>
            <Text style={styles.detailHeader}>System Notifications & Alerts</Text>
            <Text style={styles.detailSub}>Real-time updates regarding payments, renewals, and enquiries.</Text>
            {[
              { title: 'New Customer Enquiry', desc: 'Aditya Roy requested a Gold Membership walkthrough', time: '10 mins ago', unread: true },
              { title: 'Renewal Payment Received', desc: '₹18,000 received from Naveen Kumar via UPI', time: '2 hrs ago', unread: true },
              { title: 'Equipment Inspection Warning', desc: 'Treadmill Series 95T is scheduled for lubrication', time: '1 day ago', unread: false },
              { title: 'Trainer Commission Dispatched', desc: 'October payout to Coach Vikram approved', time: '2 days ago', unread: false },
            ].map((n, i) => (
              <View key={i} style={[styles.detailItemCard, n.unread && { borderColor: COLORS.primaryBorder, backgroundColor: '#FFFDF9' }]}>
                <View style={[styles.detailIconBox, { backgroundColor: n.unread ? COLORS.primaryLight : '#F1F5F9' }]}>
                  <Ionicons name="notifications" size={18} color={n.unread ? COLORS.primary : COLORS.textMuted} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.detailItemTitle}>{n.title}</Text>
                  <Text style={styles.detailItemSub}>{n.desc}</Text>
                </View>
                <Text style={{ fontSize: 10, color: COLORS.textMuted }}>{n.time}</Text>
              </View>
            ))}
          </View>
        );

      // 8. Deleted Details
      case 'deleted_details':
        return (
          <View>
            <Text style={styles.detailHeader}>Deleted Details & Archives</Text>
            <Text style={styles.detailSub}>Soft-deleted accounts, past enquiries, and recoverable records.</Text>
            {[
              { name: 'Kavita Sundaram', type: 'Member Account (Cancelled)', date: 'Deleted 14 Oct' },
              { name: 'Walk-in Inquiry #108', type: 'Unresponsive Lead', date: 'Archived 10 Oct' },
              { name: 'Old Dumbbell Rack (2kg-10kg)', type: 'Scrapped Equipment Asset', date: 'Archived 01 Oct' },
            ].map((d, i) => (
              <View key={i} style={styles.detailItemCard}>
                <View style={[styles.detailIconBox, { backgroundColor: COLORS.roseLight }]}>
                  <Ionicons name="trash" size={18} color={COLORS.rose} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.detailItemTitle}>{d.name}</Text>
                  <Text style={styles.detailItemSub}>{d.type} • {d.date}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.restoreBtn}
                  onPress={() => Alert.alert('Restore Record', `Record for "${d.name}" restored successfully.`)}
                >
                  <Text style={styles.restoreText}>Restore</Text>
                </TouchableOpacity>
              </View>
            ))}
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

        {/* 5. Gym & Account Settings */}
        {renderGroup('Gym & Account Settings', 'settings')}

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
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              {activeDetailItem && renderDetailView(activeDetailItem)}
            </ScrollView>
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
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primaryBorder,
  },
  ownerAvatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
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
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 6,
  },
  gymTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 8,
    height: 42,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textDark,
  },
  groupCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  groupHeaderBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  groupHeaderBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.primary,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginRight: 10,
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
    gap: 6,
  },
  itemBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  itemBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#D97706',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.roseLight,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  logoutText: {
    color: COLORS.rose,
    fontSize: 13,
    fontWeight: '700',
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
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
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
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  detailIconBox: {
    width: 36,
    height: 36,
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
  subActionBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  subActionText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
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
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  kpiMiniLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  kpiMiniVal: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 2,
  },
  actionPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  actionPrimaryText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
  planCardHighlight: {
    backgroundColor: COLORS.darkBg,
    borderRadius: 18,
    padding: 16,
    marginTop: 6,
  },
  planTitleWhite: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
  activePillGreen: {
    backgroundColor: COLORS.emerald,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  activePillTextGreen: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
  },
  planValidWhite: {
    color: '#FED7AA',
    fontSize: 11,
    marginTop: 4,
    marginBottom: 14,
  },
  planFeatureList: {
    gap: 8,
  },
  planFeatureItem: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
  },
  restoreBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  restoreText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
});

