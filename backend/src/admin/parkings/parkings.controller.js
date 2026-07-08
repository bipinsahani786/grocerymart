import { parkingsService } from "./parkings.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class ParkingsController {
  getAllParkings = catchAsync(async (req, res) => {
    const { page, limit, search, status, parkingType, kycStatus } = req.query;
    const result = await parkingsService.getAllParkings(page, limit, search, status, parkingType, kycStatus);
    res.json(result);
  });

  getParkingDetails = catchAsync(async (req, res) => {
    const result = await parkingsService.getParkingDetails(req.params.id);
    res.json(result);
  });

  updateParkingStatus = catchAsync(async (req, res) => {
    const { status } = req.body;
    const result = await parkingsService.updateParkingStatus(req.params.id, status);
    res.json(result);
  });

  updateParkingKycStatus = catchAsync(async (req, res) => {
    const { status } = req.body; // approved or rejected
    const result = await parkingsService.updateParkingKycStatus(req.params.id, status);
    res.json(result);
  });

  updateParking = catchAsync(async (req, res) => {
    const result = await parkingsService.updateParking(req.params.id, req.body);
    res.json(result);
  });

  deleteParking = catchAsync(async (req, res) => {
    const result = await parkingsService.deleteParking(req.params.id);
    res.json(result);
  });
}

export const parkingsController = new ParkingsController();
