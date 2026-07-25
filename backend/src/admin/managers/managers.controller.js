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

  updateManagerStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const result = await managersService.updateManagerStatus(id, status);
    res.json(result);
  });

  updateManagerPassword = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;
    const result = await managersService.updateManagerPassword(id, password);
    res.json(result);
  });

  updateManagerProfile = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await managersService.updateManagerProfile(id, req.body);
    res.json(result);
  });
}

export const managersController = new ManagersController();
