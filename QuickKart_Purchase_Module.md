# 📥 QuickKart — Purchase / Procurement Module
> Missing piece: Saman kharidna (Supplier → Store → Stock In)
> Ye Feature 17 (Inventory Pro) ke baad, Feature 18 se pehle fit hoga

---

## Kyun Ye Zaroori Hai

Ab tak system sirf **selling side** handle kar raha tha:
```
Stock hai → Customer ko becho → Stock ghatta hai
```

Real dukan me ek aur pura cycle chalta hai:
```
Stock kam ho raha hai → Supplier se order karo → Saman aaya →
Verify karo → Stock badhao → Payment karo supplier ko
```

Iske bina system adhoora hai — manager ko pata hi nahi chalega **kis supplier se kya mangwaya, kitna udhar hai supplier ka, purchase price kya tha** (jo margin calculate karne ke liye zaroori hai).

---

## New Feature — Feature 17.5: Purchase & Supplier Management

**Kahan fit hoga:** Feature 17 (Bulk Import) ke turant baad, Feature 18 (Store Manager Panel) se pehle — kyunki manager panel me ye screens bhi honi chahiye

### Kya-Kya Banega

#### 1. Supplier Management
```
Supplier ek entity hai jisse aap saman kharidte ho — jaise customer hai lekin reverse

Fields:
  - Name, phone, address
  - GSTIN (agar GST invoice lena hai unse)
  - Payment terms (cash / 15 din credit / 30 din credit)
  - Category (kaunse products supply karta hai)
```

#### 2. Purchase Order (PO) — Order Karna Supplier Ko
```
Manager/Admin supplier ko order bhejta hai:
  - Kaunse products, kitni quantity
  - Expected delivery date
  - Agreed price per item
  - Status: DRAFT → SENT → PARTIALLY_RECEIVED → RECEIVED → CANCELLED
```

#### 3. Goods Receipt (GRN — Goods Received Note) — Saman Aane Pe
```
Jab saman dukan pe pahunchta hai:
  - PO se match karo (kya order kiya tha vs kya aaya)
  - Quantity verify karo (kabhi kam/zyada aata hai)
  - Damage/reject items alag mark karo
  - Batch number / expiry date entry (agar applicable)
  - Confirm karte hi → STOCK AUTOMATICALLY BADH JAYE
```

#### 4. Purchase Bill / Invoice Tracking
```
Supplier ka bill record karo:
  - Bill number, amount, GST
  - Payment status: PENDING / PARTIAL / PAID
  - Due date (agar credit pe liya hai)
  - Payment history (kab kitna diya)
```

#### 5. Supplier Ledger (Khata — Reverse Direction)
```
Customer Credit/Khata jaisa hi, bas reverse:
  - Aapko supplier ko kitna dena hai (payable)
  - Payment history
  - Outstanding balance per supplier
```

---

## Database Schema Addition

```prisma
model Supplier {
  id            String   @id @default(uuid())
  name          String
  phone         String
  address       String?
  gstin         String?
  paymentTerms  String   @default("CASH") // CASH, CREDIT_15, CREDIT_30, CREDIT_45
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())

  purchaseOrders PurchaseOrder[]
  ledger         SupplierLedger[]
}

model PurchaseOrder {
  id            String   @id @default(uuid())
  poNumber      String   @unique   // PO-2024-00001
  supplierId    String
  supplier      Supplier @relation(fields: [supplierId], references: [id])
  storeId       String
  status        String   @default("DRAFT") // DRAFT, SENT, PARTIALLY_RECEIVED, RECEIVED, CANCELLED
  expectedDate  DateTime?
  createdBy     String   // staffId
  totalAmount   Float    @default(0)
  createdAt     DateTime @default(now())

  items         PurchaseOrderItem[]
  grns          GoodsReceipt[]
}

model PurchaseOrderItem {
  id              String        @id @default(uuid())
  poId            String
  po              PurchaseOrder @relation(fields: [poId], references: [id])
  productId       String
  orderedQty      Int
  receivedQty     Int           @default(0)
  agreedPrice     Float         // cost price per unit
}

model GoodsReceipt {
  id            String        @id @default(uuid())
  grnNumber     String        @unique  // GRN-2024-00001
  poId          String
  po            PurchaseOrder @relation(fields: [poId], references: [id])
  receivedBy    String        // staffId
  receivedAt    DateTime      @default(now())

  items         GoodsReceiptItem[]
  purchaseBill  PurchaseBill?
}

model GoodsReceiptItem {
  id            String       @id @default(uuid())
  grnId         String
  grn           GoodsReceipt @relation(fields: [grnId], references: [id])
  productId     String
  qtyReceived   Int
  qtyDamaged    Int          @default(0)
  batchNumber   String?
  expiryDate    DateTime?
}

model PurchaseBill {
  id            String       @id @default(uuid())
  billNumber    String       // supplier ka bill number
  grnId         String       @unique
  grn           GoodsReceipt @relation(fields: [grnId], references: [id])
  amount        Float
  gstAmount     Float        @default(0)
  paymentStatus String       @default("PENDING") // PENDING, PARTIAL, PAID
  dueDate       DateTime?
  createdAt     DateTime     @default(now())

  payments      SupplierPayment[]
}

model SupplierPayment {
  id            String       @id @default(uuid())
  billId        String
  bill          PurchaseBill @relation(fields: [billId], references: [id])
  amount        Float
  method        String       // CASH, UPI, BANK_TRANSFER, CHEQUE
  paidAt        DateTime     @default(now())
}

model SupplierLedger {
  id          String   @id @default(uuid())
  supplierId  String
  supplier    Supplier @relation(fields: [supplierId], references: [id])
  delta       Float    // positive = aapko dena hai (purchase), negative = paid
  referenceId String?  // billId or paymentId
  note        String?
  createdAt   DateTime @default(now())
}
```

---

## Process — Step by Step

### Step 1: Supplier CRUD (1 din)
```
POST   /suppliers
GET    /suppliers
PATCH  /suppliers/:id
GET    /suppliers/:id/ledger    → outstanding balance dikhao
```

### Step 2: Purchase Order (2 din)
```
POST   /purchase-orders          → PO banao, items add karo
GET    /purchase-orders?status=  → list, filter by status
PATCH  /purchase-orders/:id      → status update (SENT karo supplier ko)
```
UI: Manager PO banata hai — products select karo, quantity + price daalo, supplier select karo, "Send to Supplier" (WhatsApp/print/email — jo bhi convenient ho)

### Step 3: Goods Receipt — Stock Increase Logic (2-3 din)
```typescript
async function receiveGoods(poId: string, items: ReceiveItemDto[], staffId: string) {
  return prisma.$transaction(async (tx) => {

    const grn = await tx.goodsReceipt.create({
      data: { grnNumber: await generateGRNNumber(), poId, receivedBy: staffId }
    });

    for (const item of items) {
      // GRN item record
      await tx.goodsReceiptItem.create({
        data: { grnId: grn.id, productId: item.productId,
                qtyReceived: item.qtyReceived, qtyDamaged: item.qtyDamaged,
                batchNumber: item.batchNumber, expiryDate: item.expiryDate }
      });

      // ✅ STOCK BADHAO (opposite of sale — increment karo)
      await tx.storeInventory.upsert({
        where: { storeId_productId_variantId: { storeId, productId: item.productId, variantId: null } },
        update: { quantity: { increment: item.qtyReceived - item.qtyDamaged } },
        create: { storeId, productId: item.productId, quantity: item.qtyReceived - item.qtyDamaged }
      });

      // Stock log entry
      await tx.stockLog.create({
        data: { inventoryId: ..., delta: item.qtyReceived - item.qtyDamaged,
                reason: 'purchase', referenceId: grn.id, staffId }
      });

      // PO item me received qty update karo
      await tx.purchaseOrderItem.updateMany({
        where: { poId, productId: item.productId },
        data: { receivedQty: { increment: item.qtyReceived } }
      });
    }

    // PO status update — pura mila ya partial
    const po = await checkIfFullyReceived(poId, tx);
    await tx.purchaseOrder.update({
      where: { id: poId },
      data: { status: po.fullyReceived ? 'RECEIVED' : 'PARTIALLY_RECEIVED' }
    });

    return grn;
  });
}
```

**Ye function is document ka sabse important part hai** — yahi jagah hai jahan stock "andar aata hai" (jaisa `createPOSOrder` me stock "bahar jaata hai")

### Step 4: Purchase Bill + Payment (2 din)
```
POST   /purchase-bills           → GRN se bill link karo, amount enter karo
POST   /purchase-bills/:id/pay   → payment record (full ya partial)
GET    /suppliers/:id/pending-bills → kitna dena baaki hai
```

### Step 5: Cost Price Auto-Update (1 din)
```
Jab GRN confirm hota hai, product ka costPrice bhi update ho sakta hai
(agar price change hui hai) — isse margin reports accurate rehte hain
```

### Step 6: Store Manager Panel — Purchase Screens (2-3 din)
```
- Supplier list + add
- "Create Purchase Order" screen (product search + qty + price)
- "Pending POs" — jo order kiye but abhi aaye nahi
- "Receive Goods" screen — PO select karo, actual quantity verify karo, confirm
- "Supplier Payments" — outstanding dikhao, payment record karo
```

**Total time for this module: ~10-12 din**

---

## Updated Feature Sequence (Purchase Module Insert Karke)

```
GROUP 1: Foundation                    (Features 1-5)
GROUP 2: Core Selling (POS)            (Features 6-10)
GROUP 3: Billing Complete              (Features 11-14)
GROUP 4: Inventory Pro                 (Features 15-17)
  ↓
  🆕 Feature 17.5: Purchase & Supplier Management   ← NAYA
     - Supplier CRUD
     - Purchase Orders
     - Goods Receipt (stock increase)
     - Purchase bills + payments
     - Supplier ledger/khata
  ↓
GROUP 5: Online Channels                (Features 18-21)
GROUP 6: Growth                         (Features 22-24)
```

**Naya total timeline:** ~91-108 din (~13-16 → 14-18 weeks, ~10-12 din extra)

---

## Bonus — Reorder Suggestion (Optional, Growth Group Me Add Karo)

Ek chhota lekin bahut useful feature — jab low stock ho, system khud suggest kare "itna order karo":

```typescript
// Sales velocity dekh ke suggest karo
async function getReorderSuggestions(storeId: string) {
  return prisma.$queryRaw`
    SELECT p.id, p.name, si.quantity as current_stock,
      COALESCE(AVG(daily_sales.qty), 0) as avg_daily_sales,
      GREATEST(0, (COALESCE(AVG(daily_sales.qty), 0) * 7) - si.quantity) as suggested_reorder_qty
    FROM store_inventory si
    JOIN products p ON p.id = si.product_id
    LEFT JOIN (
      SELECT product_id, DATE(created_at) as day, SUM(qty) as qty
      FROM order_items oi JOIN orders o ON o.id = oi.order_id
      WHERE o.store_id = ${storeId} AND o.created_at > NOW() - INTERVAL '30 days'
      GROUP BY product_id, DATE(created_at)
    ) daily_sales ON daily_sales.product_id = p.id
    WHERE si.store_id = ${storeId} AND si.quantity <= si.low_stock_at
    GROUP BY p.id, p.name, si.quantity
  `;
}
```

Ye "agle 7 din ka average sale dekh ke kitna order karna chahiye" suggest karta hai — Feature 22 (Analytics) ke saath add kar sakte ho.

---

## Summary — Kya-Kya Cover Ho Gaya Ab

| Direction | Feature | Status |
|---|---|---|
| Saman **bikta** hai | POS, Delivery, Click & Collect | ✅ Already planned |
| Saman **aata** hai | Purchase Order, Goods Receipt | 🆕 Ye document |
| Customer se paisa | Payment collection (UPI/Cash/Card) | ✅ Already planned |
| Supplier ko paisa | Supplier payment tracking | 🆕 Ye document |
| Customer ka udhar | Credit/Khata (customer) | ✅ Already planned |
| Supplier ka udhar | Supplier Ledger (payable) | 🆕 Ye document |

Ab pura business cycle cover ho gaya — **kharido, becho, paisa dono taraf track ho**.

---

> 📌 **Notion Import:** Ye file already existing "Feature Build Sequence" doc ke andar
> Feature 17 ke baad ek naya section ban ke insert ho sakta hai — waise hi copy-paste kar sakte ho.
