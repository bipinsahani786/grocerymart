import { parkingsRepository } from "./parkings.repository.js";
import { AppError } from "../../utils/AppError.js";

export class ParkingsService {
  async getAllParkings(page, limit, search, status, parkingType, kycStatus) {
    const result = await parkingsRepository.findAllParkings(page, limit, search, status, parkingType, kycStatus);
    return {
      status: "success",
      results: result.data.length,
      data: result.data,
      meta: result.meta,
    };
  }

  async getParkingDetails(parkingId) {
    const parking = await parkingsRepository.findParkingFullDetails(parkingId);
    if (!parking) {
      throw new AppError("Parking area not found", 404);
    }
    return {
      status: "success",
      data: parking,
    };
  }

  async updateParkingStatus(parkingId, status) {
    const parking = await parkingsRepository.findParkingById(parkingId);
    if (!parking) {
      throw new AppError("Parking area not found", 404);
    }

    const updatedParking = await parkingsRepository.updateParkingStatus(parkingId, status);
    return {
      status: "success",
      message: `Parking area status updated to ${status}`,
      data: updatedParking,
    };
  }

  async updateParkingKycStatus(parkingId, kycStatus) {
    const parking = await parkingsRepository.findParkingById(parkingId);
    if (!parking) {
      throw new AppError("Parking area not found", 404);
    }

    const updatedParking = await parkingsRepository.updateParkingKycStatus(parkingId, kycStatus);
    return {
      status: "success",
      message: `Parking area KYC status updated to ${kycStatus}`,
      data: updatedParking,
    };
  }

  async updateParking(parkingId, data) {
    const parking = await parkingsRepository.findParkingById(parkingId);
    if (!parking) {
      throw new AppError("Parking area not found", 404);
    }
    const updatedParking = await parkingsRepository.updateParking(parkingId, data);
    return {
      status: "success",
      message: "Parking area updated successfully",
      data: updatedParking,
    };
  }

  async deleteParking(parkingId) {
    const parking = await parkingsRepository.findParkingById(parkingId);
    if (!parking) {
      throw new AppError("Parking area not found", 404);
    }
    await parkingsRepository.deleteParking(parkingId);
    return {
      status: "success",
      message: "Parking area deleted successfully",
    };
  }
}

export const parkingsService = new ParkingsService();
