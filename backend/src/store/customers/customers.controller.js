import { customersService } from "./customers.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class CustomersController {
  getCustomers = catchAsync(async (req, res) => {
    const result = await customersService.getCustomers(req.user, req.query.storeId);
    res.json(result);
  });

  createCustomer = catchAsync(async (req, res) => {
    const result = await customersService.createCustomer(req.user, req.query.storeId, req.body);
    res.status(201).json(result);
  });

  updateCustomer = catchAsync(async (req, res) => {
    const result = await customersService.updateCustomer(req.user, req.query.storeId, req.params.id, req.body);
    res.json(result);
  });

  deleteCustomer = catchAsync(async (req, res) => {
    const result = await customersService.deleteCustomer(req.user, req.query.storeId, req.params.id);
    res.json(result);
  });
}

export const customersController = new CustomersController();
