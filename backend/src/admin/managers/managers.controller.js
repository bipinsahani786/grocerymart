import { managersService } from "./managers.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class ManagersController {
  getManagers = catchAsync(async (req, res) => {
    const result = await managersService.getManagers(req.query);
    res.json(result);
  });

  createManager = catchAsync(async (req, res) => {
    const result = await managersService.createManager(req.body);
    res.status(201).json(result);
  });
}

export const managersController = new ManagersController();
