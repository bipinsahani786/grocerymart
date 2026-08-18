import { customerProductsService } from "./products.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class CustomerProductsController {
  getCategories = catchAsync(async (req, res) => {
    const { pincode, storeId } = req.query;
    const categories = await customerProductsService.getCategories({ pincode, storeId });
    res.json({
      success: true,
      data: categories,
    });
  });

  getProducts = catchAsync(async (req, res) => {
    const { category, pincode, storeId, q } = req.query;
    const products = await customerProductsService.getProducts({ category, pincode, storeId, q });
    res.json({
      success: true,
      data: products,
    });
  });
}

export const customerProductsController = new CustomerProductsController();
