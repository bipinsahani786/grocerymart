# 🗂️ QuickKart — Complete Catalog Management Flow
> Super Admin Master Catalog → Store Import → Purchase → Sell → Customer App
> Blinkit-scale multi-category catalog (Grocery, Fruits/Veg, Fashion, Utensils — sab kuch)

---

## 📋 Poora Picture — 6 Stages

```
STAGE 1: Super Admin Master Catalog Banata Hai (ek baar, sabke liye)
        ↓
STAGE 2: Store Owner Catalog Se Select/Import Karta Hai (apne store ke liye)
        ↓
STAGE 3: Supplier Se Purchase Order + GRN (stock aata hai)
        ↓
STAGE 4: Store Pricing + Stock Set Karta Hai
        ↓
STAGE 5: POS / Online Selling
        ↓
STAGE 6: Customer App Pe Display
```

---

## STAGE 1: Super Admin — Master Catalog Banana

### Concept Samjho

Super Admin **poori duniya ke products ka ek master library** banata hai — jaisे Amazon ka catalog hota hai. Individual store isse **copy/select** karte hain, khud se type nahi karte.

```
MASTER CATALOG (Super Admin banata hai — ek baar)
│
├── Grocery & Food
│   ├── Instant Food → Maggi 70g, Maggi 140g, Yippee 65g...
│   ├── Dairy → Amul Milk 500ml, Amul Butter 100g...
│   └── Snacks → Lays Classic 52g, Kurkure 55g...
│
├── Fruits & Vegetables
│   ├── Fruits → Apple (loose, per kg), Banana (per dozen)...
│   └── Vegetables → Potato (per kg), Onion (per kg)...
│
├── Fashion
│   ├── T-Shirts → Brand X Round Neck (S/M/L/XL, multi-color)
│   └── Footwear → Brand Y Sports Shoes (Size 6-10)
│
├── Home & Kitchen
│   └── Utensils → Steel Kadhai 2L, Pressure Cooker 5L...
│
└── ... (jitni categories chahiye, sab)
```

### Kyun Ye Approach Sahi Hai

| Agar har store khud type kare | Agar Master Catalog se select kare |
|---|---|
| Har dukan alag naam likhega ("Maggi" vs "maggi noodles" vs "Nestle Maggi") | Ek hi standard naam — consistency |
| Barcode galat type hone ka risk | Barcode already verified, bas select karo |
| Image, description sab khud banana | Image/description already ready |
| Naye store ko onboard karna slow | Naya store — catalog se tick-tick karke turant products chun le |
| Duplicate/messy data | Clean, structured data |

### Super Admin Panel — Master Catalog Add Karne Ka Process

#### Method 1: Manual Entry (Naye/Rare Products Ke Liye)

```
Super Admin Panel → Master Catalog → Add Product

Form:
  ✦ Product Name*           "Maggi 2-Minute Noodles"
  ✦ Brand                   "Nestle"
  ✦ Category → Sub-category  Grocery → Instant Food → Noodles
  ✦ Product Type*            ○ Simple   ● Has Variants   ○ Loose/Weighted
  ✦ Description
  ✦ Images (multiple)
  ✦ Default Tax Category     GST 5%
  ✦ HSN Code                 1902

  → Agar "Has Variants" select kiya:
    Variant table khulta hai (Feature jo pehle discuss kiya tha)
    70g / 140g / 420g — har ek ka barcode, MRP

  → Agar "Loose/Weighted" select kiya (fruits/sabzi ke liye):
    Unit: kg / gm / dozen / piece
    No fixed barcode (store apna internal barcode generate karega)
```

#### Method 2: Bulk Import (Fast — Real Scale Ke Liye)

Blinkit jitna scale chahiye to manually ek-ek product add karna practical nahi — **bulk CSV/Excel import** karna padega:

```
Super Admin Panel → Master Catalog → Bulk Import

Step 1: Template download karo (Excel format)
Step 2: Excel fill karo:

| name | brand | category | subcategory | variant_name | barcode | mrp | unit | hsn_code | tax |
|------|-------|----------|-------------|--------------|---------|-----|------|----------|-----|
| Maggi Noodles | Nestle | Grocery | Instant Food | 70g | 8901058851985 | 14 | pcs | 1902 | 5% |
| Maggi Noodles | Nestle | Grocery | Instant Food | 140g | 8901058851992 | 28 | pcs | 1902 | 5% |
| Apple | - | Fruits | Fresh Fruits | - | - | 180 | kg | 0810 | 0% |
| Round Neck Tshirt | BrandX | Fashion | T-Shirts | Red-M | 8901234567890 | 499 | pcs | 6109 | 12% |
| Round Neck Tshirt | BrandX | Fashion | T-Shirts | Red-L | 8901234567891 | 499 | pcs | 6109 | 12% |
| Steel Kadhai | HomeCraft | Utensils | Cookware | 2L | 8901112223334 | 850 | pcs | 7323 | 18% |

Step 3: Upload karo → System validate karta hai
Step 4: Preview dikhta hai — "1,247 products add honge, 3 me error hai (barcode duplicate)"
Step 5: Confirm → Bulk insert ho jata hai (transaction me, 1000+ products/minute)
```

#### Method 3: Barcode Database Se Auto-Fetch (Fastest for FMCG)

```
Super Admin ek barcode scan/type karta hai jo system me nahi hai
        ↓
Backend automatically external barcode API se check karta hai
(Open Food Facts, UPCitemdb — pehle discuss kiya tha)
        ↓
Naam, brand, image auto-fill ho jata hai
        ↓
Admin sirf category + tax + verify karke Save karta hai
```

### Category Structure — Kaise Organize Karo (Blinkit-Scale)

```
Level 1 (Main Category)
  └── Level 2 (Sub-category)
        └── Level 3 (Type, optional)

Example poora tree:

Grocery & Staples
  ├── Atta, Rice, Dal
  ├── Masala & Spices
  ├── Edible Oil
  └── Instant Food

Fruits & Vegetables
  ├── Fresh Fruits
  ├── Fresh Vegetables
  └── Exotic/Imported

Dairy & Bakery
  ├── Milk & Curd
  ├── Bread & Bakery
  └── Cheese & Butter

Fashion & Apparel
  ├── Men's Clothing
  │     ├── T-Shirts
  │     ├── Shirts
  │     └── Jeans
  ├── Women's Clothing
  └── Footwear
        ├── Sports Shoes
        ├── Sandals
        └── Formal Shoes

Home & Kitchen
  ├── Cookware & Utensils
  ├── Storage & Containers
  └── Cleaning Supplies

Electronics & Accessories
  ├── Mobile Accessories
  └── Small Appliances

Personal Care
  ├── Skincare
  ├── Haircare
  └── Oral Care

... (jitni chahiye utni categories, tree unlimited deep ja sakta hai)
```

```prisma
// Already schema me hai — self-referencing hierarchy
model Category {
  id        String     @id @default(uuid())
  name      String
  parentId  String?
  parent    Category?  @relation("SubCat", fields: [parentId], references: [id])
  children  Category[] @relation("SubCat")
  imageUrl  String?
  sortOrder Int        @default(0)
  products  Product[]
}
```

### Loose Items (Fruits, Sabzi, Khule Products) — Special Handling

Ye products barcode ke saath nahi aate, isliye alag treatment chahiye:

```prisma
model Product {
  // ... existing fields
  productType String @default("simple") // "simple", "variant", "loose"
  unit        String @default("pcs")    // "kg", "gm", "dozen", "piece"
  isWeighted  Boolean @default(false)   // true = weighing scale se qty aayegi
}
```

```
Master Catalog me:
  "Apple" → category: Fruits, unit: kg, price: ₹180/kg, isWeighted: true
  "Banana" → category: Fruits, unit: dozen, price: ₹60/dozen

Store ke POS pe:
  Staff "Apple" search karta hai
  → Weight enter karo screen khulta hai: "0.5 kg" ya weighing scale se auto
  → Price = 180 × 0.5 = ₹90 auto-calculate
```

**Barcode kaise milta hai loose items ka:**
```
Option A: Store apna internal barcode generate + print kare
  (label printer se "Apple ₹180/kg — Code: LOC00234" print karke rakh do rack pe)

Option B: Barcode ke bina bhi POS search/category tap se add ho
  (loose items mostly search se hi add hote hain, scan rarely)
```

---

## STAGE 2: Store Owner — Catalog Se Import/Select Karna

### Store Ka Apna Panel — "Add Products From Catalog"

Store owner **khud se product nahi banata** (zyadatar) — Super Admin ke master catalog se **apne liye select** karta hai:

```
Store Manager Panel → Inventory → "Add From Catalog"

Search/Filter interface:
  ┌────────────────────────────────────────────┐
  │  🔍 Search master catalog...                │
  │  Category: [Grocery ▾]  [Fruits ▾]  [Fashion ▾]│
  ├────────────────────────────────────────────┤
  │  ☐ Maggi Noodles 70g          MRP ₹14       │
  │  ☐ Maggi Noodles 140g         MRP ₹28       │
  │  ☐ Amul Milk 500ml            MRP ₹28       │
  │  ☐ Apple (loose, per kg)      MRP ₹180      │
  │  ☐ BrandX Tshirt Red-M        MRP ₹499      │
  ├────────────────────────────────────────────┤
  │  [Select All in Category]   [Import Selected (24)] │
  └────────────────────────────────────────────┘
```

Store owner:
1. Category browse karta hai ya search karta hai
2. Checkbox se products select karta hai (multiple ek saath)
3. "Import Selected" click karta hai
4. Har selected product ke liye ek **StoreInventory row** create hoti hai — quantity = 0 (abhi stock nahi hai), price = MRP se copy (baad me override kar sakta hai)

```typescript
// Backend — Bulk import from master catalog to store
async function importProductsToStore(storeId: string, productIds: string[]) {
  return prisma.$transaction(
    productIds.map(productId =>
      prisma.storeInventory.create({
        data: {
          storeId,
          productId,
          quantity: 0,           // stock abhi 0 — purchase se aayega
          priceOverride: null,   // null = master catalog ka price use hoga
        }
      })
    )
  );
}
```

### Store Apna Price Alag Rakh Sakta Hai (Optional)

```
Master catalog: Maggi 70g → MRP ₹14

Store A: apne aap ₹14 pe hi bechta hai (priceOverride = null)
Store B: apne area me ₹13 pe bech raha hai competition ke liye (priceOverride = 13)

Dono valid hai — StoreInventory.priceOverride field isko handle karta hai
```

### Store Apna Khud Ka Product Bhi Add Kar Sakta Hai (Local/Unique Items)

Agar koi cheez master catalog me nahi hai (local bakery item, homemade product):

```
Store Manager Panel → Inventory → "Add New Product" (not from catalog)
→ Same form jo Super Admin use karta hai, but ye product sirf usi store ko dikhega
→ (isFromMasterCatalog: false flag laga do database me differentiate karne ke liye)
```

---

## STAGE 3: Supplier Se Purchase — Stock Andar Lana

Ye Purchase Module wala flow hai (jo pehle discuss kiya tha), yahan **catalog ke context me** dekhte hain:

```
Store Manager → Purchase → Create Purchase Order

Step 1: Supplier select karo (e.g. "Sharma Distributors")
Step 2: Products select karo — YAHAN BHI STORE KE APNE CATALOG SE HI SELECT HOGA
        (jo products store ne already Stage 2 me import kiye the, unhi me se)

        Search: "Maggi"
        → Maggi 70g   | Order Qty: [50]  | Cost Price: [₹12]
        → Maggi 140g  | Order Qty: [30]  | Cost Price: [₹24]

Step 3: PO save + supplier ko bhejo (WhatsApp/Print/Email)

Step 4: Saman aane pe — "Receive Goods" (GRN)
        PO select karo → actual quantity verify karo → Confirm
        → StoreInventory.quantity AUTOMATICALLY BADH JATI HAI
        → Ab POS pe ye product available hai bechne ke liye
```

```
Flow ek nazar me:

Master Catalog          Store Inventory           Purchase
(Super Admin)      →    (Store select karta hai) → (Supplier se stock aata hai)
"Maggi 70g" exists       qty: 0 initially           qty: 0 → 50 (GRN ke baad)
                                                            ↓
                                                     Ab POS pe bik sakta hai
```

---

## STAGE 4: Store — Final Pricing + Stock Confirm

```
Purchase ke baad, Store Inventory screen pe dikhta hai:

┌─────────────────────────────────────────────────────┐
│ Product          Stock   Cost Price  Sell Price  Rack │
├─────────────────────────────────────────────────────┤
│ Maggi 70g         50      ₹12         ₹14         A2   │
│ Apple (loose)      25kg   ₹150/kg     ₹180/kg     C1   │
│ Tshirt Red-M       15      ₹300        ₹499        D3   │
└─────────────────────────────────────────────────────┘

Manager yahan se:
  - Sell price adjust kar sakta hai (competition dekh ke)
  - Rack location assign kar sakta hai (Feature 15 wala)
  - showOnPOS / showOnApp toggle kar sakta hai
```

---

## STAGE 5: Selling — POS Pe Kaise Dikhega

### Different Product Types POS Pe Alag Behave Karte Hain

```
1. SIMPLE PRODUCT (barcode scan → seedha add)
   Scan → "Amul Butter 100g" → cart me add, qty 1

2. VARIANT PRODUCT (barcode scan → sahi variant auto-select)
   Scan Maggi 140g ka barcode → "Maggi Noodles - 140g" cart me add
   (Ya search karke "Maggi" type karo → variant selector khulta hai)

3. LOOSE/WEIGHTED PRODUCT (weight enter karna padta hai)
   Search "Apple" → tap → weight input: "0.5 kg" → ₹90 auto-calculate
   (Agar weighing scale POS se connected hai to auto-fetch bhi ho sakta hai)

4. FASHION/SIZE VARIANT (size+color selector)
   Search "Tshirt" → "BrandX Round Neck" → variant grid:
   [Red-S] [Red-M] [Red-L] [Blue-S] [Blue-M]
   Tap karo sahi size → cart me add
```

### Category Tiles Bhi POS Pe Zaroori (Sabzi/Fruit Ke Liye Especially)

```
POS Home Screen:
┌─────────────────────────────────────────┐
│ [Grocery] [Fruits&Veg] [Dairy] [Fashion] │
│ [Utensils] [Personal Care] [More...]     │
└─────────────────────────────────────────┘

Fruits&Veg tap karo → sabhi loose items grid me dikhte hain (images ke saath)
→ tap karo Apple → weight enter → add
```

---

## STAGE 6: Customer Mobile App Pe Kaise Dikhega

### App Home Screen — Category Wise Browse

```
┌─────────────────────────────────────┐
│  📍 Delivering to: Lajpat Nagar      │
│  🔍 Search "milk, bread, eggs..."    │
├─────────────────────────────────────┤
│  Shop by Category                    │
│  [🥦Fruits&Veg] [🥛Dairy] [🍜Grocery] │
│  [👕Fashion]    [🍳Utensils] [More]   │
├─────────────────────────────────────┤
│  🔥 Trending Now                     │
│  [Maggi]  [Amul Milk]  [Lays]        │
├─────────────────────────────────────┤
│  Fresh Fruits & Vegetables           │
│  [Apple ₹180/kg]  [Banana ₹60/dz]    │
└─────────────────────────────────────┘
```

### Product Listing API — Store-Specific

**Important:** Customer app hamesha **ek specific store ka** catalog dikhata hai (jo unke location se nearest hai) — poora master catalog nahi, sirf jo us store ne Stage 2 me import kiya aur jiska Stage 4 me stock hai.

```typescript
// GET /catalog/products?storeId=xxx&categoryId=yyy

async function getProductsForCustomer(storeId: string, categoryId?: string) {
  return prisma.storeInventory.findMany({
    where: {
      storeId,
      quantity: { gt: 0 },              // sirf jo stock me hai
      product: {
        showOnApp: true,                // store ne app pe dikhana allow kiya
        isActive: true,
        categoryId: categoryId ?? undefined,
      }
    },
    include: {
      product: { include: { variants: true, category: true } }
    },
    orderBy: { product: { salesCount: 'desc' } }
  });
}
```

### Product Detail Page — Variant Selector

```
┌─────────────────────────────────┐
│  [Product Image]                 │
│                                   │
│  Maggi 2-Minute Noodles           │
│  Nestle                          │
│                                   │
│  Select size:                    │
│  [70g - ₹14]  [140g - ₹28]  [420g - ₹84]│
│                                   │
│  Quantity: [-] 1 [+]             │
│                                   │
│  [Add to Cart]                   │
└─────────────────────────────────┘
```

### Loose Items (Fruits/Veg) — Weight Selector on App

```
┌─────────────────────────────────┐
│  [Apple Image]                   │
│  Fresh Apple                     │
│  ₹180/kg                         │
│                                   │
│  Select quantity:                │
│  [250g] [500g] [1kg] [Custom]    │
│                                   │
│  Selected: 500g = ₹90            │
│  [Add to Cart]                   │
└─────────────────────────────────┘
```

### Fashion Items — Size/Color Grid on App

```
┌─────────────────────────────────┐
│  [Tshirt Image]                  │
│  BrandX Round Neck Tshirt        │
│  ₹499                            │
│                                   │
│  Color: [🔴Red] [🔵Blue] [⚫Black]│
│  Size:  [S] [M] [L] [XL]         │
│                                   │
│  [Add to Cart]                   │
└─────────────────────────────────┘
```

---

## Poori Chain — Ek Diagram Me

```
SUPER ADMIN
  Master Catalog banata hai
  "Maggi 70g" + barcode + category + tax
        │
        ▼
STORE OWNER
  Catalog browse karta hai → select karta hai
  "Maggi 70g" apne store ke liye import karta hai
  (StoreInventory create hoti hai, qty=0)
        │
        ▼
PURCHASE (Supplier Se)
  PO banata hai → Sharma Distributors ko order
  Saman aata hai → GRN confirm
  (StoreInventory.quantity 0 → 50)
        │
        ▼
STORE FINAL SETUP
  Sell price set (ya master price use)
  Rack location assign
  showOnPOS=true, showOnApp=true
        │
        ├──────────────┬──────────────┐
        ▼              ▼              ▼
    POS SCREEN    CUSTOMER APP   CLICK & COLLECT
    Staff scan    Customer       Customer books
    karta hai     browse karta   online, store
    → bechta hai  hai → order    pack karta hai
                  karta hai
        │              │              │
        └──────────────┴──────────────┘
                       ▼
              Stock Deduct Hota Hai
              (jahan se bhi becha, same
               StoreInventory se ghatta hai)
```

---

## Development Priority — Ye Sab Kab Banega

```
Already planned Feature 5 (Category & Master Product) me:
  ✅ Super Admin master catalog CRUD
  ✅ Category hierarchy

Already planned Feature 17 (Bulk Import) me:
  ✅ CSV bulk upload for master catalog
  ✅ Variant products

NAYA ADD KARNA HOGA — "Feature 5.5: Store Catalog Import":
  🆕 "Add From Catalog" screen (store select karta hai master se)
  🆕 Store-specific pricing override
  🆕 Loose/weighted product type handling
  🆕 Barcode-less products (internal barcode generation for loose items)

Already planned Feature 17.5 (Purchase Module):
  ✅ Purchase Order + GRN (stock aata hai)

Already planned Feature 19 (Customer App) me:
  ✅ Category browse, product listing
  🆕 Variant selector UI (size/color/weight)
  🆕 Weight-based quantity selector (loose items)
```

---

## Summary — Simple Words Me

1. **Super Admin** ek baar poora catalog banata hai (jaise Amazon/Blinkit ka product database) — sabhi categories: grocery, fruits, fashion, utensils, sab
2. **Store owner** khud type nahi karta — us catalog me se **checkbox lagake apne store ke liye select** karta hai
3. **Supplier se Purchase Order + GRN** se actual stock andar aata hai (quantity badhta hai)
4. Store apni **selling price set** karta hai, rack assign karta hai
5. **POS pe scan/search** se becha jata hai — product type ke hisaab se (simple/variant/loose) alag UI
6. **Customer app** pe wahi products dikhte hain jo us specific store ne import + stock kiya hai — variant selector, weight selector sab automatically product type se decide hota hai

---

> 📌 **Notion Import:** New Page → Import → Upload → ye `.md` file
