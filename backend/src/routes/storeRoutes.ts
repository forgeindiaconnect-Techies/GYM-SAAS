import express from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { upload } from '../middlewares/upload';
import {
  getStoreStatus,
  getCustomerStoreStatus,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getProducts,
  createProduct,
  updateProduct,
  updateProductStock,
  deleteProduct,
  getCustomerProducts,
  getCustomerProduct,
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  checkout,
  getGymOrders,
  getGymOrderById,
  updateOrderStatus,
  getMyOrders,
  getMyOrderById,
  cancelMyOrder,
  recordOfflineSale,
  getOfflineSales,
  getSalesHistory,
  getInventory,
  getInventoryTransactions,
  getStoreDashboard,
  superAdminGetStoreOverview,
  uploadImage,
} from '../controllers/store.controller';

const router = express.Router();

// Status / eligibility
router.get('/status', authenticate, getStoreStatus);
router.get('/customer/status', authenticate, getCustomerStoreStatus);

// Image upload
router.post('/upload', authenticate, upload.single('image'), uploadImage);

const ADMIN_ROLES = ['GYM_OWNER', 'ADMIN', 'GYM_MANAGER'];

// Gym owner store management
router.get('/admin/categories', authenticate, authorize(ADMIN_ROLES), getCategories);
router.post('/admin/categories', authenticate, authorize(ADMIN_ROLES), createCategory);
router.put('/admin/categories/:id', authenticate, authorize(ADMIN_ROLES), updateCategory);
router.delete('/admin/categories/:id', authenticate, authorize(ADMIN_ROLES), deleteCategory);

router.get('/admin/products', authenticate, authorize(ADMIN_ROLES), getProducts);
router.post('/admin/products', authenticate, authorize(ADMIN_ROLES), createProduct);
router.put('/admin/products/:id', authenticate, authorize(ADMIN_ROLES), updateProduct);
router.patch('/admin/products/:id/stock', authenticate, authorize(ADMIN_ROLES), updateProductStock);
router.delete('/admin/products/:id', authenticate, authorize(ADMIN_ROLES), deleteProduct);

router.get('/admin/orders', authenticate, authorize(ADMIN_ROLES), getGymOrders);
router.get('/admin/orders/:id', authenticate, authorize(ADMIN_ROLES), getGymOrderById);
router.patch('/admin/orders/:id/status', authenticate, authorize(ADMIN_ROLES), updateOrderStatus);

router.post('/admin/offline-sales', authenticate, authorize(ADMIN_ROLES), recordOfflineSale);
router.get('/admin/offline-sales', authenticate, authorize(ADMIN_ROLES), getOfflineSales);

router.get('/admin/sales', authenticate, authorize(ADMIN_ROLES), getSalesHistory);
router.get('/admin/inventory', authenticate, authorize(ADMIN_ROLES), getInventory);
router.get('/admin/inventory/transactions', authenticate, authorize(ADMIN_ROLES), getInventoryTransactions);
router.get('/admin/dashboard', authenticate, authorize(ADMIN_ROLES), getStoreDashboard);

// Customer store
router.get('/customer/products', authenticate, authorize(['MEMBER']), getCustomerProducts);
router.get('/customer/products/:id', authenticate, authorize(['MEMBER']), getCustomerProduct);
router.get('/customer/cart', authenticate, authorize(['MEMBER']), getCart);
router.post('/customer/cart', authenticate, authorize(['MEMBER']), addToCart);
router.put('/customer/cart/items', authenticate, authorize(['MEMBER']), updateCartItem);
router.delete('/customer/cart/items/:productId', authenticate, authorize(['MEMBER']), removeCartItem);
router.delete('/customer/cart', authenticate, authorize(['MEMBER']), clearCart);
router.post('/customer/checkout', authenticate, authorize(['MEMBER']), checkout);
router.get('/customer/orders', authenticate, authorize(['MEMBER']), getMyOrders);
router.get('/customer/orders/:id', authenticate, authorize(['MEMBER']), getMyOrderById);
router.post('/customer/orders/:id/cancel', authenticate, authorize(['MEMBER']), cancelMyOrder);

// Super admin monitoring
router.get('/admin/overview', authenticate, authorize(['SUPER_ADMIN']), superAdminGetStoreOverview);

export default router;