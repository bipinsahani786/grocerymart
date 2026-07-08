import { ownersService } from "./owners.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class OwnersController {
  getAllOwners = catchAsync(async (req, res) => {
    const result = await ownersService.getAllOwners(req.query);
    res.json(result);
  });

  getOwnerDetails = catchAsync(async (req, res) => {
    const result = await ownersService.getOwnerDetails(req.params.ownerId);
    res.json(result);
  });

  disableOwner = catchAsync(async (req, res) => {
    const result = await ownersService.disableOwner(req.params.ownerId);
    res.json(result);
  });

  enableOwner = catchAsync(async (req, res) => {
    const result = await ownersService.enableOwner(req.params.ownerId);
    res.json(result);
  });

  getOwnerKycList = catchAsync(async (req, res) => {
    const result = await ownersService.getOwnerKycList(req.query);
    res.json(result);
  });

  approveOwnerKyc = catchAsync(async (req, res) => {
    const result = await ownersService.approveOwnerKyc(req.params.ownerId, req.body.status);
    res.json(result);
  });

  adminOnboardOwner = catchAsync(async (req, res) => {
    const result = await ownersService.adminOnboardOwner(req.body);
    res.status(201).json(result);
  });

  updateOwner = catchAsync(async (req, res) => {
    const result = await ownersService.updateOwner(req.params.ownerId, req.body);
    res.json(result);
  });

  deleteOwner = catchAsync(async (req, res) => {
    const result = await ownersService.deleteOwner(req.params.ownerId);
    res.json(result);
  });
}


export const ownersController = new OwnersController();
