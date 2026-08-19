import { customerStoresService } from "./stores.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class CustomerStoresController {
  getLocationByPincode = catchAsync(async (req, res) => {
    const { pincode } = req.query;
    const location = await customerStoresService.getLocationByPincode(pincode);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "No serving outlet found for this pincode.",
      });
    }

    res.json({
      success: true,
      data: location,
    });
  });

  getStores = catchAsync(async (req, res) => {
    const { pincode, userLat, userLng } = req.query;
    const stores = await customerStoresService.getStores(pincode, userLat, userLng);

    res.json({
      success: true,
      data: stores,
    });
  });

  getDeliveryConfig = catchAsync(async (req, res) => {
    const { storeId, pincode, distanceKm, subtotal, userLat, userLng } = req.query;
    const config = await customerStoresService.getDeliveryConfig({
      storeId,
      pincode,
      distanceKm,
      subtotal,
      userLat,
      userLng,
    });

    res.json({
      success: true,
      data: config,
    });
  });
}

export const customerStoresController = new CustomerStoresController();
