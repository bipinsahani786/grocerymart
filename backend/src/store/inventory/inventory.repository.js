import { prisma } from "../../../config/prisma.js";

const productInclude = {
  category: true,
  inventory: {
    include: {
      rack: true,
    },
  },
  taxClass: {
    include: {
      rates: {
        include: {
          components: true,
        },
      },
    },
  },
};

export class InventoryRepository {
  async products(storeId, q = "") {
    return await prisma.product.findMany({
      where: {
        storeId,
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { sku: { contains: q, mode: "insensitive" } },
                { barcode: { contains: q, mode: "insensitive" } },
                { brand: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: productInclude,
      orderBy: { createdAt: "desc" },
    });
  }

  async createProduct(storeId, payload) {
    return await prisma.$transaction(async (tx) => {
      let categoryId = payload.categoryId;

      if (!categoryId && payload.categoryName) {
        const category = await tx.category.upsert({
          where: { storeId_name: { storeId, name: payload.categoryName } },
          update: {},
          create: { storeId, name: payload.categoryName },
        });
        categoryId = category.id;
      }

      let rackId = null;
      if (payload.rackLocation && payload.rackLocation.trim()) {
        let rack = await tx.rack.findFirst({
          where: { storeId, name: payload.rackLocation.trim() }
        });
        if (!rack) {
          rack = await tx.rack.create({
            data: { storeId, name: payload.rackLocation.trim() }
          });
        }
        rackId = rack.id;
      }

      const product = await tx.product.create({
        data: {
          store: { connect: { id: storeId } },
          category: { connect: { id: categoryId } },
          name: payload.name,
          sku: payload.sku || null,
          barcode: payload.barcode || null,
          brand: payload.brand || null,
          description: payload.description || null,
          productType: payload.productType || payload.type || "simple",
          unit: payload.unit || "pcs",
          basePrice: payload.basePrice !== undefined ? parseFloat(payload.basePrice) : parseFloat(payload.sellingPrice || 0),
          mrp: payload.mrp ? parseFloat(payload.mrp) : null,
          costPrice: payload.costPrice ? parseFloat(payload.costPrice) : null,
          hsnCode: payload.hsnCode || null,
          ...(payload.taxClassId ? { taxClass: { connect: { id: payload.taxClassId } } } : {}),
          imageUrls: payload.imageUrls || [],
          showOnApp: payload.showOnApp !== undefined ? payload.showOnApp : (payload.showOnline !== undefined ? payload.showOnline : true),
          showOnPOS: payload.showOnPOS !== undefined ? payload.showOnPOS : (payload.showPOS !== undefined ? payload.showPOS : true),
          availableForDelivery: payload.availableForDelivery !== undefined ? payload.availableForDelivery : (payload.deliveryEnabled !== undefined ? payload.deliveryEnabled : true),
          availableForClickCollect: payload.availableForClickCollect !== undefined ? payload.availableForClickCollect : (payload.clickCollectEnabled !== undefined ? payload.clickCollectEnabled : true),
          inventory: {
            create: {
              store: { connect: { id: storeId } },
              quantity: payload.quantity !== undefined ? parseInt(payload.quantity) : (payload.stock !== undefined ? parseInt(payload.stock) : 0),
              lowStockAt: payload.lowStockAlert !== undefined ? parseInt(payload.lowStockAlert) : (payload.lowStockAt !== undefined ? parseInt(payload.lowStockAt) : 10),
              ...(rackId ? { rack: { connect: { id: rackId } } } : {}),
            },
          },
        },
        include: productInclude,
      });

      return product;
    });
  }

  async adjustInventory(storeId, productId, delta) {
    const inv = await prisma.storeInventory.findFirst({
      where: { storeId, productId },
    });

    const deltaInt = parseInt(delta);
    const currentQty = inv?.quantity || 0;

    if (deltaInt < 0 && (currentQty + deltaInt) < 0) {
      throw new Error(`Insufficient stock. Current stock is ${currentQty}, cannot deduct ${Math.abs(deltaInt)} items.`);
    }

    if (inv) {
      return await prisma.storeInventory.update({
        where: { id: inv.id },
        data: { quantity: currentQty + deltaInt },
        include: { product: true },
      });
    } else {
      if (deltaInt < 0) {
        throw new Error(`Product has no inventory record. Cannot perform negative stock adjustment.`);
      }
      return await prisma.storeInventory.create({
        data: {
          storeId,
          productId,
          quantity: deltaInt,
        },
        include: { product: true },
      });
    }
  }

  async updateProduct(storeId, productId, payload) {
    return await prisma.$transaction(async (tx) => {
      let categoryId = payload.categoryId;

      if (!categoryId && payload.categoryName) {
        const category = await tx.category.upsert({
          where: { storeId_name: { storeId, name: payload.categoryName } },
          update: {},
          create: { storeId, name: payload.categoryName },
        });
        categoryId = category.id;
      }

      const productData = {
        ...(payload.name ? { name: payload.name } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(payload.sku !== undefined ? { sku: payload.sku } : {}),
        ...(payload.barcode !== undefined ? { barcode: payload.barcode } : {}),
        ...(payload.brand !== undefined ? { brand: payload.brand } : {}),
        ...(payload.description !== undefined ? { description: payload.description } : {}),
        ...(payload.productType !== undefined || payload.type !== undefined ? { productType: payload.productType || payload.type } : {}),
        ...(payload.unit !== undefined ? { unit: payload.unit } : {}),
        ...(payload.basePrice !== undefined || payload.sellingPrice !== undefined ? { basePrice: parseFloat(payload.sellingPrice ?? payload.basePrice) } : {}),
        ...(payload.mrp !== undefined ? { mrp: payload.mrp !== null && payload.mrp !== '' ? parseFloat(payload.mrp) : null } : {}),
        ...(payload.costPrice !== undefined ? { costPrice: payload.costPrice !== null && payload.costPrice !== '' ? parseFloat(payload.costPrice) : null } : {}),
        ...(payload.hsnCode !== undefined ? { hsnCode: payload.hsnCode } : {}),
        ...(payload.taxClassId !== undefined ? { taxClassId: payload.taxClassId } : {}),
        ...(payload.imageUrls !== undefined ? { imageUrls: payload.imageUrls } : {}),
        ...(payload.showOnApp !== undefined || payload.showOnline !== undefined ? { showOnApp: payload.showOnApp ?? payload.showOnline } : {}),
        ...(payload.showOnPOS !== undefined || payload.showPOS !== undefined ? { showOnPOS: payload.showOnPOS ?? payload.showPOS } : {}),
        ...(payload.availableForDelivery !== undefined || payload.deliveryEnabled !== undefined ? { availableForDelivery: payload.availableForDelivery ?? payload.deliveryEnabled } : {}),
        ...(payload.availableForClickCollect !== undefined || payload.clickCollectEnabled !== undefined ? { availableForClickCollect: payload.availableForClickCollect ?? payload.clickCollectEnabled } : {}),
      };

      const product = await tx.product.update({
        where: { id: productId },
        data: productData,
        include: productInclude,
      });

      let rackId = undefined;
      if (payload.rackLocation !== undefined) {
        if (payload.rackLocation && payload.rackLocation.trim()) {
          let rack = await tx.rack.findFirst({
            where: { storeId, name: payload.rackLocation.trim() }
          });
          if (!rack) {
            rack = await tx.rack.create({
              data: { storeId, name: payload.rackLocation.trim() }
            });
          }
          rackId = rack.id;
        } else {
          rackId = null;
        }
      }

      if (payload.quantity !== undefined || payload.stock !== undefined || payload.lowStockAlert !== undefined || payload.lowStockAt !== undefined || rackId !== undefined) {
        const inv = await tx.storeInventory.findFirst({
          where: { storeId, productId },
        });

        const qtyVal = payload.quantity !== undefined ? parseInt(payload.quantity) : (payload.stock !== undefined ? parseInt(payload.stock) : undefined);
        const lowStockVal = payload.lowStockAlert !== undefined ? parseInt(payload.lowStockAlert) : (payload.lowStockAt !== undefined ? parseInt(payload.lowStockAt) : undefined);

        if (inv) {
          await tx.storeInventory.update({
            where: { id: inv.id },
            data: {
              ...(qtyVal !== undefined ? { quantity: qtyVal } : {}),
              ...(lowStockVal !== undefined ? { lowStockAt: lowStockVal } : {}),
              ...(rackId !== undefined ? { rackId } : {}),
            },
          });
        } else {
          await tx.storeInventory.create({
            data: {
              storeId,
              productId,
              quantity: qtyVal ?? 0,
              lowStockAt: lowStockVal ?? 10,
              ...(rackId ? { rackId } : {}),
            },
          });
        }
      }

      return product;
    });
  }

  async deleteProduct(storeId, productId) {
    return await prisma.product.delete({
      where: { id: productId },
    });
  }

  async getMasterCatalog() {
    return await prisma.masterProduct.findMany({
      include: { category: true, variants: true },
      orderBy: { createdAt: "asc" },
    });
  }

  async importMasterProducts(storeId, productIds = []) {
    if (!productIds || productIds.length === 0) {
      return { importedCount: 0, totalMaster: 0 };
    }

    const masterProducts = await prisma.masterProduct.findMany({
      where: {
        id: { in: productIds }
      },
      include: { category: true, variants: true },
      orderBy: { createdAt: "asc" },
    });

    let importedCount = 0;
    for (const mp of masterProducts) {
      const existingProduct = await prisma.product.findFirst({
        where: {
          storeId,
          OR: [
            { name: mp.name },
            ...(mp.sku ? [{ sku: mp.sku }] : []),
            ...(mp.barcode ? [{ barcode: mp.barcode }] : []),
          ],
        },
      });

      if (!existingProduct) {
        let categoryId = null;
        if (mp.category) {
          const cat = await prisma.category.upsert({
            where: { storeId_name: { storeId, name: mp.category.name } },
            update: {},
            create: {
              storeId,
              name: mp.category.name,
              imageUrl: mp.category.imageUrl || null,
              sortOrder: mp.category.sortOrder || 0,
            },
          });
          categoryId = cat.id;
        }

        await prisma.product.create({
          data: {
            storeId,
            categoryId,
            name: mp.name,
            sku: mp.sku || null,
            barcode: mp.barcode || null,
            brand: mp.brand || null,
            description: mp.description || null,
            productType: mp.productType || "simple",
            unit: mp.unit || "pcs",
            basePrice: mp.basePrice || 0,
            mrp: mp.mrp || null,
            imageUrls: mp.imageUrls || [],
            showOnApp: true,
            showOnPOS: true,
            isActive: mp.isActive ?? true,
            taxClassId: mp.taxClassId || null,
            hsnCode: mp.hsnCode || null,
            masterProductId: mp.id,
            variants: mp.variants?.length ? {
              create: mp.variants.map((v) => ({
                name: v.name,
                barcode: v.barcode,
                price: v.price,
                mrp: v.mrp,
                imageUrl: v.imageUrl,
              }))
            } : undefined,
            inventory: {
              create: {
                storeId,
                quantity: 0,
                lowStockAt: 5,
              },
            },
          },
        });
        importedCount++;
      }
    }

    return { importedCount, totalMaster: masterProducts.length };
  }
}

export const inventoryRepository = new InventoryRepository();
