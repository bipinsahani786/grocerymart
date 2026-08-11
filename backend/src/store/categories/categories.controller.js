import { categoriesService } from "./categories.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class CategoriesController {
  getCategories = catchAsync(async (req, res) => {
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search || req.query.q,
      parentId: req.query.parentId,
      all: req.query.all
    };
    const result = await categoriesService.getCategories(req.user, req.query.storeId, filters);
    res.json(result);
  });

  createCategory = catchAsync(async (req, res) => {
    const result = await categoriesService.createCategory(req.user, req.query.storeId, req.body);
    res.status(201).json(result);
  });

  updateCategory = catchAsync(async (req, res) => {
    const result = await categoriesService.updateCategory(req.user, req.query.storeId, req.params.id, req.body);
    res.json(result);
  });

  deleteCategory = catchAsync(async (req, res) => {
    const result = await categoriesService.deleteCategory(req.user, req.query.storeId, req.params.id);
    res.json(result);
  });

  importMasterCategories = catchAsync(async (req, res) => {
    const result = await categoriesService.importMasterCategories(req.user, req.query.storeId);
    res.json(result);
  });
}

export const categoriesController = new CategoriesController();
