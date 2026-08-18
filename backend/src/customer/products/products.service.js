import { customerProductsRepository } from "./products.repository.js";

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

    const getCategoryEmoji = (name = "") => {
      const lower = name.toLowerCase();
      if (lower.includes("fruit") || lower.includes("vegetable") || lower.includes("fresh")) return "🍎";
      if (lower.includes("dairy") || lower.includes("milk") || lower.includes("egg") || lower.includes("cheese")) return "🥛";
      if (lower.includes("snack") || lower.includes("munch") || lower.includes("biscuit") || lower.includes("chips")) return "🍿";
      if (lower.includes("beverage") || lower.includes("drink") || lower.includes("tea") || lower.includes("coffee") || lower.includes("juice")) return "🧃";
      if (lower.includes("bakery") || lower.includes("bread") || lower.includes("cake")) return "🍞";
      if (lower.includes("staple") || lower.includes("grain") || lower.includes("atta") || lower.includes("rice") || lower.includes("dal")) return "🌾";
      if (lower.includes("clean") || lower.includes("household") || lower.includes("detergent") || lower.includes("wash")) return "🧼";
      if (lower.includes("meat") || lower.includes("fish") || lower.includes("chicken")) return "🍗";
      if (lower.includes("personal") || lower.includes("beauty") || lower.includes("care")) return "🧴";
      if (lower.includes("baby")) return "👶";
      if (lower.includes("pet")) return "🐾";
      return "📦";
    };

    const totalProductCount = dbCategories.reduce((acc, c) => acc + (c._count?.products || 0), 0);

    const formatted = [
      {
        id: "all",
        name: "All",
        slug: "all",
        emoji: "🛍️",
        itemCount: totalProductCount,
      },
      ...dbCategories.map((cat) => ({
        id: cat.slug || cat.id,
        dbId: cat.id,
        name: cat.name,
        slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-"),
        emoji: getCategoryEmoji(cat.name),
        image: cat.image || null,
        itemCount: cat._count?.products || 0,
      })),
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

      // Assign matching UI emoji & category mappings
      let emoji = "📦";
      let appCategory = "packaged";
      const catName = prod.category ? prod.category.name.toLowerCase() : "";

      if (catName.includes("fruit") || catName.includes("vegetable") || prod.name.includes("Apple") || prod.name.includes("Banana") || prod.name.includes("Potato") || prod.name.includes("Tomato")) {
        appCategory = "fresh";
        if (prod.name.includes("Apple")) emoji = "🍎";
        else if (prod.name.includes("Banana")) emoji = "🍌";
        else if (prod.name.includes("Tomato")) emoji = "🍅";
        else if (prod.name.includes("Potato")) emoji = "🥔";
        else emoji = "🥬";
      } else if (catName.includes("dairy") || catName.includes("milk") || catName.includes("egg") || prod.name.includes("Milk") || prod.name.includes("Paneer") || prod.name.includes("Egg") || prod.name.includes("Butter")) {
        appCategory = "dairy";
        if (prod.name.includes("Milk")) emoji = "🥛";
        else if (prod.name.includes("Paneer") || prod.name.includes("Cheese")) emoji = "🧀";
        else if (prod.name.includes("Butter")) emoji = "🧈";
        else if (prod.name.includes("Egg")) emoji = "🥚";
        else emoji = "🍦";
      } else if (catName.includes("beverage") || catName.includes("drink") || catName.includes("tea") || catName.includes("coffee") || prod.name.includes("Juice") || prod.name.includes("Tea") || prod.name.includes("Coffee")) {
        appCategory = "beverages";
        if (prod.name.includes("Tea")) emoji = "🫖";
        else if (prod.name.includes("Coffee")) emoji = "☕";
        else if (prod.name.includes("Juice") || prod.name.includes("Tropicana")) emoji = "🧃";
        else emoji = "🥤";
      } else if (catName.includes("snack") || catName.includes("biscuit") || catName.includes("noodle") || prod.name.includes("Maggi") || prod.name.includes("Oreo") || prod.name.includes("Chips")) {
        appCategory = "snacks";
        if (prod.name.includes("Chips") || prod.name.includes("Lays")) emoji = "🥔";
        else if (prod.name.includes("Maggi") || prod.name.includes("Noodle")) emoji = "🍜";
        else if (prod.name.includes("Biscuit") || prod.name.includes("Oreo") || prod.name.includes("Good Day")) emoji = "🍪";
        else emoji = "🍿";
      } else if (catName.includes("household") || catName.includes("clean") || catName.includes("detergent") || prod.name.includes("Surf") || prod.name.includes("Vim") || prod.name.includes("Ariel")) {
        appCategory = "household";
        if (prod.name.includes("Vim") || prod.name.includes("Dish")) emoji = "🧼";
        else if (prod.name.includes("Ariel") || prod.name.includes("Wash")) emoji = "🧺";
        else emoji = "🧹";
      } else if (catName.includes("staple") || catName.includes("grain") || prod.name.includes("Rice") || prod.name.includes("Atta")) {
        appCategory = "bakery";
        if (prod.name.includes("Rice")) emoji = "🌾";
        else if (prod.name.includes("Atta")) emoji = "🌾";
        else if (prod.name.includes("Dal")) emoji = "🫘";
        else emoji = "🍞";
      }

      return {
        id: prod.id,
        name: prod.name,
        price: prod.basePrice,
        mrp: prod.mrp || prod.basePrice * 1.25,
        weight: prod.unit,
        emoji: emoji,
        rating: 4.6 + (Math.floor(Math.random() * 4) / 10),
        description: prod.description || `Fresh and hygienic premium ${prod.name}`,
        category: appCategory,
        outOfStock: isOutOfStock,
        storeName: store.name,
      };
    });
  }
}

export const customerProductsService = new CustomerProductsService();
