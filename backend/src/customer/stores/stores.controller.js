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
    const { pincode } = req.query;
    const stores = await customerStoresService.getStores(pincode);

    res.json({
      success: true,
      data: stores,
    });
  });
}

export const customerStoresController = new CustomerStoresController();
