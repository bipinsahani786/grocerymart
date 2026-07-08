# 🛒 QuickKart — Master Plan
> Hyperlocal Quick-Commerce Platform | Node.js + PostgreSQL + React + Flutter + Socket.IO
> Version 1.0 | Multi-Store | Multi-City Ready

---

## 📋 Table of Contents
1. [Tech Stack Overview](#tech-stack)
2. [Project Folder Structure](#folder-structure)
3. [Database Schema (PostgreSQL)](#database-schema)
4. [Panel 1 — Customer App Modules](#panel-1--customer-app-flutter)
5. [Panel 2 — Delivery Partner App Modules](#panel-2--delivery-partner-app-flutter)
6. [Panel 3 — Store Manager Panel Modules](#panel-3--store-manager-panel-react)
7. [Panel 4 — Super Admin Panel Modules](#panel-4--super-admin-panel-react)
8. [Backend Flow — Node.js + PostgreSQL](#backend-flow)
9. [Real-Time Flow — Socket.IO](#real-time-flow)
10. [API Structure](#api-structure)
11. [Development Phases (Roadmap)](#development-roadmap)
12. [Environment Setup](#environment-setup)

---

## 🧰 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Customer App | Flutter | Android + iOS (single codebase) |
| Delivery App | Flutter | Delivery partner mobile app |
| Store Manager Panel | React.js + Tailwind | Per-store web dashboard |
| Super Admin Panel | React.js + Tailwind | Central control dashboard |
| Backend API | Node.js (Express) | REST API server |
| ORM | Prisma | Type-safe DB access + migrations |
| Database | PostgreSQL + PostGIS | Relational data + geospatial queries |
| Cache | Redis | Sessions, socket pub/sub, queue |
| Real-time | Socket.IO + Redis Adapter | Live tracking, order updates |
| Job Queue | BullMQ (Redis-based) | Notifications, async tasks |
| File Storage | Cloudinary / AWS S3 | Product images, delivery proofs |
| Push Notifications | Firebase Cloud Messaging | Cross-platform push |
| Maps | Google Maps Platform | Navigation, geocoding, distance |
| Payments | Razorpay | UPI, cards, wallets |
| Auth | JWT + OTP (MSG91/Firebase) | Secure authentication |
| Hosting | AWS EC2 + RDS + ElastiCache | Scalable cloud infra |

---

## 📁 Folder Structure

```
quickkart/
│
├── backend/                        # Node.js API Server
│   ├── prisma/
│   │   ├── schema.prisma           # All DB models defined here
│   │   └── migrations/             # Auto-generated migration files
│   │
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts               # Prisma client instance
│   │   │   ├── redis.ts            # Redis connection
│   │   │   └── env.ts              # Environment variables
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.middleware.ts
│   │   │   │
│   │   │   ├── store/
│   │   │   │   ├── store.routes.ts
│   │   │   │   ├── store.controller.ts
│   │   │   │   └── store.service.ts
│   │   │   │
│   │   │   ├── inventory/
│   │   │   │   ├── inventory.routes.ts
│   │   │   │   ├── inventory.controller.ts
│   │   │   │   └── inventory.service.ts
│   │   │   │
│   │   │   ├── order/
│   │   │   │   ├── order.routes.ts
│   │   │   │   ├── order.controller.ts
│   │   │   │   ├── order.service.ts
│   │   │   │   └── routing.engine.ts   # Core order routing logic
│   │   │   │
│   │   │   ├── delivery/
│   │   │   │   ├── delivery.routes.ts
│   │   │   │   ├── delivery.controller.ts
│   │   │   │   └── delivery.service.ts
│   │   │   │
│   │   │   ├── catalog/
│   │   │   │   ├── catalog.routes.ts
│   │   │   │   ├── catalog.controller.ts
│   │   │   │   └── catalog.service.ts
│   │   │   │
│   │   │   ├── payment/
│   │   │   │   ├── payment.routes.ts
│   │   │   │   ├── payment.controller.ts
│   │   │   │   └── razorpay.service.ts
│   │   │   │
│   │   │   ├── notification/
│   │   │   │   ├── fcm.service.ts
│   │   │   │   └── notification.service.ts
│   │   │   │
│   │   │   └── analytics/
│   │   │       ├── analytics.routes.ts
│   │   │       └── analytics.service.ts
│   │   │
│   │   ├── sockets/
│   │   │   ├── socket.server.ts        # Socket.IO init + Redis adapter
│   │   │   ├── order.socket.ts         # Order status events
│   │   │   └── delivery.socket.ts      # Live location events
│   │   │
│   │   ├── jobs/
│   │   │   ├── queue.ts               # BullMQ queue setup
│   │   │   ├── notification.job.ts
│   │   │   └── lowstock.job.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── response.ts            # Standard API response format
│   │   │   ├── geo.ts                 # Haversine / PostGIS helpers
│   │   │   └── validators.ts
│   │   │
│   │   └── app.ts                     # Express app entry point
│   │
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
├── admin-panel/                    # React (Super Admin)
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── store/                  # Zustand / Redux state
│   │   └── api/                    # Axios API calls
│   └── package.json
│
├── store-panel/                    # React (Store Manager)
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── api/
│   └── package.json
│
├── mobile/                         # Flutter (Customer + Delivery)
│   ├── lib/
│   │   ├── customer/
│   │   ├── delivery/
│   │   ├── shared/
│   │   └── main.dart
│   └── pubspec.yaml
│
└── docker-compose.yml              # Local dev: postgres + redis
```

---

## 🗄️ Database Schema

> ORM: Prisma | DB: PostgreSQL + PostGIS extension

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── USERS ───────────────────────────────────────────────
model User {
  id           String   @id @default(uuid())
  phone        String   @unique
  name         String?
  email        String?
  role         Role     @default(CUSTOMER)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())

  addresses    Address[]
  orders       Order[]
  deliveryProfile DeliveryPartner?
  storeManaged    Store?          @relation("StoreManager")
  auditLogs    AuditLog[]
}

enum Role {
  CUSTOMER
  DELIVERY_PARTNER
  STORE_MANAGER
  STORE_STAFF
  SUPER_ADMIN
}

// ─── STORES ──────────────────────────────────────────────
model Store {
  id            String   @id @default(uuid())
  name          String
  address       String
  lat           Float
  long          Float
  radiusKm      Float    @default(3)   // service radius
  isActive      Boolean  @default(true)
  openingTime   String   @default("08:00")
  closingTime   String   @default("22:00")
  managerId     String   @unique
  manager       User     @relation("StoreManager", fields: [managerId], references: [id])
  createdAt     DateTime @default(now())

  racks         Rack[]
  inventory     StoreInventory[]
  orders        Order[]
  deliveryPartners DeliveryPartnerStore[]
}

// ─── RACKS ───────────────────────────────────────────────
model Rack {
  id          String   @id @default(uuid())
  storeId     String
  store       Store    @relation(fields: [storeId], references: [id])
  rackName    String   // e.g. "Rack A1", "Cold Zone B"
  zone        String?  // e.g. "Dairy", "Snacks"

  inventory   StoreInventory[]
}

// ─── MASTER PRODUCT CATALOG ───────────────────────────────
model Product {
  id          String   @id @default(uuid())
  name        String
  brand       String?
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])
  unit        String   // "500g", "1L", "piece"
  basePrice   Float
  imageUrl    String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  inventory   StoreInventory[]
  orderItems  OrderItem[]
}

model Category {
  id        String     @id @default(uuid())
  name      String
  parentId  String?
  parent    Category?  @relation("SubCategory", fields: [parentId], references: [id])
  children  Category[] @relation("SubCategory")
  products  Product[]
}

// ─── STORE INVENTORY ──────────────────────────────────────
model StoreInventory {
  id            String   @id @default(uuid())
  storeId       String
  store         Store    @relation(fields: [storeId], references: [id])
  productId     String
  product       Product  @relation(fields: [productId], references: [id])
  rackId        String?
  rack          Rack?    @relation(fields: [rackId], references: [id])
  quantity      Int      @default(0)
  priceOverride Float?   // store-specific price, else use product.basePrice
  lowStockAt    Int      @default(10) // alert threshold
  lastUpdated   DateTime @updatedAt

  @@unique([storeId, productId])
}

// ─── ADDRESSES ────────────────────────────────────────────
model Address {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  label       String   // "Home", "Work"
  fullAddress String
  lat         Float
  long        Float
  isDefault   Boolean  @default(false)

  orders      Order[]
}

// ─── ORDERS ───────────────────────────────────────────────
model Order {
  id            String      @id @default(uuid())
  customerId    String
  customer      User        @relation(fields: [customerId], references: [id])
  storeId       String
  store         Store       @relation(fields: [storeId], references: [id])
  addressId     String
  address       Address     @relation(fields: [addressId], references: [id])
  status        OrderStatus @default(PLACED)
  totalAmount   Float
  deliveryFee   Float       @default(0)
  discount      Float       @default(0)
  paymentMethod String
  notes         String?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  items         OrderItem[]
  payment       Payment?
  delivery      DeliveryAssignment?
}

enum OrderStatus {
  PLACED
  ACCEPTED
  PACKED
  OUT_FOR_DELIVERY
  DELIVERED
  CANCELLED
  REFUNDED
}

model OrderItem {
  id          String  @id @default(uuid())
  orderId     String
  order       Order   @relation(fields: [orderId], references: [id])
  productId   String
  product     Product @relation(fields: [productId], references: [id])
  qty         Int
  priceAtOrder Float   // locked price at time of order
}

// ─── DELIVERY ─────────────────────────────────────────────
model DeliveryPartner {
  id            String   @id @default(uuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])
  vehicleType   String
  kycStatus     KYCStatus @default(PENDING)
  isOnline      Boolean  @default(false)
  currentLat    Float?
  currentLong   Float?
  rating        Float    @default(5.0)
  totalEarnings Float    @default(0)
  bankAccount   String?
  upiId         String?

  stores        DeliveryPartnerStore[]
  assignments   DeliveryAssignment[]
}

enum KYCStatus {
  PENDING
  APPROVED
  REJECTED
}

model DeliveryPartnerStore {
  partnerId String
  storeId   String
  partner   DeliveryPartner @relation(fields: [partnerId], references: [id])
  store     Store           @relation(fields: [storeId], references: [id])

  @@id([partnerId, storeId])
}

model DeliveryAssignment {
  id            String   @id @default(uuid())
  orderId       String   @unique
  order         Order    @relation(fields: [orderId], references: [id])
  partnerId     String
  partner       DeliveryPartner @relation(fields: [partnerId], references: [id])
  status        String   // offered, accepted, picked_up, delivered
  offeredAt     DateTime @default(now())
  acceptedAt    DateTime?
  deliveredAt   DateTime?
  earningAmount Float?
}

// ─── PAYMENTS ─────────────────────────────────────────────
model Payment {
  id        String   @id @default(uuid())
  orderId   String   @unique
  order     Order    @relation(fields: [orderId], references: [id])
  method    String
  status    String   // pending, success, failed, refunded
  txnId     String?
  amount    Float
  createdAt DateTime @default(now())
}

// ─── COUPONS ──────────────────────────────────────────────
model Coupon {
  id        String   @id @default(uuid())
  code      String   @unique
  type      String   // flat, percent
  value     Float
  minOrder  Float    @default(0)
  maxDiscount Float?
  storeId   String?  // null = global
  validFrom DateTime
  validTill DateTime
  usageLimit Int?
  usedCount  Int     @default(0)
}

// ─── STOCK TRANSFERS ──────────────────────────────────────
model StockTransfer {
  id          String   @id @default(uuid())
  fromStoreId String
  toStoreId   String
  productId   String
  qty         Int
  status      String   // requested, approved, completed, rejected
  createdAt   DateTime @default(now())
}

// ─── AUDIT LOGS ───────────────────────────────────────────
model AuditLog {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  action    String
  entity    String
  entityId  String
  meta      Json?
  createdAt DateTime @default(now())
}
```

---

## 📱 Panel 1 — Customer App (Flutter)

### Module 1.1 — Authentication & Onboarding
**Kya karta hai:** Customer ko securely login/signup karwata hai

| Feature | Implementation |
|---|---|
| Mobile OTP login | POST `/api/auth/send-otp` → MSG91 / Firebase |
| OTP verify + JWT issue | POST `/api/auth/verify-otp` → returns `access_token` |
| Profile setup | PATCH `/api/users/profile` |
| Auto-login | JWT stored in Flutter secure storage |
| Logout | Token blacklist via Redis |

---

### Module 1.2 — Location & Store Mapping
**Kya karta hai:** GPS location se nearest serviceable store dhoondhta hai

| Feature | Implementation |
|---|---|
| GPS detect | Flutter `geolocator` package |
| Nearest store API | GET `/api/stores/nearest?lat=&long=` → PostGIS query |
| Geofence check | ST_DWithin(store.location, customer.point, radius) |
| No store → waitlist | POST `/api/waitlist` with lat/long saved |
| Saved addresses | GET/POST/DELETE `/api/users/addresses` |

**PostGIS Query (nearest store):**
```sql
SELECT id, name, lat, long,
  ST_Distance(
    ST_MakePoint(long, lat)::geography,
    ST_MakePoint($1, $2)::geography
  ) AS distance
FROM stores
WHERE is_active = true
  AND ST_DWithin(
    ST_MakePoint(long, lat)::geography,
    ST_MakePoint($1, $2)::geography,
    radius_km * 1000
  )
ORDER BY distance
LIMIT 1;
```

---

### Module 1.3 — Catalog & Product Discovery
**Kya karta hai:** Products browse, search, filter karna

| Feature | Implementation |
|---|---|
| Category listing | GET `/api/catalog/categories` |
| Products by category | GET `/api/catalog/products?categoryId=&storeId=` |
| Search with suggest | GET `/api/catalog/search?q=` (PostgreSQL ILIKE + trigram index) |
| Product detail | GET `/api/catalog/products/:id?storeId=` (includes stock status) |
| Stock real-time check | Redis cache with 30sec TTL, socket invalidation on stock change |

---

### Module 1.4 — Cart & Checkout
**Kya karta hai:** Items select karke order place karna

| Feature | Implementation |
|---|---|
| Cart state | Managed in Flutter local state + Redis (for cross-device sync) |
| Coupon apply | POST `/api/coupons/validate` |
| Stock re-validate | POST `/api/orders/validate-cart` (before payment) |
| ETA calculate | Haversine distance from store → estimated pack + delivery time |
| Place order | POST `/api/orders` |

---

### Module 1.5 — Payment
**Kya karta hai:** Secure payment process karna

| Feature | Implementation |
|---|---|
| Create Razorpay order | POST `/api/payment/create-order` → Razorpay API |
| Flutter Razorpay SDK | Opens payment UI, handles UPI/card/netbanking |
| Payment verify webhook | POST `/api/payment/webhook` → Razorpay HMAC verify |
| On success | Order status update + trigger routing engine |
| COD | Order placed directly, payment_method = 'COD' |

---

### Module 1.6 — Order Tracking (Real-Time)
**Kya karta hai:** Live order status + delivery location dikhana

| Feature | Implementation |
|---|---|
| Status timeline | Socket event `order:statusUpdate` → Flutter rebuilds UI |
| Live map | Socket event `delivery:locationUpdate` → update marker on Google Map |
| ETA countdown | Recalculated on each location update (distance ÷ avg speed) |
| Push notifications | FCM via `/api/notification/send` on each status change |
| Cancel order | PATCH `/api/orders/:id/cancel` (only before PACKED) |

---

### Module 1.7 — Order History & Post-Order
**Kya karta hai:** Past orders manage karna

| Feature | Implementation |
|---|---|
| Order history | GET `/api/orders?customerId=&page=&limit=` |
| Reorder | POST `/api/orders/reorder/:orderId` (re-validate stock) |
| Rate order | POST `/api/orders/:id/rating` |
| Return request | POST `/api/orders/:id/return` with reason + image |

---

### Module 1.8 — Engagement & Loyalty
**Kya karta hai:** Customer retention

| Feature | Implementation |
|---|---|
| Wallet | `wallet_balance` on User model, credit/debit logged |
| Referral | Unique code, bonus on successful referral order |
| Recommendations | GET `/api/catalog/recommendations?userId=` (based on order history) |

---

## 🛵 Panel 2 — Delivery Partner App (Flutter)

### Module 2.1 — Onboarding & KYC
**Kya karta hai:** Partner register + document verify

| Feature | Implementation |
|---|---|
| Signup + OTP | Same auth flow, role = DELIVERY_PARTNER |
| Document upload | Cloudinary upload → URL stored in DB |
| KYC status check | GET `/api/delivery/kyc-status` |
| Admin approves | PATCH `/api/admin/delivery/:id/kyc` → status = APPROVED |

---

### Module 2.2 — Duty & Availability
**Kya karta hai:** Online/offline toggle + location emit shuru/band

| Feature | Implementation |
|---|---|
| Go online | PATCH `/api/delivery/status` `{isOnline: true}` + socket connect |
| Location emit | Flutter Timer → emit `location:update` every 4 sec |
| Server stores location | Redis `delivery:location:{partnerId}` (fast read for routing) |
| Go offline | Socket disconnect + DB update |

---

### Module 2.3 — Order Assignment
**Kya karta hai:** Naye orders receive + accept/reject karna

| Feature | Implementation |
|---|---|
| Order offer | Server emits `delivery:offer` to nearest online partners |
| Accept | Emit `delivery:accept` → DB assignment created |
| Reject / timeout | After 30sec no response → next partner ko offer |
| Batch orders | 2 nearby orders ek saath assign (same route optimization) |

---

### Module 2.4 — Navigation & Delivery Execution
**Kya karta hai:** Pickup se drop tak ka pura flow

| Feature | Implementation |
|---|---|
| Store navigation | Google Maps SDK Flutter → store lat/long |
| Pickup confirm | PATCH `/api/delivery/assignment/:id` `{status: 'picked_up'}` |
| Customer navigation | Drop address lat/long |
| Delivery OTP verify | Customer gets 4-digit OTP, partner enters → POST `/api/orders/:id/verify-otp` |
| Mark delivered | PATCH status = 'delivered' → triggers earning credit |
| Location stream | Continuous emit while on duty |

---

### Module 2.5 — Earnings & Payout
**Kya karta hai:** Income track + withdrawal manage

| Feature | Implementation |
|---|---|
| Earnings dashboard | GET `/api/delivery/earnings?period=daily/weekly` |
| Per-order breakdown | GET `/api/delivery/assignments?status=delivered` |
| Incentive tracker | BullMQ job checks milestones daily |
| Payout request | POST `/api/delivery/payout-request` |

---

### Module 2.6 — Support & Profile
**Kya karta hai:** Self-service + issue raise

| Feature | Implementation |
|---|---|
| Profile update | PATCH `/api/delivery/profile` |
| Support ticket | POST `/api/support/ticket` |
| Rating view | GET `/api/delivery/rating` |

---

## 🖥️ Panel 3 — Store Manager Panel (React)

### Module 3.1 — Dashboard
**Kya karta hai:** Store ki daily health ek nazar me

| Feature | Implementation |
|---|---|
| Today's stats | GET `/api/store/:storeId/dashboard` |
| Live order queue | Socket room `store:{storeId}` — listen `order:new` |
| Low stock widget | Query `store_inventory WHERE quantity <= low_stock_at` |
| Active partners map | GET `/api/store/:storeId/active-partners` |

---

### Module 3.2 — Inventory Management
**Kya karta hai:** Stock add/edit/remove karna

| Feature | Implementation |
|---|---|
| Product list | GET `/api/inventory/:storeId` |
| Add product | POST `/api/inventory` `{storeId, productId, rackId, qty, priceOverride}` |
| Bulk CSV upload | POST `/api/inventory/bulk-upload` (multer + csv-parse) |
| Stock in/out | PATCH `/api/inventory/:id/adjust` `{delta, reason}` |
| Barcode scan | Flutter WebView scanner ya handheld → lookup productId by barcode |

---

### Module 3.3 — Rack/Location Mapping
**Kya karta hai:** Products ki physical location track karna

| Feature | Implementation |
|---|---|
| Manage racks | GET/POST/DELETE `/api/racks?storeId=` |
| Assign product to rack | PATCH `/api/inventory/:id` `{rackId}` |
| Picker view | Order detail shows: "Item X → Rack A1, Zone Dairy" |
| Rack-wise report | GET `/api/racks/:rackId/inventory` |

---

### Module 3.4 — Order Management
**Kya karta hai:** Incoming orders receive + pack karna

| Feature | Implementation |
|---|---|
| New order alert | Socket `order:new` → browser notification + sound |
| Accept order | PATCH `/api/orders/:id/status` `{status: 'ACCEPTED'}` |
| Assign to packer | PATCH `/api/orders/:id/assign-staff` |
| Mark packed | PATCH status = 'PACKED' → triggers delivery partner search |
| Order history | GET `/api/orders?storeId=&status=&date=` |

---

### Module 3.5 — Delivery Coordination
**Kya karta hai:** Delivery partners monitor karna

| Feature | Implementation |
|---|---|
| Active partners map | Real-time partner locations via socket |
| Manual reassign | PATCH `/api/delivery/assignment/:id/reassign` |
| Delivery SLA | Orders flagged if delivery > SLA time |

---

### Module 3.6 — Staff Management
**Kya karta hai:** Packer/picker sub-accounts manage karna

| Feature | Implementation |
|---|---|
| Create staff | POST `/api/store/:storeId/staff` → role = STORE_STAFF |
| Staff permissions | RBAC middleware — STORE_STAFF can only access order packing |
| Performance report | Orders packed per staff, avg packing time |

---

### Module 3.7 — Store-Level Offers
**Kya karta hai:** Local discounts create karna

| Feature | Implementation |
|---|---|
| Create coupon | POST `/api/coupons` `{storeId, ...}` |
| Banner management | POST `/api/store/:storeId/banners` (image upload) |
| View global coupons | GET `/api/coupons?storeId=global` |

---

### Module 3.8 — Analytics & Reports
**Kya karta hai:** Data-driven decisions ke liye reports

| Feature | Implementation |
|---|---|
| Sales trend | GET `/api/analytics/store/:storeId/sales?period=` |
| Best sellers | GET `/api/analytics/store/:storeId/top-products` |
| Peak hours heatmap | Aggregated `orders.created_at` by hour |
| Stock transfer request | POST `/api/stock-transfers` `{fromStoreId, toStoreId, productId, qty}` |

---

## 👑 Panel 4 — Super Admin Panel (React)

### Module 4.1 — Global Dashboard
**Kya karta hai:** Sab stores ka combined overview

| Feature | Implementation |
|---|---|
| Total GMV/orders | GET `/api/admin/dashboard` (aggregate across all stores) |
| Store-wise comparison | Recharts bar chart |
| Real-time order counter | Socket room `admin` → listen all `order:new` events |
| Growth trend | Week-on-week / month-on-month query with date_trunc |

---

### Module 4.2 — Store Management
**Kya karta hai:** Naye stores add/manage karna

| Feature | Implementation |
|---|---|
| Add store | POST `/api/admin/stores` `{name, lat, long, radiusKm, managerId}` |
| Activate/deactivate | PATCH `/api/admin/stores/:id` `{isActive}` |
| Change manager | PATCH `/api/admin/stores/:id/manager` |
| Store health view | Per-store order load, stock status, partner count |

---

### Module 4.3 — Master Catalog
**Kya karta hai:** Global product list manage karna

| Feature | Implementation |
|---|---|
| Add master product | POST `/api/admin/catalog` |
| Category CRUD | GET/POST/PATCH/DELETE `/api/admin/categories` |
| Bulk import | POST `/api/admin/catalog/bulk` (CSV) |
| Image upload | Cloudinary signed upload |

---

### Module 4.4 — Pricing & Promotions
**Kya karta hai:** Platform-wide pricing + campaigns

| Feature | Implementation |
|---|---|
| Global coupons | POST `/api/coupons` `{storeId: null}` = global |
| Delivery fee rules | Config table in DB, loaded at checkout |
| Campaign scheduling | BullMQ delayed job for start/end |

---

### Module 4.5 — User & Access Management
**Kya karta hai:** Roles, permissions, KYC control

| Feature | Implementation |
|---|---|
| Create store manager | POST `/api/admin/users` `{role: STORE_MANAGER, storeId}` |
| RBAC middleware | JWT decode → check role vs route permission map |
| KYC approval queue | GET `/api/admin/delivery/kyc-pending` |
| Block customer | PATCH `/api/admin/users/:id` `{isActive: false}` |
| Audit logs | GET `/api/admin/audit-logs?entity=&userId=` |

---

### Module 4.6 — Expansion & Analytics
**Kya karta hai:** Data se growth decisions lena

| Feature | Implementation |
|---|---|
| Demand heatmap | Unserviced waitlist lat/long plotted on Google Maps Heatmap Layer |
| Cross-store comparison | GET `/api/admin/analytics/stores-compare` |
| City-wise report | Filter analytics by store.city |

---

### Module 4.7 — Delivery & Payout Settings
**Kya karta hai:** Partner earnings + fleet management

| Feature | Implementation |
|---|---|
| Payout structure config | Config in DB: base_fare, per_km_rate, incentive_rules |
| Process payouts | GET pending payout requests → bulk approve |
| Fleet utilization | Active partners / total orders ratio by time-of-day |

---

### Module 4.8 — Customer Support
**Kya karta hai:** Escalated issues handle karna

| Feature | Implementation |
|---|---|
| All support tickets | GET `/api/admin/support/tickets` |
| Refund approval | PATCH `/api/admin/orders/:id/refund` → Razorpay refund API |
| Broadcast notification | POST `/api/admin/notification/broadcast` → FCM topic message |

---

## ⚙️ Backend Flow

### Order Life Cycle (Core Flow)

```
Customer places order
        │
        ▼
POST /api/orders
  → Validate cart (stock re-check)
  → Calculate total (price + delivery fee - discount)
  → Create order in DB (status: PLACED)
        │
        ▼
POST /api/payment/create-order
  → Razorpay order created
  → Customer pays on Flutter SDK
        │
        ▼
POST /api/payment/webhook (Razorpay callback)
  → Verify HMAC signature
  → Mark payment SUCCESS in DB
  → Trigger Order Routing Engine
        │
        ▼
routing.engine.ts
  → Find nearest active store (PostGIS)
  → Check stock availability (store_inventory)
  → Assign order to store (order.storeId confirmed)
  → Emit socket event → store panel: order:new
  → Deduct stock from store_inventory
        │
        ▼
Store Manager accepts (ACCEPTED)
  → Picker sees order + rack locations
  → Packs items
  → Marks PACKED
        │
        ▼
Delivery Assignment Engine
  → Find nearest online delivery partner (Redis: delivery:location:*)
  → Emit delivery:offer to partner
  → Partner accepts → DeliveryAssignment created
        │
        ▼
Partner picks up (OUT_FOR_DELIVERY)
  → Continuous location emit every 4sec
  → Customer sees live map
        │
        ▼
Customer OTP verify + Partner marks DELIVERED
  → Order status = DELIVERED
  → Earnings credited to partner
  → FCM push to customer
  → Rating prompt shown
```

---

### Routing Engine Logic (routing.engine.ts)

```typescript
async function routeOrder(orderId: string, customerLat: number, customerLong: number) {

  // Step 1: Find nearest active stores within range
  const nearbyStores = await prisma.$queryRaw`
    SELECT id, name,
      ST_Distance(
        ST_MakePoint(long, lat)::geography,
        ST_MakePoint(${customerLong}, ${customerLat})::geography
      ) AS distance
    FROM stores
    WHERE is_active = true
      AND ST_DWithin(
        ST_MakePoint(long, lat)::geography,
        ST_MakePoint(${customerLong}, ${customerLat})::geography,
        radius_km * 1000
      )
    ORDER BY distance
    LIMIT 3
  `;

  // Step 2: Check stock availability in nearest store
  for (const store of nearbyStores) {
    const hasStock = await checkStockAvailability(store.id, orderId);
    if (hasStock) {
      await assignOrderToStore(orderId, store.id);
      socketServer.to(`store:${store.id}`).emit('order:new', { orderId });
      return;
    }
  }

  // Step 3: No store has stock → cancel & refund
  await cancelOrderWithRefund(orderId);
}
```

---

## ⚡ Real-Time Flow

### Socket.IO Server Setup

```typescript
// sockets/socket.server.ts
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export async function initSocket(httpServer) {
  const pubClient = createClient({ url: process.env.REDIS_URL });
  const subClient = pubClient.duplicate();
  await Promise.all([pubClient.connect(), subClient.connect()]);

  const io = new Server(httpServer, { cors: { origin: '*' } });
  io.adapter(createAdapter(pubClient, subClient)); // multi-server support

  io.on('connection', (socket) => {
    const { role, id } = socket.handshake.auth; // JWT decoded

    // Rooms: role-based
    if (role === 'STORE_MANAGER') socket.join(`store:${id}`);
    if (role === 'CUSTOMER') socket.join(`customer:${id}`);
    if (role === 'SUPER_ADMIN') socket.join('admin');

    // Delivery partner location update
    socket.on('location:update', async ({ lat, long }) => {
      await redis.set(`delivery:location:${id}`, JSON.stringify({ lat, long }), { EX: 30 });
      // Broadcast to customer tracking this partner
      const activeOrder = await getActiveOrderForPartner(id);
      if (activeOrder) {
        io.to(`customer:${activeOrder.customerId}`)
          .emit('delivery:locationUpdate', { lat, long });
      }
    });
  });

  return io;
}
```

### Socket Events Reference

| Event | Direction | Payload | Purpose |
|---|---|---|---|
| `order:new` | Server → Store Panel | `{orderId, items, address}` | New order alert |
| `order:statusUpdate` | Server → Customer | `{orderId, status, eta}` | Status change |
| `delivery:locationUpdate` | Server → Customer | `{lat, long}` | Live map |
| `delivery:offer` | Server → Delivery App | `{orderId, pickupStore, dropAddress, earning}` | New order offer |
| `location:update` | Delivery App → Server | `{lat, long}` | Partner location |
| `inventory:lowStock` | Server → Store Panel | `{productId, qty}` | Stock alert |

---

## 🔌 API Structure

### Base URL: `https://api.quickkart.in/v1`

#### Auth
```
POST   /auth/send-otp
POST   /auth/verify-otp
POST   /auth/refresh-token
```

#### Users
```
GET    /users/profile
PATCH  /users/profile
GET    /users/addresses
POST   /users/addresses
DELETE /users/addresses/:id
```

#### Stores
```
GET    /stores/nearest?lat=&long=
GET    /stores/:id
```

#### Catalog
```
GET    /catalog/categories
GET    /catalog/products?categoryId=&storeId=
GET    /catalog/products/:id?storeId=
GET    /catalog/search?q=&storeId=
GET    /catalog/recommendations?userId=
```

#### Inventory (Store Manager)
```
GET    /inventory/:storeId
POST   /inventory
PATCH  /inventory/:id
PATCH  /inventory/:id/adjust
POST   /inventory/bulk-upload
GET    /racks?storeId=
POST   /racks
```

#### Orders
```
POST   /orders
GET    /orders?customerId=&storeId=&status=
GET    /orders/:id
PATCH  /orders/:id/status
POST   /orders/:id/cancel
POST   /orders/:id/verify-otp
POST   /orders/:id/rating
POST   /orders/:id/return
POST   /orders/reorder/:orderId
```

#### Payment
```
POST   /payment/create-order
POST   /payment/webhook
POST   /payment/refund
```

#### Delivery
```
PATCH  /delivery/status
GET    /delivery/assignments
PATCH  /delivery/assignment/:id
GET    /delivery/earnings?period=
POST   /delivery/payout-request
GET    /delivery/profile
PATCH  /delivery/profile
```

#### Admin
```
GET    /admin/dashboard
POST   /admin/stores
PATCH  /admin/stores/:id
POST   /admin/catalog
PATCH  /admin/catalog/:id
GET    /admin/analytics/global
GET    /admin/analytics/stores-compare
GET    /admin/delivery/kyc-pending
PATCH  /admin/delivery/:id/kyc
POST   /admin/notification/broadcast
GET    /admin/audit-logs
```

#### Coupons & Support
```
POST   /coupons/validate
POST   /coupons
GET    /support/tickets
POST   /support/ticket
```

---

## 🗺️ Development Roadmap

### Phase 1 — Foundation (Weeks 1-3)
- [ ] Project setup: Monorepo, Docker Compose (Postgres + Redis)
- [ ] Prisma schema define + initial migration run
- [ ] Auth module: OTP send/verify, JWT, RBAC middleware
- [ ] User profile + address APIs
- [ ] Store model + nearest store PostGIS query

### Phase 2 — Catalog & Inventory (Weeks 4-5)
- [ ] Category + Master Product APIs
- [ ] Store Inventory APIs (add, update, bulk upload)
- [ ] Rack management
- [ ] Product search with PostgreSQL trigram index
- [ ] Store Manager Panel React — basic login + inventory view

### Phase 3 — Order & Payment (Weeks 6-8)
- [ ] Cart validation API
- [ ] Order creation + routing engine
- [ ] Razorpay integration (create order + webhook)
- [ ] Order status management APIs
- [ ] OTP generation for delivery verification
- [ ] Socket.IO setup with Redis adapter
- [ ] `order:new` event to store panel

### Phase 4 — Delivery System (Weeks 9-10)
- [ ] Delivery partner onboarding + KYC flow
- [ ] Online/offline toggle + Redis location storage
- [ ] Delivery assignment engine (nearest partner algo)
- [ ] `delivery:offer` socket event + accept/reject flow
- [ ] Live location emit → customer tracking
- [ ] Earnings calculation + payout request

### Phase 5 — Flutter Apps (Weeks 8-12, parallel)
- [ ] Customer App: Auth → Home → Catalog → Cart → Checkout → Track
- [ ] Delivery App: Onboarding → Duty toggle → Order accept → Navigate → Deliver

### Phase 6 — Admin & Analytics (Weeks 11-13)
- [ ] Super Admin Panel: Store management, catalog, user management
- [ ] Analytics APIs: Sales trends, top products, peak hours
- [ ] FCM push notifications integration
- [ ] Stock transfer between stores
- [ ] Coupon engine

### Phase 7 — Testing & Launch (Weeks 14-15)
- [ ] End-to-end order flow testing
- [ ] Load testing (k6 or Artillery)
- [ ] CI/CD setup (GitHub Actions)
- [ ] Production deployment (AWS EC2 + RDS + ElastiCache)
- [ ] Monitoring setup (Datadog / Grafana)

---

## 🛠️ Environment Setup

### docker-compose.yml (Local Dev)

```yaml
version: '3.8'
services:
  postgres:
    image: postgis/postgis:15-3.3
    environment:
      POSTGRES_DB: quickkart
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

### .env (Backend)

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/quickkart"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="7d"

RAZORPAY_KEY_ID="rzp_test_xxx"
RAZORPAY_KEY_SECRET="xxx"

CLOUDINARY_CLOUD_NAME="xxx"
CLOUDINARY_API_KEY="xxx"
CLOUDINARY_API_SECRET="xxx"

FIREBASE_SERVER_KEY="xxx"
MSG91_API_KEY="xxx"
GOOGLE_MAPS_API_KEY="xxx"
```

### Quick Start Commands

```bash
# 1. Start database & redis
docker-compose up -d

# 2. Install dependencies
cd backend && npm install

# 3. Run migrations
npx prisma migrate dev --name init

# 4. Enable PostGIS extension (run once)
psql -U postgres -d quickkart -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# 5. Seed initial data (categories, test store)
npx ts-node prisma/seed.ts

# 6. Start dev server
npm run dev

# 7. Open Prisma Studio (DB GUI)
npx prisma studio
```

---

## 🔒 Security Checklist

- [ ] All routes protected with JWT middleware except `/auth/*`
- [ ] Role-based access: STORE_MANAGER routes check `req.user.storeId === params.storeId`
- [ ] Razorpay webhook HMAC signature verify mandatory
- [ ] Phone numbers masked in delivery partner logs
- [ ] Rate limiting on OTP send endpoint (max 5/min per phone)
- [ ] Input validation with Zod on all POST/PATCH routes
- [ ] SQL injection safe via Prisma parameterized queries
- [ ] Audit logs for all admin/manager actions

---

> 📌 **Tip for Notion:** Ye file import karte waqt Notion automatically headings, tables, aur code blocks render karega. "Import" → "Upload file" → `.md` select karo.