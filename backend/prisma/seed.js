import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting GroceryMart database seeding...\n");

  // ──────────────────────────────────────────────
  // 1. SUPER ADMIN
  // ──────────────────────────────────────────────
  console.log("👤 Seeding Super Admin...");
  const passwordHash = await bcrypt.hash("admin123", 10);

  const superadmin = await prisma.user.upsert({
    where: { email: "admin@grocerymart.com" },
    update: {},
    create: {
      email: "admin@grocerymart.com",
      phone: "1234567890",
      passwordHash,
      name: "Super Admin",
      status: "active",
      isActive: true,
      role: {
        create: {
          roleName: "super_admin",
          role: "SUPER_ADMIN",
        },
      },
    },
  });
  console.log(`   ✅ Super Admin: ${superadmin.email} / admin123`);

  // ──────────────────────────────────────────────
  // 2. TAX CLASSES (GST Slabs)
  // ──────────────────────────────────────────────
  console.log("\n🧾 Seeding GST Tax Classes...");
  const taxSlabs = [
    { name: "GST 0%", components: [] },
    { name: "GST 5%", components: [{ name: "CGST", rate: 2.5 }, { name: "SGST", rate: 2.5 }] },
    { name: "GST 12%", components: [{ name: "CGST", rate: 6.0 }, { name: "SGST", rate: 6.0 }] },
    { name: "GST 18%", components: [{ name: "CGST", rate: 9.0 }, { name: "SGST", rate: 9.0 }] },
    { name: "GST 28%", components: [{ name: "CGST", rate: 14.0 }, { name: "SGST", rate: 14.0 }] },
  ];

  const taxClassMap = {};
  for (const slab of taxSlabs) {
    const tc = await prisma.taxClass.upsert({
      where: { name: slab.name },
      update: {},
      create: {
        name: slab.name,
        description: `Standard Indian GST slab: ${slab.name}`,
        isActive: true,
        rates: slab.components.length > 0 ? {
          create: [{
            effectiveFrom: new Date("2017-07-01"), // GST launch date
            isActive: true,
            components: {
              create: slab.components,
            },
          }],
        } : undefined,
      },
    });
    taxClassMap[slab.name] = tc.id;
    console.log(`   ✅ ${slab.name}`);
  }

  // ──────────────────────────────────────────────
  // 3. MASTER CATEGORIES
  // ──────────────────────────────────────────────
  console.log("\n📂 Seeding Master Categories...");
  const masterCategoriesData = [
    { name: "Fruits & Vegetables", imageUrl: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=400" },
    { name: "Dairy & Eggs", imageUrl: "https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&q=80&w=400" },
    { name: "Bakery & Bread", imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400" },
    { name: "Beverages", imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=400" },
    { name: "Snacks & Namkeen", imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&q=80&w=400" },
    { name: "Staples & Grains", imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400" },
    { name: "Personal Care", imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400" },
    { name: "Household Cleaning", imageUrl: "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=400" },
    { name: "Frozen Foods", imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=400" },
    { name: "Meat & Seafood", imageUrl: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=400" },
    { name: "Health & Wellness", imageUrl: "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&q=80&w=400" },
    { name: "Baby Care", imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=400" },
  ];

  const masterCatMap = {};
  for (let i = 0; i < masterCategoriesData.length; i++) {
    const { name, imageUrl } = masterCategoriesData[i];
    const cat = await prisma.masterCategory.upsert({
      where: { name },
      update: { imageUrl, sortOrder: i },
      create: { name, imageUrl, sortOrder: i },
    });
    masterCatMap[name] = cat.id;
    console.log(`   ✅ ${name}`);
  }

  // ──────────────────────────────────────────────
  // 4. MASTER PRODUCTS
  // ──────────────────────────────────────────────
  console.log("\n📦 Seeding Master Catalog Products...");
  const masterProducts = [
    // Fruits & Vegetables
    { name: "Fresh Tomatoes", sku: "MP-VEG-001", barcode: "8901234567001", brand: "Farm Fresh", categoryId: masterCatMap["Fruits & Vegetables"], unit: "kg", basePrice: 40, mrp: 50, taxClass: "GST 5%", imageUrls: ["https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=500"] },
    { name: "Onions", sku: "MP-VEG-002", barcode: "8901234567002", brand: "Farm Fresh", categoryId: masterCatMap["Fruits & Vegetables"], unit: "kg", basePrice: 30, mrp: 40, taxClass: "GST 5%", imageUrls: ["https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80&w=500"] },
    { name: "Potatoes", sku: "MP-VEG-003", barcode: "8901234567003", brand: "Farm Fresh", categoryId: masterCatMap["Fruits & Vegetables"], unit: "kg", basePrice: 25, mrp: 35, taxClass: "GST 5%", imageUrls: ["https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=500"] },
    { name: "Bananas (Dozen)", sku: "MP-FRT-001", barcode: "8901234567004", brand: "Farm Fresh", categoryId: masterCatMap["Fruits & Vegetables"], unit: "dozen", basePrice: 50, mrp: 60, taxClass: "GST 5%", imageUrls: ["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=500"] },
    // Dairy
    { name: "Amul Full Cream Milk 1L", sku: "MP-DAIRY-001", barcode: "8901050000018", brand: "Amul", categoryId: masterCatMap["Dairy & Eggs"], unit: "ltr", basePrice: 62, mrp: 66, taxClass: "GST 5%", imageUrls: ["https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=500"] },
    { name: "Amul Butter 500g", sku: "MP-DAIRY-002", barcode: "8901050000025", brand: "Amul", categoryId: masterCatMap["Dairy & Eggs"], unit: "pack", basePrice: 240, mrp: 265, taxClass: "GST 12%", imageUrls: ["https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=500"] },
    { name: "Eggs (Tray 30pcs)", sku: "MP-DAIRY-003", barcode: "8901234567008", brand: "Country Fresh", categoryId: masterCatMap["Dairy & Eggs"], unit: "tray", basePrice: 175, mrp: 200, taxClass: "GST 0%", imageUrls: ["https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=500"] },
    // Beverages
    { name: "Bisleri Water 1L", sku: "MP-BEV-001", barcode: "8901234567010", brand: "Bisleri", categoryId: masterCatMap["Beverages"], unit: "pcs", basePrice: 18, mrp: 20, taxClass: "GST 18%", imageUrls: ["https://images.unsplash.com/photo-1560023907-5f339617ea30?auto=format&fit=crop&q=80&w=500"] },
    { name: "Coca Cola 600ml", sku: "MP-BEV-002", barcode: "8901234567011", brand: "Coca Cola", categoryId: masterCatMap["Beverages"], unit: "pcs", basePrice: 38, mrp: 40, taxClass: "GST 28%", imageUrls: ["https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=500"] },
    { name: "Tata Tea Gold 500g", sku: "MP-BEV-003", barcode: "8901234567012", brand: "Tata", categoryId: masterCatMap["Beverages"], unit: "pack", basePrice: 210, mrp: 240, taxClass: "GST 5%", imageUrls: ["https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=500"] },
    // Snacks
    { name: "Lay's Classic Salted 50g", sku: "MP-SNK-001", barcode: "8901234567013", brand: "Lay's", categoryId: masterCatMap["Snacks & Namkeen"], unit: "pcs", basePrice: 20, mrp: 20, taxClass: "GST 12%", imageUrls: ["https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&q=80&w=500"] },
    { name: "Bikano Khatta Meetha 400g", sku: "MP-SNK-002", barcode: "8901234567014", brand: "Bikano", categoryId: masterCatMap["Snacks & Namkeen"], unit: "pack", basePrice: 80, mrp: 90, taxClass: "GST 12%", imageUrls: ["https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&q=80&w=500"] },
    // Staples
    { name: "India Gate Basmati Rice 5kg", sku: "MP-STA-001", barcode: "8901234567015", brand: "India Gate", categoryId: masterCatMap["Staples & Grains"], unit: "pack", basePrice: 380, mrp: 420, taxClass: "GST 5%", imageUrls: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=500"] },
    { name: "Aashirvaad Atta 5kg", sku: "MP-STA-002", barcode: "8901234567016", brand: "Aashirvaad", categoryId: masterCatMap["Staples & Grains"], unit: "pack", basePrice: 230, mrp: 265, taxClass: "GST 0%", imageUrls: ["https://images.unsplash.com/photo-1607672632458-9eb56696346b?auto=format&fit=crop&q=80&w=500"] },
    { name: "Toor Dal 1kg", sku: "MP-STA-003", barcode: "8901234567017", brand: "Local Brand", categoryId: masterCatMap["Staples & Grains"], unit: "kg", basePrice: 120, mrp: 140, taxClass: "GST 5%", imageUrls: ["https://images.unsplash.com/photo-1585994192701-f1a505c8574a?auto=format&fit=crop&q=80&w=500"] },
    // Personal Care
    { name: "Dove Soap 100g", sku: "MP-PC-001", barcode: "8901234567020", brand: "Dove", categoryId: masterCatMap["Personal Care"], unit: "pcs", basePrice: 40, mrp: 45, taxClass: "GST 18%", imageUrls: ["https://images.unsplash.com/photo-1607006342411-92fc2a4d33a5?auto=format&fit=crop&q=80&w=500"] },
    { name: "Colgate Strong Teeth 200g", sku: "MP-PC-002", barcode: "8901234567021", brand: "Colgate", categoryId: masterCatMap["Personal Care"], unit: "pcs", basePrice: 85, mrp: 95, taxClass: "GST 18%", imageUrls: ["https://images.unsplash.com/photo-1559591937-e1032b4b455b?auto=format&fit=crop&q=80&w=500"] },
    // Household
    { name: "Vim Dishwash Gel 500ml", sku: "MP-HH-001", barcode: "8901234567025", brand: "Vim", categoryId: masterCatMap["Household Cleaning"], unit: "pcs", basePrice: 75, mrp: 85, taxClass: "GST 18%", imageUrls: ["https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=500"] },
    { name: "Ariel Matic 1kg", sku: "MP-HH-002", barcode: "8901234567026", brand: "Ariel", categoryId: masterCatMap["Household Cleaning"], unit: "pack", basePrice: 270, mrp: 310, taxClass: "GST 18%", imageUrls: ["https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&q=80&w=500"] },
  ];

  for (const prod of masterProducts) {
    await prisma.masterProduct.upsert({
      where: { sku: prod.sku },
      update: { imageUrls: prod.imageUrls },
      create: {
        name: prod.name,
        sku: prod.sku,
        barcode: prod.barcode,
        brand: prod.brand,
        categoryId: prod.categoryId,
        unit: prod.unit,
        basePrice: prod.basePrice,
        mrp: prod.mrp,
        imageUrls: prod.imageUrls,
        taxClassId: taxClassMap[prod.taxClass] || null,
        isActive: true,
      },
    });
    console.log(`   ✅ ${prod.name}`);
  }

  // ──────────────────────────────────────────────
  // 5. STORE
  // ──────────────────────────────────────────────
  console.log("\n🏪 Seeding Store...");
  let store = await prisma.store.findFirst();
  if (!store) {
    store = await prisma.store.create({
      data: {
        name: "GroceryMart Noida Outlet",
        address: "Sector 62, Noida, UP - 201301",
        lat: 28.6273,
        long: 77.3725,
        radiusKm: 5.0,
        phone: "9876543210",
        gstin: "09AAAAA0000A1Z5",
        openingTime: "08:00",
        closingTime: "22:00",
        posEnabled: true,
        deliveryEnabled: true,
        clickCollectEnabled: true,
        deliveryChargePerKm: 10.0,
        freeDeliveryKmRadius: 2.0,
        minDeliveryCharge: 30.0,
        isActive: true,
      },
    });
  }
  console.log(`   ✅ Store: ${store.name} (ID: ${store.id})`);

  // ──────────────────────────────────────────────
  // 6. STORE MANAGER
  // ──────────────────────────────────────────────
  console.log("\n👔 Seeding Store Manager...");
  const managerHash = await bcrypt.hash("manager123", 10);
  const existingManager = await prisma.user.findUnique({
    where: { email: "manager@grocerymart.com" },
  });

  if (!existingManager) {
    const manager = await prisma.user.create({
      data: {
        email: "manager@grocerymart.com",
        phone: "9988776655",
        passwordHash: managerHash,
        name: "Rahul Sharma",
        status: "active",
        isActive: true,
        role: {
          create: {
            roleName: "store_manager",
            role: "STORE_MANAGER",
          },
        },
        managedStore: {
          connect: { id: store.id },
        },
      },
    });
    console.log(`   ✅ Manager: ${manager.email} / manager123`);
  } else {
    console.log(`   ✅ Manager already exists: ${existingManager.email}`);
  }

  // ──────────────────────────────────────────────
  // 7. STORE CATEGORIES (imported from master)
  // ──────────────────────────────────────────────
  console.log("\n📂 Seeding Store Categories...");
  const storeCatMap = {};
  for (let i = 0; i < masterCategoriesData.length; i++) {
    const { name, imageUrl } = masterCategoriesData[i];
    const existing = await prisma.category.findFirst({
      where: { storeId: store.id, name },
    });
    if (!existing) {
      const cat = await prisma.category.create({
        data: { storeId: store.id, name, imageUrl, sortOrder: i },
      });
      storeCatMap[name] = cat.id;
    } else {
      await prisma.category.update({
        where: { id: existing.id },
        data: { imageUrl, sortOrder: i },
      });
      storeCatMap[name] = existing.id;
    }
    console.log(`   ✅ ${name}`);
  }

  // ──────────────────────────────────────────────
  // 8. STORE PRODUCTS + INVENTORY
  // ──────────────────────────────────────────────
  console.log("\n📦 Seeding Store Products & Inventory...");

  const storeProducts = [
    { name: "Fresh Tomatoes", barcode: "8901234567001", brand: "Farm Fresh", catName: "Fruits & Vegetables", unit: "kg", basePrice: 40, mrp: 50, costPrice: 30, stock: 150, taxClass: "GST 5%", imageUrls: ["https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=500"] },
    { name: "Onions", barcode: "8901234567002", brand: "Farm Fresh", catName: "Fruits & Vegetables", unit: "kg", basePrice: 30, mrp: 40, costPrice: 20, stock: 200, taxClass: "GST 5%", imageUrls: ["https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80&w=500"] },
    { name: "Potatoes", barcode: "8901234567003", brand: "Farm Fresh", catName: "Fruits & Vegetables", unit: "kg", basePrice: 25, mrp: 35, costPrice: 18, stock: 180, taxClass: "GST 5%", imageUrls: ["https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=500"] },
    { name: "Bananas (Dozen)", barcode: "8901234567004", brand: "Farm Fresh", catName: "Fruits & Vegetables", unit: "dozen", basePrice: 50, mrp: 60, costPrice: 40, stock: 50, taxClass: "GST 5%", imageUrls: ["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=500"] },
    { name: "Amul Full Cream Milk 1L", barcode: "8901050000018", brand: "Amul", catName: "Dairy & Eggs", unit: "ltr", basePrice: 62, mrp: 66, costPrice: 58, stock: 100, taxClass: "GST 5%", imageUrls: ["https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=500"] },
    { name: "Amul Butter 500g", barcode: "8901050000025", brand: "Amul", catName: "Dairy & Eggs", unit: "pack", basePrice: 240, mrp: 265, costPrice: 220, stock: 40, taxClass: "GST 12%", imageUrls: ["https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=500"] },
    { name: "Eggs (Tray 30pcs)", barcode: "8901234567008", brand: "Country Fresh", catName: "Dairy & Eggs", unit: "tray", basePrice: 175, mrp: 200, costPrice: 160, stock: 30, taxClass: "GST 0%", imageUrls: ["https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=500"] },
    { name: "Bisleri Water 1L", barcode: "8901234567010", brand: "Bisleri", catName: "Beverages", unit: "pcs", basePrice: 18, mrp: 20, costPrice: 14, stock: 300, taxClass: "GST 18%", imageUrls: ["https://images.unsplash.com/photo-1560023907-5f339617ea30?auto=format&fit=crop&q=80&w=500"] },
    { name: "Coca Cola 600ml", barcode: "8901234567011", brand: "Coca Cola", catName: "Beverages", unit: "pcs", basePrice: 38, mrp: 40, costPrice: 32, stock: 120, taxClass: "GST 28%", imageUrls: ["https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=500"] },
    { name: "Tata Tea Gold 500g", barcode: "8901234567012", brand: "Tata", catName: "Beverages", unit: "pack", basePrice: 210, mrp: 240, costPrice: 190, stock: 60, taxClass: "GST 5%", imageUrls: ["https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=500"] },
    { name: "Lay's Classic Salted 50g", barcode: "8901234567013", brand: "Lay's", catName: "Snacks & Namkeen", unit: "pcs", basePrice: 20, mrp: 20, costPrice: 16, stock: 200, taxClass: "GST 12%", imageUrls: ["https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&q=80&w=500"] },
    { name: "Bikano Khatta Meetha 400g", barcode: "8901234567014", brand: "Bikano", catName: "Snacks & Namkeen", unit: "pack", basePrice: 80, mrp: 90, costPrice: 80, stock: 90, taxClass: "GST 12%", imageUrls: ["https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&q=80&w=500"] },
    { name: "India Gate Basmati Rice 5kg", barcode: "8901234567015", brand: "India Gate", catName: "Staples & Grains", unit: "pack", basePrice: 380, mrp: 420, costPrice: 340, stock: 80, taxClass: "GST 5%", imageUrls: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=500"] },
    { name: "Aashirvaad Atta 5kg", barcode: "8901234567016", brand: "Aashirvaad", catName: "Staples & Grains", unit: "pack", basePrice: 230, mrp: 265, costPrice: 210, stock: 90, taxClass: "GST 0%", imageUrls: ["https://images.unsplash.com/photo-1607672632458-9eb56696346b?auto=format&fit=crop&q=80&w=500"] },
    { name: "Toor Dal 1kg", barcode: "8901234567017", brand: "Local Brand", catName: "Staples & Grains", unit: "kg", basePrice: 120, mrp: 140, costPrice: 100, stock: 120, taxClass: "GST 5%", imageUrls: ["https://images.unsplash.com/photo-1585994192701-f1a505c8574a?auto=format&fit=crop&q=80&w=500"] },
    { name: "Dove Soap 100g", barcode: "8901234567020", brand: "Dove", catName: "Personal Care", unit: "pcs", basePrice: 40, mrp: 45, costPrice: 32, stock: 80, taxClass: "GST 18%", imageUrls: ["https://images.unsplash.com/photo-1607006342411-92fc2a4d33a5?auto=format&fit=crop&q=80&w=500"] },
    { name: "Colgate Strong Teeth 200g", barcode: "8901234567021", brand: "Colgate", catName: "Personal Care", unit: "pcs", basePrice: 85, mrp: 95, costPrice: 70, stock: 60, taxClass: "GST 18%", imageUrls: ["https://images.unsplash.com/photo-1559591937-e1032b4b455b?auto=format&fit=crop&q=80&w=500"] },
    { name: "Vim Dishwash Gel 500ml", barcode: "8901234567025", brand: "Vim", catName: "Household Cleaning", unit: "pcs", basePrice: 75, mrp: 85, costPrice: 60, stock: 70, taxClass: "GST 18%", imageUrls: ["https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=500"] },
    { name: "Ariel Matic 1kg", barcode: "8901234567026", brand: "Ariel", catName: "Household Cleaning", unit: "pack", basePrice: 270, mrp: 310, costPrice: 240, stock: 45, taxClass: "GST 18%", imageUrls: ["https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&q=80&w=500"] },
  ];

  for (const p of storeProducts) {
    // Check if product already exists (by barcode or name+store)
    const existingProduct = await prisma.product.findFirst({
      where: { storeId: store.id, name: p.name },
    });

    let product;
    if (!existingProduct) {
      product = await prisma.product.create({
        data: {
          storeId: store.id,
          name: p.name,
          barcode: null, // Avoid unique constraint conflict if masterProduct has same barcode
          brand: p.brand,
          categoryId: storeCatMap[p.catName],
          unit: p.unit,
          basePrice: p.basePrice,
          mrp: p.mrp,
          costPrice: p.costPrice,
          taxClassId: taxClassMap[p.taxClass] || null,
          showOnApp: true,
          showOnPOS: true,
          isActive: true,
        },
      });
    } else {
      product = existingProduct;
    }

    // Upsert inventory
    const existingInv = await prisma.storeInventory.findFirst({
      where: { storeId: store.id, productId: product.id, variantId: null },
    });
    if (!existingInv) {
      await prisma.storeInventory.create({
        data: {
          storeId: store.id,
          productId: product.id,
          quantity: p.stock,
          lowStockAt: 10,
        },
      });
    }
    console.log(`   ✅ ${p.name} — Stock: ${p.stock}`);
  }

  // ──────────────────────────────────────────────
  // 9. STORE CUSTOMERS (Now in User table)
  // ──────────────────────────────────────────────
  console.log("\n👥 Seeding Store Customers...");
  const customers = [
    { name: "Amit Verma", phone: "9811234567", email: "amit@example.com", khataBalance: 500, loyaltyPoints: 120 },
    { name: "Priya Singh", phone: "9822345678", email: "priya@example.com", khataBalance: 0, loyaltyPoints: 85 },
    { name: "Ravi Kumar", phone: "9833456789", email: null, khataBalance: 1200, loyaltyPoints: 0 },
    { name: "Sunita Devi", phone: "9844567890", email: null, khataBalance: 250, loyaltyPoints: 50 },
    { name: "Vikram Shah", phone: "9855678901", email: "vikram@example.com", khataBalance: 0, loyaltyPoints: 200 },
  ];
  for (const c of customers) {
    const existing = await prisma.user.findFirst({ where: { phone: c.phone } });
    if (!existing) {
      await prisma.user.create({
        data: {
          name: c.name,
          phone: c.phone,
          email: c.email || null,
          khataBalance: c.khataBalance,
          loyaltyPoints: c.loyaltyPoints,
          status: "active",
          isActive: true,
          role: {
            create: {
              roleName: "customer",
              role: "CUSTOMER",
            },
          },
        },
      });
      console.log(`   ✅ ${c.name} (${c.phone})`);
    }
  }

  // ──────────────────────────────────────────────
  // 10. SUPPLIERS
  // ──────────────────────────────────────────────
  console.log("\n🚚 Seeding Suppliers...");
  const suppliers = [
    { name: "Reliance Fresh Wholesale", phone: "9900112233", gstin: "07AAAAA0000A1Z1", city: "Delhi" },
    { name: "BigBasket B2B", phone: "9900223344", gstin: "29BBBBB0000B1Z2", city: "Bangalore" },
    { name: "Metro Cash & Carry", phone: "9900334455", gstin: "09CCCCC0000C1Z3", city: "Noida" },
  ];
  for (const s of suppliers) {
    const existing = await prisma.supplier.findFirst({ where: { storeId: store.id, phone: s.phone } });
    if (!existing) {
      await prisma.supplier.create({ data: { storeId: store.id, ...s } });
      console.log(`   ✅ ${s.name}`);
    }
  }

  // ──────────────────────────────────────────────
  // 11. OFFERS (Coupons)
  // ──────────────────────────────────────────────
  console.log("\n🎟️  Seeding Offers & Coupons...");
  const offers = [
    { code: "WELCOME100", description: "₹100 off on first order above ₹500", discountType: "FLAT", discountValue: 100, minOrderValue: 500 },
    { code: "SAVE10", description: "10% off on all orders", discountType: "PERCENT", discountValue: 10, minOrderValue: 200, maxDiscount: 150 },
    { code: "FLAT50", description: "₹50 off on orders above ₹300", discountType: "FLAT", discountValue: 50, minOrderValue: 300 },
    { code: "WEEKEND20", description: "20% weekend special", discountType: "PERCENT", discountValue: 20, minOrderValue: 400, maxDiscount: 200 },
    { code: "FESTIVE200", description: "₹200 off on orders above ₹1000", discountType: "FLAT", discountValue: 200, minOrderValue: 1000 },
  ];
  for (const offer of offers) {
    await prisma.storeOffer.upsert({
      where: { storeId_code: { storeId: store.id, code: offer.code } },
      update: {},
      create: { storeId: store.id, ...offer, isActive: true },
    });
    console.log(`   ✅ ${offer.code}`);
  }

  // ──────────────────────────────────────────────
  // 12. SUBSCRIPTION PLANS
  // ──────────────────────────────────────────────
  console.log("\n📋 Seeding Subscription Plans...");
  const plans = [
    { name: "Basic Monthly Pass", description: "10% discount on all orders for 30 days", price: 99, durationDays: 30 },
    { name: "Premium Quarterly Pass", description: "15% discount + free delivery for 90 days", price: 249, durationDays: 90 },
    { name: "VIP Annual Pass", description: "20% discount + priority support for 365 days", price: 799, durationDays: 365 },
  ];
  for (const plan of plans) {
    const existing = await prisma.storeSubscriptionPlan.findFirst({ where: { storeId: store.id, name: plan.name } });
    if (!existing) {
      await prisma.storeSubscriptionPlan.create({ data: { storeId: store.id, ...plan, isActive: true } });
      console.log(`   ✅ ${plan.name}`);
    }
  }

  // ──────────────────────────────────────────────
  // DONE
  // ──────────────────────────────────────────────
  console.log(`
╔═══════════════════════════════════════════════════╗
║        ✅ GroceryMart Seeding Complete!            ║
╠═══════════════════════════════════════════════════╣
║  Super Admin:  admin@grocerymart.com / admin123   ║
║  Store Manager: manager@grocerymart.com / manager123 ║
║  Store:        GroceryMart Noida Outlet           ║
║  Products:     ${storeProducts.length} store products seeded           ║
║  Tax Classes:  ${taxSlabs.length} GST slabs seeded                  ║
║  Customers:    ${customers.length} seeded                         ║
║  Suppliers:    ${suppliers.length} seeded                         ║
║  Offers:       ${offers.length} seeded                         ║
║  Plans:        ${plans.length} seeded                         ║
╚═══════════════════════════════════════════════════╝
  `);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
