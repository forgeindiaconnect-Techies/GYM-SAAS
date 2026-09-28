import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

import User, { Role, ApprovalStatus, SubscriptionStatus } from '../models/User';
import Gym, { GymStatus } from '../models/Gym';
import Branch from '../models/Branch';
import Trainer from '../models/Trainer';
import TrainerFee from '../models/TrainerFee';
import TrainerPayment from '../models/TrainerPayment';
import TrainerSession, { TrainerSessionMode, TrainerSessionStatus } from '../models/TrainerSession';
import CustomerMembership, { CustomerMembershipStatus } from '../models/CustomerMembership';
import Payment, { PaymentStatus } from '../models/Payment';
import Enquiry, { EnquiryStatus } from '../models/Enquiry';
import Notification from '../models/Notification';
import AIRecommendation from '../models/AIRecommendation';
import StoreProductCategory from '../models/StoreProductCategory';
import StoreProduct from '../models/StoreProduct';
import StoreOrder, { StoreOrderStatus, StoreOrderPaymentStatus } from '../models/StoreOrder';
import StoreOfflineSale from '../models/StoreOfflineSale';
import StoreInventoryTransaction, { StoreInventoryTransactionType } from '../models/StoreInventoryTransaction';

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-gym');
    console.log('MongoDB Connected for Complete Seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Gym.deleteMany({});
    await Branch.deleteMany({});
    await Trainer.deleteMany({});
    await TrainerFee.deleteMany({});
    await TrainerPayment.deleteMany({});
    await TrainerSession.deleteMany({});
    await CustomerMembership.deleteMany({});
    await Payment.deleteMany({});
    await Enquiry.deleteMany({});
    await Notification.deleteMany({});
    await AIRecommendation.deleteMany({});
    await StoreProductCategory.deleteMany({});
    await StoreProduct.deleteMany({});
    await StoreOrder.deleteMany({});
    await StoreOfflineSale.deleteMany({});
    await StoreInventoryTransaction.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const pwdPassword123 = await bcrypt.hash('password123', salt);
    const pwdSelva143 = await bcrypt.hash('Selva@143', salt);
    const pwdNaveen143 = await bcrypt.hash('Naveen@143', salt);

    // ==========================================
    // 1. SYSTEM & SUPER ADMIN
    // ==========================================
    await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@aigym.com',
      mobile: '9876543210',
      passwordHash: pwdPassword123,
      role: Role.SUPER_ADMIN,
      approvalStatus: ApprovalStatus.APPROVED,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      isActive: true,
    });

    await User.create({
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@aigym.com',
      mobile: '9876543211',
      passwordHash: pwdPassword123,
      role: Role.ADMIN,
      approvalStatus: ApprovalStatus.APPROVED,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      isActive: true,
    });

    // ==========================================
    // 2. GYM OWNER (Selva Kumar)
    // ==========================================
    const gymOwner = await User.create({
      firstName: 'Selva',
      lastName: 'Kumar',
      email: 'selva@gmail.com',
      mobile: '9876543212',
      passwordHash: pwdSelva143,
      role: Role.GYM_OWNER,
      approvalStatus: ApprovalStatus.APPROVED,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      subscriptionPlan: 'PLATINUM',
      isActive: true,
    });

    // Equipment Data
    const equipmentList = [
      { category: 'Cardio', name: 'Treadmill Series X', brand: 'LifeFitness', quantity: 6, condition: 'Good', availability: 'Available' },
      { category: 'Cardio', name: 'Elliptical Cross Trainer', brand: 'Precor', quantity: 4, condition: 'Good', availability: 'Available' },
      { category: 'Strength', name: '45° Leg Press Machine', brand: 'Hammer Strength', quantity: 2, condition: 'Good', availability: 'Available' },
      { category: 'Strength', name: 'Dual Adjustable Cable Crossover', brand: 'Matrix', quantity: 2, condition: 'Good', availability: 'Available' },
      { category: 'Cardio', name: 'Concept2 Rowing Machine', brand: 'Concept2', quantity: 3, condition: 'New', availability: 'Available' },
      { category: 'Strength', name: 'Smith Machine Pro', brand: 'Rogue', quantity: 2, condition: 'Good', availability: 'Available' },
      { category: 'Strength', name: 'Dumbbell Set (2.5kg - 40kg)', brand: 'Rogue', quantity: 12, condition: 'Good', availability: 'Available' },
      { category: 'Cardio', name: 'Stationary Air Bike', brand: 'Schwinn', quantity: 5, condition: 'New', availability: 'Available' },
      { category: 'Strength', name: 'Olympic Flat & Incline Benches', brand: 'Body-Solid', quantity: 5, condition: 'Good', availability: 'Available' },
      { category: 'Strength', name: 'Lat Pulldown & Seated Cable Row', brand: 'Cybex', quantity: 2, condition: 'Good', availability: 'Available' }
    ];

    // Membership Plans
    const subscriptionPlans = [
      { name: 'free trial', price: 0, duration: '1 day', features: 'Gym Setup, Member Management (Up to 10), Trainer Management (1 Trainer), Basic Equipment Access' },
      { name: 'basic', price: 1500, duration: '1 month', features: 'Cardio & Strength Zones, Locker Room, 1 Fitness Assessment, Mobile App Access' },
      { name: 'premium', price: 4000, duration: '3 months', features: 'Unlimited Zone Access, Locker, 2 Personal Trainer Sessions, Diet Plan, Steam & Sauna' },
      { name: 'basic annual', price: 12000, duration: '1 year', features: 'Unlimited Access, Locker, Diet Consultation, 4 Personal Training Sessions, Free Shaker' },
      { name: 'premium annual', price: 18000, duration: '1 year', features: 'All-inclusive VIP, Unlimited Trainer Guidance, AI Fitness & Nutrition Plans, Free Store Merch (10% off)' }
    ];

    // ==========================================
    // 3. GYM (PowerFit Gym & Fitness Hub)
    // ==========================================
    const gym = await Gym.create({
      ownerId: gymOwner._id,
      name: 'PowerFit Gym & Fitness Hub',
      description: 'Premier fitness and strength center equipped with world-class facilities, certified trainers, and personalized programs.',
      establishedYear: 2021,
      gymType: 'Unisex',
      trainingMode: 'both',
      services: ['Cardio', 'Strength Training', 'CrossFit', 'HIIT', 'Personal Training', 'Yoga', 'Zumba'],
      facilities: ['Fully AC', 'Locker Rooms', 'Showers', 'Free Parking', 'Water Dispensers', 'High-Speed WiFi', 'Cafeteria'],
      email: 'selva@gmail.com',
      phone: '9876543212',
      website: 'https://powerfitgym.com',
      rating: 4.9,
      reviewCount: 56,
      status: GymStatus.ACTIVE,
      location: {
        address: '100 Fitness Boulevard, 2nd Floor',
        area: 'Anna Nagar',
        city: 'Chennai',
        state: 'Tamil Nadu',
        country: 'India',
        pinCode: '600040',
      },
      subscription: {
        plan: 'PLATINUM',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: 'Active',
      },
      subscriptionPlans,
      equipment: equipmentList as any,
      memberCapacity: 300,
      trainerCapacity: 20,
      paymentSettings: {
        upiId: 'selva@upi',
        accountName: 'PowerFit Gym',
        bankName: 'HDFC Bank',
        accountNumber: '50100234567890',
        ifscCode: 'HDFC0001234',
        isQrPaymentEnabled: true,
      }
    });

    gymOwner.gymId = gym._id as any;
    await gymOwner.save();

    // ==========================================
    // 4. BRANCHES
    // ==========================================
    const branch1 = await Branch.create({
      gymId: gym._id,
      branchName: 'Main Branch - Anna Nagar',
      branchCode: 'PF-AN-01',
      phone: '9876543212',
      email: 'annanagar@powerfitgym.com',
      location: {
        address: '100 Fitness Boulevard, 2nd Floor',
        area: 'Anna Nagar',
        city: 'Chennai',
        state: 'Tamil Nadu',
        country: 'India',
        pinCode: '600040',
      },
      operatingHours: {
        openingTime: '05:30',
        closingTime: '22:30',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
      trainingMode: 'both',
      services: ['Strength', 'Cardio', 'HIIT', 'Personal Training'],
      facilities: ['AC', 'Locker Room', 'Showers', 'Parking'],
      status: GymStatus.ACTIVE,
      memberCapacity: 250,
      trainerCapacity: 15,
    });

    const branch2 = await Branch.create({
      gymId: gym._id,
      branchName: 'Express Branch - T. Nagar',
      branchCode: 'PF-TN-02',
      phone: '9876543218',
      email: 'tnagar@powerfitgym.com',
      location: {
        address: '45 Usman Road, 3rd Floor',
        area: 'T. Nagar',
        city: 'Chennai',
        state: 'Tamil Nadu',
        country: 'India',
        pinCode: '600017',
      },
      operatingHours: {
        openingTime: '06:00',
        closingTime: '22:00',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      },
      trainingMode: 'both',
      services: ['Strength', 'Cardio', 'Zumba'],
      facilities: ['AC', 'Lockers', 'WiFi'],
      status: GymStatus.ACTIVE,
      memberCapacity: 150,
      trainerCapacity: 8,
    });

    // ==========================================
    // 5. TRAINERS (Selvakumar + 2 more)
    // ==========================================
    const trainerSelva = await User.create({
      firstName: 'Selva',
      lastName: 'Kumar',
      email: 'selvakumar@gmail.com',
      mobile: '9876543213',
      passwordHash: pwdSelva143,
      role: Role.TRAINER,
      approvalStatus: ApprovalStatus.APPROVED,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      gymId: gym._id,
      branchId: branch1._id,
      isActive: true,
      trainerMode: 'both',
      specialization: 'Elite Personal Trainer & Strength Coach',
      experienceYears: 8,
      qualification: 'ACE Certified Personal Trainer, CSCS',
      bio: 'Dedicated fitness professional with over 8 years of experience in personal training, strength conditioning, and body recomposition.',
    });

    const trainerSelvaDoc = await Trainer.create({
      gymId: gym._id,
      branchId: branch1._id,
      userId: trainerSelva._id,
      name: 'Selvakumar',
      email: 'selvakumar@gmail.com',
      phone: '9876543213',
      specialization: 'Elite Personal Trainer & Strength Coach',
      experience: 8,
      trainingMode: 'both',
      qualifications: 'ACE Certified Personal Trainer, CSCS',
      certifications: 'CPR/AED, Precision Nutrition L1',
      expertise: 'Hypertrophy, Fat Loss, Powerlifting, HIIT',
      bio: 'Dedicated fitness professional with over 8 years of experience in personal training, strength conditioning, and body recomposition.',
      availability: 'Mon - Sat (06:00 AM - 09:00 PM)',
      availableDays: 'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday',
      availableStartTime: '06:00',
      availableEndTime: '21:00',
      availableSlot: 10,
      fee: 3000,
      paymentType: 'Per Month',
      totalEarnings: 75000,
      availableBalance: 25000,
      withdrawnAmount: 50000,
      status: 'Active',
    });

    const trainerPriya = await User.create({
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'priya.trainer@gmail.com',
      mobile: '9876543220',
      passwordHash: pwdPassword123,
      role: Role.TRAINER,
      approvalStatus: ApprovalStatus.APPROVED,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      gymId: gym._id,
      branchId: branch1._id,
      isActive: true,
      trainerMode: 'both',
      specialization: 'Yoga & Functional Mobility Specialist',
      experienceYears: 5,
      qualification: 'RYT-500 Yoga Alliance Certified',
      bio: 'Specialist in flexibility, posture correction, functional strength, and mindfulness practices.',
    });

    const trainerPriyaDoc = await Trainer.create({
      gymId: gym._id,
      branchId: branch1._id,
      userId: trainerPriya._id,
      name: 'Priya Sharma',
      email: 'priya.trainer@gmail.com',
      phone: '9876543220',
      specialization: 'Yoga & Functional Mobility Specialist',
      experience: 5,
      trainingMode: 'both',
      qualifications: 'RYT-500 Yoga Alliance',
      certifications: 'Prenatal Yoga, Mobility Coach',
      expertise: 'Vinyasa Flow, Hatha Yoga, Core Conditioning',
      bio: 'Specialist in flexibility, posture correction, functional strength, and mindfulness practices.',
      availability: 'Mon - Fri (07:00 AM - 06:00 PM)',
      availableDays: 'Monday, Tuesday, Wednesday, Thursday, Friday',
      availableStartTime: '07:00',
      availableEndTime: '18:00',
      availableSlot: 8,
      fee: 2500,
      paymentType: 'Per Month',
      totalEarnings: 45000,
      availableBalance: 15000,
      withdrawnAmount: 30000,
      status: 'Active',
    });

    // Trainer Fees & Payments setup
    const feeSelva = await TrainerFee.create({
      gymId: gym._id,
      branchId: branch1._id,
      trainerId: trainerSelvaDoc._id,
      trainingType: 'Personal Training (Strength & Conditioning)',
      feeAmount: 25000,
      billingCycle: 'Monthly',
      effectiveFrom: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      paymentMethod: 'UPI',
      upiDetails: { upiId: 'selvakumar@upi', upiName: 'Selva Kumar' },
      status: 'Active',
      notes: 'Monthly fixed retainer for personal training batches',
      createdBy: gymOwner._id,
    });

    const feePriya = await TrainerFee.create({
      gymId: gym._id,
      branchId: branch1._id,
      trainerId: trainerPriyaDoc._id,
      trainingType: 'Yoga & Group Mobility Sessions',
      feeAmount: 20000,
      billingCycle: 'Monthly',
      effectiveFrom: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      paymentMethod: 'Bank Transfer',
      bankDetails: {
        accountHolder: 'Priya Sharma',
        bankName: 'ICICI Bank',
        accountNumber: '001201567890',
        ifscCode: 'ICIC0000012'
      },
      status: 'Active',
      notes: 'Monthly fee for daily morning & evening yoga classes',
      createdBy: gymOwner._id,
    });

    // Record past payments to trainers
    await TrainerPayment.create({
      gymId: gym._id,
      branchId: branch1._id,
      trainerId: trainerSelvaDoc._id,
      trainerFeeId: feeSelva._id,
      amount: 25000,
      paymentMethod: 'UPI',
      transactionId: 'TXN-TR-SELVA-01',
      paymentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      paymentStatus: 'Paid',
      notes: 'August 2026 Trainer Payout',
      paidBy: gymOwner._id,
    });

    await TrainerPayment.create({
      gymId: gym._id,
      branchId: branch1._id,
      trainerId: trainerPriyaDoc._id,
      trainerFeeId: feePriya._id,
      amount: 20000,
      paymentMethod: 'Bank Transfer',
      transactionId: 'TXN-TR-PRIYA-01',
      paymentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      paymentStatus: 'Paid',
      notes: 'August 2026 Trainer Payout',
      paidBy: gymOwner._id,
    });

    // ==========================================
    // 6. MEMBERS (Naveenkumar + 4 active members)
    // ==========================================
    const membersData = [
      { firstName: 'Naveen', lastName: 'Kumar', email: 'naveenkumar@gmail.com', pass: pwdNaveen143, plan: 'basic annual', price: 12000, mobile: '9876543214' },
      { firstName: 'Ananya', lastName: 'Iyer', email: 'ananya@gmail.com', pass: pwdPassword123, plan: 'premium', price: 4000, mobile: '9876543221' },
      { firstName: 'Karthik', lastName: 'Raja', email: 'karthik@gmail.com', pass: pwdPassword123, plan: 'premium annual', price: 18000, mobile: '9876543222' },
      { firstName: 'Sneha', lastName: 'Patel', email: 'sneha@gmail.com', pass: pwdPassword123, plan: 'basic', price: 1500, mobile: '9876543223' },
      { firstName: 'Rahul', lastName: 'Verma', email: 'rahul@gmail.com', pass: pwdPassword123, plan: 'premium', price: 4000, mobile: '9876543224' }
    ];

    const insertedMembers: any[] = [];
    for (const m of membersData) {
      const u = await User.create({
        firstName: m.firstName,
        lastName: m.lastName,
        email: m.email,
        mobile: m.mobile,
        passwordHash: m.pass,
        role: Role.MEMBER,
        approvalStatus: ApprovalStatus.APPROVED,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        subscriptionPlan: m.plan,
        subscriptionExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        paymentStatus: 'Approved',
        gymId: gym._id,
        branchId: branch1._id,
        isActive: true,
        gender: 'Male',
        city: 'Chennai',
        pinCode: '600040',
      });
      insertedMembers.push(u);

      await CustomerMembership.create({
        userId: u._id,
        gymId: gym._id,
        branchId: branch1._id,
        planName: m.plan,
        duration: m.plan.includes('annual') || m.plan.includes('year') ? '12 Months' : '3 Months',
        price: m.price,
        discount: 500,
        finalAmount: m.price - 500,
        status: CustomerMembershipStatus.ACTIVE,
        paymentMethod: 'UPI',
        paymentReference: `UPI-MEM-${m.firstName.toUpperCase()}-01`,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
      });

      await Payment.create({
        customerId: u._id,
        gymId: gym._id,
        branchId: branch1._id,
        planName: m.plan,
        amount: m.price - 500,
        paymentMethod: 'UPI',
        transactionId: `TXN-MEM-${m.firstName.toUpperCase()}-001`,
        status: PaymentStatus.APPROVED,
        paymentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        approvedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        notes: `Subscription payment for ${m.plan}`,
      });
    }

    // ==========================================
    // 7. GYM STORE (Categories, Products, Inventory, Sales, Orders)
    // ==========================================
    const catSupplements = await StoreProductCategory.create({
      gymId: gym._id,
      branchId: branch1._id,
      productType: 'Supplements',
      name: 'Supplements & Protein',
      description: 'Whey protein powders, pre-workouts, creatine, and vitamins',
      status: 'Active',
    });

    const catApparel = await StoreProductCategory.create({
      gymId: gym._id,
      branchId: branch1._id,
      productType: 'Gym Clothing',
      name: 'Apparel & Gymwear',
      description: 'Gym stringers, athletic t-shirts, shorts, and hoodies',
      status: 'Active',
    });

    const catEquipment = await StoreProductCategory.create({
      gymId: gym._id,
      branchId: branch1._id,
      productType: 'Gym Accessories',
      name: 'Gear & Accessories',
      description: 'Lifting straps, resistance bands, foam rollers, and shaker bottles',
      status: 'Active',
    });

    const catSnacks = await StoreProductCategory.create({
      gymId: gym._id,
      branchId: branch1._id,
      productType: 'Nutrition & Healthy Snacks',
      name: 'Snacks & Energy Drinks',
      description: 'High-protein bars, electrolytes, energy drinks, and healthy snacks',
      status: 'Active',
    });

    const productsData = [
      {
        gymId: gym._id,
        branchId: branch1._id,
        categoryId: catSupplements._id,
        categoryName: 'Supplements & Protein',
        productType: 'Supplements',
        name: 'Whey Protein Isolate 1kg',
        description: '100% Whey Protein Isolate, 27g protein per scoop, ultra-pure with digestive enzymes.',
        brand: 'Optimum Nutrition',
        sku: 'WPI-1KG-CHOC',
        image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&auto=format&fit=crop',
        sellingPrice: 3499,
        discountPrice: 2999,
        stock: 50,
        status: 'Active',
        availability: 'Both',
        fulfilmentType: 'Both',
        lowStockThreshold: 10,
      },
      {
        gymId: gym._id,
        branchId: branch1._id,
        categoryId: catSupplements._id,
        categoryName: 'Supplements & Protein',
        productType: 'Supplements',
        name: 'Explosive Pre-Workout 300g',
        description: 'High-potency pre-workout formula with Beta-Alanine, Citrulline Malate, and Caffeine.',
        brand: 'Cellucor',
        sku: 'PRE-WKT-FRUIT',
        image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=800&auto=format&fit=crop',
        sellingPrice: 1899,
        discountPrice: 1599,
        stock: 35,
        status: 'Active',
        availability: 'Both',
        fulfilmentType: 'Both',
        lowStockThreshold: 8,
      },
      {
        gymId: gym._id,
        branchId: branch1._id,
        categoryId: catApparel._id,
        categoryName: 'Apparel & Gymwear',
        productType: 'Gym Clothing',
        name: 'PowerFit Seamless Gym Stringer',
        description: 'Breathable, sweat-wicking lightweight cotton-elastane stringer for intense workouts.',
        brand: 'PowerFit Apparel',
        sku: 'STR-BLK-M',
        image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop',
        sellingPrice: 799,
        discountPrice: 599,
        stock: 60,
        status: 'Active',
        availability: 'Both',
        fulfilmentType: 'Gym Pickup',
        lowStockThreshold: 12,
      },
      {
        gymId: gym._id,
        branchId: branch1._id,
        categoryId: catEquipment._id,
        categoryName: 'Gear & Accessories',
        productType: 'Gym Accessories',
        name: 'Loop Resistance Bands Set (5 Levels)',
        description: 'Complete set of 5 natural latex loop resistance bands with carrying pouch and exercise guide.',
        brand: 'FitPro',
        sku: 'RES-BAND-5PK',
        image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&auto=format&fit=crop',
        sellingPrice: 999,
        discountPrice: 749,
        stock: 25,
        status: 'Active',
        availability: 'Both',
        fulfilmentType: 'Both',
        lowStockThreshold: 5,
      },
      {
        gymId: gym._id,
        branchId: branch1._id,
        categoryId: catSnacks._id,
        categoryName: 'Snacks & Energy Drinks',
        productType: 'Nutrition & Healthy Snacks',
        name: 'Choco Crunch Protein Bar (Pack of 6)',
        description: 'Delicious chocolate coated nutrition bar with 20g protein and only 2g sugar per serving.',
        brand: 'RiteBite',
        sku: 'PBAR-CHOC-6PK',
        image: 'https://images.unsplash.com/photo-1622484214149-a29267139151?w=800&auto=format&fit=crop',
        sellingPrice: 650,
        discountPrice: 549,
        stock: 80,
        status: 'Active',
        availability: 'Offline',
        fulfilmentType: 'Gym Pickup',
        lowStockThreshold: 15,
      },
      {
        gymId: gym._id,
        branchId: branch1._id,
        categoryId: catEquipment._id,
        categoryName: 'Gear & Accessories',
        productType: 'Gym Accessories',
        name: 'Stainless Steel Shaker Bottle 750ml',
        description: 'Double-walled insulated stainless steel shaker, keeps protein shakes ice cold for 24 hours.',
        brand: 'BlenderBottle',
        sku: 'SHKR-STEEL-750',
        image: 'https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?w=800&auto=format&fit=crop',
        sellingPrice: 1299,
        discountPrice: 999,
        stock: 30,
        status: 'Active',
        availability: 'Both',
        fulfilmentType: 'Both',
        lowStockThreshold: 5,
      }
    ];

    const insertedProducts: any[] = [];
    for (const p of productsData) {
      const prod = await StoreProduct.create(p);
      insertedProducts.push(prod);

      // Create initial stock in transaction
      await StoreInventoryTransaction.create({
        gymId: gym._id,
        branchId: branch1._id,
        productId: prod._id,
        type: StoreInventoryTransactionType.STOCK_IN,
        quantityChange: prod.stock,
        stockAfter: prod.stock,
        sourceType: 'manual',
        note: 'Initial batch store stock',
      });
    }

    // 12 Offline Sales (for the "Offline Sales" and "Sales History" tabs)
    const paymentMethods = ['Cash', 'UPI', 'Google Pay', 'PhonePe', 'Card'];

    for (let i = 0; i < 12; i++) {
      const p1 = insertedProducts[i % insertedProducts.length];
      const p2 = insertedProducts[(i + 2) % insertedProducts.length];
      const qty1 = (i % 2) + 1;
      const qty2 = 1;
      const u1 = p1.discountPrice || p1.sellingPrice;
      const u2 = p2.discountPrice || p2.sellingPrice;
      const subtotal = (u1 * qty1) + (u2 * qty2);
      const discount = i % 3 === 0 ? 100 : 0;
      const total = subtotal - discount;

      await StoreOfflineSale.create({
        saleNumber: `SALE-PF-${1000 + i}`,
        gymId: gym._id,
        branchId: branch1._id,
        customerId: insertedMembers[i % insertedMembers.length]._id,
        items: [
          {
            productId: p1._id,
            name: p1.name,
            sku: p1.sku,
            quantity: qty1,
            sellingPrice: p1.sellingPrice,
            discountPrice: p1.discountPrice,
            unitPrice: u1,
            total: u1 * qty1,
          },
          {
            productId: p2._id,
            name: p2.name,
            sku: p2.sku,
            quantity: qty2,
            sellingPrice: p2.sellingPrice,
            discountPrice: p2.discountPrice,
            unitPrice: u2,
            total: u2 * qty2,
          }
        ],
        subtotal,
        discount,
        total,
        paymentMethod: paymentMethods[i % paymentMethods.length],
        paymentDate: new Date(Date.now() - (i * 2) * 24 * 60 * 60 * 1000),
        createdBy: gymOwner._id,
        note: `POS Counter Sale #${i + 1} at Anna Nagar Branch`,
      });
    }

    // 8 Online Orders
    const orderStatuses = [
      StoreOrderStatus.COMPLETED,
      StoreOrderStatus.READY_FOR_PICKUP,
      StoreOrderStatus.PREPARING,
      StoreOrderStatus.CONFIRMED,
      StoreOrderStatus.COMPLETED,
      StoreOrderStatus.COMPLETED,
      StoreOrderStatus.PENDING,
      StoreOrderStatus.COMPLETED
    ];

    for (let i = 0; i < 8; i++) {
      const p = insertedProducts[i % insertedProducts.length];
      const uPrice = p.discountPrice || p.sellingPrice;
      const qty = (i % 2) + 1;
      const subtotal = uPrice * qty;

      await StoreOrder.create({
        orderNumber: `ORD-PF-${2000 + i}`,
        gymId: gym._id,
        branchId: branch1._id,
        customerId: insertedMembers[i % insertedMembers.length]._id,
        items: [
          {
            productId: p._id,
            name: p.name,
            sku: p.sku,
            image: p.image,
            quantity: qty,
            sellingPrice: p.sellingPrice,
            discountPrice: p.discountPrice,
            unitPrice: uPrice,
            total: subtotal,
          }
        ],
        subtotal,
        discount: 0,
        total: subtotal,
        paymentStatus: StoreOrderPaymentStatus.PAID,
        paymentMethod: 'UPI',
        transactionId: `TXN-ORD-UPI-${3000 + i}`,
        fulfilmentType: 'Gym Pickup',
        status: orderStatuses[i],
        createdAt: new Date(Date.now() - (i * 3) * 24 * 60 * 60 * 1000),
      });
    }

    // ==========================================
    // 8. CUSTOMER ENQUIRIES
    // ==========================================
    const enquiries = [
      { id: 'ENQ-001', name: 'Manoj Kumar', phone: '9840123456', email: 'manoj.k@gmail.com', type: 'Personal Training Enquiry', msg: 'Interested in 1-on-1 personal training for fat loss and muscle gain.', status: EnquiryStatus.NEW },
      { id: 'ENQ-002', name: 'Divya Ramesh', phone: '9840234567', email: 'divya.r@gmail.com', type: 'Annual Membership Enquiry', msg: 'Want details on the premium annual plan and group workout sessions.', status: EnquiryStatus.CONTACTED },
      { id: 'ENQ-003', name: 'Suresh Menon', phone: '9840345678', email: 'suresh.m@gmail.com', type: 'Yoga & Mobility Program', msg: 'Looking for morning yoga slots and posture correction assistance.', status: EnquiryStatus.FOLLOW_UP },
      { id: 'ENQ-004', name: 'Harish V', phone: '9840456789', email: 'harish.v@gmail.com', type: 'Free Trial Request', msg: 'Would like to schedule a 1-day free trial on Saturday morning.', status: EnquiryStatus.CONVERTED },
      { id: 'ENQ-005', name: 'Lakshmi Narayanan', phone: '9840567890', email: 'lakshmi.n@gmail.com', type: 'CrossFit & Strength', msg: 'Enquiring about CrossFit schedule and availability of certified trainers.', status: EnquiryStatus.NEW }
    ];

    for (const e of enquiries) {
      await Enquiry.create({
        enquiryId: e.id,
        customerName: e.name,
        mobileNumber: e.phone,
        email: e.email,
        address: 'Chennai',
        city: 'Chennai',
        gymId: gym._id,
        branchId: branch1._id,
        gymOwnerId: gymOwner._id,
        enquiryType: e.type,
        message: e.msg,
        preferredContactMethod: 'WhatsApp',
        status: e.status,
        ownerNotes: 'Scheduled demo session',
      });
    }

    // ==========================================
    // 9. TRAINER SESSIONS & BOOKINGS
    // ==========================================
    await TrainerSession.create({
      bookingId: 'BK-1001',
      customerId: insertedMembers[0]._id, // Naveen
      trainerId: trainerSelvaDoc._id,
      gymId: gym._id,
      branchId: branch1._id,
      mode: TrainerSessionMode.OFFLINE,
      date: new Date().toISOString().split('T')[0],
      startTime: '07:00',
      endTime: '08:00',
      duration: 60,
      fee: 500,
      status: TrainerSessionStatus.CONFIRMED,
      paymentStatus: 'Paid',
    });

    await TrainerSession.create({
      bookingId: 'BK-1002',
      customerId: insertedMembers[1]._id, // Ananya
      trainerId: trainerPriyaDoc._id,
      gymId: gym._id,
      branchId: branch1._id,
      mode: TrainerSessionMode.ONLINE,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startTime: '08:30',
      endTime: '09:30',
      duration: 60,
      fee: 400,
      status: TrainerSessionStatus.CONFIRMED,
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      paymentStatus: 'Paid',
    });

    // ==========================================
    // 10. NOTIFICATIONS FOR GYM OWNER
    // ==========================================
    await Notification.create({
      recipientId: gymOwner._id,
      recipientRole: 'GYM_OWNER',
      gymId: gym._id,
      title: 'New Member Registration',
      message: 'Naveen Kumar enrolled in Gold Annual Membership.',
      type: 'success',
      isRead: false,
    });

    await Notification.create({
      recipientId: gymOwner._id,
      recipientRole: 'GYM_OWNER',
      gymId: gym._id,
      title: 'Store Offline Sale Completed',
      message: 'Offline Sale #SALE-PF-1000 of ₹3,748 recorded by cashier.',
      type: 'info',
      isRead: false,
    });

    await Notification.create({
      recipientId: gymOwner._id,
      recipientRole: 'GYM_OWNER',
      gymId: gym._id,
      title: 'New Lead / Enquiry Received',
      message: 'Manoj Kumar submitted an enquiry for 1-on-1 Personal Training.',
      type: 'alert',
      isRead: false,
    });

    // ==========================================
    // 11. AI FITNESS RECOMMENDATION PLAN
    // ==========================================
    await AIRecommendation.create({
      customerId: insertedMembers[0]._id, // Naveen Kumar
      gymId: gym._id,
      branchId: branch1._id,
      trainerId: trainerSelvaDoc._id,
      status: 'Trainer Approved',
      version: 1,
      fitnessProfile: {
        age: 26,
        goal: 'Muscle Hypertrophy & Athletic Endurance',
        fitnessLevel: 'Intermediate',
        preferredTraining: 'Hybrid',
      },
      aiAnalysis: {
        profileSummary: 'Young adult male with solid base strength aiming for athletic aesthetics and progressive overload.',
        assessment: 'Optimal target: 4-day upper/lower split combined with 1 day HIIT conditioning and high-protein nutrition.',
      },
      workoutRecommendation: {
        weeklySchedule: [
          { day: 'Monday', workout: 'Upper Body Heavy (Chest, Back, Shoulders)', duration: '60 mins' },
          { day: 'Tuesday', workout: 'Lower Body Strength (Squats, Hamstrings, Calves)', duration: '60 mins' },
          { day: 'Wednesday', workout: 'Active Recovery & Core Stability', duration: '30 mins' },
          { day: 'Thursday', workout: 'Upper Body Hypertrophy & Arms', duration: '60 mins' },
          { day: 'Friday', workout: 'Lower Body Hypertrophy & HIIT', duration: '50 mins' },
          { day: 'Saturday', workout: 'Outdoor Cardio / Swimming', duration: '45 mins' },
          { day: 'Sunday', workout: 'Full Rest & Muscle Recovery', duration: 'Rest' }
        ],
        exercises: [
          { name: 'Barbell Bench Press', sets: 4, reps: '8-10', duration: '10 min', rest: '90s', difficulty: 'Moderate', targetMuscleGroup: 'Chest' },
          { name: 'Barbell Back Squat', sets: 4, reps: '6-8', duration: '12 min', rest: '120s', difficulty: 'Hard', targetMuscleGroup: 'Quads & Glutes' },
          { name: 'Overhead Shoulder Press', sets: 3, reps: '10-12', duration: '8 min', rest: '60s', difficulty: 'Moderate', targetMuscleGroup: 'Shoulders' },
          { name: 'Pull-Ups / Lat Pulldown', sets: 4, reps: '10-12', duration: '8 min', rest: '60s', difficulty: 'Moderate', targetMuscleGroup: 'Back' }
        ]
      },
      dietRecommendation: {
        morning: 'Warm water with lemon + 5 soaked almonds',
        breakfast: '4 egg whites + 2 whole eggs omelette with oats and banana shake',
        lunch: 'Grilled chicken breast / paneer, brown rice, mixed green salad, curd',
        evening: '1 scoop Whey Protein Isolate + handful of roasted peanuts / apple',
        dinner: 'Fish or sautéed tofu with steamed broccoli, quinoa, and vegetable soup',
        note: 'Daily water intake target: 3.5 liters. Minimum 7 hours sleep required.',
      },
      routine: {
        morning: '06:30 AM - Morning Mobility & Hydration',
        workoutTime: '07:30 AM - Gym Training Session',
        evening: '06:00 PM - Evening Walk / Protein Shake',
        night: '10:30 PM - Sleep & Recovery',
      }
    });

    console.log('================================================================');
    console.log('✅ COMPLETE DATA SEEDED SUCCESSFULLY FOR SELVA (POWERFIT GYM)!');
    console.log('================================================================');
    console.log('• Equipment: 10 items (Cardio & Strength)');
    console.log('• Membership Plans: 5 plans (Free Trial, Basic, Premium, Annual)');
    console.log('• Branches: 2 branches (Anna Nagar Main, T. Nagar Express)');
    console.log('• Trainers: 2 trainers (Selvakumar, Priya Sharma) with fees & payments');
    console.log('• Members: 5 active members with memberships & payments (Naveen, Ananya, Karthik, Sneha, Rahul)');
    console.log('• Gym Store: 4 Categories, 6 Products, Stock & Inventory');
    console.log('• Offline Sales: 12 itemized counter sales');
    console.log('• Online Orders: 8 orders');
    console.log('• Enquiries: 5 customer leads');
    console.log('• Sessions & Bookings: In-person and online bookings');
    console.log('• Notifications: 3 admin alerts');
    console.log('• AI Fitness Plan: 1 full approved recommendation plan for Naveen');
    console.log('================================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error during full seeding:', error);
    process.exit(1);
  }
};

seedDB();
