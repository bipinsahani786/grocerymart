import { taxesService } from "./taxes.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class TaxesController {
  getAllTaxClasses = catchAsync(async (req, res) => {
    const result = await taxesService.getAllTaxClasses();
    res.status(200).json({ success: true, data: result });
  });

  createTaxClass = catchAsync(async (req, res) => {
    const result = await taxesService.createTaxClass(req.body);
    res.status(201).json(result);
  });

  updateTaxClass = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await taxesService.updateTaxClass(id, req.body);
    res.status(200).json(result);
  });

  deleteTaxClass = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await taxesService.deleteTaxClass(id);
    res.status(200).json(result);
  });

  scheduleTaxRate = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await taxesService.scheduleTaxRate(id, req.body);
    res.status(201).json(result);
  });
}

export const taxesController = new TaxesController();
