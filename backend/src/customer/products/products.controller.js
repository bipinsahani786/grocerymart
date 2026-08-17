import { customerProductsService } from "./products.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class CustomerProductsController {
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
