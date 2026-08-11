import { taxesService } from "./taxes.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class TaxesController {
  getTaxes = catchAsync(async (req, res) => {
    const result = await taxesService.getTaxes(req.user, req.query.storeId);
    res.json(result);
  });
}

export const taxesController = new TaxesController();
