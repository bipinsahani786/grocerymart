import { staffService } from "./staff.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class StaffController {
  getStaff = catchAsync(async (req, res) => {
    const result = await staffService.getStaff(req.user, req.query.storeId);
    res.json(result);
  });

  createStaff = catchAsync(async (req, res) => {
    const result = await staffService.createStaff(req.user, req.query.storeId, req.body);
    res.status(201).json(result);
  });

  updateStaff = catchAsync(async (req, res) => {
    const result = await staffService.updateStaff(req.user, req.query.storeId, req.params.id, req.body);
    res.json(result);
  });

  deleteStaff = catchAsync(async (req, res) => {
    const result = await staffService.deleteStaff(req.user, req.query.storeId, req.params.id);
    res.json(result);
  });

  toggleStaffClock = catchAsync(async (req, res) => {
    const result = await staffService.toggleStaffClock(req.user, req.query.storeId, req.params.id);
    res.json(result);
  });

  updateStaffShift = catchAsync(async (req, res) => {
    const result = await staffService.updateStaffShift(req.user, req.query.storeId, req.params.id, req.body.shift);
    res.json(result);
  });
}

export const staffController = new StaffController();
