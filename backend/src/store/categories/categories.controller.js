import { categoriesService } from "./categories.service.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { cacheService } from "../../common/cache/cache.service.js";

async function clearCategoriesCache(storeId) {
  const storeKey = storeId || "default";
  await cacheService.delPattern(`categories:${storeKey}:*`);
}

export class CategoriesController {
  getCategories = catchAsync(async (req, res) => {
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search || req.query.q,
      parentId: req.query.parentId,
      all: req.query.all
    };

    const storeId = req.query.storeId || "default";
    const cacheKey = `categories:${storeId}:${JSON.stringify(filters)}`;

    const cachedResponse = await cacheService.get(cacheKey);
    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    const result = await categoriesService.getCategories(req.user, req.query.storeId, filters);
    
    // Cache for 2 minutes (120 seconds)
    await cacheService.set(cacheKey, result, 120);

    res.json(result);
  });

  createCategory = catchAsync(async (req, res) => {
    const result = await categoriesService.createCategory(req.user, req.query.storeId, req.body);
    await clearCategoriesCache(req.query.storeId);
    res.status(201).json(result);
  });

  updateCategory = catchAsync(async (req, res) => {
    const result = await categoriesService.updateCategory(req.user, req.query.storeId, req.params.id, req.body);
    await clearCategoriesCache(req.query.storeId);
    res.json(result);
  });

  deleteCategory = catchAsync(async (req, res) => {
    const result = await categoriesService.deleteCategory(req.user, req.query.storeId, req.params.id);
    await clearCategoriesCache(req.query.storeId);
    res.json(result);
  });

  importMasterCategories = catchAsync(async (req, res) => {
    const result = await categoriesService.importMasterCategories(req.user, req.query.storeId);
    await clearCategoriesCache(req.query.storeId);
    res.json(result);
  });
}

export const categoriesController = new CategoriesController();
