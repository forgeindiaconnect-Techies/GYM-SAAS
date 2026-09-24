import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middlewares/auth';
import User, { IUser } from '../models/User';
import Gym from '../models/Gym';
import StoreProduct from '../models/StoreProduct';
import StoreProductCategory from '../models/StoreProductCategory';
import StoreCart from '../models/StoreCart';
import StoreOrder, {
  StoreOrderStatus,
  StoreOrderPaymentStatus,
  IStoreOrder,
} from '../models/StoreOrder';
import StorePaymentTransaction, { StorePaymentTransactionStatus } from '../models/StorePaymentTransaction';
import StoreOfflineSale from '../models/StoreOfflineSale';
import StoreInventoryTransaction, { StoreInventoryTransactionType } from '../models/StoreInventoryTransaction';
import Notification from '../models/Notification';
import {
  isStoreEnabledForUser,
  isStoreEnabledForGym,
  StoreEntitlementResult,
} from '../utils/storeEntitlement';

const isObjectId = (v: any): boolean => mongoose.isValidObjectId(v);

const getGymIdForUser = async (userId: string): Promise<mongoose.Types.ObjectId | null> => {
  const user = await User.findById(userId).select('gymId');
  return user?.gymId || null;
};

const notify = async ({
  recipientId,
  recipientRole,
  gymId,
  title,
  message,
  type = 'info',
  relatedRecordId,
  link,
}: {
  recipientId: mongoose.Types.ObjectId | string;
  recipientRole: 'GYM_OWNER' | 'TRAINER' | 'SUPER_ADMIN' | 'MEMBER';
  gymId?: mongoose.Types.ObjectId | string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'alert' | 'message';
  relatedRecordId?: mongoose.Types.ObjectId | string;
  link?: string;
}): Promise<void> => {
  try {
    await Notification.create({
      recipientId,
      recipientRole,
      gymId: gymId || undefined,
      title,
      message,
      type,
      relatedRecordId: relatedRecordId || undefined,
      link: link || undefined,
    });
  } catch (_err) {
    // notifications must never break the primary request
  }
};

const randomCode = (len: number): string =>
  Math.random().toString(36).slice(2, 2 + len).toUpperCase().padEnd(len, '0');

const notifyLowStockIfNeeded = async (product: any, gymId: mongoose.Types.ObjectId): Promise<void> => {
  try {
    if (product.stock <= 0) {
      const gym = await Gym.findById(gymId).select('ownerId');
      if (gym) {
        await notify({
          recipientId: gym.ownerId,
          recipientRole: 'GYM_OWNER',
          gymId,
          title: 'Product out of stock',
          message: `"${product.name}" is now OUT OF STOCK. Restock it from the Inventory page.`,
          type: 'alert',
          relatedRecordId: product._id,
          link: '/admin/store/inventory',
        });
      }
      return;
    }
    if (product.stock <= product.lowStockThreshold) {
      const gym = await Gym.findById(gymId).select('ownerId');
      if (gym) {
        await notify({
          recipientId: gym.ownerId,
          recipientRole: 'GYM_OWNER',
          gymId,
          title: 'Low stock alert',
          message: `"${product.name}" is running low (${product.stock} left, threshold ${product.lowStockThreshold}).`,
          type: 'alert',
          relatedRecordId: product._id,
          link: '/admin/store/inventory',
        });
      }
    }
  } catch (_err) {
    // alerts must never break the primary request
  }
};

export const createOrderNumber = (): string => `ORD-${Date.now().toString(36).toUpperCase()}${randomCode(4)}`;
const createSaleNumber = (): string => `SL-${Date.now().toString(36).toUpperCase()}${randomCode(4)}`;

const priceFor = (p: any): number => p.discountPrice ?? p.sellingPrice;

// ---------------------------------------------------------------------------
// Store eligibility
// ---------------------------------------------------------------------------

export const getStoreStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    const userEntitlement = isStoreEnabledForUser(user as IUser);
    let gymEntitlement: StoreEntitlementResult = { enabled: false };
    let gymName = '';
    if (user.gymId) {
      const gym = await Gym.findById(user.gymId);
      if (gym) {
        gymEntitlement = isStoreEnabledForGym(gym);
        gymName = gym.name;
      }
    }
    const enabled = userEntitlement.enabled || gymEntitlement.enabled;
    res.status(200).json({
      success: true,
      enabled,
      userEntitlement,
      gymEntitlement,
      gymId: user.gymId,
      gymName,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getCustomerStoreStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    let enabled = false;
    let gymName = '';
    if (user.gymId) {
      const gym = await Gym.findById(user.gymId);
      if (gym) {
        enabled = isStoreEnabledForGym(gym).enabled;
        gymName = gym.name;
      }
    }
    res.status(200).json({ success: true, enabled, gymId: user.gymId, gymName });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const requireStoreOwner = async (req: AuthRequest, res: Response): Promise<boolean> => {
  const user = (await User.findById(req.user?.id)) as IUser | null;
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return false;
  }
  const userEntitlement = isStoreEnabledForUser(user);
  let gymEntitlement: StoreEntitlementResult = { enabled: false };
  if (user.gymId) {
    const gym = await Gym.findById(user.gymId);
    if (gym) gymEntitlement = isStoreEnabledForGym(gym);
  }
  if (!userEntitlement.enabled && !gymEntitlement.enabled) {
    res.status(403).json({
      success: false,
      message: 'The Gym Store feature requires an active Premium subscription. Please upgrade to Premium to sell products.',
    });
    return false;
  }
  return true;
};

const requireStoreCustomer = async (req: AuthRequest, res: Response): Promise<boolean> => {
  const user = (await User.findById(req.user?.id)) as IUser | null;
  if (!user?.gymId) {
    res.status(403).json({ success: false, message: 'You are not linked to a gym with an active store.' });
    return false;
  }
  const gym = await Gym.findById(user.gymId);
  if (!gym || !isStoreEnabledForGym(gym).enabled) {
    res.status(403).json({ success: false, message: 'Store is not currently active at your gym.' });
    return false;
  }
  return true;
};

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const getCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!(await requireStoreOwner(req, res))) return;
    const gymId = await getGymIdForUser(req.user!.id);
    if (!gymId) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }
    const { productType } = req.query;
    const filter: any = { gymId, $or: [{ status: 'Active' }, { status: 'Inactive' }] };
    if (productType && typeof productType === 'string' && productType.trim() !== 'all') {
      filter.productType = productType.trim();
    }
    const categories = await StoreProductCategory.find(filter)
      .sort({ name: 1 });
    const counts: Record<string, number> = {};
    const products = await StoreProduct.find({ gymId }).select('categoryName status');
    for (const p of products) {
      counts[p.categoryName] = (counts[p.categoryName] || 0) + (p.status === 'Active' ? 1 : 0);
    }
    const data = categories.map((c) => ({
      ...c.toObject(),
      productCount: counts[c.name] || 0,
    }));
    res.status(200).json({ success: true, categories: data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!(await requireStoreOwner(req, res))) return;
    const gymId = await getGymIdForUser(req.user!.id);
    if (!gymId) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }
    const { name, description, status, productType } = req.body;
    if (!name?.trim()) {
      res.status(400).json({ success: false, message: 'Category name is required' });
      return;
    }
    if (!productType?.trim()) {
      res.status(400).json({ success: false, message: 'Product type is required' });
      return;
    }
    const existing = await StoreProductCategory.findOne({ gymId, productType: productType.trim(), name: name.trim() });
    if (existing) {
      res.status(409).json({ success: false, message: 'A category with this name already exists for this product type' });
      return;
    }
    const category = await StoreProductCategory.create({
      gymId,
      productType: productType.trim(),
      name: name.trim(),
      description,
      status: status || 'Active',
    });
    res.status(201).json({ success: true, category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!(await requireStoreOwner(req, res))) return;
    const gymId = await getGymIdForUser(req.user!.id);
    const { id } = req.params;
    if (!isObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid category id' });
      return;
    }
    const category = await StoreProductCategory.findOne({ _id: id, gymId });
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }
    const { name, description, status, productType } = req.body;
    const oldProductType = category.productType;
    if (productType && productType.trim()) {
      category.productType = productType.trim();
    }
    if (name && name.trim() && name.trim() !== category.name) {
      const clash = await StoreProductCategory.findOne({ gymId, productType: category.productType, name: name.trim(), _id: { $ne: id } });
      if (clash) {
        res.status(409).json({ success: false, message: 'A category with this name already exists in this product type' });
        return;
      }
      const oldName = category.name;
      // Use oldProductType to find the products that belonged to this category
      await StoreProduct.updateMany({ gymId, productType: oldProductType, categoryName: oldName }, { $set: { categoryName: name.trim(), productType: category.productType } });
      category.name = name.trim();
    } else if (oldProductType !== category.productType) {
      // If only productType changed, update the products to match the new product type
      await StoreProduct.updateMany({ gymId, productType: oldProductType, categoryName: category.name }, { $set: { productType: category.productType } });
    }
    if (description !== undefined) category.description = description;
    if (status) category.status = status;
    await category.save();
    res.status(200).json({ success: true, category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!(await requireStoreOwner(req, res))) return;
    const gymId = await getGymIdForUser(req.user!.id);
    const { id } = req.params;
    const category = await StoreProductCategory.findOne({ _id: id, gymId });
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }
    const productCount = await StoreProduct.countDocuments({ gymId, categoryName: category.name, status: 'Active' });
    if (productCount > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete category "${category.name}" — it still has ${productCount} active product(s). Move them first.`,
      });
      return;
    }
    await StoreProductCategory.deleteOne({ _id: id });
    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ---------------------------------------------------------------------------
// Products (gym owner)
// ---------------------------------------------------------------------------

export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!(await requireStoreOwner(req, res))) return;
    const gymId = await getGymIdForUser(req.user!.id);
    if (!gymId) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }
    const { category, search, status, inventory, productType, page = '1', limit = '50' } = req.query;
    const filter: any = { gymId };
    if (productType && productType !== 'all') filter.productType = productType;
    if (category && category !== 'all') filter.categoryName = category;
    if (status && status !== 'all') filter.status = status;
    if (inventory === 'lowStock') {
      const all = await StoreProduct.find({ gymId, ...(filter.categoryName ? { categoryName: filter.categoryName } : {}), ...(filter.status ? { status: filter.status } : {}) })
        .select('stock lowStockThreshold').lean();
      const ids = (all as any[]).filter((p: any) => p.stock > 0 && p.stock <= p.lowStockThreshold).map((p) => p._id);
      filter._id = { $in: ids };
    } else if (inventory === 'outOfStock') {
      filter.stock = { $lte: 0 };
    } else if (inventory === 'inStock') {
      const all = await StoreProduct.find({ gymId, ...(filter.categoryName ? { categoryName: filter.categoryName } : {}), ...(filter.status ? { status: filter.status } : {}) })
        .select('stock lowStockThreshold').lean();
      const ids = (all as any[]).filter((p: any) => p.stock > p.lowStockThreshold).map((p) => p._id);
      filter._id = { $in: ids };
    }
    if (search && typeof search === 'string' && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { brand: { $regex: search.trim(), $options: 'i' } },
        { sku: { $regex: search.trim(), $options: 'i' } },
      ];
    }
    const pNum = Math.max(1, parseInt(String(page), 10) || 1);
    const lNum = Math.min(200, Math.max(1, parseInt(String(limit), 10) || 50));
    const total = await StoreProduct.countDocuments(filter);
    const products = await StoreProduct.find(filter)
      .sort({ createdAt: -1 })
      .skip((pNum - 1) * lNum)
      .limit(lNum);
    res.status(200).json({ success: true, products, total, page: pNum, limit: lNum });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!(await requireStoreOwner(req, res))) return;
    const gymId = await getGymIdForUser(req.user!.id);
    if (!gymId) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }
    const {
      name, description, brand, sku, categoryName, image, sellingPrice, discountPrice,
      stock, status, availability, fulfilmentType, lowStockThreshold, productType,
      attributes, hasVariants, variants,
    } = req.body;

    if (!name?.trim()) {
      res.status(400).json({ success: false, message: 'Product name is required' });
      return;
    }
    if (!productType?.trim()) {
      res.status(400).json({ success: false, message: 'Product type is required' });
      return;
    }
    if (sellingPrice === undefined || sellingPrice === null || Number(sellingPrice) < 0) {
      res.status(400).json({ success: false, message: 'A valid selling price is required' });
      return;
    }
    if (discountPrice !== undefined && discountPrice !== null && Number(discountPrice) > Number(sellingPrice)) {
      res.status(400).json({ success: false, message: 'Discount amount cannot be greater than selling price' });
      return;
    }
    const catName = (categoryName || 'Uncategorized').trim();
    if (!(await StoreProductCategory.exists({ gymId, productType: productType.trim(), name: catName }))) {
      await StoreProductCategory.create({ gymId, productType: productType.trim(), name: catName, status: 'Active' });
    }
    if (sku) {
      const clash = await StoreProduct.exists({ gymId, sku: sku.trim() });
      if (clash) {
        res.status(409).json({ success: false, message: 'Product SKU already exists for this gym' });
        return;
      }
    }
    const product = await StoreProduct.create({
      gymId,
      categoryName: catName,
      name: name.trim(),
      description,
      brand,
      sku: sku?.trim() || undefined,
      image,
      sellingPrice: Number(sellingPrice),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      stock: Number(stock ?? 0),
      status: status || 'Active',
      availability: availability || 'Both',
      fulfilmentType: fulfilmentType || 'Gym Pickup',
      lowStockThreshold: Number(lowStockThreshold ?? 5),
      productType: productType.trim(),
      attributes: attributes || {},
      hasVariants: !!hasVariants,
      variants: Array.isArray(variants) ? variants : [],
    });
    if (!product.hasVariants && product.stock > 0) {
      await StoreInventoryTransaction.create({
        gymId,
        productId: product._id,
        type: StoreInventoryTransactionType.STOCK_IN,
        quantityChange: product.stock,
        stockAfter: product.stock,
        sourceType: 'manual',
        note: 'Initial stock on product creation',
      });
    } else if (product.hasVariants && product.variants.length > 0) {
      for (const v of product.variants) {
        if (v.stock > 0) {
          await StoreInventoryTransaction.create({
            gymId,
            productId: product._id,
            variantId: v._id,
            type: StoreInventoryTransactionType.STOCK_IN,
            quantityChange: v.stock,
            stockAfter: v.stock,
            sourceType: 'manual',
            note: 'Initial stock on variant creation',
          });
        }
      }
    }
    res.status(201).json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!(await requireStoreOwner(req, res))) return;
    const gymId = await getGymIdForUser(req.user!.id);
    if (!gymId) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }
    const { id } = req.params;
    const product = await StoreProduct.findOne({ _id: id, gymId });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    const {
      name, description, brand, sku, categoryName, image, sellingPrice, discountPrice,
      stock, status, availability, fulfilmentType, lowStockThreshold, productType,
      attributes, hasVariants, variants,
    } = req.body;

    if (sku && sku.trim() && sku.trim() !== product.sku) {
      const clash = await StoreProduct.exists({ gymId, sku: sku.trim(), _id: { $ne: id } });
      if (clash) {
        res.status(409).json({ success: false, message: 'Product SKU already exists for this gym' });
        return;
      }
    }
    const catName = (categoryName || product.categoryName).trim();
    const prodType = productType !== undefined ? productType.trim() : product.productType;
    if (catName !== product.categoryName || prodType !== product.productType) {
      if (!(await StoreProductCategory.exists({ gymId, productType: prodType, name: catName }))) {
        await StoreProductCategory.create({ gymId, productType: prodType, name: catName, status: 'Active' });
      }
    }
    if (name !== undefined) product.name = name.trim() || product.name;
    if (description !== undefined) product.description = description;
    if (brand !== undefined) product.brand = brand;
    if (sku !== undefined) product.sku = sku?.trim() || undefined;
    if (categoryName !== undefined) product.categoryName = catName;
    if (image !== undefined) product.image = image;
    if (sellingPrice !== undefined) product.sellingPrice = Number(sellingPrice);
    if (discountPrice !== undefined) product.discountPrice = discountPrice ? Number(discountPrice) : undefined;
    
    if (product.discountPrice !== undefined && product.discountPrice > product.sellingPrice) {
      res.status(400).json({ success: false, message: 'Discount amount cannot be greater than selling price' });
      return;
    }
    if (status !== undefined) product.status = status;
    if (availability !== undefined) product.availability = availability;
    if (fulfilmentType !== undefined) product.fulfilmentType = fulfilmentType;
    if (lowStockThreshold !== undefined) product.lowStockThreshold = Number(lowStockThreshold);
    if (productType !== undefined) product.productType = productType.trim();
    if (attributes !== undefined) product.attributes = attributes || {};
    if (hasVariants !== undefined) product.hasVariants = !!hasVariants;
    if (variants !== undefined && Array.isArray(variants)) {
      product.variants = variants;
    }
    if (!product.hasVariants && stock !== undefined) {
      const delta = Number(stock) - product.stock;
      if (delta !== 0) {
        if (Number(stock) < 0) {
          res.status(400).json({ success: false, message: 'Stock cannot be negative' });
          return;
        }
        product.stock = Number(stock);
        await StoreInventoryTransaction.create({
          gymId,
          productId: product._id,
          type: StoreInventoryTransactionType.ADJUSTMENT,
          quantityChange: delta,
          stockAfter: product.stock,
          sourceType: 'manual',
          note: 'Stock updated in product form',
        });
      }
    }
    await product.save();
    res.status(200).json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updateProductStock = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!(await requireStoreOwner(req, res))) return;
    const gymId = await getGymIdForUser(req.user!.id);
    if (!gymId) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }
    const { id } = req.params;
    const { quantityChange, note } = req.body;
    const qty = Number(quantityChange);
    if (!Number.isFinite(qty) || qty === 0) {
      res.status(400).json({ success: false, message: 'A non-zero quantity change is required' });
      return;
    }
    const product = await StoreProduct.findOneAndUpdate(
      { _id: id, gymId, stock: { $gte: -qty } },
      { $inc: { stock: qty } },
      { new: true }
    );
    if (!product) {
      res.status(400).json({ success: false, message: 'Product not found or stock would go negative' });
      return;
    }
    await StoreInventoryTransaction.create({
      gymId,
      productId: product._id,
      type: qty > 0 ? StoreInventoryTransactionType.STOCK_IN : StoreInventoryTransactionType.ADJUSTMENT,
      quantityChange: qty,
      stockAfter: product.stock,
      sourceType: 'manual',
      note: note || 'Manual stock adjustment',
    });
    res.status(200).json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!(await requireStoreOwner(req, res))) return;
    const gymId = await getGymIdForUser(req.user!.id);
    if (!gymId) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }
    const { id } = req.params;
    const hasOrders = await StoreOrder.exists({ gymId, 'items.productId': id });
    if (hasOrders) {
      res.status(400).json({
        success: false,
        message: 'This product cannot be deleted because it appears in past orders. Set its status to Inactive instead.',
      });
      return;
    }
    const deleted = await StoreProduct.deleteOne({ _id: id, gymId });
    await StoreCart.updateMany({ gymId }, { $pull: { items: { productId: id } } });
    res.status(200).json({ success: true, deleted: deleted.deletedCount });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ---------------------------------------------------------------------------
// Customer-facing products
// ---------------------------------------------------------------------------

export const getCustomerProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!(await requireStoreCustomer(req, res))) return;
    const user = (await User.findById(req.user!.id)) as IUser;
    const gymId = user.gymId!;
    const { category, search, page = '1', limit = '40' } = req.query;
    const filter: any = { gymId, status: 'Active', availability: { $in: ['Online', 'Both'] } };
    if (category && category !== 'all') filter.categoryName = category;
    if (search && typeof search === 'string' && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { brand: { $regex: search.trim(), $options: 'i' } },
      ];
    }
    const pNum = Math.max(1, parseInt(String(page), 10) || 1);
    const lNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 40));
    const total = await StoreProduct.countDocuments(filter);
    const products = await StoreProduct.find(filter).sort({ createdAt: -1 }).skip((pNum - 1) * lNum).limit(lNum);
    const totalOutOfStock = await StoreProduct.countDocuments({ ...filter, stock: { $lte: 0 } });
    res.status(200).json({ success: true, products, total, totalOutOfStock, page: pNum, limit: lNum });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getCustomerProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!(await requireStoreCustomer(req, res))) return;
    const user = (await User.findById(req.user!.id)) as IUser;
    const { id } = req.params;
    const product = await StoreProduct.findOne({ _id: id, gymId: user.gymId, status: 'Active' });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    res.status(200).json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ---------------------------------------------------------------------------
// Cart
// ---------------------------------------------------------------------------

export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!(await requireStoreCustomer(req, res))) return;
    const user = (await User.findById(req.user!.id)) as IUser;
    const cart = await StoreCart.findOne({ customerId: user._id, gymId: user.gymId }).populate<{ items: { productId: any }[] }>('items.productId');
    
    const products = cart?.items?.map((i: any) => ({ product: i.productId, variantId: i.variantId, quantity: i.quantity })) || [];
    const valid: any[] = [];
    const removed: any[] = [];
    
    for (const row of products) {
      if (!row.product || row.product.status !== 'Active' || !(row.product.availability === 'Online' || row.product.availability === 'Both')) {
        removed.push({ productId: row.product?._id, variantId: row.variantId });
        continue;
      }
      
      let targetStock = row.product.stock;
      let variantDetails = null;
      if (row.product.hasVariants) {
        if (!row.variantId) {
          removed.push({ productId: row.product._id, variantId: row.variantId });
          continue;
        }
        const v = row.product.variants.find((v: any) => String(v._id) === String(row.variantId));
        if (!v) {
          removed.push({ productId: row.product._id, variantId: row.variantId });
          continue;
        }
        targetStock = v.stock;
        variantDetails = v;
      }

      const quantity = Math.min(row.quantity, targetStock);
      valid.push({ 
        product: { ...row.product.toObject(), stock: row.product.stock },
        variant: variantDetails,
        variantId: row.variantId,
        requestedQuantity: row.quantity, 
        quantity, 
        match: quantity === row.quantity 
      });
      
      if (!valid[valid.length - 1].match) {
        const filter: any = { customerId: user._id, gymId: user.gymId, 'items.productId': row.product._id };
        if (row.variantId) filter['items.variantId'] = row.variantId;
        await StoreCart.updateOne(filter, { $set: { 'items.$.quantity': Math.max(quantity, 1) } });
      }
    }
    
    if (removed.length) {
      for (const item of removed) {
        const pullCond: any = { productId: item.productId };
        if (item.variantId) pullCond.variantId = item.variantId;
        await StoreCart.updateOne(
          { customerId: user._id, gymId: user.gymId },
          { $pull: { items: pullCond } }
        );
      }
    }
    
    const priceFor = (p: any, v?: any) => {
      if (v) return v.discountPrice ?? v.price;
      return p.discountPrice ?? p.sellingPrice;
    };
    
    const subtotal = valid.reduce((s: number, v: any) => s + v.quantity * priceFor(v.product, v.variant), 0);
    res.status(200).json({ success: true, cart: valid, subtotal, removed });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!(await requireStoreCustomer(req, res))) return;
    const user = (await User.findById(req.user!.id)) as IUser;
    const { productId, variantId, quantity = 1 } = req.body;
    if (!isObjectId(productId)) {
      res.status(400).json({ success: false, message: 'Invalid product id' });
      return;
    }
    const qty = Math.max(1, Number(quantity) || 1);
    const product = await StoreProduct.findOne({ _id: productId, gymId: user.gymId, status: 'Active', availability: { $in: ['Online', 'Both'] } });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found or not available online' });
      return;
    }

    let targetStock = product.stock;
    if (product.hasVariants) {
      if (!variantId) {
        res.status(400).json({ success: false, message: 'Variant is required for this product' });
        return;
      }
      const variant = product.variants.find((v: any) => String(v._id) === String(variantId));
      if (!variant) {
        res.status(404).json({ success: false, message: 'Variant not found' });
        return;
      }
      targetStock = variant.stock;
    }

    if (targetStock <= 0) {
      res.status(400).json({ success: false, message: 'This item is currently out of stock' });
      return;
    }
    if (qty > targetStock) {
      res.status(400).json({ success: false, message: `Only ${targetStock} unit(s) available in stock` });
      return;
    }
    const cart = await StoreCart.findOneAndUpdate(
      { customerId: user._id, gymId: user.gymId },
      { $setOnInsert: { customerId: user._id, gymId: user.gymId } },
      { upsert: true, new: true }
    );
    const existing = cart.items.find((i) => i.productId.toString() === productId && (!i.variantId || i.variantId.toString() === variantId));
    if (existing) {
      const newQty = existing.quantity + qty;
      if (newQty > targetStock) {
        res.status(400).json({ success: false, message: `Only ${targetStock} unit(s) available in stock` });
        return;
      }
      existing.quantity = newQty;
    } else {
      cart.items.push({ productId: product._id, variantId: variantId || undefined, quantity: qty });
    }
    await cart.save();
    res.status(200).json({ success: true, message: 'Added to cart', cart });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!(await requireStoreCustomer(req, res))) return;
    const user = (await User.findById(req.user!.id)) as IUser;
    const { productId, variantId, quantity } = req.body;
    const qty = Math.max(1, Number(quantity));
    const product = await StoreProduct.findOne({ _id: productId, gymId: user.gymId, status: 'Active' });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    let targetStock = product.stock;
    if (product.hasVariants && variantId) {
      const variant = product.variants.find((v: any) => String(v._id) === String(variantId));
      if (variant) targetStock = variant.stock;
    }

    if (qty > targetStock) {
      res.status(400).json({ success: false, message: `Only ${targetStock} unit(s) available in stock` });
      return;
    }

    const filter: any = { customerId: user._id, gymId: user.gymId, 'items.productId': productId };
    if (variantId) filter['items.variantId'] = variantId;

    const updated = await StoreCart.findOneAndUpdate(
      filter,
      { $set: { 'items.$.quantity': qty } },
      { new: true }
    );
    if (!updated) {
      res.status(404).json({ success: false, message: 'Item not in your cart' });
      return;
    }
    res.status(200).json({ success: true, message: 'Cart updated', cart: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const removeCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!(await requireStoreCustomer(req, res))) return;
    const user = (await User.findById(req.user!.id)) as IUser;
    const { productId } = req.params;
    const variantId = req.query.variantId as string;
    
    const pullCondition: any = { productId };
    if (variantId) pullCondition.variantId = variantId;

    await StoreCart.updateOne(
      { customerId: user._id, gymId: user.gymId },
      { $pull: { items: pullCondition } }
    );
    res.status(200).json({ success: true, message: 'Item removed from cart' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!(await requireStoreCustomer(req, res))) return;
    const user = (await User.findById(req.user!.id)) as IUser;
    await StoreCart.updateOne(
      { customerId: user._id, gymId: user.gymId },
      { $set: { items: [] } }
    );
    res.status(200).json({ success: true, message: 'Cart cleared' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ---------------------------------------------------------------------------
// Checkout / orders
// ---------------------------------------------------------------------------

const buildOrderBlock = async (user: IUser, cart: any): Promise<{ error?: string; items?: any[]; subtotal?: number }> => {
  const gymId = user.gymId!;
  const productIds = cart.items.map((i: any) => i.productId);
  const products = await StoreProduct.find({ _id: { $in: productIds }, gymId }).lean();
  const byId = new Map(products.map((p: any) => [String(p._id), p]));
  const items: any[] = [];
  for (const row of cart.items) {
    const p = byId.get(String(row.productId));
    if (!p || p.status !== 'Active' || (p.availability !== 'Online' && p.availability !== 'Both')) {
      return { error: `A product in your cart is no longer available. Please review your cart.` };
    }

    let targetStock = p.stock;
    let sellingPrice = p.sellingPrice;
    let discountPrice = p.discountPrice;
    let sku = p.sku;
    let attributes = p.attributes;

    if (p.hasVariants && row.variantId) {
      const variant = (p.variants || []).find((v: any) => String(v._id) === String(row.variantId));
      if (!variant) return { error: `A selected variant for "${p.name}" is no longer available.` };
      targetStock = variant.stock;
      sellingPrice = variant.price;
      discountPrice = variant.discountPrice;
      sku = variant.sku;
      attributes = variant.attributes;
    } else if (p.hasVariants && !row.variantId) {
      return { error: `"${p.name}" requires a variant selection.` };
    }

    if (targetStock < row.quantity) {
      return { error: `"${p.name}" is low on stock (only ${targetStock} available). Please reduce the quantity.` };
    }
    
    const unitPrice = sellingPrice - (discountPrice || 0);

    items.push({
      productId: p._id,
      variantId: row.variantId,
      name: p.name,
      image: p.image,
      sku,
      attributes,
      quantity: row.quantity,
      sellingPrice,
      discountPrice,
      unitPrice,
      total: unitPrice * row.quantity,
    });
  }
  const subtotal = items.reduce((s: number, it: any) => s + it.total, 0);
  return { items, subtotal };
};

export const checkout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!(await requireStoreCustomer(req, res))) return;
    const user = (await User.findById(req.user!.id)) as IUser;
    const gymId = user.gymId!;
    const { fulfilmentType, deliveryDetails, paymentMethod = 'UPI', discount = 0 } = req.body;

    const cart = await StoreCart.findOne({ customerId: user._id, gymId });
    if (!cart || cart.items.length === 0) {
      res.status(400).json({ success: false, message: 'Your cart is empty' });
      return;
    }
    const built = await buildOrderBlock(user, cart);
    if (built.error) {
      res.status(400).json({ success: false, message: built.error });
      return;
    }

    if (fulfilmentType !== 'Gym Pickup' && fulfilmentType !== 'Delivery') {
      res.status(400).json({ success: false, message: 'Choose Gym Pickup or Delivery' });
      return;
    }
    if (fulfilmentType === 'Delivery') {
      for (const key of ['name', 'phone', 'address', 'city', 'state', 'pinCode']) {
        if (!deliveryDetails?.[key]) {
          res.status(400).json({ success: false, message: `Delivery address is missing: ${key}` });
          return;
        }
      }
    }

    for (const it of built.items!) {
      const prod: any = await StoreProduct.findById(it.productId).lean();
      if (fulfilmentType === 'Gym Pickup' && prod?.fulfilmentType === 'Delivery') {
        res.status(400).json({ success: false, message: `"${it.name}" is only available for delivery` });
        return;
      }
      if (fulfilmentType === 'Delivery' && prod?.fulfilmentType === 'Gym Pickup') {
        res.status(400).json({ success: false, message: `"${it.name}" is only available for pickup at the gym` });
        return;
      }
    }

    const subtotal = built.subtotal!;
    const disc = Math.min(Number(discount) || 0, subtotal);
    const total = subtotal - disc;

    const order = await StoreOrder.create({
      orderNumber: createOrderNumber(),
      gymId,
      customerId: user._id,
      items: built.items!,
      subtotal,
      discount: disc,
      total,
      paymentStatus: StoreOrderPaymentStatus.PAID,
      paymentMethod,
      transactionId: `TXN_${randomCode(8)}${Date.now().toString().slice(-4)}`,
      paymentDate: new Date(),
      fulfilmentType,
      deliveryDetails: fulfilmentType === 'Delivery' ? deliveryDetails : undefined,
      status: StoreOrderStatus.PENDING,
      statusHistory: [{ status: StoreOrderStatus.PENDING, note: 'Order placed and payment received', at: new Date() }],
    });

    // Atomic stock deduction
    let stockFailure = false;
    for (const it of built.items!) {
      if (it.variantId) {
        const updated = await StoreProduct.findOneAndUpdate(
          { _id: it.productId, 'variants._id': it.variantId, 'variants.stock': { $gte: it.quantity } },
          { $inc: { 'variants.$.stock': -it.quantity } },
          { new: true }
        );
        if (!updated) {
          stockFailure = true;
          break;
        }
        const varData = updated.variants.find((v: any) => String(v._id) === String(it.variantId));
        await StoreInventoryTransaction.create({
          gymId,
          productId: it.productId,
          variantId: it.variantId,
          type: StoreInventoryTransactionType.ONLINE_SALE,
          quantityChange: -it.quantity,
          stockAfter: varData?.stock || 0,
          sourceType: 'online',
          referenceId: order._id,
        });
        await notifyLowStockIfNeeded(updated, gymId); // Note: might need variant low stock check in future
      } else {
        const updated = await StoreProduct.findOneAndUpdate(
          { _id: it.productId, stock: { $gte: it.quantity } },
          { $inc: { stock: -it.quantity } },
          { new: true }
        );
        if (!updated) {
          stockFailure = true;
          break;
        }
        await StoreInventoryTransaction.create({
          gymId,
          productId: it.productId,
          type: StoreInventoryTransactionType.ONLINE_SALE,
          quantityChange: -it.quantity,
          stockAfter: updated.stock,
          sourceType: 'online',
          referenceId: order._id,
        });
        await notifyLowStockIfNeeded(updated, gymId);
      }
    }

    if (stockFailure) {
      // rollback
      for (const it of built.items!) {
        if (it.variantId) {
          await StoreProduct.updateOne({ _id: it.productId, 'variants._id': it.variantId }, { $inc: { 'variants.$.stock': it.quantity } });
        } else {
          await StoreProduct.updateOne({ _id: it.productId }, { $inc: { stock: it.quantity } });
        }
      }
      order.paymentStatus = StoreOrderPaymentStatus.FAILED;
      order.status = StoreOrderStatus.CANCELLED;
      order.cancellationReason = 'Insufficient stock at the time of checkout';
      order.statusHistory.push({ status: StoreOrderStatus.CANCELLED, note: order.cancellationReason, at: new Date() });
      await order.save();
      await StorePaymentTransaction.create({
        orderId: order._id,
        gymId,
        customerId: user._id,
        amount: total,
        paymentMethod,
        transactionId: `TXN_${randomCode(8)}${Date.now().toString().slice(-4)}`,
        status: StorePaymentTransactionStatus.FAILED,
      });
      res.status(400).json({ success: false, message: 'Your order could not be completed because some items went out of stock. Your payment was not charged.', order });
      return;
    }

    await StorePaymentTransaction.create({
      orderId: order._id,
      gymId,
      customerId: user._id,
      amount: total,
      paymentMethod,
      transactionId: order.transactionId!,
      status: StorePaymentTransactionStatus.SUCCESS,
      paymentDate: new Date(),
    });

    await StoreCart.updateOne({ customerId: user._id, gymId }, { $set: { items: [] } });

    const gym = await Gym.findById(gymId);
    const owner = gym ? await User.findById(gym.ownerId) : null;
    if (owner) {
      await notify({
        recipientId: owner._id,
        recipientRole: 'GYM_OWNER',
        gymId,
        title: 'New store order received',
        message: `Order ${order.orderNumber} for ₹${total} has been placed${gym ? ` at ${gym.name}` : ''}.`,
        type: 'success',
        relatedRecordId: order._id,
        link: '/admin/store/orders',
      });
    }
    await notify({
      recipientId: user._id,
      recipientRole: 'MEMBER',
      gymId,
      title: 'Order placed successfully',
      message: `Your order ${order.orderNumber} for ₹${total} is confirmed. You will be notified as it progresses.`,
      type: 'success',
      relatedRecordId: order._id,
      link: '/member/store/orders',
    });

    res.status(201).json({ success: true, message: 'Order placed successfully', order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ---------------------------------------------------------------------------
// Order management
// ---------------------------------------------------------------------------

const TRANSITIONS: Record<string, string[]> = {
  [StoreOrderStatus.PENDING]: [StoreOrderStatus.CONFIRMED, StoreOrderStatus.CANCELLED],
  [StoreOrderStatus.CONFIRMED]: [StoreOrderStatus.PREPARING, StoreOrderStatus.CANCELLED],
  [StoreOrderStatus.PREPARING]: [StoreOrderStatus.READY_FOR_PICKUP, StoreOrderStatus.OUT_FOR_DELIVERY, StoreOrderStatus.CANCELLED],
  [StoreOrderStatus.READY_FOR_PICKUP]: [StoreOrderStatus.COMPLETED],
  [StoreOrderStatus.OUT_FOR_DELIVERY]: [StoreOrderStatus.COMPLETED],
  [StoreOrderStatus.COMPLETED]: [StoreOrderStatus.REFUNDED],
};

const restockOrderItems = async (order: IStoreOrder): Promise<void> => {
  for (const it of order.items) {
    if (it.variantId) {
      const updated = await StoreProduct.findOneAndUpdate(
        { _id: it.productId, 'variants._id': it.variantId, 'variants.stock': { $gte: -it.quantity } },
        { $inc: { 'variants.$.stock': it.quantity } },
        { new: true }
      );
      if (!updated) continue;
      const varData = updated.variants.find((v: any) => String(v._id) === String(it.variantId));
      await StoreInventoryTransaction.create({
        gymId: order.gymId,
        productId: it.productId,
        variantId: it.variantId,
        type: StoreInventoryTransactionType.ADJUSTMENT,
        quantityChange: it.quantity,
        stockAfter: varData?.stock || 0,
        sourceType: 'manual',
        referenceId: order._id,
        note: `Restock on ${order.status === StoreOrderStatus.REFUNDED ? 'refund' : 'cancellation'} of ${order.orderNumber}`,
      });
    } else {
      const updated = await StoreProduct.findOneAndUpdate(
        { _id: it.productId, stock: { $gte: -it.quantity } },
        { $inc: { stock: it.quantity } },
        { new: true }
      );
      if (!updated) continue;
      await StoreInventoryTransaction.create({
        gymId: order.gymId,
        productId: it.productId,
        type: StoreInventoryTransactionType.ADJUSTMENT,
        quantityChange: it.quantity,
        stockAfter: updated.stock,
        sourceType: 'manual',
        referenceId: order._id,
        note: `Restock on ${order.status === StoreOrderStatus.REFUNDED ? 'refund' : 'cancellation'} of ${order.orderNumber}`,
      });
    }
  }
};

export const getGymOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!(await requireStoreOwner(req, res))) return;
    const gymId = await getGymIdForUser(req.user!.id);
    if (!gymId) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }
    const { status, paymentStatus, search, page = '1', limit = '40' } = req.query;
    const filter: any = { gymId };
    if (status && status !== 'all') filter.status = status;
    if (paymentStatus && paymentStatus !== 'all') filter.paymentStatus = paymentStatus;
    if (search && typeof search === 'string' && search.trim()) {
      filter.$or = [
        { orderNumber: { $regex: search.trim(), $options: 'i' } },
        { transactionId: { $regex: search.trim(), $options: 'i' } },
      ];
    }
    const pNum = Math.max(1, parseInt(String(page), 10) || 1);
    const lNum = Math.min(200, Math.max(1, parseInt(String(limit), 10) || 40));
    const total = await StoreOrder.countDocuments(filter);
    const orders = await StoreOrder.find(filter)
      .populate('customerId', 'firstName lastName email mobile profilePhoto')
      .sort({ createdAt: -1 })
      .skip((pNum - 1) * lNum)
      .limit(lNum);
    res.status(200).json({ success: true, orders, total, page: pNum, limit: lNum });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getGymOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!(await requireStoreOwner(req, res))) return;
    const gymId = await getGymIdForUser(req.user!.id);
    const { id } = req.params;
    const order = await StoreOrder.findOne({ _id: id, gymId }).populate('customerId', 'firstName lastName email mobile profilePhoto');
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    res.status(200).json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!(await requireStoreOwner(req, res))) return;
    const gymId = await getGymIdForUser(req.user!.id);
    if (!gymId) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }
    const { id } = req.params;
    const { status, note } = req.body;
    const order = await StoreOrder.findOne({ _id: id, gymId }).populate('customerId', 'firstName lastName email mobile');
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    const allowed = TRANSITIONS[order.status] || [];
    if (!status || !Object.values(StoreOrderStatus).includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }
    if (!allowed.includes(status)) {
      res.status(400).json({ success: false, message: `Cannot move order from "${order.status}" to "${status}"` });
      return;
    }
    const prev = order.status;
    order.status = status;
    order.statusHistory.push({ status, note: note || `Status changed to ${status}`, at: new Date() });

    if (status === StoreOrderStatus.CANCELLED || status === StoreOrderStatus.REFUNDED) {
      await restockOrderItems(order);
      if (status === StoreOrderStatus.CANCELLED) {
        order.cancellationReason = note || 'Cancelled by the gym';
        if (order.paymentStatus === StoreOrderPaymentStatus.PAID) {
          order.paymentStatus = StoreOrderPaymentStatus.REFUNDED;
          order.refundDetails = { amount: order.total, reason: note || 'Order cancelled', refundedAt: new Date() };
          await StorePaymentTransaction.updateOne({ orderId: order._id }, { $set: { status: StorePaymentTransactionStatus.REFUNDED } });
        }
      } else {
        order.paymentStatus = StoreOrderPaymentStatus.REFUNDED;
        order.refundDetails = { amount: order.total, reason: note || 'Order refunded', refundedAt: new Date() };
        await StorePaymentTransaction.updateOne({ orderId: order._id }, { $set: { status: StorePaymentTransactionStatus.REFUNDED } });
      }
    }

    await order.save();

    const customer = (order as any).customerId as any;
    if (customer?._id) {
      await notify({
        recipientId: customer._id,
        recipientRole: 'MEMBER',
        gymId,
        title: `Order ${status}`,
        message: `Your order ${order.orderNumber} is now "${status}".${note ? ` Note: ${note}` : ''}`,
        type: 'info',
        relatedRecordId: order._id,
        link: '/member/store/orders',
      });
    }

    if (status === StoreOrderStatus.COMPLETED) {
      await notify({
        recipientId: customer?._id,
        recipientRole: 'MEMBER',
        gymId,
        title: 'Order completed',
        message: `Your order ${order.orderNumber} has been completed. Thank you!`,
        type: 'success',
        relatedRecordId: order._id,
        link: '/member/store/orders',
      });
    }

    res.status(200).json({ success: true, message: `Order is now ${status}`, order, previousStatus: prev });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!(await requireStoreCustomer(req, res))) return;
    const user = (await User.findById(req.user!.id)) as IUser;
    const { status, page = '1', limit = '20' } = req.query;
    const filter: any = { customerId: user._id, gymId: user.gymId };
    if (status && status !== 'all') filter.status = status;
    const pNum = Math.max(1, parseInt(String(page), 10) || 1);
    const lNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
    const total = await StoreOrder.countDocuments(filter);
    const orders = await StoreOrder.find(filter)
      .populate('customerId', 'firstName lastName email mobile profilePhoto')
      .sort({ createdAt: -1 })
      .skip((pNum - 1) * lNum)
      .limit(lNum);
    res.status(200).json({ success: true, orders, total, page: pNum, limit: lNum });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getMyOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!(await requireStoreCustomer(req, res))) return;
    const user = (await User.findById(req.user!.id)) as IUser;
    const { id } = req.params;
    const order = await StoreOrder.findOne({ _id: id, customerId: user._id, gymId: user.gymId });
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    res.status(200).json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const cancelMyOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!(await requireStoreCustomer(req, res))) return;
    const user = (await User.findById(req.user!.id)) as IUser;
    const order = await StoreOrder.findOne({ _id: req.params.id, customerId: user._id, gymId: user.gymId });
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    if (order.status !== StoreOrderStatus.PENDING) {
      res.status(400).json({ success: false, message: 'Only orders with "Pending" status can be cancelled by the customer.' });
      return;
    }
    order.status = StoreOrderStatus.CANCELLED;
    order.cancellationReason = 'Cancelled by customer';
    order.statusHistory.push({ status: StoreOrderStatus.CANCELLED, note: 'Cancelled by customer', at: new Date() });
    if (order.paymentStatus === StoreOrderPaymentStatus.PAID) {
      order.paymentStatus = StoreOrderPaymentStatus.REFUNDED;
      order.refundDetails = { amount: order.total, reason: 'Customer cancelled order', refundedAt: new Date() };
      await StorePaymentTransaction.updateOne({ orderId: order._id }, { $set: { status: StorePaymentTransactionStatus.REFUNDED } });
    }
    await order.save();
    await restockOrderItems(order);

    const gym = await Gym.findById(user.gymId);
    if (gym) {
      await notify({
        recipientId: gym.ownerId,
        recipientRole: 'GYM_OWNER',
        gymId: user.gymId,
        title: 'Order cancelled by customer',
        message: `Order ${order.orderNumber} was cancelled by the customer.`,
        type: 'alert',
        relatedRecordId: order._id,
        link: '/admin/store/orders',
      });
    }
    res.status(200).json({ success: true, message: 'Order cancelled', order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ---------------------------------------------------------------------------
// Offline sales
// ---------------------------------------------------------------------------

export const recordOfflineSale = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!(await requireStoreOwner(req, res))) return;
    const gymId = await getGymIdForUser(req.user!.id);
    if (!gymId) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }
    const { items, customerId, paymentMethod = 'Cash', discount = 0, note, paymentDate } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'At least one item is required' });
      return;
    }
    const productIds = items.map((i: any) => i.productId).filter(isObjectId);
    if (productIds.length !== items.length) {
      res.status(400).json({ success: false, message: 'Invalid product id in items' });
      return;
    }
    const products = await StoreProduct.find({ _id: { $in: productIds }, gymId }).lean();
    const byId = new Map(products.map((p: any) => [String(p._id), p]));
    const saleItems: any[] = [];
    for (const row of items) {
      const p = byId.get(String(row.productId));
      if (!p || p.status !== 'Active') {
        res.status(400).json({ success: false, message: 'A selected product is not active' });
        return;
      }
      let targetStock = p.stock;
      let sellingPrice = p.sellingPrice;
      let discountPrice = p.discountPrice;
      let sku = p.sku;
      let attributes = p.attributes;

      if (p.hasVariants && row.variantId) {
        const variant = (p.variants || []).find((v: any) => String(v._id) === String(row.variantId));
        if (!variant) {
          res.status(400).json({ success: false, message: `A selected variant for "${p.name}" is not available.` });
          return;
        }
        targetStock = variant.stock;
        sellingPrice = variant.price;
        discountPrice = variant.discountPrice;
        sku = variant.sku;
        attributes = variant.attributes;
      } else if (p.hasVariants && !row.variantId) {
        res.status(400).json({ success: false, message: `"${p.name}" requires a variant selection.` });
        return;
      }

      const qty = Math.max(1, Number(row.quantity) || 1);
      if (targetStock < qty) {
        res.status(400).json({ success: false, message: `"${p.name}" has only ${targetStock} unit(s) in stock` });
        return;
      }
      const unitPrice = discountPrice !== undefined ? discountPrice : sellingPrice;
      saleItems.push({
        productId: p._id,
        variantId: row.variantId,
        name: p.name,
        image: p.image,
        sku,
        attributes,
        quantity: qty,
        sellingPrice,
        discountPrice,
        unitPrice,
        total: unitPrice * qty,
      });
    }
    const subtotal = saleItems.reduce((s: number, it: any) => s + it.total, 0);
    const disc = Math.min(Number(discount) || 0, subtotal);
    const total = subtotal - disc;

    const sale = await StoreOfflineSale.create({
      saleNumber: createSaleNumber(),
      gymId,
      customerId: customerId || undefined,
      items: saleItems,
      subtotal,
      discount: disc,
      total,
      paymentMethod,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      createdBy: req.user!.id,
      note,
    });

    for (const it of saleItems) {
      if (it.variantId) {
        const updated = await StoreProduct.findOneAndUpdate(
          { _id: it.productId, 'variants._id': it.variantId, 'variants.stock': { $gte: it.quantity } },
          { $inc: { 'variants.$.stock': -it.quantity } },
          { new: true }
        );
        if (!updated) {
          for (const prev of saleItems) {
            if (prev.productId.toString() === it.productId.toString() && String(prev.variantId) === String(it.variantId)) break;
            if (prev.variantId) {
              await StoreProduct.updateOne({ _id: prev.productId, 'variants._id': prev.variantId }, { $inc: { 'variants.$.stock': prev.quantity } });
            } else {
              await StoreProduct.updateOne({ _id: prev.productId }, { $inc: { stock: prev.quantity } });
            }
          }
          await StoreOfflineSale.deleteOne({ _id: sale._id });
          res.status(400).json({ success: false, message: `"${it.name}" went out of stock while recording the sale. No items were deducted.` });
          return;
        }
        const varData = updated.variants.find((v: any) => String(v._id) === String(it.variantId));
        await StoreInventoryTransaction.create({
          gymId,
          productId: it.productId,
          variantId: it.variantId,
          type: StoreInventoryTransactionType.OFFLINE_SALE,
          quantityChange: -it.quantity,
          stockAfter: varData?.stock || 0,
          sourceType: 'offline',
          referenceId: sale._id,
        });
        await notifyLowStockIfNeeded(updated, gymId);
      } else {
        const updated = await StoreProduct.findOneAndUpdate(
          { _id: it.productId, stock: { $gte: it.quantity } },
          { $inc: { stock: -it.quantity } },
          { new: true }
        );
        if (!updated) {
          for (const prev of saleItems) {
            if (prev.productId.toString() === it.productId.toString()) break;
            if (prev.variantId) {
              await StoreProduct.updateOne({ _id: prev.productId, 'variants._id': prev.variantId }, { $inc: { 'variants.$.stock': prev.quantity } });
            } else {
              await StoreProduct.updateOne({ _id: prev.productId }, { $inc: { stock: prev.quantity } });
            }
          }
          await StoreOfflineSale.deleteOne({ _id: sale._id });
          res.status(400).json({ success: false, message: `"${it.name}" went out of stock while recording the sale. No items were deducted.` });
          return;
        }
        await StoreInventoryTransaction.create({
          gymId,
          productId: it.productId,
          type: StoreInventoryTransactionType.OFFLINE_SALE,
          quantityChange: -it.quantity,
          stockAfter: updated.stock,
          sourceType: 'offline',
          referenceId: sale._id,
        });
        await notifyLowStockIfNeeded(updated, gymId);
      }
    }

    if (customerId) {
      await notify({
        recipientId: customerId,
        recipientRole: 'MEMBER',
        gymId,
        title: 'Offline purchase recorded',
        message: `Your offline purchase (${sale.saleNumber}) for ₹${total} has been recorded at the gym.`,
        type: 'success',
        relatedRecordId: sale._id,
        link: '/member/store/orders',
      });
    }

    res.status(201).json({ success: true, message: 'Offline sale recorded', sale });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getOfflineSales = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!(await requireStoreOwner(req, res))) return;
    const gymId = await getGymIdForUser(req.user!.id);
    if (!gymId) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }
    const { from, to, page = '1', limit = '40' } = req.query;
    const filter: any = { gymId };
    if (from || to) {
      filter.paymentDate = {};
      if (from) filter.paymentDate.$gte = new Date(String(from));
      if (to) filter.paymentDate.$lte = new Date(String(to));
    }
    const pNum = Math.max(1, parseInt(String(page), 10) || 1);
    const lNum = Math.min(200, Math.max(1, parseInt(String(limit), 10) || 40));
    const total = await StoreOfflineSale.countDocuments(filter);
    const sales = await StoreOfflineSale.find(filter)
      .populate('customerId', 'firstName lastName email mobile profilePhoto')
      .populate('createdBy', 'firstName lastName')
      .sort({ paymentDate: -1, createdAt: -1 })
      .skip((pNum - 1) * lNum)
      .limit(lNum);
    res.status(200).json({ success: true, sales, total, page: pNum, limit: lNum });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ---------------------------------------------------------------------------
// Sales history
// ---------------------------------------------------------------------------

export const getSalesHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!(await requireStoreOwner(req, res))) return;
    const gymId = await getGymIdForUser(req.user!.id);
    if (!gymId) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }
    const { source = 'all', productName, from, to, page = '1', limit = '40' } = req.query;
    const dateFilter: any = {};
    if (from || to) {
      dateFilter.createdAt = {};
      if (from) dateFilter.createdAt.$gte = new Date(String(from));
      if (to) dateFilter.createdAt.$lte = new Date(String(to));
    }

    const products = productName
      ? await StoreProduct.find({ gymId, name: { $regex: String(productName), $options: 'i' } }).distinct('_id')
      : null;

    let online: any[] = [];
    let offline: any[] = [];

    if (source === 'all' || source === 'online') {
      const filter: any = { gymId, paymentStatus: { $in: ['Paid', 'Refunded'] }, ...dateFilter };
      if (products && products.length) filter['items.productId'] = { $in: products };
      online = await StoreOrder.find(filter)
        .populate('customerId', 'firstName lastName email mobile profilePhoto')
        .sort({ createdAt: -1 })
        .limit(2000);
    }
    if (source === 'all' || source === 'offline') {
      const filter: any = { gymId, ...dateFilter };
      if (products && products.length) filter['items.productId'] = { $in: products };
      offline = await StoreOfflineSale.find(filter)
        .populate('customerId', 'firstName lastName email mobile profilePhoto')
        .sort({ createdAt: -1 })
        .limit(2000);
    }

    const mapped = [
      ...online.map((o: any) => ({
        _id: o._id,
        recordType: 'online' as const,
        recordNumber: o.orderNumber,
        sourceType: 'Online Order',
        type: o.fulfilmentType,
        status: o.status,
        paymentStatus: o.paymentStatus,
        paymentMethod: o.paymentMethod,
        customer: o.customerId,
        items: o.items,
        subtotal: o.subtotal,
        discount: o.discount,
        total: o.total,
        date: o.createdAt,
      })),
      ...offline.map((s: any) => ({
        _id: s._id,
        recordType: 'offline' as const,
        recordNumber: s.saleNumber,
        sourceType: 'Offline Sale',
        type: 'In-Gym',
        status: 'Completed',
        paymentStatus: 'Paid',
        paymentMethod: s.paymentMethod,
        customer: s.customerId,
        items: s.items,
        subtotal: s.subtotal,
        discount: s.discount,
        total: s.total,
        date: s.paymentDate || s.createdAt,
      })),
    ].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const pNum = Math.max(1, parseInt(String(page), 10) || 1);
    const lNum = Math.min(200, Math.max(1, parseInt(String(limit), 10) || 40));
    const total = mapped.length;
    const sales = mapped.slice((pNum - 1) * lNum, (pNum - 1) * lNum + lNum);

    const totals = mapped.reduce(
      (acc: any, r: any) => {
        if (r.recordType === 'online' && r.paymentStatus === 'Paid') acc.online += r.total;
        if (r.recordType === 'offline') acc.offline += r.total;
        acc.all += r.total;
        return acc;
      },
      { online: 0, offline: 0, all: 0 }
    );

    res.status(200).json({ success: true, sales, total, page: pNum, limit: lNum, totals });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------

export const getInventory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!(await requireStoreOwner(req, res))) return;
    const gymId = await getGymIdForUser(req.user!.id);
    if (!gymId) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }
    const { status, category, search, page = '1', limit = '50' } = req.query;
    const filter: any = { gymId };
    if (category && category !== 'all') filter.categoryName = category;
    if (search && typeof search === 'string' && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { brand: { $regex: search.trim(), $options: 'i' } },
        { sku: { $regex: search.trim(), $options: 'i' } },
      ];
    }
    
    if (status === 'outOfStock') {
      filter.stock = { $lte: 0 };
    } else if (status === 'lowStock') {
      const all = await StoreProduct.find(filter).select('stock lowStockThreshold').lean();
      const ids = (all as any[]).filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).map((p) => p._id);
      filter._id = { $in: ids };
    } else if (status === 'inStock') {
      const all = await StoreProduct.find(filter).select('stock lowStockThreshold').lean();
      const ids = (all as any[]).filter((p) => p.stock > p.lowStockThreshold).map((p) => p._id);
      filter._id = { $in: ids };
    }
    const pNum = Math.max(1, parseInt(String(page), 10) || 1);
    const lNum = Math.min(200, Math.max(1, parseInt(String(limit), 10) || 50));
    const total = await StoreProduct.countDocuments(filter);
    const products = await StoreProduct.find(filter).sort({ createdAt: -1 }).skip((pNum - 1) * lNum).limit(lNum);
    const summary = {
      totalProducts: await StoreProduct.countDocuments({ gymId }),
      outOfStock: await StoreProduct.countDocuments({ gymId, stock: { $lte: 0 } }),
      lowStockCount: (await StoreProduct.find({ gymId }).select('stock lowStockThreshold').lean() as any[])
        .filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length,
      inStock: await StoreProduct.countDocuments({ gymId, stock: { $gt: 0 } }),
    };
    res.status(200).json({ success: true, products, total, page: pNum, limit: lNum, summary });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getInventoryTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!(await requireStoreOwner(req, res))) return;
    const gymId = await getGymIdForUser(req.user!.id);
    if (!gymId) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }
    const { productId, type, page = '1', limit = '50' } = req.query;
    const filter: any = { gymId };
    if (productId && productId !== 'all') filter.productId = productId;
    if (type && type !== 'all') filter.type = type;
    const pNum = Math.max(1, parseInt(String(page), 10) || 1);
    const lNum = Math.min(200, Math.max(1, parseInt(String(limit), 10) || 50));
    const total = await StoreInventoryTransaction.countDocuments(filter);
    const transactions = await StoreInventoryTransaction.find(filter)
      .populate('productId', 'name image sku')
      .sort({ createdAt: -1 })
      .skip((pNum - 1) * lNum)
      .limit(lNum);
    res.status(200).json({ success: true, transactions, total, page: pNum, limit: lNum });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export const getStoreDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!(await requireStoreOwner(req, res))) return;
    const gymId = await getGymIdForUser(req.user!.id);
    if (!gymId) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }
    const activeStatuses: string[] = ['Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery'];
    const pendingOrders = await StoreOrder.countDocuments({ gymId, status: { $in: activeStatuses } } as any);
    const [
      totalProducts, activeProducts, outOfStock,
      totalOrders, completedOrders,
      onlinePaid, onlineAll,
      offlineSum,
      recentOrders,
    ] = await Promise.all([
      StoreProduct.countDocuments({ gymId }),
      StoreProduct.countDocuments({ gymId, status: 'Active' }),
      StoreProduct.countDocuments({ gymId, stock: { $lte: 0 } }),
      StoreOrder.countDocuments({ gymId }),
      StoreOrder.countDocuments({ gymId, status: 'Completed' } as any),
      StoreOrder.aggregate([
        { $match: { gymId, paymentStatus: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),
      StoreOrder.aggregate([
        { $match: { gymId } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      StoreOfflineSale.aggregate([
        { $match: { gymId } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),
      StoreOrder.find({ gymId }).sort({ createdAt: -1 }).limit(5).select('orderNumber status paymentStatus total createdAt'),
    ]);

    const lowStockCount = (await StoreProduct.find({ gymId }).select('stock lowStockThreshold').lean() as any[])
      .filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length;

    const recentOrdersWithCustomers = await StoreOrder.find({ gymId })
      .populate('customerId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        activeProducts,
        outOfStock,
        lowStockCount,
        totalOrders,
        pendingOrders,
        completedOrders,
        onlineSales: onlinePaid[0]?.total || 0,
        onlineOrderCount: onlinePaid[0]?.count || 0,
        offlineSales: offlineSum[0]?.total || 0,
        offlineSaleCount: offlineSum[0]?.count || 0,
        totalRevenue: (onlinePaid[0]?.total || 0) + (offlineSum[0]?.total || 0),
        orderValueTotal: onlineAll[0]?.total || 0,
      },
      recentOrders: recentOrdersWithCustomers,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ---------------------------------------------------------------------------
// Super admin monitoring
// ---------------------------------------------------------------------------

export const superAdminGetStoreOverview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { gymId } = req.query;
    const gymFilter = gymId && gymId !== 'all' ? new mongoose.Types.ObjectId(String(gymId)) : null;
    const gyms = await Gym.find(gymFilter ? { _id: gymFilter } : {}).select('name subscription status ownerId').lean();
    const payload: any[] = [];
    for (const gymRaw of gyms) {
      const gym = gymRaw as any;
      const gid = gym._id as mongoose.Types.ObjectId;
      const entitlement = isStoreEnabledForGym(gym);
      const stats = entitlement.enabled
        ? await Promise.all([
            StoreProduct.countDocuments({ gymId: gid }),
            StoreProduct.countDocuments({ gymId: gid, status: 'Active' }),
            StoreOrder.countDocuments({ gymId: gid }),
            StoreOrder.countDocuments({ gymId: gid, status: 'Completed' } as any),
            StoreOrder.aggregate([
              { $match: { gymId: gid, paymentStatus: 'Paid' } },
              { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
            ]),
            StoreOfflineSale.aggregate([
              { $match: { gymId: gid } },
              { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
            ]),
            StoreOrder.find({ gymId: gid }).sort({ createdAt: -1 }).limit(3).select('orderNumber status total createdAt'),
          ])
        : [0, 0, 0, 0, [], [], []];
      payload.push({
        gymId: gym._id,
        gymName: gym.name,
        gymStatus: gym.status,
        storeEntitlement: entitlement,
        stats: {
          totalProducts: stats[0],
          activeProducts: stats[1],
          totalOrders: stats[2],
          completedOrders: stats[3],
          onlineRevenue: (stats[4] as any[])[0]?.total || 0,
          onlineOrderCount: (stats[4] as any[])[0]?.count || 0,
          offlineRevenue: (stats[5] as any[])[0]?.total || 0,
          offlineSaleCount: (stats[5] as any[])[0]?.count || 0,
          totalRevenue: ((stats[4] as any[])[0]?.total || 0) + ((stats[5] as any[])[0]?.total || 0),
        },
        recentOrders: stats[6],
      });
    }
    payload.sort((a, b) => (b.stats.totalRevenue || 0) - (a.stats.totalRevenue || 0));
    res.status(200).json({ success: true, gyms: payload });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ---------------------------------------------------------------------------
// Image upload
// ---------------------------------------------------------------------------

export const uploadImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image file provided' });
      return;
    }
    const url = `/uploads/${req.file.filename}`;
    res.status(200).json({ success: true, message: 'Image uploaded', url });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};