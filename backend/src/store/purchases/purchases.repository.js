import { prisma } from "../../../config/prisma.js";

export class PurchasesRepository {
  // ── Suppliers ──
  async getSuppliers(storeId) {
    return prisma.supplier.findMany({
      where: { storeId, isActive: true },
      orderBy: { name: "asc" },
    });
  }

  async createSupplier(storeId, data) {
    return prisma.supplier.create({
      data: {
        storeId,
        name: data.name,
        contactPerson: data.contactPerson || null,
        phone: data.phone,
        email: data.email || null,
        gstin: data.gstin || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        pincode: data.pincode || null,
      },
    });
  }

  async updateSupplier(storeId, supplierId, data) {
    return prisma.supplier.updateMany({
      where: { id: supplierId, storeId },
      data,
    });
  }

  // ── Purchase Orders ──
  async getPurchaseOrders(storeId) {
    return prisma.purchaseOrder.findMany({
      where: { storeId },
      include: {
        supplier: {
          select: { id: true, name: true, phone: true, gstin: true },
        },
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true } },
          },
        },
        batches: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getPurchaseOrderById(storeId, id) {
    return prisma.purchaseOrder.findFirst({
      where: { id, storeId },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
        batches: true,
      },
    });
  }

  async createPurchaseOrderTransaction(storeId, payload) {
    const { supplierId, invoiceNumber, invoiceDate, notes, items } = payload;

    // Generate PO Number
    const poCount = await prisma.purchaseOrder.count({ where: { storeId } });
    const poNumber = `PO-${Date.now().toString().slice(-6)}-${poCount + 1}`;

    let totalAmount = 0;
    let totalTax = 0;

    items.forEach((item) => {
      const itemCost = item.quantity * item.costPrice;
      const itemTax = (itemCost * (item.taxRate || 0)) / 100;
      totalAmount += itemCost + itemTax;
      totalTax += itemTax;
    });

    return prisma.$transaction(async (tx) => {
      // 1. Create Purchase Order
      // ✅ Status is RECEIVED when inward purchase is done (stock immediately added to inventory)
      // For future PO workflow: use DRAFT/ORDERED when creating pre-orders before receiving
      const po = await tx.purchaseOrder.create({
        data: {
          poNumber,
          storeId,
          supplierId,
          status: "RECEIVED",  // Inward purchase = stock already received in store
          totalAmount,
          totalTax,
          invoiceNumber: invoiceNumber || null,
          invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
          notes: notes || null,
        },
      });


      // 2. Create Items, Batches, and Update Store Inventory
      for (const item of items) {
        const batchNum = item.batchNumber || `BATCH-${Date.now().toString().slice(-6)}`;
        const expiry = item.expiryDate ? new Date(item.expiryDate) : null;

        // Save PO Line Item
        await tx.purchaseOrderItem.create({
          data: {
            purchaseOrderId: po.id,
            productId: item.productId,
            variantId: item.variantId || null,
            batchNumber: batchNum,
            quantity: item.quantity,
            costPrice: item.costPrice,
            mrp: item.mrp || item.sellingPrice,
            sellingPrice: item.sellingPrice,
            taxRate: item.taxRate || 0, // LOCKED TAX RATE % AT PURCHASE
            hsnCode: item.hsnCode || null,
            expiryDate: expiry,
          },
        });

        // Upsert Store Inventory Record
        let inventory = await tx.storeInventory.findFirst({
          where: {
            storeId,
            productId: item.productId,
            variantId: item.variantId || null,
          },
        });

        if (!inventory) {
          inventory = await tx.storeInventory.create({
            data: {
              storeId,
              productId: item.productId,
              variantId: item.variantId || null,
              quantity: 0,
            },
          });
        }

        // Create Frozen Store Batch
        const batch = await tx.storeBatch.create({
          data: {
            batchNumber: batchNum,
            storeId,
            inventoryId: inventory.id,
            productId: item.productId,
            variantId: item.variantId || null,
            purchaseOrderId: po.id,
            costPrice: item.costPrice,
            mrp: item.mrp || item.sellingPrice,
            sellingPrice: item.sellingPrice,
            taxRate: item.taxRate || 0, // FROZEN TAX RATE %
            hsnCode: item.hsnCode || null,
            initialQuantity: item.quantity,
            currentQuantity: item.quantity,
            expiryDate: expiry,
            isActive: true,
          },
        });

        // Increment Inventory Quantity
        await tx.storeInventory.update({
          where: { id: inventory.id },
          data: {
            quantity: { increment: item.quantity },
          },
        });

        // Update Store Product Cost Price / Base Price
        await tx.product.update({
          where: { id: item.productId },
          data: {
            costPrice: item.costPrice,
            basePrice: item.sellingPrice,
            ...(item.mrp && { mrp: item.mrp }),
          },
        });

        // Log Stock Entry
        await tx.stockLog.create({
          data: {
            inventoryId: inventory.id,
            delta: item.quantity,
            reason: `Purchase Inward (${po.poNumber} / ${batch.batchNumber})`,
            referenceId: po.id,
          },
        });
      }

      return po;
    });
  }

  // ── Inventory Batches ──
  async getStoreBatches(storeId, productId) {
    return prisma.storeBatch.findMany({
      where: {
        storeId,
        ...(productId && { productId }),
        currentQuantity: { gt: 0 },
        isActive: true,
      },
      include: {
        product: { select: { id: true, name: true, sku: true, unit: true } },
      },
      orderBy: [
        { expiryDate: "asc" },
        { createdAt: "asc" },
      ],
    });
  }
}

export const purchasesRepository = new PurchasesRepository();
