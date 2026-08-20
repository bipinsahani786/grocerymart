import { customerProductsRepository } from "./products.repository.js";

const DEFAULT_CATEGORY_IMAGES = {
  "fruits & vegetables": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=400",
  "dairy & eggs": "https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&q=80&w=400",
  "bakery & bread": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400",
  "beverages": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=400",
  "snacks & namkeen": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&q=80&w=400",
  "staples & grains": "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400",
  "personal care": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400",
  "household cleaning": "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=400",
  "frozen foods": "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=400",
  "meat & seafood": "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=400",
  "health & wellness": "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&q=80&w=400",
  "baby care": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=400",
};

function matchCategoryImage(name = "") {
  const lower = name.toLowerCase();
  for (const [key, url] of Object.entries(DEFAULT_CATEGORY_IMAGES)) {
    if (lower.includes(key) || key.includes(lower)) {
      return url;
    }
  }
  return null;
}

export class CustomerProductsService {
  /**
   * Fetches real categories from the database and returns structured metadata for the customer app.
   */
  async getCategories({ pincode, storeId } = {}) {
    let store = null;
    if (storeId) {
      store = await customerProductsRepository.findStoreById(storeId);
    }
    if (!store && pincode) {
      store = await customerProductsRepository.findServingStore(pincode);
    }
    if (!store) {
      store = await customerProductsRepository.findServingStore();
    }

    const resolvedStoreId = store ? store.id : null;
    const dbCategories = await customerProductsRepository.findCategoriesByStore(resolvedStoreId);

    const totalProductCount = dbCategories.reduce((acc, c) => acc + (c._count?.products || 0), 0);

    const formatted = [
      {
        id: "all",
        name: "All",
        slug: "all",
        image: null,
        imageUrl: null,
        itemCount: totalProductCount,
      },
      ...dbCategories.map((cat) => {
        const catImage = cat.imageUrl || cat.image || matchCategoryImage(cat.name);
        return {
          id: cat.slug || cat.id,
          dbId: cat.id,
          name: cat.name,
          slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-"),
          image: catImage,
          imageUrl: catImage,
          itemCount: cat._count?.products || 0,
        };
      }),
    ];

    return formatted;
  }

  async getProducts({ category = "all", pincode, storeId, q = "" } = {}) {
    let store = null;
    if (storeId) {
      store = await customerProductsRepository.findStoreById(storeId);
    }
    if (!store && pincode) {
      store = await customerProductsRepository.findServingStore(pincode);
    }
    if (!store) {
      store = await customerProductsRepository.findServingStore();
    }

    if (!store) {
      return [];
    }

    const products = await customerProductsRepository.findProductsByStore(store.id, category, q);

    return products.map((prod) => {
      const totalStock = (prod.inventory || []).reduce((acc, inv) => acc + (inv.quantity || 0), 0);
      const isOutOfStock = totalStock <= 0;

      let appCategory = "packaged";
      const catName = prod.category ? prod.category.name.toLowerCase() : "";

      if (catName.includes("fruit") || catName.includes("vegetable") || prod.name.includes("Apple") || prod.name.includes("Banana") || prod.name.includes("Potato") || prod.name.includes("Tomato")) {
        appCategory = "fresh";
      } else if (catName.includes("dairy") || catName.includes("milk") || catName.includes("egg") || prod.name.includes("Milk") || prod.name.includes("Paneer") || prod.name.includes("Egg") || prod.name.includes("Butter")) {
        appCategory = "dairy";
      } else if (catName.includes("beverage") || catName.includes("drink") || catName.includes("tea") || catName.includes("coffee") || prod.name.includes("Juice") || prod.name.includes("Tea") || prod.name.includes("Coffee")) {
        appCategory = "beverages";
      } else if (catName.includes("snack") || catName.includes("biscuit") || catName.includes("noodle") || prod.name.includes("Maggi") || prod.name.includes("Oreo") || prod.name.includes("Chips")) {
        appCategory = "snacks";
      } else if (catName.includes("household") || catName.includes("clean") || catName.includes("detergent") || prod.name.includes("Surf") || prod.name.includes("Vim") || prod.name.includes("Ariel")) {
        appCategory = "household";
      } else if (catName.includes("staple") || catName.includes("grain") || prod.name.includes("Rice") || prod.name.includes("Atta")) {
        appCategory = "bakery";
      }

      // Strictly use the actual image stored in backend database / Cloudflare R2
      const actualImage = (prod.imageUrls && Array.isArray(prod.imageUrls) && prod.imageUrls.length > 0)
        ? prod.imageUrls[0]
        : (prod.imageUrl || null);

      return {
        id: prod.id,
        name: prod.name,
        price: prod.basePrice,
        mrp: prod.mrp || prod.basePrice * 1.25,
        weight: prod.unit,
        image: actualImage,
        imageUrl: actualImage,
        imageUrls: prod.imageUrls || [],
        rating: Number((4.6 + (Math.floor(Math.random() * 4) * 0.1)).toFixed(1)),
        description: prod.description || `Fresh and hygienic premium ${prod.name}`,
        category: appCategory,
        outOfStock: isOutOfStock,
        storeName: store.name,
      };
    });
  }
}

export const customerProductsService = new CustomerProductsService();