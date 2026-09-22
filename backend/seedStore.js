const mongoose = require('mongoose');

// Define schemas explicitly to avoid needing the full TS models in this script
const storeCategorySchema = new mongoose.Schema({}, { strict: false, collection: 'storeproductcategories' });
const storeProductSchema = new mongoose.Schema({}, { strict: false, collection: 'storeproducts' });
const storeOrderSchema = new mongoose.Schema({}, { strict: false, collection: 'storeorders' });
const storeOfflineSaleSchema = new mongoose.Schema({}, { strict: false, collection: 'storeofflinesales' });
const storeInventorySchema = new mongoose.Schema({}, { strict: false, collection: 'storeinventorytransactions' });

mongoose.connect('mongodb://127.0.0.1:27017/ai-gym')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const Gym = mongoose.model('Gym', new mongoose.Schema({}, { strict: false }));
    const Category = mongoose.model('StoreProductCategory', storeCategorySchema);
    const Product = mongoose.model('StoreProduct', storeProductSchema);
    const Order = mongoose.model('StoreOrder', storeOrderSchema);
    const OfflineSale = mongoose.model('StoreOfflineSale', storeOfflineSaleSchema);
    const Inventory = mongoose.model('StoreInventoryTransaction', storeInventorySchema);

    const gyms = await Gym.find({ name: { $regex: /Messy fitness/i } });
    if(gyms.length === 0) {
      console.log('No gym found for Messy fitness. Exiting.');
      process.exit(1);
    }
    
    const gym = gyms[0];
    const gymId = gym._id;
    console.log('Found Gym:', gym.name, gymId);

    // Clear existing store data for this gym
    await Category.deleteMany({ gymId });
    await Product.deleteMany({ gymId });
    await Order.deleteMany({ gymId });
    await OfflineSale.deleteMany({ gymId });
    await Inventory.deleteMany({ gymId });
    console.log('Cleared existing store data');

    // 1. Categories
    const categoriesData = [
      { gymId, name: 'Supplements', description: 'Protein powders, pre-workouts, and vitamins', status: 'Active' },
      { gymId, name: 'Apparel', description: 'Gym clothing and accessories', status: 'Active' },
      { gymId, name: 'Equipment', description: 'Small workout equipment for home', status: 'Active' },
      { gymId, name: 'Snacks & Drinks', description: 'Energy bars, protein shakes, and water', status: 'Active' },
    ];
    const insertedCategories = await Category.insertMany(categoriesData);
    console.log('Inserted Categories');
    
    const getCat = (name) => insertedCategories.find(c => c.name === name);

    // 2. Products
    const productsData = [
      {
        gymId,
        name: 'Whey Protein Isolate 1kg',
        description: 'Premium whey protein isolate, 25g protein per scoop.',
        brand: 'Optimum Nutrition',
        sku: 'WPI-1KG-CHOC',
        categoryName: 'Supplements',
        categoryId: getCat('Supplements')._id,
        image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&auto=format&fit=crop',
        sellingPrice: 3500,
        discountPrice: 3200,
        stock: 45,
        status: 'Active',
        availability: 'Both',
        fulfilmentType: 'Both',
        lowStockThreshold: 10,
        createdAt: new Date()
      },
      {
        gymId,
        name: 'Pre-Workout Energy Powder',
        description: 'Explosive energy and focus for your workouts.',
        brand: 'Cellucor',
        sku: 'PRE-WORKOUT-30',
        categoryName: 'Supplements',
        categoryId: getCat('Supplements')._id,
        image: 'https://images.unsplash.com/photo-1622485542152-7e04047a23c5?w=800&auto=format&fit=crop',
        sellingPrice: 1800,
        discountPrice: null,
        stock: 20,
        status: 'Active',
        availability: 'Both',
        fulfilmentType: 'Both',
        lowStockThreshold: 5,
        createdAt: new Date()
      },
      {
        gymId,
        name: 'Gym Stringer T-Shirt',
        description: 'Comfortable, breathable cotton blend stringer.',
        brand: 'GymShark',
        sku: 'TSHIRT-STR-BLK-M',
        categoryName: 'Apparel',
        categoryId: getCat('Apparel')._id,
        image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop',
        sellingPrice: 999,
        discountPrice: 799,
        stock: 60,
        status: 'Active',
        availability: 'Offline Only',
        fulfilmentType: 'Gym Pickup',
        lowStockThreshold: 15,
        createdAt: new Date()
      },
      {
        gymId,
        name: 'Resistance Band Set',
        description: 'Set of 5 resistance bands with varying tension levels.',
        brand: 'FitBand',
        sku: 'RES-BAND-5',
        categoryName: 'Equipment',
        categoryId: getCat('Equipment')._id,
        image: 'https://images.unsplash.com/photo-1598266663412-7e44e22df6ee?w=800&auto=format&fit=crop',
        sellingPrice: 1200,
        discountPrice: 999,
        stock: 3, // intentionally low stock
        status: 'Active',
        availability: 'Both',
        fulfilmentType: 'Both',
        lowStockThreshold: 5,
        createdAt: new Date()
      },
      {
        gymId,
        name: 'Protein Bar - Chocolate Peanut',
        description: '20g protein bar, low sugar.',
        brand: 'Quest',
        sku: 'PBAR-CHOC-PNUT',
        categoryName: 'Snacks & Drinks',
        categoryId: getCat('Snacks & Drinks')._id,
        image: 'https://images.unsplash.com/photo-1622485542152-7e04047a23c5?w=800&auto=format&fit=crop',
        sellingPrice: 150,
        discountPrice: null,
        stock: 120,
        status: 'Active',
        availability: 'Offline Only',
        fulfilmentType: 'Gym Pickup',
        lowStockThreshold: 20,
        createdAt: new Date()
      },
      {
        gymId,
        name: 'Smart Shaker Bottle 700ml',
        description: 'Leak-proof shaker bottle with storage compartment.',
        brand: 'BlenderBottle',
        sku: 'SHAKER-700-BLK',
        categoryName: 'Accessories',
        image: 'https://images.unsplash.com/photo-1574516361730-81f18165c71b?w=800&auto=format&fit=crop',
        sellingPrice: 600,
        discountPrice: 450,
        stock: 0, // Out of stock
        status: 'Active',
        availability: 'Both',
        fulfilmentType: 'Both',
        lowStockThreshold: 10,
        createdAt: new Date()
      }
    ];
    
    const insertedProducts = await Product.insertMany(productsData);
    console.log('Inserted Products');

    // 3. Inventory Transactions (simulate initial stock addition)
    const inventoryData = insertedProducts.map(p => ({
      gymId,
      productId: p._id,
      type: 'add',
      quantity: p.stock,
      note: 'Initial stock setup',
      previousStock: 0,
      newStock: p.stock,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    }));
    await Inventory.insertMany(inventoryData.filter(i => i.quantity > 0));
    console.log('Inserted Inventory transactions');

    // 4. Dummy Offline Sales
    const offlineSalesData = [];
    for(let i=0; i<15; i++) {
      const p1 = insertedProducts[Math.floor(Math.random() * insertedProducts.length)];
      let p2 = insertedProducts[Math.floor(Math.random() * insertedProducts.length)];
      if(p1._id === p2._id) p2 = insertedProducts[(Math.floor(Math.random() * insertedProducts.length) + 1) % insertedProducts.length];
      
      const qty1 = Math.floor(Math.random() * 3) + 1;
      const qty2 = Math.floor(Math.random() * 2) + 1;
      
      const p1Price = p1.discountPrice || p1.sellingPrice;
      const p2Price = p2.discountPrice || p2.sellingPrice;
      
      const subtotal = (p1Price * qty1) + (p2Price * qty2);
      const discount = Math.floor(subtotal * 0.05); // 5% discount
      const tax = Math.floor((subtotal - discount) * 0.18);
      const total = subtotal - discount + tax;

      // Random date within last 30 days
      const date = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));

      offlineSalesData.push({
        gymId,
        saleNumber: 'SALE-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        items: [
          { productId: p1._id, name: p1.name, sellingPrice: p1.sellingPrice, unitPrice: p1Price, quantity: qty1, total: p1Price * qty1 },
          { productId: p2._id, name: p2.name, sellingPrice: p2.sellingPrice, unitPrice: p2Price, quantity: qty2, total: p2Price * qty2 }
        ],
        subtotal,
        discount,
        tax,
        total,
        paymentMethod: ['Cash', 'UPI', 'Card'][Math.floor(Math.random() * 3)],
        customerName: 'Customer ' + (i + 1),
        customerPhone: '98765432' + String(i).padStart(2, '0'),
        createdAt: date
      });
    }
    await OfflineSale.insertMany(offlineSalesData);
    console.log('Inserted Offline Sales');

    // 5. Dummy Online Orders (Assume they were made by dummy users)
    const ordersData = [];
    for(let i=0; i<10; i++) {
      const p = insertedProducts[Math.floor(Math.random() * insertedProducts.length)];
      const qty = Math.floor(Math.random() * 2) + 1;
      const pPrice = p.discountPrice || p.sellingPrice;
      
      const subtotal = pPrice * qty;
      const tax = Math.floor(subtotal * 0.18);
      const total = subtotal + tax;

      // Random date within last 14 days
      const date = new Date(Date.now() - Math.floor(Math.random() * 14 * 24 * 60 * 60 * 1000));

      ordersData.push({
        gymId,
        customerId: new mongoose.Types.ObjectId(), // Dummy customer
        orderNumber: 'ORD-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
        items: [
          { productId: p._id, name: p.name, sellingPrice: p.sellingPrice, unitPrice: pPrice, quantity: qty, total: pPrice * qty }
        ],
        subtotal,
        discount: 0,
        tax,
        total,
        status: ['Pending', 'Processing', 'Ready for Pickup', 'Completed', 'Cancelled'][Math.floor(Math.random() * 5)],
        paymentStatus: 'Paid',
        paymentMethod: 'UPI',
        createdAt: date,
        updatedAt: date
      });
    }
    await Order.insertMany(ordersData);
    console.log('Inserted Orders');

    console.log('Store data seeding completed successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error seeding store data:', err);
    process.exit(1);
  });
