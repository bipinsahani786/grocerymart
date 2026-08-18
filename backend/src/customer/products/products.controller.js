import { customerProductsService } from "./products.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class CustomerProductsController {
  getCategories = catchAsync(async (req, res) => {
    const { pincode } = req.query;
    const categories = await customerProductsService.getCategories({ pincode });
    res.json({
      success: true,
      data: categories,
    });
  });

  getProducts = catchAsync(async (req, res) => {
    const { category, pincode, q } = req.query;
    const products = await customerProductsService.getProducts({ category, pincode, q });
    res.json({
      success: true,
      data: products,
    });
  });
}

export const customerProductsController = new CustomerProductsController();
